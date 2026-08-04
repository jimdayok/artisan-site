import type { EdgeMode, PriceItem } from "./privatePriceList";
import { adjustmentLabel, edgeAdjustment, money } from "./privatePriceList";

export type PackageItem = PriceItem;

const pkg = (
  id: string,
  category: PriceItem["category"],
  type: PriceItem["type"],
  name: string,
  price: number,
  options: Partial<Pick<PriceItem, "recommended" | "outsourced" | "notes" | "code" | "requires">> = {},
): PackageItem => ({
  id,
  brand: "IOT",
  category,
  type,
  name,
  price,
  recommended: options.recommended ?? false,
  outsourced: options.outsourced ?? false,
  notes: options.notes,
  code: options.code,
  requires: options.requires,
});

export const packageMeta = {
  title: "2025 IOT Lens System",
  guideLabel: "Confidential Pricing Guide",
  distributionNotice: "Do Not Distribute",
  sourceFile: "New Updated Price List 030526 - B5 Edged.pdf",
  notes: [
    "Artisan Lens Systems include Polycarbonate and Artisan Emerald AR Treatment.",
    "Upgrades are available.",
    "This Lens System is eligible for multiple pair 50% discount.",
  ],
};

export const packageLensItems: PackageItem[] = [
  pkg("pkg-camber-steady-pure", "IOT Designs", "PAL", "Camber Steady Pure", 208),
  pkg("pkg-camber-steady-plus", "IOT Designs", "PAL", "Camber Steady Plus", 188),
  pkg("pkg-endless-steady", "IOT Designs", "PAL", "Endless Steady", 166),
  pkg("pkg-essential-steady", "IOT Designs", "PAL", "Essential Steady", 152),
  pkg("pkg-cfb", "Artisan Design Portfolio", "PAL", "CFB", 111),
  pkg("pkg-endless-plus", "IOT Designs", "ESV", "Endless Plus", 89),
  pkg("pkg-endless-sv", "IOT Designs", "SV", "Endless SV", 78),
  pkg("pkg-endless-office", "IOT Designs", "OCP", "Endless Office", 87, { recommended: true }),
];

export const packageCoatings: PackageItem[] = [
  pkg("pkg-coat-nytopia", "Artisan Coatings", "Add-On", "Nytopia", 22, { recommended: true }),
  pkg("pkg-coat-armour", "Artisan Coatings", "Add-On", "Armour", 11, { recommended: true }),
  pkg("pkg-coat-azure", "Artisan Coatings", "Add-On", "Azure", 22, { recommended: true }),
  pkg("pkg-coat-emerald", "Artisan Coatings", "Add-On", "Artisan Emerald", 0, { recommended: true, notes: "Included." }),
  pkg("pkg-coat-artisan-standard", "Artisan Coatings", "Add-On", "Artisan Standard", 0, { notes: "Included." }),
  pkg("pkg-coat-diamond-sun", "Artisan Coatings", "Add-On", "Diamond Sun", 0, { notes: "Included." }),
  pkg("pkg-coat-backside-ar", "Artisan Coatings", "Add-On", "Backside AR", 0, { notes: "Included." }),
  pkg("pkg-coat-standard", "Artisan Coatings", "Add-On", "Standard", 0, { notes: "Included." }),
  pkg("pkg-coat-diamond-shield", "Artisan Coatings", "Add-On", "Diamond Shield", 0, { notes: "N/A in source." }),
];

export const packageMaterials: PackageItem[] = [
  pkg("pkg-material-plastic", "Materials", "Add-On", "Plastic", 0, { code: "P", notes: "Included." }),
  pkg("pkg-material-polycarb", "Materials", "Add-On", "Polycarbonate", 0, { code: "PLY", notes: "Included." }),
  pkg("pkg-material-trivex", "Materials", "Add-On", "Trivex", 7, { code: "H53" }),
  pkg("pkg-material-hi-160", "Materials", "Add-On", "Hi Index 1.60", 0, { code: "H60", notes: "N/A in source." }),
  pkg("pkg-material-hi-167", "Materials", "Add-On", "Hi Index 1.67", 43, { code: "H67" }),
  pkg("pkg-material-hi-170", "Materials", "Add-On", "Hi Index 1.70", 0, { code: "H70", notes: "N/A in source." }),
  pkg("pkg-material-hi-174", "Materials", "Add-On", "Hi Index 1.74", 56, { code: "H74" }),
  pkg("pkg-material-hi-176", "Materials", "Add-On", "Hi Index 1.76", 0, { notes: "N/A in source." }),
];

export const packagePhotochromics: PackageItem[] = [
  pkg("pkg-photo-neochromes", "Photochromic Options", "Add-On", "Neochromes", 50, { recommended: true }),
  pkg("pkg-photo-neochromes-dark", "Photochromic Options", "Add-On", "Neochromes Dark", 50, { recommended: true }),
  pkg("pkg-photo-transitions-s", "Photochromic Options", "Add-On", "Transitions(S)", 63),
  pkg("pkg-photo-transitions-colors", "Photochromic Options", "Add-On", "Transitions Colors", 66),
  pkg("pkg-photo-xtractive-2", "Photochromic Options", "Add-On", "XTRAActive 2", 63),
  pkg("pkg-photo-transitions-polarized", "Photochromic Options", "Add-On", "Transitions Polarized", 0, { notes: "No price listed in source." }),
  pkg("pkg-photo-drivewear", "Photochromic Options", "Add-On", "Transitions Drivewear", 0, { notes: "No price listed in source." }),
];

