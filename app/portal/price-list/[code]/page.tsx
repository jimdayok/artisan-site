import P6PriceListPage from "../P6PriceListPage";
import GeneratedInteractivePriceListPage from "../GeneratedInteractivePriceListPage";
import PdfDerivedPriceListPage from "../PdfDerivedPriceListPage";
import { getPriceListByCode, type PriceListCode } from "@/lib/portal/priceLists";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function isPriceListCode(code: string): code is PriceListCode {
  return Boolean(getPriceListByCode(code));
}

export default async function PortalPriceListCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();

  if (!isPriceListCode(normalizedCode)) {
    notFound();
  }

  if (normalizedCode === "P6") {
    return <P6PriceListPage />;
  }

  if (normalizedCode === "VD") {
    return <PdfDerivedPriceListPage code={normalizedCode} />;
  }

  return <GeneratedInteractivePriceListPage code={normalizedCode} />;
}
