import InteractivePriceListDashboard from "@/src/components/private-price/InteractivePriceListDashboard";
import { isLocalhostDevelopmentRequest } from "@/lib/portal/auth";
import { getAuthorizedRuntimePriceListFromHeaders } from "@/lib/portal/priceListRuntimeAccess";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { loadRuntimePackagedPriceListByCode } from "@/lib/pricing/loadRuntimePackagedPriceList";
import { isVisiblePriceListCode, priceListDisplayName } from "@/lib/pricing/priceListCodes";
import { customerFacingPriceList } from "@/lib/pricing/customerPriceList";
import { getPortalDashboardV1ByAccount } from "@/lib/portal/dashboardV1";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { OnlinePriceListShell } from "./OnlinePriceListShell";
import PriceListAccessMessage from "./PriceListAccessMessage";
import ValueSystemRequirements from "./ValueSystemRequirements";

function requestOriginFromHeaders(headerList: Headers) {
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerList.get("host")?.split(",")[0]?.trim() ||
    "";
  if (!host) return undefined;

  const proto =
    headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${host}`;
}

export default async function GeneratedInteractivePriceListPage({
  code,
  previewAccountNumber,
}: {
  code: string;
  previewAccountNumber?: string;
}) {
  const normalizedCode = canonicalPriceListCode(code);
  const requestHeaders = await headers();
  const requestOrigin = requestOriginFromHeaders(requestHeaders);
  const isLocalhostDevelopment = isLocalhostDevelopmentRequest(requestHeaders);
  const access = await getAuthorizedRuntimePriceListFromHeaders(
    requestHeaders,
    normalizedCode,
    previewAccountNumber ? { previewAccountNumber } : undefined
  );

  if (access.status === "unauthenticated") {
    if (isLocalhostDevelopment) {
      return (
        <div className="space-y-6">
          <PriceListAccessMessage message="Unable to verify your secure login. Choose a localhost test account to continue." />
          <LocalhostAccessActions code={normalizedCode} />
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
          <PriceListAccessMessage message={`This local test login does not include ${normalizedCode}. Choose an assigned account to continue.`} />
          <LocalhostAccessActions code={normalizedCode} />
        </div>
      );
    }
    forbidden();
  }

  if (!requestOrigin) {
    return (
      <PriceListAccessMessage message="Unable to resolve the pricing asset origin for this request." />
    );
  }

  const generatedPriceList = await loadRuntimePackagedPriceListByCode(
    normalizedCode,
    requestOrigin
  );
  if (!generatedPriceList) {
    const message = isPortalAdminEmail(access.authenticatedEmail)
      ? `${normalizedCode} is assigned or registered, but no generated pricing rows are available. Check the price-list validation report.`
      : "Pricing for this assigned list is temporarily unavailable. Please contact Artisan Lab Network support.";
    return (
      <PriceListAccessMessage message={message} />
    );
  }
  const customerPriceList = customerFacingPriceList(generatedPriceList);
  const comparisonPriceList =
    normalizedCode === "B5"
      ? await loadRuntimePackagedPriceListByCode("G6", requestOrigin)
      : null;

  const accountPriceListCodes = access.customer.priceLists
    .map((entry) => canonicalPriceListCode(entry))
    .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
    .filter(isVisiblePriceListCode)
    .sort((a, b) => a.localeCompare(b));
  const dashboardState = getPortalDashboardV1ByAccount(access.customer.accountNumber);
  const accountNumberCount =
    dashboardState.account?.all_account_numbers
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean).length ?? 0;

  return (
      <OnlinePriceListShell
      priceList={access.priceList}
      accountPriceListCodes={accountPriceListCodes}
      previewAccountNumber={previewAccountNumber}
      title={priceListDisplayName(normalizedCode)}
      description="Interactive private pricing guide for assigned portal accounts."
    >
      <div className="grid gap-6">
        {normalizedCode === "VD" ? <ValueSystemRequirements /> : null}
        <InteractivePriceListDashboard
          priceList={customerPriceList}
          comparisonPriceList={comparisonPriceList}
          previewAccountNumber={previewAccountNumber}
          showAccountDrillDownNotice={accountNumberCount > 1}
        />
      </div>
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
