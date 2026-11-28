// Renders /shop at a 390px phone width and fails if any product card image is shorter than 150px.
// Run: node tools/check-card-height.mjs
// Uses the Chrome already on the machine (CHROME_PATH) or Puppeteer's Chrome after `npx puppeteer browsers install chrome`.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIN = 150;
const WIDTH = 390;
const root = process.cwd();
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(root, u);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  r.end(fs.readFileSync(f));
}).listen(0);
await new Promise((ok) => server.once('listening', ok));
const port = server.address().port;

const puppeteer = (await import(process.env.CHROME_PATH ? 'puppeteer-core' : 'puppeteer')).default;
const launch = {
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
};
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
const browser = await puppeteer.launch(launch);
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
await page.setViewport({ width: WIDTH, height: 844, deviceScaleFactor: 2 });
const pages = ['/shop.html', '/gift-guide.html', '/holiday-gift-guide.html'];
const rows = [];
for (const p of pages) {
  await page.goto(`http://127.0.0.1:${port}${p}`, { waitUntil: 'networkidle0', timeout: 60000 });
  const found = await page.evaluate((path) => {
    return [...document.querySelectorAll('.card .ph img, .gg-grid img, .tp-in > p > img')].map((img) => {
      const box = img.getBoundingClientRect();
      const fit = getComputedStyle(img).objectFit;
      return { path, src: img.currentSrc || img.src, h: Math.round(box.height), w: Math.round(box.width), fit };
    });
  }, p);
  rows.push(...found);
}
if (fs.existsSync(path.join(root, 'shop/beach-day-essentials.html'))) await import('./beach-essentials-viewport-helper.mjs').then(({ checkBeachEssentials }) => checkBeachEssentials({ browser, root })).catch((error) => { console.error(error); process.exitCode = 1; });
await browser.close();
server.close();

const short = rows.filter((r) => r.h < MIN);
const cropped = rows.filter((r) => r.fit !== 'contain');
const shortest = rows.reduce((m, r) => Math.min(m, r.h), Infinity);
console.log(`card images at ${WIDTH}px: ${rows.length}, shortest ${shortest}px`);
if (!rows.length) {
  console.error('no product card images rendered');
  process.exit(1);
}
if (cropped.length) {
  for (const r of cropped.slice(0, 8)) console.error(`object-fit ${r.fit} ${r.path} ${r.src}`);
  console.error(`${cropped.length} card image(s) are not object-fit: contain`);
  process.exit(1);
}
if (short.length) {
  for (const r of short.slice(0, 12)) console.error(`short ${r.h}px ${r.path} ${r.src}`);
  console.error(`${short.length} card image(s) under ${MIN}px`);
  process.exit(1);
}
console.log('ok: every card image is contain and at least 150px tall at 390px');
