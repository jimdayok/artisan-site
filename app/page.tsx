import { headers } from "next/headers";
import PortalDashboard from "./portal/PortalDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const headerList = await headers();

  return <PortalDashboard headerList={headerList} />;
}
