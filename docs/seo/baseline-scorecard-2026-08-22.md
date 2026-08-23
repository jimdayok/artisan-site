# Artisan, Pike, Peak, and Pacific SEO Baseline Scorecard

Baseline date: August 22, 2026  
Search Console period: May 21–August 20, 2026 (Web; `sc-domain:artisanlabnetwork.com`)  
GA4 observation: last 7 days unless noted; property `396956220`

## Executive Summary

Pacific is the current organic leader: its live landing page earned 254 clicks and 2,505 impressions, and the exact query `pacific artisan labs` earned 158 clicks. Peak has the strongest exact branded-query position at 1.5 but a much smaller click base. Pike ranks well for its exact name but has the smallest branded demand and landing-page traffic. The Artisan homepage earns the most impressions but only a 2.1% landing-page CTR and an average position of 12.2, making the non-branded network story the largest near-term search opportunity.

The preview pages solve much of the content-depth and heading problem. Their host/canonical configuration must be corrected before Google is allowed to index them.

## Performance Baseline

| Brand / entity | GSC landing page | Clicks | Impressions | CTR | Avg. position | Exact named query | Query clicks / impressions | Query CTR / position | GA4 page views, last 7 days |
|---|---|---:|---:|---:|---:|---|---:|---:|---:|
| Artisan | `/` | 165 | 7,901 | 2.1% | 12.2 | `artisan lab network` | 51 / 80 | 63.8% / 2.3 | 243 |
| Pacific | `/pacificartisanlabs` | 254 | 2,505 | 10.1% | 5.4 | `pacific artisan labs` | 158 / 455 | 34.7% / 3.0 | 76 |
| Peak | `/peak-artisan-labs` | 62 | 1,804 | 3.4% | 5.7 | `peak artisan labs` | 43 / 240 | 17.9% / 1.5 | 37 |
| Pike | `/pikeartisanlabs` | 50 | 1,334 | 3.7% | 5.8 | `pike artisan labs` | 17 / 71 | 23.9% / 2.9 | 36 |

The landing-page and query columns are different measurement grains and should not be added together. The query rows represent exact names only, not all branded variants.

## Sitewide Acquisition Baseline

| Metric | Value |
|---|---:|
| GSC clicks | 742 |
| GSC impressions | 15,577 |
| GSC CTR | 4.8% |
| GSC average position | 10.6 |
| GA4 organic-search sessions, last 7 days | 67 |
| GA4 direct sessions, last 7 days | 240 |
| GA4 referral sessions, last 7 days | 13 |
| GA4 key events today | 0 |

The GA4 measurement system changed during this observation window. Treat GA4 counts as directional and establish the conversion baseline from the first complete 28-day period after event/key-event configuration is stable.

## Search Readiness Score

This is an internal 100-point planning score, not a score from Google or a third-party SEO tool. It provides a repeatable priority view across four entities.

- Search visibility: 30 points, based on observed impressions, clicks, CTR, and position.
- Live on-page foundation: 20 points, based on indexability, title, description, H1, canonical, and content depth.
- Preview destination readiness: 25 points, based on content depth, headings, structured data, and launch-safe canonical configuration.
- Conversion measurement: 15 points, based on GA4 availability and whether a stable lead baseline exists.
- Local/entity clarity: 10 points, based on location identity and machine-readable entity detail.

| Brand | Visibility /30 | Live page /20 | Preview readiness /25 | Measurement /15 | Entity clarity /10 | Total /100 | Status |
|---|---:|---:|---:|---:|---:|---:|---|
| Artisan | 17 | 11 | 15 | 8 | 7 | 58 | Needs work |
| Pacific | 26 | 12 | 18 | 8 | 9 | 73 | Strongest baseline |
| Peak | 21 | 11 | 18 | 8 | 9 | 67 | Competitive foundation |
| Pike | 17 | 11 | 18 | 8 | 9 | Visibility growth needed |

Preview readiness is capped because every preview entity currently publishes the unwanted `artisanslabs.com` canonical host. The three lab pages still score above the network page because they have descriptive H1s, 900–1,000+ rendered words, location detail, and organization schema.

## Page Foundation Comparison

| Entity | Live page foundation | Preview page foundation | Priority implication |
|---|---|---|---|
| Artisan | 404 rendered words; no H1; self-canonical | 812 rendered words; one H1; stronger commercial story; wrong canonical host | Correct host/canonical, then use homepage for network brand plus broad partnership terms |
| Pacific | 359 words; no H1; no detected structured data | 1,022 words; one H1; lab organization schema; wrong canonical host | Preserve the live page’s strong search equity with a one-hop 301 |
| Peak | 341 words; no H1; no detected structured data | 927 words; one H1; lab organization schema; wrong canonical host | Improve CTR and local/non-brand breadth after safe migration |
| Pike | 343 words; no H1; no detected structured data | 962 words; one H1; lab organization schema; wrong canonical host | Grow demand with Midwest/Indianapolis and independent-lab clusters |

## Baseline Targets

Targets should be confirmed after the first stable 28-day post-launch period. Until then, use these operating targets rather than forecasting absolute lead volume:

| KPI | First operating target |
|---|---|
| Homepage search CTR | Improve from 2.1% without losing branded CTR |
| Lab page CTR | Raise Peak and Pike above 5%; protect Pacific above 8% |
| Organic lead measurement | At least 95% of successful lead actions contain `site_version` and `lab_name` |
| Migration retention | Retain at least 90% of aggregate clicks to the four principal landing pages after the stabilization window |
| Broken internal links | Zero on indexable commercial pages |
| Canonical accuracy | 100% of indexable pages self-canonical on `www.artisanlabnetwork.com` |
| Qualified actions | Report per 100 organic sessions and per 100 sitewide sessions |

## Reporting Definition

Monthly reporting should use GA4’s native acquisition dimensions and the custom context already designed:

- Organic users, sessions, engaged sessions, new users, and landing pages.
- `generate_lead`, `open_account`, `partner_inquiry`, `schedule_meeting`, and `click_phone` as primary business actions.
- Qualified actions per 100 sessions = the sum of the agreed primary action counts divided by sessions, multiplied by 100. Present both deduplicated users and event counts if repeated actions are material.
- Organic lead conversion rate = organic sessions with at least one `generate_lead` divided by organic sessions.
- Lab reporting grouped by `lab_name` = Pike, Peak, Pacific, Network.
- Site comparison grouped by `site_version` = existing, preview, production.

Source snapshots are stored in `docs/seo/data/search-console-baseline-2026-08-22.json` and `docs/seo/data/ga4-baseline-2026-08-22.json`.
