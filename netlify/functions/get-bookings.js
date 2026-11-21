// ShoreList — Get Bookings (Dashboard)
// Password-protected endpoint that returns all bookings from Stripe

const crypto = require('crypto');
const { clientIp, rateLimit, rateRecord, rateReset, listCompleteSessions } = require('./_shared.js');

// Wrong-password limit: 5 misses per IP in 15 minutes, then that IP waits. Counted in this
// instance's memory (best effort, see _shared.js). It expires by itself, so the owner is
// never locked out for good, and a correct login clears it.
const FAILS = { max: 5, windowMs: 15 * 60000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a || '')).digest();
  const hb = crypto.createHash('sha256').update(String(b || '')).digest();
  return crypto.timingSafeEqual(ha, hb);
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': 'https://shorelist.net',
    'Access-Control-Allow-Headers': 'Content-Type, X-Dashboard-Key',
    'Vary': 'Origin',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  const DASH_PASS  = process.env.DASHBOARD_PASSWORD;

  if (!STRIPE_KEY || !DASH_PASS) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Not configured' }) };
  }

  // Password is sent in a header, never in the URL (URLs end up in logs and history).
  const sent = (event.headers && (event.headers['x-dashboard-key'] || event.headers['X-Dashboard-Key'])) || '';
  const failKey = 'dash-fail:' + clientIp(event);
  const gate = rateLimit(failKey, FAILS.max, FAILS.windowMs, { peek: true });
  if (!gate.ok) {
    return { statusCode: 429, headers: { ...headers, 'Retry-After': String(gate.retryAfter) }, body: JSON.stringify({ error: 'Too many attempts. Please wait a few minutes and try again.' }) };
  }
  if (!safeEqual(sent, DASH_PASS)) {
    rateRecord(failKey, FAILS.windowMs);
    console.warn('get-bookings: failed dashboard login');
    await sleep(600); // slows guessing; one miss by the owner costs under a second
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  rateReset(failKey);

  try {
    // Every page of completed sessions, so totals stay right past 100 bookings.
    const sessions = await listCompleteSessions(STRIPE_KEY);

    const bookings = sessions.map(s => ({
      id:          s.id,
      created:     s.created,
      amount:      s.amount_total,
      guestName:   s.metadata?.guestName    || 'Unknown',
      guestEmail:  s.customer_email          || s.metadata?.guestEmail || '',
      guestPhone:  s.metadata?.guestPhone    || '',
      category:    s.metadata?.categoryLabel || '',
      operator:    s.metadata?.operatorName  || '',
      operatorId:  s.metadata?.operatorId    || '',
      date:        s.metadata?.date          || '',
      timeSlot:    s.metadata?.timeSlot      || '',
      partySize:   s.metadata?.partySize     || '',
      notes:       s.metadata?.notes         || '',
      status:      s.payment_status,
    }));

    bookings.sort((a, b) => b.created - a.created);

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const byCategory   = {};
    bookings.forEach(b => {
      byCategory[b.category] = (byCategory[b.category] || 0) + 1;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        bookings,
        summary: {
          total: bookings.length,
          totalRevenue,
          byCategory,
        },
      }),
    };
  } catch (err) {
    console.error('get-bookings error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Could not load bookings' }),
    };
  }
};
