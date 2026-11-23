// Builds /size-guide, /shipping-returns and /gift-guide. Run: node tools/build-store-pages.mjs
// The gift guide is generated from shop-catalog.json (read only) so every link, name and price is the catalog's.
// tools/check-site.mjs fails if a gift-guide link is not a live catalog item, so re-run this after the catalog changes.
import fs from 'node:fs';

const SITE = 'https://shorelist.net';
const MAIL = 'rj@shorelist.net';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cat = JSON.parse(fs.readFileSync(new URL('../shop-catalog.json', import.meta.url), 'utf8'));
const byId = new Map(cat.items.map((i) => [i.id, i]));

const FOOT = `<footer class="ev-foot"><div>&copy; 2026 ShoreList LLC &middot; Wilmington, NC &amp; the Beaches</div><div><a href="/events">Events Guide</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a href="/where-to-stay">Where to Stay</a><a href="/wilmington-weather">Weather</a><a href="/guides">PDF Guides</a><a href="/prints">Art Prints</a><a href="/shipping-returns">Shipping &amp; Returns</a><a href="/size-guide">Size Guide</a><a href="/gift-guide">Gift Guide</a><a href="/how-we-verify">How we verify</a><a href="/legal">Privacy &amp; Terms</a></div></footer>`;
const NAV = `<nav class="ev-nav" aria-label="Primary"><a class="nav-logo" href="/" aria-label="ShoreList home">Shore<span>List</span></a><div class="nav-right"><a href="/shop">Shop</a><a href="/events">Events</a><a href="/things-to-do">Things to Do</a><a class="nav-book" href="/things-to-do">Book Experiences</a></div></nav>`;

function page({ slug, title, desc, eye, h1, lede, body, ld = [], wide = false, ogImage = `${SITE}/og-home.jpg` }) {
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ShoreList', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: SITE + '/shop' },
    { '@type': 'ListItem', position: 3, name: eye, item: `${SITE}/${slug}` }] };
  const lds = [crumbs, ...ld].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
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
<meta property="og:image" content="${ogImage}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:image" content="${ogImage}"/>
<link rel="icon" href="/favicon.ico"/><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
<script>document.documentElement.className+=' js'</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EN91RH3PZV"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-EN91RH3PZV');</script>
<link rel="manifest" href="/manifest.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
${lds}
<link rel="stylesheet" href="/events.css"/>
<link rel="stylesheet" href="/luxe.css"/>
<link rel="stylesheet" href="/store-pages.css"/>
<script src="/luxe.js" defer></script>
</head>
<body class="ev-page">
<a class="skip-link" href="#main">Skip to content</a>
${NAV}
<main id="main">
<header class="ev-hero ev-hero-sub">
  <div class="ev-wrap">
    <p class="ev-eye"><i></i>${esc(eye)}</p>
    <h1>${h1}</h1>
    <p class="ev-lede">${lede}</p>
  </div>
