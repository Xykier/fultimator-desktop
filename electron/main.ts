import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import { google } from "googleapis";
//import * as os from "os";
import Store from "electron-store";

//const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OAuth2Client = google.auth.OAuth2;
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost";
const OAuth2 = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

const store = new Store();

// Determine the current platform
//const platform = os.platform();

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let loadingWindow: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // Don't show the window immediately
  });

  const template = [
    {
      label: "File",
      submenu: [
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            showAboutDialog(win);
          },
        },
      ],
    },
  ];

  // Create the menu from the template
  const menu = Menu.buildFromTemplate(template as any);

  // Set the application menu
  Menu.setApplicationMenu(menu);

  // Array of possible logo paths to try
  const logoPossiblePaths = [
    path.join(process.env.VITE_PUBLIC, "logo512.png"),
    path.join(process.env.VITE_PUBLIC, "logo192.png"),
    path.join(process.env.VITE_PUBLIC, "logo120.png"),
  ];

  // Find the first existing logo
  const logoPath = logoPossiblePaths.find((path) => fs.existsSync(path));

  // If no PNG logo found, fallback to default loading
  const loadingHTML = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Fultimator - Loading</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f0f0f0;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

        background-color: canvas;
        color: canvastext;
      }
      .logo {
        max-width: 150px;
        margin-bottom: 20px;
        animation: pulse 1.5s infinite;
      }
      .spinner {
        border: 4px solid rgba(128, 128, 128, 0.2);
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
      .loading-text {
        margin-top: 20px;
        font-size: 18px;
        color: inherit;
      }
    </style>
  </head>
  <body>
    ${
      logoPath
        ? `<img src="data:image/png;base64,${fs
            .readFileSync(logoPath)
            .toString("base64")}" alt="Fultimator Logo" class="logo">`
        : ""
    }
    <div class="spinner"></div>
  </body>
</html>
    `;

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // Don't show the window immediately
  });

  // Create a loading window first
  loadingWindow = new BrowserWindow({
    parent: win,
    modal: false, // Change to false to prevent blocking
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: true,
    frame: false, // Frameless window
    transparent: true, // Make background transparent
    alwaysOnTop: true,
  });

  loadingWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`
  );

  // When the main window finishes loading
  win.once("ready-to-show", () => {
    if (loadingWindow) {
      loadingWindow.close(); // Close the loading window
      loadingWindow = null;
    }
    win.show(); // Show the main window
  });

  // Explicit close handling
  win.on("close", (event) => {
    // Prevent the window from closing immediately
    event.preventDefault();

    // Perform any cleanup or save operations here if needed

    // Explicitly quit the app
    app.quit();
  });

  // Explicitly handle window closure
  win.on("closed", () => {
    win = null;

    // Ensure loading window is also closed
    if (loadingWindow) {
      loadingWindow.close();
      loadingWindow = null;
    }
  });

  ipcMain.removeHandler("dialog-confirm");
  ipcMain.removeHandler("dialog-alert");
  ipcMain.removeHandler("login-google");
  ipcMain.removeHandler("check-auth");
  ipcMain.removeHandler("logoutGoogle");
  ipcMain.removeHandler("upload-to-google-drive");
  ipcMain.removeHandler("download-from-google-drive");
  ipcMain.removeHandler("save-file");
  ipcMain.removeHandler("read-file");
  ipcMain.removeHandler("get-version");
  ipcMain.removeHandler("list-files");

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // Handle navigating to the home page
  ipcMain.on("navigate-home", () => {
    if (win) {
      win.loadURL(path.join(__dirname, "..", "dist", "index.html"));
      console.log("Navigating to home page");
    } else {
      console.error("Main window not found");
    }
  });

  // Handle dialog-confirm
  ipcMain.handle("dialog-confirm", async (event, message) => {
    const result = await dialog.showMessageBox(win, {
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 0,
      message,
      title: "Fultimator",
    });
    return result.response === 0; // Return true for 'Yes', false for 'No'
  });

  // Handle dialog-alert
  ipcMain.handle("dialog-alert", async (event, message) => {
    await dialog.showMessageBox(win, {
      type: "info",
      buttons: ["OK"],
      message,
      title: "Fultimator",
    });
  });

  // OAuth login function
  ipcMain.handle("login-google", async () => {
    return new Promise((resolve, reject) => {
      const authUrl = OAuth2.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/drive.file"],
      });

      let authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: true,
      });

      authWindow.loadURL(authUrl);

      authWindow.webContents.on("will-redirect", async (event, url) => {
        if (url.startsWith(REDIRECT_URI)) {
          event.preventDefault();
          const code = new URL(url).searchParams.get("code");

          if (code) {
            try {
              const { tokens } = await OAuth2.getToken(code);
              OAuth2.setCredentials(tokens);
              store.set("googleTokens", tokens); // Save tokens persistently
              resolve(tokens);
            } catch (error) {
              reject(error);
            }
          }

          authWindow?.close();
        }
      });

      authWindow.on("closed", () => {
        authWindow = null;
      });
    });
  });

  // Function to Check Authentication
  ipcMain.handle("check-auth", async () => {
    const tokens = store.get("googleTokens");
    if (!tokens) return { isAuthenticated: false };

    OAuth2.setCredentials(tokens);

    // Check if the token is expired
    const now = new Date().getTime();
    const expiryDate = (tokens as any).expiry_date || 0;

    if (now >= expiryDate) {
      console.log("Token expired, refreshing...");
      try {
        const { credentials } = await OAuth2.refreshAccessToken();
        store.set("googleTokens", credentials);
        return { isAuthenticated: true, tokens: credentials };
      } catch (error) {
        store.delete("googleTokens");
        return { isAuthenticated: false };
      }
    }

    return { isAuthenticated: true, tokens };
  });

  // Logout and Clear Tokens
  ipcMain.handle("logoutGoogle", () => {
    store.delete("googleTokens");
    return { isAuthenticated: false };
  });

  // Handle file upload to Google Drive
  ipcMain.handle("upload-to-google-drive", async (event, filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const tokens = store.get("googleTokens");
      OAuth2.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth: OAuth2 });

      const response = await drive.files.list({
        q: "name='fultimatordb.json'",
        fields: "files(id, name)",
      });

      const existingFile = response.data.files.find(
        (file) => file.name === "fultimatordb.json"
      );

      let res;
      if (existingFile) {
        res = await drive.files.update({
          fileId: existingFile.id,
          media: {
            body: fs.createReadStream(filePath),
          },
          fields: "id",
        });
      } else {
        const fileMetadata = {
          name: "fultimatordb.json",
          mimeType: "application/json",
        };
        const media = {
          body: fs.createReadStream(filePath),
        };
        res = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id",
        });
      }

      console.log("File uploaded with ID:", res.data.id);
      return res.data.id;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  });

  // Handle download from Google Drive
  ipcMain.handle("download-from-google-drive", async (event, fileId) => {
    console.log("Requested file ID:", fileId); // Log file ID
    try {
      const tokens = store.get("googleTokens");
      OAuth2.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth: OAuth2 });

      const res = await drive.files.get(
        { fileId: fileId, alt: "media" },
        { responseType: "stream" }
      );

      const filePath = path.join(app.getPath("documents"), "fultimatordb.json");
      const dest = fs.createWriteStream(filePath);
      res.data.pipe(dest);

      return new Promise((resolve, reject) => {
        dest.on("finish", () => resolve(filePath)); // Resolve with filePath
        dest.on("error", (err) => reject(err));
      });
    } catch (error) {
      console.error("Error downloading file", error);
      throw error;
    }
  });

  // Handle file save
  ipcMain.handle("save-file", async (event, { fileName, buffer }) => {
    try {
      const filePath = path.join(app.getPath("documents"), fileName);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath;
    } catch (error) {
      console.error("Error saving file", error);
      throw error;
    }
  });

  // Handle file read
  ipcMain.handle("read-file", async (event, filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return fileContent;
    } catch (error) {
      console.error("Failed to read file", error);
      throw new Error("Failed to read file");
    }
  });

  // Handle version request
  ipcMain.handle("get-version", async () => {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  });

  // Handle file list from Google Drive
  ipcMain.handle("list-files", async () => {
    try {
      const tokens = store.get("googleTokens");
      OAuth2.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth: OAuth2 });

      const response = await drive.files.list({
        q: "name='fultimatordb.json'",
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        return response.data.files;
      } else {
        throw new Error("No files found");
      }
    } catch (error) {
      console.error("Error listing files", error);
      throw error;
    }
  });
}

function showAboutDialog(mainWindow: BrowserWindow) {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const version = packageJson.version;

  // Find the first existing logo
  const logoPossiblePaths = [
    path.join(process.env.VITE_PUBLIC, "logo512.png"),
    path.join(process.env.VITE_PUBLIC, "logo192.png"),
    path.join(process.env.VITE_PUBLIC, "logo120.png"),
  ];

  const logoPath = logoPossiblePaths.find((path) => fs.existsSync(path));

  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "About Fultimator",
    icon: logoPath ? logoPath : undefined,
    message: "Fultimator Desktop",
    detail: `Version: ${version}\n\n`,
    buttons: ["OK"],
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  // Ensure all windows are closed and explicitly quit the app
  if (win) win.close();
  if (loadingWindow) loadingWindow.close();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Destroy all windows
  if (win) win.destroy();
  if (loadingWindow) loadingWindow.destroy();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
