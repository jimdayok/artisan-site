"use client";

import { Download } from "lucide-react";

export default function GeneratedPriceListExportButton({
  code,
  priceMode,
  previewAccountNumber,
}: {
  code: string;
  priceMode: "edged" | "uncut";
  previewAccountNumber?: string;
}) {
  const downloadPdf = () => {
    const params = new URLSearchParams({ code, priceMode });
    if (previewAccountNumber) params.set("account", previewAccountNumber);
    window.location.assign(`/portal/price-list/export?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={downloadPdf}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d4bd8e] bg-[#122033] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(18,32,51,0.2)] transition hover:bg-[#22364f] hover:shadow-[0_16px_34px_rgba(18,32,51,0.28)]"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Export Customer PDF
    </button>
  );
}
