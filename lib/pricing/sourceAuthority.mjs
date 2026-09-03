export const DVI_AUTHORITATIVE_PRICE_LIST_CODES = new Set([
  "A6",
  "B5",
  "E5",
  "E6",
  "G6",
  "J1",
  "J2",
  "P6",
  "S5",
  "VD",
  "VX",
]);

export function isDviAuthoritativePriceList(code) {
  return DVI_AUTHORITATIVE_PRICE_LIST_CODES.has(
    String(code ?? "").trim().toUpperCase()
  );
}

export function nonDviLensAddOnSections(sections) {
  return (sections ?? []).filter(
    (section) =>
      !/add for material|blue light|photochromic|polarized/i.test(
        String(section?.title ?? "")
      )
  );
}
