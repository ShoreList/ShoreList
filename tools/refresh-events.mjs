// Refreshes events-data.json from the public feeds listed in tools/event-sources.json (parsers in tools/feeds/).
// Curated entries (source "curated") are kept; feed entries are replaced; past events are pruned. Always exits 0 (fails soft);
// per-source status is written to tools/feed-health.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { refresh } from './refresh-core.mjs';
import { parsers } from './feeds/index.mjs';

const UA = 'ShoreListEventsBot/1.0 (+https://shorelist.net)';
async function fetchText(url, { robots } = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: robots ? 'text/plain' : 'text/calendar, text/plain, */*' }, signal: AbortSignal.timeout(20000) });
  const text = await r.text();
  if (text.length > 5e6) throw new Error('response over 5 MB');
  return { status: r.status, text };
}
try {
  const cfg = JSON.parse(readFileSync('tools/event-sources.json', 'utf8'));
  const data = JSON.parse(readFileSync('events-data.json', 'utf8'));
  const prev = existsSync('tools/feed-health.json') ? JSON.parse(readFileSync('tools/feed-health.json', 'utf8')).sources || {} : {};
  const out = await refresh({ data, cfg, parsers, fetchText, prevHealth: prev });
  out.log.forEach((l) => console.log(l));
  writeFileSync('events-data.json', JSON.stringify(out.data, null, 1) + '\n');
  writeFileSync('tools/feed-health.json', JSON.stringify(out.health, null, 1) + '\n');
  console.log('total', out.data.events.length);
} catch (err) {
  console.log('refresh aborted, nothing written:', err.message);
}
