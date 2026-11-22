// ShoreList — shared helpers for the functions in this folder (not an endpoint).
// Origin allowlist, HTML escaping, a best-effort rate limiter, the server-side
// tour table and the paid-booking lookup used for capacity.

// The site's own origins. process.env.URL is the primary site URL Netlify sets.
const crypto = require('crypto');
const ORIGINS = ['https://shorelist.net', 'https://www.shorelist.net'];
function allowedOrigins() {
  const list = ORIGINS.slice();
  const u = String(process.env.URL || '').replace(/\/+$/, '');
  if (/^https:\/\/[a-z0-9.-]+$/i.test(u) && !list.includes(u)) list.push(u);
  return list;
}

// Netlify lower-cases header names; be tolerant of other casings in tests/proxies.
function header(event, name) {
  const h = (event && event.headers) || {};
  const k = h[name] != null ? name : Object.keys(h).find((x) => x.toLowerCase() === name);
  return k && h[k] != null ? String(h[k]) : '';
}

// Origin of the caller: the Origin header, or the Referer's origin when Origin is absent.
function requestOrigin(event) {
  const o = header(event, 'origin');
  if (o) return o;
  try { return new URL(header(event, 'referer')).origin; } catch (e) { return ''; }
}
function originAllowed(event) { return allowedOrigins().includes(requestOrigin(event)); }

// CORS headers that echo the caller only when it is one of our origins.
function corsHeaders(event, extra) {
  const o = header(event, 'origin');
  return Object.assign({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigins().includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }, extra || {});
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"'`]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[c]);
}

function clientIp(event) {
  return header(event, 'x-nf-client-connection-ip') || header(event, 'client-ip') || header(event, 'x-forwarded-for').split(',')[0].trim() || 'unknown';
}

// Best-effort sliding-window limiter. State lives in this function instance's
// memory, so each warm instance counts separately and a cold start resets it:
// it slows a single abusive client but is NOT a hard cap. A durable limit needs
// a shared store (Netlify rate limiting or Netlify Blobs).
const buckets = new Map();
function rateLimit(key, max, windowMs, opts) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  const ok = hits.length < max;
  if (ok && !(opts && opts.peek)) hits.push(now);
  buckets.set(key, hits);
  return { ok, retryAfter: ok ? 0 : Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
}
function rateRecord(key, windowMs) { rateLimit(key, Infinity, windowMs); }
function rateReset(key) { buckets.delete(key); }

// ---------- Netlify Blobs (durable, shared across function instances) ----------
// Every use is best effort: if @netlify/blobs is missing, the site is not on
// Netlify, or any call throws, callers fall back to in-memory behaviour.
let blobsMod; // undefined = not tried yet, null = unavailable
let storeFactory = null; // tests inject a fake store here
function getBlobStore(event, name) {
  try {
    if (storeFactory) return storeFactory(name);
    if (blobsMod === undefined) { try { blobsMod = require('@netlify/blobs'); } catch (e) { blobsMod = null; } }
    if (!blobsMod) return null;
    if (event && typeof blobsMod.connectLambda === 'function') { try { blobsMod.connectLambda(event); } catch (e) { /* already connected or not needed */ } }
    return blobsMod.getStore({ name, consistency: 'strong' });
  } catch (e) { return null; }
}
function setBlobStoreFactory(fn) { storeFactory = fn || null; }

// Compare-and-set loop on one blob: fn(currentText|null) returns the new text,
// or undefined to stop without writing. Throws if the store errors or
// contention does not clear.
async function blobUpdate(store, key, fn, tries) {
  for (let i = 0; i < (tries || 8); i++) {
    const cur = await store.getWithMetadata(key, { type: 'text' });
    const next = fn(cur ? String(cur.data) : null);
    if (next === undefined) return { written: false };
    const r = cur ? await store.set(key, next, { onlyIfMatch: cur.etag }) : await store.set(key, next, { onlyIfNew: true });
    if (r && r.modified) return { written: true, value: next };
  }
  throw new Error('blob contention');
}

// Durable fixed-window counter. Returns { ok, retryAfter } or throws.
async function blobCount(store, key, max, windowMs) {
  const win = Math.floor(Date.now() / windowMs);
  const k = 'c/' + crypto.createHash('sha256').update(key).digest('hex').slice(0, 40) + '/' + win;
  let n = 0, denied = false;
  await blobUpdate(store, k, (cur) => {
    n = parseInt(cur, 10) || 0;
    if (n >= max) { denied = true; return undefined; }
    denied = false; n += 1; return String(n);
  });
  return { ok: !denied, retryAfter: denied ? Math.max(1, Math.ceil(((win + 1) * windowMs - Date.now()) / 1000)) : 0 };
}

