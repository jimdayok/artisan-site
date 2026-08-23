const FIELD_NAMES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "landing_page",
  "referrer",
  "site_version",
  "lab_name",
] as const;

const ALLOWED_FORM_IDS = new Set(["m0lQ9zjD", "quuPCSff"]);
const ALLOWED_SITE_VERSIONS = new Set(["existing", "preview", "production"]);
const ALLOWED_LABS = new Set(["Pike", "Peak", "Pacific", "Network"]);
const SENSITIVE_VALUE_PATTERN = /@|(?:\D|^)\d{7,}(?:\D|$)/;
const DEAL_WINDOW_BEFORE_MS = 2 * 60 * 1000;
const DEAL_WINDOW_AFTER_MS = 20 * 60 * 1000;

type FieldName = (typeof FIELD_NAMES)[number];

type TypeformAnswer = {
  type?: unknown;
  email?: unknown;
};

type TypeformPayload = {
  event_type?: unknown;
  form_response?: {
    form_id?: unknown;
    token?: unknown;
    submitted_at?: unknown;
    hidden?: unknown;
    answers?: unknown;
  };
};

export type PipedriveAttribution = Partial<Record<FieldName, string>> & {
  formId: string;
  respondentEmail: string;
  submissionId: string;
  submittedAt: string;
};

export type PipedriveAttributionResult = {
  status:
    | "disabled"
    | "skipped"
    | "created"
    | "updated"
    | "unchanged"
    | "not_found"
    | "configuration_error"
    | "api_error";
  updatedFieldCount?: number;
};

type PipedriveSyncOptions = {
  apiToken?: string;
  companyDomain?: string;
  fetchImpl?: typeof fetch;
  now?: number;
  retryDelaysMs?: readonly number[];
};

function safeString(value: unknown, maxLength = 255) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeCampaignValue(value: unknown) {
  const candidate = safeString(value, 100);
  return candidate && !SENSITIVE_VALUE_PATTERN.test(candidate) ? candidate : "";
}

function recordValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function hiddenFields(value: unknown) {
  const record = recordValue(value);
  if (!record) return {} as Record<string, string>;
  return Object.fromEntries(
    Object.entries(record)
      .filter(([, entry]) => typeof entry === "string")
      .map(([key, entry]) => [key, safeString(entry, 500)]),
  );
}

function cleanPage(value: unknown) {
  try {
    const url = new URL(safeString(value, 1000));
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return "";
  }
}

function cleanReferrer(value: unknown) {
  try {
    const url = new URL(safeString(value, 1000));
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.origin.slice(0, 255);
  } catch {
    return "";
  }
}

function answerEmail(value: unknown) {
  if (!Array.isArray(value)) return "";
  for (const entry of value as TypeformAnswer[]) {
    if (entry?.type !== "email") continue;
    const email = safeString(entry.email, 254).toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
  }
  return "";
}

export function extractPipedriveAttribution(
  payload: unknown,
): PipedriveAttribution | undefined {
  const webhook = recordValue(payload) as TypeformPayload | undefined;
  if (!webhook || webhook.event_type !== "form_response") return undefined;

  const response = webhook.form_response;
  const formId = safeString(response?.form_id, 20);
  if (!ALLOWED_FORM_IDS.has(formId)) return undefined;

  const respondentEmail = answerEmail(response?.answers);
  const submissionId = safeString(response?.token, 128);
  const submittedAt = safeString(response?.submitted_at, 40);
  if (
    !respondentEmail ||
    !/^[a-z0-9_-]{8,128}$/i.test(submissionId) ||
    !Number.isFinite(Date.parse(submittedAt))
  ) {
    return undefined;
  }

  const hidden = hiddenFields(response?.hidden);
  const siteVersion = ALLOWED_SITE_VERSIONS.has(hidden.site_version)
    ? hidden.site_version
    : "";
  if (!siteVersion) return undefined;

  const labName = ALLOWED_LABS.has(hidden.lab_name)
    ? hidden.lab_name
    : "Network";
  const attribution: PipedriveAttribution = {
    formId,
    respondentEmail,
    submissionId,
    submittedAt,
    site_version: siteVersion,
    lab_name: labName,
  };

  for (const name of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const) {
    const value = safeCampaignValue(hidden[name]);
    if (value) attribution[name] = value;
  }

  const landingPage = cleanPage(hidden.landing_page || hidden.page_location);
  const referrer = cleanReferrer(hidden.referrer);
  if (landingPage) attribution.landing_page = landingPage;
  if (referrer) attribution.referrer = referrer;

  return attribution;
}

