# Launch Readiness Audit

## Summary of improvements made

- Added richer default site metadata, Open Graph, and Twitter metadata so pages inherit stronger launch-ready social previews.
- Expanded the sitemap to include polished public program, partner, policy, AR, and onboarding routes.
- Improved navigation, modal, and mobile menu accessibility with clearer labels, stronger focus states, and cleaner keyboard behavior.
- Replaced development-flavored placeholder naming and visible fallback wording with production-ready resource, data-availability, and portrait fallback states.
- Tightened generic CTAs in provider resources and program cards so actions feel more intentional.
- Removed routine portal auth/workbook/export console noise by gating diagnostics behind explicit debug environment flags.
- Gated the CookieYes loader to the registered production hostnames to avoid local QA console errors while preserving production consent behavior.
- Fixed a React hydration issue in the setup-hub return helper by using a stable server snapshot for session-storage state.
- Removed an unused pricing helper that caused lint warnings.
- Verified public routes, redirects, metadata, robots/sitemap, protected route behavior, and hidden price-list handling.

## Remaining items requiring human input

- Production build without the Vercel artifact skip still requires R2 credentials: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`.
- Portal auth in production requires Cloudflare Access settings: `CLOUDFLARE_ACCESS_TEAM_DOMAIN` or `CF_ACCESS_TEAM_DOMAIN`, plus `CLOUDFLARE_ACCESS_AUD` or `CF_ACCESS_AUD`.
- CookieYes should remain registered for `www.artisanslabs.com` and `artisanslabs.com`; additional launch domains need to be added in CookieYes before enabling the banner there.
- Legal/privacy/policy copy should receive final owner approval before launch.
- Any testimonials, customer claims, performance claims, or statistics should be confirmed against the latest approved business source before public promotion.

## Assumptions made

- Existing repository images and brand assets are the approved source of truth for this launch pass.
- The old home/resource version routes are intentionally redirected and should not be polished as standalone public pages.
- Portal, private price-list, and admin routes are protected operational surfaces; the audit focused on keeping them secure, quiet, and technically clean rather than marketing-polished.
- The production deployment follows the existing Vercel artifact-skip path when committed portal, locator, and pricing artifacts are present.

## Verification performed

- `npm run lint`
- `npm run typecheck`
- `VERCEL=1 npm run build`
- `npm run launch:verify -- --base-url http://127.0.0.1:3000`
- Playwright smoke checks on `/`, `/provider-resources`, and `/new-lab-partner`
- Playwright console checks for the homepage, provider resources, and onboarding-to-home return flow
- Screenshots saved under `output/playwright/`
