const request = require('supertest');
const { createApp } = require('../src/app');

describe('Users API', () => {
  let app;
  beforeEach(() => {
    app = createApp({ dbPath: ':memory:' });
  });

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
});
