Project: Artisan Lab Network (ALN) Website

Project purpose
- Public marketing site + Customer Portal for Artisan Lab Network (ALN).
- Customer Portal provides authenticated access to price lists, account dashboards, and downloadable PDFs for customers. Admin portal provides read-only previews and admin tools backed by Dashboard v1.

Current overall completion: ~85%

Major completed work
- Next.js (App Router) migration completed and running (Next 16+).
- Dashboard v1 snapshot ingestion implemented (private-source/portal/dashboard-v1/current).
- Admin portal simplified: `/portal/admin` is the primary Admin Customer Intelligence Dashboard (Dashboard v1-driven).
- Vercel Analytics integrated at root layout (`app/layout.tsx`).
- Build pipeline fixed for Vercel (Excel script casing and XML handling patched).
- Pricing manifest + price lists implemented (`lib/portal/priceLists.ts`).

Major unfinished work
- Legacy workbook Excel files may be empty and workbook-access generation produces 0 records — needed if legacy workbook workflow required.
- Some admin screens (Accounts/Users) are intentionally de-emphasized and show stubs; decisions on redirects vs stubs pending.
- Cloudflare Access policy verification and final env var checks for production.
- End-to-end verification of portal download/R2 flows if enabled.

Current branch
- main

Recent significant changes
- Enabled `@vercel/analytics` in `app/layout.tsx` (Analytics component added).
- Fixed Vercel build failure: updated `scripts/generate-portal-workbook-access.mjs` for case-sensitive file names and XML namespace handling; added logging and validation.
- Simplified admin nav and admin dashboard to use Dashboard v1 (files under `app/portal/admin/*`).
- Fixed a TypeScript `key` issue in `app/portal/PortalDashboard.tsx`.

Launch readiness assessment
- Build: PASS (local and Vercel CI) after fixes.
- Data: Dashboard v1 snapshot present and current; launch rule requires snapshot within 3 business days (check manifest `private-source/portal/dashboard-v1/current/latest_snapshot_manifest.json`).
- Auth: Cloudflare Access expected to protect `/portal/*`; verify Access app config and Vercel env variables.
- Analytics: Enabled and will show data in Vercel dashboard once deployed.
- Go/No-Go gate: Dashboard v1 freshness and any required portal access artifacts must be validated prior to cutover.

Known risks
- Excel/workbook legacy flow: `workbook-access.json` generated with 0 records if Excel files are empty — could break any features that still depend on this legacy data.
- Cloudflare Access misconfiguration could block admins or expose portal endpoints incorrectly.
- Missing or incorrect Vercel environment variables (NEXT_PUBLIC_SITE_DOMAIN, NEXT_PUBLIC_PORTAL_LOGIN_URL, CF_ACCESS vars) will break production flows.
- Pricing PDFs / R2 objects missing or R2 auth misconfigured will break downloads.
- Admin edit workflows are not implemented (read-only previews only).

Current recommendation
- Proceed with launch using Dashboard v1 as primary admin/customer dataset.
- Keep legacy workbook generation in place but treat its outputs as optional; ensure any production functionality relying on `workbook-access.json` is either migrated to Dashboard v1 or guarded.
- Verify Cloudflare Access and required Vercel env vars before cutover.


"What a New AI Assistant Must Know First"
- Primary admin/customer data for launch comes from `private-source/portal/dashboard-v1/current/` (manifest, accounts_index.json, accounts/*.json, users_to_accounts.json).
- Build runs `npm run prebuild` which triggers `portal:generate-access` and `pricing:generate`; the access generator now tolerates empty workbook files but will warn.
- Admin dashboard is intentionally simplified to use Dashboard v1; accounts/users pages are de-emphasized for launch.
- Analytics is enabled at `app/layout.tsx`.  
