# ShoreList connector runbook and inventory

Checked Thu Nov 26, 2026, about 11:00 PM ET by ShoreList Chief (executor). ShoreList only. No secrets recorded here; env var names only.
Status key: CONNECTED (read-only identity call succeeded), CONNECTED-WRONG-ACCOUNT (works, but the account is not ShoreList: do not use), NEEDS-AUTH (installed, not signed in), NO-CONNECTOR (nothing installed in this session), USER-STATED (RJ says the paid account is active, not verified by a bot).
Access route order for anything not connected: (1) connector/plugin, (2) official API with a token kept in the platform's secure settings, (3) the signed-in browser on the box.
Plugin IDs: only Stripe (408) is known. The plugin search tool (SearchPlugins / GetMcpServerStatus) was not available in the executor's session, so every "plugin: look up" line still needs a SearchPlugins call from ShoreList Chief's own session.

## Usable for ShoreList today
| Service | Status | How bots access it | Safe config notes |
| --- | --- | --- | --- |
| GitHub `ShoreList/ShoreList` | CONNECTED, VERIFIED | `cursor-github` connector, account `ShoreList` (admin+push). gh CLI on the box is NOT logged in. | Inline tools can read, branch, open/merge PRs, but cannot commit files. File changes go through a Cursor cloud agent (Codex) on a branch. `main` has no branch protection (VERIFIED Nov 26). |
| Netlify hosting | Live, NO-CONNECTOR | Indirect: merge to `main` deploys (see manual). Netlify posts PR checks (Redirect rules, Header rules, Pages changed) on site `stellular-yeot-4f4d8a`. | Route: plugin look up, then Netlify personal access token + `netlify` CLI, then browser app.netlify.com. Env var names in repo INTEGRATIONS.md. |
| Gmail `shorelistwilmington@gmail.com` | CONNECTED, VERIFIED | `user-Gmail` (get_me returned this address) | ShoreList's main mailbox. Read OK. Sending any email needs RJ's yes. |
| Google Calendar `shorelistwilmington@gmail.com` | CONNECTED, VERIFIED | `user-Google-calendar` | Primary calendar is ShoreList's. |
| Google Drive | CONNECTED | `user-Google-drive` | Found "ShoreList Creative Library" folder, ShoreList-Lookbook.zip, merch spec/audit docs. Which Google account owns the connection: UNKNOWN (no whoami tool). |
| Google Sheets | CONNECTED | `user-Google-sheets` | Account identity UNKNOWN. Use only ShoreList-named sheets. |
| Notion | CONNECTED | `user-Notion`, workspace "RJ Brideau's Space" (RJ's personal account) | OK for ShoreList pages if kept under a ShoreList-only parent page. |
| Canva | CONNECTED | `user-Canva` | Search for "ShoreList" returned 0 designs. Account identity UNKNOWN; confirm it is not the non-ShoreList Canva before making ShoreList designs. |
| vidIQ | CONNECTED, no social accounts linked | `user-Vidiq` (has Instagram Reel / TikTok publish tools) | Possible posting route for @shorelist IG/TikTok once RJ links them (account change). |
| Firecrawl, TubeAlfred | CONNECTED | `user-Firecrawl`, `user-Tubealfred-youtube` | Brand-neutral public research only. |
| Stripe | NEEDS-AUTH | Plugin 408 installed, needs sign-in | Repo uses `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (values in Netlify only). Live/test mode UNKNOWN. |

## Connected but NOT ShoreList: do not use
| Namespace | Actual account | Note |
| --- | --- | --- |
| `user-Google-calendar--rj` | a non-ShoreList account | Mislabeled "--rj"; it is non-ShoreList's calendar. |
| `user-Gmail--rj` | itsrjbrideau@gmail.com | RJ's personal Gmail, not rj@shorelist.net. Read only if RJ asks; never send from it. rj@shorelist.net is not connected. |
| `user-Cloudflare` | a non-ShoreList account | Not ShoreList, do not use. shorelist.net DNS is at Namecheap (registrar-servers.com), not Cloudflare. |
| `user-Buffer` | a non-ShoreList account and channels | Not ShoreList, do not use. Do not add ShoreList channels to this org. |
| `user-Google-search-console` | only a non-ShoreList property | No shorelist.net property visible. |
| `user-Google-analytics` | a non-ShoreList account | No ShoreList property visible. ShoreList pages use GA4 ID G-EN91RH3PZV (public ID). |
| `user-X` | a non-ShoreList X account | Not ShoreList. |
| `user-Runway` | a non-ShoreList team | Not ShoreList. |
| `user-Fal` | a non-ShoreList account | Not ShoreList. |

## Not connected (with access route)
| Service | Status | Route 1 connector/plugin | Route 2 official API + token | Route 3 browser on the box | Notes |
| --- | --- | --- | --- | --- | --- |
| Higgsfield | NO-CONNECTOR, USER-STATED paid through Sun Nov 29 night | plugin: look up | Higgsfield cloud API key (platform.higgsfield.ai) | higgsfield.ai signed in as ShoreList | Top of queue: use before it lapses. |
| Meta (Facebook + Instagram @shorelist) | NO-CONNECTOR, USER-STATED top-tier plan; live IG ads | plugin: look up (or vidIQ link) | Graph API system-user token from Meta Business Suite | business.facebook.com signed in | Live IG ads: read-only reporting at most. |
| TikTok @shorelist | NO-CONNECTOR; live TikTok ads | plugin: look up (or vidIQ link) | TikTok Content Posting API (app approval) | tiktok.com / TikTok Studio signed in | TikTok ads: untouched, read-only reporting at most. |
| Shopify `shorelist.myshopify.com` | NO-CONNECTOR this session (was read via RJ's Shopify tool Nov 25) | plugin: look up | Admin API custom-app token | admin.shopify.com signed in | Needed to verify SHOREFRIDAY15 / SHORECYBER15 and ingest products. |
| Printify | NO-CONNECTOR | plugin: look up | Printify personal access token (`PRINTIFY_API_TOKEN`, `PRINTIFY_SHOP_ID` names) | printify.com signed in | Publish gate-passed products; real order-by dates. |
| Google Search Console (shorelist.net) | Connector is on the wrong account | reconnect `user-Google-search-console` as the ShoreList Google account | Search Console API (same OAuth) | search.google.com signed in | Whether a shorelist.net property exists anywhere: UNKNOWN. |
| Google Analytics 4 (G-EN91RH3PZV) | Connector is on the wrong account | reconnect `user-Google-analytics` as the ShoreList Google account | GA Data API | analytics.google.com | |
| Google Business Profile | NO-CONNECTOR | plugin: look up | Business Profile API (needs Google access approval) | business.google.com signed in | Local SEO. |
| Fourthwall `shorelist-shop.fourthwall.com` | NO-CONNECTOR | plugin: look up | Fourthwall Open API credentials | fourthwall.com signed in | 1 catalog item links out; not in BF sale. |
| CJdropshipping | NO-CONNECTOR | plugin: look up | CJ API key (`CJ_API_KEY` name) | cjdropshipping.com signed in | Code-only adapter; Dot owns CJ research. |
| TikTok Shop | NO-CONNECTOR | plugin: look up | TikTok Shop Partner API (app approval) | seller-us.tiktok.com | Not in use (UNKNOWN whether a shop exists). |
| LinkedIn | NO-CONNECTOR, USER-STATED top-tier subscription | plugin: look up | Marketing API (partner approval) | linkedin.com signed in | Low priority for a local tours shop. |
| Metricool / Supermetrics / Windsor.ai | NO-CONNECTOR; no evidence ShoreList has accounts | plugin: look up | each vendor API key | vendor site | Optional reporting. Adding one is a new subscription: RJ's yes. |
| Vercel | Not used | n/a | n/a | n/a | No vercel.json; site is on Netlify. Do not set up. |
| Namecheap (DNS for shorelist.net) | NO-CONNECTOR | none | Namecheap API (IP allow-list) | namecheap.com | DNS changes are account changes: RJ's yes. |

## First session checklist

1. Read the command center and select one task.
2. Inventory actual tools in that session. Mark a capability VERIFIED only after the read or permitted test succeeds. Label availability elsewhere as reported, and missing access as UNKNOWN.
3. Use the narrowest read-only check for the provider and object. Preserve existing platform-provided credentials and documented secret bindings. Record outcomes and sanitized references, including an authoritative vendor documentation link when useful.
4. Discover all relevant Higgsfield capabilities, then use the approved tools required by the brief. Separate images, image edits, product-reference tools, video, job polling, and exports so their permission and credit effects are clear.
5. If an operation cannot run, use the original written prompts, validated public storefront data, existing agent evidence, or fixture tests to advance the rest of the work. Record exactly what remains open.

Historical provider facts are in [INTEGRATIONS.md](../../INTEGRATIONS.md), [supplier expansion](../SUPPLIER-EXPANSION.md), [CJ variant review](../CJ-VARIANT-REVIEW.md), and the current [status](STATUS.md). A connection in one agent's session does not establish access in another.
