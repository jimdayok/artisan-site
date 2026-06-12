import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const snapshotDir = path.join(
  root,
  "private-source",
  "portal",
  "dashboard-v1",
  "current"
);
const accountsDir = path.join(snapshotDir, "accounts");
const outputPath = path.join(
  root,
  "lib",
  "portal",
  "generated",
  "dashboardV1Bundle.json"
);
const expectedAccountSource = "private-site/portal/portal_export.json";
const expectedUserSource = "private-source/portal/user_data.xlsx";

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

const [manifest, accountsIndex, usersToAccounts, accountFiles] =
  await Promise.all([
    readJson(path.join(snapshotDir, "latest_snapshot_manifest.json")),
    readJson(path.join(snapshotDir, "accounts_index.json")),
    readJson(path.join(snapshotDir, "users_to_accounts.json")),
    readdir(accountsDir),
  ]);

const accountsById = {};
for (const fileName of accountFiles.filter((name) => name.endsWith(".json"))) {
  const account = await readJson(path.join(accountsDir, fileName));
  if (account?.account_id) accountsById[account.account_id] = account;
}

if (manifest.source_account_file !== expectedAccountSource) {
  throw new Error(
    `Refusing to bundle unexpected account source: ${manifest.source_account_file}`
  );
}

if (manifest.source_user_file.toLowerCase() !== expectedUserSource) {
  throw new Error(
    `Refusing to bundle unexpected user source: ${manifest.source_user_file}`
  );
}

if (accountsIndex.length === 0 || Object.keys(accountsById).length === 0) {
  throw new Error("Portal dashboard bundle is empty; refusing to build.");
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify({
    manifest,
    accountsIndex,
    usersToAccounts,
    accountsById,
  })}\n`
);

console.log(
  `[portal-dashboard-v1] bundled ${Object.keys(accountsById).length} accounts to ${path.relative(root, outputPath)}`
);
