# Artisan Lab Network SEO Crawl and Prioritized Issue Register

Audit date: August 22, 2026  
Domains: `www.artisanlabnetwork.com` (live) and `preview.artisanlabnetwork.com` (preview)  
Method: server-rendered HTML crawl from XML sitemap plus discovered internal links. The crawler followed redirects, inspected response headers and HTML, and recorded status, indexability, title, description, canonical, Open Graph URL, headings, word count, structured data, and internal links. JavaScript-only interactions, authenticated portal content, Core Web Vitals, and backlink quality are outside this crawl.

## Executive Summary

The preview site is the stronger search foundation: its network and lab pages have descriptive H1s, substantially more copy, and lab organization schema. It is correctly blocked from indexing while it remains a preview. It is not ready for search cutover yet because its sitemap, canonical framework, Open Graph URLs, and organization schema are generated from `www.artisanslabs.com`. Twelve preview pages also inherit the homepage canonical instead of identifying their own URL.

The live site remains indexable and has meaningful existing visibility, but it carries a large legacy cleanup burden: 40 pages without an H1, 2 real 404s referenced internally, widespread title/description defects, duplicate metadata, and thin pages. The practical path is not to rebuild every legacy page before launch. Fix the preview host/canonical system, map every valuable live URL to its preview successor, preserve the intentionally deindexed pages, and 301 redirect retired live URLs at cutover.

## Crawl Inventory

| Measure | Live | Preview | Interpretation |
|---|---:|---:|---|
| HTML pages crawled | 101 | 65 | Full reachable public crawl; limits were not reached |
| XML sitemap entries | 62 | 30 | Preview is intentionally narrower |
| Indexable 200 pages | 95 | 0 | Preview is intentionally noindexed |
| Noindex 200 pages | 4 | 65 | Preview control is working |
| HTTP errors | 2 | 0 | Both live errors are 404s |
| Redirect responses observed | 42 | 0 | Live architecture has substantial legacy routing |
| Logged issues | 194 | 65 | Raw findings, not 259 separate projects |
| High-severity findings | 47 | 14 | Prioritized below |

Full row-level evidence is in:

- `docs/seo/data/live-crawl-2026-08-22.csv`
- `docs/seo/data/live-crawl-2026-08-22.json`
- `docs/seo/data/preview-crawl-2026-08-22.csv`
- `docs/seo/data/preview-crawl-2026-08-22.json`

## Prioritized Register

