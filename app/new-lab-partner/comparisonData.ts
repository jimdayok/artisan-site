import type { LensId } from "./onboardingData";

export type ComparisonColumn = {
  lensId: LensId;
  label: string;
  workbookName?: string;
  logo?: string;
};

export type ProductComparisonRow = {
  category: string;
  values: Record<string, string>;
};

export type ArComparisonRow = {
  need: string;
  category: string;
  values: Record<string, string>;
};

export const comparisonColumns: ComparisonColumn[] = [
  { lensId: "artisan", label: "Artisan", workbookName: "Artisan", logo: "/aln_4c_logo.png" },
  { lensId: "iot", label: "IOT", workbookName: "IOT", logo: "/iot-logo.png" },
  { lensId: "unity", label: "Unity", workbookName: "Unity", logo: "/unity-logo.png" },
  { lensId: "varilux", label: "Varilux", workbookName: "Varilux", logo: "/varilux-logo.png" },
  { lensId: "shamir", label: "Shamir", workbookName: "Shamir", logo: "/shamir-logo.png" },
  { lensId: "hoya", label: "Hoya", logo: "/hoya-logo.png" },
  { lensId: "tokai", label: "Tokai", logo: "/tokai-logo.png" },
  { lensId: "sequel", label: "Sequel", logo: "/logos/Sequel_Wordmark_RGB_Black.png" },
  { lensId: "neurolens", label: "Neurolens", logo: "/neurolens-logo.png" },
];

export const productComparisonRows: ProductComparisonRow[] = [
  {
    category: "Premium / customized progressive",
    values: {
      artisan: "DS Stable",
      iot: "Camber Steady Plus",
      unity: "V3 Elite",
      varilux: "XR Design",
      shamir: "Intelligence",
    },
  },
  {
    category: "Advanced progressive",
    values: {
      artisan: "PS Steady",
      iot: "Endless Steady",
      unity: "V3 Plus",
      varilux: "X Design",
      shamir: "Autograph III",
    },
  },
  {
    category: "Everyday progressive",
    values: {
      artisan: "GS Balance",
      iot: "Essential Steady",
      unity: "V3",
      varilux: "Comfort Max",
      shamir: "InTouch",
    },
  },
  {
    category: "Standard / classic progressive",
    values: {
      artisan: "CFB",
      unity: "Ethos",
      varilux: "Comfort DRx",
      shamir: "Genesis HD",
    },
  },
  {
    category: "Anti-fatigue",
    values: {
      artisan: "SD Concept",
      iot: "Endless Plus",
      unity: "Relieve",
      varilux: "Eyezen",
      shamir: "Relax",
    },
  },
  {
    category: "Office / workspace",
    values: {
      artisan: "SD Reach",
      iot: "Endless Office",
      unity: "Via Office Pro",
      varilux: "Immersia",
      shamir: "Workspace",
    },
  },
];

export const arComparisonRows: ArComparisonRow[] = [
  {
    need: "Low reflectance",
    category: "D",
    values: {
      Artisan: "Nytopia",
      Crizal: "Sapphire",
      Glacier: "Expressions",
    },
  },
  {
    need: "Blue light",
    category: "D",
    values: {
      Artisan: "Azure",
      TechShield: "TechShield Blue",
      Crizal: "Prevencia",
    },
  },
  {
    need: "Ultra durable",
    category: "D",
    values: {
      Artisan: "Armour",
      TechShield: "TechShield Elite",
      Crizal: "Rock",
      Glacier: "Glacier Plus",
    },
  },
  {
    need: "Premium",
    category: "C",
    values: {
      Artisan: "Emerald",
      TechShield: "TechShield Plus",
      Crizal: "Easy Plus",
      Glacier: "Glacier",
    },
  },
  {
    need: "Value",
    category: "B",
    values: {
      Artisan: "Standard",
      TechShield: "TechShield",
      Crizal: "Easy",
    },
  },
];

export const arComparisonColumns = ["Artisan", "TechShield", "Crizal", "Glacier"];
