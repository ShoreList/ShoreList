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
// ---------- shared card + agenda markup (events.html and every /events/ page use the same design; styles live in /events.css) ----------
const MON3 = MON.map((m) => m.slice(0, 3)), DOW3 = DOW.map((x) => x.slice(0, 3));
const shortAbbr = (s) => { const x = d(s); return MON3[x.getUTCMonth()] + ' ' + x.getUTCDate(); };
const isFree = (e) => /^free/i.test(e.tickets || '');
const CATS = ['Music', 'Arts', 'Holiday', 'Festival', 'Family', 'History', 'Markets', 'Sports', 'Outdoors'];
const catKey = (c) => (CATS.includes(c) ? c.toLowerCase() : 'other');
const ico = (n, cls) => '<svg class="' + (cls || 'evi') + '" aria-hidden="true" focusable="false"><use href="#ev-i-' + n + '"/></svg>';
const P = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const SYM = {
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  arts: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
  holiday: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  festival: '<path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/>',
  family: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  history: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 8 5H4z"/>',
  markets: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  sports: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
  outdoors: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  other: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  cal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M12 13v6"/><path d="M9 16h6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  out: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  wave: '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
  camera: '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>'
};
const SPRITE = '<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs>' +
  Object.keys(SYM).map((k) => '<symbol id="ev-i-' + k + '" viewBox="0 0 24 24"><g ' + P + '>' + SYM[k] + '</g></symbol>').join('') + '</defs></svg>';

