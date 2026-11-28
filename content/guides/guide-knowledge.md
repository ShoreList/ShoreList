# ShoreList guide knowledge base (Wrighty, Shelby, Captain Cape)

Built Nov 27 2026 (ET) for the three site chat guides. Every fact line ends with a source URL. Labels: **[V]** = read on the source page during this study; **[3P]** = third-party blog, listing or aggregator (use "according to ..." and never as the only basis for a price, hour or date); **[SL]** = ShoreList's own page (our editorial or our product data); **UNVERIFIED** = do not state as fact, say "check the organizer."

Already-sourced facts are NOT repeated here. Read them in `/workspace/shorelist/content/local-facts.md` (called **LF**): parking rates and seasons for all four places, Wrightsville beach accesses and ADA list, Carolina Beach and Kure Beach access, history dates for incorporation, each town's annual events, Freeman Park, Riverwalk, Azalea Festival, spring break dates and the UNVERIFIED log. Where this file needs one of those, it points to "LF > section."

Time rule for the bots: the live events list is `https://shorelist.net/events-data.json` (76 events when crawled Nov 27, updated Nov 26). Never quote an event, date, price or time from the static "Seasonal highlights" boxes on town pages. They are stale (see section 0).

---

## 0. Conflicts and stale items: do NOT repeat these

