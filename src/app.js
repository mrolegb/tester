const express = require('express');
const { initDb } = require('./db');

function createApp({ dbPath = 'data.sqlite' } = {}) {
  const app = express();
  const db = initDb(dbPath);

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/users', (_req, res) => {
    const rows = db.prepare('SELECT id, name, email FROM users ORDER BY id ASC').all();
    res.json(rows);
  });

  app.get('/users/:id', (req, res) => {
    const row = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });

  app.post('/users', (req, res) => {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    try {
      const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
      const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(user);
    } catch (err) {
      if (String(err.message).includes('UNIQUE')) {
        return res.status(409).json({ error: 'email already exists' });
      }
      return res.status(500).json({ error: 'internal error' });
    }
  });

  return app;
}

module.exports = { createApp };
