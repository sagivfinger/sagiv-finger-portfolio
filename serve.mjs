/**
 * serve.mjs — Local development server for Sagiv Finger Portfolio
 * Run: node serve.mjs
 * Serves the site at http://localhost:3000
 */

import { createServer } from 'http';
import { readFile }     from 'fs/promises';
import { extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT      = 3000;

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.mjs':   'application/javascript; charset=utf-8',
  '.json':  'application/json',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.webp':  'image/webp',
  '.mp4':   'video/mp4',
  '.webm':  'video/webm',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ico':   'image/x-icon',
};

const server = createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const safePath = resolve(join(__dirname, decodeURIComponent(urlPath)));

  /* Prevent path traversal */
  if (!safePath.startsWith(resolve(__dirname))) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const data = await readFile(safePath);
    const ext  = extname(safePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type':  MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 – Not Found</h1>');
  }
});

server.listen(PORT, () => {
  console.log('\n  ■  Sagiv Finger — Portfolio');
  console.log(`  →  http://localhost:${PORT}\n`);
});
