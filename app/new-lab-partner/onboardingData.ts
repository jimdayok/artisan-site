import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  Building2,
  ClipboardCheck,
  FileText,
  Glasses,
  Laptop,
  PackageCheck,
  PackageOpen,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

export type LabId = "peak" | "pike" | "pacific";
export type SetupStatus = "complete" | "not-started" | "not-applicable" | "skipped";
export type LensId = (typeof lensOptions)[number]["id"];
export type PracticeManagementAnswer = "yes" | "no" | "not-sure" | "";

export type ResourceLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Lab = {
  id: LabId;
  name: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  address: string;
  representative: string;
  image: string;
  href: string;
};

export type HubSection = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  icon: LucideIcon;
};

export type PortalFeature = {
  title: string;
  label: string;
  training: string;
  bullets: string[];
};

export type OrderingMethod = {
  name: string;
  logo?: string;
  summary: string;
  setupHelp: string;
  steps: string[];
  watch?: ResourceLink[];
};

export type TrainingResource = ResourceLink & {
  type: "Video" | "Guide" | "Brochure" | "Layout Chart" | "Comparison" | "Treatment" | "Frame Book" | "Action" | "Price List" | "Reference";
  description: string;
};

export type LensTrainingTrack = {
  lensIds: LensId[];
  title: string;
  why: string;
  learn: string[];
  resources: TrainingResource[];
};

export const supportContacts = {
  onboarding: {
    name: "Jim Day",
    email: "jim.day@artisanlabnetwork.com",
    phone: "269-350-4571",
    phoneHref: "tel:2693504571",
  },
  general: {
    name: "Artisan Lab Network Support",
    email: "customerservice@artisanlabnetwork.com",
    phone: "877-390-6900",
    phoneHref: "tel:8773906900",
  },
};

export const labs: Lab[] = [
  {
    id: "peak",
    name: "Peak Artisan Labs",
    phone: "833-690-4321",
    phoneHref: "tel:8336904321",
    email: "customerservice@peakartisanlabs.com",
    hours: "8:00 AM - 4:30 PM Mountain",
    address: "Denver, Colorado - confirm shipping address with customer service before sending frames.",
    representative: "Josh Opiol",
    image: "/images/labs/peak/284f314-0271-d8c3-565c-353313efff5_Pacific_Artisan_Labs_PEAK_Kajabi_Cover.jpg",
    href: "/peak-artisan-labs",
  },
  {
    id: "pike",
    name: "Pike Artisan Labs",
    phone: "888-239-0303",
    phoneHref: "tel:8882390303",
    email: "customerservice@pikeartisanlabs.com",
    hours: "8:00 AM - 4:30 PM Eastern",
    address: "Indianapolis, Indiana - confirm shipping address with customer service before sending frames.",
    representative: "Heather Branderhorst",
    image: "/images/labs/pike/fc1b02-878-0ef7-0715-5dd4b8f727e3_PIKE_Cover_2880x1200.jpg",
    href: "/pike-artisan-labs",
  },
  {
    id: "pacific",
    name: "Pacific Artisan Labs",
    phone: "877-390-6900",
    phoneHref: "tel:8773906900",
    email: "customerservice@pacificartisanlabs.com",
    hours: "8:00 AM - 4:30 PM Pacific",
    address: "12302 NE Marx St., Portland, OR 97230",
    representative: "Nicole Curtis",
    image: "/pdx/website-images/658caac-5fdb-5577-3c18-b67c85ce861c_Pacific_Artisan_Labs_PAL_Kajabi_Cover.jpg",
    href: "/pacific-artisan-labs",
  },
];

