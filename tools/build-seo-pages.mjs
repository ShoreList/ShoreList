// Builds the static, indexable search pages from category.html (the template) and tools/seo-data.mjs:
//   /things-to-do/<slug>.html  one real page per category (was /things-to-do/<slug>)
//   /things-to-do/index.html   hub: things to do in Wilmington, NC and the beaches
//   /plan-your-trip.html       trip planning guide
// Run after editing category.html or the copy:  node tools/build-seo-pages.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { CATS, TOWNS, PHOTO } from './seo-data.mjs';

const SITE = 'https://shorelist.net';
const tpl = fs.readFileSync('category.html', 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’').replace(/\s+/g, ' ').trim();
const today = new Date().toISOString().slice(0, 10);

// live data from the template
const a = tpl.indexOf('var CAT_DATA='), o = tpl.indexOf('var OPS={');
const rest = tpl.slice(o + 5), m = rest.search(/\n(var |function |const |let )/);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(tpl.slice(a, o + 5 + m) + ';this.CAT_DATA=CAT_DATA;this.OPS=OPS;', ctx);
const slugs = Object.keys(ctx.CAT_DATA);
for (const s of slugs) if (!CATS[s]) throw new Error('missing copy for ' + s);

const og = (slug) => PHOTO(slug) + '_1200x630_crop_center.webp';
const ld = (o) => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const ORG = { '@type': 'Organization', name: 'ShoreList', url: SITE };

function head(html, { url, title, desc, image, extraLd }) {
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${SITE}${url}"/>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}"/>`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}"/>`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}"/>\n<meta property="og:url" content="${SITE}${url}"/>`)
    .replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="${image}"/>\n<meta name="twitter:image" content="${image}"/>`)
    .replace(/<script type="application\/ld\+json">\s*\{[^<]*"@type":"WebPage"[^<]*<\/script>/, extraLd.map(ld).join('\n'));
  if (!html.includes(`href="${SITE}${url}"`)) throw new Error('head rewrite failed ' + url);
  return html;
}

const GUIDE_CSS = `<style>
.seo{max-width:880px;margin:0 auto;padding:8px 24px 72px;color:var(--mid);font-size:1rem;line-height:1.75}
.seo h2{font-family:'Playfair Display',serif;color:var(--teal);font-size:1.7rem;line-height:1.2;margin:44px 0 14px}
.seo h3{color:var(--teal);font-size:1.05rem;margin:26px 0 6px}
.seo p{margin:0 0 14px}.seo a{color:#B93C24;font-weight:600}
.seo ul{margin:0 0 14px 20px}.seo li{margin:4px 0}
.seo .where{font-weight:600;color:var(--teal)}
.seo details{border-top:1px solid var(--border);padding:14px 0}.seo details:last-of-type{border-bottom:1px solid var(--border)}
.seo summary{cursor:pointer;font-weight:700;color:var(--teal);font-size:1.02rem}
.seo details p{margin:10px 0 0}
.seo .chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0;padding:0;list-style:none}
.seo .chips a{display:inline-block;padding:9px 16px;border:1px solid var(--border);border-radius:100px;text-decoration:none;color:var(--teal);font-size:.9rem;background:#fff}
.seo .chips a:hover{border-color:var(--coral);color:#B93C24}
.seo table{width:100%;border-collapse:collapse;margin:8px 0 18px;font-size:.95rem}
.seo th,.seo td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:top}
.seo th{color:var(--teal);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
.hub-grid{max-width:1160px;margin:0 auto;padding:40px 24px 8px}
#explore .cats-grid{display:grid}
#explore .cats-grid .cat{text-decoration:none;cursor:pointer}
#explore .cats-grid .cat::after{content:"\\2192";position:absolute}
.town-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:14px 0}
.town-row a{display:block;padding:18px;border-radius:14px;background:var(--teal);color:#fff!important;text-decoration:none;font-weight:700}
.town-row a small{display:block;font-weight:400;opacity:.8;margin-top:4px;font-size:.84rem}
@media(max-width:700px){.seo{padding:0 18px 56px}.seo h2{font-size:1.4rem}.hub-grid{padding:24px 14px 0}}
</style>`;

const chips = (links) => '<ul class="chips">' + links.map(([u, n]) => `<li><a href="${u}">${esc(n)}</a></li>`).join('') + '</ul>';
const faqHtml = (faq) => faq.map(([q, ans]) => `<details><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join('\n');
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) });
const crumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + url })) });

