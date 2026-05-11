"use client";

import type { ReactNode } from "react";

export default function PricingPortalLayout({
  filterRail,
  categoryNav,
  children,
  quoteRail,
  mobileQuoteBar,
}: {
  filterRail: ReactNode;
  categoryNav: ReactNode;
  children: ReactNode;
  quoteRail: ReactNode;
  mobileQuoteBar: ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-6 -z-10 h-56 bg-[radial-gradient(circle_at_20%_20%,rgba(199,173,123,0.22),transparent_32%),radial-gradient(circle_at_80%_5%,rgba(18,32,51,0.08),transparent_28%)]" />
      <div className="mt-4">{categoryNav}</div>
      <div className="mt-5 grid min-w-0 gap-4 min-[1700px]:grid-cols-[250px_minmax(0,1fr)_280px] min-[1700px]:items-start">
        <div className="hidden min-w-0 min-[1700px]:block">{filterRail}</div>
        <main className="min-w-0 max-w-full">{children}</main>
        <div className="hidden min-w-0 min-[1700px]:block">{quoteRail}</div>
      </div>
      <div className="min-[1700px]:hidden">{mobileQuoteBar}</div>
    </div>
  );
}