export const sections: HubSection[] = [
  {
    id: "lab",
    eyebrow: "Getting Started",
    title: "Confirm Your Artisan Lab",
    summary: "Identify the lab supporting your account, confirm service contacts, and know who to call before sending work.",
    icon: Building2,
  },
  {
    id: "portal",
    eyebrow: "Customer Portal",
    title: "Using the Customer Portal",
    summary: "Use the portal to access account-specific pricing, performance, policies, programs, and order resources.",
    icon: Laptop,
  },
  {
    id: "pricing-safety",
    eyebrow: "Pricing",
    title: "Pricing and Safety Systems",
    summary: "Use the core price list, understand when bundled lens systems like B5 price first, and prepare safety/frame orders correctly.",
    icon: ShieldCheck,
  },
  {
    id: "ordering",
    eyebrow: "Order Setup",
    title: "Ordering Methods",
    summary: "Choose each ordering method your practice will use and complete the setup steps before live orders.",
    icon: ClipboardCheck,
  },
  {
    id: "lens",
    eyebrow: "Product Activation",
    title: "Product and Lens Training",
    summary: "Select the product families your team will use and download the exact guides, charts, videos, and AR resources needed for launch.",
    icon: Glasses,
  },
  {
    id: "provider-resources",
    eyebrow: "Resource Library",
    title: "Provider Resources",
    summary: "Know where ongoing public resources live after the initial setup is complete.",
    icon: BookOpen,
  },
  {
    id: "patient-resources",
    eyebrow: "Patient Support",
    title: "Patient Resources",
    summary: "Know why patients use the public resources and where Tokai or specialty lens content fits.",
    icon: Users,
  },
  {
    id: "shipping",
    eyebrow: "Logistics",
    title: "Sending Frames & Shipping",
    summary: "Send frames, labels, manifests, and order information in a way that avoids receiving delays.",
    icon: Truck,
  },
];

export const portalLoginSteps = [
  {
    title: "Visit artisanslabs.com",
    detail: "Start at the public Artisan site. The portal is reached from the main navigation, so new team members do not need to remember a separate URL.",
  },
  {
    title: "Click Labs, then Customer Portal",
    detail: "Use the Labs menu and choose Customer Portal. This takes the user to the protected portal login flow.",
  },
  {
    title: "Enter your registered email",
    detail: "Use the email address Artisan has registered for your portal account. If the email is not recognized, request access instead of trying another teammate's login.",
  },
  {
    title: "Receive your PIN",
    detail: "The portal sends a PIN to the registered email. Enter the PIN to open account-specific pricing, reports, policies, and downloads.",
  },
  {
    title: "Use account-specific tools",
    detail: "Open assigned pricing, performance, policies, resources, and the Price Quote Builder from the regular portal dashboard.",
  },
];

export const portalFeatures: PortalFeature[] = [
  {
    title: "Purchases & Performance",
    label: "Reports",
    training:
      "Use this area when the practice wants to understand what it is buying, how product mix is changing, and where there may be opportunity. It is not a billing replacement; it is a performance review tool.",
    bullets: [
      "Track purchasing trends by period so the team can see whether usage is growing, flat, or shifting.",
      "Compare current and previous periods before changing product recommendations.",
      "Analyze product usage to see which lens families, AR treatments, or programs need more staff confidence.",
      "Use opportunities as a follow-up list for training, demos, or rep conversations.",
    ],
  },
  {
    title: "Pricing & Policies",
    label: "Pricing",
    training:
      "This is where staff should go before quoting or explaining account rules. Pricing is account-specific, so do not rely on a copied sheet from another practice. Some lens systems, including B5, use bundled package pricing that should be quoted before the core list, and safety/frame programs may use their own package logic.",
    bullets: [
      "Open the assigned price list for the practice, not a generic public resource.",
      "Review package pricing first when the order uses a system or bundle, especially B5 lens systems and safety/frame packages.",
      "Check policies before promising remake, warranty, shipping, or frame handling outcomes.",
      "Use policy pages to train new staff on what the lab can approve and what needs review.",
    ],
  },
  {
    title: "Programs & Opportunities",
    label: "Programs",
    training:
      "Programs and opportunities are account-specific prompts. Use them as a launch checklist for business programs, product initiatives, and partner opportunities the practice has access to.",
    bullets: [
      "Confirm which business programs are active for the account.",
      "Use growth initiatives as a discussion guide with the practice owner or manager.",
      "Review product opportunities when the team is underusing a product they intended to launch.",
      "Ask customer service or the rep before assuming a program applies.",
    ],
  },
  {
    title: "Price Quote Builder",
    label: "Quote",
    training:
      "Use the Price Quote Builder before quoting complex orders. It helps the team combine lens design, material, AR, finishing, and shipping choices into an estimated lab price. For B5 and other bundled lens systems, the package path should be used because the package prices the chosen products first.",
    bullets: [
      "Start with the correct price list and product family, then switch to the package path whenever the lens system is bundled.",
      "Add material, coating, finishing, and shipping selections in the same way the order will be placed.",
      "If the system qualifies for bundled pricing, choose the package option first so the package components price out before the base list.",
      "Treat the result as an estimate and confirm unusual orders with the lab before promising a patient price.",
    ],
  },
];

