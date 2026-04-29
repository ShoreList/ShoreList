// ShoreList — Get Bookings (Dashboard)
// Password-protected endpoint that returns all bookings from Stripe

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  const DASH_PASS  = process.env.DASHBOARD_PASSWORD || 'shorelist2025';

  if (!STRIPE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Not configured' }) };
  }

  const { password } = event.queryStringParameters || {};
  if (password !== DASH_PASS) {
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
