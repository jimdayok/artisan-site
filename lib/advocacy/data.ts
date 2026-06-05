import type { AdvocacyBill, AdvocacyStory, StateProtection } from "./types";

export const legislationTracker: AdvocacyBill[] = [
  {
    billNumber: "Federal VBM Reform Framework",
    jurisdiction: "Federal",
    status: "Monitoring",
    lastAction: "Framework prepared for stakeholder education and bill tracking.",
    summary: "Supports transparency, anti-steering protections, and doctor freedom to choose laboratories that best serve patients.",
    officialLink: "https://www.congress.gov/",
  },
  {
    billNumber: "State Lab Choice Model Act",
    jurisdiction: "State Model",
    status: "Monitoring",
    lastAction: "Reusable model language available for state association and policymaker discussions.",
    summary: "Protects independent practice decision-making, laboratory competition, and patient access to non-plan-directed options.",
    officialLink: "https://www.ncsl.org/",
  },
];

const stateNames: Array<[string, string, StateProtection["region"]]> = [
  ["AL", "Alabama", "South"], ["AK", "Alaska", "West"], ["AZ", "Arizona", "West"], ["AR", "Arkansas", "South"], ["CA", "California", "West"],
  ["CO", "Colorado", "West"], ["CT", "Connecticut", "Northeast"], ["DE", "Delaware", "South"], ["FL", "Florida", "South"], ["GA", "Georgia", "South"],
  ["HI", "Hawaii", "West"], ["ID", "Idaho", "West"], ["IL", "Illinois", "Midwest"], ["IN", "Indiana", "Midwest"], ["IA", "Iowa", "Midwest"],
  ["KS", "Kansas", "Midwest"], ["KY", "Kentucky", "South"], ["LA", "Louisiana", "South"], ["ME", "Maine", "Northeast"], ["MD", "Maryland", "South"],
  ["MA", "Massachusetts", "Northeast"], ["MI", "Michigan", "Midwest"], ["MN", "Minnesota", "Midwest"], ["MS", "Mississippi", "South"], ["MO", "Missouri", "Midwest"],
  ["MT", "Montana", "West"], ["NE", "Nebraska", "Midwest"], ["NV", "Nevada", "West"], ["NH", "New Hampshire", "Northeast"], ["NJ", "New Jersey", "Northeast"],
  ["NM", "New Mexico", "West"], ["NY", "New York", "Northeast"], ["NC", "North Carolina", "South"], ["ND", "North Dakota", "Midwest"], ["OH", "Ohio", "Midwest"],
  ["OK", "Oklahoma", "South"], ["OR", "Oregon", "West"], ["PA", "Pennsylvania", "Northeast"], ["RI", "Rhode Island", "Northeast"], ["SC", "South Carolina", "South"],
  ["SD", "South Dakota", "Midwest"], ["TN", "Tennessee", "South"], ["TX", "Texas", "South"], ["UT", "Utah", "West"], ["VT", "Vermont", "Northeast"],
  ["VA", "Virginia", "South"], ["WA", "Washington", "West"], ["WV", "West Virginia", "South"], ["WI", "Wisconsin", "Midwest"], ["WY", "Wyoming", "West"],
];

const protectedLabChoice = new Set(["AL", "CT", "FL", "GA", "IL", "KS", "ME", "MS", "NJ", "OR", "TX"]);
const protectedNonCovered = new Set(["AR", "GA", "KY", "LA", "MO", "OK", "TX", "VA"]);
const protectedSteering = new Set(["AR", "KY", "LA", "MO", "OK", "TX"]);
const protectedAnyWilling = new Set(["AR", "KY", "LA", "MS", "MO", "OK", "TX", "WV"]);

export const stateProtections: StateProtection[] = stateNames.map(([code, name, region]) => ({
  code,
  name,
  region,
  labChoiceProtection: protectedLabChoice.has(code),
  nonCoveredServicesProtection: protectedNonCovered.has(code),
  antiSteeringProtection: protectedSteering.has(code),
  anyWillingProviderProtection: protectedAnyWilling.has(code),
  summary: protectedLabChoice.has(code)
    ? `${name} has tracked laboratory choice protection relevant to independent doctor and patient access.`
    : `${name} is monitored for opportunities to advance laboratory choice and VBM reform.` ,
  relevantStatutes: protectedLabChoice.has(code) || protectedNonCovered.has(code) ? ["State insurance and vision plan statutes under review"] : ["No tracked statute loaded yet"],
  currentBills: code === "TX" ? ["Monitor state vision plan reform proposals"] : ["No active bill loaded"],
  advocacyOpportunities: ["Educate legislators", "Recruit doctor stories", "Support state association outreach"],
}));

export const advocacyStories: AdvocacyStory[] = [
  {
    practiceName: "Independent Optometric Practice",
    state: "ND",
    story: "Laboratory choice helps our practice solve patient needs with the products, service, and turnaround time our community depends on.",
  },
  {
    practiceName: "Community Eye Care Clinic",
    state: "TX",
    story: "When doctors can choose the right lab, patients benefit from better communication, better options, and better accountability.",
  },
  {
    practiceName: "Family Vision Center",
    state: "MO",
    story: "Independent labs are partners in patient care. Preserving that relationship keeps competition and service alive.",
  },
];

export const advocacyMetrics = {
  doctorsParticipating: 184,
  lettersGenerated: 437,
  statesRepresented: 29,
  legislatorsContacted: 612,
};
