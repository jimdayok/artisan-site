import { createHmac, timingSafeEqual } from "node:crypto";
import type { LabName, LeadType, SiteVersion } from "./types";

const SAFE_ATTRIBUTION_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
]);

const ALLOWED_FORM_IDS = new Set(["m0lQ9zjD", "quuPCSff"]);
const LAB_NAMES = new Set<LabName>(["Pike", "Peak", "Pacific", "Network"]);
const SITE_VERSIONS = new Set<SiteVersion>([
  "existing",
  "preview",
  "production",
]);
const LEAD_TYPES = new Set<LeadType>([
  "general_contact",
  "new_account",
  "partner_interest",
  "ownership_interest",
  "meeting_request",
  "sales_inquiry",
  "customer_service",
  "other",
]);

type TypeformWebhookPayload = {
  event_type?: unknown;
  form_response?: {
    form_id?: unknown;
    token?: unknown;
    submitted_at?: unknown;
    hidden?: unknown;
  };
};

export type MeasurementProtocolEvent = {
  client_id: string;
  timestamp_micros?: string;
  consent: {
    ad_user_data: "DENIED";
    ad_personalization: "DENIED";
  };
  events: Array<{
    name: "generate_lead";
    params: Record<string, string | number>;
  }>;
};

function safeString(value: unknown, maxLength = 100) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function hiddenFields(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, string>;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => typeof entry === "string")
      .map(([key, entry]) => [key, safeString(entry, 500)]),
  );
}

function safeSiteVersion(value: unknown) {
  const candidate = safeString(value) as SiteVersion;
  return SITE_VERSIONS.has(candidate) ? candidate : undefined;
}

function safeLabName(value: unknown) {
  const candidate = safeString(value) as LabName;
  return LAB_NAMES.has(candidate) ? candidate : "Network";
}

function safeLeadType(value: unknown, fallback: LeadType) {
  const candidate = safeString(value) as LeadType;
  return LEAD_TYPES.has(candidate) ? candidate : fallback;
}

function safeClientId(value: unknown) {
  const candidate = safeString(value, 200);
  const match = candidate.match(/(?:^|\.)(\d+\.\d+)$/);
  return match?.[1];
}

function safeSessionId(value: unknown) {
  const candidate = safeString(value, 200);
  if (/^\d+$/.test(candidate)) return candidate;
  const currentFormat = candidate.match(/(?:^|[.$])s(\d+)(?:[.$]|$)/i);
  if (currentFormat?.[1]) return currentFormat[1];
  return candidate.match(/^GS\d+\.\d+\.(\d+)(?:\.|$)/i)?.[1];
}

function sourcePath(pageLocation: string) {
  try {
    return new URL(pageLocation).pathname.slice(0, 100) || "/";
  } catch {
    return "/";
  }
}

function safePageLocation(value: string) {
  try {
    const input = new URL(value);
    const safe = new URL(input.origin + input.pathname);
    for (const [key, entry] of input.searchParams.entries()) {
      if (SAFE_ATTRIBUTION_KEYS.has(key.toLowerCase())) {
        safe.searchParams.set(key.toLowerCase(), entry.slice(0, 100));
      }
    }
    return safe.toString().slice(0, 100);
  } catch {
    return "";
  }
}

function submittedTimestamp(value: unknown) {
  const timestamp = Date.parse(safeString(value, 40));
  if (!Number.isFinite(timestamp)) return undefined;
  const age = Date.now() - timestamp;
  if (age < -5 * 60 * 1000 || age > 72 * 60 * 60 * 1000) return undefined;
  return String(Math.trunc(timestamp * 1000));
}

export function verifyTypeformSignature(
  receivedSignature: string | null,
  rawPayload: string,
  secret: string,
) {
  if (!receivedSignature || !secret) return false;
  const expected = `sha256=${createHmac("sha256", secret)
    .update(rawPayload)
    .digest("base64")}`;
  const received = Buffer.from(receivedSignature);
  const calculated = Buffer.from(expected);
  return (
    received.length === calculated.length &&
    timingSafeEqual(received, calculated)
  );
}

export function syntheticClientId(formId: string, token: string, secret: string) {
  const digest = createHmac("sha256", secret)
    .update(`${formId}:${token}`)
    .digest();
  return `${digest.readUInt32BE(0) || 1}.${digest.readUInt32BE(4) || 1}`;
}

export function buildTypeformLeadEvent(
  payload: unknown,
  secret: string,
): { event?: MeasurementProtocolEvent; reason?: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { reason: "invalid_payload" };
  }
  const webhook = payload as TypeformWebhookPayload;
  if (webhook.event_type !== "form_response") {
    return { reason: "not_completed" };
  }

  const response = webhook.form_response;
  const formId = safeString(response?.form_id, 20);
  if (!ALLOWED_FORM_IDS.has(formId)) return { reason: "unknown_form" };

  const hidden = hiddenFields(response?.hidden);
  const siteVersion = safeSiteVersion(hidden.site_version);
  if (!siteVersion) return { reason: "consent_context_missing" };

  // Preview embeds already send their success event through Typeform's official
  // onSubmit callback. Ignore their webhook to prevent a duplicate lead.
  if (
    formId === "m0lQ9zjD" &&
    siteVersion !== "existing" &&
    hidden.analytics_delivery !== "webhook"
  ) {
    return { reason: "client_event_preferred" };
  }

  const token = safeString(response?.token, 200);
  const clientId = safeClientId(hidden.ga_client_id) ||
    syntheticClientId(formId, token || "missing", secret);
  const pageLocation = safePageLocation(
    safeString(hidden.page_location, 500) || hidden.landing_page ||
      (siteVersion === "existing"
        ? "https://www.artisanlabnetwork.com/"
        : "https://preview.artisanlabnetwork.com/"),
  );
  const fallbackLeadType: LeadType =
    formId === "quuPCSff" ? "new_account" : "general_contact";
  const params: Record<string, string | number> = {
    lead_type: safeLeadType(hidden.lead_type, fallbackLeadType),
    form_name:
      formId === "quuPCSff" ? "new_account_application" : "general_contact",
    page_location: pageLocation,
    page_title: safeString(hidden.page_title, 100) || "Artisan Lab Network",
    source_page: sourcePath(pageLocation),
    site_version: siteVersion,
    lab_name: safeLabName(hidden.lab_name),
    traffic_context: safeString(hidden.traffic_context, 40) || "unknown",
    engagement_time_msec: 1,
    analytics_delivery: "typeform_webhook",
  };
  const sessionId = safeSessionId(hidden.ga_session_id);
  if (sessionId) params.session_id = sessionId;

  return {
    event: {
      client_id: clientId,
      ...(submittedTimestamp(response?.submitted_at)
        ? { timestamp_micros: submittedTimestamp(response?.submitted_at) }
        : {}),
      consent: {
        ad_user_data: "DENIED",
        ad_personalization: "DENIED",
      },
      events: [{ name: "generate_lead", params }],
    },
  };
}
