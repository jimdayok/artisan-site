import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("self-hosted c15t replaces CookieYes and preserves feature gating", async () => {
  const [provider, layout, config, privacyPolicy] = await Promise.all([
    read("app/components/CookieConsentProvider.tsx"),
    read("app/layout.tsx"),
    read("next.config.ts"),
    read("app/privacy-policy/page.tsx"),
  ]);

  assert.match(provider, /mode: "hosted"/);
  assert.match(provider, /backendURL: "\/api\/c15t"/);
  assert.match(
    provider,
    /consentCategories: \["necessary", "functionality", "measurement"\]/,
  );
  assert.match(provider, /has\("functionality"\)/);
  assert.match(provider, /has\("measurement"\)/);
  assert.match(provider, /primaryButton=\{\["reject", "accept"\]\}/);
  assert.match(config, /d2d-consent-service\.vercel\.app\/api\/c15t/);
  assert.doesNotMatch(layout, /CookieYesScript/);
  assert.doesNotMatch(provider, /cookieyes|cky-/i);
  assert.doesNotMatch(privacyPolicy, /CookieYes/);
});
