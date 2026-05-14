import { redirect } from "next/navigation";

export default async function PrivatePriceListPage({
  searchParams,
}: {
  searchParams: Promise<{ coating?: string }>;
}) {
  const params = await searchParams;
  const coatingQuery = params.coating
    ? `?coating=${encodeURIComponent(params.coating)}`
    : "";

  redirect(`/private/price-list/g6${coatingQuery}`);
}
