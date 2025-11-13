const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  ping: () => ipcRenderer.invoke("ping"),

  login: (username, password) =>
    ipcRenderer.invoke("login", { username, password }),

  createUser: (username, password) =>
    ipcRenderer.invoke("create-user", { username, password }),

  submitForm: (formData) => ipcRenderer.invoke("submit-form", formData),

  getUsers: () => ipcRenderer.invoke("get-users"),

  getReports: () => ipcRenderer.invoke("get-reports"),
  downloadReport: (id, name) => ipcRenderer.invoke("download-report", { id, name }),
  deleteReport: (id) => ipcRenderer.invoke("delete-report", id),
});
