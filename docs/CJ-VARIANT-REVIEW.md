# CJ variant and shipping review

Use the authenticated session that already returned CJ catalog results. Keep `CJ_API_KEY` in that session's secret environment. These commands read supplier data and create no listings or orders.

## First candidate

Start with Dockside Dry Bag. The owner already ran its US warehouse search successfully. Inspect the public research lead and compare it with the authenticated search results before selecting a variant.

```sh
node tools/supplier-expansion.mjs cj-search "Dockside Dry Bag"
node tools/supplier-expansion.mjs cj-inspect "Dockside Dry Bag"
node tools/supplier-expansion.mjs cj-inspect "Dockside Dry Bag" <CJ_PRODUCT_ID>
node tools/supplier-expansion.mjs cj-coverage <CJ_PRODUCT_ID> <CJ_VARIANT_ID> US 28401 30303 60601 90001 98101
```

Replace the product ID placeholders with the selected CJ search result and use the matching variant ID from inspection. The inspection shows the supplier SKU, variant title, option key and image URL if provided. Verify that the image actually shows the selected color and capacity. Confirm the roll-top closure and capacity. Keep waterproof and flotation claims out of the listing until independently supported.

`cj-coverage` checks one unit, one origin and the supplied ZIPs. It reports CJ-managed stock, variant cost and the available service names, quoted transit times and postage in USD cents. `NO_SERVICE` means CJ returned an empty quote list. `UNKNOWN` means CJ failed to respond successfully or returned no priced service. The command prints partial evidence and exits nonzero if any destination lacks a priced quote. Compare the same fulfillment service across intended regions. Test Alaska or Hawaii separately if considering them. These ZIPs are samples. Checkout and fulfillment must still enforce the supported destinations and service.

Use the existing `cj-draft` command only after selecting the exact product, color and route. Capture the highest observed postage for the pricing review, validate the 15% margin scenario, and follow the ShoreList image, coastal brand and owner approval gates. Keep the draft dormant while checkout and fulfillment remain unverified. [Supplier expansion](SUPPLIER-EXPANSION.md) [Coastal brand standard](COASTAL-BRAND-STANDARD.md)

## Next leads

1. **Harbor Folding Table**. Its recorded public lead is an aluminum folding table. Verify the exact dimensions, leg locks, load rating and finish.
2. **Harbor Bottle Carrier**. Its recorded public lead is an insulated strap cover. Verify bottle fit, closure and the exact color. Omit insulation-duration claims without evidence.
3. **Coastal Beach Cart**. Verify that the selected model has wide sand wheels and that folded dimensions and freight support the retail price.

All four are research candidates. The stored public product IDs can be inspected with the title alone. New authenticated search matches can be inspected using the explicit product ID. [Public CJ screen](CJ-PUBLIC-SCREEN.md)
