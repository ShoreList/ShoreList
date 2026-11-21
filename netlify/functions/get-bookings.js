// ShoreList — Get Bookings (Dashboard)
// Password-protected endpoint that returns all bookings from Stripe

const crypto = require('crypto');

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
  if (!safeEqual(sent, DASH_PASS)) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const res = await fetch(
      'https://api.stripe.com/v1/checkout/sessions?limit=100&status=complete',
      { headers: { 'Authorization': `Bearer ${STRIPE_KEY}` } }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Stripe error');

    const bookings = (data.data || []).map(s => ({
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
      body: JSON.stringify({ error: err.message }),
    };
  }
};
