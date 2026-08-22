import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  buildTypeformLeadEvent,
  verifyTypeformSignature,
} from "../lib/analytics/typeform-webhook.server.ts";

const secret = "test-webhook-secret";

test("verifies the raw Typeform HMAC and rejects altered payloads", () => {
  const body = JSON.stringify({ event_type: "form_response" });
  const signature = `sha256=${createHmac("sha256", secret)
    .update(body)
    .digest("base64")}`;
  assert.equal(verifyTypeformSignature(signature, body, secret), true);
  assert.equal(verifyTypeformSignature(signature, `${body} `, secret), false);
});

test("builds a PII-free completed new-account lead event", () => {
  const result = buildTypeformLeadEvent(
    {
      event_type: "form_response",
      form_response: {
        form_id: "quuPCSff",
        token: "response-token",
        submitted_at: new Date().toISOString(),
        hidden: {
          site_version: "preview",
          lab_name: "Peak",
          page_location:
            "https://preview.artisanlabnetwork.com/peak-artisan-labs?utm_source=google&email=private@example.com",
          page_title: "Peak Artisan Labs",
          traffic_context: "organic",
          ga_client_id: "GA1.1.123.456",
          ga_session_id: "GS1.1.123.1.0.0.0.0.0",
        },
        answers: [
          { type: "email", email: "private@example.com" },
          { type: "text", text: "private message" },
        ],
      },
    } as never,
    secret,
  );

  assert.ok(result.event);
  assert.equal(result.event.client_id, "123.456");
  const params = result.event.events[0].params;
  assert.equal(params.lead_type, "new_account");
  assert.equal(params.site_version, "preview");
  assert.equal(params.lab_name, "Peak");
  assert.equal(params.session_id, "123");
  assert.equal(
    params.page_location,
    "https://preview.artisanlabnetwork.com/peak-artisan-labs?utm_source=google",
  );
  assert.doesNotMatch(JSON.stringify(result.event), /private@example|private message/);
});

test("skips duplicate preview contact embeds and consentless submissions", () => {
  const base = {
    event_type: "form_response",
    form_response: {
      form_id: "m0lQ9zjD",
      token: "response-token",
      hidden: { site_version: "preview", analytics_delivery: "client" },
    },
  };
  assert.equal(buildTypeformLeadEvent(base, secret).reason, "client_event_preferred");
  assert.equal(
    buildTypeformLeadEvent(
      { ...base, form_response: { ...base.form_response, hidden: {} } },
      secret,
    ).reason,
    "consent_context_missing",
  );
});
