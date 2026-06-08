import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Contact,
  FileText,
  Glasses,
  Landmark,
  Laptop,
  MapPinned,
  PackageCheck,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
} from "lucide-react";

export type LabId = "pacific" | "peak" | "pike" | "unsure";
export type LensPathId = "artisan" | "iot" | "unity" | "mixed" | "unsure";
export type ModuleStatus = "Not started" | "In progress" | "Complete";

export type QuestionId =
  | "lab"
  | "equityPartner"
  | "lensPath"
  | "vsp"
  | "eyefinity"
  | "managedCare"
  | "providerChoiceState"
  | "firstNeed";

export type OnboardingAnswers = Partial<Record<QuestionId, string>>;

export type Lab = {
  id: LabId;
  name: string;
  shortName: string;
  phone: string;
  phoneHref: string;
  email: string;
  location: string;
  notes: string;
  handles: string;
  networkFit: string;
  href: string;
};

export type Question = {
  id: QuestionId;
  prompt: string;
  helper?: string;
  options: { value: string; label: string }[];
};

export type ResourceLink = {
  label: string;
  href: string;
  external?: boolean;
  note?: string;
};

export type OnboardingModule = {
  id: string;
  eyebrow: string;
  title: string;
  time: string;
  why: string;
  summary: string;
  icon: LucideIcon;
  tags: string[];
  bullets: string[];
  links?: ResourceLink[];
  videos?: string[];
};

export type OrderingSystem = {
  id: string;
  name: string;
  useIf: string;
  practiceSteps: string[];
  artisanSteps: string[];
  sendUs: string[];
  mistakes: string[];
  confirmation: string[];
};

export type LensTrack = {
  id: LensPathId;
  title: string;
  summary: string;
  bullets: string[];
  links: ResourceLink[];
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
    id: "pacific",
    name: "Pacific Artisan Labs",
    shortName: "Pacific",
    phone: "877-390-6900",
    phoneHref: "tel:8773906900",
    email: "customerservice@pacificartisanlabs.com",
    location: "Portland, Oregon",
    notes:
      "Primary network lab for many account setups, including VSP/Eyefinity routing when instructed.",
    handles:
      "Full-service optical lab production, account support, portal guidance, VSP routing support, and product training coordination.",
    networkFit:
      "Pacific is a founding Artisan lab and often acts as the routing anchor for network programs and national setup workflows.",
    href: "/pacific-artisan-labs",
  },
  {
    id: "peak",
    name: "Peak Artisan Labs",
    shortName: "Peak",
    phone: "833-690-4321",
    phoneHref: "tel:8336904321",
    email: "customerservice@peakartisanlabs.com",
    location: "Colorado",
    notes:
      "Regional Artisan lab serving practices that need local support and network product access.",
    handles:
      "Optical lab service, customer support, onboarding coordination, and ordering platform setup for Peak customers.",
    networkFit:
      "Peak extends the Artisan model with regional service while connecting practices to shared network resources and product education.",
    href: "/peak-artisan-labs",
  },
  {
    id: "pike",
    name: "Pike Artisan Labs",
    shortName: "Pike",
    phone: "888-239-0303",
    phoneHref: "tel:8882390303",
    email: "customerservice@pikeartisanlabs.com",
    location: "Indiana",
    notes:
      "Regional Artisan lab for practices needing Pike support, local guidance, and network product access.",
    handles:
      "Optical lab service, customer support, onboarding coordination, and ordering platform setup for Pike customers.",
    networkFit:
      "Pike brings Artisan service into the Midwest while using shared network resources for training, programs, and operational support.",
    href: "/pike-artisan-labs",
  },
  {
    id: "unsure",
    name: "Not sure yet",
    shortName: "Not sure",
    phone: supportContacts.onboarding.phone,
    phoneHref: supportContacts.onboarding.phoneHref,
    email: supportContacts.onboarding.email,
    location: "We will help route you",
    notes:
      "Use this option if your team has not confirmed the service lab or if VSP routing makes the setup unclear.",
    handles:
      "Onboarding support, account routing review, managed care setup review, and next-step coordination.",
    networkFit:
      "Artisan Lab Network will help identify the correct lab relationship and any special routing instructions.",
    href: "/meet-the-artisans",
  },
];

