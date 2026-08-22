import type { LabName } from "./types";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
] as const;

const SAFE_ATTRIBUTION_KEY = new Set<string>(ATTRIBUTION_KEYS);
const STORAGE_KEY = "aln_analytics_attribution_v1";

export type AttributionContext = Partial<
  Record<(typeof ATTRIBUTION_KEYS)[number], string>
> & {
  landing_page: string;
  referrer: string;
  site_version: string;
  lab_name: LabName;
};

export type TypeformCompletionContext = {
  analytics_delivery: "client" | "webhook";
  page_location: string;
  page_title: string;
  traffic_context: string;
  ga_client_id?: string;
  ga_session_id?: string;
};

export function resolveLabName(pathname: string): LabName {
  const normalized = pathname.toLowerCase();
  if (
    normalized.includes("pacific-artisan-labs") ||
    normalized === "/pdx" ||
    normalized.startsWith("/pdx/")
  ) {
    return "Pacific";
  }
  if (
    normalized.includes("peak-artisan-labs") ||
    normalized === "/den" ||
    normalized.startsWith("/den/")
  ) {
    return "Peak";
  }
  if (
    normalized.includes("pike-artisan-labs") ||
    normalized === "/ind" ||
    normalized.startsWith("/ind/")
  ) {
    return "Pike";
  }
  return "Network";
}

export function isPrivateAnalyticsPath(pathname: string) {
  return (
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/private" ||
    pathname.startsWith("/private/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/")
  );
}

export function sanitizeAnalyticsUrl(input: string, base?: string) {
  try {
    const url = new URL(input, base ?? "https://www.artisanlabnetwork.com");
    const safe = new URL(url.origin + url.pathname);
    for (const [key, value] of url.searchParams.entries()) {
      if (SAFE_ATTRIBUTION_KEY.has(key.toLowerCase())) {
        safe.searchParams.set(key.toLowerCase(), value.slice(0, 120));
      }
    }
    return safe.toString();
  } catch {
    return "";
  }
}

export function sanitizeDestinationUrl(input: string, base?: string) {
  try {
    const url = new URL(input, base ?? "https://www.artisanlabnetwork.com");
    if (url.protocol === "mailto:" || url.protocol === "tel:") {
      return `${url.protocol}${url.pathname.split("?")[0]}`;
    }
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

export function sanitizeSearchTerm(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!normalized) return undefined;

  const looksLikeEmail = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(normalized);
  const looksLikePhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(normalized);
  const looksLikeUrl = /(?:https?:\/\/|www\.)/i.test(normalized);
  const longNumber = /\b\d{7,}\b/.test(normalized);

  return looksLikeEmail || looksLikePhone || looksLikeUrl || longNumber
    ? undefined
    : normalized;
}

export function trafficContext(locationHref: string, referrer: string) {
  try {
    const url = new URL(locationHref);
    const medium = url.searchParams.get("utm_medium")?.toLowerCase();
    if (medium) return medium === "organic" ? "organic" : "campaign";
    if (
      url.searchParams.has("gclid") ||
      url.searchParams.has("gbraid") ||
      url.searchParams.has("wbraid") ||
      url.searchParams.has("msclkid")
    ) {
      return "paid";
    }
    if (!referrer) return "direct";
    const referringHost = new URL(referrer).hostname.toLowerCase();
    if (/google\.|bing\.|yahoo\.|duckduckgo\./.test(referringHost)) {
      return "organic";
    }
    if (referringHost === url.hostname.toLowerCase()) return "internal";
    return "referral";
  } catch {
    return "unknown";
  }
}

function safeReferrer(referrer: string) {
  try {
    return referrer ? new URL(referrer).origin : "";
  } catch {
    return "";
  }
}

export function captureAttribution(
  locationHref: string,
  referrer: string,
  siteVersion: string,
) {
  if (typeof window === "undefined") return undefined;

  const existing = window.sessionStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as AttributionContext;
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  const url = new URL(locationHref);
  const attribution: AttributionContext = {
    landing_page: sanitizeAnalyticsUrl(locationHref),
    referrer: safeReferrer(referrer),
    site_version: siteVersion,
    lab_name: resolveLabName(url.pathname),
  };

  for (const key of ATTRIBUTION_KEYS) {
    const value = url.searchParams.get(key)?.trim();
    if (value) attribution[key] = value.slice(0, 120);
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
}

export function getStoredAttribution() {
  if (typeof window === "undefined") return undefined;
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return undefined;
  try {
    return JSON.parse(stored) as AttributionContext;
  } catch {
    return undefined;
  }
}

function browserCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));
  if (!entry) return undefined;
  try {
    return decodeURIComponent(entry.slice(prefix.length)).slice(0, 200);
  } catch {
    return entry.slice(prefix.length).slice(0, 200);
  }
}

export function parseGoogleAnalyticsClientId(cookieValue: string | undefined) {
  if (!cookieValue) return undefined;
  const match = cookieValue.match(/(?:^|\.)(\d+\.\d+)$/);
  return match?.[1];
}

export function parseGoogleAnalyticsSessionId(cookieValue: string | undefined) {
  if (!cookieValue) return undefined;
  const currentFormat = cookieValue.match(/(?:^|[.$])s(\d+)(?:[.$]|$)/i);
  if (currentFormat?.[1]) return currentFormat[1];
  const legacyFormat = cookieValue.match(/^GS\d+\.\d+\.(\d+)(?:\.|$)/i);
  return legacyFormat?.[1];
}

export function getGoogleAnalyticsCookieIdentifiers(measurementId: string) {
  const streamSuffix = measurementId
    .replace(/^G-/i, "")
    .replace(/[^a-z0-9]/gi, "_");
  const gaClientId = parseGoogleAnalyticsClientId(browserCookie("_ga"));
  const gaSessionId = streamSuffix
    ? parseGoogleAnalyticsSessionId(browserCookie(`_ga_${streamSuffix}`))
    : undefined;

  return {
    ...(gaClientId ? { ga_client_id: gaClientId } : {}),
    ...(gaSessionId ? { ga_session_id: gaSessionId } : {}),
  };
}

export function appendTypeformAttribution(
  href: string,
  attribution: AttributionContext | undefined,
  completion?: TypeformCompletionContext,
) {
  if (!attribution) return href;
  try {
    const url = new URL(href);
    if (!url.hostname.endsWith("typeform.com")) return href;

    for (const key of ATTRIBUTION_KEYS) {
      const value = attribution[key];
      if (value) url.searchParams.set(key, value);
    }

    const hidden = new URLSearchParams(url.hash.replace(/^#/, ""));
    hidden.set("landing_page", attribution.landing_page);
    hidden.set("referrer", attribution.referrer);
    hidden.set("site_version", attribution.site_version);
    hidden.set("lab_name", attribution.lab_name);
    if (completion) {
      for (const [key, value] of Object.entries(completion)) {
        if (value) hidden.set(key, value.slice(0, 500));
      }
    }
    url.hash = hidden.toString();
    return url.toString();
  } catch {
    return href;
  }
}
