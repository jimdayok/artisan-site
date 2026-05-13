import { headers } from "next/headers";
import PortalDashboard from "./PortalDashboard";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const headerList = await headers();

  return <PortalDashboard headerList={headerList} />;
}
