export const CLOUDFLARE_ACCESS_EMAIL_HEADER =
  "cf-access-authenticated-user-email";

const DEVELOPMENT_FALLBACK_EMAIL = "jimdayok@me.com";
const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1"]);
const PORTAL_HOSTNAME = "portal.artisanslabs.com";

function normalizeHostname(host: string) {
  return host.trim().split(",")[0]?.split(":")[0]?.toLowerCase() ?? "";
}

function getForwardedHost(headers: Headers) {
  const forwarded = headers.get("forwarded") ?? "";
  const hostMatch = forwarded.match(/(?:^|;|,\s*)host=([^;,]+)/i);

  return hostMatch?.[1]?.replace(/^"|"$/g, "") ?? "";
}

export function getRequestHostnames(headers: Headers) {
  return [
    headers.get("host") ?? "",
    headers.get("x-forwarded-host") ?? "",
    headers.get("x-original-host") ?? "",
    headers.get("x-vercel-forwarded-host") ?? "",
    headers.get("cf-original-host") ?? "",
    getForwardedHost(headers),
  ]
    .map(normalizeHostname)
    .filter(Boolean);
}

export function isPortalHostRequest(headers: Headers) {
  return getRequestHostnames(headers).includes(PORTAL_HOSTNAME);
}

export function isLocalhostRequest(headers: Headers) {
  return getRequestHostnames(headers).some((hostname) =>
    LOCALHOST_NAMES.has(hostname)
  );
}

export function isLocalhostDevelopmentRequest(headers: Headers) {
  return process.env.NODE_ENV === "development" && isLocalhostRequest(headers);
}

export function getDevelopmentFallbackEmail(headers: Headers) {
  return isLocalhostDevelopmentRequest(headers) ? DEVELOPMENT_FALLBACK_EMAIL : "";
}

export function getCloudflareAccessEmailFromHeaders(headers: Headers) {
  return headers.get(CLOUDFLARE_ACCESS_EMAIL_HEADER)?.trim() ?? "";
}

export function getAuthenticatedEmailFromHeaders(headers: Headers) {
  const cloudflareAccessEmail = getCloudflareAccessEmailFromHeaders(headers);

  if (cloudflareAccessEmail) return cloudflareAccessEmail;

  return getDevelopmentFallbackEmail(headers);
}
