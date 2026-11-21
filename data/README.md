# data/

## operators.json: the one source of truth for what can be booked

One file per city pack (`"city": "wilmington"`). Everything that was hard-coded in
`netlify/functions/_shared.js` (tour table), `create-checkout.js` (prices, capacities, cancellation and tax text)
and `category-app.js` (operator cards, schedules) now lives here.

```
{
  "schemaVersion": 1,
  "city": "wilmington", "name": "Wilmington, NC", "timezone": "America/New_York",
  "defaults": {
    "capacity": 25,              // guests per tour slot when a tour sets none
    "cancellationHours": 24,     // free cancellation window; used in checkout text and page copy
    "tax": { "rate": 0.07, "label": "NC Sales Tax (7%)" }
  },
  "operators": [ { "id", "name", "server": { "stripeAccount": null } } ],
  "tours": [ {
    "id": "wwt-original",        // stable; stored in Stripe metadata, never rename a live id
    "operatorId": "...",         // must exist in operators[]
    "category": "walking-tours", // /things-to-do/<category>
    "name": "...",               // shown at checkout, on receipts and emails, and as the card title
    "live": true,                // false = visible but checkout refuses it
    "headline", "description", "priceLabel", "tags": [], "note",   // card copy (public)
    "priceCents": 2500,          // authoritative on the server; the browser copy is display only
    "capacity": 24,              // optional; overrides defaults.capacity
    "schedule": {
      "days": [0,1,3],           // 0 = Sunday
      "slots": ["9:00 AM"],      // default slots
      "months": [4,5],           // optional, 0 = January
      "rules": [ {"mdFrom":"03-15","mdUntil":"11-14","slots":[..]}, {"until":"2026-09-04","slots":[..]}, {"slots":[..]} ]   // optional, first match wins
    }
  } ]
}
```

Rules for the schedule are the same ones `getSlots()` in `category-app.js` and `slotsFor()` in `_shared.js`
have always used: `mdFrom`/`mdUntil` (month-day, may wrap the year), `from`/`until` (YYYY-MM-DD), and a last rule with only `slots`.

### Who reads it

* **Server**: `netlify/functions/_shared.js` loads and validates it on first use (bad data throws, so checkout fails closed).
  Bundled into every function by `[functions] included_files` in `netlify.toml`. `/data/*` is blocked on the public site.
* **Browser**: `operators-public.json` at the site root, written by `node tools/build-operators-public.mjs`
  (an allowlist in `tools/operators-lib.mjs`; unknown fields such as `server`, `operatorId` or `defaults` never reach it).
  `category-app.js` fetches it before rendering. `tools/build-seo-pages.mjs` and `tools/build-search-index.mjs` read the same data.
  `capacity` is published as `schedule.cap` (the calendar greys out full slots, as it always did).

### Changing something

1. Edit `data/operators.json`.
2. `node tools/build-operators-public.mjs && node tools/build-seo-pages.mjs && node tools/build-search-index.mjs`
3. `node tools/test-operators.mjs && node tools/check-site.mjs` (check-site fails if `operators-public.json` is stale).
4. Bump `VERSION` in `sw.js`.

`tools/fixtures/legacy-operators-snapshot.json` is a frozen copy of the old hard-coded tables; `tools/test-operators.mjs`
proves the loaded data still equals it. When a price or time changes on purpose, update the snapshot in the same commit.

### Not moved yet

Guide prices (`GUIDES` in `_shared.js`), the tax line in `create-guide-checkout.js` and the webhook email's "24+ hrs" text.

## Booking-source attribution

`attrib.js` stores the first touch of a visit in `sessionStorage` (no cookies): `utm_source`, `utm_medium`, `utm_campaign`, `ref`,
landing path (no query string or hash), referrer host. `category-app.js` and `guides.html` send it as `attrib` to
`create-checkout` / `create-guide-checkout`, which keep only those six keys (lower-cased, `[a-z0-9._~:/ +-]`, 60 to 100 characters)
as Stripe metadata `attr_<key>`. Shown in the dashboard CSV columns and in the owner "sold" emails. Tested by `tools/test-attrib.mjs`.
