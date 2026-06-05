"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RingsAccent from "../components/RingsAccent";
import SiteIcon from "../components/SiteIcon";
import ArTransitionLink from "../components/ArTransitionLink";
import VideoGallery, { type VideoGalleryItem } from "../components/video-gallery";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const EXPERIENCE_FORM_URL = "https://form.typeform.com/to/iGoDcWlY";
const EXPERIENCE_POPUP_STORAGE_KEY = "artisanExperiencePopupDismissed";

const fadeInSection = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

type ResourceType = "Form" | "Download" | "Tool" | "Video" | "External" | "Treatment";

type ResourceItem = {
  title: string;
  type: ResourceType;
  description: string;
  cta: string;
  href: string;
  icon?: string;
  logo?: string;
  logoAlt?: string;
  pending?: boolean;
};

type ProductVisual = {
  src: string;
  alt: string;
  label: string;
  href?: string;
};

type FeaturedCard = {
  title: string;
  body: string;
  cta: string;
  href: string;
  type: ResourceType;
  icon?: string;
};

type BrandPanel = {
  id: string;
  label: string;
  logo: string;
  logoAlt: string;
  logoClass: string;
  intro: string;
  websiteHref: string;
  featuredCta?: ResourceItem;
  visualTitle?: string;
  visualAssets?: ProductVisual[];
  resources: ResourceItem[];
};

type PracticeProgram = {
  title: string;
  icon: string;
  body: string;
  image?: string;
  imageAlt?: string;
  logos?: {
    src: string;
    alt: string;
  }[];
};

type LogoCard = {
  title: string;
  body: string;
  href: string;
  logo?: string;
  logoAlt?: string;
  logoText?: string;
  logoSize?: "wide" | "small" | "tall";
  logoScale?: "scale-100" | "scale-[1.15]" | "scale-[1.25]" | "scale-[1.35]" | "scale-[1.5]" | "scale-[1.7]" | "scale-[1.8]";
  detail?: string;
  actions?: {
    label: string;
    href: string;
  }[];
  logos?: {
    src: string;
    alt: string;
  }[];
};

type SingleLogoCard = LogoCard & {
  logo: string;
  logoAlt: string;
};

type DownloadResourceItem = {
  title: string;
  description: string;
  label: string;
  filename?: string;
  externalHref?: string;
  cta?: string;
  logo?: string;
  logoAlt?: string;
  placeholder?: boolean;
  category?: ResourceCategory;
  vendor?: ResourceVendor;
};

type DownloadResourceSection = {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
  logo?: string;
  logoAlt?: string;
  logoClass?: string;
  resources: DownloadResourceItem[];
  layoutCharts?: DownloadResourceItem[];
  treatments?: DownloadResourceItem[];
  unityRewards?: DownloadResourceItem[];
  training?: DownloadResourceItem[];
};

type ResourceCategory =
  | "Ordering"
  | "Pricing"
  | "Product Guides"
  | "Technical Guides"
  | "Safety"
  | "Training"
  | "Policies"
  | "Videos";

type ResourceVendor =
  | "Artisan"
  | "IOT"
  | "Tokai"
  | "HOYA"
  | "Unity"
  | "Neurolens"
  | "Shamir"
  | "Crizal"
  | "Varilux"
  | "TechShield"
  | "ChemClip";

type SearchableResource = ResourceItem & {
  category: ResourceCategory;
  vendor: ResourceVendor;
};

const localResourceFiles = new Set([
  "ArtisanDesigns/cds_bifocal.pdf",
  "ArtisanDesigns/diamond_series.pdf",
  "ArtisanDesigns/gold_series.pdf",
  "ArtisanDesigns/platinum_series.pdf",
  "ArtisanDesigns/ps_ultra_short.pdf",
  "ArtisanDesigns/sd_concept.pdf",
  "ArtisanDesigns/sd_digital.pdf",
  "ArtisanDesigns/sd_radius.pdf",
  "ArtisanDesigns/sd_reach.pdf",
  "artisan-design-series.pdf",
  "artisan-diamond-series-guide.pdf",
  "artisan-gold-series-guide.pdf",
  "artisan-platinum-series-guide.pdf",
  "sd-reach-individual-leaflet.pdf",
  "sd-reach-guide-2025.pdf",
  "modern-frame-book.pdf",
  "armou-rx-frame-book.pdf",
  "dvx-wileyx-frame-book.pdf",
  "wileyx-frame-book.pdf",
  "artcraft-frame-book.pdf",
  "safevision-frame-book.pdf",
  "tokai-select-guide.pdf",
  "tokai-bias-sv-guide.pdf",
  "tokai-reset-guide.pdf",
  "tokai-largo-guide.pdf",
  "tokai-tint-guide.pdf",
  "varilux-product-guide.pdf",
  "varilux-comfort.pdf",
  "404700_PRO_VAR.pdf",
  "401050_PRO_VAR-Varilux_Physio_Extensee_Scientific_Paper_FNL.pdf",
  "456102_PRO_ZAL.pdf",
  "462850_PRO_ZAL-Crizal_Product_Guide_2026_Update_with_Crizal_Natural_Look_LR.pdf",
  "hoya-product-guide.pdf",
  "hoya-centration-charts.pdf",
  "id-lifestyle-4-sales-aid_final_pn8159387.pdf",
  "iot-centration-charts.pdf",
  "iot-portfolio-guide.pdf",
  "iot-camber-pure.pdf",
  "camber-steady-plus.pdf",
  "endless-steady.pdf",
  "essential-steady.pdf",
  "iot-comparison-guide.pdf",
  "endless-office.pdf",
  "endless-plus.pdf",
  "endless-office-degression-chart.pdf",
  "neochromes-guide.pdf",
  "Shamir-Driver-Intelligence-Technical-Sheet.pdf",
  "unity-v3-sales-guide.pdf",
  "5688bc8-2e3-c061-3d27-251215283ac_Unity_V3_Whitepaper.pdf",
  "TechShield_AR_Coatings_Sales_Sheet_2023.pdf",
  "unity-performance-coatings_retirement_faqs.pdf",
  "unity-rewards-flyer.pdf",
  "unity-rewards-pecaa.pdf",
  "Neurolenses-proven-to-reduce-headache-symptoms.pdf",
  "chemcliporderform.pdf",
]);

const downloadResourceSections: DownloadResourceSection[] = [
  {
    id: "artisan-designs",
    title: "Artisan Designs & Treatments",
    eyebrow: "Centration Charts",
    description:
      "Download centration charts, fitting references, and Artisan AR treatment resources. These tools help confirm measurements, placement, treatment selection, and design recommendations before ordering.",
    logo: "/aln-icon.png",
    logoAlt: "Artisan Lab Network",
    logoClass: "h-14 w-14",
    resources: [
      {
        title: "Diamond Series",
        description: "Product leaflet for Diamond Series lens conversations and staff reference.",
        label: "Product Guide",
        filename: "artisan-diamond-series-guide.pdf",
      },
      {
        title: "Gold Series",
        description: "Product leaflet for Gold Series positioning and recommendations.",
        label: "Product Guide",
        filename: "artisan-gold-series-guide.pdf",
      },
      {
        title: "Platinum Series",
        description: "Product leaflet for Platinum Series premium design support.",
        label: "Product Guide",
        filename: "artisan-platinum-series-guide.pdf",
      },
      {
        title: "Artisan Design Series",
        description: "Overview guide for Artisan design families and recommendation support.",
        label: "Product Guide",
        filename: "artisan-design-series.pdf",
      },
      {
        title: "SD Reach Individual Leaflet",
        description: "Individual leaflet for SD Reach positioning and office-reader conversations.",
        label: "Product Guide",
        filename: "sd-reach-individual-leaflet.pdf",
      },
      {
        title: "SD Reach",
        description: "Current SD Reach guide for design recommendations and fitting context.",
        label: "Product Guide",
        filename: "sd-reach-guide-2025.pdf",
      },
    ],
    layoutCharts: [
      {
        title: "CDS Bifocal",
        description: "Centration and fitting reference for CDS Bifocal orders.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/cds_bifocal.pdf",
      },
      {
        title: "Diamond Series",
        description: "Measurement and placement guide for Diamond Series designs.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/diamond_series.pdf",
      },
      {
        title: "Gold Series",
        description: "Fitting reference for Gold Series lens design selection.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/gold_series.pdf",
      },
      {
        title: "Platinum Series",
        description: "Centration chart for Platinum Series ordering support.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/platinum_series.pdf",
      },
      {
        title: "PS Ultra Short",
        description: "Fitting reference for PS Ultra Short measurements and placement.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/ps_ultra_short.pdf",
      },
      {
        title: "SD Concept",
        description: "Centration chart for SD Concept lens designs.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/sd_concept.pdf",
      },
      {
        title: "SD Digital",
        description: "Fitting reference for SD Digital lens design placement.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/sd_digital.pdf",
      },
      {
        title: "SD Radius",
        description: "Centration guide for SD Radius ordering support.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/sd_radius.pdf",
      },
      {
        title: "SD Reach",
        description: "Fitting reference for SD Reach design selection and measurements.",
        label: "Layout Chart",
        filename: "ArtisanDesigns/sd_reach.pdf",
      },
    ],
    treatments: [
      {
        title: "Artisan Emerald",
        description: "Premium everyday AR clarity and comfort for strong everyday recommendations.",
        label: "Artisan Treatment",
        externalHref: "/artisan-ar/emerald",
        cta: "Learn More",
        logo: "/ar/emerald.png",
        logoAlt: "Artisan Emerald",
      },
      {
        title: "Artisan Nytopia",
        description: "Artisan's premium AR experience for advanced clarity, durability, and visual comfort.",
        label: "Artisan Treatment",
        externalHref: "/artisan-ar/nytopia",
        cta: "Learn More",
        logo: "/ar/nytopia.png",
        logoAlt: "Artisan Nytopia",
      },
      {
        title: "Artisan Armour",
        description: "Durable everyday AR performance for patients who need reliable clarity.",
        label: "Artisan Treatment",
        externalHref: "/artisan-ar/armour",
        cta: "Learn More",
        logo: "/ar/armour.png",
        logoAlt: "Artisan Armour",
      },
      {
        title: "Artisan Azure",
        description: "Balanced clarity and appearance with clean visual performance.",
        label: "Artisan Treatment",
        externalHref: "/artisan-ar/azure",
        cta: "Learn More",
        logo: "/ar/azure.png",
        logoAlt: "Artisan Azure",
      },
    ],
    training: [
      {
        title: "IOT Camber Steady Plus Training Video",
        description: "Training for Camber Steady Plus positioning, fitting, and practical dispensing conversations.",
        label: "Training",
        externalHref: "https://youtu.be/phvH3ahy2e4",
        cta: "View Video",
      },
    ],
  },
  {
    id: "iot",
    title: "IOT",
    eyebrow: "Artisan Lens Systems",
    description: "IOT and Artisan Lens Systems resources for design selection, centration, occupational lenses, and product comparisons.",
    logo: "/iot-logo.png",
    logoAlt: "IOT",
    logoClass: "max-h-14 max-w-[180px]",
    resources: [
      {
        title: "IOT Portfolio Guide",
        description: "Portfolio overview for IOT lens designs and platform options.",
        label: "IOT",
        filename: "iot-portfolio-guide.pdf",
      },
      {
        title: "IOT Camber Pure",
        description: "Camber Pure guide for IOT-powered lens recommendations.",
        label: "IOT",
        filename: "iot-camber-pure.pdf",
      },
      {
        title: "Camber Steady Plus",
        description: "Artisan Lens Systems guide for Camber Steady Plus recommendations.",
        label: "Artisan Lens Systems",
        filename: "camber-steady-plus.pdf",
      },
      {
        title: "Endless Steady",
        description: "Lens system reference for Endless Steady positioning and dispensing.",
        label: "Artisan Lens Systems",
        filename: "endless-steady.pdf",
      },
      {
        title: "Essential Steady",
        description: "Lens system reference for Essential Steady product selection.",
        label: "Artisan Lens Systems",
        filename: "essential-steady.pdf",
      },
      {
        title: "Product Comparison Guide",
        description: "Comparison guide for Artisan lens systems and recommendation paths.",
        label: "Artisan Lens Systems",
        filename: "iot-comparison-guide.pdf",
      },
      {
        title: "Endless Office",
        description: "Occupational lens guide for workspace-specific visual needs.",
        label: "Artisan Lens Systems",
        filename: "endless-office.pdf",
      },
      {
        title: "Endless Plus",
        description: "Lens system guide for Endless Plus product conversations.",
        label: "Artisan Lens Systems",
        filename: "endless-plus.pdf",
      },
      {
        title: "Endless Office Degression Chart",
        description: "Degression chart for fitting and explaining Endless Office options.",
        label: "Artisan Lens Systems",
        filename: "endless-office-degression-chart.pdf",
      },
      {
        title: "Neochromes",
        description: "Photochromic lens guide for Neochromes product conversations.",
        label: "Artisan Lens Systems",
        filename: "neochromes-guide.pdf",
      },
    ],
    layoutCharts: [
      {
        title: "IOT Centration Charts",
        description: "Fitting and centration charts for IOT-powered lens designs.",
        label: "Layout Chart",
        filename: "iot-centration-charts.pdf",
      },
    ],
  },
  {
    id: "tokai",
    title: "Tokai",
    eyebrow: "Lens Guides",
    description: "Tokai lens guides for material, design, tint, and reset conversations.",
    logo: "/tokai-logo.png",
    logoAlt: "Tokai",
    logoClass: "max-h-14 max-w-[180px]",
    resources: [
      {
        title: "Tokai Select Guide",
        description: "Overview guide for Tokai Select options and positioning.",
        label: "Tokai",
        filename: "tokai-select-guide.pdf",
      },
      {
        title: "Tokai Bi-AS SV Guide",
        description: "Single vision Bi-AS reference for fitting and product selection.",
        label: "Tokai",
        filename: "tokai-bias-sv-guide.pdf",
      },
      {
        title: "Tokai Reset Guide",
        description: "Tokai Reset resource for patient conversations and dispensing support.",
        label: "Tokai",
        filename: "tokai-reset-guide.pdf",
      },
      {
        title: "Tokai Largo Guide",
        description: "Tokai Largo guide for product positioning and lens selection.",
        label: "Tokai",
        filename: "tokai-largo-guide.pdf",
      },
      {
        title: "Tokai Tint Guide",
        description: "Tint reference for Tokai lens options and patient preferences.",
        label: "Tokai",
        filename: "tokai-tint-guide.pdf",
      },
    ],
    training: [
      {
        title: "Tokai Product Training",
        description: "Tokai product training for design selection, recommendation language, and dispensing support.",
        label: "Training",
        externalHref: "https://youtu.be/9P7VEmI0ZwY",
        cta: "View Video",
      },
    ],
  },
  {
    id: "varilux-crizal",
    title: "Varilux / Crizal",
    eyebrow: "Essilor Resources",
    description: "Premium Essilor lens and treatment guides for progressive and AR recommendations.",
    logo: "/varilux-logo.png",
    logoAlt: "Varilux",
    logoClass: "max-h-14 max-w-[190px]",
    resources: [
      {
        title: "Varilux Product Guide",
        description: "Portfolio guide for Varilux progressive lens recommendations.",
        label: "Varilux",
        filename: "varilux-product-guide.pdf",
      },
      {
        title: "Varilux Comfort",
        description: "Reference sheet for Varilux Comfort features and patient fit.",
        label: "Varilux",
        filename: "varilux-comfort.pdf",
      },
      {
        title: "Varilux Immersia Sales Aid",
        description: "Sales aid for positioning Varilux Immersia and guiding premium progressive conversations.",
        label: "Varilux",
        filename: "404700_PRO_VAR.pdf",
      },
      {
        title: "Varilux Physio Extensee Scientific Paper",
        description: "Scientific paper for Varilux Physio Extensee design context and clinical support.",
        label: "Varilux",
        filename: "401050_PRO_VAR-Varilux_Physio_Extensee_Scientific_Paper_FNL.pdf",
      },
    ],
    treatments: [
      {
        title: "Crizal Natural Product Information Sheet",
        description: "Product information sheet for Crizal Natural Look positioning and treatment conversations.",
        label: "Crizal",
        filename: "456102_PRO_ZAL.pdf",
        logo: "/varilux-logo.png",
        logoAlt: "Crizal",
      },
      {
        title: "Crizal Product Guide 2026",
        description: "Updated 2026 Crizal product guide including Crizal Natural Look.",
        label: "Crizal",
        filename: "462850_PRO_ZAL-Crizal_Product_Guide_2026_Update_with_Crizal_Natural_Look_LR.pdf",
        logo: "/varilux-logo.png",
        logoAlt: "Crizal",
      },
    ],
  },
  {
    id: "hoya",
    title: "Hoya",
    eyebrow: "Lens Resources",
    description: "Hoya product and fitting references for progressive lens conversations.",
    logo: "/hoya-logo.png",
    logoAlt: "Hoya",
    logoClass: "max-h-14 max-w-[190px]",
    resources: [
      {
        title: "Hoya Product Guide",
        description: "Portfolio guide for Hoya lens options and patient recommendations.",
        label: "Hoya",
        filename: "hoya-product-guide.pdf",
      },
      {
        title: "Hoya iD LifeStyle 4",
        description: "Product guide for Hoya iD LifeStyle 4 positioning and selection.",
        label: "Hoya",
        filename: "id-lifestyle-4-sales-aid_final_pn8159387.pdf",
      },
    ],
    layoutCharts: [
      {
        title: "Hoya Centration Charts",
        description: "Fitting and centration charts for Hoya lens dispensing.",
        label: "Layout Chart",
        filename: "hoya-centration-charts.pdf",
      },
    ],
  },
  {
    id: "shamir",
    title: "Shamir",
    eyebrow: "Lens Resources",
    description: "Shamir reference guides for fitting, dispensing, and specialty lens conversations.",
    logo: "/shamir-logo.png",
    logoAlt: "Shamir",
    logoClass: "max-h-14 max-w-[190px]",
    resources: [
      {
        title: "Driver Intelligence Technical Guide",
        description: "Technical guide for Shamir Driver Intelligence recommendations and dispensing context.",
        label: "Shamir",
        filename: "Shamir-Driver-Intelligence-Technical-Sheet.pdf",
      },
    ],
  },
  {
    id: "unity-vsp",
    title: "Unity / VSP",
    eyebrow: "Plan-Aligned Resources",
    description: "VSP-aligned product references and treatment resources for plan-friendly dispensing.",
    logo: "/unity-logo.png",
    logoAlt: "Unity",
    logoClass: "max-h-14 max-w-[190px]",
    resources: [
      {
        title: "Unity V3 Sales Guide",
        description: "Sales guide for Unity V3 lens positioning and plan conversations.",
        label: "Unity",
        filename: "unity-v3-sales-guide.pdf",
      },
      {
        title: "Unity V3 White Paper",
        description: "Technical white paper for Unity V3 performance and product context.",
        label: "Unity",
        filename: "5688bc8-2e3-c061-3d27-251215283ac_Unity_V3_Whitepaper.pdf",
      },
    ],
    unityRewards: [
      {
        title: "Unity Rewards Flyer",
        description: "Standard Unity Rewards program flyer and payout overview.",
        label: "Unity Rewards",
        filename: "unity-rewards-flyer.pdf",
        logo: "/logos/unity-rewards-logo.png",
        logoAlt: "Unity Rewards",
      },
      {
        title: "PECAA Max Unity Rewards Flyer",
        description: "PECAA Max Unity Rewards flyer and account-specific program overview.",
        label: "Unity Rewards",
        filename: "unity-rewards-pecaa.pdf",
        logo: "/logos/unity-rewards-logo.png",
        logoAlt: "Unity Rewards",
      },
    ],
    treatments: [
      {
        title: "TechShield AR Coatings Guide",
        description: "Treatment guide for TechShield AR recommendations.",
        label: "TechShield",
        filename: "TechShield_AR_Coatings_Sales_Sheet_2023.pdf",
        logo: "/logos/VSP_Vision_Logotype_RGB_Blk.png",
        logoAlt: "TechShield",
      },
      {
        title: "TechShield FAQ",
        description: "FAQ for the Unity performance coatings retirement and TechShield transition.",
        label: "TechShield",
        filename: "unity-performance-coatings_retirement_faqs.pdf",
        logo: "/unity-logo.png",
        logoAlt: "TechShield",
      },
    ],
    training: [
      {
        title: "Unity V3 Products",
        description: "Unity V3 product training for plan-friendly lens recommendations and team conversations.",
        label: "Training",
        externalHref: "https://youtu.be/cLhLfThS7Gs",
        cta: "View Video",
      },
    ],
  },
  {
    id: "newton",
    title: "Newton",
    eyebrow: "Neurolens and Sequel",
    description:
      "Newton products help practices support patients with visual comfort solutions, including Neurolens and Sequel lens technologies.",
    resources: [
      {
        title: "Neurolens Clinical Study",
        description: "Clinical study showing Neurolenses proven to reduce headache symptoms.",
        label: "Neurolens",
        filename: "Neurolenses-proven-to-reduce-headache-symptoms.pdf",
      },
    ],
  },
  {
    id: "specialty-systems",
    title: "Chemistrie",
    eyebrow: "Specialty Products",
    description: "Specialty system references for differentiated patient solutions and add-on workflows.",
    logo: "/chemistrie-logo.png",
    logoAlt: "Chemistrie",
    logoClass: "max-h-14 max-w-[190px]",
    resources: [
      {
        title: "ChemClip Order Form",
        description: "Used to accompany ChemClip orders to ensure clips are produced accurately.",
        label: "ChemClip",
        filename: "chemcliporderform.pdf",
      },
      {
        title: "Request ChemClip Demo Kit",
        description: "Request a ChemClip demo kit to support staff training and in-office patient conversations.",
        label: "ChemClip",
        externalHref: "https://form.typeform.com/to/XlZhJX5K",
        cta: "Request Demo Kit",
      },
    ],
  },
];

