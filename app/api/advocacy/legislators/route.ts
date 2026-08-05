import { NextResponse } from "next/server";
import type { CivicLookupRequest, Legislator } from "../../../../lib/advocacy/types";

type CivicOfficial = {
  name?: string;
  party?: string;
  phones?: string[];
  urls?: string[];
  photoUrl?: string;
  channels?: Array<{ type?: string; id?: string }>;
};

type CivicOffice = {
  name?: string;
  divisionId?: string;
  levels?: string[];
  roles?: string[];
  officialIndices?: number[];
};

type CivicResponse = {
  offices?: CivicOffice[];
  officials?: CivicOfficial[];
  error?: { code?: number; message?: string; status?: string };
};

type CensusGeography = {
  BASENAME?: string;
  NAME?: string;
  CD119?: string;
  SLDU?: string;
  SLDL?: string;
};

type CensusResponse = {
  result?: {
    addressMatches?: Array<{
      geographies?: Record<string, CensusGeography[]>;
    }>;
  };
};

type CurrentLegislator = {
  id?: { bioguide?: string };
  name?: { official_full?: string; first?: string; last?: string };
  terms?: Array<{
    type?: "sen" | "rep";
    state?: string;
    district?: number;
    party?: string;
    state_rank?: string;
    url?: string;
    contact_form?: string;
    phone?: string;
    office?: string;
  }>;
};

const CIVIC_ENDPOINTS = [
  "https://www.googleapis.com/civicinfo/v2/representatives",
  "https://civicinfo.googleapis.com/civicinfo/v2/representatives",
];
const CENSUS_GEOCODER_ENDPOINT = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";
const CURRENT_LEGISLATORS_ENDPOINT = "https://unitedstates.github.io/congress-legislators/legislators-current.json";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const VERIFIED_STATE_OFFICIALS: Record<string, Legislator> = {
  "TX-upper-8": {
    id: "tx-state-senate-8-angela-paxton",
    name: "Angela Paxton",
    office: "Texas State Senator · District 8",
    party: "Republican",
    websiteUrl: "https://www.senate.texas.gov/member.php?d=8",
    phone: "(512) 463-0108",
    contactFormUrl: "https://www.senate.texas.gov/member.php?d=8",
    level: "state",
  },
  "TX-lower-61": {
    id: "tx-state-house-61-keresa-richardson",
    name: "Keresa Richardson",
    office: "Texas State Representative · District 61",
    party: "Republican",
    websiteUrl: "https://www.house.texas.gov/members/4735",
    phone: "(512) 463-0738",
    contactFormUrl: "https://www.house.texas.gov/members/4735/email",
    level: "state",
  },
};

