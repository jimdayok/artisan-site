import { createHash } from "node:crypto";
import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const onedriveRoot =
  "/Users/jimday/Library/CloudStorage/OneDrive-pacificartisanlabs.com/Report Data/MASTER";
const referenceFilesRoot =
  "/Users/jimday/Library/CloudStorage/OneDrive-pacificartisanlabs.com/Report Data/Reference Files";
const manifestOutputPath = path.join(
  root,
  "private-source",
  "portal",
  "source-sync-manifest.json"
);

const sourceManifest = [
  {
    label: "Portal export",
    source: path.join(onedriveRoot, "portal_export.json"),
    destination: path.join(root, "private-site", "portal", "portal_export.json"),
    required: true,
    type: "json",
  },
  {
    label: "Pricing lookup workbook",
    source: path.join(referenceFilesRoot, "Lookup.xlsx"),
    destination: path.join(
      root,
      "private-source",
      "portal",
      "lookup_docs",
      "Lookup.xlsx"
    ),
    required: true,
    type: "xlsx",
  },
  {
    label: "Pricing material lookup workbook",
    source: path.join(referenceFilesRoot, "Lookup_Mat.xlsx"),
    destination: path.join(
      root,
      "private-source",
      "portal",
      "lookup_docs",
      "Lookup_Mat.xlsx"
    ),
    required: true,
    type: "xlsx",
  },
  {
    label: "Pricing AR lookup workbook",
    source: path.join(referenceFilesRoot, "Lookup_AR.xlsx"),
    destination: path.join(
      root,
      "private-source",
      "portal",
      "lookup_docs",
      "Lookup_AR.xlsx"
    ),
    required: true,
    type: "xlsx",
  },
  {
    label: "Pricing colors lookup",
    sourceCandidates: [
      path.join(referenceFilesRoot, "colors.txt"),
      path.join(referenceFilesRoot, "colors.xlsx"),
    ],
    destination: path.join(root, "private-source", "price-lists", "colors.txt"),
    required: true,
    type: "txt",
  },
];

const generatorCommands = [
  ["npm", ["run", "portal:generate-dashboard-v1:launch-safe"]],
  ["npm", ["run", "portal:bundle-dashboard-v1"]],
  ["npm", ["run", "locator:generate"]],
  ["npm", ["run", "pricing:generate"]],
];

const commitPaths = [
  ...sourceManifest.map((entry) => path.relative(root, entry.destination)),
  path.relative(root, manifestOutputPath),
  "lib/portal/generated/dashboardV1Bundle.json",
  "lib/patient-locator/practices.ts",
  "private-source/portal/dashboard-v1/current",
  "private-source/portal/dashboard-v1/releases",
  "private-source/pricing/generated",
];

function normalizeArg(value) {
  if (value.startsWith("–")) return `--${value.slice(1)}`;
  return value;
}

function parseOptions(argv) {
  const normalized = argv.map(normalizeArg);
  return {
    dryRun: normalized.includes("--dry-run"),
    commit: normalized.includes("--commit"),
  };
}

async function sha256(filePath) {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function logStep(message) {
  console.log(`[sync-onedrive] ${message}`);
}

async function runCommand(command, args, options = {}) {
  const label = `${command} ${args.join(" ")}`;
  logStep(`Running: ${label}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Command terminated by signal ${signal}: ${label}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}: ${label}`));
        return;
      }
      resolve();
    });
  });
}

async function verifySources() {
  for (const entry of sourceManifest) {
    const sourcePath = await resolveSourcePath(entry);
    if (!sourcePath && entry.required) {
      throw new Error(
        `Required ${entry.type} source is missing for ${entry.label}: ${describeSource(entry)}`
      );
    }
  }
}

async function copySources({ dryRun }) {
  const copiedEntries = [];
  for (const entry of sourceManifest) {
    const sourcePath = await resolveSourcePath(entry);
    if (!sourcePath) continue;
    logStep(
      `${dryRun ? "Would copy" : "Copying"} ${entry.label}: ${sourcePath} -> ${entry.destination}`
    );
    if (dryRun) continue;
    await mkdir(path.dirname(entry.destination), { recursive: true });
    await cp(sourcePath, entry.destination);
    const destinationStat = await stat(entry.destination);
    copiedEntries.push({
      label: entry.label,
      type: entry.type,
      required: entry.required,
      sourcePath,
      destinationPath: entry.destination,
      sizeBytes: destinationStat.size,
      sha256: await sha256(entry.destination),
    });
  }
  return copiedEntries;
}

