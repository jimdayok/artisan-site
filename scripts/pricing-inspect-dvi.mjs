import "./loadEnv.mjs";

import { writeJsonAtomic } from "../lib/pricing/atomicJson.mjs";
import { inspectDviRawPriceFiles } from "../lib/pricing/parseDviRawPriceFiles.mjs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "private-source", "pricing", "generated");

async function main() {
  const inspection = await inspectDviRawPriceFiles();
  const outputPath = path.join(outputDir, "dvi-inventory-report.json");
  await writeJsonAtomic(outputPath, {
    generatedAt: inspection.generatedAt,
    sourceDirectory: inspection.sourceDirectory,
    fileInventory: inspection.fileInventory,
    priceListCodes: inspection.priceListCodes,
    recordCounts: inspection.recordCounts,
    relationshipHints: inspection.relationshipHints,
  });

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
