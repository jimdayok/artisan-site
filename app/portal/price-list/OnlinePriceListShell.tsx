import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import PricingHeader from "../../../src/components/private-price/PricingHeader";
import type { PortalPriceList } from "@/lib/portal/priceLists";
import PortalPriceListScrollReset from "./PortalPriceListScrollReset";

export async function OnlinePriceListShell({
  priceList,
  accountPriceListCodes = [],
  previewAccountNumber,
  children,
  title,
  description,
}: {
  priceList: PortalPriceList;
  accountPriceListCodes?: string[];
  previewAccountNumber?: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const requestHeaders = await headers();
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(requestHeaders);
  const isAdmin = Boolean(authenticatedEmail && isPortalAdminEmail(authenticatedEmail));

  return (
    <main className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#f4eee4] px-3 py-5 text-[#122033] md:px-6">
      <PortalPriceListScrollReset />
      <div className="mx-auto w-full max-w-[1680px]">
        <CompactPortalHeader isAdmin={isAdmin} />
        <PricingHeader
          eyebrow="Private Online Pricing"
          title={title ?? `${priceList.code} Online Pricing`}
          description={description ?? "Account-assigned pricing tools are available only through secure portal access."}
          showNavigation={priceList.code === "G6"}
        />
        {accountPriceListCodes.length > 1 ? (
          <section className="mt-4 rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/92 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a7654]">
              Available Price Lists
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {accountPriceListCodes.map((code) => (
                <Link
                  key={code}
                  href={
                    previewAccountNumber
                      ? `/portal/price-list/${code.toLowerCase()}?account=${encodeURIComponent(previewAccountNumber)}`
                      : `/portal/price-list/${code.toLowerCase()}`
                  }
                  className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold transition ${
                    code === priceList.code
                      ? "border-[#122033] bg-[#122033] text-white"
                      : "border-[#d7c5a8] bg-white/85 text-[#122033] hover:bg-white"
                  }`}
                >
                  {code} Pricing
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <div className="mt-7">{children}</div>
        <CompactPortalFooter />
      </div>
    </main>
  );
}

const PORTAL_ACCESS_LOGOUT_URL = "/cdn-cgi/access/logout?returnTo=/portal";

function CompactPortalHeader({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="mb-4 rounded-[2px] border border-[#dfd2bf] bg-[#fbf7ef]/92 px-4 py-3 shadow-[0_12px_28px_rgba(18,32,51,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ccb48a] bg-[#122033] shadow-[0_10px_22px_rgba(18,32,51,0.24)]">
            <Image
              src="/aln-icon.png"
              alt="Artisan Lab Network ring logo"
              width={22}
              height={22}
              className="h-[22px] w-[22px] object-contain"
            />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
              Artisan Lab Network
            </p>
            <p className="text-sm font-semibold text-[#122033]">Customer Portal</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal"
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white/85 px-3 text-xs font-semibold text-[#122033] transition hover:bg-white"
          >
            Back to Portal
          </Link>
          {isAdmin ? (
            <Link
              href="/portal/admin"
              className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white/85 px-3 text-xs font-semibold text-[#122033] transition hover:bg-white"
            >
              Admin Dashboard
            </Link>
          ) : null}
          <Link
            href="/provider-resources"
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white/85 px-3 text-xs font-semibold text-[#122033] transition hover:bg-white"
          >
            Provider Resources
          </Link>
          <a
            href={PORTAL_ACCESS_LOGOUT_URL}
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white/85 px-3 text-xs font-semibold text-[#122033] transition hover:bg-white"
          >
            Sign Out
          </a>
        </nav>
      </div>
    </header>
  );
}

function CompactPortalFooter() {
  const links = [
    { label: "Provider Resources", href: "/provider-resources" },
    { label: "Policies", href: "/lab-policies" },
    { label: "Contact Support", href: "mailto:sales@artisanlabnetwork.com" },
    { label: "ArtisanLabNetwork.com", href: "/" },
  ];

  return (
    <footer className="mt-8 border-t border-[#d8c49b] py-7">
      <div className="flex flex-col gap-4 text-sm text-[#706759] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold text-[#172a28]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ccb48a] bg-[#122033] shadow-[0_8px_18px_rgba(18,32,51,0.24)]">
              <Image src="/aln-icon.png" alt="Artisan ring icon" width={17} height={17} className="h-[17px] w-[17px] object-contain" />
            </span>
            Artisan Lab Network
          </p>
          <p className="mt-2 text-xs">
            © 2026 Artisan Lab Network · This webpage was built and designed by{" "}
            <a
              href="https://d2dmktg.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#8b7650] transition hover:text-[#172a28]"
            >
              D2D Marketing
            </a>
            .
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) =>
            link.href.startsWith("mailto:") ? (
              <a key={link.label} href={link.href} className="transition hover:text-[#172a28]">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="transition hover:text-[#172a28]">
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}

export function PendingOnlinePriceList({ priceList }: { priceList: PortalPriceList }) {
  return (
    <OnlinePriceListShell priceList={priceList}>
      <section className="grid gap-6 rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/92 p-6 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Source of truth
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            {priceList.label}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#4d5664]">
            This price list is being migrated to interactive portal pricing.
            Use the online pricing experience when available for your assigned
            account.
          </p>
        </div>
        <div className="rounded-[2px] border border-[#d7c5a8] bg-white/82 p-5">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">
            Online pricing table in progress
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#4d5664]">
            Interactive pricing data is not published for this code yet. No
            pricing is shown until validated source data is ready.
          </p>
          {priceList.r2Key ? (
            <a
              href={`/api/portal/download?code=${encodeURIComponent(priceList.code)}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#122033] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#25364a]"
            >
              Download {priceList.code} PDF
            </a>
          ) : null}
          <Link
            href="/portal"
            className="ml-0 mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7c5a8] bg-white px-5 py-2 text-sm font-semibold text-[#122033] transition hover:bg-[#fbf8f3] sm:ml-3"
          >
            Back to portal
          </Link>
        </div>
      </section>
    </OnlinePriceListShell>
  );
}
