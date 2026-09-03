import assert from "node:assert/strict";
import test from "node:test";
import {
  computeSetupCompletion,
  escapeHtml,
  filenameSlug,
} from "../app/new-lab-partner/newLabPartnerUtils.ts";

test("completion treats complete, skipped, and not applicable sections as resolved", () => {
  const completion = computeSetupCompletion(
    {
      lab: "complete",
      portal: "skipped",
      ordering: "not-applicable",
    },
    ["lab", "portal", "ordering", "shipping"],
  );

  assert.equal(completion, 75);
});

test("completion handles an empty section list", () => {
  assert.equal(computeSetupCompletion({}, []), 0);
});

test("downloaded guide content escapes practice names", () => {
  assert.equal(
    escapeHtml('<North & South "Vision">'),
    "&lt;North &amp; South &quot;Vision&quot;&gt;",
  );
});

test("download filename uses a safe practice slug", () => {
  assert.equal(filenameSlug("North & South Vision"), "north-south-vision");
  assert.equal(filenameSlug("!!!"), "artisan");
});
