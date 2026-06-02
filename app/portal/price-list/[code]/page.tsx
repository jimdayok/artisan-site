import P6PriceListPage from "../P6PriceListPage";
import GeneratedInteractivePriceListPage from "../GeneratedInteractivePriceListPage";
import { canonicalPriceListCode, getPriceListByCode, type PriceListCode } from "@/lib/portal/priceLists";
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
  searchParams?: Promise<{ account?: string }>;
}) {
  const { code } = await params;
  const query = (await searchParams) ?? {};
  const normalizedCode = canonicalPriceListCode(code);

  if (!isPriceListCode(normalizedCode)) {
    notFound();
  }

  if (normalizedCode === "P6") {
    return <P6PriceListPage previewAccountNumber={query.account} />;
  }

  return <GeneratedInteractivePriceListPage code={normalizedCode} previewAccountNumber={query.account} />;
}
