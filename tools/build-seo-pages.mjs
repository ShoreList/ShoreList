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
const app = fs.readFileSync('category-app.js', 'utf8'); // booking app + live data (CAT_DATA, OPS)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’').replace(/\s+/g, ' ').trim();
const today = new Date().toISOString().slice(0, 10);

// live data from the template
const a = app.indexOf('var CAT_DATA='), o = app.indexOf('var OPS={');
const rest = app.slice(o + 5), m = rest.search(/\n(var |function |const |let )/);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(app.slice(a, o + 5 + m) + ';this.CAT_DATA=CAT_DATA;this.OPS=OPS;', ctx);
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

// All styling for these pages lives in category.css ("Page frame v2"). Nothing is inlined here.
const HERO_OPEN = '<section class="hero" aria-label="Page header">';
if (!tpl.includes(HERO_OPEN)) throw new Error('template hero missing');
// photo hero: a real <img> (so it can be prioritised and sized) under a navy overlay
const heroOpen = (slug, extra = '') => `<section class="hero ph${extra}" aria-label="Page header">
  <img class="hero-photo" src="${PHOTO(slug)}_1920x.webp" srcset="${PHOTO(slug)}_1000x.webp 1000w, ${PHOTO(slug)}_1920x.webp 1920w" sizes="100vw" width="1920" height="1072" alt="" fetchpriority="high" decoding="async"/>`;
