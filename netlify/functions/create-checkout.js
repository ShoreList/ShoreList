// ShoreList — Stripe Checkout Function
// No npm dependencies — uses native fetch (Node 18+, Netlify default)

const { corsHeaders, getTour, checkDateSlot, listCompleteSessions, capacityWindowStart, reserveSlot, releaseSlot } = require('./_shared.js');

// Free text typed by the guest: one line, no control characters, bounded length.
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

exports.handler = async (event) => {
  const headers = corsHeaders(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const bad = (msg, code) => ({ statusCode: code || 400, headers, body: JSON.stringify({ error: msg }) });

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    console.error('create-checkout: STRIPE_SECRET_KEY is not set');
    return bad('Checkout is unavailable right now. Please try again later.', 500);
  }

  let data;
  try {
    data = JSON.parse(String(event.body || '').slice(0, 10000));
  } catch {
    return bad('Invalid request body');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return bad('Invalid request body');

  // The tour, its names and its schedule come from the server table, keyed by id.
  // operatorName / categoryLabel / category sent by the browser are ignored.
  const tour = getTour(data.operatorId);
  if (!tour) return bad('Unknown experience — please refresh and try again.');
  if (!tour.live) return bad('That experience is not open for booking yet.');
  const operatorId = data.operatorId;

  const why = checkDateSlot(tour, data.date, data.timeSlot);
  if (why === 'slot') return bad('That time is not available — please pick a time from the calendar.');
  if (why) return bad('That date is not available — please pick another date from the calendar.');
  const date = data.date, timeSlot = data.timeSlot; // now known-safe: strict date format, slot from the table

  const guestName  = clean(data.guestName, 100);
  const guestEmail = clean(data.guestEmail, 254);
  const guestPhone = clean(data.guestPhone, 40);
  if (!guestName) return bad('Please enter your full name.');
  if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(guestEmail)) return bad('Please enter a valid email address.');

  const siteUrl = process.env.URL || 'https://shorelist.net';
  const yearMonth = date.substring(0, 7);

  // Server-side price list — never trust the amount sent by the browser
  const PRICES = {
    'wwt-original':    2500,
    'wwt-happyhour':   3000,
    'wwt-speakeasy':   3000,
    'wwt-candlelight': 2000,
    'cbt-mural':       3000,
    'cbt-divebar':     3000,
    'ron-film':        4500,
    'sean-ghost':      3000,
    'james-surf':      10000,
    'nature-walk':     3500,
  };
  const unitAmount = PRICES[operatorId];
  if (!unitAmount) {
    return bad('Unknown experience — please refresh and try again.');
  }
  const qty = Number(data.partySize);
  if (!Number.isInteger(qty) || qty < 1 || qty > 12) return bad('Please choose a party size between 1 and 12.');

  // Capacity check — max guests per tour time slot (internal limits, not published)
  const CAPS = {
    'wwt-original':    24,
    'wwt-happyhour':   16,
    'wwt-speakeasy':   16,
    'wwt-candlelight': 24,
    'cbt-mural':       24,
    'cbt-divebar':     20,
  };
  const SLOT_CAP = CAPS[operatorId] || 25;
  // Count paid guests already booked on this tour, date and time. Fails CLOSED:
  // if Stripe cannot be read we refuse rather than risk overselling the slot.
  let hold = null; // slot reservation (Netlify Blobs); null when Blobs is unavailable
  const dateSlot = `${date}|${timeSlot}`;
  try {
    const sessions = await listCompleteSessions(STRIPE_KEY, capacityWindowStart());
    const bookedGuests = sessions
      .filter(s => s.metadata && s.metadata.operatorId === operatorId && s.metadata.dateSlot === dateSlot)
      .reduce((sum, s) => sum + (parseInt(s.metadata.partySize, 10) || 1), 0);
    if (bookedGuests >= SLOT_CAP) {
      return bad('That time is now sold out — please choose a different date or time.', 409);
    }
    if (bookedGuests + qty > SLOT_CAP) {
      return bad('Not enough spots remain at that time for your party size — please pick a different time or reduce your party size.', 409);
    }
    // Atomically reserve qty seats against paid guests plus other live holds, so two
    // simultaneous checkouts cannot both pass the check above for the last seats.
    const paidHoldIds = new Set(sessions.map(s => s.metadata && s.metadata.holdId).filter(Boolean));
    const r = await reserveSlot(event, operatorId, dateSlot, qty, SLOT_CAP, bookedGuests, paidHoldIds);
    if (!r.ok && r.reason === 'busy') return bad('That time is in high demand. Please try again in a moment.', 503);
    if (!r.ok) return bad(r.left > 0 ? 'Not enough spots remain at that time for your party size — please pick a different time or reduce your party size.' : 'That time is now sold out — please choose a different date or time.', 409);
    if (r.tracked) hold = r;
  } catch (e) {
    console.error('create-checkout: capacity check failed:', e.message);
    return bad('We could not check availability just now. Please try again in a moment.', 503);
  }

  const p = new URLSearchParams();
  p.set('payment_method_types[0]', 'card');
  p.set('line_items[0][price_data][currency]', 'usd');
  p.set('line_items[0][price_data][product_data][name]', `${tour.label} · ${tour.operator || 'ShoreList'}`);
  p.set('line_items[0][price_data][product_data][description]', `${date} at ${timeSlot} — Free cancellation 24+ hrs before`);
  p.set('line_items[0][price_data][unit_amount]', String(unitAmount));
  p.set('line_items[0][quantity]', String(qty));

  // NC sales tax — 7% (4.75% state + 2.25% New Hanover County), sourced to event location
  const TAX_RATE = 0.07;
  const taxCents = Math.round(unitAmount * qty * TAX_RATE);
  p.set('line_items[1][price_data][currency]', 'usd');
  p.set('line_items[1][price_data][product_data][name]', 'NC Sales Tax (7%)');
  p.set('line_items[1][price_data][unit_amount]', String(taxCents));
  p.set('line_items[1][quantity]', '1');
  p.set('mode', 'payment');
  p.set('customer_email', guestEmail);
  p.set('success_url', `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${siteUrl}/things-to-do/${encodeURIComponent(tour.category)}`);
  p.set('payment_intent_data[receipt_email]', guestEmail);
  // The session lives exactly as long as the seat hold, so an abandoned checkout frees its seats.
  if (hold) p.set('expires_at', String(hold.expiresAt));

  const meta = {
    operatorId:    operatorId,
    operatorName:  tour.operator,
    category:      tour.category,
    categoryLabel: tour.label,
    guestName:     guestName,
    guestEmail:    guestEmail,
    guestPhone:    guestPhone,
    date:          date,
    timeSlot:      timeSlot,
    partySize:     String(qty),
    taxCents:      String(taxCents),
    notes:         clean(data.notes, 490),
    yearMonth:     yearMonth,
    dateSlot:      dateSlot,
  };
  if (hold) meta.holdId = hold.holdId;

  Object.entries(meta).forEach(([k, v]) => p.set(`metadata[${k}]`, v));

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: p.toString(),
    });

    const session = await res.json();

    if (!res.ok || !session.url) {
      console.error('Stripe error:', session.error && session.error.type, session.error && session.error.code, session.error && session.error.message);
      throw new Error('Stripe session creation failed');
    }

    // Only the redirect URL goes back: the session id is not needed by the browser.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    console.error('create-checkout error:', err.message);
    if (hold) await releaseSlot(event, operatorId, dateSlot, hold.holdId);
    return bad('Checkout could not be started. Please try again in a moment.', 500);
  }
};
