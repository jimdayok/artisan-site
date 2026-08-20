import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repo = process.cwd();
const read = (file: string) => readFileSync(path.join(repo, file), "utf8");

test("V7 is hidden everywhere while VD remains visible", () => {
  const hiddenCodes = JSON.parse(read("config/hidden-price-list-codes.json")) as string[];
  assert.ok(hiddenCodes.includes("V7"));
  assert.ok(!hiddenCodes.includes("VD"));

  const codes = read("lib/pricing/priceListCodes.ts");
  assert.match(codes, /PACKAGE_PRICE_LIST_CODES[^\n]*"VD"/);
  assert.match(codes, /VD: "2025 Artisan Value System Pricing"/);
});

test("VD portal page always shows the program qualification requirements", () => {
  const requirements = read("app/portal/price-list/ValueSystemRequirements.tsx");
  const route = read("app/portal/price-list/[code]/page.tsx");

  assert.match(requirements, /Required for VD pricing/);
  assert.match(requirements, /AVDV package/);
  assert.match(requirements, /AVDV service code/);
  assert.match(requirements, /Phone and fax orders are not eligible/);
  assert.match(requirements, /does not allow substitutions or upgrades/);
  assert.match(route, /normalizedCode === "VD"/);
  assert.match(route, /ValueSystemPriceListPage/);
});
