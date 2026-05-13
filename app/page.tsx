import { headers } from "next/headers";
import { isPortalHostRequest } from "@/lib/portal/auth";
import HomePageClient from "./HomePageClient";
import PortalDashboard from "./portal/PortalDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const headerList = await headers();

  if (isPortalHostRequest(headerList)) {
    return <PortalDashboard headerList={headerList} />;
  }

  return <HomePageClient />;
}
