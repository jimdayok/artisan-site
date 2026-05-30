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

## What it tests

1. Public route status:
   - `/`
   - `/about`
   - `/artisan-model`
   - `/provider-resources`
   - `/lab-policies`
   - `/newsletters`
   - `/new-lab-partner`
2. Redirect status and destination:
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
3. `sitemap.xml` availability and expected route references.
4. `robots.txt` disallow behavior for `/portal`, `/private`, and `/api`.
5. Protected route behavior and headers:
   - `/portal`
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

## How to run after DNS cutover

```bash
node scripts/verify-launch-readiness.mjs --base-url https://www.artisanlabnetwork.com
```

Run both:
- `https://www.artisanlabnetwork.com`
- `https://artisanlabnetwork.com` (if apex serves directly)

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
