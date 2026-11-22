import { createRequire } from 'node:module';
// Site sanity checks. Run: node tools/check-site.mjs   (exits 1 on any failure)
import fs from 'node:fs';
import vm from 'node:vm';
import { loadOperators, publicJson } from './operators-lib.mjs';
const fails = [];
const bad = (m) => fails.push(m);
const pages = fs.readdirSync('.').filter((f) => f.endsWith('.html')).concat(['things-to-do', 'events', 'surf'].flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => d + '/' + f) : [])));
const noindex = new Set(['404.html', 'offline.html', 'dashboard.html', 'success.html', 'guide-success.html', 'goods-success.html']);

for (const f of pages) {
  const h = fs.readFileSync(f, 'utf8');
  if (/Cape Fear coast/i.test(h)) bad(`${f}: banned phrase "Cape Fear coast"`);
  if (!/<title>[^<]+<\/title>/.test(h)) bad(`${f}: missing <title>`);
  if (!noindex.has(f) && !/name="description"/.test(h)) bad(`${f}: missing meta description`);
  if (!noindex.has(f) && !/rel="canonical"/.test(h)) bad(`${f}: missing canonical`);
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) bad(`${f}: <img> without alt`);
  for (const m of h.matchAll(/<img\b[^>]*?\bsrc="(\/[^"?#]+)[^"]*"/g)) if (!fs.existsSync('.' + decodeURI(m[1]))) bad(`${f}: <img> src ${m[1]} does not exist`);
  [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m, i) => {
    try { new vm.Script(m[1]); } catch (e) { bad(`${f}: inline script ${i} syntax: ${e.message}`); }
  });
  if (/api\.anthropic\.com/.test(h)) bad(`${f}: client-side call to api.anthropic.com (use a function)`);
  if (/get-bookings\?password=/.test(h)) bad(`${f}: password in URL`);
}
for (const j of ['shop-catalog.json', 'search-index.json', 'manifest.webmanifest']) {
  try { JSON.parse(fs.readFileSync(j, 'utf8')); } catch (e) { bad(`${j}: invalid JSON`); }
}
const sm = fs.readFileSync('sitemap.xml', 'utf8');
for (const m of sm.matchAll(/<loc>https:\/\/shorelist\.net(\/[^<]*)<\/loc>/g)) {
  const p = m[1] === '/' ? 'index.html' : m[1].slice(1) + '.html';
  if (!fs.existsSync(p) && !fs.existsSync(m[1].slice(1) + '/index.html')) bad(`sitemap: ${m[1]} has no ${p}`);
}
const cat = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8'));
const ids = new Set();
for (const i of cat.items || []) {
  if (ids.has(i.id)) bad(`catalog: duplicate id ${i.id}`);
  ids.add(i.id);
  for (const k of ['id', 'name', 'url', 'price']) if (i[k] == null) bad(`catalog ${i.id}: missing ${k}`);
}
// gift guide: every item link must be a live catalog item, with the catalog's url and price (regenerate: node tools/build-store-pages.mjs)
if (fs.existsSync('gift-guide.html')) {
  const gg = fs.readFileSync('gift-guide.html', 'utf8');
  const byId = new Map((cat.items || []).map((i) => [i.id, i]));
  for (const m of gg.matchAll(/<a href="([^"]+)" data-item-id="([^"]+)">[\s\S]*?<span class="gg-price">([^<]+)<\/span>/g)) {
    const it = byId.get(m[2].replace(/&amp;/g, '&'));
    if (!it) { bad(`gift-guide: ${m[2]} is not in shop-catalog.json (run node tools/build-store-pages.mjs)`); continue; }
    if (m[1].replace(/&amp;/g, '&') !== it.url) bad(`gift-guide: ${it.id} url differs from the catalog`);
    if (m[3] !== `${it.from ? 'From ' : ''}$${it.price}`) bad(`gift-guide: ${it.id} price differs from the catalog`);
  }
}
for (const f of ['size-guide.html', 'shipping-returns.html', 'gift-guide.html']) {
  if (!fs.existsSync(f)) { bad(`${f}: missing`); continue; }
  const t = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  if (/[\u2013\u2014]|&mdash;|&ndash;|&#821[12];/.test(t)) bad(`${f}: em or en dash in visible copy`);
  if (/shore thing/i.test(t)) bad(`${f}: banned phrase`);
}
for (const f of fs.readdirSync('netlify/functions', { recursive: true })) {
  if (!/\.js$/.test(f)) continue;
  try { new vm.Script(fs.readFileSync('netlify/functions/' + f, 'utf8').replace(/^#!.*/, '')); } catch (e) { bad(`function ${f}: ${e.message}`); }
}
// ShoreList Direct: a directory under functions/ with index.js or <dir>.js would deploy as a stray function
for (const d of fs.readdirSync('netlify/functions', { withFileTypes: true })) {
  if (d.isDirectory() && (fs.existsSync(`netlify/functions/${d.name}/index.js`) || fs.existsSync(`netlify/functions/${d.name}/${d.name}.js`))) bad(`netlify/functions/${d.name}: would deploy as a function`);
}
// ShoreList Direct goods catalog: well formed, zero surprises
try {
  const goods = JSON.parse(fs.readFileSync('dropship-catalog.json', 'utf8'));
  const G = createRequire(import.meta.url)('../netlify/functions/_goods.js');
  const gid = new Set(), gsku = new Set();
  for (const i of goods.items || []) {
    if (gid.has(i.id)) bad(`dropship-catalog: duplicate id ${i.id}`); gid.add(i.id);
    for (const v of i.variants || []) { if (gsku.has(v.sku)) bad(`dropship-catalog: duplicate variant sku ${v.sku}`); gsku.add(v.sku); }
    for (const pr of G.itemProblems(i)) bad(`dropship-catalog ${i.id}: ${pr}`);
    if (i.status === 'live' && /draft|example|placeholder|REPLACE_WITH/i.test(JSON.stringify(i))) bad(`dropship-catalog ${i.id}: live item still holds draft or placeholder text`);
  }
  if (/[\u2013\u2014]/.test(JSON.stringify(goods))) bad('dropship-catalog: em or en dash');
  if (!/dropship-catalog\.json[\s\S]{0,60}status = 404/.test(fs.readFileSync('netlify.toml', 'utf8'))) bad('netlify.toml: dropship-catalog.json must be blocked from the public web');
  for (const f of ['goods-success.html']) { const t = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, ''); if (/[\u2013\u2014]|&mdash;|&ndash;/.test(t)) bad(`${f}: em or en dash in visible copy`); }
} catch (e) { bad('dropship-catalog: ' + e.message); }
// operators: data/operators.json is the source; the committed public file must match what the builder makes
try { if (fs.readFileSync('operators-public.json', 'utf8') !== publicJson(loadOperators())) bad('operators-public.json is stale: run node tools/build-operators-public.mjs'); } catch (e) { bad('operators data: ' + e.message); }
for (const f of pages) { // every page that starts a checkout must load the attribution script
  const h = fs.readFileSync(f, 'utf8');
  if (/category-app\.js|create-guide-checkout|create-goods-checkout|shop-cart\.js/.test(h) && !/\/attrib\.js/.test(h)) bad(`${f}: starts checkout but does not load /attrib.js`);
}
if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
console.log(`ok: ${pages.length} pages, ${cat.items.length} products`);
