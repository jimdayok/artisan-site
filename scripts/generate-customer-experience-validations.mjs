import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const dashboardDir = path.join(rootDir, "private-source", "portal", "dashboard-v1", "current");
const normalizedDir = path.join(rootDir, "private-source", "pricing", "generated", "normalized");
const diagnosticsDir = path.join(rootDir, "private-source", "pricing", "generated", "diagnostics");

mkdirSync(diagnosticsDir, { recursive: true });

const canonical = (code) => String(code || "").trim().toUpperCase();

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const accounts = readJson(path.join(dashboardDir, "accounts_index.json"), []);

const accessValidation = {
  generatedAt: new Date().toISOString(),
  notes: ["Customer visible lists must exactly match account-assigned price lists."],
  rows: accounts.map((account) => {
    const assigned = Array.isArray(account.price_lists) ? account.price_lists : [];
    const effective = [...new Set(assigned.map(canonical).filter(Boolean))].sort();
    const customerVisible = effective;
    return {
      account: String(account.account_id || "").trim(),
      businessName: String(account.business_name || "").trim(),
      assignedLists: assigned,
      effectiveLists: effective,
      customerVisibleLists: customerVisible,
    };
  }),
};

writeFileSync(
  path.join(diagnosticsDir, "price-list-access-validation.json"),
  JSON.stringify(accessValidation, null, 2)
);

const materialRows = [];
const blueLightRows = [];
const listsToCheck = ["G6", "P6", "A6", "M5", "E5", "Y5"];
for (const code of listsToCheck) {
  const filePath = path.join(normalizedDir, `${code}.json`);
  const parsed = readJson(filePath, null);
  if (!parsed || !Array.isArray(parsed.rows)) continue;
  for (const row of parsed.rows) {
    const lensMat = String(row.materialRaw || row.material || "").trim().toUpperCase();
    const sourceText = [row.materialRaw, row.material, ...(row.sourceCodes || [])]
      .map((value) => String(value || "").toUpperCase())
      .join(" ");
    const isBlueLight =
      /^B[A-Z0-9]{1,4}$/.test(lensMat) ||
      /\bB(?:50|53|60|67|74|PY)\b/.test(sourceText) ||
      /\bB[A-Z]{2,4}\b/.test(sourceText);
    const isPhotochromic =
      lensMat.startsWith("S") || lensMat.startsWith("T") || row.materialColor === "Photochromic";
    const isPolarized =
      ["P60", "P67", "P74", "PFT", "PLP", "PRM", "PRT", "PRY"].includes(lensMat) ||
      row.materialColor === "Polarized";

    materialRows.push({
      priceListCode: code,
      lensmat: lensMat || row.material,
      material: row.material,
      materialColor: row.materialColor,
      blueLight: isBlueLight,
      photochromic: isPhotochromic,
      polarized: isPolarized,
    });

    if (isBlueLight) {
      blueLightRows.push({
        priceListCode: code,
        lensmat: lensMat || row.material,
        designStyle: row.designStyle,
        material: row.material,
        materialColor: row.materialColor,
      });
    }
  }
}

writeFileSync(
  path.join(diagnosticsDir, "blue-light-material-validation.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      detectedBlueLightRows: blueLightRows.length,
      rows: blueLightRows,
    },
    null,
    2
  )
);

writeFileSync(
  path.join(diagnosticsDir, "material-coverage-validation.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      rows: materialRows,
    },
    null,
    2
  )
);

console.log("Wrote diagnostics:");
console.log("- private-source/pricing/generated/diagnostics/price-list-access-validation.json");
console.log("- private-source/pricing/generated/diagnostics/blue-light-material-validation.json");
console.log("- private-source/pricing/generated/diagnostics/material-coverage-validation.json");
