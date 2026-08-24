import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";

export type PortalUserWorkbookRow = Record<string, unknown>;

const xlsx =
  (Reflect.get(XLSX, "default") as typeof XLSX | undefined) ?? XLSX;

export function readPortalUserWorkbookRows(
  filePath: string,
  sheetName: string
): PortalUserWorkbookRow[] {
  const workbook = xlsx.read(readFileSync(filePath), {
    type: "buffer",
    cellDates: false,
    cellFormula: false,
    cellHTML: false,
    dense: false,
  });
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Portal user workbook is missing sheet "${sheetName}".`);
  }

  return xlsx.utils.sheet_to_json<PortalUserWorkbookRow>(worksheet, {
    raw: false,
    defval: "",
    blankrows: false,
  });
}
