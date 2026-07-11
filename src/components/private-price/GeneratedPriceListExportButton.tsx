"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { artisanControlClass } from "../../../app/components/controlStyles";

export default function GeneratedPriceListExportButton({
  code,
  priceMode,
  previewAccountNumber,
}: {
  code: string;
  priceMode: "edged" | "uncut";
  previewAccountNumber?: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadPdf = () => {
    if (isExporting) return;
    setIsExporting(true);
    const params = new URLSearchParams({ code, priceMode });
    if (previewAccountNumber) params.set("account", previewAccountNumber);
    window.location.assign(`/portal/price-list/export?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={isExporting}
      className={artisanControlClass({ tone: "primary" })}
    >
      {isExporting ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      {isExporting ? "Exporting PDF" : "Export Customer PDF"}
    </button>
  );
}