// Per-client limit that survives cold starts and is shared across instances.
// The in-memory limiter runs first; the Blobs counter only adds to it, and any
// Blobs error leaves the in-memory verdict standing.
async function rateLimitDurable(event, key, max, windowMs) {
  const mem = rateLimit(key, max, windowMs);
  if (!mem.ok) return mem;
  const store = getBlobStore(event, 'shorelist-limits');
  if (!store) return mem;
  try { return await blobCount(store, 'rl:' + key + ':' + max + ':' + windowMs, max, windowMs); } catch (e) { console.error('rateLimitDurable fallback:', e.message); return mem; }
}

// Hard daily ceiling across the Anthropic-calling functions (one shared count).
// AI_DAILY_CAP overrides the default of 300 calls per day (New York date).
function aiDailyCap() { const n = parseInt(process.env.AI_DAILY_CAP, 10); return Number.isFinite(n) && n >= 0 ? n : 300; }
const dayCounts = new Map(); // in-memory fallback, per instance
async function aiDailyCheck(event) {
  const cap = aiDailyCap(), day = todayNY();
  const store = getBlobStore(event, 'shorelist-limits');
  if (store) {
    try {
      let n = 0, denied = false;
      await blobUpdate(store, 'daily/ai-' + day, (cur) => { n = parseInt(cur, 10) || 0; if (n >= cap) { denied = true; return undefined; } denied = false; return String(n + 1); });
      return { ok: !denied };
    } catch (e) { console.error('aiDailyCheck fallback:', e.message); }
  }
  for (const k of dayCounts.keys()) if (k !== day) dayCounts.delete(k);
  const n = dayCounts.get(day) || 0;
  if (n >= cap) return { ok: false };
  dayCounts.set(day, n + 1);
  return { ok: true };
}
// Friendly 429 body for the daily cap.
const AI_CAP_BODY = JSON.stringify({ error: 'Our trip assistant has reached its daily limit. Please browse the tours, events and shop directly, or try again tomorrow.', code: 'daily_cap' });

// ---------- Slot reservations (oversell guard) ----------
// Checkout writes a short hold (guest count, expiry) per tour/date/slot before it
// creates the Stripe session; capacity = paid guests + live holds. A hold stops
// counting when its session is paid (metadata.holdId is seen in the Stripe list),
// when it expires (matches the session's own expiry) or when it is released.
const HOLD_MINUTES = 31; // Stripe's minimum Checkout expiry is 30 minutes
function holdKey(operatorId, dateSlot) { return 'hold/' + crypto.createHash('sha256').update(operatorId + '|' + dateSlot).digest('hex').slice(0, 40); }
// Returns { ok:true, holdId, tracked } or { ok:false, reason:'full'|'busy', left }.
// tracked:false means Blobs was unavailable and nothing was reserved (fails open: the Stripe count still applies).
async function reserveSlot(event, operatorId, dateSlot, qty, cap, paidGuests, paidHoldIds) {
  const store = getBlobStore(event, 'shorelist-holds');
  if (!store) return { ok: true, tracked: false };
  const holdId = crypto.randomBytes(9).toString('hex');
  const now = Date.now();
  let full = false, left = 0;
  try {
    await blobUpdate(store, holdKey(operatorId, dateSlot), (cur) => {
      let list = [];
      try { list = JSON.parse(cur || '[]'); } catch (e) { list = []; }
      list = list.filter((h) => h && h.exp > now && !paidHoldIds.has(h.id));
      const held = list.reduce((a, h) => a + (h.qty || 0), 0);
      left = Math.max(0, cap - paidGuests - held);
      if (qty > left) { full = true; return undefined; }
      full = false;
      list.push({ id: holdId, qty, exp: now + HOLD_MINUTES * 60000 });
      return JSON.stringify(list);
    });
    if (full) return { ok: false, reason: 'full', left };
    return { ok: true, tracked: true, holdId, expiresAt: Math.floor((now + HOLD_MINUTES * 60000) / 1000) };
  } catch (e) {
    console.error('reserveSlot:', e.message);
    return e.message === 'blob contention' ? { ok: false, reason: 'busy' } : { ok: true, tracked: false };
  }
}
async function releaseSlot(event, operatorId, dateSlot, holdId) {
  const store = getBlobStore(event, 'shorelist-holds');
  if (!store || !holdId) return;
  try { await blobUpdate(store, holdKey(operatorId, dateSlot), (cur) => { let l = []; try { l = JSON.parse(cur || '[]'); } catch (e) {} return JSON.stringify(l.filter((h) => h && h.id !== holdId)); }); } catch (e) { console.error('releaseSlot:', e.message); }
}

