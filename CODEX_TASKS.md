# CODEX_TASKS.md: prioritized engineering queue

Rules: `AGENTS.md`. Each task is independently testable. "Files" lists the only files the task may touch; two agents never hold overlapping files at once. Claim a task by adding `Owner: <agent>/<branch>` on your branch's copy. "Impact" is ESTIMATE or HYPOTHESIS unless stated. Launch: Thu 2026-11-26 5 PM ET.

Legend: P0 launch-critical (do before 5 PM Thu), P1 this week, P2 soon, P3 hygiene. Approval column: **none** (engineering, merge per AGENTS rule 1), **owner** (needs RJ), **authorized** (reversible Shopify copy/SEO/merchandising).

## P0

### T-01 Confirm deploy pipeline and live parity
- Why: L1 (live lagged merges). Files: none (investigation) plus an optional `docs/DEPLOY.md` note.
- Do: compare live `shorelist.net/shop` HTML, `sw.js` VERSION and `shop-catalog.json`-driven cards with `main` using `curl`/browser from a networked machine (the sandbox cannot reach the site). Record deploy time vs merge time for PR #317. Check whether a stale service worker or CDN cache is the cause (`Cache-Control` on `/shop`, `/shop.html`, `/shop-catalog.json`).
- Accept: written finding labeled VERIFIED with timestamps; if cache is the cause, a proposed `_headers`/SW fix (separate PR). Netlify dashboard access is owner-only: ask the owner for the deploy log if needed.
- Dependencies: none. Approval: none (read only). Impact: prevents customers seeing old prices, headline or banners on launch day.

### T-02 Homepage mobile performance (RESOLVED by other PRs; guard it)
- Status 2026-11-26 02:59Z: `/` scores 98, `speed` green (VERIFIED). Do not start new perf work; just keep every PR from lowering it. The original brief below is kept for history.

#### Original brief
- Why: L2, `speed` red; TBT 4,200 ms on `/`. Files: `index.html`, `home.js`, `home.css`, `scene.js`, `ambient.js`, `sound.js`, `luxe.js` (claim only what you touch), `sw.js`.
- Do: profile with Lighthouse trace; find long tasks (candidate culprits, HYPOTHESIS: decorative scene/ambient/weather scripts, third-party gtag). Defer or idle-split. **Do not change the homepage design or content** (AGENTS rule 6); performance-only.
- Accept: `node tools/lighthouse-budget.mjs` shows `/` >= 90 or a PR comment with before/after numbers and the remaining blocker; accessibility stays 100; screenshots before/after identical at 390 and 1280 widths; `check-site` green.
- Dependencies: none. Approval: none for perf-only; owner for any visible change. Impact: bounce rate and ranking on the highest-traffic page (HYPOTHESIS).

### T-03 Checkout handoff end-to-end test plan and instrumented run
- Why: L4. Files: `tools/` new test script only.
- Do: (a) write a Playwright script (Playwright is available in the dev container) that adds a product, opens the bag, verifies the Shopify permalink contains correct variant ids/quantities and reaches the Shopify checkout page with the correct subtotal, **stopping before payment**; (b) test each code (`SHOREWELCOME10`, `SHORE15`, BF/CM within their windows) reaches an accepted state on the Shopify checkout page without placing an order. Do not enter payment details. The owner performs the one real test order with the one-use test code.
- Accept: script exits 0 against live; evidence screenshots; failures listed with variant ids. If any step needs a purchase, hold and report.
- Dependencies: T-01. Approval: none for read-only runs; owner for any order. Impact: protects launch-day revenue (VERIFIED risk: never tested end to end).

### T-04 Shopify SEO titles, descriptions, alt text (authorized, reversible)
- Why: L6 (47 SEO titles, 39 alt texts, 1 empty description per earlier audit). Files: none in repo; Shopify Admin only; log in `CHANGELOG.md`.
- Do: re-query products with missing `seo.title`, `seo.description`, media `alt`; write plain, specific copy (town, item, material, color). No hype, no unsupported claims, no em/en dashes, no banned phrases, no "heritage", "est.", "handcrafted in", "made in usa" (banned list in `tools/ingest-shopify-products.mjs`). Record before and after for each product so it can be reverted.
- Accept: re-query shows zero missing fields among published products; sampled 10 products read correctly against their real images; change log committed.
- Dependencies: none. Approval: authorized. Impact: organic search and accessibility (HYPOTHESIS).

