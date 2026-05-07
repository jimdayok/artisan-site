import PricingHeader from "../../../../src/components/private-price/PricingHeader";
import QuoteBuilder from "../../../../src/components/private-price/QuoteBuilder";

export default function PrivatePriceCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-8 text-[#122033] md:px-8">
      <div className="mx-auto max-w-7xl">
        <PricingHeader
          eyebrow="Quote Builder"
          title="Build a Lab Price Estimate"
          description="Choose a lens design, material, coating, finishing, and shipping path to calculate an estimated lab price."
        />
        <div className="mt-7">
          <QuoteBuilder />
        </div>
      </div>
    </main>
  );
}