export const providerResourceGroups = [
  {
    title: "Provider Resources",
    items: ["Training Videos", "Downloads", "Lens Layout Charts", "Brochures", "Championing MVC Vision Rights", "Recorded Training"],
  },
  {
    title: "Practice Resources",
    items: ["Videos", "Downloads", "Policies", "Marketing Materials", "Comparison Guides", "Safety Resources", "Tokai Resources"],
  },
];

export const lensOptions = [
  { id: "artisan", label: "Artisan Designs" },
  { id: "iot", label: "IOT Branded Designs" },
  { id: "unity", label: "Unity Branded Designs" },
  { id: "varilux", label: "Varilux" },
  { id: "shamir", label: "Shamir" },
  { id: "hoya", label: "Hoya" },
  { id: "tokai", label: "Tokai" },
  { id: "sequel", label: "Sequel" },
  { id: "neurolens", label: "Neurolens" },
] as const;

export const orderingMethods: OrderingMethod[] = [
  {
    name: "DVI",
    logo: "/dvi-logo-color.png",
    summary: "Contact customer service to confirm lab setup.",
    setupHelp:
      "DVI should be confirmed before live orders. Customer service can help verify the correct lab connection, account number, lab routing, product availability, and lens setup. If the practice uses DVI, they can log in with the desktop client at https://thedvi.com/download-rxwizard/ or use the web-based version at https://www.rxwizardonline.com/.",
    steps: [
      "Call the customer service team for the lab selected above.",
      "Confirm whether the practice already has DVI access or needs setup assistance.",
      "Ask customer service to verify the account number, lab routing, product availability, and any VSP notes.",
      "Submit the first order only after the connection is confirmed.",
    ],
    watch: [
      { label: "Download RxWizard client", href: "https://thedvi.com/download-rxwizard/", external: true },
      { label: "Use RxWizard online", href: "https://www.rxwizardonline.com/", external: true },
    ],
  },
  {
    name: "VisionWeb",
    logo: "/visionweb.png",
    summary: "Add the correct Artisan lab in VisionWeb. The lab will receive and approve the connection.",
    setupHelp:
      "VisionWeb setup starts in the ordering platform at www.visionweb.com. Add the correct Artisan lab and notify customer service so the request can be approved and the account connection can be checked.",
    steps: [
      "Add the correct ALN lab inside VisionWeb.",
      "The lab receives the connection request.",
      "ALN approves the connection and confirms the account/lab setup.",
      "Begin sending orders after the lab connection is approved.",
    ],
  },
  {
    name: "SpecCheck",
    logo: "/logos/speccheck.png",
    summary: "A guided setup path for practices using SpecCheck Rx.",
    setupHelp:
      "SpecCheck users need the lab connected to the account before ordering. If the practice is new to SpecCheck, start at SpecCheck.com and Artisan can help finish the access flow and send ordering videos.",
    steps: [
      "Contact customer service and identify the team member who should receive access.",
      "Receive the welcome email and follow the setup instructions.",
      "Watch the ordering videos before the first live submission.",
      "Confirm the correct lab appears and ask Artisan to review the first order if anything looks unfamiliar.",
    ],
    watch: [
      { label: "SpecCheck Rx Ordering Video", href: "/provider-resources#videos" },
    ],
  },
  {
    name: "Eyefinity",
    logo: "/logos/eyefinitypm.png",
    summary: "Common for VSP users and selected from the lab dropdown.",
    setupHelp:
      "Eyefinity is commonly used when VSP routing is involved. If the practice uses VSP, start at Eyefinity.com, pre-select this path, and confirm exactly which lab should be chosen in the dropdown before orders begin.",
    steps: [
      "Add the lab from the Eyefinity dropdown.",
      "Confirm whether VSP orders must route differently than private-pay orders.",
      "Ask Artisan to review the setup before the first VSP order.",
      "Start ordering only after the practice understands which orders go through Eyefinity.",
    ],
  },
];

