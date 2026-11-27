# ShoreList site upgrade spec

**For:** the ShoreList coding agent, to ship against this document only.
**Site:** shorelist.net (Wilmington, NC coastal guide, experience booking, and /shop).
**Written:** Friday, Nov 27, 2026, about 12:05 PM ET (America/New_York).
**Scope:** a build plan only. Do not treat this file as a license to invent facts, prices, events, or reviews.

This plan upgrades every visitor-facing part of the site so ShoreList is the one place locals and visitors use to find something to do and actually do it.

## 0. Constraints (binding)

- ShoreList coastal identity only. Palette: Harbor Navy `#0E1F33`, Sailcloth White `#F4F1EA`, Dune Sand `#D9C7A3`, Sea Glass `#9FC3B8`, Signal Red `#B5362F`, Weathered Teak `#8A5A3B`. Fonts already on the site: Libre Caslon Display / Text, DM Sans, DM Mono.
- Do not copy code, assets, copy, colors, layout, or characters from any other brand's site. Do not name other brands in code, comments, PRs, or copy.
- No AI-slop visuals and no AI people. The WebGL water is a shader, not a photo. It must look like looking at the ocean.
- Leave the floating mascot / guide characters alone. A separate effort is replacing them with a real animal. You may improve the concierge panel and the command palette. Do not restyle, replace, or ship a new mascot.
- Performance floor on every phase, measured on mobile (390px): Lighthouse Performance 90+, Accessibility 100, LCP under 2.5s, INP under 200ms, CLS under 0.1. Honor `prefers-reduced-motion` and Data Saver. Never start WebGL, audio, or AI on first paint.
- Free or already-owned services only. Leaflet + OpenStreetMap and NOAA / Open-Meteo / NWS are free. Paid tools, new subscriptions, account systems, and key entry are listed in the PR as "needs RJ" and are not done.
- Usual pipeline: fresh branch off `main`, bump `sw.js` `VERSION`, run `check-site`, `check-keywords`, `thin-content-gate`, and `lighthouse-budget`, open a PR, squash merge when CI is green, then verify live at 390px.
- Honest copy only. Never invent reviews, event times, or prices.
- Do not touch checkout, Stripe, the dashboard, or running ad campaigns.

## 1. Phase plan

Ship in this order. Do not hold Phase 1 for Phase 3.

### Phase 1. The wow, today

**1A. Magnetic, floating interface.** Fine pointers: primary links, chips, path buttons, cards, and CTAs ease a few pixels toward the cursor inside one `requestAnimationFrame` listener. Touch: a short press scale and, on a primary CTA only, one 8 to 12 ms vibration if `navigator.vibrate` exists. Reduced motion: instant state, no chase, no vibration. Do not restyle the guide character. 44px hit targets. Contrast stays 4.5:1. Transforms and opacity only.

**1B. View Transitions.** Keep `@view-transition { navigation: auto }` and keep transitions at or under 280 ms. Name the header chrome and `#main` so the page content can cross-fade without duplicate names on one page. Reduced motion disables the choreography. Speculation Rules stay as they are. Shop prerender stays excluded.

**1C. Live WebGL ocean hero.** Keep the real photo plates and their credits. The photo remains the LCP element. Desktop may run the shader after idle when the photos fail, as it does today. Mobile (820px and under) draws one still frame of the water after idle, masked to the lower band so the photograph stays the place, and offers a "Play water" control. The loop stays off until that tap. Reduced motion and Data Saver do not start WebGL. Wind from `ShoreWX`, when it has already loaded, scales the wave pace. A calm default is used until then. Never block first paint on NOAA or Open-Meteo. Cap DPR at 2. Pause off-screen.

**1D. Tonight and This weekend.** Rails on the home page, sourced only from `/events-data.json`. Tonight is today in America/New_York with a start time at or after 4:00 PM. Untimed events are excluded. If Tonight is empty, say "No timed evening events on the calendar yet" and link to `/events`. This weekend is Friday through Sunday, up to 6 cards, verified and timed first. Each card links to the ShoreList event page. "Plan tonight" links to `/planner?when=tonight`.

### Phase 2. One intelligent front door

One shared client for the command palette, the Shore AI panel, and `/planner`, with one session and an index that includes events, Shore Picks, bookable tours, and shop products. Route questions to conditions, events, food, booking state, shop, then guides. Cite ShoreList URLs. Never invent a price, a time, or a booking slot. If the model function fails, show index matches. Itinerary modes: Tonight, This weekend, One day, Rain plan. CTAs match live state: Book, Get tickets, Join waitlist, or View.

### Phase 3. The complete one-stop shop

Indexable views for nightlife, family, rainy-day, and free, plus shared filters (date, area, budget, vibe) that hide items with missing metadata instead of guessing. `/events/tonight`. Leaflet map layers for conditions, tonight, the weekend, experiences, and Shore Picks. More official public calendars only after the URL is verified. `/locals` and device-local `/favorites` with no account. NWS alerts for NCZ106 after `api.weather.gov` is added to CSP. Ocean sound on mobile only after a tap. Shop 360 only from real studio frames.

## 2. Acceptance

Every phase: mobile Performance 90+, Accessibility 100, LCP under 2.5s, INP under 200ms, CLS under 0.1, reduced motion respected, no invented listings. Phase 1 also: the hero photo stays the LCP element, the WebGL loop is off by default on mobile and on reduced motion, Tonight never includes an untimed event, and `sw.js` VERSION is bumped.

## 3. Needs RJ

New paid maps or event APIs, Cloudflare key entry, any account system, and any change to ads, prices, or operator contracts.
