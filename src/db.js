const Database = require('better-sqlite3');

function initDb(dbPath = 'data.sqlite') {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);
  return db;
}

module.exports = { initDb };
