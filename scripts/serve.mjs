import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
const headers = {
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
};
async function notFound(response, pathname) {
  // Missing scripts and fonts must not receive HTML in place of the asset.
  const asset = /^\/(?:src|public)(?:\/|$)/.test(pathname);
  let body;
  if (!asset) {
    try { body = await readFile(resolve(root, '404.html')); } catch { /* Plain-text fallback if the build is incomplete. */ }
  }
  response.writeHead(404, { ...headers, 'Content-Type': body ? types['.html'] : 'text/plain; charset=utf-8' });
  response.end(body || 'Not found');
}
const server = http.createServer(async (request, response) => {
  let pathname = '';
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    const relative = file.slice(root.length);
    const allowed = file.startsWith(root + sep) && (relative === '/index.html' || relative === '/404.html' || relative === '/components.html' || relative.startsWith('/src/') || relative.startsWith('/public/'));
    if (!allowed || !(await stat(file)).isFile()) { await notFound(response, pathname); return; }
    const body = await readFile(file);
    response.writeHead(relative === '/404.html' ? 404 : 200, { ...headers, 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    await notFound(response, pathname);
  }
});
server.listen(port, '127.0.0.1', () => process.stdout.write(`Biodeploy is ready: http://127.0.0.1:${server.address().port}\n`));
server.on('error', (error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
