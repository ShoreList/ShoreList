// ShoreList Direct: Stripe Checkout for physical goods, paid and completed on shorelist.net.
// The browser sends item id, variant id and quantity per line. Names, prices, shipping, tax and
// availability all come from dropship-catalog.json (see _goods.js). Only status 'live' items sell.

const { corsHeaders, originAllowed, clientIp, rateLimitDurable, attribMetadata } = require('./_shared.js');
const G = require('./_goods.js');

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const bad = (msg, code, extra, more) => ({ statusCode: code || 400, headers: Object.assign({}, headers, extra || {}), body: JSON.stringify(Object.assign({ error: msg }, more || {})) });

  if (!originAllowed(event)) return bad('Request not allowed.', 403);

  const rl = await rateLimitDurable(event, 'goods-checkout:' + clientIp(event), 10, 10 * 60 * 1000);
  if (!rl.ok) return bad('Too many attempts. Please wait a few minutes and try again.', 429, { 'Retry-After': String(rl.retryAfter) });

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    console.error('create-goods-checkout: STRIPE_SECRET_KEY is not set');
    return bad('Checkout is unavailable right now. Please try again later.', 500);
  }

  let data;
  try { data = JSON.parse(String(event.body || '').slice(0, 6000)); } catch { return bad('Invalid request body'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return bad('Invalid request body');

  let r;
  try { r = G.resolveLines(data.lines); } catch (e) { console.error('create-goods-checkout catalog error:', e.message); return bad('Checkout is unavailable right now. Please try again later.', 500); }
  if (!r.ok) return bad(r.error, r.status, null, r.code ? { code: r.code, lines: r.lines } : null);
  const t = G.totals(r.lines);
  if (!t.ok) return bad(t.error, 400, null, { code: 'too_heavy' });
  const lead = G.leadRange(r.lines);

  const siteUrl = (process.env.URL || 'https://shorelist.net').replace(/\/+$/, '');
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('payment_method_types[0]', 'card');
  r.lines.forEach((l, i) => {
    p.set(`line_items[${i}][price_data][currency]`, 'usd');
    p.set(`line_items[${i}][price_data][product_data][name]`, `${l.item.name} (${l.variant.label})`.slice(0, 250));
    p.set(`line_items[${i}][price_data][product_data][description]`, `Made to order and shipped to you by our supplier. Allow ${lead.min} to ${lead.max} business days.`);
    p.set(`line_items[${i}][price_data][unit_amount]`, String(l.unit_cents));
    p.set(`line_items[${i}][quantity]`, String(l.qty));
  });
  // Same approach as the guides checkout: NC 7% as its own line, computed here, not by the browser.
  const n = r.lines.length;
  p.set(`line_items[${n}][price_data][currency]`, 'usd');
  p.set(`line_items[${n}][price_data][product_data][name]`, 'NC Sales Tax (7%)');
  p.set(`line_items[${n}][price_data][unit_amount]`, String(t.tax));
  p.set(`line_items[${n}][quantity]`, '1');
  p.set('shipping_address_collection[allowed_countries][0]', 'US');
  p.set('phone_number_collection[enabled]', 'true');
  p.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  p.set('shipping_options[0][shipping_rate_data][display_name]', 'Standard shipping (United States)');
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(t.shipping));
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd');
  p.set('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]', 'business_day');
  p.set('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]', String(lead.min));
  p.set('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]', 'business_day');
  p.set('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]', String(lead.max));
  p.set('success_url', `${siteUrl}/goods-success.html?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${siteUrl}/shop`);
  p.set('metadata[kind]', 'goods');
  p.set('metadata[lines]', String(n));
  r.lines.forEach((l, i) => p.set(`metadata[line_${i}]`, G.encodeLine(l)));
  p.set('metadata[subtotalCents]', String(t.subtotal));
  p.set('metadata[shippingCents]', String(t.shipping));
  p.set('metadata[taxCents]', String(t.tax));
  p.set('metadata[totalCents]', String(t.total));
  Object.entries(attribMetadata(data.attrib)).forEach(([k, v]) => p.set(`metadata[${k}]`, v));

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p.toString(),
    });
    const session = await res.json();
    if (!res.ok || !session.url) {
      console.error('create-goods-checkout Stripe error:', session.error && session.error.type, session.error && session.error.code);
      throw new Error('Stripe session creation failed');
    }
    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('create-goods-checkout error:', err.message);
    return bad('Checkout could not be started. Please try again in a moment.', 500);
  }
};
