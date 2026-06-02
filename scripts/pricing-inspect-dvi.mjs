import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { inspectDviRawPriceFiles } from "../lib/pricing/parseDviRawPriceFiles.mjs";

const root = process.cwd();
const rawDir = path.join(root, "private-source", "pricing", "raw-price-files");
const outputDir = path.join(root, "private-source", "pricing", "generated");

async function main() {
  const inspection = await inspectDviRawPriceFiles(rawDir);
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "dvi-inventory-report.json");
  await writeFile(outputPath, `${JSON.stringify({
    generatedAt: inspection.generatedAt,
    rawDir: inspection.rawDir,
    fileInventory: inspection.fileInventory,
    priceListCodes: inspection.priceListCodes,
    recordCounts: inspection.recordCounts,
    relationshipHints: inspection.relationshipHints,
  }, null, 2)}\n`, "utf8");

  console.log(`[pricing:inspect-dvi] wrote ${outputPath}`);
  console.log(`[pricing:inspect-dvi] price lists from price.xml: ${inspection.priceListCodes.fromPriceXml.join(", ")}`);
  console.log(`[pricing:inspect-dvi] price lists from all raw files: ${inspection.priceListCodes.fromAllFiles.join(", ")}`);
  for (const file of inspection.fileInventory) {
    console.log(
      `[pricing:inspect-dvi] ${file.fileName}: root=${file.rootElement}, records=${file.recordCount}, child=${file.primaryChildElement}`
    );
  }
}

main().catch((error) => {
  console.error(`[pricing:inspect-dvi] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
