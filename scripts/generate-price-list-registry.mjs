import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const generatedDir = path.join(root, "private-source", "pricing", "generated");
const normalizedDir = path.join(generatedDir, "normalized");
const manifestPath = path.join(generatedDir, "pricing-manifest.json");
const accountsPath = path.join(
  root,
  "private-source",
  "portal",
  "dashboard-v1",
  "current",
  "accounts_index.json"
);
const reportOutputPath = path.join(generatedDir, "price-list-registry.json");
const runtimeOutputPath = path.join(
  root,
  "lib",
  "portal",
  "generated",
  "priceListRegistry.json"
);

const packageCodes = new Set(["B5", "S5", "TK", "VX", "M5", "Y5"]);
const invalidNamePattern = /\b(TEST|TEMPLATE|DO NOT USE|NOT FOR BILLING)\b/i;

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

async function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(await readFile(filePath, "utf8"));
}

function getNormalizedPath(code) {
  return path.join(normalizedDir, `${code.toUpperCase()}.json`);
}

async function readNormalizedPayload(code) {
  const normalizedPath = getNormalizedPath(code);
  if (!existsSync(normalizedPath)) return null;
  return readJson(normalizedPath, null);
}

async function main() {
  const manifest = await readJson(manifestPath, { codeSummaries: [] });
  const accounts = await readJson(accountsPath, []);
  const summaries = new Map(
    (manifest.codeSummaries ?? []).map((entry) => [normalizeCode(entry.code), entry])
  );
  const assignedCounts = new Map();
  const visibleCustomerCounts = new Map();

  for (const account of accounts ?? []) {
    const codes = new Set((account.price_lists ?? []).map(normalizeCode).filter(Boolean));
    for (const code of codes) {
      assignedCounts.set(code, (assignedCounts.get(code) ?? 0) + 1);
      if (Number(account.authorized_user_count ?? 0) > 0) {
        visibleCustomerCounts.set(code, (visibleCustomerCounts.get(code) ?? 0) + 1);
      }
    }
  }

  const codes = new Set([
    ...summaries.keys(),
    ...assignedCounts.keys(),
    ...(manifest.codeSummaries ?? []).map((entry) => normalizeCode(entry.code)).filter(Boolean),
    ...packageCodes,
  ]);

  const entries = [];
  for (const code of [...codes].sort()) {
    const summary = summaries.get(code);
    const normalizedPath = getNormalizedPath(code);
    const payload = await readNormalizedPayload(code);
    const normalizedStat = existsSync(normalizedPath) ? await stat(normalizedPath) : null;
    const rowCount = Array.isArray(payload?.rows) ? payload.rows.length : 0;
    const detected = summaries.has(code);
    const generated = Boolean(payload) && rowCount > 0;
    const assignedAccountCount = assignedCounts.get(code) ?? 0;
    const listName = String(summary?.listName ?? "").trim();
    const invalidOrUnknown =
      (detected && invalidNamePattern.test(listName)) ||
      (!detected && assignedAccountCount === 0 && !generated);

    entries.push({
      code,
      label: listName || `${code} Price List`,
      detected,
      generated,
      rowCount,
      package: packageCodes.has(code),
      invalidOrUnknown,
      generationStatus: generated ? "generated" : "missing",
      assignmentStatus: assignedAccountCount > 0 ? "assigned" : "unassigned",
      assignedAccountCount,
      visibleCustomerCount: visibleCustomerCounts.get(code) ?? 0,
      source: summary?.source ?? (generated ? "normalized" : "assignment"),
      generatedAt: normalizedStat?.mtime.toISOString() ?? null,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    detectedCodes: [...summaries.keys()].sort(),
    generatedCodes: entries.filter((entry) => entry.generated).map((entry) => entry.code),
    assignedCodes: [...assignedCounts.keys()].sort(),
    assignedMissingGenerated: entries
      .filter((entry) => entry.assignedAccountCount > 0 && !entry.generated)
      .map((entry) => entry.code),
    generatedUnassigned: entries
      .filter((entry) => entry.generated && entry.assignedAccountCount === 0)
      .map((entry) => entry.code),
    packageCodes: entries.filter((entry) => entry.package).map((entry) => entry.code),
    invalidOrUnknownCodes: entries
      .filter((entry) => entry.invalidOrUnknown)
      .map((entry) => entry.code),
    entries,
  };

  const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
  await mkdir(generatedDir, { recursive: true });
  await mkdir(path.dirname(runtimeOutputPath), { recursive: true });
  await writeFile(reportOutputPath, serializedReport, "utf8");
  await writeFile(runtimeOutputPath, serializedReport, "utf8");

  console.log(`[pricing:registry] detected ${report.detectedCodes.length} price lists`);
  console.log(`[pricing:registry] generated ${report.generatedCodes.length} normalized files`);
  console.log(
    `[pricing:registry] assigned without generated data: ${report.assignedMissingGenerated.join(", ") || "none"}`
  );
  console.log(`[pricing:registry] report: ${reportOutputPath}`);
  console.log(`[pricing:registry] runtime registry: ${runtimeOutputPath}`);
}

main().catch((error) => {
  console.error(`[pricing:registry] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
