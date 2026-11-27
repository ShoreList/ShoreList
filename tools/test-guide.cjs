const test = require('node:test');
const assert = require('node:assert/strict');
const g = require('../netlify/functions/guide.js');

test('path picks the character and the session lock holds', () => {
  g.resetGuide();
  assert.equal(g.characterFor('/shop', '').id, 'wrighty');
  assert.equal(g.characterFor('/', '').id, 'shelby');
  assert.equal(g.characterFor('/things-to-do/walking-tours', '').id, 'cape');
  assert.equal(g.characterFor('/shop', 'cape').id, 'cape');
});

test('a guide file can be dropped in and is quoted, not paraphrased into a new price', () => {
  g.resetGuide();
  const docs = g.loadGuides();
  assert.ok(docs.some((d) => d.file === 'beaches.md' && d.persona === 'shelby'));
  const shelby = g.characterFor('/wrightsville-beach', '');
  const ans = g.fallbackAnswer(shelby, 'Is parking free at Wrightsville Beach?', 0);
  assert.match(ans.say, /parking meters run from March 1 to October 31/i);
  assert.match(ans.say, /Which beach are you asking about/);
  assert.ok(ans.links.some((l) => l.url === '/wrightsville-beach'));
  const second = g.fallbackAnswer(shelby, 'Is parking free at Wrightsville Beach?', ans.asked);
  assert.match(second.say, /rainy day/);
  const third = g.fallbackAnswer(shelby, 'Is parking free at Wrightsville Beach?', second.asked);
  assert.doesNotMatch(third.say, /rainy day/);
});

test('a gift question asked of Shelby still answers and names Wrighty', () => {
  g.resetGuide();
  const shelby = g.characterFor('/', '');
  const ans = g.fallbackAnswer(shelby, 'where can I buy a gift');
  assert.match(ans.say, /Wrighty/);
  assert.ok(ans.links.every((l) => l.url.startsWith('/')));
  assert.ok(ans.links.some((l) => l.url.startsWith('/shop') || /gift/i.test(l.title + l.url)));
});

test('an unknown question does not invent a price', () => {
  g.resetGuide();
  const ans = g.fallbackAnswer(g.characterFor('/events', ''), 'zzzz-no-such-topic-qqq');
  assert.match(ans.say, /not sure/i);
  assert.doesNotMatch(ans.say, /\$\d/);
  assert.deepEqual(ans.links.map((l) => l.url), ['/shop', '/things-to-do', '/events']);
});

test('a model price that is not in the pages is dropped', () => {
  assert.equal(g.cleanSay('Tickets are $99 today', 'Walking tours | /things-to-do/walking-tours'), '');
  assert.match(g.cleanSay('The page lists $25.', 'Listed $25'), /\$25/);
});

test('handler uses the fallback when no model key is set', async () => {
  g.resetGuide();
  const prev = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLOUDFLARE_API_TOKEN;
  try {
    const res = await g.handler({
      httpMethod: 'POST',
      headers: { origin: 'https://shorelist.net', 'x-nf-client-connection-ip': '203.0.113.88' },
      body: JSON.stringify({ q: 'walking tour downtown', path: '/things-to-do/walking-tours', character: 'cape' }),
    });
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(body.ok, true);
    assert.equal(body.source, 'fallback');
    assert.equal(body.character, 'cape');
    assert.match(body.greeting, /Captain Cape/);
    assert.ok(body.links.length >= 1);
    assert.ok(body.links.every((l) => l.url.startsWith('/')));
  } finally {
    if (prev == null) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prev;
  }
});