const title = (slug) => strip(ctx.CAT_DATA[slug].title);
const thumb = (slug, w, h, alt, sizes) => `<img src="${PHOTO(slug)}_${w}x${h}_crop_center.webp"${sizes ? ` srcset="${PHOTO(slug)}_${w}x${h}_crop_center.webp ${w}w, ${PHOTO(slug)}_${w * 2}x${h * 2}_crop_center.webp ${w * 2}w" sizes="${sizes}"` : ''} width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async"/>`;
const ico = (id) => `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="#i-${id}"/></svg>`;
const tile = ([u, name, small, icon, cls]) => `<li><a class="tile${cls ? ' ' + cls : ''}" href="${u}">${ico(icon)}<span><b>${esc(name)}</b><small>${esc(small)}</small></span></a></li>`;
const PHOTO_NOTE = '<p class="ph-note">Photos set the scene and may not show the exact tour, operator or location.</p>';
// live weather chip: static link text first, replaced by a live reading when beachwx.js answers
const WX_CHIP = '<a class="wx-chip" id="wxchip" href="/wilmington-weather"><i aria-hidden="true"></i><span>Live weather and beach report</span><b aria-hidden="true">&rarr;</b></a>';
const WX_SCRIPT = `<script>
window.addEventListener('load',function(){var c=document.getElementById('wxchip');if(!c||!window.ShoreWX)return;
window.ShoreWX.get(0).then(function(x){if(x==null||x.temp==null)return;var t='Wrightsville Beach now: '+Math.round(x.temp)+'°F, wind '+Math.round(x.wind||0)+' mph'+(x.waveFt!=null?', surf '+x.waveFt.toFixed(1)+' ft':'');c.querySelector('span').textContent=t;}).catch(function(){});});
</script>`;

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

  let h = head(tpl, { url, title: c.title.length > 50 ? c.title : c.title + ' | ShoreList', desc: c.desc, image: og(slug), extraLd: lds });
  h = h.replace('<body>', `<body data-cat="${slug}">`)
    .replace(HERO_OPEN, heroOpen(slug))
    .replace('<span id="hbc">Experiences</span>', `<a href="/things-to-do">Things to Do</a> &nbsp;&#8250;&nbsp; <span id="hbc">${esc(strip(d.title))}</span>`)
    .replace('<h1 class="hero-title" id="htitle">Loading...</h1>', `<h1 class="hero-title" id="htitle">${esc(c.h1)}</h1>`)
    .replace('<p class="hero-sub" id="hsub"></p>', `<p class="hero-sub" id="hsub">${esc(sub)}</p>`)
    .replace('</head>', `<script>window.__CAT=${JSON.stringify(slug)};window.__H1=${JSON.stringify(c.h1)};</script>\n</head>`);

  const ops = ctx.OPS[slug] || [];
  const liveHtml = live.length ? `<noscript><h2>Book now on ShoreList</h2><ul>${live.map((x) => `<li><strong>${esc(strip(x.business))}</strong>${x.operator ? ' with ' + esc(strip(x.operator)) : ''}${x.price ? ' (' + esc(x.price) + ' ' + esc(x.priceLabel || '') + ')' : ''}: ${esc(strip(x.desc))}</li>`).join('')}</ul></noscript>` : '';
  const status = live.length
    ? `<p>${live.length === 1 ? 'One experience is' : live.length + ' experiences are'} bookable in this category on ShoreList right now, listed above with dates, times and secure checkout.</p>`
    : `<p>ShoreList is signing local operators in this category now. Add your email above and we will tell you when booking opens. In the meantime, the guide below will help you plan.</p>`;
  // facts row: status comes from the same live data the booking app renders
  const fact = live.length
    ? ['on', 'Bookable now', (live.length === 1 ? '1 experience' : live.length + ' experiences') + ' with dates, times and secure checkout', 'Book']
    : slug === 'museums'
      ? ['', 'Partner listing', 'Tickets, hours and events on the partner page', 'See listing']
      : ops.length
        ? ['', 'Waitlist open', 'Bookings open soon. Join the early list on this page', 'Join the list']
        : ['', 'Waitlist open', 'Not bookable yet. Leave your email to hear when it opens', 'Get notified'];
  const facts = `
<div class="facts" aria-label="At a glance">
  <div class="facts-in">
    <div class="fact"><span class="fact-k">Where it happens</span><span class="fact-v">${esc(c.where)}</span></div>
    <div class="fact"><span class="fact-k">On ShoreList</span><span class="fact-v"><span class="fact-s${fact[0] ? ' on' : ''}">${fact[1]}</span><small>${fact[2]}.</small></span></div>
    <div class="fact"><span class="fact-k">On this page</span><span class="fact-links"><a class="fl-go" href="#mc">${fact[3]}</a><a href="#guide">Guide</a><a href="#faq">Questions</a></span></div>
  </div>
</div>
`;
  const guide = `
${liveHtml}
<section class="seo-band" id="guide" aria-label="Guide">
<div class="seo">
  <div class="seo-cols">
    <div>
      <p class="pg-eye">Local guide</p>
      <h2>${esc(strip(d.title))} near Wilmington, NC: what to know</h2>
      <p>${esc(c.intro)}</p>
      <p class="where">Where: ${esc(c.where)}</p>
      ${status}
    </div>
    <div id="faq">
      <p class="pg-eye">Before you go</p>
      <h2>Common questions</h2>
      ${faqHtml(c.faq)}
    </div>
  </div>
  <div class="seo-more">
    <p class="pg-eye">Keep exploring</p>
    <h2>More things to do nearby</h2>
    <ul class="rel">
      ${c.related.map((r) => `<li><a href="/things-to-do/${r}">${thumb(r, 480, 360, title(r) + ' near Wilmington, NC')}<span>${esc(title(r))}</span></a></li>`).join('\n      ')}
      <li><a class="all" href="/things-to-do"><span>All things to do</span></a></li>
    </ul>
    <h3>Explore by area</h3>
    ${chips(TOWNS.map((t) => [t.url, t.name]).concat([['/plan-your-trip', 'Plan your trip'], ['/events', 'Events this week']]))}
    ${PHOTO_NOTE}
  </div>
</div>
</section>`;
  if (!h.includes('<div class="main" id="mc"></div>')) throw new Error('template main missing');
  h = h.replace('<div class="main" id="mc"></div>', facts + '\n<div class="main" id="mc"></div>\n' + guide);
  fs.writeFileSync(`things-to-do/${slug}.html`, h);
}

