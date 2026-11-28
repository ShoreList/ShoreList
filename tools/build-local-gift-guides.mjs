// Builds three local gift guides from live Shopify product JSON.
// Run: node tools/build-local-gift-guides.mjs
// Does not read or write shop.html or shop-catalog.json.
// Prices, colors, sizes and images come from https://shorelist.myshopify.com/products/<handle>.json
import fs from 'node:fs';

const SITE = 'https://shorelist.net';
const promo = fs.readFileSync(new URL('../shop-promo.js', import.meta.url), 'utf8');
const holidayMatch = promo.match(/id: 'xmas'[\s\S]*?text: '([^']+)'/);
if (!holidayMatch) throw new Error('Christmas order-by note missing from shop-promo.js');
const HOLIDAY = holidayMatch[1];
const CHECKOUT = 'Shipping cost and the delivery estimate for your address are shown at checkout, before you pay.';

const HANDLES = {
  sticker: 'sea-oats-carolina-coast-kiss-cut-vinyl-sticker-3-inch',
  cooler: 'wrightsville-beach-can-cooler',
  sleeve: 'wrightsville-beach-sloop-can-cooler-sleeve',
  ornament: 'wrightsville-beach-christmas-ornament-2026',
  sloopMug: 'wrightsville-beach-sloop-printed-mug',
  scallopMug: 'wrightsville-beach-scallop-shell-printed-mug',
  sloopBeanie: 'the-sloop-cuffed-beanie-wrightsville-beach',
  daymarkBeanie: 'daymark-cuffed-beanie-wrightsville-beach',
  towel: 'wrightsville-beach-sloop-printed-tea-towel',
  airlieOrn: 'airlie-oak-wilmington-ceramic-ornament',
  airlieMug: 'airlie-oak-wilmington-printed-mug',
  crew: 'the-sloop-embroidered-crewneck-wrightsville-beach',
};

const BLOCKED = /varsity hoodie|varsity tee|heavyweight hoodie|beach chair|megalodon|umbrella/i;

