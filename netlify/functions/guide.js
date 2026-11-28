// Sitewide guide. Wrighty, Shelby and Captain Cape share this function.
// Persona, path rules and town data come from data/market.json.
// Answers are built only from search-index.json. A missing model key uses that
// retrieval directly. The model may not add prices, hours or pages that are
// not in the retrieved lines.
const fs = require('fs');
const path = require('path');
const { corsHeaders, originAllowed, clientIp, rateLimitDurable, aiDailyCheck } = require('./_shared.js');

const MAX_BODY = 4000;
const RATE = { max: 12, windowMs: 60000 };
const MAX_Q = 300;
const STOP = { the: 1, and: 1, for: 1, you: 1, your: 1, what: 1, where: 1, when: 1, how: 1, can: 1, does: 1, with: 1, from: 1, this: 1, that: 1, have: 1, about: 1, today: 1, are: 1, was: 1, were: 1, not: 1, but: 1, is: 1 };

let MARKET, INDEX, GUIDES;

function readJson(name, dirs) {
  for (const d of dirs) {
    try { return JSON.parse(fs.readFileSync(path.join(d, name), 'utf8')); } catch (e) { /* next */ }
  }
  throw new Error(name + ' not found');
}
function loadMarket() {
  if (MARKET) return MARKET;
  const dirs = [path.join(__dirname, '..', '..', 'data'), path.join(process.cwd(), 'data'), path.join(process.env.LAMBDA_TASK_ROOT || '/var/task', 'data')];
  MARKET = readJson('market.json', dirs);
  return MARKET;
}
function loadIndex() {
  if (INDEX) return INDEX;
  const dirs = [path.join(__dirname, '..', '..'), process.cwd(), process.env.LAMBDA_TASK_ROOT || '/var/task'];
  INDEX = readJson('search-index.json', dirs);
  return INDEX;
}
function resetGuide() { MARKET = null; INDEX = null; GUIDES = null; }

function characters() { return loadMarket().characters || {}; }

function characterById(id) {
  const all = characters();
  return all[id] || null;
}

function characterFor(pathname, locked) {
  const held = characterById(locked);
  if (held) return held;
  const all = Object.values(characters());
  const path = String(pathname || '/').split('?')[0].replace(/\.html$/, '') || '/';
  let best = characterById('shelby') || all[0];
  let bestLen = 0;
  for (const c of all) {
    for (const rule of c.paths || []) {
      const hit = rule === '/' ? (path === '/' ? 1 : 0) : (path === rule || path.startsWith(rule + '/') ? rule.length : 0);
      if (hit > bestLen) { best = c; bestLen = hit; }
    }
  }
  return best;
}

function ownerOf(url) {
  const path = String(url || '');
  if (path.startsWith('/shop') || path.startsWith('/gift') || path.startsWith('/holiday') || path.startsWith('/prints') || path.startsWith('/guides') || path.startsWith('/shipping-returns') || path.startsWith('/size-guide') || path.startsWith('/wilmington-nc-gifts') || path.startsWith('/wrightsville-beach-souvenirs') || path.startsWith('/wrightsville-beach-christmas-ornament')) return 'wrighty';
  if (path.startsWith('/things-to-do') || path.startsWith('/events') || path.startsWith('/planner') || path.startsWith('/join') || path.startsWith('/waitlist')) return 'cape';
  return 'shelby';
}

function retrieve(q) {
  const words = String(q || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP[w]);
  const items = (loadIndex().items || []).filter((it) => it && it.url && it.title);
  return items.map((it) => {
    const title = String(it.title).toLowerCase();
    const hay = title + ' ' + String(it.sub || '') + ' ' + String(it.kw || '') + ' ' + String(it.url);
    let s = 0;
    words.forEach((w) => { if (hay.indexOf(w) !== -1) s += title.indexOf(w) !== -1 ? 3 : 1; });
    return { it, s };
  }).filter((row) => row.s > 0).sort((a, b) => b.s - a.s || String(a.it.title).localeCompare(String(b.it.title))).slice(0, 4).map((row) => row.it);
}

