export const CLOUDFLARE_ACCESS_EMAIL_HEADER =
  "cf-access-authenticated-user-email";
export const TRUSTED_PORTAL_EMAIL_HEADER = "x-portal-auth-email";
export const LOCAL_PORTAL_TEST_EMAIL_COOKIE = "portal_dev_email";

const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1", "::1"]);
export const CLOUDFLARE_ACCESS_JWT_COOKIE = "CF_Authorization";
let hasLoggedMissingCloudflareEnv = false;

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
  const expectedHostnames = getPortalExpectedHostnames();

  return getRequestHostnames(headers).some((hostname) =>
    expectedHostnames.has(hostname)
  );
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

  if (!isCloudflareAccessConfigured()) {
    logMissingCloudflareAccessEnv(headers);
    return "";
  }

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

function getPortalExpectedHostnames() {
  const configuredPortalHost = process.env.PORTAL_HOSTNAME?.trim().toLowerCase();
  const configuredSiteHost = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim().toLowerCase();
  const fallbackSiteHost = "artisanlabnetwork.com";

  return new Set(
    [
      configuredPortalHost,
      configuredSiteHost,
      fallbackSiteHost,
      `www.${fallbackSiteHost}`,
    ].filter(Boolean) as string[]
  );
}

function isCloudflareAccessConfigured() {
  if (process.env.NODE_ENV !== "production") return true;

  const teamDomain =
    process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.trim() ||
    process.env.CF_ACCESS_TEAM_DOMAIN?.trim() ||
    "";
  const audience =
    process.env.CLOUDFLARE_ACCESS_AUD?.trim() ||
    process.env.CF_ACCESS_AUD?.trim() ||
    "";

  return Boolean(teamDomain && audience);
}

function logMissingCloudflareAccessEnv(headers: Headers) {
  if (process.env.NODE_ENV !== "production" || hasLoggedMissingCloudflareEnv) {
    return;
  }

  hasLoggedMissingCloudflareEnv = true;
  console.error(
    "[portal-auth] Missing Cloudflare Access environment variables. Set CLOUDFLARE_ACCESS_TEAM_DOMAIN (or CF_ACCESS_TEAM_DOMAIN) and CLOUDFLARE_ACCESS_AUD (or CF_ACCESS_AUD). Portal auth is fail-closed.",
    {
      hostnames: getRequestHostnames(headers),
    }
  );
}
