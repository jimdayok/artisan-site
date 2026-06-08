import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Glasses,
  Laptop,
  Lock,
  Mail,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Wrench,
} from "lucide-react";

export type LabKey = "pacific" | "peak" | "pike" | "unknown";
export type ModuleId =
  | "welcome"
  | "lab"
  | "portal"
  | "resources"
  | "ordering"
  | "shipping"
  | "lens"
  | "ar"
  | "sun"
  | "systems"
  | "vsp"
  | "remakes"
  | "complimentary"
  | "launch";

export type LensFamilyId =
  | "iot-progressive"
  | "iot-sv"
  | "iot-anti-fatigue"
  | "artisan-design"
  | "unity-v3"
  | "unity-office"
  | "photochromic"
  | "artisan-ar"
  | "safety-systems"
  | "not-sure";

export type OrderingMethodId = "dvi" | "speccheck" | "visionweb" | "eyefinity" | "not-sure";

export type LabInfo = {
  key: LabKey;
  name: string;
  email: string;
  phone: string;
  phoneHref: string;
  handles: string;
  shipping: string;
  remake: string;
};

export type OnboardingModule = {
  id: ModuleId;
  title: string;
  time: string;
  why: string;
  icon: LucideIcon;
};

export type ResourceLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const supportContacts = {
  onboarding: {
    name: "Jim Day",
    email: "jim.day@artisanlabnetwork.com",
    phone: "269-350-4571",
    phoneHref: "tel:2693504571",
  },
  support: {
    name: "Artisan Lab Network Support",
    email: "customerservice@artisanlabnetwork.com",
    phone: "877-390-6900",
    phoneHref: "tel:8773906900",
  },
};

export const labs: Record<LabKey, LabInfo> = {
  pacific: {
    key: "pacific",
    name: "Pacific Artisan Labs",
    email: "customerservice@pacificartisanlabs.com",
    phone: "877-390-6900",
    phoneHref: "tel:8773906900",
    handles:
      "Account support, ordering connection, product training coordination, VSP/Eyefinity routing review, and customer service for Pacific-connected accounts.",
    shipping:
      "Contact customer service for shipping labels, frame shipping questions, VSP routing notes, and shipment confirmation.",
    remake:
      "Send remake questions to customer service with the order number, patient initials, remake reason, and any measurements or frame details requested by the lab.",
  },
  peak: {
    key: "peak",
    name: "Peak Artisan Labs",
    email: "customerservice@peakartisanlabs.com",
    phone: "833-690-4321",
    phoneHref: "tel:8336904321",
    handles:
      "Regional lab support, ordering connection, training coordination, shipping help, and customer service for Peak-connected accounts.",
    shipping:
      "Ask Peak customer service about labels, local Colorado courier notes when applicable, and shipping method setup.",
    remake:
      "Contact Peak customer service with the order number, patient initials, remake reason, and any fitting or frame information needed for review.",
  },
  pike: {
    key: "pike",
    name: "Pike Artisan Labs",
    email: "customerservice@pikeartisanlabs.com",
    phone: "888-239-0303",
    phoneHref: "tel:8882390303",
    handles:
      "Regional lab support, ordering connection, training coordination, shipping help, and customer service for Pike-connected accounts.",
    shipping:
      "Ask Pike customer service about labels, local Indiana courier notes when applicable, and shipping method setup.",
    remake:
      "Contact Pike customer service with the order number, patient initials, remake reason, and any fitting or frame information needed for review.",
  },
  unknown: {
    key: "unknown",
    name: "We need to confirm your lab connection",
    email: supportContacts.onboarding.email,
    phone: supportContacts.onboarding.phone,
    phoneHref: supportContacts.onboarding.phoneHref,
    handles:
      "We could not confidently identify the lab relationship from account data. Request help and we will verify the correct lab for this account.",
    shipping:
      "Request lab connection help before relying on shipping instructions.",
    remake:
      "Request lab connection help before submitting remake questions.",
  },
};

export const lensFamilyOptions: Array<{ id: LensFamilyId; label: string }> = [
  { id: "iot-progressive", label: "IOT branded progressive lenses" },
  { id: "iot-sv", label: "IOT branded single vision" },
  { id: "iot-anti-fatigue", label: "IOT branded anti-fatigue" },
  { id: "artisan-design", label: "Artisan Design Series" },
  { id: "unity-v3", label: "Unity V3 progressives" },
  { id: "unity-office", label: "Unity Office / Unity Relieve" },
  { id: "photochromic", label: "Photochromics / SunSync / Neochromes" },
  { id: "artisan-ar", label: "Artisan AR treatments" },
  { id: "safety-systems", label: "Safety / Artisan Systems" },
  { id: "not-sure", label: "Not sure yet" },
];

export const orderingMethodOptions: Array<{ id: OrderingMethodId; label: string }> = [
  { id: "dvi", label: "DVI Rx Wizard" },
  { id: "speccheck", label: "SpecCheck" },
  { id: "visionweb", label: "VisionWeb" },
  { id: "eyefinity", label: "Eyefinity" },
  { id: "not-sure", label: "Not sure" },
];