### T-05 Reconcile Shopify (152) vs site catalog (110)
- Files: none (report), then `shop-catalog.json` only if a published, correct, photographed product is missing.
- Do: list the 42 products not in the site catalog with status, published flag, reason (draft, held low quality, retired in `docs/retired-items.json`, duplicate). Do not publish anything new.
- Accept: table in the PR; zero published-and-sellable Shopify products unexplained.
- Dependencies: none. Approval: none for report; owner to publish or delete anything. Impact: avoids selling items the site does not show, or showing items that are unavailable.

### T-20 Real photos for 23 Shore Picks restaurants
- Why: L11. Files: `shore-picks.html` (only the `src` of listed cards), uploaded assets.
- Do: owner supplies real photos (or licensed ones with credit); upload to Shopify Files or `shop-art/`; point each card at the new file; rerun `node tools/verify-live.mjs` from a networked machine or the Action.
- Accept: verifier reports zero image failures. Never generate pictures of real restaurants.
- Dependencies: owner supplies photos. Approval: owner.

### T-21 Triage the nightly verifier
- Owner: Codex/fix/shore-picks-live-photo-diagnostics (follow-up to merged #335).
- Files: `tools/verify-live.mjs` for verifier corrections.
- Do: read the `verify-live` Action summary each morning; fix `price`/`stock`/`page` findings the same day (price or availability mismatch is launch-critical), file `image` findings under T-20.


### T-23 Priced first screen on /shop (shop.html)
- Owner: ShoreList Shop & Merch/shop-merch/fix2-priced-first-screen. Assigned by ShoreList Chief, Nov 26 2026 11:21 PM ET (ranked fix 2). Shop & Merch is the sole writer on `shop.html`.
- Files: `shop.html`, `shop.css`, `tools/build-shop-static.mjs`, `sw.js`, `CODEX_TASKS.md`, `CHANGELOG.md`.
- Do: four priced gifts under $35 (real catalog prices, Wrightsville first where a real one exists), labeled "Gifts under $35" if that is honest otherwise "Start here" (never a sales-rank label), sit directly under the /shop headline and are visible on the first screen at 390 px. A short "Order by Dec 7 for Christmas" line may be added only if it matches the T-22 note wording and dates. Hero photo links to the Kure Beach Lifeguard Stand Embroidered Crewneck shown in it, not the unreleased $78 hoodie. Do not include the catalog title patch or the Banks Channel crewneck. Bump `sw.js` to `sl-v294-2026-11-27` (next above main's `sl-v293-2026-11-27`).
- Accept: `check-site`, `check-keywords`, `thin-content-gate` and shop tests pass; BF banner and collection filter still work; 390 and 1280 screenshots in `/workspace/shorelist/evidence-fix2/`.

### T-22 Collection filter fix and Christmas order-by note (shop.html, shop-promo.js)
- Owner: ShoreList Shop & Merch/shop-merch/collection-filter-xmas-banner. Assigned by ShoreList Chief, Nov 26 2026 11:12 PM ET. Merged to main as `14ab363` (#354), live `sl-v289`. Shop & Merch remains the sole writer on `shop.html` for follow-on shop work.
- Shipping claim: cursor/shop-collection-filter-xmas-ac26.
- Files: `shop.html`, `shop-promo.js`, `tools/test-shop-promo.mjs`, `sw.js`, `CODEX_TASKS.md`, `CHANGELOG.md`.
- Do: `setFilter` keeps the current collection when the chip handlers omit the 5th argument; chip handlers pass `coll`; chip counts are scoped to the open collection; add a `bags` type chip. Add a Christmas order-by note (recommended order-by Dec 7, dates vary by item, no guarantee) that shows only when no sale is active, from Dec 1 12:00 AM ET, and hides after Dec 7 11:59 PM ET.
- Accept: type chip change keeps `?collection=beach-setup`; BF/CM banners unchanged; `check-site`, `check-keywords`, `thin-content-gate` and the listed tests pass.

## P1

### T-06 Product fidelity audit, all 110 cards
- Owner: Dot/fix/wilmington-two-graphic-hold. Temporary two-product referral hold for immediate buyer quality; keep the existing drafts intact.
- Files: `shop-catalog.json` only.
- Do: for each item, open the lead image and confirm product type, color, text and design match the Shopify title/variants. Known good: see AGENTS section 8. Fix mismatches studio-first (same pattern as PRs #316, #317). Seven products without lifestyle photos stay studio-first until the owner supplies verified photos.
- Accept: audit table (item, lead image, verdict VERIFIED); `build-shop-static` re-run; `check-site` green; `sw.js` bumped.
- Dependencies: none. Approval: none. Impact: fewer returns and complaints (HYPOTHESIS).

### T-07 Add new lifestyle photos when the owner delivers them
- Files: `shop-catalog.json`, `shop-art/` assets (webp, sized), `sw.js`.
- Do: only add photos that show the real product (verify color/text); upload through the existing Shopify files pipeline if that is how current lookbooks are hosted (current lookbooks are `cdn.shopify.com` URLs); label AI-generated imagery honestly where it is lifestyle styling.
- Accept: each lead image viewed and verified; no baked-in fake titles.
- Dependencies: owner delivery. Approval: owner supplies images.

### T-08 Structured data and metadata pass for shop pages
- Files: `shop.html`, `shop/*.html`, `tools/build-shop-static.mjs`, `tools/check-site.mjs`.
- Do: confirm Product/Offer values (price, availability, URL, image) are generated from `shop-catalog.json` and match Shopify; validate with Google Rich Results test (networked) or a schema validator; ensure each town page has unique title/description; no `Organization.sameAs` until profiles verified.
- Accept: validator output attached; `check-site` extended with an assertion that every Product `offers.price` equals the catalog price.
- Dependencies: T-05. Approval: none. Impact: rich results eligibility (HYPOTHESIS).

### T-09 Sitemap freshness and coverage
- Files: `sitemap.xml`, `tools/update-sitemap-lastmod.mjs`, optionally `.github/workflows/`.
- Do: make shop URLs' `lastmod` update when `shop-catalog.json` changes; decide with owner whether to expose product pages (they live on `myshopify.com`, so they are not ours to list).
- Accept: after a catalog change the tool updates lastmod; IndexNow workflow still green.
- Dependencies: none. Approval: none.

### T-10 Accessibility and mobile pass on shop and bag
- Files: `shop.html`, `shop.css`, `shop-cart.js`, `shop-bot.css`, `shop-bot.js`.
- Do: keyboard-only walk (open bag, change qty, remove, checkout, close with Esc, focus return), screen-reader labels, 44px targets, 320/390/768 widths, reduced motion. Lighthouse a11y is already 100 on `/shop.html`; this is manual coverage Lighthouse cannot give.
- Accept: checklist in PR with VERIFIED per row; defects fixed or filed.
- Dependencies: none. Approval: none.

### T-11 Error handling and failure UX for shop
- Owner: Codex/fix/shorelist-shop-readiness.
- Files: `shop-cart.js`, `shop.html`, `netlify/functions/shop-product.js`, `sw.js`, `tools/test-goods-checkout.cjs`.
- Do: simulate offline, `shop-product` 500, variant sold out, empty bag, localStorage blocked; every case shows a visible, honest message and a working link. Confirm the hidden "could not load the shop" state is reachable only on real failure.
- Accept: scripted cases pass in Playwright with network interception.
- Dependencies: none. Approval: none.

### T-12 Tracking verification
- Files: `shop-analytics.js`, `purchase-analytics.js`, `shop-cart.js`.
- Do: in a real browser with GA4 DebugView (owner grants view access or runs it), verify `view_item`, add to bag, begin checkout fire once with correct values and no PII; confirm purchase tracking only fires on a real success page. Update the placeholder ID comment.
- Accept: DebugView screenshots; events table with VERIFIED. Without GA access, report UNKNOWN.
- Dependencies: owner for GA access. Approval: owner for any new tag.

### T-13 AI helper hardening (`plan-itinerary`, `shop-bot`, `concierge`)
- Files: `netlify/functions/plan-itinerary.js`, `shop-bot.js`, `concierge.js`, tests in `tools/`.
- Do: audit prompts; forbid invented venues, hours, prices, availability; validate model output server-side against `operators.json`/`shop-catalog.json` (shop-bot already validates picks against the catalog; confirm); add refusal for unsupported claims; keep caps and kill switch.
- Accept: test cases with adversarial inputs produce no invented venue or price; no secrets in logs.
- Dependencies: none. Approval: none (do not change model/spend settings without owner).

## P2

### T-14 Duplicate titles/descriptions cleanup (SEO debt)
- Files: page `<title>`/description in generator tools (`tools/seo-data.mjs`, `build-seo-pages.mjs`) not hand edits.
- Accept: `thin-content-gate` duplicate counts reduced (baseline 201/222); no ranking claims.

### T-15 Fix `test-operators` fixture drift
- Files: `tools/test-operators.mjs`, `tools/fixtures/legacy-operators-snapshot.json`.
- Do: normalize HTML entities in the comparison or refresh the snapshot (confirm the current `data/operators.json` text is the approved copy first). Wire into `check.yml` once green.
- Accept: `node tools/test-operators.mjs` exits 0.

### T-16 Unit tests for `shop-promo.js` windows and `shop-cart.js` bag logic
- Files: new `tools/test-shop-promo.mjs` (+ `check.yml` line).
- Accept: boundary cases at start/end instants, DST-free UTC math, preview params; exit 0.

### T-17 Merge-gate policy for `speed`
- Files: `.github/workflows/check.yml` (owner approval, CI policy).
- Do: propose making `speed` non-blocking on pages not touched by the PR, or ratcheting floors to current numbers, so real regressions are visible instead of a permanently red check.

## P3

### T-18 Split and de-duplicate owner project docs
Owner-side (`CLAUDE-MASTER-SHORELIST-TBM.md` mixes ShoreList and the other business, violating the brand wall in docs). Not a repo task; propose only.

### T-19 Custom checkout domain (owner decision)
Evaluate a Shopify custom domain/checkout on a shorelist.net subdomain (L3). Needs owner approval (account/DNS change). HYPOTHESIS: improves trust and conversion.

### T-24 Fishing pier visitor guide
- Owner: Grok/cursor/pier-visitor-guide-49e1
- Files: `johnnie-mercers-pier.html`, `tools/build-pier-guide.mjs`, plus the souvenirs-page link. Not `shop.html` or `shop-catalog.json`.

### T-23 Local gift guides (Wilmington and Wrightsville Beach)
- Owner: Grok/cursor/local-gift-guides-49e1
- Files: `wilmington-nc-gifts.html`, `wrightsville-beach-souvenirs.html`, `wrightsville-beach-christmas-ornament.html`, `tools/build-local-gift-guides.mjs`. Not `shop.html` or `shop-catalog.json`.

### T-shop-lead-order Shop lead order
- Owner: Grok/shop-merch/shop-lead-order
- Files: `shop-catalog.json`, `shop.html`, `tools/build-shop-static.mjs`, `sw.js`, `CHANGELOG.md`. Lead the catalog and the shop's first row with the eight named pieces. Move the thirteen named goods to the end.

### T-hide-14 Hide 14 pulled items from the site
- Owner: ShoreList Shop & Merch/shop-merch/hide-14-pulled-items. Assigned by ShoreList Chief, Nov 27 2026 (RJ approved). 14 Shopify products set to DRAFT on Nov 27; the site must stop listing them.
- Files: `shop-catalog.json`, `docs/retired-items.json`, `shop.html`, `shop/*.html` (town pages, per-product pages for the 14 handles), `gift-guide.html`, `sitemap.xml`, `llms-full.txt`, `search-index.json`, `sw.js`, `CHANGELOG.md`, plus the other pages that link the 14 handles (`holiday-gift-guide.html`, `wilmington-nc-gifts.html`, `gift-finder.html`, `wrightsville-beach-souvenirs.html`, `wrightsville-beach-christmas-ornament.html`) only for link removal. Also removes the "1925" line from the Carolina Beach varsity crewneck copy. No art, no Printify.

## Dependency map

T-01 -> T-03 -> owner test order. T-05 -> T-08. T-02 independent of everything else (own files). T-04, T-06, T-10, T-11, T-13 can run in parallel because file sets are disjoint (check before starting).

### Harbor Goods
- Owner: Grok/cursor/harbor-goods-4568. ShoreList Harbor Goods at /shop/harbor-goods. Fourthwall link-out only. Not the Shopify bag.

### T-fourthwall-legacy Restore Fourthwall collection links
- Owner: Codex/fix/fourthwall-legacy-shop-links. Limit changes to the two legacy Fourthwall redirects in `netlify.toml`. Verify both reach Harbor Goods while ordinary product routes retain their behavior.

### T-harbor-merchant-links Verify Harbor Goods shopping destinations
- Owner: Codex/fix/check-harbor-goods-merchant-links. Include Harbor Goods in the existing merchant link check and nightly Fourthwall coverage.

### T-retired-product-redirects Restore browsing from 14 retired product URLs
- Owner: Codex/fix/retired-product-redirects. Claim `netlify.toml` and `CHANGELOG.md` for permanent redirects from the 14 product pages removed in #402 to their town collections (ST11, OP6).

### T-overnight-2026-11-28 Run the one-night ShoreList work queue
- Owner: Codex/ops/shorelist-overnight-2026-11-28. Claim `.github/workflows/shorelist-overnight.yml` for read-only production checks, promo tests and a supplier evidence report on the night of Nov 28 ET.

### T-live-variant-parity Verify each public Shopify picker variant
- Owner: Codex/ops/verify-live-shop-variant-parity. Claim `tools/verify-live.mjs` and `tools/test-verify-live.mjs` to compare live picker prices and stock with the existing Shopify feed.
