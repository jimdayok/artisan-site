import PdfDerivedPriceDashboard from "../../../src/components/private-price/PdfDerivedPriceDashboard";
import { getPdfDerivedPriceList } from "../../../src/data/pdfDerivedPriceLists";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import type { PriceListCode } from "@/lib/portal/priceLists";
import { OnlinePriceListShell, PendingOnlinePriceList } from "./OnlinePriceListShell";
import PriceListAccessMessage from "./PriceListAccessMessage";

export default async function PdfDerivedPriceListPage({
  code,
}: {
  code: PriceListCode;
}) {
  const access = await getAuthorizedPriceListForPage(code);

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

  const pdfDerivedPriceList = getPdfDerivedPriceList(code);

  if (!pdfDerivedPriceList) {
    return <PendingOnlinePriceList priceList={access.priceList} />;
  }

  return (
    <OnlinePriceListShell priceList={access.priceList}>
      <PdfDerivedPriceDashboard priceList={pdfDerivedPriceList} />
    </OnlinePriceListShell>
  );
}