export const questions: Question[] = [
  {
    id: "lab",
    prompt: "Which Artisan lab are you working with?",
    options: [
      { value: "pacific", label: "Pacific Artisan Labs" },
      { value: "peak", label: "Peak Artisan Labs" },
      { value: "pike", label: "Pike Artisan Labs" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "equityPartner",
    prompt: "Are you an equity partner?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "discussion", label: "In discussion" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "lensPath",
    prompt: "Which lens path has your practice selected?",
    helper:
      "Tell us which lens path your practice selected so we can show the right training.",
    options: [
      { value: "artisan", label: "Artisan private-label lens solutions" },
      { value: "iot", label: "IOT branded lens solutions" },
      { value: "unity", label: "Unity lens solutions" },
      { value: "mixed", label: "A mix of these" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "vsp",
    prompt: "Are you using Artisan Lab Network for VSP orders?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "eyefinity",
    prompt: "Do you use Eyefinity?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "managedCare",
    prompt: "Do you accept NBN or other managed vision plans?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "providerChoiceState",
    prompt:
      "Are you located in a state where managed vision care laws allow provider choice / freedom of choice lab access?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "review", label: "Not sure, help me review this" },
    ],
  },
  {
    id: "firstNeed",
    prompt: "What do you need to do first?",
    options: [
      { value: "account", label: "Open or confirm my account" },
      { value: "orders", label: "Learn how to place orders" },
      { value: "vsp", label: "Set up VSP / Eyefinity" },
      { value: "pricing", label: "Find my pricing" },
      { value: "reports", label: "Find my reports" },
      { value: "products", label: "Learn my lens products" },
      { value: "ar", label: "Learn AR treatments" },
      { value: "optician", label: "Train a new optician" },
      { value: "first-order", label: "Submit my first order" },
    ],
  },
];

export const orderingSystems: OrderingSystem[] = [
  {
    id: "dvi",
    name: "DVI Rx Wizard",
    useIf:
      "Your practice places lab orders through DVI Rx Wizard or has used DVI with another lab before.",
    practiceSteps: [
      "Tell us whether your team already has a DVI Rx Wizard login.",
      "Send the login email your team uses so we can connect the correct lab relationship.",
      "If you have not used it before, ask us to create access and send setup instructions.",
    ],
    artisanSteps: [
      "Confirm the lab connection.",
      "Verify account routing and product availability.",
      "Help your team confirm the first order before submission.",
    ],
    sendUs: [
      "Practice name and account number if assigned.",
      "DVI login email or the contact who should receive access.",
      "Preferred Artisan lab and any VSP routing notes.",
    ],
    mistakes: [
      "Using an old login email that is not tied to the current practice.",
      "Submitting before the lab connection is confirmed.",
      "Selecting a package or coating before product availability is reviewed.",
    ],
    confirmation: [
      "Login works.",
      "Correct Artisan lab appears.",
      "Account number is connected.",
      "First test order has been reviewed.",
    ],
  },
  {
    id: "speccheck",
    name: "SpecCheck Rx",
    useIf:
      "Your office uses SpecCheck Rx for lab ordering or wants Artisan to create a new SpecCheck workflow.",
    practiceSteps: [
      "If you have used SpecCheck before, send the email used with SpecCheck.",
      "If you are new to SpecCheck, send the team member who should receive access.",
      "Wait for connection confirmation before submitting the first order.",
    ],
    artisanSteps: [
      "Connect the appropriate Artisan lab.",
      "Create new access when needed.",
      "Send setup instructions and help confirm the first order.",
    ],
    sendUs: [
      "SpecCheck login email or new access contact.",
      "Preferred lab.",
      "Practice account number if assigned.",
    ],
    mistakes: [
      "Creating a duplicate SpecCheck account without lab connection review.",
      "Sending incomplete team contact information.",
      "Assuming VSP routing is the same as private-pay routing.",
    ],
    confirmation: [
      "SpecCheck account is connected.",
      "Correct lab is visible.",
      "Team knows where to select services and packages.",
    ],
  },
  {
    id: "visionweb",
    name: "VisionWeb",
    useIf:
      "Your practice places electronic orders through VisionWeb and needs Artisan added as a lab.",
    practiceSteps: [
      "Add the appropriate Artisan lab as a lab in VisionWeb.",
      "Notify Artisan when the lab has been added.",
      "Send account and contact details so we can confirm the connection.",
    ],
    artisanSteps: [
      "Confirm the VisionWeb connection.",
      "Validate account routing.",
      "Help review the first submitted order.",
    ],
    sendUs: [
      "Practice name.",
      "VisionWeb contact.",
      "Lab added in VisionWeb.",
      "Any VSP or managed care routing notes.",
    ],
    mistakes: [
      "Adding the wrong lab for the account setup.",
      "Submitting before Artisan confirms the connection.",
      "Missing special program or managed care notes.",
    ],
    confirmation: [
      "Artisan lab is added.",
      "Connection is confirmed.",
      "First order path is understood.",
    ],
  },
  {
    id: "eyefinity",
    name: "Eyefinity / VSP",
    useIf:
      "Your practice uses Eyefinity for VSP routing or needs VSP orders sent through Artisan Lab Network.",
    practiceSteps: [
      "Add Pacific Artisan Labs to the lab list when instructed for VSP routing.",
      "Tell us if your primary day-to-day lab is Peak or Pike so routing can be reviewed.",
      "Confirm your VSP and Eyefinity setup before submitting VSP orders.",
    ],
    artisanSteps: [
      "Review routing requirements.",
      "Confirm whether Pacific is required in Eyefinity for your setup.",
      "Help validate VSP order routing before launch.",
    ],
    sendUs: [
      "Whether you use Eyefinity.",
      "Whether you are sending VSP orders.",
      "Your selected Artisan lab and any managed care plans.",
    ],
    mistakes: [
      "Adding Peak or Pike when the VSP/Eyefinity setup requires Pacific routing.",
      "Assuming private-pay and VSP orders use identical routing.",
      "Submitting live orders before routing is confirmed.",
    ],
    confirmation: [
      "Pacific is added when required.",
      "VSP routing is confirmed.",
      "Team knows which orders go through Eyefinity.",
    ],
  },
];

export const portalResources: ResourceLink[] = [
  { label: "Customer Portal", href: "/portal" },
  { label: "Reports and performance", href: "/portal/performance" },
  { label: "Price list entry", href: "/portal/price-list" },
  { label: "Package pricing", href: "/portal/price-list/packages" },
  { label: "Price calculator", href: "/portal/price-list/calculator" },
  { label: "Product catalog", href: "/portal/price-list/catalog" },
  { label: "Policies", href: "/portal/price-list/policies" },
];

export const providerResources: ResourceLink[] = [
  { label: "Provider Resources", href: "/provider-resources" },
  { label: "Professional Resources", href: "/provider-resources/professional-resources" },
  { label: "Product education", href: "/provider-resources#product-information" },
  { label: "Artisan AR", href: "/artisan-ar/nytopia" },
  { label: "Tokai resources", href: "/provider-resources#tokai" },
  { label: "Unity resources", href: "/provider-resources#unity-vsp" },
  { label: "Lab policies", href: "/portal/price-list/policies" },
  { label: "Patient resources", href: "/patient-resources" },
  { label: "Contact support", href: "/provider-resources#lab-customer-service" },
];

export const lensTracks: LensTrack[] = [
  {
    id: "artisan",
    title: "Artisan Private-Label Lens Solutions",
    summary:
      "Use this track when your practice selected Artisan private-label names for a simplified, practice-friendly lens lineup.",
    bullets: [
      "Artisan private-label names may represent lens designs available through Artisan Lab Network.",
      "Private-label naming helps the team present a clear lens lineup without overloading the patient conversation.",
      "Train opticians to read the Artisan lens lineup, layout/fitting references, special options, and portal pricing together.",
      "Confirm availability by lab and order path before launch.",
    ],
    links: [
      { label: "View My Price List in Portal", href: "/portal/price-list" },
      { label: "Provider Resources", href: "/provider-resources#artisan-designs" },
    ],
  },
  {
    id: "iot",
    title: "IOT Branded Lens Solutions",
    summary:
      "Use this track when your practice selected IOT branded designs and needs team training on design names, options, and ordering.",
    bullets: [
      "Identify IOT design names and match them to the orderable options in the portal.",
      "Review positioning guidance for progressive, occupational, single vision, and specialty options.",
      "Use portal pricing for account-specific IOT pricing.",
      "Confirm fitting and ordering basics before the first live order.",
    ],
    links: [
      { label: "View My IOT Pricing", href: "/portal/price-list" },
      { label: "IOT Resources", href: "/provider-resources#iot" },
    ],
  },
  {
    id: "unity",
    title: "Unity Lens Solutions",
    summary:
      "Use this track when your practice selected Unity products and needs VSP-aligned product, fitting, and ordering training.",
    bullets: [
      "Review Unity V3, Unity Office, Unity Relieve, SunSync, and TechShield as applicable.",
      "Confirm whether VSP Unity Rewards guidance applies to your setup.",
      "Train the team on fitting and ordering basics before launch.",
      "Use portal pricing and resources for account-specific guidance.",
    ],
    links: [
      { label: "Review Unity Ordering Guidance", href: "/provider-resources#unity-vsp" },
      { label: "Unity Rebate Program", href: "/programs?p=unity-rebate" },
    ],
  },
  {
    id: "mixed",
    title: "Mixed / Multiple Lens Paths",
    summary:
      "Many practices use more than one solution. This track helps the team identify the product family first, then use the correct training and pricing.",
    bullets: [
      "Confirm whether each order is Artisan private-label, IOT branded, Unity, or another product family.",
      "Use portal pricing for the specific product family and account program.",
      "Keep fitting charts and order notes organized by product family.",
      "Ask Artisan to review the first orders from each path.",
    ],
    links: [
      { label: "Open Product Catalog", href: "/portal/price-list/catalog" },
      { label: "Provider Resources", href: "/provider-resources" },
    ],
  },
  {
    id: "unsure",
    title: "Not Sure Which Path Was Selected",
    summary:
      "Use this track when a new team member needs help confirming the practice's selected lens path.",
    bullets: [
      "Check your onboarding email, price list access, or account setup notes.",
      "Ask the practice owner or manager which product path was selected.",
      "Contact Artisan if your team needs us to review account setup and training materials.",
    ],
    links: [
      { label: "Ask for Lens Path Help", href: `mailto:${supportContacts.onboarding.email}?subject=Lens%20Path%20Training%20Help` },
      { label: "Open Portal", href: "/portal" },
    ],
  },
];

export const modules: OnboardingModule[] = [
  {
    id: "welcome",
    eyebrow: "Module 1",
    title: "Welcome / How to Use This Hub",
    time: "5 min",
    why: "This is your single launch center for new practice setup and new team member training.",
    summary:
      "Start here, answer the path builder, and complete the modules that match your lab and selected product path.",
    icon: Route,
    tags: ["Everyone", "Start here"],
    bullets: [
      "This hub is for new customers and new team members at existing customer practices.",
      "It guides lab selection, account setup, ordering, pricing, reports, product training, AR training, shipping, and support.",
      "Complete the modules that match your selected lab, ordering setup, managed care setup, and lens path.",
    ],
  },
  {
    id: "lab",
    eyebrow: "Module 2",
    title: "Get to Know Your Lab",
    time: "8 min",
    why: "Your lab selection determines customer service contacts, routing details, and first-order support.",
    summary:
      "Review Pacific, Peak, Pike, or ask us to help confirm the correct lab relationship.",
    icon: MapPinned,
    tags: ["Lab", "Support"],
    bullets: [
      "Use the lab selector to confirm customer service contacts and service notes.",
      "Ask for onboarding help if VSP routing or regional lab setup is unclear.",
      "Use mailto links for customer service so messages route correctly.",
    ],
    videos: ["Meet your lab"],
  },
  {
    id: "account",
    eyebrow: "Module 3",
    title: "Account Setup",
    time: "10 min",
    why: "Your team needs account number, contacts, ordering access, pricing access, and portal access before launch.",
    summary:
      "Understand what happens after the account application is submitted and what information your practice should gather.",
    icon: Contact,
    tags: ["Account", "Access"],
    bullets: [
      "Submit or confirm the new account application.",
      "Watch for account number assignment and practice setup details.",
      "Provide team member contacts for ordering, pricing, portal access, and support updates.",
      "Mark Artisan emails safe so setup instructions and price-list access are not missed.",
    ],
    links: [
      { label: "Complete Account Setup", href: "https://newaccount.artisanlabnetwork.com/", external: true },
      { label: "I already have my account number", href: `mailto:${supportContacts.onboarding.email}?subject=I%20Have%20My%20Artisan%20Account%20Number` },
    ],
  },
  {
    id: "ordering",
    eyebrow: "Module 4",
    title: "Ordering Systems",
    time: "20 min",
    why: "The first order goes smoother when the platform, lab connection, and routing are confirmed first.",
    summary:
      "Walk through DVI Rx Wizard, SpecCheck Rx, VisionWeb, and Eyefinity/VSP setup expectations.",
    icon: Laptop,
    tags: ["Orders", "Systems"],
    bullets: [
      "Confirm which ordering platform your practice uses.",
      "Send Artisan the login or contact information needed to connect the lab.",
      "Do not submit live orders until the connection is confirmed.",
    ],
    videos: ["Ordering system setup overview"],
  },
  {
    id: "vsp",
    eyebrow: "Module 5",
    title: "VSP / Eyefinity / Managed Vision Care",
    time: "15 min",
    why: "VSP and managed care routing can differ from private-pay ordering.",
    summary:
      "Review whether VSP, Eyefinity, NBN, or provider-choice rules affect your setup.",
    icon: Landmark,
    tags: ["VSP", "Eyefinity", "Managed care"],
    bullets: [
      "VSP orders may be routed through Eyefinity.",
      "Add Pacific Artisan Labs in Eyefinity when instructed for VSP routing.",
      "Some managed vision care arrangements may restrict lab usage, while some states allow more provider choice.",
      "This is operational guidance, not legal advice. If you are unsure, contact us and we can help review the setup.",
    ],
    links: [
      { label: "Request VSP Setup Help", href: `mailto:${supportContacts.onboarding.email}?subject=VSP%20Setup%20Help` },
      { label: "Ask Us to Review Managed Care Setup", href: `mailto:${supportContacts.onboarding.email}?subject=Managed%20Care%20Setup%20Review` },
    ],
    videos: ["How to Add Artisan for VSP/Eyefinity"],
  },
  {
    id: "portal",
    eyebrow: "Module 6",
    title: "Portal Training",
    time: "20 min",
    why: "The portal is where account-specific price lists, reports, downloads, resources, and policies live.",
    summary:
      "Learn how to log in, find pricing, open reports, request access, and troubleshoot portal issues.",
    icon: ShieldCheck,
    tags: ["Portal", "Pricing", "Reports"],
    bullets: [
      "Log into the customer portal from /portal.",
      "Find price lists, packages, calculator, catalogs, policies, and reports from the portal navigation.",
      "Request access for additional team members when needed.",
      "If login is not working, contact support with the practice name and user email.",
    ],
    links: portalResources,
    videos: [
      "How to log into the portal",
      "How to find your price list",
      "How to find your reports",
      "How to download resources",
      "How to use the price calculator",
    ],
  },
  {
    id: "resources",
    eyebrow: "Module 7",
    title: "Website and Provider Resources Training",
    time: "12 min",
    why: "Provider Resources is where your team returns for product education and staff training.",
    summary:
      "Learn the difference between public education pages and private account-specific portal pages.",
    icon: BookOpen,
    tags: ["Resources", "Training"],
    bullets: [
      "The onboarding page is the launch center.",
      "Provider Resources is where your team returns for product education.",
      "The portal is where account-specific pricing and reports live.",
      "Public pages are for education, positioning, and staff training; private portal pages are for account-specific information.",
    ],
    links: providerResources,
  },
  {
    id: "lens",
    eyebrow: "Module 8",
    title: "Lens Path Training",
    time: "25 min",
    why: "Your team needs training for the product path your practice already selected.",
    summary:
      "Tell us which lens path your practice selected so we can show the right training.",
    icon: Glasses,
    tags: ["Products", "Lens path"],
    bullets: [
      "Use the matching track for Artisan private-label, IOT branded, Unity, mixed, or unsure setup.",
      "Review fitting, ordering, special options, and where to find portal pricing.",
      "This is training and execution guidance, not a new product decision tool.",
    ],
    videos: [
      "Understanding Your Artisan Lens Lineup",
      "Understanding IOT Lens Designs",
      "Getting Started with Unity",
    ],
  },
  {
    id: "ar",
    eyebrow: "Module 9",
    title: "AR Treatments",
    time: "15 min",
    why: "AR choices affect patient experience, product positioning, and order accuracy.",
    summary:
      "Review Artisan AR treatments, TechShield, premium coating options, availability, and portal pricing.",
    icon: Sparkles,
    tags: ["AR", "Products"],
    bullets: [
      "Review Nytopia, Armour, Azure, Diamond Sun, and Emerald.",
      "Include TechShield where Unity or VSP-aligned training applies.",
      "Confirm AR availability by lens, lab, and program before ordering.",
      "Find AR pricing in the portal.",
    ],
    links: [
      { label: "Nytopia", href: "/artisan-ar/nytopia" },
      { label: "Armour", href: "/artisan-ar/armour" },
      { label: "Azure", href: "/artisan-ar/azure" },
      { label: "Emerald", href: "/artisan-ar/emerald" },
      { label: "AR Pricing", href: "/portal/price-list" },
    ],
    videos: ["Choosing the Right AR Treatment"],
  },
  {
    id: "sun",
    eyebrow: "Module 10",
    title: "Photochromics and Sun Options",
    time: "12 min",
    why: "Photochromic and sun options help match lens recommendations to patient environments.",
    summary:
      "Train the team on SunSync, Neochromes, patient profiles, available colors/options, and pricing.",
    icon: Sun,
    tags: ["Sun", "Photochromic"],
    bullets: [
      "Review SunSync and Neochromes options.",
      "Discuss indoor/outdoor patient profiles and when to recommend sun solutions.",
      "Find available colors, options, and pricing in the portal.",
    ],
    links: [
      { label: "Product Catalog", href: "/portal/price-list/catalog" },
      { label: "Provider Resources", href: "/provider-resources" },
    ],
    videos: ["Photochromic and Sun Options"],
  },
  {
    id: "systems",
    eyebrow: "Module 11",
    title: "Artisan Systems / Safety / Bundles",
    time: "12 min",
    why: "Bundles and systems simplify ordering and help teams follow consistent program rules.",
    summary:
      "Review Artisan Systems, lens/frame/safety bundles, safety programs, and where to find pricing/resources.",
    icon: Boxes,
    tags: ["Bundles", "Safety"],
    bullets: [
      "Use bundles when they simplify ordering for a defined program or patient need.",
      "Review lens/frame/safety bundle details before launch.",
      "Find package and bundle pricing in the portal.",
    ],
    links: [
      { label: "Review Safety and Bundle Resources", href: "/provider-resources#specialty-systems" },
      { label: "Package Pricing", href: "/portal/price-list/packages" },
    ],
    videos: ["Using Artisan Systems"],
  },
  {
    id: "pricing",
    eyebrow: "Module 12",
    title: "Pricing, MSRP, and Practice Economics",
    time: "18 min",
    why: "Account-specific pricing and MSRP resources support confident patient-facing pricing conversations.",
    summary:
      "Learn where price lists, packages, calculators, catalogs, policies, MSRP guides, and practice resources live.",
    icon: Calculator,
    tags: ["Pricing", "MSRP"],
    bullets: [
      "Account-specific pricing lives in the portal.",
      "Public education resources live on Provider Resources pages.",
      "MSRP guides and practice resources help offices with patient-facing pricing strategy.",
      "Pricing may vary by account, lab, lens path, and program.",
    ],
    links: [
      { label: "Go to My Price List", href: "/portal/price-list" },
      { label: "Open Package Pricing", href: "/portal/price-list/packages" },
      { label: "Use Calculator", href: "/portal/price-list/calculator" },
    ],
    videos: ["How to Find Pricing"],
  },
  {
    id: "reports",
    eyebrow: "Module 13",
    title: "Reports and Performance",
    time: "10 min",
    why: "Reports help your practice review purchases, orders, trends, and product mix when access is enabled.",
    summary:
      "Learn where reports live and how to request access for additional team members.",
    icon: BarChart3,
    tags: ["Reports", "Performance"],
    bullets: [
      "Reports/performance data are available in the portal if your account has access.",
      "Reports may include purchases, orders, current month, previous month, performance trends, and product mix.",
      "Use customer-facing report terms when training the team: purchases and orders.",
    ],
    links: [
      { label: "Open My Reports", href: "/portal/performance" },
      { label: "Request Report Access", href: `mailto:${supportContacts.onboarding.email}?subject=Report%20Access%20Request` },
    ],
    videos: ["How to Find Your Reports"],
  },
  {
    id: "shipping",
    eyebrow: "Module 14",
    title: "Shipping and Turnaround",
    time: "10 min",
    why: "Shipping method, program rules, and VSP handling can affect launch expectations.",
    summary:
      "Review inbound shipping, outbound shipping, air options, courier notes, and map resources.",
    icon: Truck,
    tags: ["Shipping", "Turnaround"],
    bullets: [
      "Inbound shipping for sending frames/orders to the lab is covered/free where applicable.",
      "Outbound shipping may be per box or per order depending on selected method/program.",
      "VSP orders may have different shipping handling.",
      "Ground, Next Day Air, and 2-Day Air options may be available.",
      "Ask about local courier notes for Indiana and Colorado if applicable.",
    ],
    links: [
      // TODO: Replace with an artisanslabs.com shipping-map route or asset when the final UPS map is published.
      { label: "View Shipping Map", href: "/provider-resources" },
      { label: "Ask About Shipping Setup", href: `mailto:${supportContacts.onboarding.email}?subject=Shipping%20Setup%20Question` },
    ],
  },
  {
    id: "complimentary",
    eyebrow: "Module 15",
    title: "Complimentary Lens Orders",
    time: "8 min",
    why: "Staff training lenses help the team experience products before recommending them.",
    summary:
      "Review complimentary lens guidelines for practice owner/staff education and experience.",
    icon: PackageCheck,
    tags: ["Staff training", "Guidelines"],
    bullets: [
      "Complimentary lenses are for practice owner/staff education and experience.",
      "They are not for patient orders.",
      "They are not for family/friends unless explicitly approved by the program rules.",
      "Staff experience helps the team recommend products with confidence.",
    ],
    links: [
      // TODO: Replace with the final complimentary lens program document when published on artisanslabs.com.
      { label: "Review Complimentary Lens Guidelines", href: `mailto:${supportContacts.onboarding.email}?subject=Complimentary%20Lens%20Guidelines` },
    ],
    videos: ["How to Use Staff Training Lens Orders"],
  },
  {
    id: "first-order",
    eyebrow: "Module 16",
    title: "First Order Launch Checklist",
    time: "10 min",
    why: "This gives the team a clear finish line before the first live order.",
    summary:
      "Confirm lab, account, ordering, VSP, lens path, pricing, reports, resources, AR, shipping, and support readiness.",
    icon: ClipboardCheck,
    tags: ["Launch", "Checklist"],
    bullets: [
      "I know which Artisan lab I am working with.",
      "My account number has been assigned or requested.",
      "My practice/team contacts are submitted.",
      "My ordering platform is connected.",
      "My VSP/Eyefinity setup is complete or not needed.",
      "I know whether I am using Artisan private-label, IOT branded, Unity, or mixed lens solutions.",
      "I know where to find my price list.",
      "I know where to find my reports.",
      "I know where to find Provider Resources.",
      "I understand AR treatment options.",
      "I understand shipping basics.",
      "I know who to contact for help.",
      "I am ready to submit my first order.",
    ],
    links: [
      { label: "Submit Your First Order", href: "#ordering" },
      { label: "Schedule Final Launch Help", href: `mailto:${supportContacts.onboarding.email}?subject=Final%20Launch%20Help` },
    ],
  },
];

export const firstNeedModuleMap: Record<string, string[]> = {
  account: ["account", "lab", "portal"],
  orders: ["ordering", "lab", "first-order"],
  vsp: ["vsp", "ordering", "lab"],
  pricing: ["pricing", "portal", "resources"],
  reports: ["reports", "portal"],
  products: ["lens", "ar", "sun"],
  ar: ["ar", "lens", "pricing"],
  optician: ["welcome", "resources", "lens", "ar", "portal"],
  "first-order": ["first-order", "ordering", "lab", "pricing"],
};

export const finalChecklist = modules.find((module) => module.id === "first-order")?.bullets ?? [];

export const statusIcons = {
  "Not started": FileText,
  "In progress": BadgeCheck,
  Complete: CheckCircle2,
} satisfies Record<ModuleStatus, LucideIcon>;