// ---------- Bookable tours: loaded from data/operators.json (the one source of truth) ----------
// Names shown at checkout, on receipts and in emails, prices, capacities and schedules
// come from there, never from the browser. The browser gets a public subset,
// operators-public.json, built by tools/build-operators-public.mjs. See data/README.md.
// days: 0 = Sunday. months: 0 = January. rules pick the slots for a given date.
const fs = require('fs');
const path = require('path');
function readOperatorData() {
  // netlify.toml bundles data/operators.json (included_files); try the likely layouts.
  const dirs = [path.join(__dirname, '..', '..', 'data'), path.join(__dirname, 'data'), path.join(process.env.LAMBDA_TASK_ROOT || '/var/task', 'data'), path.join(process.cwd(), 'data')];
  for (const d of dirs) { try { return JSON.parse(fs.readFileSync(path.join(d, 'operators.json'), 'utf8')); } catch (e) { /* try the next one */ } }
  try { return require('../../data/operators.json'); } catch (e) { /* static require lets the bundler inline it if the file layout differs */ }
  throw new Error('data/operators.json not found (check included_files in netlify.toml)');
}
const isInt = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
function buildCity(data) {
  const fail = (m) => { throw new Error('operators.json: ' + m); };
  if (!data || data.schemaVersion !== 1 || !Array.isArray(data.operators) || !Array.isArray(data.tours) || !data.defaults) fail('bad shape');
  const d = data.defaults;
  if (!isInt(d.capacity, 1, 1000) || !isInt(d.cancellationHours, 0, 720) || !d.tax || !(d.tax.rate >= 0 && d.tax.rate < 1) || typeof d.tax.label !== 'string') fail('bad defaults');
  const ops = new Map();
  for (const o of data.operators) { if (!o || typeof o.id !== 'string' || typeof o.name !== 'string' || ops.has(o.id)) fail('bad operator ' + (o && o.id)); ops.set(o.id, o); }
  const tours = {};
  for (const t of data.tours) {
    if (!t || typeof t.id !== 'string' || Object.prototype.hasOwnProperty.call(tours, t.id)) fail('bad or duplicate tour ' + (t && t.id));
    const op = ops.get(t.operatorId), sch = t.schedule;
    if (!op) fail(t.id + ': unknown operator');
    if (typeof t.category !== 'string' || typeof t.name !== 'string' || typeof t.live !== 'boolean') fail(t.id + ': bad fields');
    if (!isInt(t.priceCents, 1, 10000000)) fail(t.id + ': bad price');
    if (t.capacity != null && !isInt(t.capacity, 1, 1000)) fail(t.id + ': bad capacity');
    const slotsOk = (a) => Array.isArray(a) && a.length > 0 && a.every((x) => typeof x === 'string' && x);
    if (!sch || !Array.isArray(sch.days) || !sch.days.every((x) => isInt(x, 0, 6)) || !slotsOk(sch.slots)) fail(t.id + ': bad schedule');
    if (sch.months && !(Array.isArray(sch.months) && sch.months.every((x) => isInt(x, 0, 11)))) fail(t.id + ': bad months');
    if (sch.rules && !(Array.isArray(sch.rules) && sch.rules.every((r) => r && slotsOk(r.slots)))) fail(t.id + ': bad rules');
    const tour = { category: t.category, label: t.name, operator: op.name, live: t.live, days: sch.days, slots: sch.slots, priceCents: t.priceCents, capacity: t.capacity || d.capacity };
    if (sch.rules) tour.rules = sch.rules;
    if (sch.months) tour.months = sch.months;
    tours[t.id] = tour;
  }
  return { id: String(data.city), name: String(data.name || ''), timezone: String(data.timezone || 'America/New_York'), defaults: d, tours };
}
// Loaded on first use, so functions that never touch tours (guide downloads) do not need the file.
let cityCache = null;
function city() { return cityCache || (cityCache = buildCity(readOperatorData())); }
function getTour(id) { const T = city().tours; return typeof id === 'string' && Object.prototype.hasOwnProperty.call(T, id) ? T[id] : null; }

