import Link from "next/link";
import { headers } from "next/headers";
import { Activity, CircleDollarSign, MapPin, Package, Search } from "lucide-react";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getDashboardV1AdminRows } from "@/lib/portal/adminDashboardV1";
import {
  groupRewardRowsByLab,
  rewardRowsForAccount,
  type RewardPayoutRow,
} from "@/lib/portal/rewardsPayout";
import { AdminAccessRequired, AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

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

function ProgramBadge({ program }: { program: RewardPayoutRow["program"] }) {
  const tone =
    program === "ARSQL26"
      ? "border-[#2f5f9c] bg-[#eef4ff] text-[#2f5f9c]"
      : program === "ARUTY26"
        ? "border-[#1f8a70] bg-[#f1fbf4] text-[#1f6b45]"
        : "border-[#c9a24f] bg-[#fff9e8] text-[#7a5b16]";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{programName(program)} · {program}</span>;
}

function LocationBreakdown({ row, pmMonth }: { row: RewardPayoutRow; pmMonth: string }) {
  const hasDerivedPayout = row.locations.some(
    (location) => location.payoutDerivedFromGroupRate
  );

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-[#eadfce] bg-[#fffaf1]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eadfce] px-3 py-2">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#6c5b3d]">
          <MapPin className="h-3.5 w-3.5" /> Physical location payout
        </p>
        <p className="text-xs text-[#706759]">Group total remains the payout control total.</p>
      </div>
      <div className="mobile-scroll-row overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-[#f2eadc] text-[#51493e]">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Location</th>
              <th className="px-3 py-2 text-right font-semibold">{pmMonth} qualified</th>
              <th className="px-3 py-2 text-right font-semibold">{pmMonth} reward</th>
            </tr>
          </thead>
          <tbody>
            {row.locations.map((location) => (
              <tr key={`${row.acctId}-${row.program}-${location.locationKey}`} className="border-t border-[#eadfce] first:border-t-0">
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-[#172a28]">{location.accountName}</p>
                  <p className="mt-0.5 text-[#706759]">Account {location.accountNumber} · {location.lab || row.lab}</p>
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-[#172a28]">{count(location.qualifiedJobs.pm)}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-[#172a28]">{money(location.payout.pm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasDerivedPayout ? (
        <p className="border-t border-[#eadfce] px-3 py-2 text-xs leading-5 text-[#706759]">
          Sequel location rewards are calculated from the group&apos;s reward-per-qualified-job rate because the current location export contains qualified counts but not location reward amounts.
        </p>
      ) : null}
    </div>
  );
}

function RewardsTable({ rows, pmMonth, ppmMonth }: { rows: RewardPayoutRow[]; pmMonth: string; ppmMonth: string }) {
  return (
    <div className="mobile-scroll-row overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#172a28] text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Group account</th>
            <th className="px-4 py-3 font-semibold">Program</th>
            <th className="px-4 py-3 font-semibold">PM Rewards</th>
            <th className="px-4 py-3 font-semibold">Previous Month</th>
            <th className="px-4 py-3 font-semibold">PPM Reference</th>
            <th className="px-4 py-3 font-semibold">Current Month</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.acctId}-${row.program}`} className="border-b border-[#eadfce] bg-white/70 align-top last:border-b-0">
              <td className="min-w-80 px-4 py-4">
                <Link href={`/portal/admin/account-analysis/${encodeURIComponent(row.acctId)}`} className="font-semibold text-[#172a28] underline-offset-4 hover:underline">
                  {row.businessName}
                </Link>
                <p className="mt-1 text-xs text-[#706759]">{row.acctId} · {row.lab || "Lab unavailable"}</p>
                <p className="mt-1 text-xs text-[#706759]">Accounts {row.accountNumbers || "—"}</p>
                <LocationBreakdown row={row} pmMonth={pmMonth} />
              </td>
              <td className="px-4 py-4">
                <ProgramBadge program={row.program} />
              </td>
              <td className="px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b7650]">PM Rewards · {pmMonth}</p>
                <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#172a28]">{money(row.payout.pm)}</p>
                <p className="mt-2 text-sm font-semibold text-[#172a28]">{count(row.qualifiedJobs.pm)} PM qualified orders</p>
                <p className="mt-1 text-sm text-[#706759]">PM Loyalty Tier: <span className="font-semibold text-[#172a28]">{monthlyTierLabel(row.pmTierJobs)}</span></p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-3 w-24 overflow-hidden rounded-full bg-[#eadfce]">
                    <div className="h-full rounded-full bg-[#1f8a70]" style={{ width: `${tierFillFromJobs(row.pmTierJobs)}%` }} />
                  </div>
                  <span className="text-xs text-[#706759]">{count(row.pmTierJobs)} tier jobs</span>
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
  );
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
    return [
      row.businessName,
      row.acctId,
      row.accountNumbers,
      row.lab,
      row.program,
      ...row.locations.flatMap((location) => [location.accountNumber, location.accountName]),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  const totalPmPayout = filtered.reduce((total, row) => total + row.payout.pm, 0);
  const totalCmPayout = filtered.reduce((total, row) => total + row.payout.cm, 0);
  const totalPmJobs = filtered.reduce((total, row) => total + row.qualifiedJobs.pm, 0);
  const pmMonth = relativeMonthLabel(1);
  const ppmMonth = relativeMonthLabel(2);
  const labGroups = groupRewardRowsByLab(filtered).map(([lab, rows]) => ({
    lab,
    rows,
    physicalLocationCount: new Set(
      rows.flatMap((row) => row.locations.map((location) => location.accountNumber))
    ).size,
    pmPayout: rows
      .flatMap((row) => row.locations)
      .reduce((total, location) => total + location.payout.pm, 0),
  }));

  return (
    <AdminShell title="Rewards Payout Reference" adminEmail={adminEmail} eyebrow="ALN Rewards Admin">
      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Customer Service Lookup</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">Rewards payouts by lab, group, and physical location</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#706759]">
          PM ({pmMonth}) is the primary payout reference for customer service. Only active ARPMP26, ARUTY26, and ARSQL26 enrollments from Lookup_Artisan Rewards are included.
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
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b7650]">Active Program Rows</p>
          <p className="mt-2 text-3xl font-semibold text-[#172a28]">{count(filtered.length)}</p>
          <p className="mt-1 text-xs text-[#706759]">from the rewards enrollment workbook</p>
        </article>
        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
          <Package className="h-5 w-5 text-[#8b7650]" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b7650]">PM Qualified Jobs</p>
          <p className="mt-2 text-3xl font-semibold text-[#172a28]">{count(totalPmJobs)}</p>
          <p className="mt-1 text-xs text-[#706759]">across filtered enrolled rows</p>
        </article>
        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
          <CircleDollarSign className="h-5 w-5 text-[#8b7650]" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b7650]">PM Rewards · {pmMonth}</p>
          <p className="mt-2 text-3xl font-semibold text-[#172a28]">{money(totalPmPayout)}</p>
          <p className="mt-1 text-xs text-[#706759]">CM current {money(totalCmPayout)}</p>
        </article>
      </section>

      <div className="mt-8 space-y-8">
        {labGroups.map((group) => (
          <section key={group.lab} className="overflow-hidden rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8c49b] bg-[#f4ead8] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b7650]">Lab payout section</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">{group.lab}</h3>
                <p className="mt-1 text-xs text-[#706759]">
                  {count(group.rows.length)} active program rows · {count(group.physicalLocationCount)} physical accounts
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7650]">{pmMonth} lab-location rewards</p>
                <p className="mt-1 text-2xl font-semibold text-[#172a28]">{money(group.pmPayout)}</p>
              </div>
            </div>
            <RewardsTable rows={group.rows} pmMonth={pmMonth} ppmMonth={ppmMonth} />
          </section>
        ))}
        {filtered.length === 0 ? (
          <section className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
            <p className="text-sm text-[#706759]">No rewards accounts match the current filters.</p>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