</header>
<section id="events-feed" aria-label="${esc(eye)}">
<div class="ef-in"><div class="tp-in${wide ? ' gg-wide' : ''}">
${body}
</div></div></section>
</main>
${FOOT}
<script src="/shore-plus.js" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- size guide
// Source for the chart: the garment maker's published spec sheet for the 9.5 oz fleece crewneck (style 1566), read via
// SanMar's spec sheet page on 2026-11-21 and matched by a second spec sheet (style 1567). Chart applies to the embroidered crewnecks only. Brand names stay out of customer copy.
const fleece = [
  ['S', '21', '27&frac12;'], ['M', '23', '28&frac12;'], ['L', '25', '29&frac12;'],
  ['XL', '26&frac12;', '30&frac12;'], ['2XL', '28', '31&frac12;'], ['3XL', '29&frac12;', '32&frac12;'],
];
const around = ['42', '46', '50', '53', '56', '59'];
const sizeTable = `<div class="tp-tbl" role="region" aria-label="Size chart, scrolls sideways on small screens" tabindex="0"><table>
<caption>Embroidered crewnecks, garment measurements in inches</caption>
<thead><tr><th scope="col">Size</th><th scope="col">Chest, flat</th><th scope="col">Chest, around</th><th scope="col">Length</th></tr></thead>
<tbody>
${fleece.map((r, i) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${around[i]}</td><td>${r[2]}</td></tr>`).join('\n')}
</tbody></table></div>`;

const sizeBody = `<h2>How to measure</h2>
<p>The most reliable method is also the least glamorous. Lay a crewneck or sweatshirt you already like flat on a bed, and measure it the way the chart does.</p>
<ul>
<li><strong>Chest, flat.</strong> Straight across the chest, one inch below the underarm seam.</li>
<li><strong>Length.</strong> From the high point of the shoulder, beside the collar, down the back to the hem.</li>
</ul>
<p>Match those numbers to the chart. If you land between two sizes, choose by the garment you love, not by the size on its tag.</p>

<h2>Embroidered crewnecks</h2>
<p>These are garment measurements: the piece laid flat, not your body. Chest, around is simply the flat width doubled, so you can compare it to a tape measure worn around the chest with room to move.</p>
${sizeTable}
<p class="tp-src">Source: the garment maker&rsquo;s published spec sheet, in inches, garment laid flat. The sheet gives no sleeve length, so we do not show one. Checked November 21, 2026.</p>
<p class="tp-note">Allow about an inch either way. The pieces are garment-dyed, which means they are dyed after they are sewn, so color and size both move a little from one piece to the next.</p>
<p class="tp-src">This chart is for the four embroidered crewnecks. If a product page shows its own size information, that page wins.</p>

<h2>Everything else</h2>
<p>Corduroy caps, cuffed beanies, tees and caps from ShoreList Gear, totes and beach gear do not have a chart here yet. We would rather leave a gap than print a number we could not source to the maker. Sizing for each piece is shown on its product page.</p>
<p>If it is not there, or you are deciding between two sizes, write to us with the piece and your usual size, and we will answer with what we can confirm.</p>
<p><a class="tp-mail" href="mailto:${MAIL}?subject=Fit%20question">Ask about fit: ${MAIL}</a></p>

<h2>Made to order, so ask first</h2>
<p>Every piece is made after you order. A size swap after the fact is not something we can promise, which is why a fit question beforehand is welcome. The <a href="/shipping-returns">shipping and returns page</a> explains what we can do when something arrives wrong.</p>`;

// ------------------------------------------------------- shipping and returns
const faq = [
  ['How long does an order take?', 'Every piece is made after you order, and production begins after checkout. For ShoreList Shop items, our print partner says most orders ship within 2 to 7 business days after the order is submitted, then transit time applies. Production time for ShoreList Gear items depends on the product and the fulfillment partner. The shipping method, cost and estimated delivery for your address are shown at checkout.'],
  ['Can I return something because I changed my mind or ordered the wrong size?', 'Because each piece is made to order, neither ShoreList Gear nor ShoreList Shop accepts returns for a change of mind or a size preference. A size exchange applies only if the wrong size was sent. Customers in the EU, EEA or UK may have statutory withdrawal rights, which this policy does not limit.'],
  ['What if my order arrives damaged, defective or misprinted?', 'Write to rj@shorelist.net with your order number and photos, and we will arrange a replacement at no cost. Report it within 30 days of delivery on both ShoreList Gear and ShoreList Shop orders.'],
  ['Do digital guides and prints ship?', 'No. PDF guides and art print files are downloads, and 7 percent North Carolina sales tax is added at checkout. If a file is missing or will not open, email rj@shorelist.net.'],
];
const shipBody = `<ul class="tp-short">
<li><strong>Made after you order.</strong>Nothing is printed or stitched until you buy. That is why we cannot restock a returned piece, and why we say so up front.</li>
<li><strong>Two stores, two orders.</strong>ShoreList Shop and ShoreList Gear each take their own order and ship it on its own.</li>
<li><strong>The cost, before you pay.</strong>Shipping and tax are calculated at checkout and shown before you confirm.</li>
<li><strong>Problems get fixed.</strong>If a piece arrives damaged, defective or misprinted, write to us with photos and we will replace it.</li>
</ul>

