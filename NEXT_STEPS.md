NEXT STEPS (prioritized)

## Do Next

1) Validate Dashboard v1 freshness (Critical)
- Why it matters: Launch gate requires snapshot within 3 business days.
- Estimated effort: 30–60 minutes
- Dependencies: `private-source/portal/dashboard-v1/current/latest_snapshot_manifest.json`; `npm run portal:generate-dashboard-v1:launch` if regeneration needed.
- Expected outcome: Manifest with `data_refresh_date` within window; confirmed account counts.

2) Verify Cloudflare Access & Vercel env vars (Critical)
- Why: Prevents accidental public exposure or admin lockout.
- Effort: 1–2 hours
- Dependencies: Cloudflare Access console, Vercel project settings (env vars listed in docs).
- Outcome: Confirmed Access policy for `/portal/*`, `/api/portal/*`, and `/private/*`.

3) Confirm pricing R2 assets present (High)
- Why: Customers must download PDFs; missing assets break flows.
- Effort: 1–2 hours
- Dependencies: R2 bucket credentials, `lib/portal/priceLists.ts` mapping
- Outcome: All configured price lists have r2Key/onlineUrl or graceful fallback.

## Do After That

4) Decide Accounts/Users admin UX (Medium)
- Why: Clarify whether to redirect or keep stubs for advanced tools.
- Effort: 1–2 days (decision + minor implementation)
- Dependencies: Stakeholder sign-off
- Outcome: Clear UX; either redirect to `/portal/admin` or present an opt-in advanced admin page.

5) Add SSR pagination / streaming for admin dashboard (Medium)
- Why: Improve performance for large account sets.
- Effort: 1–3 days
- Dependencies: API for paginated accounts (could be file-backed), UI changes
- Outcome: Faster SSR and better memory usage.

6) Migrate remaining consumers off legacy workbook-access.json (Medium)
- Why: Reduce fragility and reliance on Excel files.
- Effort: 2–4 days
- Dependencies: Confirm consumers and update code to read Dashboard v1 artifacts
- Outcome: Single source of truth (Dashboard v1)

## Future Improvements

7) Add automated preflight checks in CI
- Why: Detect missing price PDFs, stale snapshot, or zero access records early
- Effort: 1–2 days
- Dependencies: CI environment (GitHub Actions/Vercel), scripts
- Outcome: Failing prebuild with actionable logs if critical artifacts missing.

8) Analytics: custom events and conversion tracking
- Why: Measure conversions and CTA performance on launch
- Effort: 1–3 days
- Dependencies: Vercel Analytics docs and event plans
- Outcome: Events for key forms and conversions instrumented.

9) Admin edit flows and audit trail (Long-term)
- Why: Admins need editing capabilities with audit logs
- Effort: 2+ weeks
- Dependencies: Backend persistence, auth/audit model
- Outcome: Safe, auditable admin edits in portal.

10) Consolidate documentation and developer onboarding (Low)
- Why: Speed up future dev handoffs
- Effort: 1–2 days
- Dependencies: This handoff pack
- Outcome: README, dev-run steps, and runbook for launch.
