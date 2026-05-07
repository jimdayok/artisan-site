import PasswordGate from "../PasswordGate";

export default async function PrivatePriceListAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/private/price-list") && !params.next.startsWith("/private/price-list/access")
    ? params.next
    : "/private/price-list";

  return <PasswordGate error={params.error === "1"} nextPath={nextPath} />;
}
