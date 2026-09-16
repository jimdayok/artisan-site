function normalizeScheduleKey(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function coatingScheduleName(schedule) {
  const explicit =
    schedule?.name ??
    schedule?.attributes?.Name ??
    schedule?.schedule ??
    "";
  if (String(explicit).trim()) return normalizeScheduleKey(explicit);

  const key = String(schedule?.key ?? "").trim();
  return normalizeScheduleKey(key.includes("::") ? key.split("::").at(-1) : key);
}

function coatingSchedulePriceList(schedule) {
  const explicit =
    schedule?.plist ??
    schedule?.priceList ??
    schedule?.attributes?.PList ??
    "";
  if (String(explicit).trim()) return normalizeScheduleKey(explicit);

  const key = String(schedule?.key ?? "").trim();
  return normalizeScheduleKey(key.includes("::") ? key.split("::")[0] : "");
}

export function referencedCoatingScheduleNames(rows) {
  const names = new Set();
  for (const row of rows ?? []) {
    const values = [
      row?.coatingScheduleRef,
      row?.sourceRefs?.styleRow?.COT,
      row?.scheduleRefs?.coating,
      row?.scheduleRefs?.coat,
      ...(row?.coatingOptions ?? []).map((coating) => coating?.sourceSchedule),
    ];
    for (const value of values) {
      const normalized = normalizeScheduleKey(value);
      if (normalized && normalized !== "UNKNOWN" && normalized !== "SUPPLEMENTAL") {
        names.add(normalized);
      }
    }
  }
  return names;
}

export function selectReferencedCoatingSchedules(
  rows,
  schedules,
  { priceListCode } = {}
) {
  const referencedNames = referencedCoatingScheduleNames(rows);
  if (referencedNames.size === 0) return [];

  const referencedPriceLists = new Set(
    [priceListCode, ...(rows ?? []).map((row) => row?.code)]
      .map(normalizeScheduleKey)
      .filter(Boolean)
  );

  return (schedules ?? []).filter((schedule) => {
    const name = coatingScheduleName(schedule);
    if (!referencedNames.has(name)) return false;

    const schedulePriceList = coatingSchedulePriceList(schedule);
    return (
      referencedPriceLists.size === 0 ||
      !schedulePriceList ||
      referencedPriceLists.has(schedulePriceList)
    );
  });
}
