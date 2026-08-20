import type { DashboardV1AdminRow } from "./adminDashboardV1.ts";
import {
  BUILT_IN_PORTAL_SALES_REPS,
  isPortalAdminEmailAddress,
  normalizePortalEmail,
} from "./adminAccess.ts";
import { normalizeSalesRepCode } from "./salesReps.ts";

export type PortalStaffRole =
  | { kind: "admin"; email: string; label: string }
  | { kind: "sales-rep"; email: string; label: string; repCode: string }
  | { kind: "unassigned"; email: string; label: string };

export function getPortalStaffRole(email: string): PortalStaffRole {
  const normalizedEmail = normalizePortalEmail(email);
  const rep = BUILT_IN_PORTAL_SALES_REPS.get(normalizedEmail);
  if (rep) {
    return {
      kind: "sales-rep",
      email: normalizedEmail,
      label: rep.label,
      repCode: rep.repCode,
    };
  }
  if (isPortalAdminEmailAddress(normalizedEmail)) {
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
  row: Pick<DashboardV1AdminRow, "salesRepCode" | "acctId">
) {
  if (role.kind === "admin") return true;
  if (role.kind !== "sales-rep") return false;
  const rowRepCode = normalizeSalesRepCode(row.salesRepCode);
  if (rowRepCode) return rowRepCode === role.repCode;
  return configuredRepAssignments().get(role.repCode)?.has(row.acctId.trim().toUpperCase()) ?? false;
}

export function filterRowsForPortalRole<T extends Pick<DashboardV1AdminRow, "salesRepCode" | "acctId">>(
  role: PortalStaffRole,
  rows: T[]
) {
  return rows.filter((row) => canAccessAdminAccount(role, row));
}

export function hasConfiguredRepAssignments(
  role: PortalStaffRole,
  rows: Array<Pick<DashboardV1AdminRow, "salesRepCode" | "acctId">>
) {
  if (role.kind !== "sales-rep") return true;
  return rows.some((row) => canAccessAdminAccount(role, row));
}
