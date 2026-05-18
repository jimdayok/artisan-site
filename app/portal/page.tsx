import { headers } from "next/headers";
import PortalDashboard from "./PortalDashboard";

export const dynamic = "force-dynamic";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const headerList = await headers();
  const query = await searchParams;

  return (
    <PortalDashboard
      headerList={headerList}
      selectedAccountNumber={query.account}
    />
  );
}
