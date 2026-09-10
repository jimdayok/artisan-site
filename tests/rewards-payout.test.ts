import assert from "node:assert/strict";
import test from "node:test";

import type { DashboardV1AdminRow } from "../lib/portal/adminDashboardV1.ts";
import {
  groupRewardRowsByLab,
  rewardRowsForAccount,
} from "../lib/portal/rewardsPayout.ts";

const monthly = (pm: number) => ({ ppm: 0, pm, cm: 0 });

function rewardFixture(overrides: Partial<DashboardV1AdminRow> = {}) {
  return {
    acctId: "WEBB-PDX",
    businessName: "Webb Eyecare Group",
    accountNumbers: "4135, 4133, 4273",
    lab: "Pacific Artisan Labs",
    pmJobs: 103,
    pmTierJobs: 78,
    rewards: {
      arsql26: {
        enrolled: true,
        qualified_sequel_pal_jobs: monthly(22),
        rebate_total: monthly(374),
      },
    },
    rawAccount: {
      locations: [
        {
          location_key: "WEBB-PDX|4135|PACIFIC ARTISAN LABS",
          account_number: "4135",
          account_name: "Webb Eyecare Alliance",
          lab_name: "Pacific Artisan Labs",
          supplemental_intelligence: {
            rewards: {
              arsql26: {
                enrolled: true,
                qualified_sequel_pal_jobs: monthly(5),
                rebate_total: monthly(0),
              },
            },
          },
        },
        {
          location_key: "WEBB-PDX|4273|PACIFIC ARTISAN LABS",
          account_number: "4273",
          account_name: "Webb Eyecare Bridgeport",
          lab_name: "Pacific Artisan Labs",
          supplemental_intelligence: {
            rewards: {
              arsql26: {
                enrolled: true,
                qualified_sequel_pal_jobs: monthly(0),
                rebate_total: monthly(0),
              },
            },
          },
        },
        {
          location_key: "WEBB-PDX|4133|PACIFIC ARTISAN LABS",
          account_number: "4133",
          account_name: "Webb Eyecare Scottsbluff",
          lab_name: "Pacific Artisan Labs",
          supplemental_intelligence: {
            rewards: {
              arsql26: {
                enrolled: true,
                qualified_sequel_pal_jobs: monthly(17),
                rebate_total: monthly(0),
              },
            },
          },
        },
      ],
    },
    ...overrides,
  } as unknown as DashboardV1AdminRow;
}

test("Sequel rewards preserve the group total while breaking payout out by location", () => {
  const [row] = rewardRowsForAccount(rewardFixture());

  assert.equal(row.payout.pm, 374);
  assert.equal(row.pmTierJobs, 78);
  assert.deepEqual(
    row.locations.map((location) => [location.accountNumber, location.qualifiedJobs.pm, location.payout.pm]),
    [
      ["4133", 17, 289],
      ["4135", 5, 85],
      ["4273", 0, 0],
    ]
  );
  assert.equal(
    row.locations.reduce((total, location) => total + location.payout.pm, 0),
    row.payout.pm
  );
  assert.equal(row.locations.every((location) => location.payoutDerivedFromGroupRate), true);
});

test("reward activity without a workbook-backed enrollment is excluded", () => {
  const rows = rewardRowsForAccount(
    rewardFixture({
      acctId: "20035-ALN",
      businessName: "The Eye Site",
      accountNumbers: "20035",
      lab: "Pike Artisan Labs",
      pmJobs: 1,
      pmTierJobs: 1,
      rewards: {
        arsql26: {
          enrolled: false,
          qualified_sequel_pal_jobs: monthly(1),
          rebate_total: monthly(5),
        },
      },
      rawAccount: undefined,
    })
  );

  assert.deepEqual(rows, []);
});

