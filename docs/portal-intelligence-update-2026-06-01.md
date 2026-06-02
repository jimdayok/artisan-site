# ALN Portal Intelligence Update
Date: 2026-06-01

## 1. Summary

This document records the result of a major rebuild of the Customer Portal and Admin Portal conducted as part of the June 2026 launch preparation.

Customer-facing portal
- Rebuilt into the Practice Intelligence Center.
- Focused on practice performance, trends, opportunities, programs, price sheets, account details, and support.
- Removed redundant customer hero/title sections.
- Removed unclear Net Lens Share from customer-facing display.
- Removed or avoided fake product/material/brand mix data.
- Added clearly labeled placeholders where data does not yet exist.
- Kept price sheet access, assigned users, support tools, account details, and authorization intact.

Admin portal
- Rebuilt into the Customer Intelligence Command Center.
- Focused on customer success, sales intervention, and account management.
- Includes dashboard overview, customer-by-customer analysis, internal account analysis pages, deep-dive queues for accounts that need attention, direct customer contact tools, and customer portal preview links.

## 2. Customer Portal Current State

Structure (primary pages/sections):
- Overview
- Trends
- Opportunities
- Programs
- Price Sheets
- Account Details
- Support

Mobile: a mobile jump/navigation anchor pattern was added — preserve this behavior in future UI changes.

Customer dashboard principles
- Use real available data.
- Do not present placeholder data as real.
- Label unavailable metrics clearly.
- Keep customer utilities lower on the page (downloads, account settings, support).
- Make the first login experience impressive and useful.
- Customer should quickly understand practice performance and opportunity areas.

## 3. Customer Portal Data Rules

- Do not show Net Lens Share unless the calculation is clearly defined and customer-friendly.
- Do not show fake brand mix, product mix, material mix, or benchmark data.
- If data is missing, surface one of the following labels: "Coming Soon", "Requires Product Detail Data", "Requires Brand Detail Data", "Requires Turnaround Data", "Requires Benchmark Dataset", "Future Insight".
- Shipping Performance should not be shown unless true shipping data exists.
- If the metric is job count, call it "Order Volume" or "Monthly Job Trend".
- If turnaround data exists later, use "Turnaround Performance".

## 4. Admin Portal Current State

Admin View
- Dashboard Overview
  - Customer-by-customer analysis
    - Click customer -> open internal account details.
    - Show address, phone, emails, users, price lists, customer type, lab, sales/jobs trends.
    - Link to view/preview portal exactly as customer.
  - Deep-dive admin analysis
    - JPD losses month over month
    - Sales losses month over month
    - Job count losses month over month
    - Remake rate jumps
    - Office redo increases
    - Lab redo increases
    - Warranty increases
    - Turnaround issues when data exists
    - No-activity accounts
    - Program opportunities
    - Direct customer contact actions

Clarification: The admin portal is not just reporting — it is an internal account management, customer success, and sales intervention system.

## 5. Admin Customer Type Definitions

- NL = Neurolens Customer
- ACQU = Acquios Alliance
- PART = Equity Partner
- GENL = General Customer
- PMP = PMP Customer
- VSP = VSP Customer
- VSP1 = VSP Customer

These remain major dashboard filters and segmentation groups.

## 6. Approved Admin Users

Current approved admin list (canonical):
- jimdayok@me.com
- jim.day@artisanlabnetwork.com
- brandon.butler@artisanlabnetwork.com
- rick@pacificartisanlabs.com
- rtinson@pacificartisanlabs.com
- rahlson@artisanlabnetwork.com

Removed malformed/incorrect previous admin emails:
- rahson@artisanlabnetwork.com
- switmer@artisanlabnetwork.com
- jimdayok@.com (if present previously)

## 7. Implementation Notes

Files changed (expected / primary):
- app/portal/PortalDashboard.tsx
- app/portal/admin/AdminShell.tsx (or AdminLandingDashboard.tsx)
- app/portal/admin/page.tsx (primary admin entry)
- app/portal/admin/accounts/page.tsx (de-emphasized stub)
- app/portal/admin/users/page.tsx (de-emphasized stub)
- app/portal/admin/preview/[accountNumber]/page.tsx
- lib/portal/adminDashboardV1.ts
- lib/portal/adminData.ts
- lib/portal/priceLists.ts
- scripts/generate-portal-workbook-access.mjs (generator hardened)
- app/layout.tsx (Analytics enabled)

Notes about implementation and preservation:
- Workbook processing was preserved, but generator now tolerates empty Excel inputs and emits warnings rather than failing the build.
- Cloudflare Access authentication remains in place and continues to guard `/portal/*` routes.
- Customer authorization, admin preview mode, and customer-specific price sheet access were preserved.
- Existing portal routes and price-sheet download behavior were not changed.

## 8. Verification

- `npm run typecheck` passes.
- `/portal` smoke test returns 200 OK.
- `/portal/admin/account-analysis/1000-PDX` smoke test returns 200 OK.
- `npm run lint` still shows only the pre-existing `.tmp/aln-validation.spec.ts` errors; no new lint failures were introduced by this work.
- Local dev server ran at http://localhost:3000 during review.

## 9. Future Data Priorities

Product utilization to add or improve
- Count of lens pairs by brand
- Count of Modern Package jobs
- Count of ChemClip jobs
- Count of Tokai jobs
- Count of progressive jobs
- Count of Neurolens jobs
- Count of Sequel jobs
- Count of VSP jobs
- Count of private pay jobs
- Material mix
- AR mix
- Frame package usage

Quality metrics to add or improve
- Remake rate changes
- Office redo rate changes
- Lab redo rate changes
- Warranty rate changes
- Non-adapt rate changes

Operations metrics
- Turnaround time (true days)
- Days waiting for frame
- Production timing
- Shipping performance (only if true shipping data exists)

Benchmarking
- Customer vs similar customer type
- Customer vs same lab
- Customer vs ALN network
- Customer vs top quartile

## 10. Future Admin Priorities

- Automatic account risk detection
- Customer opportunity scoring
- Direct outreach workflows
- Better customer segmentation
- Customer-by-customer internal analysis
- Account intervention queue
- Rapid identify customers “in a bad way”
- Direct links to contact info and portal preview

## 11. Design Standard

Everything should remain top-tier and visually excellent. The portal should feel like a modern SaaS analytics executive dashboard and premium account management system. It should not feel like a basic account page, file repository, static Power BI export, or generic admin table.

## 12. Do Not Regress

- Do not reintroduce redundant customer profile hero sections.
- Do not reintroduce unclear Net Lens Share language.
- Do not display fake data as real.
- Do not move price sheets above intelligence sections.
- Do not remove account details or support info.
- Do not break admin preview.
- Do not break customer authorization.
- Do not break assigned price sheet logic.
- Do not remove mobile jump navigation.
- Do not turn the admin dashboard into only a table.

---

Summary of this update
- Created: [docs/portal-intelligence-update-2026-06-01.md](docs/portal-intelligence-update-2026-06-01.md)
- Key sections added: Summary, Customer Portal State, Data Rules, Admin State, Admin Types, Approved Admins, Implementation Notes, Verification, Future Data/Admin Priorities, Design Standard, Do Not Regress.
- Remaining documentation gaps: a) canonical handoff runbook that ties each priority item to an owner (owner fields exist in other docs but not centralized here), b) automated verification steps and scripts for CI (to be added to repo CI docs), c) reconciliation checklist for zero-priced placeholders vs PDF sources.
