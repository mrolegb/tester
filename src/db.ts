import Database from 'better-sqlite3';

export type UserRow = {
  id: number;
  name: string;
  email: string;
};

export type Db = Database.Database;

export function initDb(dbPath = 'data.sqlite'): Db {
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
