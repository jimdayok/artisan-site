import Link from "next/link";
import { getAuthorizedPortalSectionForPage } from "@/lib/portal/priceListAccess";
import {
  getLatestPerformanceByAccountNumber,
  getPerformanceByAccountNumber,
  type MonthlyPerformanceRecord,
} from "@/lib/portal/performance";
import PriceListAccessMessage from "../price-list/PriceListAccessMessage";
import {
  getPortalDashboardV1ByAccount,
  getPortalPeerBenchmarks,
} from "@/lib/portal/dashboardV1";
import { shouldShowAccountDrillDown } from "@/lib/portal/accountScope";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber) return month;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.09)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#172a28]">
        {value}
      </p>
      {detail ? (
        <p className="mt-3 text-sm leading-6 text-[#706759]">{detail}</p>
      ) : null}
    </div>
  );
}

function MiniBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm text-[#5b5245]">
        <span>{label}</span>
        <span className="font-semibold text-[#172a28]">
          {numberFormatter.format(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden bg-[#e8ddca]">
        <div className="h-full bg-[#172a28]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function RecentActivity({ records }: { records: MonthlyPerformanceRecord[] }) {
  const recentRecords = records.slice(-4).reverse();
  const maxPairs = Math.max(...recentRecords.map((record) => record.lensPairs), 0);

  if (recentRecords.length === 0) return null;

  return (
    <section className="mt-10 border border-[#d8c49b] bg-[#fffaf1]/72 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
      <div className="mb-7 border-b border-[#d8c49b] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8b7650]">
          Recent Volume
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
          Lens pair trend
        </h2>
      </div>
      <div className="space-y-5">
        {recentRecords.map((record) => (
          <MiniBar
            key={record.month}
            label={formatMonth(record.month)}
            value={record.lensPairs}
            max={maxPairs}
          />
        ))}
      </div>
    </section>
  );
}

export default async function PortalPerformancePage() {
  const access = await getAuthorizedPortalSectionForPage("performance");

  if (access.status === "unauthenticated") {
    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (access.status !== "authorized") {
    return (
      <PriceListAccessMessage message="You do not have access to this private resource." />
    );
  }

  const records = getPerformanceByAccountNumber(access.customer.accountNumber);
  const latestRecord = getLatestPerformanceByAccountNumber(
    access.customer.accountNumber
  );
  const completedRecord = records.at(-2);
  const priorRecord = records.at(-3);
  const benchmarks = getPortalPeerBenchmarks(access.customer.accountNumber);
  const dashboardState = getPortalDashboardV1ByAccount(
    access.customer.accountNumber
  );
  const showAccountDrillDown = shouldShowAccountDrillDown({
    acctId: dashboardState.account?.account_id,
    allAccountNumbers: dashboardState.account?.all_account_numbers,
  });
  const completedGrowth =
    completedRecord && priorRecord && priorRecord.lensPairs > 0
      ? ((completedRecord.lensPairs - priorRecord.lensPairs) / priorRecord.lensPairs) * 100
      : null;

  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-10 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/portal"
          className="inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650] transition hover:text-[#172a28]"
        >
          Back to portal
        </Link>
        <div className="mt-10 border-b border-[#d8c49b] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8b7650]">
            Performance Review
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-[#172a28] sm:text-6xl">
            {access.customer.practiceName}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#706759]">
            Account {access.customer.accountNumber}. Monthly performance is
            visible only to assigned portal users.
          </p>
        </div>

        {showAccountDrillDown ? (
          <p className="mt-8 rounded-2xl border border-[#cfb88d] bg-[#fff8e8] px-4 py-3 text-sm font-semibold text-[#6f5422]">
            Coming Soon: Drill Down by Account
          </p>
        ) : null}

        {latestRecord ? (
          <>
            <section className="mt-8">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
                Latest period: {formatMonth(latestRecord.month)}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  label="Lens Pairs"
                  value={numberFormatter.format(latestRecord.lensPairs)}
                  detail="Total completed lens pairs."
                />
                <StatCard
                  label="Total Purchases"
                  value={currencyFormatter.format(latestRecord.totalSales)}
                  detail="Total lab purchases for the month."
                />
                <StatCard
                  label="Private Pay"
                  value={currencyFormatter.format(latestRecord.privatePaySales)}
                  detail="Private pay purchase activity."
                />
                <StatCard
                  label="Premium Pairs"
                  value={numberFormatter.format(latestRecord.premiumPairs)}
                  detail="Premium lens pair volume."
                />
                <StatCard
                  label="Practice-Origin Remakes"
                  value={numberFormatter.format(latestRecord.remakes)}
                  detail="Estimated from practice-origin remake activity; lab-redo information is excluded."
                />
              </div>
            </section>
            <section className="mt-10 border border-[#d8c49b] bg-[#fffaf1]/72 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8b7650]">Average Practice at Lab Benchmarks</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">Understand your position without exposing another practice or lab</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#706759]">Benchmarks compare the signed-in practice with average-practice percentages and timing. No practice count, lab-wide totals, or individual-practice data is shown.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Office Remake Average" value={benchmarks.medianOfficeRedoPct === null ? "Pending" : `${benchmarks.medianOfficeRedoPct.toFixed(1)}%`} detail="Completed-month average practice at lab." />
                <StatCard label="Warranty Average" value={benchmarks.medianWarrantyPct === null ? "Pending" : `${benchmarks.medianWarrantyPct.toFixed(1)}%`} detail="Completed-month average practice at lab." />
                <StatCard label="Non-Adapt Average" value={benchmarks.medianNonAdaptPct === null ? "Pending" : `${benchmarks.medianNonAdaptPct.toFixed(1)}%`} detail="Completed-month average practice at lab." />
                <StatCard
                  label="Growth Position"
                  value={benchmarks.growthPercentile === null ? "Pending" : `${benchmarks.growthPercentile}th percentile`}
                  detail={completedGrowth === null ? "Completed-month comparison pending." : `Your completed-month lens-pair change: ${completedGrowth >= 0 ? "+" : ""}${completedGrowth.toFixed(1)}%. Peer direction and totals remain private.`}
                />
              </div>
            </section>
            <RecentActivity records={records} />
          </>
        ) : (
          <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/82 p-8 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
              No performance data available yet.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#706759]">
              This account is approved for performance reviews, but no monthly
              performance rows are currently assigned to its account number.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
