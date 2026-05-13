import express, { Request, Response } from 'express';
import { Db, initDb, UserRow } from './db';

type CreateAppOptions = {
  dbPath?: string;
};

export function createApp({ dbPath = 'data.sqlite' }: CreateAppOptions = {}) {
  const app = express();
  const db: Db = initDb(dbPath);

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/users', (_req: Request, res: Response<UserRow[]>) => {
    const rows = db.prepare('SELECT id, name, email FROM users ORDER BY id ASC').all() as UserRow[];
    res.json(rows);
  });

  app.get('/users/:id', (req: Request, res: Response<UserRow | { error: string }>) => {
    const row = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.params.id) as UserRow | undefined;
    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(row);
  });

  app.post('/users', (req: Request, res: Response<UserRow | { error: string }>) => {
    const { name, email } = (req.body ?? {}) as { name?: string; email?: string };

    if (!name || !email) {
      res.status(400).json({ error: 'name and email are required' });
      return;
    }

    try {
      const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
      const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow;
      res.status(201).json(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('UNIQUE')) {
        res.status(409).json({ error: 'email already exists' });
        return;
      }
      res.status(500).json({ error: 'internal error' });
    }
  });

  return app;
}
