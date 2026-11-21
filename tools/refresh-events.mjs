// Refreshes events-data.json from public iCal feeds listed in tools/event-sources.json.
// Curated entries (source "curated") are kept; feed entries are replaced; past events are pruned.
import { readFileSync, writeFileSync } from 'node:fs';
const cfg = JSON.parse(readFileSync('tools/event-sources.json', 'utf8'));
const data = JSON.parse(readFileSync('events-data.json', 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const horizon = new Date(Date.now() + cfg.horizonDays * 864e5).toISOString().slice(0, 10);
const unfold = (t) => t.replace(/\r?\n[ \t]/g, '');
const unesc = (s) => s.replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\;/g, ';').replace(/\\\\/g, '\\').trim();
function d8(v) { const m = /(\d{4})(\d{2})(\d{2})/.exec(v || ''); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; }
function parse(ics, f) {
  const out = [];
  for (const blk of unfold(ics).split('BEGIN:VEVENT').slice(1)) {
    const g = (k) => { const m = new RegExp('^' + k + '[^:\\n]*:(.*)$', 'm').exec(blk); return m ? m[1].trim() : ''; };
    const title = unesc(g('SUMMARY')), s = d8(g('DTSTART')), e = d8(g('DTEND')) || s;
    if (!title || !s) continue;
    out.push({ id: f.id + '-' + (g('UID') || title).replace(/[^a-z0-9]+/gi, '-').slice(0, 40) + '-' + s, title, start: s, end: e < s ? s : e,
      venue: unesc(g('LOCATION')).split(',')[0] || f.venue, area: f.area, cat: f.cat, url: g('URL') || f.site, source: f.id });
  }
  return out;
}
let keep = data.events.filter((e) => e.source === 'curated');
for (const f of cfg.feeds) {
  try {
    const r = await fetch(f.ics, { headers: { 'User-Agent': 'ShoreListEventsBot/1.0 (+https://shorelist.net)' } });
    if (!r.ok) throw new Error(r.status);
    const ev = parse(await r.text(), f).filter((e) => e.end >= today && e.start <= horizon);
    keep = keep.concat(ev); console.log(f.id, ev.length, 'events');
  } catch (err) {
    console.log(f.id, 'failed, keeping previous entries:', err.message);
    keep = keep.concat(data.events.filter((e) => e.source === f.id));
  }
}
keep = keep.filter((e) => e.end >= today).sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
const seen = new Set(); keep = keep.filter((e) => !seen.has(e.id) && seen.add(e.id));
writeFileSync('events-data.json', JSON.stringify({ updated: today, events: keep }, null, 1) + '\n');
console.log('total', keep.length);
