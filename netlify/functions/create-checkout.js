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
  const unitAmount = PRICES[data.operatorId];
  if (!unitAmount) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown experience — please refresh and try again.' }) };
  }
  const qty = Math.min(Math.max(parseInt(data.partySize, 10) || 1, 1), 12);

  // Capacity check — max guests per tour time slot (internal limits, not published)
  const CAPS = {
    'wwt-original':    24,
    'wwt-happyhour':   16,
    'wwt-speakeasy':   16,
    'wwt-candlelight': 24,
    'cbt-mural':       24,
    'cbt-divebar':     20,
  };
  const SLOT_CAP = CAPS[data.operatorId] || 25;
  if (data.date && data.timeSlot) {
    try {
      const capQuery = `metadata["operatorId"]:"${data.operatorId}" AND metadata["dateSlot"]:"${data.date}|${data.timeSlot}"`;
      const capRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/search?query=${encodeURIComponent(capQuery)}&limit=100`, {
        headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
      });
      const capData = await capRes.json();
      if (capRes.ok) {
        const bookedGuests = (capData.data || [])
          .filter(s => s.status === 'complete' || s.payment_status === 'paid')
          .reduce((sum, s) => sum + (parseInt(s.metadata?.partySize, 10) || 1), 0);
        if (bookedGuests >= SLOT_CAP) {
          return { statusCode: 409, headers, body: JSON.stringify({ error: 'That time is now sold out — please choose a different date or time.' }) };
        }
        if (bookedGuests + qty > SLOT_CAP) {
          return { statusCode: 409, headers, body: JSON.stringify({ error: 'Not enough spots remain at that time for your party size — please pick a different time or reduce your party size.' }) };
        }
      }
    } catch (e) {
      console.log('Capacity check skipped:', e.message);
    }
  }

  const p = new URLSearchParams();
  p.set('payment_method_types[0]', 'card');
  p.set('line_items[0][price_data][currency]', 'usd');
  p.set('line_items[0][price_data][product_data][name]', `${data.categoryLabel || 'Experience'} · ${data.operatorName || 'ShoreList'}`);
  p.set('line_items[0][price_data][product_data][description]', `${data.date || ''}${data.timeSlot ? ' at ' + data.timeSlot : ''} — Free cancellation 24+ hrs before`);
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
    partySize:     String(qty),
      taxCents:      String(taxCents),
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