function item(e) {
  const city = CITY[e.area] || 'Wilmington', free = isFree(e);
  return '<li class="evc" id="ev-' + esc(e.id) + '" data-id="' + esc(e.id) + '" data-start="' + esc(e.start) + '" data-end="' + esc(e.end) + '" data-area="' + esc(e.area) + '" data-cat="' + esc(e.cat) + '" data-city="' + esc(city) + '" data-venue="' + esc(e.venue) + '"' + (free ? ' data-free="1"' : '') + '>' +
    '<p class="evc-k"><span class="evc-cat">' + ico(catKey(e.cat)) + esc(e.cat) + '</span>' + (free ? '<span class="evc-free">Free</span>' : '') + '</p>' +
    '<h4 class="evc-t"><a href="' + esc(e.url) + '" rel="noopener" target="_blank">' + esc(e.title) + '</a></h4>' +
    '<p class="evc-w">' + ico('clock') + '<time datetime="' + esc(e.start) + '">' + esc(when(e)) + '</time></p>' +
    '<p class="evc-v">' + ico('pin') + '<span>' + esc(e.venue) + ', ' + esc(city) + ', NC</span></p>' +
    (e.sched || e.tickets ? '<p class="evc-x">' + esc([e.sched, e.tickets].filter(Boolean).join('. ')) + '</p>' : '') +
    '<p class="evc-a"><a class="evc-b" href="' + esc(e.url) + '" rel="noopener" target="_blank">Details' + ico('out') + '<span class="sr"> for ' + esc(e.title) + ' (opens in a new tab)</span></a>' +
    '<button type="button" class="evc-b ef-js" data-ics>' + ico('cal') + 'Add to calendar<span class="sr">: ' + esc(e.title) + '</span></button>' +
    '<button type="button" class="evc-b ef-js" data-share>' + ico('share') + '<span class="evc-sl">Share</span><span class="sr"> ' + esc(e.title) + '</span></button></p></li>';
}
// Agenda: events grouped by the day they start (or today, when already running), inside month blocks. Day headers stick while you scroll.
function groups(list) {
  const days = [];
  for (const e of list) { const k = eff(e); let g = days[days.length - 1]; if (!g || g.day !== k) { g = { day: k, items: [] }; days.push(g); } g.items.push(e); }
  return days;
}
function agenda(list) {
  const months = [];
  for (const g of groups(list)) { const k = g.day.slice(0, 7); let m = months[months.length - 1]; if (!m || m.key !== k) { m = { key: k, days: [] }; months.push(m); } m.days.push(g); }
  return '<div class="ev-agenda">' + months.map((m) => {
    const x = d(m.key + '-01');
    return '<div class="evmo" data-m="' + m.key + '"><p class="evm"><span>' + MON[x.getUTCMonth()] + ' ' + x.getUTCFullYear() + '</span></p>' + m.days.map((g) => {
      const t = d(g.day);
      return '<section class="evd" id="d-' + g.day + '" data-day="' + g.day + '" aria-labelledby="dh-' + g.day + '"><h3 class="evd-h" id="dh-' + g.day + '" tabindex="-1"><span class="evd-dow">' + DOW[t.getUTCDay()] + '<i>,</i></span> <span class="evd-md">' + MON[t.getUTCMonth()] + ' <b>' + t.getUTCDate() + '</b></span></h3><ul class="evd-l">' + g.items.map(item).join('\n') + '</ul></section>';
    }).join('\n') + '</div>';
  }).join('\n') + '<p class="ef-empty ef-js" hidden>No events match those filters. <button type="button" class="ef-reset">Clear filters</button></p></div>';
}
// Month mini-calendar (desktop) and date strip (phones): plain links to the day anchors, so both work without JavaScript.
function calendar(list) {
  const gs = groups(list); if (!gs.length) return '';
  const count = {}; gs.forEach((g) => { count[g.day] = g.items.length; });
  const first = gs[0].day.slice(0, 7), last = gs[gs.length - 1].day.slice(0, 7), months = [];
  for (let y = +first.slice(0, 4), m = +first.slice(5) - 1; ;) { const k = y + '-' + String(m + 1).padStart(2, '0'); months.push([y, m, k]); if (k >= last) break; m++; if (m > 11) { m = 0; y++; } }
  const lab = (k, n) => nice(k).replace(/, \d{4}$/, '') + ': ' + n + (n === 1 ? ' event' : ' events');
  const grid = months.map(([y, m, k], i) => {
    const lead = new Date(Date.UTC(y, m, 1)).getUTCDay(), n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let cells = ''; for (let j = 0; j < lead; j++) cells += '<li aria-hidden="true"></li>';
    for (let j = 1; j <= n; j++) { const day = k + '-' + String(j).padStart(2, '0'), c = count[day]; cells += c ? '<li><a href="#d-' + day + '" data-jump="' + day + '" class="' + (c > 2 ? 'c3' : c > 1 ? 'c2' : 'c1') + '" aria-label="' + esc(lab(day, c)) + '">' + j + '</a></li>' : '<li><span>' + j + '</span></li>'; }
    return '<div class="cal-m' + (i === 0 ? ' on' : '') + '" data-m="' + k + '"><p class="cal-t" id="cal-t-' + k + '">' + MON[m] + ' ' + y + '</p><ol class="cal-w" aria-hidden="true">' + ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((x) => '<li>' + x + '</li>').join('') + '</ol><ol class="cal-g" aria-labelledby="cal-t-' + k + '">' + cells + '</ol></div>';
  }).join('');
  let pm = '';
  const strip = gs.map((g) => { const t = d(g.day), mk = g.day.slice(0, 7), sep = mk !== pm ? '<li class="ds-m" aria-hidden="true">' + MON3[t.getUTCMonth()] + '</li>' : ''; pm = mk; return sep + '<li><a href="#d-' + g.day + '" data-jump="' + g.day + '" aria-label="' + esc(lab(g.day, g.items.length)) + '"><span>' + DOW3[t.getUTCDay()] + '</span><b>' + t.getUTCDate() + '</b></a></li>'; }).join('');
  return '<div class="ef-cal" role="group" aria-label="Jump to a date"><div class="cal-hd"><p class="cal-k">Jump to a date</p><div class="cal-nav ef-js"><button type="button" class="cal-prev" aria-label="Previous month">' + ico('arrow') + '</button><button type="button" class="cal-next" aria-label="Next month">' + ico('arrow') + '</button></div></div>' + grid + '<p class="cal-note">Marked days have events starting that day.</p></div>' +
    '<ol class="ef-strip" aria-label="Jump to a date">' + strip + '</ol>';
}
const chip = (attr, val, label, on, icon) => '<button type="button" class="ef-chip" ' + attr + '="' + esc(val) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + (icon ? ico(icon) : '') + esc(label) + '</button>';
// Search box and filter chips. Only shown when JavaScript is running (html.js); events-feed.js wires them to the cards already in the page.
function tools(list, opts) {
  const areas = AREAS.map((a) => a.area).filter((a) => list.some((e) => e.area === a));
  const cats = CATS.concat(list.map((e) => e.cat).filter((c) => !CATS.includes(c))).filter((c, i, arr) => arr.indexOf(c) === i && list.some((e) => e.cat === c));
  return '<div class="ef-tools ef-js"><div class="ef-top"><label class="ef-search">' + ico('search') + '<span class="sr">Search events</span><input type="search" id="ef-q" placeholder="Search events, venues, artists" autocomplete="off" enterkeyhint="search"/></label>' +
    '<div class="ef-quick" role="group" aria-label="Quick filters">' + (opts.weekend ? chip('data-when', 'weekend', 'This weekend', false, 'other') : '') + chip('data-free', '1', 'Free', false, 'ticket') + '</div></div>' +
    (opts.areas && areas.length > 1 ? '<div class="ef-row" role="group" aria-label="Filter by area"><span class="ef-lab">Area</span><div class="ef-scroll">' + chip('data-area', '', 'All areas', true) + areas.map((a) => chip('data-area', a, a, false)).join('') + '</div></div>' : '') +
    (cats.length > 1 ? '<div class="ef-row" role="group" aria-label="Filter by type"><span class="ef-lab">Type</span><div class="ef-scroll">' + chip('data-cat', '', 'All types', true) + cats.map((c) => chip('data-cat', c, c, false, catKey(c))).join('') + '</div></div>' : '') +
    '<p class="ef-status"><span class="ef-count" role="status" aria-live="polite">' + list.length + (list.length === 1 ? ' event' : ' events') + '</span><button type="button" class="ef-reset" hidden>Clear filters</button></p></div>';
}
const AREAS = [
  { slug: 'downtown-wilmington', area: 'Downtown', name: 'Downtown Wilmington', guide: '/downtown', blurb: 'Concerts, theater, markets, parades and history events along the Riverwalk and in the historic district.' },
  { slug: 'wrightsville-beach', area: 'Wrightsville Beach', name: 'Wrightsville Beach', guide: '/wrightsville-beach', blurb: 'Tree lightings, the holiday flotilla, races, plunges and community events on the island.' },
  { slug: 'carolina-beach', area: 'Carolina Beach', name: 'Carolina Beach', guide: '/carolina-beach', blurb: 'Boardwalk and lake events, parades, markets, movies and seasonal celebrations.' },
  { slug: 'kure-beach', area: 'Kure Beach', name: 'Kure Beach', guide: '/kure-beach', blurb: 'Markets, holiday gatherings, plunges and events near the pier and Fort Fisher.' },
  { slug: 'greater-wilmington', area: 'Greater Wilmington', name: 'Greater Wilmington', guide: '/things-to-do', blurb: 'Museum exhibitions, garden light shows, campus concerts and races across the wider city.' }
];
const areaLinks = (skip) => '<nav class="ef-areas" aria-label="Events by area"><p class="cal-k">Browse by area</p><ul>' +
  (skip === '/events' ? '' : '<li><a href="/events">All events<span>' + all.length + '</span></a></li>') +
  AREAS.filter((a) => '/events/' + a.slug !== skip).map((a) => '<li><a href="/events/' + a.slug + '">' + esc(a.name) + ' events<span>' + all.filter((e) => e.area === a.area).length + '</span></a></li>').join('') +
  (skip === '/events/this-weekend' ? '' : '<li><a href="/events/this-weekend">This weekend<span>' + wk.length + '</span></a></li>') + '</ul></nav>';
