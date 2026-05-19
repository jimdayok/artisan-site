import { readFile } from "node:fs/promises";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import {
  buildColorLookup,
  buildMaterialLookup,
  buildProductLookup,
  cleanDisplayValue,
  normalizeLookupKey,
  titleCaseColor,
  toNumber,
  toText,
} from "./priceListLookups.mjs";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function columnIndex(cellRef) {
  const letters = String(cellRef || "A").match(/[A-Z]+/i)?.[0] || "A";
  return [...letters.toUpperCase()].reduce(
    (total, letter) => total * 26 + letter.charCodeAt(0) - 64,
    0
  ) - 1;
}

function sharedStringText(sharedString) {
  if (!sharedString) return "";
  if (sharedString.t !== undefined && typeof sharedString.t !== "object") {
    return toText(sharedString.t);
  }
  if (sharedString.t?.text) return sharedString.t.text;

  return asArray(sharedString.r)
    .map((run) => (typeof run.t === "string" ? run.t : run.t?.text || ""))
    .join("");
}

async function readXlsxRows(filePath) {
  const zip = await JSZip.loadAsync(await readFile(filePath));
  const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("text");
  const sharedStrings = sharedStringsXml
    ? asArray(parser.parse(sharedStringsXml).sst?.si).map(sharedStringText)
    : [];
  const sheetXml = await zip.file("xl/worksheets/sheet1.xml")?.async("text");

  if (!sheetXml) {
    throw new Error(`No first worksheet found in ${filePath}`);
  }

  const sheet = parser.parse(sheetXml).worksheet;
  const rows = asArray(sheet.sheetData?.row);

  return rows.map((row) => {
    const output = [];
    for (const cell of asArray(row.c)) {
      const index = columnIndex(cell.r);
      let value = "";

      if (cell.t === "s") {
        value = sharedStrings[Number(cell.v)] ?? "";
      } else if (cell.t === "inlineStr") {
        value = sharedStringText(cell.is);
      } else if (cell.v !== undefined) {
        value = cell.v;
      }

      output[index] = toText(value);
    }

    return output;
  });
}

