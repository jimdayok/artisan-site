# PRICE PARITY AUDIT

Date: 2026-06-01
Scope: customer-assigned price lists only (`G6, P6, A6, B5, E4, E5, E7, E8, M5, S5, TK, VD, Y5, J1, J2, C3, CD, NL`)
Compared artifacts:
- Portal page data path (`app/portal/price-list/[code]/page.tsx` -> `GeneratedInteractivePriceListPage` -> `loadGeneratedPriceListByCode`)
- Generated normalized pricing (`private-source/pricing/generated/normalized/*.json`)
- Source PDF / parity diagnostics (`private-source/price-lists/*.pdf`, `src/data/pdfDerivedPriceLists.ts`, `private-source/pricing/generated/diagnostics/*.json`)

Only verified discrepancies are listed below.

## G6
- Incorrect grouping:
  - `Artisan Design Portfolio` section is flagged missing in PDF parity diagnostics (`diagnostics/pdf-parity-report.json`) even though portfolio styles exist in row-level data.
- Missing AR options:
  - `200,584` unresolved AR rows are excluded from customer display (`diagnostics/ar-validation-report.json`, `diagnostics/ar-price-guide-validation.json`).
- Missing mirrors/protection in displayed AR list:
  - `MMI`, `GMR`, `DDE` appear in mapped AR code set from source diagnostics but are not present in normalized displayed AR options.
- Incorrect AR brand ordering vs required business order:
  - Display order is `Artisan -> Crizal -> Essilor -> Hoya -> Shamir -> Techshield -> Tokai`; required order is `Artisan -> TechShield -> Tokai -> Crizal -> Hoya -> Shamir`.

## P6
- Incorrect grouping:
  - `Artisan Design Portfolio` section is flagged missing in PDF parity diagnostics.
- Missing AR options:
  - `207,356` unresolved AR rows are excluded from customer display.
- Missing mirrors/protection in displayed AR list:
  - `MMI`, `GMR`, `DDE` mapped from source diagnostics are not present in normalized displayed AR options.
- Incorrect AR brand ordering vs required business order:
  - Display order is `Artisan -> Crizal -> Hoya -> Shamir -> Techshield -> Tokai`; required order is `Artisan -> TechShield -> Tokai -> Crizal -> Hoya -> Shamir`.

## A6
- Incorrect grouping:
  - `Artisan Design Portfolio` section is flagged missing in PDF parity diagnostics.
- Missing AR options:
  - `196,665` unresolved AR rows are excluded from customer display.
- Missing mirrors/protection in displayed AR list:
  - `MMI`, `GMR`, `DDE` mapped from source diagnostics are not present in normalized displayed AR options.
- Incorrect AR brand ordering vs required business order:
  - Display order is `Artisan -> Crizal -> Essilor -> Hoya -> Shamir -> Techshield -> Tokai`; required order is `Artisan -> TechShield -> Tokai -> Crizal -> Hoya -> Shamir`.

## VD
- Missing products:
  - Normalized output has `0` rows (`normalized/VD.json`) while source PDF artifacts exist (`alnpricing_2026_VD.pdf`, `src/data/pdfDerivedPriceLists.ts` entries).
  - Core portfolio designs expected from source context (`Diamond Series`, `Platinum Series`, `Gold Series`, `CFB`, `SD Reach`, `SD Concept`) are absent in normalized output.
- Missing AR options:
  - Normalized output has `0` AR options for VD despite source PDF-derived AR rows in repository artifacts.
- Incorrect package display:
  - Add-on sections exist, but customer-facing design/product rows are empty (`rows: 0`), producing an incomplete list presentation.

## J1
- Missing products:
  - Normalized output has `0` rows and no source codes merged (`normalized/J1.json`, `diagnostics/price-list-display-validation.json`).
- Missing AR options:
  - `0` AR options.
- Incorrect customer visibility outcome:
  - List is configured for portal routing but has no underlying source/normalized pricing content.

## J2
- Missing products:
  - Normalized output has `0` rows and no source codes merged.
- Missing AR options:
  - `0` AR options.
- Incorrect customer visibility outcome:
  - List is configured for portal routing but has no underlying source/normalized pricing content.

## C3
- Missing products:
  - Normalized output has `0` rows and no source codes merged.
- Missing AR options:
  - `0` AR options.
- Incorrect customer visibility outcome:
  - List is configured for portal routing but has no underlying source/normalized pricing content.

## Lists with no additional verified discrepancies in this pass
- `B5, E4, E5, E7, E8, M5, S5, TK, Y5, CD, NL`

Notes on this line item:
- “No additional verified discrepancies” means no concrete mismatch was proven from the compared artifacts in this audit pass; it does not claim perfect semantic parity for every row in those lists.
