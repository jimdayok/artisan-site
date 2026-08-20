const orderingMethods = [
  {
    name: "DVI Rx Wizard",
    instruction:
      "Select the AVDV package under PACKAGES at the start of the order. This limits the available selections to the options included in the program and applies the correct pricing.",
  },
  {
    name: "SpecCheck Rx",
    instruction:
      "Select the AVDV service code under SERVICES after entering the lens order and before the open message field.",
  },
  {
    name: "VisionWeb",
    instruction:
      "Under COATINGS, select the AVDV package so the qualifying program code is sent to the lab with the order.",
  },
] as const;

export default function ValueSystemRequirements({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`rounded-md border border-[#c9924a] bg-[#fff7e8] text-[#172a28] ${compact ? "p-4" : "p-5 sm:p-6"}`}
      aria-labelledby={compact ? undefined : "vd-ordering-requirements"}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#865719]">
        Required for VD pricing
      </p>
      <h2
        id={compact ? undefined : "vd-ordering-requirements"}
        className={`${compact ? "mt-2 text-base" : "mt-2 text-2xl"} font-semibold tracking-[-0.025em]`}
      >
        This is the 2025 Artisan Value System price list.
      </h2>
      <p className={`mt-3 leading-6 text-[#5f5548] ${compact ? "text-xs" : "text-sm"}`}>
        To receive the prices shown on the VD price list, the order must be entered through
        Digital Vision, SpecCheck, or VisionWeb using the AVDV package or service code described
        below. Phone and fax orders are not eligible.
      </p>
      {!compact ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {orderingMethods.map((method) => (
            <article key={method.name} className="rounded-md border border-[#e4c995] bg-white p-4">
              <h3 className="font-semibold">{method.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5f5548]">{method.instruction}</p>
            </article>
          ))}
        </div>
      ) : null}
      <p className={`mt-4 font-semibold leading-6 text-[#7d3e2d] ${compact ? "text-xs" : "text-sm"}`}>
        The program does not allow substitutions or upgrades beyond the designs, materials,
        coatings, and services specifically included on the VD price list. Any non-program
        selection is priced under the customer&apos;s standard price list instead.
      </p>
    </section>
  );
}
