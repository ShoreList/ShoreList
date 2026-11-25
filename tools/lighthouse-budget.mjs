// Performance and quality budget. Serves this folder locally, runs Lighthouse (mobile, simulated slow 4G) on key pages and fails
// if a score drops below its floor. Run: node tools/lighthouse-budget.mjs   (needs Chrome; uses npx lighthouse@12 unless LIGHTHOUSE_BIN points at an installed lighthouse)
// Floors sit a few points under what the pages score today, so only a real regression fails; raise them as the site improves.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile); // async on purpose: a blocking spawn would freeze the server this process is running
const PAGES = [
  ['/', { performance: 90, accessibility: 100, 'best-practices': 90, seo: 100 }],
  ['/shop.html', { performance: 90, accessibility: 98, 'best-practices': 90, seo: 100 }],
  ['/events.html', { performance: 90, accessibility: 98, 'best-practices': 90, seo: 100 }],
  ['/things-to-do/ghost-tours.html', { performance: 90, accessibility: 95, 'best-practices': 90, seo: 100 }],
];
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
const csp = (fs.readFileSync('_headers', 'utf8').match(/Content-Security-Policy: (.*)/) || [])[1];
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
  const f = path.join(process.cwd(), u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
  let b = fs.readFileSync(f); const t = MIME[path.extname(f)] || 'application/octet-stream';
  const h = { 'Content-Type': t, 'Content-Security-Policy': csp };
  if (/html|css|javascript|json|svg/.test(t)) { b = zlib.gzipSync(b); h['Content-Encoding'] = 'gzip'; }
  r.writeHead(200, h); r.end(b);
}).listen(0);
await new Promise((ok) => server.once('listening', ok));
const port = server.address().port, fails = [];
for (const [p, floors] of PAGES) {
  const out = `/tmp/lh-budget-${p.replace(/\W+/g, '_')}.json`;
  const [bin, ...pre] = process.env.LIGHTHOUSE_BIN ? [process.env.LIGHTHOUSE_BIN] : ['npx', '--yes', 'lighthouse@12'];
  await run(bin, [...pre, `http://localhost:${port}${p}`, '--only-categories=performance,accessibility,best-practices,seo', '--form-factor=mobile', '--output=json', `--output-path=${out}`, '--chrome-flags=--headless=new --no-sandbox --disable-gpu', '--quiet'], { timeout: 150000 });
  const j = JSON.parse(fs.readFileSync(out, 'utf8'));
  const got = Object.fromEntries(Object.entries(j.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  console.log(p.padEnd(36), JSON.stringify(got), 'LCP', j.audits['largest-contentful-paint'].displayValue, 'TBT', j.audits['total-blocking-time'].displayValue, 'CLS', j.audits['cumulative-layout-shift'].displayValue);
  for (const [k, min] of Object.entries(floors)) if (got[k] < min) fails.push(`${p}: ${k} ${got[k]} is under the floor of ${min}`);
}
server.close();
if (fails.length) { console.error('\n' + fails.join('\n')); process.exit(1); }
console.log('budget ok');