<h2>Two stores</h2>
<p>ShoreList Shop carries the embroidered apparel, the beach gear, the can coolers and the ornaments. ShoreList Gear carries the art prints and the printed apparel. Every product on the <a href="/shop">shop page</a> links to the store that sells it, and each store takes its own checkout. Buy from both and you get two orders, which may arrive on different days.</p>

<h2>How long it takes</h2>
<p><strong>Production.</strong> Production begins after checkout. For ShoreList Shop items, our print partner states that most orders ship within 2 to 7 business days after the order is submitted. For ShoreList Gear items, production time depends on the product and the fulfillment partner, so we do not quote a number for them.</p>
<p><strong>Delivery.</strong> Transit time depends on where you are. The shipping method, cost and estimated delivery for your address are shown at checkout, before you pay.</p>
<p><strong>If it goes quiet.</strong> If your order shows no update after 7 business days, write to us and we will find out why.</p>
<p><strong>Gifts.</strong> We do not publish holiday order-by dates, because we cannot source one from our partners. The estimate at checkout is the one to trust.</p>

<h2>Changes, split orders and addresses</h2>
<ul>
<li>On ShoreList Gear orders, the shipping method and timing cannot be changed after the order is placed, and an order with several items may arrive in more than one parcel.</li>
<li>Check your address before you pay. Our print partners do not replace packages lost because of an incorrect address.</li>
</ul>

<h2>Returns and replacements</h2>
<h3>Damaged, defective or misprinted</h3>
<p>Write to <a href="mailto:${MAIL}">${MAIL}</a> as soon as you notice, with your order number and photos of the problem. We will arrange a replacement at no cost. Please report it within 30 days of delivery, for both ShoreList Gear and ShoreList Shop orders. Wrong size or wrong item sent also counts. Misprints, faded or smeared designs and damage that affected the piece all count.</p>
<p>Some things are not defects. Garment-dyed pieces vary slightly in color from one to the next, ink on dark fabric can read softer than it does on a screen, and a measurement within about 1 inch of the size guide is within tolerance.</p>
<h3>Change of mind and size swaps</h3>
<p>Because every piece is made after you order, we do not accept returns for a change of mind or a size preference, on either store. A size exchange applies only if the wrong size was sent. Customers in the EU, EEA or UK may have statutory withdrawal rights, which this policy does not limit. A question about fit costs nothing, and the <a href="/size-guide">size guide</a> is the better first step.</p>
<h3>Guides and prints</h3>
<p>The PDF guides and art print files are downloads, and nothing ships. Seven percent North Carolina sales tax is added at checkout. If a file is missing or will not open, email <a href="mailto:${MAIL}">${MAIL}</a>.</p>

<h2>Contact</h2>
<p>One inbox, read by the person who runs the store.</p>
<p><a class="tp-mail" href="mailto:${MAIL}?subject=Order%20question">${MAIL}</a></p>

