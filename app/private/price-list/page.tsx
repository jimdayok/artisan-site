import PricingHeader from "../../../src/components/private-price/PricingHeader";
import PrivatePriceDashboard from "../../../src/components/private-price/PrivatePriceDashboard";

export default function PrivatePriceListPage() {
  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-8 text-[#122033] md:px-8">
      <div className="mx-auto max-w-7xl">
        <PricingHeader
          eyebrow="Premium Dashboard"
          title="2026 Price List"
          description="Search, filter, and calculate material-adjusted pricing from the 2026 Artisan Lab Network XG price list."
        />
        <div className="mt-7">
          <PrivatePriceDashboard />
        </div>
      </div>
    </main>
  );
}
