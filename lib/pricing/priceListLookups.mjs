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

  for (const row of rows) {
    const rawName = toText(row.lenstyle ?? row[0]);
    if (!rawName) continue;

    lookup.set(normalizeLookupKey(rawName), {
      designStyle: toText(row.styleconsollidated ?? row[1]) || rawName,
      designType: toText(row["Type Revised"] ?? row[3]) || "",
      brand: toText(row.lensbrand ?? row[5]) || "",
    });
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

export function colorBrandFromDescription(code, description) {
  const normalizedCode = normalizeLookupKey(code);
  const normalizedDescription = normalizeLookupKey(description);

  if (normalizedCode === "CLR" || normalizedCode === "CLEAR") return "Clear";
  if (normalizedCode === "NCG" || normalizedCode === "NCB") return "Neochromes";
  if (normalizedDescription.includes("NEOCHROMES")) return "Neochromes";
  if (normalizedDescription.includes("TRANSITIONS") || /^X[A-Z0-9]/.test(normalizedCode)) return "Transitions";
  if (normalizedDescription.includes("SENSITY")) return "Sensity";
  if (normalizedDescription.includes("SUNSYNC")) return "SunSync";
  if (normalizedDescription.includes("COLORMATIC")) return "ColorMatic";
  if (normalizedDescription.includes("COPPERTONE")) return "Coppertone";
  if (normalizedDescription.includes("PHOTO")) return "Photochromic";
  if (normalizedDescription.includes("POLAR")) return "Polarized";
  if (normalizedDescription.includes("MIRROR")) return "Mirror";

  return cleanDisplayValue(description)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
