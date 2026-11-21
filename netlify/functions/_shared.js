// ShoreList — shared helpers for the functions in this folder (not an endpoint).
// Origin allowlist, HTML escaping, a best-effort rate limiter, the server-side
// tour table and the paid-booking lookup used for capacity.

// The site's own origins. process.env.URL is the primary site URL Netlify sets.
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
};

// Netlify publishes every file in this folder as a function; this one has nothing to serve.
module.exports.handler = async () => ({ statusCode: 404, body: '' });
