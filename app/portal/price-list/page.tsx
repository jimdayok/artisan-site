import { redirect } from "next/navigation";
import { getAuthorizedPortalSectionForPage } from "@/lib/portal/priceListAccess";

export default async function PortalPriceListPage({
  searchParams,
}: {
  searchParams: Promise<{ coating?: string }>;
}) {
  const params = await searchParams;
  const coatingQuery = params.coating
    ? `?coating=${encodeURIComponent(params.coating)}`
    : "";
  const access = await getAuthorizedPortalSectionForPage("pricing");
  const code =
    access.status === "authorized"
      ? access.customer.priceLists[0]?.toLowerCase()
      : "";

  redirect(code ? `/portal/price-list/${code}${coatingQuery}` : "/portal");
}
