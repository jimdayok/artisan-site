import type { DashboardV1AdminRow } from "@/lib/portal/adminDashboardV1";
import type {
  PortalDashboardV1Location,
  PortalDashboardV1MonthlyNumber,
} from "@/lib/portal/dashboardV1";

export type RewardProgram = "ARPMP26" | "ARUTY26" | "ARSQL26";

export type RewardLocationPayout = {
  locationKey: string;
  accountNumber: string;
  accountName: string;
  lab: string;
  qualifiedJobs: PortalDashboardV1MonthlyNumber;
  payout: PortalDashboardV1MonthlyNumber;
  payoutDerivedFromGroupRate: boolean;
};

export type RewardPayoutRow = {
  acctId: string;
  businessName: string;
  accountNumbers: string;
  lab: string;
  program: RewardProgram;
  qualifiedJobs: PortalDashboardV1MonthlyNumber;
  payout: PortalDashboardV1MonthlyNumber;
  pmJobs: number;
  pmTierJobs: number;
  locations: RewardLocationPayout[];
};

type RewardSource = {
  enrolled: boolean;
  qualifiedJobs: PortalDashboardV1MonthlyNumber;
  payout: PortalDashboardV1MonthlyNumber;
};

const PERIODS = ["ppm", "pm", "cm"] as const;
const ZERO_MONTHLY: PortalDashboardV1MonthlyNumber = { ppm: 0, pm: 0, cm: 0 };

function rewardSource(
  rewards: DashboardV1AdminRow["rewards"],
  program: RewardProgram
): RewardSource | null {
  if (program === "ARPMP26" && rewards.arpmp26) {
    return {
      enrolled: rewards.arpmp26.enrolled,
      qualifiedJobs: rewards.arpmp26.qualified_pmp_jobs,
      payout: rewards.arpmp26.rebate_total,
    };
  }

  if (program === "ARUTY26" && rewards.aruty26) {
    return {
      enrolled: rewards.aruty26.enrolled,
      qualifiedJobs: rewards.aruty26.qualified_jobs,
      payout: rewards.aruty26.rewards_earned,
    };
  }

  if (program === "ARSQL26" && rewards.arsql26) {
    return {
      enrolled: rewards.arsql26.enrolled,
      qualifiedJobs: rewards.arsql26.qualified_sequel_pal_jobs,
      payout: rewards.arsql26.rebate_total,
    };
  }

  return null;
}

function locationRewardSource(location: PortalDashboardV1Location, program: RewardProgram) {
  const rewards = location.supplemental_intelligence?.rewards;
  if (!rewards) return null;

  if (program === "ARPMP26" && rewards.arpmp26) {
    return {
      enrolled: rewards.arpmp26.enrolled,
      qualifiedJobs: rewards.arpmp26.qualified_pmp_jobs,
      payout: rewards.arpmp26.rebate_total,
    };
  }

  if (program === "ARUTY26" && rewards.aruty26) {
    return {
      enrolled: rewards.aruty26.enrolled,
      qualifiedJobs: rewards.aruty26.qualified_jobs,
      payout: rewards.aruty26.rewards_earned,
    };
  }

  if (program === "ARSQL26" && rewards.arsql26) {
    return {
      enrolled: rewards.arsql26.enrolled,
      qualifiedJobs: rewards.arsql26.qualified_sequel_pal_jobs,
      payout: rewards.arsql26.rebate_total,
    };
  }

  return null;
}