export const packageBlueFilters: PackageItem[] = [
  pkg("pkg-blue-general", "Blue Light Filter Options", "Add-On", "General Blue Filter", 8, { code: "BLY" }),
];

export const packageFinishing: PackageItem[] = [
  pkg("pkg-edge-mount", "Edging", "Service", "Edge & Mount", 0, { notes: "Included." }),
  pkg("pkg-edge-groove-rimless", "Edging", "Service", "Add for Groove Rimless", 9),
  pkg("pkg-edge-full-metal-groove", "Edging", "Service", "Add for Full Metal Groove", 13),
  pkg("pkg-edge-drill-four-holes", "Edging", "Service", "Add for Drill up to four holes", 24),
  pkg("pkg-edge-notch", "Edging", "Service", "Add for Notch", 33),
  pkg("pkg-edge-facet", "Edging", "Service", "Add for Facet", 33),
  pkg("pkg-edge-wrap", "Edging", "Service", "Add for Wrap", 11),
  pkg("pkg-edge-polish", "Finishing Services", "Service", "Edge Polish", 6),
  pkg("pkg-roll-edges", "Finishing Services", "Service", "Roll Edges", 6),
  pkg("pkg-roll-polish", "Finishing Services", "Service", "Roll and Polish", 8),
  pkg("pkg-edge-color", "Finishing Services", "Service", "Edge Color", 10),
  pkg("pkg-uv-application", "Handling", "Service", "UV Application", 5, { notes: "Only 1.50 clear." }),
  pkg("pkg-solid-tint", "Handling", "Service", "Solid Tint", 10),
  pkg("pkg-gradient-tint", "Handling", "Service", "Gradient Tint", 12),
  pkg("pkg-tint-ar", "Handling", "Service", "Tint with AR", 5, { notes: "Additional fee." }),
  pkg("pkg-polarized-solid", "Polarized Options", "Add-On", "Polarized Solid", 51),
  pkg("pkg-polarized-gradient", "Polarized Options", "Add-On", "Polarized Gradient", 0, { notes: "No price listed in source." }),
  pkg("pkg-solid-mirror", "Provisics Mirror Coatings", "Add-On", "Solid Mirror", 49, { outsourced: true }),
  pkg("pkg-gradient-mirror", "Provisics Mirror Coatings", "Add-On", "Gradient", 60, { outsourced: true }),
  pkg("pkg-custom-mirror", "Provisics Mirror Coatings", "Add-On", "Custom Mirror", 0, { outsourced: true, notes: "N/A in source." }),
  pkg("pkg-match-mirror", "Provisics Mirror Coatings", "Add-On", "Match Mirror", 0, { outsourced: true, notes: "N/A in source." }),
];

export const packageChemClip: PackageItem[] = [
  pkg("pkg-chemclip-solid", "ChemClip by Chemistrie", "Add-On", "ChemClip Solid Sunlens", 85.5),
  pkg("pkg-chemclip-drive", "ChemClip by Chemistrie", "Add-On", "ChemClip Drive", 117),
  pkg("pkg-chemclip-solid-backside", "ChemClip by Chemistrie", "Add-On", "ChemClip Solid Sunlens with Backside AR", 88.5),
  pkg("pkg-chemclip-gradient-backside", "ChemClip by Chemistrie", "Add-On", "ChemClip Gradient Sunlens with Backside AR", 90.5),
  pkg("pkg-chemclip-mirror", "ChemClip by Chemistrie", "Add-On", "ChemClip Mirror Sunlens", 92.5),
  pkg("pkg-chemclip-color", "ChemClip by Chemistrie", "Add-On", "ChemClip Color", 119),
  pkg("pkg-chemclip-readers-blue", "ChemClip by Chemistrie", "Add-On", "ChemClip Readers Blue", 97),
  pkg("pkg-chemclip-therapeutic", "ChemClip by Chemistrie", "Add-On", "ChemClip Therapeutic", 132),
  pkg("pkg-chemclip-avulux", "ChemClip by Chemistrie", "Add-On", "ChemClip Avulux", 335),
  pkg("pkg-chemclip-swarovski", "ChemClip by Chemistrie", "Add-On", "Swarovski Crystal add on", 20.5),
];

export const packageShipping: PackageItem[] = [
  pkg("pkg-ship-next-day", "Shipping", "Service", "Next Day Air", 4),
  pkg("pkg-ship-2-day-box", "Shipping", "Service", "2 Day Shipping", 16),
  pkg("pkg-ship-ground-box", "Shipping", "Service", "Ground Delivery per Box", 8),
  pkg("pkg-ship-mail-patient", "Shipping", "Service", "Mail to Patient", 8, { notes: "Add-on to standard shipping." }),
];

export const packagePriceItems = [
  ...packageLensItems,
  ...packageCoatings,
  ...packageMaterials,
  ...packageBlueFilters,
  ...packagePhotochromics,
  ...packageFinishing,
  ...packageChemClip,
  ...packageShipping,
];

export function packageTotal(lens: PackageItem, material?: PackageItem, coating?: PackageItem, photo?: PackageItem, finishing?: PackageItem, shipping?: PackageItem, edgeMode: EdgeMode = "Edged") {
  return lens.price + (material?.price ?? 0) + (coating?.price ?? 0) + (photo?.price ?? 0) + (finishing?.price ?? 0) + (shipping?.price ?? 0) + edgeAdjustment(edgeMode);
}

export { adjustmentLabel, edgeAdjustment, money };