// Same rule order as getSlots() in category-app.js.
function slotsFor(tour, dateStr) {
  for (const r of tour.rules || []) {
    if (r.mdFrom && r.mdUntil) {
      const md = dateStr.slice(5);
      const hit = r.mdFrom <= r.mdUntil ? (md >= r.mdFrom && md <= r.mdUntil) : (md >= r.mdFrom || md <= r.mdUntil);
      if (hit) return r.slots;
    } else {
      if (r.from && dateStr < r.from) continue;
      if (r.until && dateStr > r.until) continue;
      return r.slots;
    }
  }
  return tour.slots;
}

const BOOKING_HORIZON_DAYS = 550; // about 18 months ahead; the calendar itself has no end
function todayNY(now) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(now || new Date()); }
function addDays(ymd, n) { const d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

// Returns '' when the date and slot are ones this tour really runs, else a reason.
function checkDateSlot(tour, date, slot) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'date';
  const d = new Date(date + 'T00:00:00Z');
  if (isNaN(d) || d.toISOString().slice(0, 10) !== date) return 'date';
  const today = todayNY();
  if (date < today) return 'past';
  if (date > addDays(today, BOOKING_HORIZON_DAYS)) return 'horizon';
  if (!tour.days.includes(d.getUTCDay())) return 'day';
  if (tour.months && !tour.months.includes(d.getUTCMonth())) return 'day';
  if (typeof slot !== 'string' || !slotsFor(tour, date).includes(slot)) return 'slot';
  return '';
}

// ---------- Digital guides (PDF downloads) ----------
// Server-side catalog. Prices, names and file names come ONLY from here: the
// browser sends a product id and nothing else. `file` is a name inside
// netlify/guides-private/ (never published; see netlify.toml). Keep the copy
// in step with guides.html.
const GUIDES = {
  'beach-day-field-guide':    { title: 'The Beach Day Field Guide', cents: 1400, file: 'beach-day-field-guide.pdf', pages: 16 },
  'wilmington-in-three-days': { title: 'Wilmington in Three Days', cents: 1400, file: 'wilmington-in-three-days.pdf', pages: 16 },
  'wilmington-with-kids':     { title: 'Wilmington with Kids', cents: 1400, file: 'wilmington-with-kids.pdf', pages: 17 },
  'winter-in-wilmington':     { title: 'Winter in Wilmington', cents: 1400, file: 'winter-in-wilmington.pdf', pages: 16 },
  'wilmington-holidays-2026': { title: "Wilmington Holidays 2026", cents: 1400, file: 'wilmington-holidays-2026.pdf', pages: 17 },
  'dog-friendly-wilmington': { title: "Dog-Friendly Wilmington", cents: 1400, file: 'dog-friendly-wilmington.pdf', pages: 21 },
  'free-and-low-cost-wilmington': { title: "Free & Low-Cost Wilmington", cents: 1400, file: 'free-and-low-cost-wilmington.pdf', pages: 17 },
  'day-trips-from-wilmington': { title: "Day Trips from Wilmington", cents: 1400, file: 'day-trips-from-wilmington.pdf', pages: 20 },
  'on-the-water-wilmington': { title: "On the Water: Wilmington", cents: 1400, file: 'on-the-water-wilmington.pdf', pages: 18 },
  'rainy-day-wilmington': { title: "Rainy Day Wilmington", cents: 1400, file: 'rainy-day-wilmington.pdf', pages: 20 },
  'wilmington-on-screen': { title: "Wilmington on Screen", cents: 1400, file: 'wilmington-on-screen.pdf', pages: 20 },
};
// The bundle is the original four guides only; later guides are sold singly.
const BUNDLE_IDS = ['beach-day-field-guide', 'wilmington-in-three-days', 'wilmington-with-kids', 'winter-in-wilmington'];
const GUIDE_BUNDLE = { id: 'guide-bundle', title: 'Wilmington Guide Bundle (all four guides)', cents: 3900 };
function getGuide(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(GUIDES, id) ? GUIDES[id] : null; }
// A purchasable product id (one guide or the bundle) -> { title, cents, ids }, else null.
function getGuideProduct(id) {
  if (id === GUIDE_BUNDLE.id) return { title: GUIDE_BUNDLE.title, cents: GUIDE_BUNDLE.cents, ids: BUNDLE_IDS.slice() };
  const g = getGuide(id);
  return g ? { title: g.title, cents: g.cents, ids: [id] } : null;
}

