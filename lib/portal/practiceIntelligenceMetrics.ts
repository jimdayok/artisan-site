export type MonthlyMetric = {
  ppm?: number;
  pm?: number;
  cm?: number;
};

function finiteNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function resolveJobsPerDay({
  dashboardJobsPerDay,
  workbookJobsPerDay,
  jobs,
  elapsedBusinessDays,
}: {
  dashboardJobsPerDay?: unknown;
  workbookJobsPerDay?: unknown;
  jobs: unknown;
  elapsedBusinessDays: number;
}) {
  const dashboardValue = finiteNumber(dashboardJobsPerDay);
  if (dashboardValue > 0) return dashboardValue;

  const workbookValue = finiteNumber(workbookJobsPerDay);
  if (workbookValue > 0) return workbookValue;

  const jobCount = finiteNumber(jobs);
  return jobCount > 0 ? jobCount / Math.max(1, elapsedBusinessDays) : null;
}

export function calculateVspMix(totalJobs: unknown, vspJobs: unknown) {
  const total = Math.max(0, finiteNumber(totalJobs));
  const vsp = Math.min(total, Math.max(0, finiteNumber(vspJobs)));
  const nonVsp = Math.max(0, total - vsp);

  return {
    totalJobs: total,
    vspJobs: vsp,
    nonVspJobs: nonVsp,
    vspShare: total > 0 ? (vsp / total) * 100 : 0,
    nonVspShare: total > 0 ? (nonVsp / total) * 100 : 0,
  };
}

export function calculateArMix(
  preferredJobs?: MonthlyMetric,
  nonPreferredJobs?: MonthlyMetric
) {
  const share = (preferred: unknown, nonPreferred: unknown) => {
    const inHouse = Math.max(0, finiteNumber(preferred));
    const outsourced = Math.max(0, finiteNumber(nonPreferred));
    const total = inHouse + outsourced;
    return {
      inHouse,
      outsourced,
      inHouseShare: total > 0 ? (inHouse / total) * 100 : 0,
      outsourcedShare: total > 0 ? (outsourced / total) * 100 : 0,
    };
  };

  return {
    ppm: share(preferredJobs?.ppm, nonPreferredJobs?.ppm),
    pm: share(preferredJobs?.pm, nonPreferredJobs?.pm),
    cm: share(preferredJobs?.cm, nonPreferredJobs?.cm),
  };
}
