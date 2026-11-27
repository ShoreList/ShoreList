// Builds /johnnie-mercers-pier from live Shopify prices for the shop list.
// Run: node tools/build-pier-guide.mjs
// Does not read or write shop.html or shop-catalog.json.
// Pier facts in the prose were checked on the pier's own site on 2026-11-27.
// Hours and fees are linked, not copied, because the contact page and FAQ disagree on weekend hours.
import fs from 'node:fs';

const SITE = 'https://shorelist.net';
const HANDLES = [
  'wrightsville-beach-sailfish-printed-garment-dyed-tee',
  'wrightsville-beach-sailfish-printed-canvas-tote',
  'wrightsville-beach-sailfish-framed-art-print',
  'the-sloop-corduroy-cap-wrightsville-beach',
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => {
  const x = Math.round(Number(n) * 100) / 100;
  if (!Number.isFinite(x)) throw new Error('bad price ' + n);
  return Number.isInteger(x) ? String(x) : x.toFixed(2);
};
const clean = (s) => String(s).replace(/\u2014/g, ', ').replace(/\u2013/g, '-');

async function load(handle) {
  const res = await fetch('https://shorelist.myshopify.com/products/' + handle + '.json');
  if (!res.ok) throw new Error(handle + ' HTTP ' + res.status);
  const body = await res.json();
  if (!body.product) throw new Error(handle + ' missing');
  return body.product;
}

function itemFrom(product) {
  const variants = (product.variants || []).filter((v) => v.available !== false);
  if (!variants.length) throw new Error(product.handle + ' has no variants');
  const prices = variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const options = (product.options || []).map((opt) => {
    const key = 'option' + opt.position;
    const values = [];
    for (const v of variants) if (v[key] && !values.includes(v[key])) values.push(v[key]);
    return opt.name + ': ' + values.join(', ');
  }).join('. ');
  return {
    handle: product.handle,
    title: clean(product.title),
    url: 'https://shorelist.myshopify.com/products/' + product.handle,
    min, max,
    priceText: min === max ? '$' + money(min) : '$' + money(min) + ' to $' + money(max),
    options: clean(options),
    variants: variants.length,
  };
}

const products = [];
for (const handle of HANDLES) products.push(itemFrom(await load(handle)));

const title = "Johnnie Mercer's Pier Parking and Hours | ShoreList";
const desc = "Johnnie Mercer's Pier at Wrightsville Beach: the street address, town parking at the pier, and links to hours, fees, the fishing report and the live cam.";
const h1 = 'The fishing pier at Wrightsville Beach';
if (title.length < 25 || title.length > 62) throw new Error('title length ' + title.length);
if (desc.length < 70 || desc.length > 165) throw new Error('desc length ' + desc.length + ': ' + desc);

const shopItems = products.map((item) => `<li><a href="${esc(item.url)}">${esc(item.title)}</a>, ${esc(item.priceText)}. ${esc(item.options)}.</li>`).join('');
const faqs = [
  ['Where is the fishing pier at Wrightsville Beach?', "Johnnie Mercer's Pier lists its address as 23 E Salisbury St, Wrightsville Beach, NC 28480. The pier's site says it is the first concrete fishing pier in North Carolina and that it extends more than 1,200 feet into the Atlantic from the heart of Wrightsville Beach."],
  ['Where do people park for the pier?', "The pier's FAQ says pay parking at the pier and along the side streets is operated by the town of Wrightsville Beach. It lists $6 an hour or $30 for the day, enforced from 9 a.m. to 8 p.m., seven days a week, with metered parking from March 1 through October 31. Follow the signs at the space, because the town runs those spaces."],
  ['Where are the hours, fees, fishing report and live cam?', "Hours and fees are on the pier's own site. The contact page and the FAQ do not state the same Friday and Saturday closing time, so this guide does not choose one. The fishing page has the pass list. The live cam is on its own page and is not embedded here."],
];

const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'ShoreList', item: SITE + '/' },
  { '@type': 'ListItem', position: 2, name: 'Wrightsville Beach', item: SITE + '/wrightsville-beach' },
  { '@type': 'ListItem', position: 3, name: 'Fishing pier', item: SITE + '/johnnie-mercers-pier' },
] };
const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Wrightsville Beach goods', itemListElement: products.map((item, n) => ({
  '@type': 'ListItem', position: n + 1, item: {
    '@type': 'Product', name: item.title, url: item.url, brand: { '@type': 'Brand', name: 'ShoreList' },
    offers: item.min === item.max
      ? { '@type': 'Offer', priceCurrency: 'USD', price: item.min, url: item.url }
      : { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: item.min, highPrice: item.max, offerCount: item.variants, url: item.url },
  },
})) };
const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
const lds = [crumbs, list, faqLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="theme-color" content="#0E1F33"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${SITE}/johnnie-mercers-pier"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${SITE}/johnnie-mercers-pier"/>
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
    <p class="ev-eye"><i></i>Wrightsville Beach</p>
    <h1>${esc(h1)}</h1>
    <p class="ev-lede">Johnnie Mercer's Pier is the fishing pier on the ocean side of Wrightsville Beach. This note is the address, how parking is described, and where to open hours, fees, the fishing page and the live cam. ShoreList does not run the pier, does not use its logo, and is not affiliated with it.</p>
  </div>
</header>
<section id="events-feed" aria-label="Fishing pier">
<div class="ef-in"><div class="tp-in">
<p>The pier's contact page lists 23 E Salisbury St, Wrightsville Beach, NC 28480. Its home page calls it the first concrete fishing pier in North Carolina, in the heart of Wrightsville Beach, extending more than 1,200 feet into the Atlantic. That page also says the concrete pier reopened in 2001 after hurricanes in 1996 damaged the earlier wooden pier. Those sentences are the pier's account, checked on its site on 27 November 2026. The walk out starts at that address and goes over the Atlantic. Banks Channel is the sheltered water on the sound side of the island, not the water under this pier. The Loop at Wrightsville Beach crosses Banks Channel and passes Wrightsville Beach Park, which is the flat way around the middle of the island if you are already on foot.</p>
<h2>Where it is</h2>
<p>Use the street address above. Wrightsville Beach is the island east of downtown Wilmington, and this pier is on the ocean side of that island. Masonboro Inlet and Masonboro Island are south of the strand. Masonboro Island is undeveloped and reached by boat, so it is not the way onto the pier. For the wider town, see the <a href="/wrightsville-beach">Wrightsville Beach guide</a>.</p>
<h2>Parking</h2>
<p>The pier's FAQ says pay parking at the pier and along the side streets is operated by the town of Wrightsville Beach. It lists $6 an hour or $30 for the day, enforced from 9 a.m. to 8 p.m., seven days a week, with metered parking from March 1 through October 31. Parking questions, it says, go to the town. Follow the sign at the space you use, because the town can change a rate or a season without this page changing the same day. Beach-wide dates, without those pier rates, are on the <a href="/wilmington-nc-parking">Wilmington parking guide</a>.</p>
<h2>Hours, fees, fishing and the live cam</h2>
<p>Hours and fees stay on the pier's site. The <a href="https://johnniemercersfishingpier.com/contact/">contact page</a> and the <a href="https://johnniemercersfishingpier.com/faqs/">FAQ</a> do not state the same Friday and Saturday closing time, so this guide does not pick one and does not copy a fee table. For a fishing report, passes and rod rental, use the <a href="https://johnniemercersfishingpier.com/fishing/">fishing page</a>. The <a href="https://johnniemercersfishingpier.com/live-cam/">live cam</a> is on its own page. Nothing here embeds a camera or a video. The front door of the site is <a href="https://johnniemercersfishingpier.com/">johnniemercersfishingpier.com</a>.</p>
<section id="shop" aria-labelledby="shop-h">
<h2 id="shop-h">Wrightsville Beach goods</h2>
<p>These are ShoreList pieces, under their own names, with the price on the live shop when this page was built. They are not sold by the pier, and the pier's name is not part of the product.</p>
<ul>${shopItems}</ul>
<p>More of the shop is on the <a href="/shop">shop page</a> and the <a href="/wrightsville-beach-souvenirs">Wrightsville Beach souvenirs</a> guide. ${'We recommend ordering by December 7 for Christmas delivery. Delivery dates vary by item, and we cannot guarantee arrival by Christmas.'} Shipping cost and the delivery estimate for your address are shown at checkout.</p>
</section>
<section class="tp-faq" id="faq"><h2>Questions</h2>${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}</section>
<p class="tp-src">Sources read on 27 November 2026: the pier's <a href="https://johnniemercersfishingpier.com/">home page</a> (length, concrete pier, 2001 reopening), <a href="https://johnniemercersfishingpier.com/contact/">contact page</a> (address), and <a href="https://johnniemercersfishingpier.com/faqs/">FAQ</a> (parking). Hours, fees, the fishing page and the live cam were opened and linked, not copied.</p>
</div></div></section>
</main>
<footer class="ev-foot"><div>&copy; 2026 ShoreList LLC &middot; Wilmington, NC &amp; the Beaches</div><div><a href="/events">Events Guide</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a href="/where-to-stay">Where to Stay</a><a href="/wilmington-weather">Weather</a><a href="/guides">PDF Guides</a><a href="/prints">Art Prints</a><a href="/shipping-returns">Shipping &amp; Returns</a><a href="/size-guide">Size Guide</a><a href="/gift-guide">Gift Guide</a><a href="/wilmington-nc-gifts">Wilmington NC gifts</a><a href="/wrightsville-beach-souvenirs">Wrightsville Beach souvenirs</a><a href="/wrightsville-beach-christmas-ornament">Wrightsville Beach Christmas ornament</a><a href="/how-we-verify">How we verify</a><a href="/legal">Privacy &amp; Terms</a></div></footer>
<script data-idle="/shore-plus.js"></script>
</body>
</html>
`;

if (/<h[1-3]\b[^>]*>[^<]*(Johnnie|Mercer)/i.test(html)) throw new Error('pier name in a heading');
const shop = html.slice(html.indexOf('id="shop"'), html.indexOf('class="tp-faq"'));
if (/Johnnie|Mercer/i.test(shop)) throw new Error('pier name in the shop section');
if (/<img\b/i.test(html)) throw new Error('page should not include a photo');
if (/\u2014|\u2013|&mdash;|&ndash;/.test(html)) throw new Error('em or en dash');
if (/battleship|beach club|yacht|iframe|best-selling/i.test(html)) throw new Error('banned wording');

fs.writeFileSync(new URL('../johnnie-mercers-pier.html', import.meta.url), html);
console.log('wrote johnnie-mercers-pier.html', 'title', title.length, 'desc', desc.length);
for (const item of products) console.log(item.title, item.priceText, item.options);
