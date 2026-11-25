# CODEX_HANDOFF.md: ShoreList current state (as of 2026-11-25 ~16:30 ET)

Rules and commands: `AGENTS.md`. Work queue: `CODEX_TASKS.md`. Labels: VERIFIED / ESTIMATE / HYPOTHESIS / UNKNOWN.

## 1. Snapshot

- Repo `ShoreList/ShoreList`, `main` at `8e2b5a1` (PR #317). 312 commits, first 2026-11-20, 478 tracked files (VERIFIED, `git log`, `git ls-files`). `sw.js` VERSION `sl-v260-2026-11-25`.
- Launch: public target Thu 2026-11-26 5 PM ET (owner statement). Launch sale `SHORE15` ends Thu 2026-11-26 11:59 PM ET; Black Friday `SHOREFRIDAY15` Fri 11-27 (all day ET); Cyber Monday `SHORECYBER15` Mon 11-30 (all day ET); `SHOREWELCOME10` (10% first order, once per customer) is evergreen. VERIFIED in Shopify Admin read on 2026-11-25; banner windows verified by a boundary test of `shop-promo.js` (`/tmp` script, not in repo).
- Local checks (run today, exit 0): `check-site`, `check-keywords`, `thin-content-gate` (warn-only), feeds tests (14), indexnow tests (7), `test-attrib` (9), `test-shop-analytics`, `test-goods-checkout` (25). Failing: `test-operators`. UNKNOWN: `check-shop-links` (no network in sandbox).
- CI on `main`: job `check` green, job `speed` red (VERIFIED, run 2026-11-25 20:48Z): `/` perf 65 (LCP 2.6 s, TBT 4,200 ms), `/shop.html` 94 (LCP 2.2 s, TBT 230 ms, CLS 0.059), `/events.html` 85, `/things-to-do/ghost-tours.html` 65; accessibility 96 to 100, best-practices 100, SEO 100 on all four. Floors are 90. `speed` failed in 22 of the last 30 `site-check` runs.

## 2. What exists and works (VERIFIED unless noted)

- **Site:** 144 HTML pages including home, events, things-to-do, surf, where-to-stay, weather, FAQ, planner, guides (paid PDFs), tours booking, directory/map, advertise, legal, size guide, shipping and returns, gift guide.
- **Shop:** `shop.html` plus four town pages (`shop/wrightsville-beach`, `carolina-beach`, `kure-beach`, `wilmington`); 110 catalog items across collections (local-icons 75, shore-gear 26, beach-setup 6, coastal-christmas 2, landmarks 1) and shelves (wrightsville 35, kure 27, wilmington 24, carolina 22, beach-setup 2). All items have an image. JSON-LD on `/shop`: Organization, CollectionPage, ItemList, 6 Product/Offer, BreadcrumbList, FAQPage; canonical, OG tags and meta description present.
- **Bag and checkout handoff:** multi-line bag, quantity caps, price/availability recheck against Shopify at bag open, Shopify cart permalink built at tap time, honest multi-store notice, plain-link fallback when product lookup fails.
- **Merchandising:** lookbook-first lead images for verified-matching products; studio-first for the three Blue Crab items whose lookbook photos mismatch the real product.
- **Promo system:** BF/CM/launch banners, preview modes, hero line; welcome-offer signup (Formspree) reveals `SHOREWELCOME10` on success.
- **Guards:** slogan/content guard, banned-phrase and dash rules, JSON-LD rules, conflict-marker/syntax check, PR speed budget.
- **Social:** footer Instagram link on the home page (`@shorelist`). No TikTok/Facebook URL on the site (owner has not supplied them).
- **ShoreList Direct (Stripe, own checkout):** built and mock-tested end to end (catalog re-pricing, NC 7% tax line, shipping tiers, webhook, supplier adapters, hourly sync, daily drift check). **Zero live items** (`dropship-catalog.json` has 2 `draft-not-live` examples), so it is dormant.

## 3. Launch-blocking or launch-relevant issues

| ID | Issue | Evidence | Label |
|---|---|---|---|
| L1 | Live site lagged merged PRs; owner still saw the old shop headline after merge. Cause not established (host deploy delay, CDN or service-worker cache). | Firecrawl scrape of the live site showed old content minutes after merge | UNKNOWN cause; first step in T-01 |
| L2 | Homepage mobile performance 65 (TBT 4.2 s) and `speed` job red; this page is the main traffic entry on launch day. | CI log above | VERIFIED |
| L3 | Checkout leaves shorelist.net: Shopify primary domain is `shorelist.myshopify.com`. Trust and brand gap at the payment step. | Admin `primaryDomain.url` | VERIFIED fact; conversion impact HYPOTHESIS |
| L4 | No real end-to-end test purchase has been completed by anyone this session. A one-use 70% test code exists in Shopify for that purpose (owner performs it). | Admin discount list | VERIFIED no test done by us |
| L5 | Seven products lack a lifestyle photo (owner is generating them with ChatGPT/Higgsfield). They show studio images meanwhile. List: `claude/SHORELIST-LAUNCH-AUDIT-2026-11-25.md` (owner project doc). | earlier audit | VERIFIED at audit time; re-check against `shop-catalog.json` |
| L6 | Product SEO data in Shopify: 47 SEO titles and 39 image alt texts missing, 1 empty description (from the earlier audit; ChatGPT has authenticated Admin access). Authorized, reversible work. | earlier audit | ESTIMATE until re-queried |
| L7 | Shopify has 152 products; the site catalog lists 110 (109 Shopify). The 42 difference (drafts, unpublished, held, retired, or duplicates) is not reconciled. | `productsCount` vs `shop-catalog.json` | VERIFIED counts; cause UNKNOWN |
| L8 | Sitemap lists only 5 shop URLs with `lastmod` 2026-11-22; individual products live on the myshopify domain, so product pages are not in our sitemap. | `sitemap.xml` | VERIFIED |
| L9 | `check-shop-links` has not run against the live network in this session. | sandbox blocks hosts | UNKNOWN |
| L10 | Discount stacking: the four public codes plus two private ones do not combine (`combinesWith` false), so a shopper cannot stack welcome plus sale. Intentional; confirm messaging is clear. | Admin earlier check | VERIFIED earlier, not re-queried today |

## 4. Known bugs and technical debt

- `tools/test-operators.mjs` fails: the fixture `tools/fixtures/legacy-operators-snapshot.json` stores descriptions with HTML entities (`&#8212;`) while current `data/operators.json` has plain dashes. Test fixture drift, not a runtime bug (ESTIMATE, from the diff). P3.
- `tools/thin-content-gate.mjs` (warn-only) reports 201 duplicate titles, 222 duplicate descriptions, 6 thin pages, 118 similar pages. Not gating; SEO debt (VERIFIED counts; ranking impact HYPOTHESIS).
- Shop CLS 0.059 and events CLS 0.122 (under Lighthouse "good" 0.1 only for shop). Events 0.122 is above 0.1 (VERIFIED).
- `shop-cart.js` has `CLEAR_FIRST = false`: Shopify permalinks may add to a cart left over from an earlier visit; clearing was never tested on the live store. UNKNOWN impact.
- `shop-bot.js` and `concierge.js` system prompts and output validation were not audited. The itinerary planner (`plan-itinerary.js`) can state venue details; hardening (no invented venues, hours or prices; server-side validation) is open.
- `shop-analytics.js` header comment holds a placeholder GA ID (`G-XXXXXXXXXX`, comment only). The real GA4 ID `G-EN91RH3PZV` is in pages. Whether GA4 receives shop and purchase events correctly: UNKNOWN (never viewed in the GA4 dashboard).
- No unit tests exist for `shop-promo.js` (boundary test was ad hoc).
- Owner-side registry docs (Command Center in Drive) are not updated; not a repo matter.

## 5. Deployment architecture

Browser -> Netlify CDN (static root + `_headers` + `netlify.toml` redirects) -> Netlify Functions (Stripe, Resend, Anthropic, Printify, CJ, Shopify lookups) -> Netlify Blobs (rate limits, bookings). Shop checkout hands off to Shopify (`shorelist.myshopify.com`), Fourthwall (1 item) or Stripe (Direct, dormant). GitHub Actions: `check.yml` (PR and main), `refresh-events.yml` (events feed commits to `main` as "Refresh events feed"), `indexnow.yml` (pings search engines on main pushes). No staging environment is known: **UNKNOWN** whether Netlify deploy previews are enabled; confirm in the dashboard (owner). Rollback: `git revert <sha>` then merge, bump `sw.js`; Shopify changes are reversed from the before/after record in `CHANGELOG.md`.

## 6. Recently completed (PRs #289 to #317, summarized; detail in `CHANGELOG.md`)

Lookbooks added for lifeguard-stand dad hats; Kure Beach Sanderling tee; claims cleanup (22 categories, bookable status, operator wording); product color accuracy; shop launch fixes (five low-quality items held, four products limited to White); speed passes (#297 to #309); CSP fixes for Google measurement; promo banner and BF/CM codes; slogan guard and headline; Instagram link; welcome offer; Blue Crab accuracy reverts (#316, #317).

## 7. Owner-only items (do not attempt)

Ad spend, Meta/Facebook Page and ad account, TikTok/Facebook URLs, Higgsfield plan or credits (owner has not approved buying any), new product publication, custom checkout domain or any Shopify/Netlify/Printify/Stripe account change, the real test checkout, and deletion of anything (including the superseded owner-project doc `claude/MASTER-CHATGPT-LateToAI-TBM-ShoreList-2026-11-24.md`).
