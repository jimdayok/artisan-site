import "server-only";

import type { DashboardV1AdminRow } from "@/lib/portal/adminDashboardV1";
import { isPortalAdminEmailAddress, normalizePortalEmail } from "@/lib/portal/adminAccess";
import { normalizeSalesRepCode } from "@/lib/portal/salesReps";

export type PortalStaffRole =
  | { kind: "admin"; email: string; label: string }
  | { kind: "sales-rep"; email: string; label: string; repCode: string }
  | { kind: "unassigned"; email: string; label: string };

const SALES_REPS = new Map([
  [
    "heather.branderhorst@pacificartisanlabs.com",
    { label: "Heather Branderhorst", repCode: "HB" },
  ],
  [
    "heather@pacificartisanlabs.com",
    { label: "Heather Branderhorst", repCode: "HB" },
  ],
  ["jopiol@live.com", { label: "Josh Opiol", repCode: "OP" }],
  ["jropiol@live.com", { label: "Josh Opiol", repCode: "OP" }],
]);

const BUILT_IN_ADMIN_EMAILS = new Set([
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
]);

function configuredAdminEmails() {
  return new Set(
    (process.env.PORTAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizePortalEmail)
      .filter(Boolean)
  );
}

export function getPortalStaffRole(email: string): PortalStaffRole {
  const normalizedEmail = normalizePortalEmail(email);

  const rep = SALES_REPS.get(normalizedEmail);
  if (rep) {
    return {
      kind: "sales-rep",
      email: normalizedEmail,
      label: rep.label,
      repCode: rep.repCode,
    };
  }

  if (
    BUILT_IN_ADMIN_EMAILS.has(normalizedEmail) ||
    configuredAdminEmails().has(normalizedEmail) ||
    isPortalAdminEmailAddress(normalizedEmail)
  ) {
    return { kind: "admin", email: normalizedEmail, label: "Administrator" };
  }

  return { kind: "unassigned", email: normalizedEmail, label: "Unassigned" };
}

function configuredRepAssignments() {
  const assignments = new Map<string, Set<string>>();

  for (const group of (process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS ?? "").split(",")) {
    const [rawCode, rawAccounts] = group.split(":");
    const repCode = String(rawCode ?? "").trim().toUpperCase();
    if (!repCode) continue;
    assignments.set(
      repCode,
      new Set(
        String(rawAccounts ?? "")
          .split("|")
          .map((value) => value.trim().toUpperCase())
          .filter(Boolean)
      )
    );
  }

  return assignments;
}

export function canAccessPortalAdmin(role: PortalStaffRole) {
  return role.kind === "admin" || role.kind === "sales-rep";
}

export function canAccessAdminAccount(
  role: PortalStaffRole,
  row: DashboardV1AdminRow
) {
  if (role.kind === "admin") return true;
  if (role.kind !== "sales-rep") return false;

  const rowRepCode = normalizeSalesRepCode(row.salesRepCode);
  if (rowRepCode) return rowRepCode === role.repCode;

  return (
    configuredRepAssignments()
      .get(role.repCode)
      ?.has(row.acctId.trim().toUpperCase()) ?? false
  );
}

export function filterRowsForPortalRole(
  role: PortalStaffRole,
  rows: DashboardV1AdminRow[]
) {
  return rows.filter((row) => canAccessAdminAccount(role, row));
}

export function hasConfiguredRepAssignments(
  role: PortalStaffRole,
  rows: DashboardV1AdminRow[]
) {
  if (role.kind !== "sales-rep") return true;
  return rows.some((row) => canAccessAdminAccount(role, row));
}
