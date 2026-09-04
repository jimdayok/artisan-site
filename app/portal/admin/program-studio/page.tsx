import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminAccessRequired } from "@/app/portal/admin/AdminShell";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import {
  getProgramStudioCustomers,
  getProgramStudioPriceLists,
} from "@/lib/portal/programStudioAccess";
import ProgramStudio from "./ProgramStudio";
import "./program-studio.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Program Studio | Artisan Lab Network",
  description: "Private Artisan customer program proposal builder.",
  robots: { index: false, follow: false, nocache: true },
};

function personNameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
export default async function ProgramStudioPage() {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(
    await headers()
  );
  const role = getPortalStaffRole(authenticatedEmail);
  if (!authenticatedEmail || !canAccessPortalAdmin(role)) {
    return <AdminAccessRequired />;
  }

  const priceLists = getProgramStudioPriceLists(role);
  const today = new Date().toISOString().slice(0, 10);
  const preparedBy =
    role.kind === "sales-rep"
      ? role.label
      : personNameFromEmail(authenticatedEmail) || "Artisan Lab Network";

  return (
    <ProgramStudio
      currentUser={{
        email: authenticatedEmail,
        name: preparedBy,
        role: role.kind === "sales-rep" ? "Sales representative" : "Administrator",
      }}
      customers={getProgramStudioCustomers(role)}
      priceLists={priceLists}
      today={today}
    />
  );
}
