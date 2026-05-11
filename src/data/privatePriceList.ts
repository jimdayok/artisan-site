export type PriceType = "SV" | "ESV" | "MF" | "OCP" | "PAL" | "Add-On" | "Service" | "Reference";
export const occupationalPriceType = "OCP" as const;

export type PriceCategory =
  | "Standard Designs"
  | "Artisan Design Portfolio"
  | "IOT Designs"
  | "Tokai Designs"
  | "Sequel by Newton"
  | "Unity Designs"
  | "Varilux Designs"
  | "Hoya Designs"
  | "Shamir Designs"
  | "Artisan Coatings"
  | "TechShield Coatings"
  | "Tokai AR Coatings"
  | "Hoya AR Coatings"
  | "Crizal AR Coatings"
  | "Shamir AR Coatings"
  | "Provisics Mirror Coatings"
  | "KBCO Polarized Mirrors"
  | "Nupolar Mirrors"
  | "Polarized Options"
  | "Photochromic Options"
  | "Blue Light Filter Options"
  | "Materials"
  | "Edging"
  | "Finishing Services"
  | "Handling"
  | "ChemClip by Chemistrie"
  | "Shipping"
  | "Reference Key";

export type PriceBrand =
  | "Artisan"
  | "IOT"
  | "Tokai"
  | "Sequel by Newton"
  | "Unity"
  | "Varilux"
  | "Hoya"
  | "Shamir"
  | "TechShield"
  | "Artisan Coatings"
  | "Tokai AR"
  | "Crizal"
  | "Hoya AR"
  | "Shamir AR"
  | "Provisics"
  | "KBCO"
  | "Nupolar"
  | "ChemClip"
  | "Lab Services"
  | "Reference";

export type PriceItem = {
  id: string;
  brand: PriceBrand;
  category: PriceCategory;
  type: PriceType;
  name: string;
  price: number;
  code?: string;
  recommended: boolean;
  outsourced: boolean;
  packageEligible?: boolean;
  notes?: string;
  requires?: string;
};

export type MaterialAdder = PriceItem & {
  category: "Materials";
};

export const priceListMeta = {
  title: "2026 Artisan Lab Network Pricing",
  program: "General Pricing",
  guideLabel: "Confidential Pricing Guide",
  distributionNotice: "Do Not Distribute",
  sourceFile: "Test Price List G6 with P deduction.pdf",
};

const item = (
  id: string,
  brand: PriceBrand,
  category: PriceCategory,
  type: PriceType,
  name: string,
  price: number,
  options: Partial<Pick<PriceItem, "code" | "recommended" | "outsourced" | "notes" | "requires">> = {},
): PriceItem => ({
  id,
  brand,
  category,
  type,
  name,
  price,
  recommended: options.recommended ?? false,
  outsourced: options.outsourced ?? false,
  code: options.code,
  notes: options.notes,
  requires: options.requires,
});

export type LensGroup =
  | "Single Vision"
  | "Multifocal Lenses"
  | "Digital SV & Anti-Fatigue Lenses"
  | "Occupational Lenses"
  | "Progressive Lenses";

export type PriceView = "Wholesale" | "MSRP" | "Both";

export const lensGroupLabels: LensGroup[] = [
  "Single Vision",
  "Multifocal Lenses",
  "Digital SV & Anti-Fatigue Lenses",
  "Occupational Lenses",
  "Progressive Lenses",
];

export const materialAdders: MaterialAdder[] = [
  item("material-plastic", "Lab Services", "Materials", "Add-On", "Plastic", -11, {
    code: "P",
    notes: "Deduct $11 from the polycarbonate base. Varilux products deduct $3 instead.",
  }) as MaterialAdder,
  item("material-polycarb", "Lab Services", "Materials", "Add-On", "Polycarbonate", 0, { code: "PLY" }) as MaterialAdder,
  item("material-trivex", "Lab Services", "Materials", "Add-On", "Trivex", 7, { code: "H53" }) as MaterialAdder,
  item("material-hi-160", "Lab Services", "Materials", "Add-On", "Hi Index 1.60", 42, { code: "H60" }) as MaterialAdder,
  item("material-hi-167", "Lab Services", "Materials", "Add-On", "Hi Index 1.67", 53, { code: "H67" }) as MaterialAdder,
  item("material-hi-170", "Tokai", "Materials", "Add-On", "Hi Index 1.70", 60, {
    code: "H70",
    outsourced: true,
    notes: "Exclusive to Tokai.",
    requires: "Tokai lens design",
  }) as MaterialAdder,
  item("material-hi-174", "Lab Services", "Materials", "Add-On", "Hi Index 1.74", 69, { code: "H74" }) as MaterialAdder,
  item("material-hi-176", "Tokai", "Materials", "Add-On", "Hi Index 1.76", 65, {
    recommended: true,
    outsourced: true,
    notes: "Exclusive to Tokai. Price includes material upgrade from Plastic as well as BluTech product feature where applicable.",
    requires: "Tokai lens design",
  }) as MaterialAdder,
];

