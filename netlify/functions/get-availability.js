// ShoreList — Get Availability
// Queries Stripe Checkout Sessions to find booked slots for a given operator + month
// This prevents double bookings without any external database

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    return { statusCode: 200, headers, body: JSON.stringify({ booked: [] }) };
  }

  const params = event.queryStringParameters || {};
  const { operatorId, year, month } = params;

  if (!operatorId || !year || !month) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required params: operatorId, year, month' }) };
  }

  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

  try {
    const query = `metadata["operatorId"]:"${operatorId}" AND metadata["yearMonth"]:"${yearMonth}"`;
    const searchUrl = `https://api.stripe.com/v1/checkout/sessions/search?query=${encodeURIComponent(query)}&limit=100`;

    const res = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
    });

    const data = await res.json();

    if (!res.ok) {
      console.log('Stripe search unavailable:', data.error?.message);
      return { statusCode: 200, headers, body: JSON.stringify({ booked: [] }) };
    }

    const booked = (data.data || [])
      .filter(s => s.status === 'complete' || s.payment_status === 'paid')
      .map(s => ({
        date:     s.metadata?.date     || '',
        timeSlot: s.metadata?.timeSlot || '',
      }))
      .filter(b => b.date && b.timeSlot);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ booked, count: booked.length }),
    };

  } catch (err) {
    console.error('get-availability error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ booked: [] }),
    };
  }
};