test("lab sections follow the operational Pacific, Peak, Pike order", () => {
  const baseRow = rewardRowsForAccount(rewardFixture())[0];
  const grouped = groupRewardRowsByLab([
    { ...baseRow, locations: [{ ...baseRow.locations[0], lab: "Pike Artisan Labs" }] },
    { ...baseRow, locations: [{ ...baseRow.locations[0], lab: "Peak Artisan Labs" }] },
    { ...baseRow, locations: [{ ...baseRow.locations[0], lab: "Pacific Artisan Labs" }] },
  ]);

  assert.deepEqual(
    grouped.map(([lab]) => lab),
    ["Pacific Artisan Labs", "Peak Artisan Labs", "Pike Artisan Labs"]
  );
});

test("a group spanning labs uses each lab's location subtotal instead of repeating the group total", () => {
  const baseRow = rewardRowsForAccount(rewardFixture())[0];
  const locations = [
    { ...baseRow.locations[0], accountNumber: "4133", lab: "Pacific Artisan Labs" },
    {
      ...baseRow.locations[1],
      accountNumber: "4273",
      lab: "Pike Artisan Labs",
      qualifiedJobs: monthly(2),
      payout: monthly(34),
    },
  ];
  const grouped = groupRewardRowsByLab([{ ...baseRow, locations }]);

  assert.deepEqual(
    grouped.map(([lab, [row]]) => [lab, row.accountNumbers, row.qualifiedJobs.pm, row.payout.pm]),
    [
      ["Pacific Artisan Labs", "4133", 17, 289],
      ["Pike Artisan Labs", "4273", 2, 34],
    ]
  );
});

test("the same account's Pacific activity is combined into its Peak lab payout", () => {
  const baseRow = rewardRowsForAccount(rewardFixture())[0];
  const locations = [
    {
      ...baseRow.locations[0],
      accountNumber: "10093",
      lab: "Pacific Artisan Labs",
      qualifiedJobs: monthly(12),
      payout: monthly(300),
    },
    {
      ...baseRow.locations[0],
      locationKey: "10093-DEN|10093|PEAK ARTISAN LABS",
      accountNumber: "10093",
      lab: "Peak Artisan Labs",
      qualifiedJobs: monthly(8),
      payout: monthly(200),
    },
  ];

  const grouped = groupRewardRowsByLab([{ ...baseRow, locations }]);

  assert.deepEqual(
    grouped.map(([lab, [row]]) => [
      lab,
      row.accountNumbers,
      row.qualifiedJobs.pm,
      row.payout.pm,
      row.locations.length,
    ]),
    [["Peak Artisan Labs", "10093", 20, 500, 1]]
  );
});

test("the same account's Pacific activity is combined into its Pike lab payout", () => {
  const baseRow = rewardRowsForAccount(rewardFixture())[0];
  const locations = [
    {
      ...baseRow.locations[0],
      accountNumber: "20035",
      lab: "Pacific Artisan Labs",
      qualifiedJobs: monthly(3),
      payout: monthly(51),
    },
    {
      ...baseRow.locations[0],
      locationKey: "20035-ALN|20035|PIKE ARTISAN LABS",
      accountNumber: "20035",
      lab: "Pike Artisan Labs",
      qualifiedJobs: monthly(1),
      payout: monthly(17),
    },
  ];

  const grouped = groupRewardRowsByLab([{ ...baseRow, locations }]);

  assert.deepEqual(
    grouped.map(([lab, [row]]) => [
      lab,
      row.accountNumbers,
      row.qualifiedJobs.pm,
      row.payout.pm,
      row.locations.length,
    ]),
    [["Pike Artisan Labs", "20035", 4, 68, 1]]
  );
});

test("a single Pacific enrollment uses its Peak Power BI lab for payout", () => {
  const baseRow = rewardRowsForAccount(rewardFixture())[0];
  const grouped = groupRewardRowsByLab([
    {
      ...baseRow,
      acctId: "10093-DEN",
      businessName: "Optical Outlook",
      accountNumbers: "10093",
      lab: "Peak Artisan Labs",
      locations: [
        {
          ...baseRow.locations[0],
          accountNumber: "10093",
          accountName: "Optical Outlook",
          lab: "Pacific Artisan Labs",
        },
      ],
    },
  ]);

  assert.deepEqual(
    grouped.map(([lab, [row]]) => [lab, row.businessName, row.accountNumbers]),
    [["Peak Artisan Labs", "Optical Outlook", "10093"]]
  );
});
