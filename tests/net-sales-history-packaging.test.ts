import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repo = process.cwd();
const artifactPath = path.join(repo, "lib/portal/generated/repNetSalesHistory.json");

test("the packaged Power BI history contains the verified rep and month mappings", () => {
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  assert.equal(artifact.manifest.measure, "Intel[Net Sales]");
  assert.equal(artifact.manifest.rep_field, "Intel[Sales Rep]");
  assert.equal(artifact.manifest.account_field, "Intel[Acct ID]");
  assert.equal(artifact.manifest.date_field, "Date[Date]");
  assert.deepEqual(new Set(artifact.rows.map((row: { rep_code: string }) => row.rep_code)), new Set(["HB", "OP"]));
  assert.equal(new Set(artifact.rows.map((row: { month: string }) => row.month)).size, 27);
  assert.equal(artifact.rows.length, 1431);
});

test("the refresh pipeline stages the same server-packaged history the app imports", () => {
  const loader = readFileSync(path.join(repo, "lib/portal/netSalesHistory.ts"), "utf8");
  const syncScript = readFileSync(path.join(repo, "scripts/sync-portal-export.sh"), "utf8");
  const vercelIgnore = readFileSync(path.join(repo, ".vercelignore"), "utf8");

  assert.match(loader, /generated\/repNetSalesHistory\.json/);
  assert.match(syncScript, /lib\/portal\/generated\/repNetSalesHistory\.json/);
  assert.doesNotMatch(vercelIgnore, /repNetSalesHistory/);
});
