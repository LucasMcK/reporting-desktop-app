const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const bcrypt = require("bcryptjs");
const { db, initDB, getAllUsers } = require("./utils/db");

let mainWindow;
const isDev = process.env.NODE_ENV !== 'production';
const viteDevServer = "http://localhost:5173";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(viteDevServer);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer", "dist", "index.html"));
  }
}

// ----------------- IPC -----------------
ipcMain.handle("login", async (event, { username, password }) => {
  return new Promise((resolve) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) resolve({ success: false, message: "Database error" });
      else if (!row) resolve({ success: false, message: "User not found" });
      else {
        const valid = bcrypt.compareSync(password, row.password);
        resolve(
          valid
            ? { success: true, message: "Login successful" }
            : { success: false, message: "Incorrect password" }
        );
      }
    });
  });
});

ipcMain.handle("create-user", async (event, { username, password }) => {
  const hash = bcrypt.hashSync(password, 10);
  return new Promise((resolve) => {
    db.run(
      "INSERT INTO users(username, password) VALUES(?, ?)",
      [username, hash],
      function (err) {
        if (err) resolve({ success: false, message: "User exists" });
        else resolve({ success: true, message: "User created" });
      }
    );
  });
});

ipcMain.handle("get-users", async () => {
  try {
    const users = await getAllUsers();
    return users;
  } catch (err) {
    console.error(err);
    return [];
  }
});

// ----------------- App -----------------
app.whenReady().then(async () => {
  try {
    await initDB(); // ensure DB is ready
    createWindow();  // then create the window
  } catch (err) {
    console.error("DB init failed:", err);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
