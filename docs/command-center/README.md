# ShoreList command center

ShoreList LLC operates the Wilmington-area guide at [shorelist.net](https://shorelist.net/) and its [shop](https://shorelist.net/shop). Work here is exclusively for ShoreList. The owner and release approver is RJ Brideau.

## Start here

| Need | Open |
| --- | --- |
| Get the current state and next work | [Status and assignments](STATUS.md) |
| Initialize Grok for ShoreList | [Grok start prompt](GROK-START.md) |
| Start a repeatable research, creative, sales, or audit task | [Prompt library](PROMPT-LIBRARY.md) |
| Determine which provider actions are available and authorized | [Connector runbook](CONNECTORS.md) |
| Read the controlling rules and queue | [Agent rules](../../AGENTS.md), [release gates](../../RELEASE_GATES.md), [engineering queue](../../CODEX_TASKS.md) |

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
