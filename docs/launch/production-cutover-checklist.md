# ALN Production Cutover Checklist

This checklist is the final pre-flight for Vercel production deploy and DNS cutover to `artisanlabnetwork.com`.

## 1) Verification Commands

### Local verification

```bash
npm run launch:verify
```

### Staging verification

```bash
node scripts/verify-launch-readiness.mjs --base-url https://preview.artisanslabs.com
```

### Post-cutover verification (www)

```bash
node scripts/verify-launch-readiness.mjs --base-url https://www.artisanlabnetwork.com
```

### Post-cutover verification (apex)

```bash
node scripts/verify-launch-readiness.mjs --base-url https://artisanlabnetwork.com
```

## 2) Vercel Environment Variables (Production)

Required:
- `NEXT_PUBLIC_SITE_DOMAIN`
- `NEXT_PUBLIC_PORTAL_LOGIN_URL`
- `CLOUDFLARE_ACCESS_TEAM_DOMAIN` or `CF_ACCESS_TEAM_DOMAIN`
- `CLOUDFLARE_ACCESS_AUD` or `CF_ACCESS_AUD`

Conditional (if PDF downloads remain active):
- R2 bucket and credential variables used by portal download routes

Checklist:
- [ ] All required variables exist in Vercel Production scope
- [ ] Values match production domain and Cloudflare Access app config
- [ ] Portal login URL points to canonical production portal route
- [ ] Optional R2 variables present if PDF download flow is still enabled

## 3) Cloudflare + DNS + M365 Checklist

### DNS safety first
- [ ] Export Cloudflare DNS zone before changes
- [ ] Record current apex and `www` values for rollback

### Vercel routing records
- [ ] Apex (`artisanlabnetwork.com`) record set to Vercel target
- [ ] `www.artisanlabnetwork.com` record set to Vercel target
- [ ] Domain verified in Vercel before cutover

### Cloudflare Access protection
- [ ] Access app/policy enforced for `/portal/*`
- [ ] Access app/policy enforced for `/api/portal/*`
- [ ] Access app/policy enforced for `/private/*`

### Microsoft 365 continuity
- [ ] MX records preserved
- [ ] SPF TXT preserved
- [ ] DKIM CNAME records preserved
- [ ] DMARC TXT preserved
- [ ] `autodiscover` CNAME preserved
- [ ] Post-cutover send/receive mail test passes

## 4) Manual Portal Test Matrix

### Logged out user
- [ ] `/portal` does not expose customer data
- [ ] `/portal/price-list/g6` does not expose restricted pricing data
- [ ] `/api/portal/download?code=G6` is blocked/unauthorized
- [ ] `/private/price-list/g6` redirects safely and remains protected

### Authorized single-account user
- [ ] Sees only assigned account
- [ ] Dashboard renders with account-specific data
- [ ] Pricing access works only for allowed code(s)

### Authorized multi-account user
- [ ] Account switch works
- [ ] No cross-account leakage beyond assigned accounts
- [ ] Dashboard and pricing data match selected account context

### Unauthorized authenticated user
- [ ] Cannot access unassigned account data
- [ ] Cannot access unauthorized pricing code(s)

### Admin user
- [ ] Admin preview/status is visible
- [ ] Manifest/snapshot status is shown
- [ ] Admin-only flows are not visible to non-admin users

## 5) Dashboard Freshness Requirement

Go/No-Go rule:
- Dashboard snapshot must be within **3 business days** of cutover date.

Generate launch snapshot command:

```bash
npm run portal:generate-dashboard-v1:launch
```

Validation:
- [ ] `private-source/portal/dashboard-v1/current/latest_snapshot_manifest.json` exists
- [ ] `data_refresh_date` is within 3 business days
- [ ] Account count and generation logs look correct for latest export

## 6) Analytics Validation

- [ ] Analytics tag(s) present on production pages
- [ ] Page view events fire for key public routes
- [ ] Conversion/lead events fire for main form CTA path(s)

## 7) Rollback Checklist

If critical launch failure occurs:
- [ ] Restore prior DNS apex and `www` values
- [ ] Verify old site responds again on public domain
- [ ] Verify Microsoft 365 mail flow still works
- [ ] Record timestamp of rollback and impacted systems
- [ ] Document failure cause and corrective action before retry

## 8) Final Signoff

- Jim: [ ] Go  [ ] No-Go
- Brandon: [ ] Go  [ ] No-Go
- Rachel: [ ] Go  [ ] No-Go

## 9) Cutover-Day Execution Order

1. [ ] Confirm Vercel deploy is final and stable
2. [ ] Run staging verification command
3. [ ] Confirm dashboard freshness gate passes
4. [ ] Confirm Cloudflare Access + env vars
5. [ ] Export DNS zone and capture rollback values
6. [ ] Apply apex + `www` DNS changes
7. [ ] Run post-cutover verification for `www` and apex
8. [ ] Run manual portal matrix checks
9. [ ] Run mail send/receive test
10. [ ] Collect signoff from Jim, Brandon, Rachel
