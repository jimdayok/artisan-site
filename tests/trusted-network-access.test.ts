import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isPortalAdminEmailAddress,
  TRUSTED_NETWORK_ADMIN_EMAIL,
} from "../lib/portal/adminAccess.ts";
import {
  createTrustedNetworkSession,
  createTrustedNetworkEdgeProof,
  hashTrustedNetworkPassword,
  isTrustedNetworkRequest,
  normalizeTrustedNetworkIp,
  sanitizeTrustedNetworkReturnTo,
  TRUSTED_NETWORK_SESSION_TTL_SECONDS,
  TRUSTED_NETWORK_EDGE_PROOF_HEADER,
  TRUSTED_NETWORK_EDGE_TIME_HEADER,
  verifyTrustedNetworkPassword,
  verifyTrustedNetworkEdgeProof,
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

test("matches only configured, edge-verified Cloudflare client IPs", () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const edgeSecret = "e".repeat(48);
  const headers = new Headers({
    host: "artisanlabnetwork.com",
    "cf-connecting-ip": "96.76.102.241",
    "cf-ray": "test-DFW",
    [TRUSTED_NETWORK_EDGE_TIME_HEADER]: String(timestamp),
    [TRUSTED_NETWORK_EDGE_PROOF_HEADER]: createTrustedNetworkEdgeProof(
      "96.76.102.241",
      timestamp,
      edgeSecret
    ),
  });
  const previousEdgeSecret = process.env.PORTAL_TRUSTED_NETWORK_EDGE_SECRET;
  process.env.PORTAL_TRUSTED_NETWORK_EDGE_SECRET = edgeSecret;
  assert.equal(
    isTrustedNetworkRequest(headers, "96.76.102.241", "production"),
    true
  );
  assert.equal(isTrustedNetworkRequest(headers, "203.0.113.9"), false);

  headers.set(TRUSTED_NETWORK_EDGE_PROOF_HEADER, "spoofed");
  assert.equal(
    isTrustedNetworkRequest(headers, "96.76.102.241", "production"),
    false
  );
  headers.set(
    TRUSTED_NETWORK_EDGE_PROOF_HEADER,
    createTrustedNetworkEdgeProof("96.76.102.241", timestamp, edgeSecret)
  );

  headers.delete("cf-ray");
  assert.equal(
    isTrustedNetworkRequest(headers, "96.76.102.241", "production"),
    false
  );

  if (previousEdgeSecret === undefined) {
    delete process.env.PORTAL_TRUSTED_NETWORK_EDGE_SECRET;
  } else {
    process.env.PORTAL_TRUSTED_NETWORK_EDGE_SECRET = previousEdgeSecret;
  }
});

test("edge proofs are time-limited and bound to the Cloudflare client IP", () => {
  const now = Date.UTC(2026, 8, 2, 12, 0, 0);
  const timestamp = Math.floor(now / 1000);
  const secret = "e".repeat(48);
  const headers = new Headers({
    "cf-connecting-ip": "96.76.102.241",
    [TRUSTED_NETWORK_EDGE_TIME_HEADER]: String(timestamp),
    [TRUSTED_NETWORK_EDGE_PROOF_HEADER]: createTrustedNetworkEdgeProof(
      "96.76.102.241",
      timestamp,
      secret
    ),
  });

  assert.equal(verifyTrustedNetworkEdgeProof(headers, now, secret), true);
  headers.set("cf-connecting-ip", "203.0.113.9");
  assert.equal(verifyTrustedNetworkEdgeProof(headers, now, secret), false);
  headers.set("cf-connecting-ip", "96.76.102.241");
  assert.equal(
    verifyTrustedNetworkEdgeProof(headers, now + 121_000, secret),
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
