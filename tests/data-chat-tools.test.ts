import assert from "node:assert/strict";
import test from "node:test";

import {
  findCustomers,
  getCustomerActivity,
  listDecliningCustomers,
  listInactiveCustomers,
  type DataChatRow,
} from "../lib/portal/dataChatTools.ts";

function row(overrides: Partial<DataChatRow> = {}): DataChatRow {
  return {
    businessName: "Eyes Of Cimarron",
    acctId: "10079-ALN",
    accountNumbers: "10079",
    salesRep: "Unassigned",
    territory: "10079",
    lab: "Peak Artisan Labs",
    state: "TX",
    latestShipDate: "2026-09-17",
    dataRefreshDate: "2026-09-18",
    ppmSales: 2_000,
    pmSales: 2_500,
    cmSales: 3_223.64,
    ppmJobs: 25,
    pmJobs: 30,
    cmJobs: 28,
    ppmJpd: 2.13,
    pmJpd: 1.74,
    cmJpd: 2.15,
    locationCount: 2,
    rawAccount: undefined,
    ...overrides,
  };
}

test("customer search tolerates a small spelling difference", () => {
  const result = findCustomers([row()], "Eyes of Cimmeron");
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].account_id, "10079-ALN");
});

test("customer activity reports recent sending from shipment and current jobs", () => {
  const result = getCustomerActivity([row()], "10079-ALN");
  assert.equal(result.found, true);
  if (!result.found) return;
  assert.equal(result.sending_assessment.is_sending_recently, true);
  assert.equal(result.activity.current_month_to_date.jobs, 28);
  assert.equal(result.activity.current_vs_previous_jpd_change_percent, 23.6);
  assert.doesNotMatch(JSON.stringify(result), /email|phone|address/i);
});

test("declining customers use jobs-per-day pace and a baseline floor", () => {
  const result = listDecliningCustomers([
    row(),
    row({ businessName: "Down Practice", acctId: "DOWN-1", pmJobs: 40, pmJpd: 2, cmJobs: 8, cmJpd: 1 }),
    row({ businessName: "Tiny Practice", acctId: "TINY-1", pmJobs: 2, pmJpd: 0.2, cmJobs: 0, cmJpd: null }),
  ]);
  assert.deepEqual(result.customers.map((customer) => customer.account_id), ["DOWN-1"]);
  assert.equal(result.customers[0].jobs_per_day_change_percent, -50);
});

test("inactive customers are measured against the report data-through date", () => {
  const result = listInactiveCustomers([
    row(),
    row({ businessName: "Inactive Practice", acctId: "INACTIVE-1", latestShipDate: "2026-09-01", pmJobs: 25, cmJobs: 0, cmJpd: null }),
  ]);
  assert.deepEqual(result.customers.map((customer) => customer.account_id), ["INACTIVE-1"]);
  assert.equal(result.customers[0].calendar_days_since_latest_shipment, 17);
});
