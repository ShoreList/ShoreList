// Nightly live verifier. Reports only: it changes nothing. Run: node tools/verify-live.mjs [--site https://shorelist.net]
// Checks (all against the live network):
//  1. every image URL in shop-catalog.json and every pick photo in shore-picks.html loads (HTTP 200, image content type)
//  2. every catalog item is still published on Shopify and its price matches the catalog (lowest variant price)
//  3. every URL in sitemap.xml returns 200
// Exit 1 when anything fails. Output is a markdown report (also written to $GITHUB_STEP_SUMMARY when set).
import fs from 'node:fs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const SITE = arg('site', 'https://shorelist.net').replace(/\/+$/, '');
const STORE = 'https://shorelist.myshopify.com';
const problems = [];
const note = (area, msg) => problems.push({ area, msg });

async function head(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(new URL(url, SITE), { method, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (r.ok || method === 'GET') return { ok: r.ok, status: r.status, type: r.headers.get('content-type') || '' };
    } catch (e) { if (method === 'GET') return { ok: false, status: 0, type: String(e.message || e) }; }
  }
}
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

const cat = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8'));
const items = cat.items;

// 1. images
const imgs = new Set();
for (const it of items) for (const k of ['img', 'studio', 'lookbook']) if (it[k]) imgs.add(it[k]);
const picks = fs.readFileSync('shore-picks.html', 'utf8');
for (const m of picks.matchAll(/<img[^>]*\ssrc="(https:[^"]+)"/g)) imgs.add(m[1]);
const imgList = [...imgs];
const imgRes = await pool(imgList, 8, async (u) => ({ u, r: await head(u) }));
for (const { u, r } of imgRes) if (!r.ok || !/image/i.test(r.type)) note('image', `${r.status || 'ERR'} ${u}`);

// 2. Shopify parity (public products.json, paged)
const live = new Map();
try {
  for (let page = 1; page <= 6; page++) {
    const r = await fetch(`${STORE}/products.json?limit=250&page=${page}`, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) { note('shopify', `products.json page ${page} returned ${r.status}`); break; }
    const j = await r.json(); if (!j.products.length) break;
    for (const p of j.products) live.set(p.handle, p);
  }
} catch (e) { note('shopify', `could not read products.json: ${e.message}`); }
if (live.size) for (const it of items) {
  const h = (/\/products\/([a-z0-9-]+)/i.exec(it.url || '') || [])[1];
  if (!h || !/myshopify\.com/.test(it.url)) continue; // Fourthwall item is checked by the sitemap/link step only
  const p = live.get(h);
  if (!p) { note('shopify', `${it.id}: not published on Shopify (${h})`); continue; }
  const prices = p.variants.map((v) => parseFloat(v.price)).filter((x) => x >= 0);
  const low = Math.min(...prices);
  if (Math.abs(low - it.price) > 0.001) note('price', `${it.id}: catalog $${it.price} but Shopify lowest variant $${low}`);
  if (!p.variants.some((v) => v.available)) note('stock', `${it.id}: every variant is sold out on Shopify`);
}

// 3. sitemap URLs
const sm = fs.readFileSync('sitemap.xml', 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://shorelist.net', SITE));
const urlRes = await pool(urls, 8, async (u) => ({ u, r: await head(u) }));
for (const { u, r } of urlRes) if (!r.ok) note('page', `${r.status || 'ERR'} ${u}`);

const lines = [`# Live verification ${new Date().toISOString()}`, '', `Site: ${SITE}. Images checked: ${imgList.length}. Shopify products read: ${live.size}. Sitemap URLs checked: ${urls.length}.`, ''];
if (!problems.length) lines.push('No problems found.');
else { lines.push(`${problems.length} problem(s):`, ''); for (const p of problems) lines.push(`- [${p.area}] ${p.msg}`); }
const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
process.exit(problems.length ? 1 : 0);
