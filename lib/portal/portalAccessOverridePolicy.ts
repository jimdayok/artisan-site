export const PORTAL_PROGRAM_OPTIONS = [
  { code: "LABPARTNER", label: "New Lab Partner" },
  { code: "ARSWITCH26", label: "Simple Switch" },
  { code: "ARSQL26", label: "Sequel Rewards" },
  { code: "ARUTY26", label: "Unity Rewards" },
  { code: "ARPMP26", label: "PMP Rewards" },
  { code: "SSAR26", label: "Neurolens" },
  { code: "AQU2630", label: "Acquios" },
] as const;

export type PortalAccessBaseAccount = {
  accountNumber: string;
  aliases: string[];
  practiceName: string;
  emails: string[];
  priceLists: string[];
  programs: string[];
  onboarding: boolean;
  customerTypeCode?: string;
  customerTypeLabel?: string;
  hasReports: boolean;
};

export type PortalAccessAdminEvent = {
  id: string;
  timestamp: string;
  actorEmail: string;
  accountNumber: string;
} & (
  | {
      type: "account-created";
      practiceName: string;
      emails: string[];
      priceLists: string[];
      programs: string[];
      onboarding: boolean;
    }
  | { type: "email-added" | "email-removed"; email: string }
  | { type: "price-lists-set"; priceLists: string[] }
  | { type: "programs-set"; programs: string[] }
  | { type: "onboarding-set"; onboarding: boolean }
);

export type PortalAccessAdminEventInput =
  PortalAccessAdminEvent extends infer Event
    ? Event extends PortalAccessAdminEvent
      ? Omit<Event, "id" | "timestamp"> & {
          id?: string;
          timestamp?: string;
        }
      : never
    : never;

export type PortalAccessAdminEventBody =
  PortalAccessAdminEvent extends infer Event
    ? Event extends PortalAccessAdminEvent
      ? Omit<Event, "id" | "timestamp" | "actorEmail"> & {
          id?: string;
          timestamp?: string;
        }
      : never
    : never;

export type PortalAccessAccountOverride = {
  accountNumber: string;
  practiceName?: string;
  createdInPortal: boolean;
  emailsAdded: string[];
  emailsRemoved: string[];
  priceLists?: string[];
  programs?: string[];
  onboarding?: boolean;
  createdAt?: string;
  updatedAt: string;
  updatedBy: string;
};

export type EffectivePortalAccessAccount = PortalAccessBaseAccount & {
  createdInPortal: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function normalizePortalAccessAccountNumber(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\.0$/, "")
    .replace(/[^A-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function normalizePortalAccessEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function normalizePortalAccessPrograms(values: unknown[]) {
  return unique(
    values
      .flatMap((value) => String(value ?? "").split(/[;,|]/))
      .map((value) => value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
      .filter(Boolean)
  ).sort((a, b) => a.localeCompare(b));
}

export function reducePortalAccessEvents(events: PortalAccessAdminEvent[]) {
  const overrides = new Map<string, PortalAccessAccountOverride>();
  const ordered = [...events].sort(
    (a, b) =>
      a.timestamp.localeCompare(b.timestamp) || a.id.localeCompare(b.id)
  );

  for (const event of ordered) {
    const accountNumber = normalizePortalAccessAccountNumber(
      event.accountNumber
    );
    if (!accountNumber) continue;

    const current = overrides.get(accountNumber) ?? {
      accountNumber,
      createdInPortal: false,
      emailsAdded: [],
      emailsRemoved: [],
      updatedAt: event.timestamp,
      updatedBy: event.actorEmail,
    };

    if (event.type === "account-created") {
      current.createdInPortal = true;
      current.practiceName = event.practiceName.trim();
      current.createdAt ||= event.timestamp;
      current.emailsAdded = unique(
        event.emails.map(normalizePortalAccessEmail).filter(Boolean)
      );
      current.emailsRemoved = current.emailsRemoved.filter(
        (email) => !current.emailsAdded.includes(email)
      );
      current.priceLists = unique(event.priceLists.map((value) => value.toUpperCase()));
      current.programs = normalizePortalAccessPrograms(event.programs);
      current.onboarding = event.onboarding;
    } else if (event.type === "email-added") {
      const email = normalizePortalAccessEmail(event.email);
      if (email) {
        current.emailsAdded = unique([...current.emailsAdded, email]);
        current.emailsRemoved = current.emailsRemoved.filter(
          (value) => value !== email
        );
      }
    } else if (event.type === "email-removed") {
      const email = normalizePortalAccessEmail(event.email);
      if (email) {
        current.emailsRemoved = unique([...current.emailsRemoved, email]);
        current.emailsAdded = current.emailsAdded.filter(
          (value) => value !== email
        );
      }
    } else if (event.type === "price-lists-set") {
      current.priceLists = unique(
        event.priceLists.map((value) => value.trim().toUpperCase()).filter(Boolean)
      );
    } else if (event.type === "programs-set") {
      current.programs = normalizePortalAccessPrograms(event.programs);
    } else if (event.type === "onboarding-set") {
      current.onboarding = event.onboarding;
    }

    current.updatedAt = event.timestamp;
    current.updatedBy = event.actorEmail;
    overrides.set(accountNumber, current);
  }

  return overrides;
}

export function applyPortalAccessOverrides(
  baseAccounts: PortalAccessBaseAccount[],
  events: PortalAccessAdminEvent[]
) {
  const overrides = reducePortalAccessEvents(events);
  const accounts = new Map<string, EffectivePortalAccessAccount>();

  for (const base of baseAccounts) {
    const accountNumber = normalizePortalAccessAccountNumber(base.accountNumber);
    if (!accountNumber) continue;
    accounts.set(accountNumber, {
      ...base,
      accountNumber,
      aliases: unique(
        [accountNumber, ...base.aliases].map(normalizePortalAccessAccountNumber)
      ),
      emails: unique(base.emails.map(normalizePortalAccessEmail).filter(Boolean)),
      priceLists: unique(base.priceLists.map((value) => value.toUpperCase())),
      programs: normalizePortalAccessPrograms(base.programs),
      createdInPortal: false,
    });
  }

  for (const [accountNumber, override] of overrides) {
    const base = accounts.get(accountNumber);
    const emails = unique([
      ...(base?.emails ?? []),
      ...override.emailsAdded,
    ]).filter((email) => !override.emailsRemoved.includes(email));

    accounts.set(accountNumber, {
      accountNumber,
      aliases: base?.aliases ?? [accountNumber],
      practiceName:
        override.practiceName || base?.practiceName || accountNumber,
      emails,
      priceLists: override.priceLists ?? base?.priceLists ?? [],
      programs: override.programs ?? base?.programs ?? [],
      onboarding: override.onboarding ?? base?.onboarding ?? false,
      customerTypeCode: base?.customerTypeCode ?? "",
      customerTypeLabel: base?.customerTypeLabel ?? "",
      hasReports: base?.hasReports ?? false,
      createdInPortal: override.createdInPortal,
      updatedAt: override.updatedAt,
      updatedBy: override.updatedBy,
    });
  }

  return [...accounts.values()].sort(
    (a, b) =>
      a.practiceName.localeCompare(b.practiceName) ||
      a.accountNumber.localeCompare(b.accountNumber)
  );
}
