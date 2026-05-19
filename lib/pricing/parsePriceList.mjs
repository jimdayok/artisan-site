import { readFile } from "node:fs/promises";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import {
  buildColorLookup,
  buildMaterialLookup,
  buildProductLookup,
  normalizeLookupKey,
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
  const unmappedProducts = new Set();
  const unmappedMaterials = new Set();
  const unmappedColors = new Set();

  for (const rawRow of rawRows.slice(1)) {
    const rowCode = toText(rawRow[indexes.code]).toUpperCase();
    if (rowCode !== config.code) continue;

    const productNameRaw = toText(rawRow[indexes.product]);
    const materialRaw = toText(rawRow[indexes.material]);
    const colorRaw = toText(rawRow[indexes.color]);
    const product = productLookup.get(normalizeLookupKey(productNameRaw));
    const material = materialLookup.get(normalizeLookupKey(materialRaw));
    const color = colorLookup.get(normalizeLookupKey(colorRaw));
    const edgedPrice = toNumber(rawRow[indexes.sphere]);
    const uncutDeduct = toNumber(rawRow[indexes.deduct]);

    if (!product && productNameRaw) unmappedProducts.add(productNameRaw);
    if (!material && materialRaw) unmappedMaterials.add(materialRaw);
    if (!color && colorRaw) unmappedColors.add(colorRaw);

    rows.push({
      code: config.code,
      brand: product?.brand || "Unmapped",
      productNameRaw,
      productName: product?.productName || productNameRaw,
      materialRaw,
      material: material?.material || materialRaw,
      colorRaw,
      color: color?.color || colorRaw,
      edgedPrice,
      uncutDeduct,
      uncutPrice: Number((edgedPrice - uncutDeduct).toFixed(2)),
    });
  }

  return {
    code: config.code,
    rows,
    report: {
      sourceFiles: [
        config.rawPath,
        config.productLookupPath,
        config.materialLookupPath,
        config.colorLookupPath,
      ],
      rowCount: rows.length,
      generatedAt: new Date().toISOString(),
      rawColumns: rawHeaders.filter(Boolean),
      mappedColumns,
      ignoredColumns: rawHeaders.filter(
        (header) => header && !mappedColumns.includes(header)
      ),
      unmappedProducts: [...unmappedProducts].sort(),
      unmappedMaterials: [...unmappedMaterials].sort(),
      unmappedColors: [...unmappedColors].sort(),
      assumptions: [
        "Raw Style is the product/design key for Lookup.xlsx lenstyle.",
        "Lookup.xlsx styleconsollidated is the customer-facing product/design label.",
        "Lookup.xlsx lensbrand is the customer-facing brand.",
        "Raw Mat is the material key for Lookup_Mat.xlsx lensmat.",
        "Lookup_Mat.xlsx Material Name is the customer-facing material label.",
        "Raw Color is normalized from colors.txt by color code.",
        "Sphere is the edged and assembled price.",
        "Uncut is calculated as Sphere minus Deduct.",
      ],
    },
  };
}
