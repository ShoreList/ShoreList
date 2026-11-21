// Regenerates search-index.json from the live data in category.html (CAT_DATA + OPS) plus the static page list.
// Run after editing operators/tours:  node tools/build-search-index.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync(new URL('../category.html', import.meta.url), 'utf8');
const a = html.indexOf('var CAT_DATA=');
const o = html.indexOf('var OPS={');
const rest = html.slice(o + 5);
const m = rest.search(/\n(var |function |const |let )/);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(html.slice(a, o + 5 + m) + ';this.CAT_DATA=CAT_DATA;this.OPS=OPS;', ctx);
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/\s+/g, ' ').trim();

const items = [];
for (const [slug, c] of Object.entries(ctx.CAT_DATA)) {
  const ops = (ctx.OPS[slug] || []);
  const live = ops.filter((x) => x.live);
  items.push({ t: 'cat', title: strip(c.title), sub: strip(c.sub), url: '/things-to-do/' + slug, live: live.length, slug });
}
for (const [slug, arr] of Object.entries(ctx.OPS)) {
  for (const x of arr) {
    if (!x.live) continue;
    items.push({
      t: 'tour', title: strip(x.business), sub: strip(x.operator) + (x.title ? ' · ' + strip(x.title) : ''),
      url: '/things-to-do/' + slug, price: x.price || '', per: x.priceLabel || '',
      tags: (x.tags || []).map(strip), slug,
    });
  }
}
const pages = [
  ['Things to do in Wilmington, NC', 'Every tour, activity and rental category for Wilmington and the beaches', '/things-to-do', 'things to do activities tours attractions what to do'],
  ['Plan your trip to Wilmington, NC', 'When to go, where to stay, how far the beaches are and a three-day itinerary', '/plan-your-trip', 'plan trip visit vacation when to go where to stay airport itinerary guide'],
  ['Events', 'Concerts, festivals, holiday events and things to do', '/events', 'event events concert festival holiday show music tonight weekend'],
  ['Shore Picks', 'Restaurants, coffee and drinks that locals pick', '/shore-picks', 'eat food restaurant coffee cafe bar drinks brunch dinner lunch'],
  ['Plan my day', 'Build a coastal itinerary', '/planner', 'plan planner itinerary day trip schedule'],
  ['Map', 'Explore Wilmington and the beaches on a map', '/map', 'map where directions location'],
  ['Downtown Wilmington', 'Riverwalk, history and nightlife', '/downtown', 'downtown riverwalk historic district'],
  ['Wrightsville Beach', 'Surf, paddle and island life', '/wrightsville-beach', 'wrightsville beach surf paddle'],
  ['Carolina Beach', 'Boardwalk, fishing and beach days', '/carolina-beach', 'carolina beach boardwalk fishing'],
  ['Kure Beach', 'Quiet beach town and Fort Fisher', '/kure-beach', 'kure beach fort fisher'],
  ['Wilmington Railroad Museum', 'Tickets and events at the museum', '/wilmington-railroad-museum', 'train railroad museum kids family'],
  ['List your business', 'Join ShoreList as a local operator', '/join', 'operator join list business partner vendor sell'],
  ['Join the waitlist', 'Get updates when new experiences go live', '/waitlist', 'waitlist signup notify email updates'],
  ['Legal and policies', 'Terms, privacy and refund policy', '/legal', 'terms privacy refund cancellation policy legal'],
];
for (const [title, sub, url, kw] of pages) items.push({ t: 'page', title, sub, url, kw });
const out = { v: 1, built: new Date().toISOString().slice(0, 10), items };
fs.writeFileSync(new URL('../search-index.json', import.meta.url), JSON.stringify(out));
console.log('search-index.json:', items.length, 'items',
  '(' + items.filter((i) => i.t === 'cat').length + ' categories, ' + items.filter((i) => i.t === 'tour').length + ' live tours)');
