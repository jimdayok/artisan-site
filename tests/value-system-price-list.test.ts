import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repo = process.cwd();
const read = (file: string) => readFileSync(path.join(repo, file), "utf8");

test("V7 is hidden everywhere while VD remains visible", () => {
  const hiddenCodes = JSON.parse(read("config/hidden-price-list-codes.json")) as string[];
  const registry = JSON.parse(
    read("lib/portal/generated/priceListRegistry.json")
  ) as {
    generatedCodes: string[];
    assignedMissingGenerated: string[];
    entries: Array<{ code: string; generated: boolean; rowCount: number }>;
  };
  assert.ok(hiddenCodes.includes("V7"));
  assert.ok(!hiddenCodes.includes("VD"));
  assert.ok(registry.generatedCodes.includes("VD"));
  assert.ok(!registry.assignedMissingGenerated.includes("VD"));
  assert.ok(
    registry.entries.some(
      (entry) => entry.code === "VD" && entry.generated && entry.rowCount === 79
    )
  );

  const codes = read("lib/pricing/priceListCodes.ts");
  assert.match(codes, /PACKAGE_PRICE_LIST_CODES[^\n]*"VD"/);
  assert.match(codes, /VD: "2025 Artisan Value System Pricing"/);
});

test("VD portal page always shows the program qualification requirements", () => {
  const requirements = read("app/portal/price-list/ValueSystemRequirements.tsx");
  const route = read("app/portal/price-list/[code]/page.tsx");
  const generatedPage = read(
    "app/portal/price-list/GeneratedInteractivePriceListPage.tsx"
  );

  assert.match(requirements, /Required for VD pricing/);
  assert.match(requirements, /AVDV package/);
  assert.match(requirements, /AVDV service code/);
  assert.match(requirements, /Phone and fax orders are not eligible/);
  assert.match(requirements, /does not allow substitutions or upgrades/);
  assert.match(route, /GeneratedInteractivePriceListPage/);
  assert.match(generatedPage, /normalizedCode === "VD"/);
  assert.match(generatedPage, /<ValueSystemRequirements/);
});
