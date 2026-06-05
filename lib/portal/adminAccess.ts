export function normalizePortalEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

export function isPortalAdminEmailAddress(email: string) {
  const normalizedEmail = normalizePortalEmail(email);
  if (!normalizedEmail) return false;

  const configuredDomain = (
    process.env.PORTAL_ADMIN_EMAIL_DOMAIN?.trim() || "artisanlabnetwork.com"
  )
    .replace(/^@/, "")
    .toLowerCase();
  const configuredEmails = new Set(
    (process.env.PORTAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizePortalEmail)
      .filter(Boolean)
  );

  return (
    normalizedEmail.endsWith(`@${configuredDomain}`) ||
    configuredEmails.has(normalizedEmail)
  );
}
