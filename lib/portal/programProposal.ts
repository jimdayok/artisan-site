export const PROGRAM_STUDIO_PRICE_LIST_CODES = [
  "P6",
  "A6",
  "B5",
  "G6",
  "E5",
  "E6",
] as const;

export const PROGRAM_CATALOG = [
  {
    code: "simple-switch",
    name: "Simple Switch",
    summary:
      "A guided conversion plan with hands-on setup, pricing alignment, ordering support, and a clear path for moving work to Artisan.",
  },
  {
    code: "free-ar",
    name: "Free AR",
    summary:
      "The designated AR treatment is included on eligible program orders at no additional charge, subject to the product and qualification terms in this proposal.",
  },
  {
    code: "sequel",
    name: "Sequel Program",
    summary:
      "A focused pathway for building Sequel adoption with portfolio guidance, team education, and program-specific support.",
  },
  {
    code: "pmp",
    name: "PMP Program",
    summary:
      "Program-specific value and support for eligible private-pay work, governed by the current qualification and payment terms shown here.",
  },
  {
    code: "unity-rewards",
    name: "Unity Rewards Program",
    summary:
      "Rewards support for qualifying Unity work, paired with product guidance and the applicable current program rules.",
  },
] as const;

export type ProgramCode = (typeof PROGRAM_CATALOG)[number]["code"];
export type CommitmentBasis = "lens-pairs" | "sales";
export type CommitmentPeriod = "monthly" | "quarterly" | "annual";
export type ProposalTemplateCode =
  | "full-transition"
  | "product-conversion"
  | "value-service"
  | "program-renewal";
export type StoryModuleCode =
  | "independent-alignment"
  | "product-choice"
  | "people-accountability"
  | "network-strength"
  | "freedom-of-choice"
  | "implementation-support";
export type SpecialPricingKind =
  | "fixed-price"
  | "dollar-deduction"
  | "percent-discount";

export type SpecialPricingRule = {
  id: string;
  productName: string;
  kind: SpecialPricingKind;
  amount: number;
  priceListCodes: string[];
  notes: string;
};

export type ProductCrosswalkRow = {
  id: string;
  category: string;
  currentProduct: string;
  artisanProduct: string;
  vspProduct: string;
  rationale: string;
};

export const STORY_MODULES = [
  {
    code: "independent-alignment",
    title: "Independent alignment",
    shortTitle: "Independent by design",
    body:
      "Artisan is built to support independent eye care with a lab relationship centered on the practice, its patients, and its long-term position - not a competing retail agenda.",
  },
  {
    code: "product-choice",
    title: "Broader product choice",
    shortTitle: "Choice without the box",
    body:
      "A broad portfolio and agile vendor relationships give the practice room to match lens design, material, and treatment to the patient instead of forcing every conversation into one product path.",
  },
  {
    code: "people-accountability",
    title: "People and accountability",
    shortTitle: "People who own the answer",
    body:
      "Experienced lab, service, and sales teams stay close to the work, communicate directly, and help resolve exceptions without making the practice chase an answer.",
  },
  {
    code: "network-strength",
    title: "Connected network strength",
    shortTitle: "Local character. Network reach.",
    body:
      "Pacific, Peak, and Pike combine regional lab relationships with shared product access, operational knowledge, and the leverage of a connected independent network.",
  },
  {
    code: "freedom-of-choice",
    title: "Freedom-of-choice transition",
    shortTitle: "A deliberate path to more control",
    body:
      "Artisan helps the practice review eligible work, separate managed-care requirements from independent purchasing decisions, and build a practical path toward greater lab choice where plan rules and authorizations permit.",
  },
  {
    code: "implementation-support",
    title: "Hands-on implementation",
    shortTitle: "The transition is managed",
    body:
      "Product mapping, account configuration, ordering guidance, staff education, first-order review, and service follow-through are coordinated as one launch plan.",
  },
] as const satisfies ReadonlyArray<{
  code: StoryModuleCode;
  title: string;
  shortTitle: string;
  body: string;
}>;

