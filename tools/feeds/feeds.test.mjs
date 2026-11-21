// node --test tools/feeds/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsers } from './index.mjs';
import { robotsAllows, isDuplicate, mergeDeduped, parseDt, makeId } from './lib.mjs';
import { refresh } from '../refresh-core.mjs';

const fx = (n) => readFileSync(new URL('../fixtures/' + n, import.meta.url), 'utf8');
const cfg = JSON.parse(readFileSync(new URL('../event-sources.json', import.meta.url), 'utf8'));
const feed = (id) => cfg.feeds.find((f) => f.id === id);
const ctx = { today: '2026-11-21', horizon: '2027-03-21' };
const run = (id, file) => parsers[id].parse(fx(file), feed(id), ctx).filter((e) => e.end >= ctx.today && e.start <= ctx.horizon);
const REQUIRED = ['id', 'title', 'start', 'end', 'venue', 'area', 'cat', 'url', 'source', 'sourceUrl', 'via'];
const shape = (evs, id) => { for (const e of evs) { for (const k of REQUIRED) assert.ok(e[k], `${id}: ${k} missing on ${e.title}`); assert.match(e.start, /^\d{4}-\d\d-\d\d$/); assert.ok(e.end >= e.start); assert.equal(e.source, id); assert.match(e.url, /^https:\/\//); } assert.equal(new Set(evs.map((e) => e.id)).size, evs.length, id + ': duplicate ids'); };

test('every enabled source has a parser and an https feed URL', () => { for (const f of cfg.feeds) { assert.ok(parsers[f.id], f.id); assert.match(f.ics, /^https:\/\//); } });

test('wrightsville-town: expands weekly market, drops closures, meetings, lessons, cancelled and past events', () => {
  const ev = run('wrightsville-town', 'wrightsville-town.sample.ics'); shape(ev, 'wrightsville-town');
  const mk = ev.filter((e) => /Farmers/.test(e.title));
  assert.deepEqual(mk.map((e) => e.start), ['2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14']);
  assert.equal(mk[0].time, '8:00 AM'); assert.equal(mk[0].cat, 'Markets'); assert.equal(mk[0].venue, 'Wrightsville Beach Park'); assert.equal(mk[0].area, 'Wrightsville Beach');
  assert.equal(new Set(mk.map((e) => e.id)).size, 4);
  const tree = ev.find((e) => /Tree Lighting/.test(e.title)); assert.equal(tree.cat, 'Holiday'); assert.equal(tree.time, '5:30 PM'); assert.equal(tree.sourceUrl, 'https://townofwrightsvillebeach.com/Calendar.aspx?EID=1102');
  assert.equal(ev.length, 5);
});

test('fort-fisher: converts UTC to Eastern, handles all-day exclusive end, drops commission meetings', () => {
  const ev = run('fort-fisher', 'fort-fisher.sample.ics'); shape(ev, 'fort-fisher');
  const ww2 = parsers['fort-fisher'].parse(fx('fort-fisher.sample.ics'), feed('fort-fisher'), { today: '2026-01-01', horizon: '2027-12-31' }).find((e) => /Second World War/.test(e.title));
  assert.equal(ww2.start, '2026-10-03'); assert.equal(ww2.time, '10:00 AM'); // 14:00Z in EDT
  const am = ev.filter((e) => /Candlelight/.test(e.title)); assert.equal(am.length, 2); assert.equal(am[0].time, '10:00 AM'); assert.equal(am[1].time, '3:00 PM'); // 15:00Z and 20:00Z in EST
  assert.notEqual(am[0].id, am[1].id); // same-day Localist UIDs must not collide
  const ann = ev.find((e) => /Anniversary/.test(e.title)); assert.equal(ann.start, '2027-01-15'); assert.equal(ann.end, '2027-01-16'); assert.equal(ann.time, undefined);
  assert.ok(!ev.some((e) => /Commission/.test(e.title)));
  assert.equal(ev[0].venue, 'Fort Fisher State Historic Site'); assert.equal(ev[0].area, 'Kure Beach');
});

test('battleship: keeps visitor events, drops commission meetings and open-day notices', () => {
  const ev = run('battleship', 'battleship.sample.ics'); shape(ev, 'battleship');
  assert.deepEqual(ev.map((e) => e.title), ['Battleship North Carolina Pearl Harbor Day and Veterans Day Remembrances', 'Hidden Battleship Tour']);
  assert.equal(ev[0].start, '2026-12-07'); assert.equal(ev[0].time, '9:00 AM'); assert.equal(ev[0].area, 'Greater Wilmington');
});

test('riverwatch: keeps only local, in-person events and assigns areas', () => {
  const ev = run('riverwatch', 'riverwatch.sample.ics'); shape(ev, 'riverwatch');
  assert.deepEqual(ev.map((e) => e.title), ['Greenfield Lake Cleanup', 'Masonboro Island Beach Sweep']);
  assert.equal(ev[0].area, 'Greater Wilmington'); assert.equal(ev[1].area, 'Carolina Beach'); assert.equal(ev[0].cat, 'Outdoors');
});

test('cameron: parses Tribe ICS and keeps feed defaults', () => {
  const ev = run('cameron', 'cameron.sample.ics'); shape(ev, 'cameron');
  assert.equal(ev.length, 1); assert.equal(ev[0].cat, 'Arts'); assert.equal(ev[0].venue, 'Cameron Art Museum'); assert.equal(ev[0].time, '6:00 PM');
});

test('non-iCalendar responses (HTML error pages) are rejected', () => {
  assert.throws(() => parsers.cameron.parse('<html>Not found</html>', feed('cameron'), ctx), /not an iCalendar/);
});

test('parseDt handles date, UTC, TZID and DST boundaries', () => {
  assert.deepEqual(parseDt('', '20261121'), { date: '2026-11-21', allDay: true });
  assert.deepEqual(parseDt(';TZID=America/New_York', '20261121T190000'), { date: '2026-11-21', h: 19, m: 0, allDay: false });
  assert.deepEqual(parseDt('', '20260705T023000Z'), { date: '2026-07-04', h: 22, m: 30, allDay: false });
  assert.deepEqual(parseDt('', '20261101T050000Z'), { date: '2026-11-01', h: 1, m: 0, allDay: false }); // DST ends 2026-11-01 at 06:00Z: 05:00Z is 1:00 EDT
  assert.deepEqual(parseDt('', '20261101T070000Z'), { date: '2026-11-01', h: 2, m: 0, allDay: false }); // 07:00Z is 2:00 EST
  assert.equal(parseDt('', 'garbage'), null);
});

test('makeId is stable and collision-free for long shared-prefix UIDs', () => {
  const a = makeId('x', 'tag:localist.com,2008:EventInstance_111', 't', '2026-12-01'), b = makeId('x', 'tag:localist.com,2008:EventInstance_112', 't', '2026-12-01');
  assert.notEqual(a, b); assert.equal(a, makeId('x', 'tag:localist.com,2008:EventInstance_111', 't', '2026-12-01'));
  assert.equal(makeId('cameron', 'abc@x.org', 't', '2026-12-01'), 'cameron-abc-x-org-2026-12-01');
});

test('dedupe: fuzzy title + date match, no false positives', () => {
  const cur = { title: 'Hidden Battleship Tour', start: '2027-02-27', end: '2027-02-27' };
  assert.ok(isDuplicate(cur, { title: 'Hidden Battleship Tour (Tickets)', start: '2027-02-27', end: '2027-02-27' }));
  assert.ok(isDuplicate({ title: 'Pearl Harbor Day Remembrance at Battleship North Carolina', start: '2026-12-07', end: '2026-12-07' }, { title: 'Battleship North Carolina Pearl Harbor Day and Veterans Day Remembrances', start: '2026-12-07', end: '2026-12-07' }));
  assert.ok(isDuplicate({ title: 'Holiday Market', start: '2026-11-21', end: '2026-11-28' }, { title: 'Kure Beach Holiday Market', start: '2026-11-22', end: '2026-11-22' }));
  assert.ok(!isDuplicate(cur, { title: 'Hidden Battleship Tour', start: '2027-03-20', end: '2027-03-20' }));
  assert.ok(!isDuplicate(cur, { title: 'Candlelight Christmas Tour', start: '2027-02-27', end: '2027-02-27' }));
  const { events, skipped } = mergeDeduped([cur], [{ id: 'f1', title: 'Hidden Battleship Tour', start: '2027-02-27', end: '2027-02-27' }, { id: 'f2', title: 'Other', start: '2027-02-27', end: '2027-02-27' }]);
  assert.equal(events.length, 2); assert.equal(skipped.length, 1);
});

test('robots.txt: respects Disallow, Allow precedence and bot-specific groups', () => {
  const r = fx('robots.sample.txt');
  assert.ok(robotsAllows(r, '/iCalendar.aspx')); assert.ok(!robotsAllows(r, '/admin/x')); assert.ok(!robotsAllows(r, '/iCalendar.aspx?private=1'));
  assert.ok(!robotsAllows(r, '/anything', 'BadBot/2.0')); assert.ok(robotsAllows('', '/x')); assert.ok(!robotsAllows('User-agent: *\nDisallow: /', '/x'));
  assert.ok(robotsAllows('User-agent: *\nDisallow: /\n\nUser-agent: ShoreListEventsBot\nAllow: /', '/x'));
});

// ---- refresh-core integration, with a fake network ----
const mkData = () => ({ updated: '2026-11-20', events: [
  { id: 'cur-1', title: 'Hidden Battleship Tour', start: '2026-12-07', end: '2026-12-07', venue: 'Battleship North Carolina', area: 'Greater Wilmington', cat: 'History', url: 'https://x.test', source: 'curated', verified: 'https://x.test' },
  { id: 'cur-2', title: 'Old Curated Thing', start: '2026-11-01', end: '2026-11-02', venue: 'v', area: 'Downtown', cat: 'Arts', url: 'https://x.test', source: 'curated' },
  { id: 'riverwatch-old-2026-12-30', title: 'Old Riverwatch Event', start: '2026-12-30', end: '2026-12-30', venue: 'v', area: 'Greater Wilmington', cat: 'Outdoors', url: 'https://x.test', source: 'riverwatch' }] });
const files = { 'wrightsville-town': 'wrightsville-town.sample.ics', 'fort-fisher': 'fort-fisher.sample.ics', battleship: 'battleship.sample.ics', riverwatch: 'riverwatch.sample.ics', cameron: 'cameron.sample.ics' };
const fakeFetch = (over = {}) => async (url) => {
  if (url in over) { const o = over[url]; if (o instanceof Error) throw o; return o; }
  const u = new URL(url); if (u.pathname === '/robots.txt') return { status: 404, text: '' };
  const f = cfg.feeds.find((x) => x.ics === url); return { status: 200, text: fx(files[f.id]) };
};
const now = new Date('2026-11-21T10:00:00Z');

test('refresh: merges all sources, keeps curated, dedupes against curated, reports health', async () => {
  const before = mkData();
  const out = await refresh({ data: before, cfg, parsers, fetchText: fakeFetch(), now });
  assert.ok(out.data.events.some((e) => e.id === 'cur-1')); // curated kept
  assert.equal(out.data.events.filter((e) => /Hidden Battleship/.test(e.title) && e.start === '2026-12-07').length, 1);
  assert.ok(out.data.events.some((e) => e.source === 'fort-fisher')); assert.ok(!out.data.events.some((e) => e.id === 'cur-2')); // past pruned
  assert.ok(!out.data.events.some((e) => e.id === 'riverwatch-old-2026-12-30')); // feed entries replaced by the fresh payload
  for (const f of cfg.feeds) { const h = out.health.sources[f.id]; assert.equal(h.ok, true, f.id); assert.equal(h.error, null); assert.ok(h.lastSuccess); assert.ok(h.count >= 1); }
  const sorted = [...out.data.events].sort((a, b) => a.start.localeCompare(b.start)); assert.deepEqual(out.data.events.map((e) => e.start), sorted.map((e) => e.start));
  assert.equal(new Set(out.data.events.map((e) => e.id)).size, out.data.events.length);
  assert.equal(before.events.length, 3); // input not mutated
});

test('refresh: one failing source does not affect others and keeps its previous entries', async () => {
  const bad = feed('riverwatch').ics;
  const out = await refresh({ data: mkData(), cfg, parsers, fetchText: fakeFetch({ [bad]: new Error('network down') }), now, prevHealth: { riverwatch: { lastSuccess: '2026-11-20T09:00:00.000Z', count: 3 } } });
  const h = out.health.sources.riverwatch; assert.equal(h.ok, false); assert.match(h.error, /network down/); assert.equal(h.lastSuccess, '2026-11-20T09:00:00.000Z'); assert.equal(h.count, 3);
  assert.ok(out.data.events.some((e) => e.id === 'riverwatch-old-2026-12-30'));
  assert.equal(out.health.sources['fort-fisher'].ok, true);
});

test('refresh: HTTP errors, HTML bodies and robots disallow all fail soft', async () => {
  const urls = Object.fromEntries(cfg.feeds.map((f) => [f.ics, f.id]));
  const out = await refresh({ data: mkData(), cfg, parsers, now, fetchText: fakeFetch({
    [feed('fort-fisher').ics]: { status: 503, text: '' },
    [feed('battleship').ics]: { status: 200, text: '<html>oops</html>' },
    'https://capefearriverwatch.org/robots.txt': { status: 200, text: 'User-agent: *\nDisallow: /' },
    'https://cameronartmuseum.org/robots.txt': { status: 500, text: '' } }) });
  assert.match(out.health.sources['fort-fisher'].error, /HTTP 503/); assert.match(out.health.sources.battleship.error, /not an iCalendar/);
  assert.match(out.health.sources.riverwatch.error, /robots\.txt disallows/); assert.match(out.health.sources.cameron.error, /robots\.txt unavailable/);
  assert.equal(out.health.sources['wrightsville-town'].ok, true); assert.ok(out.data.events.some((e) => e.id === 'cur-1')); assert.ok(Object.keys(urls).length === cfg.feeds.length);
});
