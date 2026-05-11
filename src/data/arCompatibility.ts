import { coatingItems, type PriceBrand, type PriceItem } from "./privatePriceList";

export type ARGroup = {
  title: string;
  preferred: boolean;
  coatingIds: string[];
  note?: string;
};

const artisan = ["coat-nytopia", "coat-armour", "coat-azure", "coat-emerald", "coat-artisan-standard", "coat-diamond-sun", "coat-backside-ar", "coat-diamond-shield"];
const techShield = ["techshield-elite-uvr", "techshield-blue", "techshield-plus-uvr", "techshield-sun"];
const tokai = ["tokai-ar-no-reflection", "tokai-ar-ultimate-shield", "tokai-ar-super-power-shield", "tokai-ar-technical-blue-cut"];
const crizal = ["crizal-natural", "crizal-sapphire-hr", "crizal-prevencia", "crizal-rock", "crizal-easypro", "crizal-sharpview", "crizal-optifog"];
const hoya = ["hoya-ar-meiryo-ex4", "hoya-ar-ex3-plus", "hoya-ar-recharge"];
const shamir = ["shamir-ar-glacier-expressions", "shamir-ar-glacier-plus"];

export const arGroupIds = {
  All: [] as string[],
  Artisan: artisan,
  TechShield: techShield,
  Crizal: crizal,
  "Hoya AR": hoya,
  "Tokai AR": tokai,
  "Shamir AR": shamir,
};

export type ARGroupFilter = keyof typeof arGroupIds;

function coatings(ids: string[]) {
  return ids.filter((id) => coatingItems.some((item) => item.id === id));
}

function hasName(item: PriceItem, terms: string[]) {
  const name = item.name.toLowerCase();
  return terms.some((term) => name.includes(term));
}

export function arCompatibilityForItem(item: PriceItem): ARGroup[] {
  if (item.brand === "Tokai") {
    return [{ title: "Tokai AR Options", preferred: true, coatingIds: coatings(tokai), note: "Tokai products should use Tokai AR options." }];
  }

  if (item.brand === "Unity") {
    return [
      { title: "Preferred TechShield Options", preferred: true, coatingIds: coatings(techShield), note: "TechShield options are prominent for Unity products." },
      { title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(artisan) },
    ];
  }

  if (item.brand === "Varilux") {
    if (hasName(item, ["xr design", "physio extensee"])) {
      return [{ title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(crizal), note: "This Varilux product cannot use Artisan AR coatings." }];
    }
    return [
      { title: "Preferred Artisan AR Options", preferred: true, coatingIds: coatings(artisan) },
      { title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(crizal) },
    ];
  }

  if (item.brand === "Hoya") {
    if (hasName(item, ["mystyle 3"])) {
      return [{ title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(hoya), note: "Hoya MyStyle 3 cannot use Artisan AR coatings." }];
    }
    return [
      { title: "Preferred Artisan AR Options", preferred: true, coatingIds: coatings(artisan) },
      { title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(hoya) },
    ];
  }

  if (item.brand === "Shamir") {
    return [
      { title: "Preferred Artisan AR Options", preferred: true, coatingIds: coatings(artisan) },
      { title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(shamir) },
    ];
  }

  if ((["Artisan", "IOT", "Sequel by Newton"] as PriceBrand[]).includes(item.brand)) {
    return [
      { title: "Preferred Artisan AR Options", preferred: true, coatingIds: coatings(artisan) },
      { title: "Additional Compatible Brand AR Options", preferred: false, coatingIds: coatings(techShield) },
    ];
  }

  if (item.brand === "TechShield") {
    return [{ title: "Compatible AR Options", preferred: true, coatingIds: coatings(techShield) }];
  }

  return [{ title: "Preferred Artisan AR Options", preferred: true, coatingIds: coatings(artisan) }];
}

export function compatibleCoatingIdsForItem(item: PriceItem) {
  return new Set(arCompatibilityForItem(item).flatMap((group) => group.coatingIds));
}

export function itemMatchesARGroup(item: PriceItem, group: string) {
  if (group === "All") return true;
  const groupIds = arGroupIds[group as ARGroupFilter] ?? [];
  if (!groupIds.length) return true;
  const compatibleIds = compatibleCoatingIdsForItem(item);
  return groupIds.some((id) => compatibleIds.has(id));
}