fs.mkdirSync('things-to-do', { recursive: true });

// ---------- category pages ----------
for (const slug of slugs) {
  const c = CATS[slug], d = ctx.CAT_DATA[slug], url = '/things-to-do/' + slug;
  const live = (ctx.OPS[slug] || []).filter((x) => x.live);
  const sub = strip(d.sub);
  const lds = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.h1, url: SITE + url, description: c.desc, inLanguage: 'en-US', dateModified: today, primaryImageOfPage: PHOTO(slug) + '_1920x.webp', isPartOf: { '@type': 'WebSite', name: 'ShoreList', url: SITE }, about: { '@type': 'Place', name: 'Wilmington, North Carolina' }, publisher: ORG },
    crumbs([['ShoreList', '/'], ['Things to Do in Wilmington, NC', '/things-to-do'], [strip(d.title), url]]),
    faqLd(c.faq),
  ];
  if (live.length) lds.push({ '@context': 'https://schema.org', '@type': 'ItemList', name: c.h1, itemListElement: live.map((x, i) => ({ '@type': 'ListItem', position: i + 1, item: Object.assign({ '@type': 'TouristTrip', name: strip(x.business), description: strip(x.desc).slice(0, 400), url: SITE + url, provider: { '@type': 'LocalBusiness', name: strip(x.operator || x.business) } }, x.priceCents ? { offers: { '@type': 'Offer', price: (x.priceCents / 100).toFixed(2), priceCurrency: 'USD', url: SITE + url, availability: 'https://schema.org/InStock' } } : {}) })) });

  let h = head(tpl, { url, title: c.title + ' | ShoreList', desc: c.desc, image: og(slug), extraLd: lds });
  h = h.replace('<body>', `<body data-cat="${slug}">`)
    .replace('<span id="hbc">Experiences</span>', `<a href="/things-to-do">Things to Do</a> &nbsp;&#8250;&nbsp; <span id="hbc">${esc(strip(d.title))}</span>`)
    .replace('<h1 class="hero-title" id="htitle">Loading...</h1>', `<h1 class="hero-title" id="htitle">${esc(c.h1)}</h1>`)
    .replace('<p class="hero-sub" id="hsub"></p>', `<p class="hero-sub" id="hsub">${esc(sub)}</p>`)
    .replace('</head>', `<script>window.__CAT=${JSON.stringify(slug)};window.__H1=${JSON.stringify(c.h1)};</script>\n${GUIDE_CSS}\n</head>`);

  const liveHtml = live.length ? `<noscript><h2>Book now on ShoreList</h2><ul>${live.map((x) => `<li><strong>${esc(strip(x.business))}</strong>${x.operator ? ' with ' + esc(strip(x.operator)) : ''}${x.price ? ' (' + esc(x.price) + ' ' + esc(x.priceLabel || '') + ')' : ''}: ${esc(strip(x.desc))}</li>`).join('')}</ul></noscript>` : '';
  const status = live.length
    ? `<p>${live.length === 1 ? 'One experience is' : live.length + ' experiences are'} bookable in this category on ShoreList right now, listed above with dates, times and secure checkout.</p>`
    : `<p>ShoreList is signing local operators in this category now. Add your email above and we will tell you when booking opens. In the meantime, the guide below will help you plan.</p>`;
  const guide = `
${liveHtml}
<section class="seo" aria-label="Guide">
  <h2>${esc(strip(d.title))} near Wilmington, NC: what to know</h2>
  <p>${esc(c.intro)}</p>
  <p class="where">Where: ${esc(c.where)}</p>
  ${status}
  <h2>Common questions</h2>
  ${faqHtml(c.faq)}
  <h2>More things to do nearby</h2>
  ${chips(c.related.map((r) => ['/things-to-do/' + r, strip(ctx.CAT_DATA[r].title)]).concat([['/things-to-do', 'All things to do']]))}
  <h3>Explore by area</h3>
  ${chips(TOWNS.map((t) => [t.url, t.name]).concat([['/plan-your-trip', 'Plan your trip'], ['/events', 'Events this week']]))}
</section>`;
  if (!h.includes('<div class="main" id="mc"></div>')) throw new Error('template main missing');
  h = h.replace('<div class="main" id="mc"></div>', '<div class="main" id="mc"></div>\n' + guide);
  fs.writeFileSync(`things-to-do/${slug}.html`, h);
}

