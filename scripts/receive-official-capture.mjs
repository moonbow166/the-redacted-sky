// Local-only research intake. No scraper, browser cookies, or hidden page state.
// Paste JSON captured from the public, rendered PURSUE interface into this form.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const port = 8975;
const origin = `http://127.0.0.1:${port}`;
const destination = resolve('data/source/pursue.official-capture.json');
const page = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Official source capture intake</title><body><h1>Official source capture intake</h1><p>Local research tool. Public government records only.</p><form method="post" action="/capture"><label for="capture">Captured records JSON</label><br><textarea id="capture" name="capture" rows="20" cols="100" required></textarea><br><button>Save capture</button></form></body></html>`;
createServer(async (req, res) => {
  if (req.headers.host !== `127.0.0.1:${port}`) { res.writeHead(403).end(); return; }
  res.setHeader('Content-Security-Policy', "default-src 'none'; form-action 'self'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET' && req.url === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(page); return; }
  if (req.method !== 'POST' || req.url !== '/capture' || req.headers.origin !== origin) { res.writeHead(403).end(); return; }
  try {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 12000000) throw new Error('Capture too large'); }
    const batch = JSON.parse(new URLSearchParams(body).get('capture'));
    if (Array.isArray(batch.media)) {
      for (const row of batch.media) {
        if (new URL(row.sourcePageUrl).hostname !== 'www.dvidshub.net' || !row.title.includes(row.id) || !row.sources.some(url => url.endsWith('.mp4'))) throw new Error('Invalid official media capture');
      }
      writeFileSync(resolve('data/source/pursue.official-media.json'), JSON.stringify({ capturedAt: batch.capturedAt, method: 'Record identifiers matched on PURSUE, then title, source elements and poster read from the official DVIDS player DOM.', records: batch.media }, null, 2) + '\n');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<!doctype html><title>Media capture saved</title><h1>${batch.media.length} official media records saved</h1><a href="/">Back</a>`);
      return;
    }
    if (!Array.isArray(batch.records) || !batch.records.length) throw new Error('Missing records');
    for (const record of batch.records) {
      const url = new URL(record.sourcePageUrl);
      if (url.origin !== 'https://www.war.gov' || !url.pathname.startsWith('/UFO/') || !record.title || !record.facts || !record.capturedAt) throw new Error('Invalid official capture');
      record.captureHash = createHash('sha256').update(JSON.stringify(record)).digest('hex');
    }
    const previous = existsSync(destination) ? JSON.parse(readFileSync(destination, 'utf8')) : { schemaVersion: 1, source: 'https://www.war.gov/UFO/', method: 'Public rendered index and record panels, using normal browser controls. No mirror descriptions or translations.', records: [] };
    const rows = new Map(previous.records.map(row => [row.title, row]));
    for (const row of batch.records) rows.set(row.title, row);
    const output = { ...previous, capturedAt: batch.capturedAt, records: [...rows.values()].sort((a, b) => a.title.localeCompare(b.title, 'en')) };
    mkdirSync(resolve('data/source'), { recursive: true });
    writeFileSync(destination, JSON.stringify(output, null, 2) + '\n');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html lang="en"><title>Capture saved</title><h1>Capture saved</h1><p>${batch.records.length} records received. ${rows.size} unique records saved.</p><a href="/">Import next batch</a></html>`);
  } catch (error) { res.writeHead(400, { 'Content-Type': 'text/plain' }).end(error.message); }
}).listen(port, '127.0.0.1', () => console.log(`Official source intake: ${origin}`));
