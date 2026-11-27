#!/usr/bin/env node
// Writes the crawlable, no-JavaScript parts of shop.html from shop-catalog.json:
//   - collection blocks, the four first-screen "Gifts under $35" cards (FIRST_SCREEN below), and the Product/ItemList + FAQPage JSON-LD
// The FAQPage JSON-LD is built from the visible FAQ text in shop.html, so the two cannot disagree.
// Run: node tools/build-shop-static.mjs   (node tools/build-shop-static.mjs --check exits 1 if shop.html is stale)
import fs from 'node:fs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cat = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8'));
const byId = new Map(cat.items.map((i) => [i.id, i]));
const ri = (cat.retired && cat.retired.items) || {};
const retired = new Set(Array.isArray(ri) ? ri.map((r) => (typeof r === 'string' ? r : r.id)) : Object.keys(ri));
let html = fs.readFileSync('shop.html', 'utf8');

const BLOCKS = [
  { id: 'local-icons', cover: 'the-pelican-embroidered-crewneck-carolina-beach', line: 'One small mark per beach town, on crewnecks, tees and caps.' },
  { id: 'shore-gear', cover: 'wrightsville-beach-sloop-weekender-tote-bag', line: 'Totes, mugs, pillows and can coolers for the boat and the beach.' },
  { id: 'beach-setup', cover: 'wrightsville-beach-sloop-picnic-and-beach-blanket', line: 'The chair, the shade, the towel and the cooler.' },
  { id: 'coastal-christmas', cover: 'airlie-oak-wilmington-ceramic-ornament', line: 'Ornaments and gifts for a Carolina Christmas.' },
  { id: 'landmarks', cover: 'airlie-oak-framed-art-print-wrightsville-beach-and-wilmington', line: 'A framed print of Wrightsville Beach and Wilmington.' },
];
const money = (i) => (i.from === true ? 'From ' : '') + '$' + (Number.isInteger(i.price) ? i.price : i.price.toFixed(2));
const first = (i) => i.studio || i.img;
const sized = (u, w) => { if (!/^https:\/\/cdn\.shopify\.com\//.test(u)) return u; const m = u.match(/_(\d+)x(\.\w+(\?.*)?)$/); if (m) return +m[1] > w ? u.replace(/_\d+x(\.\w+(\?.*)?)$/, '_' + w + 'x$1') : u; return u.replace(/\.(\w+)(\?.*)?$/, '_' + w + 'x.$1$2'); };
const splitName = (n) => { const k = n.lastIndexOf(', '); return (k > 0 ? n.slice(0, k) : n).replace(/^The /, ''); };

const collections = BLOCKS.filter((b) => cat.collections.some((c) => c.id === b.id) && cat.items.some((i) => i.collection === b.id && !retired.has(i.id)))
  .map((b, k) => {
    const c = cat.collections.find((x) => x.id === b.id), cv = byId.get(b.cover) || cat.items.find((i) => i.collection === b.id);
    const img = cv && (cv.lookbook || cv.img);
    return `<a class="cblock${k === 0 ? ' wide' : ''}" href="/shop?collection=${esc(b.id)}#results" data-coll="${esc(b.id)}"><div class="cp">${img ? `<img src="${esc(img.replace(/_1920x(\.\w+)$/, k === 0 ? '_1280x$1' : '_960x$1'))}" alt="" loading="lazy" decoding="async" width="1200" height="${k === 0 ? 514 : 900}"/>` : ''}</div><h3>${esc(c.name)}</h3><p>${esc(b.line)}</p><span class="go">View the collection</span></a>`;
  });
// Shopify storefront collections. These are not on-page filters, so they have no data-coll.
const shopifyCollections = [
  { href: 'https://shorelist.myshopify.com/collections/art-prints', name: 'Art & Prints', line: 'Framed prints from Wrightsville Beach, Carolina Beach and Kure Beach.', img: 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-lookbook-wrightsville-beach-sailfish-framed-art-print_960x.jpg', alt: 'Framed Wrightsville Beach sailfish art print in a coastal study, rendered mockup' },
  { href: 'https://shorelist.myshopify.com/collections/home-decor', name: 'Home Decor', line: 'Ornaments, mugs, pillows and towels for the house.', img: 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-lookbook-wrightsville-ornament-2026_960x.webp', alt: 'Wrightsville Beach 2026 ornament on a Christmas tree in a coastal living room' },
  { href: 'https://shorelist.myshopify.com/collections/gear', name: 'Gear', line: 'Coolers, totes and pouches for the boat and the beach.', img: 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-lookbook-wrightsville-can-cooler_960x.webp', alt: 'Hand holding a can in the Wrightsville Beach can cooler on a dock at sunset' },
].map((c) => `<a class="cblock" href="${esc(c.href)}" rel="noopener"><div class="cp"><img src="${esc(c.img)}" alt="${esc(c.alt)}" loading="lazy" decoding="async" width="1200" height="900"/></div><h3>${esc(c.name)}</h3><p>${esc(c.line)}</p><span class="go">View the collection</span></a>`);
collections.push(...shopifyCollections);

const WB_FEAT = (cat.startHere || []).filter((id) => byId.get(id) && !retired.has(id));
const FIRST_SCREEN = [
  'sea-oats-carolina-coast-kiss-cut-vinyl-sticker-3-inch',
  'wrightsville-can-cooler',
  'wrightsville-ornament-2026',
  'wrightsville-beach-sloop-all-over-print-zip-pouch',
];
const start = (cat.startHere || []).map((id) => byId.get(id)).filter((i) => i && !retired.has(i.id)).slice(0, 9);
const firstScreen = FIRST_SCREEN.map((id) => byId.get(id)).filter((i) => i && !retired.has(i.id)).slice(0, 4);
const wbFeat = WB_FEAT.map((id) => byId.get(id)).filter((i) => i && !retired.has(i.id));
const leadOf = (i) => i.lookbook || i.img || i.studio;
const wbCards = wbFeat.map((i, k) => {
  const f = sized(leadOf(i), 480);
  const pri = k === 0 ? 'fetchpriority="high" loading="eager"' : (k === 1 ? 'fetchpriority="auto" loading="eager"' : 'fetchpriority="low" loading="lazy"');
  return `<article class="card"><div class="ph" data-qv="${esc(i.id)}"><img class="p1" src="${esc(f)}" alt="${esc(i.alt || i.name)}" ${pri} decoding="async" width="800" height="1000"/></div><div class="bd"><h3><button type="button" data-qv="${esc(i.id)}" aria-haspopup="dialog">${esc(splitName(i.name))}</button></h3><div class="row"><span class="price">${esc(money(i))}</span></div></div></article>`;
});
const cards = firstScreen.map((i) => {
  const f = sized(leadOf(i), 480);
  return `<article class="card"><div class="ph" data-qv="${esc(i.id)}"><img class="p1" src="${esc(f)}" alt="${esc(i.alt || i.name)}" fetchpriority="low" loading="lazy" decoding="async" width="800" height="1000"/></div><div class="bd"><h3><button type="button" data-qv="${esc(i.id)}" aria-haspopup="dialog">${esc(splitName(i.name))}</button></h3><div class="row"><span class="price">${esc(money(i))}</span></div></div></article>`;
});
const lcpSrc = wbFeat[0] ? sized(leadOf(wbFeat[0]), 480) : '';
const lcp = lcpSrc ? `<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>\n<link rel="preload" as="image" href="${esc(lcpSrc)}" fetchpriority="high" media="(max-width: 899px)">` : '';

const faqBlock = html.match(/<!--SHOP-STATIC:faq-->([\s\S]*?)<!--\/SHOP-STATIC:faq-->/)[1];
const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const faq = [...faqBlock.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((m) => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } }));

const base = 'https://shorelist.net';
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': base + '/#org', name: 'ShoreList', url: base + '/', logo: base + '/icons/icon-512.png', areaServed: 'Wilmington, North Carolina' },
    { '@type': 'Brand', '@id': base + '/shop#brand', name: 'ShoreList' },
    { '@type': 'CollectionPage', '@id': base + '/shop#page', url: base + '/shop', name: 'The ShoreList Shop', description: 'Wilmington NC souvenirs, embroidered crewnecks, caps, totes and art prints designed for Wrightsville Beach, Carolina Beach and Kure Beach, made to order.', isPartOf: { '@id': base + '/#org' }, mainEntity: { '@id': base + '/shop#start' }, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' }, { '@type': 'ListItem', position: 2, name: 'Shop', item: base + '/shop' }] } },
    { '@type': 'ItemList', '@id': base + '/shop#start', name: 'Start here', itemListElement: start.map((i, k) => ({ '@type': 'ListItem', position: k + 1, item: { '@type': 'Product', name: i.name, image: first(i), url: i.url, brand: { '@id': base + '/shop#brand' }, offers: { '@type': 'Offer', price: String(i.price), priceCurrency: 'USD', url: i.url } } })) },
    { '@type': 'FAQPage', mainEntity: faq },
  ],
};
const HOME = ['carolina-beach-lifeguard-stand-embroidered-crewneck-sweatshirt', 'the-pelican-corduroy-cap-carolina-beach', 'airlie-oak-framed-art-print-wrightsville-beach-and-wilmington'].map((id) => byId.get(id)).filter((i) => i && !retired.has(i.id));
const homeBand = `<ul class="hx-shop-grid">${HOME.map((i) => `<li><a href="/shop/${esc(i.town || 'wilmington')}"><span class="hx-shop-ph"><img src="${esc(sized(i.studio || i.img, 800))}" alt="${esc(i.alt || i.name)}" loading="lazy" decoding="async" width="800" height="1000"/></span><span class="hx-shop-n">${esc(splitName(i.name))}</span></a></li>`).join('')}</ul>`;
const put = (name, body) => { html = html.replace(new RegExp(`(<!--SHOP-STATIC:${name}-->)[\\s\\S]*?(<!--/SHOP-STATIC:${name}-->)`), (_, a, z) => `${a}\n${body}\n${z}`); };
put('collections', `<div class="cblocks" id="cblocks">${collections.join('')}</div>`);
put('wbfeat', wbCards.join('\n'));
put('cards', cards.join('\n'));
put('lcp', lcp);
if (fs.existsSync('index.html')) { let ix = fs.readFileSync('index.html', 'utf8'); ix = ix.replace(/(<!--SHOP-STATIC:homeband-->)[\s\S]*?(<!--\/SHOP-STATIC:homeband-->)/, (_, a, z) => `${a}\n    ${homeBand}\n    ${z}`); if (process.argv.includes('--check')) { if (ix !== fs.readFileSync('index.html', 'utf8')) { console.error('index.html shop band is stale: run node tools/build-shop-static.mjs'); process.exit(1); } } else fs.writeFileSync('index.html', ix); }
put('ld', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
if (process.argv.includes('--check')) { if (html !== fs.readFileSync('shop.html', 'utf8')) { console.error('shop.html static blocks are stale: run node tools/build-shop-static.mjs'); process.exit(1); } console.log('shop static blocks current'); }
else { fs.writeFileSync('shop.html', html); console.log(`shop.html: ${collections.length} collection blocks, ${cards.length} cards, ${faq.length} FAQ entries`); }
