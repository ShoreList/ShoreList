# AGENTS.md: ShoreList engineering instructions (Codex, Claude Code, any coding agent)

Read this first, then `CODEX_HANDOFF.md`, `CODEX_TASKS.md`, `INTEGRATIONS.md`, `RELEASE_GATES.md`. Do not ask the owner to re-explain the business; it is written here. Last verified against `main` on 2026-11-25 22:56 ET (head `c1f9bbe`). **Other agents and the owner's tools also merge to `main` (PRs #318 to #323 landed from elsewhere while this package was written).** Always `git fetch origin main` first and re-read `git log` before you start.

Evidence labels used in every doc: **VERIFIED** (observed or executed in this repo/store, with how), **ESTIMATE** (reasoned number or judgment), **HYPOTHESIS** (plausible, untested), **UNKNOWN** (not checked, or not checkable from the sandbox). Use them in your own reports. Never write "passed" for a command you did not run to a zero exit.

## 1. What ShoreList is

ShoreList LLC (Wilmington, NC; owner/approver: RJ Brideau) is a local guide and bookings site for Wilmington and the Cape Fear beaches (Wrightsville, Carolina, Kure) plus a merch shop at `shorelist.net/shop`. Goals: be the locals' go-to and the tourists' "need it like oxygen" city guide (events, things to do, places), and run the shop like an established brand (benchmarks the owner named: Ralph Lauren, Faherty, Kiel James Patrick). Public launch target: **Thursday 2026-11-26, 5 PM Eastern**. Black Friday and Cyber Monday sales are scheduled (see `INTEGRATIONS.md`).

**Brand wall (hard rule):** ShoreList is a separate business from Late to AI and TaskBot Market. Never add their names, products, links, copy, accounts, analytics IDs, code or data to this repo, the site or the Shopify store, and never reuse ShoreList assets there. If a task seems to need both, stop and report.

## 2. Hard operating rules

1. **No spending, deployment, deletion, new product publication or account changes without explicit owner approval.** Merging to `main` can deploy: treat a merge as a deployment unless the owner has said merges are pre-approved for that change (as of 2026-11-25 the owner delegated merges of audited, CI-green-on-`check` changes; re-confirm for anything outside launch fixes).
2. **Authorized without asking:** reversible Shopify product description, SEO title/meta, merchandising order and collection organization changes. Record each change (what, before, after) in `CHANGELOG.md` so it can be reversed.
3. Never expose, print, log or commit credentials. Environment variable *names* are listed in `INTEGRATIONS.md`; values live only in Netlify/Stripe/Shopify/Printify dashboards. Never enter passwords, accept terms or create accounts for the owner.
4. One agent per file at a time. Use an isolated branch or `git worktree` per task; check `CODEX_TASKS.md` "Owner/lock" before editing; claim a task by committing a one-line note to its entry on your branch. Never edit a file another open branch touches (`git diff --name-only origin/main...<branch>`).
5. Never overwrite unrelated work. `git fetch origin main` before branching; rebase before opening a PR. Never `git commit -a` blindly: a previous run swept a regenerated `city-pack/HARDCODED-REPORT.md` into a commit. Stage files by name. `.claude/` is untracked agent worktree data: never commit it.
6. Preserve working functionality, branding and supplier integrations. Do not redesign the homepage without approval.
7. Avoid generic AI-sounding copy, artificial product imagery and unsupported marketing claims. A product photo must show the product the customer receives (color, text, design). Colors we do not sell must not appear. AI-generated lifestyle imagery or video must be disclosed as such and must not misrepresent the product.
8. Do not invent test results, sales, reviews, traffic, inventory or history.
9. Copy rules enforced by `tools/check-site.mjs`: no em or en dashes in visible copy, no banned phrases (for example "Cape Fear coast"), no `Organization.sameAs` in JSON-LD until profiles are verified, and a content guard that fails the build on divisive slogans (see the guard regex in `tools/check-site.mjs`; do not weaken it). The shop headline is "Goods from Wilmington's coast." Keep copy plain, local and factual.
10. Late to AI / TaskBot Market work is out of scope here.

## 3. Architecture (VERIFIED from repo files)

