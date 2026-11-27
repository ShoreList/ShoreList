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

Historical provider facts are in [INTEGRATIONS.md](../../INTEGRATIONS.md), [supplier expansion](../SUPPLIER-EXPANSION.md), [CJ variant review](../CJ-VARIANT-REVIEW.md), and the current [status](STATUS.md). A connection in one agent's session does not establish access in another.
