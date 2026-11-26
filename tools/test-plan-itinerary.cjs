const assert = require('node:assert/strict');
const { test } = require('node:test');
const { itineraryFor } = require('../netlify/functions/plan-itinerary.js');

const stops = new Map([
  ['riverwalk', { name: 'Walk the Wilmington Riverwalk', links: [['/downtown', 'Downtown guide']] }],
  ['wrightsville', { name: 'Spend time at Wrightsville Beach' }],
  ['local-food', { name: 'Browse local places to eat' }],
  ['walking-tour', { name: 'Walking tour', category: 'walking-tours' }],
]);
const requested = () => [...stops.keys()].map((id, i) => ({ id, time: ['9:00 AM','11:30 AM','2:00 PM','6:30 PM'][i] }));

test('planner returns only supported stop data and suggested times', () => {
  const items = requested();
  Object.assign(items[0], { name: 'Unverified name', description: 'Tickets cost $5', category: 'unverified',
    links: [['https://example.com', 'External link']], bookable: true });
  const result = itineraryFor({ items, title: 'Unverified availability' }, stops);
  assert.equal(result.title, 'Your Wilmington itinerary');
  assert.deepEqual(result.items[0], { time: '9:00 AM', ...stops.get('riverwalk') });
  assert.equal(result.items[3].category, 'walking-tours');
});

test('unknown, duplicate, malformed and incomplete schedules fall back', () => {
  assert.equal(itineraryFor({ items: requested().slice(0, 3) }, stops), null);
  for (const replacement of [null, { id: 'unknown', time: '9:00 AM' },
    { id: 'wrightsville', time: '9:00 AM' }, { id: 'riverwalk', time: 'open until midnight' }]) {
    const items = requested();
    items[0] = replacement;
    assert.equal(itineraryFor({ items }, stops), null);
  }
});
