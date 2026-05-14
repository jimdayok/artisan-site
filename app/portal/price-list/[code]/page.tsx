import PrivatePriceDashboard from "@/src/components/private-price/PrivatePriceDashboard";
import PdfDerivedPriceListPage from "../../../private/price-list/PdfDerivedPriceListPage";
import PriceListAccessMessage from "../../../private/price-list/PriceListAccessMessage";
import { OnlinePriceListShell } from "../../../private/price-list/OnlinePriceListShell";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import { getPriceListByCode, type PriceListCode } from "@/lib/portal/priceLists";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function isPriceListCode(code: string): code is PriceListCode {
  return Boolean(getPriceListByCode(code));
}

export default async function PortalPriceListCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ coating?: string }>;
}) {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();

  if (!isPriceListCode(normalizedCode)) {
    notFound();
  }

  if (normalizedCode !== "G6") {
    return <PdfDerivedPriceListPage code={normalizedCode} />;
  }

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

  const query = await searchParams;

  return (
    <OnlinePriceListShell priceList={access.priceList}>
      <PrivatePriceDashboard initialCoatingId={query.coating} />
    </OnlinePriceListShell>
  );
}
