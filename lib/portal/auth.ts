export const CLOUDFLARE_ACCESS_EMAIL_HEADER =
  "cf-access-authenticated-user-email";

const DEVELOPMENT_FALLBACK_EMAIL = "jimdayok@me.com";

export function getDevelopmentFallbackEmail() {
  return process.env.NODE_ENV === "development" ? DEVELOPMENT_FALLBACK_EMAIL : "";
}

export function getCloudflareAccessEmailFromHeaders(headers: Headers) {
  return headers.get(CLOUDFLARE_ACCESS_EMAIL_HEADER)?.trim() ?? "";
}

export function getAuthenticatedEmailFromHeaders(headers: Headers) {
  const cloudflareAccessEmail = getCloudflareAccessEmailFromHeaders(headers);

  if (cloudflareAccessEmail) return cloudflareAccessEmail;

  return getDevelopmentFallbackEmail();
}
