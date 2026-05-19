"use client";

import { Fragment, useMemo, useState } from "react";
import type {
  GeneratedPriceListData,
  PriceListAddOnSection,
  PriceListArCoating,
  PriceListPricingRow,
} from "@/lib/pricing/types";

type PriceMode = "edged" | "uncut";
type MaterialGroup = "Clear" | "Photochromic" | "Polarized";
type SortKey =
  | "brand"
  | "designType"
  | "designStyle"
  | "material"
  | "clear"
  | "photochromic"
  | "polarized";
type SortDirection = "asc" | "desc";

type DisplayRow = {
  id: string;
  brand: string;
  designType: string;
  designStyle: string;
  material: string;
  rows: PriceListPricingRow[];
  clear?: PriceListPricingRow;
  photochromic?: PriceListPricingRow;
  polarized?: PriceListPricingRow;
};

const maxVisibleRows = 220;

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function priceFor(row: PriceListPricingRow | undefined, mode: PriceMode) {
  if (!row) return Number.POSITIVE_INFINITY;
  return mode === "edged" ? row.edgedPrice : row.uncutPrice;
}

function minRow(rows: PriceListPricingRow[], group: MaterialGroup, mode: PriceMode) {
  return rows
    .filter((row) => row.materialColor === group)
    .sort((a, b) => priceFor(a, mode) - priceFor(b, mode))[0];
}

function priceLabel(row: PriceListPricingRow | undefined, mode: PriceMode, prefix = false) {
  if (!row) return "—";
  return `${prefix ? "From " : ""}${currency(priceFor(row, mode))}`;
}

function uniqueValues<T>(rows: T[], getter: (row: T) => string) {
  return [...new Set(rows.map(getter).filter(Boolean))].sort(compareText);
}

