// Adds published Shopify products to shop-catalog.json from a saved copy of the live products.json.
//
//   node tools/ingest-shopify-products.mjs --in products.json --plan tools/shopify-ingest-plan.json          (dry run, prints the diff)
//   node tools/ingest-shopify-products.mjs --in products.json --plan tools/shopify-ingest-plan.json --write  (applies it)
//   add --only handle-a,handle-b to run part of a plan.
//
// --in accepts the full https://shorelist.myshopify.com/products.json?limit=250 response ({products:[...]}), a bare
// array of products, or the compact form that tools/shopify-compact.md describes (fields h, t, v, im).
//
// What it takes from Shopify (never typed by hand): handle, title, variants, prices, availability and image URLs.
// What the plan supplies (written from the Printify logs): shelf, collection, alt, meta, cta, scenes, cut and an
// optional internal blank. Nothing is invented: a product missing from products.json is an error, and so is a
// product whose images are not on cdn.shopify.com.
//
// Rules enforced here:
//  - existing ids are never changed (prices included); they are skipped and reported
//  - an item is removed only when a plan entry lists it in "replaces" and the plan gives a reason (kept in catalog.retired)
//  - price is the lowest variant price, from:true when variants differ; the cart variant ids are looked up live by
//    netlify/functions/shop-product.js from the handle, so the catalog never stores them (they are printed for the record)
//  - a product with no lookbook image is held, not listed (override only with --allow-no-lookbook, RJ's approval)
//  - copy has no em or en dashes and none of the banned wording
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf('--' + k); return i < 0 ? null : args[i + 1]; };
const WRITE = args.includes('--write');
const ALLOW_NO_LOOKBOOK = args.includes('--allow-no-lookbook'); // only with RJ's approval
const inFile = opt('in');
const planFile = opt('plan') || 'tools/shopify-ingest-plan.json';
const only = opt('only') ? new Set(opt('only').split(',')) : null;
if (!inFile) { console.error('usage: --in <products.json> [--plan file] [--only a,b] [--write]'); process.exit(2); }

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const CAT_FILE = path.join(ROOT, 'shop-catalog.json');
const STORE = 'https://shorelist.myshopify.com';
const CDN = /^https:\/\/cdn\.shopify\.com\/s\/files\/1\/0686\/5213\/8580\/files\//;
const BANNED = /[–—]|yacht club|beach club|\best\.? ?\d{4}|since \d{4}|heritage|legacy brand|handcrafted in|made in usa/i;

const bad = [];
const fail = (m) => bad.push(m);

function loadProducts(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.products;
  if (!Array.isArray(list)) throw new Error('no products array in ' + file);
  return list.map(normalize);
}

// Normalise full and compact shapes to { handle, title, variants:[{id,title,options,price,available,image}], images:[{file,w,h,vids}] }
function normalize(p) {
  if (p.h) {
    return {
      handle: p.h, title: p.t, id: p.i, options: p.o || [],
      variants: p.v.map(([id, o1, o2, o3, price, av, image]) => ({ id, title: [o1, o2, o3].filter(Boolean).join(' / '), options: [o1, o2, o3].filter(Boolean), price: Number(price), available: !!av, image })),
      images: p.im.map(([file, nv, w, h]) => ({ file, w, h, vids: nv })),
    };
  }
  const file = (src) => String(src).split('?')[0];
  return {
    handle: p.handle, title: p.title, id: p.id, options: (p.options || []).map((o) => o.name + ':' + o.values.join('/')),
    variants: (p.variants || []).map((v) => ({ id: v.id, title: v.title, options: [v.option1, v.option2, v.option3].filter(Boolean), price: Number(v.price), available: !!v.available, image: v.featured_image ? file(v.featured_image.src).split('/').pop() : null })),
    images: (p.images || []).map((m) => {
      const f = file(m.src);
      if (!CDN.test(f)) fail(`${p.handle}: image not on the shop CDN: ${f}`);
      return { file: f.split('/').pop(), w: m.width, h: m.height, vids: (m.variant_ids || []).length };
    }),
  };
}

