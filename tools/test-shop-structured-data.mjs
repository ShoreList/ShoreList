import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const catalog = new Map(JSON.parse(read('shop-catalog.json')).items
  .map((item) => [JSON.stringify([item.url, item.name]), item]));
const pages = ['/shop', '/shop/wrightsville-beach', '/shop/carolina-beach', '/shop/kure-beach', '/shop/wilmington'];
const titles = new Set();
const descriptions = new Set();

for (const path of pages) {
  test(path + ' metadata and Product offers match the catalog', () => {
    const html = read(path.slice(1) + '.html');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    assert.equal(canonical, 'https://shorelist.net' + path);
    assert.ok(title && !titles.has(title), 'unique title');
    assert.ok(description && !descriptions.has(description), 'unique description');
    titles.add(title);
    descriptions.add(description);
    const objects = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap((match) => {
        const parsed = JSON.parse(match[1]);
        return parsed['@graph'] ?? [parsed];
      });
    const lists = objects.filter((object) => object['@type'] === 'ItemList');
    const products = lists.flatMap((list) => list.itemListElement ?? []).map((entry) => entry.item)
      .filter((item) => item?.['@type'] === 'Product');
    assert.ok(products.length, 'expected at least one product');
    for (const product of products) {
      const record = catalog.get(JSON.stringify([product.url, product.name]));
      assert.ok(record, product.url + ' exists in the catalog');
      assert.equal(product.name, record.name);
      assert.ok([record.img, record.studio, record.lookbook].filter(Boolean).includes(product.image), product.name + ' image');
      assert.equal(product.offers.url, product.url);
      assert.equal(product.offers.priceCurrency, 'USD');
      const offer = product.offers;
      const floor = offer['@type'] === 'AggregateOffer' ? offer.lowPrice : offer.price;
      assert.equal(Number(floor), Number(record.price), product.name + ' price');
      if (offer['@type'] === 'AggregateOffer' && offer.highPrice != null) {
        assert.ok(Number(offer.highPrice) >= Number(floor), product.name + ' price range');
      }
    }
  });
}
