const { createApp } = require('./app');

const app = createApp({ dbPath: process.env.DB_PATH || 'data.sqlite' });
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