const FACTS = {
  [HANDLES.sticker]: [
    ['kiss-cut', 'Kiss-cut vinyl sticker with a sea oats illustration.'],
    ['3 x 3', 'The listing describes it as 3 x 3 in.'],
  ],
  [HANDLES.cooler]: [
    ['both sides', 'The town name is printed on both sides.'],
    ['12 oz', 'It fits a 12 oz can and folds flat.'],
  ],
  [HANDLES.sleeve]: [
    ['sailboat', 'Soft sleeve with a repeating sailboat print.'],
    ['regular can', 'Made for a regular can.'],
  ],
  [HANDLES.ornament]: [
    ['christmas 2026', 'Lettering includes Wrightsville Beach and Christmas 2026.'],
    ['2.9', 'About 2.9 inches across, with a gold hanging cord.'],
    ['ceramic', 'Round ceramic ornament, printed on one side.'],
  ],
  [HANDLES.sloopMug]: [
    ['11 oz', '11 oz ceramic mug.'],
    ['sailboat', 'Navy sailboat pattern wraps the mug.'],
  ],
  [HANDLES.scallopMug]: [
    ['11 oz', '11 oz white ceramic mug.'],
    ['scallop', 'One scallop shell drawing is printed on the side.'],
  ],
  [HANDLES.sloopBeanie]: [
    ['wb', 'A small sloop and the letters WB are embroidered on the cuff.'],
  ],
  [HANDLES.daymarkBeanie]: [
    ['wb', 'One small sloop and WB are stitched on the cuff.'],
    ['navy', 'The knit listed on the product page is navy.'],
  ],
  [HANDLES.towel]: [
    ['tea towel', 'Printed tea towel with the sloop pattern.'],
  ],
  [HANDLES.airlieOrn]: [
    ['airlie oak', 'Ceramic ornament with an illustration of the Airlie Oak.'],
    ['ceramic', 'Round ceramic ornament.'],
  ],
  [HANDLES.airlieMug]: [
    ['11 oz', '11 oz ceramic mug.'],
    ['airlie oak', 'Illustration of the Airlie Oak wraps the mug.'],
  ],
  [HANDLES.crew]: [
    ['embroidered', 'A sloop and the letters WB are embroidered on the chest.'],
  ],
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const money = (n) => {
  const x = Math.round(Number(n) * 100) / 100;
  if (!Number.isFinite(x)) throw new Error('bad price ' + n);
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
};
const dash = (s) => String(s).replace(/\u2014/g, ', ').replace(/\u2013/g, '-');

function sized(src) {
  const u = new URL(src);
  if (!/_800x\.(jpe?g|png|webp)$/i.test(u.pathname)) u.pathname = u.pathname.replace(/(\.(jpe?g|png|webp))$/i, '_800x$1');
  return u.toString();
}

async function load(handle) {
  const res = await fetch('https://shorelist.myshopify.com/products/' + handle + '.json');
  if (!res.ok) throw new Error(handle + ' HTTP ' + res.status);
  const body = await res.json();
  if (!body.product) throw new Error(handle + ' had no product');
  return body.product;
}

function optionSummary(product, variants) {
  const parts = [];
  for (const opt of product.options || []) {
    const key = 'option' + opt.position;
    const values = [];
    for (const v of variants) {
      const val = v[key];
      if (val && !values.includes(val)) values.push(val);
    }
    if (values.length) parts.push(opt.name + ': ' + values.join(', '));
  }
  return parts.join('. ');
}

function pickImage(product, variants) {
  const ids = new Set(variants.map((v) => v.id));
  const imgs = product.images || [];
  return imgs.find((im) => (im.variant_ids || []).some((id) => ids.has(id))) || imgs[0];
}

function buildItem(product) {
  if (BLOCKED.test(product.title)) throw new Error('blocked product: ' + product.title);
  const variants = (product.variants || []).filter((v) => v.available !== false);
  if (!variants.length) throw new Error(product.handle + ' has no available variants');
  const prices = variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const image = pickImage(product, variants);
  if (!image || !image.src) throw new Error(product.handle + ' has no image');
  const body = strip(product.body_html).toLowerCase();
  const facts = (FACTS[product.handle] || []).filter(([phrase]) => body.includes(phrase)).map(([, sentence]) => sentence);
  const options = optionSummary(product, variants);
  const line = dash([options, ...facts].filter(Boolean).join('. ').replace(/\.\.+/g, '.'));
  if (/souvenir/i.test(line) || /souvenir/i.test(product.title)) throw new Error('souvenir in product copy: ' + product.handle);
  const alt = dash(image.alt && !/^(image|photo|picture|img|logo|banner|untitled)\b\.?$/i.test(image.alt.trim()) ? image.alt : product.title);
  return {
    handle: product.handle,
    title: dash(product.title),
    url: 'https://shorelist.myshopify.com/products/' + product.handle,
    min, max,
    priceText: min === max ? '$' + money(min) : '$' + money(min) + ' to $' + money(max),
    image: sized(image.src),
    alt,
    width: image.width || 800,
    height: image.height || 800,
    lookbook: /lookbook/i.test(image.src),
    line,
    variants: variants.length,
  };
}

function card(item) {
  const disclosure = item.lookbook ? '<small class="gg-line">AI-generated lookbook</small>' : '';
  return `<li><a href="${esc(item.url)}" data-item-id="${esc(item.handle)}"><img src="${esc(item.image)}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"/>${disclosure}<span class="gg-name">${esc(item.title)}</span><span class="gg-price">${esc(item.priceText)}</span><span class="gg-line">${esc(item.line)}</span></a></li>`;
}

function section(id, heading, intro, items) {
  return `<section class="gg-sec" id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h">${heading}</h2><p>${intro}</p><ul class="gg-grid">${items.map(card).join('')}</ul></section>`;
}

function page({ slug, title, desc, eye, h1, lede, body, products }) {
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ShoreList', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: SITE + '/shop' },
    { '@type': 'ListItem', position: 3, name: eye, item: SITE + '/' + slug },
  ] };
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: title, itemListElement: products.map((item, n) => ({
    '@type': 'ListItem', position: n + 1, item: {
      '@type': 'Product', name: item.title, url: item.url, image: item.image,
      brand: { '@type': 'Brand', name: 'ShoreList' },
      offers: item.min === item.max
        ? { '@type': 'Offer', priceCurrency: 'USD', price: item.min, url: item.url }
        : { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: item.min, highPrice: item.max, offerCount: item.variants, url: item.url },
    },
  })) };
  const faqs = body.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs };
  const lds = [crumbs, list, faqLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const faqHtml = `<section class="tp-faq" id="faq"><h2>Questions</h2>${body.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${a}</p>`).join('')}</section>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="theme-color" content="#0E1F33"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${SITE}/${slug}"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${SITE}/${slug}"/>
