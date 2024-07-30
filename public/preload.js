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
  getVersion: () => ipcRenderer.invoke("get-version")
});