const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

// Expose the Electron API to the renderer process
contextBridge.exposeInMainWorld("electron", {
  confirm: (message) => ipcRenderer.invoke("dialog-confirm", message),
  alert: (message) => ipcRenderer.invoke("dialog-alert", message),
  getVersion: () => ipcRenderer.invoke("get-version"),
  authenticateGoogle: () => ipcRenderer.invoke("authenticate-google"),
  uploadToGoogleDrive: (filePath) =>
    ipcRenderer.invoke("upload-to-google-drive", filePath),
  downloadFromGoogleDrive: (fileId) =>
    ipcRenderer.invoke("download-from-google-drive", fileId),
  saveFile: (fileName, buffer) => ipcRenderer.invoke("save-file", { fileName, buffer }),
  listFiles: () => ipcRenderer.invoke("list-files"),
  checkAuthentication: () => ipcRenderer.invoke("checkAuthentication"),
  logoutGoogle: () => ipcRenderer.invoke("logoutGoogle"),
  navigateHome: () => ipcRenderer.send("navigate-home"),
});
