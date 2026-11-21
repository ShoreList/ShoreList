import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sitemapUrls, pathToUrl, changedUrls, chunk, ping, KEY, ORIGIN } from './indexnow-ping.mjs';

test('pathToUrl maps pages', () => {
  assert.equal(pathToUrl('index.html'), ORIGIN + '/');
  assert.equal(pathToUrl('events/foo-2027-01-01.html'), ORIGIN + '/events/foo-2027-01-01');
  assert.equal(pathToUrl('things-to-do/index.html'), ORIGIN + '/things-to-do');
  assert.equal(pathToUrl('sw.js'), null);
});
test('changedUrls keeps only sitemap URLs', () => {
  const known = [ORIGIN + '/', ORIGIN + '/events'];
  assert.deepEqual(changedUrls(['events.html', 'events.css', '404.html', 'index.html'], known).sort(), [ORIGIN + '/', ORIGIN + '/events'].sort());
});
test('real sitemap is absolute https and key file matches', () => {
  const urls = sitemapUrls(fs.readFileSync('sitemap.xml', 'utf8'));
  assert.ok(urls.length > 50);
  assert.equal(fs.readFileSync(`${KEY}.txt`, 'utf8').trim(), KEY);
  assert.match(KEY, /^[0-9a-f]{32}$/);
});
test('chunk splits at limit', () => assert.deepEqual(chunk([1, 2, 3], 2), [[1, 2], [3]]));
test('ping posts batches with host/key/keyLocation', async () => {
  const calls = [];
  const r = await ping(Array.from({ length: 10001 }, (_, i) => ORIGIN + '/p' + i), { fetchImpl: async (u, o) => { calls.push([u, JSON.parse(o.body)]); return { status: 200 }; }, log() {} });
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], 'https://api.indexnow.org/indexnow');
  assert.equal(calls[0][1].host, 'shorelist.net');
  assert.equal(calls[0][1].keyLocation, `${ORIGIN}/${KEY}.txt`);
  assert.equal(calls[0][1].urlList.length, 10000);
  assert.equal(r.sent, 10001);
});
test('ping handles failures softly', async () => {
  const warn = console.warn; console.warn = () => {};
  const r1 = await ping([ORIGIN + '/a'], { fetchImpl: async () => { throw new Error('boom'); }, log() {} });
  const r2 = await ping([ORIGIN + '/a'], { fetchImpl: async () => ({ status: 429 }), log() {} });
  console.warn = warn;
  assert.equal(r1.failed, 1); assert.equal(r2.failed, 1);
});
test('dry run does not fetch', async () => {
  const r = await ping([ORIGIN + '/a'], { dryRun: true, fetchImpl: async () => { throw new Error('no'); }, log() {} });
  assert.equal(r.sent, 1);
});
