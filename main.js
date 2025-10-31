require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});
require('dotenv').config();
const { updateElectronApp } = require('update-electron-app');
updateElectronApp();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