// ---------- shell for hub + guide (template without the booking app) ----------
function shell({ url, title, desc, image, lds, bodyAttr, breadcrumb, tag, h1, sub, main }) {
  let h = head(tpl, { url, title, desc, image, extraLd: lds });
  const s1 = h.indexOf('<script>', h.indexOf('</footer>')), s2 = h.indexOf('<script src="/sound.js"');
  h = h.slice(0, s1) + h.slice(s2);                       // drop the booking scripts
  h = h.replace('<body>', `<body ${bodyAttr || ''}>`)
    .replace('<span id="hbc">Experiences</span>', breadcrumb)
    .replace('Wilmington, NC &amp; the Beaches</div>\n        <h1', `${tag}</div>\n        <h1`)
    .replace('<h1 class="hero-title" id="htitle">Loading...</h1>', `<h1 class="hero-title">${h1}</h1>`)
    .replace('<p class="hero-sub" id="hsub"></p>', `<p class="hero-sub">${sub}</p>`)
    .replace(/<div class="hero-icon" id="hico">[\s\S]*?<\/div>\n/, '')
    .replace('<div class="main" id="mc"></div>', main)
    .replace('</head>', GUIDE_CSS + '\n</head>');
  return h;
}

// ---------- hub ----------
const hubFaq = [
  ['What are the best things to do in Wilmington, NC?', 'Walk the Riverwalk and the historic district downtown, tour the Battleship North Carolina, take a river cruise at sunset, and spend a day at Wrightsville Beach, Carolina Beach or Kure Beach. Ghost tours, film location tours, surf lessons, kayak trips and fishing charters are the most popular guided experiences.'],
  ['How far are the beaches from downtown Wilmington?', 'Wrightsville Beach is about 20 minutes east of downtown. Carolina Beach is about 30 minutes south, and Kure Beach is just beyond it on the same island. Allow extra time on summer weekends.'],
  ['What is there to do in Wilmington when it rains?', 'Museums such as the Wilmington Railroad Museum, historic house tours, film location tours, and spa and wellness experiences all work in bad weather.'],
  ['Which beach near Wilmington is best?', 'Wrightsville Beach is closest and best for surfing, paddleboarding and clear water. Carolina Beach has the boardwalk, a state park and a lively family atmosphere. Kure Beach is the quietest, with a fishing pier and Fort Fisher nearby.'],
];
const hubTiles = slugs.map((s) => `<a class="cat" href="/things-to-do/${s}"><div class="cat-name">${esc(strip(ctx.CAT_DATA[s].title))}</div></a>`).join('\n      ');
const hubMain = `
<section id="explore" class="hub-grid" aria-label="Categories">
  <div class="cats-grid">
      ${hubTiles}
  </div>
</section>
<section class="seo" aria-label="Guide">
  <h2>Things to do in Wilmington, NC and the beaches</h2>
  <p>Wilmington is a river city with three ocean beaches within a half hour: Wrightsville Beach, Carolina Beach and Kure Beach. That mix is what makes it easy to plan. You can spend the morning on the sand, the afternoon in a 250-year-old historic district, and the evening on the Cape Fear River.</p>
  <p>ShoreList is the local guide and booking marketplace for the area. Every category above has its own page with what to expect, where it happens and what you can book today, and the live beach report on each beach page shows surf, tide, water temperature and an estimated flag.</p>
  <h3>Explore by area</h3>
  <div class="town-row">
    <a href="/downtown">Downtown Wilmington<small>Riverwalk, history, film locations</small></a>
    <a href="/wrightsville-beach">Wrightsville Beach<small>Surf, paddle, island life</small></a>
    <a href="/carolina-beach">Carolina Beach<small>Boardwalk, state park, fishing</small></a>
    <a href="/kure-beach">Kure Beach<small>Quiet sand, pier, Fort Fisher</small></a>
  </div>
  <h3>By type of trip</h3>
  <ul>
    <li><strong>On the water:</strong> <a href="/things-to-do/surf-lessons">surf lessons</a>, <a href="/things-to-do/paddleboard">paddleboarding</a>, <a href="/things-to-do/kayak-tours">kayak tours</a>, <a href="/things-to-do/fishing-charters">fishing charters</a>, <a href="/things-to-do/sailboat-rides">sunset sails</a>, <a href="/things-to-do/river-cruises">river cruises</a> and <a href="/things-to-do/jet-ski-rentals">jet skis</a>.</li>
    <li><strong>History and stories:</strong> <a href="/things-to-do/walking-tours">walking tours</a>, <a href="/things-to-do/ghost-tours">ghost tours</a>, <a href="/things-to-do/film-tours">film and TV location tours</a> and <a href="/things-to-do/museums">museums</a>.</li>
    <li><strong>Nature:</strong> <a href="/things-to-do/wildlife-tours">dolphin and wildlife tours</a> and <a href="/things-to-do/nature-walks">nature walks</a>, including the wild Venus flytraps at Carolina Beach State Park.</li>
    <li><strong>Getting around:</strong> <a href="/things-to-do/golf-cart-rentals">golf carts</a>, <a href="/things-to-do/ebike-rentals">e-bikes</a>, <a href="/things-to-do/bike-tours">bike tours</a>, <a href="/things-to-do/fat-bike-rentals">fat bikes</a> and <a href="/things-to-do/scooter-rentals">scooters</a>.</li>
    <li><strong>Beach day extras:</strong> <a href="/things-to-do/beach-chairs">chair and umbrella rentals</a>, <a href="/things-to-do/beach-picnics">beach picnics</a>, <a href="/things-to-do/beach-photography">beach photographers</a> and <a href="/things-to-do/wellness">yoga and wellness</a>.</li>
  </ul>
  <p>Planning the whole visit? Start with the <a href="/plan-your-trip">Wilmington trip planning guide</a>, see <a href="/events">what is on this week</a>, find <a href="/shore-picks">where locals eat</a>, or let the <a href="/planner">AI trip planner</a> build a day for you.</p>
  <h2>Common questions</h2>
  ${faqHtml(hubFaq)}
</section>`;
fs.writeFileSync('things-to-do/index.html', shell({
  url: '/things-to-do', title: 'Things to Do in Wilmington, NC & the Beaches | ShoreList',
  desc: 'Things to do in Wilmington, NC, Wrightsville Beach, Carolina Beach and Kure Beach: tours, water sports, museums, rentals and local experiences, with live beach conditions.',
  image: SITE + '/og-category.jpg',
  lds: [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Things to Do in Wilmington, NC and the Beaches', url: SITE + '/things-to-do', inLanguage: 'en-US', dateModified: today, about: { '@type': 'TouristDestination', name: 'Wilmington, North Carolina', containsPlace: ['Wrightsville Beach', 'Carolina Beach', 'Kure Beach'].map((n) => ({ '@type': 'Place', name: n })) }, publisher: ORG },
    crumbs([['ShoreList', '/'], ['Things to Do in Wilmington, NC', '/things-to-do']]),
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Things to do in Wilmington, NC', itemListElement: slugs.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: CATS[s].h1, url: SITE + '/things-to-do/' + s })) },
    faqLd(hubFaq),
  ],
  bodyAttr: 'data-cat="river-cruises"',
  breadcrumb: '<span>Things to Do</span>', tag: 'Wilmington &middot; Wrightsville &middot; Carolina &middot; Kure',
  h1: 'Things to Do in Wilmington, NC <em>&amp; the Beaches</em>',
  sub: 'Tours, water sports, museums, rentals and local experiences across downtown Wilmington, Wrightsville Beach, Carolina Beach and Kure Beach.',
  main: hubMain,
}));

