// Nightly live verifier. Reports only: it changes nothing. Run: node tools/verify-live.mjs [--site https://shorelist.net]
// Checks (all against the live network):
//  1. shop and Shore Picks image URLs load, and missing photo coverage is listed separately
//  2. Shopify publication, catalog minimums, and prices and stock for the variants served by the picker
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
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (r.ok || method === 'GET') return { ok: r.ok, status: r.status, type: r.headers.get('content-type') || '' };
    } catch (e) { if (method === 'GET') return { ok: false, status: 0, type: String(e.message || e) }; }
  }
}

async function fetchImage(url) {
  try {
    // A cached HEAD response can survive after the image GET starts returning 404.
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const result = { status: response.status, type: response.headers.get('content-type') || '' };
    await response.body?.cancel();
    return result;
  } catch (error) {
    return { status: 0, type: error.message };
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
const imgs = new Map();
function addImage(src, source) {
  if (!src) return;
  const url = URL.parse(src.replaceAll('&amp;', '&'), SITE + '/');
  if (!url || !['http:', 'https:'].includes(url.protocol)) {
    note('image', `${source}: invalid image URL ${src}`);
    return;
  }
  if (!imgs.has(url.href)) imgs.set(url.href, []);
  imgs.get(url.href).push(source);
}

const imageKey = (src) => (src || '').split('?')[0].replace(/_\d+x(?=\.[a-z]+$)/i, '').replace(/_\d{3,4}$/, '');
const missingPairs = [];
for (const [section, products] of [['Shop', items], ['Harbor Goods', cat.harborGoods ?? []]]) {
  for (const item of products) {
    const label = `${section}/${item.id}`;
    for (const field of ['img', 'studio', 'lookbook']) addImage(item[field], `${label} ${field}`);
    for (const [index, photo] of (item.gallery ?? []).entries()) {
      addImage(photo?.src, `${label} gallery ${index + 1}`);
    }
    const [lead, lookbook, studio] = [item.img, item.lookbook, item.studio].map(imageKey);
    if (!lookbook || !studio || lead !== lookbook || lookbook === studio) missingPairs.push(label);
  }
}

const picks = fs.readFileSync('shore-picks.html', 'utf8');
for (const m of picks.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/gi)) addImage(m[1], 'Shore Picks');
const textOnlyPicks = [];
for (const [tag] of picks.matchAll(/<(?:article|div)\b[^>]*\bdata-pick="[^"]+"[^>]*>/g)) {
  const classes = (tag.match(/\sclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);
  if (classes.includes('no-photo')) textOnlyPicks.push(tag.match(/\sdata-pick="([^"]+)"/)[1]);
}
const imgList = [...imgs.keys()];
const imgRes = await pool(imgList, 8, async (u) => ({ u, r: await fetchImage(u) }));
for (const { u, r } of imgRes) {
  if (r.status !== 200 || !/^image\//i.test(r.type)) note('image', `${r.status || 'ERR'} ${u} (${r.type || 'no content type'}; ${imgs.get(u).join(', ')})`);
}

// 2. Shopify parity (public products.json, paged)
const live = new Map();
try {
  for (let page = 1; page <= 6; page++) {
    const r = await fetch(`${STORE}/products.json?limit=250&page=${page}`, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) { note('shopify', `products.json page ${page} returned ${r.status}`); break; }
    const j = await r.json();
    if (!j.products.length) {
      if (page === 1) note('shopify', 'products.json returned no products on the first page');
      break;
    }
    for (const p of j.products) live.set(p.handle, p);
  }
} catch (e) { note('shopify', `could not read products.json: ${e.message}`); }
let pickerBook = {};
let pickerVariantsChecked = 0;
if (live.size && items.some((item) => /myshopify\.com\/products\//.test(item.url || ''))) {
  try {
    const response = await fetch(SITE + '/shop-variants.json', { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid JSON object');
    pickerBook = data;
  } catch (e) { note('picker', `could not read live shop-variants.json: ${e.message}`); }
}
if (live.size) for (const it of items) {
  const h = (/\/products\/([a-z0-9-]+)/i.exec(it.url || '') || [])[1];
  if (!h || !/myshopify\.com/.test(it.url)) continue; // Fourthwall item is checked by the sitemap/link step only
  const p = live.get(h);
  if (!p) { note('shopify', `${it.id}: not published on Shopify (${h})`); continue; }
  const prices = p.variants.map((v) => parseFloat(v.price)).filter((x) => x >= 0);
  const low = Math.min(...prices);
  if (Math.abs(low - it.price) > 0.001) note('price', `${it.id}: catalog $${it.price} but Shopify lowest variant $${low}`);
  if (!p.variants.some((v) => v.available)) note('stock', `${it.id}: every variant is sold out on Shopify`);

  // A product without a snapshot entry uses the live lookup when a shopper opens the picker.
  const cached = pickerBook[h]?.variants;
  if (!Array.isArray(cached) || !cached.length) continue;
  const byId = new Map(p.variants.map((variant) => [String(variant.id), variant]));
  for (const variant of cached) {
    pickerVariantsChecked++;
    const merchant = byId.get(String(variant.id));
    const label = `${h} variant ${variant.id}`;
    if (!merchant) {
      note('picker-stock', `${label}: no longer listed by Shopify`);
      continue;
    }
    if (variant.price !== Number(merchant.price)) {
      note('picker-price', `${label}: picker $${variant.price}, Shopify $${merchant.price}`);
    }
    if (variant.available !== merchant.available) {
      note('picker-stock', `${label}: picker available=${variant.available}, Shopify available=${merchant.available}`);
    }
  }
}

// 3. sitemap URLs
const sm = fs.readFileSync('sitemap.xml', 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://shorelist.net', SITE));
const urlRes = await pool(urls, 8, async (u) => ({ u, r: await head(u) }));
for (const { u, r } of urlRes) if (!r.ok) note('page', `${r.status || 'ERR'} ${u}`);

const lines = [`# Live verification ${new Date().toISOString()}`, '', `Site: ${SITE}. Images checked: ${imgList.length}. Shopify products read: ${live.size}. Picker variants checked: ${pickerVariantsChecked}. Sitemap URLs checked: ${urls.length}.`, ''];
if (!problems.length) lines.push('No problems found.');
else { lines.push(`${problems.length} problem(s):`, ''); for (const p of problems) lines.push(`- [${p.area}] ${p.msg}`); }
lines.push('', '## Photo coverage awaiting remediation', '',
  'Coverage is based on storefront references. The photo release gate separately checks fidelity and approvals.',
  '', `- ${textOnlyPicks.length} text-only Shore Picks cards${textOnlyPicks.length ? `: ${textOnlyPicks.join(', ')}` : ''}.`,
  `- ${missingPairs.length} of ${items.length + (cat.harborGoods?.length ?? 0)} product cards lack a distinct lookbook lead and separate studio reference.`);
if (missingPairs.length) {
  lines.push('', '<details><summary>Product cards with incomplete photo coverage</summary>', '',
    ...missingPairs.map((label) => `- ${label}`), '', '</details>');
}
const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');
process.exit(problems.length ? 1 : 0);
