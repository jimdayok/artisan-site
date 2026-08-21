"use client";

import { analyticsConfig, shouldLoadAnalytics } from "./config";
import {
  resolveLabName,
  sanitizeAnalyticsUrl,
  trafficContext,
} from "./context";
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  DataLayerEvent,
} from "./types";

let measurementConsentGranted = false;

function dataLayer() {
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer as Array<DataLayerEvent | unknown[]>;
}

function compact(
  value: Record<string, string | number | boolean | null | undefined>,
) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  );
}

export function setGoogleMeasurementConsent(granted: boolean) {
  measurementConsentGranted = granted;
  if (typeof window === "undefined" || !shouldLoadAnalytics()) return;

  dataLayer().push([
    "consent",
    "update",
    {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
}

export function initializeGoogleConsentMode() {
  if (typeof window === "undefined" || !shouldLoadAnalytics()) return;
  dataLayer().push([
    "consent",
    "default",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    },
  ]);
  setGoogleMeasurementConsent(true);
}

export function initializeAnalyticsContext() {
  if (typeof window === "undefined" || !shouldLoadAnalytics()) return;
  const page = currentPageContext();
  dataLayer().push({
    event: "analytics_context",
    ga4_measurement_id: analyticsConfig.ga4MeasurementId,
    site_version: analyticsConfig.siteVersion,
    lab_name: resolveLabName(window.location.pathname),
    page_location: page.pageLocation,
    analytics_schema_version: "1.0",
  });
}

export function trackEvent<Name extends AnalyticsEventName>(
  name: Name,
  parameters: AnalyticsEventMap[Name],
) {
  if (
    typeof window === "undefined" ||
    !measurementConsentGranted ||
    !shouldLoadAnalytics()
  ) {
    return false;
  }

  const pathname = window.location.pathname;
  const event = compact({
    event: name,
    ...parameters,
    site_version: parameters.site_version ?? analyticsConfig.siteVersion,
    lab_name: parameters.lab_name ?? resolveLabName(pathname),
    page_location: sanitizeAnalyticsUrl(window.location.href),
    page_path: pathname,
    page_title:
      document.title ||
      ("page_title" in parameters ? String(parameters.page_title) : "Artisan Lab Network"),
  }) as DataLayerEvent;

  dataLayer().push(event);
  return true;
}

export function currentPageContext() {
  if (typeof window === "undefined") {
    return {
      pageLocation: "",
      pagePath: "",
      pageTitle: "",
      trafficContext: "unknown",
    };
  }
  return {
    pageLocation: sanitizeAnalyticsUrl(window.location.href),
    pagePath: window.location.pathname,
    pageTitle: document.title,
    trafficContext: trafficContext(window.location.href, document.referrer),
  };
}
