export const BASE_PROGRAM_FORM_URL = "https://form.typeform.com/to/WCU5ReWQ";

export const COMPLIANCE_NOTE =
  "Programs are by invitation only. Terms, conditions, exclusions, and eligibility requirements apply. Only one Artisan promotional program may be used at a time unless approved in writing.";

export type ProgramPageData = {
  slug: string;
  route: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta?: string;
  programCode: string;
  offerValue: string;
  logo?: {
    src: string;
    alt: string;
  };
  heroImage?: string;
  opportunityTitle: string;
  opportunityBody: string;
  keyPoints: string[];
  offerTitle: string;
  offerBody: string;
  offerBullets: string[];
  tiers?: {
    name: string;
    range: string;
    payout: string;
    secondaryPayout?: string;
    featured?: boolean;
  }[];
  arLogos?: {
    name: string;
    src: string;
    slug: string;
    summary: string;
    bestFor: string;
  }[];
  detailsTitle: string;
  details: string[];
  restrictions: string[];
  extraSection?: {
    eyebrow: string;
    title: string;
    body: string;
  };
  faqDuration: string;
};

export function programHref(programCode: string) {
  return `${BASE_PROGRAM_FORM_URL}#program_code=${programCode}`;
}

export const programs: ProgramPageData[] = [
  {
    slug: "lab-partner",
    route: "/programs/lab-partner-aln26",
    eyebrow: "Artisan Lab Network",
    headline: "A Better Lab for Independent Practices",
    subheadline:
      "If you are looking for a new optical lab, we can help you make the move with better options, real support, and programs designed to make the transition easier.",
    primaryCta: "Open an Account",
    secondaryCta: "Talk to an Account Manager",
    programCode: "LABPARTNER",
    offerValue: "Better Lab Partnership",
    heroImage: "/images/factory-machine-room-2023-1.jpg",
    opportunityTitle: "A better path when your current lab feels too narrow.",
    opportunityBody:
      "Independent practices deserve a lab relationship with more choice, clearer communication, and support that helps the team move forward with confidence.",
    keyPoints: [
      "More product choice",
      "Independent lab partnership",
      "Fast, responsive support",
      "Programs designed to reduce friction when switching labs",
      "A better path for practices tired of feeling boxed in",
    ],
    offerTitle: "Partnership built around the practice.",
    offerBody:
      "Artisan helps invited practices explore a better lab model with real support from people who understand independent eye care.",
    offerBullets: [
      "Product options across trusted lens brands",
      "Account support for a smoother transition",
      "Programs that help reduce switching friction",
    ],
    detailsTitle: "Program Details",
    details: [
      "Program code LABPARTNER",
      "Designed for independent practices evaluating a new lab relationship",
      "Account setup, onboarding, and product guidance are available through the Artisan team",
    ],
    restrictions: [
      "Eligibility is reviewed by Artisan Lab Network.",
      "Program access may vary by account, location, and lab relationship.",
    ],
    faqDuration: "The timing depends on the account path and transition needs.",
  },
  {
    slug: "simple-switch",
    route: "/programs/simple-switch-ar26",
    eyebrow: "Simple Switch Program",
    headline: "Try a Better Lab Without the Risk",
    subheadline:
      "Get an additional discount on top of real pricing while you experience the Artisan difference.",
    primaryCta: "Sign Up for Simple Switch",
    programCode: "ARSWITCH26",
    offerValue: "90 Days",
    opportunityTitle: "A cleaner way to test a new lab relationship.",
    opportunityBody:
      "Simple Switch gives your practice a true chance to try Artisan while reducing costs and experiencing our service, product choice, and support.",
    keyPoints: [
      "Additional discount for 90 days after signup",
      "Discount appears directly on the invoice",
      "Instant savings",
      "No waiting for a rebate check",
      "No confusing math",
    ],
    offerTitle: "Additional savings without inflated pricing.",
    offerBody:
      "The discount appears directly on your invoice. No waiting for a rebate check. No confusing math. Just instant savings while your practice tests a better lab relationship.",
    offerBullets: [
      "Additional discount for 90 days after signup",
      "Direct invoice savings",
      "Simple math your team can verify",
    ],
    detailsTitle: "Program Details",
    details: [
      "Program code ARSWITCH26",
      "Additional discount applies for 90 days after signup",
      "Discount appears directly on qualifying invoices",
    ],
    restrictions: [
      "Available to invited practices only.",
      "Discount eligibility and qualifying products may vary by account.",
    ],
    faqDuration: "Simple Switch lasts 90 days after signup for eligible accounts.",
  },
  {
    slug: "sequel-rebate",
    route: "/programs/sequel-arSQL26",
    eyebrow: "Sequel Rebate Program",
    headline: "Use More. Earn More.",
    subheadline:
      "Earn up to $20 back per qualifying Sequel progressive lens purchase.",
    primaryCta: "Enroll in Sequel Rebate",
    programCode: "ARSQL26",
    offerValue: "Up to $20",
    logo: {
      src: "/logos/Sequel_Brandmark_Horizontal_RGB_Charcoal.png",
      alt: "Sequel",
    },
    opportunityTitle: "Your full lab usage can move you higher.",
    opportunityBody:
      "Your monthly purchase volume determines your payout. The program is based on total lab usage, not just Sequel purchases.",
    keyPoints: [
      "Earn up to $20 back per qualifying Sequel PAL pair",
      "Monthly purchase volume determines payout",
      "Total lab usage can help increase tiers",
      "Single vision, bifocals, progressives, and major brands can support volume",
    ],
    offerTitle: "Reward stronger monthly usage.",
    offerBody:
      "Send single vision, bifocals, progressives, Hoya, Varilux, Shamir, Neurolens, VSP, NBN, or Artisan products to move higher in the rebate tiers.",
    offerBullets: [
      "Bronze: 1 to 20 total monthly Rxs, $5 per Sequel PAL pair",
      "Gold: 21 to 60 total monthly Rxs, $10 per Sequel PAL pair",
      "Platinum: 61 to 100 total monthly Rxs, $17 per Sequel PAL pair",
      "Diamond: 100 or more total monthly Rxs, $20 per Sequel PAL pair",
    ],
    tiers: [
      {
        name: "Bronze",
        range: "1 to 20 monthly Rxs",
        payout: "$5 per pair",
      },
      {
        name: "Gold",
        range: "21 to 60 monthly Rxs",
        payout: "$10 per pair",
      },
      {
        name: "Platinum",
        range: "61 to 100 monthly Rxs",
        payout: "$17 per pair",
      },
      {
        name: "Diamond",
        range: "100 or more monthly Rxs",
        payout: "$20 per pair",
        featured: true,
      },
    ],
    detailsTitle: "Program Details",
    details: [
      "Program code ARSQL26",
      "Bronze: 1 to 20 total monthly Rxs, $5 per Sequel PAL pair",
      "Gold: 21 to 60 total monthly Rxs, $10 per Sequel PAL pair",
      "Platinum: 61 to 100 total monthly Rxs, $17 per Sequel PAL pair",
      "Diamond: 100 or more total monthly Rxs, $20 per Sequel PAL pair",
    ],
    restrictions: [
      "Applies to qualifying Sequel progressive lens purchases.",
      "Monthly tiers are determined by eligible total lab usage.",
    ],
    faqDuration: "The rebate is evaluated by monthly qualifying volume while the program is active.",
  },
  {
    slug: "unity-rebate",
    route: "/programs/unity-arUTY26",
    eyebrow: "Unity Rebate Program",
    headline: "Turn Unity and TechShield Orders Into Real Cash Back",
    subheadline:
      "Earn up to $15 back per qualifying pair through the Artisan Unity rebate opportunity.",
    primaryCta: "Enroll in Unity Rebate",
    programCode: "ARUTY26",
    offerValue: "Up to $15",
    logo: {
      src: "/logos/unity-rewards-logo.png",
      alt: "Unity Rewards",
    },
    opportunityTitle: "Support your Unity strategy with real rebate potential.",
    opportunityBody:
      "The Unity rebate opportunity is built to reward eligible Unity and TechShield usage as your total monthly lab volume grows.",
    keyPoints: [
      "Earn up to $15 back per qualifying pair",
      "Monthly total Rxs determine tier",
      "TechShield and other PAL combinations may qualify",
      "Designed for practices building a stronger Unity strategy",
    ],
    offerTitle: "More opportunity as volume grows.",
    offerBody:
      "Qualifying Unity and TechShield orders can generate cash back, with higher monthly lab usage unlocking stronger per-pair values.",
    offerBullets: [
      "Bronze: 1 to 20 monthly Rxs, Unity and TechShield $5 per pair",
      "Gold: 21 to 60 monthly Rxs, Unity and TechShield $7 per pair; TechShield and other PAL $2 per pair",
      "Platinum: 61 to 100 monthly Rxs, Unity and TechShield $10 per pair; TechShield and other PAL $5 per pair",
      "Diamond: 100 or more monthly Rxs, Unity and TechShield $15 per pair; TechShield and other PAL $5 per pair",
    ],
    tiers: [
      {
        name: "Bronze",
        range: "1 to 20 monthly Rxs",
        payout: "Unity + TechShield $5 per pair",
      },
      {
        name: "Gold",
        range: "21 to 60 monthly Rxs",
        payout: "Unity + TechShield $7 per pair",
        secondaryPayout: "TechShield + Other PAL $2 per pair",
      },
      {
        name: "Platinum",
        range: "61 to 100 monthly Rxs",
        payout: "Unity + TechShield $10 per pair",
        secondaryPayout: "TechShield + Other PAL $5 per pair",
      },
      {
        name: "Diamond",
        range: "100 or more monthly Rxs",
        payout: "Unity + TechShield $15 per pair",
        secondaryPayout: "TechShield + Other PAL $5 per pair",
        featured: true,
      },
    ],
    detailsTitle: "Program Details",
    details: [
      "Program code ARUTY26",
      "Bronze: 1 to 20 total monthly Rxs",
      "Gold: 21 to 60 total monthly Rxs",
      "Platinum: 61 to 100 total monthly Rxs",
      "Diamond: 100 or more total monthly Rxs",
    ],
    restrictions: [
      "Applies to eligible Unity, TechShield, and qualifying PAL combinations.",
      "Eligibility may depend on account participation and qualifying order mix.",
    ],
    extraSection: {
      eyebrow: "Stack Your Opportunity",
      title: "Support your Unity strategy from more than one angle.",
      body: "This program can complement VSP Unity Rewards and PECAA Max opportunities when applicable, helping practices maximize profit while using quality products patients can trust.",
    },
    faqDuration: "The rebate is evaluated by monthly qualifying volume while the program is active.",
  },
  {
    slug: "neurolens-free-ar",
    route: "/programs/neurolens-arNL26",
    eyebrow: "Neurolens Customer Promotion",
    headline: "Try Artisan AR on Non-Neurolens Orders at No Cost",
    subheadline:
      "For invited Neurolens customers, Artisan is offering free AR on eligible non-Neurolens orders for 60 days.",
    primaryCta: "Enroll in Neurolens Free AR",
    programCode: "ARNL26",
    offerValue: "Free AR for 60 Days",
    logo: {
      src: "/logos/Neurolens_RGB_Primary-Brandmark_Color.png",
      alt: "Neurolens",
    },
    heroImage: "/images/neurolens-free-ar-hero.jpg",
    opportunityTitle: "Expand your Artisan AR experience beyond Neurolens.",
    opportunityBody:
      "Invited Neurolens customers can try Artisan AR treatments on eligible non-Neurolens orders with no AR cost during the promotional period.",
    keyPoints: [
      "Free Artisan AR on eligible non-Neurolens orders for 60 days",
      "Any Artisan AR",
      "Any eligible non-Neurolens product",
      "No AR cost during the promotional period",
    ],
    offerTitle: "Free Artisan AR on eligible orders.",
    offerBody:
      "Free Artisan AR on eligible non-Neurolens orders for 60 days.",
    offerBullets: [
      "Program code ARNL26",
      "Free Artisan AR on eligible non-Neurolens orders for 60 days",
      "Any Artisan AR",
      "Any eligible non-Neurolens product",
    ],
    arLogos: [
      {
        name: "Artisan Nytopia",
        src: "/ar/nytopia.png",
        slug: "nytopia",
        summary: "Flagship ultra premium AR with targeted light wavelength manipulation for nighttime driving.",
        bestFor: "Nighttime optics",
      },
      {
        name: "Artisan Armour",
        src: "/ar/armour.png",
        slug: "armour",
        summary: "Our strongest ultra premium AR treatment, built for durability and over 25,000 cleanings.",
        bestFor: "Maximum durability",
      },
      {
        name: "Artisan Azure",
        src: "/ar/azure.png",
        slug: "azure",
        summary: "Blue light reflection and absorption with a refined front blue hue and minimal backside reflection.",
        bestFor: "Blue light focus",
      },
      {
        name: "Artisan Emerald",
        src: "/ar/emerald.png",
        slug: "emerald",
        summary: "Premium everyday AR with best-in-class anti-reflectance, great cosmetics, and backside UV coating.",
        bestFor: "Everyday premium AR",
      },
    ],
    detailsTitle: "Requirements",
    details: [
      "Must be a Neurolens customer",
      "Must order products with Artisan AR treatments",
      "Must be assigned to standard price list",
      "No additional rebates or promotional programs may be combined",
    ],
    restrictions: [
      "Applies only to eligible non-Neurolens orders.",
      "No AR cost applies only during the promotional period.",
      "Only one Artisan promotional program may be used at a time unless approved in writing.",
    ],
    faqDuration: "The promotion lasts 60 days for eligible invited Neurolens customers.",
  },
];

export function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export function getProgramByRouteSlug(routeSlug: string) {
  return programs.find((program) => program.route === `/programs/${routeSlug}`);
}