<meta property="og:image" content="${SITE}/og-home.jpg"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:image" content="${SITE}/og-home.jpg"/>
<link rel="icon" href="/favicon.ico"/><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
<script>document.documentElement.className+=' js'</script>
<script>
window.addEventListener('load',function(){
  function load(){
    if(document.querySelector('script[data-sl-ga]'))return;
    var tag=document.createElement('script');
    tag.async=true;
    tag.setAttribute('data-sl-ga','1');
    tag.src='https://www.googletagmanager.com/gtag/js?id=G-EN91RH3PZV';
    document.head.appendChild(tag);
  }
  document.addEventListener('pointerdown',load,{once:true,passive:true});
  setTimeout(function(){if(window.requestIdleCallback)requestIdleCallback(load);else load();},5000);
});
</script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-EN91RH3PZV');</script>
<link rel="manifest" href="/manifest.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400&display=swap" onload="this.onload=null;this.rel='stylesheet'"/><noscript><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&family=Libre+Caslon+Display&family=Libre+Caslon+Text:wght@400&display=swap" rel="stylesheet"/></noscript>
${lds}
<link rel="stylesheet" href="/events.css"/>
<link rel="stylesheet" href="/luxe.css"/>
<link rel="stylesheet" href="/tokens.css"/>
<link rel="stylesheet" href="/store-pages.css"/>
<script data-idle="/luxe.js"></script>
</head>
<body class="ev-page">
<a class="skip-link" href="#main">Skip to content</a>
<nav class="ev-nav" aria-label="Primary"><a class="nav-logo" href="/" aria-label="ShoreList home">Shore<span>List</span></a><div class="nav-right"><a href="/shop">Shop</a><a href="/events">Events</a><a href="/things-to-do">Things to Do</a><a class="nav-book" href="/things-to-do">Book Experiences</a></div></nav>
<main id="main">
<header class="ev-hero ev-hero-sub">
  <div class="ev-wrap">
    <p class="ev-eye"><i></i>${esc(eye)}</p>
    <h1>${esc(h1)}</h1>
    <p class="ev-lede">${lede}</p>
  </div>
