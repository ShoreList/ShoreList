const assert = require('node:assert/strict');
const test = require('node:test');
const { handler } = require('../netlify/functions/fourthwall-market-tote');

const product = {
  id: '28dc8c06-0a7f-4d4d-bf61-2059591cbe90',
  url: '/products/salt-wash-organic-cotton-market-tote',
  available: true,
  variants: [{
    id: 'fbd55e4d-f4ab-447b-9f82-09612511ad2b',
    price: { currency_iso: 'USD', cents: 4800 },
  }],
};

function feed(t, ...products) {
  return t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://shorelist-shop.fourthwall.com/collections/all.json');
    assert.equal(options.redirect, 'error');
    return Response.json({ handle: 'all', products });
  });
}

test('only the approved tote supplies checkout status and price', async (t) => {
  feed(t, { ...product, id: 'other', variants: [] }, product);
  const result = await handler({ httpMethod: 'GET', queryStringParameters: { handle: 'other' } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { available: true, cents: 4800 });
  assert.equal(result.headers['Netlify-CDN-Cache-Control'], 'public, s-maxage=60');
});

test('sold-out tote is shown as unavailable', async (t) => {
  feed(t, { ...product, available: false });
  const result = await handler({ httpMethod: 'GET' });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { available: false });
});

test('unknown product, changed options, or non-USD price leaves the product page fallback', async (t) => {
  const fetch = feed(t);
  for (const products of [
    [{ ...product, url: '/products/other' }],
    [{ ...product, variants: [...product.variants, { id: 'other' }] }],
    [{ ...product, variants: [{ ...product.variants[0], price: { currency_iso: 'CAD', cents: 5800 } }] }],
  ]) {
    fetch.mock.mockImplementation(async () => Response.json({ handle: 'all', products }));
    const result = await handler({ httpMethod: 'GET' });
    assert.equal(result.statusCode, 502);
    assert.equal(result.headers['Cache-Control'], 'no-store');
  }
});

test('upstream error leaves the fallback and POST never calls upstream', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 502);
  assert.equal((await handler({ httpMethod: 'POST' })).statusCode, 405);
  assert.equal(fetch.mock.callCount(), 1);
});