function rowsToObjects(rows) {
  const headers = rows[0] || [];

  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function requiredHeaderIndex(headers, name) {
  const index = headers.findIndex(
    (header) => normalizeLookupKey(header) === normalizeLookupKey(name)
  );
  if (index < 0) throw new Error(`Missing required column: ${name}`);
  return index;
}

function slug(value) {
  return normalizeLookupKey(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rowCompleteness(row) {
  return [
    row.brand,
    row.designType,
    row.designStyle,
    row.material,
    row.materialColor,
    row.colorBrand,
  ].filter((value) => value && value !== "Unmapped").length;
}

function mergeRow(current, next) {
  return {
    ...current,
    rawProductNames: [
      ...new Set([...current.rawProductNames, ...next.rawProductNames]),
    ].sort(),
    sourceCodes: [...new Set([...current.sourceCodes, ...next.sourceCodes])].sort(),
    colorRaw: [...new Set([...current.colorRaw, ...next.colorRaw])].sort(),
    availableColors: [
      ...new Set([...current.availableColors, ...next.availableColors]),
    ].sort(),
    serviceNotes: [...new Set([...current.serviceNotes, ...next.serviceNotes])].sort(),
    recommended: current.recommended || next.recommended,
    outsourced: current.outsourced || next.outsourced,
    duplicateSourceRows: current.duplicateSourceRows + next.duplicateSourceRows,
  };
}

function normalizeColorBrand(material, color, rawColor) {
  const materialBrand = cleanDisplayValue(material?.colorBrand || "");
  const colorBrand = cleanDisplayValue(color?.colorBrand || "");
  const raw = normalizeLookupKey(rawColor);

  if (raw === "CLR" || raw === "CLEAR" || colorBrand === "Clear") return "Clear";
  if (raw === "NCG" || raw === "NCB") return "Neochromes";
  if (materialBrand && materialBrand !== "Other Photo") return materialBrand;
  if (colorBrand && !["Photochromic", "Polarized", "Mirror"].includes(colorBrand)) return colorBrand;
  if (materialBrand === "Other Photo") return "Standard Color";
  return colorBrand || "Standard Color";
}

function normalizeMaterialColor(material, color, rawColor) {
  const materialColor = cleanDisplayValue(material?.materialColor || "");
  const normalizedMaterialColor = normalizeLookupKey(materialColor);
  const raw = normalizeLookupKey(rawColor);
  const colorBrand = color?.colorBrand || "";

  if (["CLEAR", "PHOTOCHROMIC", "POLARIZED"].includes(normalizedMaterialColor)) {
    return materialColor;
  }
  if (raw === "CLR" || raw === "CLEAR") return "Clear";
  if (material?.polarized?.toUpperCase() === "YES" || colorBrand === "Polarized") return "Polarized";
  if (material?.photochromic?.toUpperCase() === "YES" || ["Transitions", "Sensity", "SunSync", "Neochromes", "Photochromic"].includes(colorBrand)) return "Photochromic";
  return "Clear";
}

function serviceNotesForRow({ rawProduct, recommended, outsourced }) {
  const notes = [];
  if (recommended) notes.push("Recommended for Best Service");
  if (outsourced) notes.push("Outsourced Product");
  if (/\*/.test(rawProduct)) notes.push("Source product included a trailing availability marker.");
  return notes;
}

export async function parsePriceList(config) {
  const rawRows = await readXlsxRows(config.rawPath);
  const productRows = rowsToObjects(await readXlsxRows(config.productLookupPath));
  const materialRows = rowsToObjects(await readXlsxRows(config.materialLookupPath));
  const colorText = await readFile(config.colorLookupPath, "utf8");
  const rawHeaders = rawRows[0] || [];
  const productLookup = buildProductLookup(productRows);
  const materialLookup = buildMaterialLookup(materialRows);
  const colorLookup = buildColorLookup(colorText);
  const indexes = {
    code: requiredHeaderIndex(rawHeaders, "PL"),
    material: requiredHeaderIndex(rawHeaders, "Mat"),
    product: requiredHeaderIndex(rawHeaders, "Style"),
    color: requiredHeaderIndex(rawHeaders, "Color"),
    sphere: requiredHeaderIndex(rawHeaders, "Sphere"),
    deduct: requiredHeaderIndex(rawHeaders, "Deduct"),
  };
  const mappedColumns = ["PL", "Mat", "Style", "Color", "Sphere", "Deduct"];
  const rows = [];
  const normalizedRows = new Map();
  const unmappedProducts = new Set();
  const unmappedMaterials = new Set();
  const unmappedColors = new Set();
  const duplicatePriceConflicts = [];
  const comboPrices = new Map();
  let rawSourceRowsProcessed = 0;

  for (const rawRow of rawRows.slice(1)) {
    const rowCode = toText(rawRow[indexes.code]).toUpperCase();
    if (rowCode !== config.code) continue;
    rawSourceRowsProcessed += 1;

    const productNameRaw = toText(rawRow[indexes.product]);
    const materialRaw = toText(rawRow[indexes.material]);
    const colorRaw = toText(rawRow[indexes.color]);
    const product = productLookup.get(normalizeLookupKey(productNameRaw));
    const material = materialLookup.get(normalizeLookupKey(materialRaw));
    const color = colorLookup.get(normalizeLookupKey(colorRaw));
    const edgedPrice = toNumber(rawRow[indexes.sphere]);
    const uncutDeduct = toNumber(rawRow[indexes.deduct]);
    const designStyle = cleanDisplayValue(product?.designStyle || productNameRaw);
    const designType = cleanDisplayValue(product?.designType || "Unmapped");
    const brand = cleanDisplayValue(product?.brand || "Commodity");
    const normalizedMaterial = cleanDisplayValue(material?.material || materialRaw);
    const materialColor = normalizeMaterialColor(material, color, colorRaw);
    const colorBrand = normalizeColorBrand(material, color, colorRaw);
    const availableColor = titleCaseColor(color?.color || colorRaw);
    const recommended = /★/.test(productNameRaw);
    const outsourced = /➜/.test(productNameRaw);
    const candidate = {
      code: config.code,
      id: "",
      brand,
      designType,
      designStyle,
      rawProductNames: [productNameRaw].filter(Boolean),
      sourceCodes: [rowCode, materialRaw].filter(Boolean),
      materialRaw,
      material: normalizedMaterial,
      materialColor,
      colorRaw: [colorRaw].filter(Boolean),
      availableColors: [availableColor].filter(Boolean),
      colorBrand,
      edgedPrice,
      uncutDeduct,
      uncutPrice: Number((edgedPrice - uncutDeduct).toFixed(2)),
      recommended,
      outsourced,
      serviceNotes: serviceNotesForRow({ rawProduct: productNameRaw, recommended, outsourced }),
      duplicateSourceRows: 1,
    };
    candidate.id = slug([
      candidate.code,
      candidate.designType,
      candidate.designStyle,
      candidate.brand,
      candidate.material,
      candidate.materialColor,
      candidate.colorBrand,
      candidate.edgedPrice,
      candidate.uncutDeduct,
    ].join(" "));
    const key = [
      normalizeLookupKey(candidate.designType),
      normalizeLookupKey(candidate.designStyle),
      normalizeLookupKey(candidate.brand),
      normalizeLookupKey(candidate.material),
      normalizeLookupKey(candidate.materialColor),
      normalizeLookupKey(candidate.colorBrand),
      candidate.edgedPrice,
      candidate.uncutDeduct,
    ].join("|");
    const comboKey = [
      normalizeLookupKey(candidate.designType),
      normalizeLookupKey(candidate.designStyle),
      normalizeLookupKey(candidate.brand),
      normalizeLookupKey(candidate.material),
      normalizeLookupKey(candidate.materialColor),
      normalizeLookupKey(candidate.colorBrand),
    ].join("|");
    const priceKey = `${candidate.edgedPrice}/${candidate.uncutDeduct}`;
    if (!comboPrices.has(comboKey)) comboPrices.set(comboKey, new Set());
    comboPrices.get(comboKey).add(priceKey);

    if (!product && productNameRaw) unmappedProducts.add(productNameRaw);
    if (!material && materialRaw) unmappedMaterials.add(materialRaw);
    if (!color && colorRaw) unmappedColors.add(colorRaw);

    const existing = normalizedRows.get(key);
    if (!existing) {
      normalizedRows.set(key, candidate);
      continue;
    }

    if (
      existing.edgedPrice === candidate.edgedPrice &&
      existing.uncutDeduct === candidate.uncutDeduct &&
      existing.uncutPrice === candidate.uncutPrice
    ) {
      normalizedRows.set(key, mergeRow(existing, candidate));
      continue;
    }

    normalizedRows.set(key, rowCompleteness(candidate) > rowCompleteness(existing) ? mergeRow(candidate, existing) : mergeRow(existing, candidate));
  }

  for (const [comboKey, prices] of comboPrices) {
    if (prices.size > 1) duplicatePriceConflicts.push(`${comboKey}: ${[...prices].join(", ")}`);
  }

  rows.push(
    ...[...normalizedRows.values()].sort(
      (a, b) =>
        a.brand.localeCompare(b.brand) ||
        a.designType.localeCompare(b.designType) ||
        a.designStyle.localeCompare(b.designStyle) ||
        a.material.localeCompare(b.material) ||
        a.materialColor.localeCompare(b.materialColor) ||
        a.colorBrand.localeCompare(b.colorBrand)
    )
  );

  return {
    code: config.code,
    rows,
    arCoatings: config.arCoatings || [],
    report: {
      sourceFiles: [
        config.rawPath,
        config.productLookupPath,
        config.materialLookupPath,
        config.colorLookupPath,
      ],
      rowCount: rows.length,
      rawSourceRowsProcessed,
      generatedAt: new Date().toISOString(),
      rawColumns: rawHeaders.filter(Boolean),
      mappedColumns,
      ignoredColumns: rawHeaders.filter(
        (header) => header && !mappedColumns.includes(header)
      ),
      unmappedProducts: [...unmappedProducts].sort(),
      unmappedMaterials: [...unmappedMaterials].sort(),
      unmappedColors: [...unmappedColors].sort(),
      duplicatePriceConflictCount: duplicatePriceConflicts.length,
      duplicatePriceConflicts: duplicatePriceConflicts.slice(0, 500),
      colorVariantsCollapsedCount: rawSourceRowsProcessed - rows.length,
      assumptions: [
        "Raw Style is the product/design key for Lookup.xlsx lenstyle.",
        "Lookup.xlsx styleconsollidated is the customer-facing product/design label.",
        "Lookup.xlsx Type Revised is displayed as Design Type.",
        "Lookup.xlsx lensbrand is the customer-facing brand.",
        "Raw Mat is the material key for Lookup_Mat.xlsx lensmat.",
        "Lookup_Mat.xlsx Material Name is the customer-facing material label.",
        "Lookup_Mat.xlsx Material Color is displayed as Material Color.",
        "Lookup_Mat.xlsx Material Color Brand is preferred for Color Brand, with colors.txt used when the material lookup is blank.",
        "Sphere is the edged and assembled price.",
        "Uncut is calculated as Sphere minus Deduct.",
        "Duplicate normalized rows with identical prices are collapsed and retain their raw source names for expanded detail.",
      ],
    },
  };
}
