const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { google } = require("googleapis");
const path = require("path");
const url = require("url");
const fs = require("fs");
const config = require("./config.json");
const { OAuth2 } = google.auth;

const OAuth2Client = new OAuth2(
  config.client_id,
  config.client_secret,
  "http://localhost" // Redirect URI
);

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "..", "build", "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  ipcMain.handle("dialog-confirm", async (event, message) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 0,
      message,
    });
    return result.response === 0; // Returns true for 'Yes', false for 'No'
  });

  ipcMain.handle("dialog-alert", async (event, message) => {
    await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["OK"],
      message,
    });
  });

  // Handle authentication with Google
  ipcMain.handle("authenticate-google", async () => {
    const authUrl = OAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    const authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    authWindow.loadURL(authUrl);

    return new Promise((resolve, reject) => {
      const handleRedirect = (event, url) => {
        const query = new URL(url).searchParams;
        const code = query.get("code");

        if (code) {
          OAuth2Client.getToken(code, (err, tokens) => {
            if (err) {
              console.error("Error while exchanging code for tokens", err);
              reject("Failed to authenticate with Google.");
              return;
            }

            OAuth2Client.setCredentials(tokens);
            fs.writeFileSync("tokens.json", JSON.stringify(tokens));
            authWindow.close();
            resolve("Authenticated with Google successfully!");
          });
        }
      };

      authWindow.webContents.on("will-redirect", handleRedirect);

      authWindow.on("closed", () => {
        reject("Authentication window closed before completing the process.");
      });

      authWindow.on("page-title-updated", (event, title) => {
        if (title.includes("Error")) {
          reject("Authentication failed.");
        }
      });
    });
  });

  // Check authentication status
  ipcMain.handle("checkAuthentication", async () => {
    try {
      const tokens = fs.existsSync("tokens.json");
      return tokens; // Returns true if tokens exist, meaning user is authenticated
    } catch (error) {
      console.error("Error checking authentication status", error);
      return false;
    }
  });

  // Handle logout
  ipcMain.handle("logoutGoogle", async () => {
    try {
      fs.unlinkSync("tokens.json"); // Remove tokens to log out
      return true;
    } catch (error) {
      console.error("Error during logout", error);
      throw new Error("Failed to log out.");
    }
  });

  // Handle upload to Google Drive
  ipcMain.handle("upload-to-google-drive", async (event, filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const tokens = JSON.parse(fs.readFileSync("tokens.json"));
      OAuth2Client.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth: OAuth2Client });

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
          resource: fileMetadata,
          media: media,
          fields: "id",
        });
      }

      console.log("File uploaded with ID:", res.data.id); // Log the file ID
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
      const tokens = JSON.parse(fs.readFileSync("tokens.json"));
      OAuth2Client.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth: OAuth2Client });

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

  // Handle save file
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

  // Handle version request
  ipcMain.handle("get-version", async () => {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version;
  });

  // Handle list files
  ipcMain.handle("list-files", async () => {
    try {
      const tokens = JSON.parse(fs.readFileSync("tokens.json"));
      OAuth2Client.setCredentials(tokens);

      const drive = google.drive({ version: "v3", auth: OAuth2Client });

      const response = await drive.files.list({
        q: "name='fultimatordb.json'",
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        return response.data.files; // Return the list of files found
      } else {
        throw new Error("No files found");
      }
    } catch (error) {
      console.error("Error listing files", error);
      throw error;
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
