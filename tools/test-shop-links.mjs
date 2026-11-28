import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkProductPage, merchantCards, nightlyTargets } from './check-shop-links.mjs';

const host = 'shorelist.myshopify.com', url = 'https://' + host + '/products/example';
const productHtml = (canonical = url, type = 'product') =>
  `<html><head><link href="${canonical}" rel="canonical"><meta property='og:type' content='${type}'></head></html>`;
function reply({ finalUrl = url, html = productHtml(), status = 200, contentType = 'text/html; charset=utf-8' } = {}) {
  return async () => {
    const response = new Response(html, { status, headers: { 'content-type': contentType } });
    Object.defineProperty(response, 'url', { value: finalUrl });
    return response;
  };
}

test('a valid merchant product keeps working with tracking and variant parameters', async () => {
  assert.equal(await checkProductPage(url + '?utm_source=shorelist', [host], reply({ finalUrl: url + '?variant=123' })), null);
});

test('generic pages and different merchant products cannot pass with an HTTP 200', async () => {
  for (const finalUrl of ['https://' + host + '/password', url + '-another', 'https://elsewhere.example/products/example']) {
    assert.equal(await checkProductPage(url, [host], reply({ finalUrl })), 'Merchant did not return the requested product page');
  }
  for (const html of ['<head><title>Not found</title></head>', productHtml(url + '-another'), productHtml(url, 'website')]) {
    assert.equal(await checkProductPage(url, [host], reply({ html })), 'Missing or mismatched product metadata');
  }
});

test('missing merchant products and non-HTML pages fail verification', async () => {
  assert.equal(await checkProductPage(url, [host], reply({ status: 404 })), 'Merchant returned 404');
  assert.equal(await checkProductPage(url, [host], reply({ contentType: 'application/json' })), 'Merchant did not return the requested product page');
});

test('non-product and off-domain inputs are rejected before a request', async () => {
  for (const candidate of ['https://elsewhere.example/products/example', 'https://' + host + '/']) {
    assert.equal(await checkProductPage(candidate, [host], async () => assert.fail('unexpected fetch')), 'Unapproved merchant product URL');
  }
});

test('rate limiting uses Retry-After and makes at most one respectful retry', async () => {
  let calls = 0;
  const limited = (seconds) => new Response('', { status: 429, headers: { 'retry-after': String(seconds) } });
  const waits = [];
  const wait = async (ms) => { waits.push(ms); };
  const retry = async () => ++calls === 1 ? limited(2) : reply()();
  assert.equal(await checkProductPage(url, [host], retry, wait), null);
  assert.deepEqual(waits, [2000]);
  assert.equal(calls, 2);

  calls = 0;
  waits.length = 0;
  const paused = async () => { calls++; return limited(60); };
  assert.equal(await checkProductPage(url, [host], paused, wait), 'Merchant rate-limited verification (429)');
  assert.equal(calls, 1);
  assert.deepEqual(waits, []);

  calls = 0;
  const stillLimited = async () => { calls++; return limited(2); };
  assert.equal(await checkProductPage(url, [host], stillLimited, wait), 'Merchant rate-limited verification (429)');
  assert.equal(calls, 2);
  assert.deepEqual(waits, [2000]);
});

test('daily rotation covers all unique Shopify URLs and always includes Fourthwall', () => {
  const shop = Array.from({ length: 104 }, (_, index) => ({ store: 'shopify', url: url + index }));
  const seller = { store: 'fourthwall', url: 'https://shorelist-shop.fourthwall.com/products/example' };
  const harbor = { store: 'fourthwall', url: 'https://shorelist-shop.fourthwall.com/products/harbor-example' };
  const catalog = { items: [...shop, shop[0], seller, { store: 'goods', url: '/shop' }], harborGoods: [harbor] };
  assert.deepEqual(merchantCards({ items: [seller] }), [seller]);
  const all = merchantCards(catalog);
  const visited = new Set();
  for (let day = 0; day < 9; day++) {
    const rows = nightlyTargets(all, day);
    const urls = new Set(rows.map((item) => item.url));
    assert.ok(urls.has(seller.url));
    assert.ok(urls.has(harbor.url));
    assert.equal(urls.size, 14);
    for (const selected of urls) visited.add(selected);
  }
  assert.equal(visited.size, 106);
});
