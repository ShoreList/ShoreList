# Ordered execution queue
Owner directive: complete tasks individually, verify evidence before marking done. Three-stage audit applies throughout. No release during freeze absent logged override. No spend, outreach, account changes or ad changes.

| ID | Task | State | Acceptance |
|---|---|---|---|
| 01 | Reproduce scoring defect | DONE | c2f49286f349756c0beafb8358e7074adb3de021 |
| 02 | Test threshold prototype | DONE | ee2da5dada8daa3fa2655cc9572765da6eaff5ed; isolated tests only |
| 03 | Resolve shared-file ownership | OPEN | Current task locks and overlapping branches verified |
| 04 | Implement strict scoring | OPEN | Code and regression tests, full CI |
| 05 | Enforce three-stage audit and rejected art | OPEN | Missing evidence, stale revision and rejected art fail closed |
| 06 | Authenticate Fourthwall | BLOCKED | Merchant access verified without permission changes |
| 07 | Supplier and assortment preflight | OPEN | Exact variants, local references, competitors, landed margin >=25 stressed |
| 08 | Original artwork | OPEN | Independent art gate before mockups; rejected oak never reused |
| 09 | Product photography and final review | OPEN | Exact revision, every criterion >=9, overall >=90, all hard rules pass |
| 10 | Store integration | OPEN | Existing shop owner coordination, checkout, mobile and desktop tests |
| 11 | Release | HOLD | Freeze clearance, CI, independent approval, live verification |

This is a coordination artifact, not a production change or independent approval. Dates are not promised. Each completed task must cite evidence; unknowns remain open.