export const modules: OnboardingModule[] = [
  { id: "welcome", title: "Welcome / How to Use This Hub", time: "5 min", why: "Orient your team around the selected account and launch path.", icon: BadgeCheck },
  { id: "lab", title: "Lab Connection Information", time: "8 min", why: "Know which lab supports your account and who to contact.", icon: Mail },
  { id: "portal", title: "Portal Pricing and Reports", time: "15 min", why: "Find account-specific price lists, packages, calculator tools, policies, and reports.", icon: BarChart3 },
  { id: "resources", title: "Website and Provider Resources Training", time: "10 min", why: "Know when to use Provider Resources, public education pages, and private portal pages.", icon: BookOpen },
  { id: "ordering", title: "Ordering Methods", time: "20 min", why: "Connect DVI, SpecCheck, VisionWeb, or Eyefinity before submitting orders.", icon: Laptop },
  { id: "shipping", title: "Sending Frames and Shipping Labels", time: "12 min", why: "Avoid delays when sending frames, requesting labels, and using manifests.", icon: Truck },
  { id: "lens", title: "Lens Education", time: "25 min", why: "Train only on the lens families your practice will use.", icon: Glasses },
  { id: "ar", title: "AR Treatments", time: "12 min", why: "Understand premium AR options, positioning, pricing, and compatibility checks.", icon: Sparkles },
  { id: "sun", title: "Photochromics and Sun Options", time: "10 min", why: "Match photochromic and sun solutions to patient needs.", icon: Sun },
  { id: "systems", title: "Artisan Systems / Safety / Bundles", time: "10 min", why: "Use bundles and systems where they simplify ordering.", icon: Boxes },
  { id: "vsp", title: "VSP / Eyefinity / Managed Care", time: "12 min", why: "Confirm routing and managed care setup before live orders.", icon: ShieldCheck },
  { id: "remakes", title: "Remakes and Policies", time: "10 min", why: "Know how to work with customer service on remakes and policy questions.", icon: Wrench },
  { id: "complimentary", title: "Complimentary Lens Orders", time: "8 min", why: "Use staff training lenses correctly and avoid patient-order misuse.", icon: PackageCheck },
  { id: "launch", title: "First Order Launch Checklist", time: "10 min", why: "Give your team a clear finish line before the first live order.", icon: ClipboardCheck },
];

export const portalResources: ResourceLink[] = [
  { label: "Open My Price List", href: "/portal/price-list" },
  { label: "View Packages", href: "/portal/price-list/packages" },
  { label: "Use Calculator", href: "/portal/price-list/calculator" },
  { label: "Product Catalog", href: "/portal/price-list/catalog" },
  { label: "Policies", href: "/portal/price-list/policies" },
  { label: "Open My Reports", href: "/portal/performance" },
];

export const providerResources: ResourceLink[] = [
  { label: "Provider Resources", href: "/provider-resources" },
  { label: "Product education", href: "/provider-resources#product-information" },
  { label: "Artisan AR pages", href: "/artisan-ar/nytopia" },
  { label: "Tokai resources", href: "/provider-resources#tokai" },
  { label: "Unity resources", href: "/provider-resources#unity-vsp" },
  { label: "Lab policies", href: "/portal/price-list/policies" },
  { label: "Patient resources", href: "/patient-resources" },
  { label: "Contact/support", href: "/provider-resources#lab-customer-service" },
];

export const arTreatments = [
  { name: "Nytopia", logo: "/ar/nytopia.png", href: "/artisan-ar/nytopia", use: "Premium everyday AR experience.", note: "Confirm availability by lens, lab, material, and program." },
  { name: "Armour", logo: "/ar/armour.png", href: "/artisan-ar/armour", use: "Durable everyday AR positioning.", note: "Confirm availability by lens, lab, material, and program." },
  { name: "Azure", logo: "/ar/azure.png", href: "/artisan-ar/azure", use: "Blue-light oriented AR positioning.", note: "Confirm availability by lens, lab, material, and program." },
  { name: "Emerald", logo: "/ar/emerald.png", href: "/artisan-ar/emerald", use: "Premium clarity and comfort positioning.", note: "Confirm availability by lens, lab, material, and program." },
  { name: "Diamond Sun", logo: "", href: "/portal/price-list", use: "Sunwear-oriented AR option.", note: "Graphic asset and exact training route need confirmation." },
  { name: "TechShield", logo: "/logos/VSP_Vision_Logotype_RGB_Blk.png", href: "/provider-resources#unity-vsp", use: "Unity/VSP-aligned premium coating path where relevant.", note: "Confirm availability in your ordering system or with your lab." },
];

export const publicTeaserModules = [
  "Account and lab connection",
  "Portal pricing and reports",
  "Ordering and frame shipping",
  "Lens education",
  "AR treatments",
  "VSP / Eyefinity setup",
  "Remakes and policies",
  "Launch checklist",
];

export const statusIcons = {
  "Not started": FileText,
  "In progress": Lock,
  Complete: CheckCircle2,
} satisfies Record<string, LucideIcon>;
