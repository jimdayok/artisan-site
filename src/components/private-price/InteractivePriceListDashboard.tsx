"use client";

import { Fragment, useMemo, useState } from "react";
import type {
  GeneratedPriceListData,
  PriceListArCoating,
  PriceListPricingRow,
} from "@/lib/pricing/types";

type PriceMode = "edged" | "uncut";
type SortKey =
  | "designType"
  | "designStyle"
  | "brand"
  | "material"
  | "materialColor"
  | "colorBrand"
  | "price";
type SortDirection = "asc" | "desc";

const maxVisibleRows = 300;

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function uniqueValues(rows: PriceListPricingRow[], key: keyof PriceListPricingRow) {
  return [...new Set(rows.map((row) => String(row[key])).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}

function matchesQuery(row: PriceListPricingRow, query: string) {
  if (!query) return true;

  return [
    row.brand,
    row.designType,
    row.designStyle,
    row.rawProductNames.join(" "),
    row.material,
    row.materialRaw,
    row.materialColor,
    row.colorBrand,
    row.colorRaw.join(" "),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "recommended" | "outsourced" }) {
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
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
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

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function rowPrice(row: PriceListPricingRow, priceMode: PriceMode) {
  return priceMode === "edged" ? row.edgedPrice : row.uncutPrice;
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
  const normalizedQuery = query.trim().toLowerCase();

  const options = useMemo(
    () => ({
      brands: uniqueValues(priceList.rows, "brand"),
      designTypes: uniqueValues(priceList.rows, "designType"),
      designStyles: uniqueValues(priceList.rows, "designStyle"),
      materials: uniqueValues(priceList.rows, "material"),
      materialColors: uniqueValues(priceList.rows, "materialColor"),
      colorBrands: uniqueValues(priceList.rows, "colorBrand"),
    }),
    [priceList.rows]
  );

  const filteredRows = useMemo(() => {
    const rows = priceList.rows.filter((row) => {
      if (brand !== "All" && row.brand !== brand) return false;
      if (designType !== "All" && row.designType !== designType) return false;
      if (designStyle !== "All" && row.designStyle !== designStyle) return false;
      if (material !== "All" && row.material !== material) return false;
      if (materialColor !== "All" && row.materialColor !== materialColor) return false;
      if (colorBrand !== "All" && row.colorBrand !== colorBrand) return false;
      return matchesQuery(row, normalizedQuery);
    });

    return rows.sort((a, b) => {
      if (!sort) {
        return (
          compareText(a.brand, b.brand) ||
          compareText(a.designStyle, b.designStyle) ||
          compareText(a.material, b.material) ||
          compareText(a.materialColor, b.materialColor) ||
          rowPrice(a, priceMode) - rowPrice(b, priceMode)
        );
      }

      const direction = sort.direction === "asc" ? 1 : -1;
      const value =
        sort.key === "price"
          ? rowPrice(a, priceMode) - rowPrice(b, priceMode)
          : compareText(String(a[sort.key]), String(b[sort.key]));

      return direction * value || compareText(a.designStyle, b.designStyle);
    });
  }, [brand, colorBrand, designStyle, designType, material, materialColor, normalizedQuery, priceList.rows, priceMode, sort]);

  const visibleRows = filteredRows.slice(0, maxVisibleRows);
  const showingLimitedRows = filteredRows.length > visibleRows.length;
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
    { label: "" },
    { key: "designType", label: "Design Type" },
    { key: "designStyle", label: "Design Style" },
    { key: "brand", label: "Brand" },
    { key: "material", label: "Material" },
    { key: "materialColor", label: "Material Color" },
    { key: "colorBrand", label: "Color Brand" },
    { key: "price", label: "Price" },
  ];

  return (
    <div className="grid gap-8">
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 shadow-[0_22px_60px_rgba(18,32,51,0.08)]">
      <div className="grid gap-5 border-b border-[#dfd2bf] p-4 md:p-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Generated from raw pricing
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033] md:text-3xl">
            {priceList.code} Interactive Price List
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4d5664]">
            Search and filter normalized P6 designs, materials, and color
            groups. Prices are generated at build time from the private source
            workbook.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
              Search product names
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search design style, brand, material, material color, color brand..."
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
        <SelectFilter
          label="Design Type"
          value={designType}
          options={options.designTypes}
          onChange={setDesignType}
        />
        <SelectFilter
          label="Brand"
          value={brand}
          options={options.brands}
          onChange={setBrand}
        />
        <SelectFilter
          label="Design Style"
          value={designStyle}
          options={options.designStyles}
          onChange={setDesignStyle}
        />
        <SelectFilter
          label="Material"
          value={material}
          options={options.materials}
          onChange={setMaterial}
        />
        <SelectFilter
          label="Material Color"
          value={materialColor}
          options={options.materialColors}
          onChange={setMaterialColor}
        />
        <SelectFilter
          label="Color Brand"
          value={colorBrand}
          options={options.colorBrands}
          onChange={setColorBrand}
        />
      </div>

      <div className="flex flex-col gap-2 border-b border-[#eadfce] px-4 py-3 text-xs font-semibold text-[#625b53] md:flex-row md:items-center md:justify-between md:px-6">
        <span>
          Showing {visibleRows.length.toLocaleString()} of{" "}
          {filteredRows.length.toLocaleString()} matching rows
        </span>
        {priceMode === "uncut" ? (
          <span>Uncut price reflects the listed uncut deduction.</span>
        ) : null}
        <span>
          Generated {new Date(priceList.report.generatedAt).toLocaleDateString("en-US")} from{" "}
          {priceList.report.rawSourceRowsProcessed.toLocaleString()} source rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-[#122033] text-white">
              {sortableHeaders.map((heading) => (
                <th
                  key={heading.label || "expand"}
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
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const expanded = expandedIds.has(row.id);
              return (
                <Fragment key={row.id}>
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? "bg-white/82" : "bg-[#fffaf2]/82"}
                  >
                    <td className="w-12 border-b border-r border-[#eadfce] px-2 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(row.id)}
                        className="h-8 w-8 rounded-full border border-[#d7c5a8] bg-white text-sm font-bold text-[#122033] transition hover:bg-[#eadcc6]"
                        aria-label={expanded ? "Collapse row details" : "Expand row details"}
                      >
                        {expanded ? "-" : "+"}
                      </button>
                    </td>
                    <td className="border-b border-r border-[#eadfce] px-3 py-2 align-top text-[#2f3744]">
                      {row.designType}
                    </td>
                    <td className="border-b border-r border-[#eadfce] px-3 py-2 align-top font-semibold text-[#122033]">
                      <span>{row.designStyle}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {row.recommended ? <Badge tone="recommended">Recommended for Best Service</Badge> : null}
                        {row.outsourced ? <Badge tone="outsourced">Outsourced Product</Badge> : null}
                      </span>
                    </td>
                    <td className="border-b border-r border-[#eadfce] px-3 py-2 align-top text-[#2f3744]">
                      {row.brand}
                    </td>
                    <td className="border-b border-r border-[#eadfce] px-3 py-2 align-top text-[#2f3744]">
                      {row.material}
                    </td>
                    <td className="border-b border-r border-[#eadfce] px-3 py-2 align-top text-[#2f3744]">
                      {row.materialColor}
                    </td>
                    <td className="border-b border-r border-[#eadfce] px-3 py-2 align-top text-[#2f3744]">
                      {row.colorBrand}
                    </td>
                    <td className="border-b border-[#eadfce] px-3 py-2 align-top text-base font-bold text-[#122033]">
                      {currency(priceMode === "edged" ? row.edgedPrice : row.uncutPrice)}
                    </td>
                  </tr>
                  {expanded ? (
                    <tr key={`${row.id}-details`} className="bg-[#f9f2e8]">
                      <td className="border-b border-[#eadfce]" />
                      <td colSpan={7} className="border-b border-[#eadfce] px-3 py-3">
                        <div className="grid gap-3 text-xs text-[#4d5664] md:grid-cols-3">
                          <div>
                            <p className="font-bold uppercase tracking-[0.14em] text-[#8a7654]">Raw names normalized here</p>
                            <p className="mt-1 leading-5">{row.rawProductNames.join(", ")}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-[0.14em] text-[#8a7654]">Available Colors</p>
                            <p className="mt-1 leading-5">{row.availableColors.join(", ")}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-[0.14em] text-[#8a7654]">Source details</p>
                            <p className="mt-1 leading-5">Codes: {row.sourceCodes.join(", ")} | Raw color codes: {row.colorRaw.join(", ")}</p>
                            <p className="leading-5">Deduct: {currency(row.uncutDeduct)} | Duplicates collapsed: {row.duplicateSourceRows}</p>
                            <p className="font-bold uppercase tracking-[0.14em] text-[#8a7654]">Notes</p>
                            <p className="mt-1 leading-5">{row.serviceNotes.length ? row.serviceNotes.join(" ") : "No additional source notes for this row."}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showingLimitedRows ? (
        <p className="border-t border-[#eadfce] px-4 py-3 text-xs leading-5 text-[#6d6252] md:px-6">
          Narrow the filters or search to view more specific rows. The table is
          capped at {maxVisibleRows.toLocaleString()} visible rows for browser
          performance.
        </p>
      ) : null}
    </section>

    <ArCoatingsSection coatings={priceList.arCoatings} />
    </div>
  );
}

function ArCoatingsSection({ coatings }: { coatings: PriceListArCoating[] }) {
  const groupedCoatings = useMemo(() => {
    const order = ["Artisan AR", "TechShield", "Crizal", "Hoya", "Shamir", "Other"];
    return order
      .map((family) => ({
        family,
        items: coatings.filter((coating) => coating.brandFamily === family),
      }))
      .filter((group) => group.items.length > 0);
  }, [coatings]);

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <div className="flex flex-col gap-2 border-b border-[#dfd2bf] pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">P6 add-ons</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033]">AR Coatings</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[#4d5664]">
          Coating prices are sourced from the existing P6 PDF-derived data until
          the full AR raw import is rebuilt.
        </p>
      </div>

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
                    {coating.recommended ? <Badge tone="recommended">Preferred</Badge> : null}
                    {coating.outsourced ? <Badge tone="outsourced">Outsourced</Badge> : null}
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
