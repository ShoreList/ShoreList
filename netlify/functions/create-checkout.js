// ShoreList — Stripe Checkout Function
// No npm dependencies — uses native fetch (Node 18+, Netlify default)

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Netlify environment variables.' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const siteUrl = process.env.URL || 'https://shorelist.net';
  const yearMonth = (data.date || '').substring(0, 7);

  const p = new URLSearchParams();
  p.set('payment_method_types[0]', 'card');
  p.set('line_items[0][price_data][currency]', 'usd');
  p.set('line_items[0][price_data][product_data][name]', `${data.categoryLabel || 'Experience'} · ${data.operatorName || 'ShoreList'}`);
  p.set('line_items[0][price_data][product_data][description]', `${data.partySize || '1'} guest(s) · ${data.date || ''}${data.timeSlot ? ' at ' + data.timeSlot : ''} — Fully refundable deposit`);
  p.set('line_items[0][price_data][unit_amount]', String(data.priceInCents || 2500));
  p.set('line_items[0][quantity]', '1');
  p.set('mode', 'payment');
  p.set('customer_email', data.guestEmail || '');
  p.set('success_url', `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${siteUrl}/category?cat=${encodeURIComponent(data.category || '')}`);
  p.set('payment_intent_data[receipt_email]', data.guestEmail || '');

  const meta = {
    operatorId:    data.operatorId    || '',
    operatorName:  data.operatorName  || '',
    category:      data.category      || '',
    categoryLabel: data.categoryLabel || '',
    guestName:     data.guestName     || '',
    guestEmail:    data.guestEmail    || '',
    guestPhone:    data.guestPhone    || '',
    date:          data.date          || '',
    timeSlot:      data.timeSlot      || '',
    partySize:     String(data.partySize || ''),
    notes:         (data.notes || '').substring(0, 490),
    yearMonth:     yearMonth,
    dateSlot:      `${data.date || ''}|${data.timeSlot || ''}`,
  };

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

    if (!res.ok) {
      console.error('Stripe error:', session.error);
      throw new Error(session.error?.message || 'Stripe session creation failed');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };

  } catch (err) {
    console.error('create-checkout error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
