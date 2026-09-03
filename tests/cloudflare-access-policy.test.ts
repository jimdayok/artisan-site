import assert from "node:assert/strict";
import test from "node:test";
import {
  syncCloudflareAccessPolicy,
  updatePolicyEmailRules,
} from "../lib/portal/cloudflareAccessPolicyCore.ts";

test("adding an email preserves existing and non-email rules", () => {
  const existing = [
    { email: { email: "owner@example.com" } },
    { email_domain: { domain: "artisanlabnetwork.com" } },
  ];
  const result = updatePolicyEmailRules(existing, " New@Example.com ", "add");

  assert.equal(result.changed, true);
  assert.deepEqual(result.include, [
    ...existing,
    { email: { email: "new@example.com" } },
  ]);
});

test("adding an existing email is idempotent", () => {
  const existing = [{ email: { email: "owner@example.com" } }];
  const result = updatePolicyEmailRules(existing, "OWNER@example.com", "add");
  assert.equal(result.changed, false);
  assert.deepEqual(result.include, existing);
});

test("removing an email preserves every other rule", () => {
  const result = updatePolicyEmailRules(
    [
      { email: { email: "owner@example.com" } },
      { email: { email: "other@example.com" } },
      { group: { id: "group-1" } },
    ],
    "owner@example.com",
    "remove"
  );
  assert.equal(result.changed, true);
  assert.deepEqual(result.include, [
    { email: { email: "other@example.com" } },
    { group: { id: "group-1" } },
  ]);
});

test("Cloudflare synchronization reads, updates, and verifies the policy", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const originalPolicy = {
    name: "Portal users",
    decision: "allow",
    include: [{ email: { email: "owner@example.com" } }],
    exclude: [],
    require: [],
    session_duration: "24h",
  };
  const fetchMock: typeof fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    const result =
      init?.method === "PUT"
        ? JSON.parse(String(init.body))
        : originalPolicy;
    return Response.json({ success: true, result });
  };

  const result = await syncCloudflareAccessPolicy(
    {
      apiToken: "test-token",
      accountId: "account-1",
      policyId: "policy-1",
      expectedPolicyName: "Portal users",
    },
    "new@example.com",
    "add",
    fetchMock
  );

  assert.equal(result.changed, true);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].init?.method, undefined);
  assert.equal(requests[1].init?.method, "PUT");
  assert.equal(
    (requests[1].init?.headers as Record<string, string>).Authorization,
    "Bearer test-token"
  );
  const body = JSON.parse(String(requests[1].init?.body));
  assert.deepEqual(body.include, [
    { email: { email: "owner@example.com" } },
    { email: { email: "new@example.com" } },
  ]);
  assert.deepEqual(body.exclude, []);
  assert.deepEqual(body.require, []);
  assert.equal(body.session_duration, "24h");
});

test("Cloudflare synchronization refuses a different policy", async () => {
  const fetchMock: typeof fetch = async () =>
    Response.json({
      success: true,
      result: {
        name: "A different policy",
        decision: "allow",
        include: [{ email: { email: "owner@example.com" } }],
      },
    });

  await assert.rejects(
    syncCloudflareAccessPolicy(
      {
        apiToken: "test-token",
        accountId: "account-1",
        policyId: "policy-1",
        expectedPolicyName: "Portal users",
      },
      "new@example.com",
      "add",
      fetchMock
    ),
    /does not match the configured policy/
  );
});

test("Cloudflare synchronization refuses a malformed policy response", async () => {
  const fetchMock: typeof fetch = async () =>
    Response.json({
      success: true,
      result: { name: "Portal users", decision: "allow" },
    });

  await assert.rejects(
    syncCloudflareAccessPolicy(
      {
        apiToken: "test-token",
        accountId: "account-1",
        policyId: "policy-1",
      },
      "new@example.com",
      "add",
      fetchMock
    ),
    /has no include rules/
  );
});