async function pipedriveRequest(
  fetchImpl: typeof fetch,
  baseUrl: string,
  apiToken: string,
  path: string,
  init?: RequestInit,
) {
  const url = new URL(path, baseUrl);
  // Pipedrive personal API tokens are authenticated with the api_token query
  // parameter. Never log or return this URL because it contains the token.
  url.searchParams.set("api_token", apiToken);
  const response = await fetchImpl(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Pipedrive request failed");
  const body = (await response.json()) as { success?: unknown; data?: unknown };
  if (body.success === false) throw new Error("Pipedrive request failed");
  return body.data;
}

function listData(value: unknown) {
  if (Array.isArray(value)) return value;
  const record = recordValue(value);
  return Array.isArray(record?.items) ? record.items : [];
}

function numericId(value: unknown) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function personIds(value: unknown) {
  return listData(value)
    .map((entry) => {
      const record = recordValue(entry);
      return numericId(recordValue(record?.item)?.id ?? record?.id);
    })
    .filter((id): id is number => Boolean(id));
}

function fieldCodes(value: unknown) {
  const result = new Map<FieldName, string>();
  for (const entry of listData(value)) {
    const field = recordValue(entry);
    const name = safeString(field?.field_name ?? field?.name, 100) as FieldName;
    const code = safeString(field?.field_code ?? field?.key, 100);
    if (FIELD_NAMES.includes(name) && /^[a-f0-9]{40}$/i.test(code)) {
      result.set(name, code);
    }
  }
  return result;
}

type DealCandidate = {
  id: number;
  addTime: number;
  customFields: Record<string, unknown>;
};

type LeadCandidate = {
  id: string;
  addTime: number;
  originId: string;
  customFields: Record<string, unknown>;
};

function dealCandidates(value: unknown) {
  const candidates: DealCandidate[] = [];
  for (const entry of listData(value)) {
    const deal = recordValue(entry);
    const id = numericId(deal?.id);
    const addTime = Date.parse(safeString(deal?.add_time, 50));
    if (!id || !Number.isFinite(addTime)) continue;
    candidates.push({
      id,
      addTime,
      customFields: recordValue(deal?.custom_fields) ?? {},
    });
  }
  return candidates;
}

function leadCandidates(value: unknown) {
  const candidates: LeadCandidate[] = [];
  for (const entry of listData(value)) {
    const lead = recordValue(entry);
    const id = safeString(lead?.id, 80);
    const addTime = Date.parse(safeString(lead?.add_time, 50));
    if (!id || !Number.isFinite(addTime)) continue;
    const customFields = Object.fromEntries(
      Object.entries(lead ?? {}).filter(([key]) => /^[a-f0-9]{40}$/i.test(key)),
    );
    candidates.push({
      id,
      addTime,
      originId: safeString(lead?.origin_id, 255),
      customFields,
    });
  }
  return candidates;
}

function isEmptyField(value: unknown) {
  return value === undefined || value === null || value === "";
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function syncPipedriveAttribution(
  payload: unknown,
  options: PipedriveSyncOptions = {},
): Promise<PipedriveAttributionResult> {
  const apiToken = (options.apiToken ?? process.env.PIPEDRIVE_API_TOKEN)?.trim();
  const companyDomain = (
    options.companyDomain ?? process.env.PIPEDRIVE_COMPANY_DOMAIN
  )?.trim();
  if (!apiToken && !companyDomain) return { status: "disabled" };
  if (!apiToken || !/^[a-z0-9-]+$/i.test(companyDomain ?? "")) {
    return { status: "configuration_error" };
  }

  const attribution = extractPipedriveAttribution(payload);
  if (!attribution) return { status: "skipped" };

  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = `https://${companyDomain}.pipedrive.com`;

  try {
    const fieldData = await pipedriveRequest(
      fetchImpl,
      baseUrl,
      apiToken,
      "/api/v2/dealFields?limit=500",
    );
    const codes = fieldCodes(fieldData);
    if (codes.size !== FIELD_NAMES.length) {
      return { status: "configuration_error" };
    }

    const submittedAt = Date.parse(attribution.submittedAt);
    const earliest = new Date(submittedAt - DEAL_WINDOW_BEFORE_MS).toISOString();
    const requestedFields = Array.from(codes.values()).join(",");
    const retryDelaysMs = options.retryDelaysMs ?? [0, 750, 1500, 3000];
    let deal: DealCandidate | undefined;
    let lead: LeadCandidate | undefined;
    let matchedPersonId: number | undefined;
    const originId = `typeform:${attribution.submissionId}`;

    // Typeform's Pipedrive Classic integration and this signed webhook run
    // independently. Brief bounded retries allow the Classic-created contact,
    // and any separately configured lead/deal, to appear before we create a
    // neutral Leads Inbox record ourselves.
    for (const retryDelay of retryDelaysMs) {
      if (retryDelay > 0) await wait(retryDelay);
      const search = new URLSearchParams({
        term: attribution.respondentEmail,
        fields: "email",
        exact_match: "true",
        limit: "20",
      });
      const people = personIds(
        await pipedriveRequest(
          fetchImpl,
          baseUrl,
          apiToken,
          `/api/v2/persons/search?${search}`,
        ),
      );
      matchedPersonId = people[0] ?? matchedPersonId;
      const allDeals: DealCandidate[] = [];
      for (const personId of people.slice(0, 10)) {
        const query = new URLSearchParams({
          person_id: String(personId),
          updated_since: earliest,
          sort_by: "add_time",
          sort_direction: "desc",
          custom_fields: requestedFields,
          limit: "20",
        });
        const deals = await pipedriveRequest(
          fetchImpl,
          baseUrl,
          apiToken,
          `/api/v2/deals?${query}`,
        );
        allDeals.push(...dealCandidates(deals));
      }

      deal = allDeals
        .filter(
          (candidate) =>
            candidate.addTime >= submittedAt - DEAL_WINDOW_BEFORE_MS &&
            candidate.addTime <=
              Math.min(
                options.now ?? Date.now(),
                submittedAt + DEAL_WINDOW_AFTER_MS,
              ),
        )
        .sort(
          (left, right) =>
            Math.abs(left.addTime - submittedAt) -
              Math.abs(right.addTime - submittedAt) ||
            right.id - left.id,
        )[0];
      if (deal) break;

      const allLeads: LeadCandidate[] = [];
      for (const personId of people.slice(0, 10)) {
        const query = new URLSearchParams({
          person_id: String(personId),
          sort: "add_time DESC",
          limit: "100",
        });
        const leads = await pipedriveRequest(
          fetchImpl,
          baseUrl,
          apiToken,
          `/api/v1/leads?${query}`,
        );
        allLeads.push(...leadCandidates(leads));
      }
      lead =
        allLeads.find((candidate) => candidate.originId === originId) ??
        allLeads
          .filter(
            (candidate) =>
              candidate.addTime >= submittedAt - DEAL_WINDOW_BEFORE_MS &&
              candidate.addTime <= submittedAt + DEAL_WINDOW_AFTER_MS,
          )
          .sort(
            (left, right) =>
              Math.abs(left.addTime - submittedAt) -
              Math.abs(right.addTime - submittedAt),
          )[0];
      if (lead) break;
    }

    if (!deal && !lead && !matchedPersonId) return { status: "not_found" };

    const updates: Record<string, string> = {};
    for (const fieldName of FIELD_NAMES) {
      const value = attribution[fieldName];
      const code = codes.get(fieldName);
      const existingValue = code
        ? (deal?.customFields[code] ?? lead?.customFields[code])
        : undefined;
      if (value && code && isEmptyField(existingValue)) {
        updates[code] = value;
      }
    }
    const updatedFieldCount = Object.keys(updates).length;
    if ((deal || lead) && updatedFieldCount === 0) {
      return { status: "unchanged" };
    }

    if (deal) {
      await pipedriveRequest(
        fetchImpl,
        baseUrl,
        apiToken,
        `/api/v2/deals/${deal.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ custom_fields: updates }),
        },
      );
      return { status: "updated", updatedFieldCount };
    }

    if (lead) {
      await pipedriveRequest(
        fetchImpl,
        baseUrl,
        apiToken,
        `/api/v1/leads/${lead.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        },
      );
      return { status: "updated", updatedFieldCount };
    }

    await pipedriveRequest(fetchImpl, baseUrl, apiToken, "/api/v1/leads", {
      method: "POST",
      body: JSON.stringify({
        title: `Website inquiry - ${attribution.lab_name}`,
        person_id: matchedPersonId,
        origin_id: originId,
        was_seen: false,
        ...updates,
      }),
    });
    return { status: "created", updatedFieldCount };
  } catch {
    return { status: "api_error" };
  }
}