export const PROPOSAL_TEMPLATES = [
  {
    code: "full-transition",
    name: "Full lab transition",
    description: "The complete strategic story for moving a meaningful share of work.",
    executiveSummary:
      "This proposal lays out a practical path to a stronger lab relationship: clearer product direction, more control over eligible work, accountable service, and commercial terms built for the practice.",
    customerPriorities:
      "Improve turnaround consistency, simplify product decisions, strengthen staff confidence, and create a lab relationship with clearer ownership and follow-through.",
    transitionNotes:
      "Begin with product and ordering validation, move an agreed first wave of private-pay work, confirm VSP routing separately, review early results, and expand only after the practice is confident in the process.",
    nextStep:
      "Confirm the product crosswalk and commercial terms, schedule the implementation meeting, and agree on the first-order date.",
    storyModules: STORY_MODULES.map((module) => module.code),
  },
  {
    code: "product-conversion",
    name: "Product conversion",
    description: "A product-led recommendation with private-pay and VSP mapping.",
    executiveSummary:
      "This recommendation gives the team a clear product path for the patient conversations it handles every day, with separate recommendations for private-pay and VSP work.",
    customerPriorities:
      "Create an easy-to-teach lens ladder, protect premium options, reduce ordering uncertainty, and give staff a clear VSP product path.",
    transitionNotes:
      "Finalize the product crosswalk, validate availability and ordering codes, train the team by patient need, and review the first orders together.",
    nextStep:
      "Approve the product crosswalk and select a date for staff product and ordering training.",
    storyModules: [
      "product-choice",
      "people-accountability",
      "implementation-support",
      "freedom-of-choice",
    ] satisfies StoryModuleCode[],
  },
  {
    code: "value-service",
    name: "Value and service case",
    description: "Leads with quantified economics, turnaround, and accountability.",
    executiveSummary:
      "This proposal combines a measurable value case with a service model designed to reduce friction for the practice and create a more predictable patient experience.",
    customerPriorities:
      "Improve service performance, protect practice economics, reduce staff follow-up, and establish clear escalation and accountability.",
    transitionNotes:
      "Validate the analysis inputs, establish a baseline, launch a controlled first phase, and review savings, turnaround, remakes, and service outcomes after the initial period.",
    nextStep:
      "Confirm the analysis assumptions and agree on the scorecard and launch period.",
    storyModules: [
      "people-accountability",
      "network-strength",
      "implementation-support",
      "independent-alignment",
    ] satisfies StoryModuleCode[],
  },
  {
    code: "program-renewal",
    name: "Program renewal or expansion",
    description: "A concise update for an existing Artisan relationship.",
    executiveSummary:
      "This proposal refreshes the practice's Artisan program, documents the selected benefits and pricing, and creates a clear plan for the next stage of the relationship.",
    customerPriorities:
      "Keep terms clear, align the team on current programs, identify new product opportunities, and confirm the service plan for the coming period.",
    transitionNotes:
      "Review current utilization, confirm updated products and pricing, train on any additions, and schedule the first performance review.",
    nextStep:
      "Confirm the updated program selections and schedule the account review.",
    storyModules: [
      "people-accountability",
      "product-choice",
      "network-strength",
    ] satisfies StoryModuleCode[],
  },
] as const;