const systems: LogoCard[] = [
  {
    title: "Artisan Lens Systems",
    body: "Best-practice lens bundles with premium technology and cleaner pricing paths.",
    detail:
      "Artisan Lens Systems capture best-practice bundles using premium lens technologies, premium AR treatments, premium materials, and bundled pricing advantages. They are designed to help teams recommend with confidence and protect value without turning every sale into a custom spreadsheet.",
    href: "#iot",
    logo: "/aln-icon.png",
    logoAlt: "Artisan Lab Network",
    logoSize: "small",
    logoScale: "scale-[1.25]",
    actions: [
      { label: "Learn More About IOT Lens System and Technologies", href: "#iot" },
    ],
  },
  {
    title: "Frame Systems",
    body: "Simpler complete-pair pricing and easier patient product paths.",
    detail:
      "Frame systems help practices simplify complete pair pricing and create easy product paths for patients. Modern Optical is one example of a frame system that can support a clearer retail experience.",
    href: "#tools-ordering",
    logoScale: "scale-[1.7]",
  },
  {
    title: "Safety Systems",
    body: "A more complete path for practices serving employer-driven and occupational safety needs.",
    detail:
      "Safety Systems helps practices support employers, workers, and occupational eyewear programs with clearer ordering, demonstration materials, approved product paths, and program guidance.",
    href: "#tools-ordering",
    logoScale: "scale-[1.8]",
    actions: [
      { label: "Order Your Free Safety Kit", href: "https://form.typeform.com/to/rDUQssNn" },
      { label: "Download Brochures", href: "#product-information" },
      { label: "Request Current Program Pricing", href: "https://form.typeform.com/to/quuPCSff" },
    ],
  },
];

const systemResourceMap: Record<string, DownloadResourceItem[]> = {
  "Artisan Lens Systems": [
    {
      title: "IOT Portfolio Guide",
      description: "Portfolio overview for IOT lens designs and platform options.",
      label: "PDF",
      filename: "iot-portfolio-guide.pdf",
    },
    {
      title: "Product Comparison Guide",
      description: "Comparison guide for Artisan lens systems and recommendation paths.",
      label: "PDF",
      filename: "iot-comparison-guide.pdf",
    },
    {
      title: "IOT Camber Steady Plus Training Video",
      description: "Training for Camber Steady Plus positioning, fitting, and practical dispensing conversations.",
      label: "Video",
      externalHref: "https://youtu.be/phvH3ahy2e4",
      cta: "View Video",
    },
  ],
  "Frame Systems": [
    {
      title: "Modern Frame Book",
      description: "Modern Optical frame book for practice frame selection and staff reference.",
      label: "Frame Systems",
      filename: "modern-frame-book.pdf",
    },
    {
      title: "Modern Optical Sales",
      description: "Connect directly with Modern Optical sales to learn more about the frame program.",
      label: "Contact",
      externalHref: "mailto:cmillet@modernoptical.com?subject=Modern%20Optical%20Frame%20Program%20Inquiry",
      cta: "Email Modern Optical Sales to Learn More",
    },
    {
      title: "Request Current Program Pricing",
      description: "Request current complete-pair program details and account-specific pricing support.",
      label: "Action",
      externalHref: "https://form.typeform.com/to/quuPCSff",
      cta: "Request Pricing",
    },
  ],
  "Safety Systems": [
    {
      title: "ArmouRx Frame Book",
      description: "Safety frame catalog for ArmouRx product selection and occupational eyewear programs.",
      label: "Safety Systems",
      filename: "armou-rx-frame-book.pdf",
    },
    {
      title: "DVX / Wiley X Frame Book",
      description: "DVX and Wiley X frame options for safety, outdoor, and performance eyewear needs.",
      label: "Safety Systems",
      filename: "dvx-wileyx-frame-book.pdf",
    },
    {
      title: "Wiley X Frame Book",
      description: "Wiley X frame book for ANSI-rated and performance-focused eyewear conversations.",
      label: "Safety Systems",
      filename: "wileyx-frame-book.pdf",
    },
    {
      title: "ArtCraft Frame Book",
      description: "ArtCraft frame references for safety and specialty frame selection.",
      label: "Safety Systems",
      filename: "artcraft-frame-book.pdf",
    },
    {
      title: "SafeVision Frame Book",
      description: "SafeVision frame catalog for occupational eyewear and safety program support.",
      label: "Safety Systems",
      filename: "safevision-frame-book.pdf",
    },
    {
      title: "Order Your Free Safety Kit",
      description: "Request demonstration frames and safety program materials for your practice.",
      label: "Action",
      externalHref: "https://form.typeform.com/to/rDUQssNn",
      cta: "Order Kit",
    },
  ],
};

const orderingTools: LogoCard[] = [
  {
    title: "SpecCheck",
    body: "Account payment and lab workflow support.",
    href: "https://www.speccheckrx.com/",
    logo: "/logos/speccheck.png",
    logoAlt: "SpecCheck",
    logoScale: "scale-[1.35]",
  },
  {
    title: "Rx Wizard",
    body: "Ordering support for cleaner prescription workflows.",
    href: "https://www.dvirx.com/",
    logo: "/RXWizard-logo-color.png",
    logoAlt: "Rx Wizard",
    logoScale: "scale-[1.25]",
  },
  {
    title: "GoStock",
    body: "Search and source stock lenses through GoStock.",
    href: "https://www.globalopticsinc.com/gostock",
    logo: "/logos/gostock_logo.png",
    logoAlt: "GoStock",
    logoScale: "scale-100",
  },
  {
    title: "Safety Demonstration Frames",
    body: "Safety Systems, ArmourRx, and SafeVision support for practice demonstrations.",
    href: "https://form.typeform.com/to/rDUQssNn?typeform-source=www.artisanlabnetwork.com",
    logoScale: "scale-[1.5]",
  },
];

const vspSetupSteps = [
  {
    title: "Tell customer service first",
    body: "Practices should inform customer service they want to use Artisan Lab Network for VSP so the lab can set their account up.",
  },
  {
    title: "Add the lab in VSP",
    body: "After setup, add the lab inside VSP. In all instances, add Pacific Artisan Labs, even if you are using Pike Artisan Labs.",
  },
  {
    title: "Orders still route correctly",
    body: "VSP lists the Artisan labs under Pacific Artisan Labs. Orders will still route to the correct Artisan lab just like private pay orders.",
  },
];

const featuredCards: FeaturedCard[] = [
  {
    title: "Pricing & Policies",
    icon: "/icons/site/file-text.svg",
    body: "Get current price guides, policy details, and program support without waiting.",
    cta: "Request Pricing",
    href: "mailto:sales@artisanlabnetwork.com?subject=Pricing%20Guide%20Request",
    type: "Form",
  },
  {
    title: "Training & Account Review",
    icon: "/icons/site/users.svg",
    body: "Book onboarding, team training, or a focused account review.",
    cta: "Schedule Training",
    href: "mailto:sales@artisanlabnetwork.com?subject=Training%20Request",
    type: "Form",
  },
  {
    title: "Shipping & Logistics",
    icon: "/icons/site/wrench.svg",
    body: "Order shipping labels, track flow, and manage returns.",
    cta: "Request Labels",
    href: "mailto:customerservice@artisanlabnetwork.com?subject=Shipping%20Label%20Request",
    type: "Form",
  },
  {
    title: "Billing & Payments",
    icon: "/icons/site/monitor.svg",
    body: "Use lab payment tools and keep account tasks moving cleanly.",
    cta: "Go to Lab Pay",
    href: "https://www.speccheckrx.com/",
    type: "Tool",
  },
];

