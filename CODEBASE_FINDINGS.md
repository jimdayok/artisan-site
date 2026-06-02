# CODEBASE FINDINGS — ALN Portal/Pricing Audit

Date: 2026-06-01

## Architectural Observations
- Primary runtime architecture is App Router under `app/portal/*` with server-side auth resolution via headers/cookies.
- `proxy.ts` acts as the key gate for `/portal/*`, `/api/portal/*`, and `/private/price-list/*`, injecting trusted `x-portal-auth-email` only after JWT validation.
- Portal data federation combines three sources in priority order:
  1. Dashboard v1 snapshot (`private-source/portal/dashboard-v1/current/*`)
  2. Legacy workbook output (`private-source/portal/workbook-access.json`)
  3. Manual CSV overrides (`private-source/portal/customers.csv`)
- Admin and customer views share `PortalDashboardContent`, reducing UI drift between preview and real customer state.

## Portal Findings
- `/portal` behavior:
  - Admin users default to `AdminLandingDashboard` unless `?mode=customer`.
  - Customers land in portal dashboard with account scoping.
- `/portal/admin` behavior:
  - Valid admin auth required, then route redirects to `/portal` where admin dashboard is rendered.
- Admin preview path `/portal/admin/preview/[accountNumber]` is implemented and validates `returnTo` prefix (`/portal/admin`) before honoring it.
- Accounts/Users admin pages are intentionally “advanced tools” stubs (documented behavior, not broken behavior).

## Pricing Findings
- Authoritative canonicalization is implemented and active in multiple layers:
  - `G5→G6`, `P5→P6`, `A5→A6`.
- Customer visibility rule is implemented:
  - non-admin users are authorized only for assigned/canonical lists.
  - admin users can access all configured lists and preview assigned lists by account.
- PDF parity intent is present, but practical parity is mixed:
  - `pdfDerivedPriceLists.ts` is used by dedicated PDF-derived page component.
  - active `[code]` route currently serves generated interactive path (P6 special case still generated path), so parity depends on generator quality and normalized artifacts.
- AR taxonomy and compatibility logic exist in `src/data/privatePriceList.ts` + `src/data/arCompatibility.ts`, but strict AR precedence matching the requested order is not encoded as a single enforceable policy object.
- R2 coverage is incomplete:
  - several codes are configured with `r2Key: null`, producing unavailable PDF downloads for those lists.

## Dashboard/Data-Generation Findings
- Dashboard v1 snapshot exists and is recent:
  - `snapshot_id`: `2026-06-01T15-47-06-641Z`
  - `data_refresh_date`: `2026-05-31`
  - `278` output accounts, `594` user emails mapped.
- Freshness logic mismatch:
  - Launch docs mention 3 business days; runtime stale check in `dashboardV1.ts` uses ~2 days.
- Legacy workbook generator runs but currently outputs empty access dataset (`workbook-access.json` length `0`).

## Security Findings
- Positive:
  - Middleware verifies Cloudflare Access JWT and email header match before trusted auth injection.
  - Admin route checks are explicit and centralized.
  - Protected routes include noindex/private cache headers.
  - Download/export routes include rate limiting.
- Risks:
  - Production security still depends on correct Cloudflare Access and env configuration outside repo.
  - Localhost test-login path is intentionally permissive in development; ensure impossible in production (currently guarded by env/host checks).

## Deployment Findings
- Build pipeline:
  - `prebuild` currently runs `pricing:generate` and `pricing:normalize`.
  - This differs from some docs that still reference `portal:generate-access` in prebuild.
- Vercel deployment config is straightforward (`vercel.json`), but production correctness depends on env variables:
  - Cloudflare Access: `CLOUDFLARE_ACCESS_TEAM_DOMAIN`/`CF_ACCESS_TEAM_DOMAIN`, `CLOUDFLARE_ACCESS_AUD`/`CF_ACCESS_AUD`
  - Portal host/login: `PORTAL_HOSTNAME`, `NEXT_PUBLIC_SITE_DOMAIN`, `NEXT_PUBLIC_PORTAL_LOGIN_URL`
  - R2 download path: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` (or bound `PRACTICE_FILES` bucket)

## Technical Debt
- Mixed source-of-truth layers for pricing presentation (PDF-derived rows, generated normalized JSON, DVI fallback) increase maintenance overhead and parity risk.
- Stale/contradictory documentation around prebuild and freshness gates.
- Legacy workbook pipeline still present but non-contributing in current dataset.

## Documentation Staleness
- `PROJECT_STATUS.md` says prebuild triggers `portal:generate-access`; actual `package.json` prebuild does not.
- Launch freshness language and runtime stale threshold disagree (3 business days vs 2 days).
- Some pricing rules in docs are heuristic/inferred and not represented as strict executable rules.

## Blocker Status Summary
- Still blockers:
  - Cloudflare Access production verification.
  - Snapshot freshness policy alignment and enforcement.
  - Pricing/PDF parity validation for assigned customer lists (especially lists lacking R2 assets).
- Previously documented blockers now largely resolved:
  - Dashboard v1 pipeline generation and snapshot availability.
  - Core admin preview navigation behavior (`returnTo` safety + back flow).
  - Basic portal/authz scaffolding and protected download endpoint implementation.