</header>
<section id="events-feed" aria-label="${esc(eye)}">
<div class="ef-in"><div class="tp-in gg-wide">
${body.html}
${faqHtml}
</div></div></section>
</main>
<footer class="ev-foot"><div>&copy; 2026 ShoreList LLC &middot; Wilmington, NC &amp; the Beaches</div><div><a href="/events">Events Guide</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a href="/where-to-stay">Where to Stay</a><a href="/wilmington-weather">Weather</a><a href="/guides">PDF Guides</a><a href="/prints">Art Prints</a><a href="/shipping-returns">Shipping &amp; Returns</a><a href="/size-guide">Size Guide</a><a href="/gift-guide">Gift Guide</a><a href="/wilmington-nc-gifts">Wilmington NC gifts</a><a href="/wrightsville-beach-souvenirs">Wrightsville Beach souvenirs</a><a href="/wrightsville-beach-christmas-ornament">Wrightsville Beach Christmas ornament</a><a href="/how-we-verify">How we verify</a><a href="/legal">Privacy &amp; Terms</a></div></footer>
<script data-idle="/shore-plus.js"></script>
</body>
</html>
`;
}

function guides(current) {
  const all = [
    ['/wilmington-nc-gifts', 'Wilmington NC gifts'],
    ['/wrightsville-beach-souvenirs', 'Wrightsville Beach souvenirs'],
    ['/wrightsville-beach-christmas-ornament', 'Wrightsville Beach Christmas ornament'],
  ];
  const links = all.filter(([href]) => href !== '/' + current).map(([href, name]) => `<a href="${href}">${name}</a>`).join(' and ');
  return `<p>See ${links}, or browse the whole <a href="/shop">shop</a>. Prices below are the item prices before shipping and tax. ${HOLIDAY} ${CHECKOUT} Made to order pieces cannot be returned for a change of mind. Damaged, defective or misprinted pieces are covered on the <a href="/shipping-returns">shipping and returns</a> page.</p>`;
}

function assertCopy(html, slug) {
  if (/\u2014|\u2013|&mdash;|&ndash;/.test(html)) throw new Error(slug + ' has an em or en dash');
  if (/battleship|beach club|yacht/i.test(html)) throw new Error(slug + ' has banned wording');
  if (BLOCKED.test(html)) throw new Error(slug + ' names a dropped product');
  const headings = html.match(/<h[1-3]\b[^>]*>[\s\S]*?<\/h[1-3]>/gi) || [];
  for (const h of headings) if (/johnnie|mercer/i.test(h)) throw new Error(slug + ' uses the pier name in a heading');
  const cards = html.match(/class="gg-(?:name|line)">[^<]*/g) || [];
  for (const c of cards) if (/souvenir/i.test(c)) throw new Error(slug + ' uses souvenir in a product name or card line');
}

const by = new Map();
for (const handle of Object.values(HANDLES)) by.set(handle, buildItem(await load(handle)));
const get = (key) => {
  const item = by.get(HANDLES[key]);
  if (!item) throw new Error('missing ' + key);
  return item;
};

const underKeys = ['sticker', 'cooler', 'sleeve', 'ornament', 'sloopMug', 'scallopMug', 'sloopBeanie', 'daymarkBeanie', 'towel'];
for (const key of underKeys) if (!(get(key).max < 35)) throw new Error(key + ' is not under $35: ' + get(key).priceText);
if (!(get('crew').min > 35)) throw new Error('crewneck expected above $35, got ' + get('crew').priceText);

for (const item of by.values()) {
  const head = await fetch(item.image, { method: 'HEAD' });
  if (!head.ok) throw new Error(item.handle + ' image HTTP ' + head.status + ' ' + item.image);
}

const ornamentPrice = get('ornament').priceText;
const note = `${HOLIDAY} ${CHECKOUT}`;

const wilmingtonProducts = ['sticker', 'airlieOrn', 'ornament', 'cooler', 'sleeve', 'airlieMug', 'sloopMug', 'scallopMug', 'sloopBeanie', 'daymarkBeanie', 'towel', 'crew'].map(get);
const souvenirProducts = ['sticker', 'cooler', 'sleeve', 'ornament', 'sloopMug', 'scallopMug', 'sloopBeanie', 'daymarkBeanie', 'towel', 'crew'].map(get);
const ornamentProducts = ['ornament', 'sticker', 'cooler', 'sleeve', 'sloopMug', 'scallopMug', 'sloopBeanie', 'daymarkBeanie', 'towel', 'crew'].map(get);

const pages = [
  {
    slug: 'wilmington-nc-gifts',
    title: 'Wilmington NC Gifts | ShoreList Shop',
    desc: 'Wilmington NC gifts from ShoreList with live shop prices. Under $35: a sticker, can coolers, the 2026 ornament, mugs and beanies, then a crewneck.',
    eye: 'Wilmington NC gifts',
    h1: 'Wilmington NC gifts from ShoreList',
    lede: 'A Wilmington NC gift that names a real place is easier to give than a generic shell. This page starts with pieces under $35, then one embroidered crewneck. Every price is the current item price from the shop.',
    products: wilmingtonProducts,
    html: `<p>People usually want a Wilmington NC gift for a host on Front Street, a neighbor, or a visitor who walked the Wilmington Riverwalk and still has room in a suitcase. The useful ones name the city or the beach a short drive east. Airlie Gardens is a public garden at 300 Airlie Road in Wilmington, a few minutes northeast of downtown and close to Wrightsville Beach. The Airlie Oak ornament and mug on this page show an illustration of that oak. ShoreList is an independent company and is not affiliated with, sponsored by or endorsed by Airlie Gardens. Visit details are on <a href="https://www.airliegardens.org/plan-your-visit">the garden's own site</a>.</p>