export type ProgramProposalDraft = {
  templateCode: ProposalTemplateCode;
  proposalTitle: string;
  customerName: string;
  customerContactName: string;
  locationName: string;
  accountNumber: string;
  customerAddress: string;
  lab: string;
  preparedBy: string;
  preparedByEmail: string;
  proposalDate: string;
  validThrough: string;
  isAcquiosMember: boolean;
  selectedPrograms: ProgramCode[];
  programNotes: Partial<Record<ProgramCode, string>>;
  executiveSummary: string;
  customerPriorities: string;
  selectedStoryModules: StoryModuleCode[];
  productCrosswalk: ProductCrosswalkRow[];
  includeCostSavings: boolean;
  costSavingsPercent: number;
  costSavingsNotes: string;
  includeServiceImprovement: boolean;
  currentTurnDays: number;
  artisanTurnDays: number;
  serviceAnalysisNotes: string;
  transitionNotes: string;
  nextStep: string;
  emailPersonalNote: string;
  selectedPriceLists: string[];
  specialPricing: SpecialPricingRule[];
  multipleRemakes: boolean;
  remakeLimit: number;
  secondPairDays: number;
  warrantyNotes: string;
  commitmentBasis: CommitmentBasis;
  commitmentPeriod: CommitmentPeriod;
  commitmentValue: number;
  regulatoryAcknowledged: boolean;
  additionalTerms: string;
};

export type ProgramStudioPriceListOption = {
  code: string;
  label: string;
  package: boolean;
};

export type ProgramStudioCustomer = {
  id: string;
  name: string;
  accountNumber: string;
  location: string;
  address: string;
  lab: string;
  salesRep: string;
  priceListCodes: string[];
  isAcquiosMember: boolean;
};

export const GOVERNMENT_PROGRAM_EXCLUSION =
  "Federal- and state-reimbursed program volume is prohibited from inclusion in the commitment calculation.";

export const DEFAULT_ADDITIONAL_TERMS =
  "Pricing and program benefits apply only to the customer and location identified in this proposal. Eligibility, product availability, and manufacturer requirements remain subject to current Artisan Lab Network program rules. Any term not expressly modified here remains governed by the applicable Artisan policies and the attached price lists.";

export function proposalPriceListTitle(
  code: string,
  isAcquiosMember: boolean,
  fallback: string
) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "A6") {
    return isAcquiosMember ? "Acquios A6 Pricing" : "PMP A6";
  }
  return fallback;
}
export function formatSpecialPricingRule(rule: SpecialPricingRule) {
  const amount = Number.isFinite(rule.amount) ? Math.max(0, rule.amount) : 0;
  if (rule.kind === "fixed-price") return `$${amount.toFixed(2)} special price`;
  if (rule.kind === "dollar-deduction") {
    return `$${amount.toFixed(2)} deduction from attached pricing`;
  }
  return `${amount.toFixed(2).replace(/\.00$/, "")}% discount from attached pricing`;
}

export function calculateServiceImprovement(
  currentTurnDays: number,
  artisanTurnDays: number
) {
  if (currentTurnDays <= 0 || artisanTurnDays <= 0 || currentTurnDays <= artisanTurnDays) {
    return null;
  }
  return {
    relativeImprovementPercent: Math.round(
      ((currentTurnDays - artisanTurnDays) / artisanTurnDays) * 100
    ),
    turnaroundReductionPercent: Math.round(
      ((currentTurnDays - artisanTurnDays) / currentTurnDays) * 100
    ),
    daysSaved: Number((currentTurnDays - artisanTurnDays).toFixed(1)),
  };
}

export function proposalEmailSubject(draft: ProgramProposalDraft) {
  return `Artisan lab partnership proposal for ${draft.customerName || "your practice"}`;
}