function rowMatchesSearch(row: PriceListPricingRow, query: string) {
  if (!query) return true;
  return [
    row.designStyle,
    row.brand,
    row.material,
    row.materialColor,
    row.colorBrand,
    row.availableColors.join(" "),
    row.rawProductNames.join(" "),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "recommended" | "outsourced";
}) {
  const classes = {
    neutral: "border-[#dfd2bf] bg-white text-[#625b53]",
    recommended: "border-[#c7ad7b] bg-[#fff6df] text-[#7a5a18]",
    outsourced: "border-[#dec6b8] bg-[#fff1ec] text-[#8a4f28]",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${classes[tone]}`}>
      {children}
    </span>
  );
}

function SelectFilter({
  step,
  label,
  value,
  options,
  onChange,
}: {
  step: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
        {step}: {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function filterRows(
  rows: PriceListPricingRow[],
  filters: {
    brand: string;
    designType: string;
    designStyle: string;
    material: string;
    materialColor: string;
    colorBrand: string;
    query: string;
  },
  omit?: keyof typeof filters
) {
  return rows.filter((row) => {
    if (omit !== "brand" && filters.brand !== "All" && row.brand !== filters.brand) return false;
    if (omit !== "designType" && filters.designType !== "All" && row.designType !== filters.designType) return false;
    if (omit !== "designStyle" && filters.designStyle !== "All" && row.designStyle !== filters.designStyle) return false;
    if (omit !== "material" && filters.material !== "All" && row.material !== filters.material) return false;
    if (omit !== "materialColor" && filters.materialColor !== "All" && row.materialColor !== filters.materialColor) return false;
    if (omit !== "colorBrand" && filters.colorBrand !== "All" && row.colorBrand !== filters.colorBrand) return false;
    if (omit !== "query" && !rowMatchesSearch(row, filters.query)) return false;
    return true;
  });
}

function buildDisplayRows(rows: PriceListPricingRow[], mode: PriceMode) {
  const groups = new Map<string, DisplayRow>();

  for (const row of rows) {
    const key = [row.brand, row.designType, row.designStyle, row.material].join("|");
    const current =
      groups.get(key) ||
      ({
        id: key.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        brand: row.brand,
        designType: row.designType,
        designStyle: row.designStyle,
        material: row.material,
        rows: [],
      } satisfies DisplayRow);

    current.rows.push(row);
    groups.set(key, current);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    clear: minRow(group.rows, "Clear", mode),
    photochromic: minRow(group.rows, "Photochromic", mode),
    polarized: minRow(group.rows, "Polarized", mode),
  }));
}

function sortDisplayRows(rows: DisplayRow[], sort: { key: SortKey; direction: SortDirection } | null, mode: PriceMode) {
  const sorted = [...rows].sort((a, b) => {
    if (!sort) {
      return (
        compareText(a.brand, b.brand) ||
        compareText(a.designType, b.designType) ||
        compareText(a.designStyle, b.designStyle) ||
        compareText(a.material, b.material)
      );
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    const value =
      sort.key === "clear"
        ? priceFor(a.clear, mode) - priceFor(b.clear, mode)
        : sort.key === "photochromic"
          ? priceFor(a.photochromic, mode) - priceFor(b.photochromic, mode)
          : sort.key === "polarized"
            ? priceFor(a.polarized, mode) - priceFor(b.polarized, mode)
            : compareText(String(a[sort.key]), String(b[sort.key]));

    return direction * value || compareText(a.designStyle, b.designStyle);
  });

  return sorted;
}

export default function InteractivePriceListDashboard({
  priceList,
}: {
  priceList: GeneratedPriceListData;
}) {
  const [brand, setBrand] = useState("All");
  const [designType, setDesignType] = useState("All");
  const [designStyle, setDesignStyle] = useState("All");
  const [material, setMaterial] = useState("All");
  const [materialColor, setMaterialColor] = useState("All");
  const [colorBrand, setColorBrand] = useState("All");
  const [query, setQuery] = useState("");
  const [priceMode, setPriceMode] = useState<PriceMode>("edged");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const filters = {
    brand,
    designType,
    designStyle,
    material,
    materialColor,
    colorBrand,
    query: query.trim().toLowerCase(),
  };

  const filteredRows = useMemo(
    () => filterRows(priceList.rows, filters),
    [priceList.rows, brand, designType, designStyle, material, materialColor, colorBrand, query]
  );
  const displayRows = useMemo(
    () => sortDisplayRows(buildDisplayRows(filteredRows, priceMode), sort, priceMode),
    [filteredRows, priceMode, sort]
  );
  const visibleRows = displayRows.slice(0, maxVisibleRows);

  const options = useMemo(
    () => ({
      brands: uniqueValues(filterRows(priceList.rows, filters, "brand"), (row) => row.brand),
      designTypes: uniqueValues(filterRows(priceList.rows, filters, "designType"), (row) => row.designType),
      designStyles: uniqueValues(filterRows(priceList.rows, filters, "designStyle"), (row) => row.designStyle),
      materials: uniqueValues(filterRows(priceList.rows, filters, "material"), (row) => row.material),
      materialColors: uniqueValues(filterRows(priceList.rows, filters, "materialColor"), (row) => row.materialColor).filter((value) =>
        ["Clear", "Photochromic", "Polarized"].includes(value)
      ),
      colorBrands: uniqueValues(filterRows(priceList.rows, filters, "colorBrand"), (row) => row.colorBrand),
    }),
    [priceList.rows, brand, designType, designStyle, material, materialColor, colorBrand, query]
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };
  const sortableHeaders: Array<{ key?: SortKey; label: string }> = [
    { key: "brand", label: "Brand" },
    { key: "designType", label: "Design Type" },
    { key: "designStyle", label: "Design Style" },
    { key: "material", label: "Material" },
    { key: "clear", label: "Clear Price" },
    { key: "photochromic", label: "Photochromic From" },
    { key: "polarized", label: "Polarized From" },
    { label: "Actions" },
  ];

  return (
    <div className="grid gap-8">
      <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 shadow-[0_22px_60px_rgba(18,32,51,0.08)]">
        <div className="grid gap-5 border-b border-[#dfd2bf] p-4 md:p-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              Artisan Equity Partner Pricing
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033] md:text-3xl">
              Guided Lens Pricing
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4d5664]">
              Interactive private pricing guide for assigned Artisan Equity
              Partner accounts.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                Search
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search design, brand, material, color family, raw name..."
                className="h-11 rounded-full border border-[#d7c5a8] bg-white px-4 text-sm font-semibold text-[#122033] outline-none transition placeholder:text-[#8b8171] focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
              />
            </label>

            <div className="inline-grid grid-cols-2 rounded-full border border-[#d7c5a8] bg-white p-1">
              {[
                ["edged", "Edged and Assembled"],
                ["uncut", "Uncut"],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPriceMode(mode as PriceMode)}
                  className={`min-h-9 rounded-full px-3 text-xs font-bold transition ${
                    priceMode === mode
                      ? "bg-[#122033] text-white"
                      : "text-[#4d5664] hover:bg-[#f4eee4]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#eadfce] p-4 md:grid-cols-2 md:p-6 xl:grid-cols-4">
          <SelectFilter step="Step 1" label="Select Brand" value={brand} options={options.brands} onChange={setBrand} />
          <SelectFilter step="Step 2" label="Select Design Type" value={designType} options={options.designTypes} onChange={setDesignType} />
          <SelectFilter step="Step 3" label="Select Design Style" value={designStyle} options={options.designStyles} onChange={setDesignStyle} />
          <SelectFilter step="Step 4" label="Select Material" value={material} options={options.materials} onChange={setMaterial} />
          <SelectFilter step="Filter" label="Material Color" value={materialColor} options={options.materialColors} onChange={setMaterialColor} />
          <SelectFilter step="Filter" label="Color Brand" value={colorBrand} options={options.colorBrands} onChange={setColorBrand} />
        </div>

        <div className="flex flex-col gap-2 border-b border-[#eadfce] px-4 py-3 text-xs font-semibold text-[#625b53] md:flex-row md:items-center md:justify-between md:px-6">
          <span>
            Showing {visibleRows.length.toLocaleString()} of{" "}
            {displayRows.length.toLocaleString()} product/material rows
          </span>
          {priceMode === "uncut" ? (
            <span>Uncut price reflects the listed uncut deduction.</span>
          ) : null}
          <span>
            Source rows: {priceList.report.rawSourceRowsProcessed.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-[#122033] text-white">
                {sortableHeaders.map((heading) => (
                  <th
                    key={heading.label}
                    className="border-r border-[#34455a] px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
                  >
                    {heading.key ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(heading.key as SortKey)}
                        className="flex w-full items-center justify-between gap-2 text-left"
                      >
                        <span>{heading.label}</span>
                        <span className="text-[10px] text-[#d9c8aa]">
                          {sort?.key === heading.key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </button>
                    ) : heading.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => {
                const expanded = expandedIds.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <tr className={index % 2 === 0 ? "bg-white/82" : "bg-[#fffaf2]/82"}>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">{row.brand}</td>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">{row.designType}</td>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 font-semibold text-[#122033]">{row.designStyle}</td>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">{row.material}</td>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">{priceLabel(row.clear, priceMode)}</td>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">{priceLabel(row.photochromic, priceMode, true)}</td>
                      <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">{priceLabel(row.polarized, priceMode, true)}</td>
                      <td className="border-b border-[#eadfce] px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(row.id)}
                          className="rounded-full border border-[#d7c5a8] bg-white px-3 py-1.5 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6]"
                        >
                          {expanded ? "Hide options" : "View options"}
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="bg-[#f9f2e8]">
                        <td colSpan={8} className="border-b border-[#eadfce] px-4 py-4">
                          <ExpandedOptions rows={row.rows} priceMode={priceMode} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayRows.length > maxVisibleRows ? (
          <p className="border-t border-[#eadfce] px-4 py-3 text-xs leading-5 text-[#6d6252] md:px-6">
            Narrow the guided selections to reduce the result set. The table is
            capped at {maxVisibleRows.toLocaleString()} visible rows for browser
            performance.
          </p>
        ) : null}
      </section>

      <ArCoatingsSection coatings={priceList.arCoatings} />
      <AddOnSections sections={priceList.addOnSections} />
      <ReferenceKey />
    </div>
  );
}

function ExpandedOptions({
  rows,
  priceMode,
}: {
  rows: PriceListPricingRow[];
  priceMode: PriceMode;
}) {
  const groups = ["Clear", "Photochromic", "Polarized"] as const;

  return (
    <div className="grid gap-4">
      {groups.map((group) => {
        const groupRows = rows
          .filter((row) => row.materialColor === group)
          .sort((a, b) => compareText(a.colorBrand, b.colorBrand) || priceFor(a, priceMode) - priceFor(b, priceMode));
        if (!groupRows.length) return null;

        return (
          <div key={group}>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">{group} Options</h3>
            <div className="mt-2 grid gap-2">
              {groupRows.map((row) => (
                <div key={row.id} className="grid gap-2 rounded-[2px] border border-[#eadfce] bg-white/82 p-3 md:grid-cols-[160px_1fr_120px_120px] md:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7654]">Color Brand</p>
                    <p className="font-semibold text-[#122033]">{row.colorBrand}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7654]">Available Colors</p>
                    <p className="text-sm leading-5 text-[#4d5664]">{row.availableColors.join(", ")}</p>
                    <p className="mt-1 text-xs text-[#776f63]">Raw: {row.rawProductNames.join(", ")} | Codes: {row.colorRaw.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7654]">Edged</p>
                    <p className="font-bold text-[#122033]">{currency(row.edgedPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7654]">Uncut</p>
                    <p className="font-bold text-[#122033]">{currency(row.uncutPrice)}</p>
                    <p className="text-xs text-[#776f63]">Deduct {currency(row.uncutDeduct)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArCoatingsSection({ coatings }: { coatings: PriceListArCoating[] }) {
  const groupedCoatings = useMemo(() => {
    const order = [
      "Artisan Coatings",
      "TechShield Coatings",
      "Tokai AR Coatings",
      "Crizal AR Coatings",
      "Hoya AR Coatings",
      "Shamir AR Coatings",
      "Mirror Coatings",
    ];
    return order
      .map((family) => ({
        family,
        items: coatings.filter((coating) => coating.brandFamily === family),
      }))
      .filter((group) => group.items.length > 0);
  }, [coatings]);

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="AR Coatings" eyebrow="P6 Add-Ons" />
      <div className="mt-4 grid gap-5">
        {groupedCoatings.map((group) => (
          <div key={group.family}>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">{group.family}</h3>
            <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((coating) => (
                <article key={`${coating.brandFamily}-${coating.name}`} className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold text-[#122033]">{coating.name}</h4>
                    <p className="text-lg font-bold text-[#122033]">{currency(coating.price)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {coating.recommended ? <Badge tone="recommended">★ Recommended</Badge> : null}
                    {coating.outsourced ? <Badge tone="outsourced">➜ Outsourced</Badge> : null}
                  </div>
                  {coating.notes ? <p className="mt-3 text-xs leading-5 text-[#625b53]">{coating.notes}</p> : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AddOnSections({ sections }: { sections: PriceListAddOnSection[] }) {
  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="Materials, Options, Finishing, and Shipping" eyebrow="PDF Price Guide Sections" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">{section.title}</h3>
            <div className="mt-3 grid gap-2">
              {section.items.map((item) => (
                <div key={`${section.title}-${item.name}`} className="flex items-start justify-between gap-3 border-b border-[#f1e6d8] pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-[#122033]">{item.name}</p>
                    {item.notes ? <p className="text-xs text-[#625b53]">{item.notes}</p> : null}
                    <div className="mt-1 flex gap-1">
                      {item.recommended ? <Badge tone="recommended">★</Badge> : null}
                      {item.outsourced ? <Badge tone="outsourced">➜</Badge> : null}
                    </div>
                  </div>
                  <p className="shrink-0 font-bold text-[#122033]">{typeof item.price === "number" ? currency(item.price) : item.price}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferenceKey() {
  const entries = [
    ["★", "Recommended for Best Service"],
    ["➜", "Outsourced Product"],
    ["SV", "Single Vision"],
    ["ESV", "Enhanced Single Vision with Power Boost"],
    ["MF", "Multifocal Design"],
    ["OCP", "Occupational Progressive Design"],
    ["PAL", "Progressive Design"],
  ];

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-white/75 p-4 text-sm shadow-[0_12px_34px_rgba(18,32,51,0.05)] md:p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Reference Key</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {entries.map(([label, description]) => (
          <div key={label} className="flex gap-2">
            <span className="font-bold text-[#122033]">{label}</span>
            <span className="text-[#4d5664]">{description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-[#dfd2bf] pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033]">{title}</h2>
    </div>
  );
}