function allocateByQualifiedJobs(
  locations: RewardLocationPayout[],
  groupQualifiedJobs: PortalDashboardV1MonthlyNumber,
  groupPayout: PortalDashboardV1MonthlyNumber
) {
  const next = locations.map((location) => ({
    ...location,
    payout: { ...location.payout },
  }));
  let derived = false;

  for (const period of PERIODS) {
    const targetPayout = groupPayout[period];
    const sourcePayout = next.reduce((total, location) => total + location.payout[period], 0);
    if (Math.abs(targetPayout - sourcePayout) < 0.005 || targetPayout <= 0) continue;

    const qualifiedTotal = groupQualifiedJobs[period];
    if (qualifiedTotal <= 0) continue;

    const rate = targetPayout / qualifiedTotal;
    let allocated = 0;
    let lastQualifiedIndex = -1;
    for (let index = 0; index < next.length; index += 1) {
      if (next[index].qualifiedJobs[period] > 0) lastQualifiedIndex = index;
    }

    for (let index = 0; index < next.length; index += 1) {
      const amount =
        index === lastQualifiedIndex
          ? targetPayout - allocated
          : next[index].qualifiedJobs[period] * rate;
      next[index].payout[period] = Number(amount.toFixed(2));
      allocated += next[index].payout[period];
    }
    derived = true;
  }

  return next.map((location) => ({
    ...location,
    payoutDerivedFromGroupRate: location.payoutDerivedFromGroupRate || derived,
  }));
}

function locationPayoutRows(
  row: DashboardV1AdminRow,
  program: RewardProgram,
  source: RewardSource
): RewardLocationPayout[] {
  const sourceLocations = row.rawAccount?.locations ?? [];
  const enrolledLocations = sourceLocations.filter((location) =>
    Boolean(locationRewardSource(location, program)?.enrolled)
  );
  const applicableLocations = enrolledLocations.length > 0 ? enrolledLocations : sourceLocations;

  if (applicableLocations.length <= 1) {
    const location = applicableLocations[0];
    return [
      {
        locationKey: location?.location_key || `${row.acctId}|${row.accountNumbers}|${row.lab}`,
        accountNumber: location?.account_number || row.accountNumbers,
        accountName: location?.account_name || row.businessName,
        lab: location?.lab_name || row.lab,
        qualifiedJobs: { ...source.qualifiedJobs },
        payout: { ...source.payout },
        payoutDerivedFromGroupRate: false,
      },
    ];
  }

  const locations = applicableLocations
    .map((location) => {
      const locationSource = locationRewardSource(location, program);
      return {
        locationKey: location.location_key,
        accountNumber: location.account_number,
        accountName: location.account_name || location.business_name || row.businessName,
        lab: location.lab_name || row.lab,
        qualifiedJobs: { ...(locationSource?.qualifiedJobs ?? ZERO_MONTHLY) },
        payout: { ...(locationSource?.payout ?? ZERO_MONTHLY) },
        payoutDerivedFromGroupRate: false,
      };
    })
    .sort((a, b) =>
      a.accountNumber.localeCompare(b.accountNumber, undefined, { numeric: true })
    );

  // Prefer the exact location reward amounts in the export. If an older or
  // incomplete export only carries qualified counts, Sequel's group-tier rate
  // remains a safe fallback and preserves the exact group total.
  return program === "ARSQL26"
    ? allocateByQualifiedJobs(locations, source.qualifiedJobs, source.payout)
    : locations;
}

export function rewardRowsForAccount(row: DashboardV1AdminRow): RewardPayoutRow[] {
  const programs: RewardProgram[] = ["ARPMP26", "ARUTY26", "ARSQL26"];
  const output: RewardPayoutRow[] = [];

  for (const program of programs) {
    const source = rewardSource(row.rewards, program);
    if (!source?.enrolled) continue;

    output.push({
      acctId: row.acctId,
      businessName: row.businessName,
      accountNumbers: row.accountNumbers,
      lab: row.lab,
      program,
      qualifiedJobs: source.qualifiedJobs,
      payout: source.payout,
      pmJobs: row.pmJobs,
      pmTierJobs: row.pmTierJobs,
      locations: locationPayoutRows(row, program, source),
    });
  }

  return output;
}

const LAB_ORDER = ["Pacific Artisan Labs", "Peak Artisan Labs", "Pike Artisan Labs"];
const NON_PACIFIC_LAB_ORDER = ["Peak Artisan Labs", "Pike Artisan Labs"];

