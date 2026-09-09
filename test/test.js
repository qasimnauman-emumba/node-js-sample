'use strict';

const { spawn } = require('child_process');
const http = require('http');
const assert = require('assert');
const path = require('path');

const PORT = process.env.TEST_PORT || 5050;
const URL = `http://localhost:${PORT}/`;

function waitForServer(url, retriesLeft) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve(body));
      }).on('error', (err) => {
        if (remaining <= 0) return reject(err);
        setTimeout(() => attempt(remaining - 1), 300);
      });
    };
    attempt(retriesLeft);
  });
}

const server = spawn(process.execPath, [path.join(__dirname, '..', 'index.js')], {
  env: Object.assign({}, process.env, { PORT: String(PORT) }),
  stdio: 'pipe'
});

let finished = false;
function finish(code) {
  if (finished) return;
  finished = true;
  server.kill();
  process.exit(code);
}

server.on('error', (err) => {
  console.error('Failed to start app:', err);
  finish(1);
});

waitForServer(URL, 15)
  .then((body) => {
    assert.strictEqual(body, 'Hello World!', `Expected "Hello World!" but got "${body}"`);
    console.log('Test passed: GET / returns "Hello World!"');
    finish(0);
  })
  .catch((err) => {
    console.error('Test failed:', err.message);
    finish(1);
  });

setTimeout(() => {
  console.error('Test timed out waiting for server to respond');
  finish(1);
}, 10000);
