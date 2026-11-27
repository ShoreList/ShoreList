# RELEASE_GATES.md

A release is any merge to `main` (it can deploy). Every gate needs evidence in the PR: command, exit code, or screenshot, labeled VERIFIED. A gate you could not run is reported UNKNOWN and blocks only if marked **hard**. Owner approval is required for items marked **owner**.

## G0 Scope and approvals (hard)
- [ ] Change is within an authorized category (AGENTS rule 2) or has explicit owner approval in the PR thread.
- [ ] No spend, account change, deletion, or new product publication included.
- [ ] Brand wall respected (no Late to AI / TaskBot Market content).
- [ ] No secrets in diff (`git diff origin/main | grep -nE 'sk_|whsec_|shpat_|re_[A-Za-z0-9]{16}|BEGIN .*PRIVATE'` returns nothing).
- [ ] Rollback line written (`git revert <sha>`, bump `sw.js`; Shopify before/after record).

## G1 Automated tests (hard)
- [ ] `node tools/check-site.mjs` exit 0
- [ ] `node tools/check-keywords.mjs` exit 0
- [ ] `node --test tools/feeds/feeds.test.mjs` and `tools/indexnow-ping.test.mjs` pass
- [ ] `node tools/test-attrib.mjs`, `test-shop-analytics.mjs`, `test-goods-checkout.cjs` pass
- [ ] CI job `check` green on the PR
- [ ] Known failures unchanged and named (`test-operators`; `speed` baseline below). A new failure blocks.

## G2 Performance (hard for touched pages)
Mobile Lighthouse (CI `lighthouse-budget.mjs`). Floors are 90 for performance, accessibility, best-practices, SEO. Baseline on `main` 2026-11-26 02:59Z: `/` 98, `/shop.html` 92 (CLS 0.083), `/events.html` 96, `/things-to-do/ghost-tours.html` 95.
- [ ] Pages you touched do not score lower than baseline; shop must stay >= 90; CLS <= 0.1 on pages you touched (shop baseline 0.083).
- [ ] Image changes use sized Shopify `_NNNx` URLs or compressed webp; no full-size photos on cards.
- [ ] The homepage is now 98; any PR that drops it below 90 does not merge.

## G3 Accessibility (hard)
- [ ] Lighthouse accessibility >= 96 on touched pages (baseline 96 to 100) and no regression.
- [ ] Keyboard path works for bag open/close, quantity, remove, checkout; focus visible; Esc closes dialogs.
- [ ] Images have meaningful alt (check-site enforces presence and bans filename-style alt).
- [ ] Contrast checked for any new color pair; reduced-motion respected.

## G4 Mobile responsiveness (hard for UI changes)
- [ ] Screenshots at 390x844 and 1280x800 (and 320 wide for bag and cards). No horizontal scroll, no clipped text, tap targets >= 44px, promo banner does not cover content or the bag button.

## G5 SEO (hard for page changes)
- [ ] Unique `<title>`, meta description, canonical (absolute `https://shorelist.net/...`), OG image on every changed page; robots allows indexing except success/dashboard pages.
- [ ] JSON-LD valid; Product/Offer price equals catalog price; no `Organization.sameAs` until verified; no unsupported claims (ratings, reviews, "best", awards).
- [ ] `sitemap.xml` entries and `lastmod` correct for changed URLs; `update-sitemap-lastmod` run when needed.
- [ ] No new duplicate titles (compare `thin-content-gate` counts to baseline 201 titles / 222 descriptions).

## G6 Coastal luxury and product fidelity (hard for new or materially revised brand work)

- [ ] The exact revision has an independent 90/100 or higher coastal luxury review, checked local references, no hard failures, and evidence for all five dimensions in the [Coastal Brand Standard](docs/COASTAL-BRAND-STANDARD.md).
- [ ] New merchandise also has evidence for all ten product criteria. The mean is at least 9/10, each score is at least 8/10, and the blind photo review is at least 8/10. Obtain owner quality approval before publication.
- [ ] Each changed card's lead image was opened and matches the exact product type, color, text and design at the intended checkout.
- [ ] Before removing or replacing product imagery, audit both assets, prepare the exact replacement pair, and complete the existing product, coastal luxury and blind photo scoring. Release the accurately disclosed Higgsfield lookbook first and the verified actual studio image second in the same change. Record the sellable variant, file digests, scale and realism evidence, and exact-version approval in `docs/shop-photo-review.json`.
- [ ] No color shown that is not sold; no baked-in titles from AI tools; AI lifestyle imagery or video is labeled and does not misrepresent the product.
- [ ] Price and variants on the card match the intended checkout. Verify them against Shopify Admin or live `shop-product`, Fourthwall merchant data, or the Direct catalog and authenticated CJ variant data, as applicable.
- [ ] Banned wording absent (see `tools/ingest-shopify-products.mjs`), no em/en dashes in copy, no divisive slogans.

## G7 Checkout and discounts (hard for cart, promo, catalog price, or Shopify discount changes)
- [ ] Bag: add, change quantity, remove, persistence across tabs and reload, sold-out line handling, empty state.
- [ ] Shopify permalink opens checkout with the right items and quantities; totals match the card prices (stop before payment unless the owner is doing the real order).
- [ ] Each public code reaches "applied" at Shopify checkout inside its window and is rejected outside it: `SHORE15` through 2026-11-26 23:59 ET, `SHOREFRIDAY15` on 11-27, `SHORECYBER15` on 11-30, `SHOREWELCOME10` once per customer. Codes do not combine; messaging says so where relevant.
- [ ] Banner windows (`shop-promo.js`) match Shopify start/end instants (UTC).
- [ ] ShoreList Direct (Stripe) paths remain dormant or covered by `test-goods-checkout`.
- [ ] **owner:** one real test order using the one-use test code, refunded or cancelled by the owner; confirmation and tracking emails arrive. Until done, checkout is "not proven end to end".

## G8 Error handling and tracking
- [ ] Failure UX verified: offline, function error, sold-out variant, blocked storage show a visible message and a working link.
- [ ] GA4 events fire once with correct values and no PII (DebugView). Without GA access: report UNKNOWN, do not claim tracking works.
- [ ] Console clean (no CSP violations) on `/`, `/shop`, a town page.

## G9 Security
- [ ] CSP in `_headers` not loosened without reason; no new third-party script/host without owner approval if it collects data.
- [ ] `netlify.toml` still blocks `/netlify/*`, `/data/*`, `/dropship-catalog.json`, `/tools/*`, `/docs/*`, `/city-pack/*`, and the root onboarding `.md` files.
- [ ] Functions keep origin checks, rate limits, caps, webhook signature verification.

## G10 Post-merge verification (hard)
- [ ] After deploy: hard refresh or private window; headline, banner, changed cards, `sw.js` VERSION match `main`; report timestamps. If the live site does not match, say so; do not claim the change is live.
- [ ] Record the release in `CHANGELOG.md` with only what was verified.

## Launch freeze (recommended, owner decides)
From Thu 2026-11-26 12:00 ET to the 5 PM launch: only fixes for defects that break browsing, bag, checkout or a price/claim error. Everything else waits until after the weekend. HYPOTHESIS: fewer late changes reduce launch-day regressions.
