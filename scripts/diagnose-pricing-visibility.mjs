import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const root = process.cwd();
const generatedDir = path.join(root, "private-source", "pricing", "generated");
const diagnosticsDir = path.join(generatedDir, "diagnostics");
const dashboardDir = path.join(
  root,
  "private-source",
  "portal",
  "dashboard-v1",
  "current"
);
const scopeConfigPath = path.join(
  root,
  "config",
  "pricing-scope.json"
);
const lookupArPath = path.join(
  root,
  "private-source",
  "portal",
  "lookup_docs",
  "Lookup_AR.xlsx"
);
const portalPriceListSourcePath = path.join(root, "lib", "portal", "priceLists.ts");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalize(value) {
  return String(value ?? "").trim().toUpperCase();
}

function parsePortalCodesFromSource(text) {
  const match = text.match(/export type PriceListCode =([\s\S]*?);/);
  if (!match) return [];
  return [...match[1].matchAll(/"([A-Z0-9]+)"/g)].map((entry) => entry[1]);
}

async function readLookupArMap(filePath) {
  if (!fs.existsSync(filePath)) return new Map();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return new Map();

  const header = sheet
    .getRow(1)
    .values.slice(1)
    .map((value) => String(value ?? "").trim().toLowerCase());
  const dviIndex = header.findIndex((value) => value.includes("dvi") || value.includes("column a"));
  const nameIndex = header.findIndex((value) => value === "name" || value.includes("column b"));
  const brandIndex = header.findIndex((value) => value === "brand" || value.includes("column c"));

  const map = new Map();
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    const dvi = normalize(values[dviIndex >= 0 ? dviIndex : 0]);
    if (!dvi) return;
    map.set(dvi, {
      officialName: String(values[nameIndex >= 0 ? nameIndex : 1] ?? "").trim() || dvi,
      brand: String(values[brandIndex >= 0 ? brandIndex : 2] ?? "").trim() || "",
    });
  });
  return map;
}

function buildArDiagnosticForCode(code, dviJson, arLookup) {
  const rows = Array.isArray(dviJson.rows) ? dviJson.rows : [];
  const resultRows = [];
  const MAX_ENTRIES = 50000;
  let truncatedCount = 0;
  const scheduleSet = new Set();
  const missingScheduleRows = [];
  let fallbackUsedCount = 0;

  for (const row of rows) {
    const linked = row?.linkedSchedules?.coating ?? [];
    const schedule = String(row?.scheduleRefs?.coating ?? "").trim();
    if (schedule) scheduleSet.add(schedule);
    if (schedule && linked.length === 0) {
      missingScheduleRows.push({
        style: row.productStyleDescription,
        rawStyle: row.productStyleCode,
        materialCode: row.materialCode,
        cotSchedule: schedule,
      });
    }
    for (const coat of linked) {
      const arCode = normalize(coat.Code);
      const lookup = arLookup.get(arCode);
      const entry = {
        priceListCode: code,
        styleProductDisplayName: row.productStyleDescription,
        rawDviStyleName: row.productStyleCode,
        materialCode: row.materialCode,
        cotScheduleName: schedule,
        cotScheduleExistsInLinkedData: linked.length > 0,
        arProductCode: arCode,
        arRawNameFromCoats: String(coat.Name ?? arCode),
        arOfficialNameFromLookup: lookup?.officialName ?? null,
        arBrandCategoryFromLookup: lookup?.brand ?? null,
        arPriceFromCoats: Number.parseFloat(String(coat.Price ?? "NaN")),
        belongsToSelectedPriceList: normalize(row.priceListCode) === normalize(code),
        fallbackOrDefaultPriceListUsed: normalize(row.priceListCode) !== normalize(code),
      };
      if (resultRows.length < MAX_ENTRIES) {
        resultRows.push(entry);
      } else {
        truncatedCount += 1;
      }
      if (normalize(row.priceListCode) !== normalize(code)) fallbackUsedCount += 1;
    }
  }

  return {
    code,
    generatedAt: new Date().toISOString(),
    sourceRowCount: rows.length,
    cotSchedulesReferencedCount: scheduleSet.size,
    cotSchedulesReferencedSample: [...scheduleSet].sort().slice(0, 100),
    missingCoatScheduleReferenceRows: missingScheduleRows.slice(0, 500),
    fallbackOrDefaultPriceListUsedCount: fallbackUsedCount,
    entriesTruncatedCount: truncatedCount,
    entries: resultRows,
  };
}

