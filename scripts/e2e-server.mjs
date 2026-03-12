import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const args = process.argv.slice(2);
const options = {
  host: '127.0.0.1',
  port: 4173
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--host') {
    options.host = args[i + 1] || options.host;
    i += 1;
  } else if (arg === '--port') {
    options.port = Number(args[i + 1]) || options.port;
    i += 1;
  }
}

const rootDir = process.cwd();
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon']
]);

function resolveRequestPath(requestUrl) {
  const parsed = new url.URL(requestUrl, 'http://localhost');
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';
  const targetPath = path.resolve(rootDir, `.${pathname}`);
  if (!targetPath.startsWith(rootDir)) return null;
  return targetPath;
}

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || '/');
  if (!filePath) {
    send(res, 403, { 'content-type': 'text/plain; charset=utf-8' }, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      send(res, 404, { 'content-type': 'text/plain; charset=utf-8' }, 'Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes.get(ext) || 'application/octet-stream';
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      send(res, 500, { 'content-type': 'text/plain; charset=utf-8' }, 'Read Error');
    });
    res.writeHead(200, {
      'content-type': contentType,
      'cache-control': 'no-store'
    });
    stream.pipe(res);
  });
});

server.listen(options.port, options.host, () => {
  console.log(`[e2e-server] http://${options.host}:${options.port}`);
});
