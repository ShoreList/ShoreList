import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkProductPage } from './check-shop-links.mjs';

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
