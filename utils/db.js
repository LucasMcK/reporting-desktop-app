const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Open DB
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB error:', err);
  else console.log('Connected to SQLite DB');
});

// ----------------- USERS -----------------
function initDB() {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function addUser(username, hashedPassword) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, username FROM users', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ----------------- REPORTS -----------------
function initReportsTable() {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      data BLOB,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      uploaded_by TEXT
    )`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Upload a new report
function uploadReport(name, buffer, uploadedBy) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO reports (name, data, uploaded_by) VALUES (?, ?, ?)",
      [name, buffer, uploadedBy],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// Get all reports
function getAllReports() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, name, uploaded_by, uploaded_at FROM reports ORDER BY uploaded_at DESC",
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// Get a report by ID (for download)
function getReportById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM reports WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Delete a report
function deleteReport(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM reports WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

module.exports = {
  addUser,
  getAllUsers,
  initDB,
  db,
  initReportsTable,
  uploadReport,
  getAllReports,
  getReportById,
  deleteReport
};