function loadGeneratedPriceCodes() {
  const files = fs.readdirSync(generatedDir);
  const codeSet = new Set();
  for (const file of files) {
    const match = file.match(/^dvi-([a-z0-9]+)-pricing\.json$/i);
    if (match) codeSet.add(match[1].toUpperCase());
  }
  return codeSet;
}

function accountCodeSet(accountsIndex) {
  const set = new Set();
  for (const account of accountsIndex) {
    for (const code of account.price_lists ?? []) {
      set.add(normalize(code));
    }
  }
  return set;
}

function codeVisibilityMatrix({
  dviCodes,
  scope,
  generatedCodes,
  portalCodes,
  accountCodes,
}) {
  const allCodes = new Set([
    ...dviCodes,
    ...scope.payAttention.map(normalize),
    ...scope.ignore.map(normalize),
    ...Object.keys(scope.businessRulesByCode || {}).map(normalize),
    ...generatedCodes,
    ...portalCodes,
    ...accountCodes,
  ]);

  const matrix = [];
  for (const code of [...allCodes].sort()) {
    const aliasTarget = scope.aliasToDvi?.[code] ? normalize(scope.aliasToDvi[code]) : null;
    const displayRule = scope.businessRulesByCode?.[code]?.displayWhenAssociatedToCustomer;
    const ignored = scope.ignore.map(normalize).includes(code);
    const inPayAttention = scope.payAttention.map(normalize).includes(code);
    const inRaw = dviCodes.includes(code);
    const generated = generatedCodes.has(code);
    const inPortalMetadata = portalCodes.includes(code);
    const appearsInAccounts = accountCodes.has(code);
    const routeAvailable = inPortalMetadata;
    const customerVisiblePossible =
      Boolean(displayRule) &&
      !ignored &&
      inPortalMetadata &&
      generated &&
      appearsInAccounts;

    matrix.push({
      code,
      rawDviExists: inRaw,
      workbookExists: inRaw,
      pricingScopeStatus: ignored ? "ignored" : inPayAttention ? "payAttention" : "outOfScope",
      aliasCanonicalCode: aliasTarget,
      ignored,
      generatedArtifactExists: generated,
      portalMetadataExists: inPortalMetadata,
      appearsInAnyAccountUsedPriceLists: appearsInAccounts,
      routeAvailable,
      customerVisiblePossible,
      needsDecision:
        inRaw && !ignored && !inPortalMetadata
          ? "Raw/generated exists but portal metadata missing"
          : null,
    });
  }

  return matrix;
}

