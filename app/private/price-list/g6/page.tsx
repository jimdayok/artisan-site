import PrivatePriceDashboard from "../../../../src/components/private-price/PrivatePriceDashboard";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import PriceListAccessMessage from "../PriceListAccessMessage";
import { OnlinePriceListShell } from "../OnlinePriceListShell";

export default async function PrivatePriceListG6Page({
  searchParams,
}: {
  searchParams: Promise<{ coating?: string }>;
}) {
  const access = await getAuthorizedPriceListForPage("G6");

  if (access.status === "unauthenticated") {
    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (access.status !== "authorized") {
    return (
      <PriceListAccessMessage message="You do not have access to this price list." />
    );
  }

  const params = await searchParams;

  return (
    <OnlinePriceListShell priceList={access.priceList}>
      <PrivatePriceDashboard initialCoatingId={params.coating} />
    </OnlinePriceListShell>
  );
}
