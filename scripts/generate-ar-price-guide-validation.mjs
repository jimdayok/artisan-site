import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const generatedDir = path.join(root, "private-source", "pricing", "generated");
const diagnosticsDir = path.join(generatedDir, "diagnostics");
const outputPath = path.join(diagnosticsDir, "ar-price-guide-validation.json");

function asUpper(value) {
  return String(value ?? "").trim().toUpperCase();
}

function isCustomerFacingPricingFile(fileName) {
  return fileName.endsWith("-pricing.json") && !fileName.startsWith("dvi-");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function summarizePriceList(data, fileName) {
  const code = asUpper(data?.code || fileName.replace(/-pricing\.json$/i, ""));
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const arRows = Array.isArray(data?.arCoatings) ? data.arCoatings : [];

  const cotSchedulesFound = [...new Set(rows.map((row) => String(row.coatingScheduleRef || "").trim()).filter(Boolean))].sort();
  const missingCotSchedules = [...new Set(
    rows
      .filter((row) => String(row.coatingScheduleRef || "").trim() && !(row.coatingOptions?.length > 0))
      .map((row) => String(row.coatingScheduleRef || "").trim())
  )].sort();

  let coatingRowsFound = 0;
  let lookupMatches = 0;
  let unresolvedArRows = 0;
  const crossPriceListContaminationWarnings = [];
  const mappedCodes = new Set();
  const displayedArOptions = [];
  const displayedKey = new Set();
  for (const row of rows) {
    const rowCode = asUpper(row.code || code);
    if (rowCode && rowCode !== code) {
      crossPriceListContaminationWarnings.push(
        `Row code ${rowCode} present in ${code} dataset (row id ${row.id || "unknown"}).`
      );
    }
    for (const coating of row.coatingOptions ?? []) {
      coatingRowsFound += 1;
      const coatingCode = String(coating.code || "").trim();
      if (coatingCode) mappedCodes.add(coatingCode);
      if (coating.unresolved) unresolvedArRows += 1;
      else lookupMatches += 1;

      const entry = {
        selectedPriceList: code,
        styleName: String(row.designStyle || ""),
        styleCOT: String(row.coatingScheduleRef || coating.sourceSchedule || "").trim(),
        coatsXmlPList: code,
        coatsXmlCotName: String(coating.sourceSchedule || "").trim(),
        colorCode: coatingCode,
        colorPrice: Number(coating.price ?? 0),
        lookupArName: String(coating.name || coatingCode),
        lookupArBrand: String((coating.brandFamily || "").replace(/\s*AR Coatings$/i, "").trim()),
        resolved: !Boolean(coating.unresolved),
      };
      const key = [
        entry.selectedPriceList,
        entry.styleName,
        entry.styleCOT,
        entry.colorCode,
        entry.colorPrice,
        entry.lookupArName,
      ].join("|");
      if (!displayedKey.has(key)) {
        displayedKey.add(key);
        displayedArOptions.push(entry);
      }
    }
  }

  return {
    priceListCode: code,
    sourceFile: fileName,
    cotSchedulesFound,
    coatingRowsFound,
    lookupArMatches: lookupMatches,
    displayedArRowsCount: arRows.length,
    unresolvedArRowsCount: unresolvedArRows,
    missingCotSchedules,
    crossPriceListContaminationWarnings: [...new Set(crossPriceListContaminationWarnings)],
    mappedArCodes: [...mappedCodes].sort(),
    displayedArOptions,
  };
}

async function main() {
  await mkdir(diagnosticsDir, { recursive: true });
  const files = (await readdir(generatedDir)).filter(isCustomerFacingPricingFile).sort();
  const byPriceList = [];
  for (const fileName of files) {
    const fullPath = path.join(generatedDir, fileName);
    const json = await readJson(fullPath);
    byPriceList.push(summarizePriceList(json, fileName));
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    priceListCount: byPriceList.length,
    listsWithNoDisplayedArRows: byPriceList.filter((row) => row.displayedArRowsCount === 0).map((row) => row.priceListCode),
    listsWithMissingCotSchedules: byPriceList
      .filter((row) => row.missingCotSchedules.length > 0)
      .map((row) => ({ priceListCode: row.priceListCode, missingCotSchedules: row.missingCotSchedules })),
    listsWithUnresolvedArRows: byPriceList
      .filter((row) => row.unresolvedArRowsCount > 0)
      .map((row) => ({ priceListCode: row.priceListCode, unresolvedArRowsCount: row.unresolvedArRowsCount })),
    contaminationWarnings: byPriceList
      .filter((row) => row.crossPriceListContaminationWarnings.length > 0)
      .map((row) => ({
        priceListCode: row.priceListCode,
        warnings: row.crossPriceListContaminationWarnings,
      })),
  };

  const payload = { summary, byPriceList };
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`[ar-validation] wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(`[ar-validation] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
