# Artisan Lab Network analytics

Last updated: August 21, 2026

## Purpose

This implementation answers four business questions without splitting data into incompatible properties:

1. Which acquisition channels and landing pages produce qualified activity?
2. Which labs, products, resources, and content receive meaningful engagement?
3. Which paths produce account, partner, meeting, phone, and lead intent?
4. Does the preview/new site outperform the existing Kajabi site?

The target architecture is:

`existing Kajabi site + preview/new Next.js site -> one GTM container -> one Artisan Lab Network GA4 property`

Both sites use the same event names and parameters. `site_version` distinguishes `existing`, `preview`, and the post-cutover `production` site. `lab_name` distinguishes `Pike`, `Peak`, `Pacific`, and `Network`. Do not create separate GA4 properties for the labs or the two public sites.

## Repository implementation

### Runtime components

- `lib/analytics/config.ts`: environment configuration and development suppression.
- `lib/analytics/types.ts`: the authoritative TypeScript event contract.
- `lib/analytics/context.ts`: lab detection, acquisition capture, PII-safe URL/search handling, and Typeform attribution.
- `lib/analytics/events.ts`: the only application API that writes business events to `dataLayer`.
- `app/components/analytics/AnalyticsProvider.tsx`: consent-gated GTM loader, SPA pageviews, newsletter views, and delegated meaningful-link tracking.
- `app/components/analytics/EmbeddedTypeform.tsx`: successful-submit tracking and privacy-safe attribution for embedded Typeforms.

GTM and GA4 are suppressed in local development. To inspect local `dataLayer` behavior intentionally, provide valid test IDs and set `NEXT_PUBLIC_ANALYTICS_DEBUG=true`. Never use the production GA4 stream for local debugging.

### Environment variables

Configure these in Vercel for the Preview and Production environments:

```text
NEXT_PUBLIC_GTM_ID=GTM-PMGMJB4B
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-SBTEQQE2LS
NEXT_PUBLIC_SITE_VERSION=preview
NEXT_PUBLIC_ANALYTICS_DEBUG=false
```

For the preview deployment, use `preview`. At public cutover, change only `NEXT_PUBLIC_SITE_VERSION` to `production` and redeploy. Do not rewrite event code. The legacy Kajabi site must use `existing`.

The application loads GTM only when both IDs are valid, the build is production (or explicit debug mode), and Measurement consent is granted. Before every business event, it also clears all optional event parameters in the data layer; this prevents a value from one event being retained by GTM and attached to an unrelated later event.

## Consent and privacy

The existing c15t consent manager remains the source of truth. GTM, GA4, and Vercel Analytics load only after Measurement consent. The implementation uses basic Google Consent Mode:

- Default `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` are denied.
- Measurement consent updates `analytics_storage` to granted before GTM loads.
- Advertising consent remains denied because this implementation does not deploy advertising tags.
- Revoking Measurement consent sends an update back to denied.

No new banner was added. The Cookie and Privacy policies now name GTM and GA4.

The implementation does not send form answers, names, user-entered email addresses, user-entered phone numbers, messages, patient details, prescriptions, PHI, portal credentials, access tokens, account numbers, or authentication data. Authenticated `/portal`, `/private`, and `/api` paths are excluded from web analytics. Public portal entry clicks are measured as `portal_login_click`.

Every event overrides `page_location` with a sanitized URL that retains acquisition parameters (`utm_*`, `gclid`, `gbraid`, `wbraid`, and `msclkid`) and drops every other query parameter and fragment. Destination URLs are sent without query strings. Resource search terms that resemble email addresses, phone numbers, URLs, or long account-like numbers are omitted; aggregate search length and result count are still sent.

The publicly displayed destination business phone number or email address may be sent for `click_phone` and `click_email`. Do not use this API for user-entered contact data.

## Data layer contract

Example:

```js
{
  event: "open_account",
  site_version: "preview",
  lab_name: "Pike",
  source_page: "/pike-artisan-labs",
  destination_url: "https://form.typeform.com/to/quuPCSff",
  page_location: "https://preview.artisanlabnetwork.com/pike-artisan-labs",
  page_path: "/pike-artisan-labs",
  page_title: "Pike Artisan Labs | Artisan Lab Network"
}
```