const mostUsedResources: ResourceItem[] = [
  {
    title: "Protect Lab Choice",
    icon: "/icons/site/badge-check.svg",
    type: "Tool",
    description:
      "Find legislators, generate advocacy letters, and support laboratory choice and Vision Benefit Manager reform.",
    cta: "Open Advocacy Center",
    href: "/advocacy",
  },
  {
    title: "Optical Engineering Center",
    icon: "/icons/site/monitor.svg",
    type: "Tool",
    description:
      "Professional optical calculators, lens thickness estimators, prism tools, compensation calculators, laboratory references, and engineering resources.",
    cta: "Launch Engineering Center",
    href: "/optical-engineering",
  },
  {
    title: "SpecCheck",
    icon: "/icons/site/monitor.svg",
    type: "Tool",
    description: "Open SpecCheck for lab workflow, billing, account payment, and support tools.",
    cta: "Open Tool",
    href: "https://www.speccheckrx.com/",
  },
  {
    title: "DVI RxWizard",
    icon: "/icons/site/monitor.svg",
    type: "Tool",
    description: "Access RxWizard for online ordering and prescription workflow support.",
    cta: "Open RxWizard",
    href: "https://www.dvirx.com/",
  },
  {
    title: "GoStock",
    icon: "/icons/site/library.svg",
    logo: "/logos/gostock_logo.png",
    logoAlt: "GoStock",
    type: "Tool",
    description: "Search and source stock lenses through GoStock and Global Optics.",
    cta: "Open GoStock",
    href: "https://www.globalopticsinc.com/gostock",
  },
  {
    title: "Price Lists",
    icon: "/icons/site/file-text.svg",
    type: "Tool",
    description: "Open confidential partner price lists for authorized Artisan customers.",
    cta: "Open Price Lists",
    href: "/portal/price-list/g6",
  },
  {
    title: "Policies",
    icon: "/icons/site/file-check.svg",
    type: "Tool",
    description: "Review Artisan policy guidance for remakes, redos, warranties, shipping, and frames.",
    cta: "Review Policies",
    href: "/policies",
  },
  {
    title: "Contact Support",
    icon: "/icons/site/message-circle.svg",
    type: "Form",
    description: "Reach the right customer service path when an order or account question needs help.",
    cta: "Contact Support",
    href: "#lab-customer-service",
  },
];

const accountTools: ResourceItem[] = [
  {
    title: "Request Pricing Guide",
    icon: "/icons/site/file-text.svg",
    type: "Form",
    description: "Ask for current pricing, program details, and policy guidance.",
    cta: "Request Pricing",
    href: "mailto:sales@artisanlabnetwork.com?subject=Pricing%20Guide%20Request",
  },
  {
    title: "Training Scheduler",
    icon: "/icons/site/users.svg",
    type: "Form",
    description: "Book onboarding, product training, or an account performance review.",
    cta: "Schedule Training",
    href: "mailto:sales@artisanlabnetwork.com?subject=Training%20Request",
  },
  {
    title: "Shipping Label Request",
    icon: "/icons/site/wrench.svg",
    type: "Form",
    description: "Request shipping labels and return support from the lab team.",
    cta: "Request Labels",
    href: "mailto:customerservice@artisanlabnetwork.com?subject=Shipping%20Label%20Request",
  },
  {
    title: "ChemClip Order Form",
    icon: "/icons/site/file-text.svg",
    type: "Download",
    description: "Download the order form used to accompany ChemClip orders for accurate clip production.",
    cta: "Download Form",
    href: "/files/chemcliporderform.pdf",
  },
  {
    title: "Request ChemClip Demo Kit",
    icon: "/icons/site/wrench.svg",
    type: "Form",
    description: "Request a demo kit to support in-office ChemClip demonstrations and staff training.",
    cta: "Request Kit",
    href: "https://form.typeform.com/to/XlZhJX5K",
  },
  {
    title: "SpecCheck Lab Pay",
    icon: "/icons/site/monitor.svg",
    type: "Tool",
    description: "Use SpecCheck for payment tools and account workflow support.",
    cta: "Go to Lab Pay",
    href: "https://www.speccheckrx.com/",
  },
  {
    title: "GoStock Lenses",
    logo: "/logos/gostock_logo.png",
    logoAlt: "GoStock",
    type: "Tool",
    description: "Search and source stock lenses through the GoStock lens marketplace.",
    cta: "Open GoStock",
    href: "https://www.globalopticsinc.com/gostock",
  },
];

const practicePrograms: PracticeProgram[] = [
  {
    title: "Artisan Designs & Treatments",
    icon: "/icons/site/library.svg",
    body: "Premium Artisan lens designs and AR treatment resources in one practical place for your team.",
  },
  {
    title: "Frame Systems",
    icon: "/icons/site/wrench.svg",
    body: "Resources for practices that want cleaner frame workflows and better patient handoffs.",
  },
  {
    title: "Safety Systems",
    icon: "/icons/site/badge-check.svg",
    logos: [
      { src: "/rings.png", alt: "Safety Systems" },
      { src: "/logos/armourrx.png", alt: "ArmourRx" },
      { src: "/logos/safevision.png", alt: "SafeVision" },
    ],
    body: "Program support for practices managing safety eyewear and employer-driven needs.",
  },
  {
    title: "Modern Frame",
    icon: "/icons/site/monitor.svg",
    body: "Tools for practices building a more intentional frame and lens buying experience.",
  },
];

const exclusivePrograms = [
  {
    title: "Special Programs Invitation",
    icon: "/icons/site/badge-check.svg",
    cta: "Explore Program",
    href: "https://form.typeform.com/to/WCU5ReWQ",
  },
  {
    title: "Mirror & Tint Kit",
    icon: "/icons/site/wrench.svg",
    cta: "Order Kit",
    href: "https://form.typeform.com/to/dE49qRpc",
  },
  {
    title: "Chemistrie Clip Kit",
    icon: "/icons/site/wrench.svg",
    cta: "Order Kit",
    href: "https://form.typeform.com/to/XlZhJX5K",
  },
  {
    title: "Artisan Intel Reports",
    icon: "/icons/site/monitor.svg",
    cta: "Get Reports",
    href: "https://form.typeform.com/to/NjtJJdFA",
  },
  {
    title: "Artisan Safety Systems Kits",
    icon: "/icons/site/badge-check.svg",
    cta: "Request Access",
    href: "https://form.typeform.com/to/rDUQssNn",
  },
];

const pricingAccessCards = [
  {
    title: "Access Private Price List",
    body: "Confidential pricing for authorized Artisan partners. Password required.",
    href: "/portal/price-list/g6",
    cta: "Open Price List",
  },
  {
    title: "Artisan Policies",
    body: "Official policy guide for warranties, remakes, redos, shipping, frame handling, coatings, canceled orders, multiple pair programs, and account support.",
    href: "/policies",
    cta: "Open Artisan Policies",
  },
];

const labCustomerServiceContacts = [
  {
    name: "Pacific Artisan Labs",
    phone: "877.390.6900",
    email: "customerservice@pacificartisanlabs.com",
    website: "/pacific-artisan-labs",
    meetHref: "/meet-the-artisans#pacific",
  },
  {
    name: "Peak Artisan Labs",
    phone: "833.690.4321",
    email: "customerservice@peakartisanlabs.com",
    website: "/peak-artisan-labs",
    meetHref: "/meet-the-artisans#peak",
  },
  {
    name: "Pike Artisan Labs",
    phone: "888.239.0303",
    email: "customerservice@pikeartisanlabs.com",
    website: "/pike-artisan-labs",
    meetHref: "/meet-the-artisans#pike",
  },
];

const practiceLookupRows = [
  ["Eyecare Associates Of Lebanon", "100 Mullins Dr Suite B3, Lebanon, OR 97355", "541-451-5808", "No", "Inactive Neurolens"],
  ["Peg - Kirkwood", "101 W Kirkwood Ave Suite 12, Bloomington, IN 47404", "812-954-4565", "No", "Active Neurolens"],
  ["Zionsville Eyecare", "1120 W. Oak St. Suite 100, Zionsville, IN 46077", "317-873-3000", "No", "Inactive Neurolens"],
  ["Eyecare Professionals P.C", "113 3Rd Ave Nw, Mandan, ND 58554", "701-663-2020", "No", "Inactive Neurolens"],
  ["Downeast 20/20", "113 Main Rd Suite 5, Holden, ME 4429", "207-393-2020", "No", "Inactive Neurolens"],
  ["Downeast 20/20", "113 Maine Rd Suite 5, Holden, ME", "207-393-2020", "No", "Inactive Neurolens"],
  ["Vail Vision", "1140 Edwards Village Blvd, Edwards, CO 81632", "970-926-8474", "No", "Inactive Neurolens"],
  ["Vqec - Geist", "13840 East 96Th St, Mccordsville, IN 46055", "317-720-2020", "No", "Active Neurolens"],
  ["Youth Vision Of Denver", "1400 Grove St, Denver, CO 80204", "303-825-2295", "No", "Inactive Neurolens"],
  ["Youth Vision Denver", "1400 Grove St, Denver, CO 80204", "303-825-2295", "No", "Inactive Neurolens"],
  ["Peg - Columbus", "1413 Washington St, Columbus, IN 47201", "812-372-1919", "No", "Inactive Neurolens"],
  ["Youth Vision Of Aurora", "14251 E 6Th Ave, Aurora, CO 80011", "303-343-3133", "No", "Inactive Neurolens"],
  ["Youth Vision Aurora", "14251 E. 6Th Ave, Aurora, CO 80011", "303-343-3133", "No", "Inactive Neurolens"],
  ["Carmel Eyecare", "14560 River Rd Suite 120, Carmel, IN 46033", "317-843-2020", "No", "Inactive Neurolens"],
  ["Acadia Eye Center", "15 Dirigo Drive, Brewer, ME 4412", "207-945-5891", "No", "Inactive Neurolens"],
  ["Ecotn - Crossville", "15 Iris Lane, Crossville, TN 38555", "931-456-2728", "No", "Inactive Neurolens"],
  ["Ecotn - Finish Lab", "15 Iris Lane, Crossville, TN 38555", "931-456-2728", "No", "Inactive Neurolens"],
  ["Williston Basin Eyecare Assoc", "1500 14Th St. W Suite 100, Williston, ND 58801", "701-577-3937", "No", "Inactive Neurolens"],
  ["Johnson Eyecare Pc", "1525 31St Ave Sw Ste E, Minot, ND 58701", "701-857-6050", "No", "Inactive Neurolens"],
  ["Johnson Eyecare Pc", "1525 31St Ave Sw Ste E, Minot, ND 58701", "701-857-6050", "No", "Active Neurolens"],
  ["Wind City Eye Care", "1526 Centennial Court, Casper, WY 82609", "307-237-6025", "No", "Inactive Neurolens"],
  ["Wind City Eye Care", "1526 Centennial Court, Casper, WY 82609", "307-237-6025", "No", "Active Neurolens"],
  ["Ridgeview Eyecare - Olathe", "18208 W 119Th St, Olathe, KS 66061", "913-261-8327", "No", "Active Neurolens"],
  ["White Spruce Optometry", "1900 Division St. W Suite 5, Bemidji, MN 56601", "218-759-1430", "No", "Inactive Neurolens"],
  ["Oregon Eye Phys & Surgeons", "20015 Sw Pacific Hwy Ste 150, Sherwood, OR 97140", "503-610-1025", "No", "Inactive Neurolens"],
  ["Prairie Vision Moorhead", "202 8Th St S, Moorhead, MN 56560", "218-233-2650", "No", "Active Neurolens"],
  ["20/20 Eyecare", "211 4Th St Ne Suite #1, Devils Lake, ND 58301", "701-662-2817", "No", "Inactive Neurolens"],
  ["20/20 Eyecare", "211 4Th St Ne Suite #1, Devils Lake, ND 58301", "701-662-2817", "No", "Inactive Neurolens"],
  ["Eyecare Associates Of Albany", "2119 Pacific Blvd Sw Ste 101, Albany, OR 97322", "541-926-5848", "No", "Inactive Neurolens"],
  ["Eyecare Associates Custom Eyes", "2119 Pacific Blvd Sw Ste 101, Albany, OR 97322", "541-928-2020", "No", "Inactive Neurolens"],
  ["Caec - Specs Eyewear", "2228 Union Lake Rd, Commerce Twp, MI 48382", "248-366-8600", "No", "Inactive Neurolens"],
  ["Caec - Vision Plus", "22371 Pontiac Trail, South Lyon, MI 48178", "248-437-7600", "No", "Inactive Neurolens"],
  ["Eyecare Associates Cvc", "227 Nw 3Rd St, Corvallis, OR 97330", "541-757-1120", "No", "Inactive Neurolens"],
  ["Eyecare Associates Nw", "2400 Nw Century Drive, Corvallis, OR 97330", "541-752-4622", "No", "Inactive Neurolens"],
  ["Denver Vision", "2535 S Lewis Way Suite 209, Lakewood, CO 80227", "303-937-8655", "No", "Inactive Neurolens"],
  ["Caec - Visions Optical", "2615 Orchard Lake Rd, Sylvan Lake, MI 48320", "248-682-6448", "No", "Inactive Neurolens"],
  ["Vqec - Greenwood", "2887 S St Rd 135, Greenwood, IN 46143", "317-865-6829", "No", "Active Neurolens"],
  ["Eyecare Associates Of Lc", "2930 Ne West Devils Lake Rd, Lincoln City, OR 97367", "541-614-0946", "No", "Inactive Neurolens"],
  ["Prairie Vision Wahpeton", "315 11Th Street N Suite E, Wahpeton, ND 58075", "701-642-4090", "No", "Active Neurolens"],
  ["Peg - Woodscrest", "322 S Woodscrest Dr, Bloomington, IN 47401", "812-332-2020", "No", "Active Neurolens"],
  ["Peg - Bedford", "3343 Michael Ave, Bedford, IN 47421", "812-279-3466", "No", "Inactive Neurolens"],
  ["Roaring Fork Vision", "341 Market St, Basalt, CO 81621", "970-927-2020", "No", "Inactive Neurolens"],
  ["Family Eye Center-Ontario", "350 E Lane South, Ontario, OR 97914", "541-889-2020", "No", "Inactive Neurolens"],
  ["20/20 Eyecare", "404 Hwy 2 E, Devils Lake, ND 58301", "701-662-4085", "No", "Inactive Neurolens"],
  ["The Eye Clinic", "404 Hwy 2 East, Devils Lake, ND 58301", "701-662-4085", "No", "Inactive Neurolens"],
  ["20/20 Eyecare", "404 Hwy 2 East, Devils Lake, ND 58301", "701-662-4085", "No", "Inactive Neurolens"],
  ["The Eye Clinic", "404 Hwy 2 East, Devils Lake, ND 58301", "701-662-4085", "Yes", "Active Neurolens"],
  ["Limestone Eye Care", "4320 W 6Th St, Lawrence, KS 66049", "785-842-1242", "No", "Inactive Neurolens"],
  ["Eyestyles Woodstock", "4441 Se Woodstock Blvd, Portland, OR 97206", "503-775-4550", "No", "Inactive Neurolens"],
  ["Peg - Richland Plaza", "4619 W Richland Plaza Dr, Bloomington, IN 47404", "812-332-3937", "No", "Inactive Neurolens"],
  ["Fvc - Ashman", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "No", "Active Neurolens"],
  ["Fvc - Gard", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "No", "Inactive Neurolens"],
  ["Fvc - Greenlee", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "No", "Active Neurolens"],
  ["Fvc - Mccaslin", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "Yes", "Inactive Neurolens"],
  ["Fvc - Nowakowski", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "No", "Inactive Neurolens"],
  ["Fvc - Wink Gallery", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "No", "Inactive Neurolens"],
  ["Fvc - Zgunda", "4801 W Bethel, Muncie, IN 47304", "765-288-7744", "No", "Active Neurolens"],
  ["Complete Family Vision Care", "5075 Ruffin Rd #B, San Diego, CA 92123", "858-278-4720", "No", "Active Neurolens"],
  ["Caec - Oakland Vision Wl", "519 N Pontiac Trail, Walled Lake, MI 48390", "248-624-1707", "No", "Inactive Neurolens"],
  ["Caec - Forest Place Optical", "550 Forest Ave Suite 12, Plymouth, MI 48170", "734-455-3340", "No", "Inactive Neurolens"],
  ["Carbon Valley Eye Care", "5900 Keyes St Suite 101, Frederick, CO 80504", "303-833-1056", "No", "Inactive Neurolens"],
  ["Eye Care Of Blackfoot", "593 W Bridge, Blackfoot, ID 83221", "208-782-3422", "No", "Active Neurolens"],
  ["Caec - Oakland Vision Of Sl", "608 N Lafayette St, South Lyon, MI 48178", "248-437-3351", "No", "Inactive Neurolens"],
  ["Caec - Eye Contact Vision Ctr", "7074 Highland Rd. Suite A, Waterford, MI 48327", "248-698-2000", "No", "Inactive Neurolens"],
  ["Eye Care Of Rigby", "711 Rigby Lake Dr Suite 301, Rigby, ID 83442", "208-745-0181", "No", "Active Neurolens"],
  ["Eyestyles Bridgeport", "7144 Sw Hazel Fern Rd, Portland, OR 97224", "503-372-5013", "No", "Inactive Neurolens"],
  ["Downeast 20/20", "766 Stillwater Ave Suite 1, Bangor, ME 4401", "207-393-2020", "No", "Inactive Neurolens"],
  ["Acadia Eye Center", "766 Stillwater Ave Suite 1, Bangor, ME 4401", "207-945-5891", "No", "Inactive Neurolens"],
  ["Acadia Eye Center", "766 Stillwater Avenue Ste 1, Bangor, ME 4401", "207-945-5891", "No", "Inactive Neurolens"],
  ["Drs. Dobbins & Letourneau Eye", "831 Vermont St, Lawrence, KS 66049", "785-843-5665", "No", "Active Neurolens"],
  ["Caec - Walton & Becker Oxford", "89 S Washington St, Oxford, MI 48371", "248-628-3441", "No", "Inactive Neurolens"],
  ["Hampden Youth Vision", "8964 E Hampden Ave Ste A, Denver, CO 80231", "720-866-9906", "No", "Inactive Neurolens"],
  ["Youth Vision Hampden", "8964 East Hampden Ave Unit A, Denver, CO 80231", "720-866-9906", "No", "Inactive Neurolens"],
  ["Valley Vision", "904 Pitkin Ave, Glenwood Springs, CO 81601", "970-945-6011", "No", "Inactive Neurolens"],
  ["Ridgeview Eyecare - Lenexa", "9479 Meadow View Dr, Lenexa, KS 66227", "913-261-8327", "No", "Active Neurolens"],
  ["Thornton Youth Vision", "9674 Washington St, Thornton, CO 80229", "303-450-0184", "No", "Inactive Neurolens"],
  ["Youth Vision Thornton", "9674 Washington St, Thornton, CO 80229", "303-953-8801", "No", "Inactive Neurolens"],
  ["Caec - Clarity Birmingham", "970 S. Old Woodward Ave., Birmingham, MI 48009", "248-369-3300", "No", "Inactive Neurolens"],
  ["Ecotn - Cookeville", "999 Guardian Way, Cookeville, TN 38501", "931-650-4100", "No", "Inactive Neurolens"],
  ["Pine Creek Vision Clinic", "Suite 200, Colorado Springs, CO 80920", "719-594-2020", "No", "Inactive Neurolens"],
] as const;

