# Thin-content gate report

Run: `node tools/thin-content-gate.mjs --site . --config city-pack/wilmington/city.config.json`  
Date: 2026-11-21

## Result

- Indexable pages scanned: **109** (noindex pages skipped; 11 utility/hub pages exempt from word, ratio and entity checks)
- Pages with at least one flag: **73**
- Local entities used for the named-place check: **43**
- Cross-city similarity: **not run**, no second city pack exists yet. Re-run with `--against <other city build>` before any clone launches.
- Exit code: **1**

## Thresholds

| Setting | Value |
|---|---:|
| minWords | 150 |
| maxJaccard | 0.25 |
| maxIntra | 0.8 |
| minUniqueRatio | 0.35 |
| boilerplateDf | 0.4 |
| minEntities | 2 |
| patternMinGroup | 5 |
| patternMaxShare | 0.15 |
| shingle | 5 |

## Flags by check

| Check | Pages |
|---|---:|
| thin | 71 |
| no-local-entities | 3 |

## thin

- `events/47th-annual-north-carolina-jazz-festival-2027-02-04.html`: 84 distinct words (< 150)
- `events/a-beautiful-noise-the-neil-diamond-music-2027-01-22.html`: 73 distinct words (< 150)
- `events/a-charlie-brown-christmas-2026-12-04.html`: 67 distinct words (< 150)
- `events/a-colonial-apparition-river-cruise-2026-12-05.html`: 64 distinct words (< 150)
- `events/a-drag-queen-christmas-2026-11-21.html`: 67 distinct words (< 150)
- `events/baz-luhrmann-s-romeo-juliet-in-concert-2027-01-19.html`: 69 distinct words (< 150)
- `events/cape-fear-festival-of-trees-2026-12-08.html`: 73 distinct words (< 150)
- `events/cape-fear-museum-holiday-gift-workshop-2026-12-05.html`: 62 distinct words (< 150)
- `events/carolina-beach-christmas-parade-2026-12-04.html`: 70 distinct words (< 150)
- `events/carolina-beach-holiday-market-2026-12-05.html`: 63 distinct words (< 150)
- `events/carolina-beach-state-park-trail-half-mar-2027-01-02.html`: 68 distinct words (< 150)
- `events/carolina-beach.html`: 129 distinct words (< 150)
- `events/city-ballet-s-the-nutcracker-2026-12-05.html`: 67 distinct words (< 150)
- `events/colonial-wilmington-and-the-revolution-w-2026-12-11.html`: 68 distinct words (< 150)
- `events/downtown-wilmington-holiday-tree-lightin-2026-11-27.html`: 66 distinct words (< 150)
- `events/enchanted-airlie-2026-11-27.html`: 88 distinct words (< 150)
- `events/festival-in-the-park-nc-holiday-flotilla-2026-11-28.html`: 62 distinct words (< 150)
- `events/hidden-battleship-tour-2027-02-27.html`: 67 distinct words (< 150)
- `events/holiday-light-spectacular-at-the-wilming-2026-12-11.html`: 80 distinct words (< 150)
- `events/holiday-movie-at-the-lake-a-christmas-st-2026-12-12.html`: 65 distinct words (< 150)
- `events/holiday-story-time-by-the-sea-2026-12-19.html`: 68 distinct words (< 150)
- `events/home-alone-in-concert-wilmington-symphon-2026-12-19.html`: 76 distinct words (< 150)
- `events/jazz-at-cam-brandon-mitchell-quartet-2027-02-11.html`: 73 distinct words (< 150)
- `events/jazz-at-cam-le-andra-mcphatter-2027-01-07.html`: 72 distinct words (< 150)
- `events/jazz-at-cam-yolanda-rabun-2026-12-03.html`: 72 distinct words (< 150)
- `events/jefferson-starship-and-john-waite-2027-02-20.html`: 68 distinct words (< 150)
- `events/kids-cam-minnie-evans-birthday-2026-12-12.html`: 64 distinct words (< 150)
- `events/kure-beach-holiday-market-2026-11-21.html`: 74 distinct words (< 150)
- `events/kure-beach-holiday-whoobie-whatty-2026-12-18.html`: 73 distinct words (< 150)
- `events/kure-beach.html`: 135 distinct words (< 150)
- `events/leslie-odom-jr-the-christmas-tour-2026-12-17.html`: 72 distinct words (< 150)
- `events/miracle-on-34th-street-thalian-associati-2026-12-11.html`: 85 distinct words (< 150)
- `events/movies-in-the-park-the-santa-clause-2026-12-04.html`: 70 distinct words (< 150)
- `events/music-at-cam-dear-maribella-and-the-pigk-2027-02-04.html`: 63 distinct words (< 150)
- `events/new-year-s-eve-gala-at-thalian-hall-2026-12-31.html`: 66 distinct words (< 150)
- `events/new-year-s-noon-at-the-children-s-museum-2026-12-31.html`: 70 distinct words (< 150)
- `events/night-tour-at-the-burgwin-wright-house-2026-12-04.html`: 66 distinct words (< 150)
- `events/north-carolina-holiday-flotilla-and-fire-2026-11-28.html`: 75 distinct words (< 150)
- `events/novant-health-wilmington-nc-marathon-hal-2027-02-27.html`: 71 distinct words (< 150)
- `events/pearl-harbor-day-remembrance-at-battlesh-2026-12-07.html`: 68 distinct words (< 150)
- `events/polar-express-reading-with-santa-2026-12-12.html`: 81 distinct words (< 150)
- `events/rooted-in-memory-the-gullah-geechee-visi-2026-06-19.html`: 76 distinct words (< 150)
- `events/santa-by-the-sea-2026-12-19.html`: 64 distinct words (< 150)
- `events/sing-we-now-of-christmas-a-joyful-celebr-2026-12-02.html`: 71 distinct words (< 150)
- `events/special-olympics-polar-plunge-and-run-2027-02-20.html`: 70 distinct words (< 150)
- `events/the-wiz-2027-02-06.html`: 69 distinct words (< 150)
- `events/tig-notaro-2027-01-08.html`: 66 distinct words (< 150)
- `events/water-for-elephants-2027-02-23.html`: 66 distinct words (< 150)
- `events/wcfa-s-the-nutcracker-2026-12-12.html`: 66 distinct words (< 150)
- `events/wilmington-historic-half-marathon-10k-an-2026-12-05.html`: 64 distinct words (< 150)
- `events/wilmington-holiday-parade-2026-11-29.html`: 64 distinct words (< 150)
- `events/wilmington-symphony-orchestra-bernstein--2027-01-16.html`: 75 distinct words (< 150)
- `events/wilmington-symphony-young-people-s-conce-2027-02-21.html`: 71 distinct words (< 150)
- `events/wilmington-symphony-youth-orchestras-con-2026-11-22.html`: 65 distinct words (< 150)
- `events/wilmington-symphony-youth-orchestras-con-2027-02-28.html`: 65 distinct words (< 150)
- `events/wrightsville-beach-christmas-kick-off-an-2026-11-27.html`: 68 distinct words (< 150)
- `events/wrightsville-beach.html`: 133 distinct words (< 150)
- `how-we-verify.html`: 146 distinct words (< 150)
- `things-to-do/beach-chairs.html`: 145 distinct words (< 150)
- `things-to-do/beach-photography.html`: 141 distinct words (< 150)
- ... 11 more (use `--json` for the full list)

## no-local-entities

- `how-we-verify.html`: 0 named local places found (< 2)
- `surf/know-before-you-go.html`: 0 named local places found (< 2)
- `surf/paddleboard-and-kayak.html`: 1 named local places found (< 2)

## Notes

- Thresholds are unvalidated starting points from the playbook (section 3.5). Tune them against a known-good hand-written page set before using this as a deploy gate.
- Word counts come from `<main>` (or body) with nav, header, footer, forms, scripts and SVG removed. Pages that render their body client-side will under-count.
