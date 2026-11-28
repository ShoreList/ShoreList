import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('verify-live.mjs', import.meta.url));

function runVerifier(t, imageStatus) {
  const fixture = mkdtempSync(join(tmpdir(), 'shorelist-live-test-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  writeFileSync(join(fixture, 'shop-catalog.json'), JSON.stringify({
    items: [{ id: 'tee', img: '/tee.jpg', studio: '/tee.jpg', gallery: [{ src: '/detail.jpg' }] }],
    harborGoods: [{ id: 'bag', img: '/bag.jpg' }],
  }));
  writeFileSync(join(fixture, 'shore-picks.html'), `
    <article data-pick="pending" class="card no-photo"></article>
    <article class="card" data-pick="present"><img src="/venue.jpg" alt="Venue"></article>
  `);
  writeFileSync(join(fixture, 'sitemap.xml'), '<urlset><url><loc>https://shorelist.net/shop</loc></url></urlset>');
  const summary = join(fixture, 'summary.md');
  const mock = join(fixture, 'fetch.mjs');
  writeFileSync(mock, `
    const requested = new Set();
    globalThis.fetch = async (value, options = {}) => {
      const url = new URL(value);
      if (url.hostname === 'shorelist.myshopify.com') return Response.json({ products: [{ handle: 'tee' }] });
      if (url.pathname === '/shop') return new Response(null, { status: 200 });
      const path = url.pathname;
      if (requested.has(path)) throw new Error('duplicate image request: ' + path);
      requested.add(path);
      const status = path === '/detail.jpg' && options.method !== 'HEAD' ? ${imageStatus} : 200;
      return new Response('fixture', { status, headers: { 'content-type': status === 200 ? 'image/jpeg' : 'text/html' } });
    };
  `);
  return spawnSync(process.execPath, ['--import', mock, verifier], {
    cwd: fixture,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_STEP_SUMMARY: summary },
  });
}

test('the live verifier catches a gallery image whose GET fails despite a successful HEAD', (t) => {
  const result = runVerifier(t, 404);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /1 problem\(s\)/);
  assert.match(result.stdout, /404 https:\/\/shorelist\.net\/detail\.jpg \(text\/html; Shop\/tee gallery 1\)/);
});

test('working assets pass while the report still lists incomplete coverage', (t) => {
  const result = runVerifier(t, 200);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Images checked: 4\./);
  assert.match(result.stdout, /1 text-only Shore Picks cards: pending\./);
  assert.match(result.stdout, /2 of 2 product cards lack a distinct lookbook lead and separate studio reference/);
  assert.match(result.stdout, /Harbor Goods\/bag/);
});
