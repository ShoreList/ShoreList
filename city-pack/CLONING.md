# Cloning the ShoreList site for a new city

Status: **spec and tooling only.** No generator reads `city.config.json` yet, so a clone today is a manual copy plus the checks below. Everything here is additive and leaves the Wilmington output unchanged. Source of the rules: `tourism-playbook.md` sections 3.1 to 3.7 and finding P12 (Google spam policies).

Sizing: `city-pack/HARDCODED-REPORT.md` (regenerate with `node tools/audit-hardcoded.mjs`) lists every hard-coded city string by file. Treat it as the refactor backlog; `generated` rows vanish once their generator reads the pack, the rest need code changes.

## Why this procedure exists

Google's spam policy names two things a clone network can be punished for: scaled content ("many pages without adding value", and "multiple sites with the intent of hiding the scaled nature of the content") and doorway pages ("substantially similar pages", multiple domains targeting cities that funnel to one page). The policy is about intent and value, not templates as such [playbook P12; enforcement on legitimate templated sites is undocumented]. So the defence is two rules:

1. Every city carries real, city-specific data and writing that a noun swap cannot produce.
2. The network is disclosed openly, never hidden.

## Step by step

1. **Pre-conditions.** The Wilmington security fixes (tech review C1, H1, H2) are merged, and operators, prices, slots and caps live in data, not in `PRICES` / `OPS` (playbook top-10 item 2). Do not clone code that still has those holes.
2. **Create the pack.** Copy `city-pack/wilmington/` to `city-pack/<city-id>/`, e.g. `nantucket-ma`. Edit `city.config.json` field by field. Validate: `npx ajv-cli validate -s city-pack/city.config.schema.json -d city-pack/<id>/city.config.json --spec=draft2020 -c ajv-formats` (or any Draft 2020-12 validator).
3. **Identity.** Set `id`, `name`, `domain`, `state`, `timezone`, `center`. Pick a new domain and a new brand (see brand rules). Do not reuse the Wilmington GA4 id, Stripe account, Search Console property or Bing site.
4. **Tax.** Set `tax.rate`, `components` and `basis` from the state and local authority for that city, with the date checked. The 7% in Wilmington is NC 4.75% plus New Hanover County 2.25%. Do not copy it. Have the accountant confirm what is taxable (tours, digital guides) in the new state before checkout goes live.
5. **Areas.** List the real towns and neighbourhoods with centroid, guide path, and a hand-written blurb each. The `key` must match the `area` values used in that city's events data.
6. **Categories.** Include only categories that have a live local operator or real content. Wilmington has 22; a new city may have 6. A category page with no operator is a thin page, so leave it out.
7. **Operators.** Add `operators.json` (id, name, categories, tours, price, slots, days, cap, live, cancellation policy, meeting point, Stripe connect id) only for operators who have agreed. No placeholder or borrowed operators.
8. **Events.** Write `events/sources.json` (feeds, venue pages, rights notes) and curated events with `verified` source URLs. Keep the `confirm` label for unverified items.
9. **Places, FAQ, stay.** Build from local research with `source` and `lastChecked`. Copy nothing from another city's file.
10. **Weather and tides.** Set the forecast points and the NOAA CO-OPS station for that coast. Wilmington's station is 8658163 and is not valid anywhere else.
11. **Nav and brand tokens.** Set `nav`, `brand.colors`, fonts and wordmark per the brand rules.
12. **Analytics and payments.** Fill `analytics` with the new site's own ids. Create a separate Stripe account (or at minimum separate live keys and webhook) so the site can be sold alone. Keys go in Netlify env vars named in `stripe.*EnvVar`, never in the repo. Set `stripe.allowedOrigins` to the new domain only (today `_shared.js` and `guide-download.js` hard-code shorelist.net).
13. **Publish the network disclosure** (below) on the new site and add the new city to the umbrella list.
14. **Run the gates**, all must pass:
    - `node tools/check-site.mjs`
    - `node tools/check-keywords.mjs --config city-pack/<id>/keywords.json --site https://<domain>` (method and template in `docs/SEO-KEYWORDS.md`)
    - `node tools/thin-content-gate.mjs --site <build dir> --config city-pack/<id>/city.config.json --against <every other city's build dir>`
    - `node tools/audit-hardcoded.mjs --root <build dir> --out /dev/null` and confirm no Wilmington, NC, `shorelist.net` or Wilmington coordinates remain in the new site's files.
