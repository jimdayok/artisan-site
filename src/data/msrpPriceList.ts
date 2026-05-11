import { materialAdjustmentForItem, materialAdders, type PriceItem } from "./privatePriceList";

export type MSRPEntry = {
  aliases: string[];
  category: string;
  prices: Partial<Record<string, number>>;
};

const byMaterial = (
  aliases: string[],
  category: string,
  plastic: number,
  poly: number,
  trivex: number,
  hi160: number,
  hi167: number,
  hi170?: number,
  hi174?: number,
  hi176?: number,
): MSRPEntry => ({
  aliases,
  category,
  prices: {
    "material-plastic": plastic,
    "material-polycarb": poly,
    "material-trivex": trivex,
    "material-hi-160": hi160,
    "material-hi-167": hi167,
    "material-hi-170": hi170,
    "material-hi-174": hi174,
    "material-hi-176": hi176,
  },
});

const treatment = (aliases: string[], category: string, price: number): MSRPEntry => ({
  aliases,
  category,
  prices: Object.fromEntries(materialAdders.map((material) => [material.id, price])),
});

export const msrpMeta = {
  title: "2025 Retail Pricing Survey",
  sourceFile: "MSRP 2025 - Comprehensive.pdf",
  note: "MSRP is guidance only and should be reviewed by each practice.",
};

