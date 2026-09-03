import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isPortalAdminEmailAddress,
  TRUSTED_NETWORK_ADMIN_EMAIL,
} from "../lib/portal/adminAccess.ts";
import {
  createTrustedNetworkSession,
  hashTrustedNetworkPassword,
  isTrustedNetworkRequest,
  normalizeTrustedNetworkIp,
  sanitizeTrustedNetworkReturnTo,
  TRUSTED_NETWORK_SESSION_TTL_SECONDS,
  verifyTrustedNetworkPassword,
  verifyTrustedNetworkSession,
} from "../lib/portal/trustedNetworkAccess.ts";

test("the trusted-network identity maps to the existing full admin role", () => {
  assert.equal(isPortalAdminEmailAddress(TRUSTED_NETWORK_ADMIN_EMAIL), true);
});

test("normalizes exact IPv4 and IPv4-mapped addresses", () => {
  assert.equal(normalizeTrustedNetworkIp(" 96.76.102.241 "), "96.76.102.241");
  assert.equal(
    normalizeTrustedNetworkIp("::ffff:96.76.102.241"),
    "96.76.102.241"
  );
  assert.equal(normalizeTrustedNetworkIp("96.76.102.241, 10.0.0.1"), "");
  assert.equal(normalizeTrustedNetworkIp("not-an-ip"), "");
});

test("matches only configured Cloudflare client IPs", () => {
  const headers = new Headers({
    host: "artisanlabnetwork.com",
    "cf-connecting-ip": "96.76.102.241",
    "cf-ray": "test-DFW",
  });
  assert.equal(isTrustedNetworkRequest(headers, "96.76.102.241"), true);
  assert.equal(isTrustedNetworkRequest(headers, "203.0.113.9"), false);

  headers.delete("cf-ray");
  assert.equal(
    isTrustedNetworkRequest(headers, "96.76.102.241", "production"),
    false
  );
});

test("password hashes verify without storing the clear-text password", () => {
  const encodedHash = hashTrustedNetworkPassword(
    "test-master-password",
    Buffer.alloc(16, 7)
  );
  assert.equal(
    verifyTrustedNetworkPassword("test-master-password", encodedHash),
    true
  );
  assert.equal(
    verifyTrustedNetworkPassword("wrong-password", encodedHash),
    false
  );
  assert.equal(
    verifyTrustedNetworkPassword("test-master-password", "invalid"),
    false
  );
});

test("trusted sessions are signed, IP-bound, and expire", () => {
  const now = Date.UTC(2026, 8, 2, 12, 0, 0);
  const secret = "s".repeat(48);
  const token = createTrustedNetworkSession("96.76.102.241", now, secret);
  assert.ok(token);
  assert.equal(
    verifyTrustedNetworkSession(token, "96.76.102.241", now, secret),
    true
  );
  assert.equal(
    verifyTrustedNetworkSession(token, "203.0.113.9", now, secret),
    false
  );
  assert.equal(
    verifyTrustedNetworkSession(
      token,
      "96.76.102.241",
      now + TRUSTED_NETWORK_SESSION_TTL_SECONDS * 1000,
      secret
    ),
    false
  );
  assert.equal(
    verifyTrustedNetworkSession(
      `${token}tampered`,
      "96.76.102.241",
      now,
      secret
    ),
    false
  );
});

test("return destinations stay inside the portal", () => {
  assert.equal(
    sanitizeTrustedNetworkReturnTo("/portal/admin?view=month#customers"),
    "/portal/admin?view=month#customers"
  );
  assert.equal(
    sanitizeTrustedNetworkReturnTo("https://evil.example/portal/admin"),
    "/portal/admin"
  );
  assert.equal(
    sanitizeTrustedNetworkReturnTo("//evil.example"),
    "/portal/admin"
  );
  assert.equal(
    sanitizeTrustedNetworkReturnTo("/portal/network-access"),
    "/portal/admin"
  );
});
