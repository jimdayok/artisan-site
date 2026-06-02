PRICING BUSINESS RULES

Purpose
This document records all pricing-related business rules discovered in the codebase and source artifacts (DVI/PDF-derived lists, lookup files, pricing generation scripts, and `src/data/*` price list definitions). It is intended to let another AI or developer continue pricing work without prior chat history.

Primary sources
- `lib/portal/priceLists.ts` (canonical price codes)
- `src/data/privatePriceList.ts` (detailed price items, materials, category/brand taxonomy)
- `src/data/pdfDerivedPriceLists.ts` (PDF -> derived item metadata)
- `private-source/portal/dashboard-v1/current/*` (customer/account assignment snapshot)
- `scripts/generate-portal-dashboard-v1.mjs` and pricing generator scripts (where present)
- Price list PDF filenames in `public/` and `lib/portal/priceLists.ts` r2Key entries
- Notes and TODOs in code (items with price 0, notes fields)

Confidence levels: High (derived directly from code), Medium (inferred from multiple sources), Low (heuristic or incomplete mapping in code).

1) Product hierarchy rules
- Lens product groups (from `src/data/privatePriceList.ts`):
  - `Single Vision` (SV) — base single-vision items
  - `Multifocal Lenses` (MF) — bifocals/trifocals
  - `Digital SV & Anti-Fatigue Lenses` (ESV) — digital single-vision / anti-fatigue
  - `Occupational Lenses` (OCP)
  - `Progressive Lenses` (PAL)
- Price items are organized by `PriceCategory` and `PriceBrand` (see `privatePriceList.ts`).
- Materials are represented as `MaterialAdder` items (negative or positive price adjustments).
- Confidence: High

2) Design classification rules
- Brand/category mapping (examples):
  - `Artisan` grouped under `Standard Designs` or `Artisan Design Portfolio`.
  - Premium brands: `Tokai`, `Varilux`, `Hoya`, `Shamir`, `Unity`, `Sequel by Newton`, `IOT`.
- Artisan Design Portfolio shortcodes: DS* -> Diamond Series, PS* -> Platinum Series, GS* -> Gold Series; items `CFB`, `SD Concept`, `SD Reach` appear as named SKU groups in `privatePriceList.ts`.
- Confidence: High

3) LensMat rules (photochromic / transitions / polarized / blue-light mapping)
- Photochromic / Transitions mapping (heuristics/preferred codes seen in PDFs and naming):
  - Codes starting with `S*` interpreted as Photochromic (Photochromic family)
  - Codes starting with `T*` interpreted as Transitions
- Polarized mapping: codes like `P60`, `P67`, `P74`, `PFT`, `PLP`, `PRM`, `PRT`, `PRY` map to Polarized materials/options.
- Blue Light mapping: `B*` including `BPY` indicates Blue Light filtering options / adders.
- Confidence: Medium (rules inferred from naming conventions; check PDF source lists)

4) Material rules (Lens material ordering and constraints)
- Material preference/order (base -> premium): Plastic -> Polycarbonate -> Trivex -> 1.56 -> 1.60 -> 1.67 -> 1.70 -> 1.74 -> 1.76
- `materialAdders` in `privatePriceList.ts` provide price deltas and `requires` constraints (e.g., some Tokai materials require Tokai lens design).
- Varilux has special deduction rule noted: plastic base deduct $11 from polycarbonate base; Varilux products deduct $3 instead (note in `material-plastic` item).
- Some high-index materials are marked `outsourced: true` (Tokai exclusives).
- Confidence: High for order and presence; Medium for exact dedupe/deduction semantics — follow in-code notes.

5) AR rules (anti-reflective coatings hierarchy and requirements)
- AR brand priority/hierarchy (source: `privatePriceList.ts` and item `requires` fields):
  1. Artisan (proprietary suite)
  2. See More AR Options (catch-all)
  3. TechShield
  4. Tokai
  5. Crizal
  6. Hoya
  7. Shamir
- Some progressive products (`Sequel PAL`, `Sequel ESV`) explicitly `require` "Artisan Emerald AR or higher, or a TechShield AR" — this implies minimum AR level enforcement.
- Confidence: High for existence and requirement examples; Medium for full precedence details (inferred from code comments and `requires` strings).

6) Mirror rules (mapping and recognized mirror codes)
- Known mirror codes / keywords (map to colored or gradient mirror categories):
  - MMI = Mirror Matched
  - GMR = Gradient Mirror
  - And recognized suffixes/keys: RSM, RDM, PKM, ORM, BKM, BLM, CHM, FSM, FGM, CHR, CAM, FRM, GDM, GRM, MIR, RGM, SEM, SLM
- These map to colored mirrors and are treated as Mirror/Polarized options in `PriceCategory` (e.g., `Provisics Mirror Coatings`, `KBCO Polarized Mirrors`).
- Confidence: Medium (list derived from doc fragment and `privatePriceList.ts` categories)

7) Protection rules
- DDE = `Diamond Defense` (protection mapping). Treated as a named protective coating option in price menu.
- Confidence: Low-Medium (single reference; confirm in PDFs)

8) Price-list assignment rules
- Canonicalization rules (source: `lib/portal/priceLists.ts`):
  - `G5` → `G6`
  - `P5` → `P6`
  - `A5` → `A6`
  - Unknown codes are normalized to uppercase and an on-the-fly `PortalPriceList` object is returned with `configured: false` and `onlineUrl` set to `/portal/price-list/{code-lower}`.
