# Artisan Lab Network SEO Month 1 Package

Prepared August 22, 2026.

## Deliverables

- [Formal crawl and prioritized issue register](issue-register-2026-08-22.md)
- [Artisan, Pike, Peak, and Pacific baseline scorecard](baseline-scorecard-2026-08-22.md)
- [Keyword universe, competitor list, and page-to-keyword map](keyword-competitor-page-map.md)
- [First two SEO asset briefs](content-briefs-month-1.md)
- [Pipedrive attribution mapping register](pipedrive-attribution-mapping-2026-08-22.md)

## Evidence

- `data/live-crawl-2026-08-22.json` and `.csv`
- `data/preview-crawl-2026-08-22.json` and `.csv`
- `data/search-console-baseline-2026-08-22.json`
- `data/ga4-baseline-2026-08-22.json`

The crawl is reproducible with `scripts/seo-crawl.mjs`. Search Console and GA4 snapshots record the reporting grain, date range, and known limitations. Pipedrive status is documented only after a reloaded UI verification.

## Decision Summary

1. Keep preview noindexed until the launch gates pass.
2. Make `https://www.artisanlabnetwork.com` the only production canonical host.
3. Correct self-canonicals and Open Graph URLs before cutover.
4. Preserve live search equity with page-to-page 301 redirects, especially for Pacific and Pike.
5. Build `/switch-to-artisan` as the first commercial SEO asset.
6. Treat the three strengthened lab pages as the second coordinated local/entity asset.
7. Judge SEO on qualified actions and conversion rates by lab and site version—not traffic alone.
