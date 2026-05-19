"use client";

import { useMemo, useState } from "react";
import type {
  GeneratedPriceListData,
  PriceListPricingRow,
} from "@/lib/pricing/types";

type PriceMode = "edged" | "uncut";

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
    row.productName,
    row.productNameRaw,
    row.material,
    row.materialRaw,
    row.color,
    row.colorRaw,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
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

export default function InteractivePriceListDashboard({
  priceList,
}: {
  priceList: GeneratedPriceListData;
}) {
  const [brand, setBrand] = useState("All");
  const [product, setProduct] = useState("All");
  const [material, setMaterial] = useState("All");
  const [color, setColor] = useState("All");
  const [query, setQuery] = useState("");
  const [priceMode, setPriceMode] = useState<PriceMode>("edged");
  const normalizedQuery = query.trim().toLowerCase();

  const options = useMemo(
    () => ({
      brands: uniqueValues(priceList.rows, "brand"),
      products: uniqueValues(priceList.rows, "productName"),
      materials: uniqueValues(priceList.rows, "material"),
      colors: uniqueValues(priceList.rows, "color"),
    }),
    [priceList.rows]
  );

  const filteredRows = useMemo(() => {
    return priceList.rows.filter((row) => {
      if (brand !== "All" && row.brand !== brand) return false;
      if (product !== "All" && row.productName !== product) return false;
      if (material !== "All" && row.material !== material) return false;
      if (color !== "All" && row.color !== color) return false;
      return matchesQuery(row, normalizedQuery);
    });
  }, [brand, color, material, normalizedQuery, priceList.rows, product]);

  const visibleRows = filteredRows.slice(0, maxVisibleRows);
  const showingLimitedRows = filteredRows.length > visibleRows.length;

  return (
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
            Search and filter normalized P6 product, material, and color pricing.
            Prices are generated at build time from the private source workbook.
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
              placeholder="Search product, brand, material, color..."
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
          label="Brand"
          value={brand}
          options={options.brands}
          onChange={setBrand}
        />
        <SelectFilter
          label="Product / Design"
          value={product}
          options={options.products}
          onChange={setProduct}
        />
        <SelectFilter
          label="Material"
          value={material}
          options={options.materials}
          onChange={setMaterial}
        />
        <SelectFilter
          label="Color"
          value={color}
          options={options.colors}
          onChange={setColor}
        />
      </div>

      <div className="flex flex-col gap-2 border-b border-[#eadfce] px-4 py-3 text-xs font-semibold text-[#625b53] md:flex-row md:items-center md:justify-between md:px-6">
        <span>
          Showing {visibleRows.length.toLocaleString()} of{" "}
          {filteredRows.length.toLocaleString()} matching rows
        </span>
        <span>
          Generated {new Date(priceList.report.generatedAt).toLocaleDateString("en-US")} from{" "}
          {priceList.report.rowCount.toLocaleString()} source rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-[#122033] text-white">
              {[
                "Product / Design",
                "Brand",
                "Material",
                "Color",
                "Edged and Assembled",
                "Uncut",
                "Deduct",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-r border-[#34455a] px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={`${row.materialRaw}-${row.productNameRaw}-${row.colorRaw}-${index}`}
                className={index % 2 === 0 ? "bg-white/82" : "bg-[#fffaf2]/82"}
              >
                <td className="border-b border-r border-[#eadfce] px-3 py-3 align-top font-semibold text-[#122033]">
                  {row.productName}
                </td>
                <td className="border-b border-r border-[#eadfce] px-3 py-3 align-top text-[#2f3744]">
                  {row.brand}
                </td>
                <td className="border-b border-r border-[#eadfce] px-3 py-3 align-top text-[#2f3744]">
                  {row.material}
                </td>
                <td className="border-b border-r border-[#eadfce] px-3 py-3 align-top text-[#2f3744]">
                  <span className="font-semibold">{row.color}</span>
                  <span className="ml-2 text-xs text-[#776f63]">{row.colorRaw}</span>
                </td>
                <td
                  className={`border-b border-r border-[#eadfce] px-3 py-3 align-top font-bold ${
                    priceMode === "edged" ? "text-[#122033]" : "text-[#625b53]"
                  }`}
                >
                  {currency(row.edgedPrice)}
                </td>
                <td
                  className={`border-b border-r border-[#eadfce] px-3 py-3 align-top font-bold ${
                    priceMode === "uncut" ? "text-[#122033]" : "text-[#625b53]"
                  }`}
                >
                  {currency(row.uncutPrice)}
                </td>
                <td className="border-b border-[#eadfce] px-3 py-3 align-top text-[#2f3744]">
                  {currency(row.uncutDeduct)}
                </td>
              </tr>
            ))}
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
  );
}
