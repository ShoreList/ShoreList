// Pre-launch gate: every item in shop-catalog.json must load signed out (HTTP 200) before it ships.
// Usage: node tools/check-shop-links.mjs
import fs from 'node:fs';
const cat = JSON.parse(fs.readFileSync(new URL('../shop-catalog.json', import.meta.url), 'utf8'));
let bad = 0;
for (const i of cat.items) {
  if (!i.url) { console.log('SKIP (no url):', i.id); continue; }
  try {
    const r = await fetch(i.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } });
    const ok = r.status === 200;
    if (!ok) bad++;
    console.log(ok ? 'OK  ' : 'FAIL', r.status, i.id, i.url);
  } catch (e) { bad++; console.log('FAIL ERR', i.id, e.message); }
}
console.log(cat.items.length ? (bad ? bad + ' failing, do not ship' : 'all links OK') : 'catalog empty: shop page shows the opening-soon state');
process.exit(bad ? 1 : 0);
