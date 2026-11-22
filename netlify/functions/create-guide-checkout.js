// ShoreList — Stripe Checkout for the PDF guides (digital download, nothing ships).
// The browser sends one product id. Price, name and the guides included come
// from GUIDES in _shared.js. No date, slot, seat or hold logic: quantity is 1.

const { corsHeaders, originAllowed, clientIp, rateLimitDurable, getGuideProduct, getGuide, attribMetadata } = require('./_shared.js');

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const bad = (msg, code, extra) => ({ statusCode: code || 400, headers: Object.assign({}, headers, extra || {}), body: JSON.stringify({ error: msg }) });

  if (!originAllowed(event)) return bad('Request not allowed.', 403);

  const rl = await rateLimitDurable(event, 'guide-checkout:' + clientIp(event), 10, 10 * 60 * 1000);
  if (!rl.ok) return bad('Too many attempts. Please wait a few minutes and try again.', 429, { 'Retry-After': String(rl.retryAfter) });

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    console.error('create-guide-checkout: STRIPE_SECRET_KEY is not set');
    return bad('Checkout is unavailable right now. Please try again later.', 500);
  }

  let data;
  try { data = JSON.parse(String(event.body || '').slice(0, 2000)); } catch { return bad('Invalid request body'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return bad('Invalid request body');

  // Only the product id is read. Any price, amount, name or file sent by the browser is ignored.
  const product = getGuideProduct(data.product);
  if (!product) return bad('Unknown guide. Please refresh and try again.');

  const siteUrl = (process.env.URL || 'https://shorelist.net').replace(/\/+$/, '');
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('payment_method_types[0]', 'card');
  p.set('line_items[0][price_data][currency]', 'usd');
  p.set('line_items[0][price_data][product_data][name]', product.title);
  const printItem = getGuide(data.product) && getGuide(data.product).kind === 'print';
  p.set('line_items[0][price_data][product_data][description]', printItem ? 'Print-ready PDF poster, 18x24 and 24x36 in. Digital product: nothing ships.' : 'PDF download, November 2026 edition. Digital product: nothing ships.');
  p.set('line_items[0][price_data][unit_amount]', String(product.cents));
  p.set('line_items[0][quantity]', '1');
  // NC sales tax on digital books and publications: 7% (4.75% state + 2.25% New Hanover County).
  const taxCents = Math.round(product.cents * 0.07);
  p.set('line_items[1][price_data][currency]', 'usd');
  p.set('line_items[1][price_data][product_data][name]', 'NC Sales Tax (7%)');
  p.set('line_items[1][price_data][unit_amount]', String(taxCents));
  p.set('line_items[1][quantity]', '1');
  p.set('success_url', `${siteUrl}/guide-success.html?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', printItem ? `${siteUrl}/prints` : `${siteUrl}/guides`);
  p.set('metadata[kind]', 'guide');
  p.set('metadata[product]', data.product);
  p.set('metadata[guideIds]', product.ids.join(','));
  p.set('metadata[taxCents]', String(taxCents));
  Object.entries(attribMetadata(data.attrib)).forEach(([k, v]) => p.set(`metadata[${k}]`, v)); // booking source (allowlisted, capped, sanitized)

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p.toString(),
    });
    const session = await res.json();
    if (!res.ok || !session.url) {
      console.error('create-guide-checkout Stripe error:', session.error && session.error.type, session.error && session.error.code);
      throw new Error('Stripe session creation failed');
    }
    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('create-guide-checkout error:', err.message);
    return bad('Checkout could not be started. Please try again in a moment.', 500);
  }
};
