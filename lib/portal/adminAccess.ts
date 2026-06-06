export function normalizePortalEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

export function isPortalAdminEmailAddress(email: string) {
  const normalizedEmail = normalizePortalEmail(email);
  if (!normalizedEmail) return false;

  const configuredDomains = new Set(
    (
      process.env.PORTAL_ADMIN_EMAIL_DOMAINS ||
      process.env.PORTAL_ADMIN_EMAIL_DOMAIN ||
      "artisanlabnetwork.com"
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
