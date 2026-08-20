import fs from "node:fs";
import path from "node:path";

const repo = process.cwd();
const sourcePath = path.join(repo, "private-site/portal/portal_export.json");
const bundlePath = path.join(repo, "lib/portal/generated/dashboardV1Bundle.json");
const outputPath = path.join(repo, "private-site/portal/rep_net_sales_history.json");
const monthCount = 27;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function text(value) {
  return String(value ?? "").trim();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isoDate(value) {
  const candidate = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : "";
}

function monthKey(anchor, offset) {
  const date = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function accountId(row) {
  return text(row["Intel[Acct ID]"]).toUpperCase();
}

const sourceRows = readJson(sourcePath);
const bundle = readJson(bundlePath);
if (!Array.isArray(sourceRows)) throw new Error("Portal export must be a JSON array.");
if (!Array.isArray(bundle.accountsIndex)) throw new Error("Dashboard bundle is missing accountsIndex.");

const refreshDate =
  sourceRows.map((row) => isoDate(row["[data_refresh_date]"])).filter(Boolean).sort().at(-1) ||
  isoDate(bundle.manifest?.data_refresh_date);
if (!refreshDate) throw new Error("Unable to determine the Power BI data refresh date.");
const anchor = new Date(`${refreshDate}T00:00:00Z`);

const valuesByAccount = new Map();
const territoryByAccount = new Map();
for (const row of sourceRows) {
  const id = accountId(row);
  if (!id) continue;
  if (text(row["[territory]"])) territoryByAccount.set(id, text(row["[territory]"]));
  const values = valuesByAccount.get(id) ?? Array.from({ length: monthCount }, () => null);
  for (let offset = 0; offset < monthCount; offset += 1) {
    const next = number(row[`[net_sales_m${offset}]`]);
    if (next === null) continue;
    values[offset] = (values[offset] ?? 0) + next;
  }
  valuesByAccount.set(id, values);
}

const rows = [];
for (const account of bundle.accountsIndex) {
  const id = text(account.account_id).toUpperCase();
  const repCode = text(account.sales_rep).toUpperCase();
  if (!id || !repCode) continue;
  const values = valuesByAccount.get(id) ?? Array.from({ length: monthCount }, () => null);
  for (let offset = 0; offset < monthCount; offset += 1) {
    rows.push({
      month: monthKey(anchor, offset),
      account_id: id,
      rep_code: repCode,
      lab: text(account.lab || account.last_lab_name),
      territory: text(account.territory) || territoryByAccount.get(id) || "",
      net_sales: values[offset],
    });
  }
}

rows.sort((a, b) => a.month.localeCompare(b.month) || a.rep_code.localeCompare(b.rep_code) || a.account_id.localeCompare(b.account_id));

const output = {
  manifest: {
    workspace_id: "a63e0f35-1088-4bb4-bb1c-61f242c18dbc",
    semantic_model_id: "a946695b-5a56-467e-b4fa-c66c3d113c54",
    source_table: "Intel",
    measure: "Intel[Net Sales]",
    account_field: "Intel[Acct ID]",
    rep_field: "Intel[Sales Rep]",
    lab_field: "Intel[Lab Name]",
    territory_field: "Intel[Account or Group Territory]",
    date_field: "Date[Date]",
    timezone: "America/Chicago",
    generated_at: new Date().toISOString(),
    data_refresh_date: refreshDate,
    mode: "synchronized",
  },
  rows,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const tempPath = `${outputPath}.tmp.${process.pid}`;
fs.writeFileSync(tempPath, `${JSON.stringify(output)}\n`);
fs.renameSync(tempPath, outputPath);
console.log(`[portal-net-sales] wrote ${rows.length} account-month rows for ${new Set(rows.map((row) => row.account_id)).size} assigned accounts.`);