// The whole feed block: tools, calendar, agenda. Identical structure with and without JavaScript, so nothing moves when the script starts.
function feed(list, opts) {
  return tools(list, opts) + '<div class="ef-body"><aside class="ef-side">' + calendar(list) + areaLinks(opts.path) + '</aside>' + agenda(list) + '</div>';
}

// this weekend: Friday to Sunday of the current week (or the coming one)
const t = d(today), dow = t.getUTCDay();
const fri = new Date(t); fri.setUTCDate(t.getUTCDate() + (dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow));
const sun = new Date(fri); sun.setUTCDate(fri.getUTCDate() + 2);
const f = fri.toISOString().slice(0, 10), s = sun.toISOString().slice(0, 10), from = f < today ? today : f;
const wk = all.filter((e) => e.start <= s && e.end >= from);

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

// ---------- events.html: hero facts + this-weekend row, the full static agenda (enhanced in place by events-feed.js) and JSON-LD ----------
function wkWhen(e) {
  if (e.recurring) return 'Every ' + e.recurring.replace(/s$/, '');
  if (e.end !== e.start) return e.start < from ? 'Through ' + shortAbbr(e.end) : shortAbbr(e.start) + ' to ' + shortAbbr(e.end);
  return DOW[d(e.start).getUTCDay()] + (e.time ? ', ' + e.time : '');
}
const tile = (e) => '<li data-end="' + esc(e.end) + '"><a href="#ev-' + esc(e.id) + '"><span class="wk-c">' + ico(catKey(e.cat)) + esc(e.cat) + '</span><strong>' + esc(e.title) + '</strong><span class="wk-w">' + esc(wkWhen(e)) + '</span><span class="wk-v">' + esc(e.venue) + '</span></a></li>';
const WK_MAX = 6, freeCount = all.filter(isFree).length;
const lead = wk.length ? wk : all.slice(0, 4);
const heroBlock = '<ul class="hero-facts"><li><b>' + all.length + '</b> upcoming events</li><li><b>' + wk.length + '</b> this weekend</li><li><b>' + freeCount + '</b> listed as free</li><li>Updated <b>' + esc(shortAbbr(data.updated || today)) + '</b></li></ul>' +
  '<section class="wk" aria-labelledby="wk-h"><div class="wk-hd"><h2 id="wk-h">' + (wk.length ? 'This weekend <span>' + shortAbbr(f) + ' to ' + shortAbbr(s) + '</span>' : 'Coming up next') + '</h2><a href="/events/this-weekend">Weekend guide' + ico('arrow') + '</a></div>' +
  '<ul class="wk-row">' + lead.slice(0, WK_MAX).map(tile).join('') + (lead.length > WK_MAX ? '<li class="wk-more"><a href="/events/this-weekend"><strong>' + (lead.length - WK_MAX) + ' more this weekend</strong><span class="wk-w">See the full weekend guide</span></a></li>' : '') + '</ul></section>';

