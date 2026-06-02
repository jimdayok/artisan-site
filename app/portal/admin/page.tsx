import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { AdminAccessRequired } from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function PortalAdminPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;
  redirect("/portal");
}
