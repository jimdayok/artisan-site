"use client";

import { useState, type ReactNode } from "react";
import { FileDown, LoaderCircle } from "lucide-react";

type DownloadState = "idle" | "loading" | "error";

function filenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;

  const encoded = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded.trim().replace(/^"|"$/g, ""));
    } catch {
      return encoded.trim().replace(/^"|"$/g, "");
    }
  }

  return disposition.match(/filename\s*=\s*"?([^";]+)"?/i)?.[1]?.trim() || fallback;
}

export default function PdfDownloadButton({
  href,
  children = "Download PDF",
  loadingLabel = "Preparing PDF…",
  fallbackFilename = "artisan-price-list.pdf",
  className = "",
  disabled = false,
}: {
  href: string;
  children?: ReactNode;
  loadingLabel?: string;
  fallbackFilename?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const isLoading = downloadState === "loading";

  const downloadPdf = async () => {
    if (disabled || isLoading) return;
    setDownloadState("loading");

    try {
      const response = await fetch(href, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`PDF request failed with ${response.status}`);

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      const disposition = response.headers.get("content-disposition");
      const isPdfResponse =
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream") ||
        /filename[^;]*\.pdf/i.test(disposition ?? "");
      if (!isPdfResponse) {
        throw new Error("The download response was not a PDF");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filenameFromDisposition(
        disposition,
        fallbackFilename
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
      setDownloadState("idle");
    } catch (error) {
      console.error("Unable to download PDF", error);
      setDownloadState("error");
    }
  };

  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      title={isLoading ? "Please wait while your PDF is prepared" : undefined}
      className={`${className} whitespace-nowrap disabled:cursor-wait disabled:opacity-70`}
    >
      {isLoading ? (
        <span
          className="inline-flex h-4 w-4 shrink-0 animate-spin items-center justify-center"
          aria-hidden="true"
        >
          <LoaderCircle className="h-4 w-4" />
        </span>
      ) : (
        <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span aria-live="polite">
        {isLoading
          ? loadingLabel
          : downloadState === "error"
            ? "Download failed — try again"
            : children}
      </span>
    </button>
  );
}
