import { headers } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { getAuthorizedPriceListFromHeaders } from "@/lib/portal/priceListAccess";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import { OnlinePriceListShell } from "./OnlinePriceListShell";
import PriceListAccessMessage from "./PriceListAccessMessage";
import ValueSystemRequirements from "./ValueSystemRequirements";
import PdfDownloadButton from "@/src/components/private-price/PdfDownloadButton";

export default async function ValueSystemPriceListPage({
  previewAccountNumber,
}: {
  previewAccountNumber?: string;
}) {
  const access = await getAuthorizedPriceListFromHeaders(await headers(), "VD", {
    previewAccountNumber,
  });

  if (access.status === "unauthenticated") {
    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (access.status !== "authorized") {
    return <PriceListAccessMessage message="You do not have access to the VD price list." />;
  }

  const downloadHref = `/api/portal/download?code=VD`;

  return (
    <OnlinePriceListShell
      priceList={access.priceList}
      accountPriceListCodes={normalizeAssignedPriceListCodes(access.customer.priceLists)}
      previewAccountNumber={previewAccountNumber}
      title="2025 Artisan Value System Pricing"
      description="Price list code VD · edged and assembled program pricing"
    >
      <div className="grid gap-6">
        <ValueSystemRequirements />

        <section className="rounded-md border border-[#dfd2bf] bg-white p-5 shadow-[0_20px_55px_rgba(18,32,51,0.08)] sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#24543a]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Source document
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                Download the complete VD price list
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f6672]">
                The PDF contains the qualifying lens designs, included options, eligible add-ons,
                finishing charges, shipping charges, and the same required ordering directions shown above.
              </p>
            </div>
            <PdfDownloadButton
              href={downloadHref}
              fallbackFilename="artisan-vd-price-list.pdf"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#122033] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#25364a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#122033]"
            >
              Download VD PDF
            </PdfDownloadButton>
          </div>
        </section>
      </div>
    </OnlinePriceListShell>
  );
}
