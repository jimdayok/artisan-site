"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { analyticsConfig, shouldLoadAnalytics } from "@/lib/analytics/config";
import {
  appendTypeformAttribution,
  captureAttribution,
  getGoogleAnalyticsCookieIdentifiers,
  getStoredAttribution,
  isPrivateAnalyticsPath,
  sanitizeAnalyticsUrl,
  sanitizeDestinationUrl,
} from "@/lib/analytics/context";
import {
  currentPageContext,
  initializeAnalyticsContext,
  initializeGoogleConsentMode,
  setGoogleMeasurementConsent,
  trackEvent,
} from "@/lib/analytics/events";

const BUSINESS_OUTBOUND_DOMAINS = [
  "typeform.com",
  "meetings.hubspot.com",
  "dvirx.com",
  "speccheckrx.com",
  "visionweb.com",
  "opticaltraining.com",
  "youtube.com",
  "youtu.be",
  "globalopticsinc.com",
];

const NEWSLETTER_METADATA: Record<
  string,
  { publishDate?: string; author?: string }
> = {
  "/newsletters/practice-matters/issue-001": {
    publishDate: "2026-07",
    author: "Artisan Lab Network",
  },
};

function fileParts(pathname: string) {
  const fileName = decodeURIComponent(pathname.split("/").pop() ?? "");
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? ""
    : "";
  return { fileName, extension };
}

