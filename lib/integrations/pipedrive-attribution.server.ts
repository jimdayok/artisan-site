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
  field?: {
    id?: unknown;
    ref?: unknown;
  };
  type?: unknown;
  email?: unknown;
  text?: unknown;
  phone_number?: unknown;
  contact_info?: {
    first_name?: unknown;
    last_name?: unknown;
    email?: unknown;
    phone_number?: unknown;
    company?: unknown;
  };
};

type TypeformPayload = {
  event_type?: unknown;
  form_response?: {
    form_id?: unknown;
    token?: unknown;
    submitted_at?: unknown;
    hidden?: unknown;
    answers?: unknown;
    definition?: unknown;
  };
};

export type PipedriveContact = {
  email: string;
  name: string;
  phone?: string;
  company?: string;
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
  errorStage?:
    | "deal_fields"
    | "person_search"
    | "person_create"
    | "organization_search"
    | "organization_create"
    | "deal_search"
    | "lead_search"
    | "deal_update"
    | "lead_update"
    | "lead_create"
    | "unknown";
  httpStatus?: number;
};

type PipedriveSyncOptions = {
  apiToken?: string;
  companyDomain?: string;
  contactMode?: "classic" | "upsert";
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
    const email = safeString(
      entry?.type === "email"
        ? entry.email
        : entry?.type === "contact_info"
          ? entry.contact_info?.email
          : "",
      254,
    ).toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email;
  }
  return "";
}

