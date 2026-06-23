export function normalizePortalEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

const DEFAULT_ADMIN_EMAIL_DOMAINS = [
  "artisanlabnetwork.com",
  "pacificartisanlabs.com",
  "pikeartisanlabs.com",
  "peakartisanlabs.com",
];

export function isPortalAdminEmailAddress(email: string) {
  const normalizedEmail = normalizePortalEmail(email);
  if (!normalizedEmail) return false;

  const configuredDomains = new Set(
    (
      process.env.PORTAL_ADMIN_EMAIL_DOMAINS ||
      process.env.PORTAL_ADMIN_EMAIL_DOMAIN ||
      DEFAULT_ADMIN_EMAIL_DOMAINS.join(",")
    )
      .split(",")
      .map((domain) => domain.trim().replace(/^@/, "").toLowerCase())
      .filter(Boolean)
  );
  const configuredEmails = new Set(
    (process.env.PORTAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizePortalEmail)
      .filter(Boolean)
  );

  return (
    [...configuredDomains].some((domain) =>
      normalizedEmail.endsWith(`@${domain}`)
    ) ||
    configuredEmails.has(normalizedEmail)
  );
}
