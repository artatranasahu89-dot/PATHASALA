/**
 * BharatLearn AI — Full-Stack Server Entry Point
 * Mounts Express API gateway on /api/v1 and Vite dev server middlewares in development,
 * or static production assets in production mode.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServerApp } from './server/index';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createServerApp();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BharatLearn AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
