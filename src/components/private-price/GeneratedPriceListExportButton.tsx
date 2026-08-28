import { artisanControlClass } from "../../../app/components/controlStyles";
import PdfDownloadButton from "./PdfDownloadButton";

export default function GeneratedPriceListExportButton({
  code,
  priceMode,
  previewAccountNumber,
}: {
  code: string;
  priceMode: "edged" | "uncut";
  previewAccountNumber?: string;
}) {
  const params = new URLSearchParams({ code, priceMode });
  if (previewAccountNumber) params.set("account", previewAccountNumber);

  return (
    <PdfDownloadButton
      href={`/portal/price-list/export?${params.toString()}`}
      fallbackFilename={`artisan-${code.toLowerCase()}-price-list.pdf`}
      className={artisanControlClass({ tone: "primary" })}
    >
      Export Customer PDF
    </PdfDownloadButton>
  );
}
