// Renders events-data.json into static HTML so search engines and AI crawlers (which mostly do not run JavaScript)
// can read every event: a static list + Event JSON-LD inside events.html, and one page per area under /events/.
// Run after tools/refresh-events.mjs:  node tools/build-events-pages.mjs
import fs from 'node:fs';

const SITE = 'https://shorelist.net';
const data = JSON.parse(fs.readFileSync('events-data.json', 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const d = (s) => new Date(s + 'T12:00:00Z');
const nice = (s) => { const x = d(s); return DOW[x.getUTCDay()] + ', ' + MON[x.getUTCMonth()] + ' ' + x.getUTCDate() + ', ' + x.getUTCFullYear(); };
const short = (s) => { const x = d(s); return MON[x.getUTCMonth()] + ' ' + x.getUTCDate(); };
const eff = (e) => (e.start < today ? today : e.start);
const all = (data.events || []).filter((e) => e.end >= today)
  .sort((a, b) => eff(a).localeCompare(eff(b)) || (a.end !== a.start) - (b.end !== b.start) || a.title.localeCompare(b.title));

const CITY = { 'Downtown': 'Wilmington', 'Greater Wilmington': 'Wilmington', 'Wrightsville Beach': 'Wrightsville Beach', 'Carolina Beach': 'Carolina Beach', 'Kure Beach': 'Kure Beach' };
function iso(date, time) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time || '');
  if (!m) return date;
  let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12;
  // America/New_York offset: EDT (-04:00) from the second Sunday of March to the first Sunday of November, else EST
  const y = +date.slice(0, 4), md = date.slice(5);
  const nth = (mon, n) => { const first = new Date(Date.UTC(y, mon, 1)).getUTCDay(); return String(mon + 1).padStart(2, '0') + '-' + String(1 + ((7 - first) % 7) + 7 * (n - 1)).padStart(2, '0'); };
  const off = md >= nth(2, 2) && md < nth(10, 1) ? '-04:00' : '-05:00';
  return date + 'T' + String(h).padStart(2, '0') + ':' + m[2] + ':00' + off;
}
function when(e) {
  if (e.recurring) return 'Every ' + e.recurring.replace(/s$/, '') + ' through ' + short(e.end);
  if (e.end !== e.start) return short(e.start) + ' to ' + short(e.end) + ', ' + e.end.slice(0, 4);
  return nice(e.start) + (e.time ? ', ' + e.time : '');
}
function item(e) {
  return '<li class="evs-i"><h3><a href="' + esc(e.url) + '" rel="noopener" target="_blank">' + esc(e.title) + '</a></h3>' +
    '<p><time datetime="' + esc(e.start) + '">' + esc(when(e)) + '</time> &middot; ' + esc(e.venue) + ', ' + esc(CITY[e.area] || 'Wilmington') + ', NC &middot; ' + esc(e.cat) + '</p>' +
    (e.sched || e.tickets ? '<p class="evs-x">' + esc([e.sched, e.tickets].filter(Boolean).join('. ')) + '</p>' : '') + '</li>';
}
function ld(list, name, url) {
  return { '@context': 'https://schema.org', '@type': 'ItemList', name, url: SITE + url, numberOfItems: list.length,
    itemListElement: list.map((e, i) => ({ '@type': 'ListItem', position: i + 1, item: Object.assign({
      '@type': 'Event', name: e.title, startDate: iso(e.start, e.time), endDate: e.end,
      eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', addressLocality: CITY[e.area] || 'Wilmington', addressRegion: 'NC', addressCountry: 'US' } },
      url: e.url }, /^free/i.test(e.tickets || '') ? { isAccessibleForFree: true } : {}) })) };
}
const script = (o) => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
function between(html, tag, inner) {
  const a = '<!--' + tag + '-->', b = '<!--/' + tag + '-->', i = html.indexOf(a), j = html.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker ' + tag + ' missing');
  return html.slice(0, i + a.length) + '\n' + inner + '\n' + html.slice(j);
}

