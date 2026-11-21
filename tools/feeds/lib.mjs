// Shared helpers for event feed modules: iCalendar parsing, time zones, recurrence, filtering, dedupe, robots.txt.
// Pure functions only (no network) so every parser can be unit-tested on saved fixtures.
const TZ = 'America/New_York';

export const unfold = (t) => t.replace(/\r?\n[ \t]/g, '');
export const unesc = (s) => (s || '').replace(/\\[nN]/g, ' ').replace(/\\,/g, ',').replace(/\;/g, ';').replace(/\\\\/g, '\\').replace(/\s+/g, ' ').trim();
export const slug = (s) => String(s || '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
const hash8 = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
// Stable id. Long UIDs (Localist prefixes every UID with the same text) are shortened with a hash so same-day events never collide.
export const makeId = (feedId, uid, title, start) => {
  const k = slug(uid || title);
  return `${feedId}-${k.length > 40 ? k.slice(0, 28) + '-' + hash8(uid) : k}-${start}`;
};

export const addDays = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
export const fmtTime = (h, m) => `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;

// UTC instant -> local {date, h, m} in America/New_York.
function toLocal(ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, h: +p.hour, m: +p.minute };
}
// iCal date/date-time -> {date, h, m, allDay}. Z times convert to Eastern; TZID and floating values are taken as local wall time.
export function parseDt(params, value) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec((value || '').trim());
  if (!m) return null;
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  if (m[4] === undefined || /VALUE=DATE(?!-)/i.test(params)) return { date, allDay: true };
  if (m[7]) return { ...toLocal(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])), allDay: false };
  return { date, h: +m[4], m: +m[5], allDay: false };
}

// Parse VEVENT blocks into plain objects. Keys are upper-case property names; values {v, p} (value, params).
export function vevents(ics) {
  const text = unfold(String(ics || '')).replace(/BEGIN:VALARM[\s\S]*?END:VALARM/g, '');
  if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error('not an iCalendar document');
  return text.split(/BEGIN:VEVENT/).slice(1).map((blk) => {
    const o = {};
    for (const line of blk.split(/END:VEVENT/)[0].split(/\r?\n/)) {
      const m = /^([A-Z0-9-]+)((?:;[^:]*)?):(.*)$/i.exec(line);
      if (!m) continue;
      const k = m[1].toUpperCase();
      (o[k] ||= []).push({ v: m[3].trim(), p: m[2] });
    }
    return o;
  });
}
const first = (o, k) => (o[k] && o[k][0] ? o[k][0].v : '');

// Expand a (small subset of) RRULE: DAILY and WEEKLY with INTERVAL, BYDAY, COUNT, UNTIL, EXDATE. Anything else yields the single base instance.
function occurrences(start, end, rrule, exdates, horizon) {
  const dur = Math.round((Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 864e5);
  if (!rrule) return [[start, end]];
  const r = Object.fromEntries(rrule.split(';').map((x) => x.split('=')));
  if (!['DAILY', 'WEEKLY'].includes(r.FREQ)) return [[start, end]];
  const step = Math.max(1, +r.INTERVAL || 1), until = r.UNTIL ? parseDt('', r.UNTIL)?.date : null, max = r.COUNT ? +r.COUNT : Infinity;
  const DOW = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const days = r.BYDAY ? r.BYDAY.split(',').map((x) => DOW.indexOf(x.slice(-2))) : [new Date(start + 'T00:00:00Z').getUTCDay()];
  const out = []; let n = 0;
  for (let i = 0, d = start; i < 800 && n < max; i++, d = addDays(d, 1)) {
    if (d > horizon || (until && d > until)) break;
    const wk = Math.floor(i / 7), dow = new Date(d + 'T00:00:00Z').getUTCDay();
    const ok = r.FREQ === 'DAILY' ? i % step === 0 : wk % step === 0 && days.includes(dow);
    if (!ok) continue;
    n++;
    if (!exdates.has(d)) out.push([d, addDays(d, dur)]);
  }
  return out;
}

const CATS = [
  ['Markets', /market|bazaar|vendor fair|craft fair/i], ['Holiday', /christmas|holiday|tree lighting|santa|menorah|thanksgiving|new year|candlelight|nutcracker|easter|halloween|trick|pumpkin/i],
  ['Music', /concert|music|band|jazz|symphony|choir|orchestra|live at/i], ['Sports', /\b(5k|10k|run|race|regatta|tournament|triathlon|surf contest|pickleball)\b/i],
  ['Outdoors', /hike|paddle|kayak|bird|cleanup|clean-up|nature|walk|turtle|garden|trail|beach sweep|fishing|snake|tram/i], ['History', /history|historic|civil war|artillery|battleship|fort fisher|tour of|world war|veteran|pearl harbor|memorial/i],
  ['Arts', /art|exhibit|theatre|theater|film|movie night|gallery|poetry|dance/i], ['Family', /family|kids|children|story ?time|movie|youth|junior/i],
];
export const guessCat = (title, fallback = 'Family') => (CATS.find(([, re]) => re.test(title)) || [fallback])[0];

// Turn an iCalendar document into normalized events. opts: {feed, today, horizon, venue(ev,loc), area(ev,loc), cat(title), include(ev) -> bool, defaultCat}.
// feed = {id, url, site, name, venue, area, cat}. Each event carries sourceUrl (organizer page) and via (calendar name) for attribution.
export function normalizeIcs(ics, feed, opts = {}) {
  const out = [], today = opts.today || '0000-00-00', horizon = opts.horizon || '9999-12-31';
  for (const o of vevents(ics)) {
    if (/CANCELLED/i.test(first(o, 'STATUS'))) continue;
    const title = unesc(first(o, 'SUMMARY')), ds = o.DTSTART && parseDt(o.DTSTART[0].p, o.DTSTART[0].v);
    if (!title || !ds) continue;
    const de = o.DTEND && parseDt(o.DTEND[0].p, o.DTEND[0].v);
    let end = de ? de.date : ds.date;
    if (ds.allDay && de && end > ds.date) end = addDays(end, -1); // all-day DTEND is exclusive
    else if (!ds.allDay && de && end > ds.date && de.h === 0 && de.m === 0) end = addDays(end, -1);
    if (end < ds.date) end = ds.date;
    const loc = unesc(first(o, 'LOCATION')), desc = unesc(first(o, 'DESCRIPTION'));
    const ev = { title, loc, desc, categories: unesc(first(o, 'CATEGORIES')) };
    if (opts.include && !opts.include(ev)) continue;
    const exd = new Set((o.EXDATE || []).flatMap((x) => x.v.split(',').map((v) => parseDt('', v)?.date)).filter(Boolean));
    const uid = first(o, 'UID'), url = first(o, 'URL') || feed.site, time = ds.allDay ? undefined : fmtTime(ds.h, ds.m);
    for (const [s, e] of occurrences(ds.date, end, o.RRULE ? first(o, 'RRULE') : '', exd, horizon)) {
      if (e < today || s > horizon) continue;
      const rec = { id: makeId(feed.id, uid, title, s), title, start: s, end: e,
        venue: (opts.venue ? opts.venue(ev, loc) : loc.split(',')[0].trim()) || feed.venue,
        area: opts.area ? opts.area(ev, loc) : feed.area, cat: opts.cat ? opts.cat(title, ev) : feed.cat || guessCat(title),
        url, source: feed.id, sourceUrl: url, via: feed.name };
      if (time) rec.time = time;
      out.push(rec);
    }
  }
  return out;
}

// ---- dedupe ----
const STOP = new Set(['the', 'a', 'an', 'at', 'of', 'and', 'in', 'on', 'for', 'to', 'annual', 'presents', 'with', '2026', '2027']);
const toks = (t) => String(t).toLowerCase().replace(/&/g, ' and ').replace(/['’]s\b/g, '').replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w));
export function titleSim(a, b) {
  const x = new Set(toks(a)), y = new Set(toks(b));
  if (!x.size || !y.size) return 0;
  const inter = [...x].filter((w) => y.has(w)).length;
  const jac = inter / (x.size + y.size - inter), contain = inter / Math.min(x.size, y.size);
  return Math.max(jac, (x.size >= 2 && y.size >= 2) || inter >= 3 ? contain * 0.95 : 0); // containment only for multi-word titles
}
const dayDiff = (a, b) => Math.abs(Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 864e5;
// Same event if titles are close and the start dates are within a day (or one multi-day entry already covers the other's start).
export function isDuplicate(a, b) {
  const overlap = (a.start <= b.end && b.start <= a.end);
  if (!(dayDiff(a.start, b.start) <= 1 || overlap)) return false;
  const sim = titleSim(a.title, b.title);
  return sim >= (dayDiff(a.start, b.start) <= 1 ? 0.6 : 0.8);
}
// Adds incoming events to `base` unless a fuzzy duplicate is already there. Base entries are never removed or altered.
export function mergeDeduped(base, incoming) {
  const out = base.slice(), skipped = [];
  for (const e of incoming) { const d = out.find((x) => isDuplicate(x, e)); if (d) skipped.push([e.id, d.id]); else out.push(e); }
  return { events: out, skipped };
}

// ---- robots.txt ----
// Minimal robots.txt check for one user agent: longest matching Allow/Disallow wins (Allow on tie). Groups for the bot name beat '*'.
export function robotsAllows(robotsTxt, path, agent = 'ShoreListEventsBot') {
  const groups = []; let cur = null, lastWasAgent = false;
  for (const raw of String(robotsTxt || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim(), m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const k = m[1].toLowerCase();
    if (k === 'user-agent') { if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(m[2].toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false;
    if (cur && (k === 'allow' || k === 'disallow') && m[2]) cur.rules.push([k, m[2]]);
  }
  const a = agent.toLowerCase();
  const g = groups.filter((x) => x.agents.some((n) => n !== '*' && a.includes(n)));
  const use = g.length ? g : groups.filter((x) => x.agents.includes('*'));
  let best = null;
  for (const [k, pat] of use.flatMap((x) => x.rules)) {
    const re = new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
    if (re.test(path) && (!best || pat.length > best[1].length || (pat.length === best[1].length && k === 'allow'))) best = [k, pat];
  }
  return !best || best[0] === 'allow';
}
