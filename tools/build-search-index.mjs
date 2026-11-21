// Regenerates search-index.json from the live data in category-app.js (CAT_DATA + OPS) plus the static page list.
// Run after editing operators/tours:  node tools/build-search-index.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { loadOperators, toPublic } from './operators-lib.mjs';
const html = fs.readFileSync(new URL('../category-app.js', import.meta.url), 'utf8');
const a = html.indexOf('var CAT_DATA=');
const o = html.indexOf('var OPS={');
const rest = html.slice(o + 5);
const m = rest.search(/\n(var |function |const |let )/);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(html.slice(a, o + 5 + m) + ';this.CAT_DATA=CAT_DATA;this.OPS=OPS;', ctx);
ctx.OPS = toPublic(loadOperators()).categories; // operators now live in data/operators.json
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
  ['Where to stay in Wilmington, NC', 'Choosing between downtown, Wrightsville Beach, Carolina Beach, Kure Beach and midtown', '/where-to-stay', 'hotels lodging stay resort rental inn bed breakfast oceanfront riverfront accommodation'],
  ['Wilmington events this weekend', 'What is on this Friday to Sunday', '/events/this-weekend', 'weekend events tonight saturday sunday friday'],
  ['Wrightsville Beach events', 'Upcoming events on the island', '/events/wrightsville-beach', 'wrightsville events flotilla'],
  ['Carolina Beach events', 'Boardwalk, lake and seasonal events', '/events/carolina-beach', 'carolina beach events boardwalk'],
  ['Kure Beach events', 'Markets and community events', '/events/kure-beach', 'kure beach events'],
  ['Downtown Wilmington events', 'Concerts, theater, markets and parades', '/events/downtown-wilmington', 'downtown events concerts theater'],
  ['Wilmington, NC weather', 'Live conditions, hourly and 7-day forecast, beach, surf and tide report', '/wilmington-weather', 'weather forecast rain temperature surf tide water temp wind beach conditions today'],
  ['ShoreList Surf', 'Live surf check for Wrightsville, Carolina and Kure Beach, lessons, paddling and beginner guides', '/surf', 'surf surfing waves swell surf report surf check lessons paddle beginner board'],
  ['Choosing a first surfboard', 'Soft-top or hard board, how size works and what a first setup involves', '/surf/first-surfboard', 'surfboard first board beginner soft top foam longboard size buy'],
  ['Paddleboards and kayaks: inflatable or hard', 'How they compare, carrying and storing them, and where each fits on local water', '/surf/paddleboard-and-kayak', 'paddleboard sup kayak inflatable hard buy storage transport'],
  ['Know before you go: water safety and rules', 'Beach flags, rip current basics and life jacket rules for paddlers, with official links', '/surf/know-before-you-go', 'safety rip current life jacket pfd rules flags lifeguard whistle registration'],
  ['Wilmington, NC visitor FAQ', 'Short answers about beaches, parking, kids, nightlife, festivals and getting around', '/wilmington-nc-faq', 'faq questions parking dogs kids free festivals ferry film sunset'],
  ['The Shore Report newsletter', 'Free weekly events, itinerary and beach conditions', '/weekly', 'newsletter weekly email shore report subscribe'],
  ['Plan your trip to Wilmington, NC', 'When to go, where to stay, how far the beaches are and a three-day itinerary', '/plan-your-trip', 'plan trip visit vacation when to go where to stay airport itinerary guide'],
  ['Events', 'Concerts, festivals, holiday events and things to do', '/events', 'event events concert festival holiday show music tonight weekend'],
  ['How we verify events', 'Where event listings come from, how often they refresh and how to report a correction', '/how-we-verify', 'verify verification sources correction accuracy events calendar'],
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
