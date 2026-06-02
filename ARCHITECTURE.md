ARCHITECTURE & COMPONENT MAP

Folder structure (top-level highlights)
- app/ — Next.js App Router pages and layouts
  - portal/ — Customer portal and admin UIs
    - admin/ — Admin shell, dashboard, accounts/users stubs, preview
- lib/ — Server-side helpers and data access for portal, pricing, auth
  - lib/portal — portal-specific helpers (dashboard v1, price lists, customers)
- private-source/portal/dashboard-v1/current — Dashboard v1 snapshot (manifest, accounts_index.json, accounts/*.json, users_to_accounts.json)
- scripts/ — generator scripts (generate-portal-workbook-access.mjs, generate-portal-dashboard-v1.mjs, verify-launch-readiness.mjs)
- public/ — static assets and price sheet PDFs (some may be stored in R2)
- package.json — scripts and dependencies
- vercel.json, wrangler.toml — deployment-related config

Major routes (most important)
- /portal — Customer Portal root (protected by Cloudflare Access)
- /portal/price-list/[code] — Price list pages (G6, P6, A6, etc.)
- /portal/admin — Admin Customer Intelligence Dashboard (Dashboard v1-driven)
- /portal/admin/preview/[accountNumber] — Preview customer portal as a specific account
- /portal/admin/users — Advanced users screen (de-emphasized)
- /portal/admin/accounts — Advanced accounts screen (de-emphasized)

Data flow
- Dashboard v1 generation script reads input CSV/Excel sources, outputs snapshot into `private-source/portal/dashboard-v1/current/`.
- `app` server code reads Dashboard v1 JSON artifacts (manifest, accounts/*.json) via `lib/portal/dashboardV1` and `lib/portal/adminDashboardV1`.
- Legacy workbook generator reads Excel files (`private-source/portal/user_data.xlsx`, `acct_data.xlsx`) and writes `workbook-access.json`/`workbook-data.json`.

Authentication flow
- Cloudflare Access expected to protect `/portal/*`, `/api/portal/*`, `/private/*` via Access app/policies.
- Admin access checks use headers (helper `getPortalAdminEmailFromHeaders` in `lib/portal/admin.ts`) to assert admin identity.
- No in-app password store — relies on Cloudflare Access.

Portal access flow
- Customer authorization: `workbook-access.json` (legacy) and Dashboard v1 user mapping (`users_to_accounts.json`) are used to derive what price-lists and portal sections a customer may access.
- `lib/portal/customers` and related modules compute `customerPortalAccess` and drive `PortalDashboardContent` rendering.

Pricing generation flow
- `scripts/generate-price-list-data.mjs` and `scripts/generate-portal-dashboard-v1.mjs` generate prices and dashboard snapshots.
- `lib/portal/priceLists.ts` defines canonical codes and mapping (G5->G6, etc.).
- PDFs may be stored in `public/` and R2 (r2Key references in `priceLists`).

Admin preview flow
- `/portal/admin` renders a Dashboard v1 table (business name clickable). Click takes admin to `/portal/admin/preview/[accountNumber]?returnTo=/portal/admin`.
- Preview page (`app/portal/admin/preview/[accountNumber]/page.tsx`) assembles workbook profile, preview customer via `getPreviewCustomerByAccountNumber`, Dashboard v1 account state, and renders `PortalDashboardContent` with admin flags.
- Preview Back button uses `returnTo` query param to return to admin dashboard.

Customer preview flow
- `PortalDashboardContent` (app/portal/PortalDashboard.tsx) is used for both preview and authenticated customer views.
- For authenticated customers, the app resolves access from the Dashboard v1 snapshot and/or `workbook-access.json`.

Build / Deploy process
- `npm run build` runs `prebuild` which executes `npm run portal:generate-access` and `npm run pricing:generate`.
- Vercel build runs the same scripts; ensure `private-source/portal/dashboard-v1/current` is present (committed or generated) before deploy.
- Analytics: `@vercel/analytics` added to `app/layout.tsx`.
- Deploy target: Vercel (vercel.json present). Cloudflare is used for DNS and Access.

Cloudflare dependencies
- Cloudflare Access for authentication gating.
- Cloudflare DNS for domain `artisanlabnetwork.com` and `www` records.
- Optionally R2 for price sheet hosting; wrangler.toml exists but usage should be verified.

Generated artifact locations
- Dashboard v1 snapshot: `private-source/portal/dashboard-v1/current/`
  - `latest_snapshot_manifest.json`
  - `accounts_index.json`
  - `accounts/{account_id}.json`
  - `users_to_accounts.json`
- Legacy workbook generator outputs:
  - `private-source/portal/workbook-access.json`
  - `private-source/portal/workbook-data.json`
- Pricing outputs: price PDFs in `public/` or R2 (see `lib/portal/priceLists.ts` r2Key fields)

Important files and their purpose
- app/layout.tsx — Root layout; Vercel Analytics included.
- app/portal/* — Portal and admin UI components and pages.
- app/portal/PortalDashboard.tsx — Central rendering component for customer dashboard.
- app/portal/admin/AdminShell.tsx — Admin layout and navigation.
- lib/portal/dashboardV1.ts — Reads Dashboard v1 account JSONs and manifest.
- lib/portal/adminDashboardV1.ts — Builds admin-focused rows from Dashboard v1 accounts.
- scripts/generate-portal-workbook-access.mjs — Legacy Excel->workbook-access generator (case-sensitive filenames patched).
- scripts/generate-portal-dashboard-v1.mjs — Dashboard v1 generation script (source of truth for launch).
- private-source/portal/dashboard-v1/current — Primary launch data snapshot.
- lib/portal/priceLists.ts — Price list definitions and canonicalization rules.


