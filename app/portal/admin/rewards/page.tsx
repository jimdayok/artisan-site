import Link from "next/link";
import { headers } from "next/headers";
import { Activity, CircleDollarSign, Package, Search } from "lucide-react";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getDashboardV1AdminRows, type DashboardV1AdminRow } from "@/lib/portal/adminDashboardV1";
import { AdminAccessRequired, AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type RewardPayoutRow = {
  acctId: string;
  businessName: string;
  accountNumbers: string;
  lab: string;
  program: "ARPMP26" | "ARUTY26" | "ARSQL26";
  qualifiedJobs: { ppm: number; pm: number; cm: number };
  payout: { ppm: number; pm: number; cm: number };
  pmJobs: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function count(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function pctChange(current: number, prior: number) {
  if (prior === 0 && current > 0) return "New";
  if (prior === 0) return "0%";
  const value = ((current - prior) / Math.abs(prior)) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function programName(program: RewardPayoutRow["program"]) {
  if (program === "ARPMP26") return "PMP Rewards";
  if (program === "ARSQL26") return "Sequel Rewards";
  return "Unity Rewards";
}

function monthlyTierLabel(jobs: number) {
  if (jobs > 100) return "Tier 4";
  if (jobs >= 61) return "Tier 3";
  if (jobs >= 21) return "Tier 2";
  return "Tier 1";
}

function tierFillFromJobs(jobs: number) {
  if (jobs > 100) return 100;
  if (jobs >= 61) return 75;
  if (jobs >= 21) return 50;
  return 25;
}

function relativeMonthLabel(offset: number, anchor = new Date()) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1)
  );
}

function rewardRowsForAccount(row: DashboardV1AdminRow): RewardPayoutRow[] {
  const rewards = row.rewards;
  const output: RewardPayoutRow[] = [];

  if (rewards.arpmp26?.enrolled) {
    output.push({
      acctId: row.acctId,
      businessName: row.businessName,
      accountNumbers: row.accountNumbers,
      lab: row.lab,
      program: "ARPMP26",
      qualifiedJobs: rewards.arpmp26.qualified_pmp_jobs,
      payout: rewards.arpmp26.rebate_total,
      pmJobs: row.pmJobs,
    });
  }

  if (rewards.aruty26?.enrolled) {
    output.push({
      acctId: row.acctId,
      businessName: row.businessName,
      accountNumbers: row.accountNumbers,
      lab: row.lab,
      program: "ARUTY26",
      qualifiedJobs: rewards.aruty26.qualified_jobs,
      payout: rewards.aruty26.rewards_earned,
      pmJobs: row.pmJobs,
    });
  }

  if (rewards.arsql26?.enrolled) {
    output.push({
      acctId: row.acctId,
      businessName: row.businessName,
      accountNumbers: row.accountNumbers,
      lab: row.lab,
      program: "ARSQL26",
      qualifiedJobs: rewards.arsql26.qualified_sequel_pal_jobs,
      payout: rewards.arsql26.rebate_total,
      pmJobs: row.pmJobs,
    });
  }

  return output;
}

function ProgramBadge({ program }: { program: RewardPayoutRow["program"] }) {
  const tone =
    program === "ARSQL26"
      ? "border-[#2f5f9c] bg-[#eef4ff] text-[#2f5f9c]"
      : program === "ARUTY26"
        ? "border-[#1f8a70] bg-[#f1fbf4] text-[#1f6b45]"
        : "border-[#c9a24f] bg-[#fff9e8] text-[#7a5b16]";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{programName(program)} · {program}</span>;
}

export default async function AdminRewardsPayoutsPage({ searchParams }: { searchParams?: Promise<{ q?: string; program?: string }> }) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const query = (await searchParams) ?? {};
  const search = String(query.q || "").trim().toLowerCase();
  const programFilter = String(query.program || "").trim().toUpperCase();
  const allRows = getDashboardV1AdminRows().flatMap(rewardRowsForAccount);
  const filtered = allRows.filter((row) => {
    if (programFilter && row.program !== programFilter) return false;
    if (!search) return true;
    return [row.businessName, row.acctId, row.accountNumbers, row.lab, row.program]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  const totalPmPayout = filtered.reduce((total, row) => total + row.payout.pm, 0);
  const totalCmPayout = filtered.reduce((total, row) => total + row.payout.cm, 0);
  const totalPmJobs = filtered.reduce((total, row) => total + row.qualifiedJobs.pm, 0);
  const pmMonth = relativeMonthLabel(1);
  const ppmMonth = relativeMonthLabel(2);

  return (
    <AdminShell title="Rewards Payout Reference" adminEmail={adminEmail} eyebrow="ALN Rewards Admin">
      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Customer Service Lookup</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">Enrolled rewards accounts and payout activity</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#706759]">
          This page only shows accounts enrolled in ARPMP26, ARUTY26, or ARSQL26. PM ({pmMonth}) is the primary payout reference for customer service; CM is current month-to-date activity.
        </p>
        <form className="mt-6 flex flex-wrap items-end gap-3">
          <label className="grid min-w-72 flex-1 gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b7650]">
            Search
            <input name="q" defaultValue={query.q || ""} placeholder="Search account, Acct ID, lab, program" className="min-h-12 rounded-md border border-[#d8c49b] bg-[#fffaf1] px-4 text-sm font-medium normal-case tracking-normal text-[#172a28] outline-none focus:border-[#172a28]" />
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b7650]">
            Program
            <select name="program" defaultValue={programFilter} className="min-h-12 rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm font-medium normal-case tracking-normal text-[#172a28] outline-none focus:border-[#172a28]">
              <option value="">All Programs</option>
              <option value="ARPMP26">ARPMP26</option>
              <option value="ARUTY26">ARUTY26</option>
              <option value="ARSQL26">ARSQL26</option>
            </select>
          </label>
          <button className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:bg-[#27433f]">
            <Search className="h-4 w-4" /> Apply
          </button>
        </form>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
          <Activity className="h-5 w-5 text-[#8b7650]" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b7650]">Enrolled Program Rows</p>
          <p className="mt-2 text-3xl font-semibold text-[#172a28]">{count(filtered.length)}</p>
          <p className="mt-1 text-xs text-[#706759]">program enrollments</p>
        </article>
        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
          <Package className="h-5 w-5 text-[#8b7650]" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b7650]">PM Qualified Jobs</p>
          <p className="mt-2 text-3xl font-semibold text-[#172a28]">{count(totalPmJobs)}</p>
          <p className="mt-1 text-xs text-[#706759]">across filtered rows</p>
        </article>
        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
          <CircleDollarSign className="h-5 w-5 text-[#8b7650]" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b7650]">PM Rewards · {pmMonth}</p>
          <p className="mt-2 text-3xl font-semibold text-[#172a28]">{money(totalPmPayout)}</p>
          <p className="mt-1 text-xs text-[#706759]">CM current {money(totalCmPayout)}</p>
        </article>
      </section>

      <section className="mt-8 overflow-hidden rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#172a28] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Program</th>
                <th className="px-4 py-3 font-semibold">PM Rewards</th>
                <th className="px-4 py-3 font-semibold">Previous Month</th>
                <th className="px-4 py-3 font-semibold">PPM Reference</th>
                <th className="px-4 py-3 font-semibold">Current Month</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row.acctId}-${row.program}`} className="border-b border-[#eadfce] bg-white/70 align-top last:border-b-0">
                  <td className="px-4 py-4">
                    <Link href={`/portal/admin/account-analysis/${encodeURIComponent(row.acctId)}`} className="font-semibold text-[#172a28] underline-offset-4 hover:underline">
                      {row.businessName}
                    </Link>
                    <p className="mt-1 text-xs text-[#706759]">{row.acctId} · {row.lab || "Lab unavailable"}</p>
                    <p className="mt-1 text-xs text-[#706759]">Accounts {row.accountNumbers || "—"}</p>
                  </td>
                  <td className="px-4 py-4"><ProgramBadge program={row.program} /></td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7650]">PM Rewards · {pmMonth}</p>
                    <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#172a28]">{money(row.payout.pm)}</p>
                    <p className="mt-2 text-sm font-semibold text-[#172a28]">{count(row.qualifiedJobs.pm)} PM qualified orders</p>
                    <p className="mt-1 text-sm text-[#706759]">PM Loyalty Tier: <span className="font-semibold text-[#172a28]">{monthlyTierLabel(row.pmJobs)}</span></p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-3 w-24 overflow-hidden rounded-full bg-[#eadfce]">
                        <div className="h-full rounded-full bg-[#1f8a70]" style={{ width: `${tierFillFromJobs(row.pmJobs)}%` }} />
                      </div>
                      <span className="text-xs text-[#706759]">{count(row.pmJobs)} jobs</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#706759]">
                    <p className="font-semibold text-[#172a28]">{pmMonth}</p>
                    <p>Qualified: <span className="font-semibold text-[#172a28]">{count(row.qualifiedJobs.pm)}</span></p>
                    <p>Total rebate: <span className="font-semibold text-[#172a28]">{money(row.payout.pm)}</span></p>
                    <p>PM vs PPM orders: <span className="font-semibold text-[#172a28]">{pctChange(row.qualifiedJobs.pm, row.qualifiedJobs.ppm)}</span></p>
                  </td>
                  <td className="px-4 py-4 text-[#706759]">
                    <p className="font-semibold text-[#172a28]">{ppmMonth}</p>
                    {row.qualifiedJobs.ppm > 0 || row.payout.ppm > 0 ? (
                      <>
                        <p>Qualified: <span className="font-semibold text-[#172a28]">{count(row.qualifiedJobs.ppm)}</span></p>
                        <p>Total rebate: <span className="font-semibold text-[#172a28]">{money(row.payout.ppm)}</span></p>
                      </>
                    ) : (
                      <p>PPM reward fields are not loaded in the current data feed.</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[#706759]">
                    <p className="font-semibold text-[#172a28]">Current month-to-date</p>
                    <p>Qualified: <span className="font-semibold text-[#172a28]">{count(row.qualifiedJobs.cm)}</span></p>
                    <p>Rebate: <span className="font-semibold text-[#172a28]">{money(row.payout.cm)}</span></p>
                    <p>CM vs PM orders: <span className="font-semibold text-[#172a28]">{pctChange(row.qualifiedJobs.cm, row.qualifiedJobs.pm)}</span></p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-[#706759]">No enrolled rewards accounts match the current filters.</p>
        ) : null}
      </section>
    </AdminShell>
  );
}