All application code must call `trackEvent()` rather than writing directly to `dataLayer`. Do not add a direct `gtag.js` or `GoogleAnalytics` component; GA4 is deployed only through GTM.

## Event matrix

| Event | Trigger | Parameters in addition to common page/site/lab context | GA4 role | Status |
| --- | --- | --- | --- | --- |
| `page_view` | Initial consented view and every Next.js route change | `page_location`, `page_path`, `page_title` | Standard engagement | Implemented |
| `generate_lead` | Embedded Typeform `onSubmit`; Typeform only emits this callback after a successful submission | `lead_type`, `form_name`, `traffic_context` | Primary/key event | Implemented for embedded contact forms; external-form completion is manual |
| `open_account` | Intentional click on an Open Account/account-application CTA | `destination_url`, `source_page` | Primary/key event; intent, not completed account | Implemented |
| `partner_inquiry` | Meaningful Partner With Us, Artisan Partner, ownership, equity, or investor-flow entry | `partner_type`, `source_page` | Primary/key event | Implemented |
| `schedule_meeting` | Click on meeting/demo scheduler or clearly labeled meeting request | `meeting_type`, `destination_url`, `source_page` | Primary/key event; click/start unless scheduler completion is later connected | Implemented |
| `click_phone` | `tel:` click | `phone_number`, `source_page` | Primary/key event | Implemented |
| `click_email` | `mailto:` click | `email_address`, `source_page` | Secondary | Implemented |
| `portal_login_click` | Public-site click into `/portal` | `destination_url`, `source_page` | Secondary; never a lead | Implemented |
| `resource_search` | Debounced Provider Resources query of at least two characters | safe `search_term` when allowed, `search_term_length`, `search_result_count`, `resource_category`, `brand_filter` | Secondary | Implemented |
| `resource_filter` | Resource type/category or brand selection | `brand`, `resource_type`, `product_category` when available | Secondary | Implemented |
| `resource_view` | Opening a resource card or search result | `resource_name`, `resource_type`, `brand`, `product`, `destination_url` | Secondary | Implemented |
| `resource_download` | Opening a PDF resource or clicking a supported document/archive URL | `file_name`, `file_extension`, `resource_name`, `brand`, `product`, `source_page` | Secondary | Implemented |
| `newsletter_view` | Individual Practice Matters issue route | `content_title`, `content_category`, actual `author`/`publish_date` when present | Secondary | Implemented |
| `outbound_click` | Curated business destinations such as Typeform, HubSpot Meetings, ordering systems, training, YouTube, and explicitly marked links | `destination_domain`, `destination_url`, `link_text`, `source_page` | Secondary | Implemented |

Common parameters appended to every event are `site_version`, `lab_name`, `page_location`, `page_path`, and `page_title`.

`open_account` means the user started the external account path. It must never be described as a completed account. A completed application should be added later as a separate success event from Typeform/Pipedrive, for example `open_account_complete`, only after a verified successful submission or approved backend state.

## Lab attribution

Path-based attribution is centralized in `resolveLabName()`:

- `/pacific-artisan-labs`, legacy `/pdx`, and related paths -> `Pacific`
- `/peak-artisan-labs`, legacy `/den`, and related paths -> `Peak`
- `/pike-artisan-labs`, legacy `/ind`, and related paths -> `Pike`
- all other public pages -> `Network`

Resource, newsletter, and network-wide pages therefore remain segmentable without creating new properties.

## Acquisition and CRM attribution

GA4 native source, medium, campaign, default channel group, landing page, and referrer behavior are preserved. The application does not rewrite GA4 source/medium fields. Standard UTM and click-ID parameters remain in sanitized page locations.

After Measurement consent, the first consented landing context is kept in session storage and safely passed to embedded Typeforms. External Typeform links receive standard UTM parameters in the query string and these non-sensitive hidden values in the URL fragment:

```text
landing_page
referrer
site_version
lab_name
```

