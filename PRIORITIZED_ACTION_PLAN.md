# PRIORITIZED ACTION PLAN — ALN

Date: 2026-06-01

## CRITICAL
1. Validate Cloudflare Access in production-like environment
- Estimated effort: 0.5-1 day
- Risk: Very high if skipped
- Business impact: Prevents either portal lockout or accidental exposure
- Recommended order: #1

2. Align and enforce snapshot freshness policy (3 business days vs current 2-day code check)
- Estimated effort: 0.25-0.5 day
- Risk: High
- Business impact: Avoid false stale alarms or stale data launches
- Recommended order: #2

3. Execute full assigned-list pricing parity audit (portal UI vs customer PDFs)
- Estimated effort: 1-2 days
- Risk: Very high
- Business impact: Direct pricing trust/commercial risk
- Recommended order: #3

## HIGH
1. Close R2 asset gaps for all customer-assigned lists (or explicitly mark non-downloadable with approved UX)
- Estimated effort: 0.5-1.5 days
- Risk: High
- Business impact: Broken download expectations, support load
- Recommended order: #4

2. Reconcile docs vs runtime build/deploy reality (prebuild behavior, go/no-go gate definitions)
- Estimated effort: 0.5 day
- Risk: Medium-high
- Business impact: Operational mistakes during launch week
- Recommended order: #5

3. Validate admin “all-list access” consistency across dashboard/price-list routes
- Estimated effort: 0.5 day
- Risk: Medium-high
- Business impact: Inconsistent admin troubleshooting and preview behavior
- Recommended order: #6

## MEDIUM
1. Add CI preflight checks for:
- snapshot freshness,
- required env presence,
- assigned-list normalized pricing artifacts,
- assigned-list PDF availability
- Estimated effort: 1-2 days
- Risk: Medium
- Business impact: Catches launch regressions before deploy
- Recommended order: #7

2. De-risk legacy workbook dependency by explicitly deprecating or hard-disabling fallback paths if unused
- Estimated effort: 0.5-1 day
- Risk: Medium
- Business impact: Reduced complexity and false assumptions
- Recommended order: #8

3. Add server pagination/streaming to large admin tables
- Estimated effort: 1-2 days
- Risk: Medium
- Business impact: Better operational performance for admin users
- Recommended order: #9

## LOW
1. Improve admin UX messaging around `/portal/admin` redirect-to-portal behavior
- Estimated effort: 0.25 day
- Risk: Low
- Business impact: Reduces confusion
- Recommended order: #10

2. Consolidate handoff docs into one authoritative runbook with “code-verified” status flags
- Estimated effort: 0.5-1 day
- Risk: Low
- Business impact: Faster onboarding and fewer launch errors
- Recommended order: #11

3. Longer-term pricing model simplification (reduce mixed-source renderer paths)
- Estimated effort: Multi-day / phased
- Risk: Low for launch, medium long-term
- Business impact: Maintainability and parity confidence
- Recommended order: Post-launch