const sized = (file, w) => `https://cdn.shopify.com/s/files/1/0686/5213/8580/files/${file.replace(/(\.[a-z0-9]+)$/i, `_${w}x$1`)}`;
const raw = (file) => `https://cdn.shopify.com/s/files/1/0686/5213/8580/files/${file}`;
const isLookbook = (f) => /lookbook/i.test(f);

const cat = JSON.parse(fs.readFileSync(CAT_FILE, 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.resolve(planFile), 'utf8'));
const products = new Map(loadProducts(inFile).map((p) => [p.handle, p]));
const ids = new Set(cat.items.map((i) => i.id));
const shelfIds = new Set(cat.shelves.map((s) => s.id));
const collIds = new Set(cat.collections.map((c) => c.id));

const clean = (label, s) => { if (typeof s !== 'string' || !s.trim()) fail(`${label}: empty`); else if (BANNED.test(s)) fail(`${label}: banned wording or dash in "${s}"`); };

// ---- shelves
for (const s of plan.shelves || []) {
  clean(`shelf ${s.id} name`, s.name); clean(`shelf ${s.id} blurb`, s.blurb);
  if (!/^[a-z0-9-]+$/.test(s.id || '')) fail(`shelf id ${s.id}`);
  if (shelfIds.has(s.id)) {
    const cur = cat.shelves.find((x) => x.id === s.id);
    if (s.blurb && s.blurb !== cur.blurb) { console.log(`shelf ${s.id}: blurb updated`); if (WRITE) cur.blurb = s.blurb; }
    continue;
  }
  console.log(`+ shelf ${s.id} (${s.name})`);
  if (WRITE) {
    const idx = s.after ? cat.shelves.findIndex((x) => x.id === s.after) : -1;
    const o = { id: s.id, name: s.name, blurb: s.blurb }; if (s.cover) o.cover = s.cover;
    if (idx >= 0) cat.shelves.splice(idx + 1, 0, o); else cat.shelves.push(o);
  }
  shelfIds.add(s.id);
}
if (WRITE) for (const c of plan.collections || []) if (!collIds.has(c.id)) { cat.collections.push(c); collIds.add(c.id); }

