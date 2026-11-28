# ShoreList Rulebook (SHORELIST-STANDARDS)

Version 1.0, written Fri Nov 27, 2026, about 1:15 AM ET by ShoreList Chief. ShoreList only. This is the single binding rulebook for every product build, pre-launch check, independent review and post.

**Binding: read this file before any build, publish or post.** Rule IDs below are the only IDs. `PUBLISH-BAR.md` (scorecard), `PRELAUNCH-CHECKLIST.md` (builder checklist), `MASTER-PLAN.md` and the merch prompt point here by ID and do not restate rules. If any other file disagrees with this one, this file wins. Owner messages of Nov 26 to 27, 2026 (t31u, t35u, t36u, t37u) are the authority behind it.

Evidence labels used everywhere: VERIFIED (seen or run, with how), ESTIMATE (reasoned number), HYPOTHESIS (plausible, untested), UNKNOWN (not checked). A line a reviewer cannot check scores 0, or FAIL if it is a hard rule.

## 0. How to use it

| Step | Who | What they do with this file |
|---|---|---|
| BUILD (B) | Builder (Shop & Merch, Social & Local, Prompt Bot) | Design to every rule marked B. Do not start a product that cannot satisfy BW, HN, BL and SU rules. |
| PRE-LAUNCH (P) | Builder | Run `PRELAUNCH-CHECKLIST.md`. Every box cites a rule ID and evidence. An UNKNOWN box blocks. |
| REVIEW (R) | Independent scorer, never the author | Fill the score sheet in `PUBLISH-BAR.md` Part E. Hard rules first, then the 100 points. |
| POST (X) | Publisher (Shop & Merch for products, Social & Local for posts, coding agent for the site) | Publish or post only after the gate in SC1 or PO1. Run the live checks (SC7, PO8). |

Override column: **N** = never overridable. **O** = ShoreList Chief may override under Section 1, with a log entry.

Counting: every ID row in Sections 1 to 11, 13 and 14 is one rule (120 in total). Section 12 is a scorecard, Section 15 lists conflicts.

## 1. Sales Override (owner, t37u)

The owner said: "you have permission to over power rules as long as it means more sales." ShoreList Chief may override any rule marked O when the evidence says the override raises net sales. Overrides are a tool for money decisions, not for speed or convenience.

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| SO1 | **Who and what.** Only ShoreList Chief overrides, and only rules marked O. | The log entry names Chief and every rule ID overridden is O. | B P X | One accountable decider avoids rule drift that confuses buyers. | N |
| SO2 | **Weigh all nine factors first.** Before any override, write a line on each: (1) net margin after discounts and fees, (2) conversion and AOV impact, (3) brand trust and luxury perception (long-term repeat sales), (4) return and refund risk, (5) honesty (a hard stop, see SO4), (6) sense of place and Wrightsville-first positioning, (7) seasonality and gift moments, (8) photo quality, (9) store structure (navigation, collections, above-the-fold heroes). | All nine lines present in the log entry before the change ships. | B P | Skipping a factor is how a short-term lift costs repeat customers. | N |
| SO3 | **Log every override** in `benchmark/override-log.md`: date and time ET, rule IDs, scope (product, post or site), one-line rationale, evidence label (VERIFIED, ESTIMATE or HYPOTHESIS), who gets reviewed and when. Log before acting. | Entry exists with a timestamp earlier than the change. | P X | A log lets us keep what raised sales and revert what did not. | N |
| SO4 | **Never overridable:** (a) honesty (HN rules, no false claims, no fake urgency), (b) legal and IP (BW3 to BW6: no real club flags, no copied patterns, no registered marks), (c) the brand wall (BW1, BW2), (d) RJ's yes for spending, outreach, subscriptions and account changes (OP1). | No log entry cites an N rule as overridden. | B P R X | One honesty or IP failure can cost the store, the ad account and the brand. | N |
| SO5 | **Size the override to its evidence.** An override backed only by HYPOTHESIS covers one product or one post and is reversible. Site-wide or multi-product overrides need VERIFIED or ESTIMATE evidence from real shop data (Shopify orders, sessions, add-to-cart). | Scope in the log matches the evidence label. | P | Small bets learn cheaply; big bets need data. | N |
| SO6 | **Review in 14 days.** Each override gets a keep or revert decision using real results (orders, conversion, refunds). If net sales did not rise or data is UNKNOWN, revert. | Review line added to the log by day 14. | X | Sales evidence, not opinion, decides what stays. | N |
| SO7 | **Overrides never skip independent review.** The scorer still scores; the log records the shortfall and the reason. The scorer is never the author. | Score file exists for the exact version. | R | An unscored product can ship a hidden hard-rule failure. | N |

## 2. Brand wall, legal and IP (BW)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| BW1 | **ShoreList only.** No other brand of the owner appears in any file, prompt, art, copy, link, analytics ID, account or audience. If a task needs both, stop and report. | Search the packet, files and copy for any other brand name: zero hits. | B P R X | A mixed brand confuses buyers and risks account bans on ShoreList's own channels. | N |
| BW2 | **ShoreList accounts only.** Posting tools, ad accounts and analytics used for ShoreList are ShoreList's own. A tool whose only channels belong to another brand is not used. | Each post route is a ShoreList account (@shorelist on Instagram and TikTok). | P X | Posts reach ShoreList's audience, which is the one that buys. | N |
| BW3 | **Original art.** Made for ShoreList from documented local reference. No stock icons, clip art, traced souvenir art, copied trade dress, knockoff designer marks, imitation red tabs, compass badges or famous stripe patterns. | `PROVENANCE.md` lists references and source files; side-by-side check against the closest rival finds no copy. | B R | Original art is what no local rival has, so it is our price power. | N |
| BW4 | **No borrowed institutional marks.** No real yacht club burgees, crests, flags or names, and no sports, college, military or government marks (state seals, NPS arrowhead). | Visual and text check: none present. | B R | Takedowns and disputes freeze listings during peak weeks. | N |
| BW5 | **No registered local names or landmark marks** in titles, art, merch or shop modules (for example "Johnnie Mercer's", Battleship marks, a lookalike of a local house mark). Factual editorial mention is allowed as plain text with no logo or implied endorsement. Record a trademark screen result (UNKNOWN is recorded as UNKNOWN). | Title, art and tag search against the banned-name list in `tools/ingest-shopify-products.mjs` and the design playbook finds none. | B P | Avoids cease-and-desist and delisting on a product we invested in. | N |
| BW6 | **Protect the coast in imagery.** Never show sea oats being picked, handled turtles, disturbed nests or off-trail dune walking. Sea oats and protected plants stay protected in art and lookbooks. | Image check: none shown. | B R | Locals, our core repeat buyers, punish harm to the dunes. | N |

