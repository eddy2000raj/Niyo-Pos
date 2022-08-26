// const { createServer } = require('http')
// const { parse } = require('url')
const { join } = require('path');
const next = require('next');
const express = require('express');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('/service-worker.js', (req, res) => {
    res.sendFile(join(__dirname, '.next', 'service-worker.js'));
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, err => {
    if (err) throw err;
    console.log(
      `Ready on http://localhost:3000` + ' Store--id' + process.env.store
    );
  });
});