function normalizeApiKey(value: string) {
  return value.trim().replace(/^key=/i, "").replace(/^["']|["']$/g, "");
}

function normalizeLevel(office: CivicOffice): Legislator["level"] {
  if (office.levels?.some((level) => level.includes("country"))) return "federal";
  if (office.levels?.some((level) => level.includes("administrativeArea1"))) return "state";
  return "local";
}

function contactUrl(official: CivicOfficial) {
  return official.urls?.find((url) => /contact|email|write|forms?/i.test(url)) ?? official.urls?.[0];
}

function officialId(office: CivicOffice, official: CivicOfficial, index: number) {
  return `${office.name ?? "office"}-${official.name ?? "official"}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function isRelevantOffice(office: CivicOffice) {
  const name = office.name?.toLowerCase() ?? "";
  return (
    name.includes("senate") ||
    name.includes("senator") ||
    name.includes("representative") ||
    name.includes("house") ||
    name.includes("congress") ||
    name.includes("assembly") ||
    name.includes("delegate")
  );
}

function mapOfficials(data: CivicResponse): Legislator[] {
  const officials = data.officials ?? [];
  const mapped: Legislator[] = [];

  for (const office of data.offices ?? []) {
    if (!isRelevantOffice(office)) continue;

    for (const officialIndex of office.officialIndices ?? []) {
      const official = officials[officialIndex];
      if (!official?.name) continue;
      mapped.push({
        id: officialId(office, official, officialIndex),
        name: official.name,
        office: office.name ?? "Elected Official",
        party: official.party,
        photoUrl: official.photoUrl,
        websiteUrl: official.urls?.[0],
        phone: official.phones?.[0],
        contactFormUrl: contactUrl(official),
        level: normalizeLevel(office),
      });
    }
  }

  return mapped;
}

function fallbackOfficials(state: string): Legislator[] {
  const normalizedState = state.trim().toUpperCase();
  return [
    {
      id: `${normalizedState}-us-senate-lookup`,
      name: `${normalizedState} U.S. Senators`,
      office: "United States Senate",
      websiteUrl: "https://www.senate.gov/senators/senators-contact.htm",
      contactFormUrl: "https://www.senate.gov/senators/senators-contact.htm",
      level: "federal",
    },
    {
      id: `${normalizedState}-us-house-lookup`,
      name: "Find Your U.S. House Representative",
      office: "United States House of Representatives",
      websiteUrl: "https://www.house.gov/representatives/find-your-representative",
      contactFormUrl: "https://www.house.gov/representatives/find-your-representative",
      level: "federal",
    },
    {
      id: `${normalizedState}-state-legislature-lookup`,
      name: `${normalizedState} State Legislature Lookup`,
      office: "State Senator and State Representative",
      websiteUrl: "https://openstates.org/find_your_legislator/",
      contactFormUrl: "https://openstates.org/find_your_legislator/",
      level: "state",
    },
  ];
}

function latestTerm(person: CurrentLegislator) {
  return person.terms?.[person.terms.length - 1];
}

function officialName(person: CurrentLegislator) {
  return (
    person.name?.official_full ||
    [person.name?.first, person.name?.last].filter(Boolean).join(" ") ||
    "Elected Official"
  );
}

function officialPhotoUrl(person: CurrentLegislator) {
  const bioguide = person.id?.bioguide?.toLowerCase();
  return bioguide ? `https://www.congress.gov/img/member/${bioguide}_200.jpg` : undefined;
}

function federalLegislator(person: CurrentLegislator, office: string): Legislator | null {
  const term = latestTerm(person);
  if (!term?.state || !term.type) return null;

  return {
    id: `${term.state}-${term.type}-${term.district ?? term.state_rank ?? officialName(person)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: officialName(person),
    office,
    party: term.party,
    photoUrl: officialPhotoUrl(person),
    websiteUrl: term.url,
    phone: term.phone,
    contactFormUrl: term.contact_form || term.url,
    level: "federal",
  };
}

async function getCensusDistricts(address: string) {
  const url = new URL(CENSUS_GEOCODER_ENDPOINT);
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const data = (await response.json()) as CensusResponse;
  const geographies = data.result?.addressMatches?.[0]?.geographies;
  if (!geographies) return null;

  const congressional =
    geographies["119th Congressional Districts"]?.[0] ||
    geographies["118th Congressional Districts"]?.[0];
  const upper = geographies["2024 State Legislative Districts - Upper"]?.[0];
  const lower = geographies["2024 State Legislative Districts - Lower"]?.[0];

  return {
    congressionalDistrict: Number(congressional?.BASENAME || congressional?.CD119),
    stateSenateDistrict: upper?.BASENAME || upper?.SLDU,
    stateHouseDistrict: lower?.BASENAME || lower?.SLDL,
  };
}

async function enhancedFallbackOfficials(address: string, state: string): Promise<Legislator[]> {
  const normalizedState = state.trim().toUpperCase();
  const districts = await getCensusDistricts(address);
  const response = await fetch(CURRENT_LEGISLATORS_ENDPOINT, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return fallbackOfficials(normalizedState);

  const people = (await response.json()) as CurrentLegislator[];
  const senators = people
    .filter((person) => {
      const term = latestTerm(person);
      return term?.state === normalizedState && term.type === "sen";
    })
    .map((person) => {
      const rank = latestTerm(person)?.state_rank;
      return federalLegislator(
        person,
        `${STATE_NAMES[normalizedState] ?? normalizedState} U.S. Senator${rank ? ` (${rank})` : ""}`
      );
    })
    .filter((person): person is Legislator => Boolean(person));

  const houseMember = people.find((person) => {
    const term = latestTerm(person);
    return (
      term?.state === normalizedState &&
      term.type === "rep" &&
      Number(term.district) === Number(districts?.congressionalDistrict)
    );
  });
  const houseLegislator = houseMember
    ? federalLegislator(
        houseMember,
        `${STATE_NAMES[normalizedState] ?? normalizedState} Congressional District ${districts?.congressionalDistrict}`
      )
    : null;

  const stateLookupUrl = `https://openstates.org/find_your_legislator/?address=${encodeURIComponent(address)}`;
  const verifiedStateSenator = districts?.stateSenateDistrict
    ? VERIFIED_STATE_OFFICIALS[`${normalizedState}-upper-${Number(districts.stateSenateDistrict)}`]
    : undefined;
  const verifiedStateRepresentative = districts?.stateHouseDistrict
    ? VERIFIED_STATE_OFFICIALS[`${normalizedState}-lower-${Number(districts.stateHouseDistrict)}`]
    : undefined;
  const stateLegislatorEntries: Array<Legislator | null> = [
    verifiedStateSenator ??
      (districts?.stateSenateDistrict
      ? {
          id: `${normalizedState}-state-senate-${districts.stateSenateDistrict}`,
          name: `${STATE_NAMES[normalizedState] ?? normalizedState} State Senate District ${districts.stateSenateDistrict}`,
          office: "State Senator district lookup",
          websiteUrl: stateLookupUrl,
          contactFormUrl: stateLookupUrl,
          level: "state",
        }
      : null),
    verifiedStateRepresentative ??
      (districts?.stateHouseDistrict
      ? {
          id: `${normalizedState}-state-house-${districts.stateHouseDistrict}`,
          name: `${STATE_NAMES[normalizedState] ?? normalizedState} State House District ${districts.stateHouseDistrict}`,
          office: "State Representative district lookup",
          websiteUrl: stateLookupUrl,
          contactFormUrl: stateLookupUrl,
          level: "state",
        }
      : null),
  ];
  const stateLegislators = stateLegislatorEntries.filter(
    (person): person is Legislator => person !== null
  );

  const results = [...senators, ...(houseLegislator ? [houseLegislator] : []), ...stateLegislators];
  return results.length ? results : fallbackOfficials(normalizedState);
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_CIVIC_API_KEY ? normalizeApiKey(process.env.GOOGLE_CIVIC_API_KEY) : "";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Legislator lookup is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Partial<CivicLookupRequest>;
  const address = [body.address, body.city, body.state, body.zip].filter(Boolean).join(", ");

  if (!body.address || !body.city || !body.state || !body.zip) {
    return NextResponse.json({ error: "Address, city, state, and ZIP are required." }, { status: 400 });
  }

  let lastError = "Unable to complete legislator lookup.";

  for (const endpoint of CIVIC_ENDPOINTS) {
    const url = new URL(endpoint);
    url.searchParams.set("address", address);
    url.searchParams.set("includeOffices", "true");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, { cache: "no-store" });
    const data = (await response.json()) as CivicResponse;

    if (response.ok) {
      const legislators = mapOfficials(data);
      if (legislators.length > 0) {
        return NextResponse.json({ legislators, normalizedInput: address });
      }

      return NextResponse.json({
        legislators: await enhancedFallbackOfficials(address, body.state ?? ""),
        normalizedInput: address,
        warning:
          "Google Civic returned no matching officials. Showing district-resolved federal officials and state district lookup links.",
      });
    }

    lastError = data.error?.message ?? lastError;

    if (response.status !== 404 || !/method not found/i.test(lastError)) break;
  }

  if (/method not found/i.test(lastError)) {
    const legislators = await enhancedFallbackOfficials(address, body.state ?? "");

    return NextResponse.json({
      legislators,
      normalizedInput: address,
      warning:
        "Google Civic representatives lookup is currently unavailable. Showing district-resolved federal officials and state district lookup links.",
    });
  }

  return NextResponse.json({
    legislators: await enhancedFallbackOfficials(address, body.state ?? ""),
    normalizedInput: address,
    warning: `Google Civic lookup returned: ${lastError}. Showing district-resolved federal officials and state district lookup links.`,
  });
}