## 3. Honesty and copy (HN)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| HN1 | **No false claims.** No ratings, reviews, awards, "best", "best seller", stock levels, sell-through, "handmade", "made in USA", "limited", "free shipping" or "every item on sale" unless proven with a source on file. | Text search of title, description, alt, tags and captions; every claim has a source. | B P R X | Trust is what makes a visitor pay a luxury price. | N |
| HN2 | **Show exactly what is sold.** Every photo shows the product the customer receives: color, text, design and scale. No color shown that is not sold. No baked-in AI lettering. | Open each image against the checkout variant. | P R X | Mismatch is the top cause of returns and bad reviews. | N |
| HN3 | **AI imagery is disclosed.** Lookbooks and stills carry the line "Lookbook image created with AI from the real product photo. The other photos show the actual product." on the product page and in the post caption. | Line present on the PDP and caption. | P X | Disclosure protects trust and platform standing. | N |
| HN4 | **Urgency only when real.** Use only real sale windows from `shop-promo.js` (SHOREFRIDAY15 Nov 27, SHORECYBER15 Nov 30, 15% off eligible Shopify orders, 12:00 AM to 11:59 PM ET), real order-by dates from a cited partner page, and real stock. No fake countdowns, no weekend sale language when no code runs, no invented deadlines. | Each urgency line cites its source (code window, partner cut-off URL). | B P R X | Real deadlines convert; fake ones burn trust and repeat sales. | N |
| HN5 | **Real prices and money terms.** Price on the card equals checkout. Shipping, tax and the delivery estimate show at checkout. Never promise delivery or invent a $0 shipping cost. Codes do not combine, and copy says so. | Card, PDP and cart price compare equal; copy has the checkout line. | P X | Surprise costs at checkout kill carts. | N |
| HN6 | **Returns line verbatim.** "Made to order just for you. If your item arrives damaged, defective or misprinted, contact us and we'll replace it." Damage claims go to rj@shorelist.net within 30 days. | Line present on every PDP. | P | A clear promise lowers purchase anxiety on made-to-order goods. | N |
| HN7 | **No em or en dashes** anywhere (title, description, alt, tags, SEO, captions, on-screen text). | `grep -nP '[\x{2013}\x{2014}]'` returns nothing. | B P R X | Site check fails the build; a failed build blocks the sale. | N |
| HN8 | **Banned wording absent.** No "Cape Fear coast", "shore thing", "yacht club", "beach club", "est." or "since" years, "heritage", "legacy brand", "handcrafted in", "Pier" in clothing titles (unless the title also says print, poster or art), divisive slogans, or any word on the ingest tool list. | Text search for the list: zero hits. | B P R | The site and ingest gates hold banned items, so a hit delays launch. | N |
| HN9 | **No invented data.** No made-up tests, sales, traffic, reviews, inventory or history. Facts are labeled VERIFIED, ESTIMATE, HYPOTHESIS or UNKNOWN. | Each number has a label and a source or method. | R X | Decisions made on fake numbers lose money. | N |
| HN10 | **Place facts are accurate.** Geography, species, bridge and jetty shapes, and shell or tooth locality are checked against a map, authoritative record or the design playbook section 8. Fossil teeth are black or grey, not white. | One cited source per place or species claim. | B R | Locals notice errors instantly and tell friends. | N |
| HN11 | **Copy structure.** A short scene opener, then a spec block: blank maker and model, weight, fiber, decoration method, placement size, finishing, fit note, care, made-to-order and order-by lines. Plain, local, factual. | Spec block has every field. | B P R | Specifics answer buyer questions and lift conversion and SEO. | O |

