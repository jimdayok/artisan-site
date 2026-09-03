# ALN Launch Verification Automation

This command runs a production-readiness smoke test for launch-critical routes.

## Command

```bash
npm run launch:verify
```

Optional target:

```bash
node scripts/verify-launch-readiness.mjs --base-url https://preview.artisanslabs.com
```

Cloudflare Access-aware mode (recommended for staging/edge-protected hosts):

```bash
node scripts/verify-launch-readiness.mjs --base-url https://artisanslabs.com --access-aware
```

## What it tests

1. Public route status:
   - `/`
   - `/about`
   - `/artisan-model`
   - `/provider-resources`
   - `/lab-policies`
   - `/newsletters`
2. Redirect status and destination:
   - `/new-lab-partner` to the protected `/portal/onboarding` route
   - `/contact`
   - `/contactus`
   - `/practice-resources`
   - `/pressreleases`
   - `/shipping`
   - `/Shipping`
   - `/ourcraft`
   - `/our-craft-1`
   - `/pacificartisanlabs`
   - `/pikeartisanlabs`
   - `/practicematters`
3. `sitemap.xml` availability, expected public route references, and exclusion of `/new-lab-partner`.
4. `robots.txt` disallow behavior for `/portal`, `/private`, and `/api`.
5. Protected route behavior and headers:
   - `/portal`
   - `/portal/onboarding`
   - `/portal/price-list/g6`
   - `/api/portal/download?code=G6`
   - `/private/price-list/g6`
6. Private/API header checks:
   - `X-Robots-Tag` includes `noindex`, `nofollow`, `noarchive`
   - `Cache-Control` includes `private`, `no-store`

## How to run locally

1. Start app:
   - `npm run dev`
2. In a second terminal:
   - `npm run launch:verify`

Default base URL is `http://127.0.0.1:3000`.

## How to run against staging

```bash
node scripts/verify-launch-readiness.mjs --base-url https://preview.artisanslabs.com
```

If staging host is behind Cloudflare Access edge redirects, use:

```bash
node scripts/verify-launch-readiness.mjs --base-url https://preview.artisanslabs.com --access-aware
```

## How to run after DNS cutover

```bash
node scripts/verify-launch-readiness.mjs --base-url https://www.artisanlabnetwork.com
```

Run both:
- `https://www.artisanlabnetwork.com`
- `https://artisanlabnetwork.com` (if apex serves directly)

For final production go/no-go, prefer non-`--access-aware` mode on canonical hosts
so redirect/robots/sitemap assertions are strict.

## Output format

The script prints:
- Pass/fail per check
- Status code
- Redirect destination URL
- Missing header requirements
- Launch blocker summary

Exit code:
- `0` = no blocking failures
- `1` = one or more blocking failures
