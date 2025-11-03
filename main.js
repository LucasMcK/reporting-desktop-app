const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, initDB } = require('./utils/db');

let mainWindow;

// Environment flags
const isDev = process.env.NODE_ENV === 'development';
const viteDevServer = process.env.VITE_DEV_SERVER || 'http://localhost:5173';

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    mainWindow.loadURL(`${viteDevServer}/renderer/login.html`);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'login.html'));
  }
}

// Initialize DB and window
app.whenReady().then(() => {
  initDB();
  createWindow();
});

// Quit app when all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ----------------- IPC Handlers ----------------- //

// Login
ipcMain.handle('login', async (event, { username, password }) => {
  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) resolve({ success: false, message: 'Database error' });
      else if (!row) resolve({ success: false, message: 'User not found' });
      else {
        const valid = bcrypt.compareSync(password, row.password);
        resolve(valid 
          ? { success: true, message: 'Login successful' }
          : { success: false, message: 'Incorrect password' });
      }
    });
  });
});

// Signup
ipcMain.handle('create-user', async (event, { username, password }) => {
  const hash = bcrypt.hashSync(password, 10);
  return new Promise((resolve) => {
    db.run(
      'INSERT INTO users(username, password) VALUES(?, ?)',
      [username, hash],
      function (err) {
        if (err) resolve({ success: false, message: 'User exists' });
        else resolve({ success: true, message: 'User created' });
      }
    );
  });
});

// Navigation
ipcMain.on('navigate', (event, page) => {
  if (!mainWindow) return;

  if (isDev) {
    // In dev, point to Vite dev server URL
    mainWindow.loadURL(`${viteDevServer}/renderer/${page}`);
  } else {
    // In production, load the built HTML file
    mainWindow.loadFile(path.join(__dirname, 'dist', page));
  }
});