- **Static site** at repo root (hand-written HTML/CSS/vanilla JS, no framework, no bundler). Published directory is the repo root, so anything not blocked in `netlify.toml` is public. Root-level `.md` files in this onboarding package are blocked there on purpose; keep that block if you add files.
- **Hosting:** Netlify (`netlify.toml`, `_headers`, Netlify Functions in `netlify/functions`, `@netlify/blobs`). Whether pushes to `main` auto-deploy and the Netlify build settings: **UNKNOWN** (dashboard not inspected). The live site was observed lagging merged PRs by minutes on 2026-11-25.
- **Shop (`shop.html`, `shop/<town>.html`, `shop-catalog.json`):** cards render from `shop-catalog.json` (109 items: 108 Shopify, 1 Fourthwall). `tools/build-shop-static.mjs` fills `<!--SHOP-STATIC:name-->` regions so the page is crawlable without JS. Lookbook-first image rule in `shop.html`: `first=(i.img&&!sameImg(i.img,i.studio||''))?i.img:(i.lookbook||i.studio||i.img)`. Catalog fields: `name, img, studio, lookbook, alt, color, facts, scenes, price`.
- **Cart and checkout (`shop-cart.js`):** localStorage bag with three line groups: Shopify lines (one Shopify cart permalink on `shorelist.myshopify.com`), Fourthwall link-outs, and ShoreList Direct goods (Stripe Checkout via `create-goods-checkout`; zero live items today). Server re-prices Direct lines from `dropship-catalog.json`.
- **Promos (`shop-promo.js`):** `SALES` array of UTC windows; banner plus hero line; preview with `?promo-preview=1|bf|cm`.
- **Service worker (`sw.js`):** `const VERSION = 'sl-vNNN-YYYY-MM-DD'` **must be bumped in every PR that changes cached files**. Current: `sl-v277-2026-11-25` (check `sw.js`; it moves every deploy).
- **Functions:** bookings and guides checkout (Stripe), availability, `stripe-webhook`, supplier sync (`sync-supplier-orders` hourly, `check-supplier-drift` daily), AI helpers (`shop-bot`, `concierge`, `plan-itinerary`), `shop-product` (live variant lookup from Shopify by handle). Supplier adapters in `netlify/functions/_suppliers/` (`printify`, `cj`, `manual`).
- **Generated files:** `search-index.json`, `llms*.txt`, `operators-public.json`, `events-data.json` (a GitHub Action refreshes events), sitemap lastmod. Regenerate with the matching `tools/*.mjs`; do not hand-edit generated output.

## 4. Commands (run from repo root; Node >= 22.12)

| Purpose | Command | Status 2026-11-25 (VERIFIED, run locally) |
|---|---|---|
| Structure, JSON-LD, copy and slogan guards | `node tools/check-site.mjs` | exit 0 ("144 pages, 109 products") |
| Keyword config | `node tools/check-keywords.mjs` | exit 0 |
| Thin content (warn only in CI) | `node tools/thin-content-gate.mjs --site . --entities tools/local-entities.json --warn-only` | exit 0 with warnings |
| Feeds unit tests | `node --test tools/feeds/feeds.test.mjs` | 14 pass |
| IndexNow tests | `node --test tools/indexnow-ping.test.mjs` | 7 pass |
| Attribution tests | `node tools/test-attrib.mjs` | 9/9 pass |
| Shop analytics test | `node tools/test-shop-analytics.mjs` | pass |
| Goods checkout tests (all network mocked) | `node tools/test-goods-checkout.cjs` | 25 pass |
| Operators fixture test | `node tools/test-operators.mjs` | **FAILS** (known, see tasks T-15) |
| Shop link check | `node tools/check-shop-links.mjs` | needs live network; all 110 errored in the sandbox, so the result is **UNKNOWN**. Run it from a networked machine. |
| Mobile Lighthouse budget | `node tools/lighthouse-budget.mjs` | CI job `speed` is green on the latest `main` runs (home 98, shop 92, events 96, ghost-tours 95 on 2026-11-26 02:59Z). Needs Chrome. |
| Live verifier (read only, needs network) | `node tools/verify-live.mjs` | Ran in GitHub Actions 2026-11-26 03:29Z: 23 Shore Picks images 404 (see T-20); all 109 shop prices match Shopify; 91 of 91 sitemap URLs load. Runs nightly (`.github/workflows/verify-live.yml`). |

CI (`.github/workflows/check.yml`): job `check` runs the first five rows and passes on `main`; job `speed` failed in 22 of the 30 `site-check` runs up to the afternoon of 2026-11-25 and passed on the runs after PRs #318 to #323 (VERIFIED via `gh run list`). Netlify also posts PR checks (redirect rules, header rules, pages changed), so deploy previews/checks exist. Merge decisions: `check` must be green; `speed` must not get *worse* than main for the pages you touched (compare numbers), and you must say so in the PR.

## 5. Change workflow