// ---------- Booking-source attribution (first touch, captured by attrib.js) ----------
// Allowlist + length caps + sanitize. No personal data: campaign tags, a landing path and a referrer host only.
// Stored as Stripe metadata attr_<field>; anything else the browser sends is dropped.
const ATTRIB_FIELDS = { utm_source: 60, utm_medium: 60, utm_campaign: 80, ref: 60, landing: 100, referrer_host: 80 };
function cleanAttrib(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [k, max] of Object.entries(ATTRIB_FIELDS)) {
    const v = raw[k];
    if (typeof v !== 'string') continue;
    const c = v.toLowerCase().replace(/[^a-z0-9._~:\/ +-]+/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
    if (c) out[k] = c;
  }
  return out;
}
// { attr_utm_source: '...', ... } ready to merge into Stripe metadata.
function attribMetadata(raw) {
  const m = {}, a = cleanAttrib(raw);
  for (const k of Object.keys(a)) m['attr_' + k] = a[k];
  return m;
}
// One human line from a session's metadata, for the owner email: "google / organic / spring · ref x · landing /path · via host".
function attribSummary(meta) {
  const g = (k) => (meta && typeof meta['attr_' + k] === 'string' ? meta['attr_' + k] : '');
  const parts = [[g('utm_source'), g('utm_medium'), g('utm_campaign')].filter(Boolean).join(' / ')];
  if (g('ref')) parts.push('ref ' + g('ref'));
  if (g('landing')) parts.push('landing ' + g('landing'));
  if (g('referrer_host')) parts.push('via ' + g('referrer_host'));
  return parts.filter(Boolean).join(' · ');
}

const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]{8,250}$/;
// Asks Stripe (never the browser) whether this Checkout Session is PAID and is a
// guide order. Returns { ok:true, ids, session } with ids = guide ids the buyer
// owns (from the metadata our own create-guide-checkout wrote, filtered through
// GUIDES), or { ok:false }. Unpaid, open, expired, tour and unknown sessions
// are all just { ok:false }. Throws only if Stripe cannot be reached.
async function paidGuideSession(stripeKey, id) {
  if (typeof id !== 'string' || !SESSION_ID_RE.test(id)) return { ok: false };
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, { headers: { 'Authorization': `Bearer ${stripeKey}` } });
  if (res.status >= 500) throw new Error('stripe ' + res.status);
  const session = await res.json();
  if (!res.ok || !session || session.payment_status !== 'paid') return { ok: false };
  const meta = session.metadata || {};
  if (meta.kind !== 'guide') return { ok: false };
  const ids = String(meta.guideIds || '').split(',').filter((g, i, a) => getGuide(g) && a.indexOf(g) === i);
  return ids.length ? { ok: true, ids, session } : { ok: false };
}

// Completed Checkout Sessions, newest first, every page. Stripe has no search
// endpoint for Checkout Sessions (the old /search call always failed, so the
// capacity check never ran); the list endpoint is exact and read-after-write
// safe. Throws on any Stripe error so callers can decide to fail closed.
const MAX_PAGES = 30; // 3,000 paid bookings in the window; beyond that, throw rather than guess
async function listCompleteSessions(stripeKey, createdGte) {
  const out = [];
  let after = '';
  for (let page = 0; ; page++) {
    if (page >= MAX_PAGES) throw new Error('too many sessions to scan');
    let url = 'https://api.stripe.com/v1/checkout/sessions?status=complete&limit=100';
    if (createdGte) url += '&created[gte]=' + Math.floor(createdGte);
    if (after) url += '&starting_after=' + encodeURIComponent(after);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${stripeKey}` } });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.data)) throw new Error('stripe list ' + res.status);
    out.push(...data.data);
    if (!data.has_more || !data.data.length) return out;
    after = data.data[data.data.length - 1].id;
  }
}
// Bookings can only be made BOOKING_HORIZON_DAYS ahead, so older sessions cannot hold a future seat.
function capacityWindowStart() { return Date.now() / 1000 - (BOOKING_HORIZON_DAYS + 2) * 86400; }

module.exports = {
  ORIGINS, allowedOrigins, header, requestOrigin, originAllowed, corsHeaders, escapeHtml, clientIp,
  rateLimit, rateRecord, rateReset, get CITY() { return city(); }, get TOURS() { return city().tours; }, getTour, slotsFor, checkDateSlot, todayNY, addDays,
  BOOKING_HORIZON_DAYS, listCompleteSessions, capacityWindowStart,
  getBlobStore, setBlobStoreFactory, blobUpdate, rateLimitDurable, aiDailyCap, aiDailyCheck, AI_CAP_BODY,
  reserveSlot, releaseSlot,
  cleanAttrib, attribMetadata, attribSummary,
  GUIDES, GUIDE_BUNDLE, getGuide, getGuideProduct, SESSION_ID_RE, paidGuideSession,
};

// Netlify publishes every file in this folder as a function; this one has nothing to serve.
module.exports.handler = async () => ({ statusCode: 404, body: '' });