## 4. Art and design (AR)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| AR1 | **Restrained luxury.** Fine-line or tonal art, small precise placement, one quiet type line at most. No cartoon, souvenir badge, slogan, pun or big block text. It passes the "would sit in a Kiel James Patrick or Southern Tide store" test. | Reviewer scores Luxury look B1 at 8 or more and cites the rival comparison. | B R | The luxury look is what supports $78 to $98 prices over $30 souvenir tees. | O |
| AR2 | **Tonal or embroidered on premium categories.** Caps, quarter-zips, crewnecks and polos use embroidery or a tonal mark, not a large printed graphic. | Decoration method matches the category table in BL2. | B R | Rivals embroider at these prices; printed graphics invite "cheap" reviews. | O |
| AR3 | **ShoreList palette.** Harbor Navy #0E1F33, Sailcloth White #F4F1EA, Dune Sand #D9C7A3, Sea Glass #9FC3B8, Signal Red #B5362F (one small accent), Weathered Teak #8A5A3B. Solid spot colors, 1 to 3 per design, no gradients, glows or halftones on garments. One Wrightsville sunset tone (pale apricot, muted coral or oyster) may replace one palette color when a reference photo is attached. | Hex check of the art file; reference photo on file for any sunset tone. | B R | A recognizable palette makes the shelf read as one brand. | O |
| AR4 | **No white on dark.** No white ink, thread, cords, linings, hoods, rib or labels on navy or black pieces. Check the real mockup of the exact color, including the inside label. | Mockup at 100%: no white halo, thread or lining on a dark color. | B P R | White-on-navy is the most common "cheap" tell and a return reason. | O |
| AR5 | **Pepper and grey only at luxury quality.** Allowed only when the piece scores Luxury look 8 or more from the independent reviewer, uses a premium named blank, and is not a cheap boardwalk print-tee look. Otherwise Pepper and grey stay off. | Score file shows B1 8+ for that color; named blank in packet. | B R | Neutral colorways widen the buyer pool only if they do not cheapen the shelf. | O |
| AR6 | **Lettering is vector.** Image models draw text-free shapes only. All words are set by hand in vector and outlined. Small-size test: render at 160 px wide and 1 in; every word stays readable. | Source SVG exists; small-size PNGs attached. | B P | Wobbly or misspelled letters get photographed and shared for the wrong reason. | N |
| AR7 | **Print files are clean.** 300 DPI at final size, transparent PNG plus source SVG, safety pad inside the print area, never clipped, stretched or blurry, min stroke 1.5 pt, min cap height 0.25 in on apparel. Fit to the supplier placement overlay. | File properties and mockup show no clipping at any angle. | B P | Misprints become refunds and replacements. | N |
| AR8 | **Embroidery spec.** 2 to 3 thread colors, min stroke or column 1.5 mm, small hub dots 3 mm or more; thicken thin lines in the embroidery file only. | Embroidery file and mockup check. | B P | Embroidery that fills in looks cheap at hat size. | O |
| AR9 | **One named place, drawn accurately, Wrightsville first.** Each design names a specific place (Banks Channel, Masonboro Inlet, the Loop, Airlie, Carolina Beach, Kure Beach) using the design playbook section 8 library. "Coastal NC" is not a place. | Reviewer scores Sense of place B2 at 8 or more with a source. | B R | Specific local art is what locals and visitors buy to remember a place. | O |
| AR10 | **No club wording, burgees, badges or circles.** No "Beach Club" or "Yacht Club" wording, no burgee word or motif, no badge or circle devices, no unnecessary numbers or stray letters, no "Est." year. | Design-gate checks and visual review find none. | B R | The repo ingest gate holds these items, so they cannot sell. | N |
| AR11 | **Duplicate control.** No more than 2 live products for the same art and category. Do not repeat a retired design (for example the white megalodon tee). Check the live catalog before building. | Catalog search shows the count within the cap. | B | Duplicates split reviews and photos and crowd out better sellers. | O |
| AR12 | **Head-to-head against rivals.** The closest local rival and closest premium rival (URL, price) are named, and ours wins on at least 3 of 5 axes (art, blank, photos, copy, finishing) and loses on neither blank nor photos. | Head-to-head table in the packet. | B R | Beating the rival we are priced against is what justifies the price. | O |

## 5. Blanks and materials (BL)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| BL1 | **Premium named blank, spec verified.** Maker and model named (Comfort Colors 1717 or 1566, AS Colour 5146 or 5145, Yupoong 6245CM, Richardson 112, Liberty Bags 8866, Port Authority BG412 or PT42). Material, weight and size verified from the supplier API, a maker spec sheet or a sample. "Cloth", "canvas", "generic" or "unbranded" fails. Samples are not required when a maker spec sheet or API verifies the spec. | Supplier record or maker spec URL in the packet. | B P R | Named premium blanks are why a $88 crewneck feels worth $88. | O |
| BL2 | **Category floors.** Tee: Comfort Colors 1717 or equal garment-dyed. Crewneck: Comfort Colors 1566 or AS Colour 5145 class. Hoodie: AS Colour 5146 (400 GSM) class. Quarter-zip: not a basic midweight fleece above $90. Cap: named maker, embroidery only. Beanie: named cuffed knit. Tote: named heavy canvas with oz and inches. Towel or blanket: named (PT42, BP91 class). Framed print: named frame, paper and size list. | Packet names the blank that meets its category row. | B R | Category-right blanks stop "not as described" returns. | O |
| BL3 | **Exact variant mockup checked.** Open every mockup angle for the exact color: lining, cords, rib, label, sleeves, hood, brim, handle, seams. | Screenshots for every angle in the packet. | P | Catching a clipped print before launch avoids refunds. | N |
| BL4 | **Sizes and fit.** Apparel S to 3XL where the blank offers it, size chart and a fit note, every size priced and in stock at the supplier. | Variant table matches supplier availability. | B P | Missing sizes lose the sale outright. | O |
| BL5 | **Finishing details.** Woven or printed neck label and hang-tag style detail where the provider supports it; list label, closure and hardware details in the spec block. Paid label or tag services need RJ's yes. | Spec block lists finishing; any spend is on `rj-morning.md`. | B R | Finishing is where KJP and Duck Head justify premium prices. | O |