export const msrpEntries: MSRPEntry[] = [
  byMaterial(["SV"], "Single Vision", 95, 125, 144, 184, 204, undefined, 244),
  byMaterial(["Aspheric SV"], "Single Vision", 125, 155, 174, 214, 234, undefined, 274),
  byMaterial(["Endless SV", "IOT Endless SV"], "Single Vision", 130, 160, 179, 219, 239, undefined, 279),
  byMaterial(["Bi-AS SV", "Bi-AS"], "Single Vision", 135, 140, undefined as unknown as number, 229, 269, undefined, 289, 309),

  byMaterial(["Endless Plus", "IOT Endless Plus"], "Digital SV & Anti-Fatigue", 140, 170, 189, 229, 249, 269, 289, 309),
  byMaterial(["Eyezen+ 1/2/3/4 & Start", "Eyezen+ 1/2/3/4", "Essilor Eyezen+"], "Digital SV & Anti-Fatigue", 155, 185, 204, 244, 264, undefined, 304),
  byMaterial(["Sync III", "Hoya Sync III"], "Digital SV & Anti-Fatigue", 150, 180, 199, 239, 259, undefined, 299),

  byMaterial(["Bifocal ST28"], "Lined Multifocal", 135, 175, 194, 234, 284, undefined, 344),
  byMaterial(["Bifocal ST35"], "Lined Multifocal", 150, 190, 209, 249, 299, undefined, 359),
  byMaterial(["Bifocal ST45"], "Lined Multifocal", 165, 205, 224, 264, 314, undefined, 374),
  byMaterial(["Trifocal 7X28"], "Lined Multifocal", 165, 205, 224, 264, 314, undefined, 374),
  byMaterial(["Trifocal 8X35"], "Lined Multifocal", 185, 225, 244, 284, 334, undefined, 394),
  byMaterial(["CD Digital Round", "CD Digital Round 22/28"], "Lined Multifocal", 145, 185, 204, 244, 294, undefined, 354),
  byMaterial(["Endless Bifocal", "Endless Bifocal 32/40"], "Lined Multifocal", 155, 195, 214, 254, 304, undefined, 364),

  byMaterial(["Diamond Series", "Camber Steady Pure", "Camber Steady Plus", "IOT Camber Steady Plus"], "Progressives", 425, 465, 484, 524, 574, undefined, 634),
  byMaterial(["Tokai Select 7X"], "Progressives", 455, undefined as unknown as number, undefined as unknown as number, 554, 644, undefined, 674),
  byMaterial(["X Design", "X Fit", "XR Design", "Varilux X Series"], "Progressives", 449, 489, 508, 548, 598, undefined, 658),
  byMaterial(["Auto Intelligence", "Driver Intl Sun/Moon", "Shamir Intelligence"], "Progressives", 474, 514, 533, 573, 623, undefined, 683),
  byMaterial(["iD LifeStyle 4", "Hoya iD LifeStyle 4"], "Progressives", 448, 488, 507, 547, 597, undefined, 657),
  byMaterial(["Platinum Series", "Endless Steady", "IOT Endless Steady"], "Progressives", 360, 400, 419, 459, 509, undefined, 569),
  byMaterial(["Tokai Select 5X"], "Progressives", 399, undefined as unknown as number, undefined as unknown as number, 498, 588, undefined, 618),
  byMaterial(["Physio Extensee", "Physio Extensee Classic", "Varilux Physio W3+"], "Progressives", 383, 423, 442, 482, 532, undefined, 592),
  byMaterial(["Autograph III", "Shamir Autograph III"], "Progressives", 408, 448, 467, 507, 557, undefined, 617),
  byMaterial(["Array 2", "Hoya Array 2"], "Progressives", 364, 404, 423, 463, 513, undefined, 573),
  byMaterial(["Gold Series", "Essential Steady", "IOT Essential Steady"], "Progressives", 275, 315, 334, 374, 424, undefined, 484),
  byMaterial(["Comfort Max", "Varilux Comfort Max"], "Progressives", 291, 331, 350, 390, 440, undefined, 500),
  byMaterial(["Summit BKS", "Hoya Summit BKS"], "Progressives", 275, 315, 334, 374, 424, undefined, 484),
  byMaterial(["CFB"], "Progressives", 200, 240, 259, 299, 349, undefined, 409),
  byMaterial(["GP Wide", "Hoya Amplitude BKS"], "Progressives", 208, 248, 267, 307, 357, undefined, 417),

  byMaterial(["Endless Office", "IOT Endless Office"], "Occupational", 200, 240, 259, 299, 349, undefined, 409),
  byMaterial(["Workspace", "Computer", "Shamir Office/Workspace"], "Occupational", 225, 265, 284, 324, 374, undefined, 434),
  byMaterial(["TACT BKS", "Hoya Tact BKS"], "Occupational", 207, 247, 266, 306, 356, undefined, 416),

  treatment(["Nytopia", "Artisan Nytopia"], "AR Treatments", 155),
  treatment(["Sapphire HR", "Crizal Sapphire"], "AR Treatments", 163),
  treatment(["Meiryo EX4", "Hoya EX4+ Meiryo"], "AR Treatments", 163),
  treatment(["Azure (Blue Light)", "Azure", "Artisan Azure"], "Blue Light AR Treatments", 145),
  treatment(["Prevencia", "Crizal Prevencia"], "Blue Light AR Treatments", 152),
  treatment(["Recharge", "Hoya Recharge"], "Blue Light AR Treatments", 152),
  treatment(["Technical Blue Cut", "Tokai TBC"], "Blue Light AR Treatments", 150),
  treatment(["Armour", "Artisan Armour"], "AR Treatments", 135),
  treatment(["Rock", "Crizal Rock"], "AR Treatments", 142),
  treatment(["EX3+", "Hoya EX3+"], "AR Treatments", 142),
  treatment(["Glacier Expressions"], "AR Treatments", 149),
  treatment(["Super Power Shield", "Tokai SPS"], "AR Treatments", 140),
  treatment(["Artisan Emerald"], "AR Treatments", 115),
  treatment(["EasyPro", "Crizal Easy Pro"], "AR Treatments", 121),
  treatment(["Hoya Super HiVision"], "AR Treatments", 121),
  treatment(["Glacier Plus"], "AR Treatments", 127),
  treatment(["Diamond Sun", "Artisan Diamond Sun"], "AR Treatments", 75),
  treatment(["Backside AR"], "AR Treatments", 60),
  treatment(["Polarized Solid", "Polarized Lenses"], "Other Treatments", 105),
  treatment(["Transitions Drivewear", "Drivewear Lenses"], "Other Treatments", 185),
  treatment(["General Blue Filter", "Generic Blue Light Filter"], "Blue Light Substrates", 30),
  treatment(["BluTech Clear 430", "BluTech 430 Filter"], "Blue Light Substrates", 50),
  treatment(["Neochromes"], "Photochromic Products", 130),
  treatment(["Neochromes Dark", "Neochromes Agile Dark"], "Photochromic Products", 140),
  treatment(["Transitions(S)", "Transitions Gen S"], "Photochromic Products", 142),
  treatment(["XTRAActive 2", "Transitions Xtra Active"], "Photochromic Products", 155),
  treatment(["Transitions Colors", "Transitions Color"], "Photochromic Products", 150),
  treatment(["Solid Tint", "Tints"], "Tints", 35),
  treatment(["Gradient Tint", "Gradient Tints"], "Tints", 45),
  treatment(["Standard Mirror", "Mirror Coatings"], "Mirrors", 95),
  treatment(["Mirror Match", "Speciality and Match Mirrors"], "Mirrors", 125),
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findMSRPEntry(item: PriceItem) {
  const itemName = normalize(item.name);
  return msrpEntries.find((entry) => entry.aliases.some((alias) => itemName === normalize(alias) || itemName.includes(normalize(alias)) || normalize(alias).includes(itemName)));
}

export function msrpForItem(item: PriceItem, materialId: string) {
  const entry = findMSRPEntry(item);
  if (!entry) return undefined;
  const exact = entry.prices[materialId];
  if (typeof exact === "number" && Number.isFinite(exact)) return exact;
  if (item.type === "Add-On" || item.type === "Service") return entry.prices["material-polycarb"];

  const plastic = entry.prices["material-plastic"];
  if (typeof plastic !== "number" || !Number.isFinite(plastic)) return undefined;

  const materialAdjustment = materialAdjustmentForItem(item, materialId);
  return plastic + materialAdjustment;
}
