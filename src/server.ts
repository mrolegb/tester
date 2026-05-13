import { createApp } from './app';

const app = createApp({ dbPath: process.env.DB_PATH || 'data.sqlite' });
const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
