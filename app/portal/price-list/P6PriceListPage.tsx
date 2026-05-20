import p6PricingData from "@/private-source/pricing/generated/p6-pricing.json";
import InteractivePriceListDashboard from "@/src/components/private-price/InteractivePriceListDashboard";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import { isLocalhostDevelopmentRequest } from "@/lib/portal/auth";
import type { GeneratedPriceListData } from "@/lib/pricing/types";
import { headers } from "next/headers";
import { OnlinePriceListShell } from "./OnlinePriceListShell";
import PriceListAccessMessage from "./PriceListAccessMessage";

export default async function P6PriceListPage() {
  const requestHeaders = await headers();
  const isLocalhostDevelopment = isLocalhostDevelopmentRequest(requestHeaders);
  const access = await getAuthorizedPriceListForPage("P6");

  if (access.status === "unauthenticated") {
    if (isLocalhostDevelopment) {
      return (
        <div className="space-y-6">
          <PriceListAccessMessage message="Unable to verify your secure login. Choose a localhost test account to continue." />
          <LocalhostP6AccessActions />
        </div>
      );
    }

    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (access.status !== "authorized") {
    if (isLocalhostDevelopment) {
      return (
        <div className="space-y-6">
          <PriceListAccessMessage message="This local test login does not include P6. Choose a P6-assigned account to continue." />
          <LocalhostP6AccessActions />
        </div>
      );
    }

    return (
      <PriceListAccessMessage message="You do not have access to this price list." />
    );
  }

  return (
    <OnlinePriceListShell
      priceList={access.priceList}
      title="Artisan Equity Partner Pricing"
      description="Interactive private pricing guide for assigned Artisan Equity Partner accounts."
    >
      <InteractivePriceListDashboard
        priceList={p6PricingData as GeneratedPriceListData}
      />
    </OnlinePriceListShell>
  );
}

function LocalhostP6AccessActions() {
  return (
    <div className="mx-auto w-full max-w-5xl border border-[#d8c49b] bg-[#fffaf1]/88 p-6 text-[#172a28] shadow-[0_14px_42px_rgba(23,42,40,0.1)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
        Local Development
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
        Switch Local Test Account
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#6a6257]">
        Use the portal account picker to select a P6-enabled email, then return
        to this page.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="/portal"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#172a28] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#27433f]"
        >
          Open local account picker
        </a>
        <a
          href="/portal/local-test-login"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c49b] bg-white px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-[#f4ebe0]"
        >
          Clear local test login
        </a>
      </div>
    </div>
  );
}
