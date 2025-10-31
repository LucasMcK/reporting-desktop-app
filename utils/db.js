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

// Create users table if not exists
function initDB() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
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

function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

module.exports = { addUser, getUserByUsername, db, initDB };