export const lensTrainingTracks: LensTrainingTrack[] = [
  {
    lensIds: ["artisan"],
    title: "Artisan Designs Training",
    why:
      "Use this when the practice will dispense Artisan private-label designs. The goal is for staff to understand the product ladder, how to position each family, and where to find fitting charts before ordering.",
    learn: [
      "Use Diamond, Platinum, Gold, and Artisan Design Series guides to explain the product lineup.",
      "Use layout charts before placing progressive, office, or specialty orders so measurements and fitting heights match the design.",
      "Use Artisan AR pages alongside the design guides so staff can recommend a complete lens, not just a design.",
    ],
    resources: [
      { type: "Guide", label: "Diamond Series Guide", href: "/files/artisan-diamond-series-guide.pdf", description: "Product leaflet for Diamond Series lens conversations and staff reference." },
      { type: "Guide", label: "Gold Series Guide", href: "/files/artisan-gold-series-guide.pdf", description: "Product leaflet for Gold Series positioning and recommendations." },
      { type: "Guide", label: "Platinum Series Guide", href: "/files/artisan-platinum-series-guide.pdf", description: "Product leaflet for Platinum Series premium design support." },
      { type: "Guide", label: "Artisan Design Series", href: "/files/artisan-design-series.pdf", description: "Overview guide for Artisan design families and recommendation support." },
      { type: "Brochure", label: "SD Reach Patient Brochure", href: "/files/Office Reader II SD Reach Patient Brochure-Artisan-draft1.pdf", description: "Patient-facing office reader brochure for SD Reach conversations." },
      { type: "Layout Chart", label: "Artisan Design Layout Charts", href: "/files/ArtisanDesigns/diamond_series.pdf", description: "Direct Artisan design layout chart reference. Additional charts are listed below and in Provider Resources." },
      { type: "Layout Chart", label: "SD Reach Layout Chart", href: "/files/ArtisanDesigns/sd_reach.pdf", description: "Layout chart for SD Reach workspace orders." },
      { type: "Comparison", label: "New Artisan Series Compared", href: "/files/New Artisan Series Compared.pdf", description: "Artisan product comparison guide for staff recommendations." },
    ],
  },
  {
    lensIds: ["varilux"],
    title: "Varilux Designs Training",
    why:
      "Use this when the practice will dispense Varilux designs. Staff should know where the product guide and technical references live before quoting or placing premium progressive orders.",
    learn: [
      "Use the Varilux Product Guide as the starting point for product positioning.",
      "Use Comfort, Comfort Max, X Series, and XR Series guides when matching patient needs to a specific Varilux design.",
      "Confirm premium progressive order details before sending first live orders.",
    ],
    resources: [
      { type: "Guide", label: "Varilux Product Guide", href: "/files/varilux-product-guide.pdf", description: "Portfolio guide for Varilux progressive lens recommendations." },
      { type: "Guide", label: "Varilux Comfort Guide", href: "/files/varilux-comfort.pdf", description: "Guide for Varilux Comfort product conversations." },
      { type: "Guide", label: "Varilux Comfort Max Guide", href: "/files/varilux-comfort-max.pdf", description: "Guide for Varilux Comfort Max recommendations." },
      { type: "Guide", label: "Varilux X Series Guide", href: "/files/varilux-x-series.pdf", description: "Guide for Varilux X Series positioning and order support." },
      { type: "Guide", label: "Varilux XR Series Guide", href: "/files/varilux-xr-series.pdf", description: "Guide for Varilux XR Series positioning and order support." },
      { type: "Action", label: "Request Varilux Layout Chart", href: `mailto:${supportContacts.onboarding.email}?subject=Varilux%20Layout%20Chart%20Request`, description: "Ask the onboarding team for the current Varilux layout chart before placing first orders." },
    ],
  },
  {
    lensIds: ["shamir"],
    title: "Shamir Designs Training",
    why:
      "Use this when the practice plans to send Shamir work. Keep the quick reference and dispensing guide close for first orders and staff questions.",
    learn: [
      "Use the quick reference to identify the Shamir product path.",
      "Use the dispensing guide before first orders so staff know what measurements and patient details matter.",
      "Review Driver Intelligence separately when the patient need is driving-specific.",
    ],
    resources: [
      { type: "Guide", label: "Shamir Quick Reference", href: "/files/shamir-quick-reference.pdf", description: "Quick reference for Shamir design selection and staff support." },
      { type: "Guide", label: "Shamir Dispensing Guide", href: "/files/shamir-dispensing-guide.pdf", description: "Dispensing guide for Shamir measurements and patient conversations." },
      { type: "Guide", label: "Shamir Driver Intelligence", href: "/files/shamir-driver-intelligence.pdf", description: "Driver Intelligence guide for driving-specific recommendations." },
      { type: "Action", label: "Request Shamir Layout Chart", href: `mailto:${supportContacts.onboarding.email}?subject=Shamir%20Layout%20Chart%20Request`, description: "Ask the onboarding team for the current Shamir layout chart before placing first orders." },
    ],
  },
  {
    lensIds: ["hoya"],
    title: "Hoya Designs Training",
    why:
      "Use this when the practice will order Hoya designs. Staff should download both the product guide and centration charts before the first Hoya orders.",
    learn: [
      "Use the Hoya product guide to understand the available design path.",
      "Use Hoya centration charts before placing first orders.",
      "Review iD Lifestyle 4 resources for premium progressive recommendations.",
    ],
    resources: [
      { type: "Guide", label: "Hoya Product Guide", href: "/files/hoya-product-guide.pdf", description: "Product guide for Hoya design selection and practice education." },
      { type: "Layout Chart", label: "Hoya Centration Charts", href: "/files/hoya-centration-charts.pdf", description: "Centration charts for Hoya order setup." },
      { type: "Guide", label: "Hoya iD Lifestyle 4", href: "/files/hoya-id-lifestyle-4.pdf", description: "Guide for Hoya iD Lifestyle 4 product positioning." },
    ],
  },
  {
    lensIds: ["iot"],
    title: "IOT Designs Training",
    why:
      "Use this when the practice will dispense IOT or Artisan Lens Systems designs. Staff should learn the design names, fitting expectations, and comparison language before trying to order from memory.",
    learn: [
      "Start with the IOT Portfolio Guide to understand the product families.",
      "Use Camber, Endless, Essential, and occupational guides to match designs to patient needs.",
      "Use the IOT centration chart before first orders so measurement assumptions do not create remakes.",
    ],
    resources: [
      { type: "Video", label: "IOT Product Training Webinar", href: "https://youtu.be/phvH3ahy2e4", external: true, description: "Training for Camber Steady Plus positioning, fitting, and practical dispensing conversations." },
      { type: "Guide", label: "IOT Portfolio Guide", href: "/files/iot-portfolio-guide.pdf", description: "Portfolio overview for IOT lens designs and platform options." },
      { type: "Guide", label: "Camber Steady Plus", href: "/files/camber-steady-plus.pdf", description: "Artisan Lens Systems guide for Camber Steady Plus recommendations." },
      { type: "Guide", label: "Endless Office", href: "/files/endless-office.pdf", description: "Occupational lens guide for workspace-specific visual needs." },
      { type: "Layout Chart", label: "IOT Centration Charts", href: "/files/iot-centration-charts.pdf", description: "Fitting and centration charts for IOT-powered lens designs." },
      { type: "Comparison", label: "IOT Comparison Guide", href: "/files/iot-comparison-guide.pdf", description: "Comparison guide for design selection and recommendation paths." },
    ],
  },
  {
    lensIds: ["unity"],
    title: "Unity Designs Training",
    why:
      "Use this when the practice orders Unity products or uses VSP-aligned workflows. Staff need to understand Unity V3, TechShield, and Eyefinity routing together.",
    learn: [
      "Review Unity V3 positioning before recommending it as a plan-friendly progressive.",
      "Pair Unity training with TechShield AR because those products are commonly discussed together.",
      "Use the ordering section to confirm Eyefinity and VSP routing before placing live orders.",
    ],
    resources: [
      { type: "Video", label: "Unity V3 Products", href: "https://youtu.be/cLhLfThS7Gs", external: true, description: "Unity V3 product education for teams comparing plan-friendly lens options and recommending with confidence." },
      { type: "Guide", label: "Unity V3 Sales Guide", href: "/files/unity-v3-sales-guide.pdf", description: "Sales guide for Unity V3 lens positioning and plan conversations." },
      { type: "Brochure", label: "Unity V3 Product Guide", href: "/files/unity-v3-product-guide.pdf", description: "Product guide for Unity V3 training and staff reference." },
      { type: "Guide", label: "Unity V3 White Paper", href: "/files/5688bc8-2e3-c061-3d27-251215283ac_Unity_V3_Whitepaper.pdf", description: "Technical white paper for Unity V3 performance and product context." },
      { type: "Treatment", label: "TechShield AR Coatings Guide", href: "/files/TechShield_AR_Coatings_Sales_Sheet_2023.pdf", description: "Treatment guide for TechShield AR recommendations." },
      { type: "Guide", label: "TechShield FAQ", href: "/files/unity-performance-coatings_retirement_faqs.pdf", description: "FAQ for the Unity performance coatings retirement and TechShield transition." },
      { type: "Action", label: "Request Unity Layout Chart", href: `mailto:${supportContacts.onboarding.email}?subject=Unity%20Layout%20Chart%20Request`, description: "Ask the onboarding team for the current Unity layout chart before placing first orders." },
    ],
  },
  {
    lensIds: ["tokai"],
    title: "Tokai Training",
    why:
      "Use this when the practice expects to dispense Tokai. The team should learn how Tokai Select, Bi-AS SV, Reset, Largo, and tint options fit into patient conversations.",
    learn: [
      "Use the Select Guide as the starting point for the Tokai product family.",
      "Use Reset and Largo guides to explain specialty recommendations clearly.",
      "Use the Tint Guide before discussing color, density, or patient preference.",
    ],
    resources: [
      { type: "Video", label: "Tokai Product Training", href: "https://youtu.be/9P7VEmI0ZwY", external: true, description: "Tokai product training for design selection, recommendation language, and dispensing support." },
      { type: "Guide", label: "Tokai Select Guide", href: "/files/tokai-select-guide.pdf", description: "Overview guide for Tokai Select options and positioning." },
      { type: "Guide", label: "Tokai Bi-AS SV Guide", href: "/files/tokai-bias-sv-guide.pdf", description: "Single vision Bi-AS reference for fitting and product selection." },
      { type: "Guide", label: "Tokai Reset Guide", href: "/files/tokai-reset-guide.pdf", description: "Tokai Reset resource for patient conversations and dispensing support." },
      { type: "Guide", label: "Tokai Largo Guide", href: "/files/tokai-largo-guide.pdf", description: "Tokai Largo guide for product positioning and lens selection." },
      { type: "Guide", label: "Tokai Tint Guide", href: "/files/tokai-tint-guide.pdf", description: "Tint reference for Tokai lens options and patient preferences." },
      { type: "Action", label: "Request Tokai Layout Chart", href: `mailto:${supportContacts.onboarding.email}?subject=Tokai%20Layout%20Chart%20Request`, description: "Ask the onboarding team for the current Tokai layout chart before placing first orders." },
    ],
  },
  {
    lensIds: ["neurolens"],
    title: "Neurolens Training",
    why:
      "Use this when the practice offers Neurolens. Staff should understand the patient conversation and how Neurolens materials support symptom-based recommendations.",
    learn: [
      "Use the provider brochure to explain what Neurolens is and how the practice positions it.",
      "Confirm ordering and AR expectations with the lab before first live orders.",
    ],
    resources: [
      { type: "Guide", label: "Neurolens Provider Brochure", href: "/files/neurolens-provider-brochure.pdf", description: "Provider-facing Neurolens brochure for patient conversations and practice education." },
      { type: "Action", label: "Request Neurolens Layout Chart", href: `mailto:${supportContacts.onboarding.email}?subject=Neurolens%20Layout%20Chart%20Request`, description: "Ask the onboarding team for the current Neurolens layout chart before placing first orders." },
    ],
  },
  {
    lensIds: ["sequel"],
    title: "Sequel Designs Training",
    why:
      "Use this when the practice plans to dispense Sequel. Review the overview before launching so staff can explain where Sequel fits in the lens conversation.",
    learn: [
      "Use the Sequel lens overview to train basic positioning.",
      "Confirm order availability and account setup before the first Sequel orders.",
    ],
    resources: [
      { type: "Guide", label: "Sequel Lens Overview", href: "/files/sequel-lens-overview.pdf", description: "Overview for Sequel lens product conversations." },
      { type: "Guide", label: "Sequel Promotion", href: "/files/sequel-promotion.pdf", description: "Practice-facing Sequel promotional resource." },
      { type: "Action", label: "Request Sequel Layout Chart", href: `mailto:${supportContacts.onboarding.email}?subject=Sequel%20Layout%20Chart%20Request`, description: "Ask the onboarding team for the current Sequel layout chart before placing first orders." },
    ],
  },
];

