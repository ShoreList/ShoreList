// Site sanity checks. Run: node tools/check-site.mjs   (exits 1 on any failure)
import fs from 'node:fs';
import vm from 'node:vm';
const fails = [];
const bad = (m) => fails.push(m);
const pages = fs.readdirSync('.').filter((f) => f.endsWith('.html')).concat(fs.existsSync('things-to-do') ? fs.readdirSync('things-to-do').filter((f) => f.endsWith('.html')).map((f) => 'things-to-do/' + f) : []);
const noindex = new Set(['404.html', 'offline.html', 'dashboard.html', 'success.html', 'guide-success.html']);

for (const f of pages) {
  const h = fs.readFileSync(f, 'utf8');
  if (/Cape Fear coast/i.test(h)) bad(`${f}: banned phrase "Cape Fear coast"`);
  if (!/<title>[^<]+<\/title>/.test(h)) bad(`${f}: missing <title>`);
  if (!noindex.has(f) && !/name="description"/.test(h)) bad(`${f}: missing meta description`);
  if (!noindex.has(f) && !/rel="canonical"/.test(h)) bad(`${f}: missing canonical`);
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) bad(`${f}: <img> without alt`);
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
for (const f of fs.readdirSync('netlify/functions')) {
  try { new vm.Script(fs.readFileSync('netlify/functions/' + f, 'utf8').replace(/^#!.*/, '')); } catch (e) { bad(`function ${f}: ${e.message}`); }
}
if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
console.log(`ok: ${pages.length} pages, ${cat.items.length} products`);
