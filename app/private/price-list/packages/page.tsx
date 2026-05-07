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

const groups = [
  ["Progressive Designs", packageLensItems.filter((item) => item.type === "PAL")],
  ["SV Designs", packageLensItems.filter((item) => item.type === "SV" || item.type === "ESV")],
  ["OCP Designs", packageLensItems.filter((item) => item.type === "OCP")],
  ["Artisan Coatings", packageCoatings],
  ["Material upgrades", packageMaterials],
  ["Photochromic options", packagePhotochromics],
  ["Blue filter options", packageBlueFilters],
  ["ChemClip", packageChemClip],
  ["Edging", packageFinishing],
  ["Shipping", packageShipping],
] as const;

export default function PrivatePricePackagesPage() {
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
          <PackageQuoteBuilder />
        </div>
        <div className="mt-10 grid gap-8">
          {groups.map(([title, items]) => (
            <section key={title} className="rounded-[30px] border border-[#dfd2bf] bg-[#fbf8f3]/90 p-5 shadow-[0_20px_58px_rgba(18,32,51,0.08)] md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Package Section</p>
              <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => <PricingCard key={item.id} item={item} compact />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