function linkText(anchor: HTMLAnchorElement) {
  return (anchor.dataset.analyticsLabel || anchor.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function isBusinessOutbound(hostname: string, anchor: HTMLAnchorElement) {
  if (anchor.dataset.analyticsOutbound === "true") return true;
  return BUSINESS_OUTBOUND_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

function trackMeaningfulClick(anchor: HTMLAnchorElement) {
  if (anchor.dataset.analyticsSkip === "true") {
    return;
  }
  const resourceHandled = anchor.dataset.analyticsHandled === "resource";

  const rawHref = anchor.getAttribute("href") ?? "";
  if (!rawHref || rawHref.startsWith("#")) return;
  const text = linkText(anchor);
  const normalizedText = text.toLowerCase();
  const sourcePage = window.location.pathname;

  if (rawHref.toLowerCase().startsWith("tel:")) {
    trackEvent("click_phone", {
      phone_number: rawHref.slice(4).split("?")[0].slice(0, 40),
      source_page: sourcePage,
    });
    return;
  }

  if (rawHref.toLowerCase().startsWith("mailto:")) {
    trackEvent("click_email", {
      email_address: rawHref.slice(7).split("?")[0].slice(0, 120),
      source_page: sourcePage,
    });
    if (/schedule|meeting/.test(normalizedText)) {
      trackEvent("schedule_meeting", {
        meeting_type: "email_request",
        destination_url: sanitizeDestinationUrl(rawHref),
        source_page: sourcePage,
      });
    }
    return;
  }

  let destination: URL;
  try {
    destination = new URL(anchor.href, window.location.href);
  } catch {
    return;
  }

  const safeDestination = sanitizeDestinationUrl(destination.toString());
  const isExternal = destination.origin !== window.location.origin;
  const destinationPath = destination.pathname.toLowerCase();

  if (!sourcePage.startsWith("/portal") && destinationPath.startsWith("/portal")) {
    trackEvent("portal_login_click", {
      destination_url: safeDestination,
      source_page: sourcePage,
    });
  }

  const { fileName, extension } = fileParts(destination.pathname);
  if (
    !resourceHandled &&
    ["pdf", "doc", "docx", "xls", "xlsx", "csv", "zip"].includes(extension)
  ) {
    trackEvent("resource_download", {
      file_name: fileName,
      file_extension: extension,
      resource_name: text || fileName,
      source_page: sourcePage,
    });
  }

  if (/open (an? )?account|account application|start.*account/.test(normalizedText)) {
    trackEvent("open_account", {
      destination_url: safeDestination,
      source_page: sourcePage,
    });
  } else if (/partner with us|artisan partner|ownership|equity|investor/.test(normalizedText)) {
    trackEvent("partner_inquiry", {
      partner_type: /ownership|equity|investor/.test(normalizedText)
        ? "ownership_interest"
        : "lab_partnership",
      source_page: sourcePage,
    });
  }

  if (
    /schedule|meeting|book (a )?(call|demo)/.test(normalizedText) ||
    destination.hostname === "meetings.hubspot.com"
  ) {
    trackEvent("schedule_meeting", {
      meeting_type: normalizedText.includes("demo") ? "demo" : "general",
      destination_url: safeDestination,
      source_page: sourcePage,
    });
  }

  if (isExternal && isBusinessOutbound(destination.hostname, anchor)) {
    trackEvent("outbound_click", {
      destination_domain: destination.hostname,
      destination_url: safeDestination,
      link_text: text,
      source_page: sourcePage,
    });
  }

  if (destination.hostname.endsWith("typeform.com")) {
    const page = currentPageContext();
    anchor.href = appendTypeformAttribution(
      destination.toString(),
      getStoredAttribution(),
      {
        analytics_delivery: "webhook",
        page_location: page.pageLocation,
        page_title: page.pageTitle,
        traffic_context: page.trafficContext,
        ...getGoogleAnalyticsCookieIdentifiers(
          analyticsConfig.ga4MeasurementId,
        ),
      },
    );
  }
}

function trackMeaningfulButton(button: HTMLButtonElement) {
  if (button.dataset.analyticsHandled) return;

  const text = (button.textContent || "").replace(/\s+/g, " ").trim();
  const normalizedText = text.toLowerCase();

  if (/schedule|meeting|book a demo|request a demo/.test(normalizedText)) {
    trackEvent("schedule_meeting", {
      meeting_type: normalizedText.includes("demo")
        ? "demo_request"
        : "contact_form",
      destination_url: "https://form.typeform.com/to/m0lQ9zjD",
      source_page: window.location.pathname,
    });
  }
}

export default function AnalyticsProvider({
  measurementConsent,
}: {
  measurementConsent: boolean;
}) {
  const pathname = usePathname();
  const [gtmReady, setGtmReady] = useState(false);
  const lastPageView = useRef("");
  const lastNewsletterView = useRef("");

  useEffect(() => {
    if (!shouldLoadAnalytics() || !measurementConsent) return;
    captureAttribution(
      window.location.href,
      document.referrer,
      analyticsConfig.siteVersion,
    );
  }, [measurementConsent]);

  useEffect(() => {
    if (!shouldLoadAnalytics()) return;
    let readyTimer: number | undefined;
    if (measurementConsent) {
      initializeGoogleConsentMode();
      initializeAnalyticsContext();
      readyTimer = window.setTimeout(() => setGtmReady(true), 0);
    } else {
      setGoogleMeasurementConsent(false);
    }
    return () => {
      if (readyTimer !== undefined) window.clearTimeout(readyTimer);
    };
  }, [measurementConsent]);

  useEffect(() => {
    if (!measurementConsent || !gtmReady || isPrivateAnalyticsPath(pathname)) {
      return;
    }

    const timer = window.setTimeout(() => {
      const pageKey = `${pathname}|${window.location.search}`;
      if (lastPageView.current === pageKey) return;
      lastPageView.current = pageKey;

      trackEvent("page_view", {
        page_location: sanitizeAnalyticsUrl(window.location.href),
        page_path: pathname,
        page_title: document.title || "Artisan Lab Network",
      });

      if (
        pathname.startsWith("/newsletters/practice-matters/issue-") &&
        lastNewsletterView.current !== pathname
      ) {
        lastNewsletterView.current = pathname;
        const content = NEWSLETTER_METADATA[pathname];
        trackEvent("newsletter_view", {
          content_title: document.title,
          content_category: "Practice Matters",
          ...(content?.author ? { author: content.author } : {}),
          ...(content?.publishDate ? { publish_date: content.publishDate } : {}),
        });
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [gtmReady, measurementConsent, pathname]);

  useEffect(() => {
    if (!measurementConsent || !gtmReady || isPrivateAnalyticsPath(pathname)) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (anchor instanceof HTMLAnchorElement) {
        trackMeaningfulClick(anchor);
        return;
      }
      const button = target.closest("button");
      if (button instanceof HTMLButtonElement) trackMeaningfulButton(button);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [gtmReady, measurementConsent, pathname]);

  if (!measurementConsent || !gtmReady || !shouldLoadAnalytics()) return null;

  return (
    <GoogleTagManager gtmId={analyticsConfig.gtmId} />
  );
}
