import request from 'supertest';
import { createApp } from '../src/app';

describe('Users API', () => {
  const app = createApp({ dbPath: ':memory:' });

  test('GET /users returns empty list initially', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /users creates a user and returns it', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  test('GET /users/:id returns created user', async () => {
    const created = await request(app)
      .post('/users')
      .send({ name: 'Bob', email: 'bob@example.com' });

    const res = await request(app).get(`/users/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.body.id,
      name: 'Bob',
      email: 'bob@example.com',
    });
  });

  test('POST /users rejects duplicate email', async () => {
    await request(app).post('/users').send({ name: 'A', email: 'dupe@example.com' });
    const res = await request(app).post('/users').send({ name: 'B', email: 'dupe@example.com' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'email already exists' });
  });

  test('POST /users validates required fields', async () => {
    const res = await request(app).post('/users').send({ name: 'OnlyName' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'name and email are required' });
  });

  test('GET /users/:id returns 404 for missing user', async () => {
    const res = await request(app).get('/users/99999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });
});
