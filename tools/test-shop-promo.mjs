import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../shop-promo.js', import.meta.url), 'utf8');

function render(instant, search = '', shop = true) {
  function node(tag, textContent = '') {
    return {
      tag, textContent, attrs: {}, style: {}, children: [],
      appendChild(child) { this.children.push(child); },
      setAttribute(name, value) { this.attrs[name] = value; },
      insertBefore(child) { this.children.unshift(child); },
    };
  }
  const main = node('main');
  const hero = node('section');
  runInNewContext(script, {
    Date: { UTC: Date.UTC, now: () => instant },
    location: { search },
    document: {
      createElement: node,
      createTextNode: (text) => node('#text', text),
      getElementById: (id) => id === 'main' && shop ? main : null,
      querySelector: (selector) => selector === '.hero-cta' ? { parentNode: hero } : null,
    },
  });
  return { banner: main.children[0], hero: hero.children[0] };
}

const windows = [
  ['SHORE15', '2026-11-25T04:00:00Z', '2026-11-27T04:59:00Z'],
  ['SHOREFRIDAY15', '2026-11-27T05:00:00Z', '2026-11-28T04:59:00Z'],
  ['SHORECYBER15', '2026-11-30T05:00:00Z', '2026-12-01T04:59:00Z'],
];
for (const [code, opens, closes] of windows) {
  test(code + ' appears exactly inside its configured UTC window', () => {
    const start = Date.parse(opens);
    const end = Date.parse(closes);
    assert.equal(render(start - 1).banner, undefined);
    assert.equal(render(end).banner, undefined);
    for (const instant of [start, end - 1]) {
      const { banner, hero } = render(instant);
      assert.equal(banner.tag, 'aside');
      assert.ok(banner.attrs['aria-label']);
      const visible = banner.children.map((child) => child.textContent).join('');
      assert.match(visible, new RegExp(code));
      assert.match(visible, /eligible Shopify orders/);
      assert.match(hero.textContent, new RegExp(code));
    }
  });
}

test('public query strings do not preview expired or future offers', () => {
  const outside = Date.parse('2026-11-29T15:00:00Z');
  for (const marker of ['1','bf','cm']) {
    assert.equal(render(outside, '?promo-preview=' + marker).banner, undefined);
  }
  assert.equal(render(Date.parse(windows[0][1]), '', false).banner, undefined);
});
