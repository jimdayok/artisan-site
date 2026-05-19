import p6PricingData from "@/private-source/pricing/generated/p6-pricing.json";
import InteractivePriceListDashboard from "@/src/components/private-price/InteractivePriceListDashboard";
import PdfDerivedPriceDashboard from "@/src/components/private-price/PdfDerivedPriceDashboard";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import type { GeneratedPriceListData } from "@/lib/pricing/types";
import { getPdfDerivedPriceList } from "@/src/data/pdfDerivedPriceLists";
import { OnlinePriceListShell } from "./OnlinePriceListShell";
import PriceListAccessMessage from "./PriceListAccessMessage";

export default async function P6PriceListPage() {
  const access = await getAuthorizedPriceListForPage("P6");

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

  const pdfDerivedPriceList = getPdfDerivedPriceList("P6");

  return (
    <OnlinePriceListShell priceList={access.priceList}>
      <InteractivePriceListDashboard
        priceList={p6PricingData as GeneratedPriceListData}
      />
      {pdfDerivedPriceList ? (
        <div className="mt-8">
          <PdfDerivedPriceDashboard priceList={pdfDerivedPriceList} />
        </div>
      ) : null}
    </OnlinePriceListShell>
  );
}
