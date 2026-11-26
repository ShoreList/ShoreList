# CHANGELOG.md

Source: `git log origin/main` (308 non-automated commits as of 2026-11-25; the repo's first commit is dated 2026-11-20) and read-only Shopify Admin queries on 2026-11-25. Entries are grouped from commit subjects; nothing here is inferred beyond them. PR numbers are GitHub PRs on `ShoreList/ShoreList`. Items marked (Shopify) changed the Shopify store, not the repo. Automated "Refresh events feed" commits are omitted. For the full list use `git log --oneline`.

Format: newest first. Each future entry: date, PR or action, what changed, evidence (command/exit code), rollback.

## 2026-11-26

- #333, squash commit `9989b4485f6360ef7d7f75199835f8350fb21268`. Added the 90/100 coastal luxury release standard, documented 40 held supplier candidates and added Fourthwall draft and CJ sourcing tools. No offers were published. PR site, speed, supplier, Netlify header and redirect checks passed.
- After merge, direct HTTP checks returned 200 for the live shop, catalog and service worker. The catalog matched blob `5cfed05c67f4d0ef8c2017abd4544807d7bb8e12`. Sampled internal paths returned 404. The exact production Netlify deploy revision remained unverified. Rollback is a revert of the squash commit.

## Unreleased (branch `codex-onboarding`, not merged, not deployed)
- Added `AGENTS.md`, `CODEX_HANDOFF.md`, `CODEX_TASKS.md`, `INTEGRATIONS.md`, `RELEASE_GATES.md`, `CODEX_START_PROMPT.md`, this `CHANGELOG.md`.
- `netlify.toml`: 404 redirects for those root `.md` files so the repo-root publish does not expose them. Not deployed.
- Evidence: `node tools/check-site.mjs` re-run after the change (result recorded in the PR). Rollback: delete the files and the redirect block.

## 2026-11-25 late evening
- #326 Shore Picks: featured spotlight drops a photo that fails to load (Caprice hero 404). #324 Shore Picks cards drop the empty image box when a photo fails (20 of 61 404). Verified live with a fresh fetch at 22:56 ET.
- #325 Nightly read-only live verifier and Action (images, Shopify price and stock parity, sitemap). First run: 23 image failures, no price or page problems.
- #323 sale banners restricted to verified Shopify windows and eligibility; #322 welcome copy: 10% off one eligible order; #320 shop FAQ: unofficial, not affiliated with Airlie Gardens or places shown; #318 storefront, mobile signup and social links repaired (TikTok link added). These four were merged by another agent or tool; summarized from commit subjects only.
- Speed: after #318 to #323 the CI `speed` job went green (home 98, shop 92).
- Buyer walk-through of the live shop (no order placed): bag, checkout handoff and `SHORE15` verified.

## 2026-11-25 (launch eve fixes)
- #317 Blue Crab Corduroy Cap and Cuffed Beanie (Kure Beach) lead with the real navy studio image; lookbook photos showed brown/olive.
- #316 Blue Crab Embroidered Crewneck (Kure Beach) leads with the real white product; lookbook showed aqua; product is White only.
- #315 Shop signup: 10% off first order (`SHOREWELCOME10`) shown after joining. (Shopify) code limited to once per customer.
- #313 Black Friday and Cyber Monday banners in `shop-promo.js`; content guard in `tools/check-site.mjs` that fails the build on divisive slogans.
- #312 Shop headline changed to "Goods from Wilmington's coast."
- #311 Five hero products lead with lookbook photos (Live Oak cap/beanie kept; the three Blue Crab items later reverted in #316 and #317).
- #310 ShoreList Instagram link in the home footer (JSON-LD `sameAs` intentionally not added; guarded by `check-site`).
- #296 Launch sale banner (`SHORE15`, through Thu 2026-11-26). (Shopify) discounts created and verified in Admin: launch `SHORE15`, Black Friday `SHOREFRIDAY15`, Cyber Monday `SHORECYBER15`, welcome `SHOREWELCOME10`, plus a one-use checkout test code and a private friends-and-family code (names not recorded here). Codes do not combine.
- #309, #308 Shop images use Shopify `_NNNx` size suffixes (earlier `?width` was ignored, so cards loaded full-size photos).
- #307, #303 CSP adjusted for Google measurement and the 1p-conversion fetch; unneeded entries removed.
- #306 Quick view shows the whole product photo.
- #305 Fixed merge-conflict markers in `sw.js`; `check-site` now fails on conflict markers or JS syntax errors.
- #304, #302, #301, #300, #299, #298, #297 Speed work: IntersectionObserver reveals, lighter shop images, inline critical CSS on shop and home, non-blocking fonts, hero preload tuned, LCP fixes, PR speed budget (`tools/lighthouse-budget.mjs`). Measured result on 2026-11-25 CI: shop 94, home 65 (still below the 90 floor).
- Outcome of the day: audit and handoff document (`SHORELIST-LAUNCH-AUDIT-2026-11-25`, owner project doc) rated launch CONDITIONAL GO.

## 2026-11-24
- #295 Shop launch fixes: lifestyle photo first on cards; four products limited to White; five low-quality items held.
- #294 Stop showing colors not sold (Blue Crab crewneck white only; Kure Beach cap and beanie show navy studio photo).
- #293, #292 Site claims corrected (22 categories, what is bookable today, removed unsupported operator wording, insurance requirement).
- #291 Kure Beach Sanderling tee added. #290, #289 lookbooks for Kure and Carolina lifeguard dad hats.

## 2026-11-23 (shop build-out, brand and compliance)
- #288 Shipping and returns page rebuilt to match the one-shop policy; #270 returns copy (replacement or refund, lost package).
- #287 Things-to-do pages gain named local places; thin-content gate added to CI (warn-only); #285 event titles and dedupes.
- #286, #276, #280, #283 Home hero: licensed photos by time of day with credits, sharper sizing, idle-start scene, Data Saver.
- #282 Shop compliance: one-shop policy copy, working crab studio images, sticker price, shorter alts. #281 FAQPage markup matches visible text. #279 cookie disclosure and CSP cleanup. #277 internal tooling paths blocked publicly. #278 GA4 wired into the shop with purchase events on success pages.
- #269, #262 design tokens site-wide and luxe pass; the commit after #283 restores semantic looks lost in that pass.
- #266 Shop page: editorial redesign with static Product and FAQ JSON-LD; #245 Wilmington description and town-page Product/Offer schema; #244 sharper hero.
- #263 to #265 Eight pulled items restored per owner decision (crewnecks, caps, beanies, rope caps, polos, canvas tote, zip pouch).
- #222 and others: product-level retire/hold decisions (Airlie live oak tote and mug retired, reversible; `docs/retired-items.json`).
- #223 to #261: many individual "Add ... to the shop" and lookbook commits (printed tees, totes, mugs, framed prints, pillows, ornaments, towels, tumbler, bottle, stickers, crewnecks including Banks Channel Sunset Sail) across the Wrightsville, Carolina, Kure and Wilmington shelves. Exact count not tallied.

## 2026-11-22
- #193 to #221 Shop ingestion via `tools/ingest-shopify-products.mjs`: lifeguard, scallop shell, sloop, Airlie Oak, blue crab and pelican lines; #202 brand audit (paused 8 items, six items per town capsule order); #206 held budget rope caps and polos that failed the premium standard; #200 held three pelican pieces under the design-gate bar (later restored per owner).

## 2026-11-20 to 2026-11-21
- 2026-11-20 (50 commits): shop launched in the log with the Fourthwall store, nav links and first tees/totes (#5), then Shopify products, search/sort/quick view (#27), removal of the banned "Cape Fear coast" wording (#23). A "Hide Shopify store chip until shorelist.shop is live" change (#11) shows the Shopify store was added around then. The visible history starts on this date.
- 2026-11-21 (110 commits): not itemized here; see `git log --since=2026-11-21 --until=2026-11-22`. The ShoreList Direct (Stripe goods) code, supplier adapters and test suite exist on `main` today; the commit that introduced them was not located in this pass (UNKNOWN which PR).

## Not done (so no changelog entry exists)
- No real Shopify test order completed. Higgsfield video not generated. Seven lifestyle photos outstanding. 23 Shore Picks photos outstanding. Shopify SEO titles/alt texts not yet filled. See `CODEX_TASKS.md`.
