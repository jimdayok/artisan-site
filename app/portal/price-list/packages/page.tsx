import Link from "next/link";
import { getAuthorizedPortalSectionForPage } from "@/lib/portal/priceListAccess";
import { isPackagePriceListCode, isVisiblePriceListCode, priceListDisplayName } from "@/lib/pricing/priceListCodes";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import PriceListAccessMessage from "../PriceListAccessMessage";
import GeneratedInteractivePriceListPage from "../GeneratedInteractivePriceListPage";
import PackageQuoteBuilder from "../../../../src/components/private-price/PackageQuoteBuilder";
import PricingCard from "../../../../src/components/private-price/PricingCard";
import PricingHeader from "../../../../src/components/private-price/PricingHeader";
import {
  packageBlueFilters,
  packageChemClip,
  packageCoatings,
  packageFinishing,
  packageLensItems,
  packageMaterials,
  packageMeta,
  packagePhotochromics,
  packageShipping,
} from "../../../../src/data/packagePriceList";
import { lensGroupForItem } from "../../../../src/data/privatePriceList";

const groups = [
  ["Progressive Designs", packageLensItems.filter((item) => item.type === "PAL")],
  ["SV Designs", packageLensItems.filter((item) => item.type === "SV" || item.type === "ESV")],
  ["Occupational Designs", packageLensItems.filter((item) => lensGroupForItem(item) === "Occupational Lenses")],
  ["Artisan Coatings", packageCoatings],
  ["Material upgrades", packageMaterials],
  ["Blue filter options", packageBlueFilters],
  ["Photochromic options", packagePhotochromics],
  ["Polarized options", packageFinishing.filter((item) => item.category === "Polarized Options")],
  ["Provisics mirror coatings", packageFinishing.filter((item) => item.category === "Provisics Mirror Coatings")],
  ["ChemClip", packageChemClip],
  ["Edging", packageFinishing.filter((item) => item.category !== "Polarized Options" && item.category !== "Provisics Mirror Coatings")],
  ["Shipping", packageShipping],
] as const;

const packageProductMap: Record<string, string> = {
  "iot-camber-steady-pure": "pkg-camber-steady-pure",
  "iot-camber-steady-plus": "pkg-camber-steady-plus",
  "iot-endless-steady": "pkg-endless-steady",
  "iot-essential-steady": "pkg-essential-steady",
  "artisan-cfb": "pkg-cfb",
  "iot-endless-plus": "pkg-endless-plus",
  "iot-endless-sv": "pkg-endless-sv",
  "iot-endless-office": "pkg-endless-office",
};

export default async function PrivatePricePackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; code?: string }>;
}) {
  const access = await getAuthorizedPortalSectionForPage("packages");

  if (access.status === "unauthenticated") {
    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (access.status !== "authorized") {
    return (
      <PriceListAccessMessage message="You do not have access to this price list." />
    );
  }

  const params = await searchParams;
  const assignedPackageCodes = access.customer.priceLists
    .map(canonicalPriceListCode)
    .filter(isPackagePriceListCode)
    .filter((code, index, values) => values.indexOf(code) === index)
    .sort((a, b) => a.localeCompare(b));
  const visibleAssignedPackageCodes = assignedPackageCodes.filter(isVisiblePriceListCode);
  const requestedCode = params.code ? canonicalPriceListCode(params.code) : "";
  const selectedCode = requestedCode || assignedPackageCodes[0] || "";

  if (!selectedCode || !assignedPackageCodes.includes(selectedCode)) {
    return (
      <PriceListAccessMessage message="No package price list is assigned to this account." />
    );
  }

  if (selectedCode !== "B5") {
    return <GeneratedInteractivePriceListPage code={selectedCode} />;
  }

  const initialLensId = params.product ? packageProductMap[params.product] : undefined;

  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-8 text-[#122033] md:px-8">
      <div className="mx-auto max-w-7xl">
        {visibleAssignedPackageCodes.length > 1 ? (
          <nav aria-label="Assigned package price lists" className="mb-5 flex flex-wrap gap-2">
            {visibleAssignedPackageCodes.map((code) => (
              <Link
                key={code}
                href={`/portal/price-list/packages?code=${encodeURIComponent(code)}`}
                className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold ${
                  code === selectedCode
                    ? "border-[#172a28] bg-[#172a28] text-white"
                    : "border-[#d7c5a8] bg-white text-[#172a28] hover:bg-[#f8f1e6]"
                }`}
              >
                {priceListDisplayName(code)}
              </Link>
            ))}
          </nav>
        ) : null}
        <PricingHeader
          eyebrow="Package Pricing"
          title={packageMeta.title}
          description="IOT Lens System package pricing from the B5 edged price list, with package inclusions, upgrades, and a dedicated package calculator."
        />
        <section className="mt-7 rounded-[30px] border border-[#dfd2bf] bg-white/90 p-5 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-7">
          <div className="grid gap-4 md:grid-cols-3">
            {packageMeta.notes.map((note) => (
              <div key={note} className="rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-4 text-sm font-semibold leading-6 text-[#122033]">
                {note}
              </div>
            ))}
          </div>
        </section>
        <div className="mt-7">
          <PackageQuoteBuilder initialLensId={initialLensId} />
        </div>
        <div className="mt-10 grid gap-8">
          {groups.map(([title, items]) => (
            <section key={title} className="rounded-[30px] border border-[#dfd2bf] bg-[#fbf8f3]/90 p-5 shadow-[0_20px_58px_rgba(18,32,51,0.08)] md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Package Section</p>
              <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => <PricingCard key={item.id} item={item} compact />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
