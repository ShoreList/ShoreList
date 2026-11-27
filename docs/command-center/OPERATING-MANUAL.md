# ShoreList operating manual

Labels: VERIFIED (checked tonight), ESTIMATE, HYPOTHESIS, UNKNOWN.

## 1. Who does what
| Who | Owns |
| --- | --- |
| ShoreList Chief | Plans, assigns work, keeps STATUS, this manual and the RJ list current. |
| ShoreList Shop & Merch | Products, the /shop storefront, shop bug fixes, banners, product publishing and the ship log (`/workspace/shorelist/ship-log.md`). |
| ShoreList Social & Local | Posts on ShoreList's own accounts, local SEO, Google Business Profile, Shore Picks, the operator pipeline (research and drafts only). |
| Codex (Cursor cloud agent) | Code implementation and release tests in the repo. Also the only way bots commit files: the inline GitHub tools can't commit. |
| Claude | Independent review and gate scoring. An author never scores its own work. |
| RJ Brideau | Owner. Approves the reserved actions in section 7. |

One owner per task, one writer per file. Claim files in `CODEX_TASKS.md` (on a branch) before editing them.

## 2. Where things live
- Repo: `ShoreList/ShoreList` on GitHub. Rules: `AGENTS.md`, `RELEASE_GATES.md`, `CODEX_TASKS.md`, `INTEGRATIONS.md`. Command center: `docs/command-center/` (currently on branch `docs/shorelist-agent-command-center`, draft PR #351, not yet on main).
- Local working files: `/workspace/shorelist/` (this manual, `CONNECTORS.md`, `connect-queue.md`, `rj-morning.md`, `ship-log.md`, `bfcm-plan.md`).
- Briefs: `/workspace/state/shorelist/` (`AMENDMENT-1.md`, `bf-brief-1126.md`, `CLAUDE-SHORELIST-MERCH-PROMPT.md`), `/workspace/state/shorelist-GROK-HANDOFF.md`.
- RJ's list is `/workspace/shorelist/rj-morning.md`. Not `edward-morning.md`. Append to it; never overwrite it.

## 3. Connectors (short version; full table in CONNECTORS.md)
| Service | Use it? | How |
| --- | --- | --- |
| GitHub ShoreList/ShoreList | Yes (VERIFIED admin+push) | `cursor-github` for reads, branches, PRs, merges. Commits go through a cloud agent. gh CLI is not logged in. |
| Gmail shorelistwilmington@gmail.com | Yes, read. Sending needs RJ's yes | `user-Gmail` |
| Calendar shorelistwilmington@gmail.com | Yes | `user-Google-calendar` |
| Google Drive / Sheets / Notion / Canva | Yes, ShoreList-named items only | `user-Google-drive`, `user-Google-sheets`, `user-Notion` (RJ's space), `user-Canva` (account UNKNOWN) |
| vidIQ | Ready once @shorelist IG/TikTok are linked | `user-Vidiq` |
| Firecrawl, TubeAlfred | Public research | connectors |
| Stripe | After RJ signs in | plugin 408 |
| Netlify, Shopify, Printify, Higgsfield, Meta, TikTok, Google Business Profile, Fourthwall, CJ | Not connected yet | See `connect-queue.md` |
| Cloudflare, Buffer, `user-X`, Runway, Fal, Search Console, GA4, non-ShoreList Gmail, `user-Google-calendar--rj` | NO, not ShoreList accounts | Never use for ShoreList. |

## 4. Editing the site
1. Read `AGENTS.md`, `RELEASE_GATES.md` and `CODEX_TASKS.md` on the latest `main`.
2. Check open PRs and branches for overlap, then claim your files in `CODEX_TASKS.md` so there is one writer per file.
3. Make a fresh branch off `main`: `<type>/<short-name>` (for example `fix/shop-fallback`).
4. Make the smallest change that does the job. Static HTML/CSS/vanilla JS at the repo root; Netlify Functions in `netlify/functions/`.
5. If you changed any cached page or asset, bump `VERSION` in `sw.js` (format `sl-vNNN-YYYY-MM-DD`; live and main are both `sl-v287-2026-11-26`, VERIFIED).
6. Regenerate generated files when you change their inputs (`build-shop-static`, `build-search-index`, `build-llms`, `update-sitemap-lastmod`).
7. Run, from the repo root (Node 22.12+):
   - `node tools/check-site.mjs`
   - `node tools/check-keywords.mjs`
   - `node tools/thin-content-gate.mjs --site . --entities tools/local-entities.json --warn-only`
8. Docs-only changes (`docs/**`, root `.md`) skip the sw.js bump and the gates; they are blocked from the public web by `netlify.toml`.

## 5. Publishing
- Products: an independent reviewer scores the item. It publishes only with a mean of 8.0 or higher and no line under 7. Then publish on Printify, ingest to Shopify, deploy to /shop and log the product ID and live URL in `/workspace/shorelist/ship-log.md`.
- Site changes: open a PR with what changed, commands run and exit codes, screenshots (1280 and 390 wide) for visual changes, and a rollback line.
- Merge rule: CI job `check` must be green; `speed` must not get worse than `main` for the pages you touched. Then squash merge.
- Social: post only finished content that passed independent scoring, only on ShoreList's own accounts. Copy is honest: real dates, real prices, no fake claims, no em dashes.

## 6. Deploying and verifying live
- Host: Netlify (VERIFIED). `shorelist.net` resolves to 75.2.60.5 (Netlify's load balancer), `www.shorelist.net` is a CNAME to `stellular-yeot-4f4d8a.netlify.app`, responses carry `server: Netlify` and `x-nf-request-id`. DNS is at Namecheap (`dns1/dns2.registrar-servers.com`). Not Vercel, not Cloudflare.
- /shop: the same Netlify site serves `/shop` (rewrite to `shop.html`) and `/shop/:slug`. Checkout hands off to Shopify `shorelist.myshopify.com` (cart permalink); one item links to Fourthwall.
- How a merge goes live: merging to `main` triggers a Netlify production build (ESTIMATE, strongly supported: live `sw.js` VERSION, `index.html` size 176,643 bytes and `shop.html` size 119,925 bytes match `main` at `adae375` tonight; Netlify dashboard build settings not inspected, UNKNOWN). PRs get Netlify checks (Redirect rules, Header rules, Pages changed) on site `stellular-yeot-4f4d8a`. Live has been seen lagging a merge by a few minutes.
- Verify live after every merge:
  1. `curl -s https://shorelist.net/sw.js | grep "VERSION ="` matches `main`.
  2. Open the changed page in a private window (the service worker caches) at 1280 and 390 wide; check the headline, banner and changed cards.
  3. For /shop: the catalog loads (no "We could not load the shop" fallback), prices match Shopify, the bag hands off to Shopify checkout. Stop before payment.
  4. Nightly `verify-live` workflow (09:17 UTC = 4:17 AM ET) checks images, Shopify price parity and sitemap URLs. Read its summary.
  5. Report what you saw live, with times in ET. If it doesn't match, say so; don't claim it's live.
- Rollback: revert the squash commit on `main` through a PR; Netlify redeploys.

## 7. Approval rules
- RJ's rule from Nov 26, 2026 (card in Prompt Bot's chat, 10:53 PM ET): bots publish gate-passed products, deploy shorelist.net and /shop through the normal pipeline, and post scored content without asking RJ each time. This overrides the approval lines in `AGENTS.md` and `RELEASE_GATES.md`.
- Still needs RJ's own yes, batched in `/workspace/shorelist/rj-morning.md`: spending (including ad boosts, credit top-ups, samples), new subscriptions, DMs or emails to people or businesses, and account or permission changes (connecting a new account counts).
- The live Instagram and TikTok ad campaigns stay untouched: read-only reporting at most.
- Promo: SHOREFRIDAY15 Fri Nov 27 only, SHORECYBER15 Mon Nov 30 only, 15% off eligible Shopify orders, 12:00 AM to 11:59 PM ET. No Sat/Sun code. Don't claim the codes work until a checkout check confirms it.

## 8. Higgsfield sprint (through Sun Nov 29 night)
RJ says the Higgsfield plan is paid through Sunday night (USER-STATED). Use the paid credits only; no top-up without RJ's yes. Not connected yet: it's #1 on the connect queue.
Batch, in this order, using real live products and the brand palette (Harbor Navy, Sailcloth White, Dune Sand, Sea Glass, Signal Red, Weathered Teak):
1. Sale Reels footage for the 9 BFCM Reels: Sloop crewneck, cap, beanie, tote (Shopify one, not the Fourthwall tote) and the Airlie Oak print, styled at Wrightsville Beach, the Riverwalk and Carolina Beach. Vertical 9:16, 5 to 10 second clips, no text baked in, so prices and codes are added after the checkout check.
2. Exact-product lookbook stills for each sellable variant (lookbook first, real studio photo second, disclosed as AI). Record the generation ID, files and digests for provenance.
3. Holiday gift set: "gifts from the coast" flat-lays and wrapped-gift scenes for December posts and the gift guide.
4. Evergreen local scenes for Shore Picks and the guide (beach, harbor, boardwalk), clearly labeled as illustrative.
Every asset goes through independent scoring (mean 8.0+, nothing under 7) before it's used. Save outputs to the ShoreList Creative Library in Drive and list them in `/workspace/shorelist/ship-log.md`.

## 9. Standing routines
- Morning (Chief): read `rj-morning.md`, the nightly `verify-live` summary and open PRs; update STATUS.
- After every merge: run the section 6 live check and log it.
- Daily during BFCM (Shop & Merch): confirm the day's code is active and banners match the date.
- Weekly (Social & Local): real analytics report once Search Console, GA4 and the social accounts are connected as ShoreList.