// ---------- shell for hub + guide (template without the booking app) ----------
function shell({ url, title, desc, image, lds, photo, heroExtra, breadcrumb, tag, h1, sub, main, scripts }) {
  let h = head(tpl, { url, title, desc, image, extraLd: lds });
  const s1 = h.indexOf('<script src="/category-app.js">', h.indexOf('</footer>')), s2 = h.indexOf('<script src="/sound.js"');
  if (s1 < 0 || s2 < 0) throw new Error('template scripts missing');
  h = h.slice(0, s1) + h.slice(s2);                       // drop the booking scripts
  h = h.replace('<script src="/directory.js" defer></script>\n', (scripts || ''));   // local directory is for category pages only
  for (const [a, b] of [
    ['<body>', '<body class="pg">'],
    [HERO_OPEN, heroOpen(photo, ' tall')],
    ['<span id="hbc">Experiences</span>', breadcrumb],
    ['Wilmington, NC &amp; the Beaches</div>\n        <h1', `${tag}</div>\n        <h1`],
    ['<h1 class="hero-title" id="htitle">Loading...</h1>', `<h1 class="hero-title">${h1}</h1>`],
    ['<p class="hero-sub" id="hsub"></p>', `<p class="hero-sub">${sub}</p>`],
    ['<div class="hero-meta" id="hmeta"></div>', heroExtra || ''],
    ['<div class="main" id="mc"></div>', main],
  ]) { if (!h.includes(a)) throw new Error('template marker missing: ' + a.slice(0, 40)); h = h.replace(a, b); }
  h = h.replace(/<div class="hero-icon" id="hico">[\s\S]*?<\/div>\n/, '');
  if (/category-app\.js|directory\.js/.test(h)) throw new Error('shell must not load the booking app');
  return h;
}

// ---------- hub ----------
const hubFaq = [
  ['What are the best things to do in Wilmington, NC?', 'Walk the Riverwalk and the historic district downtown, tour the Battleship North Carolina, take a river cruise at sunset, and spend a day at Wrightsville Beach, Carolina Beach or Kure Beach. Ghost tours, film location tours, surf lessons, kayak trips and fishing charters are the most popular guided experiences.'],
  ['How far are the beaches from downtown Wilmington?', 'Wrightsville Beach is about 20 minutes east of downtown. Carolina Beach is about 30 minutes south, and Kure Beach is just beyond it on the same island. Allow extra time on summer weekends.'],
  ['What is there to do in Wilmington when it rains?', 'Museums such as the Wilmington Railroad Museum, historic house tours, film location tours, and spa and wellness experiences all work in bad weather.'],
  ['Which beach near Wilmington is best?', 'Wrightsville Beach is closest and best for surfing, paddleboarding and clear water. Carolina Beach has the boardwalk, a state park and a lively family atmosphere. Kure Beach is the quietest, with a fishing pier and Fort Fisher nearby.'],
];
// Directory groups: how visitors think about the day. Every category must appear exactly once.
const GROUPS = [
  ['tours-and-history', 'Tours and history', 'Walking tours, ghost tours, film locations and museums.', ['walking-tours', 'ghost-tours', 'film-tours', 'museums']],
  ['on-the-water', 'On the water', 'Surf, paddle, fish, sail and cruise.', ['surf-lessons', 'kayak-tours', 'paddleboard', 'fishing-charters', 'sailboat-rides', 'river-cruises', 'jet-ski-rentals']],
  ['on-the-sand', 'On the sand', 'Beach day setups, picnics, photos and wellness.', ['beach-chairs', 'beach-picnics', 'beach-photography', 'wellness']],
  ['nature-and-wildlife', 'Nature and wildlife', 'Dolphins, birds, marsh creeks and maritime forest.', ['wildlife-tours', 'nature-walks']],
  ['wheels', 'Wheels', 'Bikes, e-bikes, scooters and golf carts for getting around.', ['golf-cart-rentals', 'ebike-rentals', 'bike-tours', 'fat-bike-rentals', 'scooter-rentals']],
];
{
  const seen = GROUPS.flatMap((g) => g[3]);
  for (const s of slugs) if (seen.filter((x) => x === s).length !== 1) throw new Error('hub group must list exactly once: ' + s);
  for (const s of seen) if (!ctx.CAT_DATA[s]) throw new Error('hub group has unknown category: ' + s);
}
const isLive = (s) => (ctx.OPS[s] || []).some((x) => x.live);
const catCard = (s, wide) => `<a class="kc" href="/things-to-do/${s}">
        <span class="kc-ph">${thumb(s, 640, 400, title(s) + ' near Wilmington, NC', wide ? '(max-width:680px) 112px, (max-width:1000px) 94vw, 570px' : '(max-width:680px) 112px, (max-width:1000px) 46vw, 380px')}</span>
        <div class="kc-body">${isLive(s) ? '<span class="kc-live">Bookable now</span>' : ''}<h3>${esc(title(s))}</h3><p>${esc(strip(ctx.CAT_DATA[s].sub))}</p><span class="kc-go" aria-hidden="true">Explore &rarr;</span></div>
      </a>`;
