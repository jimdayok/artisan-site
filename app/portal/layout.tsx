import { headers } from "next/headers";
import AdminUtilityNav from "@/app/portal/AdminUtilityNav";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(
    await headers()
  );
  const isAdmin = Boolean(
    authenticatedEmail && isPortalAdminEmail(authenticatedEmail)
  );

  return (
    <>
      {isAdmin ? <AdminUtilityNav /> : null}
      {children}
    </>
  );
}