| ID | Priority | Domain | Issue and evidence | Business risk | Required action | Owner / timing | Status |
|---|---|---|---|---|---|---|---|
| SEO-01 | P0 | Preview / launch | All 30 sitemap URLs use `www.artisanslabs.com`; 42 crawled HTML pages also canonicalize to that host. `lib/siteMetadata.ts` hardcodes it as the public URL. | Google could consolidate the replacement site under a domain Artisan does not want indexed. | Generate the public host from a controlled production environment value; production must be `https://www.artisanlabnetwork.com`. Regenerate sitemap, canonical, Open Graph URL, and JSON-LD from that one value. | Development, before indexability or cutover | Open — launch blocker |
| SEO-02 | P0 | Preview / launch | Twelve pages canonicalize to the homepage instead of themselves: `/acquios`, `/artisan-ar`, its four treatment pages, `/newsletter`, `/newsletters`, the Practice Matters hub and issue, `/programs`, and `/uoa`. | Page signals can be consolidated into the homepage; pages may fail to index independently. | Remove the root-layout blanket canonical or override it with a self-canonical on every indexable route. Canonical URL must match the final production path. | Development, before cutover | Open — launch blocker |
| SEO-03 | P0 | Both / cutover | Live high-value paths do not consistently match preview paths: `/pacificartisanlabs` → `/pacific-artisan-labs`, `/pikeartisanlabs` → `/pike-artisan-labs`, plus many legacy product/content URLs. | Existing rankings, links, and user bookmarks may be lost during migration. | Approve and implement a one-to-one 301 map. Keep destination pages indexable and self-canonical. Submit the new sitemap only after redirects and public rendering pass. | SEO + development, cutover | Open — launch blocker |
| SEO-04 | P0 | Preview | All 65 preview pages return `X-Robots-Tag: noindex,nofollow,noarchive,nosnippet`. | Correct today, but leaving it in production would suppress the new site completely. | Keep the header on preview. Remove it only from the production deployment after canonical/redirect QA; retain noindex for private, utility, and intentionally excluded routes. | Development, cutover | Correct now / cutover gate |
| SEO-05 | P1 | Live | `/aln_artisan-amour` and `/aln-artisan-azure` return 404. `/artisan-ar` links to both broken destinations. | Users and crawlers hit dead ends; product authority and conversions leak. | Point live links to the valid Armour/Azure pages or 301 each broken URL to its approved replacement. Include both in the cutover map. | Content + development, immediate | Open |
| SEO-06 | P1 | Live | 40 pages have no H1, including the homepage and all three current lab landing pages. | Search intent and page topic are less explicit; accessibility and content hierarchy suffer. | For pages surviving the migration, add one visible descriptive H1. Retired pages should redirect instead of being separately repaired. | Content, migration scope | Open |
| SEO-07 | P1 | Live | 37 titles fall outside the working length range, 18 titles are duplicated, and 8 pages have no meta description. | Weak or duplicate snippets reduce relevance and click-through opportunity. | Rewrite metadata only for retained destinations. Do not spend effort polishing pages that will redirect. | SEO, before/after cutover | Open |
| SEO-08 | P1 | Both | `ourcraft` and `our-partners` must remain absent from search. They are currently live 200 pages with `noindex,nofollow`; Google temporary removals were submitted separately. | Reintroduction can occur if noindex is lost or URLs are added back to a sitemap. | Keep both out of sitemaps and internal navigation; retain server-visible noindex until each URL is either permanently retired (404/410) or redirected to an approved indexable replacement. | SEO + site owner | Controlled; monitor |
| SEO-09 | P1 | Preview | Lab pages use `Organization` schema and strong location detail, but the schema URLs inherit the unwanted host. | Structured data reinforces the wrong entity URL. | Correct host generation first; then validate each lab entity, address, phone, logo, `areaServed`, and network relationship in Rich Results Test / Schema Validator. | Development + SEO | Open |
| SEO-10 | P1 | Preview | `/programs` has no H1. One page has multiple H1s; three pages are thin by the crawler threshold. | A small number of new-site pages still have unclear structure or insufficient rendered context. | Add one descriptive H1 to `/programs`; review the multiple-H1 page and thin pages manually before making them indexable. | Content + development | Open |
| SEO-11 | P2 | Live | 39 descriptions fall outside the working range, 21 descriptions are duplicated, and 20 pages are thin. | Lower snippet quality and weak long-tail coverage. | Consolidate into the new content architecture. Rewrite only pages assigned a unique keyword cluster in the page map. | SEO content program | Open |
| SEO-12 | P2 | Preview | 36 Open Graph URLs point to the homepage path and seven descriptions are duplicated. | Social sharing previews can misattribute pages; duplicated summaries weaken differentiation. | Generate route-specific `openGraph.url` with the same self URL used by canonical; give commercially important pages unique descriptions. | Development + content | Open |
| SEO-13 | P2 | Both | The live sitemap contains parameter variants and legacy utility/thank-you/store pages; the preview sitemap includes legal and transitional pages with uniform priorities. | Crawl focus is diluted and migration validation becomes harder. | Limit the production sitemap to canonical, indexable, 200-status pages. Exclude query variants, redirects, private/utility pages, and noindex destinations. Use meaningful `lastModified`; priorities are optional. | Development | Open |
| SEO-14 | P2 | Both | No clean post-implementation conversion baseline exists yet; GA4 showed zero key events today and the measurement system changed during the current seven-day window. | SEO may be evaluated on traffic without qualified actions. | Accrue a full 28-day post-launch period; report organic sessions, engaged sessions, `generate_lead`, `open_account`, `partner_inquiry`, `schedule_meeting`, and `click_phone` by `site_version` and `lab_name`. | D2D reporting | In accrual |

## Raw Issue Counts

### Live

| Finding | Count | Raw severity |
|---|---:|---|
| Missing H1 | 40 | High |
| Meta description outside working range | 39 | Low |
| Title outside working range | 37 | Medium |
| Duplicate meta description | 21 | Low |
| Thin rendered copy | 20 | Medium |
| Duplicate title | 18 | Medium |
| Missing meta description | 8 | Medium |
| Broken internal link | 4 | High |
| Multiple H1s | 3 | Medium |
| HTTP 404 | 2 | High |
| Missing canonical | 1 | High |
| Redirect chain | 1 | Medium |

### Preview

| Finding | Count | Raw severity |
|---|---:|---|
| Open Graph URL points to another path | 36 | Medium |
| Canonical points to another path | 12 | High |
| Duplicate meta description | 7 | Low |
| Thin rendered copy | 3 | Medium |
| Duplicate title | 2 | Medium |
| Missing H1 | 1 | High |
| Multiple H1s | 1 | Medium |
| Sitemap advertises another hostname | 1 sitewide issue | High |
| Title outside working range | 1 | Medium |

## Cutover Acceptance Criteria

The replacement site is search-ready only when all of the following pass:

1. Preview remains noindexed until the launch decision.
2. A production build generates only `https://www.artisanlabnetwork.com` sitemap, canonical, Open Graph, and JSON-LD URLs.
3. Every indexable route returns 200 and a self-canonical; no page unintentionally canonicalizes to `/`.
4. Every retained live URL either remains at the same path or has exactly one 301 hop to its mapped destination.
5. `/ourcraft` and `/our-partners` remain excluded from the sitemap and search index.
6. The sitemap contains only 200, indexable, canonical URLs.
7. GA4 receives one page view per route and the agreed events include `site_version` and `lab_name`.
8. Search Console URL Inspection confirms the homepage and three lab pages are eligible for indexing after launch.

## Reproduction

Run the committed crawler from the repository root:

```bash
node scripts/seo-crawl.mjs --base-url https://www.artisanlabnetwork.com --output docs/seo/data/live-crawl-YYYY-MM-DD.json --limit 250
node scripts/seo-crawl.mjs --base-url https://preview.artisanlabnetwork.com --output docs/seo/data/preview-crawl-YYYY-MM-DD.json --limit 250
```

The script writes JSON plus a page-level CSV with the same base filename.