export function proposalEmailBody(draft: ProgramProposalDraft) {
  const greeting = draft.customerContactName.trim()
    ? `Hi ${draft.customerContactName.trim()},`
    : "Hello,";
  const vspRecommendationCount = draft.productCrosswalk.filter((row) =>
    row.vspProduct.trim()
  ).length;
  const highlights = [
    draft.productCrosswalk.length
      ? `a ${draft.productCrosswalk.length}-line product crosswalk${
          vspRecommendationCount ? ", including VSP recommendations" : ""
        }`
      : "a tailored product and program recommendation",
    draft.includeCostSavings && draft.costSavingsPercent > 0
      ? `an identified cost-savings opportunity of ${draft.costSavingsPercent}% based on the reviewed analysis`
      : "clear pricing and program terms",
    draft.includeServiceImprovement && calculateServiceImprovement(draft.currentTurnDays, draft.artisanTurnDays)
      ? `a turnaround comparison using the current ${draft.currentTurnDays}-day experience and the stated ${draft.artisanTurnDays}-day Artisan average`
      : "an implementation path with accountable support",
  ];

  return [
    greeting,
    "",
    draft.emailPersonalNote.trim() ||
      `Thank you for the opportunity to build a lab program around ${draft.customerName || "your practice"}.`,
    "",
    `Attached is the proposal we discussed. It includes ${highlights[0]}, ${highlights[1]}, and ${highlights[2]}.`,
    "",
    `Recommended next step: ${draft.nextStep}`,
    "",
    "I would be glad to walk through the recommendation with your team and make any final adjustments before implementation.",
    "",
    "Best,",
    draft.preparedBy || "Artisan Lab Network",
    draft.preparedByEmail,
  ]
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join("\n");
}

export function createProgramProposalDraft({
  today,
  preparedBy,
  preparedByEmail,
  defaultPriceListCode,
}: {
  today: string;
  preparedBy: string;
  preparedByEmail: string;
  defaultPriceListCode: string;
}): ProgramProposalDraft {
  const parsed = new Date(`${today}T12:00:00`);
  const validThrough = Number.isNaN(parsed.getTime())
    ? today
    : new Date(parsed.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);

  const template = PROPOSAL_TEMPLATES[0];
  return {
    templateCode: template.code,
    proposalTitle: "Custom Lab Partnership Proposal",
    customerName: "",
    customerContactName: "",
    locationName: "",
    accountNumber: "",
    customerAddress: "",
    lab: "Pacific Artisan Labs",
    preparedBy,
    preparedByEmail,
    proposalDate: today,
    validThrough,
    isAcquiosMember: false,
    selectedPrograms: [],
    programNotes: {},
    executiveSummary: template.executiveSummary,
    customerPriorities: template.customerPriorities,
    selectedStoryModules: [...template.storyModules],
    productCrosswalk: [],
    includeCostSavings: false,
    costSavingsPercent: 0,
    costSavingsNotes: "Based on the products, materials, treatments, and volumes reviewed with the practice.",
    includeServiceImprovement: false,
    currentTurnDays: 0,
    artisanTurnDays: 0,
    serviceAnalysisNotes: "Turnaround comparison uses business days and like-for-like eligible work.",
    transitionNotes: template.transitionNotes,
    nextStep: template.nextStep,
    emailPersonalNote: "",
    selectedPriceLists: defaultPriceListCode ? [defaultPriceListCode] : [],
    specialPricing: [],
    multipleRemakes: false,
    remakeLimit: 2,
    secondPairDays: 30,
    warrantyNotes: "",
    commitmentBasis: "lens-pairs",
    commitmentPeriod: "monthly",
    commitmentValue: 0,
    regulatoryAcknowledged: false,
    additionalTerms: DEFAULT_ADDITIONAL_TERMS,
  };
}

export function proposalReadiness(draft: ProgramProposalDraft) {
  const missing: string[] = [];
  if (!draft.customerName.trim()) missing.push("customer name");
  if (!draft.locationName.trim()) missing.push("customer location");
  if (!draft.lab.trim()) missing.push("servicing lab");
  if (!draft.preparedBy.trim()) missing.push("proposal owner");
  if (!draft.selectedPrograms.length) missing.push("at least one program");
  if (!draft.selectedPriceLists.length) missing.push("at least one price list");
  if (!draft.regulatoryAcknowledged) {
    missing.push("government-program volume acknowledgement");
  }
  return { ready: missing.length === 0, missing };
}
