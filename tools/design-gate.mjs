#!/usr/bin/env node
// Design Gate bot: automated hard-rule check for every ShoreList product, spec and art file.
// Usage: node tools/design-gate.mjs [--specs DIR] [--art DIR] [--json]
// Exit 1 on any hard-rule FAIL. Taste scoring (brand vibe, trend, will-it-sell) is the
// fashion-expert review, which this bot requires via a REVIEW file per item (see needReview).
import fs from 'node:fs';
import path from 'node:path';
import { coastalBrandIssues, productScoreIssues } from './coastal-brand-review.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const SPECS = arg('--specs', '/home/claude/plans/newline/specs');
const ART = arg('--art', '/home/claude/plans/gear-art');
const REVIEWS = arg('--reviews', '/home/claude/plans/QUALITY-GATE.json');
const catalog = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8'));

const BRANDS = /\b(faherty|vineyard vines|murray'?s|kiel james patrick|kjp|l\.?l\.?\s?bean|ralph lauren|helly hansen|great harbor|nantucket reds)\b/i;
const BANNED = [
  [/yacht club|beach club/i, 'banned wording: yacht/beach club'],
  [/shore thing/i, 'banned phrase: Shore Thing'],
  [/nantucket reds/i, 'banned phrase: Nantucket Reds'],
  [/burgee/i, 'burgee motif or word'],
  [/[—–]/, 'em or en dash'],
];
const fails = [], warns = [];
const F = (id, msg) => fails.push({ id, msg });
const W = (id, msg) => warns.push({ id, msg });

function textRules(id, text, { allowBrandMood = false } = {}) {
  for (const [re, msg] of BANNED) if (re.test(text)) F(id, msg);
  if (!allowBrandMood && BRANDS.test(text) && !/yacht|beach/i.test('')) {
    const m = text.match(BRANDS)[0];
    if (!/great harbor|salt-?washed/i.test(m)) F(id, `real brand name in copy: ${m}`);
    else F(id, `brand/mood term in customer copy: ${m}`);
  }
}

function priceRules(it) {
  const t = `${it.id} ${it.name}`.toLowerCase();
  if (/beanie/.test(t) && it.price > 32) F(it.id, `beanie price ${it.price} over ~$30`);
  if (/\b(cap|hat)\b/.test(t) && it.price > 49) F(it.id, `cap price ${it.price} over $49`);
  if (/pier/.test(t) && !/print|poster|art/.test(t)) F(it.id, 'pier clothing banned');
  if (/\b(poster|big print)\b/.test(t) && /tee|shirt/.test(t)) F(it.id, 'big poster tee banned');
}

// Standing rule: never sell a grey product unless it is unwashed (raw, not faded or washed grey).
const GREY = /\b(gr[ae]y|charcoal|slate|ash|graphite|heather gr[ae]y|pepper|smoke|storm|concrete|pewter|steel)\b/i;
function greyRule(it) {
  const hay = [it.id, it.name, it.meta, it.color, ...(it.variants || []).map(v => v.color), ...(it.colors || [])].filter(Boolean).join(' ');
  if (GREY.test(hay) && !/unwashed|raw/i.test(hay)) F(it.id || it.name, 'grey product/colorway not marked unwashed (rule: no washed or faded grey)');
}
function codeRule(it) {
  const t = `${it.name} ${it.id}`;
  if (/wrightsville|\bwb\b|kure|\bkb\b|carolina beach|\bcb\b|wilmington|\bilm\b/i.test(t) &&
      !/\b(WB|CB|KB|ILM)\b|wrightsville|kure|carolina beach|wilmington/i.test(t)) W(it.id, 'town code missing');
}

// 1. live catalog + draft specs
const items = [...catalog.items.map(i => ({ ...i, _src: 'catalog' }))];
if (fs.existsSync(SPECS)) for (const f of fs.readdirSync(SPECS).filter(f => f.endsWith('.json')))
  items.push({ ...JSON.parse(fs.readFileSync(path.join(SPECS, f), 'utf8')), _src: 'spec' });
for (const it of items) {
  const id = it.id || it.name;
  textRules(id, [it.name, it.meta, it.alt, it.cta].filter(Boolean).join(' | '));
  priceRules(it); codeRule(it); greyRule(it);
  if (it._src === 'catalog') {
    if (!it.alt || it.alt.length < 25) F(id, 'alt text missing or too short');
    for (const k of ['img', 'studio', 'lookbook']) if (!it[k]) W(id, `no ${k} image`);
    if (!it.url) F(id, 'no buy url (must be purchasable in checkout)');
  }
}

// 2. art files: no enclosures (circle/square/badge around graphics), tiny color count, size sanity
function svgFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) svgFiles(p, out); else if (e.name.endsWith('.svg')) out.push(p);
  }
  return out;
}
for (const f of svgFiles(ART)) {
  const s = fs.readFileSync(f, 'utf8'), id = path.relative(ART, f);
  const vb = (s.match(/viewBox="([\d.\s-]+)"/) || [])[1]?.trim().split(/\s+/).map(Number);
  const W0 = vb ? vb[2] : 0, H0 = vb ? vb[3] : 0;
  for (const m of s.matchAll(/<circle[^>]*\sr="([\d.]+)"[^>]*>/g))
    if (W0 && +m[1] * 2 > W0 * 0.6 && /fill="none"|stroke/.test(m[0])) F(id, 'circle enclosing artwork (badge)');
  for (const m of s.matchAll(/<ellipse[^>]*\srx="([\d.]+)"[^>]*>/g))
    if (W0 && +m[1] * 2 > W0 * 0.7 && /fill="none"|stroke/.test(m[0])) F(id, 'ellipse enclosing artwork');
  for (const m of s.matchAll(/<rect[^>]*>/g)) {
    const w = +(m[0].match(/\swidth="([\d.]+)"/) || [])[1], h = +(m[0].match(/\sheight="([\d.]+)"/) || [])[1];
    if (W0 && w > W0 * 0.8 && h > H0 * 0.8 && /fill="none"|stroke/.test(m[0])) F(id, 'square/frame enclosing artwork');
  }
  textRules(id, (s.match(/<text[^>]*>[^<]*<\/text>|<title>[^<]*<\/title>/g) || []).join(' '), {});
  const colors = new Set((s.match(/#[0-9a-fA-F]{6}\b/g) || []).map(c => c.toLowerCase()));
  if (colors.size > 4 && /embroider/i.test(f)) F(id, `embroidery art uses ${colors.size} colors (max 4)`);
  if (/stroke-width="0?\.\d"/.test(s) && /embroider/i.test(f)) W(id, 'hairline stroke will not stitch');
}

// 3. expert review gate: every item must have a passing independent review
let reviews = {};
try { reviews = JSON.parse(fs.readFileSync(REVIEWS, 'utf8')); } catch { /* none yet */ }
for (const it of items) {
  const id = it.id || it.name, r = reviews[id];
  if (!r) { F(id, 'no passing expert review: not sellable'); continue; }
  if (it._src === 'spec') {
    for (const issue of [...productScoreIssues(r.scores, r.scoreEvidence), ...coastalBrandIssues(r.coastalBrandReview)]) {
      F(id, issue);
    }
    if (r.verdict !== 'PASS') F(id, 'expert verdict is not PASS');
    continue;
  }
  const sc = r.scores || {}, vals = Object.values(sc);
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  if (mean < 9.0) F(id, `expert mean ${mean.toFixed(2)} under 9.0`);
  for (const [k, v] of Object.entries(sc)) if (v < 8) F(id, `expert criterion ${k}=${v} under 8`);
  if (r.verdict && r.verdict !== 'PASS') F(id, `expert verdict ${r.verdict}`);
}

const out = { checked: items.length, art: svgFiles(ART).length, fails, warns };
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  console.log(`Design gate: ${out.checked} items, ${out.art} art files`);
  for (const x of fails) console.log(`FAIL ${x.id}: ${x.msg}`);
  for (const x of warns) console.log(`warn ${x.id}: ${x.msg}`);
  console.log(fails.length ? `\n${fails.length} FAIL` : '\nPASS (hard rules)');
}
process.exit(fails.length ? 1 : 0);
