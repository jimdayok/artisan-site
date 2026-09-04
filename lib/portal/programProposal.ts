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

export type ProgramProposalDraft = {
  proposalTitle: string;
  customerName: string;
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

  return {
    proposalTitle: "Custom Lab Partnership Proposal",
    customerName: "",
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
