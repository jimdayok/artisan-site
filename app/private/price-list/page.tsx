import PricingHeader from "../../../src/components/private-price/PricingHeader";
import PrivatePriceDashboard from "../../../src/components/private-price/PrivatePriceDashboard";

export default async function PrivatePriceListPage({
  searchParams,
}: {
  searchParams: Promise<{ coating?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4eee4] px-3 py-5 text-[#122033] md:px-6">
      <div className="mx-auto w-full max-w-[1680px]">
        <PricingHeader
          eyebrow="Premium Pricing Portal"
          title="2026 Price List"
          description="Compact search, filters, live material pricing, AR compatibility, package availability, MSRP guidance, and PDF exports."
        />
        <div className="mt-7">
          <PrivatePriceDashboard initialCoatingId={params.coating} />
        </div>
      </div>
    </main>
  );
}
