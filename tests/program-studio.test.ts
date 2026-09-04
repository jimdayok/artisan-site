import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  GOVERNMENT_PROGRAM_EXCLUSION,
  createProgramProposalDraft,
  formatSpecialPricingRule,
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
});

test("customer preview and PDF repeat required terms and price-list attachments", () => {
  const preview = read("app/portal/admin/program-studio/ProposalDocument.tsx");
  const builder = read("app/portal/admin/program-studio/ProgramStudio.tsx");
  const pdf = read("app/portal/admin/program-studio/pdf/route.ts");
  assert.match(preview, /GOVERNMENT_PROGRAM_EXCLUSION/);
  assert.match(builder, /Price-list attachments/);
  assert.match(builder, /Special line-item pricing/);
  assert.match(builder, /multiple remakes/i);
  assert.match(pdf, /buildPriceListPdf/);
  assert.match(pdf, /SPECIAL PRICING THAT MODIFIES THIS LIST/);
  assert.match(pdf, /document\.copyPages/);
  assert.match(pdf, /canAccessPortalAdmin/);
  assert.match(GOVERNMENT_PROGRAM_EXCLUSION, /Federal- and state-reimbursed/);
});

test("Program Studio is discoverable to both staff navigation modes", () => {
  const nav = read("app/portal/AdminUtilityNav.tsx");
  const occurrences = nav.match(/\/portal\/admin\/program-studio/g) ?? [];
  assert.ok(occurrences.length >= 2);
});
