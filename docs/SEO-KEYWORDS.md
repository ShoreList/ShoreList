# SEO keyword method

How ShoreList decides what each page targets, and how a new city site reuses the method.

Files:
- `tools/keyword-config.json`: the keyword template for one city. Variables (city, state, beaches), title and meta rules, keyword patterns per cluster, and the page list with a primary keyword and place for each.
- `tools/check-keywords.mjs`: the gate. Runs in CI after `check-site`. `--report` prints candidate keywords from the patterns for human review.
- `docs/seo-keyword-map-wilmington.md`: the researched map for Wilmington (clusters, titles, metas, H1s, FAQ questions, gaps, what is blocked on the owner).

## Principles

1. **People first.** One page, one job. A page targets one primary keyword in its title and H1, and the place name appears where a searcher expects it. Variants appear naturally in the body. No keyword lists, no repeated phrases.
2. **Intent tiers instead of invented volume.** Until Search Console has data, rank clusters as T1 (ready to book or buy), T2 (planning a trip) or T3 (quick answer such as parking, tides, weather). Never write a search volume that was not measured.
3. **Hub and spoke.** City hub, town pages and activity pages link to each other with descriptive anchors (for example "ghost tours in Wilmington", not "click here").
4. **Answer first.** Each key page opens with a plain answer in the first paragraph, then detail, then a visible FAQ. FAQ answers use only facts that were checked and are sourced on the page. FAQ rich results no longer show in Google Search (documented by Google), so the FAQ exists for readers and for AI answer engines.
5. **AI search needs the same basics as search.** Google states there is no special markup or file for AI Overviews or AI Mode: the page must be crawlable, indexed and snippet eligible, and structured data must match visible text. `llms.txt` and `llms-full.txt` are kept for other assistants, but Google says it does not use them.
6. **No scaled pages.** Do not add a page for a keyword unless there is real, sourced local content or a live operator behind it. This is Google's scaled content abuse policy and the rule in `city-pack/CLONING.md`.
7. **Structured data only where the page supports it.** Organization and WebSite on the home page, BreadcrumbList and Article or CollectionPage on guides, Event on dated events, TouristTrip and Offer only for a bookable listing with a price, FAQPage only when the same Q and A is visible. No ratings or reviews unless they come from real bookings.

## Page rules the gate enforces

For every page listed in the config:
- Title is 25 to 62 characters, unique, no em or en dash.
- Meta description is 70 to 165 characters, unique, no em or en dash.
- H1 is present and unique.
- Canonical equals the page URL.
- The primary keyword is in the title or H1, and one place term (city, beach or state) is in the title, H1 or description.

Everything else (copy, FAQ, JSON-LD) is reviewed by a person. Titles and metas are written, not generated, because generated patterns across 100 sites read as doorway pages.

## Add or change a page

1. Add an entry to `pages` in the keyword config: `url`, `cluster`, `tier`, `primary`, `geo` (and `also` if a second term must appear).
2. Write the title, meta description and H1 in the page's generator (`tools/seo-data.mjs` for activity pages, `tools/build-seo-pages.mjs` for the hub, trip and parking pages, the page itself for hand-kept pages). Never edit generated files by hand.
3. Rebuild: `node tools/build-seo-pages.mjs`, `node tools/build-search-index.mjs`, `node tools/build-llms.mjs`.
4. Add the URL to `sitemap.xml`, then run `node tools/update-sitemap-lastmod.mjs` (full clone) so `lastmod` follows the page's last real change, link it from its hub, and add a line to `llms.txt`.
5. Run `node tools/check-site.mjs` and `node tools/check-keywords.mjs`, bump `VERSION` in `sw.js`, open a small PR.

## Clone checklist for a new city (about 100 planned)

1. Copy `tools/keyword-config.json` to `city-pack/<id>/keywords.json`.
2. Change `vars` (city, state, island or region name, beaches or neighborhoods) and rewrite `pages` for the pages that city will actually have. Delete clusters with no operator or content.
3. Research the city's real queries with a keyword tool or Search Console, tag each cluster T1, T2 or T3, and write the map in the same format as `docs/seo-keyword-map-wilmington.md`. Cite the sources of every fact used in FAQ answers.
4. Write every title, meta description, H1, intro and FAQ fresh for that city. Do not noun swap Wilmington copy.
5. Run `node tools/check-keywords.mjs --config city-pack/<id>/keywords.json --site https://<domain>` against that city's build. Run `--report` for candidate long-tail phrases to review.
6. Set up the off-site accounts per site, because none can be shared: Google Search Console, Bing Webmaster Tools, Google Business Profile, and its own analytics property.

## Off-site items that need the owner

Search Console and Bing Webmaster verification, Google Business Profile, Merchant Center for the shop feed, GA4 property confirmation, and any affiliate programs. None are guessed or added by code.