## 6. Photos (PH)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| PH1 | **Two-photo minimum (hard).** Image 1 is a disclosed lookbook in a recognizable local scene. Image 2 is the real supplier mockup or studio photo of the exact sellable variant. A second studio angle or a resized copy does not count as the lookbook. | Gallery order in the Shopify draft shows both. | P R X | Lifestyle first is what stops the scroll; the studio shot proves the product. | N |
| PH2 | **A 90 needs 3 or more photos:** (1) lookbook, (2) studio or mockup, (3) detail close-up or scale shot. Apparel target 5 or more (add back view and fit shot). Fewer than 3 caps the total at 89.9. Category image targets are in `PUBLISH-BAR.md` Part C. | Photo count and order in the review sheet. | B R | More views raise add-to-cart rate and cut "what does it look like" returns. | O |
| PH3 | **Recognizable local scene.** Locals must be able to name the place: Wrightsville (Banks Channel, the Loop, the Harbor Island side), Masonboro, the Riverwalk, Carolina Beach boardwalk, Kure Beach. Generic dunes do not count. Wrightsville first. | Reviewer names the place from the image alone. | B R | Place recognition is the reason to buy here over a generic brand. | O |
| PH4 | **Looks like real camera photography.** Real ordinary-looking people (ages 30 to 60, not models), candid, not looking at the lens, natural, overcast or dusk light, visible film grain, 35mm look, medium-wide, environment visible. No glossy AI look, airbrushed skin or HDR orange-teal sky. | Reviewer blind-scores realism 8 or more. | B R | Believable photos convert; glossy AI images read as ads and fake. | O |
| PH5 | **Art at true scale and exact color.** The art width relative to the garment matches the studio mockup within 1.15x (the flat-versus-model difference of 1.13x to 1.15x is a known supplier artifact). Color is exact, not near. Lettering complete, sharp, not cropped or enlarged. Reject a lookbook with art 1.2x or more off. | Side-by-side at matched scale and crop. | R | Oversized art in the lookbook creates "not what I ordered" refunds. | N |
| PH6 | **Provenance on record.** Generator named truthfully (ChatGPT or Higgsfield), generation ID, prompt, file names and SHA-256 digests in `PROVENANCE.md` and `docs/shop-photo-review.json`; the independent reviewer cites the reviewed revision digest. | Provenance entry exists for every image. | P R | Provenance lets us defend and reuse an image if challenged. | N |
| PH7 | **Resolution and quality.** Lookbook exported 1536 x 2048 JPEG q95 (3:4 or 4:5), screen assets at 2x display size, sharpness 150 or more. No upscaled thumbnails; if upscaling, blend with the original to keep grain. | File check. | B P | Sharp images carry the card on mobile, where most shoppers browse. | O |
| PH8 | **Flat white mockups are not promo images.** In posts and ads they score 7 of 10 at most. Promo uses real-camera lifestyle stills. | Post visuals are lifestyle stills. | X | Scroll-stopping imagery earns the reach that pays for the sale. | O |
| PH9 | **Gallery order on live items.** For new products the lookbook is image 1. For live products, a lookbook that has not passed fidelity and provenance review sits at image 2 (mockup first) and moves to image 1 once it passes. | Order matches review status. | P X | The best-fidelity image leads, which protects trust and conversion. | O |
| PH10 | **Photo backfill for live products.** Not pulled during the launch freeze. From Dec 1, Wrightsville first, then best-sellers first by Shopify orders (VERIFIED from Admin when available), then the rest. Live products stay live; the new-item gate is not applied retroactively. | Backfill queue ordered by town then sales rank. | X | Photo effort goes first where traffic and sales already are. | O |
| PH11 | **Generation route and spend.** Lookbooks come from the owner's ChatGPT (reference photo attached, prompt from Prompt Bot's daily file) or from credits already paid for. Any new credit purchase or paid generation needs RJ's yes. | `rj-morning.md` entry for any spend. | B | Zero surprise spend, owner time spent on highest-value images. | N |
| PH12 | **Re-verify after any sync.** After any Printify or CJ re-sync or republish, re-read the gallery, colors and descriptions, because a sync can restore removed images or drop attached ones. | Read-back of image count and order after sync. | X | Prevents old banned or wrong images returning to a live listing. | N |

