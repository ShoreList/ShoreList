# INTEGRATIONS.md

No secrets belong here. Env var **names** only; values live in each vendor dashboard. Status key: **CONNECTED** (verified working evidence), **CODE-ONLY** (integration code exists and is mock-tested, live connection unverified), **PLANNED**, **UNVERIFIED** (referenced, not checked). Checked 2026-11-25.

| Integration | Role | Status | Evidence / gap |
|---|---|---|---|
| Shopify store `shorelist` (`shorelist.myshopify.com`, USD) | Sells merch; cart permalink checkout | **CONNECTED** | Admin API read (shop info, 152 products, discounts) succeeded via the owner's connected Shopify tool on 2026-11-25. Primary domain is the myshopify domain (VERIFIED). |
| Shopify discounts | Launch/BF/CM/welcome codes | **CONNECTED** | `SHORE15` active to 11-27 04:59Z; `SHOREFRIDAY15` scheduled 11-27 05:00Z to 11-28 04:59Z; `SHORECYBER15` scheduled 11-30 05:00Z to 12-01 04:59Z; `SHOREWELCOME10` active, once per customer. Two more private/test codes exist in Admin (names intentionally not recorded here). Codes do not combine. |
| Printify -> Shopify | Print-on-demand fulfillment for Shopify products | **UNVERIFIED this session** | Pipeline documented in project docs and the `shorelist-shop-product-pipeline` skill; the Printify app link/sync health was not re-queried. Fulfillment of live orders: UNKNOWN. |
| Printify adapter (ShoreList Direct) | Auto-order for Direct goods | **CODE-ONLY** | `netlify/functions/_suppliers/printify.js`; needs `PRINTIFY_API_TOKEN`, `PRINTIFY_SHOP_ID`; falls back to a manual email when unset. No live Direct items. |
| CJ Dropshipping adapter | Optional supplier for Direct goods | **CODE-ONLY** | `_suppliers/cj.js`; env `CJ_API_KEY`, `CJ_PAY_MODE`. No live items; account/credentials status UNKNOWN. Not used by the Shopify catalog. |
| Fourthwall (`shorelist-shop.fourthwall.com`) | "ShoreList Gear": 1 catalog item links out; allowed host in catalog | **UNVERIFIED** | Link-out only; one item in `shop-catalog.json`; store health, payout, and whether it should stay: owner decision. Separate checkout from Shopify (the bag says so). |
| Stripe | Tours/guides checkout, ShoreList Direct checkout, webhook | **CODE-ONLY for Direct; guides/bookings UNVERIFIED live** | Functions use `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Mock tests pass (25). Live keys, mode (test/live), webhook endpoint registration: UNKNOWN. A Stripe MCP exists in the owner's tooling but was not used. Merch sold via Shopify uses Shopify's own payments (processor settings UNKNOWN). |
| Google Analytics 4 | Traffic and shop events | **PARTIAL** | Measurement ID `G-EN91RH3PZV` in pages (public ID). gtag events coded in `shop-cart.js`, `shop-analytics.js`, `purchase-analytics.js`. Data actually arriving in GA4: UNKNOWN. Google conversion beacon is allowed in CSP; whether an Ads account is linked: UNKNOWN. |
| Formspree (`xeevzzqd`) | Email signup form | **UNVERIFIED** | Form endpoint in `shop.html` and others (public id). Delivery to the owner and welcome follow-up: UNKNOWN. No ESP (Klaviyo/Mailchimp) in code. |
| Resend | Transactional email (orders, alerts) | **CODE-ONLY** | `RESEND_API_KEY`, `MAIL_FROM`, `OWNER_ALERT_EMAIL`; sender-domain verification UNKNOWN. |
| Anthropic API | Shop bot, concierge, itinerary planner | **CODE-ONLY** | `ANTHROPIC_API_KEY`, `SHOP_BOT_MODEL`, `PLANNER_MODEL`; caps `AI_DAILY_CAP`, `SHOP_BOT_DAILY_CAP`; kill switch `SHOP_BOT_OFF`. Spending cap/billing: owner. |
| Netlify (hosting, Functions, Blobs, scheduled functions) | Hosting | **CONNECTED (by repo config)** | `netlify.toml` schedules (`@hourly`, `@daily`) and bundles; dashboard, env var values and deploy settings UNKNOWN. |
| GitHub Actions | CI, events refresh, IndexNow | **CONNECTED** | `site-check` runs on PRs and `main` (VERIFIED via `gh run list`); `indexnow` succeeded on recent merges. |
| IndexNow | Search engine ping | **CONNECTED (workflow success)** | `.github/workflows/indexnow.yml`; engine acceptance UNKNOWN. |
| NOAA Tides, Open-Meteo | Weather/tide widgets (client fetch) | **CONNECTED by CSP allow-list** | Live response not tested today. |
| Instagram `@shorelist` | Social | **LINKED** | Footer link only; no API. Facebook/TikTok: not provided, none linked. Meta Page/Ads: **PLANNED, owner-only**. |
| Higgsfield (AI video) | Lookbook video for ads | **PLANNED** | Web UI set up; nothing generated; no credits bought; owner approval required; AI-generated content must be disclosed. |
| ChatGPT (collaborator) | Authenticated Shopify admin work, owner Drive registry | external | Not part of the repo. |
| Windsor.ai, AfterShip/TikTok Shop, Canva | Available in owner tooling | **PLANNED/UNUSED** | Not wired into the site. |

## Env var names the code reads (VERIFIED by grep; values never recorded)

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `OWNER_ALERT_EMAIL`, `PRINTIFY_API_TOKEN`, `PRINTIFY_SHOP_ID`, `CJ_API_KEY`, `CJ_PAY_MODE`, `ANTHROPIC_API_KEY`, `PLANNER_MODEL`, `SHOP_BOT_MODEL`, `SHOP_BOT_DAILY_CAP`, `SHOP_BOT_OFF`, `AI_DAILY_CAP`, `DASHBOARD_PASSWORD`, `URL` (set by Netlify), `LIGHTHOUSE_BIN` (local tooling).

Secret scan of tracked files (2026-11-25, `git grep` for Stripe live/test keys, webhook secrets, Resend keys, Shopify tokens, AWS/GitHub tokens, private keys outside the mocked test file): no matches (VERIFIED). The test file uses obvious dummy values.

## Data flow notes

- Catalog source of truth for what the page shows: `shop-catalog.json` (hand-curated, partially ingested with `tools/ingest-shopify-products.mjs`); price/variant/availability truth for checkout: Shopify, looked up live by `shop-product` and re-checked when the bag opens.
- Direct goods truth: `dropship-catalog.json` (server only, blocked publicly); supplier cost drift checked daily.
- Rules for changing integrations: AGENTS rules 1 and 3. Anything that creates an account, changes a plan, rotates a key, or spends needs the owner.
