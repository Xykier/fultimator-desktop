// electron/ipc-handlers.ts
import { app, ipcMain, dialog, BrowserWindow } from "electron";
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loginGoogle,
  checkAuth,
  logoutGoogle,
  uploadToGoogleDrive,
  downloadFromGoogleDrive,
  listGoogleDriveFiles,
} from "./google";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Remove any pre-existing handlers if necessary
function removeExistingHandlers() {
  const handlers = [
    "dialog-confirm",
    "dialog-alert",
    "login-google",
    "check-auth",
    "logoutGoogle",
    "upload-to-google-drive",
    "download-from-google-drive",
    "save-file",
    "read-file",
    "get-version",
    "list-files",
  ];
  handlers.forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
}

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  removeExistingHandlers();

  // Handle dialog-confirm
  ipcMain.handle("dialog-confirm", async (event, message: string) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 0,
      message,
      title: "Fultimator",
    });
    return result.response === 0; // Return true for 'Yes', false for 'No'
  });

  // Handle dialog-alert
  ipcMain.handle("dialog-alert", async (event, message: string) => {
    await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["OK"],
      message,
      title: "Fultimator",
    });
  });

  // OAuth login function
  ipcMain.handle("login-google", async () => {
    return loginGoogle();
  });

  // Function to Check Authentication
  ipcMain.handle("check-auth", async () => {
    return checkAuth();
  });

  // Logout and Clear Tokens
  ipcMain.handle("logoutGoogle", () => {
    return logoutGoogle();
  });

  // Handle file upload to Google Drive
  ipcMain.handle("upload-to-google-drive", async (event, filePath) => {
    console.log("Handling upload request for file:", filePath);
    return await uploadToGoogleDrive(filePath);
  });

  // Handle download from Google Drive
  ipcMain.handle("download-from-google-drive", async (event, fileId) => {
    console.log("Handling download request for file ID:", fileId);
    return await downloadFromGoogleDrive(fileId);
  });

  // Handle file list from Google Drive
  ipcMain.handle("list-files", async () => {
    console.log("Handling list files request");
    return await listGoogleDriveFiles();
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

  // ... (upload-to-google-drive, download-from-google-drive, save-file, read-file, list-files)
}
