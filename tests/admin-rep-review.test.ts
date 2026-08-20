import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repo = process.cwd();

test("admin rep review is backed by packaged HB and OP Net Sales history", () => {
  const history = JSON.parse(
    readFileSync(path.join(repo, "lib/portal/generated/repNetSalesHistory.json"), "utf8")
  ) as { manifest: { rep_field: string; measure: string }; rows: Array<{ rep_code: string; month: string }> };
  const reps = [...new Set(history.rows.map((row) => row.rep_code))].sort();
  const months = [...new Set(history.rows.map((row) => row.month))];

  assert.deepEqual(reps, ["HB", "OP"]);
  assert.equal(history.manifest.rep_field, "Intel[Sales Rep]");
  assert.equal(history.manifest.measure, "Intel[Net Sales]");
  assert.ok(months.length >= 14);
});

test("admin review keeps rep scoping and limits movement queues to five", () => {
  const source = readFileSync(path.join(repo, "lib/portal/adminRepReview.ts"), "utf8");
  assert.match(source, /scopeNetSalesHistory/);
  assert.match(source, /buildEmployeeDashboard\(adminRole, option\.code\)/);
  assert.match(source, /topUp:[\s\S]*?\.slice\(0, 5\)/);
  assert.match(source, /topDown:[\s\S]*?\.slice\(0, 5\)/);
  assert.match(source, /firstPositive/);
});
