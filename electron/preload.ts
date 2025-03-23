import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

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
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
});
