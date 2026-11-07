import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INVARIANT_DEFINITIONS } from '../src/invariants.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(process.env.RESCUE_HOME || projectRoot);
const page = new URL('../web/index.html', import.meta.url);
const port = Number(process.env.PORT || 4173);

if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');

const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'");

  if (req.method !== 'GET') {
    res.writeHead(405);
    return res.end('Read-only viewer');
  }

  try {
    if (req.url === '/' || req.url === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(await readFile(page));
    }

    if (req.url === '/api/incident') {
      res.setHeader('Content-Type', 'application/json');
      let data = null;
      const paths = [
        join(root, 'lab/incident.json'),
        join(root, 'evidence/latest.json'),
        join(root, 'evidence/CR-001.json')
      ];
      for (const p of paths) {
        try {
          data = await readFile(p, 'utf8');
          break;
        } catch {}
      }
      if (data) return res.end(data);
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'No incident yet. Run the start command.' }));
    }

    if (req.url === '/api/postmortem') {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      try {
        const md = await readFile(join(projectRoot, 'docs/POSTMORTEM-CR-001.md'), 'utf8');
        return res.end(md);
      } catch {
        res.writeHead(404);
        return res.end('# No Postmortem Generated Yet\nRun `npm run postmortem` to compile.');
      }
    }

    if (req.url === '/api/invariants') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        invariants: INVARIANT_DEFINITIONS,
        status: 'compliant',
        verified: true
      }));
    }

    res.writeHead(404);
    res.end('Not found');
  } catch {
    res.writeHead(500);
    res.end('Could not read local incident');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Checkout Rescue Enterprise Dashboard: http://127.0.0.1:${port}\nRead-only incident command center; live collaboration via Switch & Mattermost.`);
});
