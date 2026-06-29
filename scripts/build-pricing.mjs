import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  loadPricingLookupData,
  writePricingLookupSnapshot,
} from "../lib/pricing/lookupData.mjs";

const rootDir = process.cwd();

const steps = [
  "pricing:generate-dvi",
  "pricing:generate",
  "pricing:normalize",
  "pricing:registry",
  "pricing:validate-ar",
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", step], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Step ${step} terminated with signal ${signal}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Step ${step} exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

function validateGeneratedArtifacts() {
  const requiredPaths = [
    path.join(rootDir, "private-source", "pricing", "generated", "pricing-manifest.json"),
    path.join(rootDir, "lib", "pricing", "generated", "normalized"),
    path.join(rootDir, "lib", "pricing", "generated", "lookupData.json"),
  ];

  const missing = requiredPaths.filter((filePath) => !existsSync(filePath));
  if (missing.length > 0) {
    throw new Error(
      `Pricing build finished, but required output is missing: ${missing
        .map((filePath) => path.relative(rootDir, filePath))
        .join(", ")}`
    );
  }
}

async function main() {
  const lookupData = await loadPricingLookupData({ rootDir, log: true });
  await writePricingLookupSnapshot(lookupData, { rootDir });

  for (const step of steps) {
    console.log(`[build:pricing] running ${step}`);
    await runStep(step);
  }

  validateGeneratedArtifacts();
  console.log("Pricing build completed successfully.");
}

main().catch((error) => {
  console.error(
    `[build:pricing] failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
