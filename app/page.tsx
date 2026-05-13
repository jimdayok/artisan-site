import { headers } from "next/headers";
import HomePageClient from "./HomePageClient";
import PortalDashboard from "./portal/PortalDashboard";

export const dynamic = "force-dynamic";

const PORTAL_HOSTNAME = "portal.artisanslabs.com";

function getHostname(headerList: Headers) {
  const host = headerList.get("host")?.trim() ?? "";
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export default async function HomePage() {
  const headerList = await headers();

  if (getHostname(headerList) === PORTAL_HOSTNAME) {
    return <PortalDashboard headerList={headerList} />;
  }

  return <HomePageClient />;
}
