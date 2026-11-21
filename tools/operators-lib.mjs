// Shared by tools/build-operators-public.mjs, build-seo-pages.mjs, build-search-index.mjs,
// check-site.mjs and test-operators.mjs. Reads data/operators.json (the one source of truth)
// and derives the PUBLIC subset. The server reads the same file in netlify/functions/_shared.js.
import fs from 'node:fs';

const ROOT = new URL('../', import.meta.url);
export const SOURCE = new URL('data/operators.json', ROOT);
export const PUBLIC_FILE = new URL('operators-public.json', ROOT);

export function loadOperators(file = SOURCE) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const usd = (c) => '$' + (c % 100 === 0 ? c / 100 : (c / 100).toFixed(2));

// Allowlist, never a blacklist: a new field in data/operators.json stays server-only until it is added here.
// Output keeps the shape category-app.js has always used for OPS, grouped by category in file order.
export function toPublic(data) {
  const ops = new Map(data.operators.map((o) => [o.id, o]));
  const categories = {};
  for (const t of data.tours) {
    const sch = { days: t.schedule.days, slots: t.schedule.slots };
    if (t.schedule.rules) sch.rules = t.schedule.rules;
    if (t.schedule.months) sch.months = t.schedule.months;
    if (t.capacity != null) sch.cap = t.capacity; // already visible in the old client code: the calendar greys out full slots
    const o = { id: t.id, business: t.name, operator: ops.get(t.operatorId).name };
    if (t.live) o.live = true;
    Object.assign(o, { title: t.headline, desc: t.description, price: usd(t.priceCents), priceLabel: t.priceLabel, priceCents: t.priceCents, tags: t.tags, note: t.note, schedule: sch });
    (categories[t.category] = categories[t.category] || []).push(o);
  }
  return {
    schemaVersion: data.schemaVersion,
    city: data.city,
    cancellationHours: data.defaults.cancellationHours,
    taxRate: data.defaults.tax.rate,
    categories,
  };
}

export const publicJson = (data) => JSON.stringify(toPublic(data), null, 1) + '\n';