async function main() {
  fs.mkdirSync(diagnosticsDir, { recursive: true });

  const scope = readJson(scopeConfigPath);
  const dviPriceLists = readJson(path.join(generatedDir, "dvi-price-lists.json")).priceLists ?? [];
  const dviCodes = dviPriceLists.map((entry) => normalize(entry.code));
  const generatedCodes = loadGeneratedPriceCodes();
  const accountsIndex = readJson(path.join(dashboardDir, "accounts_index.json"));
  const accountCodes = accountCodeSet(accountsIndex);
  const portalCodeSource = fs.readFileSync(portalPriceListSourcePath, "utf8");
  const portalCodes = parsePortalCodesFromSource(portalCodeSource);
  const arLookup = await readLookupArMap(lookupArPath);

  const g6Dvi = readJson(path.join(generatedDir, "dvi-g6-pricing.json"));
  const p6Dvi = readJson(path.join(generatedDir, "dvi-p6-pricing.json"));
  const g6ArDiagnostic = buildArDiagnosticForCode("G6", g6Dvi, arLookup);
  const p6ArDiagnostic = buildArDiagnosticForCode("P6", p6Dvi, arLookup);

  const g6ArSet = new Set(
    g6ArDiagnostic.entries.map((entry) => `${entry.arProductCode}|${entry.arPriceFromCoats}`)
  );
  const p6ArSet = new Set(
    p6ArDiagnostic.entries.map((entry) => `${entry.arProductCode}|${entry.arPriceFromCoats}`)
  );
  const g6Only = [...g6ArSet].filter((item) => !p6ArSet.has(item));
  const p6Only = [...p6ArSet].filter((item) => !g6ArSet.has(item));

  g6ArDiagnostic.comparisonToP6 = {
    g6UniqueArCodePriceCount: g6Only.length,
    p6UniqueArCodePriceCount: p6Only.length,
    g6OnlySample: g6Only.slice(0, 100),
    p6OnlySample: p6Only.slice(0, 100),
    overlapCount: [...g6ArSet].filter((item) => p6ArSet.has(item)).length,
  };

  p6ArDiagnostic.comparisonToG6 = {
    p6UniqueArCodePriceCount: p6Only.length,
    g6UniqueArCodePriceCount: g6Only.length,
    p6OnlySample: p6Only.slice(0, 100),
    g6OnlySample: g6Only.slice(0, 100),
    overlapCount: [...p6ArSet].filter((item) => g6ArSet.has(item)).length,
  };

  const e4Accounts = accountsIndex.filter((account) =>
    (account.price_lists ?? []).map(normalize).includes("E4")
  );
  const e4Diagnostic = {
    generatedAt: new Date().toISOString(),
    e4InRawDvi: dviCodes.includes("E4"),
    e4InPricingScopePayAttention: scope.payAttention.map(normalize).includes("E4"),
    e4InPricingScopeIgnore: scope.ignore.map(normalize).includes("E4"),
    e4GeneratedDviArtifactExists: generatedCodes.has("E4"),
    e4PortalMetadataExists: portalCodes.includes("E4"),
    e4BusinessRuleDisplayWhenAssociatedToCustomer:
      scope.businessRulesByCode?.E4?.displayWhenAssociatedToCustomer ?? null,
    e4AccountsCount: e4Accounts.length,
    e4Accounts: e4Accounts.slice(0, 25).map((account) => {
      const rawUsed = account.price_lists ?? [];
      const normalizedUsed = rawUsed.map(normalize);
      const finalDisplayed = normalizedUsed.filter((code) => portalCodes.includes(code));
      const excluded = normalizedUsed.filter((code) => !portalCodes.includes(code));
      return {
        acctId: account.account_id,
        businessName: account.business_name,
        rawUsedPriceLists: rawUsed,
        normalizedUsedPriceLists: normalizedUsed,
        finalDisplayedPriceListCodes: finalDisplayed,
        excludedPriceListCodes: excluded,
        exclusionReasons: excluded.map((code) => ({
          code,
          reason: portalCodes.includes(code) ? null : "Missing from lib/portal/priceLists.ts",
        })),
      };
    }),
  };

  const matrix = codeVisibilityMatrix({
    dviCodes,
    scope,
    generatedCodes,
    portalCodes,
    accountCodes,
  });

  fs.writeFileSync(
    path.join(diagnosticsDir, "g6-ar-diagnostic.json"),
    JSON.stringify(g6ArDiagnostic, null, 2)
  );
  fs.writeFileSync(
    path.join(diagnosticsDir, "p6-ar-diagnostic.json"),
    JSON.stringify(p6ArDiagnostic, null, 2)
  );
  fs.writeFileSync(
    path.join(diagnosticsDir, "e4-visibility-diagnostic.json"),
    JSON.stringify(e4Diagnostic, null, 2)
  );
  fs.writeFileSync(
    path.join(diagnosticsDir, "pricing-code-visibility-matrix.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        portalCodes,
        matrix,
      },
      null,
      2
    )
  );

  console.log("Wrote diagnostics:");
  console.log(path.join(diagnosticsDir, "g6-ar-diagnostic.json"));
  console.log(path.join(diagnosticsDir, "p6-ar-diagnostic.json"));
  console.log(path.join(diagnosticsDir, "e4-visibility-diagnostic.json"));
  console.log(path.join(diagnosticsDir, "pricing-code-visibility-matrix.json"));
}

await main();