// ---- items
const added = [], removed = [];
for (const e of plan.items || []) {
  if (only && !only.has(e.handle)) continue;
  const L = `item ${e.handle}`;
  const p = products.get(e.handle);
  if (!p) { fail(`${L}: not in products.json (not published on Shopify yet?)`); continue; }
  if (ids.has(e.handle) && !(e.replaces || []).includes(e.handle)) { console.log(`= ${e.handle}: already in the catalog, left untouched`); continue; }
  if (!shelfIds.has(e.shelf)) fail(`${L}: unknown shelf ${e.shelf}`);
  if (!collIds.has(e.collection)) fail(`${L}: unknown collection ${e.collection}`);
  for (const k of ['alt', 'meta', 'cta']) clean(`${L} ${k}`, e[k]);
  if (e.name) clean(`${L} name`, e.name);
  for (const f of e.facts || []) { clean(`${L} fact label`, f[0]); clean(`${L} fact`, f[1]); if (/comfort colors|yupoong|big accessories|gildan|bella/i.test(f.join(' '))) fail(`${L}: fact names a blank maker`); }
  if (!p.variants.length) { fail(`${L}: no variants`); continue; }
  if (!p.variants.some((v) => v.available)) { fail(`${L}: no available variant`); continue; }
  if (!p.images.length) { fail(`${L}: no images`); continue; }
  const prices = p.variants.map((v) => v.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  if (!(lo > 0)) { fail(`${L}: bad price`); continue; }

  // images: lookbook (styled) if the product carries one, else the first Printify mockup. Studio is the product shot.
  const look = p.images.find((m) => isLookbook(m.file)) || (e.lookbookFile ? { file: e.lookbookFile } : null);
  const mock = p.images.filter((m) => !isLookbook(m.file));
  // house rule (RJ): no new product goes on the storefront without a lookbook image (plan.lookbookFile = file name under shopify files/, or a lookbook product image)
  if (!look && !ALLOW_NO_LOOKBOOK) { console.log(`~ ${e.handle}: HELD, no lookbook image yet (set lookbookFile in the plan once it is uploaded to Shopify files)`); continue; }
  const pick = (n) => (n == null ? null : mock[n] || null);
  const lead = pick(e.imgIndex ?? 0) || mock[0];
  const item = { id: e.handle, collection: e.collection, shelf: e.shelf, name: e.name || p.title, url: `${STORE}/products/${e.handle}` };
  if (look) { item.img = sized(look.file, 1000); } else { item.img = sized(lead.file, 1000); }
  item.alt = e.alt; item.meta = e.meta; item.cta = e.cta; item.price = lo;
  if (hi !== lo) item.from = true;
  item.scenes = e.scenes && e.scenes.length ? e.scenes : ['beach'];
  if (e.cut) item.cut = e.cut;
  item.store = 'shopify';
  const studioImg = pick(e.studioIndex ?? (look ? 0 : 1));
  if (studioImg) item.studio = raw(studioImg.file);
  if (look) item.lookbook = sized(look.file, 1920);
  if (Array.isArray(e.facts) && e.facts.length) item.facts = e.facts;
  if (e.blank) item.blank = e.blank;
  for (const u of [item.img, item.studio, item.lookbook]) if (u && !CDN.test(u)) fail(`${L}: image url off CDN ${u}`);
  if (!look && !item.studio) console.log(`  note ${e.handle}: only one mockup, no studio image`);

  const unavailable = p.variants.filter((v) => !v.available).length;
  console.log(`+ ${e.handle} -> ${e.shelf}  $${lo}${item.from ? ' (from)' : ''}  ${p.variants.length} variants (${unavailable} unavailable)  ${look ? 'lookbook+' : ''}${mock.length} mockups  variant ids ${p.variants[0].id}..${p.variants[p.variants.length - 1].id}`);
  added.push({ item, replaces: e.replaces || [], reason: e.reason });
}

// replacements: only what the plan names and gives a reason for
for (const a of added) for (const r of a.replaces) {
  if (r === a.item.id) continue;
  if (!ids.has(r)) { console.log(`  replaces ${r}: not in catalog, nothing to remove`); continue; }
  if (!a.reason) fail(`item ${a.item.id}: replaces ${r} without a reason`);
  removed.push({ id: r, reason: a.reason, by: a.item.id });
  console.log(`- ${r} (replaced by ${a.item.id})`);
}

if (bad.length) { console.error('\nPROBLEMS, nothing written:\n' + bad.map((b) => ' - ' + b).join('\n')); process.exit(1); }

if (WRITE) {
  for (const r of removed) {
    const at = cat.items.findIndex((i) => i.id === r.id);
    if (at >= 0) cat.items.splice(at, 1);
    cat.retired = cat.retired || { items: {} }; cat.retired.items = cat.retired.items || {};
    cat.retired.items[r.id] = r.reason;
  }
  for (const a of added) {
    const i = cat.items.findIndex((x) => x.id === a.item.id);
    if (i >= 0) { const prev = cat.items[i]; a.item.price = prev.price; if (prev.from) a.item.from = true; cat.items[i] = a.item; continue; }
    // keep each shelf together: insert after its last item, else append
    let last = -1; cat.items.forEach((x, k) => { if (x.shelf === a.item.shelf) last = k; });
    if (last >= 0) cat.items.splice(last + 1, 0, a.item); else cat.items.push(a.item);
  }
  fs.writeFileSync(CAT_FILE, JSON.stringify(cat, null, 1) + '\n');
  console.log(`\nwrote shop-catalog.json: +${added.length} items, -${removed.length}`);
} else {
  console.log(`\ndry run: +${added.length} items, -${removed.length}. Add --write to apply.`);
}
