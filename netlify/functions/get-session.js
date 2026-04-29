// ShoreList — Get Session Details
// Called from the success page to display booking confirmation

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Not configured' }) };
  }

  const { id } = event.queryStringParameters || {};
  if (!id || !id.startsWith('cs_')) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid session ID' }) };
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_KEY}` },
    });

    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || 'Session not found');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        guestName:     session.metadata?.guestName     || '',
        guestEmail:    session.customer_email           || session.metadata?.guestEmail || '',
        categoryLabel: session.metadata?.categoryLabel || '',
        operatorName:  session.metadata?.operatorName  || '',
        date:          session.metadata?.date          || '',
        timeSlot:      session.metadata?.timeSlot      || '',
        partySize:     session.metadata?.partySize     || '',
        notes:         session.metadata?.notes         || '',
        amount:        session.amount_total            || 2500,
        category:      session.metadata?.category      || '',
        status:        session.status,
      }),
    };
  } catch (err) {
    console.error('get-session error:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Could not retrieve booking details' }),
    };
  }
};
