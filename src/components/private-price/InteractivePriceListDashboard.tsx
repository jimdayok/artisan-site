"use client";

import { useMemo, useState } from "react";
import type {
  GeneratedPriceListData,
  PriceListAddOnSection,
  PriceListArCoating,
  PriceListPricingRow,
} from "@/lib/pricing/types";

type PriceMode = "edged" | "uncut";
type ViewBy = "designType" | "brand";
type MaterialGroup = "Clear" | "Photochromic" | "Polarized";
type SortKey =
  | "brand"
  | "designType"
  | "designStyle"
  | "clear"
  | "photochromic"
  | "polarized";
type SortDirection = "asc" | "desc";
type AvailabilityFilter = "all" | "yes" | "no";

type DesignRow = {
  id: string;
  designType: string;
  brand: string;
  designStyle: string;
  rows: PriceListPricingRow[];
  clearFrom?: PriceListPricingRow;
  photoFrom?: PriceListPricingRow;
  polarizedFrom?: PriceListPricingRow;
  recommended: boolean;
  outsourced: boolean;
};

type MaterialOption = {
  material: string;
  rows: PriceListPricingRow[];
  clear?: PriceListPricingRow;
  photochromic?: PriceListPricingRow;
  polarized?: PriceListPricingRow;
};

type OptionFamily = {
  family: string;
  rows: PriceListPricingRow[];
  from?: PriceListPricingRow;
  colors: string[];
  materials: string[];
};

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

function priceLabel(row: PriceListPricingRow | undefined, mode: PriceMode, prefix = false) {
  if (!row) return "—";
  return `${prefix ? "From " : ""}${currency(priceFor(row, mode))}`;
}

function minRow(rows: PriceListPricingRow[], group: MaterialGroup, mode: PriceMode) {
  return rows
    .filter((row) => row.materialColor === group)
    .sort((a, b) => priceFor(a, mode) - priceFor(b, mode))[0];
}

function rowMatchesSearch(row: PriceListPricingRow, query: string) {
  if (!query) return true;
  return [
    row.designType,
    row.brand,
    row.designStyle,
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

function uniqueValues<T>(rows: T[], getter: (row: T) => string) {
  return [...new Set(rows.map(getter).filter(Boolean))].sort(compareText);
}

function groupDesignRows(rows: PriceListPricingRow[], mode: PriceMode) {
  const groups = new Map<string, DesignRow>();

  for (const row of rows) {
    const key = `${row.designType}|${row.brand}|${row.designStyle}`;
    const current =
      groups.get(key) ||
      ({
        id: key.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        designType: row.designType,
        brand: row.brand,
        designStyle: row.designStyle,
        rows: [],
        recommended: false,
        outsourced: false,
      } satisfies DesignRow);
    current.rows.push(row);
    current.recommended = current.recommended || row.recommended;
    current.outsourced = current.outsourced || row.outsourced;
    groups.set(key, current);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    clearFrom: minRow(group.rows, "Clear", mode),
    photoFrom: minRow(group.rows, "Photochromic", mode),
    polarizedFrom: minRow(group.rows, "Polarized", mode),
  }));
}

function sortDesignRows(
  rows: DesignRow[],
  sort: { key: SortKey; direction: SortDirection } | null,
  mode: PriceMode
) {
  return [...rows].sort((a, b) => {
    if (!sort) {
      return (
        compareText(a.designType, b.designType) ||
        compareText(a.brand, b.brand) ||
        compareText(a.designStyle, b.designStyle)
      );
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    const value =
      sort.key === "clear"
        ? priceFor(a.clearFrom, mode) - priceFor(b.clearFrom, mode)
        : sort.key === "photochromic"
          ? priceFor(a.photoFrom, mode) - priceFor(b.photoFrom, mode)
          : sort.key === "polarized"
            ? priceFor(a.polarizedFrom, mode) - priceFor(b.polarizedFrom, mode)
            : compareText(String(a[sort.key]), String(b[sort.key]));

    return direction * value || compareText(a.designStyle, b.designStyle);
  });
}

function inlineMarker(label: string, recommended: boolean, outsourced: boolean) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      {recommended ? <span className="text-[#7a5a18]">★</span> : null}
      {outsourced ? <span className="text-[#8a4f28]">➜</span> : null}
    </span>
  );
}

