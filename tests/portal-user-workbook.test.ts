import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { readPortalUserWorkbookRows } from "../lib/portal/portalUserWorkbook.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workbookPath = path.join(
  rootDir,
  "private-source",
  "portal",
  "User_Data.xlsx"
);

test("loads the namespace-prefixed portal workbook and preserves Heather's access", () => {
  const rows = readPortalUserWorkbookRows(workbookPath, "person list");
  const heather = rows.find(
    (row) =>
      String(row["Person - Email - Work"] ?? "").toLowerCase() ===
      "heather@oaklandvision.com"
  );

  assert.ok(heather);
  assert.equal(heather["Person - Organization"], "Clarity Advanced Eye Care");
  assert.equal(heather["Organization - Acct ID"], "CAEC-IND");
  assert.equal(
    heather["Organization - All Account Numbers"],
    "20001, 20004, 20000, 20002, 20003, 20005, 20007, 20008, 20006"
  );
});
