# Portal Price List Export Bundle Audit

Date: 2026-06-29

## Scope

This note documents the serverless bundle audit for:

- `app/portal/price-list/export/route.ts`

The goal was to determine why the export function was oversized, identify the exact traced inputs, and refactor the route so pricing payloads are runtime-loaded instead of bundled.

## Root Cause

The function size issue came from two sources:

1. `next.config.ts` forced all packaged pricing payloads into `/portal/*` and `/portal/price-list/*` via `outputFileTracingIncludes`.
2. The route authorization path pulled in the full portal dashboard bundle, even though the export route only needed the smaller account-to-price-list access data.

From the existing local trace:

- prior traced route payload: `54.89 MB`
- packaged pricing payloads included in the trace: `46.68 MB`
- full dashboard bundle in the trace: `3.50 MB`
- compiled chunk carrying dashboard bundle data: about `3.50 MB`

Estimated traced payload after the refactor:

- about `1.22 MB`

## Final Import Tree

```text
app/portal/price-list/export/route.ts
├─ node:fs/promises
├─ node:path
├─ next/server
├─ pdf-lib
├─ lib/portal/priceListAccess.ts
│  ├─ next/headers
│  ├─ next/navigation
│  ├─ lib/portal/auth.ts
│  ├─ lib/portal/admin.ts
│  │  ├─ server-only
│  │  ├─ lib/portal/adminAccess.ts
│  │  └─ lib/portal/auth.ts
│  ├─ lib/portal/customers.ts
│  │  ├─ server-only
│  │  ├─ lib/portal/dashboardV1AccessIndex.ts
│  │  │  └─ lib/portal/generated/priceListAccessIndex.json
│  │  ├─ lib/portal/priceLists.ts
│  │  │  ├─ lib/portal/generated/priceListRegistry.json
│  │  │  └─ lib/pricing/priceListCodes.ts
│  │  │     └─ config/hidden-price-list-codes.json
│  │  ├─ lib/portal/customerTypes.ts
│  │  └─ lib/portal/normalizeAccounts.ts
│  ├─ lib/portal/portalAuthorization.ts
│  │  ├─ server-only
│  │  ├─ lib/portal/assignedPriceLists.ts
│  │  ├─ lib/portal/customers.ts
│  │  ├─ lib/portal/customerTypes.ts
│  │  ├─ lib/portal/dashboardV1AccessIndex.ts
│  │  └─ lib/portal/userDataAccess.ts
│  │     ├─ server-only
│  │     ├─ node:fs
│  │     ├─ node:path
│  │     ├─ exceljs
│  │     └─ lib/portal/adminAccess.ts
│  ├─ lib/portal/assignedPriceLists.ts
│  └─ lib/portal/priceLists.ts
├─ lib/portal/priceLists.ts
├─ lib/portal/rateLimit.ts
├─ lib/pricing/customerPriceList.ts
│  └─ lib/pricing/types.ts
├─ lib/pricing/priceListCodes.ts
│  └─ config/hidden-price-list-codes.json
├─ lib/pricing/displayTaxonomy.ts
│  └─ lib/pricing/types.ts
└─ lib/pricing/loadPackagedPriceList.ts
   ├─ node:fs/promises
   ├─ node:path
   ├─ node:zlib
   ├─ node:util
   └─ lib/pricing/types.ts
```

## Large Files And Inputs

### Files previously traced into the route

- `lib/pricing/generated/normalized/*.json.gz`: `46.68 MB` total across `66` files
- `lib/portal/generated/dashboardV1Bundle.json`: `3.50 MB`
- `private-source/portal/user_data.xlsx`: `0.05 MB`
- `public/aln-white-logo.png`: `0.08 MB`

### Largest individual packaged pricing payloads

- `T6.json.gz`: `5.01 MB`
- `XX.json.gz`: `4.94 MB`
- `T5.json.gz`: `4.08 MB`
- `P5.json.gz`: `3.35 MB`
- `G5.json.gz`: `3.22 MB`
- `XL.json.gz`: `3.16 MB`
- `A5.json.gz`: `3.09 MB`

### Runtime bundle inputs after the refactor

- `lib/portal/generated/priceListAccessIndex.json`: `0.34 MB`
- `lib/portal/generated/priceListRegistry.json`: `0.03 MB`
- `private-source/portal/user_data.xlsx`: `0.05 MB`

### Imported packages

- `next`: about `1.69 MB` in the traced route footprint
- `pdf-lib`: about `0.68 MB`
- `exceljs`: about `0.05 MB`

## What Changed

### Route and pricing loader

- `app/portal/price-list/export/route.ts`
- `app/portal/price-list/GeneratedInteractivePriceListPage.tsx`
- `lib/pricing/loadPackagedPriceList.ts`

Packaged pricing is now read from local `fs` when available and otherwise loaded at runtime from same-origin static assets. This keeps functionality the same while removing the need to trace all pricing payloads into the function bundle.

### Access data slimming

- `lib/portal/customers.ts`
- `lib/portal/portalAuthorization.ts`
- `lib/portal/dashboardV1AccessIndex.ts`
- `lib/portal/generated/priceListAccessIndex.json`

The export route no longer relies on the full `dashboardV1Bundle.json` for authorization checks.

### Trace configuration

- `next.config.ts`

Removed the pricing trace includes that were forcing `lib/pricing/generated/normalized/*.json.gz` into portal route bundles.

### Pricing lookup source-of-truth enforcement

- `lib/pricing/lookupData.mjs`

`Lookup.xlsx` for pricing now resolves only from:

- `private-source/price-lists/Lookup.xlsx`

It no longer falls back to:

- `private-source/portal/lookup_docs/Lookup.xlsx`

## Confirmations

- `private-source/price-lists/Lookup.xlsx` remains the pricing `Lookup.xlsx` source of truth.
- `private-source/portal/lookup_docs/Lookup.xlsx` is not used by `app/portal/price-list/export/route.ts`.
- Existing file-copy automation was left unchanged.
- The route no longer bundles duplicate packaged pricing payloads.
- The estimated Vercel function size is comfortably under `250 MB`.

## Verification

- `npm run typecheck` passed.
- The existing local route trace showed `54.89 MB` before the refactor.
- Rebuilding a fresh Next trace was not completed in this environment because the full prebuild pipeline stalled during portal data generation, so the post-fix route size is a calculated estimate based on the prior trace and the removed traced files.