// ---------- trip guide ----------
const tripFaq = [
  ['What is the best time of year to visit Wilmington, NC?', 'Late spring and early fall are the sweet spots: warm weather, swimmable water and thinner crowds. Summer is peak beach season. Spring brings the azaleas and the North Carolina Azalea Festival in April, and winter is quiet and mild, with holiday events downtown.'],
  ['How many days do you need in Wilmington?', 'Three days covers the essentials: one for downtown and the riverfront, one for Wrightsville Beach, and one for Carolina Beach, Kure Beach and Fort Fisher. A week lets you slow down and add fishing, paddling and day trips.'],
  ['Which airport do you fly into for Wilmington, NC?', 'Wilmington International Airport (ILM) is about 10 minutes from downtown and around 20 to 30 minutes from the beaches. Raleigh-Durham (RDU) is roughly two hours away by car on Interstate 40.'],
  ['Should I stay downtown or at the beach?', 'Stay downtown for restaurants, nightlife, history and walkability. Stay at Wrightsville Beach for an upscale beach base close to the city, at Carolina Beach for a classic family beach town with a boardwalk, or at Kure Beach for quiet.'],
  ['Do you need a car in Wilmington, NC?', 'Yes, for most trips. Downtown is walkable and the beach towns are easy to get around by bike or golf cart, but you will want a car to move between them.'],
  ['When is hurricane season on the North Carolina coast?', 'Atlantic hurricane season runs from June 1 to November 30, with the most activity usually in August, September and early October. Trip insurance is worth considering for those months.'],
  ['Is the ocean warm enough to swim?', 'Ocean water is warmest from June through September. ShoreList shows the current water temperature, surf and an estimated flag for each beach.'],
];
const tripMain = `
<section class="seo" aria-label="Trip guide">
  <h2>Wilmington at a glance</h2>
  <p>Wilmington sits on the Cape Fear River in southeastern North Carolina, with the Atlantic a few miles east. Visitors get a historic river city and three distinct beach towns in one trip, all within about half an hour of each other.</p>
  <table>
    <tr><th>Area</th><th>Best for</th><th>From downtown</th></tr>
    <tr><td><a href="/downtown">Downtown Wilmington</a></td><td>Riverwalk, historic district, restaurants, nightlife, film locations</td><td>You are here</td></tr>
    <tr><td><a href="/wrightsville-beach">Wrightsville Beach</a></td><td>Surfing, paddleboarding, clear water, an active island</td><td>About 20 minutes</td></tr>
    <tr><td><a href="/carolina-beach">Carolina Beach</a></td><td>Boardwalk, families, fishing charters, Carolina Beach State Park</td><td>About 30 minutes</td></tr>
    <tr><td><a href="/kure-beach">Kure Beach</a></td><td>Quiet beach days, the pier, Fort Fisher</td><td>About 35 to 40 minutes</td></tr>
  </table>

  <h2>When to go</h2>
  <ul>
    <li><strong>Spring (March to May):</strong> mild days, gardens in bloom and the North Carolina Azalea Festival in April. The ocean is still cool.</li>
    <li><strong>Summer (June to August):</strong> peak beach season, warm water and the busiest weekends. Book lodging and tours early, and expect afternoon thunderstorms.</li>
    <li><strong>Fall (September to November):</strong> warm water into October, fewer crowds and good fishing. It is also the heart of hurricane season, so keep plans flexible.</li>
    <li><strong>Winter (December to February):</strong> quiet and mild, with holiday events and lower lodging rates. A good time for downtown, museums and long beach walks.</li>
  </ul>
  <p>See <a href="/events">what is happening this week</a> before you pick dates.</p>

  <h2>Getting here and getting around</h2>
  <p>Wilmington International Airport (ILM) is about 10 minutes from downtown. By road, Interstate 40 ends in Wilmington, and Raleigh is roughly two hours away. Once you are here, downtown is walkable, and each beach town is easy by bike, <a href="/things-to-do/ebike-rentals">e-bike</a> or <a href="/things-to-do/golf-cart-rentals">golf cart</a>, but you will want a car to move between them. Beach parking is paid in season, and lots fill early on summer weekends.</p>

  <h2>A simple three-day plan</h2>
  <h3>Day 1: Downtown and the river</h3>
  <p>Start with a <a href="/things-to-do/walking-tours">guided walking tour</a> of the historic district, visit the <a href="/wilmington-railroad-museum">Wilmington Railroad Museum</a> or cross the river to the Battleship North Carolina, then take a <a href="/things-to-do/river-cruises">sunset river cruise</a>. After dark, try a <a href="/things-to-do/ghost-tours">ghost tour</a>.</p>
  <h3>Day 2: Wrightsville Beach</h3>
  <p>Check the <a href="/wrightsville-beach">live beach report</a>, then take a <a href="/things-to-do/surf-lessons">surf lesson</a> or <a href="/things-to-do/paddleboard">paddleboard</a> the sound side in the morning. In the afternoon, a <a href="/things-to-do/kayak-tours">kayak</a> or <a href="/things-to-do/wildlife-tours">wildlife tour</a> gets you out toward Masonboro Island, and a <a href="/things-to-do/sailboat-rides">sunset sail</a> ends the day.</p>
  <h3>Day 3: Carolina Beach and Kure Beach</h3>
  <p>Walk the flytrap trail at Carolina Beach State Park on a <a href="/things-to-do/nature-walks">nature walk</a>, spend midday on the sand and the boardwalk, then continue south to Kure Beach and Fort Fisher. Anglers can swap the morning for a <a href="/things-to-do/fishing-charters">fishing charter</a>.</p>
  <p>Want a plan built around your group? The <a href="/planner">ShoreList trip planner</a> builds one in seconds, and <a href="/shore-picks">Shore Picks</a> covers where to eat.</p>

  <h2>What to pack</h2>
  <p>Sun protection, a hat, sandals and a light layer for evenings on the water. For the beach, bring or rent chairs and shade: you can <a href="/things-to-do/beach-chairs">rent a setup</a> or pick up chairs, umbrellas, towels and coolers from the <a href="/shop">ShoreList Shop</a>.</p>

  <h2>Trip planning questions</h2>
  ${faqHtml(tripFaq)}

  <h2>Start planning</h2>
  ${chips([['/things-to-do', 'All things to do'], ['/events', 'Events'], ['/map', 'Map'], ['/planner', 'AI trip planner'], ['/shore-picks', 'Where to eat'], ['/shop', 'Beach gear']])}
</section>`;
fs.writeFileSync('plan-your-trip.html', shell({
  url: '/plan-your-trip', title: 'Planning a Trip to Wilmington, NC & the Beaches | ShoreList Guide',
  desc: 'Plan a trip to Wilmington, NC: when to go, where to stay, how far the beaches are, a three-day itinerary and answers to common questions, from a local guide.',
  image: 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-wb3-golden_1200x630_crop_center.webp',
  lds: [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'Planning a Trip to Wilmington, NC and the Beaches', url: SITE + '/plan-your-trip', inLanguage: 'en-US', datePublished: '2026-11-20', dateModified: today, author: ORG, publisher: ORG, about: { '@type': 'TouristDestination', name: 'Wilmington, North Carolina' } },
    crumbs([['ShoreList', '/'], ['Plan Your Trip', '/plan-your-trip']]),
    faqLd(tripFaq),
  ],
  bodyAttr: 'data-cat="sailboat-rides"',
  breadcrumb: '<span>Plan Your Trip</span>', tag: 'Local trip guide',
  h1: 'Planning a Trip to <em>Wilmington, NC</em>',
  sub: 'When to go, where to stay, how the beaches differ and a three-day plan for Wilmington, Wrightsville Beach, Carolina Beach and Kure Beach.',
  main: tripMain,
}));

console.log('built', slugs.length, 'category pages + hub + trip guide');
