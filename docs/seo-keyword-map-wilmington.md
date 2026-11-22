# ShoreList master keyword map: Wilmington NC and the beaches

Prepared 2026-11-22. Scope: downtown Wilmington, Wrightsville Beach, Carolina Beach, Kure Beach and Pleasure Island.

## How to read this file

**Evidence tags**
- VERIFIED: seen on a fetched page or a search result page this session, URL cited.
- ESTIMATE: reasoned from search-result patterns and intent. Not measured.
- UNKNOWN: could not be checked.

**Search volume is UNKNOWN for every keyword below.** No keyword tool (Search Console, Ahrefs, Semrush, Google Keyword Planner) was available, and nothing here is invented. Clusters are ranked by **intent tier** instead:
- T1 = ready to book or buy (highest value, most specific).
- T2 = planning a trip (broad, high traffic, high competition from the official tourism board and aggregators).
- T3 = quick answer (parking, tides, weather, hours). These suit AI answers and featured snippets.

First action for RJ: connect Search Console, then replace the intent ranking with real impressions (see "Blocked on RJ").

## What the search results look like (VERIFIED, by query)

| Query run | What ranks (page types seen) | Source |
|---|---|---|
| things to do in Wilmington NC | Official tourism board, state agency page, Lonely Planet, Frommers, Planetware, Expedia/Orbitz, newspaper listicles ("26 things to do in 2026") | https://www.wilmingtonandbeaches.com/things-to-do/ , https://www.lonelyplanet.com/articles/top-things-to-do-in-wilmington-north-carolina |
| Wilmington NC ghost tours | Booking aggregators (Expedia, Travelocity, AAA TripCanvas) with one page per tour, official tourism blog, local TV | https://www.aaa.com/tripcanvas/thing-to-do/ghost-walk-of-old-wilmington-haunted-tour-5669481P4 |
| Wilmington NC events this weekend | Newspaper weekly roundups ("things to do this weekend"), Eventbrite, the official events calendar | https://www.wilmingtonandbeaches.com/events/ , https://www.eventbrite.com/d/nc--wilmington/events--this-weekend/ |
| Wrightsville Beach parking | Town of Wrightsville Beach pages, local TV and newspaper explainers, official tourism blog | https://townofwrightsvillebeach.com/DocumentCenter/View/9941/TOWB-Paid-Parking-Program-Enhancement-News-Release-022026 |
| Carolina Beach Kure Beach Pleasure Island | Fodor's, Marriott travel guide, carolinabeach.com, tourism board island pages | https://www.carolinabeach.com/top-10-things-to-do-in-carolina-beach.html |
| boat rentals / fishing charters Wrightsville | Peer-to-peer boat marketplaces (GetMyBoat, Boatsetter) | https://www.boatsetter.com/boat-rentals/wrightsville-beach--nc--united-states |
| surf lessons / kayak Wrightsville | Official tourism pages by category, AAA TripCanvas, Expedia activity listings | https://wrightsville-beach.wilmingtonandbeaches.com/things-to-do/outdoors-and-recreation/water-experiences/ |

