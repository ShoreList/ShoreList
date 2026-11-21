// Core of the events refresh, free of file and network access so it can be tested offline.
// Rules: curated entries are never touched; each source is isolated in try/catch; a failing source keeps its previous entries;
// feed events that fuzzy-match an existing event (title + date) are dropped; per-source health is returned for tools/feed-health.json.
import { robotsAllows, mergeDeduped } from './feeds/lib.mjs';

export async function refresh({ data, cfg, parsers, fetchText, now = new Date(), prevHealth = {} }) {
  const today = now.toISOString().slice(0, 10), horizon = new Date(now.getTime() + cfg.horizonDays * 864e5).toISOString().slice(0, 10);
  const health = {}, log = [];
  let events = data.events.filter((e) => e.source === 'curated'); // curated: kept as-is
  for (const f of cfg.feeds) {
    if (f.enabled === false) continue;
    const prev = prevHealth[f.id] || {}, h = (health[f.id] = { name: f.name, url: f.ics, lastAttempt: now.toISOString(), lastSuccess: prev.lastSuccess || null, count: prev.count ?? 0, ok: false, error: null });
    try {
      const mod = parsers[f.id];
      if (!mod) throw new Error('no parser module registered');
      const u = new URL(f.ics);
      const rob = await fetchText(u.origin + '/robots.txt', { robots: true });
      if (rob.status === 200 && !robotsAllows(rob.text, u.pathname + u.search)) throw new Error('robots.txt disallows this feed; source skipped');
      if (rob.status !== 200 && rob.status !== 404 && rob.status !== 410) throw new Error('robots.txt unavailable (' + rob.status + '); source skipped');
      const r = await fetchText(f.ics, {});
      if (r.status !== 200) throw new Error('HTTP ' + r.status);
      const ev = mod.parse(r.text, f, { today, horizon }).filter((e) => e.end >= today && e.start <= horizon);
      const m = mergeDeduped(events, ev);
      events = m.events;
      Object.assign(h, { ok: true, count: ev.length, added: ev.length - m.skipped.length, duplicatesSkipped: m.skipped.length, lastSuccess: now.toISOString() });
      log.push(`${f.id}: ${ev.length} parsed, ${m.skipped.length} duplicates skipped`);
    } catch (err) {
      h.error = String(err.message || err).slice(0, 200);
      const kept = data.events.filter((e) => e.source === f.id && e.end >= today);
      events = mergeDeduped(events, kept).events; // previous feed entries stay when a source fails
      log.push(`${f.id}: failed (${h.error}), kept ${kept.length} previous entries`);
    }
  }
  events = events.filter((e) => e.end >= today).sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
  const seen = new Set(); events = events.filter((e) => !seen.has(e.id) && seen.add(e.id));
  return { data: { updated: today, events }, health: { updated: now.toISOString(), sources: health }, log };
}
