"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, ExternalLink, FilePlus, FolderOpen, GraduationCap, Megaphone, Search, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import type { EmployeeResource, EmployeeResourceCategory } from "@/lib/portal/employeeResources";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function categoryIcon(category: string) {
  if (category === "product") return BookOpen;
  if (category === "forms") return FilePlus;
  if (category === "sop") return Wrench;
  if (category === "sales") return Sparkles;
  if (category === "marketing") return Megaphone;
  return FolderOpen;
}

function statusLabel(resource: EmployeeResource) {
  if (resource.status === "available") return "Available";
  if (resource.status === "future") return "Future";
  return "Pending";
}

function ResourceCard({ resource }: { resource: EmployeeResource }) {
  const disabled = resource.status !== "available" || !resource.href;
  return (
    <article className="group rounded-md border border-[#eadfce] bg-white/78 p-4 shadow-[0_12px_30px_rgba(20,39,36,0.05)] transition hover:-translate-y-0.5 hover:border-[#1f8a70] hover:shadow-[0_18px_44px_rgba(20,39,36,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-md border border-[#d9c8a6] bg-[#f8f1e6] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#7a6b49]">
          {resource.fileType}
        </span>
        <span className={`inline-flex rounded-md px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] ${resource.status === "available" ? "bg-[#1f8a70] text-white" : "bg-[#e7ddcc] text-[#59635f]"}`}>
          {statusLabel(resource)}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#142724]">{resource.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6d746f]">{resource.description}</p>
      <div className="mt-3 grid gap-1 text-xs text-[#7a6b49]">
        <p><span className="font-semibold text-[#142724]">Category:</span> {resource.subcategory || resource.category}</p>
        {resource.vendor ? <p><span className="font-semibold text-[#142724]">Vendor:</span> {resource.vendor}</p> : null}
        <p><span className="font-semibold text-[#142724]">Date Added:</span> {resource.dateAdded}</p>
        {resource.version ? <p><span className="font-semibold text-[#142724]">Version:</span> {resource.version}</p> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {resource.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-[#eadfce] bg-[#fffdf8] px-2 py-1 text-[0.68rem] font-semibold text-[#59635f]">
            {tag}
          </span>
        ))}
      </div>
      {disabled ? (
        <button disabled className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-[#d9c8a6] bg-[#f8f1e6] px-4 text-sm font-semibold text-[#7a6b49] opacity-80">
          Request Access
        </button>
      ) : resource.external ? (
        <a href={resource.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172a28] px-4 text-sm font-semibold text-white transition hover:bg-[#27433f]">
          Open Resource <ExternalLink className="h-4 w-4" />
        </a>
      ) : (
        <Link href={resource.href ?? "#"} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172a28] px-4 text-sm font-semibold text-white transition hover:bg-[#27433f]">
          Download / Open <Download className="h-4 w-4" />
        </Link>
      )}
    </article>
  );
}

function QuickAction({ title, detail, href, disabled }: { title: string; detail: string; href?: string; disabled?: boolean }) {
  const body = (
    <div className={`rounded-md border p-4 transition ${disabled ? "border-dashed border-[#d9c8a6] bg-[#f8f1e6]/70 text-[#7a6b49]" : "border-[#eadfce] bg-white/78 text-[#142724] hover:-translate-y-0.5 hover:border-[#1f8a70]"}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-xs leading-5 text-[#6d746f]">{detail}</p>
    </div>
  );
  if (disabled || !href) return body;
  return <a href={href}>{body}</a>;
}

export default function EmployeeResourceCenter({ resources, categories }: { resources: EmployeeResource[]; categories: EmployeeResourceCategory[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);
  const filtered = useMemo(() => {
    if (!normalizedQuery) return resources;
    return resources.filter((resource) => {
      const haystack = [resource.title, resource.description, resource.category, resource.subcategory, resource.vendor, resource.fileType, ...resource.tags]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [resources, normalizedQuery]);
  const featured = resources.filter((resource) => resource.featured).slice(0, 5);
  const recent = [...resources].filter((resource) => resource.recentlyAdded).slice(0, 6);

  return (
    <div className="grid gap-7">
      <section className="overflow-hidden rounded-md border border-[#d9c8a6] bg-[#13211f] p-6 text-white shadow-[0_34px_100px_rgba(19,33,31,0.24)] sm:p-8">
        <div className="absolute" />
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#f2d88f]">Internal Only</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Artisan Employee Resource Center</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/76">One place for documents, training, sales tools, SOPs, and company resources.</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/82">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2"><ShieldCheck className="h-4 w-4 text-[#f2d88f]" /> Employee/admin authorized</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2"><GraduationCap className="h-4 w-4 text-[#f2d88f]" /> Artisan University kept separate for Phase 2</span>
        </div>
      </section>

      <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_54px_rgba(20,39,36,0.08)] sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">Universal Search</p>
        <label className="mt-4 flex min-h-14 items-center gap-3 rounded-md border border-[#d9c8a6] bg-white px-4">
          <Search className="h-5 w-5 text-[#7a6b49]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resource title, description, category, vendor, or tags" className="min-h-12 flex-1 bg-transparent text-sm font-medium text-[#142724] outline-none" />
        </label>
        <p className="mt-3 text-sm text-[#6d746f]">Showing {filtered.length} of {resources.length} resources.</p>
      </section>

      <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_54px_rgba(20,39,36,0.08)] sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">Quick Actions</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <QuickAction title="Upload New Resource" detail="Future admin-managed upload workflow." disabled />
          <QuickAction title="Add SOP" detail="Future SOP article creation workflow." disabled />
          <QuickAction title="View Product Resources" detail="Jump to vendor and product guides." href="#product" />
          <QuickAction title="View Sales Tools" detail="Jump to sales toolkit framework." href="#sales" />
          <QuickAction title="View Marketing Assets" detail="Jump to campaign and asset framework." href="#marketing" />
          <QuickAction title="View Internal Forms" detail="Jump to internal forms." href="#forms" />
          <QuickAction title="View Company Policies" detail="Jump to company reference materials." href="#company" />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_54px_rgba(20,39,36,0.08)] sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">Featured Resources</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {featured.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
          </div>
        </div>
        <div className="grid gap-5">
          <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_54px_rgba(20,39,36,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">Recently Added</p>
            <div className="mt-4 grid gap-3">
              {recent.map((resource) => (
                <div key={resource.id} className="rounded-md border border-[#eadfce] bg-white/78 p-3">
                  <p className="text-sm font-semibold text-[#142724]">{resource.title}</p>
                  <p className="mt-1 text-xs text-[#6d746f]">{resource.dateAdded} · {resource.vendor || resource.subcategory || resource.category}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-dashed border-[#d9c8a6] bg-[#fffdf8]/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">Most Downloaded</p>
            <h2 className="mt-3 text-xl font-semibold text-[#142724]">Download analytics</h2>
            <p className="mt-2 text-sm leading-6 text-[#6d746f]">Download analytics will populate this panel when resource management is added in a future phase.</p>
          </section>
        </div>
      </section>

      {categories.map((category) => {
        const Icon = categoryIcon(category.id);
        const categoryResources = filtered.filter((resource) => resource.category === category.id);
        return (
          <details key={category.id} id={category.id} open className="scroll-mt-24 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_54px_rgba(20,39,36,0.08)] sm:p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]"><Icon className="h-4 w-4" /> {category.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#142724]">{category.purpose}</h2>
                </div>
                <span className="w-fit rounded-full border border-[#d9c8a6] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#59635f]">{categoryResources.length} resources</span>
              </div>
            </summary>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
              {categoryResources.length === 0 ? <p className="rounded-md border border-dashed border-[#d9c8a6] bg-white/70 p-4 text-sm text-[#6d746f]">No resources match the current search in this category.</p> : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
