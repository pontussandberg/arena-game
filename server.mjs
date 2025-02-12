// server.mjs
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Get the directory name for the current module
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Serve static files from the dist directory
const serveFile = (res, filePath, contentType) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Sorry, there was an error serving the file: ${err}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
};

const server = createServer((req, res) => {
  // Handle the root request by serving index.html
  if (req.url === '/' || req.url === '') {
    const filePath = path.join(__dirname, 'dist', 'index.html');
    serveFile(res, filePath, 'text/html');
  } else {
    // Serve static assets (JS, CSS, images, etc.) from the dist directory
    const extname = path.extname(req.url);
    let contentType = 'text/plain';

    switch (extname) {
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.html':
        contentType = 'text/html';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Serve the requested file from the dist directory
    const filePath = path.join(__dirname, 'dist', req.url);
    serveFile(res, filePath, contentType);
  }
});

// Start the server on port 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('Server listening on http://127.0.0.1:3000');
});

// Run this with `node server.mjs`
