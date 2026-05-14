import { redirect } from "next/navigation";

export default async function PortalPriceListPage({
  searchParams,
}: {
  searchParams: Promise<{ coating?: string }>;
}) {
  const params = await searchParams;
  const coatingQuery = params.coating
    ? `?coating=${encodeURIComponent(params.coating)}`
    : "";

  redirect(`/portal/price-list/g6${coatingQuery}`);
}
