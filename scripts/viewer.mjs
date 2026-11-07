import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(process.env.RESCUE_HOME || join(dirname(fileURLToPath(import.meta.url)), '..'));
const page = new URL('../web/index.html', import.meta.url);
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'");
  if (req.method !== 'GET') { res.writeHead(405); return res.end('Read-only viewer'); }
  try {
    if (req.url === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(await readFile(page)); }
    if (req.url === '/api/incident') {
      res.setHeader('Content-Type', 'application/json');
      try { return res.end(await readFile(join(root, 'lab/incident.json'))); }
      catch (error) { if (error.code !== 'ENOENT') throw error; res.writeHead(404); return res.end(JSON.stringify({ error: 'No incident yet. Run the start command.' })); }
    }
    res.writeHead(404); res.end('Not found');
  } catch { res.writeHead(500); res.end('Could not read local incident'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Checkout Rescue viewer: http://127.0.0.1:${port}\nRead-only; all collaboration happens through Switch and Mattermost.`));
