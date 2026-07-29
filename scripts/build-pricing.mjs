import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  loadPricingLookupData,
  writePricingLookupSnapshot,
} from "../lib/pricing/lookupData.mjs";
import { parsePositiveInteger, PricingProgress } from "../lib/pricing/progress.mjs";

const rootDir = process.cwd();
const profile = process.argv.includes("--profile");
const stepTimeoutMs = parsePositiveInteger(
  process.env.PRICING_BUILD_STEP_TIMEOUT_MS,
  45 * 60_000
);
const progress = new PricingProgress({ prefix: "build:pricing", profile });

const steps = [
  ["pricing:generate-dvi", "DVI pricing generation"],
  ["pricing:generate", "standard pricing generation"],
  ["pricing:normalize", "normalization and gzip compression"],
  ["pricing:registry", "registry generation"],
  ["pricing:validate-ar", "AR validation"],
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const childArgs = ["run", step];
    if (profile && step === "pricing:generate-dvi") childArgs.push("--", "--profile");
    const child = spawn("npm", childArgs, {
      stdio: "inherit",
      env: process.env,
      cwd: rootDir,
    });
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      const forceKill = setTimeout(() => child.kill("SIGKILL"), 5_000);
      forceKill.unref();
      reject(
        new Error(
          `Step ${step} exceeded ${stepTimeoutMs}ms and was terminated to prevent an indefinite build`
        )
      );
    }, stepTimeoutMs);
    timeout.unref();

    child.on("error", (error) => {
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
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
  const lookupData = await progress.run("load Lookup.xlsx", () =>
    loadPricingLookupData({ rootDir, log: true })
  );
  await progress.run("write lookup snapshot", () =>
    writePricingLookupSnapshot(lookupData, { rootDir })
  );

  for (const [step, stage] of steps) {
    await progress.run(stage, () => runStep(step));
  }

  await progress.run("validate generated artifact paths", () =>
    validateGeneratedArtifacts()
  );
  progress.printProfile();
  console.log("Pricing build completed successfully.");
}

main().catch((error) => {
  console.error(
    `[build:pricing] failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
