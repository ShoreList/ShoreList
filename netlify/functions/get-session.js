// ShoreList — Get Session Details
// Called from the success page to display booking confirmation.
// Answers only for a PAID session, and only with what the page shows.

const { corsHeaders, getTour } = require('./_shared.js');

const NOT_CONFIRMED = { error: 'Booking could not be confirmed' };

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    console.error('get-session: STRIPE_SECRET_KEY is not set');
    return { statusCode: 500, headers, body: JSON.stringify(NOT_CONFIRMED) };
  }

  // Stripe Checkout Session ids: cs_test_ or cs_live_ followed by letters and digits.
  const { id } = event.queryStringParameters || {};
  if (typeof id !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]{8,250}$/.test(id)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid session ID' }) };
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
    });

    const session = await res.json();
    if (!res.ok) throw new Error('stripe ' + res.status);

    // Unpaid, open and expired sessions look exactly like "not found" to the caller.
    if (session.payment_status !== 'paid') {
      return { statusCode: 404, headers, body: JSON.stringify(NOT_CONFIRMED) };
    }

    const meta = session.metadata || {};
    const tour = getTour(meta.operatorId); // prefer our own names over stored text
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        paid:          true,
        guestName:     meta.guestName || '',
        categoryLabel: tour ? tour.label : (meta.categoryLabel || ''),
        operatorName:  tour ? tour.operator : (meta.operatorName || ''),
        date:          meta.date      || '',
        timeSlot:      meta.timeSlot  || '',
        partySize:     meta.partySize || '',
        amount:        Number.isFinite(session.amount_total) ? session.amount_total : null,
      }),
    };
  } catch (err) {
    console.error('get-session error:', err.message);
    return { statusCode: 400, headers, body: JSON.stringify(NOT_CONFIRMED) };
  }
};
