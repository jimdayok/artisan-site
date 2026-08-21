import type { SiteVersion } from "./types";

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/i;

function siteVersion(value: string | undefined): SiteVersion {
  if (value === "existing" || value === "production") return value;
  return "preview";
}

export const analyticsConfig = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "",
  ga4MeasurementId:
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ?? "",
  siteVersion: siteVersion(process.env.NEXT_PUBLIC_SITE_VERSION),
  debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
};

export function isAnalyticsConfigured() {
  return (
    GTM_ID_PATTERN.test(analyticsConfig.gtmId) &&
    GA4_ID_PATTERN.test(analyticsConfig.ga4MeasurementId)
  );
}
export function shouldLoadAnalytics() {
  return (
    isAnalyticsConfigured() &&
    (process.env.NODE_ENV === "production" || analyticsConfig.debug)
  );
}
