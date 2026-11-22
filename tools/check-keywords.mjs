// Checks that every page in the keyword config has a unique, correctly sized title, meta description and H1,
// that the primary keyword and the place appear where searchers and AI answer engines read them,
// and that the canonical URL matches. Reusable for any city site: node tools/check-keywords.mjs --config <file>
//   --report   print the expanded keyword candidates per pattern (for human review, never pasted into pages)
// Exits 1 on any failure.
import fs from 'node:fs';

const args = process.argv.slice(2);
const argVal = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const cfgPath = argVal('--config', 'tools/keyword-config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const V = cfg.vars, R = cfg.rules;
const SITE = argVal('--site', 'https://shorelist.net');
const fill = (s) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k === 'beach' ? V.beaches[0] : V[k] ?? '{' + k + '}'));
const norm = (s) => String(s).toLowerCase().replace(/&amp;|&/g, ' and ').replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const text = (h) => String(h).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]*>/g, '').replace(/&rsquo;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

if (args.includes('--report')) {
  console.log(`# Keyword candidates for ${V.city}, ${V.st}\n`);
  for (const [name, p] of Object.entries(cfg.patterns)) {
    const uniq = (x) => x.filter((v, i, arr) => arr.indexOf(v) === i);
    console.log(`## ${name}\n- primary: ${uniq(V.beaches.map((b) => fill(p.primary).replace(V.beaches[0], b))).join(' | ')}`);
    for (const v of p.variants || []) console.log(`- ${uniq(V.beaches.map((b) => fill(v).replace(V.beaches[0], b))).join(' | ')}`);
    console.log('');
  }
  process.exit(0);
}

const fails = [];
const bad = (m) => fails.push(m);
const seen = { title: new Map(), desc: new Map(), h1: new Map() };
const dup = (kind, val, url) => {
  const k = norm(val);
  if (seen[kind].has(k)) bad(`${url}: ${kind} duplicates ${seen[kind].get(k)}`);
  else seen[kind].set(k, url);
};
const fileFor = (url) => (url === '/' ? 'index.html' : fs.existsSync(url.slice(1) + '.html') ? url.slice(1) + '.html' : url.slice(1) + '/index.html');

for (const pg of cfg.pages) {
  const f = fileFor(pg.url);
  if (!fs.existsSync(f)) { bad(`${pg.url}: no file ${f}`); continue; }
  const h = fs.readFileSync(f, 'utf8');
  const title = text((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = text(((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&quot;/g, '"'));
  const h1 = text((h.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '');
  const canon = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const where = `${pg.url} [${pg.tier}]`;
  if (canon !== SITE + (pg.url === '/' ? '/' : pg.url)) bad(`${where}: canonical is ${canon}`);
  if (title.length > R.titleMax) bad(`${where}: title is ${title.length} chars (max ${R.titleMax}): ${title}`);
  if (title.length < R.titleMin) bad(`${where}: title is ${title.length} chars (min ${R.titleMin})`);
  if (desc.length > R.descMax) bad(`${where}: meta description is ${desc.length} chars (max ${R.descMax})`);
  if (desc.length < R.descMin) bad(`${where}: meta description is ${desc.length} chars (min ${R.descMin})`);
  if (!h1) bad(`${where}: no H1`);
  if (R.noDashes) for (const [k, v] of [['title', title], ['description', desc], ['H1', h1]]) if (/[–—]/.test(v)) bad(`${where}: ${k} has an em or en dash`);
  if (R.uniqueTitles) dup('title', title, pg.url);
  if (R.uniqueDescriptions) dup('desc', desc, pg.url);
  if (R.uniqueH1 && h1) dup('h1', h1, pg.url);
  const primary = norm(fill(pg.primary));
  const head = norm(title + ' ' + h1);
  if (!head.includes(primary)) bad(`${where}: primary keyword "${primary}" is in neither the title nor the H1`);
  if (!norm(title).includes(primary) && !norm(h1).includes(primary)) { /* covered above */ }
  const geos = (pg.geo || []).map((g) => norm(fill(g)));
  if (geos.length && !geos.some((g) => norm(title + ' ' + h1 + ' ' + desc).includes(g))) bad(`${where}: none of the place terms (${geos.join(', ')}) appear in the title, H1 or description`);
  for (const a of pg.also || []) if (!norm(title + ' ' + h1 + ' ' + desc).includes(norm(a))) bad(`${where}: "${a}" missing from the title, H1 and description`);
}
if (fails.length) { console.error(fails.join('\n')); console.error(`\n${fails.length} keyword check failure(s)`); process.exit(1); }
console.log(`keywords ok: ${cfg.pages.length} pages checked against ${cfgPath}`);
