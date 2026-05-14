import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import PriceListAccessMessage from "../PriceListAccessMessage";
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
  searchParams: Promise<{ product?: string }>;
}) {
  const access = await getAuthorizedPriceListForPage("B5");

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
  const initialLensId = params.product ? packageProductMap[params.product] : undefined;

  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-8 text-[#122033] md:px-8">
      <div className="mx-auto max-w-7xl">
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
