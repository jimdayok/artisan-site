BUSINESS RULES (discovered)

1) Price list canonicalization
- Description: Older price-list codes map to canonical codes.
  - `G5` → `G6`
  - `P5` → `P6`
  - `A5` → `A6`
- Source files: lib/portal/priceLists.ts (canonicalPriceListCode)
- Confidence: High

2) Division -> Price List mapping (workbook generator fallback)
- Description: Division codes map to price lists (used by legacy workbook generator):
  - PART -> P6 (Artisan Equity Partner)
  - GENL -> G6 (Artisan General Customer)
  - PMP -> A6 (Artisan PMP Partner)
  - ACQU -> A6 (Artisan Acquios Partner)
  - NL -> G6 (Neurolens Partner)
- Source files: scripts/generate-portal-workbook-access.mjs (typeMap, typePriority)
- Confidence: High

3) Type priority when multiple divisions present
- Description: When an account has multiple detected division codes, choose the highest-priority code in order: PART, PMP, ACQU, NL, GENL.
- Source files: scripts/generate-portal-workbook-access.mjs (typePriority)
- Confidence: High

4) Dashboard v1 is source-of-truth for launch
- Description: Admin dashboard and customer previews should use Dashboard v1 snapshot artifacts located at `private-source/portal/dashboard-v1/current/` (manifest, accounts, users_to_accounts).
- Source files: lib/portal/dashboardV1.ts, lib/portal/adminDashboardV1.ts
- Confidence: High

5) Portal sections default assignment
- Description: Legacy generator assigns `portalSections: ['pricing', 'performance']` to access records by default.
- Source files: scripts/generate-portal-workbook-access.mjs
- Confidence: Medium

6) Portal preview Back navigation
- Description: Admin preview links include `returnTo` query param; preview component should return to the provided `returnTo` only if it begins with `/portal/admin` to prevent open redirect.
- Source files: app/portal/admin/preview/[accountNumber]/page.tsx
- Confidence: High

7) Authorized user visibility
- Description: Dashboard v1 authorized_users_summary.authorized_user_count is used to show the "Authorized Users" column in admin dashboard table.
- Source files: lib/portal/dashboardV1.ts, app/portal/admin/page.tsx
- Confidence: High

8) Price list online URL pattern
- Description: For unknown price list codes, construct `onlineUrl` as `/portal/price-list/{code-lower}` and mark `configured: false`.
- Source files: lib/portal/priceLists.ts
- Confidence: High

9) Data freshness rule (Launch Go/No-Go)
- Description: Dashboard v1 snapshot must be within 3 business days of cutover date.
- Source files: docs/launch/production-cutover-checklist.md, lib/portal/dashboardV1.ts
- Confidence: High

10) Analytics
- Description: Vercel Analytics collects page views and web vitals via `@vercel/analytics` added to root layout. No additional env vars are required for basic collection (on Vercel).
- Source files: app/layout.tsx
- Confidence: High


Notes and lower-confidence rules
- Some assigned price lists and access decisions may still use legacy `workbook-access.json` if not migrated; treat legacy outputs as fallback and plan to reconcile.
- Any pricing-specific rules (AR coatings, mirror coatings, material ordering, etc.) are implemented in pricing generation scripts or external pricing data sources; further deep-dive of `scripts/generate-price-list-data.mjs` and repo `lib/portal/pricing` may reveal detailed rules.
