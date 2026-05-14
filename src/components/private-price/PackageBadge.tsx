import Link from "next/link";
import { PackageCheck } from "lucide-react";
import type { PriceItem } from "../../data/privatePriceList";
import { isPackageEligible } from "../../data/privatePriceList";

export default function PackageBadge({ item }: { item: PriceItem }) {
  if (!isPackageEligible(item)) return null;

  return (
    <Link
      href={`/portal/price-list/packages?product=${encodeURIComponent(item.id)}`}
      className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#d6bd84] bg-[#fff7df] px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f5625] transition hover:bg-[#eadcc6]"
    >
      <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Package Available
    </Link>
  );
}
