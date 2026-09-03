import assert from "node:assert/strict";
import test from "node:test";
import {
  applyPortalAccessOverrides,
  normalizePortalAccessAccountNumber,
  normalizePortalAccessPrograms,
  type PortalAccessAdminEventBody,
  type PortalAccessAdminEvent,
  type PortalAccessBaseAccount,
} from "../lib/portal/portalAccessOverridePolicy.ts";

const baseAccounts: PortalAccessBaseAccount[] = [
  {
    accountNumber: "GROUP-IND",
    aliases: ["20001"],
    practiceName: "Existing Practice",
    emails: ["owner@example.com"],
    priceLists: ["G6"],
    programs: ["ARSQL26"],
    onboarding: false,
    hasReports: true,
  },
];

function event(
  partial: PortalAccessAdminEventBody
): PortalAccessAdminEvent {
  return {
    id: partial.id ?? "event-1",
    timestamp: partial.timestamp ?? "2026-09-02T12:00:00.000Z",
    actorEmail: "admin@example.com",
    ...partial,
  } as PortalAccessAdminEvent;
}

test("portal changes override report access without changing the report baseline", () => {
  const effective = applyPortalAccessOverrides(baseAccounts, [
    event({ type: "email-removed", accountNumber: "GROUP-IND", email: "owner@example.com" }),
    event({ type: "email-added", accountNumber: "GROUP-IND", email: "new@example.com", id: "event-2" }),
    event({ type: "price-lists-set", accountNumber: "GROUP-IND", priceLists: ["P6", "NL"], id: "event-3" }),
    event({ type: "programs-set", accountNumber: "GROUP-IND", programs: ["ARUTY26"], id: "event-4" }),
    event({ type: "onboarding-set", accountNumber: "GROUP-IND", onboarding: true, id: "event-5" }),
  ])[0];

  assert.deepEqual(effective.emails, ["new@example.com"]);
  assert.deepEqual(effective.priceLists, ["P6", "NL"]);
  assert.deepEqual(effective.programs, ["ARUTY26"]);
  assert.equal(effective.onboarding, true);
  assert.deepEqual(baseAccounts[0].emails, ["owner@example.com"]);
});

test("a portal-created customer works before reporting data exists", () => {
  const effective = applyPortalAccessOverrides([], [
    event({
      type: "account-created",
      accountNumber: "PENDING-CLEAR-VISION-A1B2C3",
      practiceName: "Clear Vision",
      emails: ["hello@clearvision.example"],
      priceLists: ["G6"],
      programs: ["SSAR26"],
      onboarding: true,
    }),
  ])[0];

  assert.equal(effective.practiceName, "Clear Vision");
  assert.equal(effective.hasReports, false);
  assert.equal(effective.createdInPortal, true);
  assert.deepEqual(effective.emails, ["hello@clearvision.example"]);
});

test("later events win and adding an email reverses a prior removal", () => {
  const effective = applyPortalAccessOverrides(baseAccounts, [
    event({ type: "email-removed", accountNumber: "GROUP-IND", email: "owner@example.com", id: "a", timestamp: "2026-09-02T12:00:00.000Z" }),
    event({ type: "email-added", accountNumber: "GROUP-IND", email: "owner@example.com", id: "b", timestamp: "2026-09-02T12:01:00.000Z" }),
  ])[0];

  assert.deepEqual(effective.emails, ["owner@example.com"]);
});

test("onboarding is opt-in and can be revoked", () => {
  const withoutAssignment = applyPortalAccessOverrides(baseAccounts, [])[0];
  assert.equal(withoutAssignment.onboarding, false);

  const withAssignment = applyPortalAccessOverrides(baseAccounts, [
    event({
      type: "onboarding-set",
      accountNumber: "GROUP-IND",
      onboarding: true,
      id: "enable-onboarding",
    }),
  ])[0];
  assert.equal(withAssignment.onboarding, true);

  const revoked = applyPortalAccessOverrides(baseAccounts, [
    event({
      type: "onboarding-set",
      accountNumber: "GROUP-IND",
      onboarding: true,
      id: "enable-onboarding",
      timestamp: "2026-09-02T12:00:00.000Z",
    }),
    event({
      type: "onboarding-set",
      accountNumber: "GROUP-IND",
      onboarding: false,
      id: "revoke-onboarding",
      timestamp: "2026-09-02T12:01:00.000Z",
    }),
  ])[0];
  assert.equal(revoked.onboarding, false);
});

test("account and program inputs are normalized for stable matching", () => {
  assert.equal(normalizePortalAccessAccountNumber(" 20001.0 "), "20001");
  assert.equal(normalizePortalAccessAccountNumber("New Practice / IND"), "NEW-PRACTICE-IND");
  assert.deepEqual(
    normalizePortalAccessPrograms([" arsql26, SSAR26 ", "arsql26"]),
    ["ARSQL26", "SSAR26"]
  );
});
