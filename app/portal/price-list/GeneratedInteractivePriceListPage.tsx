import p6PricingData from "@/private-source/pricing/generated/p6-pricing.json";
import g6PricingData from "@/private-source/pricing/generated/g6-pricing.json";
import a6PricingData from "@/private-source/pricing/generated/a6-pricing.json";
import b5PricingData from "@/private-source/pricing/generated/b5-pricing.json";
import s5PricingData from "@/private-source/pricing/generated/s5-pricing.json";
import m5PricingData from "@/private-source/pricing/generated/m5-pricing.json";
import y5PricingData from "@/private-source/pricing/generated/y5-pricing.json";
import tkPricingData from "@/private-source/pricing/generated/tk-pricing.json";
import InteractivePriceListDashboard from "@/src/components/private-price/InteractivePriceListDashboard";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import { isLocalhostDevelopmentRequest } from "@/lib/portal/auth";
import type { GeneratedPriceListData } from "@/lib/pricing/types";
import type { PriceListCode } from "@/lib/portal/priceLists";
import { headers } from "next/headers";
import { OnlinePriceListShell } from "./OnlinePriceListShell";
import PriceListAccessMessage from "./PriceListAccessMessage";

const generatedPriceDataByCode: Record<PriceListCode, GeneratedPriceListData | null> = {
  P6: p6PricingData as GeneratedPriceListData,
  G6: g6PricingData as GeneratedPriceListData,
  A6: a6PricingData as GeneratedPriceListData,
  B5: b5PricingData as GeneratedPriceListData,
  S5: s5PricingData as GeneratedPriceListData,
  VD: null,
  M5: m5PricingData as GeneratedPriceListData,
  Y5: y5PricingData as GeneratedPriceListData,
  TK: tkPricingData as GeneratedPriceListData,
};

const customerTitleByCode: Record<PriceListCode, string> = {
  P6: "Artisan Equity Partner Pricing",
  G6: "Artisan General Pricing",
  A6: "Artisan PMP Partner Pricing",
  B5: "Artisan Lens System Pricing",
  S5: "Shamir Lens System Pricing",
  M5: "Artisan Frame System Pricing",
  Y5: "Artisan Safety System Pricing",
  TK: "Tokai Pricing",
  VD: "VD Price Sheet",
};

export default async function GeneratedInteractivePriceListPage({
  code,
}: {
  code: PriceListCode;
}) {
  const requestHeaders = await headers();
  const isLocalhostDevelopment = isLocalhostDevelopmentRequest(requestHeaders);
  const access = await getAuthorizedPriceListForPage(code);

  if (access.status === "unauthenticated") {
    if (isLocalhostDevelopment) {
      return (
        <div className="space-y-6">
          <PriceListAccessMessage message="Unable to verify your secure login. Choose a localhost test account to continue." />
          <LocalhostAccessActions code={code} />
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
          <PriceListAccessMessage message={`This local test login does not include ${code}. Choose an assigned account to continue.`} />
          <LocalhostAccessActions code={code} />
        </div>
      );
    }

    return (
      <PriceListAccessMessage message="You do not have access to this price list." />
    );
  }

  const generatedPriceList = generatedPriceDataByCode[code];
  if (!generatedPriceList) {
    return (
      <PriceListAccessMessage message={`${code} interactive pricing data is not available yet.`} />
    );
  }

  return (
    <OnlinePriceListShell
      priceList={access.priceList}
      title={customerTitleByCode[code]}
      description="Interactive private pricing guide for assigned portal accounts."
    >
      <InteractivePriceListDashboard priceList={generatedPriceList} />
    </OnlinePriceListShell>
  );
}

function LocalhostAccessActions({ code }: { code: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl border border-[#d8c49b] bg-[#fffaf1]/88 p-6 text-[#172a28] shadow-[0_14px_42px_rgba(23,42,40,0.1)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
        Local Development
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
        Switch Local Test Account
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#6a6257]">
        Use the portal account picker to select an account with access to {code}, then return to this page.
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
