const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, initDB } = require('./utils/db');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Correct path to login.html
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'login.html'));

  // Open DevTools (optional)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  initDB();
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Login handler
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

// Signup handler
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

ipcMain.on('navigate', (event, page) => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, 'renderer', page));
  }
});

