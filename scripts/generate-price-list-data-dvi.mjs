import "./loadEnv.mjs";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateDviPricingArtifacts } from "../lib/pricing/parseDviRawPriceFiles.mjs";

const root = process.cwd();
const outputDir = path.join(root, "private-source", "pricing", "generated");
const scopeConfigPath = path.join(root, "private-source", "pricing", "config", "pricing-scope.json");

function asUpperSet(values) {
  return new Set((values ?? []).map((value) => String(value).trim().toUpperCase()).filter(Boolean));
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

async function main() {
  const artifacts = await generateDviPricingArtifacts();
  await mkdir(outputDir, { recursive: true });
  const scope = await readScopeConfig();

  const codeEntries = Object.entries(artifacts.artifactsByCode);
  for (const [code, payload] of codeEntries) {
    const fileName = `dvi-${code.toLowerCase()}-pricing.json`;
    const outputPath = path.join(outputDir, fileName);
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  }

  const manifestPath = path.join(outputDir, "pricing-manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(artifacts.pricingManifest, null, 2)}\n`, "utf8");

  const validationPath = path.join(outputDir, "pricing-validation-report.json");
  await writeFile(validationPath, `${JSON.stringify(artifacts.validationReport, null, 2)}\n`, "utf8");

  const relationshipPath = path.join(outputDir, "dvi-relationship-report.json");
  await writeFile(relationshipPath, `${JSON.stringify(artifacts.relationshipReport, null, 2)}\n`, "utf8");

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

  const payAttentionResolvedCodes = new Set(payAttentionResolved.map((item) => item.resolvedCode));
  const ignoreResolvedCodes = new Set(ignoreResolved.map((item) => item.resolvedCode));

  const inScopeDiscovered = [...payAttentionResolvedCodes].filter((code) => discovered.has(code)).sort();
  const inScopeMissingFromDvi = [...payAttentionResolvedCodes].filter((code) => !discovered.has(code)).sort();
  const ignoredDiscovered = [...ignoreResolvedCodes].filter((code) => discovered.has(code)).sort();
  const outOfScopeDiscovered = [...discovered]
    .filter((code) => !payAttentionResolvedCodes.has(code) && !ignoreResolvedCodes.has(code))
    .sort();

  const scopedRelationshipPath = path.join(outputDir, "dvi-scoped-relationship-report.json");
  await writeFile(
    scopedRelationshipPath,
    `${JSON.stringify(
      {
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
        inScopeDiscovered,
        inScopeMissingFromDvi,
        ignoredDiscovered,
        outOfScopeDiscovered,
        includesAr: [...includesAr].sort().map((code) => ({
          code,
          resolvedCode: aliasMap.get(code) || code,
          ...scope.includesAR?.[code],
        })),
        includesFrames: [...includesFrames].sort().map((code) => ({
          code,
          resolvedCode: aliasMap.get(code) || code,
        })),
        packagePriceLists: (scope.packagePriceLists ?? []).map((code) => normalizeCode(code)),
        businessRulesByCode: scope.businessRulesByCode ?? {},
        defaultRules: {
          ar: "AR is additive unless listed in includesAR",
          frames: "Frames are not included unless listed in includesFrames",
        },
        notes: scope.notes ?? [],
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const metadataPath = path.join(outputDir, "dvi-price-lists.json");
  const listMetadata = artifacts.pricingManifest.codeSummaries.map((summary) => ({
    code: summary.code,
    label: summary.listName || `${summary.code} Price List`,
    source: "price.xml",
  }));
  await writeFile(metadataPath, `${JSON.stringify({
    generatedAt: artifacts.pricingManifest.generatedAt,
    priceLists: listMetadata,
  }, null, 2)}\n`, "utf8");

  console.log(`[pricing:generate-dvi] wrote ${codeEntries.length} price list files to ${outputDir}`);
  console.log(`[pricing:generate-dvi] manifest: ${manifestPath}`);
  console.log(`[pricing:generate-dvi] validation: ${validationPath}`);
  console.log(`[pricing:generate-dvi] relationship report: ${relationshipPath}`);
  console.log(`[pricing:generate-dvi] scoped relationship report: ${scopedRelationshipPath}`);
  console.log(`[pricing:generate-dvi] price list codes: ${artifacts.pricingManifest.priceListCodesFound.join(", ")}`);
}

main().catch((error) => {
  console.error(`[pricing:generate-dvi] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
