const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '..', 'build', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  ipcMain.handle('dialog-confirm', async (event, message) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      message,
    });
    return result.response === 0; // Returns true for 'Yes', false for 'No'
  });

  ipcMain.handle('dialog-alert', async (event, message) => {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['OK'],
      message,
    });
  });

   // Handle version request
   ipcMain.handle("get-version", async () => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