In each relevant Typeform, an administrator must open **Workflow -> Pull data in**, add the following lower-case URL parameters, save, and publish:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
landing_page
referrer
site_version
lab_name
```

Map those fields through the existing Typeform/Pipedrive connection, or map them in the integration middleware, to Pipedrive lead/deal custom fields with the same names. Keep these as text fields. Do not map form-message content into GA4. Existing form delivery is unchanged.

External Typeform completions cannot be observed from this domain after navigation. To count successful external account applications, configure a Typeform webhook/automation or a same-site completion return page only after the business confirms what constitutes an approved completion. Do not convert the existing `open_account` click into a false completion.

## GTM container configuration

Use one web container on both public sites. Before publishing, create the following in the container.

### Variables

Create Data Layer Variables (Version 2) for:

```text
ga4_measurement_id
site_version
lab_name
page_location
page_path
page_title
lead_type
form_name
traffic_context
destination_url
source_page
partner_type
meeting_type
phone_number
email_address
search_term
search_term_length
search_result_count
resource_category
brand_filter
brand
resource_type
product_category
resource_name
product
file_name
file_extension
content_title
content_category
author
publish_date
destination_domain
link_text
```

Name them consistently, for example `DLV - site_version`.

### Google tag

1. The published container uses a **Google tag** named `GA4 - Google tag`.
2. Its Tag ID is `G-SBTEQQE2LS`.
3. In configuration settings, set `send_page_view` to `false` because the application emits the initial and SPA pageviews.
4. Require built-in `analytics_storage` consent. Do not add advertising tags.
5. Trigger on **Initialization - All Pages**. The site itself remains responsible for its initial and SPA route-change `page_view` events.

### GA4 event tags

The published container uses one controlled native GA4 Event tag named `GA4 - Business event`. Its event name is `{{Event}}`, its 32 parameters map to the documented data-layer variables, and its single Custom Event trigger is restricted to this exact allowlist:

```text
^(page_view|generate_lead|open_account|partner_inquiry|schedule_meeting|click_phone|click_email|portal_login_click|resource_search|resource_filter|resource_view|resource_download|newsletter_view|outbound_click)$
```

Do not broaden this trigger to `.*`; unrelated application events must never reach GA4.

For every tag:

- Use measurement ID `G-SBTEQQE2LS`/the ALN Google tag.
- Set common parameters: `site_version`, `lab_name`, `page_location`, `page_path`, and `page_title`.
- Add only event-specific Data Layer Variables from the matrix.
- Require `analytics_storage` consent.
- Do not enable tag sequencing that sends an automatic pageview.

Use GTM Preview to confirm one Google tag/configuration request and exactly one GA4 event request per data-layer event. Publish only after the validation checklist passes.

## GA4 property configuration

### Key events

Mark these as key events after they appear in Realtime/DebugView:

```text
generate_lead
open_account
partner_inquiry
schedule_meeting
click_phone
```

Do not mark pageviews, scrolls, email clicks, portal clicks, resource views/downloads, newsletter views, or generic outbound clicks as primary key events.

### Custom definitions

In **Admin -> Data display -> Custom definitions**, register event-scoped dimensions for:

```text
site_version
lab_name
lead_type
form_name
traffic_context
partner_type
meeting_type
brand
resource_type
resource_category
content_category
```

Use native GA4 dimensions for page URL/path/title, source, medium, campaign, landing page, file name, link URL, and other fields where available. Avoid registering high-cardinality custom dimensions such as full destination URLs, search terms, or unique response identifiers.

### Enhanced Measurement

In **Admin -> Data streams -> web stream -> Enhanced measurement**, use:

- Page views: keep the Enhanced Measurement master enabled, but disable **Page changes based on browser history events**. The stream UI still reports page views as enabled for page loads; `send_page_view=false` on the Google tag prevents that automatic hit, while the application emits initial and SPA pageviews with business context.
- Outbound clicks: **Off**. Curated `outbound_click` is more meaningful and avoids duplicates.
- Site search: **Off**. Provider Resources uses privacy-sanitized `resource_search`.
- File downloads: **Off**. `resource_download` includes resource/brand/product context.
- Form interactions: **Off** if shown. `generate_lead` is success-only.
- Scrolls: On if useful.
- Video engagement: On for supported embedded video, after verifying it does not duplicate a custom video event.

### Data redaction defense

In the web stream settings, enable email data redaction and add potentially sensitive query keys to query-parameter redaction, including:

```text
email,name,first_name,last_name,phone,message,token,access_token,auth,authorization,code,password,patient,prescription,account,account_number
```

This is defense in depth; the application already sends sanitized `page_location` values.

## Google Search Console

An Editor on the GA4 property who is also a verified owner of the Search Console property must:

1. Open GA4 **Admin -> Product links -> Search Console Links**.
2. Select **Link**.
3. Choose the verified domain property for `artisanlabnetwork.com` (preferred because it covers both subdomains), confirm, and continue.
4. Select the single ALN GA4 web data stream.
5. Review and submit.
6. Publish the Search Console report collection in **Reports -> Library** if it is not visible.

The resulting reports combine query, landing page, impressions, clicks, CTR, and average position with GA4 engagement and key-event behavior. Search Console and GA4 metrics use different collection models and will not match one-for-one.

## Existing Kajabi site implementation

The repository contains the new/preview Next.js site only. The legacy `www.artisanlabnetwork.com` site is Kajabi and must be updated in its site-wide Custom Code area after first checking that Kajabi does not already load GA4/GTM. Remove or consolidate any direct `gtag.js`, Universal Analytics, or second GTM container before adding the shared container.

The authenticated audit on August 21, 2026 found:

- Kajabi's built-in **Google Analytics** integration directly loaded `G-SBTEQQE2LS`.
- The site-wide **Header Page Scripts** field was empty.
- No cookie-consent manager or analytics preference control was present on the legacy public site.
- The canonical production snippet for this site is [`docs/kajabi-analytics-snippet.html`](./kajabi-analytics-snippet.html). It uses the shared GTM container, labels traffic `site_version=existing`, denies all advertising consent, respects Global Privacy Control, sanitizes URLs, and instruments the comparable legacy CTAs/resources/content.

Use the same GTM ID and GA4 property as the new site. Set `site_version` to `existing`. In the Kajabi consent callback, call the loader below with `true` only when Analytics/Measurement consent is granted, and with `false` when it is rejected or revoked.

```html
<script>
(function (w, d) {
  var GTM_ID = "GTM-PMGMJB4B";
  var GA4_ID = "G-SBTEQQE2LS";
  var loaded = false;
  var eventParameterKeys = [
    "site_version", "lab_name", "page_location", "page_path", "page_title",
    "traffic_context", "lead_type", "form_name", "destination_url", "source_page",
    "partner_type", "meeting_type", "phone_number", "email_address", "search_term",
    "search_term_length", "search_result_count", "resource_category", "brand_filter",
    "brand", "resource_type", "product_category", "resource_name", "product",
    "file_name", "file_extension", "content_title", "content_category", "author",
    "publish_date", "destination_domain", "link_text"
  ];

  function labName(path) {
    path = (path || "/").toLowerCase();
    if (path.indexOf("/pdx") === 0 || path.indexOf("pacific") > -1) return "Pacific";
    if (path.indexOf("/den") === 0 || path.indexOf("peak") > -1) return "Peak";
    if (path.indexOf("/ind") === 0 || path.indexOf("pike") > -1) return "Pike";
    return "Network";
  }

  function safeLocation() {
    var allowed = /^(utm_source|utm_medium|utm_campaign|utm_content|utm_term|gclid|gbraid|wbraid|msclkid)$/i;
    var source = new URL(w.location.href);
    var safe = new URL(source.origin + source.pathname);
    source.searchParams.forEach(function (value, key) {
      if (allowed.test(key)) safe.searchParams.set(key.toLowerCase(), value.slice(0, 120));
    });
    return safe.toString();
  }

  function safeDestination(href) {
    if (/^(tel:|mailto:)/i.test(href)) return href.split("?")[0];
    var destination = new URL(href, w.location.href);
    return destination.origin + destination.pathname;
  }

  function pushEvent(name, parameters) {
    if (!loaded) return;
    var reset = {};
    eventParameterKeys.forEach(function (key) { reset[key] = null; });
    w.dataLayer.push(reset);
    w.dataLayer.push(Object.assign({
      event: name,
      site_version: "existing",
      lab_name: labName(w.location.pathname),
      page_location: safeLocation(),
      page_path: w.location.pathname,
      page_title: d.title
    }, parameters || {}));
  }

  function trackClick(event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.dataset.analyticsSkip === "true") return;
    var href = link.getAttribute("href") || "";
    var label = (link.dataset.analyticsLabel || link.textContent || "")
      .replace(/\s+/g, " ").trim().slice(0, 120);
    var lower = label.toLowerCase();
    var sourcePage = w.location.pathname;

    if (/^tel:/i.test(href)) {
      pushEvent("click_phone", {
        phone_number: href.slice(4).split("?")[0].slice(0, 40),
        source_page: sourcePage
      });
      return;
    }
    if (/^mailto:/i.test(href)) {
      pushEvent("click_email", {
        email_address: href.slice(7).split("?")[0].slice(0, 120),
        source_page: sourcePage
      });
      if (/schedule|meeting/.test(lower)) {
        pushEvent("schedule_meeting", {
          meeting_type: "email_request",
          destination_url: safeDestination(href),
          source_page: sourcePage
        });
      }
      return;
    }

    var destination = new URL(link.href, w.location.href);
    var safeUrl = safeDestination(destination.href);
    var isExternal = destination.origin !== w.location.origin;
    var extension = (destination.pathname.split(".").pop() || "").toLowerCase();

    if (destination.pathname.indexOf("/portal") === 0 || /(^|\.)artisanslabs\.com$/i.test(destination.hostname)) {
      pushEvent("portal_login_click", {
        destination_url: safeUrl,
        source_page: sourcePage
      });
    }
    if (/^(pdf|doc|docx|xls|xlsx|csv|zip)$/.test(extension)) {
      pushEvent("resource_download", {
        file_name: decodeURIComponent(destination.pathname.split("/").pop() || ""),
        file_extension: extension,
        resource_name: label,
        source_page: sourcePage
      });
    }
    if (/open (an? )?account|account application|start.*account/.test(lower)) {
      pushEvent("open_account", {
        destination_url: safeUrl,
        source_page: sourcePage
      });
    } else if (/partner with us|artisan partner|ownership|equity|investor/.test(lower)) {
      pushEvent("partner_inquiry", {
        partner_type: /ownership|equity|investor/.test(lower) ? "ownership_interest" : "lab_partnership",
        source_page: sourcePage
      });
    }
    if (/schedule|meeting|book (a )?(call|demo)/.test(lower) || destination.hostname === "meetings.hubspot.com") {
      pushEvent("schedule_meeting", {
        meeting_type: lower.indexOf("demo") > -1 ? "demo" : "general",
        destination_url: safeUrl,
        source_page: sourcePage
      });
    }
    if (isExternal && /(^|\.)(typeform\.com|meetings\.hubspot\.com|dvirx\.com|speccheckrx\.com|visionweb\.com|opticaltraining\.com|youtube\.com|youtu\.be|globalopticsinc\.com)$/i.test(destination.hostname)) {
      pushEvent("outbound_click", {
        destination_domain: destination.hostname,
        destination_url: safeUrl,
        link_text: label,
        source_page: sourcePage
      });
    }
  }

  function consent(value) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(["consent", "update", {
      analytics_storage: value ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    }]);
  }

  w.alnAnalyticsConsent = function (granted) {
    w.dataLayer = w.dataLayer || [];
    if (!granted) {
      consent(false);
      return;
    }
    if (loaded) {
      consent(true);
      return;
    }
    loaded = true;
    w.dataLayer.push(["consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    }]);
    consent(true);
    w.dataLayer.push({
      event: "analytics_context",
      ga4_measurement_id: GA4_ID,
      site_version: "existing",
      lab_name: labName(w.location.pathname),
      page_location: safeLocation(),
      page_path: w.location.pathname,
      page_title: d.title,
      analytics_schema_version: "1.0"
    });
    var script = d.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    d.head.appendChild(script);
    w.dataLayer.push({
      event: "page_view",
      site_version: "existing",
      lab_name: labName(w.location.pathname),
      page_location: safeLocation(),
      page_path: w.location.pathname,
      page_title: d.title
    });
    d.addEventListener("click", trackClick, true);
  };
})(window, document);
</script>
```

The deployed legacy snippet preserves the site's current analytics behavior by granting measurement storage when Global Privacy Control is not enabled; advertising storage remains denied. This is an operational default, not a legal conclusion. If Artisan adopts a consent-management platform, remove the automatic measurement start and wire `alnAnalyticsConsent(true|false)` to the visitor's actual choice. Typeform submissions still require the official Typeform `onSubmit` callback, webhook, or an approved successful-completion integration—never a form-open event.

If the legacy site already has a GTM container, consolidate its tags into the shared container rather than nesting or loading two containers. Validate the legacy site with Tag Assistant before publishing.

## Google Business Profile UTM convention

Use the canonical public landing URL for each lab and these exact parameters:

```text
Pike:    utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=pike
Peak:    utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=peak
Pacific: utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=pacific
```

Example after cutover:

```text
https://www.artisanlabnetwork.com/pike-artisan-labs?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=pike
```

Keep source/medium/campaign lower-case. Use `utm_content` for the lab, not separate campaigns. Updating live profiles requires Google Business Profile access and is outside this repository.

## Monthly D2D reporting

Use GA4 Explorations or Looker Studio with `site_version` and `lab_name` as the primary comparison dimensions.

Traffic:

- Organic users/new users: Session default channel group = `Organic Search`.
- Organic sessions/engaged sessions: same filter with Sessions and Engaged sessions.
- Organic landing pages: Landing page + query string, filtered to Organic Search.

Lead actions:

- Counts for `generate_lead`, `open_account`, `partner_inquiry`, `schedule_meeting`, and `click_phone`.

Rates:

```text
organic lead conversion rate = organic sessions with generate_lead / organic sessions
sitewide lead conversion rate = sessions with generate_lead / sessions
open-account intent rate = sessions with open_account / sessions
partner-interest rate = sessions with partner_inquiry / sessions
qualified actions per 100 sessions =
  (generate_lead + open_account + partner_inquiry + schedule_meeting + click_phone) / sessions * 100