export const requiredTrainingResources: TrainingResource[] = [
  { type: "Treatment", label: "Artisan AR Portfolio", href: "/artisan-ar", description: "Review Artisan AR treatments so staff can recommend a complete lens system." },
  { type: "Treatment", label: "TechShield AR Coatings Guide", href: "/files/TechShield_AR_Coatings_Sales_Sheet_2023.pdf", description: "Required for Unity and useful for teams comparing AR treatment paths." },
  { type: "Comparison", label: "AR Comparison Guide", href: "#comparison-guide", description: "Use the generated Product Comparison Guide for Artisan, TechShield, Crizal, and Glacier AR crosswalks." },
  { type: "Layout Chart", label: "Layout Charts", href: "/provider-resources#artisan-designs", description: "Use fitting and centration charts before first orders to avoid measurement-driven remakes." },
  { type: "Comparison", label: "Comparison Guides", href: "/files/iot-comparison-guide.pdf", description: "Use comparison guides to help staff match product families to patient needs." },
];

export const safetyTrainingResources: TrainingResource[] = [
  { type: "Frame Book", label: "ArmouRx Frame Book", href: "/files/armou-rx-frame-book.pdf", description: "Safety frame catalog for ArmouRx product selection and occupational eyewear programs." },
  { type: "Frame Book", label: "DVX / Wiley X Frame Book", href: "/files/dvx-wileyx-frame-book.pdf", description: "DVX and Wiley X frame options for safety, outdoor, and performance eyewear needs." },
  { type: "Frame Book", label: "Wiley X Frame Book", href: "/files/wileyx-frame-book.pdf", description: "Wiley X frame book for ANSI-rated and performance-focused eyewear conversations." },
  { type: "Frame Book", label: "ArtCraft Frame Book", href: "/files/artcraft-frame-book.pdf", description: "ArtCraft frame references for safety and specialty frame selection." },
  { type: "Frame Book", label: "SafeVision Frame Book", href: "/files/safevision-frame-book.pdf", description: "SafeVision frame catalog for occupational eyewear and safety program support." },
  { type: "Price List", label: "Safety Price List", href: "/portal/price-list/y5", description: "Open Artisan Safety Systems Y5 pricing. Safety pricing is tiered on the price list, and supply should be marked when the order uses supplied-inventory pricing." },
  { type: "Action", label: "Order Your Free Safety Kit", href: "https://form.typeform.com/to/rDUQssNn", external: true, description: "Request demonstration frames and safety program materials for your practice." },
  { type: "Action", label: "Request Current Program Pricing", href: "https://form.typeform.com/to/quuPCSff", external: true, description: "Request current program details and account-specific pricing support." },
  { type: "Action", label: "Request Frame Manifest PDF", href: `mailto:${supportContacts.onboarding.email}?subject=Frame%20Manifest%20PDF%20Request`, description: "Request the current manifest before sending frames so the lab can match frames, patients, accounts, and orders correctly." },
];

export const shippingVisuals = [
  { title: "Box Graphics", image: "/images/factory-machines-boxes-2024-1.jpg", icon: Boxes },
  { title: "Shipping Labels", image: "/images/white-cloth-bags-2024-1.jpg", icon: FileText },
  { title: "Lab Imagery", image: "/images/team-at-lab-2025-1.jpg", icon: PackageOpen },
  { title: "Frame Photos", image: "/images/framesystems.png", icon: PackageCheck },
];

export const resourceLinks: ResourceLink[] = [
  { label: "Customer Portal", href: "/portal" },
  { label: "Price Quote Builder", href: "/portal/price-list/calculator" },
  { label: "Provider Resources", href: "/provider-resources" },
  { label: "Patient Resources", href: "/patient-resources" },
];
