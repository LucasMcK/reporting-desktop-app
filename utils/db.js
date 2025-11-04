const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open DB
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB error:', err);
  } else {
    console.log('Connected to SQLite DB');
  }
});

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
        else resolve(this.lastID); // return the new user ID
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

module.exports = { addUser, db, initDB, getAllUsers };
