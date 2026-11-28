const test = require('node:test');
const assert = require('node:assert/strict');
const gf = require('../netlify/functions/gift-finder.js');

function items() {
  return gf.mergeItems(gf.loadCatalog(), null);
}
function byHandle(list) {
  return new Map(list.map((it) => [it.handle, it]));
}

test('fallback stays inside the catalog, the budget and Wrightsville first', () => {
  const list = items();
  const handles = new Set(list.map((it) => it.handle));
  const picks = gf.fallbackPicks(list, 'a small gift for the beach', 35, '');
  assert.ok(picks.length >= 3 && picks.length <= 6);
  assert.equal(picks[0].town, 'Wrightsville Beach');
  for (const p of picks) {
    assert.ok(handles.has(p.handle));
    assert.ok(p.price <= 35);
    assert.match(p.url, /^https:\/\/shorelist\.myshopify\.com\/products\/[a-z0-9-]+\?utm_source=shorelist\.net&utm_medium=gift-finder&utm_campaign=wrighty&utm_content=/);
    assert.equal(gf.cleanWhy(p.why), p.why);
    assert.doesNotMatch(p.why, /[\u2013\u2014]/);
  }
});

test('for him prefers wearable and pocket gifts over home pillows', () => {
  const list = items();
  const picks = gf.fallbackPicks(list, 'gift for him', 50, 'him');
  assert.equal(picks[0].town, 'Wrightsville Beach');
  assert.doesNotMatch(picks[0].title, /pillow|tea towel|art print/i);
  assert.match(picks[0].why, /for him/);
});

test('the model cannot add a handle or break the budget', () => {
  const list = items();
  const allowed = byHandle(list);
  const cap = list.find((it) => /corduroy cap/i.test(it.title) && it.price > 25);
  assert.ok(cap);
  const picks = gf.validatePicks({
    say: 'Take these',
    picks: [
      { handle: 'not-a-real-product', why: 'Invented just now' },
      { handle: cap.handle, why: 'A handsome cap' },
      { handle: 'wrightsville-beach-can-cooler', why: 'For the boat bag' },
    ],
  }, allowed, 25, 'him');
  assert.deepEqual(picks.map((p) => p.handle), ['wrightsville-beach-can-cooler']);
  assert.equal(picks[0].price, 12);
  assert.equal(picks[0].why, 'For the boat bag');
});

test('a why line with a price or a dash is replaced', () => {
  assert.equal(gf.cleanWhy('Only $12 left'), '');
  assert.equal(gf.cleanWhy('A calm pick, no dash'), 'A calm pick, no dash');
  const cleaned = gf.cleanWhy('Nice \u2014 really');
  assert.equal(cleaned, 'Nice , really');
});

test('handler uses the fallback when no model key is set', async () => {
  gf.resetCatalog();
  const prevSkip = process.env.GIFT_FINDER_SKIP_LIVE;
  const prevKey = process.env.ANTHROPIC_API_KEY;
  const prevCf = process.env.CLOUDFLARE_API_TOKEN;
  process.env.GIFT_FINDER_SKIP_LIVE = '1';
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLOUDFLARE_API_TOKEN;
  try {
    const res = await gf.handler({
      httpMethod: 'POST',
      headers: { origin: 'https://shorelist.net', 'x-nf-client-connection-ip': '203.0.113.45' },
      body: JSON.stringify({ q: 'gift for the home', budget: 'u35', who: 'home' }),
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.ok, true);
    assert.equal(body.source, 'fallback');
    assert.equal(body.prices, 'catalog');
    assert.ok(body.picks.length >= 3 && body.picks.length <= 6);
    assert.match(body.say, /^Wrighty here\./);
    assert.match(body.picks[0].why, /for the home/);
    for (const p of body.picks) assert.ok(p.price <= 35);
  } finally {
    if (prevSkip == null) delete process.env.GIFT_FINDER_SKIP_LIVE;
    else process.env.GIFT_FINDER_SKIP_LIVE = prevSkip;
    if (prevKey == null) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prevKey;
    if (prevCf == null) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = prevCf;
  }
});
