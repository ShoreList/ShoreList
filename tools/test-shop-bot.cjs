const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../netlify/functions/shop-bot.js'), 'utf8');

// Synthetic fixtures only. No credentials, supplier data, or actual AI requests.
function setup() {
  const items = [
    { id: 'cap', name: 'Wrightsville Beach Cap', price: 42 },
    { id: 'knit', name: 'Knit Crewneck', price: 108 },
    { id: 'unknown', name: 'Shell Tee' },
    { id: 'invalid', name: 'Invalid Price', price: -1 },
    ...Array.from({ length: 20 }, (_, i) => ({ id: 'extra' + i, name: 'Extra Tee ' + i, price: 24 })),
  ].map((item) => ({ ...item, url: 'https://shorelist.myshopify.com/products/' + item.id }));
  const calls = [];
  let budgetChecks = 0;
  let output = { picks: [] };
  let unavailable = false;
  const shared = {
    corsHeaders: () => ({}), originAllowed: () => true, clientIp: () => 'test',
    rateLimitDurable: async () => ({ ok: true }),
    aiDailyCheck: async () => { budgetChecks++; return { ok: true }; },
    getBlobStore: () => null, todayNY: () => '2026-11-28',
  };
  const context = {
    require: (name) => name === 'fs' ? { readFileSync: () => JSON.stringify({ items, allowedHosts: ['shorelist.myshopify.com'] }) }
      : name === './_shared.js' ? shared : require(name),
    __dirname: path.join(__dirname, '../netlify/functions'), exports: {},
    process: { env: { ANTHROPIC_API_KEY: 'synthetic' }, cwd: () => process.cwd() },
    Buffer, AbortController, setTimeout, clearTimeout, console: { error() {} },
    fetch: async (_, request) => {
      calls.push(JSON.parse(request.body));
      if (unavailable) throw new Error('synthetic outage');
      return { ok: true, json: async () => ({ content: [{ text: JSON.stringify(output) }] }) };
    },
  };
  vm.runInNewContext(source, context);
  return {
    calls, budgetChecks: () => budgetChecks, setOutput: (o) => { output = o; },
    setUnavailable: () => { unavailable = true; },
    run: async (ids, budget = 'u50') => JSON.parse((await context.exports.handler({
      httpMethod: 'POST', body: JSON.stringify({ q: 'coastal gift', ids, budget }),
    })).body),
  };
}

test('small shortlist stays small; no arbitrary claims or checkout links', async () => {
  const m = setup();
  m.setOutput({ say: 'Free shipping', picks: [{ id: 'cap', why: 'Made in USA' }, { id: 'extra0' }, { id: 'cap' }] });
  const result = await m.run(['cap']);
  assert.deepEqual(result, { ok: true, say: '', picks: [{ id: 'cap', why: '' }] });
  assert.match(m.calls[0].messages[0].content, /cap \|/);
  assert.doesNotMatch(m.calls[0].messages[0].content, /extra0 \|/);
});
test('unknown, negative and over-budget prices never go to AI under a finite budget', async () => {
  const m = setup();
  m.setOutput({ picks: [{ id: 'knit' }, { id: 'unknown' }, { id: 'invalid' }, { id: 'cap' }] });
  assert.deepEqual((await m.run(['knit', 'unknown', 'invalid', 'cap'])).picks, [{ id: 'cap', why: '' }]);
  assert.doesNotMatch(m.calls[0].messages[0].content, /(?:knit|unknown|invalid) \|/);
});
test('empty or forged shortlist returns fallback without consuming AI budget', async () => {
  const m = setup();
  assert.deepEqual(await m.run(['fake', 'knit', 'unknown']), { ok: false, reason: 'no_valid_picks' });
  assert.equal(m.calls.length, 0);
  assert.equal(m.budgetChecks(), 0);
});
test('bounded shortlist and at most three unique picks', async () => {
  const m = setup();
  const ids = Array.from({ length: 20 }, (_, i) => 'extra' + i);
  m.setOutput({ picks: ['extra19', 'extra0', 'extra0', 'extra1', 'extra2', 'extra3'].map(id => ({ id })) });
  assert.equal((await m.run(ids)).picks.length, 3);
  assert.doesNotMatch(m.calls[0].messages[0].content, /extra14 \|/);
});
test('upstream outage preserves browser fallback', async () => {
  const m = setup();
  m.setUnavailable();
  assert.deepEqual(await m.run(['cap']), { ok: false, reason: 'upstream' });
});
