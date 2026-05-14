import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const PORTAL_SOURCE_DIR = path.join(
  process.cwd(),
  "private-source",
  "portal"
);

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"" && insideQuotes && nextCharacter === "\"") {
      currentValue += "\"";
      index += 1;
      continue;
    }

    if (character === "\"") {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());

  return values;
}

export function readPrivatePortalCsv(fileName: string) {
  const filePath = path.join(PORTAL_SOURCE_DIR, fileName);

  if (!existsSync(filePath)) return [];

  const csv = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").trim();

  if (!csv) return [];

  const [headerLine, ...lines] = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) return [];

  const headers = parseCsvLine(headerLine).map((header) =>
    header.trim().toLowerCase()
  );

  return lines.map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index]?.trim() ?? "";
      return row;
    }, {});
  });
}

export function parseCsvList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
