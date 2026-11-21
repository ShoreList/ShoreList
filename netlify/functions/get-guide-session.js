// ShoreList — what a paid guide order contains (used by /guide-success.html).
// Answers only for a PAID guide session; everything else looks like "not found".

const { corsHeaders, originAllowed, clientIp, rateLimitDurable, paidGuideSession, getGuide } = require('./_shared.js');

const NOT_CONFIRMED = { error: 'Order could not be confirmed' };

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!originAllowed(event)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Request not allowed.' }) };

  const rl = await rateLimitDurable(event, 'guide-session:' + clientIp(event), 30, 60 * 1000);
  if (!rl.ok) return { statusCode: 429, headers: Object.assign({}, headers, { 'Retry-After': String(rl.retryAfter) }), body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }) };

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) { console.error('get-guide-session: STRIPE_SECRET_KEY is not set'); return { statusCode: 500, headers, body: JSON.stringify(NOT_CONFIRMED) }; }

  const { session_id } = event.queryStringParameters || {};
  try {
    const r = await paidGuideSession(STRIPE_KEY, session_id);
    if (!r.ok) return { statusCode: 404, headers, body: JSON.stringify(NOT_CONFIRMED) };
    const s = r.session;
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        paid: true,
        guides: r.ids.map((id) => ({ id, title: getGuide(id).title, pages: getGuide(id).pages })),
        amount: Number.isFinite(s.amount_total) ? s.amount_total : null,
      }),
    };
  } catch (err) {
    console.error('get-guide-session error:', err.message);
    return { statusCode: 502, headers, body: JSON.stringify(NOT_CONFIRMED) };
  }
};