let ev = fs.readFileSync('events.html', 'utf8');
ev = between(ev, 'EV-HERO', heroBlock);
ev = between(ev, 'EV-STATIC', SPRITE + '<div class="ef-in"><p class="ef-eye"><i></i>Checked against organizer pages, refreshed daily</p><h2>Upcoming events in Wilmington, NC and the beaches</h2><p class="ef-sub">Every date below comes from an official or organizer page. Past events drop off on their own. Confirm details with the venue before you go.</p>' +
  feed(all, { areas: true, weekend: true, path: '/events' }) + '<p class="ef-note">Updated ' + esc(nice(data.updated || today)) + '. Confirm details with the venue before you go.</p></div>');
ev = between(ev, 'EV-LD', script(ld(all.slice(0, 60), 'Upcoming events in Wilmington, NC', '/events')));
fs.writeFileSync('events.html', ev);

// ---------- area and weekend pages ----------
const CDN = 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/';
const img = CDN + 'shorelist-wb5-golden_1200x630_crop_center.webp';
const cc = (who, lic, licUrl, file) => 'Photo: ' + who + ', <a href="' + licUrl + '" target="_blank" rel="noopener license">' + lic + '</a>, via <a href="https://commons.wikimedia.org/wiki/File:' + file + '" target="_blank" rel="noopener">Wikimedia Commons</a>';
const STYLED = 'Background is a styled scene, not a photo of a specific venue.';
// Hero photos already used elsewhere on the site. shorelist-real-* are credited Wikimedia Commons photographs; shorelist-hero-* are styled scenes and say so.
const PHOTO = {
  bridge: { file: 'shorelist-real-dt-bridge', w: 1920, h: 1371, alt: 'The Wilmington Riverwalk at sunset with the Cape Fear Memorial Bridge lit in the distance', credit: cc('Unexpected Snacks', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 'Wilmington,_NC_Riverwalk_and_Cape_Fear_Memorial_Bridge_at_Sunset.jpg') },
  riverwalk: { file: 'shorelist-real-dt-riverwalk', w: 1000, h: 667, alt: 'Shops and restaurants along the Wilmington Riverwalk beside the Cape Fear River', credit: cc('Jason W. Smith', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/', 'Wilmington_Riverwalk.jpg') },
  bench: { file: 'shorelist-real-dt-bench', w: 1000, h: 715, alt: 'A bench on the Wilmington Riverwalk at sunset', credit: cc('Unexpected Snacks', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/', 'Wilmington,_NC_Riverwalk_Bench_at_Sunset.jpg') },
  wrightsville: { file: 'shorelist-hero-wrightsville', w: 1920, h: 1072, alt: '', credit: STYLED },
  carolina: { file: 'shorelist-hero-carolina', w: 1920, h: 1072, alt: '', credit: STYLED },
  kure: { file: 'shorelist-hero-kure', w: 1920, h: 1072, alt: '', credit: STYLED }
};
const AREA_PHOTO = { 'downtown-wilmington': 'riverwalk', 'wrightsville-beach': 'wrightsville', 'carolina-beach': 'carolina', 'kure-beach': 'kure', 'greater-wilmington': 'bridge' };
const heroImg = (p) => `<img class="ev-hero-img" width="${p.w}" height="${p.h}" src="${CDN}${p.file}_1920x.webp" srcset="${CDN}${p.file}_1000x.webp 1000w, ${CDN}${p.file}_1920x.webp 1920w" sizes="100vw" alt="${esc(p.alt)}" fetchpriority="high" decoding="async"/>`;
const onward = (links) => '<nav class="ev-on" aria-label="Plan the rest of your visit"><h2>Plan the rest of your visit</h2><ul>' + links.map(([href, label, sub]) => '<li><a href="' + href + '"><strong>' + esc(label) + '</strong><span>' + esc(sub) + '</span>' + ico('arrow') + '</a></li>').join('') + '</ul></nav>';
function page({ path, title, desc, h1, lede, list, crumb, h2, intro, photo, links }) {
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
<script>document.documentElement.className+=' js'</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EN91RH3PZV"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-EN91RH3PZV');</script>
<link rel="manifest" href="/manifest.webmanifest"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
${lds.map(script).join('\n')}
<link rel="stylesheet" href="/events.css"/>
<link rel="stylesheet" href="/luxe.css"/>
<script src="/luxe.js" defer></script>
</head>
<body class="ev-page">
<a class="skip-link" href="#main">Skip to content</a>
<nav class="ev-nav" aria-label="Primary"><a class="nav-logo" href="/" aria-label="ShoreList home">Shore<span>List</span></a><div class="nav-right"><a href="/events">Events</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a class="nav-book" href="/things-to-do">Book Experiences</a></div></nav>
<main id="main">
<header class="ev-hero ev-hero-sub">
  ${heroImg(photo)}
  <div class="ev-wrap">
    <p class="ev-eye"><i></i>Events</p>
    <h1>${h1}</h1>
    <p class="ev-lede">${esc(lede)}</p>
    <ul class="hero-facts"><li><b>${list.length}</b> ${list.length === 1 ? 'event listed' : 'events listed'}</li><li>Updated <b>${esc(shortAbbr(data.updated || today))}</b></li></ul>
    <div class="ev-jump"><a href="/events">All events</a>${AREAS.filter((a) => '/events/' + a.slug !== path).slice(0, 4).map((a) => `<a href="/events/${a.slug}">${esc(a.name)}</a>`).join('')}${path === '/events/this-weekend' ? '' : '<a href="/events/this-weekend">This weekend</a>'}</div>
  </div>
  <p class="hero-credit">${photo.credit}</p>
</header>
<section id="events-feed" aria-label="${esc(crumb)}">
${SPRITE}<div class="ef-in"><h2>${esc(h2)}</h2><p class="ef-sub">${esc(intro)}</p>
${list.length ? feed(list, { areas: path === '/events/this-weekend', weekend: path !== '/events/this-weekend', path }) : '<p class="ef-none">Nothing is listed here right now. See <a href="/events">all Wilmington events</a>.</p>'}
<p class="ef-note">Updated ${esc(nice(data.updated || today))}. Dates and times come from official and organizer pages; confirm with the venue before you go.</p>
${onward(links)}
</div></section>
</main>
<footer class="ev-foot"><div>&copy; 2026 ShoreList LLC &middot; Wilmington, NC &amp; the Beaches</div><div><a href="/events">Events Guide</a><a href="/things-to-do">Things to Do</a><a href="/shore-picks">Shore Picks</a><a href="/where-to-stay">Where to Stay</a><a href="/wilmington-weather">Weather</a><a href="/legal">Privacy &amp; Terms</a></div></footer>
<script src="/shore-plus.js" defer></script>
<script src="/events-feed.js" defer></script>
</body>
</html>
`;
}
fs.mkdirSync('events', { recursive: true });
for (const a of AREAS) {
  const list = all.filter((e) => e.area === a.area);
  fs.writeFileSync(`events/${a.slug}.html`, page({
    path: '/events/' + a.slug, crumb: a.name + ' events',
    title: `${a.name}, NC Events: What's On | ShoreList`,
    desc: `Upcoming events in ${a.name}, NC: ${a.blurb.charAt(0).toLowerCase() + a.blurb.slice(1)} Updated daily.`.slice(0, 158),
    h1: `${esc(a.name)} <em>events</em>`, lede: a.blurb + ' Updated daily from official and organizer calendars.', list,
    h2: `Upcoming in ${a.name}`, intro: 'Listed by date, soonest first. Each title links to the organizer or venue page.',
    photo: PHOTO[AREA_PHOTO[a.slug]],
    links: [[a.guide, a.guide === '/things-to-do' ? 'Wilmington area guide' : a.name + ' guide', 'What to see and do nearby'], ['/things-to-do', 'Things to do', 'Tours and experiences you can book'], ['/shore-picks', 'Where to eat', 'Local picks for before or after'], ['/where-to-stay', 'Where to stay', 'Areas and places to base yourself']]
  }));
}
fs.writeFileSync('events/this-weekend.html', page({
  path: '/events/this-weekend', crumb: 'This weekend',
  title: 'Things to Do in Wilmington, NC This Weekend | ShoreList',
  desc: `What is happening in Wilmington, NC and the beaches this weekend, ${short(f)} to ${short(s)}: concerts, markets, festivals, family events and more.`,
  h1: 'Wilmington this <em>weekend</em>', lede: `Events in Wilmington, Wrightsville Beach, Carolina Beach and Kure Beach for ${short(f)} to ${short(s)}, ${s.slice(0, 4)}.`, list: wk,
  h2: `What's on, ${short(f)} to ${short(s)}`, intro: 'Friday through Sunday, including shows and exhibitions already running. Each title links to the organizer or venue page.',
  photo: PHOTO.bench,
  links: [['/wilmington-weather', 'Weekend weather', 'Forecast and beach report'], ['/things-to-do', 'Things to do', 'Tours and experiences you can book'], ['/shore-picks', 'Where to eat', 'Local picks for before or after'], ['/where-to-stay', 'Where to stay', 'Areas and places to base yourself']]
}));
console.log('events static:', all.length, 'events;', AREAS.map((a) => a.slug + ' ' + all.filter((e) => e.area === a.area).length).join(', ') + '; weekend ' + wk.length);
