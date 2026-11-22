// Thin / duplicate content gate for a built city site. Exits 1 if any page fails.
// Run: node tools/thin-content-gate.mjs --site <dir> [--against <otherCityDir> ...] [--config city-pack/<city>/city.config.json]
//        [--entities file.json] [--report out.md] [--json] [--warn-only]
// Thresholds (flags, defaults in brackets; also read from config.launchGate.thinContent):
//   --min-words N          fewer than N distinct words of main text            [150]
//   --max-jaccard X        5-word shingle Jaccard vs any page in --against     [0.25]
//   --max-intra X          same, between two pages of this site (0 = off)      [0.80]
//   --min-unique-ratio X   share of text not made of site-wide boilerplate     [0.35]
//   --boilerplate-df X     a shingle on >= X of the site's pages is boilerplate [0.40]
//   --min-entities N       distinct named local places required per page       [2]
//   --pattern-min-group N  pages sharing one title/description skeleton        [5]
//   --pattern-max-share X  ... and above this share of all pages               [0.15]
//   --shingle N            words per shingle                                   [5]
//   --exempt REGEX         path regex exempt from word, ratio and entity checks
// Pages with a robots noindex meta are skipped entirely.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const val = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const vals = (k) => argv.reduce((a, x, i) => (x === '--' + k && argv[i + 1] ? a.concat(argv[i + 1]) : a), []);
const site = val('site');
if (!site) { console.error('usage: node tools/thin-content-gate.mjs --site <dir> [--against <dir>]... [--config file] [--report out.md]'); process.exit(2); }

let cfg = null;
if (val('config')) cfg = JSON.parse(fs.readFileSync(val('config'), 'utf8'));
const gateCfg = (cfg && cfg.launchGate && cfg.launchGate.thinContent) || {};
const num = (flag, key, d) => +val(flag, gateCfg[key] ?? d);
const T = {
  minWords: num('min-words', 'minWords', 150),
  maxJaccard: num('max-jaccard', 'maxJaccard', 0.25),
  maxIntra: num('max-intra', 'maxIntra', 0.8),
  minUniqueRatio: num('min-unique-ratio', 'minUniqueRatio', 0.35),
  boilerplateDf: num('boilerplate-df', 'boilerplateDf', 0.4),
  minEntities: num('min-entities', 'minEntities', 2),
  patternMinGroup: num('pattern-min-group', 'patternMinGroup', 5),
  patternMaxShare: num('pattern-max-share', 'patternMaxShare', 0.15),
  shingle: num('shingle', 'shingle', 5),
};
const DEFAULT_EXEMPT = '^(404|category|offline|dashboard|success|guide-success|legal|waitlist|join|advertise|lookbook-kit|shop|map|planner|how-we-verify|shipping-returns|size-guide|surf/know-before-you-go|index\\.html$)|(^|/)index\\.html$|^events/this-weekend';
const exempt = new RegExp(val('exempt', DEFAULT_EXEMPT), 'i');
// the home page and index pages are hubs: keep the word/similarity checks, skip only the entity and ratio checks via a second regex
const HUB = /(^|\/)index\.html$|^(shop|map|planner)\.html$/i;