function guideDirs() {
  return [
    path.join(__dirname, '..', '..', 'content', 'guides'),
    path.join(process.cwd(), 'content', 'guides'),
    path.join(process.env.LAMBDA_TASK_ROOT || '/var/task', 'content', 'guides'),
  ];
}
function parseGuide(raw, file) {
  let persona = '';
  let questions = [];
  let body = String(raw || '');
  if (body.startsWith('---')) {
    const end = body.indexOf('\n---', 3);
    if (end > 0) {
      const fm = body.slice(3, end);
      body = body.slice(end + 4);
      const pm = fm.match(/^persona:\s*([a-z0-9-]+)/im);
      if (pm) persona = pm[1].toLowerCase();
      questions = fm.split('\n').map((l) => l.match(/^\s*-\s+(.+)$/)).filter(Boolean).map((m) => m[1].trim()).slice(0, 2);
    }
  }
  const links = [];
  const re = /\((\/[^)\s]+)\)/g;
  let m;
  while ((m = re.exec(body))) links.push(m[1].replace(/\/$/, '') || '/');
  return { file, persona, questions, body: body.trim(), links: [...new Set(links)] };
}
function loadGuides() {
  if (GUIDES) return GUIDES;
  GUIDES = [];
  for (const dir of guideDirs()) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
      GUIDES.push(parseGuide(fs.readFileSync(path.join(dir, name), 'utf8'), name));
    }
    if (GUIDES.length) break;
  }
  return GUIDES;
}
function wordsOf(q) {
  return String(q || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP[w]);
}
function guideHits(q) {
  const words = wordsOf(q);
  return loadGuides().map((doc) => {
    const hay = (doc.body + ' ' + doc.file).toLowerCase();
    let s = 0;
    words.forEach((w) => { if (hay.indexOf(w) !== -1) s += 1; });
    if (doc.persona) s += 0;
    return { doc, s };
  }).filter((row) => row.s > 0).sort((a, b) => b.s - a.s || a.doc.file.localeCompare(b.doc.file));
}
const STALE_CLAIM = ['october 3 to 4, 2026', 'november 10 to 14', 'open since 1939', 'dogs allowed on the beach at any hour', 'largest city in nc in 1850'];
function staleClaim(sentence) {
  const low = sentence.toLowerCase();
  if (!STALE_CLAIM.some((p) => low.indexOf(p) !== -1)) return false;
  return !/(canceled|cancelled|closed|do not|instead)/.test(low);
}
function bestSentence(body, words) {
  const sentences = String(body || '').replace(/\s+/g, ' ').split(/(?<=\.)\s+/).map((s) => s.trim()).filter((s) => s.length > 24 && s.length < 320 && !staleClaim(s));
  let best = '';
  let score = 0;
  sentences.forEach((s) => {
    const low = s.toLowerCase();
    let n = 0;
    words.forEach((w) => { if (low.indexOf(w) !== -1) n += 1; });
    if (n > score) { score = n; best = s; }
  });
  return score ? plainSentence(best) : '';
}
function plainSentence(sentence) {
  return String(sentence || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s*\(Source:[\s\S]*$/i, '')
    .replace(/^[-*]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function bestAcross(docs, words, persona) {
  let best = { sentence: '', score: 0, doc: null };
  docs.forEach((doc) => {
    const sentence = bestSentence(doc.body, words);
    if (!sentence) return;
    const low = sentence.toLowerCase();
    let n = 0;
    words.forEach((w) => { if (low.indexOf(w) !== -1) n += 1; });
    if (doc.persona && doc.persona === persona) n += 1;
    const personaTie = n === best.score && doc.persona === persona && !(best.doc && best.doc.persona === persona);
    if (n > best.score || personaTie) best = { sentence, score: n, doc };
  });
  return best;
}
function questionsFor(character) {
  const fromDocs = loadGuides().filter((d) => d.persona === character.id).flatMap((d) => d.questions);
  const list = fromDocs.length ? fromDocs : (character.questions || []);
  return list.slice(0, 2);
}
function handoff(character, other) {
  if (!other || other === character.id) return '';
  if (other === 'wrighty') return "That's Wrighty's specialty. ";
  if (other === 'cape') return "That's Captain Cape's specialty. ";
  return "That's Shelby's specialty. ";
}

function linkOf(it) {
  const url = String(it.url || '');
  if (!url.startsWith('/')) return null;
  return { title: String(it.title), url, sub: String(it.sub || ''), price: typeof it.price === 'string' ? it.price : '' };
}

function fallbackAnswer(character, q, asked) {
  const name = character.name || 'ShoreList';
  const words = wordsOf(q);
  const docs = guideHits(q);
  const hits = retrieve(q).map(linkOf).filter(Boolean);
  let say = '';
  let links = hits;
  let other = '';
  if (docs.length) {
    const picked = bestAcross(docs.map((d) => d.doc), words, character.id);
    const doc = picked.doc || docs[0].doc;
    const sentence = picked.sentence;
    other = doc.persona || ownerOf((doc.links[0] || hits[0] && hits[0].url) || '');
    const fromDoc = doc.links.map((url) => ({ title: url, url, sub: '', price: '' }));
    const named = fromDoc.filter((l) => words.some((w) => l.url.toLowerCase().indexOf(w) !== -1));
    links = (named.length ? named : fromDoc).slice(0, 3);
    if (!links.length) links = hits;
    say = sentence || (name + ' is not sure about that from the guide notes.');
  } else if (!hits.length) {
    say = name + ' is not sure about that from the ShoreList pages. Try the shop, things to do, or events.';
    links = [
      { title: 'Shop', url: '/shop', sub: '', price: '' },
      { title: 'Things to do', url: '/things-to-do', sub: '', price: '' },
      { title: 'Events', url: '/events', sub: '', price: '' },
    ];
  } else {
    other = ownerOf(hits[0].url);
    const detail = hits[0].sub ? ' The page says: ' + hits[0].sub : '';
    say = 'Start with ' + hits[0].title + '.' + detail;
  }
  say = handoff(character, other) + say;
  const n = Math.max(0, Math.min(2, parseInt(asked, 10) || 0));
  const qs = questionsFor(character);
  if (n < qs.length) say = say.replace(/\s+$/, '') + ' ' + qs[n];
  return { say: guardSay(say, links, character), links, asked: Math.min(2, n + (n < qs.length ? 1 : 0)) };
}
function guardSay(say, links, character) {
  const primary = (links && links[0] && links[0].url) || '';
  const walking = primary.indexOf('/things-to-do/walking-tours') === 0;
  if (character && character.id === 'cape' && !walking) say = say.replace(/\bbook now\b/gi, 'see the page');
  return String(say || '').replace(/\s+/g, ' ').trim();
}

function cleanSay(say, allowedText) {
  if (typeof say !== 'string') return '';
  const t = say.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/[\u2013\u2014]/g, ',').replace(/\s+/g, ' ').trim();
  if (!t || t.length > 420) return '';
  if (/cape fear coast|review|rated|guarantee|sold out/i.test(t)) return '';
  const money = t.match(/\$\s?\d[\d,]*/g) || [];
  for (const m of money) if (allowedText.indexOf(m.replace(/\s/g, '')) === -1 && allowedText.indexOf(m) === -1) return '';
  return t;
}

const SYSTEM = [
  'You are a ShoreList guide in Wilmington, North Carolina.',
  'Answer in one or two sentences using ONLY the supplied page lines.',
  'If the lines do not say it, say you are not sure. Never invent hours, prices, events, reviews or stock.',
  'Do not add a second joke. No emoji. No dash punctuation. Never say Cape Fear coast.',
  'Reply with JSON only: {"say":"the answer"}',
].join(' ');

function aiOff() { return /^(0|false|no|off)$/i.test(String(process.env.GUIDE_AI || '').trim()); }

function modelSay(text, lines, character, links) {
  const raw = String(text || '').replace(/```json|```/g, '').trim();
  const a = raw.indexOf('{'), c = raw.lastIndexOf('}');
  if (a >= 0 && c > a) {
    try {
      const parsed = JSON.parse(raw.slice(a, c + 1));
      if (parsed && parsed.say) return guardSay(cleanSay(parsed.say, lines), links, character);
    } catch (e) {}
  }
  return guardSay(cleanSay(raw, lines), links, character);
}

async function callModel(user) {
  const key = process.env.ANTHROPIC_API_KEY;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    if (account && token) {
      const r = await fetch('https://api.cloudflare.com/client/v4/accounts/' + encodeURIComponent(account) + '/ai/run/@cf/meta/llama-3.1-8b-instruct', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
        signal: ctrl.signal,
        body: JSON.stringify({ max_tokens: 280, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }),
      });
      if (!r.ok) throw new Error('upstream ' + r.status);
      const d = await r.json();
      const result = d && d.result || {};
      return { source: 'workers-ai', text: result.response || '' };
    }
    if (key) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: process.env.GUIDE_MODEL || process.env.PLANNER_MODEL || 'claude-sonnet-4-5',
          max_tokens: 280,
          system: SYSTEM,
          messages: [{ role: 'user', content: user }],
        }),
      });
      if (!r.ok) throw new Error('upstream ' + r.status);
      const d = await r.json();
      return { source: 'anthropic', text: (d.content || []).map((x) => x.text || '').join('') };
    }
    throw new Error('no model');
  } finally { clearTimeout(timer); }
}

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  const send = (code, body, extra) => ({ statusCode: code, headers: Object.assign({}, headers, extra || {}), body: JSON.stringify(body) });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return send(405, { ok: false });
  if (!originAllowed(event)) return send(403, { ok: false });
  if (Buffer.byteLength(event.body || '', 'utf8') > MAX_BODY) return send(413, { ok: false });
  const rl = await rateLimitDurable(event, 'guide:' + clientIp(event), RATE.max, RATE.windowMs);
  if (!rl.ok) return send(429, { ok: false, reason: 'rate' }, { 'Retry-After': String(rl.retryAfter) });
  let b = {};
  try { b = JSON.parse(event.body || '{}') || {}; } catch (e) { b = {}; }
  const q = String(typeof b.q === 'string' ? b.q : '').replace(/\s+/g, ' ').trim().slice(0, MAX_Q);
  if (q.length < 2) return send(400, { ok: false, reason: 'input' });
  let character;
  try { character = characterFor(b.path, b.character); loadGuides(); } catch (e) { return send(200, { ok: false, reason: 'config' }); }
  const base = fallbackAnswer(character, q, b.asked);
  const pack = (source, say, reason) => send(200, {
    ok: true,
    source,
    reason: reason || '',
    character: character.id,
    name: character.name,
    greeting: character.greeting || '',
    accent: character.accent || '#0E1F33',
    say: say || base.say,
    links: base.links,
    asked: base.asked,
  });
  const key = process.env.ANTHROPIC_API_KEY;
  const canModel = !aiOff() && (key || (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN));
  if (!canModel) return pack('fallback', base.say, 'not_configured');
  if (!(await aiDailyCheck(event)).ok) return pack('fallback');
  const lines = guideHits(q).map((h) => h.doc.body).concat(base.links.map((l) => [l.title, l.url, l.sub].filter(Boolean).join(' | '))).join('\n');
  try {
    const model = await callModel('Character: ' + character.name + '\nQuestion: ' + JSON.stringify(q) + '\nPages:\n' + lines);
    const say = modelSay(model.text, lines, character, base.links);
    if (!say) return pack('fallback', base.say, 'empty_model');
    return pack(model.source, say);
  } catch (e) {
    console.error('guide', e && e.message);
    return pack('fallback', base.say, 'model_error');
  }
};

exports.characterFor = characterFor;
exports.fallbackAnswer = fallbackAnswer;
exports.retrieve = retrieve;
exports.cleanSay = cleanSay;
exports.modelSay = modelSay;
exports.resetGuide = resetGuide;
exports.loadMarket = loadMarket;
exports.loadGuides = loadGuides;
