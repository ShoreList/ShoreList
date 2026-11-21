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

// Server-side copy of the bookable tours (same ids, names and schedules as OPS
// in category-app.js). Names shown at checkout, on receipts and in emails come
// from here, never from the browser. Keep in step with category-app.js.
// days: 0 = Sunday. months: 0 = January. rules pick the slots for a given date.
const TOURS = {
  'wwt-original':    { category: 'walking-tours', label: 'The Original History & Architecture Tour', operator: 'Wilmington Walking Tours', live: true,
                       days: [0, 1, 3, 4, 5, 6], slots: ['9:00 AM'], rules: [{ mdFrom: '03-15', mdUntil: '11-14', slots: ['9:00 AM'] }, { slots: ['11:30 AM'] }] },
  'wwt-happyhour':   { category: 'walking-tours', label: 'Historic Happy Hour Tour', operator: 'Wilmington Walking Tours', live: true,
                       days: [5], slots: ['6:00 PM'], rules: [{ until: '2026-09-04', slots: ['6:00 PM'] }, { slots: ['5:00 PM'] }] },
  'wwt-speakeasy':   { category: 'walking-tours', label: 'Speakeasy & Prohibition Walking Tour', operator: 'Wilmington Walking Tours', live: true,
                       days: [5], slots: ['6:00 PM'], rules: [{ until: '2026-09-04', slots: ['6:00 PM'] }, { slots: ['5:00 PM'] }] },
  'wwt-candlelight': { category: 'walking-tours', label: 'Christmas Candlelight Victorians Walk', operator: 'Wilmington Walking Tours', live: true,
                       days: [1, 3, 5, 6], slots: ['4:30 PM', '6:15 PM'], months: [11] },
  'cbt-mural':       { category: 'walking-tours', label: 'Carolina Beach History & Mural Walk', operator: 'Carolina Beach Tours', live: true,
                       days: [2], slots: ['9:30 AM'], months: [4, 5, 6, 7, 8] },
  'cbt-divebar':     { category: 'walking-tours', label: 'Carolina Beach History & Dive Bar Tour', operator: 'Carolina Beach Tours', live: true,
                       days: [3], slots: ['5:30 PM'], months: [4, 5, 6, 7, 8] },
  // Not live on the site yet: checkout refuses these until live is true here too.
  'ron-film':        { category: 'film-tours', label: 'Wilmywood Insider Tours', operator: 'Industry Insider & Local Expert', live: false,
                       days: [3, 4, 5, 6, 0], slots: ['10:00 AM', '2:00 PM', '6:00 PM'] },
  'sean-ghost':      { category: 'ghost-tours', label: "Sean Austin's Wilmington Ghost Walk", operator: 'Sean Austin', live: false,
                       days: [4, 5, 6, 0], slots: ['7:00 PM', '8:30 PM', '10:00 PM'] },
  'james-surf':      { category: 'surf-lessons', label: 'Carolina Beach Surf Co.', operator: 'Certified Local Instructor', live: false,
                       days: [1, 2, 4, 5, 6, 0], slots: ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM'] },
  'nature-walk':     { category: 'nature-walks', label: 'Coastal Carolina Nature Walks', operator: '', live: false,
                       days: [3, 6, 0], slots: ['8:00 AM', '10:00 AM', '2:00 PM'] },
};
function getTour(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(TOURS, id) ? TOURS[id] : null; }

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
};
const GUIDE_BUNDLE = { id: 'guide-bundle', title: 'Wilmington Guide Bundle (all four guides)', cents: 3900 };
function getGuide(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(GUIDES, id) ? GUIDES[id] : null; }
// A purchasable product id (one guide or the bundle) -> { title, cents, ids }, else null.
function getGuideProduct(id) {
  if (id === GUIDE_BUNDLE.id) return { title: GUIDE_BUNDLE.title, cents: GUIDE_BUNDLE.cents, ids: Object.keys(GUIDES) };
  const g = getGuide(id);
  return g ? { title: g.title, cents: g.cents, ids: [id] } : null;
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
  rateLimit, rateRecord, rateReset, TOURS, getTour, slotsFor, checkDateSlot, todayNY, addDays,
  BOOKING_HORIZON_DAYS, listCompleteSessions, capacityWindowStart,
  getBlobStore, setBlobStoreFactory, blobUpdate, rateLimitDurable, aiDailyCap, aiDailyCheck, AI_CAP_BODY,
  reserveSlot, releaseSlot,
  GUIDES, GUIDE_BUNDLE, getGuide, getGuideProduct, SESSION_ID_RE, paidGuideSession,
};

// Netlify publishes every file in this folder as a function; this one has nothing to serve.
module.exports.handler = async () => ({ statusCode: 404, body: '' });
