export function normalizePortalEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

export type BuiltInPortalSalesRep = {
  label: string;
  repCode: string;
};

export const BUILT_IN_PORTAL_SALES_REPS = new Map<
  string,
  BuiltInPortalSalesRep
>([
  [
    "heather.branderhorst@pacificartisanlabs.com",
    { label: "Heather Branderhorst", repCode: "HB" },
  ],
  [
    "heather@pacificartisanlabs.com",
    { label: "Heather Branderhorst", repCode: "HB" },
  ],
  ["jropiol@live.com", { label: "Josh Opiol", repCode: "OP" }],
]);

const BUILT_IN_ADMIN_EMAILS = new Set([
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
]);

const DEFAULT_ADMIN_EMAIL_DOMAINS = [
  "artisanlabnetwork.com",
  "pacificartisanlabs.com",
  "pikeartisanlabs.com",
  "peakartisanlabs.com",
];

export function isPortalAdminEmailAddress(email: string) {
  const normalizedEmail = normalizePortalEmail(email);
  if (!normalizedEmail) return false;

  // Explicit sales-rep assignments always win over domain and environment
  // admin allowlists. This prevents a rep at an employee domain from being
  // elevated to unrestricted administrator access elsewhere in the portal.
  if (BUILT_IN_PORTAL_SALES_REPS.has(normalizedEmail)) return false;

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
    BUILT_IN_ADMIN_EMAILS.has(normalizedEmail) ||
    [...configuredDomains].some((domain) =>
      normalizedEmail.endsWith(`@${domain}`)
    ) ||
    configuredEmails.has(normalizedEmail)
  );
}

export function isPortalStaffEmailAddress(email: string) {
  const normalizedEmail = normalizePortalEmail(email);

  return (
    BUILT_IN_PORTAL_SALES_REPS.has(normalizedEmail) ||
    isPortalAdminEmailAddress(normalizedEmail)
  );
}
