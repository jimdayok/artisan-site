import assert from "node:assert/strict";
import test from "node:test";
import { portalAccessLogoutUrl } from "../lib/portal/accessLogout.ts";

test("builds an absolute same-origin returnTo URL for Cloudflare Access", () => {
  const logoutUrl = new URL(
    portalAccessLogoutUrl("https://www.artisanslabs.com/portal/logout")
  );

  assert.equal(logoutUrl.origin, "https://www.artisanslabs.com");
  assert.equal(logoutUrl.pathname, "/cdn-cgi/access/logout");
  assert.equal(logoutUrl.searchParams.get("returnTo"), "https://www.artisanslabs.com/");
});

test("uses the request origin instead of a hard-coded production hostname", () => {
  const logoutUrl = new URL(
    portalAccessLogoutUrl("https://preview.artisanlabnetwork.com/portal/logout")
  );

  assert.equal(
    logoutUrl.toString(),
    "https://preview.artisanlabnetwork.com/cdn-cgi/access/logout?returnTo=https%3A%2F%2Fpreview.artisanlabnetwork.com%2F"
  );
});