<hr class="tp-rule"/>
<p class="tp-src">Production and shipping notes come from the public help pages of our fulfillment partners, read November 21, 2026: <a href="https://help.fourthwall.com/manage-my-shop/shop-settings/change-shipping-options" rel="noopener">Fourthwall on shipping options</a>, <a href="https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/returns-refunds-and-quality-issues" rel="noopener">Fourthwall on returns and quality issues</a> and <a href="https://help.printify.com/hc/en-us/articles/4483629751825-What-are-Printify-s-production-times-like" rel="noopener">Printify on production times</a>.</p>`;

// ----------------------------------------------------------------- gift guide
const giftFaq = [
 [
  "What is a good gift from Wilmington NC?",
  "Something that carries the town: an embroidered crewneck, beanie or cap with a Wrightsville Beach or Kure Beach icon, a Christmas ornament, or an art print of a Wrightsville Beach sunset or the Carolina Beach boardwalk. The gift guide sorts them by who is getting them."
 ],
 [
  "Are there Wilmington NC gifts under $20?",
  "Yes. The Wrightsville Beach, Carolina Beach and Kure Beach ornaments and the can coolers are in the Under $20 section, at the prices shown on this page."
 ],
 [
  "Will a gift arrive in time for the holidays?",
  "Every piece is made to order, and we do not publish holiday order-by dates. Shipping and the estimated delivery for your address are shown at checkout, before you pay."
 ],
 [
  "Is there a gift that does not need shipping?",
  "Yes. The PDF guides are $14 each and the art prints are $12 each as print-ready files. Both download after checkout, and 7 percent North Carolina sales tax is added."
 ],
 [
  "Can I return a gift if it does not fit?",
  "Because each piece is made after you order, we cannot take returns for a change of mind or size preference. Damaged, defective, misprinted or wrong-size pieces are replaced at no cost when reported within 30 days of delivery. See <a href=\"/shipping-returns\">shipping and returns</a>."
 ]
];
const sections = [
  { id: 'under-20', h: 'Under $20: hosts, neighbors, stocking stuffers', p: 'Small, specific and about a town. The ornament is the keepsake. The can cooler is the one that actually goes on the boat.',
    ids: ['wrightsville-ornament-2026', 'carolina-beach-ornament-2026', 'kure-beach-ornament-2026', 'wrightsville-can-cooler', 'carolina-beach-can-cooler', 'kure-beach-can-cooler'] },
  { id: 'for-the-wall', h: 'For the wall', p: 'A print of the right stretch of coast beats a postcard. Each is made to order and sold through ShoreList Gear.',
    ids: ['carolina-beach-boardwalk-art-print', 'wrightsville-beach-pier-art-print'] },
  { id: 'wears-the-town', h: 'For the person who wears their town', p: 'A small embroidered icon and a town code, stitched on a garment-dyed crewneck. Sizing help is on the <a href="/size-guide">size guide</a>, and a fit question to us is welcome.',
    ids: ['the-sloop-embroidered-crewneck-wrightsville-beach', 'the-blue-crab-embroidered-crewneck-kure-beach', ] },
  { id: 'hats', h: 'Beanies and caps', p: 'Smaller than a sweatshirt, and the same stitched icon. Check each product page for sizing.',
    ids: ['the-sloop-cuffed-beanie-wrightsville-beach', 'the-blue-crab-cuffed-beanie-kure-beach', 'the-sloop-corduroy-cap-wrightsville-beach', 'the-blue-crab-corduroy-cap-kure-beach', ] },
  { id: 'beach-day', h: 'For the beach-day household', p: 'A towel for the sand and a tote for the walk down.',
    ids: ['carolina-coast-towel', 'salt-wash-market-tote'] },
];
const price = (i) => `${i.from ? 'From ' : ''}$${i.price}`;
const card = (i) => `<li><a href="${esc(i.url)}" data-item-id="${esc(i.id)}"><img src="${esc(i.img)}" alt="${esc(i.alt)}" width="800" height="1000" loading="lazy" decoding="async"/><span class="gg-name">${esc(i.name)}</span><span class="gg-price">${price(i)}</span><span class="gg-line">${esc(i.meta)}</span></a></li>`;
const used = [];
const giftSections = sections.map((s) => {
  const items = s.ids.map((id) => byId.get(id)).filter(Boolean); // an item that left the catalog drops out of the guide; it returns when it is back in items[]
  if (!items.length) return '';
  items.forEach((i) => used.push(i));
  return `<section class="gg-sec" id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h">${s.h}</h2><p>${s.p}</p><ul class="gg-grid">${items.map(card).join('')}</ul></section>`;
}).filter(Boolean).join('\n');
const giftFaqHtml = `<section class="tp-faq" id="faq"><h2>Gift questions</h2>${giftFaq.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join('')}</section>`;
const giftBody = `<p>Prices and links come straight from the shop, so what you see here is what you pay before shipping and tax. Everything is made to order. Shipping and delivery estimates for your address are shown at checkout, and the <a href="/shipping-returns">shipping and returns page</a> covers the rest. We do not publish holiday order-by dates.</p>
${giftSections}
<section class="gg-sec" id="no-shipping" aria-labelledby="ns-h"><h2 id="ns-h">Nothing to ship</h2>
<p>For a visitor coming to town, the <a href="/guides">PDF guides</a> are $14 each and download right after checkout, including Wilmington Holidays 2026. The <a href="/prints">art prints</a> are $12 each as print-ready files. Seven percent North Carolina sales tax is added at checkout on both.</p></section>
${giftFaqHtml}
${used.length ? '<p class="tp-src">Everything above is listed in the <a href="/shop">full shop</a>.</p>' : '<p class="tp-src">The shop has no pieces listed right now. The <a href="/shop">shop page</a> shows what is available.</p>'}`;
const giftLd = !used.length ? null : { '@context': 'https://schema.org', '@type': 'ItemList', name: 'ShoreList gift guide', itemListElement: used.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.name, url: i.url })) };