async function writeSyncManifest(entries, { dryRun }) {
  logStep(
    `${dryRun ? "Would write" : "Writing"} sync manifest: ${path.relative(root, manifestOutputPath)}`
  );
  if (dryRun) return;
  await mkdir(path.dirname(manifestOutputPath), { recursive: true });
  await writeFile(
    manifestOutputPath,
    `${JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        entries,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

async function runGenerators({ dryRun }) {
  for (const [command, args] of generatorCommands) {
    if (dryRun) {
      logStep(`Would run: ${command} ${args.join(" ")}`);
      continue;
    }
    await runCommand(command, args);
  }
}

async function stageCommitPaths() {
  for (const relativePath of commitPaths) {
    const absolutePath = path.join(root, relativePath);
    const exists = await fileExists(absolutePath);
    if (!exists) {
      logStep(`Skipping missing path: ${relativePath}`);
      continue;
    }
    if (await isGitIgnored(relativePath)) {
      logStep(`Skipping git-ignored path: ${relativePath}`);
      continue;
    }
    await runCommand("git", ["add", "--", relativePath], {
      stdio: "inherit",
    });
  }
}

async function commitAndPush({ dryRun }) {
  if (!dryRun) {
    await runCommand("git", ["status", "--short", "--branch"]);
  } else {
    logStep("Would run: git status --short --branch");
  }

  if (dryRun) {
    for (const relativePath of commitPaths) {
      logStep(`Would git add: ${relativePath}`);
    }
    logStep(
      'Would commit with message: "Sync OneDrive source files and generated portal artifacts"'
    );
    logStep("Would push: git push origin main");
    return;
  }

  const branch = await captureCommand("git", ["branch", "--show-current"]);
  if (branch.trim() !== "main") {
    throw new Error(
      `Commit mode must be run from the main branch. Current branch: ${branch.trim() || "(unknown)"}`
    );
  }

  await stageCommitPaths();

  const stagedDiff = await captureCommand("git", ["diff", "--cached", "--name-only"]);
  if (!stagedDiff.trim()) {
    logStep("No staged changes detected. Skipping commit and push.");
    return;
  }

  await runCommand("git", [
    "commit",
    "-m",
    "Sync OneDrive source files and generated portal artifacts",
  ]);
  await runCommand("git", ["push", "origin", "main"]);
}

async function captureCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Command terminated by signal ${signal}: ${command}`));
        return;
      }
      if (code !== 0) {
        reject(
          new Error(
            `Command failed with exit code ${code}: ${command} ${args.join(" ")}${stderr ? `\n${stderr}` : ""}`
          )
        );
        return;
      }
      resolve(stdout);
    });
  });
}

async function commandSucceeds(command, args) {
  try {
    await captureCommand(command, args);
    return true;
  } catch {
    return false;
  }
}

async function isGitIgnored(relativePath) {
  return commandSucceeds("git", ["check-ignore", "-q", "--", relativePath]);
}

async function resolveSourcePath(entry) {
  const candidates = entry.sourceCandidates ?? [entry.source];
  for (const candidate of candidates) {
    if (candidate && (await fileExists(candidate))) return candidate;
  }
  return "";
}

function describeSource(entry) {
  return (entry.sourceCandidates ?? [entry.source]).filter(Boolean).join(" | ");
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  logStep(
    `Starting OneDrive source sync${options.dryRun ? " in dry-run mode" : ""}${
      options.commit ? " with commit mode" : ""
    }.`
  );
  await verifySources();
  const copiedEntries = await copySources(options);
  await writeSyncManifest(copiedEntries, options);
  await runGenerators(options);
  if (options.commit) {
    await commitAndPush(options);
  }
  logStep("Sync complete.");
}

main().catch((error) => {
  console.error(
    `[sync-onedrive] failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