const practiceLookupData = practiceLookupRows.map(
  ([name, address, phone, tokaiUsage, neurolensStatus]) => ({
    name,
    address,
    phone,
    tokaiUsage,
    neurolensStatus,
    website: "",
  })
);

const featuredPracticeNames = new Set([
  "Peg - Kirkwood",
  "The Eye Clinic",
  "Fvc - Mccaslin",
  "Complete Family Vision Care",
  "Ridgeview Eyecare - Lenexa",
]);

const practiceMapPositions: Record<string, { left: string; top: string }> = {
  CA: { left: "13%", top: "63%" },
  CO: { left: "40%", top: "54%" },
  ID: { left: "26%", top: "34%" },
  IN: { left: "66%", top: "49%" },
  KS: { left: "51%", top: "58%" },
  ME: { left: "88%", top: "23%" },
  MI: { left: "69%", top: "36%" },
  MN: { left: "55%", top: "26%" },
  ND: { left: "47%", top: "24%" },
  OR: { left: "15%", top: "37%" },
  TN: { left: "65%", top: "66%" },
  WY: { left: "35%", top: "43%" },
};

const stateNames: Record<string, string> = {
  CA: "California",
  CO: "Colorado",
  ID: "Idaho",
  IN: "Indiana",
  KS: "Kansas",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  ND: "North Dakota",
  OR: "Oregon",
  TN: "Tennessee",
  WY: "Wyoming",
};

function getPracticeState(address: string) {
  return address.match(/,\s*([A-Z]{2})(?:\s+\d{4,5})?\s*$/)?.[1] ?? "";
}

function getPracticeZip(address: string) {
  return address.match(/\b\d{4,5}\b(?:-\d{4})?$/)?.[0] ?? "";
}

function getPracticeCity(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return "";
  return parts[parts.length - 2];
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/\D/g, "")}`;
}

const youtubeVideos: VideoGalleryItem[] = [
  {
    id: "phvH3ahy2e4",
    title: "IOT Product Training Webinar",
    category: "Training",
    href: "https://youtu.be/phvH3ahy2e4",
    description:
      "Training for Camber Steady Plus positioning, fitting, and practical dispensing conversations.",
  },
  {
    id: "9P7VEmI0ZwY",
    title: "Tokai Product Training",
    category: "Training",
    href: "https://youtu.be/9P7VEmI0ZwY",
    description:
      "Tokai product training for design selection, recommendation language, and dispensing support.",
  },
  {
    id: "m31iAw_qXek",
    title: "Vision Expo Round Table",
    category: "Education",
    href: "https://youtu.be/m31iAw_qXek",
    description:
      "A Vision Expo round table discussion for practice teams looking for broader product and industry context.",
  },
  {
    id: "cLhLfThS7Gs",
    title: "Unity V3 Products",
    category: "Product",
    href: "https://youtu.be/cLhLfThS7Gs",
    description:
      "Unity V3 product education for teams comparing plan-friendly lens options and recommending with confidence.",
  },
  {
    id: "eFw7BzI1SZY",
    title: "ALN | Camber Pure Training Webinar",
    category: "Training",
    href: "https://youtu.be/eFw7BzI1SZY",
    description:
      "A practical lens training session built to help independent practices understand positioning, fitting, and patient conversations.",
  },
  {
    id: "Rown4Yp9U4c",
    title: "Chemistrie Product Training",
    category: "Training",
    href: "https://youtu.be/Rown4Yp9U4c",
    description:
      "Chemistrie product training for clip options, dispensing conversations, and practical add-on support.",
  },
];

const resourceCategories: ResourceCategory[] = [
  "Ordering",
  "Pricing",
  "Product Guides",
  "Technical Guides",
  "Safety",
  "Training",
  "Policies",
  "Videos",
];

const resourceVendors: ResourceVendor[] = [
  "Artisan",
  "IOT",
  "Tokai",
  "HOYA",
  "Unity",
  "Neurolens",
  "Shamir",
  "Crizal",
  "Varilux",
  "TechShield",
  "ChemClip",
];

const troubleshootingResources: SearchableResource[] = [
  {
    title: "Non-Adapts",
    type: "Tool",
    category: "Technical Guides",
    vendor: "Artisan",
    description: "Practical triage for progressive, occupational, and specialty-lens non-adapts.",
    cta: "Read Guide",
    href: "/provider-resources/troubleshooting/non-adapts",
    icon: "/icons/site/wrench.svg",
  },
  {
    title: "Corridor Issues",
    type: "Tool",
    category: "Technical Guides",
    vendor: "Artisan",
    description: "Diagnose narrow corridors, swim, blur zones, and near/intermediate access complaints.",
    cta: "Read Guide",
    href: "/provider-resources/troubleshooting/corridor-issues",
    icon: "/icons/site/eye.svg",
  },
  {
    title: "Coating Concerns",
    type: "Tool",
    category: "Technical Guides",
    vendor: "TechShield",
    description: "Support for crazing, peeling, scratches, cleaning problems, and coating expectations.",
    cta: "Read Guide",
    href: "/provider-resources/troubleshooting/coating-concerns",
    icon: "/icons/site/shield-check.svg",
  },
  {
    title: "Frame Compatibility",
    type: "Tool",
    category: "Safety",
    vendor: "Artisan",
    description: "Check frame choice, groove depth, wrap, drill mounts, safety frames, and lens limits before ordering.",
    cta: "Read Guide",
    href: "/provider-resources/troubleshooting/frame-compatibility",
    icon: "/icons/site/layers.svg",
  },
  {
    title: "Measurement Errors",
    type: "Tool",
    category: "Technical Guides",
    vendor: "Artisan",
    description: "Find common PD, OC, seg-height, pantoscopic tilt, wrap, and vertex issues before they become remakes.",
    cta: "Read Guide",
    href: "/provider-resources/troubleshooting/measurement-errors",
    icon: "/icons/site/alert-circle.svg",
  },
  {
    title: "Progressive Troubleshooting",
    type: "Tool",
    category: "Technical Guides",
    vendor: "Artisan",
    description: "Step-by-step support for progressive complaints, fit verification, measurements, and remake decisions.",
    cta: "Read Guide",
    href: "/provider-resources/troubleshooting/progressive-troubleshooting",
    icon: "/icons/site/book-open.svg",
  },
];

const comingSoonMarketingResources = [
  "Social Posts",
  "Email Templates",
  "Posters",
  "Counter Cards",
  "Recall Campaigns",
  "Multiple-Pair Promotions",
];

function inferVendor(resource: DownloadResourceItem, section: DownloadResourceSection): ResourceVendor {
  const text = `${resource.title} ${resource.label} ${section.title}`.toLowerCase();
  if (text.includes("chem")) return "ChemClip";
  if (text.includes("techshield")) return "TechShield";
  if (text.includes("varilux")) return "Varilux";
  if (text.includes("crizal")) return "Crizal";
  if (text.includes("shamir")) return "Shamir";
  if (text.includes("neurolens") || text.includes("newton")) return "Neurolens";
  if (text.includes("unity") || text.includes("vsp")) return "Unity";
  if (text.includes("hoya")) return "HOYA";
  if (text.includes("tokai")) return "Tokai";
  if (text.includes("iot") || text.includes("camber") || text.includes("endless") || text.includes("neochromes")) return "IOT";
  return "Artisan";
}

function inferCategory(resource: DownloadResourceItem, groupTitle: string): ResourceCategory {
  const text = `${resource.title} ${resource.label} ${groupTitle}`.toLowerCase();
  if (text.includes("video") || resource.externalHref?.includes("youtu")) return "Videos";
  if (text.includes("training")) return "Training";
  if (text.includes("policy")) return "Policies";
  if (text.includes("price")) return "Pricing";
  if (text.includes("safety") || text.includes("frame book")) return "Safety";
  if (text.includes("centration") || text.includes("layout") || text.includes("technical") || text.includes("white paper") || text.includes("scientific") || text.includes("faq")) return "Technical Guides";
  if (text.includes("order") || text.includes("demo kit")) return "Ordering";
  return "Product Guides";
}

function downloadResourceToSearchable(
  resource: DownloadResourceItem,
  section: DownloadResourceSection,
  groupTitle: string
): SearchableResource {
  return {
    ...resourceToItem(resource),
    category: resource.category ?? inferCategory(resource, groupTitle),
    vendor: resource.vendor ?? inferVendor(resource, section),
  };
}

function buildSearchableResources(): SearchableResource[] {
  const downloadResources = downloadResourceSections.flatMap((section) => [
    ...availableResources(section.resources).map((resource) => downloadResourceToSearchable(resource, section, section.eyebrow)),
    ...availableResources(section.treatments ?? []).map((resource) => downloadResourceToSearchable(resource, section, "Treatments")),
    ...availableResources(section.layoutCharts ?? []).map((resource) => downloadResourceToSearchable(resource, section, "Layout Charts")),
    ...availableResources(section.unityRewards ?? []).map((resource) => downloadResourceToSearchable(resource, section, "Unity Rewards")),
    ...(section.training ?? []).map((resource) => downloadResourceToSearchable(resource, section, "Training")),
  ]);

  const quickResources: SearchableResource[] = [
    ...mostUsedResources.map((resource) => ({
      ...resource,
      category: resource.title.includes("Price") ? "Pricing" as ResourceCategory : resource.title.includes("Policies") ? "Policies" as ResourceCategory : "Ordering" as ResourceCategory,
      vendor: "Artisan" as ResourceVendor,
    })),
    ...troubleshootingResources,
  ];

  return [...quickResources, ...downloadResources];
}

function openExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function publicFileHref(filename: string) {
  return `/files/${filename
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  const eyebrowClass = tone === "dark" ? "text-[#c9b28b]" : "text-[#8a7654]";
  const titleClass = tone === "dark" ? "text-white" : "text-[#1f1a17]";
  const bodyClass = tone === "dark" ? "text-white/68" : "text-[#625b53]";

  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-4xl`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-4xl font-semibold tracking-tight md:text-5xl ${titleClass}`}>
        {title}
      </h2>
      <p className={`mt-5 text-lg leading-8 md:text-[1.15rem] ${bodyClass}`}>
        {description}
      </p>
    </div>
  );
}

