import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../shop-promo.js', import.meta.url), 'utf8');

function render(instant, search = '', shop = true) {
  let now = instant;
  let scheduled;
  let hidden = false;
  const documentEvents = new Map();
  const windowEvents = new Map();
  const append = (parent, child) => {
    child.remove = () => { parent.children.splice(parent.children.indexOf(child), 1); };
    parent.children.unshift(child);
  };
  function node(tag, textContent = '') {
    return {
      tag, textContent, attrs: {}, style: {}, children: [],
      appendChild(child) { this.children.push(child); },
      setAttribute(name, value) { this.attrs[name] = value; },
      insertBefore(child) { append(this, child); },
    };
  }
  const main = node('main');
  const hero = node('section');
  runInNewContext(script, {
    Date: { UTC: Date.UTC, now: () => now },
    location: { search },
    setTimeout(callback, delay) { scheduled = { callback, delay }; return 1; },
    clearTimeout() { scheduled = undefined; },
    window: { addEventListener: (event, callback) => windowEvents.set(event, callback) },
    document: {
      get hidden() { return hidden; },
      addEventListener: (event, callback) => documentEvents.set(event, callback),
      createElement: node,
      createTextNode: (text) => node('#text', text),
      getElementById: (id) => id === 'main' && shop ? main : null,
      querySelector: (selector) => selector === '.hero-cta' ? { parentNode: hero } : null,
    },
  });
  return {
    get banner() { return main.children[0]; },
    get hero() { return hero.children[0]; },
    get counts() { return [main.children.length, hero.children.length]; },
    get delay() { return scheduled?.delay; },
    tick(instant) { now = instant; scheduled.callback(); },
    visibility(instant, value) { now = instant; hidden = value; documentEvents.get('visibilitychange')(); },
    restore(instant) { now = instant; windowEvents.get('pageshow')(); },
  };
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

test('an open shop tab removes expired offers and rolls over to the next sale', () => {
  const end = Date.parse(windows[0][2]);
  const friday = Date.parse(windows[1][1]);
  const fridayEnd = Date.parse(windows[1][2]);
  const monday = Date.parse(windows[2][1]);
  const mondayEnd = Date.parse(windows[2][2]);
  const page = render(end - 100);
  assert.equal(page.delay, 100);
  assert.match(page.hero.textContent, /SHORE15/);
  page.tick(end);
  assert.deepEqual(page.counts, [0, 0]);
  assert.equal(page.delay, friday - end);
  page.tick(friday);
  assert.deepEqual(page.counts, [1, 1]);
  assert.match(page.hero.textContent, /SHOREFRIDAY15/);
  page.tick(fridayEnd);
  assert.deepEqual(page.counts, [0, 0]);
  page.tick(monday);
  assert.match(page.hero.textContent, /SHORECYBER15/);
  page.tick(mondayEnd);
  assert.deepEqual(page.counts, [0, 0]);
  assert.equal(page.delay, undefined);
});

test('a suspended or restored tab catches up without stacking banners', () => {
  const friday = Date.parse(windows[1][1]);
  const monday = Date.parse(windows[2][1]);
  const page = render(friday - 1000);
  page.visibility(friday, true);
  assert.deepEqual(page.counts, [0, 0]);
  page.visibility(friday + 1, false);
  assert.match(page.hero.textContent, /SHOREFRIDAY15/);
  const banner = page.banner;
  page.restore(friday + 10);
  assert.equal(page.banner, banner);
  assert.deepEqual(page.counts, [1, 1]);
  page.restore(monday);
  assert.match(page.hero.textContent, /SHORECYBER15/);
  assert.deepEqual(page.counts, [1, 1]);
});
