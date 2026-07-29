import "./loadEnv.mjs";

import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { writeDviArtifactAtomic, writeJsonAtomic } from "../lib/pricing/atomicJson.mjs";
import {
  generateDviPricingArtifacts,
} from "../lib/pricing/parseDviRawPriceFiles.mjs";
import { parsePositiveInteger, PricingProgress } from "../lib/pricing/progress.mjs";

const root = process.cwd();
const outputDir = path.join(root, "private-source", "pricing", "generated");
const scopeConfigPath = path.join(root, "config", "pricing-scope.json");
const args = new Set(process.argv.slice(2));
const profile = args.has("--profile");
const validateOnly = args.has("--validate-only");
const overallTimeoutMs = parsePositiveInteger(
  process.env.PRICING_GENERATION_TIMEOUT_MS,
  30 * 60_000
);
const progress = new PricingProgress({
  prefix: "pricing:generate-dvi",
  profile,
});

function asUpperSet(values) {
  return new Set(
    (values ?? [])
      .map((value) => String(value).trim().toUpperCase())
      .filter(Boolean)
  );
}

function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

function buildAliasMap(rawAliasMap) {
  return new Map(
    Object.entries(rawAliasMap ?? {})
      .map(([from, to]) => [normalizeCode(from), normalizeCode(to)])
      .filter(([from, to]) => from && to)
  );
}

function resolveCodes(codes, aliasMap) {
  const resolved = [];
  for (const code of codes) {
    const via = aliasMap.get(code);
    resolved.push({
      requestedCode: code,
      resolvedCode: via || code,
      usedAlias: Boolean(via),
    });
  }
  return resolved;
}

async function readScopeConfig() {
  const raw = await readFile(scopeConfigPath, "utf8");
  return JSON.parse(raw);
}

async function writeReport(fileName, value, stage) {
  const filePath = path.join(outputDir, fileName);
  await progress.run(stage, () => writeJsonAtomic(filePath, value));
  return filePath;
}

async function buildScopedRelationshipReport(artifacts, scope) {
  const discovered = asUpperSet(artifacts.pricingManifest.priceListCodesFound);
  const payAttention = asUpperSet(scope.payAttention);
  const ignore = asUpperSet(scope.ignore);
  const includesAr = asUpperSet(Object.keys(scope.includesAR ?? {}));
  const includesFrames = asUpperSet(scope.includesFrames ?? []);
  const aliasMap = buildAliasMap(scope.aliasToDvi);

  const payAttentionResolved = resolveCodes([...payAttention].sort(), aliasMap);
  const includesArResolved = resolveCodes([...includesAr].sort(), aliasMap);
  const includesFramesResolved = resolveCodes([...includesFrames].sort(), aliasMap);
  const ignoreResolved = resolveCodes([...ignore].sort(), aliasMap);
  const payAttentionResolvedCodes = new Set(
    payAttentionResolved.map((item) => item.resolvedCode)
  );
  const ignoreResolvedCodes = new Set(
    ignoreResolved.map((item) => item.resolvedCode)
  );

  return {
    generatedAt: artifacts.pricingManifest.generatedAt,
    scopeConfigPath,
    dviDiscoveredCodes: [...discovered].sort(),
    payAttention: [...payAttention].sort(),
    ignore: [...ignore].sort(),
    aliasToDvi: Object.fromEntries(aliasMap),
    aliasNotes: scope.aliasNotes ?? [],
    payAttentionResolved,
    includesArResolved,
    includesFramesResolved,
    ignoreResolved,
    inScopeDiscovered: [...payAttentionResolvedCodes]
      .filter((code) => discovered.has(code))
      .sort(),
    inScopeMissingFromDvi: [...payAttentionResolvedCodes]
      .filter((code) => !discovered.has(code))
      .sort(),
    ignoredDiscovered: [...ignoreResolvedCodes]
      .filter((code) => discovered.has(code))
      .sort(),
    outOfScopeDiscovered: [...discovered]
      .filter(
        (code) =>
          !payAttentionResolvedCodes.has(code) && !ignoreResolvedCodes.has(code)
      )
      .sort(),
    includesAr: [...includesAr].sort().map((code) => ({
      code,
      resolvedCode: aliasMap.get(code) || code,
      ...scope.includesAR?.[code],
    })),
    includesFrames: [...includesFrames].sort().map((code) => ({
      code,
      resolvedCode: aliasMap.get(code) || code,
    })),
    packagePriceLists: (scope.packagePriceLists ?? []).map((code) =>
      normalizeCode(code)
    ),
    businessRulesByCode: scope.businessRulesByCode ?? {},
    defaultRules: {
      ar: "AR is additive unless listed in includesAR",
      frames: "Frames are not included unless listed in includesFrames",
    },
    notes: scope.notes ?? [],
  };
}

