export type AdvocacyTone = "professional" | "personal" | "legislative" | "patient-centered";

export type LegislatorLevel = "federal" | "state" | "local";

export type Legislator = {
  id: string;
  name: string;
  office: string;
  party?: string;
  photoUrl?: string;
  websiteUrl?: string;
  phone?: string;
  contactFormUrl?: string;
  level: LegislatorLevel;
};

export type CivicLookupRequest = {
  address: string;
  city: string;
  state: string;
  zip: string;
};

export type LetterProfile = {
  firstName: string;
  lastName: string;
  practiceName: string;
  city: string;
  state: string;
  yearsInPractice: string;
  patientsServedMonthly: string;
  independentPractice: "yes" | "no";
  usesIndependentLaboratory: "yes" | "no";
  tone: AdvocacyTone;
};

export type BillStatus = "Introduced" | "In Committee" | "Passed Chamber" | "Enacted" | "Monitoring";

export type AdvocacyBill = {
  billNumber: string;
  jurisdiction: "Federal" | string;
  status: BillStatus;
  lastAction: string;
  summary: string;
  officialLink: string;
};

export type StateProtection = {
  code: string;
  name: string;
  region: "West" | "Midwest" | "South" | "Northeast";
  labChoiceProtection: boolean;
  nonCoveredServicesProtection: boolean;
  antiSteeringProtection: boolean;
  anyWillingProviderProtection: boolean;
  summary: string;
  relevantStatutes: string[];
  currentBills: string[];
  advocacyOpportunities: string[];
};