// ---------- events.html: static list (replaced by the interactive feed when JavaScript runs) + JSON-LD ----------
let ev = fs.readFileSync('events.html', 'utf8');
const AREAS = [
  { slug: 'downtown-wilmington', area: 'Downtown', name: 'Downtown Wilmington', guide: '/downtown', blurb: 'Concerts, theater, markets, parades and history events along the Riverwalk and in the historic district.' },
  { slug: 'wrightsville-beach', area: 'Wrightsville Beach', name: 'Wrightsville Beach', guide: '/wrightsville-beach', blurb: 'Tree lightings, the holiday flotilla, races, plunges and community events on the island.' },
  { slug: 'carolina-beach', area: 'Carolina Beach', name: 'Carolina Beach', guide: '/carolina-beach', blurb: 'Boardwalk and lake events, parades, markets, movies and seasonal celebrations.' },
  { slug: 'kure-beach', area: 'Kure Beach', name: 'Kure Beach', guide: '/kure-beach', blurb: 'Markets, holiday gatherings, plunges and events near the pier and Fort Fisher.' },
  { slug: 'greater-wilmington', area: 'Greater Wilmington', name: 'Greater Wilmington', guide: '/things-to-do', blurb: 'Museum exhibitions, garden light shows, campus concerts and races across the wider city.' }
];
const areaNav = '<p class="evs-nav">Browse by area: ' + AREAS.map((a) => '<a href="/events/' + a.slug + '">' + esc(a.name) + ' events</a>').join(' &middot; ') + ' &middot; <a href="/events/this-weekend">This weekend</a></p>';
ev = between(ev, 'EV-STATIC', '<div class="evs"><h2>Upcoming events in Wilmington, NC and the beaches</h2>' + areaNav + '<ul>' + all.map(item).join('\n') + '</ul><p class="evs-x">Updated ' + esc(nice(data.updated || today)) + '. Confirm details with the venue before you go.</p></div>');
ev = between(ev, 'EV-LD', script(ld(all.slice(0, 60), 'Upcoming events in Wilmington, NC', '/events')));
fs.writeFileSync('events.html', ev);

// ---------- area and weekend pages ----------
const shellSrc = fs.readFileSync('wilmington-nc-faq.html', 'utf8');
const style = shellSrc.slice(shellSrc.indexOf('<style>'), shellSrc.indexOf('</style>'));
const img = 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-wb5-golden_1200x630_crop_center.webp';
function page({ path, title, desc, h1, lede, list, crumb, extra }) {
  const lds = [ld(list, title, path), { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['ShoreList', '/'], ['Events', '/events'], [crumb, path]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) }];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="theme-color" content="#0E1F33"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${SITE}${path}"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${SITE}${path}"/>
