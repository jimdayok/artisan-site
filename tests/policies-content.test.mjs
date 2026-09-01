import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicPoliciesSource = readFileSync("app/lab-policies/page.tsx", "utf8");
const portalPoliciesSource = readFileSync(
  "app/portal/price-list/policies/page.tsx",
  "utf8",
);
const primaryPdf = readFileSync("public/files/artisan-policies-guide.pdf");
const downloadPdf = readFileSync("public/downloads/artisan-policies-guide.pdf");

const requiredChemistrieTerms = [
  "Confirmed manufacturer or laboratory defects",
  "within 30 days",
  "There are no warranties or remake policies for scratches, breakage, or loss.",
  "Cancellations and returns are not accepted because Chemistrie Clip is a customized product.",
];

test("public and portal policies include the complete Chemistrie Clip policy", () => {
  for (const term of requiredChemistrieTerms) {
    assert.match(publicPoliciesSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    assert.match(portalPoliciesSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }

  assert.match(publicPoliciesSource, /href: "#chem-clips-retrofit"/);
  assert.match(publicPoliciesSource, /Retrofit magnets are charged at \$40/);
  assert.match(portalPoliciesSource, /Retrofit magnets are charged at \$40/);
});

test("both website PDF paths contain the same four-page detailed guide", () => {
  const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
  assert.equal(hash(primaryPdf), hash(downloadPdf));

  const metadata = execFileSync("pdfinfo", ["public/files/artisan-policies-guide.pdf"], {
    encoding: "utf8",
  });
  assert.match(metadata, /^Pages:\s+4$/m);
  assert.match(metadata, /^Title:\s+Artisan Policies Guide$/m);

  const text = execFileSync(
    "pdftotext",
    ["public/files/artisan-policies-guide.pdf", "-"],
    { encoding: "utf8" },
  ).replace(/\s+/g, " ");
  for (const term of requiredChemistrieTerms) {
    assert.match(text, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(text, /AR and scratch/i);
  assert.match(text, /Doctor redo and non-adapt/i);
  assert.match(text, /Lab error remake process/i);
  assert.match(text, /Frame policy/i);
  assert.match(text, /Shipping and cancellations/i);
  assert.match(text, /Manufacturer credits/i);
});