function cleanContactText(value: unknown, maxLength: number) {
  return safeString(value, maxLength)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanName(value: unknown) {
  const name = cleanContactText(value, 200);
  return name && /[a-z]/i.test(name) ? name : "";
}

function cleanPhone(value: unknown) {
  const phone = cleanContactText(value, 40);
  return phone && /\d{7}/.test(phone.replace(/\D/g, "")) ? phone : "";
}

function normalizedTitle(value: unknown) {
  return cleanContactText(value, 200)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function definitionTitles(value: unknown) {
  const titles = new Map<string, string>();
  const visit = (entry: unknown, depth: number) => {
    if (depth > 5) return;
    if (Array.isArray(entry)) {
      for (const item of entry) visit(item, depth + 1);
      return;
    }
    const record = recordValue(entry);
    if (!record) return;
    const title = normalizedTitle(record.title);
    const id = safeString(record.id, 100);
    const ref = safeString(record.ref, 100);
    if (title && id) titles.set(id, title);
    if (title && ref) titles.set(ref, title);
    for (const child of Object.values(record)) {
      if (Array.isArray(child)) visit(child, depth + 1);
    }
  };
  visit(value, 0);
  return titles;
}

function answerFieldTitle(answer: TypeformAnswer, titles: Map<string, string>) {
  return (
    titles.get(safeString(answer.field?.id, 100)) ??
    titles.get(safeString(answer.field?.ref, 100)) ??
    ""
  );
}

export function extractPipedriveContact(
  payload: unknown,
): PipedriveContact | undefined {
  const webhook = recordValue(payload) as TypeformPayload | undefined;
  const response = webhook?.form_response;
  const formId = safeString(response?.form_id, 20);
  if (webhook?.event_type !== "form_response" || !ALLOWED_FORM_IDS.has(formId)) {
    return undefined;
  }

  const email = answerEmail(response?.answers);
  if (!email || !Array.isArray(response?.answers)) return undefined;

  const titles = definitionTitles(response.definition);
  let firstName = "";
  let lastName = "";
  let fullName = "";
  let phone = "";
  let company = "";

  for (const answer of response.answers as TypeformAnswer[]) {
    const contact = recordValue(answer.contact_info);
    if (contact) {
      firstName ||= cleanName(contact.first_name);
      lastName ||= cleanName(contact.last_name);
      phone ||= cleanPhone(contact.phone_number);
      company ||= cleanContactText(contact.company, 255);
    }

    const title = answerFieldTitle(answer, titles);
    if (title === "your name") fullName ||= cleanName(answer.text);
    if (title === "practice phone number") {
      phone ||= cleanPhone(answer.phone_number ?? answer.text);
    }
    if (title === "your business name") {
      company ||= cleanContactText(answer.text, 255);
    }
  }

  const name =
    fullName || [firstName, lastName].filter(Boolean).join(" ") || "Website Contact";
  return {
    email,
    name,
    ...(phone ? { phone } : {}),
    ...(company ? { company } : {}),
  };
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
  if (!response.ok) {
    throw new PipedriveRequestError(
      pipedriveRequestStage(path, init?.method),
      response.status,
    );
  }
  const body = (await response.json()) as { success?: unknown; data?: unknown };
  if (body.success === false) {
    throw new PipedriveRequestError(
      pipedriveRequestStage(path, init?.method),
      response.status,
    );
  }
  return body.data;
}

type PipedriveErrorStage = NonNullable<
  PipedriveAttributionResult["errorStage"]
>;

class PipedriveRequestError extends Error {
  readonly stage: PipedriveErrorStage;
  readonly httpStatus: number;

  constructor(stage: PipedriveErrorStage, httpStatus: number) {
    super("Pipedrive request failed");
    this.stage = stage;
    this.httpStatus = httpStatus;
  }
}

function pipedriveRequestStage(
  path: string,
  method = "GET",
): PipedriveErrorStage {
  if (path.startsWith("/api/v2/dealFields")) return "deal_fields";
  if (path.startsWith("/api/v2/persons/search")) return "person_search";
  if (path === "/api/v2/persons" && method === "POST") return "person_create";
  if (path.startsWith("/api/v2/persons/")) return "person_search";
  if (path.startsWith("/api/v2/organizations/search")) {
    return "organization_search";
  }
  if (path === "/api/v2/organizations" && method === "POST") {
    return "organization_create";
  }
  if (path.startsWith("/api/v2/deals/") && method === "PATCH") {
    return "deal_update";
  }
  if (path.startsWith("/api/v2/deals")) return "deal_search";
  if (path.startsWith("/api/v1/leads/") && method === "PATCH") {
    return "lead_update";
  }
  if (path === "/api/v1/leads" && method === "POST") return "lead_create";
  if (path.startsWith("/api/v1/leads")) return "lead_search";
  return "unknown";
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

function organizationIds(value: unknown) {
  return listData(value)
    .map((entry) => {
      const record = recordValue(entry);
      return numericId(recordValue(record?.item)?.id ?? record?.id);
    })
    .filter((id): id is number => Boolean(id));
}

function countValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function canonicalPersonId(
  fetchImpl: typeof fetch,
  baseUrl: string,
  apiToken: string,
  ids: readonly number[],
) {
  const candidates = await Promise.all(
    ids.slice(0, 20).map(async (id) => {
      const query = new URLSearchParams({
        include_fields:
          "open_deals_count,closed_deals_count,activities_count,notes_count",
      });
      const person = recordValue(
        await pipedriveRequest(
          fetchImpl,
          baseUrl,
          apiToken,
          `/api/v2/persons/${id}?${query}`,
        ),
      );
      const relationshipCount =
        countValue(person?.open_deals_count) +
        countValue(person?.closed_deals_count) +
        countValue(person?.activities_count) +
        countValue(person?.notes_count);
      const addTime = Date.parse(safeString(person?.add_time, 50));
      return {
        id,
        relationshipCount,
        addTime: Number.isFinite(addTime) ? addTime : Number.MAX_SAFE_INTEGER,
      };
    }),
  );
  return candidates.sort(
    (left, right) =>
      right.relationshipCount - left.relationshipCount ||
      left.addTime - right.addTime ||
      left.id - right.id,
  )[0]?.id;
}

async function findOrCreateOrganizationId(
  fetchImpl: typeof fetch,
  baseUrl: string,
  apiToken: string,
  company: string,
) {
  const query = new URLSearchParams({
    term: company,
    fields: "name",
    exact_match: "true",
    limit: "20",
  });
  const ids = organizationIds(
    await pipedriveRequest(
      fetchImpl,
      baseUrl,
      apiToken,
      `/api/v2/organizations/search?${query}`,
    ),
  );
  if (ids.length > 0) return Math.min(...ids);

  const created = recordValue(
    await pipedriveRequest(
      fetchImpl,
      baseUrl,
      apiToken,
      "/api/v2/organizations",
      { method: "POST", body: JSON.stringify({ name: company }) },
    ),
  );
  return numericId(created?.id);
}

async function createPerson(
  fetchImpl: typeof fetch,
  baseUrl: string,
  apiToken: string,
  contact: PipedriveContact,
) {
  const organizationId = contact.company
    ? await findOrCreateOrganizationId(
        fetchImpl,
        baseUrl,
        apiToken,
        contact.company,
      )
    : undefined;
  const created = recordValue(
    await pipedriveRequest(fetchImpl, baseUrl, apiToken, "/api/v2/persons", {
      method: "POST",
      body: JSON.stringify({
        name: contact.name,
        emails: [{ value: contact.email, primary: true, label: "work" }],
        ...(contact.phone
          ? {
              phones: [
                { value: contact.phone, primary: true, label: "work" },
              ],
            }
          : {}),
        ...(organizationId ? { org_id: organizationId } : {}),
      }),
    }),
  );
  return numericId(created?.id);
}

async function closestSubmittedPersonId(
  fetchImpl: typeof fetch,
  baseUrl: string,
  apiToken: string,
  ids: readonly number[],
  submittedAt: number,
) {
  const candidates = await Promise.all(
    ids.slice(0, 10).map(async (id) => {
      const person = recordValue(
        await pipedriveRequest(
          fetchImpl,
          baseUrl,
          apiToken,
          `/api/v2/persons/${id}`,
        ),
      );
      return { id, addTime: Date.parse(safeString(person?.add_time, 50)) };
    }),
  );
  return candidates
    .filter(
      (candidate) =>
        Number.isFinite(candidate.addTime) &&
        candidate.addTime >= submittedAt - DEAL_WINDOW_BEFORE_MS &&
        candidate.addTime <= submittedAt + DEAL_WINDOW_AFTER_MS,
    )
    .sort(
      (left, right) =>
        Math.abs(left.addTime - submittedAt) -
          Math.abs(right.addTime - submittedAt) || left.id - right.id,
    )[0]?.id;
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

function pipedriveTimestamp(milliseconds: number) {
  // Pipedrive documents RFC3339 timestamps but rejects fractional seconds.
  return new Date(milliseconds).toISOString().replace(/\.\d{3}Z$/, "Z");
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

  const contactMode =
    options.contactMode ?? process.env.PIPEDRIVE_TYPEFORM_CONTACT_MODE ?? "classic";
  if (contactMode !== "classic" && contactMode !== "upsert") {
    return { status: "configuration_error" };
  }

  const attribution = extractPipedriveAttribution(payload);
  if (!attribution) return { status: "skipped" };
  const contact = extractPipedriveContact(payload);
  if (contactMode === "upsert" && !contact) return { status: "skipped" };

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
    const earliest = pipedriveTimestamp(
      submittedAt - DEAL_WINDOW_BEFORE_MS,
    );
    const requestedFields = Array.from(codes.values()).join(",");
    const retryDelaysMs =
      options.retryDelaysMs ??
      (contactMode === "upsert" ? [0] : [0, 750, 1500, 3000]);
    let deal: DealCandidate | undefined;
    let lead: LeadCandidate | undefined;
    let matchedPersonId: number | undefined;
    let matchingPersonIds: number[] = [];
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
      matchingPersonIds = people;
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

    if (!deal && !lead) {
      if (contactMode === "upsert") {
        matchedPersonId =
          (matchingPersonIds.length > 0
            ? await canonicalPersonId(
                fetchImpl,
                baseUrl,
                apiToken,
                matchingPersonIds,
              )
            : undefined) ??
          (contact
            ? await createPerson(
                fetchImpl,
                baseUrl,
                apiToken,
                contact,
              )
            : undefined);
      } else if (matchingPersonIds.length > 0) {
        matchedPersonId = await closestSubmittedPersonId(
          fetchImpl,
          baseUrl,
          apiToken,
          matchingPersonIds,
          submittedAt,
        );
      }
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
  } catch (error) {
    if (error instanceof PipedriveRequestError) {
      return {
        status: "api_error",
        errorStage: error.stage,
        httpStatus: error.httpStatus,
      };
    }
    return { status: "api_error" };
  }
}
