"use client";

import { Widget } from "@typeform/embed-react";
import { analyticsConfig } from "@/lib/analytics/config";
import {
  getGoogleAnalyticsCookieIdentifiers,
  getStoredAttribution,
} from "@/lib/analytics/context";
import { currentPageContext, trackEvent } from "@/lib/analytics/events";
import type { LeadType } from "@/lib/analytics/types";

export default function EmbeddedTypeform({
  formId,
  formName,
  leadType = "general_contact",
  className,
  title = "Contact Artisan Lab Network",
}: {
  formId: string;
  formName: string;
  leadType?: LeadType;
  className?: string;
  title?: string;
}) {
  const attribution = getStoredAttribution();
  const page = currentPageContext();
  const tracking = attribution
    ? Object.fromEntries(
        Object.entries(attribution).filter(([key]) => key.startsWith("utm_")),
      )
    : undefined;

  return (
    <Widget
      id={formId}
      className={className}
      style={{ width: "100%", height: "100%" }}
      iframeProps={{ title }}
      hidden={
        attribution
          ? {
              landing_page: attribution.landing_page,
              referrer: attribution.referrer,
              site_version: analyticsConfig.siteVersion,
              lab_name: attribution.lab_name,
              analytics_delivery: "client",
              page_location: page.pageLocation,
              page_title: page.pageTitle.slice(0, 200),
              traffic_context: page.trafficContext,
              ...getGoogleAnalyticsCookieIdentifiers(
                analyticsConfig.ga4MeasurementId,
              ),
            }
          : undefined
      }
      tracking={tracking}
      onSubmit={() => {
        const page = currentPageContext();
        trackEvent("generate_lead", {
          lead_type: leadType,
          form_name: formName,
          page_location: page.pageLocation,
          page_title: page.pageTitle,
          traffic_context: page.trafficContext,
        });
      }}
    />
  );
}
