export function normalizeLookupKey(value) {
  return toText(value)
    .toUpperCase()
    .replace(/\*/g, "")
    .replace(/[™®]/g, "")
    .replace(/\s+(?:★|➜)$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(toText(value).replace(/[$,%\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildProductLookup(rows) {
  const lookup = new Map();

  function addAlias(rawName, value, overwrite = false) {
    const key = normalizeLookupKey(rawName);
    if (!key) return;
    if (overwrite || !lookup.has(key)) lookup.set(key, value);
  }

  function productAliases(rawName) {
    const key = normalizeLookupKey(rawName);
    const aliases = new Set([key]);
    aliases.add(key.replace(/\s+-\s+CLE$/, ""));
    aliases.add(key.replace(/\s+(?:VL|FT|BKS)$/, ""));
    aliases.add(key.replace(/\s+\d+(?:\s+-\s+CLE)?$/, ""));
    aliases.add(key.replace(/\s+(?:W)\s+\d+$/, " W"));
    aliases.add(key.replace(/\s+\d+\s+(?:W)$/, " W"));
    aliases.add(key.replace(/\s+\d+\s*\/\s*\d+$/, ""));
    return [...aliases].filter(Boolean);
  }

  for (const row of rows) {
    const rawName = toText(row.lenstyle ?? row[0]);
    if (!rawName) continue;
    const value = {
      designStyle: toText(row.styleconsollidated ?? row[1]) || rawName,
      designType: toText(row["Type Revised"] ?? row[3]) || "",
      brand: toText(row.lensbrand ?? row[5]) || "",
    };

    addAlias(rawName, value, true);
    for (const alias of productAliases(rawName)) addAlias(alias, value);
  }

  return lookup;
}

export function buildMaterialLookup(rows) {
  const lookup = new Map();

  for (const row of rows) {
    const rawMaterial = toText(row.lensmat ?? row[0]);
    if (!rawMaterial) continue;

    lookup.set(normalizeLookupKey(rawMaterial), {
      material: toText(row["Material Name"] ?? row[1]) || rawMaterial,
      materialColor: toText(row["Material Color"] ?? row[2]),
      colorBrand: toText(row["Material Color Brand"] ?? row[3]),
      photochromic: toText(row.Photochromic ?? row[6]),
      polarized: toText(row.Polarized ?? row[7]),
    });
  }

  return lookup;
}

export function buildColorLookup(text) {
  const lookup = new Map();
  const lines = text.split(/\r?\n/).slice(1);

  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^\s*(\S+)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*$/);
    if (!match) continue;

    const [, code, description, transmittance] = match;
    const cleanDescription = description.trim().replace(/\s+/g, " ");
    lookup.set(normalizeLookupKey(code), {
      color: cleanDescription,
      colorBrand: colorBrandFromDescription(code, cleanDescription),
      transmittance: Number(transmittance),
    });
  }

  return lookup;
}

export function cleanDisplayValue(value) {
  return toText(value)
    .replace(/CLEARCLR/gi, "Clear")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCaseColor(value) {
  const text = cleanDisplayValue(value);
  if (!text) return "";
  if (normalizeLookupKey(text) === "CLR" || normalizeLookupKey(text) === "CLEAR") return "Clear";
  return text
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bUv\b/g, "UV")
    .replace(/\bLtL\b/g, "LTL");
}

export function colorBrandFromDescription(code, description) {
  const normalizedCode = normalizeLookupKey(code);
  const normalizedDescription = normalizeLookupKey(description);

  if (normalizedCode === "CLR" || normalizedCode === "CLEAR") return "Clear";
  if (normalizedCode === "NCG" || normalizedCode === "NCB") return "Neochromes";
  if (normalizedDescription.includes("NEOCHROMES")) return "Neochromes";
  if (normalizedDescription.includes("TRANSITIONS") || /^X[A-Z0-9]/.test(normalizedCode)) return "Transitions";
  if (normalizedDescription.includes("XTRACTIVE") || normalizedCode.startsWith("X")) return "Transitions";
  if (normalizedDescription.includes("SENSITY")) return "Sensity";
  if (normalizedDescription.includes("SUNSYNC")) return "SunSync";
  if (normalizedDescription.includes("BLUTECH")) return "Blutech";
  if (normalizedDescription.includes("COLORMATIC")) return "ColorMatic";
  if (normalizedDescription.includes("COPPERTONE")) return "Coppertone";
  if (normalizedDescription.includes("DRIVEWEAR")) return "Transitions";
  if (normalizedDescription.includes("PHOTO")) return "Standard Color";
  if (normalizedDescription.includes("POLAR")) return "Standard Color";
  if (normalizedDescription.includes("MIRROR")) return "Standard Color";

  return "Standard Color";
}
