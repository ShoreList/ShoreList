// ShoreList — Get Availability
// Lists paid Stripe Checkout Sessions to find booked slots for a given operator + month
// This prevents double bookings without any external database

const { corsHeaders, getTour, listCompleteSessions, capacityWindowStart } = require('./_shared.js');

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-cache, no-store' });

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

  // Only known tours and real months: nothing from the query string reaches Stripe.
  const y = Number(year), m = Number(month);
  if (!getTour(operatorId) || !Number.isInteger(y) || y < 2024 || y > 2100 || !Number.isInteger(m) || m < 1 || m > 12) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid params' }) };
  }
  const yearMonth = `${y}-${String(m).padStart(2, '0')}`;

  try {
    // Display only: on error the calendar shows everything open and create-checkout still enforces capacity.
    const sessions = await listCompleteSessions(STRIPE_KEY, capacityWindowStart());
    const data = { data: sessions.filter(s => s.metadata && s.metadata.operatorId === operatorId && s.metadata.yearMonth === yearMonth) };

    // Aggregate total guests per date + time slot (capacity is enforced, not published)
    const tally = {};
    (data.data || [])
      .filter(s => s.status === 'complete' || s.payment_status === 'paid')
      .forEach(s => {
        const date = s.metadata?.date || '';
        const timeSlot = s.metadata?.timeSlot || '';
        if (!date || !timeSlot) return;
        const guests = parseInt(s.metadata?.partySize, 10) || 1;
        const key = `${date}|${timeSlot}`;
        tally[key] = (tally[key] || 0) + guests;
      });

    const booked = Object.entries(tally).map(([key, guests]) => {
      const [date, timeSlot] = key.split('|');
      return { date, timeSlot, guests };
    });

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
