import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const steps = [
  "portal:generate-dashboard-v1:launch-safe",
  "portal:bundle-dashboard-v1",
  "locator:generate",
  "build:pricing",
];

const rootDir = process.cwd();

function isTruthyEnv(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
}

function shouldForcePricingRebuild() {
  return isTruthyEnv(process.env.FORCE_PRICING_PREBUILD);
}

function shouldForcePortalRebuild() {
  return isTruthyEnv(process.env.FORCE_PORTAL_PREBUILD);
}

function isVercelBuild() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

function hasCommittedPortalArtifacts() {
  const requiredFiles = [
    path.join(rootDir, "lib", "portal", "generated", "dashboardV1Bundle.json"),
    path.join(rootDir, "lib", "portal", "generated", "priceListAccessIndex.json"),
    path.join(rootDir, "private-source", "portal", "dashboard-v1", "current", "accounts_index.json"),
    path.join(rootDir, "private-source", "portal", "dashboard-v1", "current", "users_to_accounts.json"),
    path.join(rootDir, "private-source", "portal", "dashboard-v1", "current", "latest_snapshot_manifest.json"),
  ];

  const missing = requiredFiles.filter((filePath) => !existsSync(filePath));
  if (missing.length > 0) {
    console.log(
      `[prebuild] portal artifacts incomplete; missing: ${missing
        .map((filePath) => path.relative(rootDir, filePath))
        .join(", ")}`
    );
    return false;
  }

  console.log("[prebuild] detected committed portal dashboard artifacts");
  return true;
}

function hasCommittedPricingArtifacts() {
  const packagedDir = path.join(rootDir, "lib", "pricing", "generated", "normalized");
  const requiredCodes = ["A5", "A6", "B5", "G5", "G6", "NL", "P5", "P6", "S5", "VD", "Y5"];

  if (!existsSync(packagedDir)) return false;

  try {
    const packagedFiles = readdirSync(packagedDir).filter((name) =>
      name.endsWith(".json.gz")
    );
    if (packagedFiles.length === 0) return false;

    const packagedCodes = new Set(
      packagedFiles.map((name) => name.replace(/\.json\.gz$/u, "").toUpperCase())
    );
    const missingRequiredCodes = requiredCodes.filter(
      (code) => !packagedCodes.has(code)
    );

    if (missingRequiredCodes.length > 0) {
      console.log(
        `[prebuild] pricing artifacts incomplete; missing packaged codes: ${missingRequiredCodes.join(", ")}`
      );
      return false;
    }

    console.log(
      `[prebuild] detected ${packagedFiles.length} committed packaged pricing artifacts`
    );
    return true;
  } catch {
    return false;
  }
}

function shouldSkipPortalRebuild(step) {
  if (
    step !== "portal:generate-dashboard-v1:launch-safe" &&
    step !== "portal:bundle-dashboard-v1"
  ) {
    return false;
  }
  if (!isVercelBuild()) return false;
  if (shouldForcePortalRebuild()) return false;
  return hasCommittedPortalArtifacts();
}

function hasCommittedLocatorArtifacts() {
  const outputPath = path.join(
    rootDir,
    "lib",
    "patient-locator",
    "practices.ts"
  );

  if (!existsSync(outputPath)) {
    console.log(
      `[prebuild] locator artifacts incomplete; missing: ${path.relative(rootDir, outputPath)}`
    );
    return false;
  }

  console.log("[prebuild] detected committed patient locator artifacts");
  return true;
}

function shouldSkipLocatorRebuild(step) {
  if (step !== "locator:generate") return false;
  if (!isVercelBuild()) return false;
  return hasCommittedLocatorArtifacts();
}

function shouldSkipPricingRebuild(step) {
  if (!(step.startsWith("pricing:") || step === "build:pricing")) return false;
  if (!isVercelBuild()) return false;
  if (shouldForcePricingRebuild()) return false;
  return hasCommittedPricingArtifacts();
}

function runStep(step) {
  return new Promise((resolve, reject) => {
    if (shouldSkipPortalRebuild(step)) {
      console.log(
        `[prebuild] skipping ${step} on Vercel because committed portal artifacts are present`
      );
      resolve();
      return;
    }

    if (shouldSkipLocatorRebuild(step)) {
      console.log(
        `[prebuild] skipping ${step} on Vercel because committed locator artifacts are present`
      );
      resolve();
      return;
    }

    if (shouldSkipPricingRebuild(step)) {
      console.log(
        `[prebuild] skipping ${step} on Vercel because committed pricing artifacts are present`
      );
      resolve();
      return;
    }

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

async function main() {
  for (const step of steps) {
    await runStep(step);
  }
}

main().catch((error) => {
  console.error(`[prebuild] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
