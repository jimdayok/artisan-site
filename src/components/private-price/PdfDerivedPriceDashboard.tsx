"use client";

import { useMemo, useState } from "react";
import type { PdfDerivedPriceList } from "../../data/pdfDerivedPriceLists";

function rowSearchText(row: string[]) {
  return row.join(" ").toLowerCase();
}

export default function PdfDerivedPriceDashboard({
  priceList,
}: {
  priceList: PdfDerivedPriceList;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const visibleRows = useMemo(() => {
    if (!normalizedQuery) return priceList.rows;

    return priceList.rows.filter((row) =>
      rowSearchText(row).includes(normalizedQuery)
    );
  }, [normalizedQuery, priceList.rows]);

  const maxColumns = useMemo(
    () => Math.max(...priceList.rows.map((row) => row.length), 1),
    [priceList.rows]
  );

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/92 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <div className="grid gap-5 border-b border-[#dfd2bf] pb-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            PDF-derived source table
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
            {priceList.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4d5664]">
            This online table is extracted from {priceList.sourceFile}. Use
            search to narrow designs, materials, coatings, and handling items.
          </p>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
            Search this price list
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product, material, coating, price..."
            className="mt-2 h-12 w-full rounded-full border border-[#d7c5a8] bg-white px-5 text-sm font-semibold text-[#122033] outline-none transition placeholder:text-[#8b8171] focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          />
        </label>
      </div>

      <div className="mobile-scroll-row mt-5 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <tbody>
            {visibleRows.map((row, rowIndex) => {
              const isHeading =
                row.filter(Boolean).length <= 3 ||
                row.some((cell) => /price list code|lens designs/i.test(cell));

              return (
                <tr
                  key={`${row.join("-")}-${rowIndex}`}
                  className={isHeading ? "bg-[#122033] text-white" : "bg-white/72"}
                >
                  {Array.from({ length: maxColumns }, (_, columnIndex) => {
                    const cell = row[columnIndex] ?? "";

                    return (
                      <td
                        key={columnIndex}
                        className={`border-b border-r border-[#eadfce] px-3 py-2 align-top ${
                          isHeading
                            ? "border-[#34455a] text-xs font-semibold uppercase tracking-[0.12em] text-white"
                            : "text-[#2f3744]"
                        }`}
                      >
                        {cell || <span className="text-transparent">.</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#6d6252]">
        Data is presented from the source PDF extraction. Any apparent split
        cells or formatting artifacts should be checked against the official PDF.
      </p>
    </section>
  );
}
