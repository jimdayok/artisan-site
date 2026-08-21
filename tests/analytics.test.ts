import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  appendTypeformAttribution,
  isPrivateAnalyticsPath,
  resolveLabName,
  sanitizeAnalyticsUrl,
  sanitizeDestinationUrl,
  sanitizeSearchTerm,
  trafficContext,
} from "../lib/analytics/context.ts";

const read = (path: string) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lab attribution is consolidated into the four reporting values", () => {
  assert.equal(resolveLabName("/pacific-artisan-labs"), "Pacific");
  assert.equal(resolveLabName("/labs/pacific-artisan-labs"), "Pacific");
  assert.equal(resolveLabName("/peak-artisan-labs"), "Peak");
  assert.equal(resolveLabName("/pike-artisan-labs"), "Pike");
  assert.equal(resolveLabName("/provider-resources"), "Network");
});

test("analytics URLs retain acquisition data and remove sensitive query values", () => {
  const sanitized = new URL(
    sanitizeAnalyticsUrl(
      "https://preview.artisanlabnetwork.com/contact?utm_source=google&utm_medium=organic&email=patient%40example.com&token=secret&gclid=abc123#private",
    ),
  );
  assert.equal(sanitized.pathname, "/contact");
  assert.equal(sanitized.searchParams.get("utm_source"), "google");
  assert.equal(sanitized.searchParams.get("utm_medium"), "organic");
  assert.equal(sanitized.searchParams.get("gclid"), "abc123");
  assert.equal(sanitized.searchParams.has("email"), false);
  assert.equal(sanitized.searchParams.has("token"), false);
  assert.equal(sanitized.hash, "");
});

test("destination URLs exclude query strings and retain safe communication targets", () => {
  assert.equal(
    sanitizeDestinationUrl("https://example.com/apply?email=person@example.com"),
    "https://example.com/apply",
  );
  assert.equal(
    sanitizeDestinationUrl("mailto:sales@artisanlabnetwork.com?subject=Hello"),
    "mailto:sales@artisanlabnetwork.com",
  );
});

test("provider search terms are omitted when they resemble PII", () => {
  assert.equal(sanitizeSearchTerm("Tokai 1.76 guide"), "Tokai 1.76 guide");
  assert.equal(sanitizeSearchTerm("person@example.com"), undefined);
  assert.equal(sanitizeSearchTerm("503-555-1212"), undefined);
  assert.equal(sanitizeSearchTerm("account 123456789"), undefined);
});

test("traffic context preserves native acquisition semantics", () => {
  assert.equal(
    trafficContext("https://example.com/?utm_medium=organic", ""),
    "organic",
  );
  assert.equal(
    trafficContext("https://example.com/?gclid=abc", ""),
    "paid",
  );
  assert.equal(
    trafficContext("https://example.com/", "https://www.google.com/search?q=x"),
    "organic",
  );
  assert.equal(trafficContext("https://example.com/", ""), "direct");
});

test("Typeform attribution contains only non-sensitive campaign and page context", () => {
  const attributed = new URL(
    appendTypeformAttribution("https://form.typeform.com/to/quuPCSff", {
      utm_source: "google",
      utm_medium: "organic",
      landing_page: "https://preview.artisanlabnetwork.com/pike-artisan-labs",
      referrer: "https://www.google.com",
      site_version: "preview",
      lab_name: "Pike",
    }),
  );
  assert.equal(attributed.searchParams.get("utm_source"), "google");
  assert.equal(attributed.searchParams.get("utm_medium"), "organic");
  const hidden = new URLSearchParams(attributed.hash.slice(1));
  assert.equal(hidden.get("site_version"), "preview");
  assert.equal(hidden.get("lab_name"), "Pike");
  assert.equal(hidden.has("email"), false);
});

test("authenticated and private routes are excluded from web analytics", () => {
  assert.equal(isPrivateAnalyticsPath("/portal"), true);
  assert.equal(isPrivateAnalyticsPath("/portal/admin/account-analysis/123"), true);
  assert.equal(isPrivateAnalyticsPath("/private/price-list/a6"), true);
  assert.equal(isPrivateAnalyticsPath("/provider-resources"), false);
});

test("GTM is consent-gated once and GA4 is not loaded directly", async () => {
  const [provider, consent, layout] = await Promise.all([
    read("app/components/analytics/AnalyticsProvider.tsx"),
    read("app/components/CookieConsentProvider.tsx"),
    read("app/layout.tsx"),
  ]);
  assert.equal((provider.match(/<GoogleTagManager/g) ?? []).length, 1);
  assert.match(provider, /measurementConsent/);
  assert.match(consent, /measurementConsent=\{analytics\}/);
  assert.doesNotMatch(layout, /GoogleAnalytics|googletagmanager|gtag\(/);
});

test("embedded Typeforms use success-only submission callbacks", async () => {
  const [embed, home, about] = await Promise.all([
    read("app/components/analytics/EmbeddedTypeform.tsx"),
    read("app/HomePageClient.tsx"),
    read("app/about/page.tsx"),
  ]);
  assert.match(embed, /onSubmit=/);
  assert.match(embed, /trackEvent\("generate_lead"/);
  assert.doesNotMatch(home, /<iframe/);
  assert.doesNotMatch(about, /<iframe/);
});

test("delegated CTA tracking covers both links and meeting buttons", async () => {
  const provider = await read(
    "app/components/analytics/AnalyticsProvider.tsx",
  );
  assert.match(provider, /target\.closest\("a"\)/);
  assert.match(provider, /target\.closest\("button"\)/);
  assert.match(provider, /trackMeaningfulButton/);
  assert.match(provider, /trackEvent\("schedule_meeting"/);
});
