Open Issues (cataloged by area)

PRICING
- Title: Missing or unconfigured price-list R2 keys
  - Severity: High
  - Area affected: Pricing PDFs and portal download links
  - Root cause: Some price lists have `r2Key: null` in `lib/portal/priceLists.ts` and assets may not be uploaded to R2 or production bucket.
  - Files involved: lib/portal/priceLists.ts, public/ (assets), private-source/ (generated PDFs)
  - Recommended fix: Upload missing PDFs to R2 or set correct `r2Key` and populate `onlineUrl`; add preflight check in build to assert presence.
  - Launch blocker?: Potentially (if customers need PDF downloads)

PORTAL
- Title: Legacy workbook-access.json empty
  - Severity: Medium
  - Area affected: Portal account/user assignment fallback
  - Root cause: Excel files are empty or different format; generator updated to handle case sensitivity but produces 0 records if no data.
  - Files involved: scripts/generate-portal-workbook-access.mjs, private-source/portal/workbook-access.json
  - Recommended fix: Migrate any consumers to Dashboard v1 or ensure Excel files are provided in CI; add stricter validation and CI alerts if 0 records generated.
  - Launch blocker?: No (if Dashboard v1 is primary), Yes (if legacy flow required)

AUTHENTICATION
- Title: Cloudflare Access integration verification required
  - Severity: Critical
  - Area affected: Portal and Admin access protection
  - Root cause: Cloudflare Access app/policy may not be fully validated for `/portal/*` and `/api/portal/*`.
  - Files involved: wrangler.toml (if using Cloudflare Workers), app/portal/* (protected routes), deployment config (Vercel env)
  - Recommended fix: Validate Cloudflare Access app config, test sign-in flows for admin and portal users, confirm env vars (CLOUDFLARE_ACCESS_TEAM_DOMAIN, CLOUDFLARE_ACCESS_AUD)
  - Launch blocker?: Yes

CUSTOMER ACCESS
- Title: Price-list access mapping may be incomplete
  - Severity: High
  - Area affected: Customer-visible price lists
  - Root cause: `assignedPriceLists` source must be validated vs Dashboard v1 exports; some mappings may still rely on workbook data.
  - Files involved: lib/portal/adminData.ts, lib/portal/priceLists.ts, private-source/portal/dashboard-v1/current
  - Recommended fix: Reconcile price list assignments in Dashboard v1; add tests/spot checks.
  - Launch blocker?: Possibly

UI/UX
- Title: Accounts/Users admin pages de-emphasized (stub) — needs UX decision
  - Severity: Low/Medium
  - Area affected: Admin workflows
  - Root cause: Decision to hide complex legacy layouts for launch; either redirect or provide Coming Later page.
  - Files involved: app/portal/admin/accounts/page.tsx, app/portal/admin/users/page.tsx, app/portal/admin/AdminShell.tsx
  - Recommended fix: Decide redirect vs stub; optionally add link protected by a feature flag.
  - Launch blocker?: No

DATA GENERATION
- Title: Dashboard v1 freshness must be validated before cutover
  - Severity: Critical
  - Area affected: All customer data shown on admin/dashboard
  - Root cause: Launch Go/No-Go requires snapshot within 3 business days.
  - Files involved: private-source/portal/dashboard-v1/current/latest_snapshot_manifest.json
  - Recommended fix: Run `npm run portal:generate-dashboard-v1:launch` and verify `data_refresh_date` and manifest; include automated check in prebuild.
  - Launch blocker?: Yes (per current launch rules)

ADMIN DASHBOARD
- Title: Business Name link preview behavior must return correctly
  - Severity: Medium
  - Area affected: Admin preview navigation
  - Root cause: `returnTo` query param used; verify all preview links include `returnTo=/portal/admin` and Back behavior respects it.
  - Files involved: app/portal/admin/page.tsx, app/portal/admin/preview/[accountNumber]/page.tsx
  - Recommended fix: Add unit/integration test for preview/back navigation; visually verify in manual checks.
  - Launch blocker?: No

PERFORMANCE
- Title: Server-side rendering and large table memory for admin dashboard
  - Severity: Medium
  - Area affected: `/portal/admin` (renders entire Dashboard v1 rows in server render)
  - Root cause: Rendering many rows (~N) without pagination can cause slow SSR.
  - Files involved: app/portal/admin/page.tsx, lib/portal/adminDashboardV1.ts
  - Recommended fix: Add server-side pagination or streaming, use SSG with incremental regeneration where appropriate.
  - Launch blocker?: No but recommended

TECHNICAL DEBT
- Title: Mixed data sources (workbook vs dashboard-v1) complexity
  - Severity: Medium
  - Area affected: Portal data pipelines and legacy code paths
  - Root cause: Migration in progress; legacy generator remains for fallback.
  - Files involved: scripts/generate-portal-workbook-access.mjs, scripts/generate-portal-dashboard-v1.mjs, lib/portal/*
  - Recommended fix: Finalize migration plan to Dashboard v1 and retire legacy generator, or keep strict contract and tests.
  - Launch blocker?: No


Notes:
- Every issue above should include a small test/check in CI where applicable (e.g., assert snapshot freshness, assert price list R2 keys exist).
- If you want, I can expand each issue into tracked tickets with steps and commands to reproduce.
