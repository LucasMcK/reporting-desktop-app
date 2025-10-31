const { contextBridge } = require('electron/renderer')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  createUser: (username, password) => ipcRenderer.invoke('create-user', username, password)
})