const out = {
  'size-guide.html': page({ slug: 'size-guide', title: 'Size Guide | ShoreList Shop', desc: 'Garment measurements for ShoreList embroidered crewnecks in inches, how to measure a piece you own, and who to ask when a size is not listed.', eye: 'Size guide', h1: 'Fit, <em>measured</em>', lede: 'Every piece is made to order, so the right size matters. Here are the real numbers where we have them, and a straight answer where we do not.', body: sizeBody }),
  'shipping-returns.html': page({ slug: 'shipping-returns', title: 'Shipping and Returns | ShoreList Shop', desc: 'How ShoreList orders are made, how long they take, and what happens if a piece arrives damaged, defective or misprinted. Plain answers, nothing buried.', eye: 'Shipping and returns', h1: 'Shipping &amp; returns, <em>plainly</em>', lede: 'Made to order, shipped by our partners, fixed if it arrives wrong. Here is exactly how that works.', body: shipBody,
    ld: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] }),
  'gift-guide.html': page({ slug: 'gift-guide', title: 'Coastal Carolina Gift Guide | ShoreList Shop', desc: 'A short gift guide by recipient, from under $20 stocking stuffers to beach-day gear, drawn from the ShoreList shop at its current prices.', eye: 'Gift guide', h1: 'Gifts for people who <em>love the coast</em>', lede: 'This Wilmington NC gift guide sorts coastal Carolina gifts by who is getting them: ornaments and can coolers under $20, art prints of local piers, embroidered crewnecks, beanies and caps, and beach-day gear. Every item is in the shop today at its current price, and everything is made to order.', body: giftBody, ld: [...(giftLd ? [giftLd] : []), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: giftFaq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) }], wide: true }),
};