const SKIP_DIRS = new Set(['.git', 'node_modules', 'netlify', 'vendor', 'city-pack', 'tools', 'img', 'icons', 'shop-art']);
function listHtml(dir) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(d, e.name)); } else if (e.name.endsWith('.html')) out.push(path.join(d, e.name));
    }
  })(dir);
  return out;
}
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&rsquo;': "'", '&lsquo;': "'", '&ndash;': '-', '&mdash;': '-' };
const decode = (s) => s.replace(/&[#\w]+;/g, (m) => ENT[m] ?? (/^&#(\d+);$/.test(m) ? String.fromCodePoint(+m.slice(2, -1)) : ' '));
const meta = (h, re) => { const m = h.match(re); return m ? decode(m[1]).trim() : ''; };
function parse(file, base) {
  const h = fs.readFileSync(file, 'utf8');
  const rel = path.relative(base, file).split(path.sep).join('/');
  const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(h);
  let body = (h.match(/<main\b[\s\S]*?<\/main>/i) || h.match(/<body\b[\s\S]*<\/body>/i) || [h])[0];
  body = body.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|svg|noscript|template|nav|footer|header|form|button|select)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const text = decode(body).toLowerCase();
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) || [];
  return {
    rel, noindex, words, unique: new Set(words).size, text,
    title: meta(h, /<title>([^<]*)<\/title>/i),
    desc: meta(h, /<meta[^>]+name=["']description["'][^>]+content="([^"]*)"/i) || meta(h, /<meta[^>]+name=["']description["'][^>]+content='([^']*)'/i),
  };
}
const hash = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
function shingles(words, n) {
  const set = new Set();
  for (let i = 0; i + n <= words.length; i++) set.add(hash(words.slice(i, i + n).join(' ')));
  return set;
}
const load = (dir) => listHtml(dir).map((f) => parse(f, dir)).filter((p) => !p.noindex);

const pages = load(site);
const others = vals('against').map((d) => ({ dir: d, pages: load(d) }));
for (const p of pages) p.sh = shingles(p.words, T.shingle);
for (const o of others) for (const p of o.pages) p.sh = shingles(p.words, T.shingle);

// local entities: config areas + localEntities + operators, plus venues from events-data.json in the site, plus --entities file
const entSet = new Set();
const addEnt = (s) => { if (s && String(s).trim().length > 3) entSet.add(String(s).toLowerCase().trim()); };
if (cfg) { (cfg.areas || []).forEach((a) => { addEnt(a.name); addEnt(a.key); }); (cfg.localEntities || []).forEach(addEnt); }
if (val('entities')) JSON.parse(fs.readFileSync(val('entities'), 'utf8')).forEach(addEnt);
try { JSON.parse(fs.readFileSync(path.join(site, 'events-data.json'), 'utf8')).events.forEach((e) => addEnt(e.venue)); } catch { /* optional */ }
const entities = [...entSet];
const entityHits = (p) => entities.filter((e) => p.text.includes(e));

const flags = []; // {page, check, detail}
const add = (page, check, detail) => flags.push({ page, check, detail });

// site-wide boilerplate shingles
const df = new Map();
for (const p of pages) for (const s of p.sh) df.set(s, (df.get(s) || 0) + 1);
const bpCut = Math.max(3, Math.ceil(T.boilerplateDf * pages.length));

const stats = { pages: pages.length, exempt: 0 };
for (const p of pages) {
  const isExempt = exempt.test(p.rel);
  const isHub = HUB.test(p.rel);
  if (isExempt) stats.exempt++;
  p.ratio = p.sh.size ? [...p.sh].filter((s) => df.get(s) < bpCut).length / p.sh.size : 0;
  p.ents = entityHits(p);
  if (!isExempt || (isHub && !/^(404|offline|dashboard|success|guide-success|legal|waitlist)/.test(p.rel))) {
    if (p.unique < T.minWords) add(p.rel, 'thin', `${p.unique} distinct words (< ${T.minWords})`);
  }
  if (!isExempt) {
    if (p.ratio < T.minUniqueRatio) add(p.rel, 'template-only', `${(p.ratio * 100).toFixed(0)}% of text is not site boilerplate (< ${(T.minUniqueRatio * 100).toFixed(0)}%)`);
    if (entities.length && p.ents.length < T.minEntities) add(p.rel, 'no-local-entities', `${p.ents.length} named local places found (< ${T.minEntities})`);
  }
}

// identical titles / descriptions, and templated skeletons
for (const key of ['title', 'desc']) {
  const g = new Map();
  for (const p of pages) if (p[key] && !exempt.test(p.rel)) (g.get(p[key]) || g.set(p[key], []).get(p[key])).push(p.rel);
  for (const [v, list] of g) if (list.length > 1) for (const r of list) add(r, 'duplicate-' + key, `identical ${key} on ${list.length} pages: "${v.slice(0, 70)}"`);
}
const masks = [];
if (cfg) { masks.push(cfg.name, cfg.state && cfg.state.name, cfg.state && cfg.state.code, cfg.siteName); (cfg.areas || []).forEach((a) => masks.push(a.name, a.key)); (cfg.categories || []).forEach((c) => masks.push(c.label)); }
masks.push(...entities);
const maskRe = masks.filter(Boolean).sort((a, b) => b.length - a.length).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const skeleton = (s) => { let t = s.toLowerCase(); if (maskRe.length) t = t.replace(new RegExp(maskRe.join('|'), 'gi'), '{X}'); return t.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim(); };
for (const key of ['title', 'desc']) {
  const g = new Map();
  for (const p of pages) if (p[key] && !exempt.test(p.rel)) { const k = skeleton(p[key]); (g.get(k) || g.set(k, []).get(k)).push(p.rel); }
  for (const [k, list] of g) {
    if (list.length >= T.patternMinGroup && list.length / pages.length >= T.patternMaxShare && k.replace(/\{x\}|#|[^a-z]/g, '').length) {
      for (const r of list) add(r, 'pattern-' + key, `${list.length}/${pages.length} pages share the ${key} skeleton "${k.slice(0, 70)}"`);
    }
  }
}

// near-duplicates against other cities (hard fail) and within the site (off when --max-intra 0)
function jaccardVs(target, list, skipSelf) {
  const inv = new Map();
  list.forEach((q, i) => { for (const s of q.sh) { let a = inv.get(s); if (!a) inv.set(s, a = []); a.push(i); } });
  const res = [];
  for (const p of target) {
    const tally = new Map();
    for (const s of p.sh) for (const i of inv.get(s) || []) tally.set(i, (tally.get(i) || 0) + 1);
    for (const [i, c] of tally) {
      const q = list[i];
      if (skipSelf && (q === p)) continue;
      if (skipSelf && p.rel >= q.rel) continue; // each pair once
      const j = c / (p.sh.size + q.sh.size - c);
      res.push({ a: p, b: q, j });
    }
  }
  return res;
}
const cross = [];
for (const o of others) for (const r of jaccardVs(pages.filter((p) => !exempt.test(p.rel) || HUB.test(p.rel)), o.pages, false)) {
  if (r.j > T.maxJaccard) { cross.push({ page: r.a.rel, other: o.dir + '/' + r.b.rel, j: r.j }); add(r.a.rel, 'cross-city-similarity', `Jaccard ${r.j.toFixed(2)} vs ${o.dir}/${r.b.rel} (> ${T.maxJaccard})`); }
}
const intra = [];
if (T.maxIntra > 0) for (const r of jaccardVs(pages.filter((p) => !exempt.test(p.rel)), pages.filter((p) => !exempt.test(p.rel)), true)) {
  if (r.j > T.maxIntra) { intra.push({ a: r.a.rel, b: r.b.rel, j: r.j }); add(r.a.rel, 'intra-site-similarity', `Jaccard ${r.j.toFixed(2)} vs ${r.b.rel} (> ${T.maxIntra})`); }
}

const byCheck = {};
for (const f of flags) (byCheck[f.check] ||= new Set()).add(f.page);
const failedPages = new Set(flags.map((f) => f.page));
const result = { site, thresholds: T, entitiesChecked: entities.length, againstDirs: others.map((o) => o.dir), stats: { ...stats, flaggedPages: failedPages.size }, byCheck: Object.fromEntries(Object.entries(byCheck).map(([k, v]) => [k, v.size])), flags };

if (has('json')) console.log(JSON.stringify(result, null, 1));
else {
  console.log(`thin-content-gate: ${pages.length} indexable pages (${stats.exempt} exempt from some checks), ${failedPages.size} flagged`);
  for (const [k, n] of Object.entries(result.byCheck)) console.log(`  ${k}: ${n} pages`);
  if (!others.length) console.log('  cross-city similarity: NOT RUN (no --against dir given)');
}

if (val('report')) {
  const L = ['# Thin-content gate report', '',
    `Run: \`node tools/thin-content-gate.mjs --site ${site}${others.map((o) => ' --against ' + o.dir).join('')}${val('config') ? ' --config ' + val('config') : ''}\`  `,
    `Date: ${new Date().toISOString().slice(0, 10)}`, '',
    '## Result', '', `- Indexable pages scanned: **${pages.length}** (noindex pages skipped; ${stats.exempt} utility/hub pages exempt from word, ratio and entity checks)`,
    `- Pages with at least one flag: **${failedPages.size}**`, `- Local entities used for the named-place check: **${entities.length}**`,
    `- Cross-city similarity: ${others.length ? 'run against ' + others.map((o) => o.dir).join(', ') : '**not run**, no second city pack exists yet. Re-run with `--against <other city build>` before any clone launches.'}`,
    `- Exit code: **${failedPages.size ? 1 : 0}**`, '', '## Thresholds', '', '| Setting | Value |', '|---|---:|', ...Object.entries(T).map(([k, v]) => `| ${k} | ${v} |`), '',
    '## Flags by check', '', '| Check | Pages |', '|---|---:|', ...Object.entries(result.byCheck).map(([k, n]) => `| ${k} | ${n} |`), ''];
  const order = {};
  for (const f of flags) (order[f.check] ||= []).push(f);
  for (const [k, list] of Object.entries(order)) {
    L.push(`## ${k}`, '');
    for (const f of list.slice(0, 60)) L.push(`- \`${f.page}\`: ${f.detail}`);
    if (list.length > 60) L.push(`- ... ${list.length - 60} more (use \`--json\` for the full list)`);
    L.push('');
  }
  L.push('## Notes', '', '- Thresholds are unvalidated starting points from the playbook (section 3.5). Tune them against a known-good hand-written page set before using this as a deploy gate.', '- Word counts come from `<main>` (or body) with nav, header, footer, forms, scripts and SVG removed. Pages that render their body client-side will under-count.', '');
  fs.mkdirSync(path.dirname(path.resolve(val('report'))), { recursive: true });
  fs.writeFileSync(val('report'), L.join('\n'));
}
process.exit(has('warn-only') ? 0 : failedPages.size ? 1 : 0);
