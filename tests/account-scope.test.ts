import assert from "node:assert/strict";
import test from "node:test";
import {
  isGroupAcctId,
  parseLinkedAccountNumbers,
  shouldShowAccountDrillDown,
} from "../lib/portal/accountScope.ts";

test("identifies group and practice Acct IDs", () => {
  assert.equal(isGroupAcctId("SAMV-IND"), true);
  assert.equal(isGroupAcctId("NETWORK-ALN"), true);
  assert.equal(isGroupAcctId("20030-IND"), false);
});

test("normalizes distinct linked account numbers", () => {
  assert.deepEqual(parseLinkedAccountNumbers("20030, 20031, 20030"), [
    "20030",
    "20031",
  ]);
});

test("shows account drill-down only for multi-account groups", () => {
  assert.equal(
    shouldShowAccountDrillDown({
      acctId: "SAMV-IND",
      allAccountNumbers: "20030, 20031",
    }),
    true
  );
  assert.equal(
    shouldShowAccountDrillDown({
      acctId: "SAMV-IND",
      allAccountNumbers: "20030",
    }),
    false
  );
  assert.equal(
    shouldShowAccountDrillDown({
      acctId: "20030-IND",
      allAccountNumbers: "20030, 20031",
    }),
    false
  );
});
