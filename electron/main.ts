import { app, BrowserWindow, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import { createAppMenu } from "./menus";
import path from "node:path";
import { createLoadingWindow } from "./window";
//import * as os from "os";
import "./google";
import { setupIpcHandlers } from "./ipc-handlers";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // Don't show the window immediately
  });

  loadingWindow = createLoadingWindow(win);

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

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    console.log("Opening external link:", url);
    shell.openExternal(url);
    return { action: "deny" };
  });

  setupIpcHandlers(win);
  createAppMenu(win);
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
