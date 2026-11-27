// Writes one ShoreList page per Shopify catalog product at /shop/products/<handle>.
// Canonical is this site, not the Shopify product URL. Run: node tools/build-product-pages.mjs
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://shorelist.net';
const root = path.join(import.meta.dirname, '..');
const cat = JSON.parse(fs.readFileSync(path.join(root, 'shop-catalog.json'), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (s) => String(s ?? '').replace(/[\u2013\u2014]/g, ',');
const handleOf = (url) => {
  const m = /\/products\/([a-z0-9-]+)/i.exec(String(url || ''));
  return m ? m[1].toLowerCase() : '';
};
const money = (n) => (Math.round(Number(n) * 100) % 100 === 0 ? Number(n).toFixed(0) : Number(n).toFixed(2));

const items = (cat.items || []).filter((i) => i && (i.store === 'shopify' || /myshopify\.com\/products\//.test(i.url || '')) && handleOf(i.url));
const dir = path.join(root, 'shop', 'products');
fs.mkdirSync(dir, { recursive: true });
const keep = new Set();

function page(i) {
  const handle = handleOf(i.url);
  const canon = `${SITE}/shop/products/${handle}`;
  const price = Number(i.price);
  const from = !!i.from;
  const offer = from
    ? { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: price, offerCount: 1, availability: 'https://schema.org/InStock', url: canon }
    : { '@type': 'Offer', priceCurrency: 'USD', price, availability: 'https://schema.org/InStock', url: canon };
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plain(i.name),
    image: i.img,
    description: plain(i.meta || i.name),
    brand: { '@type': 'Brand', name: 'ShoreList' },
    url: canon,
    offers: offer,
  };
  const facts = Array.isArray(i.facts) ? i.facts.filter((f) => Array.isArray(f) && f[0] && f[1]) : [];
  const factHtml = facts.length
    ? `<dl class="tp-facts">${facts.map(([k, v]) => `<div><dt>${esc(plain(k))}</dt><dd>${esc(plain(v))}</dd></div>`).join('')}</dl>`
    : '';
  const town = /wrightsville/i.test(i.name + i.shelf) ? 'wrightsville-beach'
    : /carolina beach/i.test(i.name) ? 'carolina-beach'
    : /kure/i.test(i.name) ? 'kure-beach'
    : 'wilmington';
  const townName = { 'wrightsville-beach': 'Wrightsville Beach', 'carolina-beach': 'Carolina Beach', 'kure-beach': 'Kure Beach', wilmington: 'Wilmington' }[town];
  const buy = i.url + (String(i.url).includes('?') ? '&' : '?') + 'utm_source=shorelist.net&utm_medium=product&utm_campaign=shop-product&utm_content=' + handle;
  const shown = (from ? 'From $' : '$') + money(price);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="theme-color" content="#0E1F33"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${canon}"/>
<title>${esc(plain(i.name))} | ShoreList Shop</title>
<meta name="description" content="${esc(plain(i.meta || i.name).slice(0, 180))}"/>
<meta property="og:title" content="${esc(plain(i.name))}"/><meta property="og:description" content="${esc(plain(i.meta || i.name).slice(0, 180))}"/><meta property="og:type" content="product"/><meta property="og:url" content="${canon}"/>
<meta property="og:image" content="${esc(i.img)}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:image" content="${esc(i.img)}"/>
<link rel="icon" href="/favicon.ico"/><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
<link rel="manifest" href="/manifest.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400&display=swap" onload="this.onload=null;this.rel='stylesheet'"/><noscript><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400&display=swap" rel="stylesheet"/></noscript>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'ShoreList', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Shop', item: SITE + '/shop' }, { '@type': 'ListItem', position: 3, name: plain(i.name), item: canon }] })}</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<link rel="stylesheet" href="/events.css"/>
<link rel="stylesheet" href="/luxe.css"/>
<link rel="stylesheet" href="/tokens.css"/>
<link rel="stylesheet" href="/store-pages.css"/>
<script data-idle="/luxe.js"></script>
</head>
<body class="ev-page">
<a class="skip-link" href="#main">Skip to content</a>
<nav class="ev-nav" aria-label="Primary"><a class="nav-logo" href="/" aria-label="ShoreList home">Shore<span>List</span></a><div class="nav-right"><a href="/shop">Shop</a><a href="/shop/${town}">${esc(townName)}</a><a href="/gift-finder">Gift finder</a></div></nav>
<main id="main">
<header class="ev-hero ev-hero-sub"><div class="ev-wrap">
<p class="ev-eye"><i></i>${esc(townName)}</p>
<h1>${esc(plain(i.name))}</h1>
<p class="ev-lede">${esc(plain(i.meta || ''))} Made to order. The price below is the shop catalog price before shipping and tax.</p>
</div></header>
<section id="events-feed" aria-label="${esc(plain(i.name))}"><div class="ef-in"><div class="tp-in gg-wide">
<p><img src="${esc(i.img)}" alt="${esc(plain(i.alt || i.name))}" width="800" height="1000" decoding="async"/></p>
<p class="gg-price">${shown}</p>
${factHtml}
<p><a class="nav-book" href="${esc(buy)}" rel="noopener">Buy on the shop</a></p>
<p>This page is the ShoreList address for the piece. Checkout still runs on the shop, where shipping and tax are shown before you pay. See <a href="/shipping-returns">shipping and returns</a>, the <a href="/shop/${town}">${esc(townName)} shop</a>, and the <a href="/gift-finder">gift finder</a>.</p>
</div></div></section>
</main>
<footer class="ev-foot"><div>&copy; 2026 ShoreList LLC &middot; Wilmington, NC &amp; the Beaches</div><div><a href="/shop">Shop</a><a href="/gift-guide">Gift guide</a><a href="/shipping-returns">Shipping &amp; Returns</a><a href="/legal">Privacy &amp; Terms</a></div></footer>
</body>
</html>
`;
}

for (const i of items) {
  const handle = handleOf(i.url);
  const file = path.join(dir, handle + '.html');
  fs.writeFileSync(file, page(i));
  keep.add(handle + '.html');
}
for (const name of fs.readdirSync(dir)) {
  if (name.endsWith('.html') && !keep.has(name)) fs.unlinkSync(path.join(dir, name));
}

const smPath = path.join(root, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const block = items.map((i) => {
  const handle = handleOf(i.url);
  return `  <url><loc>${SITE}/shop/products/${handle}</loc><lastmod>2026-11-27</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`;
}).join('\n');
const wrapped = `  <!-- product-pages:start -->\n${block}\n  <!-- product-pages:end -->`;
if (sm.includes('<!-- product-pages:start -->')) {
  sm = sm.replace(/  <!-- product-pages:start -->[\s\S]*?  <!-- product-pages:end -->/, wrapped);
} else {
  sm = sm.replace('</urlset>', wrapped + '\n</urlset>');
}
fs.writeFileSync(smPath, sm);
console.log('product pages', items.length);
