import {
  downloadXmlPriceFile,
  parseDownloadedXmlPriceFile,
} from "../r2/getXmlPriceFile.mjs";
import { PricingProgress } from "./progress.mjs";

export const DVI_REQUIRED_FILES = [
  "price.xml",
  "styles.xml",
  "coats.xml",
  "edging.xml",
  "add.xml",
  "power.xml",
  "prism.xml",
  "tint.xml",
  "oversize.xml",
  "hardening.xml",
  "frame.xml",
];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(toText(value).replace(/[$,%\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function keyFor(plist, name) {
  return `${toText(plist).toUpperCase()}::${toText(name).toUpperCase()}`;
}

function normalizedCode(value) {
  return toText(value).toUpperCase();
}

function flattenListEntries(priceRoot) {
  return asArray(priceRoot.List).map((entry) => ({
    code: normalizedCode(entry.Code),
    type: toText(entry.Type),
    name: toText(entry.Name),
    plGroup: toText(entry.PlGroup),
    transpose: toText(entry.Transpose),
    framePriceList: toText(entry.FramePriceList),
    net: toText(entry.Net),
    postage: toText(entry.Postage),
    message: toText(entry.msg),
    raw: entry,
  }));
}

function makeScheduleMap(items, itemTag, childExtractor) {
  const rows = asArray(items[itemTag]).map((item) => {
    const plist = normalizedCode(item.PList);
    const name = toText(item.Name);
    const key = keyFor(plist, name);
    return {
      key,
      plist,
      name,
      desc: toText(item.Desc),
      attributes: item,
      entries: childExtractor(item),
    };
  });

  const byKey = new Map(rows.map((row) => [row.key, row]));
  return { rows, byKey };
}

function parseScheduleFiles(xml) {
  return {
    coats: makeScheduleMap(xml["coats.xml"].parsedRoot, "Cot", (item) =>
      asArray(item.Color)
    ),
    edging: makeScheduleMap(xml["edging.xml"].parsedRoot, "Edg", (item) =>
      asArray(item.ComponentPrice)
    ),
    add: makeScheduleMap(xml["add.xml"].parsedRoot, "Add", (item) =>
      asArray(item.ComponentPrice)
    ),
    power: makeScheduleMap(xml["power.xml"].parsedRoot, "Pow", (item) => ({
      components: asArray(item.Component),
      sphericalRanges: asArray(item.SphRanges?.Sph),
    })),
    prism: makeScheduleMap(xml["prism.xml"].parsedRoot, "Prs", (item) =>
      asArray(item.ComponentPrice)
    ),
    tint: makeScheduleMap(xml["tint.xml"].parsedRoot, "Tnt", (item) =>
      asArray(item.Color)
    ),
    oversize: makeScheduleMap(xml["oversize.xml"].parsedRoot, "Osz", (item) =>
      asArray(item.FrameSize)
    ),
    hardening: makeScheduleMap(xml["hardening.xml"].parsedRoot, "Hrd", (item) =>
      asArray(item.ComponentPrice)
    ),
    frame: makeScheduleMap(xml["frame.xml"].parsedRoot, "Frm", (item) => ({
      types: asArray(item.Type),
      materials: asArray(item.Material),
    })),
  };
}

function parseStyles(stylesRoot) {
  const materials = asArray(stylesRoot.Material);
  const rows = [];

  for (const material of materials) {
    const plist = normalizedCode(material.PList);
    const materialCode = toText(material.Code);
    const styleRows = asArray(material.Style);
    for (const style of styleRows) {
      rows.push({
        plist,
        materialCode,
        styleName: toText(style.Name),
        fin: toText(style.Fin),
        basePrice: toNumber(style.Sph),
        scheduleRefs: {
          power: toText(style.POW),
          oversize: toText(style.OSZ),
          coat: toText(style.COT),
          edging: toText(style.EDG),
          add: toText(style.ADD),
          prism: toText(style.PRS),
          tint: toText(style.TNT),
          hardening: toText(style.HRD),
          frame: toText(style.FRM),
        },
        colorCode: toText(style.COL),
        raw: style,
      });
    }
  }

  return rows;
}

function inferFinishingLogic(fin, edgingRef) {
  const upperFin = normalizedCode(fin);
  const upperEdg = normalizedCode(edgingRef);
  const uncutLikely = upperFin === "S";
  const edgedLikely = Boolean(upperEdg);
  return {
    finCode: upperFin,
    uncutLikely,
    edgedLikely,
    assembledLikely: edgedLikely,
  };
}

function collectUniquePLists({ lists, styles, schedules }) {
  const codes = new Set();
  for (const row of lists) codes.add(row.code);
  for (const row of styles) codes.add(row.plist);
  for (const schedule of Object.values(schedules)) {
    for (const row of schedule.rows) codes.add(row.plist);
  }
  return [...codes].filter(Boolean).sort();
}

function summarizeFile(file, itemTag) {
  const childItems = asArray(file.parsedRoot[itemTag]);
  const childNames = new Set();
  const attrNames = new Set();

  for (const child of childItems) {
    for (const [key, value] of Object.entries(child || {})) {
      if (value !== null && typeof value === "object") {
        childNames.add(key);
      } else {
        attrNames.add(key);
      }
    }
  }

  return {
    fileName: file.fileName,
    rootElement: file.rootName,
    primaryChildElement: itemTag,
    recordCount: childItems.length,
    childElementTypes: [...childNames].sort(),
    keyAttributes: [...attrNames].sort(),
    sha256: file.sha256,
    modifiedAt: file.modifiedAt,
    fileSizeBytes: file.fileSizeBytes,
  };
}

export async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let active = 0;
  let maximumActive = 0;

  async function runWorker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      try {
        results[index] = await worker(items[index], index);
      } finally {
        active -= 1;
      }
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return { results, maximumActive };
}

export async function inspectDviRawPriceFiles({
  concurrency = 3,
  downloadFile = downloadXmlPriceFile,
  parseFile = parseDownloadedXmlPriceFile,
  progress = new PricingProgress({ prefix: "pricing:dvi" }),
} = {}) {
  const { results: xmlEntries } = await mapWithConcurrency(
    DVI_REQUIRED_FILES,
    concurrency,
    async (fileName, index) => {
      let bytesDownloaded = 0;
      const downloaded = await progress.run(
        `download R2 XML ${fileName}`,
        async () => {
          const result = await downloadFile(fileName);
          bytesDownloaded = result.fileSizeBytes ?? Buffer.byteLength(result.xml ?? "");
          return result;
        },
        {
          getProgress: () => ({
            processed: bytesDownloaded,
            total: bytesDownloaded || undefined,
          }),
        }
      );
      const parsed = await progress.run(`parse XML ${fileName}`, () => parseFile(downloaded));
      delete parsed.xml;
      return [fileName, parsed, index];
    }
  );
  const xml = Object.fromEntries(xmlEntries);

  const priceLists = await progress.run("build price-list rows", () =>
    flattenListEntries(xml["price.xml"].parsedRoot)
  );
  const styles = await progress.run("build style rows", () =>
    parseStyles(xml["styles.xml"].parsedRoot)
  );
  const schedules = await progress.run("build schedule rows", () => parseScheduleFiles(xml));

  const fileInventory = [
    summarizeFile(xml["price.xml"], "List"),
    summarizeFile(xml["styles.xml"], "Material"),
    summarizeFile(xml["coats.xml"], "Cot"),
    summarizeFile(xml["edging.xml"], "Edg"),
    summarizeFile(xml["add.xml"], "Add"),
    summarizeFile(xml["power.xml"], "Pow"),
    summarizeFile(xml["prism.xml"], "Prs"),
    summarizeFile(xml["tint.xml"], "Tnt"),
    summarizeFile(xml["oversize.xml"], "Osz"),
    summarizeFile(xml["hardening.xml"], "Hrd"),
    summarizeFile(xml["frame.xml"], "Frm"),
  ];

  const codesFromPriceXml = new Set(priceLists.map((row) => row.code));
  const styleReferenceFieldCounts = Object.fromEntries(
    ["power", "oversize", "coat", "edging", "add", "prism", "tint", "hardening", "frame"].map((field) => [field, 0])
  );
  for (const row of styles) {
    for (const [field, value] of Object.entries(row.scheduleRefs)) {
      if (value) styleReferenceFieldCounts[field] += 1;
    }
  }

  const allCodes = collectUniquePLists({
    lists: priceLists,
    styles,
    schedules,
  });

  return {
    sourceDirectory: `r2://${xml["price.xml"].bucketName}/${xml["price.xml"].prefix}`,
    generatedAt: new Date().toISOString(),
    fileInventory,
    priceListCodes: {
      fromPriceXml: [...codesFromPriceXml].sort(),
      fromAllFiles: allCodes,
    },
    recordCounts: {
      priceLists: priceLists.length,
      styles: styles.length,
      scheduleRows: Object.fromEntries(
        Object.entries(schedules).map(([name, schedule]) => [name, schedule.rows.length])
      ),
    },
    relationshipHints: {
      styleKey: "PList + Material Code + Style Name",
      scheduleKey: "PList + Name",
      styleScheduleReferenceFields: styleReferenceFieldCounts,
      note:
        "Confirmed references from styles.xml fields: POW, OSZ, COT, EDG, ADD, PRS, TNT, HRD, FRM. Empty fields indicate no linked schedule for that style row.",
    },
    priceLists,
    styles,
    schedules,
  };
}

async function buildNormalizedRows({ styles, schedules, onProgress }) {
  const rows = [];
  const warnings = [];
  const missingRefCounters = {
    power: 0,
    oversize: 0,
    coats: 0,
    edging: 0,
    add: 0,
    prism: 0,
    tint: 0,
    hardening: 0,
    frame: 0,
  };

  function resolveSchedule(scheduleName, plist, ref) {
    const refName = toText(ref);
    if (!refName) return null;
    const key = keyFor(plist, refName);
    const schedule = schedules[scheduleName].byKey.get(key);
    if (!schedule) {
      missingRefCounters[scheduleName] += 1;
      warnings.push({
        type: "missing_schedule_reference",
        scheduleName,
        key,
        plist,
        refName,
      });
      return null;
    }
    return schedule;
  }

  for (let index = 0; index < styles.length; index += 1) {
    const style = styles[index];
    const resolved = {
      power: resolveSchedule("power", style.plist, style.scheduleRefs.power),
      oversize: resolveSchedule("oversize", style.plist, style.scheduleRefs.oversize),
      coat: resolveSchedule("coats", style.plist, style.scheduleRefs.coat),
      edging: resolveSchedule("edging", style.plist, style.scheduleRefs.edging),
      add: resolveSchedule("add", style.plist, style.scheduleRefs.add),
      prism: resolveSchedule("prism", style.plist, style.scheduleRefs.prism),
      tint: resolveSchedule("tint", style.plist, style.scheduleRefs.tint),
      hardening: resolveSchedule("hardening", style.plist, style.scheduleRefs.hardening),
      frame: resolveSchedule("frame", style.plist, style.scheduleRefs.frame),
    };

    rows.push({
      priceListCode: style.plist,
      productStyleCode: style.styleName,
      productStyleDescription: style.styleName,
      materialCode: style.materialCode,
      materialLensType: style.materialCode,
      basePrice: style.basePrice,
      basePriceRawField: "Sph",
      finishingLogic: inferFinishingLogic(style.fin, style.scheduleRefs.edging),
      scheduleRefs: {
        power: style.scheduleRefs.power,
        oversize: style.scheduleRefs.oversize,
        coating: style.scheduleRefs.coat,
        edging: style.scheduleRefs.edging,
        addOn: style.scheduleRefs.add,
        prism: style.scheduleRefs.prism,
        tint: style.scheduleRefs.tint,
        hardening: style.scheduleRefs.hardening,
        frame: style.scheduleRefs.frame,
      },
      linkedSchedules: {
        power: resolved.power?.entries ?? null,
        oversize: resolved.oversize?.entries ?? null,
        coating: resolved.coat?.entries ?? null,
        edging: resolved.edging?.entries ?? null,
        addOn: resolved.add?.entries ?? null,
        prism: resolved.prism?.entries ?? null,
        tint: resolved.tint?.entries ?? null,
        hardening: resolved.hardening?.entries ?? null,
        frame: resolved.frame?.entries ?? null,
      },
      sourceRefs: {
        styleRow: style.raw,
        styleMaterial: {
          plist: style.plist,
          materialCode: style.materialCode,
        },
      },
    });

    if ((index + 1) % 5_000 === 0) {
      onProgress?.(index + 1, styles.length);
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
  onProgress?.(styles.length, styles.length);

  return {
    rows,
    warnings,
    missingRefCounters,
  };
}

function buildWarningsAndValidation({ inspection, normalizedWarnings, styleKeys }) {
  const warnings = [...normalizedWarnings];
  const errors = [];

  const codesInPriceXml = new Set(inspection.priceLists.map((row) => row.code));
  const codesInSchedules = new Set();
  for (const schedule of Object.values(inspection.schedules)) {
    for (const row of schedule.rows) codesInSchedules.add(row.plist);
  }

  for (const code of [...codesInSchedules].sort()) {
    if (!codesInPriceXml.has(code)) {
      warnings.push({
        type: "schedule_code_missing_from_price_xml",
        code,
      });
    }
  }

  for (const [scheduleName, schedule] of Object.entries(inspection.schedules)) {
    for (const row of schedule.rows) {
      const looksLikeStyleBound =
        /^([A-Z~0-9\-_]{2,})$/i.test(row.name) &&
        !["001", "P01", "PO1", "B01", "G01", "V01", "E01", "E02", "E03", "E04", "N01", "BPE"].includes(
          row.name.toUpperCase()
        );
      if (looksLikeStyleBound && !styleKeys.has(keyFor(row.plist, row.name))) {
        warnings.push({
          type: "orphaned_schedule_candidate",
          scheduleName,
          plist: row.plist,
          name: row.name,
        });
      }
    }
  }

  return { warnings, errors };
}

export async function generateDviPricingArtifacts({
  progress = new PricingProgress({ prefix: "pricing:dvi" }),
  inspectionOptions = {},
  onArtifact,
  collectArtifacts = true,
  retainInspection = true,
} = {}) {
  const inspection = await inspectDviRawPriceFiles({
    ...inspectionOptions,
    progress,
  });
  const groupedStyles = new Map();
  const styleKeys = new Set();
  let groupedCount = 0;

  await progress.run(
    "group rows by price-list code",
    async () => {
      for (let index = 0; index < inspection.styles.length; index += 1) {
        const style = inspection.styles[index];
        if (!groupedStyles.has(style.plist)) groupedStyles.set(style.plist, []);
        groupedStyles.get(style.plist).push(style);
        styleKeys.add(keyFor(style.plist, style.styleName));
        groupedCount = index + 1;
        if (groupedCount % 10_000 === 0) {
          await new Promise((resolve) => setImmediate(resolve));
        }
      }
    },
    {
      getProgress: () => ({
        processed: groupedCount,
        total: inspection.styles.length,
      }),
    }
  );

  const priceListByCode = new Map(
    inspection.priceLists.map((priceList) => [priceList.code, priceList])
  );
  const codeSummaries = [...groupedStyles.entries()]
    .map(([code, styles]) => ({
      code,
      rowCount: styles.length,
      listName: priceListByCode.get(code)?.name || "",
      source: priceListByCode.has(code)
        ? "price.xml"
        : "derived-from-styles-or-schedules",
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  if (!retainInspection) inspection.styles = [];

  const artifactsByCode = {};
  const normalizedWarnings = [];
  const missingScheduleReferenceCounts = {
    power: 0,
    oversize: 0,
    coats: 0,
    edging: 0,
    add: 0,
    prism: 0,
    tint: 0,
    hardening: 0,
    frame: 0,
  };
  let normalizedRowCount = 0;

  for (let codeIndex = 0; codeIndex < codeSummaries.length; codeIndex += 1) {
    const summary = codeSummaries[codeIndex];
    const styles = groupedStyles.get(summary.code) ?? [];
    let processed = 0;
    const normalizedRows = await progress.run(
      `build normalized rows ${summary.code}`,
      () =>
        buildNormalizedRows({
          styles,
          schedules: inspection.schedules,
          onProgress: (current) => {
            processed = current;
          },
        }),
      {
        getProgress: () => ({ processed, total: styles.length }),
      }
    );
    normalizedRowCount += normalizedRows.rows.length;
    normalizedWarnings.push(...normalizedRows.warnings);
    for (const [name, count] of Object.entries(normalizedRows.missingRefCounters)) {
      missingScheduleReferenceCounts[name] += count;
    }

    if (collectArtifacts || onArtifact) {
      const payload = {
        code: summary.code,
        listName: priceListByCode.get(summary.code)?.name || summary.code,
        rows: normalizedRows.rows,
        scheduleCatalog: {
          coating: inspection.schedules.coats.rows.filter(
            (row) => row.plist === summary.code
          ),
          addOn: inspection.schedules.add.rows.filter(
            (row) => row.plist === summary.code
          ),
        },
        generatedAt: inspection.generatedAt,
        source: "DVI raw XML",
      };

      if (onArtifact) {
        await onArtifact(summary.code, payload, {
          index: codeIndex + 1,
          total: codeSummaries.length,
        });
      }
      if (collectArtifacts) artifactsByCode[summary.code] = payload;
    }
    groupedStyles.delete(summary.code);
  }

  const { warnings, errors } = await progress.run("validate DVI relationships", () =>
    buildWarningsAndValidation({
      inspection,
      normalizedWarnings,
      styleKeys,
    })
  );
  styleKeys.clear();

  return {
    inspection,
    artifactsByCode,
    pricingManifest: {
      generatedAt: inspection.generatedAt,
      sourceDirectory: inspection.sourceDirectory,
      sourceFiles: inspection.fileInventory.map((file) => ({
        fileName: file.fileName,
        modifiedAt: file.modifiedAt,
        sha256: file.sha256,
        fileSizeBytes: file.fileSizeBytes,
      })),
      priceListCodesFound: codeSummaries.map((item) => item.code),
      codeSummaries,
      recordCounts: {
        styleRows: inspection.recordCounts.styles,
        normalizedRows: normalizedRowCount,
      },
      skippedRecords: {
        missingRequiredFields: 0,
      },
      warningsCount: warnings.length,
      errorsCount: errors.length,
    },
    validationReport: {
      generatedAt: inspection.generatedAt,
      status: errors.length > 0 ? "failed" : "warning",
      warnings,
      errors,
      missingScheduleReferenceCounts,
      notes: [
        "Warnings do not fail generation in this first-pass DVI parser.",
        "Missing required files or malformed XML fail hard before this report is produced.",
      ],
    },
    relationshipReport: {
      generatedAt: inspection.generatedAt,
      styleReferenceFields: inspection.relationshipHints.styleScheduleReferenceFields,
      scheduleKey: inspection.relationshipHints.scheduleKey,
      styleKey: inspection.relationshipHints.styleKey,
      discoveredPriceListCodes: inspection.priceListCodes.fromAllFiles,
    },
  };
}
