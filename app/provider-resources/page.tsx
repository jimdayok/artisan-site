"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Layers3,
  LayoutGrid,
  LifeBuoy,
  MonitorCheck,
  PlayCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Wrench,
  X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { artisanControlClass, artisanSegmentClass, artisanSegmentGroupClass } from "../components/controlStyles";

type ResourceType =
  | "PDF"
  | "Tool"
  | "Video"
  | "Training"
  | "Policy"
  | "Marketing"
  | "Program"
  | "Guide";

type ResourceCategory =
  | "Lens Designs"
  | "Layout Charts"
  | "AR Coatings"
  | "Materials"
  | "Videos"
  | "Patient Materials"
  | "Troubleshooting"
  | "Technical Bulletins"
  | "FAQs"
  | "Ordering"
  | "Pricing"
  | "Programs"
  | "Display Tools";

type BrandId =
  | "artisan"
  | "iot"
  | "tokai"
  | "hoya"
  | "shamir"
  | "unity"
  | "varilux"
  | "chemistrie"
  | "newton"
  | "safety"
  | "frame";

type Resource = {
  title: string;
  description: string;
  href: string;
  type: ResourceType;
  category: ResourceCategory;
  brand: BrandId;
  brandLabel: string;
  cta?: string;
  tags: string[];
  popular?: boolean;
  newest?: boolean;
  staffPick?: boolean;
  previewImage?: string;
  previewAlt?: string;
};

type BrandLibrary = {
  id: BrandId;
  label: string;
  headline: string;
  description: string;
  accent: string;
  logo?: string;
  resources: Resource[];
};

const fileHref = (filename: string) =>
  `/files/${filename
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;

const external = (href: string) => href.startsWith("http") || href.startsWith("mailto:");

const resource = (
  brand: BrandId,
  brandLabel: string,
  category: ResourceCategory,
  type: ResourceType,
  title: string,
  description: string,
  href: string,
  tags: string[] = [],
  flags: Pick<Resource, "popular" | "newest" | "staffPick"> = {}
): Resource => ({
  brand,
  brandLabel,
  category,
  type,
  title,
  description,
  href,
  tags: [brandLabel, category, type, ...tags],
  ...flags,
});

const tokaiDisplayRequestHref = (displayTool: string) => {
  const subject = `Tokai Display Request * ${displayTool}`;
  const body = [
    `I am interested in this Tokai display tool: ${displayTool}`,
    "",
    "Account number:",
    "Location name:",
    "Address:",
    "State:",
    "",
    "Please send current pricing and availability.",
  ].join("\n");

  return `mailto:sales@artisanlabnetwork.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const tokaiDisplayResource = (
  title: string,
  description: string,
  image: string,
  tags: string[] = []
): Resource => ({
  ...resource("tokai", "Tokai", "Display Tools", "Tool", title, description, tokaiDisplayRequestHref(title), [
    "display",
    "tool",
    "quote",
    "Tokai display tools",
    ...tags,
  ]),
  cta: "Request current quote",
  previewImage: image,
  previewAlt: `${title} preview`,
});

const portalHighlights = [
  "Daily production reports",
  "Practice performance dashboard",
  "Interactive price guides",
  "Programs and promotions",
  "Practice Intelligence insights",
  "Order trends and benchmarking",
  "Account information and support",
  "Growth opportunities",
];