function markerText(recommended: boolean, outsourced: boolean) {
  if (recommended && outsourced) return "★ Recommended · ➜ Outsourced";
  if (recommended) return "★ Recommended";
  if (outsourced) return "➜ Outsourced";
  return "";
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
        {label}
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

function AvailabilitySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AvailabilityFilter;
  onChange: (value: AvailabilityFilter) => void;
}) {
  return (
    <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AvailabilityFilter)}
        className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
      >
        <option value="all">All</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
}

function formatGroupTitle(value: string) {
  const map: Record<string, string> = {
    SV: "Single Vision",
    "ENHANCED SV": "Enhanced Single Vision",
  };
  return map[value.toUpperCase()] ?? value;
}

export default function InteractivePriceListDashboard({
  priceList,
}: {
  priceList: GeneratedPriceListData;
}) {
  const [viewBy, setViewBy] = useState<ViewBy>("designType");
  const [designType, setDesignType] = useState("All");
  const [brand, setBrand] = useState("All");
  const [designStyle, setDesignStyle] = useState("All");
  const [query, setQuery] = useState("");
  const [materialAvailable, setMaterialAvailable] = useState("All");
  const [hasPhotochromic, setHasPhotochromic] = useState<AvailabilityFilter>("all");
  const [hasPolarized, setHasPolarized] = useState<AvailabilityFilter>("all");
  const [colorBrand, setColorBrand] = useState("All");
  const [priceMode, setPriceMode] = useState<PriceMode>("edged");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const queryText = query.trim().toLowerCase();

  const baseFilteredRows = useMemo(
    () =>
      priceList.rows.filter((row) => {
        if (designType !== "All" && row.designType !== designType) return false;
        if (brand !== "All" && row.brand !== brand) return false;
        if (designStyle !== "All" && row.designStyle !== designStyle) return false;
        if (queryText && !rowMatchesSearch(row, queryText)) return false;
        return true;
      }),
    [priceList.rows, designType, brand, designStyle, queryText]
  );

  const designRows = useMemo(() => {
    const grouped = sortDesignRows(groupDesignRows(baseFilteredRows, priceMode), sort, priceMode);
    return grouped.filter((row) => {
      if (materialAvailable !== "All" && !row.rows.some((entry) => entry.material === materialAvailable)) return false;
      if (colorBrand !== "All" && !row.rows.some((entry) => entry.colorBrand === colorBrand)) return false;

      const hasPhoto = row.rows.some((entry) => entry.materialColor === "Photochromic");
      const hasPolar = row.rows.some((entry) => entry.materialColor === "Polarized");
      if (hasPhotochromic === "yes" && !hasPhoto) return false;
      if (hasPhotochromic === "no" && hasPhoto) return false;
      if (hasPolarized === "yes" && !hasPolar) return false;
      if (hasPolarized === "no" && hasPolar) return false;
      return true;
    });
  }, [
    baseFilteredRows,
    priceMode,
    sort,
    materialAvailable,
    colorBrand,
    hasPhotochromic,
    hasPolarized,
  ]);

  const options = useMemo(() => {
    const rows = priceList.rows;
    const dependentBrands = uniqueValues(
      rows.filter(
        (row) =>
          (designType === "All" || row.designType === designType) &&
          (designStyle === "All" || row.designStyle === designStyle) &&
          (!queryText || rowMatchesSearch(row, queryText))
      ),
      (row) => row.brand
    );
    const dependentTypes = uniqueValues(
      rows.filter(
        (row) =>
          (brand === "All" || row.brand === brand) &&
          (designStyle === "All" || row.designStyle === designStyle) &&
          (!queryText || rowMatchesSearch(row, queryText))
      ),
      (row) => row.designType
    );
    const dependentStyles = uniqueValues(
      rows.filter(
        (row) =>
          (brand === "All" || row.brand === brand) &&
          (designType === "All" || row.designType === designType) &&
          (!queryText || rowMatchesSearch(row, queryText))
      ),
      (row) => row.designStyle
    );
    const materialOptions = uniqueValues(baseFilteredRows, (row) => row.material);
    const colorBrandOptions = uniqueValues(baseFilteredRows, (row) => row.colorBrand);
    return {
      brands: dependentBrands,
      designTypes: dependentTypes,
      designStyles: dependentStyles,
      materials: materialOptions,
      colorBrands: colorBrandOptions,
    };
  }, [priceList.rows, baseFilteredRows, brand, designType, designStyle, queryText]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, Map<string, DesignRow[]>>();
    for (const row of designRows) {
      const top = viewBy === "designType" ? formatGroupTitle(row.designType) : row.brand;
      const nested = viewBy === "designType" ? row.brand : formatGroupTitle(row.designType);
      if (!map.has(top)) map.set(top, new Map());
      const nestedMap = map.get(top)!;
      nestedMap.set(nested, [...(nestedMap.get(nested) ?? []), row]);
    }

    return [...map.entries()]
      .sort(([a], [b]) => compareText(a, b))
      .map(([section, nested]) => ({
        section,
        nestedGroups: [...nested.entries()]
          .sort(([a], [b]) => compareText(a, b))
          .map(([label, rows]) => ({ label, rows })),
      }));
  }, [designRows, viewBy]);

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
    { key: "designType", label: "Design Type" },
    { key: "brand", label: "Brand" },
    { key: "designStyle", label: "Design Style" },
    { key: "clear", label: "Clear From" },
    { key: "photochromic", label: "Photochromic From" },
    { key: "polarized", label: "Polarized From" },
    { label: "Markers" },
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
              Guided Lens Pricing Builder
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4d5664]">
              Start with design, then open each row to build price by material and
              clear/photochromic/polarized options.
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
                placeholder="Search design, brand, material, color options, raw names..."
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

        <div className="grid gap-3 border-b border-[#eadfce] p-4 md:grid-cols-2 md:p-6 xl:grid-cols-5">
          <SelectFilter
            label="Step 1: Design Type"
            value={designType}
            options={options.designTypes}
            onChange={setDesignType}
          />
          <SelectFilter
            label="Step 2: Brand"
            value={brand}
            options={options.brands}
            onChange={setBrand}
          />
          <SelectFilter
            label="Step 3: Design Style"
            value={designStyle}
            options={options.designStyles}
            onChange={setDesignStyle}
          />
          <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              View By
            </span>
            <select
              value={viewBy}
              onChange={(event) => setViewBy(event.target.value as ViewBy)}
              className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
            >
              <option value="designType">Design Type</option>
              <option value="brand">Brand</option>
            </select>
          </label>
          <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              Sort
            </span>
            <select
              value={sort ? `${sort.key}:${sort.direction}` : "default"}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "default") {
                  setSort(null);
                  return;
                }
                const [key, direction] = value.split(":");
                setSort({ key: key as SortKey, direction: direction as SortDirection });
              }}
              className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
            >
              <option value="default">Default</option>
              <option value="designType:asc">Design Type A-Z</option>
              <option value="brand:asc">Brand A-Z</option>
              <option value="designStyle:asc">Design Style A-Z</option>
              <option value="clear:asc">Clear From Low-High</option>
              <option value="clear:desc">Clear From High-Low</option>
              <option value="photochromic:asc">Photochromic From Low-High</option>
              <option value="photochromic:desc">Photochromic From High-Low</option>
              <option value="polarized:asc">Polarized From Low-High</option>
              <option value="polarized:desc">Polarized From High-Low</option>
            </select>
          </label>
        </div>

        <details className="border-b border-[#eadfce] px-4 py-3 md:px-6">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">
            Advanced Filters
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SelectFilter
              label="Material Available"
              value={materialAvailable}
              options={options.materials}
              onChange={setMaterialAvailable}
            />
            <AvailabilitySelect
              label="Photochromic Available"
              value={hasPhotochromic}
              onChange={setHasPhotochromic}
            />
            <AvailabilitySelect
              label="Polarized Available"
              value={hasPolarized}
              onChange={setHasPolarized}
            />
            <SelectFilter
              label="Color Brand Available"
              value={colorBrand}
              options={options.colorBrands}
              onChange={setColorBrand}
            />
          </div>
        </details>

        <div className="flex flex-col gap-2 border-b border-[#eadfce] px-4 py-3 text-xs font-semibold text-[#625b53] md:flex-row md:items-center md:justify-between md:px-6">
          <span>
            Showing {designRows.length.toLocaleString()} top-level design rows
          </span>
          {priceMode === "uncut" ? (
            <span>Uncut price reflects the listed uncut deduction.</span>
          ) : null}
          <span>
            Source rows: {priceList.report.rawSourceRowsProcessed.toLocaleString()}
          </span>
        </div>

        <div className="grid gap-5 p-4 md:p-6">
          {groupedSections.map((section) => (
            <section key={section.section} className="rounded-[2px] border border-[#e7dccb] bg-white/70">
              <header className="border-b border-[#eadfce] bg-[#f8f1e6] px-4 py-3">
                <h3 className="text-base font-semibold text-[#122033]">{section.section}</h3>
              </header>
              <div className="grid gap-4 p-3 md:p-4">
                {section.nestedGroups.map((nested) => (
                  <div key={`${section.section}-${nested.label}`} className="rounded-[2px] border border-[#eadfce] bg-white/82">
                    <div className="border-b border-[#f0e6d8] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">
                      {nested.label}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left text-sm">
                        <thead>
                          <tr className="bg-[#122033] text-white">
                            {sortableHeaders.map((heading) => (
                              <th
                                key={heading.label}
                                className="border-r border-[#34455a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
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
                                ) : (
                                  heading.label
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {nested.rows.map((row, index) => {
                            const expanded = expandedIds.has(row.id);
                            const marker = markerText(row.recommended, row.outsourced);

                            return (
                              <tr
                                key={row.id}
                                className={index % 2 === 0 ? "bg-white/82" : "bg-[#fffaf2]/82"}
                              >
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">
                                  {formatGroupTitle(row.designType)}
                                </td>
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">
                                  {row.brand}
                                </td>
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 font-semibold text-[#122033]">
                                  {inlineMarker(row.designStyle, row.recommended, row.outsourced)}
                                </td>
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">
                                  {priceLabel(row.clearFrom, priceMode, true)}
                                </td>
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">
                                  {priceLabel(row.photoFrom, priceMode, true)}
                                </td>
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">
                                  {priceLabel(row.polarizedFrom, priceMode, true)}
                                </td>
                                <td className="border-b border-r border-[#eadfce] px-3 py-2 text-xs font-semibold text-[#6d6252]">
                                  {marker || "—"}
                                </td>
                                <td className="border-b border-[#eadfce] px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleExpanded(row.id)}
                                    className="rounded-full border border-[#d7c5a8] bg-white px-3 py-1.5 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6]"
                                  >
                                    {expanded ? "Hide Builder" : "Build Price"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {nested.rows.map((row) =>
                      expandedIds.has(row.id) ? (
                        <div key={`${row.id}-expanded`} className="border-t border-[#eadfce] bg-[#f9f2e8] px-4 py-4">
                          <ExpandedDesignBuilder
                            designRow={row}
                            priceMode={priceMode}
                            addOnSections={priceList.addOnSections}
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <ArCoatingsSection coatings={priceList.arCoatings} />
      <AddOnSections sections={priceList.addOnSections} />
      <ReferenceKey />
    </div>
  );
}

function ExpandedDesignBuilder({
  designRow,
  priceMode,
  addOnSections,
}: {
  designRow: DesignRow;
  priceMode: PriceMode;
  addOnSections: PriceListAddOnSection[];
}) {
  const materialOptions = useMemo(() => {
    const map = new Map<string, MaterialOption>();
    for (const row of designRow.rows) {
      const current = map.get(row.material) ?? {
        material: row.material,
        rows: [],
      };
      current.rows.push(row);
      map.set(row.material, current);
    }

    return [...map.values()]
      .map((entry) => ({
        ...entry,
        clear: minRow(entry.rows, "Clear", priceMode),
        photochromic: minRow(entry.rows, "Photochromic", priceMode),
        polarized: minRow(entry.rows, "Polarized", priceMode),
      }))
      .sort((a, b) => compareText(a.material, b.material));
  }, [designRow.rows, priceMode]);

  const photoFamilies = useMemo(
    () => buildOptionFamilies(designRow.rows, "Photochromic", priceMode),
    [designRow.rows, priceMode]
  );
  const polarizedFamilies = useMemo(
    () => buildOptionFamilies(designRow.rows, "Polarized", priceMode),
    [designRow.rows, priceMode]
  );

  const [selectedMaterial, setSelectedMaterial] = useState(materialOptions[0]?.material ?? "");
  const [selectedCategory, setSelectedCategory] = useState<MaterialGroup>("Clear");
  const [selectedColorFamily, setSelectedColorFamily] = useState("All");

  const selectedRows = useMemo(() => {
    return designRow.rows.filter((row) => {
      if (selectedMaterial && row.material !== selectedMaterial) return false;
      if (row.materialColor !== selectedCategory) return false;
      if (selectedColorFamily !== "All" && row.colorBrand !== selectedColorFamily) return false;
      return true;
    });
  }, [designRow.rows, selectedMaterial, selectedCategory, selectedColorFamily]);

  const selectedPriceRow = useMemo(
    () =>
      [...selectedRows].sort((a, b) => priceFor(a, priceMode) - priceFor(b, priceMode))[0],
    [selectedRows, priceMode]
  );

  const selectedColorFamilies = useMemo(
    () => uniqueValues(selectedRows, (row) => row.colorBrand),
    [selectedRows]
  );

  const availableColors = useMemo(() => {
    return [...new Set(selectedRows.flatMap((row) => row.availableColors))].sort(compareText);
  }, [selectedRows]);

  const rawSourceNames = useMemo(
    () => [...new Set(designRow.rows.flatMap((row) => row.rawProductNames))].sort(compareText),
    [designRow.rows]
  );

  const relatedAddOnTitles = new Set([
    "AR Coatings",
    "Add for Material",
    "Blue Light Filter Options",
    "Photochromic Options",
    "Polarized Options",
    "Finishing Services",
    "Shipping",
  ]);
  const relatedAddOns = addOnSections.filter((section) =>
    relatedAddOnTitles.has(section.title)
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-[2px] border border-[#e4d5c0] bg-white/85 p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">Material</span>
          <select
            value={selectedMaterial}
            onChange={(event) => setSelectedMaterial(event.target.value)}
            className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          >
            {materialOptions.map((option) => (
              <option key={option.material} value={option.material}>
                {option.material}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">
            Material Color
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as MaterialGroup)}
            className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          >
            <option value="Clear">Clear</option>
            <option value="Photochromic">Photochromic</option>
            <option value="Polarized">Polarized</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">Color Brand</span>
          <select
            value={selectedColorFamily}
            onChange={(event) => setSelectedColorFamily(event.target.value)}
            className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          >
            <option value="All">All</option>
            {selectedColorFamilies.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-[2px] border border-[#eadfce] bg-[#fff8ee] p-3 text-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">
            Current Price
          </p>
          <p className="mt-1 text-lg font-bold text-[#122033]">
            {selectedPriceRow ? currency(priceFor(selectedPriceRow, priceMode)) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6d6252]">
            {priceMode === "edged" ? "Edged and Assembled" : "Uncut"}
            {selectedPriceRow ? ` · Deduct ${currency(selectedPriceRow.uncutDeduct)}` : ""}
          </p>
        </div>
      </div>

      <section className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Materials</h4>
        <div className="mt-3 grid gap-2">
          {materialOptions.map((materialOption) => (
            <div
              key={materialOption.material}
              className={`grid gap-2 rounded-[2px] border p-3 md:grid-cols-5 md:items-start ${
                selectedMaterial === materialOption.material
                  ? "border-[#c9b186] bg-[#fff8ee]"
                  : "border-[#eadfce] bg-white"
              }`}
            >
              <div className="font-semibold text-[#122033]">{materialOption.material}</div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a7654]">Clear</p>
                <p className="font-bold text-[#122033]">{priceLabel(materialOption.clear, priceMode, true)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a7654]">Photochromic</p>
                <p className="font-bold text-[#122033]">{priceLabel(materialOption.photochromic, priceMode, true)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a7654]">Polarized</p>
                <p className="font-bold text-[#122033]">{priceLabel(materialOption.polarized, priceMode, true)}</p>
              </div>
              <div className="text-xs text-[#6d6252]">
                {materialOption.clear ? `Deduct ${currency(materialOption.clear.uncutDeduct)}` : "—"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <OptionFamilyPanel title="Photochromic Options" families={photoFamilies} priceMode={priceMode} />
        <OptionFamilyPanel title="Polarized Options" families={polarizedFamilies} priceMode={priceMode} />
      </section>

      <details className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
          Available Add-Ons
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {relatedAddOns.map((section) => (
            <article key={`${designRow.id}-${section.title}`} className="rounded-[2px] border border-[#eadfce] bg-[#fffaf4] p-3">
              <h5 className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7654]">
                {section.title}
              </h5>
              <div className="mt-2 grid gap-1.5">
                {section.items.slice(0, 5).map((item) => (
                  <div key={`${section.title}-${item.name}`} className="flex items-start justify-between gap-2 text-sm">
                    <p className="font-semibold text-[#122033]">
                      {inlineMarker(item.name, Boolean(item.recommended), Boolean(item.outsourced))}
                    </p>
                    <p className="font-bold text-[#122033]">
                      {typeof item.price === "number" ? currency(item.price) : item.price}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </details>

      <section className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Expanded Details</h4>
        <div className="mt-3 grid gap-2 text-sm text-[#4d5664] md:grid-cols-2">
          <p>
            <span className="font-semibold text-[#122033]">Base lens price:</span>{" "}
            {selectedPriceRow ? currency(priceFor(selectedPriceRow, priceMode)) : "—"}
          </p>
          <p>
            <span className="font-semibold text-[#122033]">Selected material:</span>{" "}
            {selectedMaterial || "—"}
          </p>
          <p>
            <span className="font-semibold text-[#122033]">Selected color option:</span>{" "}
            {selectedCategory} {selectedColorFamily !== "All" ? `· ${selectedColorFamily}` : ""}
          </p>
          <p>
            <span className="font-semibold text-[#122033]">Available colors:</span>{" "}
            {availableColors.join(", ") || "—"}
          </p>
          <p className="md:col-span-2">
            <span className="font-semibold text-[#122033]">Source rows normalized into this design:</span>{" "}
            {rawSourceNames.join(", ")}
          </p>
        </div>
      </section>
    </div>
  );
}

function buildOptionFamilies(
  rows: PriceListPricingRow[],
  group: MaterialGroup,
  mode: PriceMode
): OptionFamily[] {
  const map = new Map<string, OptionFamily>();
  for (const row of rows) {
    if (row.materialColor !== group) continue;
    const key = row.colorBrand || "Other";
    const current =
      map.get(key) ||
      ({
        family: key,
        rows: [],
        colors: [],
        materials: [],
      } satisfies OptionFamily);
    current.rows.push(row);
    current.colors = [...new Set([...current.colors, ...row.availableColors])].sort(compareText);
    current.materials = [...new Set([...current.materials, row.material])].sort(compareText);
    map.set(key, current);
  }

  return [...map.values()]
    .map((item) => ({
      ...item,
      from: [...item.rows].sort((a, b) => priceFor(a, mode) - priceFor(b, mode))[0],
    }))
    .sort((a, b) => compareText(a.family, b.family));
}

function OptionFamilyPanel({
  title,
  families,
  priceMode,
}: {
  title: string;
  families: OptionFamily[];
  priceMode: PriceMode;
}) {
  return (
    <section className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
      <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">{title}</h4>
      <div className="mt-3 grid gap-2">
        {families.length === 0 ? (
          <p className="text-sm text-[#6d6252]">No options listed.</p>
        ) : (
          families.map((family) => (
            <div key={`${title}-${family.family}`} className="rounded-[2px] border border-[#eadfce] bg-[#fffaf4] p-3">
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-semibold text-[#122033]">{family.family}</h5>
                <p className="font-bold text-[#122033]">{priceLabel(family.from, priceMode, true)}</p>
              </div>
              <p className="mt-1 text-xs text-[#6d6252]">
                Materials: {family.materials.join(", ") || "—"}
              </p>
              <p className="mt-1 text-xs text-[#6d6252]">
                Available colors: {family.colors.join(", ") || "—"}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
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
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              {group.family}
            </h3>
            <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((coating) => (
                <article
                  key={`${coating.brandFamily}-${coating.name}`}
                  className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold text-[#122033]">
                      {inlineMarker(coating.name, coating.recommended, coating.outsourced)}
                    </h4>
                    <p className="text-lg font-bold text-[#122033]">{currency(coating.price)}</p>
                  </div>
                  {coating.notes ? (
                    <p className="mt-3 text-xs leading-5 text-[#625b53]">{coating.notes}</p>
                  ) : null}
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
      <SectionHeading title="Materials, Options, Finishing, and Shipping" eyebrow="Price Builder Add-Ons" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              {section.title}
            </h3>
            <div className="mt-3 grid gap-2">
              {section.items.map((item) => (
                <div
                  key={`${section.title}-${item.name}`}
                  className="flex items-start justify-between gap-3 border-b border-[#f1e6d8] pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-[#122033]">
                      {inlineMarker(item.name, Boolean(item.recommended), Boolean(item.outsourced))}
                    </p>
                    {item.notes ? <p className="text-xs text-[#625b53]">{item.notes}</p> : null}
                  </div>
                  <p className="shrink-0 font-bold text-[#122033]">
                    {typeof item.price === "number" ? currency(item.price) : item.price}
                  </p>
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