// ------------------------------------------------------------ town shop pages
// /shop/<town> landing pages for ads and social links. Built from shop-catalog.json: the shelves[] with town:true are the towns,
// an item lands on a town by item.town, then by a town name in its name, then by item.shelf, else on Wilmington and the Coast.
// Nothing here is typed per product, so new catalog items appear after a rebuild. Links carry UTM tags for campaign tracking.
const TOWN_COPY = {
  'wrightsville-beach': {
    title: 'Wrightsville Beach Souvenirs and Apparel | ShoreList',
    desc: 'Wrightsville Beach NC souvenirs from the ShoreList Shop: a printed sloop pattern tote, mug, pillow, pouch and tea towel, plus a can cooler. Made to order.',
    h1: 'Wrightsville Beach souvenirs, <em>made to order</em>',
    lede: 'The ShoreList Shop sells Wrightsville Beach NC souvenirs and gifts, each with one small, understated mark: the sloop, for sailing days and marina evenings. A sloop pattern tote, mug, pillow, pouch, tea towel and pet bandana, embroidered crewnecks and caps, and a can cooler, all made to order.',
    about: 'The sloop is the Wrightsville Beach mark. It is stitched small on the apparel and repeats as a quiet navy pattern on the tote, mug, pillow, pouch and tea towel, never as a big souvenir graphic.',
    q: ['What is the Wrightsville Beach mark?', 'A small sloop under sail. On apparel it is stitched small, and on home and beach goods it repeats as a navy pattern.'] },
  'carolina-beach': {
    title: 'Carolina Beach Souvenirs, Apparel and Gifts | ShoreList',
    desc: 'Carolina Beach NC souvenirs and gifts from the ShoreList Shop: an embroidered crewneck, a printed tee, mug, pouch and pillow, and a can cooler. Made to order.',
    h1: 'Carolina Beach souvenirs and <em>beach gifts</em>',
    lede: 'The ShoreList Shop sells Carolina Beach NC souvenirs and gifts with one small mark, the lifeguard stand: an embroidered crewneck, a printed tee, mug, pouch and pillow, and a can cooler. Everything is made to order.',
    about: 'Carolina Beach is on Pleasure Island, and its mark is the lifeguard stand on the sand. New Carolina Beach pieces are added to this page as they join the shop.',
    q: ['What is the Carolina Beach mark?', 'A small lifeguard stand with a red flag and the town name, stitched on the crewneck and printed on the tee, mug, pouch and pillow.'] },
  'kure-beach': {
    title: 'Kure Beach Souvenirs, Apparel and Gifts | ShoreList',
    desc: 'Kure Beach NC souvenirs and gifts from the ShoreList Shop: an embroidered crewneck, a printed tee, tote, mug and pillow, and a can cooler.',
    h1: 'Kure Beach souvenirs with the <em>lifeguard stand</em>',
    lede: 'The ShoreList Shop sells Kure Beach NC souvenirs and gifts with one small mark, the lifeguard stand: an embroidered crewneck, a printed tee, tote, mug, pouch and pillow, and a can cooler, all made to order.',
    about: 'The lifeguard stand is the Kure Beach mark, stitched small on the crewneck and kept modest on the printed pieces. New Kure Beach pieces are added to this page as they join the shop.',
    q: ['What is the Kure Beach mark?', 'A small lifeguard stand with a red flag and the town name, stitched on the chest of the white crewneck.'] },
  wilmington: {
    title: 'Wilmington NC Souvenirs and Beach Gear | ShoreList',
    desc: 'Wilmington NC souvenirs and beach gear from the ShoreList Shop: a live oak crewneck and a beach towel, made to order.',
    h1: 'Wilmington NC souvenirs and <em>beach gear</em>',
    lede: 'These Wilmington NC souvenirs and beach goods belong to the whole coast rather than one beach: an embroidered live oak crewneck and the Carolina Coast terry beach towel. Everything is made to order.',
    about: 'Pieces for the whole coast live here. For a single beach, start with Wrightsville Beach, Carolina Beach or Kure Beach.',
    q: ['Where do the beach towel and tote ship from?', 'Everything is made to order by our print partners. Shipping method, cost and the estimate for your address are shown at checkout.'] },
};
const shopTowns = (cat.shelves || []).filter((s) => s.town);
const townIds = new Set(shopTowns.map((s) => s.id));
const townOfItem = (i) => {
  if (i.town && townIds.has(i.town)) return i.town;
  const n = `${i.name} ${i.id}`.toLowerCase();
  if (/wrightsville/.test(n) && townIds.has('wrightsville-beach')) return 'wrightsville-beach';
  if (/carolina[ -]beach/.test(n) && townIds.has('carolina-beach')) return 'carolina-beach';
  if (/kure/.test(n) && townIds.has('kure-beach')) return 'kure-beach';
  if (i.shelf && townIds.has(i.shelf)) return i.shelf;
  return townIds.has('wilmington') ? 'wilmington' : shopTowns[0]?.id;
};
const townFaqShared = [
  ['Is everything made to order?', 'Yes. Every piece is made after you order, so allow production time before it ships. The <a href="/shipping-returns">shipping and returns page</a> has the details.'],
  ['How does checkout work?', 'Pieces from ShoreList Shop go in your bag and check out together on Shopify. A few pieces are sold through our second store, ShoreList Gear, and check out there. Shipping and tax are shown before you pay.'],
  ['What if something arrives wrong?', 'If a piece arrives damaged, defective, misprinted or in the wrong size, we replace it at no cost when you report it within 30 days of delivery. Made-to-order pieces cannot be returned for a change of mind or size preference.'],
];
fs.mkdirSync(new URL('../shop/', import.meta.url), { recursive: true });
const townOut = [];
for (const t of shopTowns) {
  const c = TOWN_COPY[t.id];
  if (!c) continue; // a new town needs its TOWN_COPY entry before it gets a page
  const items = cat.items.filter((i) => townOfItem(i) === t.id || i.alsoTown === t.id);
  if (!items.length) continue;
  const utm = `utm_source=shorelist.net&utm_medium=landing&utm_campaign=shop-${t.id}`;
  const link = (u) => u + (u.includes('?') ? '&' : '?') + utm;
  const tcard = (i) => `<li><a href="${esc(link(i.url))}" data-item-id="${esc(i.id)}" rel="noopener"><img src="${esc(i.img)}" alt="${esc(i.alt)}" width="800" height="1000" loading="lazy" decoding="async"/><span class="gg-name">${esc(i.name)}</span><span class="gg-price">${price(i)}</span><span class="gg-line">${esc(i.meta)}</span></a></li>`;
  const faqs = [[c.q[0], c.q[1]], ...townFaqShared];
  const others = shopTowns.filter((x) => x.id !== t.id && TOWN_COPY[x.id]).map((x) => `<a href="/shop/${x.id}">${esc(x.name)}</a>`).join(', ');
  const body = `<section class="gg-sec" id="pieces" aria-labelledby="pieces-h"><h2 id="pieces-h">${esc(t.name)} pieces</h2><p>${c.about}</p><ul class="gg-grid">${items.map(tcard).join('')}</ul></section>
<section class="gg-sec" id="more" aria-labelledby="more-h"><h2 id="more-h">More from the shop</h2><p>Browse every town and filter by product type or motif on the <a href="/shop?town=${t.id}">full shop page</a>, shop by recipient in the <a href="/gift-guide">gift guide</a>, or see ${others}. We are adding new pieces for each town, so check back or join the drop list on the shop page. Prices are shown before shipping and tax, and everything is made to order.</p></section>
<section class="tp-faq" id="faq"><h2>Questions</h2>${faqs.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join('')}</section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'ItemList', name: `ShoreList ${t.name} shop`, itemListElement: items.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.name, url: i.url })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) }];
  out[`shop/${t.id}.html`] = page({ slug: `shop/${t.id}`, title: c.title, desc: c.desc, eye: t.name, h1: c.h1, lede: c.lede, body, ld, wide: true, ogImage: `${SITE}/og-shop-${t.id}.jpg` });
  townOut.push(t.id);
}

for (const [f, h] of Object.entries(out)) fs.writeFileSync(new URL('../' + f, import.meta.url), h);
console.log('wrote', Object.keys(out).join(', '), `(${used.length} gift items)`);