const wideAt = (n, i) => (n === 7 && i === 0) || n === 2 || (n === 5 && i < 2);
const hubSections = GROUPS.map(([id, name, blurb, list]) => `
  <section class="hub-sec" id="${id}" aria-labelledby="h-${id}">
    <div class="hub-head"><div><p class="pg-eye">${list.length} ${list.length === 1 ? 'category' : 'categories'}</p><h2 id="h-${id}">${name}</h2></div><p class="pg-sub">${blurb}</p></div>
    <div class="cat-cards n${list.length}">
      ${list.map((s, i) => catCard(s, wideAt(list.length, i))).join('\n      ')}
    </div>
  </section>`).join('\n');
// Fallback shown inside the live strip until (or unless) today.js replaces it with ranked picks.
const fbCard = (u, fit, name, why, go) => `<a class="tp-card" href="${u}"><div class="tp-top"><span class="tp-fit">${fit}</span></div><h3>${name}</h3><p>${why}</p><span class="tp-go">${go} &rarr;</span></a>`;
const hubMain = `
<div class="tp-wrap">
<section id="today-plan" class="tp-strip" aria-label="Best things to do right now">
  <div class="tp-in tp-fallback">
    <div class="tp-eye"><i></i>Any-day ideas</div>
    <h2>Best bets <em>right now</em></h2>
    <p class="tp-now">Live picks load here, ranked from the wind, surf and weather at Wrightsville Beach. Until they do, these work in most conditions.</p>
    <div class="tp-grid">
      ${fbCard('/things-to-do/museums', 'Indoors', 'Museums', 'A good indoor option any day.', 'See options')}
      ${fbCard('/things-to-do/wellness', 'Any day', 'Wellness and spa', 'A calm option any day.', 'See options')}
      ${fbCard('/wilmington-weather', 'Check first', 'Live weather', 'Current conditions, forecast, surf, tides and water temperature.', 'Open the weather page')}
      ${fbCard('/events/this-weekend', 'This weekend', 'Events', 'What is happening in Wilmington and the beaches this weekend.', 'See the list')}
    </div>
    <p class="tp-note">These four are everyday suggestions, not a live ranking. Always follow posted beach flags and operator guidance.</p>
  </div>
</section>
</div>
<div class="pg-in">
${hubSections}
</div>
<div class="pg-in">
  <section class="tiles-sec" aria-labelledby="h-area">
    <p class="pg-eye">Plan around it</p>
    <h2 id="h-area">Explore by area</h2>
    <ul class="tiles">
      ${[['/downtown', 'Downtown Wilmington', 'Riverwalk, history, film locations', 'pin', 'dark'], ['/wrightsville-beach', 'Wrightsville Beach', 'Surf, paddle, island life', 'wave', 'dark'], ['/carolina-beach', 'Carolina Beach', 'Boardwalk, state park, fishing', 'wave', 'dark'], ['/kure-beach', 'Kure Beach', 'Quiet sand, pier, Fort Fisher', 'wave', 'dark'],
        ['/events/this-weekend', 'Events this weekend', 'What is on, Friday to Sunday', 'calendar'], ['/where-to-stay', 'Where to stay', 'Choosing your base', 'hotel'], ['/wilmington-weather', 'Weather', 'Live forecast and beach conditions', 'compass'], ['/plan-your-trip', 'Trip planning guide', 'When to go and a three-day plan', 'sparkle']].map(tile).join('\n      ')}
    </ul>
  </section>
</div>
<section class="seo-band" aria-label="Guide" style="margin-top:72px">
<div class="seo">
  <div class="seo-cols">
    <div>
      <p class="pg-eye">Local guide</p>
      <h2>Things to do in Wilmington, NC and the beaches</h2>
      <p>Wilmington is a river city with three ocean beaches within a half hour: Wrightsville Beach, Carolina Beach and Kure Beach. That mix is what makes it easy to plan. You can spend the morning on the sand, the afternoon in a 250-year-old historic district, and the evening on the Cape Fear River.</p>
      <p>ShoreList is the local guide and booking marketplace for the area. Every category above has its own page with what to expect, where it happens and what you can book today, and the live beach report on each beach page shows surf, tide, water temperature and an estimated flag.</p>
      <h3>By type of trip</h3>
      <ul>
        <li><strong>On the water:</strong> <a href="/things-to-do/surf-lessons">surf lessons</a>, <a href="/things-to-do/paddleboard">paddleboarding</a>, <a href="/things-to-do/kayak-tours">kayak tours</a>, <a href="/things-to-do/fishing-charters">fishing charters</a>, <a href="/things-to-do/sailboat-rides">sunset sails</a>, <a href="/things-to-do/river-cruises">river cruises</a> and <a href="/things-to-do/jet-ski-rentals">jet skis</a>.</li>
        <li><strong>History and stories:</strong> <a href="/things-to-do/walking-tours">walking tours</a>, <a href="/things-to-do/ghost-tours">ghost tours</a>, <a href="/things-to-do/film-tours">film and TV location tours</a> and <a href="/things-to-do/museums">museums</a>.</li>
        <li><strong>Nature:</strong> <a href="/things-to-do/wildlife-tours">dolphin and wildlife tours</a> and <a href="/things-to-do/nature-walks">nature walks</a>, including the wild Venus flytraps at Carolina Beach State Park.</li>
        <li><strong>Getting around:</strong> <a href="/things-to-do/golf-cart-rentals">golf carts</a>, <a href="/things-to-do/ebike-rentals">e-bikes</a>, <a href="/things-to-do/bike-tours">bike tours</a>, <a href="/things-to-do/fat-bike-rentals">fat bikes</a> and <a href="/things-to-do/scooter-rentals">scooters</a>.</li>
        <li><strong>Beach day extras:</strong> <a href="/things-to-do/beach-chairs">chair and umbrella rentals</a>, <a href="/things-to-do/beach-picnics">beach picnics</a>, <a href="/things-to-do/beach-photography">beach photographers</a> and <a href="/things-to-do/wellness">yoga and wellness</a>.</li>
      </ul>
      <p>Planning the whole visit? Start with the <a href="/plan-your-trip">Wilmington trip planning guide</a>, see <a href="/events">what is on this week</a>, find <a href="/shore-picks">where locals eat</a>, or let the <a href="/planner">AI trip planner</a> build a day for you.</p>
    </div>
    <div id="faq">
      <p class="pg-eye">Before you go</p>
      <h2>Common questions</h2>
      ${faqHtml(hubFaq)}
      ${PHOTO_NOTE}
    </div>
  </div>
</div>
</section>`;
fs.writeFileSync('things-to-do/index.html', shell({
  url: '/things-to-do', title: 'All Things to Do in Wilmington, NC: Tours & Rentals | ShoreList',
  desc: 'Things to do in Wilmington, NC, Wrightsville Beach, Carolina Beach and Kure Beach: tours, water sports, museums, rentals and local experiences, with live beach conditions.',
  image: SITE + '/og-category.jpg',
  lds: [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Things to Do in Wilmington, NC and the Beaches', url: SITE + '/things-to-do', inLanguage: 'en-US', dateModified: today, about: { '@type': 'TouristDestination', name: 'Wilmington, North Carolina', containsPlace: ['Wrightsville Beach', 'Carolina Beach', 'Kure Beach'].map((n) => ({ '@type': 'Place', name: n })) }, publisher: ORG },
    crumbs([['ShoreList', '/'], ['Things to Do in Wilmington, NC', '/things-to-do']]),
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Things to do in Wilmington, NC', itemListElement: slugs.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: CATS[s].h1, url: SITE + '/things-to-do/' + s })) },
    faqLd(hubFaq),
  ],
  photo: 'wildlife-tours',
  heroExtra: WX_CHIP + '\n    <div class="hero-jump" role="navigation" aria-label="Jump to a section">' + GROUPS.map(([id, name]) => `<a href="#${id}">${name}</a>`).join('') + '</div>',
  scripts: '<script src="/today.js" defer></script>\n' + WX_SCRIPT + '\n',
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
const dayCard = (n, slug, alt, h3, body) => `<article class="day">
        <div class="day-ph">${thumb(slug, 640, 400, alt, '(max-width:680px) 92vw, (max-width:1000px) 38vw, 360px')}<span class="day-n" aria-hidden="true"><small>Day</small>${n}</span></div>
        <div class="day-body"><h3>${h3}</h3><p>${body}</p></div>
      </article>`;
const tripMain = `
<div class="pg-in">
  <section class="trip-sec" aria-labelledby="h-glance">
    <p class="pg-eye">The short version</p>
    <h2 id="h-glance">Wilmington at a glance</h2>
    <p class="pg-sub" style="max-width:760px">Wilmington sits on the Cape Fear River in southeastern North Carolina, with the Atlantic a few miles east. Visitors get a historic river city and three distinct beach towns in one trip, all within about half an hour of each other.</p>
    <ul class="stats">
      <li><span>Fly into</span><b>ILM, about 10 minutes from downtown</b></li>
      <li><span>To the beaches</span><b>About 20 to 40 minutes from downtown</b></li>
      <li><span>How long</span><b>Three days covers the essentials</b></li>
      <li><span>Getting around</span><b>A car, for most trips</b></li>
    </ul>
    <table class="areas">
      <tr><th>Area</th><th>Best for</th><th>From downtown</th></tr>
      <tr><td><a href="/downtown">Downtown Wilmington</a></td><td>Riverwalk, historic district, restaurants, nightlife, film locations</td><td data-l="From downtown">You are here</td></tr>
      <tr><td><a href="/wrightsville-beach">Wrightsville Beach</a></td><td>Surfing, paddleboarding, clear water, an active island</td><td data-l="From downtown">About 20 minutes</td></tr>
      <tr><td><a href="/carolina-beach">Carolina Beach</a></td><td>Boardwalk, families, fishing charters, Carolina Beach State Park</td><td data-l="From downtown">About 30 minutes</td></tr>
      <tr><td><a href="/kure-beach">Kure Beach</a></td><td>Quiet beach days, the pier, Fort Fisher</td><td data-l="From downtown">About 35 to 40 minutes</td></tr>
    </table>
    <ul class="tiles t3" style="margin-top:14px">
      ${[['/where-to-stay', 'Where to stay', 'Downtown or one of the beach towns', 'hotel'], ['/events/this-weekend', 'Events this weekend', 'What is on, Friday to Sunday', 'calendar'], ['/wilmington-weather', 'Weather', 'Live forecast and beach conditions', 'compass']].map(tile).join('\n      ')}
    </ul>
  </section>

  <section class="trip-sec" aria-labelledby="h-when">
    <p class="pg-eye">Season by season</p>
    <h2 id="h-when">When to go</h2>
    <ul class="seasons">
      <li><strong>Spring (March to May):</strong> mild days, gardens in bloom and the North Carolina Azalea Festival in April. The ocean is still cool.</li>
      <li><strong>Summer (June to August):</strong> peak beach season, warm water and the busiest weekends. Book lodging and tours early, and expect afternoon thunderstorms.</li>
      <li><strong>Fall (September to November):</strong> warm water into October, fewer crowds and good fishing. It is also the heart of hurricane season, so keep plans flexible.</li>
      <li><strong>Winter (December to February):</strong> quiet and mild, with holiday events and lower lodging rates. A good time for downtown, museums and long beach walks.</li>
    </ul>
    <p class="pg-sub">See <a class="txt" href="/events">what is happening this week</a> before you pick dates.</p>
  </section>

  <section class="trip-sec" aria-labelledby="h-plan">
    <p class="pg-eye">Itinerary</p>
    <h2 id="h-plan">A simple three-day plan</h2>
    <div class="days seo-days">
      ${dayCard(1, 'walking-tours', 'Walking tour scene for a day in downtown Wilmington', 'Day 1: Downtown and the river', 'Start with a <a class="txt" href="/things-to-do/walking-tours">guided walking tour</a> of the historic district, visit the <a class="txt" href="/wilmington-railroad-museum">Wilmington Railroad Museum</a> or cross the river to the Battleship North Carolina, then take a <a class="txt" href="/things-to-do/river-cruises">sunset river cruise</a>. After dark, try a <a class="txt" href="/things-to-do/ghost-tours">ghost tour</a>.')}
      ${dayCard(2, 'surf-lessons', 'Surf scene for a day at Wrightsville Beach', 'Day 2: Wrightsville Beach', 'Check the <a class="txt" href="/wrightsville-beach">live beach report</a>, then take a <a class="txt" href="/things-to-do/surf-lessons">surf lesson</a> or <a class="txt" href="/things-to-do/paddleboard">paddleboard</a> the sound side in the morning. In the afternoon, a <a class="txt" href="/things-to-do/kayak-tours">kayak</a> or <a class="txt" href="/things-to-do/wildlife-tours">wildlife tour</a> gets you out toward Masonboro Island, and a <a class="txt" href="/things-to-do/sailboat-rides">sunset sail</a> ends the day.')}
      ${dayCard(3, 'nature-walks', 'Nature walk scene for a day at Carolina Beach and Kure Beach', 'Day 3: Carolina Beach and Kure Beach', 'Walk the flytrap trail at Carolina Beach State Park on a <a class="txt" href="/things-to-do/nature-walks">nature walk</a>, spend midday on the sand and the boardwalk, then continue south to Kure Beach and Fort Fisher. Anglers can swap the morning for a <a class="txt" href="/things-to-do/fishing-charters">fishing charter</a>.')}
    </div>
    <p class="pg-sub" style="max-width:760px">Want a plan built around your group? The <a class="txt" href="/planner">ShoreList trip planner</a> builds one in seconds, and <a class="txt" href="/shore-picks">Shore Picks</a> covers where to eat.</p>
  </section>

  <section class="trip-sec trip-2" aria-label="Practical notes">
    <div class="pcard">
      <h2>Getting here and getting around</h2>
      <p>Wilmington International Airport (ILM) is about 10 minutes from downtown. By road, Interstate 40 ends in Wilmington, and Raleigh is roughly two hours away. Once you are here, downtown is walkable, and each beach town is easy by bike, <a class="txt" href="/things-to-do/ebike-rentals">e-bike</a> or <a class="txt" href="/things-to-do/golf-cart-rentals">golf cart</a>, but you will want a car to move between them. Beach parking is paid in season, and lots fill early on summer weekends.</p>
    </div>
    <div class="pcard">
      <h2>What to pack</h2>
      <p>Sun protection, a hat, sandals and a light layer for evenings on the water. For the beach, bring or rent chairs and shade: you can <a class="txt" href="/things-to-do/beach-chairs">rent a setup</a> or pick up chairs, umbrellas, towels and coolers from the <a class="txt" href="/shop">ShoreList Shop</a>.</p>
    </div>
  </section>
</div>
<section class="seo-band" aria-label="Trip planning questions" style="margin-top:72px">
<div class="seo">
  <div class="seo-cols">
    <div id="faq">
      <p class="pg-eye">Before you go</p>
      <h2>Trip planning questions</h2>
      ${faqHtml(tripFaq)}
    </div>
    <div>
      <p class="pg-eye">Next steps</p>
      <h2>Start planning</h2>
      ${chips([['/things-to-do', 'All things to do'], ['/where-to-stay', 'Where to stay'], ['/events', 'Events'], ['/wilmington-weather', 'Weather'], ['/map', 'Map'], ['/planner', 'AI trip planner'], ['/shore-picks', 'Where to eat'], ['/shop', 'Beach gear']])}
      ${PHOTO_NOTE}
    </div>
  </div>
</div>
</section>`;
fs.writeFileSync('plan-your-trip.html', shell({
  url: '/plan-your-trip', title: 'Plan a Trip to Wilmington, NC & the Beaches | ShoreList',
  desc: 'Plan a trip to Wilmington, NC: when to go, where to stay, how far the beaches are, a three-day itinerary and answers to common questions, from a local guide.',
  image: 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-wb4-golden_1200x630_crop_center.webp',
  lds: [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'Planning a Trip to Wilmington, NC and the Beaches', url: SITE + '/plan-your-trip', inLanguage: 'en-US', datePublished: '2026-11-20', dateModified: today, author: ORG, publisher: ORG, about: { '@type': 'TouristDestination', name: 'Wilmington, North Carolina' } },
    crumbs([['ShoreList', '/'], ['Plan Your Trip', '/plan-your-trip']]),
    faqLd(tripFaq),
  ],
  photo: 'sailboat-rides',
  heroExtra: WX_CHIP,
  scripts: WX_SCRIPT + '\n',
  breadcrumb: '<span>Plan Your Trip</span>', tag: 'Local trip guide',
  h1: 'Planning a Trip to <em>Wilmington, NC</em>',
  sub: 'When to go, where to stay, how the beaches differ and a three-day plan for Wilmington, Wrightsville Beach, Carolina Beach and Kure Beach.',
  main: tripMain,
}));

console.log('built', slugs.length, 'category pages + hub + trip guide');