function sumLocationMonthly(
  locations: RewardLocationPayout[],
  field: "qualifiedJobs" | "payout"
) {
  return PERIODS.reduce<PortalDashboardV1MonthlyNumber>(
    (total, period) => ({
      ...total,
      [period]: locations.reduce(
        (sum, location) => sum + location[field][period],
        0
      ),
    }),
    { ...ZERO_MONTHLY }
  );
}

function consolidateSharedLabAccounts(locations: RewardLocationPayout[]) {
  const byAccount = new Map<string, RewardLocationPayout[]>();
  for (const location of locations) {
    const accountKey = location.accountNumber.trim() || location.locationKey;
    byAccount.set(accountKey, [...(byAccount.get(accountKey) ?? []), location]);
  }

  return [...byAccount.values()].map((accountLocations) => {
    if (accountLocations.length === 1) return accountLocations[0];

    const preferredLab = NON_PACIFIC_LAB_ORDER.find((lab) =>
      accountLocations.some((location) => location.lab === lab)
    );
    const canonical =
      accountLocations.find((location) => location.lab === preferredLab) ??
      accountLocations[0];

    return {
      ...canonical,
      lab: preferredLab ?? canonical.lab,
      qualifiedJobs: sumLocationMonthly(accountLocations, "qualifiedJobs"),
      payout: sumLocationMonthly(accountLocations, "payout"),
      payoutDerivedFromGroupRate: accountLocations.some(
        (location) => location.payoutDerivedFromGroupRate
      ),
    };
  });
}

function effectiveLocationsForLabGrouping(row: RewardPayoutRow) {
  const rowLabIsPeakOrPike = NON_PACIFIC_LAB_ORDER.includes(row.lab);
  if (!rowLabIsPeakOrPike || row.locations.length !== 1) return row.locations;

  const [location] = row.locations;
  if (location.lab !== "Pacific Artisan Labs") return row.locations;

  // Some enrolled accounts (Optical Outlook is the current example) have a
  // Pacific enrollment row but their Power BI account total belongs to Peak or
  // Pike. With a single physical account, the Power BI lab is authoritative
  // for where the combined payout is issued.
  return [{ ...location, lab: row.lab }];
}

export function groupRewardRowsByLab(rows: RewardPayoutRow[]) {
  const groups = new Map<string, RewardPayoutRow[]>();
  for (const row of rows) {
    const effectiveLocations = effectiveLocationsForLabGrouping(row);
    const splitAcrossLabs = new Set(
      effectiveLocations.map((location) => location.lab || row.lab || "Lab unavailable")
    ).size > 1;
    const locationsByLab = new Map<string, RewardLocationPayout[]>();
    for (const location of consolidateSharedLabAccounts(effectiveLocations)) {
      const lab = location.lab || row.lab || "Lab unavailable";
      locationsByLab.set(lab, [...(locationsByLab.get(lab) ?? []), location]);
    }

    for (const [lab, locations] of locationsByLab) {
      groups.set(lab, [
        ...(groups.get(lab) ?? []),
        {
          ...row,
          lab,
          locations,
          accountNumbers: locations
            .map((location) => location.accountNumber)
            .filter((accountNumber, index, all) => all.indexOf(accountNumber) === index)
            .join(", "),
          qualifiedJobs: splitAcrossLabs
            ? sumLocationMonthly(locations, "qualifiedJobs")
            : row.qualifiedJobs,
          payout: splitAcrossLabs ? sumLocationMonthly(locations, "payout") : row.payout,
        },
      ]);
    }
  }

  return [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = LAB_ORDER.indexOf(left);
    const rightIndex = LAB_ORDER.indexOf(right);
    if (leftIndex >= 0 || rightIndex >= 0) {
      if (leftIndex < 0) return 1;
      if (rightIndex < 0) return -1;
      return leftIndex - rightIndex;
    }
    return left.localeCompare(right);
  });
}
