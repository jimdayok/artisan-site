import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import { customerHasPortalSection } from "@/lib/portal/customers";
import PriceListAccessMessage from "../PriceListAccessMessage";
import PricingHeader from "../../../../src/components/private-price/PricingHeader";
import QuoteBuilder from "../../../../src/components/private-price/QuoteBuilder";
import { getPortalDashboardV1ByAccount } from "@/lib/portal/dashboardV1";

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

  const dashboardState = getPortalDashboardV1ByAccount(access.customer.accountNumber);
  const accountNumberCount = dashboardState.account?.all_account_numbers
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean).length ?? 0;

  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-8 text-[#122033] md:px-8">
      <div className="mx-auto max-w-7xl">
        {accountNumberCount > 1 ? (
          <p className="mb-4 rounded-2xl border border-[#cfb88d] bg-[#fff8e8] px-4 py-3 text-sm font-semibold text-[#6f5422]">
            Coming Soon: Drill Down by Account
          </p>
        ) : null}
        <PricingHeader
          eyebrow="Price Quote Builder"
          title="Create a Lab Price Estimate"
          description="Choose a lens design, material, coating, finishing, and shipping path to create an estimated lab price."
        />
        <div className="mt-7">
          <QuoteBuilder />
        </div>
      </div>
    </main>
  );
}
