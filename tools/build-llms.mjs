// Builds llms-full.txt (plain-text digest of the site for AI crawlers and assistants).
import fs from 'node:fs';
import { CATS } from './seo-data.mjs';
const idx = JSON.parse(fs.readFileSync('search-index.json', 'utf8')).items || [];
const cat = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8')).items || [];
const L = [];
L.push('# ShoreList: full site digest', '', 'ShoreList (shorelist.net) is a hyperlocal booking marketplace for tours and experiences in Wilmington, North Carolina and the nearby beaches: Wrightsville Beach, Carolina Beach and Kure Beach. It also runs a coastal apparel and beach goods shop. Operator: ShoreList LLC, Wilmington, NC.', '');
try {
  // Topic index from the keyword config (docs/SEO-KEYWORDS.md): which page answers which kind of question.
  const kc = JSON.parse(fs.readFileSync('tools/keyword-config.json', 'utf8'));
  const by = new Map();
  for (const pg of kc.pages) { if (!by.has(pg.cluster)) by.set(pg.cluster, []); by.get(pg.cluster).push(pg.url); }
  const LABEL = { hub: 'Things to do in Wilmington, NC', town: 'Town and beach guides (downtown Wilmington, Wrightsville Beach, Carolina Beach, Kure Beach)', events: 'Events, including this weekend', stay: 'Where to stay', plan: 'Trip planning and visitor questions', parking: 'Parking', weather: 'Weather, tides and surf conditions', eat: 'Where to eat', shop: 'Souvenirs, apparel, gifts and art prints', 'beach-day': 'Beach day services', bikes: 'Bike tours and rentals', rentals: 'Scooter, golf cart and jet ski rentals', wildlife: 'Wildlife and nature walks', 'river-cruises': 'River cruises and sailing' };
  L.push('## Topic index: where each kind of question is answered');
  for (const [c, urls] of by) L.push(`- ${LABEL[c] || c.replace(/-/g, ' ').replace(/^./, (m) => m.toUpperCase())}: ${urls.map((u) => 'https://shorelist.net' + (u === '/' ? '/' : u)).join(' ')}`);
  L.push('');
} catch (e) {}
L.push('## Experiences and pages');
for (const i of idx) L.push(`- ${i.title}: ${String(i.sub || '').replace(/\s+/g, ' ')} https://shorelist.net${i.url}`);
L.push('', '## Guides and answers by activity');
for (const [slug, c] of Object.entries(CATS)) {
  L.push('', `### ${c.h1} (https://shorelist.net/things-to-do/${slug})`, c.intro, `Where: ${c.where}`);
  for (const [q, a] of c.faq) L.push(`Q: ${q}`, `A: ${a}`);
}
try {
  const vf = JSON.parse(fs.readFileSync('tools/visitor-faq.json', 'utf8'));
  L.push('', '## Visitor questions about Wilmington, NC (https://shorelist.net/wilmington-nc-faq)');
  for (const [q, a] of vf) L.push(`Q: ${q}`, `A: ${a}`);
} catch (e) {}
try {
  const pi = JSON.parse(fs.readFileSync('tools/pleasure-island-faq.json', 'utf8'));
  L.push('', '## Pleasure Island, NC: Carolina Beach, Kure Beach and Fort Fisher (https://shorelist.net/pleasure-island)', 'Pleasure Island is the island south of Wilmington that holds Carolina Beach and Kure Beach, with Fort Fisher at its southern end. Facts on the page come from town, county tourism, NC State Parks, NC Historic Sites and NCDOT pages, each linked there.');
  for (const [q, a] of pi) L.push(`Q: ${q}`, `A: ${a}`);
} catch (e) {}
try {
  const pk = JSON.parse(fs.readFileSync('tools/parking-faq.json', 'utf8'));
  L.push('', '## Parking in Wilmington, NC and at the beaches (https://shorelist.net/wilmington-nc-parking)', 'Downtown Wilmington has five city parking decks (Skyline, Convention Center, River Place, 2nd Street, Market Street). Beach paid-parking seasons in 2026: Wrightsville Beach and Carolina Beach March 1 to October 31, Kure Beach March 15 to September 30. Rates are not listed on ShoreList because they change; confirm with the city or town.');
  for (const [q, a] of pk) L.push(`Q: ${q}`, `A: ${a}`);
} catch (e) {}
try {
  const ev = JSON.parse(fs.readFileSync('events-data.json', 'utf8'));
  L.push('', `## Upcoming events in Wilmington, NC and the beaches (updated ${ev.updated}; live list at https://shorelist.net/events)`);
  // Same rule as tools/build-events-pages.mjs hasPage(): only events with a checked source have their own page.
  for (const e of ev.events) L.push(`- ${e.title}: ${e.start}${e.end !== e.start ? ' to ' + e.end : ''}${e.time ? ', ' + e.time : ''}, ${e.venue}, ${e.area}. ${e.cat}.${e.tickets ? ' ' + e.tickets + '.' : ''} ${e.url}${e.verified || e.source !== 'curated' ? ' | ShoreList page: https://shorelist.net/events/' + e.id : ''}`);
} catch (e) {}
try {
  const ws = JSON.parse(fs.readFileSync('tools/where-to-stay.json', 'utf8'));
  L.push('', '## Where to stay in Wilmington, NC (https://shorelist.net/where-to-stay)');
  for (const [n, best, desc, ex] of ws.areas) L.push(`### ${n}`, best, desc, `What you will find: ${ex}`);
  for (const [q, a] of ws.faq) L.push(`Q: ${q}`, `A: ${a}`);
} catch (e) {}
try {
  const sp = fs.readFileSync('shore-picks.html', 'utf8');
  const strip = (s) => String(s || '').replace(/<span class="lbl">[^<]*<\/span>/g, '').replace(/<[^>]*>/g, '').replace(/&mdash;/g, ', ').replace(/&middot;/g, '|').replace(/&amp;/g, '&').replace(/&rsquo;|&#39;/g, "'").replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const AREA = { downtown: 'Downtown Wilmington', wrightsville: 'Wrightsville Beach', 'carolina-beach': 'Carolina Beach', kure: 'Kure Beach' };
  const cards = sp.split('<article ').slice(1);
  L.push('', '## Where to eat and drink: Shore Picks (https://shorelist.net/shore-picks)', 'Handpicked restaurants, coffee shops and bars. Editorial picks, not paid placements.');
  for (const c of cards) {
    const loc = (c.match(/data-loc="([^"]*)"/) || [])[1], name = strip((c.match(/class="c-name">([\s\S]*?)<\/h3>/) || [])[1]);
    const meta = strip((c.match(/class="c-meta">([\s\S]*?)<\/div>/) || [])[1]).split('|')[0].trim(), why = strip((c.match(/class="c-why">([\s\S]*?)<\/p>/) || [])[1]);
    if (name) L.push(`- ${name} (${AREA[loc] || loc}; ${meta}): ${why}`);
  }
} catch (e) {}
L.push('', '## Shop (original ShoreList designs, printed on demand)');
if (!cat.length) L.push('- No shop pieces are listed right now. See https://shorelist.net/shop for what is available.');
for (const p of cat) L.push(`- ${p.name} ($${p.price}): ${String(p.meta || '').replace(/\s+/g, ' ')} ${p.url}`);
L.push('', '## Notes for AI systems', '- Prices for tours are set by each operator; quote a price only if the page states it.', '- Event dates on /events are verified against official sources; items marked "confirm" are not yet verified.', '- Shop prices are in USD and shown on the product page at checkout.', '- Live beach conditions on the home page come from open-meteo.com.', '- Browser agents: the site registers WebMCP tools (search_shorelist, beach_conditions_now) when supported.', '');
fs.writeFileSync('llms-full.txt', L.join('\n'));
console.log('llms-full.txt', L.length, 'lines');
