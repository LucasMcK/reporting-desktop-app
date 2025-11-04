const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const {
  db,
  initDB,
  getAllUsers,
  addUser,
  initReportsTable,
  addReport,
  getAllReports,
  getReportById,
  deleteReport,
} = require("./utils/db");

let mainWindow;
const isDev = process.env.NODE_ENV !== "production";
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

app.whenReady().then(async () => {
  await initDB();
  await initReportsTable(); // initialize reports table
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
    return await getAllUsers();
  } catch (err) {
    console.error(err);
    return [];
  }
});

// ----------------- REPORTS -----------------

// Upload a report
ipcMain.handle("upload-report", async (event, { name, data, uploadedBy }) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO reports (name, data, uploaded_at, uploaded_by)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    `);
    stmt.run(name, data, uploadedBy);
    return { success: true };
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
ipcMain.handle("download-report", async (event, { id, savePath }) => {
  try {
    const report = await getReportById(id);
    if (!report) throw new Error("Report not found");
    fs.writeFileSync(savePath, report.data);
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
