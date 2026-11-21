// ShoreList: shop product lookup
// Returns the colours, sizes, prices and stock for one Shopify product so the
// on-site bag can let shoppers pick options without leaving shorelist.net.
// Read-only and public data only: it proxies the storefront's own product JSON.

const STORE = 'https://shorelist.myshopify.com';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300',
  };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'GET only' }) };
  }
  const handle = String((event.queryStringParameters || {}).handle || '').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(handle)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad product handle' }) };
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${STORE}/products/${handle}.js`, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.status === 404) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Product not found' }) };
    }
    if (!res.ok) throw new Error('Store returned ' + res.status);
    const p = await res.json();
    const img = (u) => (u ? String(u).replace(/^\/\//, 'https://') : '');
    const body = {
      handle: p.handle,
      title: p.title,
      image: img(p.featured_image),
      options: (p.options || []).map((o) => ({ name: o.name, values: o.values })),
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        title: v.title,
        options: v.options,
        price: v.price / 100,
        available: !!v.available,
        image: img(v.featured_image && v.featured_image.src),
      })),
    };
    return { statusCode: 200, headers, body: JSON.stringify(body) };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { ...headers, 'Cache-Control': 'no-store' },
      body: JSON.stringify({ error: 'Could not reach the store' }),
    };
  }
};
