import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getDashboardV1Manifest } from "@/lib/portal/adminDashboardV1";
import { AdminAccessRequired, AdminShell } from "../AdminShell";
import AskArtisanDataChat from "./AskArtisanDataChat";

export const dynamic = "force-dynamic";

export default async function AskArtisanDataPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const dataThrough = getDashboardV1Manifest()?.data_refresh_date || "";
  return (
    <AdminShell
      title="Ask Artisan Data"
      eyebrow="ALN Admin Intelligence"
      adminEmail={adminEmail}
      showHeroNav
    >
      <AskArtisanDataChat dataThrough={dataThrough} />
    </AdminShell>
  );
}