export const priceItems: PriceItem[] = [
  ...materialAdders,

  item("std-sv", "Artisan", "Standard Designs", "SV", "SV", 44),
  item("std-aspheric-sv", "Artisan", "Standard Designs", "SV", "Aspheric SV", 74),
  item("std-bifocal-st28", "Artisan", "Standard Designs", "MF", "Bifocal ST28", 58),
  item("std-round-seg-22-24", "Artisan", "Standard Designs", "MF", "Round Seg 22/24", 0, { notes: "No price listed in the revised G6 source." }),
  item("std-bifocal-st35", "Artisan", "Standard Designs", "MF", "Bifocal ST35", 61),
  item("std-bifocal-st45", "Artisan", "Standard Designs", "MF", "Bifocal ST45", 0, { notes: "No price listed in the revised G6 source." }),
  item("std-trifocal-7x28", "Artisan", "Standard Designs", "MF", "Trifocal 7X28", 76),
  item("std-trifocal-8x35", "Artisan", "Standard Designs", "MF", "Trifocal 8X35", 90),

  item("artisan-diamond-series", "Artisan", "Artisan Design Portfolio", "PAL", "Diamond Series", 174),
  item("artisan-platinum-series", "Artisan", "Artisan Design Portfolio", "PAL", "Platinum Series", 145),
  item("artisan-gold-series", "Artisan", "Artisan Design Portfolio", "PAL", "Gold Series", 131),
  item("artisan-cfb", "Artisan", "Artisan Design Portfolio", "PAL", "CFB", 93),
  item("artisan-sd-reach", "Artisan", "Artisan Design Portfolio", "OCP", "SD Reach", 89),
  item("artisan-sd-concept", "Artisan", "Artisan Design Portfolio", "ESV", "SD Concept", 75),
  item("artisan-cd-digital-round", "Artisan", "Artisan Design Portfolio", "MF", "CD Digital Round", 65),
  item("artisan-sd-digital-sv", "Artisan", "Artisan Design Portfolio", "SV", "SD Digital SV", 69),

  item("iot-camber-steady-pure", "IOT", "IOT Designs", "PAL", "Camber Steady Pure", 204, { recommended: true }),
  item("iot-camber-steady-plus", "IOT", "IOT Designs", "PAL", "Camber Steady Plus", 174, { recommended: true }),
  item("iot-endless-steady", "IOT", "IOT Designs", "PAL", "Endless Steady", 145, { recommended: true }),
  item("iot-essential-steady", "IOT", "IOT Designs", "PAL", "Essential Steady", 131),
  item("iot-endless-drive", "IOT", "IOT Designs", "PAL", "Endless Drive", 149),
  item("iot-endless-pilot", "IOT", "IOT Designs", "PAL", "Endless Pilot", 134),
  item("iot-endless-office", "IOT", "IOT Designs", "OCP", "Endless Office", 89),
  item("iot-endless-bifocal", "IOT", "IOT Designs", "MF", "Endless Bifocal", 57),
  item("iot-endless-plus", "IOT", "IOT Designs", "ESV", "Endless Plus", 75),
  item("iot-endless-sv", "IOT", "IOT Designs", "SV", "Endless SV", 69),

  item("tokai-select-9x", "Tokai", "Tokai Designs", "PAL", "Tokai Select 9X", 229, { outsourced: true }),
  item("tokai-select-7x", "Tokai", "Tokai Designs", "PAL", "Tokai Select 7X", 224, { outsourced: true }),
  item("tokai-select-5x", "Tokai", "Tokai Designs", "PAL", "Tokai Select 5X", 211, { outsourced: true }),
  item("tokai-easyone", "Tokai", "Tokai Designs", "PAL", "EasyOne", 157, { outsourced: true }),
  item("tokai-largo", "Tokai", "Tokai Designs", "OCP", "Largo", 97, { outsourced: true }),
  item("tokai-rest", "Tokai", "Tokai Designs", "ESV", "Rest", 72, { outsourced: true }),
  item("tokai-bi-as-sv", "Tokai", "Tokai Designs", "SV", "Bi-AS SV", 77, { outsourced: true }),
  item("tokai-as-sv", "Tokai", "Tokai Designs", "SV", "AS SV", 57, {
    outsourced: true,
    notes: "Tokai lenses available in 1.60, 1.67 photochromic only, 1.70 and 1.76 material. Add material to price above.",
  }),

  item("sequel-pal", "Sequel by Newton", "Sequel by Newton", "PAL", "Sequel PAL", 231, {
    recommended: true,
    requires: "Artisan Emerald AR or higher, or a TechShield AR.",
  }),
  item("sequel-esv-0-38-55", "Sequel by Newton", "Sequel by Newton", "ESV", "Sequel 0/38/55", 161, {
    recommended: true,
    requires: "Artisan Emerald AR or higher, or a TechShield AR.",
  }),

  item("unity-v3-elite", "Unity", "Unity Designs", "PAL", "Unity V3 Elite", 236, { recommended: true }),
  item("unity-v3-plus", "Unity", "Unity Designs", "PAL", "Unity V3 Plus", 211, { recommended: true }),
  item("unity-v3", "Unity", "Unity Designs", "PAL", "Unity V3", 150),
  item("unity-v3-mobile", "Unity", "Unity Designs", "PAL", "Unity V3 Mobile", 211),
  item("unity-v3-wrap", "Unity", "Unity Designs", "PAL", "Unity V3 Wrap", 211),
  item("unity-via-pro", "Unity", "Unity Designs", "OCP", "Unity Via Pro 5/10", 143),
  item("unity-relieve", "Unity", "Unity Designs", "ESV", "Unity Relieve 50/75", 102),
  item("unity-svx", "Unity", "Unity Designs", "SV", "Unity SVx", 72),
  item("unity-svxtra", "Unity", "Unity Designs", "SV", "Unity SVxtra", 128),
  item("unity-svxtreme", "Unity", "Unity Designs", "SV", "Unity SVxtreme", 128),

  item("varilux-xr-design", "Varilux", "Varilux Designs", "PAL", "XR Design", 250, { outsourced: true }),
  item("varilux-x-fit", "Varilux", "Varilux Designs", "PAL", "X Fit", 239, { outsourced: true }),
  item("varilux-x-design", "Varilux", "Varilux Designs", "PAL", "X Design", 224, { outsourced: true }),
  item("varilux-physio-extensee", "Varilux", "Varilux Designs", "PAL", "Physio Extensee", 192),
  item("varilux-physio-extensee-classic", "Varilux", "Varilux Designs", "PAL", "Physio Extensee Classic", 182),
  item("varilux-physio-drx", "Varilux", "Varilux Designs", "PAL", "Physio DRx", 0, { notes: "No price listed in the revised G6 source." }),
  item("varilux-comfort-max-fit", "Varilux", "Varilux Designs", "PAL", "Comfort Max Fit", 187),
  item("varilux-comfort-max", "Varilux", "Varilux Designs", "PAL", "Comfort Max", 171),
  item("varilux-comfort-drx", "Varilux", "Varilux Designs", "PAL", "Comfort DRx", 161),
  item("varilux-eyezen-combined", "Varilux", "Varilux Designs", "ESV", "Eyezen+ 1/2/3/4 & Start", 124),
  item("varilux-eyezen-plus", "Varilux", "Varilux Designs", "ESV", "Eyezen+ 1/2/3/4", 0, { notes: "Combined with Eyezen Start in the revised G6 source." }),

  item("hoya-id-mystyle-3", "Hoya", "Hoya Designs", "PAL", "iD MyStyle 3", 269, { outsourced: true }),
  item("hoya-id-lifestyle-4", "Hoya", "Hoya Designs", "PAL", "iD LifeStyle 4", 223),
  item("hoya-array-2", "Hoya", "Hoya Designs", "PAL", "Array 2", 160),
  item("hoya-array", "Hoya", "Hoya Designs", "PAL", "Array", 236),
  item("hoya-summit-bks", "Hoya", "Hoya Designs", "PAL", "Summit BKS", 129),
  item("hoya-visupro-advanced-focus", "Hoya", "Hoya Designs", "PAL", "VisuPro Advanced Focus Lenses", 0, {
    outsourced: true,
    notes: "TBD in source price list.",
  }),
  item("hoya-gp-wide", "Hoya", "Hoya Designs", "PAL", "GP Wide", 109),
  item("hoya-id-workstyle-3", "Hoya", "Hoya Designs", "OCP", "iD WorkStyle 3", 154, { outsourced: true }),
  item("hoya-id-screen-space-zoom", "Hoya", "Hoya Designs", "OCP", "iD Screen/Space/Zoom", 144, { outsourced: true }),
  item("hoya-tact-bks", "Hoya", "Hoya Designs", "OCP", "TACT BKS", 109),
  item("hoya-sync-iii", "Hoya", "Hoya Designs", "ESV", "Sync III", 91),
  item("hoya-mysv", "Hoya", "Hoya Designs", "SV", "MySV", 85),

  item("shamir-driver-intl", "Shamir", "Shamir Designs", "PAL", "Driver Intl Sun/Moon", 267),
  item("shamir-auto-intelligence", "Shamir", "Shamir Designs", "PAL", "Auto Intelligence", 267),
  item("shamir-autograph-iii", "Shamir", "Shamir Designs", "PAL", "Autograph III", 236),
  item("shamir-autograph-ii-plus", "Shamir", "Shamir Designs", "PAL", "Autograph II+", 185),
  item("shamir-autograph-ii-att", "Shamir", "Shamir Designs", "PAL", "Autograph II Att", 188),
  item("shamir-spectrum-plus", "Shamir", "Shamir Designs", "PAL", "Spectrum+", 158),
  item("shamir-intouch", "Shamir", "Shamir Designs", "PAL", "InTouch", 192),
  item("shamir-element", "Shamir", "Shamir Designs", "PAL", "Element", 135),
  item("shamir-firstpal", "Shamir", "Shamir Designs", "PAL", "FirstPAL", 143),
  item("shamir-workspace", "Shamir", "Shamir Designs", "OCP", "Workspace", 150),
  item("shamir-computer", "Shamir", "Shamir Designs", "OCP", "Computer", 150),
  item("shamir-ocp-sv", "Shamir", "Shamir Designs", "OCP", "SV", 91),
  item("shamir-relax", "Shamir", "Shamir Designs", "ESV", "Relax", 102),
  item("shamir-auto-ii-sv", "Shamir", "Shamir Designs", "SV", "Auto II SV", 126),
  item("shamir-drive-int-sv", "Shamir", "Shamir Designs", "SV", "Drive Int SV Sun/Moon", 143),

  item("coat-nytopia", "Artisan Coatings", "Artisan Coatings", "Add-On", "Nytopia", 77, { recommended: true }),
  item("coat-armour", "Artisan Coatings", "Artisan Coatings", "Add-On", "Armour", 77, { recommended: true }),
  item("coat-azure", "Artisan Coatings", "Artisan Coatings", "Add-On", "Azure (Blue Light)", 88, { recommended: true }),
  item("coat-emerald", "Artisan Coatings", "Artisan Coatings", "Add-On", "Artisan Emerald", 68, { recommended: true }),
  item("coat-artisan-standard", "Artisan Coatings", "Artisan Coatings", "Add-On", "Artisan Standard", 44),
  item("coat-diamond-sun", "Artisan Coatings", "Artisan Coatings", "Add-On", "Diamond Sun", 46),
  item("coat-backside-ar", "Artisan Coatings", "Artisan Coatings", "Add-On", "Backside AR", 26),
  item("coat-diamond-shield", "Artisan Coatings", "Artisan Coatings", "Add-On", "Diamond Shield", 22),

  item("techshield-elite-uvr", "TechShield", "TechShield Coatings", "Add-On", "TechShield Elite UVR", 88, { recommended: true }),
  item("techshield-blue", "TechShield", "TechShield Coatings", "Add-On", "TechShield Blue", 92, { recommended: true }),
  item("techshield-plus-uvr", "TechShield", "TechShield Coatings", "Add-On", "TechShield Plus UVR", 77, { recommended: true }),
  item("techshield-sun", "TechShield", "TechShield Coatings", "Add-On", "TechShield SUN", 88, { recommended: true }),

  item("tokai-ar-no-reflection", "Tokai AR", "Tokai AR Coatings", "Add-On", "No Reflection Coating", 89, { outsourced: true }),
  item("tokai-ar-ultimate-shield", "Tokai AR", "Tokai AR Coatings", "Add-On", "Ultimate Shield Coating", 89, { outsourced: true }),
  item("tokai-ar-super-power-shield", "Tokai AR", "Tokai AR Coatings", "Add-On", "Super Power Shield", 85, { outsourced: true }),
  item("tokai-ar-technical-blue-cut", "Tokai AR", "Tokai AR Coatings", "Add-On", "Technical Blue Cut", 85, { outsourced: true }),

  item("hoya-ar-meiryo-ex4", "Hoya AR", "Hoya AR Coatings", "Add-On", "Meiryo EX4", 104, { outsourced: true }),
  item("hoya-ar-ex3-plus", "Hoya AR", "Hoya AR Coatings", "Add-On", "EX3+", 100, { outsourced: true }),
  item("hoya-ar-recharge", "Hoya AR", "Hoya AR Coatings", "Add-On", "Recharge", 97, { outsourced: true }),

  item("crizal-natural", "Crizal", "Crizal AR Coatings", "Add-On", "Natural", 104, { outsourced: true }),
  item("crizal-sapphire-hr", "Crizal", "Crizal AR Coatings", "Add-On", "Sapphire HR", 104, { outsourced: true }),
  item("crizal-prevencia", "Crizal", "Crizal AR Coatings", "Add-On", "Prevencia", 104, { outsourced: true }),
  item("crizal-rock", "Crizal", "Crizal AR Coatings", "Add-On", "Rock", 97, { outsourced: true }),
  item("crizal-easypro", "Crizal", "Crizal AR Coatings", "Add-On", "EasyPro", 79, { outsourced: true }),
  item("crizal-sharpview", "Crizal", "Crizal AR Coatings", "Add-On", "Sharpview", 89, { outsourced: true }),
  item("crizal-optifog", "Crizal", "Crizal AR Coatings", "Add-On", "OptiFog", 96, { outsourced: true }),

  item("shamir-ar-glacier-expressions", "Shamir AR", "Shamir AR Coatings", "Add-On", "Glacier Expressions", 96, { outsourced: true }),
  item("shamir-ar-glacier-plus", "Shamir AR", "Shamir AR Coatings", "Add-On", "Glacier Plus", 89, { outsourced: true }),

  item("mirror-standard", "Provisics", "Provisics Mirror Coatings", "Add-On", "Standard Mirror", 52, { outsourced: true }),
  item("mirror-match", "Provisics", "Provisics Mirror Coatings", "Add-On", "Mirror Match", 79, { outsourced: true }),
  item("kbco-polarized-mirrors", "KBCO", "KBCO Polarized Mirrors", "Add-On", "Polarized Mirrors", 52, {
    recommended: true,
    notes: "Download availability list at Artisan Resources site or scan QR.",
  }),
  item("kbco-polar-matt-mirrors", "KBCO", "KBCO Polarized Mirrors", "Add-On", "Polar Matt Mirrors", 52, {
    recommended: true,
    notes: "Download availability list at Artisan Resources site or scan QR.",
  }),
  item("nupolar-polarized-mirrors", "Nupolar", "Nupolar Mirrors", "Add-On", "Nupolar Polarized Mirrors", 52, {
    recommended: true,
    notes: "Download availability list at Artisan Resources site or scan QR.",
  }),
  item("polarized-solid", "Lab Services", "Polarized Options", "Add-On", "Polarized Solid", 61),
  item("polarized-gradient", "Lab Services", "Polarized Options", "Add-On", "Polarized Gradient", 71),

  item("photo-neochromes", "Lab Services", "Photochromic Options", "Add-On", "Neochromes", 49, { recommended: true }),
  item("photo-neochromes-dark", "Lab Services", "Photochromic Options", "Add-On", "Neochromes Dark", 49, { recommended: true }),
  item("photo-sensity-2", "Lab Services", "Photochromic Options", "Add-On", "Sensity 2", 54),
  item("photo-sensity-fast", "Lab Services", "Photochromic Options", "Add-On", "Sensity Fast", 54),
  item("photo-sensity-dark", "Lab Services", "Photochromic Options", "Add-On", "Sensity Dark", 49),
  item("photo-sunsync", "Lab Services", "Photochromic Options", "Add-On", "SunSync", 49),
  item("photo-sunsync-elite", "Lab Services", "Photochromic Options", "Add-On", "SunSync Elite", 54),
  item("photo-sunsync-elite-xt", "Lab Services", "Photochromic Options", "Add-On", "SunSync Elite XT", 49),
  item("photo-transitions-s", "Lab Services", "Photochromic Options", "Add-On", "Transitions(S)", 78),
  item("photo-transitions-colors", "Lab Services", "Photochromic Options", "Add-On", "Transitions Colors", 81),
  item("photo-xtractive-2", "Lab Services", "Photochromic Options", "Add-On", "XTRAActive 2", 78),
  item("photo-transitions-polarized", "Lab Services", "Photochromic Options", "Add-On", "Transitions Polarized", 94),
  item("photo-drivewear", "Lab Services", "Photochromic Options", "Add-On", "Transitions Drivewear", 119),
  item("photo-tokai-lutina-v2", "Tokai", "Photochromic Options", "Add-On", "Tokai Lutina Photo V2", 114, { outsourced: true }),

  item("blue-general", "Lab Services", "Blue Light Filter Options", "Add-On", "General Blue Filter", 8, { recommended: true }),
  item("blue-blutech-clear-430", "Lab Services", "Blue Light Filter Options", "Add-On", "BluTech Clear 430", 15, { code: "B59" }),
  item("blue-blutech-ultra", "Lab Services", "Blue Light Filter Options", "Add-On", "BluTech Ultra", 51, { code: "B59" }),
  item("blue-blutech-classic", "Lab Services", "Blue Light Filter Options", "Add-On", "BluTech Classic", 32, { code: "BLT" }),
  item("blue-blutech-outdoor", "Lab Services", "Blue Light Filter Options", "Add-On", "BluTech Outdoor", 120, { code: "BLT" }),
  item("blue-tokai-lutina", "Tokai", "Blue Light Filter Options", "Add-On", "Tokai Lutina Blue Filter", 15, { code: "BLT", outsourced: true }),

  item("edge-mount", "Lab Services", "Edging", "Service", "Edge & Mount", 0, { notes: "Included." }),
  item("edge-groove-rimless", "Lab Services", "Edging", "Service", "Add for Groove Rimless", 9),
  item("edge-full-metal-groove", "Lab Services", "Edging", "Service", "Add for Full Metal Groove", 15),
  item("edge-drill-four-holes", "Lab Services", "Edging", "Service", "Add for Drill up to four holes", 24),
  item("edge-shelf", "Lab Services", "Edging", "Service", "Add for Shelf", 15),
  item("edge-facet", "Lab Services", "Edging", "Service", "Add for Facet", 43),
  item("edge-wrap", "Lab Services", "Edging", "Service", "Add for Wrap", 15),
  item("finish-edge-polish", "Lab Services", "Finishing Services", "Service", "Edge Polish", 6),
  item("finish-roll-edges", "Lab Services", "Finishing Services", "Service", "Roll Edges", 6),
  item("finish-roll-polish", "Lab Services", "Finishing Services", "Service", "Roll and Polish", 8),
  item("finish-edge-color", "Lab Services", "Finishing Services", "Service", "Edge Color", 10),
  item("handling-uv-application", "Lab Services", "Handling", "Service", "UV Application", 0, { notes: "Only 1.50 clear." }),
  item("handling-solid-tint", "Lab Services", "Handling", "Service", "Solid Tint", 10),
  item("handling-gradient-tint", "Lab Services", "Handling", "Service", "Gradient Tint", 12),
  item("handling-tint-with-ar", "Lab Services", "Handling", "Service", "Tint with AR", 5, { notes: "Additional fee." }),

  item("chemclip-solid-sunlens", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Solid Sunlens", 85),
  item("chemclip-drive", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Drive", 117),
  item("chemclip-solid-backside-ar", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Solid Sunlens with Backside AR", 88),
  item("chemclip-gradient-backside-ar", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Gradient Sunlens with Backside AR", 90),
  item("chemclip-mirror-sunlens", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Mirror Sunlens", 92),
  item("chemclip-color", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Color", 117),
  item("chemclip-readers-blue", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Readers Blue", 95),
  item("chemclip-therapeutic", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Therapeutic", 130),
  item("chemclip-avulux", "ChemClip", "ChemClip by Chemistrie", "Add-On", "ChemClip Avulux", 335),
  item("chemclip-swarovski", "ChemClip", "ChemClip by Chemistrie", "Add-On", "Swarovski Crystal add on", 20),

  item("ship-next-day", "Lab Services", "Shipping", "Service", "Next Day Delivery per Order", 4),
  item("ship-2-day", "Lab Services", "Shipping", "Service", "2-Day Delivery per Box", 16),
  item("ship-ground", "Lab Services", "Shipping", "Service", "Ground Delivery per Box", 8),
  item("ship-mail-patient", "Lab Services", "Shipping", "Service", "Mail to Patient", 8, { notes: "Add-on to standard shipping." }),

  item("ref-outsourced", "Reference", "Reference Key", "Reference", "Outsourced Product", 0, { outsourced: true, notes: "Marked with arrow in source PDF." }),
  item("ref-recommended", "Reference", "Reference Key", "Reference", "Recommended for Best Service", 0, { recommended: true, notes: "Marked with star in source PDF." }),
  item("ref-sv", "Reference", "Reference Key", "SV", "Single Vision", 0),
  item("ref-esv", "Reference", "Reference Key", "ESV", "Enhanced Single Vision with Power Boost", 0),
  item("ref-mf", "Reference", "Reference Key", "MF", "Multifocal Design", 0),
  item("ref-pal", "Reference", "Reference Key", "PAL", "Progressive Design", 0),
];

export const brands: PriceBrand[] = [
  "Artisan",
  "IOT",
  "Tokai",
  "Sequel by Newton",
  "Unity",
  "Varilux",
  "Hoya",
  "Shamir",
  "TechShield",
  "Artisan Coatings",
  "Tokai AR",
  "Crizal",
  "Hoya AR",
  "Shamir AR",
  "ChemClip",
  "Lab Services",
];

export const catalogBrands: PriceBrand[] = [
  "Artisan",
  "IOT",
  "Tokai",
  "Sequel by Newton",
  "Unity",
  "Varilux",
  "Hoya",
  "Shamir",
  "TechShield",
  "Artisan Coatings",
  "Tokai AR",
  "Crizal",
  "Hoya AR",
  "Shamir AR",
  "ChemClip",
];

export const categories: PriceCategory[] = [
  "Standard Designs",
  "Artisan Design Portfolio",
  "IOT Designs",
  "Tokai Designs",
  "Sequel by Newton",
  "Unity Designs",
  "Varilux Designs",
  "Hoya Designs",
  "Shamir Designs",
  "Artisan Coatings",
  "TechShield Coatings",
  "Tokai AR Coatings",
  "Hoya AR Coatings",
  "Crizal AR Coatings",
  "Shamir AR Coatings",
  "Provisics Mirror Coatings",
  "KBCO Polarized Mirrors",
  "Nupolar Mirrors",
  "Polarized Options",
  "Photochromic Options",
  "Blue Light Filter Options",
  "Materials",
  "Edging",
  "Finishing Services",
  "Handling",
  "ChemClip by Chemistrie",
  "Shipping",
  "Reference Key",
];

export const lensCategories: PriceCategory[] = [
  "Standard Designs",
  "Artisan Design Portfolio",
  "IOT Designs",
  "Tokai Designs",
  "Sequel by Newton",
  "Unity Designs",
  "Varilux Designs",
  "Hoya Designs",
  "Shamir Designs",
];

export const coatingCategories: PriceCategory[] = [
  "Artisan Coatings",
  "TechShield Coatings",
  "Tokai AR Coatings",
  "Hoya AR Coatings",
  "Crizal AR Coatings",
  "Shamir AR Coatings",
];

export const logoByBrand: Partial<Record<PriceBrand, string>> = {
  Artisan: "/aln-icon.png",
  IOT: "/iot-logo.png",
  Tokai: "/tokai-logo.png",
  "Sequel by Newton": "/logos/Sequel_Brandmark_Horizontal_RGB_Charcoal.png",
  Unity: "/unity-logo.png",
  Varilux: "/varilux-logo.png",
  Hoya: "/hoya-logo.png",
  Shamir: "/shamir-logo.png",
  TechShield: "/logos/VSP_Vision_Logotype_RGB_Blk.png",
  Crizal: "/logos/VSP_Vision_Logotype_RGB_Blk.png",
  ChemClip: "/chemistrie-logo.png",
};

export function logoForPriceItem(item: Pick<PriceItem, "brand" | "name">) {
  const name = item.name.toLowerCase();
  if (name.includes("nupolar")) return "/younger-optics-logo.png";
  if (name.includes("drivewear")) return "/younger-optics-logo.png";
  if (name.includes("techshield")) return "/logos/VSP_Vision_Logotype_RGB_Blk.png";
  if (name.includes("crizal")) return logoByBrand.Crizal;
  if (name.includes("hoya") || item.brand === "Hoya AR") return "/hoya-logo.png";
  if (name.includes("glacier") || item.brand === "Shamir AR") return "/shamir-logo.png";
  if (item.brand === "Tokai AR" || name.includes("tokai")) return "/tokai-logo.png";
  if (item.brand === "Artisan Coatings" || name.includes("artisan")) return "/aln-icon.png";
  if (item.brand === "ChemClip" || name.includes("chemclip")) return "/chemistrie-logo.png";
  return logoByBrand[item.brand];
}

export const money = (price: number) => {
  if (price === 0) return "$0";
  if (price < 0) return `-$${Math.abs(price).toLocaleString("en-US")}`;
  return `$${price.toLocaleString("en-US")}`;
};

export type EdgeMode = "Edged" | "Uncut";

export function materialAdjustmentForItem(item: PriceItem | undefined, materialId: string) {
  const material = materialAdders.find((entry) => entry.id === materialId) ?? materialAdders[1];

  if (!item) return material.price;
  if (material.id === "material-plastic" && item.brand === "Varilux") {
    return -3;
  }

  return material.price;
}

export function edgeAdjustment(edgeMode: EdgeMode) {
  return edgeMode === "Uncut" ? -8 : 0;
}

export function calculatedPrice(item: PriceItem, materialId: string, edgeMode: EdgeMode, addOns: PriceItem[] = []) {
  return item.price + materialAdjustmentForItem(item, materialId) + edgeAdjustment(edgeMode) + addOns.reduce((sum, entry) => sum + entry.price, 0);
}

export function adjustmentLabel(value: number) {
  if (value === 0) return "Included";
  return value < 0 ? `Deduct ${money(Math.abs(value))}` : `Add ${money(value)}`;
}

export function professionalResourceHref(brand: PriceBrand) {
  const anchors: Partial<Record<PriceBrand, string>> = {
    Artisan: "/provider-resources#artisan-designs",
    IOT: "/provider-resources#iot",
    Tokai: "/provider-resources#tokai",
    Unity: "/provider-resources#unity",
    Hoya: "/provider-resources#hoya",
    Shamir: "/provider-resources#shamir",
    Varilux: "/provider-resources#varilux",
    ChemClip: "/provider-resources#chemistrie",
    "Sequel by Newton": "/provider-resources#neurolens",
    TechShield: "/provider-resources#unity",
    "Artisan Coatings": "/provider-resources#artisan-designs",
    "Tokai AR": "/provider-resources#tokai",
    "Hoya AR": "/provider-resources#hoya",
    "Shamir AR": "/provider-resources#shamir",
    Crizal: "/provider-resources#varilux",
  };

  return anchors[brand] ?? "/provider-resources";
}

export const lensItems = priceItems.filter((entry) => lensCategories.includes(entry.category));
export const coatingItems = priceItems.filter((entry) => coatingCategories.includes(entry.category));
export const photochromicItems = priceItems.filter((entry) => entry.category === "Photochromic Options");
export const polarizedItems = priceItems.filter((entry) => entry.category === "Polarized Options" || entry.category === "KBCO Polarized Mirrors" || entry.category === "Nupolar Mirrors");
export const mirrorItems = priceItems.filter((entry) => entry.category === "Provisics Mirror Coatings" || entry.category === "KBCO Polarized Mirrors" || entry.category === "Nupolar Mirrors");
export const blueLightItems = priceItems.filter((entry) => entry.category === "Blue Light Filter Options");
export const finishingItems = priceItems.filter((entry) =>
  ["Edging", "Finishing Services", "Handling", "ChemClip by Chemistrie"].includes(entry.category),
);
export const shippingItems = priceItems.filter((entry) => entry.category === "Shipping");

export const packageEligibleNames = new Set([
  "Camber Steady Pure",
  "Camber Steady Plus",
  "Endless Steady",
  "Essential Steady",
  "CFB",
  "Endless Plus",
  "Endless SV",
  "Endless Office",
]);

export function isPackageEligible(item: PriceItem) {
  return packageEligibleNames.has(item.name);
}

export function lensGroupForItem(item: PriceItem): LensGroup | undefined {
  const name = item.name.toLowerCase();

  if (item.type === "PAL") return "Progressive Lenses";
  if (item.type === "SV") return "Single Vision";
  if (item.type === "MF") return "Multifocal Lenses";
  if (item.type === "OCP") return "Occupational Lenses";
  if (item.type === "ESV") return "Digital SV & Anti-Fatigue Lenses";

  if (["st28", "st35", "st45", "round seg", "trifocal", "cd digital round", "endless bifocal"].some((term) => name.includes(term))) {
    return "Multifocal Lenses";
  }
  if (["endless office", "sd reach", "largo", "unity via pro", "id workstyle", "id screen", "space", "zoom", "workspace", "computer", "ocp sv", "tact bks"].some((term) => name.includes(term))) {
    return "Occupational Lenses";
  }
  if (["eyezen", "sync iii", "endless plus", "sd concept", "unity relieve", "relax"].some((term) => name.includes(term))) {
    return "Digital SV & Anti-Fatigue Lenses";
  }

  return undefined;
}

export function isLensItem(item: PriceItem) {
  return Boolean(lensGroupForItem(item));
}

export function materialName(materialId: string) {
  return materialAdders.find((entry) => entry.id === materialId)?.name ?? "Polycarbonate";
}

export function priceTypeLabel(type: PriceType) {
  const labels: Record<PriceType, string> = {
    SV: "SV",
    ESV: "Digital SV",
    MF: "MF",
    OCP: "Occupational",
    PAL: "PAL",
    "Add-On": "Add-On",
    Service: "Service",
    Reference: "Reference",
  };

  return labels[type];
}

export function timeToMake(item: PriceItem, arSelected = false) {
  if (item.outsourced && item.brand === "Tokai") return "14 to 21 days";
  if (item.outsourced) return "7 to 14 days";
  if (arSelected) return "4 to 7 days";
  return "1 to 4 days";
}

export function selectedMaterialLabel(item: PriceItem | undefined, materialId: string) {
  const adjustment = materialAdjustmentForItem(item, materialId);
  return adjustmentLabel(adjustment);
}

export function searchableText(item: PriceItem) {
  return [item.name, item.brand, item.category, item.type, lensGroupForItem(item), item.code, item.notes, item.requires]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
