# Coastal motif development and conversion integration

2026-11-28. Internal research only. Binding authority: docs/command-center/SHORELIST-STANDARDS.md and RELEASE_GATES.md. This packet adds no sellable listings, does not replace the canonical supplier queue, and is not approval to purchase samples. Add candidates to the queue only after the concurrent development PRs are reconciled.

## Motif capsule

VERIFIED: current shop-catalog.json already contains printed scallop shell crewneck, tee, tote and mug, plus crab, pelican and sea oats merchandise. Do not duplicate those products. Distinguish the new proposals through actual woven knit construction or precise embroidery. Jellyfish is absent from the current main-shop title scan. Fourthwall merchant inventory reconciliation remains UNKNOWN.

Supplier evidence, checked 2026-11-28:
- Knitwise K01 classic fit, cotton/polyester jacquard, four yarn colors, S–2XL, $38 public base: https://products.fourthwall.com/knitted-crewneck-sweater-classic-fit
- Knitwise K30 and K08 are existing supplier-plan options; verify exact live variant and template before release: https://products.fourthwall.com/category/sweaters-f0f8f
- SOL'S 11362 embroidered polo, 6.2 oz combed ring-spun cotton, classic fit, from $19.85: https://products.fourthwall.com/sols-unisex-premium-pique-polo-shirt-embroidery . Public reviews report sizing concerns; embroidery and fit must be sampled. No approval based on supplier title alone.

Local references (facts for original drawings, not permission to copy images):
- NC Sea Grant jellyfish: https://ncseagrant.ncsu.edu/coastwatch/naturalists-notebook-the-rise-of-the-jellies/
- Bald Head Island Conservancy cannonball anatomy: https://bhic.org/true-jellies/
- NC Sea Grant shell reference: https://ncseagrant.ncsu.edu/coastwatch/summer-2024-seashells-of-north-carolina/
- NC coast moon jelly morphology: https://coastalreview.org/2020/12/strange-beauty-jellyfish-of-the-nc-coast/

All names and colors below are HYPOTHESIS, not inventory. Supplier blank availability and decoration areas are in the checkpoint below. Exact thread and yarn colors remain unverified. Use original design files; no borrowed logos, no circles or badge frames, no invented coordinates, no grey. Proposed stitch sizes are targets, not verified factory specifications.

| Priority | Draft concept | Method / candidate | Original design direction | Blocking proof |
|---|---|---|---|---|
| P1 | Moon Jelly Knit Crewneck | K01 | Deep tidal navy base, oyster bell, muted sea-glass details, four internal horseshoe shapes and short marginal tentacles. No circular frame or text. Up to four yarn colors including base and trim. | Knit template proof at each size; species and artwork review. |
| P1 | Cannonball Jelly Embroidered Polo | SOL'S 11362 | Oyster body, muted chestnut rim, dark tidal blue contour. Rounded bell and compact oral arms, never long decorative tentacles. Left chest small mark. | Exact thread palette, stitch-out and fit test; reject poor collar/length. |
| P1 | Scallop Shell Knit Crewneck | K01 | Oyster base, washed blue and muted coral ribbed shell fan, straight hinge, generous negative space. No shell collection claims. | Identify species and local range before naming; knit proof; distinct from printed scallop listings. |
| P2 | Coquina Embroidered Polo | SOL'S 11362 | Two asymmetrical small coquina valves, restrained coral and ivory with navy contour. No lettering. | Document species morphology and location from authoritative field guide; stitch proof. |
| P2 | Whelk Knit Quarter Zip | K30 | Navy body, shell in cream with one shadow color. Preserve spiral, aperture and siphonal canal. Clear zipper and placket. | Exact whelk species, template colors, seam clearance, sample. |
| P2 | Sea Oats Knit Cardigan | K08 | Cream ground, muted gold and olive stems, no badge, no depiction of picking or dune disturbance. | Botanical source, template and yarn proof, exact variant. |

No scores assigned. Require all five independent 90/100 categories, ten prior product criteria and blind photo review, original rights and labeling/safety evidence, true studio photo, verified costs, shipping and checkout. No AI-generated lifestyle scene represented as photography. No public offer until exact version clears gates.

## Exact template checkpoint, November 28

Fourthwall's public template API returned the following available blank options. These are supplier template prices before freight and fees. A template variant ID does not identify a ShoreList offer or a purchasable product.

| Candidate | Blank and public variant | Decoration and next proof |
|---|---|---|
| Cannonball Jelly Embroidered Polo | SOL'S 11362 in White. Medium template variant `prv_Mf1QsgY_TLi6NRL7wa7vwg`. S through 5XL returned available, $19.85 through XL, $21.95 through $27.95 for 2XL through 5XL. | `embroidery_chest_left`, 4 × 4 in upload area, 600 × 600 px at 150 dpi. The artwork can occupy a smaller area within the canvas. White is the blank's supplier name. Use an original compact cannonball silhouette and inspect the proof at actual size. |
| Coquina Embroidered Polo | SOL'S 11362 in Navy. Medium template variant `prv_yT9BziQwTSGEbIHQpjCq7w`. Same public size range and pricing as White. | Same left-chest area. Keep the two shell shapes readable without outlines so thin that they disappear into the knit. Verify species and finish before grading. |
| Moon Jelly and Scallop Shell Knit Crewnecks | Classic Fit knit template, S through 2XL, $38 each. | Default panel 1,150 × 1,350 px. The API shows a generic Knitted option with no public yarn palette or backend rendering. Confirm palette and motif placement in the editor. |
| Whelk Knit Quarter Zip | Unisex knit quarter zip template, 2XS through 3XL, $42 each. | Default panel 1,100 × 1,360 px. Confirm actual placket clearance and yarn colors in the editor. |
| Sea Oats Knit Cardigan | Pocketless knit cardigan template, S through 2XL, $42 each. | Default panel 1,250 × 1,300 px. Confirm front-panel placement and the yarn palette in the editor. |

