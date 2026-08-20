import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessAdminAccount,
  filterRowsForPortalRole,
  getPortalStaffRole,
} from "../lib/portal/portalRolePolicy.ts";
import { scopeAccountNetSalesRows } from "../lib/portal/netSalesHistoryPolicy.ts";

const rows = [
  { acctId: "HB-ACCOUNT", salesRepCode: "HB" },
  { acctId: "OP-ACCOUNT", salesRepCode: "OP" },
  { acctId: "UNASSIGNED", salesRepCode: "" },
];

test("explicit rep identities take precedence over employee admin access", () => {
  assert.deepEqual(getPortalStaffRole("heather.branderhorst@pacificartisanlabs.com"), {
    kind: "sales-rep",
    email: "heather.branderhorst@pacificartisanlabs.com",
    label: "Heather Branderhorst",
    repCode: "HB",
  });
  assert.equal(getPortalStaffRole("jropiol@live.com").kind, "sales-rep");
  assert.equal(getPortalStaffRole("jim.day@artisanlabnetwork.com").kind, "admin");
});

test("Heather and Josh can see only rows with their assigned rep code", () => {
  const heather = getPortalStaffRole("heather.branderhorst@pacificartisanlabs.com");
  const josh = getPortalStaffRole("jropiol@live.com");
  assert.deepEqual(filterRowsForPortalRole(heather, rows).map((row) => row.acctId), [
    "HB-ACCOUNT",
  ]);
  assert.deepEqual(filterRowsForPortalRole(josh, rows).map((row) => row.acctId), [
    "OP-ACCOUNT",
  ]);
});

test("administrators retain all-account access and unassigned users fail closed", () => {
  const admin = getPortalStaffRole("jim.day@artisanlabnetwork.com");
  const unassigned = getPortalStaffRole("unknown@example.com");
  assert.equal(filterRowsForPortalRole(admin, rows).length, rows.length);
  assert.equal(filterRowsForPortalRole(unassigned, rows).length, 0);
});

test("a missing row rep mapping does not widen access", () => {
  const previous = process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS;
  delete process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS;
  try {
    const heather = getPortalStaffRole("heather.branderhorst@pacificartisanlabs.com");
    assert.equal(canAccessAdminAccount(heather, rows[2]), false);
  } finally {
    if (previous === undefined) delete process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS;
    else process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS = previous;
  }
});

test("an explicit fallback account assignment grants only that account", () => {
  const previous = process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS;
  process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS = "HB:UNASSIGNED";
  try {
    const heather = getPortalStaffRole("heather.branderhorst@pacificartisanlabs.com");
    assert.equal(canAccessAdminAccount(heather, rows[2]), true);
    assert.equal(canAccessAdminAccount(heather, { acctId: "OTHER", salesRepCode: "" }), false);
  } finally {
    if (previous === undefined) delete process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS;
    else process.env.PORTAL_REP_ACCOUNT_ASSIGNMENTS = previous;
  }
});

test("Power BI account-month rows require both the rep code and an allowed account", () => {
  const salesRows = [
    { month: "2026-07", account_id: "HB-ACCOUNT", rep_code: "HB", net_sales: 100 },
    { month: "2026-07", account_id: "OP-ACCOUNT", rep_code: "OP", net_sales: 200 },
    { month: "2026-07", account_id: "OTHER-HB", rep_code: "HB", net_sales: 300 },
  ];

  assert.deepEqual(
    scopeAccountNetSalesRows(salesRows, "HB", ["HB-ACCOUNT"]).map((row) => row.account_id),
    ["HB-ACCOUNT"]
  );
  assert.equal(scopeAccountNetSalesRows(salesRows, "", ["HB-ACCOUNT"]).length, 0);
  assert.equal(scopeAccountNetSalesRows(salesRows, "HB", []).length, 0);
});