- Price lists are defined with `code`, `label`, `fileName`, optional `r2Key` and `onlineUrl`. Missing `r2Key` indicates asset not uploaded into R2 and needs attention.
- Confidence: High

9) Customer visibility rules
- Customers only see assigned price lists (assignment computed from Dashboard v1 `users_to_accounts.json` or legacy `workbook-access.json`).
- Admin users see all price lists and all admin tables.
- Code-level mapping: `lib/portal/adminData.ts` and `lib/portal/priceListAccess` logic determines `assignedPriceLists`.
- G5/P5/A5 handling: per canonicalization, customers with old codes (G5/P5/A5) should be shown the canonical (G6/P6/A6) prices.
- Confidence: High

10) PDF parity requirements
- Portal should mirror customer-facing PDF structure (the portal UI must present items matching the PDFs, not the DVI internal structure).
- `src/data/pdfDerivedPriceLists.ts` contains metadata extracted from price PDFs and drives how items are presented; ensure portal pages use these derived items for parity.
- Do not show DVI-specific internal naming to customers — normalize labels and categories.
- Confidence: High

11) Known unresolved mappings
- Several items in `privatePriceList.ts` have `price: 0` and `notes` like "No price listed" — these represent unresolved or missing PDF entries and must be reconciled with source PDFs or product managers.
  - Examples: `std-round-seg-22-24`, `std-bifocal-st45`, `varilux-physio-drx`, `hoya-visupro-advanced-focus` (note: `outsourced` or "TBD").
- `pdfDerivedPriceLists.ts` may include entries whose `sourceFile` exists but mapping to internal SKU IDs may be incomplete.
- Several price list `r2Key` fields are null (see `lib/portal/priceLists.ts`), meaning missing R2 assets.
- Confidence: High for presence of unresolved items; Low for exact mapping resolutions.

12) Known pricing defects
- Missing R2 keys -> broken download links for some price lists.
- Zero-price placeholders in `src/data` may render incorrect customer views unless guarded (portal should hide zero-priced placeholders or show "TBD").
- Legacy generator (`workbook-access.json`) can be empty and some code paths may not handle empty lists gracefully (fixes applied but double-check consumers).
- Type/label mismatches between PDF-derived metadata and product SKUs can surface incorrect grouping; `pdfDerivedPriceLists.ts` is large and requires validation against live PDFs.
- Confidence: High for defects listed; remediation recommended.

13) Pricing engine architecture (high level)
- Input sources:
  - Authoritative: Dashboard v1 snapshot (accounts + user -> assigned price-lists mapping)
  - Pricing definitions: PDF-derived metadata (`src/data/pdfDerivedPriceLists.ts`) and hand-curated `src/data/privatePriceList.ts` / `src/data/*` lists
  - Legacy: Excel workbook generator outputs (`private-source/portal/workbook-access.json`)
- Processing layers:
  1. Canonicalization & normalization (`lib/portal/priceLists.ts` and other helpers)
  2. Customer/account mapping (Dashboard v1 `users_to_accounts.json`, `accounts_index.json`)
  3. Presentation layer (`app/portal/price-list/*` pages and `PortalDashboardContent`) — uses derived items for display
  4. Download layer — serves PDF assets from `public/` or R2 using `r2Key` fields
- Deployment/build hooks:
  - `npm run prebuild` -> runs `portal:generate-access` and `pricing:generate` scripts (ensure these generate artifacts as expected)
  - Dashboard v1 generation script outputs snapshot to `private-source/portal/dashboard-v1/current/`

What a New AI Assistant Must Know Before Modifying Pricing
- Source of truth: For launch, rely on `src/data/pdfDerivedPriceLists.ts` and `private-source/portal/dashboard-v1/current/` for customer assignments. `privatePriceList.ts` is a curated convenience file used by the UI.
- Do not change canonicalization rules (G5->G6, P5->P6, A5->A6) without a product decision.
- Material adders may include `requires` constraints (e.g., Tokai materials require Tokai designs); preserve these constraints in pricing engine logic.
- Zero-priced items exist deliberately as placeholders; confirm with product before setting a concrete price.
- When adding or changing price items, update both PDF-derived metadata (if the PDF changed) and `src/data/*` price item IDs so the portal lookup remains stable.
- Validate any mapping changes against the live PDF (`public/` file or R2) and update `pdfDerivedPriceLists.ts` accordingly.
- Always run build and validation scripts locally:

```bash
npm run portal:generate-dashboard-v1:launch
npm run pricing:generate
npm run build
```

- Check generated artifacts:
  - `private-source/portal/dashboard-v1/current/latest_snapshot_manifest.json`
  - `src/data/pdfDerivedPriceLists.ts` (or regenerated variant)
  - `private-source/portal/workbook-access.json` (legacy)

- For large changes, add CI checks comparing derived PDF items vs portal rendering and failing if parity breaks.

Contact points
- Owner: Jim (documented in repo notes and checklist)
- For product questions (pricing semantics), consult the pricing owner before changing canonical mappings or AR hierarchies.


Files created/edited as references
- src/data/privatePriceList.ts — curated list with `materialAdders` and `priceItems` (primary in-repo pricing model)
- lib/portal/priceLists.ts — canonical price list codes and R2 mapping
- src/data/pdfDerivedPriceLists.ts — large generated mapping from PDF source files


End of PRICING_BUSINESS_RULES.md
