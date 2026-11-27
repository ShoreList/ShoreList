import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../shop-promo.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const shop = readFileSync(new URL('../shop.html', import.meta.url), 'utf8');

function render(instant) {
  let now = instant;
  let scheduled;
  let hidden = false;
  const documentEvents = new Map();
  const windowEvents = new Map();
  const root = {
    attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; },
    getAttribute(name) { return this.attrs[name]; },
  };
  runInNewContext(script, {
    Date: { UTC: Date.UTC, now: () => now },
    setTimeout(callback, delay) { scheduled = { callback, delay }; return 1; },
    clearTimeout() { scheduled = undefined; },
    window: { addEventListener: (event, callback) => windowEvents.set(event, callback) },
    document: {
      documentElement: root,
      get hidden() { return hidden; },
      addEventListener: (event, callback) => documentEvents.set(event, callback),
    },
  });
  return {
    get code() { return root.attrs['data-sale']; },
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
  test(code + ' is the active code exactly inside its UTC window', () => {
    const start = Date.parse(opens);
    const end = Date.parse(closes);
    assert.notEqual(render(start - 1).code, code);
    assert.notEqual(render(end).code, code);
    for (const instant of [start, end - 1]) assert.equal(render(instant).code, code);
  });
}

test('the script does not build a banner after load', () => {
  assert.doesNotMatch(script, /createElement|insertBefore|innerHTML/);
});

test('an open tab rolls from one code to the next without stacking', () => {
  const end = Date.parse(windows[0][2]);
  const friday = Date.parse(windows[1][1]);
  const fridayEnd = Date.parse(windows[1][2]);
  const monday = Date.parse(windows[2][1]);
  const mondayEnd = Date.parse(windows[2][2]);
  const page = render(end - 100);
  assert.equal(page.code, 'SHORE15');
  assert.equal(page.delay, 100);
  page.tick(end);
  assert.equal(page.code, 'off');
  assert.equal(page.delay, friday - end);
  page.tick(friday);
  assert.equal(page.code, 'SHOREFRIDAY15');
  page.tick(fridayEnd);
  assert.equal(page.code, 'off');
  page.tick(monday);
  assert.equal(page.code, 'SHORECYBER15');
  page.tick(mondayEnd);
  assert.equal(page.code, 'xmas');
});

test('a suspended or restored tab catches up', () => {
  const friday = Date.parse(windows[1][1]);
  const monday = Date.parse(windows[2][1]);
  const page = render(friday - 1000);
  page.visibility(friday, true);
  assert.equal(page.code, 'off');
  page.visibility(friday + 1, false);
  assert.equal(page.code, 'SHOREFRIDAY15');
  page.restore(monday);
  assert.equal(page.code, 'SHORECYBER15');
});

const xmasStart = Date.parse('2026-12-01T04:59:00Z');
const xmasEnd = Date.parse('2026-12-08T05:00:00Z');

test('the Christmas note is the code only after Cyber Monday and through Dec 7', () => {
  assert.equal(xmasStart, Date.parse(windows[2][2]));
  assert.equal(render(xmasStart).code, 'xmas');
  assert.equal(render(Date.parse('2026-12-07T23:59:59-05:00')).code, 'xmas');
  assert.equal(render(xmasEnd).code, 'off');
  assert.equal(render(Date.parse('2026-11-28T17:00:00Z')).code, 'off');
  assert.equal(render(Date.parse('2026-11-29T17:00:00Z')).code, 'off');
});

test('home and shop render the sale in HTML with the Eastern codes', () => {
  assert.match(home, /Black Friday: 15% off today with code SHOREFRIDAY15/);
  assert.match(home, /Cyber Monday: 15% off today with code SHORECYBER15/);
  assert.match(home, /href="\/shop"/);
  assert.match(home, /data-code="SHOREFRIDAY15"/);
  assert.match(home, /data-code="SHORECYBER15"/);
  assert.match(home, /height:36px/);
  assert.match(shop, /15% off eligible Shopify orders with code SHOREFRIDAY15/);
  assert.match(shop, /SHORECYBER15/);
  assert.match(shop, /ordering by December 7/);
  assert.match(shop, /min-height:44px/);
  assert.doesNotMatch(home.match(/class="sl-sale"[\s\S]{0,400}/)[0], /\u2014|\u2013/);
  assert.doesNotMatch(shop.match(/class="sl-sale"[\s\S]{0,900}/)[0], /\u2014|\u2013/);
});