Official tourism board category structure (VERIFIED, https://www.wilmingtonandbeaches.com/things-to-do/): Arts and Culture, Attractions and Historic Sites, Beaches, Downtown Districts, Music and Nightlife, Outdoors and Recreation (watersports, fishing, biking, parks), Seasonal Highlights, Shopping, Spas and Wellness, Tours and Cruises (history, water tours, film and TV sites), Trip Ideas. ShoreList's 22 category pages already line up with most of this.

Events page structure on the official site (VERIFIED, https://www.wilmingtonandbeaches.com/events/): by category plus an "Events this weekend" link. No month pages were seen there, which is a gap ShoreList can fill.

## Rules that shape the map (VERIFIED)

1. **AI search needs no special markup.** Google: "There are no additional requirements to appear in AI Overviews or AI Mode", and "no special schema.org structured data". The page must be indexed and snippet-eligible. https://developers.google.com/search/docs/appearance/ai-features
2. **Google says llms.txt is not needed** for Search, and "doesn't use them". It also says chunking content for AI is not required. Keeping llms.txt is harmless and may help other assistants, but do not expect Google gains. https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
3. **Scaled content is a spam risk.** The same guide warns against generating many pages to manipulate rankings or AI responses. This is why the map only adds new pages where real, sourced local facts exist, and why clone sites must write their own copy.
4. **Local and AI answers lean on Google Business Profile** (same guide). That is an RJ task.
5. **FAQ rich results are gone.** Google's FAQPage documentation says the feature stopped appearing in Search on May 7, 2026. https://developers.google.com/search/docs/appearance/structured-data/faqpage . Keep visible FAQ blocks (they help people and AI answer engines quote a concise answer) and keep the existing FAQPage JSON-LD only where it matches visible text, but do not add more schema for its own sake.

## Existing coverage (read from the repo)

- 22 generated category pages under /things-to-do/<slug> from tools/seo-data.mjs plus a hub, each with unique title, meta, H1, intro, FAQ and BreadcrumbList.
- Town pages: /downtown, /wrightsville-beach, /carolina-beach, /kure-beach.
- Events: /events, /events/this-weekend, one page per area, and 53 dated event pages.
- /where-to-stay, /plan-your-trip, /wilmington-weather (tides inside), /wilmington-nc-faq, /shore-picks, /map, /shop, /gift-guide, /prints, /guides, /surf plus three surf guides.
- No duplicate titles. All indexable pages have canonical, og:image and twitter:card except a few (map, weekly, legal, shore-picks lack twitter:card).

## Gaps found

| Gap | Why it matters | Action |
|---|---|---|
| No parking page (T3, high intent for beach visitors) | Parking questions appear across five FAQ blocks and are a classic AI-answer query | NEW page /wilmington-nc-parking, sourced facts only (done, PR 172) |
| "Pleasure Island" has no page | Combined query for Carolina and Kure Beach | Use as secondary keyword on both town pages now. A dedicated hub needs more verified facts (the island info page fetched did not state boundaries or access). Phase 2 |
| Events by month ("Wilmington NC events in December") | Planning queries, and the official site has no month pages | Phase 2: needs a generator over events-data.json and enough dated events per month to avoid thin pages |
| Boat rentals | T1 query, but ShoreList has no boat rental operator | Do not build a page without an operator (thin page). Mention on fishing, sailboat and jet ski pages |
| Hub and home both target "things to do in Wilmington NC" | Cannibalization | Home = brand and booking marketplace. Hub = browse by activity (title changed in PR 172) |
| Shop pages target brand words only | Souvenir and apparel queries (T1) | Done in PR 172: retitled /shop around "Wilmington NC souvenirs, apparel and beach gear"; answer-first intro |
| Twitter image tag missing on 14 pages | Link previews | Done in PR 172 |
| Sitemap lastmod is hand kept | Stale lastmod is ignored by Google | Tool to refresh from git history, run per deploy |

## Keyword clusters

Format per cluster: primary, secondary and long-tail, intent, target page, title (60 characters or fewer), meta description (155 or fewer), H1, People Also Ask style questions. "New" means the page does not exist yet. Titles marked (now) are already live and kept.

### 1. Master hub: things to do (T2)
- Primary: things to do in Wilmington NC
- Secondary: Wilmington NC activities, Wilmington NC attractions, things to do in Wilmington NC and the beaches, what to do in Wilmington NC
- Long-tail: things to do in Wilmington NC this weekend, fun things to do in Wilmington NC for couples, things to do in Wilmington NC with kids, free things to do in Wilmington NC, rainy day things to do Wilmington NC
- Intent: planning. Competition: tourism board, Lonely Planet, listicles (VERIFIED above). ShoreList angle: bookable, live conditions.
- Target: / (brand and booking) and /things-to-do (browse by activity)
- Home title (now): Things to Do in Wilmington, NC & the Beaches | ShoreList
- Hub title (new): Wilmington NC Activities: Tours, Rentals & Water Sports
- Hub meta: Browse Wilmington, NC activities by type: ghost tours, kayaking, surf lessons, fishing charters, museums and rentals at the beaches. Book local tours on ShoreList.
- H1 (now): Things to Do in Wilmington, NC & the Beaches
- PAA: What are the top things to do in Wilmington NC? What is Wilmington NC known for? Is Wilmington NC worth visiting? What is there to do in Wilmington NC on a rainy day? Is Wilmington NC kid friendly?

### 2. Ghost tours (T1)
- Primary: Wilmington NC ghost tours
- Secondary: haunted tours Wilmington NC, Wilmington ghost walk, haunted Wilmington NC
- Long-tail: best ghost tour in Wilmington NC, Wilmington NC ghost tour at night, ghost tours downtown Wilmington NC for kids, Wilmington NC haunted history walking tour, Wilmington NC ghost tour near the Riverwalk
- Target: /things-to-do/ghost-tours
- Title (now): Ghost Tours in Wilmington, NC | Haunted Walks Downtown
- Meta (now): Ghost tours in Wilmington, NC: lantern-lit walks through the haunted historic district downtown. See what is bookable on ShoreList and plan your night.
- H1 (now): Ghost Tours in Wilmington, NC
- PAA: Where do Wilmington ghost tours take place? Are ghost tours good for kids? How long is a ghost tour in Wilmington? Is Wilmington NC haunted? What is the most haunted place in Wilmington NC?

### 3. Walking and history tours (T1)
- Primary: Wilmington NC walking tours
- Secondary: Wilmington NC history tours, historic district tour Wilmington NC, Wilmington NC guided tours
- Long-tail: Wilmington NC historic walking tour, downtown Wilmington NC architecture tour, Wilmington NC Civil War history tour
- Target: /things-to-do/walking-tours
- Title (now): Wilmington, NC Walking Tours | History & Architecture
- H1 (now): Walking & History Tours in Wilmington, NC
- PAA: How long is a walking tour of downtown Wilmington? What should I bring on a walking tour? Is downtown Wilmington walkable? What is the historic district of Wilmington NC?

### 4. Film and TV location tours (T1)
- Primary: Wilmington NC film location tours
- Secondary: One Tree Hill tour Wilmington NC, Dawson's Creek filming locations Wilmington, Wilmington NC movie tour
- Target: /things-to-do/film-tours
- Title (now): Wilmington, NC Film & TV Location Tours | One Tree Hill
- PAA: What was filmed in Wilmington NC? Can you visit filming locations on your own? Where was One Tree Hill filmed?

### 5. Museums and attractions (T2)
- Primary: Wilmington NC museums
- Secondary: museums in Wilmington NC, Wilmington Railroad Museum, Battleship North Carolina, Fort Fisher
- Long-tail: indoor things to do in Wilmington NC, rainy day Wilmington NC
- Target: /things-to-do/museums (the Railroad Museum page is noindex until the partnership clears; do not promote it)
- Title (now): Wilmington, NC Museums & Attractions | Tickets & Hours
- PAA: What is there to do in Wilmington NC on a rainy day? Are Wilmington museums good for young children?

### 6. Kayak tours (T1)
- Primary: kayak tours Wilmington NC
- Secondary: Wrightsville Beach kayak, Masonboro Island kayak tour, kayak rentals Wilmington NC
- Long-tail: sunset kayak tour Wilmington NC, guided kayak tour Wrightsville Beach, kayaking Carolina Beach
- Target: /things-to-do/kayak-tours
- Title (now): Kayak Tours in Wilmington & Wrightsville Beach, NC
- PAA: Do I need experience for a guided kayak tour? When is the best time to kayak near Wilmington? Can you kayak to Masonboro Island?

### 7. Surf lessons (T1)
- Primary: surf lessons Wrightsville Beach NC
- Secondary: Wilmington NC surf lessons, learn to surf Carolina Beach, surf school Wrightsville Beach, surf report Wrightsville Beach
- Long-tail: beginner surf lessons Wrightsville Beach, private surf lesson Wilmington NC, is Wrightsville Beach good for beginner surfers
- Target: /things-to-do/surf-lessons (lessons) and /surf (live surf check and guides)
- Title (now): Surf Lessons in Wrightsville Beach & Carolina Beach, NC
- PAA: Is Wrightsville Beach good for beginner surfers? What is the best time of year for surf lessons in North Carolina? What should I bring to a surf lesson?

### 8. Paddleboard (T1)
- Primary: paddleboard rentals Wrightsville Beach
- Secondary: SUP Wilmington NC, stand up paddleboard tours Wilmington NC, paddleboard lessons
- Target: /things-to-do/paddleboard
- Title (now): Paddleboarding in Wrightsville Beach, NC | SUP Rentals
- PAA: Where is the calmest water for paddleboarding near Wilmington? Can beginners paddleboard here?

### 9. Fishing charters (T1)
- Primary: fishing charters Wilmington NC
- Secondary: Carolina Beach fishing charters, Wrightsville Beach fishing charters, inshore fishing Wilmington NC, offshore fishing Wilmington NC, Kure Beach fishing pier
- Long-tail: half day fishing charter Carolina Beach, family fishing charter Wilmington NC, do I need a fishing license on a charter in NC
- Target: /things-to-do/fishing-charters
- Title (now): Fishing Charters in Wilmington & Carolina Beach, NC
- PAA: Inshore or offshore, which fishing charter should I book? Do I need a fishing license on a charter? What fish can you catch near Wilmington NC?
- Competitor note: the "boat rentals" and "charters" SERP is owned by peer-to-peer marketplaces (VERIFIED above), so a local, plain-language guide is the angle.

### 10. River cruises and sailing (T1)
- Primary: Cape Fear River cruises Wilmington NC
- Secondary: sunset cruise Wilmington NC, Wilmington NC riverboat, sailboat rides Wrightsville Beach, sunset sail Wrightsville Beach
- Target: /things-to-do/river-cruises and /things-to-do/sailboat-rides
- Titles (now): Cape Fear River Cruises in Wilmington, NC | Sunset Cruises and Sailboat Rides & Sunset Sails in Wrightsville Beach, NC
- PAA: Where do Wilmington river cruises leave from? What is the best time for a river cruise? How many people fit on a private sailing charter?

### 11. Boat rentals (T1, no inventory)
- Primary: boat rentals Wilmington NC
- Secondary: pontoon boat rental Wrightsville Beach, jet ski rentals Carolina Beach
- Target: no page. Jet ski is covered by /things-to-do/jet-ski-rentals. Do not create a boat rental page until an operator is signed (thin page risk).
- Status: UNKNOWN whether any local operator wants to list. Needs RJ outreach.

### 12. Jet skis, bikes, golf carts, scooters (T1)
- Primary: golf cart rentals Carolina Beach
- Secondary: e-bike rentals Wilmington NC, jet ski rentals Wrightsville Beach, scooter rentals Carolina Beach, fat tire bike rentals Kure Beach, bike tours Wilmington NC
- Targets (now): /things-to-do/golf-cart-rentals, /ebike-rentals, /jet-ski-rentals, /scooter-rentals, /fat-bike-rentals, /bike-tours
- PAA: Are golf carts street legal in Carolina Beach? Do I need a license to ride an e-bike in North Carolina? Do I need a boating license to rent a jet ski in NC?

### 13. Dolphin, wildlife, nature (T1 and T2)
- Primary: dolphin tours Wilmington NC
- Secondary: dolphin watching Wrightsville Beach, Venus flytrap Carolina Beach State Park, sea turtle nesting Wilmington NC, nature walks Wilmington NC
- Targets (now): /things-to-do/wildlife-tours, /things-to-do/nature-walks
- PAA: Can you see dolphins near Wilmington NC? Where can I see wild Venus flytraps? When do sea turtles nest on the local beaches?

### 14. Beach day services (T1)
- Primary: beach chair and umbrella rentals Wilmington NC
- Secondary: beach picnic Wrightsville Beach, beach photographers Wilmington NC, beach yoga Wilmington NC
- Targets (now): /things-to-do/beach-chairs, /beach-picnics, /beach-photography, /wellness
- PAA: Are tents and canopies allowed on the beach? What should we wear for beach family photos? Is alcohol allowed on the beaches near Wilmington?

### 15. Town and beach guides (T2)
| Page | Primary | Secondary and long-tail | Title (now unless marked) | H1 (now) |
|---|---|---|---|---|
| /downtown | downtown Wilmington NC | Wilmington Riverwalk, historic district Wilmington NC, things to do downtown Wilmington | Downtown Wilmington, NC: Things to Do & Tours \| ShoreList | Downtown Wilmington, NC |
| /wrightsville-beach | Wrightsville Beach NC | things to do in Wrightsville Beach, Wrightsville Beach activities, Masonboro Island, Wrightsville Beach with kids | Wrightsville Beach, NC: Things to Do & Surf Guide \| ShoreList | Wrightsville Beach, NC |
| /carolina-beach | Carolina Beach NC | things to do in Carolina Beach, Carolina Beach boardwalk, Carolina Beach State Park, Pleasure Island NC | Carolina Beach, NC: Things to Do & Local Guide \| ShoreList (new: add Pleasure Island in meta) | Carolina Beach, NC |
| /kure-beach | Kure Beach NC | things to do in Kure Beach, Kure Beach pier, Fort Fisher, Pleasure Island NC | Kure Beach, NC: Things to Do & Fort Fisher Guide \| ShoreList | Kure Beach, NC |
- Intent: planning. PAA per town: Is Wrightsville Beach worth visiting? What is Carolina Beach known for? Is Kure Beach quiet? What is the difference between Carolina Beach and Kure Beach? Which beach is closest to downtown Wilmington? (answers: from /plan-your-trip distances, already published.)
- Pleasure Island (ESTIMATE intent: T2 planning, combined search for the two southern towns). Secondary keyword on both pages now. Future hub: /pleasure-island once boundaries, access and ferry facts are verified from official sources.

### 16. Events (T2 and T3)
- Primary: Wilmington NC events
- Secondary: events in Wilmington NC this weekend, things to do in Wilmington NC this weekend, Wilmington NC events December, Wilmington NC festivals, Wilmington NC concerts
- Long-tail: Wilmington NC Christmas events, Wilmington NC holiday events, Carolina Beach events this weekend, Kure Beach events, Wrightsville Beach events, free events Wilmington NC
- Targets (now): /events, /events/this-weekend, /events/downtown-wilmington, /events/wrightsville-beach, /events/carolina-beach, /events/kure-beach, plus event pages
- Title /events (now): Wilmington, NC Events: Concerts, Festivals & More | ShoreList
- Intent: freshness. Newspapers publish a weekly roundup (VERIFIED above), so keep dateModified and the visible "updated" stamp truthful.
- Gap: month and season pages (events in December, Christmas events). Phase 2.
- PAA: What is happening in Wilmington NC this weekend? Are there Christmas events in Wilmington NC? Is there a tree lighting in downtown Wilmington? What festivals are in Wilmington NC?

### 17. Where to stay (T2)
- Primary: where to stay in Wilmington NC
- Secondary: best area to stay in Wilmington NC, downtown Wilmington vs Wrightsville Beach, where to stay in Carolina Beach, Kure Beach lodging
- Target: /where-to-stay. No hotel affiliate links (needs RJ).
- Title (now): Where to Stay in Wilmington, NC: Best Areas & Beaches | ShoreList (69 chars, trim to: Where to Stay in Wilmington, NC: Best Areas & Beaches)
- PAA: Should I stay downtown or at the beach? What is the best area to stay in Wilmington NC? Where should families stay near Wilmington NC?

### 18. Parking, getting around (T3, new)
- Primary: parking in Wilmington NC
- Secondary: Wrightsville Beach parking, Carolina Beach parking, Kure Beach parking, downtown Wilmington parking decks, Wilmington NC parking meters
- Long-tail: is parking free at Wrightsville Beach, Wrightsville Beach paid parking season, where to park near the Wilmington Riverwalk
- Target: NEW /wilmington-nc-parking
- Title: Parking in Wilmington, NC: Downtown Decks & Beach Lots
- Meta: Where to park in downtown Wilmington, NC and at Wrightsville, Carolina and Kure Beach: deck locations, meter hours and paid beach season dates, with official links.
- H1: Parking in Wilmington, NC and at the Beaches
- Verified facts to use:
  - Downtown decks: Skyline Deck 155 Brunswick St, Convention Center Deck (N. Water St and Estell Lee Dr), River Place Deck 14 Grace St, 2nd Street Deck 114 N. 2nd St, Market Street Deck 115 Market St. Meters enforced Monday to Saturday 9 a.m. to 6:30 p.m., free after 6:30 p.m. and all day Sunday. https://www.wilmingtonnc.gov/Services/Parking (VERIFIED, fetched 2026-11-22)
  - City approved a one-year paid-parking pilot on 11 downtown residential blocks starting Jan. 1, 2027. https://wect.com/2026/11/18/wilmington-approves-downtown-parking-pilot-with-7-hourly-rate-residential-blocks/ (VERIFIED)
  - Wrightsville Beach: paid parking enforced daily March 1 to Oct. 31, 9 a.m. to 7 p.m., some locations to 8 p.m., pay stations or Text2Park, more than 1,600 metered spaces. Beach accesses 2, 3, 4 and 8 (north), 34, 36 and 44 (south). https://wrightsville-beach.wilmingtonandbeaches.com/blog/post/parking-in-wrightsville-beach/ (VERIFIED, page dated Feb. 4, 2025, so say "as published in 2025" and link the town)
  - 2026 seasons: Carolina Beach March 1 to Oct. 31, 9 a.m. to 8 p.m.; Kure Beach March 15 to Sept. 30, 8 a.m. to 6 p.m. https://www.aol.com/articles/guide-beach-parking-rates-enforcement-090908784.html and https://www.wect.com/2026/03/01/paid-parking-begins-many-new-hanover-county-beaches-sunday/ (VERIFIED for 2026, both secondary news sources)
  - Rates are deliberately left out. They change yearly and the sources are secondary. Link the towns.
- PAA: Is parking free at Wrightsville Beach? When does paid parking start at the NC beaches? Where do I park for the Wilmington Riverwalk? Are Wilmington parking meters free on Sunday? Is there free parking in downtown Wilmington?

### 19. Weather, tides, conditions (T3)
- Primary: Wilmington NC weather
- Secondary: Wrightsville Beach tide chart, Carolina Beach tides, Wrightsville Beach surf report, Wilmington NC water temperature, Wrightsville Beach weather
- Target: /wilmington-weather
- Title (new): Wilmington, NC Weather, Tides & Beach Report | ShoreList
- Title (now): Wilmington, NC Weather: Live Forecast & Beach Conditions
- Meta (now, good): Live Wilmington, NC weather: current conditions, hourly and 7-day forecast, plus Wrightsville, Carolina and Kure Beach surf, tides and water temperature.
- PAA: What is the weather in Wilmington NC right now? What is the water temperature at Wrightsville Beach? When is high tide at Wrightsville Beach? When is hurricane season in North Carolina?

### 20. Visitor questions and trip planning (T2, T3)
- /plan-your-trip: primary plan a trip to Wilmington NC; secondary Wilmington NC itinerary, 3 days in Wilmington NC, best time to visit Wilmington NC. Title (now): Plan a Trip to Wilmington, NC & the Beaches | ShoreList
- /wilmington-nc-faq: primary Wilmington NC visitor questions; secondary is Wilmington NC safe, do you need a car in Wilmington NC. Title (now) good.
- /shore-picks: primary best restaurants in Wilmington NC; secondary Wrightsville Beach restaurants, Carolina Beach restaurants, coffee shops Wilmington NC. Title (now): Best Restaurants, Coffee & Bars in Wilmington, NC | Shore Picks (67 chars, trim in a later pass).
- /map: primary Wilmington NC map; title (now) fine.
- PAA: How many days do you need in Wilmington? Which airport do you fly into for Wilmington NC? Do you need a car in Wilmington NC? When is hurricane season?

### 21. Coastal gear, souvenirs, apparel (T1)
- Primary: Wilmington NC souvenirs
- Secondary: Wrightsville Beach shirts, Carolina Beach t-shirts, Kure Beach souvenirs, Wilmington NC gifts, NC beach hats and caps, Wilmington NC art prints, Wrightsville Beach Christmas ornament
- Long-tail: embroidered crewneck Wrightsville Beach, Kure Beach blue crab cap, Wilmington NC gift guide, USS North Carolina art print, beach towel Carolina coast
- Targets: /shop (primary), /gift-guide (gifts), /prints (instant download posters), product and collection anchors on /shop
- Title /shop (new): Wilmington, NC Souvenirs, Apparel & Beach Gear | ShoreList Shop
- Title (now): The ShoreList Shop | Coastal Carolina Gear and Beach Goods
- Meta (new): Wilmington, NC souvenirs and apparel: embroidered crewnecks and caps for Wrightsville and Kure Beach, art prints, towels and coolers. Designed locally, made to order.
- H1 (now, keep as brand voice): Coastal Carolina, one small mark at a time. Add an answer-first line under it naming Wilmington and the beach towns.
- Rule: do not change prices. Structured data stays Product only where the page truly lists a single product with a price (product pages are on the shop host).
- PAA: What souvenirs can I buy in Wilmington NC? Where can I buy Wrightsville Beach apparel online? What is a good gift from Wilmington NC? Do ShoreList items ship?

## Cross-page linking plan (hub and spoke)

- Home -> /things-to-do (hub), 4 town pages, /events/this-weekend, /where-to-stay, /wilmington-nc-parking, /shop.
- /things-to-do hub -> all 22 categories with descriptive anchors (done) plus parking in the "Plan around it" tiles.
- Each category -> hub, related categories (done), nearest town page, weather, parking where a FAQ mentions it (done in 5 FAQs; replace the repeated FAQ answer with a link to the parking page).
- Each town page -> its events page, its categories, parking page, where to stay.
- /plan-your-trip -> parking in "Getting here and getting around".
- Shop -> town pages (product names carry the town), gift guide, prints.
- Use the target keyword as the visible anchor ("Wilmington ghost tours", "parking in Wilmington"), not "click here" or "learn more".

## Blocked on RJ (not guessed)

1. Google Search Console: verify the domain property and submit https://shorelist.net/sitemap.xml. Needs a DNS TXT record or HTML tag from RJ. Then replace the intent ranking in this file with real queries and impressions.
2. Bing Webmaster Tools: verify and submit the sitemap. Bing feeds Copilot and is a main source for several AI search products (ESTIMATE). An IndexNow workflow already exists in .github/workflows/indexnow.yml and needs its key file and secret confirmed.
3. Google Business Profile: create or claim ShoreList LLC (service-area business, Wilmington NC). Needs RJ's verification.
4. Google Merchant Center for the shop feed (product visibility in AI shopping answers). Needs RJ's store account. Do not touch Shopify admin from here.
5. GA4: a measurement ID (G-EN91RH3PZV) is already in the pages; confirm it is the right property and link GA4 to Search Console. No new IDs were added.
6. Affiliate links for lodging or boat rentals: none added. RJ to decide on partners.
7. Real reviews: none shown. When RJ has booking-backed reviews, add Review markup then, not before.
8. Operators for boat rentals, and any named operator for new categories.
9. Verify ownership of the sitemap submission in Perplexity or ChatGPT: neither has a webmaster console, so nothing is needed beyond robots.txt allowing OAI-SearchBot, PerplexityBot and Google-Extended (already allowed).
