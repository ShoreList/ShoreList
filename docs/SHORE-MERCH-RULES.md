# Shore Merch release rules

The shop has separate Shopify and Fourthwall purchase paths. Shore Merch links only to the approved ShoreList Fourthwall storefront. Shopify listings, variants, bag, checkout, promotions and town filters stay unchanged.

## Design direction

- Elegant, playful preppy coastal surf-town style. Nantucket, Wrightsville and Charleston are aesthetic references, not origin claims. KJP and other retail brands are internal references only. Do not copy their graphics or use their names in listings.
- Use original, recognizable local subjects: a specific landmark, native nature or coastal activity. Verify local details. Do not imply that a park, venue or organization endorses the product.
- For apparel, use a quiet, recognizable mark, a restrained palette and no varsity, club, large poster or badge treatment. Harbor navy, sailcloth, dune sand, sea glass and occasional signal red are direction, not authorization to claim an exact variant is sold.
- Apply the standing rules in `tools/design-gate.mjs`, including limits for artwork and embroidery. Keep drafts off the public catalog until five independent scores of at least 90/100 are documented: brand fit, local accuracy, product fidelity, customer clarity, originality. Pair the review with verified supplier data, original artwork, source-photo verification and owner approval for a new Fourthwall publication.
- A public URL does not override a prior hold. Check exact URLs and historical listing IDs; the retired alias file maps the known Fourthwall URL slugs to those listing IDs. Resolve the reason and document specific approval before removing a hold.

## Photo fidelity

- Do not use an image that changes a sellable product's exact color, cut, construction, material appearance, embroidery, artwork, size or placement of a mark, or any lettering. Compare side by side with the exact official variant photo. If a comparison is inconclusive, use the official image instead.
- Use Higgsfield to generate a background only, then place the genuine product photo on it without repainting the product. Disclose AI-generated backgrounds and never call them photographs of a real local place.
- Record the official reference, asset and review evidence. The code requires these fields, but a reviewer must still validate what the customer sees.

## Build

Edit `data/shore-merch.json` only for listings cleared by these rules. Run `node tools/build-shop-static.mjs`, `node tools/check-site.mjs` and `node --test tools/shore-merch-gate.test.mjs`. The current market tote predates this integration and counts as zero net-new listings.
