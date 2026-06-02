# EXECUTIVE SUMMARY — ALN Website + Customer Portal + Pricing System

Date of assessment: 2026-06-01
Assessor scope: read-only architecture, pricing, auth, dashboard, deployment audit (no code changes)

## Project Completion Estimate
- Engineering completion (implemented features): **88%**
- Launch readiness (production-safe + policy-verified): **73%**

## Launch Readiness Decision
- **Not launch-ready yet**.
- Reason: critical go/no-go controls are still unverified or inconsistent (Cloudflare Access production verification, snapshot freshness policy mismatch, and pricing/PDF parity risks for non-core lists).

## Top 10 Strengths
1. Core portal architecture is running on Next.js App Router with clear route boundaries.
2. Canonical price-list mapping is implemented in code (`G5→G6`, `P5→P6`, `A5→A6`).
3. Dashboard v1 pipeline is operational and currently populated (`278` accounts, `594` mapped user emails).
4. Admin/customer access boundaries exist in middleware and route-level checks.
5. Admin preview workflow is implemented end-to-end with guarded `returnTo` handling.
6. Pricing UI has account-assigned visibility checks before rendering/download.
7. PDF download path includes auth checks, account scoping, and rate limiting.
8. Security headers and noindex/no-store headers are broadly configured for portal/private/api routes.
9. Vercel Analytics is integrated in root layout.
10. Launch verification script exists (`scripts/verify-launch-readiness.mjs`) and covers public/redirect/protected checks.

## Top 10 Risks
1. **Critical**: Cloudflare Access production verification is not proven by this repo alone (edge policy + env correctness must be validated live).
2. **Critical**: Snapshot freshness rule mismatch: docs say “within 3 business days,” code marks stale after 2 calendar days in `lib/portal/dashboardV1.ts`.
3. **High**: `workbook-access.json` is currently empty (`0` records); fallback path exists but contributes no data.
4. **High**: R2 keys are missing for multiple configured price lists (many `r2Key: null`), so PDF parity/download coverage is partial.
5. **High**: Some pricing data is still heuristic/derived; not all list codes have complete normalized interactive outputs.
6. **High**: Admin “all access” list for section auth is hardcoded and does not include every configured code path consistently.
7. **Medium**: `/portal/admin` route redirects to `/portal` (by design), which is non-obvious and can confuse operational runbooks.
8. **Medium**: Mixed pricing sources (`pdfDerived`, generated normalized, DVI fallback) increase parity drift risk.
9. **Medium**: Dashboard page renders large tables without server pagination/streaming.
10. **Medium**: Documentation overstates some “resolved” states; code and docs are not fully synchronized.

## Immediate Recommendation
- Run a **production-readiness hardening pass** focused only on: auth verification, snapshot freshness rule alignment, and pricing/PDF parity coverage for assigned customer lists. Freeze non-essential UX work until these are closed.
