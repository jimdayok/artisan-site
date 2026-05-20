export const CLOUDFLARE_ACCESS_EMAIL_HEADER =
  "cf-access-authenticated-user-email";
export const TRUSTED_PORTAL_EMAIL_HEADER = "x-portal-auth-email";
export const LOCAL_PORTAL_TEST_EMAIL_COOKIE = "portal_dev_email";

const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const PORTAL_HOSTNAME = "portal.artisanslabs.com";
export const CLOUDFLARE_ACCESS_JWT_COOKIE = "CF_Authorization";

function normalizeHostname(host: string) {
  const firstHost = host.trim().split(",")[0]?.toLowerCase() ?? "";

  if (firstHost.startsWith("[::1]")) return "::1";
  if (firstHost === "::1") return "::1";

  return firstHost.split(":")[0] ?? "";
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

export function getCloudflareAccessEmailFromHeaders(headers: Headers) {
  return headers.get(CLOUDFLARE_ACCESS_EMAIL_HEADER)?.trim().toLowerCase() ?? "";
}

export function getVerifiedCloudflareAccessEmailFromHeaders(headers: Headers) {
  return getCloudflareAccessEmailFromHeaders(headers);
}

function getCookieValue(headers: Headers, cookieName: string) {
  const cookieHeader = headers.get("cookie") ?? "";

  return (
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) ?? ""
  );
}

export function getLocalDevelopmentPortalEmailFromHeaders(headers: Headers) {
  if (!isLocalhostDevelopmentRequest(headers)) return "";

  try {
    return decodeURIComponent(
      getCookieValue(headers, LOCAL_PORTAL_TEST_EMAIL_COOKIE)
    )
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

export function getPortalAuthenticatedEmailFromHeaders(headers: Headers) {
  const trustedEmail =
    headers.get(TRUSTED_PORTAL_EMAIL_HEADER)?.trim().toLowerCase() ?? "";
  if (trustedEmail) return trustedEmail;

  const cloudflareAccessEmail = getCloudflareAccessEmailFromHeaders(headers);

  if (cloudflareAccessEmail && hasCloudflareAccessJwtCookie(headers)) {
    return cloudflareAccessEmail;
  }

  // Localhost-only explicit test login. Production requests never trust this
  // cookie; they must include Cloudflare Access' verified email header.
  return getLocalDevelopmentPortalEmailFromHeaders(headers);
}

export function hasCloudflareAccessJwtCookie(headers: Headers) {
  return Boolean(getCookieValue(headers, CLOUDFLARE_ACCESS_JWT_COOKIE));
}
