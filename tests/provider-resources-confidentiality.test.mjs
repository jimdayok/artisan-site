import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public resources expose only the approved PECAA Unity Rewards flyer", async () => {
  const source = await readFile(
    new URL("../app/provider-resources/page.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /unity-rewards-flyer\.pdf/i);
  assert.doesNotMatch(source, /"Unity Rewards Flyer"/);
  assert.match(source, /"PECAA Max Unity Rewards Flyer"/);
  assert.match(source, /unity-rewards-pecaa\.pdf/);
});