function ResourceLabel({ type }: { type: ResourceType }) {
  return (
    <span className="inline-flex rounded-full border border-[#dbcdb9] bg-[#f8f2e9] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7654] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {type}
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-[#1f1a17] bg-[#1f1a17] text-white shadow-[0_10px_22px_rgba(24,18,13,0.14)]"
          : "border-[#d8cab7] bg-white text-[#625b53] hover:border-[#c9b28b] hover:bg-[#f3eadb] hover:text-[#1f1a17]"
      }`}
    >
      {label}
    </button>
  );
}

function ResourceDiscovery({ resources }: { resources: SearchableResource[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ResourceCategory[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<ResourceVendor[]>([]);

  const toggleCategory = (category: ResourceCategory) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const toggleVendor = (vendor: ResourceVendor) => {
    setSelectedVendors((current) =>
      current.includes(vendor)
        ? current.filter((item) => item !== vendor)
        : [...current, vendor]
    );
  };

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesQuery =
        !normalizedQuery ||
        `${resource.title} ${resource.vendor} ${resource.category} ${resource.description}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(resource.category);
      const matchesVendor =
        selectedVendors.length === 0 || selectedVendors.includes(resource.vendor);

      return matchesQuery && matchesCategory && matchesVendor;
    });
  }, [query, resources, selectedCategories, selectedVendors]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedVendors([]);
  };

  return (
    <div className="mt-10 rounded-[34px] border border-[#d8cab7] bg-[#fbf8f3] p-5 shadow-[0_20px_54px_rgba(24,18,13,0.08)] md:p-7">
      <label className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7654]" htmlFor="provider-resource-search">
        Search Resources
      </label>
      <input
        id="provider-resource-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title, vendor, category, or description"
        className="mt-3 min-h-14 w-full rounded-2xl border border-[#d8cab7] bg-white px-5 text-base text-[#1f1a17] outline-none transition placeholder:text-[#9b9186] focus:border-[#8a7654] focus:ring-4 focus:ring-[#d4c09a]/20"
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {resourceCategories.map((category) => (
              <FilterChip
                key={category}
                label={category}
                active={selectedCategories.includes(category)}
                onClick={() => toggleCategory(category)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
            Vendors
          </p>
          <div className="flex flex-wrap gap-2">
            {resourceVendors.map((vendor) => (
              <FilterChip
                key={vendor}
                label={vendor}
                active={selectedVendors.includes(vendor)}
                onClick={() => toggleVendor(vendor)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[#e4d7c6] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[#625b53]">
          Showing {filteredResources.length} of {resources.length} resources
        </p>
        {query || selectedCategories.length || selectedVendors.length ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex w-fit items-center rounded-full border border-[#d8cab7] bg-white px-4 py-2 text-sm font-semibold text-[#1f1a17] transition hover:border-[#c9b28b] hover:bg-[#f3eadb]"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredResources.slice(0, 18).map((resource) => (
          <ResourceCard
            key={`${resource.vendor}-${resource.category}-${resource.title}-${resource.href}`}
            item={{
              ...resource,
              description: `${resource.vendor} · ${resource.category}. ${resource.description}`,
            }}
            compact
          />
        ))}
      </div>
      {filteredResources.length > 18 ? (
        <p className="mt-5 text-sm leading-6 text-[#75664e]">
          Narrow the search or add filters to reduce the list. The first 18 matching resources are shown to keep the page fast on mobile.
        </p>
      ) : null}
      {filteredResources.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-[#e4d7c6] bg-white p-6 text-sm leading-7 text-[#625b53]">
          No resources match those filters. Try removing one vendor or category, or contact support if you expected to find something specific.
        </div>
      ) : null}
    </div>
  );
}

function ResourceLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  if (href.endsWith(".pdf")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  if (openExternal(href)) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function DownloadResourceCard({ resource }: { resource: DownloadResourceItem }) {
  const href = resource.filename ? publicFileHref(resource.filename) : resource.externalHref;
  const hasLocalFile = resource.filename ? localResourceFiles.has(resource.filename) : Boolean(resource.externalHref);

  return (
    <article className="group flex h-full flex-col rounded-[22px] border border-[#e4d7c6] bg-[linear-gradient(180deg,#fff,#fbf7f0)] p-5 shadow-[0_14px_34px_rgba(24,18,13,0.055)] transition duration-300 hover:-translate-y-1 hover:border-[#d8c095] hover:shadow-[0_22px_48px_rgba(24,18,13,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full border border-[#dbcdb9] bg-[#fbf8f3] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7654]">
          {resource.label}
        </span>
        {!hasLocalFile ? (
          <span className="rounded-full border border-[#e5d2b2] bg-[#fbf3df] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
            File pending
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-tight text-[#1f1a17]">
        {resource.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-[#625b53]">
        {resource.description}
      </p>
      {href && hasLocalFile ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#d9c9ae] bg-[#1f1a17] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(24,18,13,0.16)] transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#1f1a17]"
        >
          {resource.cta ?? "Download PDF"}
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span className="mt-6 inline-flex w-fit items-center rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#75664e]">
          File pending
        </span>
      )}
    </article>
  );
}

function ResourceMenuBar({
  activeSection,
  onSelect,
}: {
  activeSection: string;
  onSelect: (sectionId: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const updateScrollProgress = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      setScrollProgress(maxScroll <= 0 ? 100 : (scroller.scrollLeft / maxScroll) * 100);
    };

    updateScrollProgress();
    scroller.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      scroller.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  return (
    <div className="mt-10 rounded-[30px] border border-[#d8cab7] bg-white p-3 shadow-[0_20px_54px_rgba(24,18,13,0.08)] sm:p-4">
      <div className="mb-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
            Brand Finder
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#1f1a17]">
            Choose the brand you need
          </h3>
        </div>
        <p className="text-sm font-medium text-[#75664e]">
          Swipe or scroll for more options
        </p>
      </div>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Brand resource options"
        >
          {downloadResourceSections.map((item) => {
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold transition sm:px-5 ${
                  active
                    ? "border-[#1f1a17] bg-[#1f1a17] text-white shadow-[0_14px_30px_rgba(24,18,13,0.18)]"
                    : "border-[#eadfce] bg-[#fbf8f3] text-[#625b53] hover:border-[#d4c09a] hover:bg-[#f3eadb] hover:text-[#1f1a17]"
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#efe3d1]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#8a7654] transition-[width] duration-150"
            style={{ width: `${Math.max(14, scrollProgress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function resourceHref(resource: DownloadResourceItem) {
  return resource.filename ? publicFileHref(resource.filename) : resource.externalHref ?? "#";
}

function resourceIsAvailable(resource: DownloadResourceItem) {
  if (resource.placeholder) return false;
  return resource.filename ? localResourceFiles.has(resource.filename) : Boolean(resource.externalHref);
}

function availableResources(resources: DownloadResourceItem[]) {
  return resources.filter(resourceIsAvailable);
}

function resourceToItem(resource: DownloadResourceItem): ResourceItem {
  const available = resourceIsAvailable(resource);
  const isVideo = resource.externalHref?.includes("youtu") || resource.cta?.toLowerCase().includes("video");
  const isInternalLink = resource.externalHref?.startsWith("/");
  const isTreatment = resource.label.toLowerCase().includes("treatment");

  return {
    title: resource.title,
    type: isTreatment ? "Treatment" : isVideo ? "Video" : resource.externalHref && !isInternalLink ? "External" : "Download",
    description: resource.description,
    cta: resource.externalHref ? resource.cta ?? "View Resource" : "Download PDF",
    href: available ? resourceHref(resource) : "#",
    pending: !available,
    logo: resource.logo,
    logoAlt: resource.logoAlt,
  };
}

function ResourceSectionLogo({ section, compact = false }: { section: DownloadResourceSection; compact?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-[#e4d7c6] bg-white shadow-[0_10px_26px_rgba(24,18,13,0.05)] ${
        compact ? "h-16 w-24 p-3" : "h-[76px] w-fit min-w-[132px] px-5 py-3"
      }`}
    >
      {section.logo ? (
        <Image
          src={section.logo}
          alt={section.logoAlt ?? section.title}
          width={240}
          height={90}
          className={`${section.logoClass ?? "max-h-16 max-w-[210px]"} max-w-full object-contain`}
        />
      ) : (
        <span className="text-center text-sm font-semibold leading-tight text-[#1f1a17]">
          {section.title}
        </span>
      )}
    </div>
  );
}

function SelectedResourceSection({ section }: { section: DownloadResourceSection }) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const designsRef = useRef<HTMLDivElement | null>(null);
  const layoutChartsRef = useRef<HTMLDivElement | null>(null);
  const treatmentsRef = useRef<HTMLDivElement | null>(null);
  const unityRewardsRef = useRef<HTMLDivElement | null>(null);
  const [activeGroup, setActiveGroup] = useState<"designs" | "treatments" | "layoutCharts" | "unityRewards">("designs");
  const designResources = availableResources(section.resources);
  const treatmentResources = availableResources(section.treatments ?? []);
  const layoutChartResources = availableResources(section.layoutCharts ?? []);
  const unityRewardsResources = availableResources(section.unityRewards ?? []);
  const hasLayoutCharts = layoutChartResources.length > 0;
  const hasTreatments = treatmentResources.length > 0;
  const hasUnityRewards = unityRewardsResources.length > 0;

  useEffect(() => {
    requestAnimationFrame(() => {
      setActiveGroup("designs");
    });
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [section.id]);

  const scrollWithinPanel = (target: "designs" | "treatments" | "layoutCharts" | "unityRewards") => {
    setActiveGroup(target);
    const element =
      target === "designs"
        ? designsRef.current
        : target === "layoutCharts"
          ? layoutChartsRef.current
          : target === "unityRewards"
            ? unityRewardsRef.current
          : treatmentsRef.current;
    const container = contentRef.current;
    if (!element || !container) return;

    container.scrollTo({
      top: element.offsetTop - container.offsetTop,
      behavior: "smooth",
    });
  };

  return (
    <div id={`selected-resource-${section.id}`} className="scroll-mt-28">
      <div className="mt-8 hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_24px_64px_rgba(24,18,13,0.08)] md:block md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <div className="flex flex-col items-start gap-5">
              <ResourceSectionLogo section={section} />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                  Selected Brand
                </p>
                <h3 className="mt-4 text-4xl font-semibold tracking-tight">
                  {section.title}
                </h3>
              </div>
            </div>
            <p className="mt-5 text-lg leading-8 text-[#625b53]">
              {section.description}
            </p>
            {hasTreatments || hasLayoutCharts || hasUnityRewards ? (
              <div className="mt-7 inline-flex rounded-full border border-[#d8c6a8] bg-[#fbf8f3] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                {[
                  ["designs", "Designs"],
                  ...(hasTreatments ? ([["treatments", "Treatments"]] as const) : []),
                  ...(hasLayoutCharts ? ([["layoutCharts", "Layout Charts"]] as const) : []),
                  ...(hasUnityRewards ? ([["unityRewards", "Unity Rewards"]] as const) : []),
                ].map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => scrollWithinPanel(mode as "designs" | "treatments" | "layoutCharts" | "unityRewards")}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                      activeGroup === mode
                        ? "bg-[#1f1a17] text-white shadow-[0_10px_22px_rgba(24,18,13,0.16)]"
                        : "text-[#625b53] hover:bg-white hover:text-[#1f1a17]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div ref={contentRef} className="max-h-[760px] space-y-8 overflow-y-auto pr-2 [scrollbar-color:#8a7654_#efe3d1] [scrollbar-width:thin]">
            <ResourceGroup
              ref={designsRef}
              eyebrow={section.eyebrow}
              title="Lens Designs"
              resources={designResources}
              sectionId={section.id}
            />
            {treatmentResources.length ? (
              <ResourceGroup
                ref={treatmentsRef}
                eyebrow="AR Treatments"
                title="Treatments"
                resources={treatmentResources}
                sectionId={`${section.id}-treatments`}
              />
            ) : null}
            {layoutChartResources.length ? (
              <ResourceGroup
                ref={layoutChartsRef}
                eyebrow="Layout Charts"
                title="Layout Charts"
                resources={layoutChartResources}
                sectionId={`${section.id}-layout-charts`}
              />
            ) : null}
            {unityRewardsResources.length ? (
              <ResourceGroup
                ref={unityRewardsRef}
                eyebrow="VSP Unity Rewards"
                title="Unity Rewards"
                resources={unityRewardsResources}
                sectionId={`${section.id}-unity-rewards`}
              />
            ) : null}
            {section.training?.length ? (
              <ResourceGroup
                eyebrow="Training"
                title="Training Resources"
                resources={section.training}
                sectionId={`${section.id}-training`}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const ResourceGroup = forwardRef(function ResourceGroup(
  {
    eyebrow,
    title,
    resources,
    sectionId,
  }: {
    eyebrow: string;
    title: string;
    resources: DownloadResourceItem[];
    sectionId: string;
  },
  ref: Ref<HTMLDivElement>
) {
  return (
    <div ref={ref} className="scroll-mt-32">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
            {eyebrow}
          </p>
          <h4 className="mt-1 text-2xl font-semibold tracking-tight text-[#1f1a17]">
            {title}
          </h4>
        </div>
        <p className="text-sm font-medium text-[#75664e]">
          {resources.length} {resources.length === 1 ? "resource" : "resources"}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <ResourceCard
            key={`${sectionId}-${resource.title}`}
            item={resourceToItem(resource)}
            compact
          />
        ))}
      </div>
    </div>
  );
});

function SystemResourceContainer({
  id,
  title,
  description,
  resources,
  logo,
  logoAlt,
  isOpen,
  onToggle,
}: {
  id: string;
  title: "Artisan Lens Systems" | "Frame Systems" | "Safety Systems";
  description: string;
  resources: DownloadResourceItem[];
  logo?: string;
  logoAlt?: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isBrandedSystem = title === "Frame Systems" || title === "Safety Systems";
  const launchReadyResources = availableResources(resources);

  return (
    <div
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_18px_44px_rgba(24,18,13,0.07)]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${id}-resources`}
        className="group grid w-full gap-5 p-5 text-left transition hover:bg-[#fffaf2] md:grid-cols-[220px_1fr_auto_auto] md:items-center md:p-6"
      >
        {isBrandedSystem ? (
          <BrandedSystemMark title={title} compact />
        ) : (
          <div className="flex min-h-[96px] items-center justify-center rounded-2xl border border-[#e4d7c6] bg-[#fbf8f3] px-5">
            <Image
              src={logo ?? "/aln-icon.png"}
              alt={logoAlt ?? title}
              width={160}
              height={110}
              className="h-16 w-16 object-contain"
            />
          </div>
        )}
        <span>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
            Artisan Systems
          </span>
          <span className="mt-2 block text-2xl font-semibold tracking-tight text-[#1f1a17] md:text-[1.7rem]">
            {title}
          </span>
          <span className="mt-2 block max-w-4xl text-sm leading-6 text-[#625b53]">
            {description}
          </span>
        </span>
        <span className="text-sm font-medium text-[#75664e]">
          {launchReadyResources.length} {launchReadyResources.length === 1 ? "resource" : "resources"}
        </span>
        <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-4 py-2 text-sm font-semibold text-[#1f1a17] transition group-hover:border-[#c9b28b] group-hover:bg-[#efe3d1]">
          {isOpen ? "Hide Resources" : "View Resources"}
          <span className="text-[#8a7654]" aria-hidden="true">{isOpen ? "−" : "+"}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`${id}-resources`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#eadfce] bg-[#fbf8f3]/70 p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {launchReadyResources.map((resource) => (
                  <ResourceCard
                    key={`${id}-${resource.title}`}
                    item={resourceToItem(resource)}
                    compact
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DownloadResourceSection({
  section,
  isOpen,
  onToggle,
}: {
  section: DownloadResourceSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      id={section.id}
      className="group scroll-mt-28 overflow-hidden rounded-[30px] border border-black/10 bg-[#fffdf9] shadow-[0_18px_48px_rgba(24,18,13,0.06)]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${section.id}-resources`}
        className="flex w-full cursor-pointer items-start justify-between gap-5 px-5 py-6 text-left md:px-7 md:py-7"
      >
        <span className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start">
          <span className="flex h-20 w-36 shrink-0 items-center justify-center rounded-2xl border border-[#e4d7c6] bg-white px-4 shadow-[0_12px_28px_rgba(24,18,13,0.06)]">
            {section.logo ? (
              <Image
                src={section.logo}
                alt={section.logoAlt ?? section.title}
                width={220}
                height={90}
                className={`${section.logoClass ?? "max-h-14 max-w-[170px]"} object-contain`}
              />
            ) : (
              <span className="text-lg font-semibold text-[#1f1a17]">{section.title}</span>
            )}
          </span>
          <span>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              {section.eyebrow}
            </span>
            <span className="mt-2 block text-2xl font-semibold tracking-tight text-[#1f1a17] md:text-3xl">
              {section.title}
            </span>
            <span className="mt-3 block max-w-3xl text-sm leading-7 text-[#625b53] md:text-base">
              {section.description}
            </span>
          </span>
        </span>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e2d2bb] bg-[#fbf8f3] text-2xl leading-none text-[#8a7654] transition group-hover:border-[#c9b28b] ${isOpen ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`${section.id}-resources`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#eadfce] bg-[#fbf8f3]/70 px-5 py-6 md:px-7 md:py-7">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.resources.map((resource) => (
                  <DownloadResourceCard key={`${section.id}-${resource.title}`} resource={resource} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

function ResourceCard({
  item,
  compact = false,
  premium = false,
}: {
  item: ResourceItem;
  compact?: boolean;
  premium?: boolean;
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-[0_16px_40px_rgba(24,18,13,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(24,18,13,0.12)] ${
        compact ? "rounded-[22px] p-5" : "rounded-[28px] p-6"
      } ${
        premium ? "bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,246,240,1))]" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,178,139,0.7),transparent)]" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {item.logo ? (
            <div className="flex h-16 min-w-36 items-center justify-center rounded-2xl border border-[#e1d4c2] bg-white px-4 shadow-[0_10px_26px_rgba(24,18,13,0.05)]">
              <Image
                src={item.logo}
                alt={item.logoAlt ?? item.title}
                width={220}
                height={100}
                className="max-h-12 w-auto max-w-[128px] object-contain"
              />
            </div>
          ) : item.icon ? (
            <SiteIcon
              src={item.icon}
              size="sm"
              className="h-11 w-11 border-[#e1d4c2] bg-[#fbf8f3]"
            />
          ) : null}
          <ResourceLabel type={item.type} />
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-[#fbf8f3] text-base text-[#b39766] transition group-hover:translate-x-0.5 group-hover:border-[#d8c095] group-hover:bg-[#f3eadb]">
          →
        </span>
      </div>
      <h3
        className={`${compact ? "mt-5 text-xl" : "mt-6 text-[1.7rem]"} font-semibold leading-tight text-[#1f1a17]`}
      >
        {item.title}
      </h3>
      <p className={`${compact ? "mt-2 leading-6" : "mt-3 leading-7"} flex-1 text-sm text-[#625b53]`}>{item.description}</p>
      {item.pending ? (
        <span className={`${compact ? "mt-5" : "mt-7"} inline-flex w-fit rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#75664e]`}>
          File pending
        </span>
      ) : (
        <ResourceLink
          href={item.href}
          className={`${compact ? "mt-5" : "mt-7"} inline-flex w-fit items-center gap-2 rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#1f1a17] transition hover:border-[#c9b28b] hover:bg-[#f0e5d5]`}
        >
          {item.cta}
          <span className="text-[#8a7654]">→</span>
        </ResourceLink>
      )}
    </article>
  );
}

function BrandWebsiteLink({ href }: { href: string }) {
  return (
    <ResourceLink
      href={href}
      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#75664e] underline decoration-[#c9b28b] underline-offset-4 transition hover:text-[#1f1a17]"
    >
      Visit Company Website <span className="text-[#8a7654]">→</span>
    </ResourceLink>
  );
}

function getProfessionalServiceLogoScale(system: LogoCard) {
  if (system.title === "Frame Systems" || system.title === "Safety Systems") {
    return "scale-[1.5]";
  }

  return system.logoScale ?? "";
}

function BrandedSystemMark({
  title,
  dark = false,
  compact = false,
}: {
  title: "Frame Systems" | "Safety Systems";
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`relative flex h-full ${compact ? "min-h-[96px]" : "min-h-[122px]"} w-full items-center justify-center overflow-hidden rounded-2xl border px-5 ${
      dark
        ? "border-white/10 bg-white"
        : "border-[#e4d7c6] bg-[#fbf8f3]"
    }`}>
      <Image
        src="/rings.png"
        alt=""
        width={260}
        height={260}
        className={`${compact ? "h-36 w-36" : "h-44 w-44"} absolute -right-10 -top-12 object-contain opacity-[0.105]`}
        aria-hidden="true"
      />
      <Image
        src="/rings.png"
        alt=""
        width={180}
        height={180}
        className={`${compact ? "h-28 w-28" : "h-36 w-36"} absolute -bottom-14 -left-12 rotate-180 object-contain opacity-[0.07]`}
        aria-hidden="true"
      />
      <div className="relative text-center">
        <p className="translate-y-1 font-alfons-brush text-[1.85rem] leading-none text-[#8a7654] md:text-[2.25rem]">
          Artisan
        </p>
        <p className={`mt-1.5 font-medium uppercase leading-[0.96] tracking-[0.075em] text-[#1f1a17] ${
          compact ? "text-[1.18rem] md:text-[1.38rem]" : "text-[1.55rem] md:text-[1.85rem]"
        }`}>
          {title}
        </p>
      </div>
    </div>
  );
}

function BrandLogo({ brand, compact = false }: { brand: BrandPanel; compact?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-[#e4d7c6] bg-white shadow-[0_10px_26px_rgba(24,18,13,0.05)] ${
        compact ? "h-16 w-24 p-3" : "h-[76px] w-fit min-w-[132px] px-5 py-3"
      }`}
    >
      <Image
        src={brand.logo}
        alt={brand.logoAlt}
        width={240}
        height={90}
        className={`${brand.logoClass} max-w-full object-contain`}
      />
    </div>
  );
}

function ProductVisualStrip({ title, assets }: { title: string; assets: ProductVisual[] }) {
  if (assets.length === 0) return null;

  return (
    <div className="mt-7 rounded-[24px] border border-[#e4d7c6] bg-[#fbf8f3] p-4 shadow-[0_12px_32px_rgba(24,18,13,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
        {title}
      </p>
      <div
        className={`mt-4 grid gap-3 ${
          assets.length === 2
            ? "sm:grid-cols-2"
            : assets.length === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-3"
        }`}
      >
        {assets.map((asset) => (
          asset.href?.startsWith("/artisan-ar/") ? (
            <ArTransitionLink
              key={asset.src}
              href={asset.href}
              logoSrc={asset.src}
              label={asset.label}
              className="flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-center shadow-[0_8px_20px_rgba(24,18,13,0.04)] transition hover:-translate-y-0.5 hover:border-[#d4c09a]"
            >
              <Image
                src={asset.src}
                alt={asset.alt}
                width={240}
                height={120}
                className="max-h-[78px] w-auto max-w-full object-contain"
              />
              <span className="mt-2 text-xs font-semibold text-[#625b53]">
                {asset.label}
              </span>
            </ArTransitionLink>
          ) : (
            <ResourceLink
              key={asset.src}
              href={asset.href ?? "#"}
              className="flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-center shadow-[0_8px_20px_rgba(24,18,13,0.04)]"
            >
            <Image
              src={asset.src}
              alt={asset.alt}
              width={220}
              height={120}
              className="max-h-[78px] w-auto max-w-full object-contain"
            />
            <span className="mt-2 text-xs font-semibold text-[#625b53]">
              {asset.label}
            </span>
            </ResourceLink>
          )
        ))}
      </div>
    </div>
  );
}

function OrderingToolCard({ tool }: { tool: LogoCard }) {
  const isSafety = tool.title === "Safety Demonstration Frames";
  const imageScale =
    tool.title === "SpecCheck"
      ? "scale-110"
      : tool.title === "Rx Wizard"
        ? "scale-125"
        : tool.title === "GoStock"
          ? "scale-95"
        : isSafety
          ? "scale-[1.35]"
          : "scale-100";

  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full min-h-[330px] flex-col rounded-[24px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.22)] transition hover:-translate-y-1.5 hover:border-[#d4c09a]/60 hover:bg-white/[0.09]"
    >
      <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-white px-6">
        {isSafety ? (
          <BrandedSystemMark title="Safety Systems" dark />
        ) : tool.logo ? (
          <Image
            src={tool.logo}
            alt={tool.logoAlt ?? tool.title}
            width={420}
            height={150}
            className={`${imageScale} w-auto object-contain ${
              isSafety ? "max-h-28 max-w-[88%]" : "max-h-20 max-w-[82%]"
            }`}
          />
        ) : (
          <span className="text-center text-2xl font-semibold text-[#1f1a17]">
            {tool.title}
          </span>
        )}
      </div>

      <h3 className="mt-6 text-xl font-semibold leading-tight text-white">
        {tool.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-white/68">
        {tool.body}
      </p>
      <span className="mt-7 inline-flex w-fit items-center rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a] group-hover:text-[#171311]">
        {isSafety ? "Order Demo Frames" : "Open"}
      </span>
    </a>
  );
}

function SystemAccordion({
  system,
  open,
  onToggle,
}: {
  system: LogoCard;
  open: boolean;
  onToggle: () => void;
}) {
  const featured = system.title === "Safety Systems";

  return (
    <article className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition hover:-translate-y-1 ${
      featured ? "border-[#c9b28b] md:col-span-3" : "border-black/10"
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className={`grid w-full gap-5 p-6 text-left md:p-7 ${
          featured ? "md:grid-cols-[260px_1fr_auto] md:items-center" : ""
        }`}
        aria-expanded={open}
      >
        <div className="flex h-24 items-center justify-center rounded-2xl border border-[#e4d7c6] bg-[#fbf8f3] px-5">
          {system.title === "Frame Systems" || system.title === "Safety Systems" ? (
            <BrandedSystemMark title={system.title} />
          ) : system.logo ? (
            <Image
              src={system.logo}
              alt={system.logoAlt ?? system.title}
              width={320}
              height={120}
              className={`${system.logoScale ?? ""} max-h-16 w-auto max-w-full object-contain`}
            />
          ) : (
            <span className="text-2xl font-semibold">{system.logoText ?? system.title}</span>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
            Practice System
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[#1f1a17] md:text-3xl">
            {system.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#625b53] md:text-base">
            {system.body}
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] text-2xl text-[#8a7654]">
          {open ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/10 px-6 pb-6 pt-5 md:px-7">
              <p className="max-w-4xl text-base leading-8 text-[#625b53]">
                {system.detail}
              </p>
              {system.actions ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {system.actions.map((action) => (
                    <ResourceLink
                      key={action.label}
                      href={action.href}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#1f1a17] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c9b28b] hover:text-[#1f1a17]"
                    >
                      {action.label}
                    </ResourceLink>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function PracticeLookupMap() {
  const [practiceSearch, setPracticeSearch] = useState("");
  const [activeState, setActiveState] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const normalizedSearch = practiceSearch.trim().toLowerCase();
  const featuredPractices = useMemo(
    () => practiceLookupData.filter((practice) => featuredPracticeNames.has(practice.name)).slice(0, 5),
    []
  );
  const practiceResults = useMemo(() => {
    const source = !normalizedSearch && !activeState ? featuredPractices : practiceLookupData;

    return source.filter((practice) => {
      const hasTokai = practice.tokaiUsage === "Yes";
      const hasNeurolens = practice.neurolensStatus === "Active Neurolens";
      const state = getPracticeState(practice.address);
      const matchesState = !activeState || state === activeState;
      if (!matchesState) return false;
      if (!normalizedSearch) return true;

      return [
        practice.name,
        practice.address,
        getPracticeCity(practice.address),
        state,
        stateNames[state] ?? "",
        getPracticeZip(practice.address),
        practice.phone,
        practice.website,
        hasTokai ? "tokai" : "",
        hasNeurolens ? "neurolens active neurolens" : "",
        "artisan partner",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [activeState, featuredPractices, normalizedSearch]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisibleCount(5);
    });
  }, [activeState, normalizedSearch]);

  const activeMapDots = useMemo(() => {
    const counts = new Map<string, number>();

    practiceResults.forEach((practice) => {
      const state = getPracticeState(practice.address);
      if (!state || !practiceMapPositions[state]) return;
      counts.set(state, (counts.get(state) ?? 0) + 1);
    });

    const maxCount = Math.max(1, ...counts.values());

    return Array.from(counts.entries()).map(([state, count]) => {
      const size = 22 + Math.round((count / maxCount) * 34);
      return {
        state,
        count,
        size,
        ...practiceMapPositions[state],
      };
    });
  }, [practiceResults]);

  const visiblePractices = practiceResults.slice(0, visibleCount);
  const canShowMore = visibleCount < practiceResults.length;
  const canCollapse = visibleCount > 5;

  return (
    <section id="find-a-practice" data-theme="light" className="bg-[#f2eee7] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <SectionHeader
            eyebrow="Practice Lookup"
            title="Find a practice in the Artisan network"
            description="Search the lookup data by practice name, city, state, ZIP code, address, Tokai, or Neurolens. Start with a few featured examples, then search or select a map circle to reveal more."
          />
          <div className="rounded-[26px] border border-[#d8c6a8]/70 bg-white p-5 shadow-[0_18px_48px_rgba(24,18,13,0.08)]">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                Practice name, city, state, ZIP, address, Tokai, or Neurolens
              </span>
              <input
                type="search"
                value={practiceSearch}
                onChange={(event) => setPracticeSearch(event.target.value)}
                placeholder="Search practices, locations, or programs"
                className="mt-3 h-12 w-full rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] px-4 text-base font-semibold text-[#1f1a17] outline-none transition placeholder:text-[#8d8274] focus:border-[#8a7654] focus:bg-white"
              />
            </label>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#625b53]">
              <span>
                {normalizedSearch
                  ? `Showing ${practiceResults.length} matching practices`
                  : activeState
                    ? `Showing ${practiceResults.length} practices in ${stateNames[activeState] ?? activeState}`
                    : `Showing ${practiceResults.length} featured examples. Search to reveal more.`}
              </span>
              {activeState ? (
                <button
                  type="button"
                  onClick={() => setActiveState("")}
                  className="font-semibold text-[#8a7654] underline decoration-[#8a7654]/35 underline-offset-4 transition hover:text-[#1f1a17]"
                >
                  Clear {activeState}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="overflow-hidden rounded-[30px] border border-[#d8c6a8]/70 bg-[#1f1a17] p-5 text-white shadow-[0_24px_64px_rgba(24,18,13,0.15)] md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
                  Practice Heat Map
                </p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Circles are grouped by state and sized by result count.
                </p>
              </div>
              <p className="text-sm font-semibold text-white/72">
                {activeMapDots.reduce((total, dot) => total + dot.count, 0)} shown
              </p>
            </div>
            <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[22px] border border-white/10 bg-[#0f0c0b]">
              <Image
                src="/network-map.png"
                alt="United States practice result map"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-contain opacity-55 saturate-0"
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_45%,rgba(212,192,154,0.14),transparent_34%)]" />
              {activeMapDots.map((dot) => (
                <button
                  type="button"
                  key={dot.state}
                  onClick={() => setActiveState((current) => (current === dot.state ? "" : dot.state))}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                  style={{ left: dot.left, top: dot.top }}
                  aria-label={`Filter practices in ${stateNames[dot.state] ?? dot.state}`}
                >
                  <span
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg ${
                      activeState === dot.state ? "bg-[#d4c09a]/34" : "bg-[#d4c09a]/20"
                    }`}
                    style={{ width: dot.size + 18, height: dot.size + 18 }}
                  />
                  <span
                    className={`relative block rounded-full border shadow-[0_0_30px_rgba(212,192,154,0.45)] ${
                      activeState === dot.state ? "border-white/70 bg-[#ead7af]/90" : "border-[#fff4d6]/35 bg-[#d4c09a]/72"
                    }`}
                    style={{ width: dot.size, height: dot.size }}
                  />
                  <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/82 backdrop-blur-sm">
                    {dot.state}
                  </span>
                </button>
              ))}
            </div>
            {activeState ? (
              <button
                type="button"
                onClick={() => setActiveState("")}
                className="mt-4 text-sm font-semibold text-[#d4c09a] underline decoration-[#d4c09a]/40 underline-offset-4 transition hover:text-white"
              >
                Clear {activeState} map filter
              </button>
            ) : null}
          </div>
          <div className="rounded-[30px] border border-[#d8c6a8]/70 bg-white p-5 shadow-[0_24px_64px_rgba(24,18,13,0.09)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                Practice Results
              </p>
              <p className="text-sm text-[#625b53]">
                {Math.min(visibleCount, practiceResults.length)} of {practiceResults.length}
              </p>
            </div>
            <div className="grid max-h-[760px] gap-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {practiceResults.length > 0 ? (
              visiblePractices.map((practice, index) => {
                const hasTokai = practice.tokaiUsage === "Yes";
                const hasNeurolens = practice.neurolensStatus === "Active Neurolens";

                return (
                <article
                  key={`${practice.name}-${practice.phone}-${index}`}
                  className="rounded-[24px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5 shadow-[0_14px_34px_rgba(24,18,13,0.06)] transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-white md:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold leading-tight text-[#1f1a17]">
                        {practice.name}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#625b53]">
                        {practice.address}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <span className="inline-flex w-fit items-center rounded-full border border-[#d8c6a8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7654]">
                        Artisan Partner
                      </span>
                      {hasTokai ? (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7654]">
                          <Image src="/tokai-logo.png" alt="" width={52} height={18} className="h-4 w-auto object-contain" />
                          Tokai
                        </span>
                      ) : null}
                      {hasNeurolens ? (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7654]">
                          <Image src="/neurolens-logo.png" alt="" width={54} height={18} className="h-4 w-auto object-contain" />
                          Neurolens
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-[#d8c6a8]/55 pt-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8564]">
                        Phone
                      </p>
                      <a
                        href={phoneHref(practice.phone)}
                        className="mt-1 block text-sm font-semibold text-[#1f1a17] transition hover:text-[#8a7654]"
                      >
                        {practice.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8564]">
                        Website
                      </p>
                      {practice.website ? (
                        <a
                          href={practice.website}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-sm font-semibold text-[#1f1a17] transition hover:text-[#8a7654]"
                        >
                          {practice.website}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-[#625b53]">
                          Website not listed
                        </p>
                      )}
                    </div>
                  </div>
                </article>
                );
              })
            ) : (
              <div className="rounded-[22px] border border-dashed border-[#d8c6a8] bg-[#fbf8f3] p-6 text-sm leading-7 text-[#625b53]">
                Results will appear here. Try a different practice name, city, state, address, Tokai, or Neurolens.
              </div>
            )}
            </div>

            {practiceResults.length > 5 ? (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-[#d8c6a8]/55 pt-5">
                {canShowMore ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => Math.min(count + 5, practiceResults.length))}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#1f1a17]"
                  >
                    Show more ↓
                  </button>
                ) : null}
                {canCollapse ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(5)}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    Collapse ↑
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

          <div className="mt-6 rounded-[24px] border border-[#c9b28b] bg-[#1f1a17] p-5 text-white shadow-[0_18px_48px_rgba(24,18,13,0.15)]">
            <p className="text-sm leading-7 text-white/72">
              Need help finding a practice? Contact support.
            </p>
            <a
              href="mailto:customerservice@artisanlabnetwork.com?subject=Practice%20Lookup%20Support"
              className="mt-5 inline-flex rounded-full bg-[#d4c09a] px-5 py-2.5 text-sm font-semibold text-[#171311]"
            >
              Need help finding a practice? Contact support
            </a>
          </div>
      </div>
    </section>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#f5f1eb] shadow-2xl"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8a7654]">Contact</p>
                <h2 className="text-lg font-semibold text-[#1f1a17]">Contact Us</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-2xl leading-none text-[#1f1a17] transition hover:bg-[#1f1a17] hover:text-white"
                aria-label="Close contact form"
              >
                x
              </button>
            </div>
            <iframe
              src={CONTACT_FORM_URL}
              title="Contact Artisan Lab Network"
              className="min-h-0 flex-1 bg-[#f5f1eb]"
              allow="camera; microphone; autoplay; encrypted-media;"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function hasDismissedExperiencePopup() {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(EXPERIENCE_POPUP_STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

function markExperiencePopupDismissed() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(EXPERIENCE_POPUP_STORAGE_KEY, "true");
  } catch {
    // If storage is unavailable, still let the visitor continue without interruption.
  }
}

function ExperienceModal({
  open,
  onClose,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="artisan-experience-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close Artisan Experience modal"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-2xl rounded-[28px] border border-white/15 bg-[#f7f2ea] p-6 text-[#1f1a17] shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-xl leading-none text-black/65 transition hover:bg-[#1f1a17] hover:text-white"
              aria-label="Close Artisan Experience modal"
            >
              X
            </button>
            <div className="pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                Recognition
              </p>
              <h2
                id="artisan-experience-title"
                className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Your Artisan Experience
              </h2>
            </div>
            <div className="mt-6 space-y-4 text-base leading-8 text-[#625b53]">
              <p>
                Behind every great patient experience is a team working together. Your opticians lead the way, and our team supports by crafting lenses and helping solve vision challenges.
              </p>
              <p>
                When someone on our team makes your job easier or improves a patient’s experience, we want to recognize them.
              </p>
              <p>
                Share your Artisan Experience with our leadership team so we can celebrate great work and continue delivering exceptional outcomes.
              </p>
            </div>
            <a
              href={EXPERIENCE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onShare}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f1a17] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#1f1a17]"
            >
              Share Your Experience
            </a>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type ProviderResourcesPageProps = {
  showProfessionalEnhancements?: boolean;
};

export default function ProviderResourcesPage({
  showProfessionalEnhancements = true,
}: ProviderResourcesPageProps = {}) {
  const [openResourceSection, setOpenResourceSection] = useState(downloadResourceSections[0].id);
  const [openSystem, setOpenSystem] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const selectedResourceSection =
    downloadResourceSections.find((section) => section.id === openResourceSection) ??
    downloadResourceSections[0];
  const searchableResources = useMemo(() => buildSearchableResources(), []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!showProfessionalEnhancements || hasDismissedExperiencePopup()) {
        setShowExperienceModal(false);
        return;
      }
      setShowExperienceModal(true);
    });
  }, [showProfessionalEnhancements]);

  const dismissExperienceModal = () => {
    markExperiencePopupDismissed();
    setShowExperienceModal(false);
  };

  useEffect(() => {
    const scrollResourceSectionFromHash = () => {
      const hashId = window.location.hash.replace("#", "");
      const sectionId =
        hashId === "unity" ? "unity-vsp" :
        hashId === "varilux" ? "varilux-crizal" :
        hashId === "artisan" ? "artisan-designs" :
        hashId;
      const section = downloadResourceSections.find((item) => item.id === sectionId);

      if (!section) return;
      setOpenResourceSection(section.id);
      window.setTimeout(() => {
        document
          .getElementById(`selected-resource-${section.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    };

    scrollResourceSectionFromHash();
    window.addEventListener("hashchange", scrollResourceSectionFromHash);

    return () => window.removeEventListener("hashchange", scrollResourceSectionFromHash);
  }, []);

  const selectResourceSection = (sectionId: string) => {
    setOpenResourceSection(sectionId);
    window.setTimeout(() => {
      document
        .getElementById("product-information")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const scrollToUnityResources = () => {
    setOpenResourceSection("unity-vsp");
    window.setTimeout(() => {
      document
        .getElementById("product-information")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const scrollToUnityRewards = () => {
    setOpenResourceSection("unity-vsp");
    window.setTimeout(() => {
      document
        .getElementById("product-information")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} />
      <span id="modern-frame-system" className="sr-only" aria-hidden="true" />
      <span id="frame-systems" className="sr-only" aria-hidden="true" />
      <span id="modern-package-system" className="sr-only" aria-hidden="true" />
      <span id="speccheck" className="sr-only" aria-hidden="true" />
      <span id="safety-systems" className="sr-only" aria-hidden="true" />
      {downloadResourceSections.map((section) => (
        <span key={`anchor-${section.id}`} id={section.id} className="sr-only" aria-hidden="true" />
      ))}

      <section
        data-theme="light"
        className="relative overflow-hidden border-b border-[#e6d9c8] px-6 pb-20 pt-32 md:px-10 md:pb-28 md:pt-40"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,178,139,0.22),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.82),transparent_28%),linear-gradient(180deg,#f7f2ea_0%,#f5f1eb_60%,#f2ece3_100%)]" />
        <div className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full border border-[#e6d9c8]/80" />
        <div className="pointer-events-none absolute -left-24 bottom-4 h-80 w-80 rounded-full border border-[#e6d9c8]/80" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
              Provider Resources
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Practice resources that are easy to use.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#625b53] md:text-2xl md:leading-10">
              Clean access to practice systems, ordering tools, training, and support.
            </p>

            <div className="mt-10 rounded-[28px] border border-[#d8c6a8]/80 bg-[#fbf8f3]/82 p-2 shadow-[0_20px_50px_rgba(24,18,13,0.07)] backdrop-blur">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Systems", "#systems"],
                  ["Ordering Tools", "#tools-ordering"],
                  ["Pricing", "#pricing-access"],
                  ["Training", "#training-education"],
                  ["Customer Service", "#lab-customer-service"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e1d4c2] bg-white/70 px-4 py-2 text-center text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-white"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="mt-6 text-sm font-semibold text-[#75664e] underline decoration-[#c9b28b] underline-offset-4 transition hover:text-[#1f1a17]"
            >
              Need help finding something? Contact support
            </button>

            <div className="mt-6 max-w-2xl rounded-[24px] border border-[#d8c6a8]/80 bg-white/72 p-5 shadow-[0_16px_42px_rgba(24,18,13,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                Secure access
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[#625b53]">
                  Access your assigned price sheets, programs, and customer
                  resources securely.
                </p>
                <Link
                  href="/portal"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#171311]"
                >
                  Customer Portal Login
                </Link>
              </div>
            </div>
          </div>
          <motion.div
            {...fadeInSection}
            className="relative min-h-[320px] overflow-hidden rounded-2xl shadow-[0_26px_70px_rgba(24,18,13,0.16)] lg:min-h-[430px]"
          >
            <Image
              src="/images/eyewear-brochure-meeting-2022-1.jpg"
              alt="Eyewear brochure meeting for practice education and support"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section id="most-used-resources" className="border-b border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeader
              eyebrow="Most Used Resources"
              title="Fast paths for existing customers."
              description="Start here for the tools practices use every day: ordering, pricing, policies, and support."
            />

            <div className="grid gap-4 md:grid-cols-2">
              {mostUsedResources.map((item) => (
                <ResourceCard key={item.title} item={item} compact />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing-access" data-theme="light" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Partner Resources"
            title="Partner Pricing and Artisan Policies"
            description="Use these links for confidential partner pricing and official Artisan policy guidance. Private pricing pages require the current partner password. Artisan Policies are available as the official guide for lab policies, warranties, remakes, redos, shipping, frame handling, and account support."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {pricingAccessCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex min-h-56 flex-col rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition hover:-translate-y-1 hover:border-[#c9b28b] hover:shadow-[0_26px_62px_rgba(24,18,13,0.11)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                  Confidential Resource
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-[#1f1a17]">
                  {card.title}
                </h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-[#625b53]">
                  {card.body}
                </p>
                <span className="mt-6 inline-flex w-fit items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#d4c09a] group-hover:text-[#171311]">
                  {card.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="systems" data-theme="light" className="bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Systems"
            title="Three balanced systems for practice support."
            description="Each system has a clear role, clear next step, and enough context for your team to use it confidently."
          />
          <div className="mt-10 grid gap-5">
            <SystemResourceContainer
              id="artisan-lens-system-resources"
              title="Artisan Lens Systems"
              description={systems[0].detail ?? systems[0].body}
              resources={systemResourceMap["Artisan Lens Systems"]}
              logo="/aln-icon.png"
              logoAlt="Artisan Lab Network"
              isOpen={openSystem === "Artisan Lens Systems"}
              onToggle={() => setOpenSystem((current) => current === "Artisan Lens Systems" ? null : "Artisan Lens Systems")}
            />
            <SystemResourceContainer
              id="frame-system-resources"
              title="Frame Systems"
              description="Frame program resources for complete-pair conversations, product selection, and current account support."
              resources={systemResourceMap["Frame Systems"]}
              isOpen={openSystem === "Frame Systems"}
              onToggle={() => setOpenSystem((current) => current === "Frame Systems" ? null : "Frame Systems")}
            />
            <SystemResourceContainer
              id="safety-system-resources"
              title="Safety Systems"
              description="Safety program resources, frame catalogs, demos, and support paths for occupational eyewear programs."
              resources={systemResourceMap["Safety Systems"]}
              isOpen={openSystem === "Safety Systems"}
              onToggle={() => setOpenSystem((current) => current === "Safety Systems" ? null : "Safety Systems")}
            />
          </div>
        </div>
      </section>

      <section id="tools-ordering" data-theme="dark" className="bg-[#1f1a17] px-6 py-20 text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Tools and Ordering"
            title="Ordering tools without the clutter."
            description="Quick access to the tools practices use most often."
            tone="dark"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {orderingTools.map((tool) => (
              <OrderingToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section id="downloads-training" data-theme="light" className="bg-[#f6f1e9] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="VSP Setup"
            title="How to connect Artisan for VSP orders."
            description="VSP setup has one important naming detail. Follow these steps so orders route correctly."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="rounded-[28px] border border-[#d8c6a8]/70 bg-white p-8 text-center shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
              <Image
                src="/logos/VSP_Vision_Logotype_RGB_Blk.png"
                alt="VSP Vision"
                width={360}
                height={140}
                className="mx-auto max-h-24 w-auto max-w-full object-contain"
              />
              <Image
                src="/logos/VSP_V_Heart_Symbol_RGB_2x.png"
                alt="VSP heart icon"
                width={120}
                height={120}
                className="mx-auto mt-6 h-16 w-16 object-contain"
              />
            </div>
            <div className="grid gap-4">
              {vspSetupSteps.map((step, index) => (
                <article key={step.title} className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_16px_42px_rgba(24,18,13,0.06)]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f1a17] text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#625b53]">
                        {index === 0 ? (
                          <>
                            Practices should{" "}
                            <a href="#lab-customer-service" className="font-semibold text-[#8a7654] underline underline-offset-4">
                              inform customer service
                            </a>{" "}
                            they want to use Artisan Lab Network for VSP so the lab can set their account up.
                          </>
                        ) : (
                          step.body
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-[#d8c6a8]/70 pt-6 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={scrollToUnityResources}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2.5 text-center text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:bg-[#d4c09a]"
            >
              Learn more about Unity and TechShield
            </button>
            <button
              type="button"
              onClick={scrollToUnityRewards}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#1f1a17]"
            >
              Learn about VSP Unity Rewards
            </button>
          </div>
        </div>
      </section>

      {false && showProfessionalEnhancements ? (
        <motion.section
          {...fadeInSection}
          data-theme="light"
          className="relative overflow-hidden border-b border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20"
        >
          <div
            className="pointer-events-none absolute -right-28 -top-28 h-[420px] w-[420px] bg-contain bg-center bg-no-repeat opacity-[0.06]"
            style={{ backgroundImage: "url('/rings.png')" }}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                eyebrow="Professional Resources"
                title="Exclusive Programs & Resources"
                  description="Quick access to the programs, kits, and reports that help your team keep moving."
              />
              <p className="max-w-md text-sm leading-7 text-[#625b53]">
                Built for practices that need a clear next step, not another maze of links.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {exclusivePrograms.map((program) => (
                <a
                  key={program.title}
                  href={program.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-[#d4c09a] hover:shadow-[0_28px_64px_rgba(24,18,13,0.12)]"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <SiteIcon
                      src={program.icon}
                      size="sm"
                      className="h-11 w-11 border-[#e1d4c2] bg-[#fbf8f3]"
                    />
                    <div className="h-[2px] w-12 rounded-full bg-[#d4c09a]" />
                  </div>
                  <h3 className="text-2xl font-semibold leading-tight text-[#1f1a17]">
                    {program.title}
                  </h3>
                  <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#1f1a17] transition group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a]">
                    {program.cta}
                    <span>→</span>
                  </div>
                </a>
              ))}
              <Link
                href="/policies"
                className="group rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-[#d4c09a] hover:shadow-[0_28px_64px_rgba(24,18,13,0.12)]"
              >
                <div className="mb-5 flex items-center gap-4">
                  <SiteIcon
                    src="/icons/site/file-check.svg"
                    size="sm"
                    className="h-11 w-11 border-[#e1d4c2] bg-[#fbf8f3]"
                  />
                  <div className="h-[2px] w-12 rounded-full bg-[#d4c09a]" />
                </div>
                <h3 className="text-2xl font-semibold leading-tight text-[#1f1a17]">
                  Lab Remake, Redo and Warranty Policies
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#625b53]">
                  Review policy coverage, redo procedures, frame rules, shipping, and specialty job requirements.
                </p>
                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#1f1a17] transition group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a]">
                  Review Policies
                  <span>→</span>
                </div>
              </Link>
            </div>
          </div>
        </motion.section>
      ) : null}

      <section id="practice-tools" className="hidden bg-[#f6f1e9] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Practice Tools"
              title="Your resource command center."
              description="Start with the workflow you are trying to solve, then move directly into the right form, tool, or training asset."
            />
            <p className="max-w-xl text-base leading-7 text-[#625b53]">
              Designed for busy practices that need quick paths, not clutter.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredCards.map((card) => (
              <ResourceCard
                key={card.title}
                premium
                item={{
                  title: card.title,
                  type: card.type,
                  description: card.body,
                  cta: card.cta,
                  href: card.href,
                  icon: card.icon,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="hidden border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionHeader
              eyebrow="Most Used"
              title="The fastest paths to what practices usually need."
              description="Start here when the goal is speed. These are the requests and tools teams reach for most often."
            />

            <div className="grid gap-3">
              {mostUsedResources.map((item, index) => (
                <ResourceLink
                  key={item.title}
                  href={item.href}
                  className="group grid gap-4 rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,#fff,#f8f4ee)] p-6 shadow-[0_16px_40px_rgba(24,18,13,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(24,18,13,0.12)] md:grid-cols-[64px_1fr_auto] md:items-center"
                >
                  {item.icon ? (
                    <SiteIcon
                      src={item.icon}
                      className="h-14 w-14 rounded-full border-[#e6d9c8] bg-[#f0e5d5] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full border border-[#e6d9c8] bg-[#f0e5d5] text-sm font-semibold text-[#8a7654] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  )}
                  <div>
                    <ResourceLabel type={item.type} />
                    <h3 className="mt-3 text-[1.35rem] font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#625b53]">{item.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8a7654] transition group-hover:translate-x-1">
                    {item.cta}
                    <span>→</span>
                  </span>
                </ResourceLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hidden relative overflow-hidden bg-[#f5f1eb] px-6 py-20 md:px-10 md:py-24">
        <div
          className="pointer-events-none absolute -bottom-36 -left-32 h-[480px] w-[480px] bg-contain bg-center bg-no-repeat opacity-[0.055]"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Account Tools"
            title="Forms and tools for everyday account work."
            description="Keep common account tasks in one place so your team can move without digging."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {accountTools.map((item) => (
              <ResourceCard key={item.title} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="hidden bg-[#1f1a17] px-6 py-20 text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Practice Programs"
              title="Programs built to help your practice perform better."
              description="Build stronger retail conversations, cleaner workflows, and better team confidence."
              tone="dark"
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {practicePrograms.map((program) => (
              <article
                key={program.title}
                className="group rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#c9b28b]/50 hover:bg-white/[0.1] hover:shadow-[0_22px_48px_rgba(0,0,0,0.18)]"
              >
                <SiteIcon
                  src={program.icon}
                  tone="cream"
                  size="sm"
                  className="mb-5 h-12 w-12 border-white/12 bg-white/[0.08]"
                />
                {program.logos ? (
                  <div className="mb-5 grid min-h-[104px] grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white p-3">
                    {program.logos.map((logo) => (
                      <div key={logo.src} className="flex min-h-7 items-center justify-center">
                        <Image
                          src={logo.src}
                          alt={logo.alt}
                          width={220}
                          height={80}
                          className="max-h-8 w-auto max-w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ) : program.image ? (
                  <div className="mb-5 flex min-h-[70px] items-center justify-center rounded-2xl border border-white/10 bg-white p-3">
                    <Image
                      src={program.image}
                      alt={program.imageAlt ?? program.title}
                      width={220}
                      height={90}
                      className="max-h-[52px] w-auto max-w-full object-contain"
                    />
                  </div>
                ) : null}
                <h3 className="text-xl font-semibold leading-tight">{program.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{program.body}</p>
                <Link
                  href="/programs"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c9b28b] transition group-hover:translate-x-1"
                >
                  Learn More <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24" id="product-information">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Lens Brand Library"
            title="Find the brand first. Then find the exact resource."
            description="Curated by brand so your team does not have to sort through a giant pile of files."
          />

          <ResourceMenuBar
            activeSection={openResourceSection}
            onSelect={selectResourceSection}
          />

          <SelectedResourceSection section={selectedResourceSection} />

          <div className="mt-8 space-y-4 md:hidden">
            {downloadResourceSections.map((section) => {
              const isOpen = openResourceSection === section.id;

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_14px_36px_rgba(24,18,13,0.06)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenResourceSection(isOpen ? "" : section.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-lg font-semibold">{section.title}</span>
                    <span className="text-2xl leading-none text-[#8a7654]">{isOpen ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-black/10 px-5 pb-5 pt-4">
                          <div className="mb-4 flex items-center gap-4">
                            <ResourceSectionLogo section={section} compact />
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7654]">
                              Brand Resources
                            </p>
                          </div>
                          <p className="text-sm leading-7 text-[#625b53]">{section.description}</p>
                          <div className="mt-5 grid gap-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                              Lens Designs
                            </p>
                            {availableResources(section.resources).map((resource) => (
                              <ResourceCard
                                key={`${section.id}-mobile-${resource.title}`}
                                item={resourceToItem(resource)}
                                compact
                              />
                            ))}
                            {availableResources(section.treatments ?? []).length ? (
                              <>
                                <p className="pt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                                  Treatments
                                </p>
                                {availableResources(section.treatments ?? []).map((resource) => (
                                  <ResourceCard
                                    key={`${section.id}-mobile-treatment-${resource.title}`}
                                    item={resourceToItem(resource)}
                                    compact
                                  />
                                ))}
                              </>
                            ) : null}
                            {availableResources(section.layoutCharts ?? []).length ? (
                              <>
                                <p className="pt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                                  Layout Charts
                                </p>
                                {availableResources(section.layoutCharts ?? []).map((resource) => (
                                  <ResourceCard
                                    key={`${section.id}-mobile-layout-${resource.title}`}
                                    item={resourceToItem(resource)}
                                    compact
                                  />
                                ))}
                              </>
                            ) : null}
                            {availableResources(section.unityRewards ?? []).length ? (
                              <>
                                <p className="pt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                                  Unity Rewards
                                </p>
                                {availableResources(section.unityRewards ?? []).map((resource) => (
                                  <ResourceCard
                                    key={`${section.id}-mobile-unity-rewards-${resource.title}`}
                                    item={resourceToItem(resource)}
                                    compact
                                  />
                                ))}
                              </>
                            ) : null}
                            {section.training?.length ? (
                              <>
                                <p className="pt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                                  Training Resources
                                </p>
                                {section.training.map((resource) => (
                                  <ResourceCard
                                    key={`${section.id}-mobile-training-${resource.title}`}
                                    item={resourceToItem(resource)}
                                    compact
                                  />
                                ))}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="resource-directory" className="bg-[#f6f1e9] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Resource Search"
            title="Search and filter the full resource library."
            description="Use this lightweight directory when you know the resource type, vendor, product name, or workflow you need."
          />
          <ResourceDiscovery resources={searchableResources} />
        </div>
      </section>

      <section id="troubleshooting-best-practices" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Troubleshooting & Best Practices"
            title="Practical support before a job becomes a remake."
            description="First-pass guides for independent opticians and office staff handling common fit, measurement, coating, and progressive lens questions."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {troubleshootingResources.map((resource) => (
              <ResourceCard key={resource.href} item={resource} compact />
            ))}
          </div>
        </div>
      </section>

      <section id="marketing-practice-growth" className="bg-[#f6f1e9] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Marketing & Practice Growth Resources"
            title="Roadmap items coming soon."
            description="These resources are visible as a Phase 2 roadmap only. No placeholder links are attached until the assets are ready."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {comingSoonMarketingResources.map((title) => (
              <article
                key={title}
                className="rounded-[24px] border border-[#e4d7c6] bg-white p-6 shadow-[0_16px_40px_rgba(24,18,13,0.06)]"
              >
                <span className="inline-flex rounded-full border border-[#e5d2b2] bg-[#fbf3df] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                  Coming Soon
                </span>
                <h3 className="mt-5 text-xl font-semibold leading-tight text-[#1f1a17]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#625b53]">
                  Planned practice-growth asset. This card is intentionally not linked until the resource is complete.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <VideoGallery videos={youtubeVideos} />

      {showProfessionalEnhancements ? (
        <motion.section
          {...fadeInSection}
          id="lab-customer-service"
          data-theme="dark"
          className="relative overflow-hidden bg-[#171311] px-6 py-20 text-white md:px-10 md:py-24"
        >
          <RingsAccent position="top-right" size="lg" opacity="opacity-[0.045]" />
          <div className="relative z-10 mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Customer Service"
              title="Lab Customer Service Contacts"
              description="For practical order support, contact the lab team closest to your account."
              tone="dark"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {labCustomerServiceContacts.map((lab, index) => (
                <motion.article
                  key={lab.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
                  className="rounded-2xl border border-white/12 bg-white/[0.055] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#d4c09a]/45 hover:bg-white/[0.075] md:p-6"
                >
                  <h3 className="text-xl font-semibold text-white">{lab.name}</h3>
                  <div className="mt-5 space-y-4 text-sm leading-6 text-white/72">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4c09a]">
                        Phone
                      </p>
                      <a
                        href={phoneHref(lab.phone)}
                        className="mt-1 inline-flex text-base font-semibold text-white transition hover:text-[#d4c09a]"
                      >
                        {lab.phone}
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`mailto:${lab.email}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/8 px-3 py-2 text-center text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-[#171311]"
                      >
                        Email Customer Service
                      </a>
                      <a
                        href={lab.website}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/8 px-3 py-2 text-center text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-[#171311]"
                      >
                        Visit Lab Website
                      </a>
                      <Link
                        href={lab.meetHref}
                        className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-full border border-[#d4c09a]/45 bg-[#d4c09a] px-3 py-2 text-center text-xs font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
                      >
                        Meet Your Lab
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>
      ) : null}

      <section className="relative overflow-hidden border-t border-[#e7ddd0] bg-[linear-gradient(180deg,#fbf8f3_0%,#f5f1eb_100%)] px-6 py-20 md:px-10 md:py-24">
        <RingsAccent position="bottom-left" size="md" opacity="opacity-[0.045]" />
        <div className="relative z-10 mx-auto max-w-5xl rounded-[36px] border border-[#e1d4c2] bg-white p-8 text-center shadow-[0_24px_60px_rgba(24,18,13,0.08)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Support
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Need a fast answer from the right team?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#625b53]">
            Tell us what you are trying to solve and we will point you to the
            clearest next step quickly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9b28b] hover:text-[#1f1a17]"
            >
              Contact Support
            </button>
            <a
              href="mailto:sales@artisanlabnetwork.com?subject=Training%20Request"
              className="rounded-full border border-black/10 bg-[#fbf8f3] px-7 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-[#c9b28b]"
            >
              Schedule Training
            </a>
            <a
              href="mailto:customerservice@artisanlabnetwork.com?subject=Account%20Help%20Request"
              className="rounded-full border border-black/10 bg-[#fbf8f3] px-7 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-[#c9b28b]"
            >
              Request Account Help
            </a>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ExperienceModal
        open={showExperienceModal}
        onClose={dismissExperienceModal}
        onShare={dismissExperienceModal}
      />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
