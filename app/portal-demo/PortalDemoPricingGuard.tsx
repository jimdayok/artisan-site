"use client";

import { LockKeyhole, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function PortalDemoPricingGuard() {
  const [notice, setNotice] = useState<"pricing" | "protected" | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const pricingLink = target?.closest("[data-demo-pricing]");
      const protectedLink = target?.closest<HTMLAnchorElement>('a[href^="/portal"]');
      if (!pricingLink && !protectedLink) return;
      event.preventDefault();
      setNotice(pricingLink ? "pricing" : "protected");
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07101c]/78 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Demonstration pricing notice">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-8 text-center text-[#172a28] shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
        <button type="button" onClick={() => setNotice(null)} aria-label="Close portal notice" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#f1eee8] text-[#59635f]">
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e2ece9] text-[#315f60]">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#8b7650]">{notice === "pricing" ? "Private customer information" : "Secure customer tool"}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">{notice === "pricing" ? "Your customer-specific pricing will be shown here." : "This tool opens inside the signed-in customer portal."}</h2>
        <p className="mt-4 text-sm leading-6 text-[#646b67]">{notice === "pricing" ? "In the real portal, each customer sees only the price sheets assigned to their securely authenticated account. This public demonstration contains no actual prices, downloads, or customer records." : "The demonstration shows where this customer-only feature appears, but it does not open a protected account workflow or load any customer information."}</p>
        <button type="button" onClick={() => setNotice(null)} className="mt-6 min-h-11 rounded-full bg-[#172a28] px-6 py-2 text-sm font-semibold text-white">Continue exploring</button>
      </div>
    </div>
  );
}