<meta property="og:image" content="${img}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:image" content="${img}"/>
<link rel="icon" href="/favicon.ico"/><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EN91RH3PZV"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-EN91RH3PZV');</script>
<link rel="manifest" href="/manifest.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
${lds.map(script).join('\n')}
${style}
.evs ul{list-style:none;display:grid;gap:10px}.evs-i{background:#fff;border:1px solid rgba(14,31,51,.1);border-radius:16px;padding:16px 20px}.evs-i h3{font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--navy)}.evs-i h3 a{text-decoration:none}.evs-i h3 a:hover{color:var(--red)}.evs-i p{color:#2A4850;font-size:.95rem;margin-top:4px}.evs-x{font-size:.88rem!important;color:#3A5760!important}
.evs-nav{margin:0 0 22px}.evs-nav a{color:var(--red);font-weight:800;text-decoration:none;display:inline-block;padding:6px 0}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="top" aria-label="Primary"><a class="logo" href="/" aria-label="ShoreList home">Shore<i>List</i></a><div class="r"><a href="/events">Events</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a class="cta" href="/things-to-do">Book Experiences</a></div></nav>
<main id="main">
<header class="hero q"><div class="wrap">
  <div class="eye"><i></i>Events</div>
  <h1 style="font-size:clamp(2rem,5vw,3.4rem)">${h1}</h1>
  <p class="lede">${esc(lede)}</p>
  <div class="jump"><a href="/events">All events</a>${AREAS.filter((a) => '/events/' + a.slug !== path).slice(0, 4).map((a) => `<a href="/events/${a.slug}">${esc(a.name)}</a>`).join('')}</div>
</div></header>
<section><div class="wrap evs">
${list.length ? '<ul>' + list.map(item).join('\n') + '</ul>' : '<p>Nothing is listed here right now. See <a href="/events" style="color:var(--red);font-weight:800">all Wilmington events</a>.</p>'}
<p class="evs-x" style="margin-top:22px">Updated ${esc(nice(data.updated || today))}. Dates and times come from official and organizer pages; confirm with the venue before you go.</p>
${extra || ''}
</div></section>
</main>
<footer><div>&copy; 2026 ShoreList LLC &middot; Wilmington, NC &amp; the Beaches</div><div><a href="/events">Events Guide</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a href="/where-to-stay">Where to Stay</a><a href="/wilmington-weather">Weather</a><a href="/legal">Privacy &amp; Terms</a></div></footer>
<script src="/shore-plus.js" defer></script>
</body>
</html>
`;
}
fs.mkdirSync('events', { recursive: true });
const more = (a) => `<p class="sub2" style="margin-top:22px">Planning a visit? See the <a href="${a.guide}" style="color:var(--red);font-weight:800">${esc(a.name)} guide</a>, <a href="/things-to-do" style="color:var(--red);font-weight:800">things to do</a>, <a href="/shore-picks" style="color:var(--red);font-weight:800">where to eat</a> and <a href="/where-to-stay" style="color:var(--red);font-weight:800">where to stay</a>.</p>`;
for (const a of AREAS) {
  const list = all.filter((e) => e.area === a.area);
  fs.writeFileSync(`events/${a.slug}.html`, page({
    path: '/events/' + a.slug, crumb: a.name + ' events',
    title: `${a.name}, NC Events: What's On | ShoreList`,
    desc: `Upcoming events in ${a.name}, NC: ${a.blurb.charAt(0).toLowerCase() + a.blurb.slice(1)} Updated daily.`.slice(0, 158),
    h1: `${esc(a.name)} <em>events</em>`, lede: a.blurb + ' Updated daily from official and organizer calendars.', list, extra: more(a)
  }));
}
// this weekend: Friday to Sunday of the current week (or the coming one)
const t = d(today), dow = t.getUTCDay();
const fri = new Date(t); fri.setUTCDate(t.getUTCDate() + (dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow));
const sun = new Date(fri); sun.setUTCDate(fri.getUTCDate() + 2);
const f = fri.toISOString().slice(0, 10), s = sun.toISOString().slice(0, 10), from = f < today ? today : f;
const wk = all.filter((e) => e.start <= s && e.end >= from);
fs.writeFileSync('events/this-weekend.html', page({
  path: '/events/this-weekend', crumb: 'This weekend',
  title: 'Things to Do in Wilmington, NC This Weekend | ShoreList',
  desc: `What is happening in Wilmington, NC and the beaches this weekend, ${short(f)} to ${short(s)}: concerts, markets, festivals, family events and more.`,
  h1: 'Wilmington this <em>weekend</em>', lede: `Events in Wilmington, Wrightsville Beach, Carolina Beach and Kure Beach for ${short(f)} to ${short(s)}, ${s.slice(0, 4)}.`, list: wk,
  extra: `<p class="sub2" style="margin-top:22px">Check the <a href="/wilmington-weather" style="color:var(--red);font-weight:800">weekend weather and beach report</a>, then find <a href="/things-to-do" style="color:var(--red);font-weight:800">things to do</a> and <a href="/shore-picks" style="color:var(--red);font-weight:800">where to eat</a>.</p>`
}));
console.log('events static:', all.length, 'events;', AREAS.map((a) => a.slug + ' ' + all.filter((e) => e.area === a.area).length).join(', ') + '; weekend ' + wk.length);
