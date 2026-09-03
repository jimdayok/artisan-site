import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import portalEdgeProofWorker from "../cloudflare/portal-edge-proof/src/index.js";

test("the edge Worker overwrites proof headers with an IP-bound signature", async () => {
  const clientIp = "96.76.102.241";
  const secret = "e".repeat(48);
  const now = Date.UTC(2026, 8, 2, 12, 0, 0);
  const timestamp = String(Math.floor(now / 1000));
  const originalFetch = globalThis.fetch;
  const originalDateNow = Date.now;
  let forwardedRequest;

  globalThis.fetch = async (request) => {
    forwardedRequest = request;
    return new Response("ok");
  };
  Date.now = () => now;

  try {
    const response = await portalEdgeProofWorker.fetch(
      new Request("https://www.artisanslabs.com/portal", {
        headers: {
          "cf-connecting-ip": clientIp,
          "x-artisan-edge-time": "caller-supplied",
          "x-artisan-edge-proof": "caller-supplied",
        },
      }),
      { PORTAL_EDGE_SECRET: secret }
    );

    assert.equal(response.status, 200);
    assert.ok(forwardedRequest instanceof Request);
    assert.equal(forwardedRequest.headers.get("x-real-ip"), clientIp);
    assert.equal(
      forwardedRequest.headers.get("x-artisan-edge-time"),
      timestamp
    );
    assert.equal(
      forwardedRequest.headers.get("x-artisan-edge-proof"),
      createHmac("sha256", secret)
        .update(`${clientIp}\n${timestamp}`)
        .digest("base64url")
    );
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalDateNow;
  }
});

test("the edge Worker fails closed when its secret is unavailable", async () => {
  const response = await portalEdgeProofWorker.fetch(
    new Request("https://www.artisanslabs.com/portal", {
      headers: { "cf-connecting-ip": "96.76.102.241" },
    }),
    {}
  );

  assert.equal(response.status, 503);
});