const orderingOptions = [
  {
    title: "DVI RxWizard",
    description:
      "Use RxWizard for online prescription ordering when your team wants a direct, structured order path into the lab.",
    bestFor: "Best for practices already working from DVI workflows or building a repeatable online ordering process.",
    href: "https://www.dvirx.com/",
    cta: "Open DVI",
    icon: MonitorCheck,
  },
  {
    title: "SpecCheck",
    description:
      "Use SpecCheck for lab workflow, billing, account payment, and order support tools connected to your Artisan relationship.",
    bestFor: "Best when you need ordering support plus account workflow visibility in one place.",
    href: "https://www.speccheckrx.com/",
    cta: "Open SpecCheck",
    icon: ClipboardCheck,
  },
  {
    title: "VisionWeb",
    description:
      "Use VisionWeb when your practice submits through VisionWeb and needs the correct Artisan lab connection approved.",
    bestFor: "Best for teams that already use VisionWeb as their insurance or order-entry workflow.",
    href: "https://www.visionweb.com/",
    cta: "Open VisionWeb",
    icon: Boxes,
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

const brandLibraries: BrandLibrary[] = [
  {
    id: "artisan",
    label: "Artisan",
    headline: "Artisan designs, treatments, and fitting references",
    description:
      "Start here for Artisan design families, AR treatment pages, and fitting charts used by opticians every day.",
    accent: "#0f766e",
    logo: "/aln-icon.png",
    resources: [
      resource("artisan", "Artisan", "Lens Designs", "PDF", "Diamond Series", "Premium design guide for Diamond Series patient conversations.", fileHref("artisan-diamond-series-guide.pdf"), ["progressive", "design"], { popular: true }),
      resource("artisan", "Artisan", "Lens Designs", "PDF", "Gold Series", "Product guide for Gold Series positioning and recommendations.", fileHref("artisan-gold-series-guide.pdf"), ["progressive", "design"]),
      resource("artisan", "Artisan", "Lens Designs", "PDF", "Platinum Series", "Premium design support for Platinum Series recommendations.", fileHref("artisan-platinum-series-guide.pdf"), ["progressive", "design"]),
      resource("artisan", "Artisan", "Lens Designs", "PDF", "Artisan Design Series", "Overview guide for Artisan design families and recommendation paths.", fileHref("artisan-design-series.pdf"), ["design", "quick guide", "progressive"]),
      resource("artisan", "Artisan", "Lens Designs", "PDF", "SD Reach", "Current SD Reach guide for office-reader and near-work recommendations.", fileHref("sd-reach-guide-2025.pdf"), ["office", "office lens", "occupational"]),
      resource("artisan", "Artisan", "Layout Charts", "PDF", "Diamond Series Layout Chart", "Measurement and placement guide for Diamond Series designs.", fileHref("ArtisanDesigns/diamond_series.pdf"), ["layout chart", "fitting"], { staffPick: true }),
      resource("artisan", "Artisan", "Layout Charts", "PDF", "Gold Series Layout Chart", "Fitting reference for Gold Series lens design selection.", fileHref("ArtisanDesigns/gold_series.pdf"), ["layout chart", "fitting"]),
      resource("artisan", "Artisan", "Layout Charts", "PDF", "Platinum Series Layout Chart", "Centration chart for Platinum Series ordering support.", fileHref("ArtisanDesigns/platinum_series.pdf"), ["layout chart", "fitting"]),
      resource("artisan", "Artisan", "Layout Charts", "PDF", "SD Digital Layout Chart", "Fitting reference for SD Digital lens placement.", fileHref("ArtisanDesigns/sd_digital.pdf"), ["layout chart", "fitting"]),
      resource("artisan", "Artisan", "AR Coatings", "Guide", "Artisan Emerald", "Premium everyday AR clarity and comfort for strong everyday recommendations.", "/artisan-ar/emerald", ["AR", "coating"]),
      resource("artisan", "Artisan", "AR Coatings", "Guide", "Artisan Nytopia", "Advanced clarity, durability, and visual comfort for premium AR conversations.", "/artisan-ar/nytopia", ["AR", "coating"], { popular: true }),
      resource("artisan", "Artisan", "AR Coatings", "Guide", "Artisan Armour", "Durable everyday AR performance for patients who need reliable clarity.", "/artisan-ar/armour", ["AR", "coating"]),
      resource("artisan", "Artisan", "AR Coatings", "Guide", "Artisan Azure", "Balanced clarity and appearance with clean visual performance.", "/artisan-ar/azure", ["AR", "coating"]),
    ],
  },
  {
    id: "iot",
    label: "IOT",
    headline: "IOT design selection and occupational lens support",
    description:
      "Camber, Endless, Essential, Neochromes, comparison guides, and fitting references for IOT-powered designs.",
    accent: "#2563eb",
    logo: "/iot-logo.png",
    resources: [
      resource("iot", "IOT", "Lens Designs", "PDF", "IOT Portfolio Guide", "Portfolio overview for IOT lens designs and platform options.", fileHref("iot-portfolio-guide.pdf"), ["portfolio", "design"], { popular: true }),
      resource("iot", "IOT", "Lens Designs", "PDF", "IOT Camber Pure", "Camber Pure guide for IOT-powered lens recommendations.", fileHref("iot-camber-pure.pdf"), ["Camber Pure", "progressive"], { popular: true, staffPick: true }),
      resource("iot", "IOT", "Lens Designs", "PDF", "Camber Plus", "Guide for Camber Steady Plus recommendations and patient conversations.", fileHref("camber-steady-plus.pdf"), ["Camber", "Camber Plus", "progressive"]),
      resource("iot", "IOT", "Lens Designs", "PDF", "Endless Office", "Occupational lens guide for workspace-specific visual needs.", fileHref("endless-office.pdf"), ["office", "office lens", "occupational"]),
      resource("iot", "IOT", "Lens Designs", "PDF", "Endless Office Degression Chart", "Degression chart for fitting and explaining Endless Office options.", fileHref("endless-office-degression-chart.pdf"), ["office", "degression", "layout chart"]),
      resource("iot", "IOT", "Lens Designs", "PDF", "Neochromes", "Photochromic lens guide for Neochromes product conversations.", fileHref("neochromes-guide.pdf"), ["photochromic", "sun"]),
      resource("iot", "IOT", "Layout Charts", "PDF", "IOT Centration Charts", "Fitting and centration charts for IOT-powered lens designs.", fileHref("iot-centration-charts.pdf"), ["layout chart", "fitting"], { popular: true }),
      resource("iot", "IOT", "Videos", "Training", "IOT Camber Steady Plus Training", "Training for positioning, fitting, and practical dispensing conversations.", "https://youtu.be/phvH3ahy2e4", ["video", "training"]),
      resource("iot", "IOT", "Videos", "Training", "ALN Camber Pure Training Webinar", "Camber Pure webinar for opticians learning recommendation language and fit support.", "https://youtu.be/eFw7BzI1SZY", ["video", "training", "Camber Pure"], { newest: true }),
    ],
  },
  {
    id: "tokai",
    label: "Tokai",
    headline: "Tokai materials, designs, tints, and Reset education",
    description:
      "A fast Tokai shelf for Select, Bi-AS, Reset, Largo, tint references, and product training.",
    accent: "#b45309",
    logo: "/tokai-logo.png",
    resources: [
      resource("tokai", "Tokai", "Lens Designs", "PDF", "Tokai Select Guide", "Overview guide for Tokai Select options and positioning.", fileHref("tokai-select-guide.pdf"), ["material", "select", "progressive"], { popular: true }),
      resource("tokai", "Tokai", "Lens Designs", "PDF", "Tokai Bi-AS SV Guide", "Single vision Bi-AS reference for fitting and product selection.", fileHref("tokai-bias-sv-guide.pdf"), ["single vision", "SV"]),
      resource("tokai", "Tokai", "Lens Designs", "PDF", "Tokai Reset Guide", "Tokai Reset resource for patient conversations and dispensing support.", fileHref("tokai-reset-guide.pdf"), ["Reset", "patient conversation"]),
      resource("tokai", "Tokai", "Lens Designs", "PDF", "Tokai Largo Guide", "Tokai Largo guide for product positioning and office-lens selection.", fileHref("tokai-largo-guide.pdf"), ["material", "high Rx", "office", "office lens", "occupational"]),
      resource("tokai", "Tokai", "Materials", "PDF", "Tokai Tint Guide", "Tint reference for Tokai lens options and patient preferences.", fileHref("tokai-tint-guide.pdf"), ["tint", "sun"]),
      resource("tokai", "Tokai", "AR Coatings", "Guide", "Tokai AR Coatings", "Official Tokai coating reference for USC, SPS, NRC, and other treatment options.", "https://www.tokaiopt.com/en/product/category/coating/", ["AR", "anti-reflective", "USC", "SPS", "NRC", "coating"]),
      resource("tokai", "Tokai", "Videos", "Training", "Tokai Product Training", "Tokai product training for design selection and dispensing support.", "https://youtu.be/9P7VEmI0ZwY", ["video", "training"], { newest: true }),
      tokaiDisplayResource(
        "Lutina Photochromic Display",
        "Counter display for demonstrating Tokai Lutina photochromic lens benefits.",
        "/images/tokaitools-lutinadisplay.png",
        ["Lutina", "photochromic", "counter display"]
      ),
      tokaiDisplayResource(
        "Lutina Blue Filter Display",
        "Display tool for explaining Lutina blue-filter technology and patient-facing benefits.",
        "/images/tokai-tools-lutina-display.png",
        ["Lutina", "blue filter", "counter display"]
      ),
      tokaiDisplayResource(
        "Lutina ESC Checker",
        "Diagnostic demonstration tool that measures HEV, near infrared rays, and UV rays.",
        "/images/lutina-esc-checker.png",
        ["Lutina", "HEV", "near infrared", "UV", "checker"]
      ),
      tokaiDisplayResource(
        "Six-Lens Comparison Display",
        "Six-lens display for comparing thickness, USC AR performance, and Lutina benefits.",
        "/images/comparison-display.png",
        ["comparison", "thickness", "USC AR", "Lutina"]
      ),
      tokaiDisplayResource(
        "Thickness Display and Comparison Tool",
        "Physical thickness display and comparison tool for high-index conversations.",
        "/images/thickness-comparison-tokai.jpg",
        ["thickness", "high index", "comparison"]
      ),
      tokaiDisplayResource(
        "NRC Display",
        "Tokai NRC display for supporting in-office product education.",
        "/images/nrc-display-tokai.png",
        ["NRC", "display"]
      ),
      tokaiDisplayResource(
        "Thickness Comparison Display",
        "Tokai thickness comparison display for showing material differences at the counter.",
        "/images/thickness-comparison-tokai.png",
        ["thickness", "comparison", "materials"]
      ),
    ],
  },
  {
    id: "hoya",
    label: "HOYA",
    headline: "HOYA product guides and centration support",
    description:
      "Quick access to HOYA product references and iD LifeStyle fitting support.",
    accent: "#7c3aed",
    logo: "/hoya-logo.png",
    resources: [
      resource("hoya", "HOYA", "Lens Designs", "PDF", "HOYA Product Guide", "Portfolio guide for HOYA lens options and patient recommendations.", fileHref("hoya-product-guide.pdf"), ["progressive", "portfolio"], { popular: true }),
      resource("hoya", "HOYA", "Lens Designs", "PDF", "HOYA iD LifeStyle 4", "Product guide for HOYA iD LifeStyle 4 positioning and selection.", fileHref("id-lifestyle-4-sales-aid_final_pn8159387.pdf"), ["iD LifeStyle", "progressive"]),
      resource("hoya", "HOYA", "Layout Charts", "PDF", "HOYA Centration Charts", "Fitting and centration charts for HOYA lens dispensing.", fileHref("hoya-centration-charts.pdf"), ["layout chart", "fitting"], { staffPick: true }),
      resource("hoya", "HOYA", "AR Coatings", "Guide", "HOYA AR Coatings", "Official HOYA reference for Super HiVision AR treatments and coating options.", "https://www.hoyavision.com/en-us/vision-products/anti-reflective-coatings/", ["AR", "anti-reflective", "Super HiVision", "Meiryo", "coating"]),
    ],
  },
  {
    id: "shamir",
    label: "Shamir",
    headline: "Shamir specialty references",
    description:
      "Technical Shamir resources for specialty lens conversations and driving-specific recommendations.",
    accent: "#0e7490",
    logo: "/shamir-logo.png",
    resources: [
      resource("shamir", "Shamir", "Technical Bulletins", "PDF", "Driver Intelligence Technical Guide", "Technical guide for Shamir Driver Intelligence recommendations.", fileHref("Shamir-Driver-Intelligence-Technical-Sheet.pdf"), ["driving", "technical", "progressive"]),
      resource("shamir", "Shamir", "AR Coatings", "PDF", "Shamir Glacier PLUS", "Official Shamir reference for Glacier PLUS premium anti-reflective coating.", "https://www.shamirlens.com/media/k2/attachments/SHA-GUI-REF-100517_trimmed_1.pdf", ["AR", "anti-reflective", "Glacier", "coating"]),
    ],
  },
  {
    id: "unity",
    label: "Unity / VSP",
    headline: "Unity, TechShield, rewards, and VSP support",
    description:
      "Plan-aligned resources for Unity products, TechShield, rewards, and VSP setup questions.",
    accent: "#4d7c0f",
    logo: "/unity-logo.png",
    resources: [
      resource("unity", "Unity / VSP", "Lens Designs", "PDF", "Unity V3 Sales Guide", "Sales guide for Unity V3 lens positioning and plan conversations.", fileHref("unity-v3-sales-guide.pdf"), ["VSP", "Unity V3", "progressive"], { popular: true }),
      resource("unity", "Unity / VSP", "Technical Bulletins", "PDF", "Unity V3 White Paper", "Technical white paper for Unity V3 performance and product context.", fileHref("5688bc8-2e3-c061-3d27-251215283ac_Unity_V3_Whitepaper.pdf"), ["white paper"]),
      resource("unity", "Unity / VSP", "Programs", "PDF", "PECAA Max Unity Rewards Flyer", "PECAA Max Unity Rewards flyer and program overview.", fileHref("unity-rewards-pecaa.pdf"), ["Unity Rewards", "PECAA"]),
      resource("unity", "Unity / VSP", "AR Coatings", "PDF", "TechShield AR Coatings Guide", "Treatment guide for TechShield AR recommendations.", fileHref("TechShield_AR_Coatings_Sales_Sheet_2023.pdf"), ["TechShield", "AR"], { staffPick: true }),
      resource("unity", "Unity / VSP", "FAQs", "PDF", "TechShield FAQ", "FAQ for the Unity performance coatings retirement and TechShield transition.", fileHref("unity-performance-coatings_retirement_faqs.pdf"), ["TechShield", "FAQ"]),
      resource("unity", "Unity / VSP", "Videos", "Training", "Unity V3 Products", "Unity V3 product training for plan-friendly lens recommendations.", "https://youtu.be/cLhLfThS7Gs", ["video", "training"]),
    ],
  },
  {
    id: "varilux",
    label: "Varilux / Crizal",
    headline: "Varilux progressives and Crizal treatment resources",
    description:
      "Premium Essilor lens and treatment guides for progressive and AR recommendations.",
    accent: "#1d4ed8",
    logo: "/varilux-logo.png",
    resources: [
      resource("varilux", "Varilux / Crizal", "Lens Designs", "PDF", "Varilux Product Guide", "Portfolio guide for Varilux progressive lens recommendations.", fileHref("varilux-product-guide.pdf"), ["progressive"], { popular: true }),
      resource("varilux", "Varilux / Crizal", "Lens Designs", "PDF", "Varilux Comfort", "Reference sheet for Varilux Comfort features and patient fit.", fileHref("varilux-comfort.pdf"), ["progressive"]),
      resource("varilux", "Varilux / Crizal", "Lens Designs", "PDF", "Varilux Immersia Sales Aid", "Sales aid for positioning Varilux Immersia as an office-lens solution.", fileHref("404700_PRO_VAR.pdf"), ["sales aid", "office", "office lens", "occupational"]),
      resource("varilux", "Varilux / Crizal", "Technical Bulletins", "PDF", "Varilux Physio Extensee Scientific Paper", "Scientific paper for Varilux Physio Extensee design context.", fileHref("401050_PRO_VAR-Varilux_Physio_Extensee_Scientific_Paper_FNL.pdf"), ["scientific", "technical"]),
      resource("varilux", "Varilux / Crizal", "AR Coatings", "PDF", "Crizal Natural Product Sheet", "Product information sheet for Crizal Natural Look.", fileHref("456102_PRO_ZAL.pdf"), ["Crizal", "AR"]),
      resource("varilux", "Varilux / Crizal", "AR Coatings", "PDF", "Crizal Product Guide 2026", "Updated Crizal product guide including Crizal Natural Look.", fileHref("462850_PRO_ZAL-Crizal_Product_Guide_2026_Update_with_Crizal_Natural_Look_LR.pdf"), ["Crizal", "AR"], { newest: true }),
    ],
  },
  {
    id: "chemistrie",
    label: "Chemistrie",
    headline: "ChemClip ordering and patient demonstration support",
    description:
      "Resources for practices using ChemClip specialty workflows and in-office demonstrations.",
    accent: "#be123c",
    logo: "/chemistrie-logo.png",
    resources: [
      resource("chemistrie", "Chemistrie", "Ordering", "PDF", "ChemClip Order Form", "Order form used to accompany ChemClip orders for accurate clip production.", fileHref("chemistrieclip.pdf"), ["ChemClip", "order form"], { popular: true }),
      resource("chemistrie", "Chemistrie", "Programs", "Tool", "Request ChemClip Demo Kit", "Request a demo kit to support staff training and patient conversations.", "https://form.typeform.com/to/XlZhJX5K", ["demo kit", "training"]),
      resource("chemistrie", "Chemistrie", "Videos", "Training", "Chemistrie Product Training", "Product training for clip options and add-on support.", "https://youtu.be/Rown4Yp9U4c", ["video", "training"]),
    ],
  },
  {
    id: "newton",
    label: "Newton / Neurolens",
    headline: "Sequel lens portfolio and Neurolens clinical support",
    description:
      "Product, pricing, training, and clinical resources for the Newton lens portfolio.",
    accent: "#4338ca",
    resources: [
      resource("newton", "Newton / Neurolens", "Lens Designs", "PDF", "Sequel Lens Portfolio", "At-a-glance guide to Sequel single-vision and progressive designs featuring Convergence Boost technology.", fileHref("Sequel-LensPortfolio-ConvergenceBoost-10312025.pdf"), ["Sequel", "portfolio", "Convergence Boost"], { newest: true }),
      resource("newton", "Newton / Neurolens", "Lens Designs", "PDF", "Sequel Overview", "Two-page overview of the Sequel portfolio, its patient benefits, and design selection guidance.", fileHref("Sequel Overview One Pager DIGITAL.pdf"), ["Sequel", "overview", "Convergence Boost"]),
      resource("newton", "Newton / Neurolens", "Pricing", "PDF", "Sequel MSRP", "Suggested retail pricing for Sequel designs, coatings, treatments, and photochromic add-ons.", fileHref("Sequel MSRP.pdf"), ["Sequel", "MSRP", "pricing"]),
      resource("newton", "Newton / Neurolens", "Lens Designs", "Training", "Sequel Portfolio Guide", "Training guide covering Sequel everyday, computer, and meeting lens options and dispensing guidance.", fileHref("Sequel-Training-SequelPortfolioGuideComputerMeeting-08302025.pdf"), ["Sequel", "training", "computer", "meeting"]),
      resource("newton", "Newton / Neurolens", "Ordering", "Training", "Sequel VSP Eyefinity Guide", "Step-by-step guide for setting up and ordering Sequel designs through VSP Eyefinity.", fileHref("Sequel-Training-VSP-Eyefinity-10312025.pdf"), ["Sequel", "VSP", "Eyefinity", "ordering"]),
      resource("newton", "Newton / Neurolens", "Technical Bulletins", "PDF", "Neurolens Clinical Study", "Clinical study showing Neurolenses proven to reduce headache symptoms.", fileHref("Neurolenses-proven-to-reduce-headache-symptoms.pdf"), ["Neurolens", "clinical"], { staffPick: true }),
    ],
  },
  {
    id: "frame",
    label: "Frame Systems",
    headline: "Frame systems and complete-pair resources",
    description:
      "Keep frame workflows, complete-pair paths, and program pricing easier for the team to navigate.",
    accent: "#334155",
    resources: [
      resource("frame", "Frame Systems", "Patient Materials", "PDF", "Modern Frame Book", "Modern Optical frame book for frame selection and staff reference.", fileHref("modern-frame-book.pdf"), ["frame", "Modern Optical"], { popular: true }),
      resource("frame", "Frame Systems", "Programs", "Tool", "Request Current Program Pricing", "Request complete-pair program details and account-specific pricing support.", "https://form.typeform.com/to/quuPCSff", ["pricing", "program"]),
      resource("frame", "Frame Systems", "Programs", "Tool", "Modern Optical Sales", "Connect with Modern Optical sales to learn more about the frame program.", "mailto:cmillet@modernoptical.com?subject=Modern%20Optical%20Frame%20Program%20Inquiry", ["contact"]),
    ],
  },
  {
    id: "safety",
    label: "Safety Systems",
    headline: "Safety frame books and occupational program support",
    description:
      "Support employer-driven safety eyewear with catalogs, demonstration materials, and program guidance.",
    accent: "#b91c1c",
    resources: [
      resource("safety", "Safety Systems", "Patient Materials", "PDF", "ArmouRx Frame Book", "Safety frame catalog for ArmouRx product selection.", fileHref("armou-rx-frame-book.pdf"), ["safety", "frame"]),
      resource("safety", "Safety Systems", "Patient Materials", "PDF", "DVX / Wiley X Frame Book", "DVX and Wiley X options for safety, outdoor, and performance eyewear.", fileHref("dvx-wileyx-frame-book.pdf"), ["safety", "frame"]),
      resource("safety", "Safety Systems", "Patient Materials", "PDF", "Wiley X Frame Book", "Wiley X frame book for ANSI-rated eyewear conversations.", fileHref("wileyx-frame-book.pdf"), ["safety", "frame"]),
      resource("safety", "Safety Systems", "Patient Materials", "PDF", "ArtCraft Frame Book", "ArtCraft frame references for safety and specialty frame selection.", fileHref("artcraft-frame-book.pdf"), ["safety", "frame"]),
      resource("safety", "Safety Systems", "Patient Materials", "PDF", "SafeVision Frame Book", "SafeVision frame catalog for occupational eyewear.", fileHref("safevision-frame-book.pdf"), ["safety", "frame"]),
      resource("safety", "Safety Systems", "Programs", "Tool", "Order Your Free Safety Kit", "Request demonstration frames and safety program materials.", "https://form.typeform.com/to/rDUQssNn", ["safety", "demo kit"], { popular: true }),
    ],
  },
];

const troubleshootingResources: Resource[] = [
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Progressive Troubleshooting", "Step-by-step support for progressive complaints, measurements, and remake decisions.", "/provider-resources/troubleshooting/progressive-troubleshooting", ["progressive", "remake"], { popular: true }),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Non-Adapts", "Practical triage for progressive, occupational, and specialty-lens non-adapts.", "/provider-resources/troubleshooting/non-adapts", ["non-adapt", "fit"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Measurement Errors", "Find common PD, OC, seg-height, tilt, wrap, and vertex issues before remakes.", "/provider-resources/troubleshooting/measurement-errors", ["measurements", "digital measurements"], { staffPick: true }),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Coating Concerns", "Support for crazing, peeling, scratches, cleaning problems, and coating expectations.", "/provider-resources/troubleshooting/coating-concerns", ["coating", "AR"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Frame Compatibility", "Check frame choice, groove depth, wrap, drill mounts, safety frames, and lens limits.", "/provider-resources/troubleshooting/frame-compatibility", ["frame", "safety"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Corridor Issues", "Diagnose narrow corridors, swim, blur zones, and near or intermediate access complaints.", "/provider-resources/troubleshooting/corridor-issues", ["corridor", "progressive"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "High Rx Review", "A growing guide for high-power lens selection, thickness expectations, and frame choice.", "/optical-engineering", ["high Rx", "thickness"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Prism Questions", "Use engineering tools and lab support when prism, compensation, or measurement questions get complex.", "/optical-engineering", ["prism", "calculator"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Occupational Lenses", "Guide patients toward office, near, and task-specific lenses with fewer adaptation surprises.", "#iot", ["office", "occupational"]),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Digital Measurements", "Review PD, OC, seg height, wrap, panto, and vertex before ordering complex designs.", "/provider-resources/troubleshooting/measurement-errors", ["measurements", "digital"]),
];

const utilityResources: Resource[] = [
  resource("artisan", "Artisan", "Pricing", "Tool", "Price Lists", "Open confidential partner price lists for authorized Artisan customers.", "/portal/price-list/g6", ["price lists", "pricing"], { popular: true }),
  resource("artisan", "Artisan", "Pricing", "Policy", "Policies", "Review policy guidance for remakes, warranties, shipping, frames, and coatings.", "/policies", ["policies", "remakes"], { popular: true }),
  resource(
    "artisan",
    "Artisan",
    "Ordering",
    "Tool",
    "Pay Lab Bill",
    "Use SpecCheck Lab Pay to manage and pay Artisan lab bills.",
    "https://support.speccheckrx.com/en/collections/9057984-lab-pay",
    ["SpecCheck", "Lab Pay", "billing", "account payment"],
    { popular: true }
  ),
  resource("artisan", "Artisan", "Ordering", "Tool", "DVI RxWizard", "Access RxWizard for online ordering and prescription workflow support.", "https://www.dvirx.com/", ["DVI", "RxWizard"], { popular: true }),
  resource("artisan", "Artisan", "Ordering", "Tool", "VisionWeb", "Open VisionWeb when your practice submits orders through that workflow.", "https://www.visionweb.com/", ["VisionWeb", "ordering"], { newest: true }),
  resource("artisan", "Artisan", "Ordering", "Tool", "GoStock", "Search and source stock lenses through the GoStock marketplace.", "https://www.globalopticsinc.com/gostock", ["stock lenses"], { staffPick: true }),
  resource("artisan", "Artisan", "Technical Bulletins", "Tool", "Optical Engineering Center", "Calculators, lens thickness estimators, prism tools, and lab references.", "/optical-engineering", ["calculator", "engineering"], { popular: true }),
  resource("artisan", "Artisan", "Programs", "Tool", "Protect Lab Choice", "Find legislators and support laboratory choice and Vision Benefit Manager reform.", "/advocacy", ["advocacy"]),
];

const otiHighlights = [
  "Skills assessments for hiring and development",
  "Structured onboarding and role-based training",
  "Optician Development Program apprenticeship course",
  "ABO and NCLE exam preparation",
  "Continuing education credits",
  "Virtual optical equipment simulator",
  "Manager dashboards and progress reports",
  "Live tutoring and interactive job aids",
];

const marketingResources = [
  ["Social graphics", "Patient-facing product and practice-growth social content."],
  ["Counter cards", "Compact in-office messages for premium lens conversations."],
  ["Patient brochures", "Education handouts that make better recommendations easier."],
  ["Waiting room videos", "Digital content for passive patient education."],
  ["Window graphics", "Practice visibility and seasonal campaign support."],
  ["Digital signage", "Office screens, product loops, and promotion support."],
  ["Recall campaigns", "Patient recall messaging tied to product and service goals."],
  ["Email templates", "Campaign language for education, reactivation, and promotions."],
  ["Office promotions", "Multiple-pair and specialty product campaign planning."],
  ["Dispensing mats", "Point-of-purchase counter materials that support product conversations."],
  ["Point-of-purchase displays", "In-office displays for featured products and patient education."],
];

const labContacts = [
  {
    name: "Pacific Artisan Labs",
    phone: "877.390.6900",
    email: "customerservice@pacificartisanlabs.com",
    meetHref: "/meet-the-artisans#pacific",
  },
  {
    name: "Peak Artisan Labs",
    phone: "833.690.4321",
    email: "customerservice@peakartisanlabs.com",
    meetHref: "/meet-the-artisans#peak",
  },
  {
    name: "Pike Artisan Labs",
    phone: "888.239.0303",
    email: "customerservice@pikeartisanlabs.com",
    meetHref: "/meet-the-artisans#pike",
  },
];

const filterOptions = [
  "All",
  "PDF",
  "Video",
  "Training",
  "Layout Charts",
  "Display Tools",
  "Progressives",
  "Office Lens",
  "Single Vision",
  "AR",
  "Photochromic",
  "Safety",
  "Marketing",
  "Troubleshooting",
  "Popular",
  "Newest",
];

const categoryOrder: ResourceCategory[] = [
  "Lens Designs",
  "Layout Charts",
  "AR Coatings",
  "Materials",
  "Display Tools",
  "Videos",
  "Patient Materials",
  "Troubleshooting",
  "Technical Bulletins",
  "FAQs",
  "Programs",
  "Ordering",
  "Pricing",
];

const allBrandResources = brandLibraries.flatMap((brand) => brand.resources);
const allResources = [...utilityResources, ...allBrandResources, ...troubleshootingResources];
const fastAnswerResources: Resource[] = [
  resource("artisan", "Artisan", "Pricing", "Tool", "Price Lists", "Open confidential partner price lists for authorized Artisan customers.", "/portal/price-list/g6", ["price lists", "pricing"], { popular: true }),
  resource("artisan", "Artisan", "Pricing", "Policy", "Policies", "Review policy guidance for remakes, warranties, shipping, frames, and coatings.", "/policies", ["policies", "remakes"], { popular: true }),
  resource(
    "artisan",
    "Artisan",
    "Ordering",
    "Tool",
    "Pay Lab Bill",
    "Use SpecCheck Lab Pay to manage and pay Artisan lab bills.",
    "https://support.speccheckrx.com/en/collections/9057984-lab-pay",
    ["SpecCheck", "Lab Pay", "billing", "account payment"],
    { popular: true }
  ),
  resource("artisan", "Artisan", "Technical Bulletins", "Tool", "Optical Engineering Center", "Calculators, lens thickness estimators, prism tools, and lab references.", "/optical-engineering", ["calculator", "engineering"], { popular: true }),
  resource("iot", "IOT", "Lens Designs", "PDF", "Camber Pure", "IOT-powered progressive design guide for confident premium recommendations.", fileHref("iot-camber-pure.pdf"), ["Camber Pure", "progressive"], { popular: true, staffPick: true }),
  resource("artisan", "Artisan", "AR Coatings", "Guide", "Learn about our AR Treatments", "Compare Artisan AR treatments and match the right option to each patient.", "/artisan-ar/", ["AR", "coating", "treatments"], { popular: true }),
  resource("artisan", "Artisan", "Ordering", "Tool", "GoStock", "Search and source stock lenses through the GoStock marketplace.", "https://www.globalopticsinc.com/gostock", ["stock lenses"], { staffPick: true }),
  resource("artisan", "Artisan", "Troubleshooting", "Guide", "Progressive Troubleshooting", "Step-by-step support for progressive complaints, measurements, and remake decisions.", "/provider-resources/troubleshooting/progressive-troubleshooting", ["progressive", "remake"], { popular: true }),
];

const sectionNavItems = [
  ["Portal", "#customer-portal"],
  ["Order", "#how-to-order"],
  ["Popular", "#popular-resources"],
  ["Brands", "#resource-library"],
  ["VSP", "#unity-vsp"],
  ["Help", "#troubleshooting-best-practices"],
  ["Tools", "#practice-toolbox"],
  ["Support", "#lab-customer-service"],
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesFilter(resource: Resource, filter: string) {
  if (filter === "All") return true;
  if (filter === "Popular") return Boolean(resource.popular);
  if (filter === "Newest") return Boolean(resource.newest);
  if (filter === "PDF" || filter === "Video" || filter === "Training") return resource.type === filter;
  if (filter === "Layout Charts") return resource.category === "Layout Charts";
  if (filter === "Troubleshooting") return resource.category === "Troubleshooting";
  if (filter === "AR") return resource.category === "AR Coatings";
  const haystack = normalize([resource.title, resource.description, resource.category, resource.type, ...resource.tags].join(" "));
  return haystack.includes(normalize(filter));
}

function searchResources(resources: Resource[], query: string, filter: string) {
  const normalizedQuery = normalize(query);
  return resources.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      normalize([item.title, item.description, item.brandLabel, item.category, item.type, ...item.tags].join(" ")).includes(
        normalizedQuery
      );
    return matchesQuery && matchesFilter(item, filter);
  });
}

function IconForResource({ resource }: { resource: Resource }) {
  const className = "h-4 w-4";
  if (resource.type === "Video" || resource.type === "Training") return <PlayCircle className={className} />;
  if (resource.category === "Troubleshooting") return <Wrench className={className} />;
  if (resource.category === "Layout Charts") return <LayoutGrid className={className} />;
  if (resource.type === "Tool") return <ExternalLink className={className} />;
  if (resource.type === "Policy") return <ShieldCheck className={className} />;
  if (resource.type === "Marketing") return <Sparkles className={className} />;
  return <FileText className={className} />;
}

function ResourceLink({ resource, dense = false }: { resource: Resource; dense?: boolean }) {
  const previewContent = resource.previewImage ? (
    <>
      <span className="relative block h-40 overflow-hidden rounded bg-[#f7f8f5]">
        <Image
          src={resource.previewImage}
          alt={resource.previewAlt ?? `${resource.title} preview`}
          fill
          sizes="260px"
          className="object-contain"
        />
      </span>
      <span className="mt-2 block text-xs font-semibold text-[#374151]">{resource.title}</span>
    </>
  ) : null;

  const body = (
    <>
      {resource.previewImage ? (
        <span className="mb-4 block rounded-lg border border-[#d7ded9] bg-white p-2 shadow-sm sm:hidden">
          {previewContent}
        </span>
      ) : null}
      {resource.previewImage ? (
        <span className="pointer-events-none absolute left-4 right-4 top-4 z-20 hidden rounded-lg border border-[#d7ded9] bg-white p-2 shadow-2xl sm:group-hover:block sm:group-focus:block sm:group-focus-visible:block">
          {previewContent}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-[#0f766e]">
          <IconForResource resource={resource} />
          {resource.type}
        </span>
        {resource.popular ? (
          <span className="rounded bg-[#e8f5f1] px-2 py-1 text-xs font-semibold text-[#0f766e]">Popular</span>
        ) : resource.newest ? (
          <span className="rounded bg-[#eef2ff] px-2 py-1 text-xs font-semibold text-[#3730a3]">New</span>
        ) : null}
      </div>
      <h3 className={`${dense ? "mt-2 text-base" : "mt-4 text-lg"} font-semibold leading-snug text-[#111827]`}>
        {resource.title}
      </h3>
      <p className={`${dense ? "mt-2 line-clamp-2 text-sm" : "mt-3 text-sm"} leading-6 text-[#4b5563]`}>
        {resource.description}
      </p>
      {resource.category === "Display Tools" ? (
        <p className="mt-3 rounded bg-[#fff8ed] px-3 py-2 text-xs font-semibold leading-5 text-[#8a5a19]">
          Pricing changes with availability and exchange rates; current quotes are provided as needed.
        </p>
      ) : null}
      {resource.previewImage ? (
        <p className="resource-preview-hint mt-3 rounded bg-[#f7f8f5] px-3 py-2 text-xs font-semibold text-[#0f766e]">
          Hover or focus to preview the display image. On touch devices, the image is shown above.
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold text-[#111827]">
        <span>{resource.cta ?? (resource.type === "PDF" ? "Open PDF" : "Open resource")}</span>
        {external(resource.href) ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </div>
    </>
  );

  const className =
    "group relative block h-full rounded-lg border border-[#d7ded9] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f766e] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]";

  return external(resource.href) ? (
    <a href={resource.href} className={className} target={resource.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link href={resource.href} className={className}>
      {body}
    </Link>
  );
}

function SectionHeading({
  kicker,
  title,
  body,
  dark = false,
}: {
  kicker: string;
  title: string;
  body: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-[#9ee6d8]" : "text-[#0f766e]"}`}>
        {kicker}
      </p>
      <h2 className={`mt-3 text-3xl font-semibold leading-tight md:text-4xl ${dark ? "text-white" : "text-[#111827]"}`}>
        {title}
      </h2>
      <p className={`mt-4 text-base leading-7 ${dark ? "text-white/72" : "text-[#4b5563]"}`}>{body}</p>
    </div>
  );
}

export default function ProviderResourcesPage({
  showProfessionalEnhancements = false,
}: {
  showProfessionalEnhancements?: boolean;
}) {
  void showProfessionalEnhancements;
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeBrand, setActiveBrand] = useState<BrandId>("artisan");
  const [showSectionNav, setShowSectionNav] = useState(false);
  const [sectionNavDismissed, setSectionNavDismissed] = useState(false);
  const [activeSectionHref, setActiveSectionHref] = useState(sectionNavItems[0][1]);
  const mobileSectionNavRef = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    mobileSectionNavRef.current
      ?.querySelector<HTMLElement>("[aria-current='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSectionHref]);

  useEffect(() => {
    const updateSectionNav = () => {
      setShowSectionNav(window.scrollY > window.innerHeight * 0.82);
    };

    updateSectionNav();
    window.addEventListener("scroll", updateSectionNav, { passive: true });
    window.addEventListener("resize", updateSectionNav);

    return () => {
      window.removeEventListener("scroll", updateSectionNav);
      window.removeEventListener("resize", updateSectionNav);
    };
  }, []);

  useEffect(() => {
    const sectionTargets = sectionNavItems
      .map(([, href]) => document.getElementById(href.replace("#", "")))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sectionTargets.length) return undefined;

    const updateActiveSection = () => {
      const activationLine = window.innerHeight * 0.38;
      const current = sectionTargets.reduce((active, section) => {
        const top = section.getBoundingClientRect().top;
        if (top <= activationLine) return section;
        return active;
      }, sectionTargets[0]);

      setActiveSectionHref(`#${current.id}`);
    };

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: "-24% 0px -58% 0px",
      threshold: [0, 0.01, 0.25, 0.5, 1],
    });

    sectionTargets.forEach((section) => observer.observe(section));
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  const selectedBrand = brandLibraries.find((brand) => brand.id === activeBrand) ?? brandLibraries[0];
  const visibleBrandResources = useMemo(
    () => searchResources(selectedBrand.resources, deferredQuery, activeFilter),
    [selectedBrand, deferredQuery, activeFilter]
  );
  const globalResults = useMemo(
    () => searchResources(allResources, deferredQuery, activeFilter).slice(0, 12),
    [deferredQuery, activeFilter]
  );
  const groupedResources = categoryOrder
    .map((category) => ({
      category,
      resources: visibleBrandResources.filter((item) => item.category === category),
    }))
    .filter((group) => group.resources.length > 0);

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#111827]">
      <Header />

      <section className="relative isolate overflow-hidden bg-[#111827] text-white">
        <Image
          src="/images/eyewear-brochure-meeting-2022-1-optimized.jpg"
          alt="Optical team reviewing lens resources"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-42"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,18,16,0.96),rgba(9,18,16,0.78),rgba(9,18,16,0.42))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl content-center gap-8 px-5 pb-12 pt-28 md:px-8 md:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:pb-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9ee6d8]">Provider Resources</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              The operating system for an independent optical practice.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
              Search products, layout charts, policies, AR coatings, brands, training, troubleshooting, ordering tools, and practice-growth resources from one place.
            </p>

            <div className="mt-8 max-w-3xl rounded-lg border border-white/20 bg-white/95 p-2 text-[#111827] shadow-2xl">
              <label className="flex items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-[#0f766e]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search PDFs, products, policies..."
                  className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#6b7280]"
                />
              </label>
            </div>

            {deferredQuery ? (
              <div className="mt-3 max-w-3xl overflow-hidden rounded-lg border border-white/14 bg-[#081310]/88 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Top matches</p>
                  <a href="#resource-directory" className="text-sm font-semibold text-[#9ee6d8]">
                    View all
                  </a>
                </div>
                <div className="divide-y divide-white/10">
                  {globalResults.slice(0, 4).map((item) => (
                    <a
                      key={`hero-result-${item.brand}-${item.title}`}
                      href={item.href}
                      className="grid gap-1 px-4 py-3 text-left transition hover:bg-white/8"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <IconForResource resource={item} />
                        {item.title}
                      </span>
                      <span className="text-xs leading-5 text-white/62">
                        {item.brandLabel} / {item.category}
                      </span>
                    </a>
                  ))}
                  {globalResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-white/68">No matches yet. Try a product, brand, or task.</p>
                  ) : null}
                </div>
              </div>
            ) : null}

          </div>

          <div id="customer-portal" className="self-end border-l border-white/18 bg-[#0b1513]/72 p-6 backdrop-blur md:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9ee6d8]">Customer Portal</p>
            <h2 className="mt-3 text-3xl font-semibold">The fastest path for existing customers.</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Everything about your relationship with Artisan in one place, from daily reports and pricing to programs, support, and performance visibility.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {portalHighlights.slice(0, 6).map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-white/82">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9ee6d8]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/portal"
                className={artisanControlClass({ tone: "accent" })}
              >
                Log Into Customer Portal <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#resource-library"
                className={artisanControlClass({ tone: "inverse" })}
              >
                Browse Library <LayoutGrid className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Provider resources sections"
        className={`fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 rounded-[2rem] border border-[#d7ded9]/80 bg-white/68 p-4 shadow-[0_18px_55px_rgba(17,24,39,0.14)] backdrop-blur-2xl transition-all duration-500 xl:block ${
          showSectionNav && !sectionNavDismissed ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
        }`}
        >
        <button
          type="button"
          onClick={() => setSectionNavDismissed(true)}
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border-2 border-[#c9d4cf] bg-white text-[#42566c] shadow-[0_8px_22px_rgba(17,24,39,0.16)] transition hover:rotate-90 hover:border-[#0f766e] hover:bg-[#edf8f5] hover:text-[#0f766e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
          aria-label="Hide section navigation"
        >
          <X className="h-5 w-5" strokeWidth={2.25} />
        </button>
        <div className="grid gap-3 pt-10">
          {sectionNavItems.map(([label, href]) => {
            const isActive = activeSectionHref === href;
            return (
            <a
              key={href}
              href={href}
              aria-current={isActive ? "true" : undefined}
              className={`group flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] transition hover:text-[#111827] ${
                isActive ? "text-[#0f766e]" : "text-[#64748b]"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full transition group-hover:bg-[#0f766e] ${
                  isActive ? "bg-[#0f766e]" : "bg-[#cbd5cf]"
                }`}
              />
              <span>{label}</span>
            </a>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Provider resources mobile sections"
        className="sticky top-[72px] z-30 border-y border-[#d7ded9] bg-white/94 px-4 py-2 backdrop-blur xl:hidden"
      >
        <div ref={mobileSectionNavRef} className="mobile-scroll-row mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto [scrollbar-color:#0f766e_#e5e7eb] [scrollbar-width:thin]">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">Jump to</span>
          {sectionNavItems.map(([label, href]) => (
            <a
              key={href}
              href={href}
              aria-current={activeSectionHref === href ? "true" : undefined}
              className={`shrink-0 rounded px-2 py-2 text-sm font-semibold underline-offset-4 transition hover:underline ${
                activeSectionHref === href ? "bg-[#e8f5f1] text-[#0f766e]" : "text-[#111827]"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="how-to-order" className="relative border-b border-[#d7ded9] bg-white px-5 py-14 md:px-8 md:py-16">
        <span id="speccheck" className="absolute -top-28" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              kicker="Ordering"
              title="How do you want to order?"
              body="Start here when the job is ready. These are the three order-entry paths an optician is most likely looking for."
            />
            <p className="max-w-sm border-l-4 border-[#0f766e] pl-4 text-sm leading-6 text-[#4b5563]">
              Maintained for Artisan partners and updated as ordering workflows change.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {orderingOptions.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-lg border border-[#d7ded9] bg-[#f7f8f5] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f766e] hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded bg-[#e8f5f1] text-[#0f766e]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ExternalLink className="h-4 w-4 text-[#6b7280] transition group-hover:text-[#0f766e]" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4b5563]">{item.description}</p>
                  <p className="mt-4 border-l-2 border-[#c7a45d] pl-3 text-sm leading-6 text-[#374151]">{item.bestFor}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]">
                    {item.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="popular-resources" className="relative bg-[#eef4f1] px-5 py-14 md:px-8 md:py-16">
        <span id="championing-mvc-vision-rights" className="absolute -top-28" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            kicker="Popular Resources"
            title="Fast answers for the questions that come up every week."
            body="Most downloaded, recently added, staff favorites, and the links that keep practices moving."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fastAnswerResources.map((item) => (
              <ResourceLink key={`${item.brand}-${item.title}`} resource={item} dense />
            ))}
          </div>
        </div>
      </section>

      <section id="resource-library" className="relative border-y border-[#d7ded9] bg-[#f7f8f5] px-5 py-14 md:px-8 md:py-16">
        <span id="product-education" className="absolute -top-28" aria-hidden="true" />
        <span id="downloads" className="absolute -top-28" aria-hidden="true" />
        <span id="brochures" className="absolute -top-28" aria-hidden="true" />
        <span id="artisan-lens-system-resources" className="absolute -top-28" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              kicker="Resource Library"
              title="Find the brand first. Then find the exact PDF, video, or guide."
              body="A Microsoft Learn-style library for opticians: search everything, filter by task, or use the brand navigation."
            />
            <div className="grid gap-3 md:min-w-[420px]">
              <label className="flex h-12 items-center gap-3 rounded-lg border border-[#cbd5cf] bg-white px-3 shadow-sm">
                <Search className="h-5 w-5 text-[#0f766e]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the full library..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                Scroll sideways to see more filter options.
              </p>
              <div className={`mobile-scroll-row flex pb-1 ${artisanSegmentGroupClass}`}>
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#6b7280]" />
                {filterOptions.map((filter, index) => (
                  <div key={filter} className="flex shrink-0 items-center gap-1">
                    {index > 0 ? <span aria-hidden="true" className="px-1 text-[#c8bda9]">|</span> : null}
                    <button
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={artisanSegmentClass(activeFilter === filter)}
                    >
                      {filter}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {deferredQuery || activeFilter !== "All" ? (
            <div id="resource-directory" className="mt-8 rounded-lg border border-[#cbd5cf] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <span className="text-sm text-[#6b7280]">{globalResults.length} shown</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {globalResults.length ? (
                  globalResults.map((item) => <ResourceLink key={`global-${item.brand}-${item.title}`} resource={item} dense />)
                ) : (
                  <p className="col-span-full rounded border border-dashed border-[#cbd5cf] p-6 text-sm text-[#4b5563]">
                    No resources match that search yet. Try a brand, product name, resource type, or task.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          <div id="product-information" className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="lg:sticky lg:top-36 lg:self-start">
              <div className="overflow-hidden rounded-lg border border-[#cbd5cf] bg-white">
                <div className="border-b border-[#e5e7eb] px-4 py-3">
                  <p className="text-sm font-semibold text-[#111827]">Brands</p>
                </div>
                <div className="relative">
                  <div className="max-h-[65vh] overflow-y-auto p-2 pr-3 [scrollbar-color:#0f766e_#e5e7eb] [scrollbar-width:thin]">
                    {brandLibraries.map((brand) => (
                      <button
                        key={brand.id}
                        id={brand.id}
                        type="button"
                        onClick={() => setActiveBrand(brand.id)}
                        className={`flex min-h-11 w-full items-center justify-between rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition ${
                          activeBrand === brand.id
                            ? "border-[#d8c49b] bg-[#d8c49b] text-[#172a28]"
                            : "border-transparent text-[#374151] hover:border-[#d8c49b] hover:bg-[#fffaf1] hover:text-[#172a28]"
                        }`}
                      >
                        <span>{brand.label}</span>
                        <span className="text-xs text-[#6b7280]">{brand.resources.length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            </aside>

            <div>
              <div className="rounded-lg border border-[#cbd5cf] bg-white">
                <div className="grid gap-5 border-b border-[#e5e7eb] p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: selectedBrand.accent }}>
                      {selectedBrand.label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">{selectedBrand.headline}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4b5563]">{selectedBrand.description}</p>
                  </div>
                  {selectedBrand.logo ? (
                    <div className="flex h-20 w-40 items-center justify-center rounded border border-[#e5e7eb] bg-[#f9fafb] p-4">
                      <Image
                        src={selectedBrand.logo}
                        alt={`${selectedBrand.label} logo`}
                        width={160}
                        height={80}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="p-5">
                  {groupedResources.length ? (
                    <div className="space-y-8">
                      {groupedResources.map((group) => (
                        <section key={group.category} id={group.category === "Layout Charts" ? "layout-charts" : undefined}>
                          <div className="mb-3 flex items-center gap-2">
                            <Tags className="h-4 w-4 text-[#0f766e]" />
                            <h4 className="text-base font-semibold">{group.category}</h4>
                          </div>
                          {group.category === "Display Tools" ? (
                            <p className="mb-3 rounded-lg border border-[#d8c6a8] bg-[#fbf8f3] p-3 text-sm leading-6 text-[#625b53]">
                              Tokai display-tool pricing changes frequently based on availability and exchange rates, so current pricing is quoted as needed.
                            </p>
                          ) : null}
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {group.resources.map((item) => (
                              <ResourceLink key={`${item.brand}-${item.category}-${item.title}`} resource={item} dense />
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded border border-dashed border-[#cbd5cf] p-6 text-sm text-[#4b5563]">
                      No resources match this brand and filter combination.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="unity-vsp" className="bg-white px-5 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <SectionHeading
            kicker="VSP Setup"
            title="Simple VSP routing, kept out in the open."
            body="This is the setup guidance customers ask for most: tell customer service first, add the lab correctly, and orders will route to the right Artisan lab."
          />
          <div className="grid gap-3">
            {vspSetupSteps.map((step, index) => (
              <article key={step.title} className="grid gap-4 rounded-lg border border-[#d7ded9] bg-[#f7f8f5] p-5 md:grid-cols-[44px_1fr]">
                <span className="grid h-11 w-11 place-items-center rounded bg-[#111827] text-sm font-semibold text-white">{index + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">{step.body}</p>
                </div>
              </article>
            ))}
            <article className="rounded-lg border border-[#9ccfbd] bg-[#e8f5f1] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">PECAA Max Unity Rewards</p>
                  <h3 className="mt-2 text-xl font-semibold">Keep the PECAA Max flyer close to VSP setup.</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#374151]">
                    The PECAA Max Unity Rewards flyer lives in the Unity / VSP brand library alongside plan-aligned products and VSP setup guidance.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <a
                    href="#unity"
                    className="inline-flex h-11 items-center rounded border border-[#0f766e] bg-white px-4 text-sm font-semibold text-[#0f766e] transition hover:bg-[#0f766e] hover:text-white"
                  >
                    View Unity resources
                  </a>
                  <a
                    href={fileHref("unity-rewards-pecaa.pdf")}
                    className="inline-flex h-11 items-center rounded bg-[#0f766e] px-4 text-sm font-semibold text-white transition hover:bg-[#115e59]"
                  >
                    Open PECAA Max flyer
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="troubleshooting-best-practices" className="bg-[#101a17] px-5 py-14 text-white md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <SectionHeading
              kicker="Troubleshooting"
              title="A growing knowledge base built from real optical support questions."
              body="Progressives, non-adapts, measurements, coatings, frame selection, safety, occupational lenses, high Rx, prism, digital measurements, and remakes."
              dark
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {troubleshootingResources.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-lg border border-white/12 bg-white/[0.06] p-4 transition hover:border-[#9ee6d8] hover:bg-white/[0.1]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Wrench className="h-5 w-5 text-[#9ee6d8]" />
                    <ChevronRight className="h-4 w-4 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-[#9ee6d8]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="practice-toolbox" className="relative border-y border-[#d7ded9] bg-[#eef4f1] px-5 py-14 md:px-8 md:py-16">
        <span id="specialty-systems" className="absolute -top-28" aria-hidden="true" />
        <span id="modern-frame-system" className="absolute -top-28" aria-hidden="true" />
        <span id="modern-package-system" className="absolute -top-28" aria-hidden="true" />
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            kicker="Practice Tools"
            title="Training, systems, engineering, pricing, and growth support."
            body="The tools section now focuses on workflows that replace common sales-rep questions without burying the product library."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-lg border border-[#d7ded9] bg-white p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0f766e]">OTI Partnership</p>
                  <h3 className="mt-2 text-2xl font-semibold">Optical Training Institute</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4b5563]">
                    A modern training platform for opticians and eyecare teams: onboarding, skills assessments, certification prep, continuing education, and role-based learning plans.
                  </p>
                </div>
                <Image
                  src="/images/oti-logo-color.svg"
                  alt="Optical Training Institute"
                  width={144}
                  height={56}
                  className="h-14 w-36 object-contain"
                />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {otiHighlights.map((item) => (
                  <div key={item} className="rounded border border-[#e5e7eb] bg-[#f9fafb] p-3 text-sm leading-5 text-[#374151]">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://meetings.hubspot.com/optical-training/booking-odp-demo"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded bg-[#0f766e] px-4 text-sm font-semibold text-white"
                >
                  Schedule a demo <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://opticaltraining.com/aln/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded border border-[#0f766e] px-4 text-sm font-semibold text-[#0f766e]"
                >
                  Learn more
                </a>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Frame Systems", "Frame books, program pricing, and complete-pair support.", "#frame"],
                ["Safety Systems", "Safety frame catalogs, demo kits, and occupational program support.", "#safety"],
                ["Engineering Center", "Thickness, prism, compensation, and optical calculators.", "/optical-engineering"],
                ["Policies", "Remakes, warranties, shipping, frame handling, and support rules.", "/policies"],
              ].map(([title, body, href]) => (
                <a key={title} href={href} className="rounded-lg border border-[#d7ded9] bg-white p-4 transition hover:border-[#0f766e] hover:shadow-md">
                  <Layers3 className="h-5 w-5 text-[#0f766e]" />
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">{body}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="marketing-practice-growth" className="bg-white px-5 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              kicker="Marketing Resources"
              title="Support better patient conversations at every touchpoint."
              body="Marketing support will include digital campaigns, patient education, dispensing mats, and point-of-purchase displays."
            />
            <span
              className="inline-flex h-11 cursor-default items-center justify-center gap-2 rounded bg-[#111827] px-4 text-sm font-semibold text-white opacity-70"
            >
              Marketing support <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          <div className="relative mt-8 overflow-hidden rounded-xl">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {marketingResources.map(([title, body]) => (
                <article key={title} className="rounded-lg border border-[#d7ded9] bg-[#f7f8f5] p-4">
                  <Sparkles className="h-5 w-5 text-[#0f766e]" />
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">{body}</p>
                </article>
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center bg-white/72 backdrop-blur-[3px]">
              <span className="rounded-full border border-[#0f766e]/25 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.28em] text-[#0f766e] shadow-[0_18px_50px_rgba(15,118,110,0.16)]">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="videos" className="border-y border-[#d7ded9] bg-[#f7f8f5] px-5 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            kicker="Newest Training"
            title="Training videos opticians can reach without digging."
            body="The most useful videos are also indexed in search and brand pages."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {allResources
              .filter((item) => item.type === "Training")
              .slice(0, 6)
              .map((item) => (
                <ResourceLink key={`video-${item.title}`} resource={item} />
              ))}
          </div>
        </div>
      </section>

      <section id="lab-customer-service" className="bg-[#111827] px-5 py-14 text-white md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            kicker="Support"
            title="The right lab contact when the answer is not in the library."
            body="For practical order support, contact the lab team closest to your account."
            dark
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {labContacts.map((lab) => (
              <article key={lab.name} className="rounded-lg border border-white/12 bg-white/[0.06] p-5">
                <LifeBuoy className="h-5 w-5 text-[#9ee6d8]" />
                <h3 className="mt-4 text-xl font-semibold">{lab.name}</h3>
                <a href={`tel:${lab.phone.replace(/[^0-9]/g, "")}`} className="mt-4 inline-flex text-lg font-semibold text-white">
                  {lab.phone}
                </a>
                <div className="mt-5 grid gap-2">
                  <a href={`mailto:${lab.email}`} className="inline-flex h-10 items-center justify-center rounded bg-[#9ee6d8] px-4 text-sm font-semibold text-[#09201c]">
                    Email customer service
                  </a>
                  <Link href={lab.meetHref} className={artisanControlClass({ tone: "inverse", size: "sm" })}>
                    Meet your lab
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer signUpHref="https://form.typeform.com/to/quuPCSff" />
    </main>
  );
}
