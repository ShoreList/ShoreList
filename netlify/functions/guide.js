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
const STOP = { the: 1, and: 1, for: 1, you: 1, your: 1, what: 1, where: 1, when: 1, how: 1, can: 1, does: 1, with: 1, from: 1, this: 1, that: 1, have: 1, about: 1, today: 1 };

let MARKET, INDEX;

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
function resetGuide() { MARKET = null; INDEX = null; }

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
  if (path.startsWith('/shop') || path.startsWith('/gift') || path.startsWith('/holiday')) return 'wrighty';
  if (path.startsWith('/things-to-do') || path.startsWith('/events') || path.startsWith('/guides') || path.startsWith('/planner')) return 'cape';
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

function linkOf(it) {
  const url = String(it.url || '');
  if (!url.startsWith('/')) return null;
  return { title: String(it.title), url, sub: String(it.sub || ''), price: typeof it.price === 'string' ? it.price : '' };
}

function fallbackAnswer(character, q) {
  const hits = retrieve(q).map(linkOf).filter(Boolean);
  const name = character.name || 'ShoreList';
  if (!hits.length) {
    return {
      say: name + ' is not sure about that from the ShoreList pages. Try the shop, things to do, or events.',
      links: [
        { title: 'Shop', url: '/shop', sub: '', price: '' },
        { title: 'Things to do', url: '/things-to-do', sub: '', price: '' },
        { title: 'Events', url: '/events', sub: '', price: '' },
      ],
    };
  }
  const other = ownerOf(hits[0].url);
  const handoff = other !== character.id
    ? (other === 'wrighty' ? "That's Wrighty's specialty. " : other === 'cape' ? "That's Captain Cape's specialty. " : "That's Shelby's specialty. ")
    : '';
  const first = hits[0];
  const listed = first.price ? ' The page lists ' + first.price + '.' : '';
  const detail = first.sub ? ' The page says: ' + first.sub : '';
  return {
    say: handoff + 'Start with ' + first.title + '.' + detail + listed,
    links: hits,
  };
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

async function callModel(user) {
  const key = process.env.ANTHROPIC_API_KEY;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
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
  try { character = characterFor(b.path, b.character); } catch (e) { return send(200, { ok: false, reason: 'config' }); }
  const base = fallbackAnswer(character, q);
  const pack = (source, say) => send(200, {
    ok: true,
    source,
    character: character.id,
    name: character.name,
    greeting: character.greeting || '',
    accent: character.accent || '#0E1F33',
    say: say || base.say,
    links: base.links,
  });
  const key = process.env.ANTHROPIC_API_KEY;
  const canModel = !aiOff() && (key || (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN));
  if (!canModel) return pack('fallback');
  if (!(await aiDailyCheck(event)).ok) return pack('fallback');
  const lines = base.links.map((l) => [l.title, l.url, l.sub, l.price].filter(Boolean).join(' | ')).join('\n');
  try {
    const model = await callModel('Character: ' + character.name + '\nQuestion: ' + JSON.stringify(q) + '\nPages:\n' + lines);
    const raw = String(model.text || '').replace(/```json|```/g, '');
    const a = raw.indexOf('{'), c = raw.lastIndexOf('}');
    let parsed = null;
    try { parsed = a >= 0 && c > a ? JSON.parse(raw.slice(a, c + 1)) : null; } catch (e) { parsed = null; }
    const say = cleanSay(parsed && parsed.say, lines);
    if (!say) return pack('fallback');
    return pack(model.source, say);
  } catch (e) {
    console.error('guide', e && e.message);
    return pack('fallback');
  }
};

exports.characterFor = characterFor;
exports.fallbackAnswer = fallbackAnswer;
exports.retrieve = retrieve;
exports.cleanSay = cleanSay;
exports.resetGuide = resetGuide;
exports.loadMarket = loadMarket;
