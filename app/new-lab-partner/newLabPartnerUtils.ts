import type { SetupStatus } from "./onboardingData";

export function computeSetupCompletion(
  statuses: Record<string, SetupStatus>,
  sectionIds: string[],
) {
  if (!sectionIds.length) return 0;

  const resolved = sectionIds.filter((id) => {
    const status = statuses[id] ?? "not-started";
    return status !== "not-started";
  }).length;

  return Math.round((resolved / sectionIds.length) * 100);
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character] ?? character;
  });
}

export function filenameSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "artisan";
}
