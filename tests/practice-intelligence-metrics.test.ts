import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateArMix,
  calculateVspMix,
  resolveJobsPerDay,
} from "../lib/portal/practiceIntelligenceMetrics.ts";

test("VSP mix derives non-VSP orders from total jobs minus VSP jobs", () => {
  assert.deepEqual(calculateVspMix(141, 72), {
    totalJobs: 141,
    vspJobs: 72,
    nonVspJobs: 69,
    vspShare: (72 / 141) * 100,
    nonVspShare: (69 / 141) * 100,
  });
});

test("a location projection prefers the location dashboard rate over the group workbook rate", () => {
  assert.equal(
    resolveJobsPerDay({
      dashboardJobsPerDay: 6.1666666667,
      workbookJobsPerDay: 34.4444444444,
      jobs: 111,
      elapsedBusinessDays: 18,
    }),
    6.1666666667
  );
});

test("AR mix treats preferred jobs as in-house and non-preferred jobs as outsourced", () => {
  const result = calculateArMix(
    { ppm: 80, pm: 60, cm: 40 },
    { ppm: 20, pm: 40, cm: 10 }
  );

  assert.equal(result.ppm.inHouseShare, 80);
  assert.equal(result.pm.outsourcedShare, 40);
  assert.equal(result.cm.inHouseShare, 80);
});