<p>Wrightsville Beach is the strand most of these gifts point to. Banks Channel is the sheltered water on the sound side. Johnnie Mercer's Pier is the fishing pier on the ocean side. The pier's own site describes it as the first concrete fishing pier in North Carolina, in the heart of Wrightsville Beach, extending more than 1,200 feet into the Atlantic. ShoreList is not affiliated with the pier and does not use its logo. Hours and rules are on <a href="https://johnniemercersfishingpier.com">the pier's own site</a>. South of the strand, Masonboro Inlet lies between Wrightsville Beach and Masonboro Island. Masonboro Island is undeveloped and reached by boat, not by a road from the beach.</p>
${guides('wilmington-nc-gifts')}
${section('under-35', 'Gifts under $35', 'Sticker, can coolers, ornaments, mugs, beanies and the tea towel. Colors and sizes are the ones currently on each product page.', wilmingtonProducts.filter((i) => i.max < 35))}
${section('larger', 'A larger gift', 'One embroidered crewneck, after the smaller gifts. The colors listed on the card are the colors in the live product data.', wilmingtonProducts.filter((i) => i.min >= 35))}`,
    faqs: [
      ['What is a useful Wilmington NC gift under $35?', 'A sticker, can cooler, ornament, mug, beanie or tea towel from this page. The price on the card is the current item price, before shipping and tax.'],
      ['When should a Christmas gift be ordered?', HOLIDAY + ' ' + CHECKOUT],
      ['Is ShoreList part of Airlie Gardens or the fishing pier?', 'No. ShoreList is an independent Wilmington company. Naming Airlie Gardens or the pier describes the place. ShoreList is not affiliated with, sponsored by or endorsed by either of them.'],
    ],
  },
  {
    slug: 'wrightsville-beach-souvenirs',
    title: 'Wrightsville Beach Souvenirs | ShoreList Shop',
    desc: 'Wrightsville Beach souvenirs from ShoreList. Under $35 first: can coolers, the 2026 ornament, a sticker, mugs, beanies and a tea towel.',
    eye: 'Wrightsville Beach',
    h1: 'Wrightsville Beach souvenirs to take home',
    lede: 'Wrightsville Beach souvenirs on this page name the beach in a small way: a sloop, the letters WB, the town name on a can cooler, or the year on an ornament. Gifts under $35 come first. The embroidered crewneck is the larger piece.',
    products: souvenirProducts,
    html: `<p>A Wrightsville Beach souvenir works when the person who gets it can tell where it is from without a long explanation. The can cooler and the can cooler sleeve are the beach-day pieces. The ornament is the dated keepsake. Mugs, beanies and the tea towel cover the kitchen and the head. The sea oats sticker is the smallest of the set. None of these is a town seal or a photo of a landmark.</p>
<p>On the ocean side, Johnnie Mercer's Pier is the fishing pier in the heart of Wrightsville Beach. Its own site says it was the first concrete fishing pier in North Carolina and that it extends more than 1,200 feet into the Atlantic. That is a landmark, not a partnership. ShoreList does not use the pier's logo. Check hours on <a href="https://johnniemercersfishingpier.com">the pier's own site</a>. Banks Channel is the calmer water on the sound side. The Loop at Wrightsville Beach crosses Banks Channel and passes Wrightsville Beach Park, an easy walk if the gift is for someone who already spends mornings there. Masonboro Inlet is the inlet south of the strand, between Wrightsville Beach and Masonboro Island. The island is undeveloped and reached by boat.</p>
${guides('wrightsville-beach-souvenirs')}
${section('under-35', 'Gifts under $35', 'The sticker, both can coolers, the ornament, both mugs, both beanies and the tea towel. Each card lists the colors and sizes available right now.', souvenirProducts.filter((i) => i.max < 35))}
${section('larger', 'A larger gift', 'The sloop crewneck, for someone who wants the beach on a sweatshirt. Card colors come from the live product, not from a fixed list.', souvenirProducts.filter((i) => i.min >= 35))}`,
    faqs: [
      ['What should I look for in Wrightsville Beach souvenirs?', 'A piece that names Wrightsville Beach, uses the letters WB, or carries the sloop used on these goods. This page leads with gifts under $35 and ends with one crewneck.'],
      ['Will a gift arrive by Christmas?', HOLIDAY + ' ' + CHECKOUT],
    ],
  },
  {
    slug: 'wrightsville-beach-christmas-ornament',
    title: 'Wrightsville Beach Christmas Ornament | ShoreList',
    desc: `The Wrightsville Beach Christmas ornament for 2026 is a round ceramic keepsake from ShoreList at ${ornamentPrice}. See the printed year and the smaller gifts that pair with it.`,
    eye: 'Christmas ornament',
    h1: 'Wrightsville Beach Christmas ornament for 2026',
    lede: `The Wrightsville Beach Christmas ornament for 2026 is ${ornamentPrice} today. It is the small dated gift on this page. The sticker, can coolers, mugs, beanies and tea towel sit with it, all under $35, and one crewneck follows if you want something larger.`,
    products: ornamentProducts,
    html: `<p>This ornament is for a tree in town or for a household that spends a week at Wrightsville Beach and wants the year written on the gift. It is not a shirt and it does not pretend to be a photo of the strand. The card below uses the live product title, price, photo and the options currently for sale. Open the product page before you pay. The delivery estimate there is for your address, and this page does not add one.</p>
