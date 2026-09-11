import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PACKAGE_PRICING_EXPLANATION,
  PROGRAM_REBATE_SCHEDULES,
  PROGRAM_STUDIO_PRICE_LIST_CODES,
  PROGRAM_TIER_GUIDE,
  GOVERNMENT_PROGRAM_EXCLUSION,
  PROPOSAL_TEMPLATES,
  STORY_MODULES,
  calculateServiceImprovement,
  createProgramProposalDraft,
  formatSavingsAmount,
  formatSpecialPricingRule,
  proposalEmailBody,
  proposalEmailSubject,
  proposalPriceListTitle,
  proposalReadiness,
} from "../lib/portal/programProposal.ts";

function read(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("Program Studio defaults proposal pricing to the supplied P6 baseline", () => {
  const draft = createProgramProposalDraft({
    today: "2026-09-04",
    preparedBy: "Jim Day",
    preparedByEmail: "jim.day@artisanlabnetwork.com",
    defaultPriceListCode: "P6",
  });
  assert.deepEqual(draft.selectedPriceLists, ["P6"]);
  assert.equal(draft.validThrough, "2026-10-04");
  assert.equal(draft.secondPairDays, 30);
  assert.equal(draft.templateCode, "full-transition");
  assert.deepEqual(
    draft.selectedStoryModules,
    STORY_MODULES.filter((module) => module.code !== "freedom-of-choice").map((module) => module.code)
  );
  assert.equal(draft.includeFreedomOfChoicePage, false);
  assert.equal(draft.stateCode, "");
  assert.ok(draft.selectedStoryModules.includes("implementation-support"));
  assert.ok(draft.selectedStoryModules.includes("portal-visibility"));
});

test("manual savings can be expressed as an amount, percentage, or both", () => {
  assert.equal(formatSavingsAmount(24000, "annual"), "$24,000 annually");
  assert.equal(formatSavingsAmount(1800, "monthly"), "$1,800 per month");
  assert.equal(formatSavingsAmount(7500, "one-time"), "$7,500 one-time");
  assert.equal(formatSavingsAmount(0, "annual"), "");

  const draft = createProgramProposalDraft({
    today: "2026-09-04",
    preparedBy: "Jim Day",
    preparedByEmail: "jim.day@artisanlabnetwork.com",
    defaultPriceListCode: "P6",
  });
  draft.customerName = "Carlin Vision";
  draft.includeCostSavings = true;
  draft.costSavingsAmount = 24000;
  draft.costSavingsPercent = 14.6;
  assert.match(proposalEmailBody(draft), /\$24,000 annually \/ 14\.6%/);
});

test("service proof point reports both relative improvement and fewer turnaround days", () => {
  assert.deepEqual(calculateServiceImprovement(5.5, 2.5), {
    relativeImprovementPercent: 120,
    turnaroundReductionPercent: 55,
    daysSaved: 3,
  });
  assert.equal(calculateServiceImprovement(2.5, 5.5), null);
});

test("proposal templates and email handoff produce customer-specific copy", () => {
  const draft = createProgramProposalDraft({
    today: "2026-09-04",
    preparedBy: "Jim Day",
    preparedByEmail: "jim.day@artisanlabnetwork.com",
    defaultPriceListCode: "P6",
  });
  draft.customerName = "Carlin Vision";
  draft.customerContactName = "Andrea";
  draft.nextStep = PROPOSAL_TEMPLATES[0].nextStep;
  draft.productCrosswalk = [{
    id: "one",
    category: "Everyday progressive",
    currentProduct: "Current PAL",
    artisanProduct: "GS Balance",
    vspProduct: "Unity V3",
    rationale: "Simple staff recommendation.",
  }];
  assert.equal(
    proposalEmailSubject(draft),
    "Artisan lab partnership proposal for Carlin Vision"
  );
  assert.match(proposalEmailBody(draft), /^Hi Andrea,/);
  assert.match(proposalEmailBody(draft), /product crosswalk/);
  assert.match(proposalEmailBody(draft), /Recommended next step/);
});
test("A6 proposal title changes only with Acquios membership", () => {
  assert.equal(
    proposalPriceListTitle("A6", true, "Artisan Preferred Pricing"),
    "Acquios A6 Pricing"
  );
  assert.equal(
    proposalPriceListTitle("A6", false, "Artisan Preferred Pricing"),
    "PMP A6"
  );
  assert.equal(
    proposalPriceListTitle("P6", true, "Artisan Partner Pricing"),
    "Artisan Partner Pricing"
  );
  assert.equal(
    proposalPriceListTitle("H5", false, "Artisan Hoya Package"),
    "Artisan Hoya Lens System"
  );
});

test("Program Studio exposes every requested pricing attachment", () => {
  assert.deepEqual(PROGRAM_STUDIO_PRICE_LIST_CODES, [
    "A6", "G6", "P6", "E4", "E5", "E6", "E7", "E8",
    "VD", "S5", "B5", "H5", "TK", "VX",
  ]);
});

test("reward tiers and supplied point schedules remain exact", () => {
  assert.deepEqual(PROGRAM_TIER_GUIDE.map((tier) => tier.volume), [
    "1 to 19 qualifying lens pairs per month",
    "20 to 59 qualifying lens pairs per month",
    "60 to 100 qualifying lens pairs per month",
    "More than 100 qualifying lens pairs per month",
  ]);
  assert.deepEqual(PROGRAM_REBATE_SCHEDULES.sequel.rows[0], [
    "Sequel PAL", "$5", "$10", "$17", "$20",
  ]);
  assert.match(PROGRAM_REBATE_SCHEDULES["unity-rewards"].note, /Tier 1 earns no points/);
  assert.match(PACKAGE_PRICING_EXPLANATION, /defaults to the customer's base pricing/);
});

test("special pricing remains explicit and auditable", () => {
  assert.equal(
    formatSpecialPricingRule({
      id: "one",
      productName: "Varilux Comfort Max",
      kind: "fixed-price",
      amount: 149,
      priceListCodes: ["P6"],
      notes: "Polycarbonate clear",
    }),
    "$149.00 special price"
  );
  assert.equal(
    formatSpecialPricingRule({
      id: "two",
      productName: "Example",
      kind: "dollar-deduction",
      amount: 20,
      priceListCodes: ["G6"],
      notes: "",
    }),
    "$20.00 deduction from attached pricing"
  );
});

test("proposal export readiness requires the regulatory exclusion acknowledgement", () => {
  const draft = createProgramProposalDraft({
    today: "2026-09-04",
    preparedBy: "Jim Day",
    preparedByEmail: "jim.day@artisanlabnetwork.com",
    defaultPriceListCode: "P6",
  });
  Object.assign(draft, {
    customerName: "North Star Eye Care",
    locationName: "McKinney, Texas",
    selectedPrograms: ["simple-switch"],
  });
  const blocked = proposalReadiness(draft);
  assert.equal(blocked.ready, false);
  assert.ok(blocked.missing.includes("government-program volume acknowledgement"));
  draft.regulatoryAcknowledged = true;
  assert.equal(proposalReadiness(draft).ready, true);
  draft.selectedPrograms = [];
  assert.equal(proposalReadiness(draft).ready, true);
  draft.includeFreedomOfChoicePage = true;
  assert.ok(proposalReadiness(draft).missing.includes("customer state for freedom-of-choice page"));
  draft.stateCode = "TX";
  assert.equal(proposalReadiness(draft).ready, true);
});

test("customer preview uses the exact generated PDF and repeats required terms", () => {
  const builder = read("app/portal/admin/program-studio/ProgramStudio.tsx");
  const pdf = read("app/portal/admin/program-studio/pdf/route.ts");
  const priceListPdf = read("lib/portal/priceListPdf.ts");
  const proxy = read("proxy.ts");
  assert.match(builder, /Price-list attachments/);
  assert.match(builder, /Special line-item pricing/);
  assert.match(builder, /multiple remakes/i);
  assert.match(builder, /Product &amp; VSP crosswalk/);
  assert.match(builder, /Email handoff/);
  assert.match(builder, /Clear proposal/);
  assert.match(builder, /Estimated savings amount/);
  assert.match(builder, /Transition, onboarding &amp; portal/);
  assert.match(builder, /Include lab freedom-of-choice page/);
  assert.match(builder, /preview: true/);
  assert.match(builder, /Exact customer proposal PDF preview/);
  assert.doesNotMatch(builder, /ProposalDocument/);
  assert.match(proxy, /frame-src 'self' blob:/);
  assert.match(pdf, /buildPriceListPdf/);
  assert.match(pdf, /PRODUCT CROSSWALK/);
  assert.match(pdf, /ONBOARDING PLAN/);
  assert.match(pdf, /THE ARTISAN CUSTOMER PORTAL/);
  assert.match(pdf, /ARTISANLABNETWORK.COM/);
  assert.match(pdf, /program-studio.*portal-example\.png/);
  assert.match(pdf, /includeSharedClosingPages: index === draft\.selectedPriceLists\.length - 1/);
  assert.doesNotMatch(pdf, /RECOMMENDED NEXT STEP/);
  assert.match(pdf, /fontkit/);
  assert.match(pdf, /SPECIAL PRICING THAT MODIFIES THIS LIST/);
  assert.match(pdf, /Full Warranty and Remake Policies/);
  assert.match(pdf, /DEFAULT_ADDITIONAL_TERMS/);
  assert.match(pdf, /if \(!applicable\.length\) return/);
  assert.doesNotMatch(pdf, /NO SPECIAL LINE-ITEM MODIFICATIONS/);
  assert.match(pdf, /A lab relationship designed around your practice/);
  assert.match(pdf, /document\.copyPages/);
  assert.match(pdf, /canAccessPortalAdmin/);
  assert.match(priceListPdf, /includeSharedClosingPages = true/);
  assert.match(priceListPdf, /if \(includeSharedClosingPages\)/);
  assert.match(GOVERNMENT_PROGRAM_EXCLUSION, /Federal- and state-reimbursed/);
});

test("Program Studio is discoverable to both staff navigation modes", () => {
  const nav = read("app/portal/AdminUtilityNav.tsx");
  const occurrences = nav.match(/\/portal\/admin\/program-studio/g) ?? [];
  assert.ok(occurrences.length >= 2);
});
