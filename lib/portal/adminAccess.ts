export function normalizePortalEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

export const TRUSTED_NETWORK_ADMIN_EMAIL =
  "lab-vpn-admin@trusted.artisan.invalid";

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
  ["nicole@artisanlabnetwork.com", { label: "Nicole", repCode: "NC" }],
  ["jropiol@live.com", { label: "Josh Opiol", repCode: "OP" }],
]);

export const BUILT_IN_PORTAL_ADMIN_EMAILS = new Set([
  TRUSTED_NETWORK_ADMIN_EMAIL,
  "brandon.butler@artisanlabnetwork.com",
  "chasity@peakartisanlabs.com",
  "cbrant@pacificartisanlabs.com",
  "derek@pacificartisanlabs.com",
  "jjones@pikeartisanlabs.com",
  "jeff@pacificartisanlabs.com",
  "jenn@peakartisanlabs.com",
  "jenf@peakartisanlabs.com",
  "jessd@pikeartisanlabs.com",
  "jcurry@pacificartisanlabs.com",
  "jim.day@artisanlabnetwork.com",
  "johnc@peakartisanlabs.com",
  "jhinckley@pacificartisanlabs.com",
  "larry@pacificartisanlabs.com",
  "leanne@pacificartisanlabs.com",
  "mmedina@peakartisanlabs.com",
  "mercedes@pacificartisanlabs.com",
  "noah@pacificartisanlabs.com",
  "noelle@pacificartisanlabs.com",
  "pacificartisanlabslms@pacificartisanlabs.com",
  "peakartisanlabslms@peakartisanlabs.com",
  "pikeartisanlabslms@pikeartisanlabs.com",
  "poaadmin@pacificartisanlabs.com",
  "rahlson@artisanlabnetwork.com",
  "rick@pacificartisanlabs.com",
  "sarah@pacificartisanlabs.com",
  "sreed@pikeartisanlabs.com",
  "sdowdell@pikeartisanlabs.com",
  "switmer@artisanlabnetwork.com",
  "tech1@pacificartisanlabs.com",
]);

export function isPortalAdminEmailAddress(email: string) {
  const normalizedEmail = normalizePortalEmail(email);
  if (!normalizedEmail) return false;

  // Explicit sales-rep assignments always win over domain and environment
  // admin allowlists. This prevents a rep at an employee domain from being
  // elevated to unrestricted administrator access elsewhere in the portal.
  if (BUILT_IN_PORTAL_SALES_REPS.has(normalizedEmail)) return false;

  const configuredEmails = new Set(
    (process.env.PORTAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizePortalEmail)
      .filter(Boolean)
  );

  return (
    BUILT_IN_PORTAL_ADMIN_EMAILS.has(normalizedEmail) ||
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