```

Use session-based rates when possible so multiple repeated actions in one session do not inflate conversion. Break every report down by `lab_name` (`Pike`, `Peak`, `Pacific`, `Network`) and `site_version` (`existing`, `preview`, `production`). Resource reporting uses `resource_view`, `resource_download`, `resource_search`, `resource_filter`, `brand`, and `resource_type`.

## Validation checklist

### Local/automated

Run:

```bash
npm run test:analytics
npm run typecheck
npm run lint
npm run build
```

The automated suite verifies lab mapping, PII-safe URL/search handling, attribution, private-route exclusion, consent gating, one GTM component, absence of direct GA4 loading, and successful-submit Typeform wiring.

### GTM Preview and browser

Use a deployed preview with test IDs or the real preview environment after approval:

1. Reject optional cookies. Confirm no `gtm.js`, GA4 collect request, `_ga` cookie, or ALN business event leaves the browser.
2. Accept Measurement. Confirm one `gtm.js` request and one Google tag/configuration initialization.
3. Confirm one `page_view` for the landing page and one for each client-side route change; confirm no automatic duplicate.
4. Confirm `site_version=preview` and correct lab values on Pacific, Peak, Pike, and network pages.
5. Test open-account, partner, meeting, phone, email, and portal CTAs.
6. Submit an embedded contact Typeform successfully and confirm exactly one `generate_lead`; validation errors or closing the form must produce zero.
7. Search Provider Resources, select a filter/brand, open a resource, and open a PDF. Confirm the expected resource events and no duplicate download event.
8. Visit a published Practice Matters issue and confirm one `newsletter_view`.
9. Load a URL containing UTMs plus fake `email`, `token`, and `message` query values. Confirm UTMs remain and sensitive values are absent from every GA4 request.
10. Open an authenticated portal/private route and confirm no GA4 public-site events are sent.
11. Change consent from granted to denied and confirm subsequent events stop.
12. Verify DebugView, Realtime, and Tag Assistant before publishing the container.

## Google administrator checklist

1. Create or confirm one Artisan Lab Network GA4 property.
2. Create or confirm one web data stream for the public web presence.
3. Create or confirm one shared GTM web container.
4. Add the Vercel environment variables for Preview and Production; add the same container/property IDs to the consent-gated Kajabi code.
5. Use one property/container for both domains. Cross-domain measurement is not required between `www.artisanlabnetwork.com` and `preview.artisanlabnetwork.com` because they share the same registrable domain. Do not link Typeform/HubSpot as cross-domain destinations. The separate protected `artisanslabs.com` portal is intentionally excluded from public analytics; only reconsider cross-domain setup if the privacy scope changes.
6. Create GTM variables, Google tag, explicit event tags, and triggers as documented; set `send_page_view=false`.
7. Mark `generate_lead`, `open_account`, `partner_inquiry`, `schedule_meeting`, and `click_phone` as key events.
8. Register the recommended event-scoped custom dimensions.
9. Link the domain Search Console property to the GA4 stream.
10. Give D2D Marketing the least-privileged GA4/GTM/Search Console roles needed for reporting and maintenance.
11. Define internal traffic IP rules, leave the filter in Testing first, validate it, then activate only after approval. Excluded data cannot be recovered.
12. Set event data retention to the approved business period (commonly 14 months for a standard property) and confirm reset-on-new-activity policy.
13. Configure Enhanced Measurement and data redaction exactly as above.
14. Review unwanted referrals only for genuine third-party services that return users; do not add ordinary referral partners or search engines.
15. Configure Typeform URL parameters and Pipedrive mappings.
16. Validate DebugView, Realtime, consent behavior, and a full preview-site event pass.
17. Audit the Kajabi source for old GA/UA/GTM code, consolidate, then validate its `site_version=existing` data.
18. After deployment, verify 24-48 hours of production data, custom dimensions, channel attribution, and site-version/lab reports before using the metrics for decisions.

## Cutover procedure

1. Keep the same GA4 property, web stream, GTM container, events, and custom definitions.
2. Change the new site's `NEXT_PUBLIC_SITE_VERSION` from `preview` to `production`.
3. Deploy and validate one pageview and one primary action in DebugView/Realtime.
4. Keep legacy historical rows labeled `existing`; do not rewrite them.
5. Retire the legacy site's GTM snippet only when the old site no longer serves users.

This preserves direct existing-versus-preview comparison before cutover and clean pre-/post-production reporting afterward.

## Known manual boundaries

- Google IDs, GTM tags/triggers, key-event settings, custom definitions, Search Console linking, retention, filters, and permissions require authenticated Google access.
- The Kajabi site is configured outside this repository. Keep its deployed Header Page Scripts synchronized with `docs/kajabi-analytics-snippet.html` and revalidate after any Kajabi theme change.
- External Typeform and HubSpot completion events require their own admin/webhook/return-page configuration. Current events accurately represent starts/clicks, not completed accounts or booked meetings.
- Pipedrive custom-field creation/mapping requires Pipedrive and Typeform integration access.
- Consent/banner language and retention policy remain business/legal decisions; the code implements the current site's basic consent behavior and avoids advertising storage.

## Primary references

- [Google: set up consent mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Google: set up GA4 events in Tag Manager](https://support.google.com/tagmanager/answer/13034206)
- [Google: connect Search Console to GA4](https://support.google.com/analytics/answer/10737381)
- [Google: custom dimensions and metrics](https://support.google.com/analytics/answer/14240153)
- [Typeform: embed callbacks](https://developer.typeform.com/developers/embed/callbacks/)
- [Typeform: URL parameters](https://help.typeform.com/hc/en-us/articles/360052676612-Using-URL-parameters-formerly-Hidden-Fields)
