import assert from "node:assert/strict";
import test from "node:test";
import {
  extractPipedriveAttribution,
  syncPipedriveAttribution,
} from "../lib/integrations/pipedrive-attribution.server.ts";

const submittedAt = "2026-08-23T12:00:00.000Z";
const fieldNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "landing_page",
  "referrer",
  "site_version",
  "lab_name",
] as const;
const fieldCodes = Object.fromEntries(
  fieldNames.map((name, index) => [name, `${index}`.padStart(40, "a")]),
);

function payload() {
  return {
    event_type: "form_response",
    form_response: {
      form_id: "quuPCSff",
      submitted_at: submittedAt,
      hidden: {
        utm_source: "google",
        utm_medium: "organic",
        utm_campaign: "gbp",
        utm_content: "peak",
        utm_term: "optical lab",
        landing_page:
          "https://preview.artisanlabnetwork.com/peak-artisan-labs?email=private@example.com&utm_source=google",
        referrer: "https://www.google.com/search?q=private+term",
        site_version: "preview",
        lab_name: "Peak",
      },
      answers: [
        { type: "email", email: "Private@Example.com" },
        { type: "text", text: "Never send this message" },
      ],
    },
  };
}

test("extracts only the approved attribution values and sanitizes URLs", () => {
  const attribution = extractPipedriveAttribution(payload());
  assert.deepEqual(attribution, {
    respondentEmail: "private@example.com",
    submittedAt,
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: "gbp",
    utm_content: "peak",
    utm_term: "optical lab",
    landing_page: "https://preview.artisanlabnetwork.com/peak-artisan-labs",
    referrer: "https://www.google.com",
    site_version: "preview",
    lab_name: "Peak",
  });
  assert.doesNotMatch(JSON.stringify(attribution), /Never send this message/);
});

test("omits campaign values that resemble personal information", () => {
  const input = payload();
  input.form_response.hidden.utm_term = "private@example.com";
  const attribution = extractPipedriveAttribution(input);
  assert.equal(attribution?.utm_term, undefined);
});

test("is inactive until both private server settings are configured", async () => {
  assert.deepEqual(
    await syncPipedriveAttribution(payload(), {
      apiToken: "",
      companyDomain: "",
    }),
    { status: "disabled" },
  );
});

test("updates the closest matching deal without creating a person or deal", async () => {
  const calls: Array<{ url: string; method: string; body?: string }> = [];
  const fakeFetch = async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = String(input);
    calls.push({
      url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : undefined,
    });
    let data: unknown;
    if (url.includes("/dealFields")) {
      data = fieldNames.map((name) => ({
        field_name: name,
        field_code: fieldCodes[name],
      }));
    } else if (url.includes("/persons/search")) {
      data = { items: [{ item: { id: 123 } }] };
    } else if (url.includes("/deals?")) {
      data = [
        {
          id: 456,
          add_time: "2026-08-23T12:00:05.000Z",
          custom_fields: { [fieldCodes.utm_source]: "" },
        },
      ];
    } else if (url.endsWith("/deals/456")) {
      data = { id: 456 };
    } else {
      throw new Error(`Unexpected request: ${url}`);
    }
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await syncPipedriveAttribution(payload(), {
    apiToken: "private-test-token",
    companyDomain: "artisanlabnetwork",
    fetchImpl: fakeFetch as typeof fetch,
    now: Date.parse("2026-08-23T12:01:00.000Z"),
    retryDelaysMs: [0],
  });

  assert.deepEqual(result, { status: "updated", updatedFieldCount: 9 });
  assert.equal(calls.at(-1)?.method, "PATCH");
  assert.ok(calls.every((call) => call.method === "GET" || call.method === "PATCH"));
  assert.doesNotMatch(JSON.stringify(calls.at(-1)), /private@example|Never send/);
  assert.doesNotMatch(JSON.stringify(calls), /private-test-token/);
});

test("preserves populated first-touch fields", async () => {
  const requests: Array<{ url: string; body?: string }> = [];
  const fakeFetch = async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = String(input);
    requests.push({ url, body: typeof init?.body === "string" ? init.body : undefined });
    const data = url.includes("/dealFields")
      ? fieldNames.map((name) => ({
          field_name: name,
          field_code: fieldCodes[name],
        }))
      : url.includes("/persons/search")
        ? { items: [{ item: { id: 123 } }] }
        : url.includes("/deals?")
          ? [
              {
                id: 456,
                add_time: "2026-08-23T12:00:05.000Z",
                custom_fields: { [fieldCodes.utm_source]: "newsletter" },
              },
            ]
          : { id: 456 };
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  };

  await syncPipedriveAttribution(payload(), {
    apiToken: "private-test-token",
    companyDomain: "artisanlabnetwork",
    fetchImpl: fakeFetch as typeof fetch,
    now: Date.parse("2026-08-23T12:01:00.000Z"),
    retryDelaysMs: [0],
  });
  const patchBody = JSON.parse(requests.at(-1)?.body ?? "{}") as {
    custom_fields?: Record<string, string>;
  };
  assert.equal(patchBody.custom_fields?.[fieldCodes.utm_source], undefined);
  assert.equal(patchBody.custom_fields?.[fieldCodes.site_version], "preview");
});

test("waits for the existing Typeform integration instead of creating a duplicate", async () => {
  let personSearchCount = 0;
  const methods: string[] = [];
  const fakeFetch = async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = String(input);
    methods.push(init?.method ?? "GET");
    const data = url.includes("/dealFields")
      ? fieldNames.map((name) => ({
          field_name: name,
          field_code: fieldCodes[name],
        }))
      : url.includes("/persons/search")
        ? ++personSearchCount === 1
          ? { items: [] }
          : { items: [{ item: { id: 123 } }] }
        : url.includes("/deals?")
          ? [
              {
                id: 456,
                add_time: "2026-08-23T12:00:05.000Z",
                custom_fields: {},
              },
            ]
          : { id: 456 };
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  };

  const result = await syncPipedriveAttribution(payload(), {
    apiToken: "private-test-token",
    companyDomain: "artisanlabnetwork",
    fetchImpl: fakeFetch as typeof fetch,
    now: Date.parse("2026-08-23T12:01:00.000Z"),
    retryDelaysMs: [0, 0],
  });
  assert.equal(result.status, "updated");
  assert.equal(personSearchCount, 2);
  assert.ok(methods.every((method) => method === "GET" || method === "PATCH"));
});
