export const CLOUDFLARE_ACCESS_EMAIL_HEADER =
  "cf-access-authenticated-user-email";
export const CLOUDFLARE_ACCESS_JWT_HEADER = "cf-access-jwt-assertion";
export const CLOUDFLARE_ACCESS_JWT_COOKIE = "CF_Authorization";

const DEVELOPMENT_FALLBACK_EMAIL = "jimdayok@me.com";
const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1"]);
const PORTAL_HOSTNAME = "portal.artisanslabs.com";
const CLOUDFLARE_ACCESS_TEAM_DOMAIN_ENV_KEYS = [
  "CLOUDFLARE_ACCESS_TEAM_DOMAIN",
  "CF_ACCESS_TEAM_DOMAIN",
];
const CLOUDFLARE_ACCESS_AUD_ENV_KEYS = [
  "CLOUDFLARE_ACCESS_AUD",
  "CF_ACCESS_AUD",
  "CLOUDFLARE_ACCESS_AUDIENCE",
];

type CloudflareAccessJwk = JsonWebKey & {
  kid?: string;
  alg?: string;
  use?: string;
};

type CloudflareAccessJwks = {
  keys?: CloudflareAccessJwk[];
};

type CloudflareAccessJwtPayload = {
  aud?: string | string[];
  common_name?: string;
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  nbf?: number;
  sub?: string;
};

let cachedAccessJwks:
  | {
      issuer: string;
      keys: CloudflareAccessJwk[];
    }
  | undefined;

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
  return headers.get(CLOUDFLARE_ACCESS_EMAIL_HEADER)?.trim().toLowerCase() ?? "";
}

export function getAuthenticatedEmailFromHeaders(headers: Headers) {
  const cloudflareAccessEmail = getCloudflareAccessEmailFromHeaders(headers);

  if (cloudflareAccessEmail) return cloudflareAccessEmail;

  return getDevelopmentFallbackEmail(headers);
}

function getEnvValue(keys: string[]) {
  if (typeof process === "undefined") return "";

  for (const key of keys) {
    const value = process.env[key]?.trim();

    if (value) return value;
  }

  return "";
}

function normalizeCloudflareAccessIssuer(teamDomain: string) {
  const normalizedTeamDomain = teamDomain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  return normalizedTeamDomain
    ? `https://${normalizedTeamDomain}`
    : "";
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(
    Math.ceil(base64.length / 4) * 4,
    "="
  );
  const binary = atob(paddedBase64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodeJwtPart<T>(value: string) {
  const decoded = new TextDecoder().decode(base64UrlToBytes(value));

  return JSON.parse(decoded) as T;
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

export function getCloudflareAccessJwtFromHeaders(headers: Headers) {
  return (
    headers.get(CLOUDFLARE_ACCESS_JWT_HEADER)?.trim() ||
    getCookieValue(headers, CLOUDFLARE_ACCESS_JWT_COOKIE)
  );
}

export function getCloudflareAccessJwtCookieFromHeaders(headers: Headers) {
  return getCookieValue(headers, CLOUDFLARE_ACCESS_JWT_COOKIE);
}

async function getCloudflareAccessJwks(issuer: string) {
  if (cachedAccessJwks?.issuer === issuer) return cachedAccessJwks.keys;

  const response = await fetch(`${issuer}/cdn-cgi/access/certs`, {
    cache: "force-cache",
  });

  if (!response.ok) return [];

  const jwks = (await response.json()) as CloudflareAccessJwks;
  const keys = jwks.keys ?? [];
  cachedAccessJwks = { issuer, keys };

  return keys;
}

function jwtAudienceMatches(audience: string | string[] | undefined, expected: string) {
  if (!audience) return false;

  return Array.isArray(audience)
    ? audience.includes(expected)
    : audience === expected;
}

function claimLooksLikeEmail(value: string | undefined) {
  return value?.includes("@") ? value.trim().toLowerCase() : "";
}

export async function getCloudflareAccessEmailFromJwt(headers: Headers) {
  const token = getCloudflareAccessJwtFromHeaders(headers);
  const teamDomain = getEnvValue(CLOUDFLARE_ACCESS_TEAM_DOMAIN_ENV_KEYS);
  const expectedAudience = getEnvValue(CLOUDFLARE_ACCESS_AUD_ENV_KEYS);
  const issuer = normalizeCloudflareAccessIssuer(teamDomain);

  if (!token || !issuer || !expectedAudience) return "";

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !encodedSignature) return "";

    const header = decodeJwtPart<{ alg?: string; kid?: string }>(encodedHeader);

    if (header.alg !== "RS256" || !header.kid) return "";

    const keys = await getCloudflareAccessJwks(issuer);
    const key = keys.find((candidateKey) => candidateKey.kid === header.kid);

    if (!key) return "";

    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      key,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const verified = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      base64UrlToBytes(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!verified) return "";

    const payload =
      decodeJwtPart<CloudflareAccessJwtPayload>(encodedPayload);
    const now = Math.floor(Date.now() / 1000);

    if (payload.iss !== issuer) return "";
    if (!jwtAudienceMatches(payload.aud, expectedAudience)) return "";
    if (typeof payload.exp !== "number" || payload.exp <= now) return "";
    if (typeof payload.nbf === "number" && payload.nbf > now) return "";

    return (
      claimLooksLikeEmail(payload.email) ||
      claimLooksLikeEmail(payload.common_name) ||
      ""
    );
  } catch {
    return "";
  }
}

export async function getAuthenticatedEmailFromHeadersWithAccessJwt(
  headers: Headers
) {
  const headerEmail = getAuthenticatedEmailFromHeaders(headers);

  if (headerEmail) return headerEmail;

  return getCloudflareAccessEmailFromJwt(headers);
}
