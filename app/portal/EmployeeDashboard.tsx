"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clipboard,
  ExternalLink,
  FileText,
  Gauge,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type {
  DashboardMetric,
  EmployeeCustomerRow,
  EmployeeDashboardModel,
} from "@/lib/portal/employeeDashboard";

type RepOption = { code: string; label: string };
type CustomerSort = "attention" | "sales-decline" | "jobs-decline" | "recent" | "name";

const EmployeeSalesChart = dynamic(
  () => import("@/app/portal/EmployeeSalesChart"),
  {
    loading: () => (
      <div className="h-[320px] animate-pulse rounded-md border border-[#e2d5bf] bg-[#f8f3ea]" aria-label="Loading sales chart" />
    ),
  }
);

const customerTypeLabels: Record<string, string> = {
  ACQU: "Acquios Alliance",
  AQUI: "Acquios Alliance",
  PART: "Partner",
  GENL: "General Customer",
  PMP: "PMP Customer",
  NL: "Neurolens Customer",
  VSP: "VSP Customer",
  VSP1: "VSP Customer",
};

function currency(value: number | null) {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function count(value: number | null, maximumFractionDigits = 0) {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function percent(value: number | null) {
  if (value === null) return "Unavailable";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function date(value: string) {
  if (!value) return "Unavailable";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
}

function customerType(value: string) {
  return customerTypeLabels[value.trim().toUpperCase()] || value || "Unclassified";
}

function metricDisplay(metric: DashboardMetric, format: "currency" | "count" | "percent") {
  if (metric.state === "not-configured") return "Not connected";
  if (metric.state === "not-refreshed") return "Refresh pending";
  if (metric.state === "error") return "Source error";
  if (metric.state === "missing" || metric.value === null) return "Unavailable";
  if (format === "currency") return currency(metric.value);
  if (format === "percent") return percent(metric.value);
  return count(metric.value);
}

function MetricCard({
  label,
  metric,
  format,
  icon: Icon,
}: {
  label: string;
  metric: DashboardMetric;
  format: "currency" | "count" | "percent";
  icon: typeof Users;
}) {
  const unavailable = new Set(["missing", "not-refreshed", "not-configured", "error"]).has(metric.state);
  return (
    <article
      className={`rounded-lg border p-4 shadow-[0_14px_40px_rgba(23,42,40,0.07)] sm:p-5 ${
        unavailable ? "border-[#d8c49b] bg-[#f8f3ea]" : "border-[#d8c49b] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7650]">
          {label}
        </p>
        <Icon className="h-5 w-5 shrink-0 text-[#b58a45]" aria-hidden="true" />
      </div>
      <p className={`mt-3 font-semibold tracking-[-0.035em] text-[#172a28] ${unavailable ? "text-xl" : "text-3xl"}`}>
        {metricDisplay(metric, format)}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#706759]">
        {metric.state === "confirmed-zero" ? "Confirmed zero in the loaded source. " : ""}
        {metric.detail}
      </p>
    </article>
  );
}

function attentionRank(risk: EmployeeCustomerRow["risk"]) {
  return { critical: 0, attention: 1, opportunity: 2, healthy: 3 }[risk];
}

function salesDecline(customer: EmployeeCustomerRow) {
  return customer.ppmSales - customer.pmSales;
}

function jobsDecline(customer: EmployeeCustomerRow) {
  return customer.ppmJobs - customer.pmJobs;
}

function jpdTrend(customer: EmployeeCustomerRow) {
  if (customer.pmJpd === null || customer.ppmJpd === null) return null;
  return customer.pmJpd - customer.ppmJpd;
}

function CustomerActions({ customer }: { customer: EmployeeCustomerRow }) {
  const [copied, setCopied] = useState(false);
  const note = `${customer.businessName}: ${customer.recommendation} ${customer.reasons.join(" ")}`;

  async function copyNote() {
    await navigator.clipboard.writeText(note);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex min-w-[260px] flex-wrap gap-2">
      <Link
        href={`/portal/admin/account-analysis/${encodeURIComponent(customer.acctId)}`}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#172a28] px-3 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28]"
      >
        Analysis <ExternalLink className="h-3.5 w-3.5" />
      </Link>
      <Link
        href={`/portal/admin/preview/${encodeURIComponent(customer.acctId)}?returnTo=${encodeURIComponent("/portal/admin#customers")}`}
        className="inline-flex min-h-9 items-center rounded-full border border-[#c9af79] bg-white px-3 text-xs font-semibold text-[#172a28]"
      >
        Customer Portal
      </Link>
      {customer.portalUserEmail ? (
        <a
          href={`mailto:${encodeURIComponent(customer.portalUserEmail)}?subject=${encodeURIComponent("Checking in from Artisan Lab Network")}`}
          className="inline-flex min-h-9 items-center rounded-full border border-[#c9af79] bg-white px-3 text-xs font-semibold text-[#172a28]"
        >
          Email
        </a>
      ) : null}
      <button
        type="button"
        onClick={copyNote}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#c9af79] bg-white px-3 text-xs font-semibold text-[#172a28]"
      >
        <Clipboard className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy note"}
      </button>
    </div>
  );
}

function ProductAnalysis({ model }: { model: EmployeeDashboardModel }) {
  const [category, setCategory] = useState("All");
  const [customerId, setCustomerId] = useState("All");
  const [lab, setLab] = useState("All");
  const [period, setPeriod] = useState<"cm" | "pm" | "ppm">("cm");

  const products = useMemo(() => {
    const selectedCustomers = model.customers.filter(
      (customer) =>
        (customerId === "All" || customer.acctId === customerId) &&
        (lab === "All" || customer.lab === lab)
    );
    return model.products
      .filter((product) => category === "All" || product.category === category)
      .map((product) => {
        const values = selectedCustomers.reduce(
          (totals, customer) => {
            const usage = customer.productUsage[product.key];
            totals.cm += usage?.cm ?? 0;
            totals.pm += usage?.pm ?? 0;
            totals.ppm += usage?.ppm ?? 0;
            return totals;
          },
          { cm: 0, pm: 0, ppm: 0 }
        );
        return { ...product, ...values, pmChange: values.pm - values.ppm };
      });
  }, [category, customerId, lab, model.customers, model.products]);

  const periodTotal = products.reduce((total, product) => total + product[period], 0);
  const maxValue = Math.max(1, ...products.flatMap((product) => [product.cm, product.pm, product.ppm]));
  const biggestIncrease = [...products].sort((a, b) => b.pmChange - a.pmChange)[0];
  const biggestDecrease = [...products].sort((a, b) => a.pmChange - b.pmChange)[0];
  const zeroProducts = products.filter((product) => product[period] === 0);

  return (
    <section id="products" className="scroll-mt-24 rounded-lg border border-[#d8c49b] bg-[#fffaf1]/90 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Product usage</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#172a28]">What customers are using</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#706759]">
            Counts come from the existing Power BI product fields. CM, PM, and PPM use one calendar definition across the dashboard.
          </p>
        </div>
        <span className="rounded-full border border-[#d8c49b] bg-white px-3 py-2 text-xs font-semibold text-[#706759]" title={model.periodDefinitions.tooltip}>
          CM {model.periodDefinitions.cm} · PM {model.periodDefinitions.pm} · PPM {model.periodDefinitions.ppm}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter product category" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm">
          <option>All</option><option>Brand</option><option>Material</option><option>Specialty</option>
        </select>
        <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} aria-label="Filter product customer" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm">
          <option value="All">All customers</option>
          {model.customers.map((customer) => <option key={customer.acctId} value={customer.acctId}>{customer.businessName}</option>)}
        </select>
        <select value={lab} onChange={(event) => setLab(event.target.value)} aria-label="Filter product lab" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm">
          <option value="All">All labs</option>
          {model.profile.labs.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} aria-label="Filter product period" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm">
          <option value="cm">CM · {model.periodDefinitions.cm}</option>
          <option value="pm">PM · {model.periodDefinitions.pm}</option>
          <option value="ppm">PPM · {model.periodDefinitions.ppm}</option>
        </select>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-md border border-[#d8c49b] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b7650]">Biggest increase</p>
          <p className="mt-2 text-xl font-semibold text-[#172a28]">{biggestIncrease?.label ?? "Unavailable"}</p>
          <p className="mt-1 text-sm text-[#706759]">{biggestIncrease ? `${biggestIncrease.pmChange > 0 ? "+" : ""}${biggestIncrease.pmChange} PM vs PPM orders` : "No mapped products"}</p>
        </article>
        <article className="rounded-md border border-[#d8c49b] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b7650]">Biggest decrease</p>
          <p className="mt-2 text-xl font-semibold text-[#172a28]">{biggestDecrease?.label ?? "Unavailable"}</p>
          <p className="mt-1 text-sm text-[#706759]">{biggestDecrease ? `${biggestDecrease.pmChange > 0 ? "+" : ""}${biggestDecrease.pmChange} PM vs PPM orders` : "No mapped products"}</p>
        </article>
        <article className="rounded-md border border-[#d8c49b] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b7650]">No activity</p>
          <p className="mt-2 text-xl font-semibold text-[#172a28]">{zeroProducts.length} products</p>
          <p className="mt-1 text-sm text-[#706759]">Confirmed zero in the selected period and scope.</p>
        </article>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {products.map((product) => {
          const mix = periodTotal > 0 ? (product[period] / periodTotal) * 100 : null;
          return (
            <article key={product.key} className="rounded-md border border-[#e2d5bf] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7650]">{product.category}</p><h3 className="mt-1 text-lg font-semibold text-[#172a28]">{product.label}</h3></div>
                <div className="text-right"><p className="text-2xl font-semibold text-[#172a28]">{product[period].toLocaleString()}</p><p className="text-xs text-[#706759]">{mix === null ? "Mix unavailable" : `${mix.toFixed(1)}% mix`}</p></div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {(["ppm", "pm", "cm"] as const).map((key) => (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-2"><span className="font-semibold uppercase text-[#706759]">{key}</span><span>{product[key]}</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#eee5d7]"><div className="h-full rounded-full bg-[#1f6b5c]" style={{ width: `${Math.max(2, (product[key] / maxValue) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[#8a8175]" title={product.sourceFields.join(", ")}>Source mapping: {product.sourceFields.join(" · ")}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CustomerQueue({ model }: { model: EmployeeDashboardModel }) {
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("all");
  const [lab, setLab] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<CustomerSort>("attention");

  const customerTypes = [...new Set(model.customers.map((customer) => customer.customerType))].sort();
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return model.customers
      .filter((customer) => {
        if (normalized && !`${customer.businessName} ${customer.acctId} ${customer.accountNumbers}`.toLowerCase().includes(normalized)) return false;
        if (lab !== "all" && customer.lab !== lab) return false;
        if (type !== "all" && customer.customerType !== type) return false;
        if (reason === "sales-decline" && salesDecline(customer) <= 0) return false;
        if (reason === "job-decline" && jobsDecline(customer) <= 0) return false;
        if (reason === "no-activity" && !(customer.cmJobs === 0 && customer.pmJobs > 0)) return false;
        if (reason === "missing-user" && customer.portalUserCount > 0) return false;
        if (reason === "missing-price-list" && customer.priceListCodes.length > 0) return false;
        if (reason === "product-opportunity" && customer.risk !== "opportunity") return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "attention") return attentionRank(a.risk) - attentionRank(b.risk) || salesDecline(b) - salesDecline(a);
        if (sort === "sales-decline") return salesDecline(b) - salesDecline(a);
        if (sort === "jobs-decline") return jobsDecline(b) - jobsDecline(a);
        if (sort === "recent") return b.latestShipDate.localeCompare(a.latestShipDate);
        return a.businessName.localeCompare(b.businessName);
      });
  }, [lab, model.customers, query, reason, sort, type]);

  return (
    <section id="customers" className="scroll-mt-24 rounded-lg border border-[#d8c49b] bg-white p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Customers</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#172a28]">Rep action queue</h2><p className="mt-2 text-sm text-[#706759]">One permission-scoped account list with analysis, portal, email, and outreach actions.</p></div>
        <span className="rounded-full border border-[#d8c49b] bg-[#fffaf1] px-3 py-2 text-xs font-semibold text-[#706759]">{filtered.length} of {model.customers.length} assigned customers</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative xl:col-span-2"><span className="sr-only">Search customers</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#8b7650]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search account or customer" className="min-h-11 w-full rounded-md border border-[#d8c49b] bg-white pl-10 pr-3 text-sm" /></label>
        <select value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Filter customer reason" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm"><option value="all">All reasons</option><option value="sales-decline">Sales decline</option><option value="job-decline">Job decline</option><option value="no-activity">No recent activity</option><option value="missing-user">Missing portal user</option><option value="missing-price-list">Missing price list</option><option value="product-opportunity">Product opportunity</option></select>
        <select value={lab} onChange={(event) => setLab(event.target.value)} aria-label="Filter customer lab" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm"><option value="all">All labs</option>{model.profile.labs.map((value) => <option key={value}>{value}</option>)}</select>
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter customer type" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm"><option value="all">All customer types</option>{customerTypes.map((value) => <option key={value} value={value}>{customerType(value)}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value as CustomerSort)} aria-label="Sort customers" className="min-h-11 rounded-md border border-[#d8c49b] bg-white px-3 text-sm"><option value="attention">Priority first</option><option value="sales-decline">Largest sales decline</option><option value="jobs-decline">Largest job decline</option><option value="recent">Most recent activity</option><option value="name">Account name</option></select>
      </div>

      <div className="mobile-scroll-row mt-5 overflow-x-auto rounded-md border border-[#e2d5bf]">
        <table className="w-full min-w-[1540px] border-collapse text-left text-sm">
          <thead><tr className="border-b border-[#d8c49b] bg-[#172a28] text-white"><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Lab / Type</th><th className="px-3 py-3 text-right">CM / PM / PPM Jobs</th><th className="px-3 py-3 text-right">Current Sales</th><th className="px-3 py-3">JPD trend</th><th className="px-3 py-3">Last activity</th><th className="px-3 py-3">Portal / Price List</th><th className="px-3 py-3">Recommended next action</th><th className="px-3 py-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map((customer) => {
              const trend = jpdTrend(customer);
              return (
                <tr key={customer.acctId} className="border-b border-[#eee5d7] align-top last:border-0">
                  <td className="px-3 py-4"><p className="font-semibold text-[#172a28]">{customer.businessName}</p><p className="mt-1 text-xs text-[#706759]">{customer.acctId} · {customer.locationCount} {customer.locationCount === 1 ? "location" : "locations"}</p></td>
                  <td className="px-3 py-4"><p>{customer.lab}</p><p className="mt-1 text-xs text-[#706759]">{customerType(customer.customerType)}</p></td>
                  <td className="px-3 py-4 text-right font-semibold">{customer.cmJobs} / {customer.pmJobs} / {customer.ppmJobs}</td>
                  <td className="px-3 py-4 text-right"><p className="font-semibold">{currency(customer.cmSales)}</p><p className="mt-1 text-xs text-[#706759]">PM {currency(customer.pmSales)}</p></td>
                  <td className="px-3 py-4">{trend === null ? <span className="text-[#8a8175]">Unavailable</span> : <span className={`inline-flex items-center gap-1 font-semibold ${trend < 0 ? "text-[#9a3f31]" : trend > 0 ? "text-[#23694e]" : "text-[#706759]"}`}>{trend < 0 ? <ArrowDownRight className="h-4 w-4" /> : trend > 0 ? <ArrowUpRight className="h-4 w-4" /> : null}{trend > 0 ? "+" : ""}{trend.toFixed(2)} JPD</span>}</td>
                  <td className="px-3 py-4">{date(customer.latestShipDate)}</td>
                  <td className="px-3 py-4"><p>{customer.portalUserCount ? `${customer.portalUserCount} portal user${customer.portalUserCount === 1 ? "" : "s"}` : "No portal user"}</p><p className="mt-1 text-xs text-[#706759]">{customer.priceListCodes.length ? customer.priceListCodes.join(", ") : "No price list"}</p></td>
                  <td className="max-w-[300px] px-3 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${customer.risk === "critical" ? "bg-[#fce7e2] text-[#8b3325]" : customer.risk === "attention" ? "bg-[#fff1d7] text-[#805519]" : customer.risk === "opportunity" ? "bg-[#eaf4ef] text-[#24543a]" : "bg-[#eef1ee] text-[#59635f]"}`}>{customer.risk}</span><p className="mt-2 font-semibold text-[#172a28]">{customer.recommendation}</p><p className="mt-1 text-xs leading-5 text-[#706759]">{customer.reasons[0] || "No active risk reason."}</p></td>
                  <td className="px-3 py-4"><CustomerActions customer={customer} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!filtered.length ? <p className="mt-5 rounded-md border border-dashed border-[#d8c49b] bg-[#fffaf1] p-5 text-sm text-[#706759]">No assigned customers match these filters.</p> : null}
    </section>
  );
}

export default function EmployeeDashboard({
  model,
  repOptions,
}: {
  model: EmployeeDashboardModel;
  repOptions: RepOption[];
}) {
  const showingAdminTools = model.viewer.isAdmin && !model.viewer.previewingRep;
  const priceListsHref = showingAdminTools
    ? "/portal/admin/price-lists"
    : "/portal/price-lists";

  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#172a28]">
      <div className="border-b border-[#d8c49b] bg-[#172a28] text-white">
        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10">
          {model.viewer.previewingRep ? (
            <div className="mb-5 flex flex-col gap-3 rounded-md border border-[#d8c49b]/45 bg-white/8 p-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8c49b]">Administrator preview</p><p className="mt-1 text-sm text-white/76">This is the same account scope and dashboard experience assigned to {model.profile.name}.</p></div>
              <form className="flex flex-col gap-2 sm:flex-row sm:items-center" action="/portal/admin">
                <label className="sr-only" htmlFor="repView">Preview sales rep</label>
                <select id="repView" name="repView" defaultValue={model.profile.repCode} className="min-h-10 rounded-md border border-white/30 bg-[#223a36] px-3 text-sm text-white">
                  <option value="">All reps · Admin mode</option>
                  {repOptions.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
                </select>
                <button className="min-h-10 rounded-full bg-[#d8c49b] px-4 text-sm font-semibold text-[#172a28]">Switch view</button>
              </form>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c49b]">Employee dashboard</p>
              <div className="mt-3 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d8c49b] text-lg font-bold text-[#172a28]">{model.profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</div><div><h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{model.profile.name}</h1><p className="mt-1 text-sm text-white/70">Rep {model.profile.repCode} · {model.profile.labs.join(" · ") || "Lab unavailable"} · Territory {model.profile.territory}</p></div></div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/72"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{model.currentDate}</span><span className="inline-flex items-center gap-2"><Gauge className="h-4 w-4" />Data refreshed {date(model.freshness.refreshDate)}</span></div>
            </div>
            <div className={`max-w-md rounded-md border px-4 py-3 text-sm ${model.freshness.stale ? "border-[#e0a276] bg-[#7b3c2d]" : "border-[#8fb8a7] bg-[#1d4b40]"}`}><p className="flex items-center gap-2 font-semibold">{model.freshness.stale ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{model.freshness.stale ? "Data freshness warning" : "Data is current"}</p><p className="mt-1 text-xs leading-5 text-white/76">{model.freshness.warning}</p></div>
          </div>
        </div>
      </div>

      <nav aria-label="Employee dashboard sections" className="sticky top-[57px] z-40 border-b border-[#d8c49b] bg-[#fffaf1]/96 shadow-sm backdrop-blur">
        <div className="mobile-scroll-row mx-auto flex max-w-[1500px] items-center gap-2 overflow-x-auto px-5 py-2 sm:px-8 lg:px-10">
          {[{ href: "#summary", label: "Dashboard" }, { href: "#customers", label: "Customers" }, { href: "#customers", label: "Customer Portal" }, { href: priceListsHref, label: "Price Lists" }, { href: "/portal/employee-resources", label: "Employee Resources" }, ...(showingAdminTools ? [{ href: "/portal/admin", label: "Admin Overview" }, { href: "/portal/admin/access-log", label: "Access Log" }] : [])].map((link) => <Link key={`${link.href}-${link.label}`} href={link.href} className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-[#d8c49b] bg-white px-3 text-xs font-semibold text-[#172a28] hover:bg-[#f2e9dc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28]">{link.label}</Link>)}
        </div>
      </nav>

      <div className="mx-auto grid min-w-0 max-w-[1500px] grid-cols-1 gap-7 px-5 py-7 sm:px-8 lg:px-10">
        <section id="summary" className="scroll-mt-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Personal performance</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your business at a glance</h2></div><p className="max-w-xl text-sm leading-6 text-[#706759]">Every unavailable value is labeled. A displayed zero means the synchronized source confirmed zero for the selected scope.</p></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Current Month Net Sales" metric={model.metrics.currentMonthNetSales} format="currency" icon={CircleDollarSign} />
            <MetricCard label="Previous Month Net Sales" metric={model.metrics.previousMonthNetSales} format="currency" icon={CircleDollarSign} />
            <MetricCard label="Previous 13 Completed Months" metric={model.metrics.trailing13MonthNetSales} format="currency" icon={BarChart3} />
            <MetricCard label="Year-to-Date Net Sales" metric={model.metrics.yearToDateNetSales} format="currency" icon={CircleDollarSign} />
            <MetricCard label="Month-over-Month Change" metric={model.metrics.monthOverMonthChange} format="percent" icon={model.metrics.monthOverMonthChange.value !== null && model.metrics.monthOverMonthChange.value < 0 ? ArrowDownRight : ArrowUpRight} />
            <MetricCard label="Assigned Customers" metric={model.metrics.assignedCustomers} format="count" icon={Users} />
            <MetricCard label="Active Customers" metric={model.metrics.activeCustomers} format="count" icon={ShieldCheck} />
            <MetricCard label="Declining Customers" metric={model.metrics.decliningCustomers} format="count" icon={AlertTriangle} />
            <MetricCard label="Customers Requiring Attention" metric={model.metrics.attentionCustomers} format="count" icon={Sparkles} />
          </div>
        </section>

        <section id="sales-history" className="scroll-mt-24 rounded-lg border border-[#d8c49b] bg-white p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Power BI Net Sales</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Thirteen completed months plus current month</h2></div><span className={`rounded-full px-3 py-2 text-xs font-semibold ${model.salesHistory.status === "ready" ? "bg-[#e8f4ee] text-[#24543a]" : model.salesHistory.status === "error" ? "bg-[#fce7e2] text-[#8b3325]" : "bg-[#fff1d7] text-[#805519]"}`}>{model.salesHistory.status.replace("-", " ")}</span></div>
          <div className="mt-5"><EmployeeSalesChart points={model.salesHistory.points} status={model.salesHistory.status} message={model.salesHistory.message} /></div>
          <details className="mt-5 rounded-md border border-[#e2d5bf] bg-[#fffaf1] p-4"><summary className="cursor-pointer font-semibold text-[#172a28]">Power BI source and behavior</summary><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-semibold">Workspace / model</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.workspaceName} / {model.salesHistory.source.semanticModelName}</dd></div><div><dt className="font-semibold">Measure</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.measure}</dd></div><div><dt className="font-semibold">Identity mapping</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.repField} · {model.salesHistory.source.accountField}</dd></div><div><dt className="font-semibold">Lab / territory</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.labField} · {model.salesHistory.source.territoryField}</dd></div><div><dt className="font-semibold">Date / timezone</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.dateField} · {model.salesHistory.source.timezone}</dd></div><div><dt className="font-semibold">Mode / refresh</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.mode}. {model.salesHistory.source.refreshFrequency}</dd></div><div className="sm:col-span-2"><dt className="font-semibold">Stale, error, and permission behavior</dt><dd className="mt-1 text-[#706759]">{model.salesHistory.source.behavior}</dd></div></dl></details>
        </section>

        <section id="attention" className="scroll-mt-24 rounded-lg border border-[#d8c49b] bg-[#172a28] p-5 text-white shadow-[0_24px_70px_rgba(23,42,40,0.18)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8c49b]">What needs attention</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Explainable next actions</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">Each recommendation includes the reason and source metrics. There is no hidden score.</p></div><span className="rounded-full border border-white/25 px-3 py-2 text-xs font-semibold">{model.opportunities.length} prioritized reasons</span></div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{model.opportunities.slice(0, 12).map((opportunity) => <article key={opportunity.id} className="rounded-md border border-white/16 bg-white/7 p-4"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">{opportunity.tone}</span>{opportunity.accountId ? <Link href={`/portal/admin/account-analysis/${encodeURIComponent(opportunity.accountId)}`} className="text-xs font-semibold text-[#ead9b7] hover:underline">Open account</Link> : null}</div><h3 className="mt-3 text-lg font-semibold">{opportunity.accountName || opportunity.title}</h3><p className="mt-2 text-sm leading-6 text-white/76">{opportunity.reason}</p><p className="mt-3 border-t border-white/12 pt-3 text-xs leading-5 text-white/58">{opportunity.sourceMetrics}</p></article>)}</div>
          {!model.opportunities.length ? <p className="mt-5 rounded-md border border-white/20 p-5 text-sm text-white/70">No explainable attention items were found in the current assigned scope.</p> : null}
        </section>

        <ProductAnalysis model={model} />
        <CustomerQueue model={model} />

        <section id="resources" className="rounded-lg border border-[#d8c49b] bg-[#fffaf1] p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Daily tools</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Resources for the work</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{ href: "#customers", label: "Assigned Customers", detail: "Open analysis and customer portal previews.", icon: Building2 }, { href: priceListsHref, label: "Price Lists", detail: "View only price lists available to this role.", icon: FileText }, { href: "/portal/employee-resources", label: "Employee Resources", detail: "Product, program, and team materials.", icon: PackageSearch }, ...(showingAdminTools ? [{ href: "/portal/admin/users", label: "User & Access Admin", detail: "Manage invites and administrative access.", icon: UserRound }] : [])].map((resource) => <Link key={resource.label} href={resource.href} className="rounded-md border border-[#d8c49b] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28]"><resource.icon className="h-5 w-5 text-[#b58a45]" /><h3 className="mt-3 font-semibold text-[#172a28]">{resource.label}</h3><p className="mt-1 text-sm leading-6 text-[#706759]">{resource.detail}</p></Link>)}</div></section>

        {model.dataQuality.length ? <section className="rounded-lg border border-[#d8a15e] bg-[#fff7e8] p-5 sm:p-7"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#8a521e]" /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a521e]">Data quality</p><h2 className="mt-2 text-2xl font-semibold text-[#172a28]">Known gaps remain visible</h2><ul className="mt-3 grid gap-2 text-sm leading-6 text-[#706759]">{model.dataQuality.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div></div></section> : null}
      </div>
    </main>
  );
}