Sources: [polo](https://api.fourthwall.com/open-api/v1.0/product-templates/pro_STPsbnZuTlyjzeJPJKtufg), [crewneck](https://api.fourthwall.com/open-api/v1.0/product-templates/pro_quHTYBtVRFqTh6ODh8g9Bw), [quarter zip](https://api.fourthwall.com/open-api/v1.0/product-templates/pro_9IEPqxSWRWm_pCsJTuFTbQ), [cardigan](https://api.fourthwall.com/open-api/v1.0/product-templates/pro_jxzU4X9-SpuG6MnU0DDPIg).

The [public ShoreList catalog](https://shorelist.net/shop-catalog.json) returned four printed scallop products and no matching coquina or jellyfish titles. The [public Fourthwall collection](https://shorelist-shop.fourthwall.com/collections/all) showed no matching shell or jellyfish slug. Private offer collisions remain unverified. The proposed pieces have no verified public purchase path, stitch or knit proofs, sellable image pairs, or independent scores.

CJ Shopify readback: the $109 mint-stripe chair (`CJLY36122900001`) and $99 tilt umbrella (`CJZS31328570001`) both remain drafts. Shopify reports 80 and 69 units respectively and places both under CJ fulfillment while displaying Printify as their vendor. Treat those quantities as Shopify inventory counts only. The chair remains the stronger candidate on visual fit. CJ warehouse stock, freight, landed cost and fulfillment remain unverified. The [Dockside Dry Bag supplier lead](https://cjdropshipping.com/product/waterproof-outdoor-travel-bag-p-51ECEA1A-F85A-48D9-BE5B-0AFEE6402E5C.html) reached a human-verification page. Continue from the existing [variant review](CJ-VARIANT-REVIEW.md) when authenticated evidence is available.

## Uploaded conversion blueprint: implementation reconciliation

The proposed seven-module architecture assumes Shopify Liquid owns shorelist.net, but AGENTS.md and source files establish a static Netlify site with Shopify cart permalinks and separate Fourthwall checkout. Preserve the existing stack. Treat 95+ mobile Lighthouse and CLS below 0.05 as target, not achieved fact. Sub-100ms and model response figures are unverified targets. New recurring software overhead target is $0; existing subscriptions are not zero. Do not buy under-$10 assets without approval.

| Blueprint module | Adapted implementation | Current evidence / next gate |
|---|---|---|
| Speed and discovery | Measure existing static pages; avoid checkout/account prefetch. Maintain generated llms.txt, sitemap and JSON-LD. | VERIFIED llms.txt exists; no invented AggregateRating or LocalBusiness eligibility; improve actual LCP. |
| Cart | Preserve shop-cart.js and provider boundaries. Test cart and sticky add actions with verified variants. | VERIFIED existing cart uses Shopify permalinks. Do not promise free shipping, gifts, US manufacture or 30-day exchanges without terms and margin approval. |
| Search and concierge | Extend existing offline Tidebot matching before adding dependencies. Optional server reranking validates IDs, budgets and prices. | VERIFIED shop-bot.js and Netlify function exist. Audit failure UX and prompt injection; no new paid model use or unsupported recommendation. |
| Weather | Reuse or evaluate NWS public API with caching, attribution and stale fallback. | VERIFIED Open-Meteo hosted free API excludes commercial use: https://open-meteo.com/en/terms ; NWS API data is free for any purpose: https://www.weather.gov/documentation/services-web-api . No new commercial Open-Meteo integration. |
| Map | Check current local discovery maps first; optional low-cost accessible static list fallback, factual locations. | MapLibre/provider terms, tile limits and performance UNKNOWN; do not add external services prematurely. |
| Lookbook | Use exact product IDs, genuine studio reference, disclosed AI styling and non-overlapping accessible hotspots. | Hold until image pair and independent score meet release rules; no 3D/AR without accurate model. |
| Messaging and workflows | Draft only; verify native Shopify availability and consent before any activation. | No invented reviews, no email sent, no unapproved discount/checkout policy. |

CI evidence from PR 412, GitHub Actions run 46113898925: supplier checks passed; site check 151 pages / 92 products passed; keyword job 140883274215 failed shop title length (63 vs 62) and missing primary keyword souvenirs; speed job 140883273952 measured shop mobile 88, LCP 3.1s, CLS 0.001, accessibility/SEO/best practices 100. Existing hero-copy work may overlap, coordinate instead of editing shop.html or keyword policy. Do not lower thresholds to force a merge. PR 413 also failed site-check while supplier checks passed.

Next engineering action: reconcile active hero/keyword work, rebase the two supplier PRs after upstream resolution, run all required tests, then review candidate artwork/physical samples. No changes to storefront or prices in this packet.
