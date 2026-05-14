import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import { customerHasPortalSection } from "@/lib/portal/customers";
import PriceListAccessMessage from "../PriceListAccessMessage";
import PricingHeader from "../../../../src/components/private-price/PricingHeader";
import QuoteBuilder from "../../../../src/components/private-price/QuoteBuilder";

export default async function PrivatePriceCalculatorPage() {
  const access = await getAuthorizedPriceListForPage("G6");

  if (access.status === "unauthenticated") {
    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (
    access.status !== "authorized" ||
    !customerHasPortalSection(access.customer, "calculator")
  ) {
    return (
      <PriceListAccessMessage message="You do not have access to this price list." />
    );
  }

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
