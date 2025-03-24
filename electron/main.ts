import { app, BrowserWindow, ipcMain, dialog } from "electron";
//import { createRequire } from 'node:module'
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import { google } from "googleapis";
import * as os from "os";

//const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OAuth2Client = google.auth.OAuth2;
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
const OAuth2 = new OAuth2Client(
  clientId,
  clientSecret,
  "http://localhost" // Redirect URI
);

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Determine the current platform
const platform = os.platform();

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

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

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

  // Handle Google authentication
  ipcMain.handle("authenticate-google", async () => {
    const OAuth2Client = google.auth.OAuth2;
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

    const authUrl = OAuth2.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    // Platform-specific authentication logic
    if (platform === "darwin") {
      // macOS-specific authentication
      return new Promise((resolve, reject) => {
        const redirectUri = "http://localhost";
        const OAuth2 = new OAuth2Client(clientId, clientSecret, redirectUri);

        const authWindow = new BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
          show: true,
        });

        console.log("macOS Authentication URL:", authUrl);

        authWindow.loadURL(authUrl);
        authWindow.show();
        authWindow.focus();

        const handleNavigation = (event: any, url: string) => {
          try {
            console.log("macOS Navigation detected:", url);
            const parsedUrl = new URL(url);
            const code = parsedUrl.searchParams.get("code");

            if (code) {
              // Prevent default navigation if event exists
              if (event && event.preventDefault) {
                event.preventDefault();
              }

              // Use a promise-based approach for token retrieval
              OAuth2.getToken(code, (err, tokens) => {
                if (err) {
                  console.error("macOS Token retrieval error:", err);
                  reject(err);
                  return;
                }

                // Set credentials and save tokens
                OAuth2.setCredentials(tokens);
                fs.writeFileSync("tokens.json", JSON.stringify(tokens));

                // Close the auth window
                if (!authWindow.isDestroyed()) {
                  authWindow.close();
                }

                resolve("Authenticated with Google successfully!");
              });
            }
          } catch (error) {
            console.error("macOS Authentication process error:", error);
            reject(error);
          }
        };

        // Multiple event listeners for comprehensive tracking
        authWindow.webContents.on("will-navigate", handleNavigation);
        authWindow.webContents.on("did-finish-load", () => {
          const currentURL = authWindow.webContents.getURL();
          handleNavigation(null, currentURL);
        });

        // Add error handling
        authWindow.webContents.on(
          "did-fail-load",
          (event, errorCode, errorDescription) => {
            console.error(
              "macOS Failed to load authentication page:",
              errorDescription
            );
            reject(
              new Error(`Authentication page load failed: ${errorDescription}`)
            );
          }
        );

        // Ensure proper cleanup
        authWindow.on("closed", () => {
          console.log("macOS Authentication window closed");
          reject(
            new Error(
              "Authentication window closed before completing the process."
            )
          );
        });
      });
    } else {
      // Windows/Linux authentication (using local server method)
      return new Promise((resolve, reject) => {
        const authWindow = new BrowserWindow({
          width: 500,
          height: 600,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        });

        authWindow.loadURL(authUrl);

        const handleNavigation = (event, url) => {
          const query = new URL(url).searchParams;
          const code = query.get("code");

          if (code) {
            if (event) event.preventDefault(); // Check if event exists before calling preventDefault

            OAuth2.getToken(code, (err, tokens) => {
              if (err) {
                console.error("Error getting tokens:", err);
                reject("Failed to authenticate with Google.");
                return;
              }

              OAuth2.setCredentials(tokens);
              fs.writeFileSync("tokens.json", JSON.stringify(tokens));

              if (authWindow) authWindow.close();
              resolve("Authenticated with Google successfully!");
            });
          }
        };

        authWindow.webContents.on("will-navigate", handleNavigation);

        authWindow.webContents.on("did-finish-load", () => {
          const currentURL = authWindow.webContents.getURL();
          handleNavigation(null, currentURL); // Now it won't crash since we check for event inside handleNavigation
        });

        authWindow.on("closed", () => {
          reject("Authentication window closed before completing the process.");
        });
      });
    }
  });

  // Check Google authentication status
  ipcMain.handle("checkAuthentication", async () => {
    try {
      const tokens = fs.existsSync("tokens.json");
      return tokens; // Returns true if tokens exist, meaning user is authenticated
    } catch (error) {
      console.error("Error checking authentication status", error);
      return false;
    }
  });

  // Handle Google logout
  ipcMain.handle("logoutGoogle", async () => {
    try {
      fs.unlinkSync("tokens.json");
      return true;
    } catch (error) {
      console.error("Error during logout", error);
      throw new Error("Failed to log out.");
    }
  });

  // Handle file upload to Google Drive
  ipcMain.handle("upload-to-google-drive", async (event, filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const tokens = JSON.parse(fs.readFileSync("tokens.json").toString());
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
      const tokens = JSON.parse(fs.readFileSync("tokens.json").toString());
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
      const tokens = JSON.parse(fs.readFileSync("tokens.json").toString());
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
