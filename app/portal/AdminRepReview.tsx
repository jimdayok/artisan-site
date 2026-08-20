import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Sparkles, Users } from "lucide-react";
import type {
  AdminNewCustomer,
  AdminRepMovement,
  AdminRepReviewModel,
} from "@/lib/portal/adminRepReview";

function money(value: number | null) {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percentage(value: number | null) {
  if (value === null) return "Unavailable";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function month(value: string) {
  const parsed = new Date(`${value}-01T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(parsed);
}

function MovementList({
  title,
  items,
  direction,
}: {
  title: string;
  items: AdminRepMovement[];
  direction: "up" | "down";
}) {
  const Icon = direction === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <article className="rounded-md border border-[#d8c49b] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#172a28]">{title}</h3>
        <Icon className={`h-5 w-5 ${direction === "up" ? "text-[#23694e]" : "text-[#9a3f31]"}`} aria-hidden="true" />
      </div>
      <ol className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={`${direction}-${item.accountId}`} className="border-t border-[#eee5d7] pt-3 first:border-0 first:pt-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/portal/admin/account-analysis/${encodeURIComponent(item.accountId)}`} className="font-semibold text-[#172a28] hover:underline">
                  {item.accountName}
                </Link>
                <p className="mt-1 text-xs text-[#706759]">{item.repName} · {item.repCode}</p>
              </div>
              <p className={`shrink-0 font-semibold ${direction === "up" ? "text-[#23694e]" : "text-[#9a3f31]"}`}>
                {item.change > 0 ? "+" : ""}{money(item.change)}
              </p>
            </div>
            <p className="mt-1 text-xs text-[#8a8175]">{money(item.previousPreviousMonthSales)} → {money(item.previousMonthSales)}</p>
          </li>
        ))}
      </ol>
      {!items.length ? <p className="mt-4 text-sm text-[#706759]">No qualifying accounts in the current source.</p> : null}
    </article>
  );
}

function NewCustomerList({ items }: { items: AdminNewCustomer[] }) {
  return (
    <article className="rounded-md border border-[#d8c49b] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#172a28]">New customers</h3>
        <Sparkles className="h-5 w-5 text-[#b58a45]" aria-hidden="true" />
      </div>
      <ol className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={`new-${item.accountId}`} className="border-t border-[#eee5d7] pt-3 first:border-0 first:pt-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/portal/admin/account-analysis/${encodeURIComponent(item.accountId)}`} className="font-semibold text-[#172a28] hover:underline">
                  {item.accountName}
                </Link>
                <p className="mt-1 text-xs text-[#706759]">{item.repName} · first positive sale {month(item.firstSalesMonth)}</p>
              </div>
              <p className="shrink-0 font-semibold text-[#23694e]">{money(item.firstSalesAmount)}</p>
            </div>
          </li>
        ))}
      </ol>
      {!items.length ? <p className="mt-4 text-sm text-[#706759]">No newly selling accounts were identified in the current or previous month.</p> : null}
    </article>
  );
}

export default function AdminRepReview({ model }: { model: AdminRepReviewModel }) {
  return (
    <section id="rep-review" className="mt-8 scroll-mt-24 rounded-md border border-[#d8c49b] bg-[#fffaf1]/94 p-5 shadow-[0_20px_60px_rgba(23,42,40,0.09)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Admin rep review</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#172a28]">Heather and Josh at a glance</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#706759]">
            Current-month sales are partial through the source refresh. Completed-month rankings compare {model.periodLabels.previous} with {model.periodLabels.previousPrevious}.
          </p>
        </div>
        <span className={`rounded-full px-3 py-2 text-xs font-semibold ${model.sourceStatus === "ready" ? "bg-[#e8f4ee] text-[#24543a]" : "bg-[#fff1d7] text-[#805519]"}`}>
          {model.sourceStatus === "ready" ? "Net Sales connected" : model.sourceStatus.replace("-", " ")}
        </span>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {model.reps.map((rep) => (
          <article key={rep.code} className="rounded-md border border-[#d8c49b] bg-white p-5 shadow-[0_14px_38px_rgba(23,42,40,0.06)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b7650]">{rep.code}</p>
                <h3 className="mt-1 text-2xl font-semibold text-[#172a28]">{rep.name}</h3>
              </div>
              <Link href={`/portal/admin?repView=${encodeURIComponent(rep.code)}`} className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#172a28] px-4 text-xs font-semibold text-white">
                Operate as {rep.name.split(" ")[0]}
              </Link>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">Customers</dt><dd className="mt-1 text-2xl font-semibold">{rep.customerCount}</dd><p className="mt-1 text-xs text-[#706759]">{rep.activeCustomers ?? "Unavailable"} active</p></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">{model.periodLabels.current}</dt><dd className="mt-1 text-2xl font-semibold">{money(rep.currentMonthSales)}</dd><p className="mt-1 text-xs text-[#706759]">Partial month</p></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">{model.periodLabels.previous}</dt><dd className="mt-1 text-2xl font-semibold">{money(rep.previousMonthSales)}</dd><p className="mt-1 text-xs text-[#706759]">Completed month</p></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">Current vs previous</dt><dd className="mt-1 text-xl font-semibold">{percentage(rep.currentVsPreviousGrowth)}</dd><p className="mt-1 text-xs text-[#706759]">Partial vs completed</p></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">Completed growth</dt><dd className="mt-1 text-xl font-semibold">{percentage(rep.completedMonthGrowth)}</dd><p className="mt-1 text-xs text-[#706759]">{model.periodLabels.previous} vs {model.periodLabels.previousPrevious}</p></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">13-mo cumulative</dt><dd className="mt-1 text-xl font-semibold">{money(rep.trailing13MonthSales)}</dd><p className="mt-1 text-xs text-[#706759]">Completed months</p></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">Year to date</dt><dd className="mt-1 text-xl font-semibold">{money(rep.yearToDateSales)}</dd></div>
              <div className="rounded-md bg-[#f8f3ea] p-3"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b7650]">Declining</dt><dd className="mt-1 text-xl font-semibold">{rep.decliningCustomers ?? "Unavailable"}</dd><p className="mt-1 text-xs text-[#706759]">customers</p></div>
              <div className="flex items-center gap-3 rounded-md bg-[#172a28] p-3 text-white"><Users className="h-5 w-5 text-[#d8c49b]" aria-hidden="true" /><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">Scope</p><p className="mt-1 text-sm font-semibold">{rep.customerCount} assigned only</p></div></div>
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <MovementList title="Top 5 up" items={model.topUp} direction="up" />
        <MovementList title="Top 5 down" items={model.topDown} direction="down" />
        <NewCustomerList items={model.newCustomers} />
      </div>

      <p className="mt-4 text-xs leading-5 text-[#706759]">
        {model.sourceMessage} New customers are accounts whose first positive sale in the available history occurred in {model.periodLabels.current} or {model.periodLabels.previous}.
      </p>
    </section>
  );
}