15. **Launch gate.** Do not go live below `launchGate` (default 3 live operators, 20 verified events in the next 60 days, 4 hand-written guides, 12 own photos). The numbers are unvalidated; tune them.
16. **Off-site setup.** Own Google Business Profile, Search Console, Bing Webmaster and IndexNow per site (playbook 3.7). Test two cities before committing to many.

## Must be written fresh for every city

Never copied, never noun-swapped:

- Area guides with real drive times, parking, transit, local rules
- Category intros and FAQs (the per-category `intro`, `where`, `faq` in `seo-data.mjs`)
- Town page and area blurbs
- Event calendar, venue relationships, source rights notes
- Operators, prices, slots, caps, cancellation policy, meeting points
- Places and lodging lists with sources and check dates
- Itineraries, seasonal calendar built from that city's own events
- Photography with credit and licence per file
- Local-expert bylines and the verification description
- Real reviews with booking provenance (never imported from another city)
- Local conditions content: tides, surf, beach flags, closures
- Shop line: local icons and merch designs
- Meta titles and descriptions (written, not generated from a pattern)
- Legal and tax text where the state differs

May be shared: layout, components, accessibility, checkout and webhook code, JSON-LD builders, planner prompt skeleton (city context injected), image pipeline, sitemap and robots logic.

## Per-city brand identity rules

- Own domain and own site name. The wordmark, logo, colour palette and type pairing must differ from other cities; do not ship the Wilmington teal and coral under a new name.
- Own voice notes in `brand.voiceNotes`, written from the place (what locals call things).
- Own images only (`brand.ownAssetsRequired`). No Wilmington photos, no stock reuse across sites. Each file needs a credit and licence record.
- Own social handles, email address, Search Console, GA4 property, Stripe account.
- No other city's name, operator, price or coordinate anywhere in the build (audit tool check, step 14).
- Shared elements allowed: the umbrella footer line and the network page link, nothing else brand-like.
- Cross-links to sister cities only where a visitor would plausibly want them ("Visiting the Outer Banks next?"), a handful per page at most. No site-wide footer listing every city (reads as a link scheme; playbook judgement, unverified).

## Disclosure: "About the network" page (required)

Every clone must ship these before launch:

1. A real page at `umbrella.aboutNetworkPath` (default `/about-the-network`) on the city site, linked from the footer on every page and listed in the sitemap.
2. Footer line on every page: `umbrella.footerLine` ("A ShoreList network site") linking to that page.
3. Page content, in plain words:
   - who operates the sites (ShoreList LLC, address, contact)
   - that the sites share software and an editorial standard but each has its own local data, operators and writers
   - how local content is produced and verified per city (sources, `lastChecked`, the "confirm" label) and who the local contributors are
   - the list of current network sites with links, and a statement that operators and events are chosen per city
   - how bookings and money work (separate checkout per site) and how to reach a person
4. Organization JSON-LD on each site naming ShoreList LLC as parent or `isPartOf`, so the relationship is machine-readable too.
5. Never present a city site as independent of the network, never use fake local bylines, never publish reviews or ratings not tied to a real booking or an external review URL.

If any of these cannot be met for a city, that city does not launch. This is the playbook's answer to the "hiding the scaled nature" clause: disclose, and carry real per-city value.

## Known gaps in the tooling

- No generator reads the pack. `tools/seo-data.mjs`, `build-seo-pages.mjs`, `build-events-pages.mjs`, `build-llms.mjs`, `category-app.js`, `weather.js`, `beachwx.js` and both Stripe functions must be refactored first. That work is not part of this change.
- The gate's cross-city check needs a second city's build to compare against. Until then it can only be validated with a synthetic noun-swapped copy, which it does flag.
- `nantucket-site-plan.md` was not available in `/home/claude/plans/` when this was written, so no Nantucket specifics are encoded.