<p>Wrightsville Beach in December is quieter than July, which is why a dated ornament makes more sense than another beach towel for some people. Banks Channel is still the sheltered water on the sound side of the island. Johnnie Mercer's Pier is still the fishing pier on the strand. The pier's own site is the place to see whether it is open. ShoreList is not affiliated with the pier. Airlie Gardens, at 300 Airlie Road in Wilmington, is a separate stop a few minutes northeast of downtown and close to the beach. The garden publishes its own visit details. ShoreList is not affiliated with Airlie Gardens. Masonboro Inlet and Masonboro Island are south of the strand. The island is undeveloped and reached by boat.</p>
${guides('wrightsville-beach-christmas-ornament')}
${section('ornament', 'The 2026 ornament', 'One round ceramic ornament. The price and the photo are from the live product.', [get('ornament')])}
${section('pair', 'Small gifts to give with it', 'Each of these is under $35. Colors and sizes are whatever the product page lists as available.', ornamentProducts.filter((i) => i.handle !== HANDLES.ornament && i.max < 35))}
${section('larger', 'If the ornament is not enough', 'The embroidered sloop crewneck is the one larger piece on this page.', ornamentProducts.filter((i) => i.min >= 35))}`,
    faqs: [
      ['What is printed on the Wrightsville Beach Christmas ornament?', 'A sloop, the words Wrightsville Beach, and Christmas 2026, on a round ceramic ornament with a gold cord. The price on this page is the current shop price.'],
      ['What else is under $35 on this page?', 'The sea oats sticker, the Wrightsville Beach can cooler, the sloop can cooler sleeve, two mugs, two beanies and a tea towel, at the prices shown.'],
      ['Can you promise Christmas delivery?', HOLIDAY + ' ' + CHECKOUT],
    ],
  },
];

for (const spec of pages) {
  if (spec.title.length < 25 || spec.title.length > 62) throw new Error(spec.slug + ' title length ' + spec.title.length);
  if (spec.desc.length < 70 || spec.desc.length > 165) throw new Error(spec.slug + ' description length ' + spec.desc.length + ': ' + spec.desc);
  const html = page({ ...spec, body: { html: spec.html, faqs: spec.faqs } });
  assertCopy(html, spec.slug);
  const visiblePrices = [...html.matchAll(/class="gg-price">([^<]+)</g)].map((m) => m[1]);
  const expected = spec.products.map((i) => i.priceText);
  if (visiblePrices.join('|') !== expected.join('|')) throw new Error(spec.slug + ' prices drifted: ' + visiblePrices.join(', '));
  fs.writeFileSync(new URL('../' + spec.slug + '.html', import.meta.url), html);
  console.log(spec.slug, 'title', spec.title.length, 'desc', spec.desc.length, 'products', spec.products.map((i) => i.title + ' ' + i.priceText).join('; '));
}

console.log('holiday:', HOLIDAY);