| Item | What the bots must say instead | Evidence |
| --- | --- | --- |
| Wilmington Riverfest "October 3 to 4, 2026" on /downtown, and FAQ line "Riverfest is held downtown in the fall" | Riverfest 2026 was canceled by its board. Organizers say it returns in 2027. Do not promise a fall Riverfest. | [V] [Riverfest site](https://wilmingtonriverfest.com/); [Wilmington Daily](https://wilmingtondaily.com/riverfest/); [WECT, Oct 23 2026](https://www.wect.com/2026/10/23/emails-reveal-monthslong-dispute-behind-wilmington-riverfests-2026-cancellation/); stale copy at [shorelist.net/downtown](https://shorelist.net/downtown) |
| Cucalorus "November 10 to 14" on /downtown | The 32nd Cucalorus ran November 19 to 22, 2026 (already over). It is held every November. | [V] [Cucalorus](https://www.cucalorus.org/annual/cucalorus-32) |
| Town-page "Seasonal highlights" (Bob Dylan Jul 29, Jelly Roll Jun 8, Carolina Beach Music Festival Jun 6, Cape Fear Kite Festival Nov 6 to 8, Wrightsville Triathlon Sept, July 4 2026) | All past. Use events-data.json only. | [V] [shorelist.net/downtown](https://shorelist.net/downtown), [/carolina-beach](https://shorelist.net/carolina-beach), [/kure-beach](https://shorelist.net/kure-beach), [/wrightsville-beach](https://shorelist.net/wrightsville-beach) |
| Carolina Beach page stat tile "dogs allowed on the beach at any hour" | Leashed dogs any hour Oct 1 to Mar 31; Apr 1 to Sep 30 only before 9 a.m. and after 5 p.m.; never on the historic boardwalk or in the Boardwalk Business District. | [V] [Pleasure Island guide](https://shorelist.net/pleasure-island); [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/); conflicting tile at [shorelist.net/carolina-beach](https://shorelist.net/carolina-beach) |
| Carolina Beach boardwalk "open since 1939" | Do not say it. The town timeline says the resort and boardwalks date to 1887, a 1940 fire destroyed two blocks, and the boardwalk reopened in 1941. 1939 is the year Britt's Donuts opened. CVB calls the boardwalk "century-old." | [V] LF > Carolina Beach > History; [CVB Carolina Beach](https://carolina-beach.wilmingtonandbeaches.com/) |
| CVB FAQ beach parking rates (Wrightsville $5/hr or $25/day; Kure $5/hr, $20/day, $100 weekly) | Use the town pages in LF. Wrightsville: $6 and $5 per hour, $30 and $25 daily. Kure 2026: $6 hourly, $25 daily, $125 weekly. The CVB FAQ is older. | [V] [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/) vs LF > Parking sections |
| "Wilmington was the largest city in NC in 1850" (CVB history) vs "largest town in the state in 1840" (City of Wilmington) | Say "one of North Carolina's largest cities in the mid-1800s." Exact year is UNVERIFIED between two official sources. | [V] [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/); LF > Wilmington > History |
| NC Aquarium at Fort Fisher | Closed to the public May 26, 2026. The state expects about 30 months of construction (about late 2028 by arithmetic, not an announced reopening date). Free "Discovery Cove" satellite is at Independence Mall, Wilmington. Some CVB, TripAdvisor-style and blog pages still describe the otters and sharks. | [V] [NC DNCR, May 28 2026](https://www.dncr.nc.gov/news/press-releases/2026/05/28/north-carolina-aquarium-fort-fisher-breaks-ground-transformational-expansion); [NC Aquariums](https://www.ncaquariums.com/faqs-ncaff-renovation-expansion); [shorelist.net/kure-beach](https://shorelist.net/kure-beach) |
| Lighting at the Lake (Carolina Beach) start time | LF has 5:00 to 7:00 p.m. (organizer page). StarNews lists 6:30 p.m. Say "Friday evening, confirm the time with Island of Lights." | [V] LF > Carolina Beach; [StarNews, Nov 25 2026](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/) |
| Golf carts at Carolina Beach | A blog says traditional carts are being phased out in favor of street-legal low-speed vehicles. ShoreList's golf-cart page says "street-legal carts." Say "street-legal, ask the rental company." | [3P] [Navigate Rentals](https://navigaterentals.com/carolina-beach-vs-wrightsville-beach-vs-kure-beach) vs [shorelist.net/things-to-do/golf-cart-rentals](https://shorelist.net/things-to-do/golf-cart-rentals) |
| Carolina Beach Music Festival edition number | One listing says 40th (June 6, 2026), another says 41st. Do not state an edition number. | [V] [VisitNC](https://www.visitnc.com/events/40th-annual-carolina-beach-music-festival); [3P] [Pleasure Island chamber](https://www.pleasureislandnc.org/carolinabeachmusicfest.html) |
| Wilmington Marathon start line | Race is Feb 27, 2027, point to point from Wrightsville Beach toward downtown. One listing puts the start at Johnnie Mercer's Pier at 7 a.m.; the race site mentions a UNCW start for shuttles. Exact start spot is UNVERIFIED. | [V] [Wilmington Marathon](https://wilmingtonncmarathon.com/schedule/); [Access Wilmington](https://accesswilmington.com/event/2027-novant-health-wilmington-half-and-full-marathon/) |

---

## 1. Wilmington: districts, neighborhoods, getting around

- Downtown is the River District / Historic Downtown, a National Register historic district of 230-plus blocks, beside the Cape Fear River. (Source: [CVB About Wilmington](https://www.wilmingtonandbeaches.com/about/area-information/about-wilmington/)) [V]
- Other named areas the CVB uses: Midtown, Mayfaire Town Center and Lumina Station. (Source: [CVB About Wilmington](https://www.wilmingtonandbeaches.com/about/area-information/about-wilmington/)) [V]
- Downtown has seven districts; on "District Day: Small Business Saturday" (Nov 28 2026, noon to 7 p.m.) free trolleys link all seven. This is event-specific, not a standing service. (Source: [Wilmington Daily weekend guide](https://wilmingtondaily.com/things-to-do-this-weekend/)) [V]
- The Cargo District is a downtown area that hosts pop-up comedy and music (StarNews names it for "Don't Tell Comedy"). (Source: [StarNews, Nov 25 2026](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/)) [V]
- Castle Street is the walkable art, antique and thrift street; Rx Restaurant is at 421 Castle St. (Source: [Scribs and Nibs](https://thescribsandnibs.com/usa/north-carolina/what-to-do-wilmington/); [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [3P]
- Sunset Park is a residential neighborhood west of downtown with a local bar scene (Dram Tree Tavern is described as a "Sunset Park local's favorite"). (Source: [Check What's Good](https://www.checkwhatsgood.com/c/discoverlocal/Wilmington)) [3P]
- Wilmington International Airport (ILM) is about 10 minutes from downtown; the beaches are 20 to 40 minutes away; I-40 ends in Wilmington; Raleigh is roughly two hours. (Source: [shorelist.net/plan-your-trip](https://shorelist.net/plan-your-trip)) [SL]
- CVB distances: Wrightsville Beach 8.5 miles from Wilmington; Kure Beach 18 miles. (Source: [CVB Wrightsville](https://wrightsville-beach.wilmingtonandbeaches.com/); [CVB Kure](https://kure-beach.wilmingtonandbeaches.com/)) [V]
- ShoreList drive times: Wrightsville about 20 minutes, Carolina Beach about 30, Kure just past it; Myrtle Beach about 1.5 hours, Charlotte about 3.5 hours (ShoreList's own estimates, not measured). (Source: [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq)) [SL]
- Downtown is compact and walkable; you want a car or a ride to reach the beaches. (Source: [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq)) [SL]
- Dog parks in Wilmington: Empie Park, Long Leaf Park and Ogden Park. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- EV charging: Market Street Deck has DC fast and Level 2 chargers on the ground floor; 2nd Street and RiverPlace decks have Level 2; Tesla Supercharging is at Mayfaire Town Center. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Accessible museum sites per the CVB: upper deck of the Battleship, Cape Fear Museum, Wilmington Railroad Museum, Cameron Art Museum, Fort Fisher State Historic Site. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Taxes: 7% sales tax on retail and restaurant meals, 2% on take-home grocery food, 6% county room occupancy tax. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Film: the CVB says filmmakers have logged more than 400 film-related credits in the area. (Source: [CVB About Wilmington](https://www.wilmingtonandbeaches.com/about/area-information/about-wilmington/)) [V]
- Film tour hooks on ShoreList's pages: One Tree Hill, Dawson's Creek, Iron Man 3, The Summer I Turned Pretty. (Source: [shorelist.net/downtown](https://shorelist.net/downtown); [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq)) [SL]
- One Tree Hill "The Bridge" is a listed landmark at 694 N 6th St. (Source: [places listing mirroring Tripadvisor](https://exa.ai/library/places?ids=vd8833wh962%2Ctwwbmq7p9hr%2Cz70s5601djj%2Cb92ts41pg7h%2Cz8m8xwb52bw%2C7nq682fl7my%2Ccbkmstpw3xg%2C62qg0r4dnk4%2Cxhc9zbrxqhb%2C9zj7w6pqmc6)) [3P]

### Downtown and Wilmington-area attractions (addresses and what visitors say)

Hours and prices change; the bots link, they do not quote hours unless the live source is cited.

- Battleship North Carolina, 1 Battleship Rd NE, across the river from downtown. Self-guided, nine decks; a local writer says plan one to two hours, there is no air conditioning so summer heat matters, and there are restrooms. Tripadvisor shows it ranked #1 (4.7, about 3,659 reviews at crawl). (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [Tripadvisor](https://www.tripadvisor.com/Attractions-g49673-Activities-Wilmington_North_Carolina.html)) [3P]
- Airlie Gardens, 300 Airlie Rd: 67 acres; the CVB cites more than 75,000 azaleas and the Airlie Oak. Tripadvisor #2 (4.6, about 1,156). Enchanted Airlie runs Nov 27 to Dec 21 and is sold out per Airlie (returns reappear on Etix). (Source: [CVB About Wilmington](https://www.wilmingtonandbeaches.com/about/area-information/about-wilmington/); [Tripadvisor](https://www.tripadvisor.com/Attractions-g49673-Activities-Wilmington_North_Carolina.html); [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/)) [V]
- Riverwalk: free; 1.75 miles (LF). Tripadvisor ranks it #3 (4.4, about 1,473). Dolphins and the occasional alligator are a local anecdote, not a promise. (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [Tripadvisor](https://www.tripadvisor.com/Attractions-g49673-Activities-Wilmington_North_Carolina.html)) [3P]
- Bellamy Mansion Museum, 503 Market St (built c.1859 per CVB timeline). Burgwin-Wright House and Gardens, 224 Market St (built c.1770). A local guide suggests doing both for two centuries of history. Tripadvisor text calls Burgwin-Wright the only colonial-era structure in Wilmington open to the public. (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/); [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [Tripadvisor](https://www.tripadvisor.com/Attractions-g49673-Activities-Wilmington_North_Carolina.html)) [3P]
- Cape Fear Museum of History and Science, 230 Grace St (planetarium shows on Nov 27 to 29 per Wilmington Daily). Wilmington Railroad Museum, 505 Nutt St (full-size steam locomotive, model layout; Christmas Train and Light Spectacular is a holiday event). Cameron Art Museum, 3201 S 17th St (exhibition "Rooted in Memory" runs to Jan 24, 2027, in ShoreList's feed). (Source: [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/); [Tripadvisor](https://www.tripadvisor.com/Attractions-g49673-Activities-Wilmington_North_Carolina.html); [events-data.json](https://shorelist.net/events-data.json)) [3P]
- Cotton Exchange, 321 N Front St (shops, cafes). New Hanover County Arboretum, 6206 Oleander Dr (free, about an hour). Greenfield Lake Park, 1941 Amphitheater Dr (free; a 4-mile loop trail per Scribs and Nibs). Poplar Grove, 10200 US-17 (Wednesday farmers market 9 a.m. to 1 p.m. per Go Wilmington NC; Merry & Bright festival Nov 27 to Dec 22). (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [Scribs and Nibs](https://thescribsandnibs.com/usa/north-carolina/what-to-do-wilmington/); [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/)) [3P]
- Wilmington Water Tours, 212 S Water St on the Riverwalk, one-hour narrated cruises; a Holiday Lights River Cruise runs Nov 27. Cape Fear River Boats at 101 S Water St also does sightseeing cruises. These are third-party operators, not ShoreList listings. (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [Y Travel Blog](https://www.ytravelblog.com/wilmington-nc/); [Port City Daily events](https://portcitydaily.com/events/)) [3P]
- The Blind Elephant speakeasy is down Smith Alley at 21 N Front St Unit F; a local guide says there is no password and a nominal membership fee (about $1 at last check, UNVERIFIED now). (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [3P]
- Riverfront Farmers Market: Dock Street between 2nd and Water, Saturdays 8 a.m. to 1 p.m. since 2003, 2026 season opened April 18. The winter schedule is UNVERIFIED (ShoreList's feed lists it Nov 21 to 28 from Wilmington Downtown Inc). (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [events-data.json](https://shorelist.net/events-data.json)) [3P]
- Jungle Rapids Family Fun Park and the Donald Ross-designed Wilmington Municipal Golf Course are named by the CVB. (Source: [CVB About Wilmington](https://www.wilmingtonandbeaches.com/about/area-information/about-wilmington/)) [V]
- Masonboro Island: undeveloped barrier island reached only by boat; kayak tours run roughly 2.5 to 3 hours with third-party operators. (Source: [shorelist.net/johnnie-mercers-pier](https://shorelist.net/johnnie-mercers-pier); [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [3P]

---

## 2. Wrightsville Beach (Shelby's home turf)

For parking rates, the 44 accesses, ADA list, restrooms and annual town events, see LF > Wrightsville Beach.

- CVB's framing: "North Carolina's Surf & Watersports Island"; the CVB says Outside magazine named it a top SUP hub and National Geographic named it a top surfing town (CVB claims, not independently checked). (Source: [CVB Wrightsville](https://wrightsville-beach.wilmingtonandbeaches.com/)) [V]
- Things the CVB lists: surf lessons, SUP, sailing on the Intracoastal Waterway, a cruise to Masonboro Island, the Loop fitness trail, Johnnie Mercer's Pier, beach boutiques and surf shops, and nightlife from beach taverns to live music at the pier and marina. (Source: [CVB Wrightsville](https://wrightsville-beach.wilmingtonandbeaches.com/)) [V]
- The Loop is a paved walking path around the island; one rental company says 2.5 miles. (Source: [Navigate Rentals](https://navigaterentals.com/carolina-beach-vs-wrightsville-beach-vs-kure-beach)) [3P]
- Johnnie Mercer's Pier: 23 E Salisbury St, 28480; pier site says it extends more than 1,200 feet and reopened in 2001. Parking at the pier is town-run. ShoreList is not affiliated with it. (Source: [shorelist.net/johnnie-mercers-pier](https://shorelist.net/johnnie-mercers-pier)) [SL]
- Surf rules (Town of Wrightsville Beach): a leash is required. Surfing is always prohibited within 350 feet of Johnnie Mercer's Pier (between accesses 15 and 16), within 350 feet of Crystal Pier at the Oceanic (between 36 and 37) and within 100 feet of the Masonboro Inlet jetty (between 42 and 43). From Memorial Day weekend to Labor Day weekend, surfing is also prohibited within 600 to 750 feet of an on-duty lifeguard stand, generally 10 a.m. to 5 p.m. (Source: [Town surfing page](https://www.townofwrightsvillebeach.com/206/Surfing-Kiteboarding)) [V]
- Surf character: gentle, fairly consistent waves most of the year, good for longboards; fall (offshore storms, hurricane swells between August and October) is the best season for experienced surfers; summer is the busiest; a wetsuit is usual in winter. (Source: [WrightsvilleBeach.com surf guide](https://www.wrightsvillebeach.com/wrightsville-beach-surfing-guide.html); [American Surf Magazine](https://www.americansurfmagazine.com/article/wrightsville-beach-surf-guide)) [3P]
- Local surf lore from the same guide: the northern end is mostly locals; the better-quality waves are to the south; tide roughly 1 to 3 hours after low. (Source: [WrightsvilleBeach.com surf guide](https://www.wrightsvillebeach.com/wrightsville-beach-surfing-guide.html)) [3P]
- ShoreList shows live surf height and an estimated flag per beach; the flags and lifeguards on the sand always win. (Source: [shorelist.net/surf](https://shorelist.net/surf)) [SL]
- Paddling: Banks Channel on the sound side is calm, sheltered water and the usual SUP spot; check the tide and boat traffic. (Source: [shorelist.net/things-to-do/paddleboard](https://shorelist.net/things-to-do/paddleboard)) [SL]
- Dogs: not allowed on the Wrightsville strand April 1 to September 30; leashed October 1 to March 31. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Lifeguards: USLA certified, Memorial Day weekend through Labor Day weekend. Free beach-access equipment: Parks and Recreation, 910-256-7925. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Crowds by season: summer is peak (VisitNC, in LF). Paid parking is off Nov 1 to Feb 28 (LF). Blogs say summer-Saturday lots fill by mid-morning; treat the hour as UNVERIFIED. (Source: [Port City Lowdown](https://portcitylowdown.com/articles/wrightsville-vs-carolina-vs-kure-beach/)) [3P]
- Nightlife and family: ShoreList's Shore Picks lists the Palm Room (island bar since 1955), Poe's Tavern, Banks Channel Pub & Grille, Red Dogs (late night) and Jimmy's on Lumina; for dinner it lists Oceanic at Crystal Pier, Dockside, South Beach Grill, Tower 7, Shark Bar, Ceviche's and Brasserie du Soleil. Sound-side water is shallow and calm for small kids per one blog. (Source: [shorelist.net/shore-picks](https://shorelist.net/shore-picks); [Port City Lowdown](https://portcitylowdown.com/articles/wrightsville-vs-carolina-vs-kure-beach/)) [SL]
- Lodging examples on ShoreList (examples, not endorsements): Blockade Runner Beach Resort, Holiday Inn Resort Lumina, plus rentals; lodging is limited and books early for summer and holidays. (Source: [shorelist.net/where-to-stay](https://shorelist.net/where-to-stay)) [SL]
- Events: NC Holiday Flotilla is Thanksgiving weekend, 43rd year in 2026; festival in the park Saturday 10 a.m. to 4 p.m., boat parade 6 p.m. with fireworks, awards Sunday 10 a.m. at Lumina; free to watch. (Source: [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/); [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/)) [V]
- Wilmington Marathon: Saturday Feb 27, 2027, point to point from Wrightsville Beach; race weekend Feb 25 to 27. (Source: [Wilmington Marathon](https://wilmingtonncmarathon.com/schedule/)) [V]
- Insider tips (blog, attributed): rent a place with its own parking; use the town's pay-by-plate or Text2Park; the north end near Mason Inlet is quieter. (Source: [Navigate Rentals](https://navigaterentals.com/carolina-beach-vs-wrightsville-beach-vs-kure-beach); [Port City Lowdown](https://portcitylowdown.com/articles/wrightsville-vs-carolina-vs-kure-beach/)) [3P]

---

## 3. Carolina Beach (boardwalk, families, fishing)

For parking, Freeman Park, lifeguard hours, beach strand rules and town events, see LF > Carolina Beach.

- CVB's framing: "Boardwalk Classics, State Park Trails & Coastal Vibes"; century-old boardwalk with shops, seasonal rides and sweet treats; Carolina Beach State Park trails include a 50-foot sand dune and carnivorous plants; the pier; inshore, nearshore, offshore and deep-sea charters; Britt's Donut Shop; Carolina Beach Music Festival billed as NC's largest and only music festival held on the beach. (Source: [CVB Carolina Beach](https://carolina-beach.wilmingtonandbeaches.com/)) [V]
- No charge to access the beach; parking is the cost (LF). Free parking Nov 1 to Feb 28. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/); [shorelist.net/pleasure-island](https://shorelist.net/pleasure-island)) [V]
- Dogs: leashed, Oct 1 to Mar 31 any hour; Apr 1 to Sep 30 only before 9 a.m. and after 5 p.m.; not on the historic wooden boardwalk or in the Boardwalk Business District at any time. Owners must remove waste. Dog park: Mike Chapell Park (spelling as printed by the CVB). (Source: [shorelist.net/pleasure-island](https://shorelist.net/pleasure-island); [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Lifeguards: USLA certified, Memorial Day weekend to Labor Day weekend; free beach-access equipment through Parks and Recreation, 910-458-2977. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Summer fireworks: ShoreList's Carolina Beach page lists Boardwalk Fireworks Thursdays, Memorial Day through Labor Day, at dusk; a blog describes a free Thursday "Boardwalk Blast" concert series with fireworks at 9 p.m. Exact start time is UNVERIFIED. (Source: [shorelist.net/carolina-beach](https://shorelist.net/carolina-beach); [Port City Lowdown](https://portcitylowdown.com/articles/wrightsville-vs-carolina-vs-kure-beach/)) [SL]
- Carolina Beach Music Festival: Saturday June 6, 2026, 10 a.m. to 4:30 p.m., on the beach near the Ocean Stage, 1 Cape Fear Blvd (2026 date; 2027 date UNVERIFIED). (Source: [VisitNC](https://www.visitnc.com/events/40th-annual-carolina-beach-music-festival)) [V]
- Carolina Beach State Park, 1010 State Park Rd: wild Venus flytraps (protected, never pick), trails, camping, marina. A local guide lists admission as free. (Source: [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq); [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [SL]
- Britt's Donuts: cash only, seasonal (April to October per ShoreList Shore Picks); a local guide says bring cash and eat them hot. Wake N Bake is the gourmet counterpart that sells out early. (Source: [shorelist.net/shore-picks](https://shorelist.net/shore-picks); [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [SL]
- Dining and bars on ShoreList's list (15 Carolina Beach places in the digest): SeaWitch Cafe & Tiki Bar, Salt Fish, Seaworthy, Michael's Seafood, The Last Resort (14-seat locals' bar), and more. (Source: [shorelist.net/shore-picks](https://shorelist.net/shore-picks)) [SL]
- ShoreList bookable here: Carolina Beach History & Mural Walk ($30, 1.5 miles from Carolina Beach Lake Park, includes a $5 donation to the Mural Project) and Carolina Beach History & Dive Bar Tour ($30, about two hours, starts at The Sea Witch). Both by Carolina Beach Tours; seasonal. (Source: [shorelist.net/things-to-do/walking-tours](https://shorelist.net/things-to-do/walking-tours)) [SL]
- Winter on the boardwalk: Boardwalk on Ice, Nov 27 2026 to Jan 3 2027, Wed to Sun, skate rental $15 for 45 minutes (see LF); Island of Lights runs Dec events (LF). (Source: LF > Carolina Beach > Annual events) [V]
- Blog read on crowds and tips (attributed): the boardwalk block is the busiest, a few blocks north or south thins out fast; Carolina Beach parking is easier than Wrightsville; Pop Pop's Pizza is a late-night option. All UNVERIFIED as measured facts. (Source: [Port City Lowdown](https://portcitylowdown.com/articles/wrightsville-vs-carolina-vs-kure-beach/)) [3P]
- Lodging examples (not endorsements): Courtyard by Marriott Carolina Beach Oceanfront, Golden Sands, motels, condos and rentals. (Source: [shorelist.net/where-to-stay](https://shorelist.net/where-to-stay)) [SL]

---

## 4. Kure Beach and Fort Fisher (quiet, history, nature)

For parking, the eight accesses, free pier walk-on, history and annual town events, see LF > Kure Beach.

- CVB's framing: a small-town beach 18 miles from Wilmington; the 711-foot Kure Beach Fishing Pier; Ocean Front Park boardwalk and bench swings; Fort Fisher State Recreation Area with nearly 6 miles of protected shoreline; guided kayak tours of Zeke's Island Reserve; family events including the Cape Fear Kite Festival and free summer Boogie in the Park. (Source: [CVB Kure Beach](https://kure-beach.wilmingtonandbeaches.com/)) [V]
- Fort Fisher State Historic Site is the site of the Civil War's largest land-sea battle per the CVB; Fort Fisher fell Jan 15, 1865. General admission is free, open Tuesday to Saturday 9 a.m. to 5 p.m., closed Sunday and Monday; call 910-251-7351 for tours. (Source: [CVB Kure Beach](https://kure-beach.wilmingtonandbeaches.com/); [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/); [shorelist.net/pleasure-island](https://shorelist.net/pleasure-island)) [V]
- Basin Trail at Fort Fisher is a 2.2-mile round-trip hike per one local guide. (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [3P]
- NC Aquarium at Fort Fisher: closed since May 26, 2026 (see section 0). Fort Fisher Recreation Area, the historic site and the beaches stay open. (Source: [NC DNCR](https://www.dncr.nc.gov/news/press-releases/2026/05/28/north-carolina-aquarium-fort-fisher-breaks-ground-transformational-expansion); [shorelist.net/pleasure-island](https://shorelist.net/pleasure-island)) [V]
- Fort Fisher to Southport ferry: state-run, vehicles and walk-ons, about 35 minutes; check the NCDOT schedule. (Source: [shorelist.net/pleasure-island](https://shorelist.net/pleasure-island)) [SL]
- Dogs: leashed Oct 1 to Mar 31; Apr 1 to Sep 30 only between 5 p.m. and 9 a.m. (rule in effect since April 1, 2023 per CVB). Dog park: Joe Eakes Park. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Lifeguards: USLA certified, Memorial Day weekend to Labor Day weekend. Free beach-access equipment: Kure Beach Fire Department 910-458-2014; Fort Fisher State Recreation Area 910-458-5798. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Crowds: Kure is generally the quietest of the three; this is the consistent view across blogs and the CVB tone, not a measured count. Kids' day idea from a blog: beach morning, then Fort Fisher (the aquarium half is closed now). (Source: [Navigate Rentals](https://navigaterentals.com/carolina-beach-vs-wrightsville-beach-vs-kure-beach); [Port City Lowdown](https://portcitylowdown.com/articles/wrightsville-vs-carolina-vs-kure-beach/)) [3P]
- Dining on ShoreList's list (9 Kure places): Freddie's (tiny, family-run Italian), Big Daddy's, Jack Mackerel's Island Grill, Ocean View Restaurant (breakfast by the pier), Beach House Burgers, Big Daddy's Tiki Bar, Bud & Joe's Sandbar, Jack Mackerel's Bar. For a bigger dinner scene one blog sends visitors back to Carolina Beach. (Source: [shorelist.net/shore-picks](https://shorelist.net/shore-picks)) [SL]
- Holiday: Kure Beach Holiday Market is Saturday Nov 21 and Nov 28 (LF); Holiday Whoobie Whatty is Dec 18, 6 to 8 p.m. (LF). (Source: LF > Kure Beach > Annual events) [V]
- ShoreList Kure page says walking tours can be booked now and other experiences "go live as local operators join." (Source: [shorelist.net/kure-beach](https://shorelist.net/kure-beach)) [SL]

---

## 5. Dining districts and picks

ShoreList's Shore Picks lists 63 places: 24 downtown, 15 Wrightsville, 15 Carolina Beach, 9 Kure. They are editorial picks, "not paid placements." Descriptions are ShoreList's voice; operating hours are NOT on the page, so the bots never quote hours. (Source: [shorelist.net/shore-picks](https://shorelist.net/shore-picks)) [SL]

- Downtown: Seabird (chef Dean Neff, NC oysters, weekend brunch), Opa by Giorgios (Greek on the marina), Steam, manna (tasting menus), Olivero, Voyce Bistro, River 128 (riverfront patio, Sunday brunch), The Basics (Southern), Circa 1922 (small plates), Indochine (Thai and Vietnamese garden setting), Ruth's Chris. Coffee: Hidden Grounds, Bespoke. (Source: [shorelist.net/shore-picks](https://shorelist.net/shore-picks)) [SL]
- Other downtown-area names that independent sources point to: Rx Restaurant (421 Castle St; reserve ahead), Winnie's Tavern (burger place described as 60 years in business and used as a film location), Dram Tree Tavern, Blue Surf Café (Midtown), BlueBerry's Grill. (Source: [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/); [Check What's Good](https://www.checkwhatsgood.com/c/discoverlocal/Wilmington)) [3P]
- Sunset: the Riverwalk faces west over the river; the sound side of Wrightsville along Banks Channel is another favorite; restaurants on the boardwalk get busy so go early and reserve. (Source: [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq); [Y Travel Blog](https://www.ytravelblog.com/wilmington-nc/)) [SL]
- Wilmington was named a "Top Foodie City" by Yelp per the CVB (CVB claim, undated). (Source: [CVB About Wilmington](https://www.wilmingtonandbeaches.com/about/area-information/about-wilmington/)) [V]
- Bars: downtown speakeasies and rooftop bars (Blind Elephant, Underfront, Wine Knot Sky Bar are named on ShoreList's tour pages and Eventbrite listings). (Source: [shorelist.net/things-to-do/walking-tours](https://shorelist.net/things-to-do/walking-tours); [Eventbrite Wilmington](https://www.eventbrite.com/d/nc--wilmington/events/)) [SL]

---

## 6. History for storytelling (beyond LF)

The bots tell history plainly and respectfully, cite it, and do not embellish. Incorporation years are in LF.

- 1524: Verrazzano explored the Cape Fear River. 1725: Brunswick Town created as the first permanent settlement, colony capital and seaport. (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- Feb 1776: Battle of Moore's Creek Bridge, about 20 miles northwest. Jan 1781: British forces occupied Wilmington; they evacuated in October 1781. (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- c.1770 Burgwin-Wright House; c.1852 Latimer House; c.1858 Thalian Hall/City Hall; c.1859 Bellamy Mansion. (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- 1840: the Wilmington and Weldon Railroad opened the state's interior to the port. 1960: the railroad moved its headquarters from Wilmington. (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- Jan 15, 1865: Fort Fisher fell to Federal troops after the largest naval bombardment of the 19th century. Feb 1865: United States Colored Troops fought at the Battle of Forks Road in Wilmington. 1864: Confederate earthworks on the Sugar Loaf line (in Ryder Lewis Park). (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- 1898: the Wilmington coup, which the CVB describes as an insurrection and white supremacy campaign with electoral fraud. Tell it as the CVB does and point visitors to museum and tour sources; no invented detail. (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- 1960s: preservation efforts began; 1974: much of downtown listed on the National Register of Historic Places; 2020: designated an "American World War II Heritage City." (Source: [CVB history](https://www.wilmingtonandbeaches.com/about/area-information/historical-overview/)) [V]
- ShoreList's walking tours cover the 1730s to today, the Prohibition era (Barbary Row, 1880s to 1930s), and Victorian Christmas customs; see section 8. (Source: [shorelist.net/things-to-do/walking-tours](https://shorelist.net/things-to-do/walking-tours)) [SL]

---

## 7. Annual and recurring events by typical month

Only items with a source for the month. LF already lists each town's own calendar (flotilla, Island of Lights, Boogie in the Park, Turtle Talk, Kure market, Azalea Festival April 7 to 11, 2027). 2027 dates are UNVERIFIED unless shown.

| Event | Typical month | 2026-27 note | Source |
| --- | --- | --- | --- |
| Wilmington Marathon weekend | late February | Feb 25 to 27, 2027, race Sat Feb 27 | [V] [wilmingtonncmarathon.com](https://wilmingtonncmarathon.com/schedule/) |
| NC Azalea Festival | April | see LF | LF |
| Riverfront Farmers Market (Saturdays) | April to fall | 2026 opened Apr 18; winter schedule UNVERIFIED | [3P] [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/) |
| Carolina Beach Music Festival | early June | Jun 6, 2026; 2027 UNVERIFIED | [V] [VisitNC](https://www.visitnc.com/events/40th-annual-carolina-beach-music-festival) |
| Boardwalk Fireworks Thursdays (Carolina Beach) | Memorial Day to Labor Day | per ShoreList page; start time UNVERIFIED | [SL] [shorelist.net/carolina-beach](https://shorelist.net/carolina-beach) |
| Wilmington Riverfest | first weekend of October (normal year) | 2026 CANCELED, returns 2027 | [V] [Riverfest](https://wilmingtonriverfest.com/) |
| Cape Fear Kite Festival | early November | 20th edition Nov 6 to 8, 2026, free, Fort Fisher State Recreation Area | [V] [VisitNC](https://www.visitnc.com/events/20th-annual-cape-fear-kite-festival) |
| Cucalorus Film Festival | mid to late November | 32nd: Nov 19 to 22, 2026, nine downtown venues | [V] [Cucalorus](https://www.cucalorus.org/annual/cucalorus-32) |
| Cape Fear Habitat Turkey Trot | Thanksgiving morning | 2026 at Live Oak Bank Pavilion | [V] [Wilmington Daily What's On](https://wilmingtondaily.com/whats-on/) |
| NC Holiday Flotilla (Wrightsville Beach) | Thanksgiving weekend | 43rd year, Nov 27 to 29, 2026 | [V] [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/) |
| Downtown tree lighting | Friday after Thanksgiving | Nov 27, 2026, foot of Market St; countdown 6:25 p.m., ends 8:30 p.m., free | [V] [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/) |
| Wilmington Holiday Parade | Sunday of Thanksgiving weekend | 23rd parade, Nov 29, 6 to 8 p.m., Front St between Walnut and Church, free | [V] [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/) |
| Enchanted Airlie | late Nov to Dec 21 | Nov 27 to Dec 21, 2026; sold out; $35 per carload (per ShoreList feed) | [V] [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/) |
| Merry & Bright Festival, Poplar Grove | late Nov to Dec 22 | Nov 27 to Dec 22, 2026; Nov 27 to 29, 5 to 9 p.m., $10, kids 2 and under free | [V] [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/) |
| Wilmington Christmas Extravaganza | December | first annual, Dec 12 to 13, 2026, Convention Center, $7 for both days, about 150 vendors; Sat 9 to 4, Sun 10 to 4 | [3P] [Check What's Good](https://www.checkwhatsgood.com/d/events-12508_us_nc_wilmington_wilmington_christmas_extravaganza) |
| Cameron Art Museum Jazz at CAM, Thalian Hall shows, Wilson Center season | Sept to May | Wilmington Symphony 2026-27 season runs to May 1, 2027 | [3P] [Check What's Good](https://www.checkwhatsgood.com/d/events-11369_us_nc_wilmington_wilmington_symphony_orchestra_20262027_season) |

Also named by the CVB as annual events but with no month verified here: Beer, Bourbon & BBQ Festival, the holiday flotillas, Island of Lights festival. (Source: [CVB events](https://www.wilmingtonandbeaches.com/events/)) UNVERIFIED months.

---

## 8. What ShoreList sells and books (Captain Cape and Wrighty must stay inside this)

**Bookable today (VERIFIED on pages Nov 27):** only the Walking & History Tours category has live checkout: 6 experiences, secure Stripe checkout, "Free Cancellation 24hrs+." Everything else below is waitlist or "coming soon", so Captain Cape must never say "book now" for it. (Source: [shorelist.net/things-to-do/walking-tours](https://shorelist.net/things-to-do/walking-tours)) [SL]

| Tour | Provider | Price | Detail |
| --- | --- | --- | --- |
| The Original History & Architecture Tour | Wilmington Walking Tours (Amanda Leese) | $25 | 1.5-mile loop through the Historic District, 1730s to today |
| Historic Happy Hour Tour | Wilmington Walking Tours | $30 | three 25-minute bar stops (Gazebo Bar, The Vine, Wine Knot Sky Bar); drinks extra |
| Speakeasy & Prohibition Walking Tour | Wilmington Walking Tours | $30 | 1880s to 1930s; The Ivey in the Alley, Underfront Co., Blind Elephant |
| Christmas Candlelight Victorians Walk | Wilmington Walking Tours | $20 | about 90 minutes, one mile, candles provided |
| Carolina Beach History & Mural Walk | Carolina Beach Tours | $30 | 1.5 miles from Carolina Beach Lake Park; includes $5 to Mural Project |
| Carolina Beach History & Dive Bar Tour | Carolina Beach Tours | $30 | about two hours, one mile, starts at The Sea Witch |

(Source for all six: [shorelist.net/things-to-do/walking-tours](https://shorelist.net/things-to-do/walking-tours), schema data) [SL]. Carolina Beach tours are seasonal; the listing shows "4.9 on Viator & TripAdvisor" for the operator (operator claim, not verified). (Source: [shorelist.net/carolina-beach](https://shorelist.net/carolina-beach)) [SL]

**Waitlist / "Bookings opening soon" (1 local operator each, no checkout):** ghost tours, film tours, surf lessons, nature walks. (Source: category pages, e.g. [ghost-tours](https://shorelist.net/things-to-do/ghost-tours)) [SL]
**"Coming soon" with Notify Me:** fishing charters, kayak tours, river cruises, paddleboard, bike tours, e-bike, scooter, fat bike, sailboat rides, wildlife tours, beach photography, beach picnics, beach chairs, jet skis, golf carts, wellness. (Source: category pages under [shorelist.net/things-to-do](https://shorelist.net/things-to-do)) [SL]
**Guide-only (no booking):** museums and attractions (links to partner pages). (Source: [shorelist.net/things-to-do/museums](https://shorelist.net/things-to-do/museums)) [SL]

- ShoreList does not book lodging; the hotels it names are examples. (Source: [shorelist.net/where-to-stay](https://shorelist.net/where-to-stay)) [SL]
- Operators join with no upfront cost and a 15 to 20% commission, guests pay full price via Stripe, and a 24-hour cancellation policy applies. (Source: [shorelist.net/join](https://shorelist.net/join)) [SL]
- ShoreList events: 76 listings across Downtown (34), Wilmington (18), Greater Wilmington (11), Carolina Beach (5), Kure Beach (4), Wrightsville Beach (4); refreshed daily; calendar-feed events kept 120 days; each event page links its checked source and an .ics file; no paid rankings. Gaps are listed in competitor-gaps.md. (Source: [shorelist.net/how-we-verify](https://shorelist.net/how-we-verify); [events-data.json](https://shorelist.net/events-data.json)) [SL]
- Tools: live weather, hourly and 7-day forecast, tide and water temperature at /wilmington-weather; live surf check at /surf; AI trip planner at /planner; map at /map; free weekly Shore Report newsletter at /weekly. (Source: [shorelist.net/llms.txt](https://shorelist.net/llms.txt)) [SL]
- Digital products: 11 PDF travel guides at $14 each or $39 for the original four (16 to 21 pages, November 2026 edition, Stripe checkout, no shipping, 7% NC sales tax added); 10 art-print PDFs at $12 each in 18x24 and 24x36 inches; a free 7-page sampler. (Source: [shorelist.net/guides](https://shorelist.net/guides); [shorelist.net/prints](https://shorelist.net/prints)) [SL]
  - Guide titles: The Beach Day Field Guide; Wilmington in Three Days; Wilmington with Kids; Winter in Wilmington; Wilmington Holidays 2026; Dog-Friendly Wilmington; Free & Low-Cost Wilmington; Day Trips from Wilmington; On the Water: Wilmington; rainy-day guide; film locations guide. (Source: [shorelist.net/guides](https://shorelist.net/guides)) [SL]
  - Print titles: Wrightsville Beach Coordinates; One Tidal Day; sunrise panels for Wrightsville, Carolina and Kure; a Cape Lookout to Cape Fear coast line-art; Salt, Sun, River; a Bald Head Island lighthouse; a loggerhead sea turtle; Live Oak and Azalea; Visit Wilmington; Wilmington in Signal Flags. Illustrations, not maps or charts. (Source: [shorelist.net/prints](https://shorelist.net/prints)) [SL]

---

## 9. Shop: collections, price bands, policies (Wrighty's catalog)

Read the live catalog at `https://shorelist.net/shop-catalog.json` before quoting any price. Counts below are from the crawl at 1:55 a.m. ET Nov 27 and will change as Shop & Merch publishes.

- 103 items: 102 on the Shopify store (shorelist.myshopify.com) and 1 on the Fourthwall store (art prints, printed tees, crewnecks, totes, dad hat). Made to order or shipped from suppliers. (Source: [shop-catalog.json](https://shorelist.net/shop-catalog.json); [shorelist.net/shop](https://shorelist.net/shop)) [SL]
- Price range $6 to $98. By collection: Local Icons 72 items ($6 to $88), Shore Gear 26 ($12 to $98), Beach Setup 2 ($68 to $98), Locals' Christmas 2 ($18), Landmark Prints 1 ($84). Other collection names in the file: Coastal Classics, Tide Line, Harbor Capsules. (Source: [shop-catalog.json](https://shorelist.net/shop-catalog.json)) [SL]
- By town shelf: Wrightsville Beach 33, Kure Beach 27, Wilmington 22, Carolina Beach 21. Wrightsville mark = a sloop (navy pattern on tote, mug, pillow, pouch, tea towel, pet bandana, can cooler, stitched cap and crewneck). Carolina Beach mark = lifeguard stand and a pelican. Kure mark = lifeguard stand and a blue crab. Wilmington mark = live oak, Airlie Oak, "ILM." (Source: [shorelist.net/shop](https://shorelist.net/shop); [llms-full.txt](https://shorelist.net/llms-full.txt)) [SL]
- Anchor prices (live shop, Nov 27): crewnecks $78 to $88; corduroy caps $49; cuffed beanies $30; mugs $30; can coolers $12 (town) and $14 (sloop sleeve); Wrightsville Christmas ornament 2026 $18; Airlie Oak ceramic ornament $18; Airlie Oak art print $84; Terry beach towel $68; sloop picnic blanket $98; sloop tote $48; weekender tote $78. Sizing: see /size-guide. (Source: [shop-catalog.json](https://shorelist.net/shop-catalog.json); [shorelist.net/wrightsville-beach-christmas-ornament](https://shorelist.net/wrightsville-beach-christmas-ornament)) [SL]
- Gift entry points: /gift-guide (by recipient), /gift-finder (Wrighty: under $25, $35 or $50, for him, her or the home), /wilmington-nc-gifts, /wrightsville-beach-souvenirs. (Source: [shorelist.net/gift-finder](https://shorelist.net/gift-finder)) [SL]
- Shipping, production time and returns are on /shipping-returns; the bots link it and do not quote delivery days. (Source: [shorelist.net/shipping-returns](https://shorelist.net/shipping-returns)) [SL]
- The /shop pages carry a made-to-order note; the digital-goods return line is still being drafted by Shop & Merch (UNVERIFIED, see /workspace/shorelist/rj-morning.md). (Source: ShoreList internal note) UNVERIFIED

---

## 10. FAQs visitors actually ask (answers the bots can give, with sources)

ShoreList's own FAQ (21 questions) is at /wilmington-nc-faq and is the first source; items below add the ones it misses or gets wrong.

- Q: Is there anything to do on Thanksgiving weekend 2026? A: Yes: tree lighting Fri Nov 27, Holiday Flotilla Sat Nov 28 at Wrightsville, the Holiday Parade Sun Nov 29 on Front Street, plus Poplar Grove's Merry & Bright and Enchanted Airlie (sold out). (Source: [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/)) [V]
- Q: Is Riverfest this year? A: No, 2026 was canceled; it returns in 2027. (Source: [Riverfest](https://wilmingtonriverfest.com/)) [V]
- Q: Can I visit the NC Aquarium at Fort Fisher? A: Not now; it closed May 26, 2026. Fort Fisher Historic Site, the recreation area and the beaches are open. (Source: [NC DNCR](https://www.dncr.nc.gov/news/press-releases/2026/05/28/north-carolina-aquarium-fort-fisher-breaks-ground-transformational-expansion)) [V]
- Q: Which beach should I pick? A: Wrightsville for surf, paddle and a dinner scene; Carolina Beach for the boardwalk, families and fishing; Kure for quiet, the pier and Fort Fisher. (Source: [shorelist.net/plan-your-trip](https://shorelist.net/plan-your-trip); [CVB](https://www.wilmingtonandbeaches.com/)) [SL]
- Q: When is paid beach parking? A: Wrightsville and Carolina Beach March 1 to October 31; Kure March 15 to September 30 (2026); free off-season. Rates are in LF. (Source: [shorelist.net/wilmington-nc-parking](https://shorelist.net/wilmington-nc-parking)) [SL]
- Q: Can I bring my dog? A: Rules differ by town; the strand rules are in sections 2 to 4. Dogs are not allowed on the Wrightsville strand April through September. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Q: Do I need a wheelchair-accessible beach option? A: Free beach-access equipment and services: Wrightsville 910-256-7925, Carolina Beach 910-458-2977, Kure Beach Fire Dept 910-458-2014 and Fort Fisher State Recreation Area 910-458-5798. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Q: What does a hotel cost in tax terms? A: 6% county room occupancy tax plus 7% sales tax on retail; groceries 2%. (Source: [CVB FAQ](https://www.wilmingtonandbeaches.com/about/area-information/faq/)) [V]
- Q: Where do I see the lights at Christmas? A: Enchanted Airlie (sold out; returned tickets reappear on Etix), Merry & Bright at Poplar Grove, Leland in Lights at Founders Park, Pleasure Island of Lights, the Holiday Flotilla boat parade, and the Holiday Lights River Cruise. (Source: [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/); [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/)) [V]
- Q: What is good for a rainy day? A: Museums (Cape Fear Museum, Railroad Museum, Cameron Art Museum, Bellamy Mansion tours), an escape room downtown, or spa and studio time. (Source: [shorelist.net/things-to-do/museums](https://shorelist.net/things-to-do/museums); [Go Wilmington NC](https://gowilmingtonnc.com/things-to-do-wilmington-nc/)) [SL]
- Q: Is Wilmington good in winter? A: Quiet and mild with holiday events and lower lodging rates per ShoreList; the CVB and VisitNC call autumn milder with fewer crowds. (Source: [shorelist.net/plan-your-trip](https://shorelist.net/plan-your-trip); LF) [SL]
- Q: Does ShoreList book hotels or sell tickets to the Battleship? A: No; it books its own partner tours and sends people to official pages for lodging and attractions. (Source: [shorelist.net/where-to-stay](https://shorelist.net/where-to-stay)) [SL]
- Q: Where can I find a quick event list for this week? A: /events/this-weekend, then /events by area or month. (Source: [shorelist.net/events/this-weekend](https://shorelist.net/events/this-weekend)) [SL]

---

## 11. Time-boxed: events happening now to Dec 6 (expires Dec 7 2026)

Use only until ShoreList's feed catches up (see competitor-gaps.md gap 1). Each item is from a named source dated Nov 23 to 26.

- Nov 27: Holiday Tree Lighting 5:30 p.m. (Wilmington Daily says entertainment from 5 p.m.), Merry & Bright 5 to 9 p.m. ($10), Enchanted Airlie (sold out), Leland in Lights 5:30 to 8:30 p.m. (free), Holiday Flotilla Kickoff Party 7 p.m. at Bluewater Grill (ticketed), Boardwalk on Ice opens, Joe Zimmerman at Dead Crow 7 and 9:30 p.m. ($26 and $38). (Source: [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/); [StarNews](https://www.starnewsonline.com/story/entertainment/events/2026/11/25/things-to-do-events-and-weekend-entertainment-in-wilmington-nc-holidays-concerts-music-comedy/92731901007/)) [V]
- Nov 28: Flotilla Day in the Park 10 a.m. to 4 p.m. at Wrightsville Beach Park; District Day noon to 7 p.m. with free trolleys; Brian Whitted's Very Merry Christmas at Thalian Hall 2 and 7:30 p.m.; Wilmington Sounds, 15 bands, free, from 1 p.m. at Satellite Bar & Lounge, 120 Greenfield St; Flotilla boat parade 6 p.m. (Source: [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/); [Check What's Good](https://www.checkwhatsgood.com/d/events-13502_us_nc_wilmington_wilmington_sounds)) [V]
- Nov 29: Flotilla awards 10 a.m. at Lumina; Holiday Parade 6 to 8 p.m. on Front St; Merry & Bright 5 to 9 p.m., the one night leashed pets are welcome. (Source: [Wilmington Daily](https://wilmingtondaily.com/things-to-do-this-weekend/)) [V]
- Dec 4: A Charlie Brown Christmas at the Wilson Center (in ShoreList's feed); Movies in the Park at Wrightsville (LF). Dec 5: Island of Lights Christmas Flotilla, 6 p.m. (LF). (Source: [events-data.json](https://shorelist.net/events-data.json); LF) [V]

---

## 12. Rules that protect trust (reference for persona-voice.md)

- Never state an event, price, hour or ticket status without a source link and "confirm with the organizer." ShoreList's own pages say verified is not a guarantee. (Source: [shorelist.net/how-we-verify](https://shorelist.net/how-we-verify)) [SL]
- Beach flags and lifeguards come before any ShoreList surf or "estimated flag" reading. (Source: [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq)) [SL]
- Venus flytraps are protected: never pick or dig them. (Source: [shorelist.net/wilmington-nc-faq](https://shorelist.net/wilmington-nc-faq)) [SL]
- The hotels and restaurants named on ShoreList are examples or editorial picks, not rankings or paid placements. (Source: [shorelist.net/where-to-stay](https://shorelist.net/where-to-stay); [shorelist.net/shore-picks](https://shorelist.net/shore-picks)) [SL]