1. `git fetch origin main && git switch -c <type>/<short-name> origin/main` (or `git worktree add`).
2. Make the smallest change that meets the task's acceptance criteria. Preserve existing function and look.
3. Bump `sw.js` VERSION if you changed any cached asset or page. Regenerate generated files with their tool when you change their inputs (`build-shop-static`, `build-search-index`, `build-llms`, `update-sitemap-lastmod`).
4. Run the table above. Check `git status` shows only intended files.
5. Open a PR with: what changed, evidence labels, exact commands run and exit codes, screenshots for visual changes (desktop 1280 and mobile 390), rollback line. Merge only per rule 1. Merge via REST if GraphQL is blocked: `gh api -X PUT repos/ShoreList/ShoreList/pulls/N/merge -f merge_method=squash`.
6. After merge, verify the live page (hard refresh or private window, the service worker caches). Report what you verified live and what you could not.

Commit messages end with the attribution lines your tool requires. Default branch is `main`; repo `ShoreList/ShoreList`.

## 6. Security requirements

- Browser never decides price, shipping, tax or availability for ShoreList Direct; `_goods.js` re-prices from `dropship-catalog.json` (blocked from the public web in `netlify.toml`). Keep it blocked. Same for `/data/*`, `/netlify/*`, `/tools/*`, `/docs/*`, `/city-pack/*`.
- Keep `_headers` CSP strict; adding a third-party script/host requires a stated reason and owner approval if it collects data.
- Origin checks and rate limits (`_shared.js`) are used by the functions I inspected (`create-goods-checkout` confirmed; audit the rest, task T-13) and must stay. AI functions keep daily caps (`AI_DAILY_CAP`, `SHOP_BOT_DAILY_CAP`, `SHOP_BOT_OFF` kill switch).
- Stripe webhook signature verification stays mandatory. No secrets in code, tests (dummy values only), logs or PR text.
- Never put personal data in URLs. Signup form posts to Formspree; do not add trackers that read it.
- Do not claim PCI, security or legal compliance; payment card data never touches our code (Stripe-hosted and Shopify-hosted checkout).

## 7. Coding standards

Vanilla JS, ES5-friendly style is used in browser files (`var`, IIFEs); match the surrounding file. Build DOM with `createElement` for anything from data (no `innerHTML` with untrusted strings; use the local `esc`). Every `<img>` has real alt text and dimensions where known. No new dependencies without approval (the repo has one: `@netlify/blobs`). Prefer editing existing modules over adding parallel ones; search before creating (`grep -rn`). Tests: add or extend a script in `tools/` and wire it into `check.yml` when it should gate PRs.

## 8. Coastal luxury and product fidelity

The owner's [Coastal Brand Standard](docs/COASTAL-BRAND-STANDARD.md) is a hard release rule for all new and materially revised designs and brand work. Apply it to artwork, copy, pages, photography, ads, supplier materials and generated creative. Work from documented local references for Wrightsville Beach, the Cape Fear beaches, the Intracoastal, the Outer Banks and Charleston. A named independent reviewer must document a coastal luxury brand match of at least **90/100** for the exact version. Any factual, fidelity or brand hard failure holds the work at every score. Never assign a score without a review. In new merchandise, preserve all existing product and photo gates and require owner quality approval.

- What the card/PDP shows must match what Shopify sells: name, colors, sizes, price, text/artwork on the item. Verify by viewing the image, not the filename.
- Known corrected mismatches (do not regress): Blue Crab Embroidered Crewneck (Kure Beach) is **White only** (lookbook shows aqua); Blue Crab Corduroy Cap and Cuffed Beanie (Kure Beach) show the **navy** studio image (lookbook shows brown/olive). Those three use studio-first images (`lookbook: ""`).
- A product with no verified lifestyle image stays studio-first; it is not listed with an unrelated or AI-made photo.
- New product publication needs owner approval; the pipeline and quality gate are in the `shorelist-shop-product-pipeline` skill and in `tools/ingest-shopify-products.mjs` (it holds items without a lookbook).

## 9. Where context lives

Repo: this package, `docs/`, `tools/shopify-compact.md`, `tools/shopify-ingest-plan.json`, `README` files under `data/`. Owner-side project docs (Claude Project "TaskBot Market + LateToAI", ShoreList files such as `claude/SHORELIST-LAUNCH-AUDIT-2026-11-25.md`, `claude/shorelist-build-rules-MASTER.md`, `claude/shorelist-hard-rules-v2.md`) hold the longer audit and build rules; the owner can attach them. Treat that material as background, and re-verify before relying on any number.
