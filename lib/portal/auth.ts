export const CLOUDFLARE_ACCESS_EMAIL_HEADER =
  "cf-access-authenticated-user-email";

const DEVELOPMENT_FALLBACK_EMAIL = "jimdayok@me.com";
const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1"]);

function getHostnameFromHeaders(headers: Headers) {
  const host = headers.get("host")?.trim() ?? "";
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function isLocalhostRequest(headers: Headers) {
  return LOCALHOST_NAMES.has(getHostnameFromHeaders(headers));
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
