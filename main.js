const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const {
  db,
  initDB,
  getAllUsers,
  initReportsTable,
  getAllReports,
  deleteReport,
} = require("./utils/db");
const { handleFormSubmission } = require("./utils/excel");
const TEMPLATE_PATH = path.join(__dirname, "base_template.xlsx");

let mainWindow;
let currentUser = null;
const isDev = process.env.NODE_ENV !== "production";
const viteDevServer = "http://localhost:5173";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  if (isDev) {
    mainWindow.loadURL(viteDevServer);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer", "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  await initDB();
  await initReportsTable();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ----------------- USERS -----------------
ipcMain.handle("login", async (event, { username, password }) => {
  return new Promise((resolve) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) resolve({ success: false, message: "Database error" });
      else if (!row) resolve({ success: false, message: "User not found" });
      else {
        const valid = bcrypt.compareSync(password, row.password);
        if (valid) {
          currentUser = username;
          resolve({ success: true, message: "Login successful", username });
        } else {
          resolve({ success: false, message: "Incorrect password" });
        }
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
    return await getAllUsers();
  } catch (err) {
    console.error(err);
    return [];
  }
});

// ----------------- REPORTS -----------------

// Upload a report
ipcMain.handle("upload-report", async (event, { name, data }) => {
  try {
    const uploadedBy = currentUser || "Unknown";
    const stmt = db.prepare(`
      INSERT INTO reports (name, data, uploaded_at, uploaded_by)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    `);
    stmt.run(name, data, uploadedBy);
    return { success: true, uploadedBy };
  } catch (err) {
    console.error(err);
    return { success: false, message: err.message };
  }
});


// Get all reports metadata
ipcMain.handle("get-reports", async () => {
  try {
    const reports = await getAllReports();
    return reports;
  } catch (err) {
    console.error(err);
    return [];
  }
});

// Download a report
ipcMain.handle('download-report', async (event, { id, name }) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT data FROM reports WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!row) {
      return { success: false, message: 'Report not found' };
    }

    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: name,
      filters: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }]
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Save cancelled' };
    }

    fs.writeFileSync(filePath, row.data);

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: err.message };
  }
});

// Delete a report
ipcMain.handle("delete-report", async (event, id) => {
  try {
    await deleteReport(id);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: err.message };
  }
});

// ----------------- FORMS -----------------
ipcMain.handle("submit-form", async (event, formData) => {
  try {
    await handleFormSubmission(formData, TEMPLATE_PATH);
    return { success: true };
  } catch (err) {
    console.error("Error handling form:", err);
    return { success: false, error: err.message };
  }
});