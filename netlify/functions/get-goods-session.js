// ShoreList Direct: what a PAID goods order contains (used by /goods-success.html).
// Answers only for a paid goods session; everything else looks like "not found". No address or email is returned.

const { corsHeaders, originAllowed, clientIp, rateLimitDurable } = require('./_shared.js');
const G = require('./_goods.js');

const NOT_CONFIRMED = { error: 'Order could not be confirmed' };

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!originAllowed(event)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Request not allowed.' }) };

  const rl = await rateLimitDurable(event, 'goods-session:' + clientIp(event), 30, 60 * 1000);
  if (!rl.ok) return { statusCode: 429, headers: Object.assign({}, headers, { 'Retry-After': String(rl.retryAfter) }), body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' }) };

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) { console.error('get-goods-session: STRIPE_SECRET_KEY is not set'); return { statusCode: 500, headers, body: JSON.stringify(NOT_CONFIRMED) }; }

  const { session_id } = event.queryStringParameters || {};
  try {
    const r = await G.paidGoodsSession(STRIPE_KEY, session_id);
    if (!r.ok) return { statusCode: 404, headers, body: JSON.stringify(NOT_CONFIRMED) };
    const m = r.session.metadata || {};
    const lead = r.lines.reduce((a, l) => {
      const d = (l.item && l.item.supplier && l.item.supplier.lead_days) || [0, 0];
      return { min: Math.max(a.min, d[0]), max: Math.max(a.max, d[1]) };
    }, { min: 0, max: 0 });
    const n = (k) => { const v = parseInt(m[k], 10); return Number.isFinite(v) ? v : null; };
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        paid: true,
        madeToOrder: true,
        lines: r.lines.map((l) => ({ name: l.item ? l.item.name : 'ShoreList Direct item', variant: l.variant ? l.variant.label : '', qty: l.qty, unit_cents: l.unit_cents })),
        subtotal_cents: n('subtotalCents'), shipping_cents: n('shippingCents'), tax_cents: n('taxCents'),
        amount: Number.isFinite(r.session.amount_total) ? r.session.amount_total : null,
        lead_days: lead.max ? lead : null,
        returns_url: '/shipping-returns',
      }),
    };
  } catch (err) {
    console.error('get-goods-session error:', err.message);
    return { statusCode: 502, headers, body: JSON.stringify(NOT_CONFIRMED) };
  }
};
