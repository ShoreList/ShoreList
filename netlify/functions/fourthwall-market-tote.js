// Public live status for the already approved Salt Wash tote.
// Do not publish additional products straight from the upstream feed.
const STORE = 'https://shorelist-shop.fourthwall.com';
const PRODUCT_ID = '28dc8c06-0a7f-4d4d-bf61-2059591cbe90';
const VARIANT_ID = 'fbd55e4d-f4ab-447b-9f82-09612511ad2b';
const PATH = '/products/salt-wash-organic-cotton-market-tote';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(statusCode === 200 ? { 'Netlify-CDN-Cache-Control': 'public, s-maxage=60' } : {}),
      ...(statusCode === 405 ? { Allow: 'GET' } : {}),
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'GET only' });
  try {
    const response = await fetch(STORE + '/collections/all.json', {
      headers: { Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error('Feed unavailable');
    const feed = await response.json();
    if (feed.handle !== 'all' || !Array.isArray(feed.products)) throw new Error('Invalid feed');

    const product = feed.products.find((item) => item?.id === PRODUCT_ID && item.url === PATH);
    // Absence on a single page cannot establish whether a product is gone.
    if (!product || typeof product.available !== 'boolean') throw new Error('Product status unknown');
    if (!product.available) return json(200, { available: false });

    const variant = product.variants?.length === 1 && product.variants[0];
    const price = variant?.price;
    if (variant?.id !== VARIANT_ID || price?.currency_iso !== 'USD'
        || !Number.isSafeInteger(price.cents) || price.cents < 0) {
      throw new Error('Product options changed');
    }
    return json(200, { available: true, cents: price.cents });
  } catch {
    return json(502, { error: 'Product status unavailable' });
  }
};
