// Product pages must exist on shorelist.net, canonicalize here, and match the catalog price.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const cat = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('shop-variants.json', 'utf8'));
const handleOf = (url) => {
  const m = /\/products\/([a-z0-9-]+)/i.exec(String(url || ''));
  return m ? m[1].toLowerCase() : '';
};
const items = (cat.items || []).filter((i) => i && (i.store === 'shopify' || /myshopify\.com\/products\//.test(i.url || '')) && handleOf(i.url));
const sm = fs.readFileSync('sitemap.xml', 'utf8');
const fails = [];
const bad = (m) => fails.push(m);
if (!items.length) bad('no shopify products in catalog');
for (const i of items) {
  const handle = handleOf(i.url);
  const file = `shop/products/${handle}.html`;
  if (!fs.existsSync(file)) { bad(`missing ${file}`); continue; }
  const h = fs.readFileSync(file, 'utf8');
  const canon = `https://shorelist.net/shop/products/${handle}`;
  if (!h.includes(`<link rel="canonical" href="${canon}"/>`)) bad(`${handle}: canonical is not ${canon}`);
  if (/rel="canonical" href="https:\/\/shorelist\.myshopify\.com/.test(h)) bad(`${handle}: canonical points at Shopify`);
  if (!sm.includes(`<loc>${canon}</loc>`)) bad(`${handle}: missing from sitemap`);
  const cta = h.match(/<a class="nav-book" href="([^"]+)"[^>]*>([^<]+)<\/a>/);
  const destination = cta && URL.parse(cta[1].replaceAll('&amp;', '&'));
  const rows = variants[handle]?.variants ?? [];
  const one = rows.length === 1 ? rows[0] : null;
  if (destination?.origin !== 'https://shorelist.myshopify.com' ||
      destination.searchParams.get('utm_content') !== handle) {
    bad(`${handle}: purchase link does not reach the ShoreList Shop with this product's campaign tag`);
  } else if (one?.available === true && /^\d+$/.test(String(one.id))) {
    if (destination.pathname !== `/cart/${one.id}:1` || cta[2] !== 'Add to cart') {
      bad(`${handle}: single available variant does not have its exact cart link`);
    }
  } else if (destination.pathname !== `/products/${handle}` || cta[2] !== 'Choose options at ShoreList Shop') {
    bad(`${handle}: shoppers must choose their variant before checkout`);
  }
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const product = ld.find((j) => j['@type'] === 'Product');
  if (!product) bad(`${handle}: no Product JSON-LD`);
  else {
    const got = product.offers && (product.offers.price ?? product.offers.lowPrice);
    if (String(got) !== String(i.price)) bad(`${handle}: JSON-LD price ${got} != catalog ${i.price}`);
    if (product.url !== canon) bad(`${handle}: JSON-LD url is not the ShoreList page`);
  }
}
if (/<loc>https:\/\/shorelist\.myshopify\.com/.test(sm)) bad('sitemap lists a Shopify product URL');
if (fails.length) {
  console.error(fails.join('\n'));
  process.exit(1);
}
console.log(`ok: ${items.length} product pages on shorelist.net`);