async function main() {
  if (!validateOnly) await mkdir(outputDir, { recursive: true });
  let writtenPriceLists = 0;

  const artifacts = await generateDviPricingArtifacts({
    progress,
    collectArtifacts: false,
    retainInspection: false,
    onArtifact: validateOnly
      ? undefined
      : async (code, payload, artifactProgress) => {
          const fileName = `dvi-${code.toLowerCase()}-pricing.json`;
          const outputPath = path.join(outputDir, fileName);
          let rowsWritten = 0;
          await progress.run(
            `write generated file ${code}`,
            () =>
              writeDviArtifactAtomic(outputPath, payload, {
                onRowsWritten: (processed) => {
                  rowsWritten = processed;
                },
              }),
            {
              getProgress: () => ({
                processed: rowsWritten,
                total: payload.rows.length,
              }),
            }
          );
          writtenPriceLists += 1;
          console.log(
            `[pricing:generate-dvi] file=${artifactProgress.index}/${artifactProgress.total} code=${code} path=${outputPath}`
          );
        },
  });

  if (artifacts.validationReport.errors.length > 0) {
    throw new Error(
      `DVI validation failed with ${artifacts.validationReport.errors.length} error(s).`
    );
  }

  if (validateOnly) {
    console.log(
      `[pricing:generate-dvi] validate-only complete files=${artifacts.pricingManifest.sourceFiles.length} rows=${artifacts.pricingManifest.recordCounts.normalizedRows} warnings=${artifacts.validationReport.warnings.length}`
    );
    progress.printProfile();
    return;
  }

  const scope = await progress.run("load pricing scope", () => readScopeConfig());
  const manifestPath = await writeReport(
    "pricing-manifest.json",
    artifacts.pricingManifest,
    "write pricing manifest"
  );
  const validationPath = await writeReport(
    "pricing-validation-report.json",
    artifacts.validationReport,
    "write validation report"
  );
  const relationshipPath = await writeReport(
    "dvi-relationship-report.json",
    artifacts.relationshipReport,
    "write relationship report"
  );
  const scopedRelationship = await progress.run(
    "build scoped relationship report",
    () => buildScopedRelationshipReport(artifacts, scope)
  );
  const scopedRelationshipPath = await writeReport(
    "dvi-scoped-relationship-report.json",
    scopedRelationship,
    "write scoped relationship report"
  );
  const listMetadata = artifacts.pricingManifest.codeSummaries.map((summary) => ({
    code: summary.code,
    label: summary.listName || `${summary.code} Price List`,
    source: "price.xml",
  }));
  await writeReport(
    "dvi-price-lists.json",
    {
      generatedAt: artifacts.pricingManifest.generatedAt,
      priceLists: listMetadata,
    },
    "write DVI price-list metadata"
  );

  console.log(
    `[pricing:generate-dvi] wrote ${writtenPriceLists} price list files to ${outputDir}`
  );
  console.log(`[pricing:generate-dvi] manifest: ${manifestPath}`);
  console.log(`[pricing:generate-dvi] validation: ${validationPath}`);
  console.log(`[pricing:generate-dvi] relationship report: ${relationshipPath}`);
  console.log(
    `[pricing:generate-dvi] scoped relationship report: ${scopedRelationshipPath}`
  );
  console.log(
    `[pricing:generate-dvi] price list codes: ${artifacts.pricingManifest.priceListCodesFound.join(
      ", "
    )}`
  );
  progress.printProfile();
}

async function runWithOverallTimeout(operation) {
  let timeoutHandle;
  const timeout = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new Error(
          `[overall generation] exceeded ${overallTimeoutMs}ms; aborting to prevent an indefinite build`
        )
      );
    }, overallTimeoutMs);
    timeoutHandle.unref?.();
  });
  try {
    return await Promise.race([operation(), timeout]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

runWithOverallTimeout(main).catch((error) => {
  console.error(
    `[pricing:generate-dvi] failed: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
  process.exit(1);
});
