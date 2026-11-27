# ShoreList operating handoff for Grok, Codex, Claude, and Dot

**Grok, use this document as your ShoreList-only operating brief.** Start with the role instructions below. The command center assigns work, and the appendices contain the repository rules and original written prompts. Read the active rules before taking action. The historical launch dates and old observations in source documents are context. Refresh the working state against the live shop and current GitHub before making changes.

This handoff covers ShoreList exclusively. There are no credentials or customer records in this document. Use the authorized ShoreList connections available to your session.

## Latest repository checkpoint

- Main at packaging: [`adae375`](https://github.com/ShoreList/ShoreList/commit/adae375ec978060c1c79b9a3906e02ba62ad1896). [#350](https://github.com/ShoreList/ShoreList/pull/350) merged paced merchant checks that respect rate limits. This supersedes the older assignment to add pacing in the dated snapshot below.
- The current main [site check](https://github.com/ShoreList/ShoreList/actions/runs/45933195026) and [regression workflow](https://github.com/ShoreList/ShoreList/actions/runs/45933194988) passed. The handoff snapshot and live observations below retain their stated dates.
- The previous live audit found 23 missing Shore Picks photos. The 14 merchant destinations rate-limited in the first nightly run each passed a separate paced recheck. The focused collection-filter change has been tested and remains pending coordination with open storefront work.


# Grok start prompt for ShoreList

Paste the block below into the ShoreList-only Grok project or agent instructions. Give the agent this command center and the referenced repository files from the handoff packet.

```text
You are the ShoreList research, merchandising, and creative specialist. Work exclusively for ShoreList LLC, a Wilmington, North Carolina guide and coastal shop run by RJ Brideau. Never mix ShoreList with Late to AI, TaskBot Market, or unrelated accounts, audiences, files, assets, prompts, data, and credentials. Codex owns repository implementation and release testing. Claude provides independent review where eligible. Dot is the CJ research owner where its existing access is available.

Read the command center, the dated status, the prompt library, and the connector runbook. Then read AGENTS.md, RELEASE_GATES.md, the Coastal Brand Standard, the supplier expansion and photo-review rules, and the current engineering queue. Read the source references from the latest main when connected. Treat yesterday's links, product counts, campaign windows, prices, code status, and credentials as facts to recheck. The original CODEX_START_PROMPT.md is included as a source, and its launch countdown is historical.

Start by confirming your actual tools. Use the official provider connector or the owner's existing authorized session for the specific task. Discover the available Higgsfield tools or plugins, confirm the correct ShoreList workspace, and check reference upload, image generation or editing, video generation, job status, and export as each becomes relevant. Use the authorized capability needed for the task. Record verified access, permissions, and missing capabilities. Keep private values in the platform's secure configuration. Continue with independent read-only work if access is missing. Avoid asking RJ routine questions or asking him to repeat evidence another agent already verified.

Prioritize a reliable storefront, qualified local search discovery, and profitable sales. Strengthen the existing shop before adding duplicate products or thin pages. Use known costs, freight, channel fees, and the applicable 15% discount stress scenario. Show what is measured, what is estimated, and which missing inputs could change the result. Check the buying path on phone and desktop and include keyboard, accessibility, mobile layout, SEO, pricing, variants, and checkout evidence as applicable.

ShoreList design starts with a real local place, object, or memory. Wrightsville Beach leads the identity. Treat Wilmington, Carolina Beach, Kure Beach, the Outer Banks, and Charleston as distinct places. Use documented local geography, natural history, and source images. Aim for restrained coastal luxury, original work, readable details at actual scale, and accurate product presentation. Hard failures include grey or Pepper, Beach Club or Yacht Club wording, badges or circles, unnecessary numbers or stray letters, cheap supplier imagery, incorrect or unsupported local details, imitation or generic souvenir design, and false product imagery. Use plain, factual, locally specific copy. Use the current copy guard and banned wording list.

For a public product-photo pair, put the accurately disclosed Higgsfield lookbook first and the verified actual studio photo second for the same sellable variant. A source listing, generated mockup, or resized studio photo is insufficient to establish a finished sample or to substitute for the lookbook. Verify design and lettering, fit or shape, material, color, dimensions, proportions, stitching, shadows, drape, and scale. Record the exact generation, files, and both digests. Hold whenever the exact real studio asset or photo provenance is missing. Drafts can be reviewed or rejected before independent scoring.

Aim for 100/100. Release requires the documented independent brand score of at least 90/100 for the exact revision with five evidenced dimensions and zero hard failures. Applicable product review requires all ten evidenced criteria, a mean of at least 9/10, and each criterion at least 8/10. Independent blind photo review must reach at least 8/10. Keep publisher and reviewer roles separate. Never invent a score, source, product photo, demand number, cost, stock claim, testimonial, sale, or successful test.

Work through one shared task. Use VERIFIED, ESTIMATE, HYPOTHESIS, and UNKNOWN. Return the task ID, source links, numbers and assumptions, exact revision or asset digests, evidence and checks, the next owner, and one owner decision only if a reserved action truly requires it. Prepare drafts and do authorized read-only work autonomously. Spending, account changes, deletion, real orders, production deployment, a homepage redesign, and new product publication require the approvals in AGENTS.md and RELEASE_GATES.md. Stay within the authorized Shopify edits and document any reversible change.

First assignment: refresh the command center from current main, GitHub, and shorelist.net/shop. Pick one ready ShoreList task with the biggest credible impact on shoppers or contribution. Start with a source-backed deliverable for the collection filter, the approved promotion, a product photo audit, or Dot's CJ evidence as the queue directs. Return work to the named next owner with proof and one clear next action.
```

# ShoreList command center

ShoreList LLC operates the Wilmington-area guide at [shorelist.net](https://shorelist.net/) and its [shop](https://shorelist.net/shop). Work here is exclusively for ShoreList. The owner and release approver is RJ Brideau.

## Start here

| Need | Open |
| --- | --- |
| Get the current state and next work | [Status and assignments](https://github.com/ShoreList/ShoreList/blob/docs/shorelist-agent-command-center/docs/command-center/STATUS.md) |
| Initialize Grok for ShoreList | [Grok start prompt](https://github.com/ShoreList/ShoreList/blob/docs/shorelist-agent-command-center/docs/command-center/GROK-START.md) |
| Start a repeatable research, creative, sales, or audit task | [Prompt library](https://github.com/ShoreList/ShoreList/blob/docs/shorelist-agent-command-center/docs/command-center/PROMPT-LIBRARY.md) |
| Determine which provider actions are available and authorized | [Connector runbook](https://github.com/ShoreList/ShoreList/blob/docs/shorelist-agent-command-center/docs/command-center/CONNECTORS.md) |
| Read the controlling rules and queue | [Agent rules](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/AGENTS.md), [release gates](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/RELEASE_GATES.md), [engineering queue](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/CODEX_TASKS.md) |

The repository is the shared record. The engineering queue owns task scope and file claims. The supplier candidate record owns release evidence. The status page is a dated snapshot with links to both, alongside assignments that need a cross-agent handoff. Refresh GitHub, live URLs, and provider evidence before relying on any dated observation.

## Ownership

| Role | Owns | Hands off |
| --- | --- | --- |
| **Codex** | Repository implementation, CI, storefront browser and checkout tests, SEO implementation, and release evidence | Exact branch and revision, changed paths, screenshots where required, test results, preview, and rollback |
| **Grok** | ShoreList-only market and search-intent research, product and campaign briefs, evidence-based sales copy, and approved Higgsfield draft production | Sources, candidate comparisons, expected contribution and assumptions, approved exact-variant inputs, asset digests, and creative revisions |
| **Claude** | Independent review, release-gate audit, product fidelity and evidence checks, and separately claimed engineering tasks | Findings with evidence and exact revision. When Claude is the author, assign the independent review to a different eligible reviewer |
| **Dot** | CJ research in its existing authenticated session, where available | Exact product/variant IDs and SKU, variant image, warehouse stock, quoted service and USD freight by destination, and verification date. Supply evidence through the shared task record |
| **RJ** | Approval for reserved actions and release decisions under repository rules | Exact revision approval, decision, and any approved scope or spending limit |

One owner per task and one writer per file at a time. Before edits, read the engineering queue, fetch `origin/main`, check overlapping PRs or branches, and claim the files in the task. Put a dependency or conflict on the task and continue with independent work. Grant or change account access through platform settings only when authorized. Never share one agent's private credential with another.

## Decide from evidence

1. Prioritize defects that block discovery, truthful product selection, checkout, or revenue. Then compare expected benefit, margin, effort, operational risk, and time to validate.
2. For products, compare net item and shipping revenue against landed supplier cost, freight, duties, payment and channel fees, and justified allowances for returns and support. Run the existing 15% promotion stress scenario where applicable. Record source, currency, destination, date, and what the estimate excludes. Unknown demand or costs stay unknown.
3. For search, choose the most useful existing destination for the query before proposing a new page. Record search intent, evidence of demand where available, overlap, and the before-and-after discovery path. Check titles, descriptions, canonicals, indexability, relationships between pages, structured data, and sitemap wherever the change affects them.
4. Test actual journeys at 390 px and 1280 px, plus 320 px for cards and bag work. Check focus and keyboard operation, touch targets, no clipping or horizontal overflow, loading and failure states, price and stock accuracy, and the exact checkout handoff. Compare Lighthouse with the relevant baseline and follow the full release gates.
5. Use the brand, product, and photography scores for the exact version under review. A favorable sales estimate cannot clear a required gate or known hard failure. Track a relevant business measure after release when authorized data exists.

## Handoff record

```text
Task ID / owner / state: READY | ACTIVE | BLOCKED | REVIEW | RELEASED
Goal / customer impact / exact files or products:
Primary source / branch / PR / revision or asset digest:
VERIFIED observations, commands, exits, and date/time:
ESTIMATE or HYPOTHESIS with assumptions or comparison:
UNKNOWN inputs and the decision they affect:
Independent reviewer / exact revision / applicable gates:
Next independent action / responsible agent:
Owner decision, only when reserved and actually needed:
```

Use a single handoff for related decisions. Keep raw credentials, customer records, and private checkout information out of prompts, artifacts, and logs. A claim about a production change requires a fresh production check.

# ShoreList status and assignments

**Snapshot:** November 26, 2026, 10:13 PM Eastern. **Source:** `main` at `ad536ee611457ce326b8e5447f67988598c1e0ab`. Refresh GitHub and production before starting a new batch.

## Verified state

- The production homepage and shop returned HTTP 200. The live service worker matched `main` at `sl-v287-2026-11-26`, and the live cart script matched the Git SHA-256. The checkout reliability work and campaign attribution into Shopify are merged. The attribution PR records an owner-placed sticker order and confirmation. Shipment tracking and GA4 attribution remain unknown. [Checkout fixes](https://github.com/ShoreList/ShoreList/pull/335) · [Campaign attribution](https://github.com/ShoreList/ShoreList/pull/348)
- The live verifier checked 91 sitemap URLs, 339 image URLs, and 125 public Shopify products. It exited 1 for 23 Shore Picks restaurant photo 404s. It reported no failed sitemap routes or shop price or availability discrepancies. [Shore Picks task](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/CODEX_TASKS.md)
- The catalog has 107 entries, 106 Shopify rows and one Fourthwall listing. ShoreList Direct has zero live products. The 40 supplier candidates remain research-only. A successful read-only CJ search was recorded for the owner's authenticated session. Exact approved CJ SKUs, warehouse inventory evidence and freight for a release are still outstanding. [Supplier expansion](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/SUPPLIER-EXPANSION.md) · [CJ variant and freight review](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/CJ-VARIANT-REVIEW.md)
- Eight Higgsfield tote drafts are recorded. Four were rejected for sailboat repeat, Airlie Oak artwork, turtle anatomy, or Market Tote proportions. Four remain held for actual finished-sample provenance and independent review. The photo record contains 26 pending cases and zero approved pairs. Three inspected printed-tote galleries reused model poses and backgrounds across products, so their gallery metadata did not establish actual finished-sample photography. [Tote work](https://github.com/ShoreList/ShoreList/pull/345) · [Photo record](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/shop-photo-review.json)
- Site, keywords, static shop, nine operator fixtures, 51 grouped regressions including the photo gate with a base, nine attribution checks, shop analytics, and 27 mocked checkout tests passed on a docs-only branch based on `5435c94`. GitHub then reported green site and regression checks on `ad536ee`. [Site check](https://github.com/ShoreList/ShoreList/actions/runs/45932590708) · [Regression checks](https://github.com/ShoreList/ShoreList/actions/runs/45932590644)
- Exact merchant-link checking merged in #349. Its first observed main run checked 107 cards across 105 destinations and received 14 HTTP 429 responses. A paced recheck verified all 14 exact destinations. The same workflow separately confirmed the 23 Shore Picks 404s. [Live workflow](https://github.com/ShoreList/ShoreList/actions/runs/45932590901)
- The direct Chromium checkout rerun in Codex stopped at the managed certificate boundary. The earlier checkout and owner-order evidence in [#348](https://github.com/ShoreList/ShoreList/pull/348) is distinct from that blocked rerun.
- The live collection filter defect still reproduces. At 390 px, Beach Setup starts with six products. Selecting Crewnecks and tees clears the collection URL parameter and shows 33 unrelated listings. The fix was tested separately at 320, 390, and 1280 px on an earlier baseline. Rebase and retest it on the current storefront branch before release.

## Agent assignments

| Priority and state | Owner and task | Evidence and next dependency |
| --- | --- | --- |
| **P0 — coordinate** | **Codex** to integrate the collection filter fix with the active storefront owner | Preserve collection context while filtering by town, type, or motif and on reload. Check keyboard focus, counts, SEO/canonical, and 320/390/1280 px. Several drafts edit `shop.html`. Coordinate one writer before changing it |
| **P1 — maintain** | **Codex** to tune recurring merchant-link verification | Keep the exact product route and metadata checks. Pace requests, honor `Retry-After`, and report remaining unverified URLs explicitly |
| **P0 — observe** | **Grok** to prepare sales briefs for the next eligible offer | Current shop code records Black Friday on Nov 27 and Cyber Monday on Nov 30, Eastern Time, for eligible Shopify orders. Verify the live checkout terms and timing before using them. Labels and promo code alone do not establish current eligibility. No ad spend or sending is part of this assignment |
| **P1 — review** | **Claude** to audit open storefront work | Check merge readiness and scope of [Fourthwall storefront #332](https://github.com/ShoreList/ShoreList/pull/332) and [launch draft #331](https://github.com/ShoreList/ShoreList/pull/331). Identify overlapping files, release evidence, CI deltas, and the one owner for each edit |
| **P1 — research** | **Dot** to supply CJ evidence for Dockside Dry Bag | Use the authenticated access where already working. Return exact SKU, variant image, stock, dates, and US ZIP coverage. Grok can compare likely demand, freight-adjusted contribution, and merchandising fit using that evidence |
| **P1 — hold** | **Grok** to audit one Higgsfield tote submission | Work from the eight existing drafts. Verify the exact variant and real studio source first. Route a complete pair to an eligible independent reviewer. Owner approval and independent gates apply before publication |
| **P1 — hold** | **Codex and Grok** to resolve the 23 Shore Picks 404s | Codex owns site changes. Grok may locate licensed, real photographs of the exact businesses and document rights. Source and brand proof are required before a replacement |
| **P2 — research** | **Grok** to validate Navy Daymark beanie opportunity | Earlier triage verified a $30 Shopify listing and responsive page, with $25.50 item revenue before costs at the 15% scenario. Confirm current SKU, landed cost, measured search demand, photograph provenance, and independent review for the exact version |

## Access at this snapshot

Codex verified GitHub API, production ShoreList reads, Shopify public reads, and the permitted image endpoints. Dot's or the owner's usable CJ connection does not imply a local key in Codex or Grok. This session has not connected to Grok, Claude, or Higgsfield directly. Higgsfield draft existence is verified from the repository, while individual tool permissions and credits must be checked in the intended agent session. GA4, Search Console, merchant admin, and payment-provider access depend on the actual connected session. [Connector checklist](https://github.com/ShoreList/ShoreList/blob/docs/shorelist-agent-command-center/docs/command-center/CONNECTORS.md)

# ShoreList connector runbook

Access is specific to the agent, workspace, provider, and action. Use the existing authorized ShoreList account where available. Provider setup belongs in secure settings. Record connection names, permissions, exact objects read, and validation dates. Keep secret values, signed URLs, customer data, and payment details out of handoffs.

| Provider | Intended use | First verification | Boundaries |
| --- | --- | --- | --- |
| **GitHub** | Shared repository, branch and PR ownership, check results and evidence | Fetch `ShoreList/ShoreList` main. Open the target PR and its checks with the assigned identity | Follow branch scope and release approval. Stage files by name. Treat a main merge as production-capable |
| **Netlify** | Deployment status, preview verification, functions and hosting | Match the preview or live artifact to its exact Git SHA or asset digest. Visit the intended route | Use the smallest needed access. Verify production independently after an authorized release |
| **Higgsfield** | Exact-product AI lookbooks and approved creative video | Discover official workspace tools or plugins. Confirm the project account and available reference asset, image generation/editing, video, job-status and export operations | Verify credits and permission before any consuming operation. Use official provider tool names as discovered. Keep drafts clearly identified and require exact-variant reference, actual studio photo, approval and disclosure |
| **Shopify** | Product, variant, offer, order evidence and hosted checkout | Read the ShoreList storefront or authorized Admin. Compare one exact variant and price with `shop-product` | Check eligibility by promo window and stop before payment for ordinary agent tests. Reversible copy, SEO and merchandising edits follow AGENTS.md and need a before-and-after log |
| **Fourthwall** | Template/offer evidence, draft artwork and hosted checkout | Read the template and exact regional variant capabilities or an authorized store offer | Use hidden draft mode when authorized. Confirm no existing offer before a retry. Publication, spending, and merchant changes follow owner gates |
| **CJ Dropshipping** | Candidate search, exact variant, warehouse stock and freight quotes | Reuse Dot's authenticated evidence or run a read-only search/inspection in its existing authorized session | Keep `CJ_API_KEY` in the provider's secure environment. Use ZIP samples and exact services. Keep drafts dormant pending review. Order creation, payment, and supplier automation require approval |
| **Stripe and Printify** | Hosted checkout, fulfillment and evidence for applicable products | Inspect authorized test or read-only evidence and run the existing mocks | Keep production webhooks, server-side prices, and fulfillment safeguards intact. Real orders, spending, and account changes require authority |
| **GA4 and Search Console** | Qualified search demand, funnel and campaign verification | Confirm the correct ShoreList property and a read-only report or approved debug event | Keep PII out of URLs, events and output. Measured results need property evidence |
| **Other ShoreList connectors** | Canva, social platforms, Formspree, Resend or documented owner tools where relevant | Inventory installed tools and validate the ShoreList account and the single needed action | Use the least necessary scope. Sending, publishing, advertising spend, purchases, or account changes require existing authorization |

## First session checklist

1. Read the command center and select one task.
2. Inventory actual tools in that session. Mark a capability VERIFIED only after the read or permitted test succeeds. Label availability elsewhere as reported, and missing access as UNKNOWN.
3. Use the narrowest read-only check for the provider and object. Preserve existing platform-provided credentials and documented secret bindings. Record outcomes and sanitized references, including an authoritative vendor documentation link when useful.
4. Discover all relevant Higgsfield capabilities, then use the approved tools required by the brief. Separate images, image edits, product-reference tools, video, job polling, and exports so their permission and credit effects are clear.
5. If an operation cannot run, use the original written prompts, validated public storefront data, existing agent evidence, or fixture tests to advance the rest of the work. Record exactly what remains open.

Historical provider facts are in [INTEGRATIONS.md](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/INTEGRATIONS.md), [supplier expansion](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/SUPPLIER-EXPANSION.md), [CJ variant review](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/CJ-VARIANT-REVIEW.md), and the current [status](https://github.com/ShoreList/ShoreList/blob/docs/shorelist-agent-command-center/docs/command-center/STATUS.md). A connection in one agent's session does not establish access in another.

# ShoreList prompt library

Use one prompt for one claimed task. Replace brackets with verified inputs or mark them UNKNOWN. The [original Codex prompt](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/CODEX_START_PROMPT.md), [brand standard](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/COASTAL-BRAND-STANDARD.md), and [release gates](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/RELEASE_GATES.md) remain the source text. The templates below translate those rules into repeatable assignments.

## 1. Sales and campaign strategy

```text
For ShoreList only, prepare one campaign brief for [product or collection], [customer intent], [approved offer], and [channel]. Read the current store, the offer's actual terms and Eastern Time window, and the applicable shipping and returns page. Use supplied business metrics and label the rest. Compare conversion or qualified-traffic potential with contribution per order after discounts, fees, supplier cost, freight, and fulfillment.

Return the customer need, approved items and exact buyable options, expected contribution with assumptions, one destination and CTA, copy for [channel], and one measure of success. Match the live offer at checkout. Avoid false urgency, unsupported demand or quality claims, unverified ratings, extra discount codes, and cross-brand language. Use the approved ShoreList tone and factual town references. Verify campaign tags with the current attribution rules. Keep customer information and private IDs out of URLs and creative. Draft only unless the exact change falls under current authorization.
```

## 2. SEO and storefront discovery

```text
Audit [query or collection] for ShoreList. Start with [live routes], the keyword map, catalog, and existing navigation. Identify the search intent, which page should own it, what a shopper can actually buy there, competing ShoreList pages, and the evidence for demand. Separate observed queries or impressions from qualitative hypotheses.

Return the recommended route and internal links, proposed title/meta/H1 when justified, the exact catalog facts supporting the copy, and the verification plan. Confirm canonical, robots, sitemap and lastmod when applicable, Open Graph and structured data, and price, color, size, and availability parity at checkout. Watch for overlap with town pages or gift collections. Test the actual shop journey on mobile and desktop. Attribute every factual claim to an authoritative source or the live product.
```

## 3. Coastal design direction

```text
Develop a ShoreList concept for [exact product, supplier substrate, and market use] grounded in [town, landmark, waterway, species, or real memory]. Verify the geography, perspective and seasonal light with authoritative references. Check whether the motif already belongs to another named town or existing product. Choose one strong motif or a purposeful pair, a limited palette rooted in the place, and original composition legible at the actual production size.

Return source URLs and the facts each supports, one main concept, a tightly scoped alternative only if it resolves a real tradeoff, palette, placement and production constraints, and explicit hard-failure findings. Keep the artwork locally specific and restrained. Apply the existing prohibitions on grey/Pepper, club wording, badges/circles, unnecessary numbers or letters, cheap photography, inaccurate geography, imitation, generic souvenir styling, and false product imagery. A draft or concept cannot be scored by its author as independent approval.
```

## 4. Higgsfield exact-product lookbook

```text
Create an editorial draft for ShoreList using the authenticated Higgsfield tools authorized for this project. Required inputs: [approved exact sellable SKU and option values], [verified real studio reference], [source URLs], [photo rights/provenance], [physical dimensions], [approved location/setting], [aspect ratio/export target], [approved generation budget]. Stop generation if a required input is missing and continue the reference and audit work.

Reproduce the exact product. Preserve its color, materials, construction, dimensions, handle or garment shape, proportions, print scale, artwork, orientation, and lettering. Work from the same sellable variant as the studio photo. Scale the product against a believable surface, hand, model, or prop. Use soft, physically consistent light, believable contact shadows, natural drape, and a setting supported by the ShoreList brief. Avoid decorative text overlays, competing motifs, invented logos, arbitrary geometry, generic resort staging, and false local scenes.

For image editing, isolate the authorized change and preserve the product. For video, use an approved reference and constrain movement to preserve product geometry, lettering, and color frame to frame. Use the lowest sufficient authorized generation spend. Export candidates with generation IDs and file digests. Label generated assets as AI-styled. Provide matched-scale and crop comparisons with the actual studio photo and evidence of fidelity, realism, studio provenance, and disclosure. A generated image is the disclosed editorial draft. Retain the independently verified actual studio photograph as the separate second asset.
```

## 5. Supplier and margin screen

```text
Research [candidate] for ShoreList using the approved and available supplier connector. Before proposing it, check for duplicates across the curated catalog, Shopify, Fourthwall, and CJ. For CJ use Dot's existing exact-variant and warehouse evidence where available, then fill gaps with the read-only commands in CJ-VARIANT-REVIEW.md. For Fourthwall confirm template, production region, available colors and sizes, exact art region, and whether the official template supports automated rendering.

Return the exact product/variant IDs and SKU, physical specs and allowed claims, authorized actual product images, eligible colors and sizes, warehouse availability, freight and service by ZIP, returns and support risks, and the contribution calculation. Show the normal-price scenario and the existing 15% discount stress case where applicable. Label sources and dates and state which assumptions could reverse the ranking. Keep candidates dormant pending checkout-route, independent review, and owner gates. Prepare an evidence record suitable for the existing audit tools.
```

## 6. Independent gate review

```text
Review [submission] at [exact revision or digests]. Confirm who created it, who can independently review it under ShoreList rules, and what evidence can be reproduced. Inspect the live merchant variant and the actual asset. For image pairs compare matched scale and crop and verify the dimensions, artwork, lettering, color, material, construction, drape, lighting, and credible studio provenance. Inspect the AI disclosure.

List hard failures and stop the release recommendation if any apply. For eligible independent reviewers, use the existing five brand dimensions with evidence and a 0 to 20 score each, plus the ten merchandise criteria and blind photo review when applicable. Use the existing exact-version digest rules. Missing evidence remains UNKNOWN. Record commands, exit statuses, tested widths and routes, and any owner approval required. Return a disposition of HOLD, REVISE, or READY FOR OWNER REVIEW with concrete findings and the next responsible role.
```

## 7. Cross-agent handoff

```text
Summarize [task] using the shared handoff record. Open the current files or run the checks needed to verify the claimed status. Name the exact branch or asset revision, the next owner, and the next safe action. Include concrete evidence and its date. Separate verified facts, estimates, hypotheses, and unknowns. Carry forward existing evidence and permission limits. Treat a blocked connector as one blocked operation and continue with independent work.
```

# Source appendices

These original repository documents remain authoritative for their scope. Dates and observations are preserved.

## Agent operating rules

<details>
<summary>Read the repository source</summary>

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

The owner's [Coastal Brand Standard](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/COASTAL-BRAND-STANDARD.md) is a hard release rule for all new and materially revised designs and brand work. Apply it to artwork, copy, pages, photography, ads, supplier materials and generated creative. Work from documented local references for Wrightsville Beach, the Cape Fear beaches, the Intracoastal, the Outer Banks and Charleston. A named independent reviewer must document a coastal luxury brand match of at least **90/100** for the exact version. Any factual, fidelity or brand hard failure holds the work at every score. Never assign a score without a review. In new merchandise, preserve all existing product and photo gates and require owner quality approval.

- What the card/PDP shows must match what Shopify sells: name, colors, sizes, price, text/artwork on the item. Verify by viewing the image, not the filename.
- Known corrected mismatches (do not regress): Blue Crab Embroidered Crewneck (Kure Beach) is **White only** (lookbook shows aqua); Blue Crab Corduroy Cap and Cuffed Beanie (Kure Beach) show the **navy** studio image (lookbook shows brown/olive). Those three use studio-first images (`lookbook: ""`).
- Audit, prepare and score the replacement pair before changing existing storefront product imagery. Release both images together, with an accurate, disclosed Higgsfield lookbook first and an independently verified actual studio image second, for the same sellable variant. A resized copy or a second studio angle does not satisfy the lookbook requirement. Existing gaps are recorded in `docs/shop-photo-review.json` and count as open remediation.
- New product publication needs owner approval; the pipeline and quality gate are in the `shorelist-shop-product-pipeline` skill and in `tools/ingest-shopify-products.mjs` (it holds items without a lookbook).

## 9. Where context lives

Repo: this package, `docs/`, `tools/shopify-compact.md`, `tools/shopify-ingest-plan.json`, `README` files under `data/`. Owner-side project docs (Claude Project "TaskBot Market + LateToAI", ShoreList files such as `claude/SHORELIST-LAUNCH-AUDIT-2026-11-25.md`, `claude/shorelist-build-rules-MASTER.md`, `claude/shorelist-hard-rules-v2.md`) hold the longer audit and build rules; the owner can attach them. Treat that material as background, and re-verify before relying on any number.

</details>

## Original written start prompt, historical context

<details>
<summary>Read the repository source</summary>

# CODEX_START_PROMPT.md

Paste everything inside the box below as the first message when opening the `ShoreList/ShoreList` repository in Codex.

```
You are the engineering agent for ShoreList LLC (Wilmington, NC), working in the ShoreList/ShoreList repository. The owner and sole approver is RJ Brideau. Public launch of the merch shop at shorelist.net/shop is Thursday 2026-11-26 at 5 PM Eastern.

Before doing anything else, read these files in this order and follow them as binding instructions: AGENTS.md, CODEX_HANDOFF.md, CODEX_TASKS.md, INTEGRATIONS.md, RELEASE_GATES.md, CHANGELOG.md. Do not ask me to re-explain the business, the stack or earlier decisions; they are in those files. If a file contradicts what you observe in the repo, trust what you can verify, say so, and propose the doc fix.

Operating rules (full text in AGENTS.md):
- ShoreList is a separate business from Late to AI and TaskBot Market. Never mix their names, code, data, assets or accounts.
- No spending, deployment, deletion, new product publication or account changes without my explicit approval. Treat any merge to main as a possible deployment. Reversible Shopify description, SEO, merchandising and collection-organization changes are authorized; log before and after in CHANGELOG.md.
- Never expose or commit credentials. Never enter passwords, accept terms or create accounts for me.
- Work only on an isolated branch or git worktree. Claude Code may be editing this repo too: before touching a file, check open branches and CODEX_TASKS.md so two agents never edit the same file. Never overwrite unrelated work. Stage files by name; never commit .claude/.
- Preserve existing functionality, branding and supplier integrations. Do not redesign the homepage.
- Avoid generic AI-sounding copy, artificial product imagery and unsupported marketing claims. Product photos must show the product the customer actually receives.
- Label every material claim VERIFIED, ESTIMATE, HYPOTHESIS or UNKNOWN. Do not say a test passed unless you ran it and it exited 0. Do not say a production change happened unless you independently verified it live.

Your first job, in this order, no more:
1. Run the commands in AGENTS.md section 4 and report actual results next to the baseline in CODEX_HANDOFF.md. Do not fix anything yet.
2. Start CODEX_TASKS.md P0: T-01 (confirm deploy pipeline and live parity), then T-03 (checkout handoff test, stop before payment), then T-04 (Shopify SEO/alt text, authorized and reversible), then T-21 (read the nightly verify-live report). T-02 is already resolved; just do not regress homepage speed.
3. For each task: branch, smallest change that meets the acceptance criteria, run RELEASE_GATES.md gates, open a PR with evidence (commands, exit codes, desktop 1280 and mobile 390 screenshots, rollback line). Merge only when check is green and the gates pass and my merge delegation in AGENTS.md rule 1 applies; otherwise stop and ask me one specific question.
4. Prioritize launch-critical defects over redesigns or refactors. If something would take longer than the time left before launch, document it in CODEX_TASKS.md instead.

When you finish or get blocked, send me: what changed, what you verified and how, what you could not verify, and the single decision you need from me (if any). Keep it short.
```

Notes for the owner (not part of the prompt):
- If Codex cannot reach the internet or Shopify, T-01, T-03 and T-04 will report UNKNOWN; that is expected. Give it a networked environment or run those checks yourself.
- Give Codex access to the project docs you want it to see (for example `SHORELIST-LAUNCH-AUDIT-2026-11-25.md`); the repo package stands on its own without them.
- Merge delegation: you said on 2026-11-25 that decisions and merges are delegated when checks pass. If you want Codex to open PRs only, add "Do not merge; open the PR and stop" to the prompt.

</details>

## Shop and website release gates

<details>
<summary>Read the repository source</summary>

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

- [ ] The exact revision has an independent 90/100 or higher coastal luxury review, checked local references, no hard failures, and evidence for all five dimensions in the [Coastal Brand Standard](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/COASTAL-BRAND-STANDARD.md).
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

</details>

## Coastal brand and exact-product photo standard

<details>
<summary>Read the repository source</summary>

# ShoreList coastal luxury brand standard

This owner direction applies to all new and materially revised ShoreList design and brand work, including product concepts, artwork, copy, packaging, photography, storefronts, ads, supplier imports and work made with Higgsfield or other generators. Every release needs an independent, evidenced brand match of **at least 90/100** on the exact version presented for approval. The threshold applies on tight timelines and to supplier-provided material.

## Creative brief

Start with a place, a real object or a memory someone who spends time on this coast would recognize. Wrightsville Beach leads the ShoreList identity. Its sunset light, John Nesbitt Loop, Banks Channel, Intracoastal Waterway, old live oaks, waves, boards and piers offer specific visual references. Wilmington, the Cape Fear beaches, the Outer Banks and Charleston add depth when the work identifies the actual place and preserves its geography and character.

Choose one clear motif or a purposeful pair. Dolphins, sharks, fossil shark teeth, distinct shells, brown pelicans and locally documented owls can carry a design on their own. Use a regional field guide or authoritative record for identity, anatomy, habitat and occurrence. For a shell presented as a local beach find, verify the species and named shoreline. An attractive shell shape or a record from another coast cannot support that claim. Use regionally documented coquinas, whelks, scallops, augers or olive shells as starting points for research. Distinguish fossil teeth from those of living sharks and verify the specific locality before labeling a tooth. [NC Sea Grant shell reference](https://ncseagrant.ncsu.edu/seashells-of-north-carolina-updated-and-expanded/) [Cape Hatteras shelling reference](https://www.nps.gov/places/old-lighthouse-beach.htm) [Cape Lookout mollusks](https://www.nps.gov/calo/learn/nature/mollusks.htm) [NC Geological Survey fossil reference](https://www.deq.nc.gov/about/divisions/energy-mineral-and-land-resources/nc-geological-survey/nc-geology-frequently-asked-questions) [NOAA Fisheries dolphin research](https://www.fisheries.noaa.gov/inport/item/67355/full-list)

Build palettes from referenced light and materials. For Wrightsville, start with the observed sunset color relationships across the sound, from warm oyster, pale apricot and muted coral to deep tidal blue and sea-glass green. Check compass direction, tidal water, bridge and pier shapes, town labels and shoreline against a map or a reliable photograph. Verify the Loop against the town's route. Use the Cape Fear, Outer Banks and Charleston as distinct places. [Wrightsville Beach Loop](https://townofwrightsvillebeach.com/181/Parks-Recreation) [USACE Banks Channel and Masonboro Inlet survey](https://eft.usace.army.mil/saw-nav/INLETS/MASONBORO/INLET/Masonboro_Inlet.pdf) [NC DEQ Bald Head Woods Reserve](https://www.deq.nc.gov/about/divisions/nc-coastal-reserve/reserve-sites/bald-head-woods-reserve) [NPS Outer Banks geography](https://home.nps.gov/articles/nps-geodiversity-atlas-cape-hatteras-national-seashore-north-carolina.htm)

Make the work feel coastal luxury through controlled color, originality, legible craft at actual size, generous space and precise finishing. Every embellishment and word needs a reason. Apply the established hard failures for grey including Pepper, Beach Club or Yacht Club wording, badges or circles, unnecessary numbers or stray lettering, and cheap supplier photography. Unverified or mismatched local references, imitation artwork, generic souvenir styling and false product imagery are also hard failures. A hard failure holds a design at any score.

## Independent review

Score each dimension on an integer scale from 0 to 20. Record specific observations and the supporting references. A score of 18 represents strong, release-quality execution for the dimension. High scores require clearly documented evidence. Missing evidence or a failed fact check holds the work.

| Dimension | Evidence required |
| --- | --- |
| Local fidelity | Exact place, waterway, landmark, shell or species is supported by suitable references. Shapes, viewpoint and setting agree with them. |
| Coastal luxury | The palette, typography, composition and finish feel considered and consistent with ShoreList. |
| Personal connection | A specific coastal experience or object gives the work meaning for people who know or visit the place. |
| Originality and execution | The design is original and resolved at its intended scale, material and production method. |
| Presentation accuracy | Copy and imagery accurately represent the final piece or brand asset. Exact product details and AI disclosure are clear where relevant. |

Record reviewer identity, independent review confirmation, full Git commit SHA or SHA-256 asset digest, at least one geography or natural-history source, verified local accuracy, hard-failure outcome, and the five criterion scores with written evidence. The review applies to that revision only. Material changes require a new review. Owner quality approval remains required for new merchandise.

For supplier expansion, this brand review is in addition to the existing ten product criteria. Their arithmetic mean must be at least 9/10 with each criterion at least 8/10. The independent blind photography minimum remains 8/10. Exact product imagery remains lookbook 1, actual studio photograph 2. Draft artwork, generated concepts and supplier mockups are held until these records are complete.

The same review thresholds apply to replacement photography for existing products. Use Higgsfield for the clearly disclosed lookbook, with the exact sellable variant as its reference. Keep the actual studio asset separate. Compare the two at matched scale and crop. Check bag or garment dimensions, artwork size relative to the product, color, artwork and lettering, construction and material, drape and support, hands or props where present, lighting and believable shadows. A mismatch or unsupported claim fails the pair before scoring. Record both asset digests and review the exact pair before making a replacement live. Record unresolved legacy cases in the [shop photo review](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/shop-photo-review.json).

In the shop photo record, store completed reviews by catalog ID in `reviews`. Set the storefront product’s `lookbookGenerator` to `Higgsfield`. Record the review `generator` as Higgsfield, `generationId`, `lookbookSha256`, `studioSha256`, `variant`, `fidelityEvidence`, `realismEvidence`, `studioEvidence`, `disclosureEvidence`, `scores`, and `scoreEvidence`. The brand, blind-photo and owner reviews must all cite the SHA-256 of the exact UTF-8 JSON array `[img, lookbook, studio, alt, gallery ?? [], lookbookGenerator ?? null, lookbookSha256, studioSha256]` as `reviewedRevision`. The blind reviewer also records `independent`, `blind`, `reviewer`, `score` and `evidence`. The owner records `approved` and `reviewer`. A preliminary review can reject a candidate without entering independent scores.

</details>

## Integrations and provider boundaries

<details>
<summary>Read the repository source</summary>

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
| Instagram and TikTok `@shorelist` | Social | **LINKED** | Plain links on the shop page and footers (PR #318); no API. No Facebook link. Meta Page/Ads: **PLANNED, owner-only**. |
| Netlify PR checks | Redirect rules, header rules, pages changed on every PR | **CONNECTED** | Seen on PRs #324 to #326 (VERIFIED). |
| GitHub Action `verify-live` | Nightly read-only live checks | **CONNECTED** | First manual run 2026-11-26 03:29Z worked; scheduled run unverified until it fires. |
| Shop Pay / Shopify checkout | Payment at `shop.app` and shopify domains | **CONNECTED** | Handoff reached checkout with correct items in a live walk-through; no payment made. |
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

</details>

## Supplier expansion procedure

<details>
<summary>Read the repository source</summary>

# Curated supplier expansion

Branch owner is Codex on `feature/curated-supplier-expansion`. The 40-row candidate queue is the release record. The development file has copy and design direction for all candidates, public template leads for 20 Fourthwall candidates, and public listing leads for eight CJ candidates. Candidate SKU, landed cost, photos, review scores and owner approval remain unset until verified.

## Findings

- **VERIFIED** The public ShoreList catalog and the branch catalog have the same Git blob, `5cfed05c67f4d0ef8c2017abd4544807d7bb8e12`. It contains 108 Shopify and one Fourthwall product. Direct has two placeholder drafts and zero live products. Six existing public catalog entries have no `studio` field.
- **VERIFIED** Shopify Admin returned 152 products, including 129 active, 19 draft and four archived. None of the 40 candidate names matched a normalized Shopify title. The public Fourthwall homepage linked to 16 distinct product pages. These title checks leave product-level duplicates unresolved. Review in particular Kure Pier Morning against the existing Kure Beach Fishing Pier print, plus the candidate tote, pouch, blanket, weekender and cushion against existing coastal merchandise.
- **VERIFIED** Fourthwall's unauthenticated template API returned 644 unique entries. The 20 leads map to 11 distinct templates and the detail API loaded all 11. Base prices are supplier template prices in USD before shipping. For example, the framed matte art blank ranged from $20.35 to $74.41 across available variants, and the classic knit crewneck showed $38.00. The exact template, region and variants are checked again before a draft write. [Fourthwall template API](https://docs.fourthwall.com/api-reference/platform/product-templates/get-product-template)
- **VERIFIED** Fourthwall checkout carried one Oyster tote at a $48 subtotal to the payment page. Shopify applied SHORE15 to an eligible $88 crewneck and its checkout announced $74.80 after the $13.20 discount, before shipping. No order was placed. The promotion applies to eligible Shopify checkout. The 15% contribution gate is also a conservative scenario for proposed supplier products.
- **VERIFIED** Public shop landing routes for the four towns, art prints and gift guide returned 200. The live version of the supplier candidate file, tools path sampled and Direct catalog returned 404. Security headers are present on the live shop.
- **UNKNOWN** Fourthwall merchant offers beyond the public storefront, supplier shipping and payout configuration, CJ connected catalog and inventory, and production Stripe fulfillment. Existing Fourthwall Platform credentials and the CJ API key were unavailable in this session. GitHub Actions secret metadata also returned 403. The Shopify Admin connection does not authenticate either supplier.
- **UNKNOWN** The public CJ leads still require authenticated SKU detail, warehouse stock, freight, fulfillment and image verification. A public search result supplies a research lead only. [CJ Product API](https://developers.cjdropshipping.com/en/api/api2/api/product.html) [CJ Logistics API](https://developers.cjdropshipping.com/en/api/api2/api/logistic.html)

## Artwork

Eight editable 2400 by 3000 SVG illustrations and four reduced-color knit motif drafts are in `docs/supplier-art/`. They are original artwork drafts. Product imaging and print proofs remain pending. Masonboro Inlet Study is an interpretive aerial composition, with Wrightsville Beach to the northeast, Masonboro Island to the southwest and the Atlantic to the east. Carolina Beach Dunes depicts coastal sandhill habitat near the river. Kure Pier Morning and Cape Fear Waterfront use simplified structures and need visual comparison with site references before a customer-facing proof. Export the artwork at the dimensions of the supplier-selected region. [US Army Corps inlet survey](https://eft.usace.army.mil/saw-nav/INLETS/MASONBORO/INLET/Masonboro_Inlet.pdf) [NC DEQ Masonboro Island Reserve](https://www.deq.nc.gov/about/divisions/nc-coastal-reserve/reserve-sites/masonboro-island-reserve) [NC State Parks Carolina Beach ecology](https://www.ncparks.gov/state-parks/carolina-beach-state-park/ecology-history) [Town of Kure Beach pier designation](https://www.townofkurebeach.org/sites/default/files/uploads/government/designation_report.final_draft.for_12.14.20_council.pdf) [Wilmington Riverwalk](https://www.wilmingtonnc.gov/Connect-With-Us/Department-Directory/Parks-Recreation/Riverwalk) [NC DEQ Bald Head Woods Reserve](https://www.deq.nc.gov/about/divisions/nc-coastal-reserve/reserve-sites/bald-head-woods-reserve) [U.S. Coast Guard Old Baldy record](https://www.history.uscg.mil/Browse-by-Topic/Assets/Land/Lighthouses-Light-Stations/Article/2013635/bald-head-lighthouse/)

## Batch operations

- `node tools/supplier-expansion.mjs audit` checks all 40 release records. The CI job fails if a held candidate appears by title in either live catalog or if a listed candidate's images differ from its approved pair. For documented release evidence add all ten criterion scores and their evidence, the five hard-rule reviews and independent blind photography and owner approvals. The minimum product review mean is 9/10 and the individual criterion minimum is 8/10. Each candidate also needs the independent coastal luxury review at 90/100 or higher, documented local references and no hard failures. The independent photography minimum is 8/10. [Coastal Brand Standard](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/COASTAL-BRAND-STANDARD.md) Record exact variant evidence, actual studio photograph and separately reviewed editorial photograph. Store image URLs and content digests in the candidate record. The blind reviewer records the same digests as `independentPhotoReview.lookbookSha256` and `independentPhotoReview.studioSha256`. Once the submission is complete, run `node tools/supplier-expansion.mjs revision "TITLE"`. Record that SHA-256 as `reviewedRevision` in both `coastalBrandReview` and `ownerApproval`. Changes to the evidence reset those approvals. Changing the queue status preserves the revision.
- `node tools/supplier-expansion.mjs fourthwall-templates` refreshes public template details. `fourthwall-audit` authenticates, checks for the current ShoreList tote and reports any candidate title collisions. `fourthwall-drafts FILE` accepts a JSON array with `title`, `file` (PNG), `region`, `colors`, `sizes` and `profitCents` per draft. Provide the existing `FOURTHWALL_API_USERNAME` and `FOURTHWALL_API_PASSWORD` as secret environment variables. Upload and product creation are serial, with explicit hidden visibility. Review any ambiguous create in the merchant catalog before retry. Knit templates and the identified beach towel use the provider's design editor because the respective templates report no backend rendering support. [Fourthwall design product API](https://docs.fourthwall.com/guides/create-design-products)
- The existing non-replacement website section is proposed in draft PR #332. A dedicated collection on the Fourthwall-hosted storefront can use Fourthwall's native collection editor or authenticated collection API once there are approved products. Existing shop and collection items retain their original routes. [Storefront PR](https://github.com/ShoreList/ShoreList/pull/332) [Fourthwall collection guide](https://help.fourthwall.com/create-and-sell-products/how-to-guides/create-a-collection)
- `cj-search TITLE` searches the candidate's keywords against the US warehouse catalog. `cj-quote PID VID ORIGIN ZIP` verifies the exact variant association, cost, warehouse inventory and freight for one piece. Both use the existing `CJ_API_KEY` from the secret environment.
- `cj-draft FILE` accepts `title`, `pid`, `vid`, `origin`, `zip`, `url` (supplier listing), `logistics` (exact service name), `label` (verified variant), `leadDays` (verified fulfillment range), `retailCents`, `shippingCents`, `otherCents` and `paymentFeesCents`. It emits a dormant Direct record and quote evidence for review. A single-unit freight route limits these draft records to one piece. The daily drift check reads CJ warehouse inventory and cost. Fulfillment groups use the configured origin and service. Release still needs inventory handling at the buyer checkout, destination coverage and end-to-end route verification.
- Keep artwork, candidate data and CLI scripts behind the existing deployment rules for `/docs/*` and `/tools/*`. Rollback is a revert of this branch's change. There are no external merchandise writes to unwind.

</details>

## CJ variant and freight procedure

<details>
<summary>Read the repository source</summary>

# CJ variant and shipping review

Use the authenticated session that already returned CJ catalog results. Keep `CJ_API_KEY` in that session's secret environment. These commands read supplier data and create no listings or orders.

## First candidate

Start with Dockside Dry Bag. The owner already ran its US warehouse search successfully. Inspect the public research lead and compare it with the authenticated search results before selecting a variant.

```sh
node tools/supplier-expansion.mjs cj-search "Dockside Dry Bag"
node tools/supplier-expansion.mjs cj-inspect "Dockside Dry Bag"
node tools/supplier-expansion.mjs cj-inspect "Dockside Dry Bag" <CJ_PRODUCT_ID>
node tools/supplier-expansion.mjs cj-coverage <CJ_PRODUCT_ID> <CJ_VARIANT_ID> US 28401 30303 60601 90001 98101
```

Replace the product ID placeholders with the selected CJ search result and use the matching variant ID from inspection. The inspection shows the supplier SKU, variant title, option key and image URL if provided. Verify that the image actually shows the selected color and capacity. Confirm the roll-top closure and capacity. Keep waterproof and flotation claims out of the listing until independently supported.

`cj-coverage` checks one unit, one origin and the supplied ZIPs. It reports CJ-managed stock, variant cost and the available service names, quoted transit times and postage in USD cents. `NO_SERVICE` means CJ returned an empty quote list. `UNKNOWN` means CJ failed to respond successfully or returned no priced service. The command prints partial evidence and exits nonzero if any destination lacks a priced quote. Compare the same fulfillment service across intended regions. Test Alaska or Hawaii separately if considering them. These ZIPs are samples. Checkout and fulfillment must still enforce the supported destinations and service.

Use the existing `cj-draft` command only after selecting the exact product, color and route. Capture the highest observed postage for the pricing review, validate the 15% margin scenario, and follow the ShoreList image, coastal brand and owner approval gates. Keep the draft dormant while checkout and fulfillment remain unverified. [Supplier expansion](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/SUPPLIER-EXPANSION.md) [Coastal brand standard](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/COASTAL-BRAND-STANDARD.md)

## Next leads

1. **Harbor Folding Table**. Its recorded public lead is an aluminum folding table. Verify the exact dimensions, leg locks, load rating and finish.
2. **Harbor Bottle Carrier**. Its recorded public lead is an insulated strap cover. Verify bottle fit, closure and the exact color. Omit insulation-duration claims without evidence.
3. **Coastal Beach Cart**. Verify that the selected model has wide sand wheels and that folded dimensions and freight support the retail price.

All four are research candidates. The stored public product IDs can be inspected with the title alone. New authenticated search matches can be inspected using the explicit product ID. [Public CJ screen](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/CJ-PUBLIC-SCREEN.md)

</details>

## Supporting records

- [Engineering queue](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/CODEX_TASKS.md)
- [Engineering handoff background](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/CODEX_HANDOFF.md)
- [Changelog](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/CHANGELOG.md)
- [SEO keywords](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/SEO-KEYWORDS.md)
- [Wilmington keyword map](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/seo-keyword-map-wilmington.md)
- [Public CJ research leads](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/CJ-PUBLIC-SCREEN.md)
- [Current shop catalog](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/shop-catalog.json)
- [Retired items and reasons](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/retired-items.json)
- [Supplier candidate record](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/supplier-expansion-candidates.json)
- [Supplier development and artwork leads](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/supplier-expansion-development.json)
- [Shop photo evidence ledger](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/docs/shop-photo-review.json)
- [Actual promo timing](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/shop-promo.js)
- [Photo release validation](https://github.com/ShoreList/ShoreList/blob/adae375ec978060c1c79b9a3906e02ba62ad1896/tools/test-shop-photo-release.mjs)
- [GitHub PR for this command center](https://github.com/ShoreList/ShoreList/pull/351)

## Source access

The repository points to older owner-side project documents and a product-pipeline skill that were unavailable in the packaging session. Grok, Claude, and their provider connections need to be verified in their actual sessions. The connector runbook above gives the first authorized checks. Keep this source bundle and its status current in the shared repository.