## 7. Price and margin (PR)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| PR1 | **Margin after the code.** `0.85 x retail - base - placements - size upcharge - card fees >= $25` on the lowest-margin sellable variant (usually 2XL and up). Show the math with the source of every cost. Fees use the rate VERIFIED from Shopify Admin; until then use the Shop & Merch stated rate and label it ESTIMATE. | Price math table with sources. | B P R | Sales that lose money after a 15% code are not sales. | O |
| PR2 | **Small-goods exception.** Items at $40 or less default to the $25 floor. Chief may approve a lower floor for a traffic-driving gift item, never below $12 net (ESTIMATE; RJ's own answer on `rj-morning.md` replaces this when given). | Log entry plus the net math. | B R | Cheap gifts bring first-time buyers who add a $78 piece. | O |
| PR3 | **Fix margin by price, not blank.** If margin fails, raise the price; if the new price leaves the band, rethink the product. Do not switch to a cheaper blank. | No blank downgrade in the revision. | B | Protects the luxury look that holds the price. | O |
| PR4 | **Inside the competitor band** for its tier (`coastal-benchmark.md` section 5), or a written head-to-head (rival URL, price, why ours is better). Bands: tee $44 to $48, crewneck $78 to $88, hoodie $88 to $98, quarter-zip $88 to $118, cap $36 to $45 unless finishing beats KJP's $45, beanie $28 to $34, tote $36 to $48 ($78 or more only with leather or rope handles), towel up to $68, blanket $78 to $98, framed print $59 to $89. | Price within band or head-to-head attached. | B R | Priced inside the band we convert; above it we must earn it. | O |
| PR5 | **Hat and beanie ceiling.** Cap retail does not exceed $49 and beanie about $32 (ingest gate), and cap above $45 needs the head-to-head in PR4. | Ingest tool and packet agree. | P | The ingest gate blocks items above the ceiling. | O |
| PR6 | **No price changes during the sale** unless fixing a price or claim error. Live price reviews happen Dec 1. | Price history shows no mid-sale edits. | X | Mid-sale edits confuse buyers and break promo parity checks. | O |
| PR7 | **Fourthwall and off-Shopify items:** margin tested at list price; the page says "checks out separately" and that shop codes do not apply. | Page copy and math present. | P R | Honest separate-checkout notice prevents abandoned carts and chargebacks. | N |

## 8. Money rules (MN)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| MN1 | **Wrightsville Beach first.** Wrightsville leads the nav, shelf order, first screen, collection order, new builds and posts. Target at least 40% of new builds and posts (ESTIMATE target). | Order of nav, shelves and post plan show Wrightsville first. | B X | Wrightsville is the strongest local pull and the first place visitors ask for. | O |
| MN2 | **Gifts under $35 above the fold.** The first mobile screen (390 px) shows four priced pieces under $35, Wrightsville first (live now: Sea Oats sticker $6, Wrightsville can cooler $12, 2026 ornament $18, sloop zip pouch from $28). | Screenshot at 390 x 844 shows four priced cards. | X | Low-price entry items cut hesitation and start the first order. | O |
| MN3 | **Price ladder with anchors.** Every town has three tiers: gift ($35 or less), core ($42 to $98) and anchor ($84 or more, such as the framed print, hoodie or quarter-zip). Show an anchor next to core items. | Tier count per town in the catalog sheet. | B | An anchor makes the core price look fair and lifts average order value. | O |
| MN4 | **Bundles and AOV.** Offer a set per gift moment (for example Wrightsville Beach Day Kit: towel, tote, hang tag, Shore Picks card). Set discounts only when base costs are VERIFIED and the bundle margin passes PR1 at the bundle price. Each PDP links 2 to 4 same-town or pairing items. | Bundle math table; PDP shows pairings. | B P | Bundles raise order value without more ad spend. | O |
| MN5 | **One CTA and tagged link on every post and email.** One destination: the Shopify product URL or `shorelist.net/shop/<town>`, with `utm_source`, `utm_medium`, `utm_campaign` and `utm_content`. Links return HTTP 200 (not `shorelist.net/shop/{id}`, not `/discount/CODE`, which 404). | Link check returns 200; UTM present. | P X | Tagged links show which post earned the order, so we repeat what works. | O |
| MN6 | **Cart-check before any code is posted.** Add a featured item to a Shopify cart, confirm the code applies inside its window and a control code is rejected, stop before payment. Monday posts stay held until the 12:15 AM ET Nov 30 check. | Dated cart-check note per code. | P X | A dead code on a live post burns the best traffic day of the year. | N |
| MN7 | **Discounts only in planned windows.** Fri SHOREFRIDAY15, Mon SHORECYBER15, nothing Sat or Sun. No new codes, no stacking, no extra discount without Chief and the margin math. SHOREWELCOME10 is not promoted until re-verified. | Code list matches `shop-promo.js` and Admin. | X | Predictable discounts protect margin and stop buyers waiting for the next code. | O |
| MN8 | **Reviews and social proof only when real.** Today there are 0 public reviews (VERIFIED). Show real reviews only after they exist; use real photos with permission; show RJ's Wilmington base and contact in a trust block. Review apps and Business Profile need RJ's yes. | Every proof element has a real source. | B X | Real proof lifts conversion; fake proof destroys it. | N |
| MN9 | **Best-sellers get the most photos and posts.** Rank by Shopify orders (VERIFIED from Admin when available; until then use featured and startHere flags as ESTIMATE). The top 10 get 5 or more photos and at least one Reel or post per week. | Rank list and photo counts in the weekly report. | B X | Effort goes where demand is proven. | O |
| MN10 | **Kill or fix slow items.** Day 21 live with 0 orders: fix photos, title and price. Day 45 with 0 orders: retire to DRAFT (reversible, never delete), unless the item is a deliberate gift-ladder or anchor piece. Thresholds are ESTIMATE until traffic data exists. | Review date and decision in `ship-log.md`. | X | Shelf space and photo budget belong to items that sell. | O |
| MN11 | **Every new product ties to a search or a gift moment.** The packet names the target local query (from the keyword map) or a gift moment (Christmas, housewarming, wedding, graduation, beach trip, boat owner, dad). No tie, no build. | Query or moment named in the packet. | B | Building to demand beats building to taste. | O |
| MN12 | **Season and supplier timing.** Build the next gift moment 6 or more weeks ahead of its cut-off. Record supplier cut-offs (for example Fourthwall's Nov 28 standard and Dec 4 express for Dec 24 knit delivery). Wrightsville peak is Memorial Day to Labor Day (HYPOTHESIS). | Calendar row in the build plan. | B | Missing a cut-off wastes the whole gift season for that item. | O |
| MN13 | **Decide with real data.** Weekly report uses Shopify orders, sessions, add-to-cart, conversion and AOV. GA4 and Search Console are not connected, so those numbers are UNKNOWN and never invented. | Report labels each metric VERIFIED or UNKNOWN. | X | Decisions on guesses waste ad and photo budget. | N |
| MN14 | **Trust and delivery clarity above the CTA.** PDP shows made-to-order, shipping and estimate at checkout, returns line and contact before the buy button. | PDP screenshot. | P | Reduces last-second abandonment on made-to-order goods. | O |
| MN15 | **Hero stock check.** Every hero and every ad destination has all sizes in stock and the lead image matching checkout. | Spot check before each post. | P X | Sending paid or organic traffic to a sold-out size wastes the click. | O |
| MN16 | **Fourthwall out of sale windows.** Harbor Goods or Fourthwall items are not featured in a coded sale because codes do not work there and checkout is separate. | Sale creative has Shopify items only. | X | Avoids angry "code does not work" buyers. | N |

## 9. Store structure (ST)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| ST1 | **Navigation order.** Shop nav and town shelves run Wrightsville Beach, Carolina Beach, Kure Beach, Wilmington. Gifts and the gift guide are one tap from the top. | Nav screenshot. | B X | Shoppers click what they see first. | O |
| ST2 | **First screen at 390 px.** Headline "Goods from Wilmington's coast.", four priced gift cards under $35, then a premium hero (Wrightsville first) within one scroll. No promo banner covers the bag button. | Screenshot at 390 x 844 and 1280 x 800. | X | The first screen decides whether a visitor stays. | O |
| ST3 | **Hero order.** Gift hero, then town heroes (`startHere`), then anchors. A hero has all sizes in stock, 3 or more photos and a lookbook, and passes the gate (or has a lookbook plus passes G6). Rotate heroes by season and by sales rank. | Hero list reviewed weekly. | B X | The best-supported items lead, so paid traffic lands on products that convert. | O |
| ST4 | **Collections.** Every product sits in exactly one town collection and one category (Tees, Crewnecks, Hoodies, Hats, Home, Gifts), plus a gift price tier tag. No junk tags. Max 12 cards visible per shelf before "see more". | Tag audit of the catalog. | B P | Clean collections let shoppers find an item in two taps. | O |
| ST5 | **Filters and sort work.** The collection filter and sort function on mobile and desktop; default sort is hero order, not newest. Known filter bug is fixed through the repo pipeline. | Test pass on both widths. | X | A broken filter loses the shopper who knew what they wanted. | O |
| ST6 | **Gift paths.** A gift guide page with price tiers (under $35, $36 to $60, $61 to $100, over $100), by town, and by gift moment. Each gift card says made to order and links to shipping and returns. | Gift guide page exists with the four tiers. | B X | Gift shoppers buy faster and spend more with a path. | O |
| ST7 | **Card standard.** Lead image per PH9, correct "from" price, no sold-out lead variant, alt text that describes product and scene (no file names, no dashes). | Card check on each changed product. | P X | Cards are the storefront; a wrong card is a lost sale. | O |
| ST8 | **Cross-sell and add-on.** PDP shows 2 to 4 same-town or pairing items; the bag suggests one add-on under $35. | PDP and bag screenshots. | B X | Small add-ons lift AOV with no discount. | O |
| ST9 | **Mobile first and fast.** Check 320, 390 and 1280 widths; tap targets 44 px or more; CLS 0.1 or less; Lighthouse 90 or more on performance, accessibility, best practices and SEO for touched pages (shop baseline 92). | Lighthouse and screenshot evidence in the PR. | P X | Most local shoppers are on phones; slow pages lose them. | O |
| ST10 | **Separate sections are labeled.** Harbor Goods or Fourthwall items sit in a clearly labeled section with a "checks out separately" line and are excluded from code copy. | Section copy check. | P X | Honest labeling prevents cart confusion. | N |
| ST11 | **Retired products redirect.** A retired handle goes to DRAFT and its URL redirects to its town shelf so search traffic is not lost. | Redirect test. | X | Keeps SEO and links earning after a product leaves. | O |

## 10. Scoring and the publish gate (SC)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| SC1 | **Publish without asking only when all hard rules pass and the independent score is 90 or more.** Hard rules: H1 to H11 in `PUBLISH-BAR.md` Part A, which map to the rule IDs listed at the top of that file. Score: 100-point sheet in `PUBLISH-BAR.md` Part B, with 3 or more photos. Then publish and log. This replaces mean 8.0 and the 9.5 gate. | Score file 90 or more plus all hard rules PASS in the sheet. | R X | Products that clear this bar are the ones that earn repeat buyers. | O |
| SC2 | **Independent scorer.** The scorer is not the author, the score names the exact version (art, blank, color, photo set digests), and an earlier version's score does not carry over. Author scores are ESTIMATE only. | Score file shows scorer, date and digests. | R | Honest scoring keeps weak products off the shelf. | N |
| SC3 | **Decision bands.** 90 or more with every hard rule PASS: publish. 80 to 89.9: fix and rescore, or batch on `rj-morning.md`. Below 80 or any hard FAIL: hold. | Decision recorded on the sheet. | R | Fixing the 80s is cheaper than shipping a refund-prone item. | O |
| SC4 | **Line minimums.** No line under 8 on B1 to B6 and none under 7 on B7 to B9 (folds in the repo G6 "each 8 or more" and the old "no line under 7"). | Sheet lines. | R | One weak line (blank, photo) is what customers feel. | O |
| SC5 | **Repo gate G6 is satisfied by the same review.** The reviewer also records the five brand-match evidence items (local fidelity, coastal luxury, personal connection, originality and execution, presentation accuracy), the ten product criteria and a blind photo score of 8 or more. Where the repo asks for owner quality approval on new merchandise, the owner's Nov 27 delegation (t31u) stands in for it. | Review record has all items. | R | One review satisfies two gates, so we ship faster. | O |
| SC6 | **Log every release.** Product ID, live URL and score file in `ship-log.md`; site changes in `CHANGELOG.md` with only what was verified. | Entries exist. | X | Logs make rollback and learning possible. | N |
| SC7 | **Post-publish live check.** Live URL returns 200; price and variants equal Shopify; Online Store channel on; images in the right order; alt text set; `sw.js` VERSION matches `main` for site changes. If live does not match, say so. | Live read-back saved as evidence. | X | A product that is not visible sells nothing. | N |
| SC8 | **Evidence standard.** Every score line cites a file, URL or screenshot. | Reviewer can open each citation. | R | Evidence-based scores predict sales better than opinion. | N |

## 11. Posting (PO)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| PO1 | **Post only finished content that passed the 100-point post score of 90 or more** and has no hard-rule fail. Post scorecard is in Section 12. Old 8.0 scores convert (8.33 becomes 83) and do not count until rescored. Scorer is not the author. | Post score file 90 or more. | R X | Only strong posts earn the reach the sale depends on. | O |
| PO2 | **Lead with gifts under $35, Wrightsville first.** One hero product per Reel. Best-sellers get the most slots (MN9). | Post plan order. | B X | Low-price Wrightsville gifts are the easiest first purchase. | O |
| PO3 | **Real-camera or disclosed stills.** Footage is the real product, or a disclosed lookbook of the exact variant, or a disclosed ChatGPT still. Caption carries the HN3 line. | Disclosure line in caption. | P X | Honest imagery keeps platform standing and buyer trust. | N |
| PO4 | **Code copy rules.** "Enter the code at Shopify checkout. Codes do not combine." Friday SHOREFRIDAY15 and Monday SHORECYBER15 only, after the MN6 check. Saturday and Sunday: no code, no percent, no sale language; Sunday teaser only: "Cyber Monday offer returns Monday, November 30." | Copy diff against these lines. | P X | Accurate offer copy avoids refunds and angry comments. | N |
| PO5 | **Order-by line only with a cited source.** "Order by Dec 7 for Christmas" may run only if the source (a published partner cut-off page) is attached to the post file and the line is labeled a recommendation. If no source, remove it. Asking partners is outreach and needs RJ. | Source URL on file. | P X | Real deadlines drive gift orders; invented ones cost trust. | N |
| PO6 | **Channels and handles.** Instagram `@shorelist` and TikTok `@shorelist` only. No Facebook or X claims. Connecting accounts needs RJ's yes. The running TikTok ad campaign is untouched. | Post route check. | P X | Posting on the right accounts reaches the real audience. | N |
| PO7 | **No outreach or paid push.** No DMs or emails to people or businesses, no boosts or ad spend without RJ. | None sent. | X | Prevents unapproved spend and reputational risk. | N |
| PO8 | **Link and asset hygiene.** Check that the CTA link returns 200 and the product shows the same color and price. Do not build shots on Shore Picks images that return 404 (23 of 64 at last check); link those pages in text only. | Check log. | P X | A broken link wastes the post. | O |
| PO9 | **Post timing.** Scheduled times follow the daily loop in `MASTER-PLAN.md` (Fri 8 AM, 12 PM, 4 PM, 8 PM; Sat 10 AM; Sun 11 AM; Mon 8 AM, 12:30 PM, 7 PM ET). Times are HYPOTHESIS until analytics exist. | Schedule matches the plan. | X | Consistent cadence builds a posting habit and a data trail. | O |
| PO10 | **Report on real analytics only.** Post results come from platform analytics or UTM orders, never guesses. | Report labels. | X | Learning what works compounds sales. | N |

## 12. Post scorecard (100 points, used by PO1)

| Line | Points | What full marks look like |
|---|---:|---|
| Hook and clarity | 15 | First 2 seconds show the product and the offer or gift reason in plain words. |
| Product fidelity and honesty | 20 | Exact variant, price, code and dates correct; disclosure present; hard fail at 0. |
| Sense of place | 15 | A named, recognizable local scene (Wrightsville first). |
| Visual quality | 15 | Real-camera look, sharp, true scale, no glossy AI. |
| CTA, link and UTM | 15 | One clear action, link 200, UTM present. |
| Brand and luxury tone | 10 | Restrained, on palette, no slogans, no dashes. |
| Offer accuracy | 10 | Code window, cart-check and no stacked claims. |

Hard fails (any one holds the post): BW, HN, PO3 to PO7. 90 or more with no hard fail posts without asking.

## 13. Suppliers (SU)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| SU1 | **CJ is the default only where the blank can be verified.** An unspecified "Cloth" blank is a hard fail and the art moves to a named Printify blank (for example Liberty Bags 8866 or Port Authority BG412). CJ improves with our own print, labels, inserts and bundles. | Verified spec in the packet or product moved. | B R | Keeps CJ's cost advantage without cheapening the shelf. | O |
| SU2 | **Printify makes apparel waves on premium named blanks.** It is not connected yet; connecting is RJ's yes. | Packet names the Printify blank and base from the account, or labels it ESTIMATE from the public price list. | B | Named blanks carry the apparel margin and look. | O |
| SU3 | **Fourthwall only for premium extras** that fit neither Printify nor CJ, as a separately checked-out section. It does not integrate with Shopify (VERIFIED), custom manufacturing needs about $50,000 a year in sales, and sign-in is the owner's. | Section plan and PR7 pass. | B | Extras widen the range without breaking Shopify codes. | O |
| SU4 | **Duplicate check across suppliers** (Shopify, Fourthwall, CJ, Printify) before proposing a product. | Search result in the packet. | B | Avoids building the same item twice. | O |
| SU5 | **Margin screen includes freight.** Contribution at normal price and at the 15% stress case, with freight to a ZIP, support risk and returns. | Calc in the packet. | B P | Freight surprises erase thin margins. | O |
| SU6 | **Samples and sample budget need RJ.** The packet says what a sample would prove. | Entry on `rj-morning.md`. | B | Spend only where a sample changes the decision. | N |

## 14. Process and approvals (OP)

| ID | Rule | Pass/fail test | Step | Why it makes money | Ovr |
|---|---|---|---|---|---|
| OP1 | **RJ's yes is required for:** spending (samples, credits, ads, apps with fees, counsel), new subscriptions, emails or DMs to people or businesses, and account or permission changes (Printify, CJ app, Search Console, GA4, Business Profile, social connections). Batch in `rj-morning.md` with price and deadline. Gate-passed products, site deploys and scored posts do not need a fresh yes. | Entry exists before any such action. | B P X | Protects cash and accounts while the pipeline runs unattended. | N |
| OP2 | **Repo pipeline.** Fresh branch off `main`, claim files in `CODEX_TASKS.md`, bump `sw.js` VERSION when cached files change (docs-only changes do not need it), run `check-site`, `check-keywords` and `thin-content-gate`, open a PR, squash merge when `check` is green, then verify live. | PR evidence lists commands and exit codes. | B P X | A clean pipeline keeps the live site from regressing mid-sale. | O |
| OP3 | **One writer per file.** Claim before work; Chief is the sole assigner; hand off on `TASKBOARD.md`. | Claim row exists. | B | Prevents overwrites that break live listings. | O |
| OP4 | **Record every Shopify edit** (what, before, after) in `CHANGELOG.md` or `ship-log.md`, and mirror edits into Printify before any re-sync. | Entry exists. | X | Reversible edits let us undo mistakes fast. | N |
| OP5 | **No secrets.** Never print, log or commit credentials; no passwords or terms accepted for the owner. | Diff secret scan clean. | P X | A leaked key halts the store. | N |
| OP6 | **Launch freeze through Mon Nov 30, 11:59 PM ET.** Only fixes for browsing, bag, checkout, or a price or claim error, plus overrides logged under Section 1. | Change list vs freeze. | X | Peak days need stability. | O |
| OP7 | **Retiring a product.** Retire means DRAFT, never delete. The five already on `rj-morning.md` stay there until RJ answers; later retirements follow MN10 and are logged. | `ship-log.md` entry. | X | Reversible pruning keeps the shelf strong. | O |
| OP8 | **Keep this rulebook the only rulebook.** Rule changes go through a PR to `docs/command-center/SHORELIST-STANDARDS.md` and are recorded in Section 16. Other files reference rule IDs and do not copy text. | No duplicate rule text in other docs. | P | One source stops rules drifting apart. | N |
| OP9 | **Stay lean on usage.** Prefer reuse of existing evidence and files over new generation or research. | n/a | B | Lower cost per shipped product. | O |

## 15. Conflicts found and how they are resolved

| # | Conflict | Sources | Resolution |
|---|---|---|---|
| 1 | Pepper and grey banned versus allowed | Design playbook section 9 and `tools/design-gate.mjs`, repo Coastal Brand Standard hard-failure list (banned); owner color ruling Nov 26 11:56 PM, OPERATING-MANUAL (allowed at luxury quality) | Owner's later ruling wins: AR5 allows Pepper and grey only at Luxury look 8 or more. The ingest gate and the repo Brand Standard wording still block them until the coding agent updates `design-gate.mjs` and the standard; until then each such item needs a logged override. |
| 2 | Old mean 8.0 gate versus 90/100 | Merch prompt, Amendment-1, `design-playbook.md` rubrics, `MASTER-PLAN.md` | 90/100 replaces 8.0 everywhere (SC1). Playbook Rubrics A and B survive as the content of B1 and B2. |
| 3 | 9.5 per SKU gate in the merch prompt | Merch prompt sections 1, 6, 7 | Replaced by SC1 and SC4. The "set Public only if 9.5" step follows SC1. |
| 4 | Repo asks for owner approval on new merchandise; owner delegated publishing | `AGENTS.md` rule 1, `RELEASE_GATES.md` G6 versus Amendment-1 and t31u | t31u delegation stands (SC5). Pointer lines added to both repo docs. G6 evidence still collected in the same review. |
| 5 | Two different "90" scores (brand match 5 x 20 versus the 100-point sheet) and G6 means | Coastal Brand Standard, G6, `PUBLISH-BAR.md` | One independent review produces both; both must be 90 or more (SC1, SC5). Stricter wins. |
| 6 | Photo rule: "0 of 124 pass" versus live products staying up | Photo rule audit versus MASTER-PLAN | New items gated now; live items stay; backfill from Dec 1, Wrightsville first, then best-sellers (PH10). |
| 7 | Lookbook first versus lookbook at image 2 on live items | Photo rule, `PUBLISH-BAR.md` H5 versus photo consistency audit | New items lookbook first; live items at image 2 until fidelity and provenance pass, then image 1 (PH9). |
| 8 | "Yacht & Beach Club" wording and burgee motifs in the merch prompt | Merch prompt section 2 versus `design-gate.mjs`, Coastal Brand Standard, H2 | The ban wins (AR10, BW4). The prompt's club lines and burgee motifs are superseded; Prompt Bot's question to RJ stays on `rj-morning.md` and only RJ can reverse it. |
| 9 | "No samples needed to list" versus verified spec | Merch prompt hard rule 8 versus `PUBLISH-BAR.md` H3 and CJ ruling | A maker spec sheet or API record is enough for named blanks; samples only for unverifiable blanks and need RJ (BL1, SU6). |
| 10 | $25 margin "over base after placements" versus after the 15% code | Merch prompt versus `PUBLISH-BAR.md` H7 | After the code and fees wins (PR1); small-goods exception by Chief only (PR2). |
| 11 | Cap and beanie price ceilings versus competitor band | `design-gate.mjs` ($49 caps, $32 beanies) versus coastal benchmark ($36 to $45) | Stricter wins: band applies; above $45 needs a head-to-head; ceiling stays (PR4, PR5). |
| 12 | Lookbook tool: fal paid generation, Higgsfield field, ChatGPT | Merch prompt section 5, repo Brand Standard (`lookbookGenerator: Higgsfield`), MASTER-PLAN | ChatGPT via the owner or already-paid credits (PH11); record the real generator in `shop-photo-review.json`. The coding agent should let the repo field accept ChatGPT. |
| 13 | Scorer identity | Amendment-1 (named scorer), Reels draft (Chief scores), MASTER-PLAN (Claude) | Any independent scorer who is not the author; Chief does not score work Chief authored (SC2, PO1). |
| 14 | "Order by Dec 7" on every Reel versus "no order-by date published" | Reels draft versus `rj-morning.md` item 4 and BF brief | Allowed only with a cited public partner cut-off and labeled a recommendation (HN4, PO5). If no source, remove it. Asking partners needs RJ. |
| 15 | Six-color garment palette versus Wrightsville sunset palette | Merch prompt versus repo Brand Standard | Core six first; one sunset tone may replace one color with a reference photo (AR3). |
| 16 | Image counts: 2 minimum, 3 for 90, category targets of 4 to 6 | `PUBLISH-BAR.md` H5, Part C | 2 is the hard minimum, 3 is the 90 minimum, category numbers are B4 targets (PH2). |
| 17 | Reels scored on the 8.0 scale | Reels draft and scores | Rescore on the 100-point sheet; 8.33 equals 83 and does not clear (PO1). |
| 18 | Retiring products needs RJ versus owner's override power | `rj-morning.md` retirement ask versus t37u | Retire is DRAFT only and reversible; the 5 pending stay with RJ; later ones follow MN10 and are logged (OP7). |
| 19 | Launch freeze versus sales override | MASTER-PLAN freeze versus t37u | Freeze stays through Nov 30; Chief may override with a logged entry (OP6). |
| 20 | Small-goods margin floor pending versus $25 rule | `rj-morning.md` versus H7 | $25 default; Chief may approve down to $12 net for traffic-driving gifts; RJ's answer replaces it (PR2). |
| 21 | AI lifestyle imagery avoided versus lookbooks required | `AGENTS.md` rule 7 versus photo rule | Both hold: lookbooks required, disclosed, true to product and checked for fidelity (HN2, HN3, PH5). |

## 16. Rulebook changelog

- 1.0, Nov 27, 2026, about 1:15 AM ET: first consolidated rulebook. Replaces the scattered rules in the merch prompt, `PUBLISH-BAR.md` Part A, the playbooks and the audits. Added money rules (MN), store structure (ST), the Sales Override (SO) and the post scorecard.

## 17. Source map (where each rule came from)

Merch prompt (hard rules, brand system, print specs, lookbook recipe) feeds BW, AR, BL, PH. `PUBLISH-BAR.md` H1 to H11 and Parts B to D feed SC, PR, BL, PH, SU. `PRELAUNCH-CHECKLIST.md` feeds the pre-launch tests. `coastal-benchmark.md` section 5 feeds PR4. `decision-audit.md` feeds PR1, PR2, SU1. `MASTER-PLAN.md` feeds OP, PO9, PH10. Photo rule and consistency audits feed PH. Reels draft feeds HN4, PO. `rj-morning.md` feeds OP1. Repo `AGENTS.md`, `RELEASE_GATES.md` and the Coastal Brand Standard feed BW, HN, SC5, OP2. Design playbook feeds AR, BW5, HN8, HN10. BF brief feeds HN, MN, PO. Money rules (MN, ST) are new, from the owner's Nov 27 direction (t36u, t37u).
