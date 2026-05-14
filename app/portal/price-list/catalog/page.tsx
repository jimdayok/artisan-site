import Image from "next/image";
import { getAuthorizedPriceListForPage } from "@/lib/portal/priceListAccess";
import PriceListAccessMessage from "../PriceListAccessMessage";
import PricingCard from "../../../../src/components/private-price/PricingCard";
import PricingHeader from "../../../../src/components/private-price/PricingHeader";
import { catalogBrands, logoByBrand, priceItems, type PriceBrand } from "../../../../src/data/privatePriceList";

const catalogSections: { label: PriceBrand; aliases?: PriceBrand[] }[] = [
  { label: "Artisan" },
  { label: "IOT" },
  { label: "Tokai" },
  { label: "Sequel by Newton" },
  { label: "Unity" },
  { label: "Varilux" },
  { label: "Hoya" },
  { label: "Shamir" },
  { label: "TechShield" },
  { label: "Artisan Coatings" },
  { label: "Tokai AR" },
  { label: "Crizal" },
  { label: "Hoya AR" },
  { label: "Shamir AR" },
  { label: "ChemClip" },
];

function BrandMark({ brand }: { brand: PriceBrand }) {
  const logo = logoByBrand[brand];

  return (
    <div className="flex h-20 w-44 items-center justify-center rounded-2xl border border-[#dfd2bf] bg-white px-5">
      {logo ? (
        <Image src={logo} alt={`${brand} logo`} width={220} height={90} className="max-h-12 w-auto max-w-full object-contain" />
      ) : (
        <span className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#8a7654]">{brand}</span>
      )}
    </div>
  );
}

export default async function PrivatePriceCatalogPage() {
  const access = await getAuthorizedPriceListForPage("G6");

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

  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-8 text-[#122033] md:px-8">
      <div className="mx-auto max-w-7xl">
        <PricingHeader
          eyebrow="Brand Catalog"
          title="Price List by Brand"
          description="Browse General Pricing by brand and product family, with compact cards, AR compatibility, and professional resource links."
        />
        <div className="mt-8 grid gap-8">
          {catalogSections.map((section) => {
            const items = priceItems.filter((entry) => entry.brand === section.label);
            if (!catalogBrands.includes(section.label) || items.length === 0) return null;

            return (
              <section key={section.label} className="rounded-[30px] border border-[#dfd2bf] bg-[#fbf8f3]/88 p-5 shadow-[0_20px_58px_rgba(18,32,51,0.08)] md:p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8a7654]">Brand Group</p>
                    <h2 className="mt-2 text-3xl font-semibold">{section.label}</h2>
                  </div>
                  <BrandMark brand={section.label} />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {items.map((entry) => <PricingCard key={entry.id} item={entry} compact />)}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
