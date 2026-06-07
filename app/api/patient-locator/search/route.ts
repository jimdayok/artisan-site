import { NextRequest, NextResponse } from "next/server";
import { approvedPatientPractices } from "@/lib/patient-locator/practices";
import type { PracticeWithDistance } from "@/lib/patient-locator/types";
import { checkRateLimit } from "@/lib/portal/rateLimit";

type GeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
};

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
};

const geocodeCache = new Map<string, GeocodeResult>();
const EARTH_RADIUS_MILES = 3958.8;

function normalizeApiKey(value: string) {
  return value.trim().replace(/^key=/i, "").replace(/^["']|["']$/g, "");
}

function googleApiKey() {
  const raw =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ??
    process.env.GOOGLE_GEOCODING_API_KEY ??
    process.env.GOOGLE_PLACES_API_KEY ??
    process.env.GOOGLE_MAPS_API_KEY ??
    "";
  return raw ? normalizeApiKey(raw) : "";
}

function getIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(from: GeocodeResult, to: GeocodeResult) {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(haversine));
}

function directionsUrl(practice: { name: string; address: string; placeId?: string }) {
  const query = encodeURIComponent(`${practice.name}, ${practice.address}`);
  if (practice.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(practice.placeId)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

async function geocodeAddress(address: string, apiKey: string): Promise<GeocodeResult | undefined> {
  const cacheKey = address.trim().toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json()) as GoogleGeocodeResponse;
  const first = data.results?.[0];
  const location = first?.geometry?.location;

  if (!response.ok || data.status !== "OK" || typeof location?.lat !== "number" || typeof location.lng !== "number") {
    return undefined;
  }

  const result = {
    latitude: location.lat,
    longitude: location.lng,
    formattedAddress: first?.formatted_address,
  };
  geocodeCache.set(cacheKey, result);
  return result;
}

function requestSearchText(body: Partial<{ query: string; address: string; city: string; state: string; zip: string }>) {
  return (body.query || [body.address, body.city, body.state, body.zip].filter(Boolean).join(", ")).trim();
}

function requestCoordinates(body: Partial<{ latitude: number; longitude: number }>): GeocodeResult | undefined {
  if (
    typeof body.latitude !== "number" ||
    !Number.isFinite(body.latitude) ||
    body.latitude < -90 ||
    body.latitude > 90 ||
    typeof body.longitude !== "number" ||
    !Number.isFinite(body.longitude) ||
    body.longitude < -180 ||
    body.longitude > 180
  ) {
    return undefined;
  }

  return { latitude: body.latitude, longitude: body.longitude };
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit({
    key: `patient-locator:${getIp(request)}`,
    limit: 45,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many locator searches. Please try again in a minute." }, { status: 429 });
  }

  const apiKey = googleApiKey();
  const body = (await request.json()) as Partial<{
    query: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
  }>;
  const searchText = requestSearchText(body);
  const coordinates = requestCoordinates(body);

  if (!searchText && !coordinates) {
    return NextResponse.json({
      practices: approvedPatientPractices.map((practice) => ({
        ...practice,
        googleMapsUrl: directionsUrl(practice),
      })),
      origin: null,
      lookupStatus: "idle",
    });
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Server-side Google Maps key is not configured. Add GOOGLE_MAPS_SERVER_API_KEY, GOOGLE_GEOCODING_API_KEY, GOOGLE_PLACES_API_KEY, or GOOGLE_MAPS_API_KEY in Vercel to enable distance sorting.",
        practices: approvedPatientPractices.map((practice) => ({
          ...practice,
          googleMapsUrl: directionsUrl(practice),
        })),
        origin: null,
        lookupStatus: "missing-key",
      },
      { status: 503 }
    );
  }

  const origin = coordinates ?? (await geocodeAddress(searchText, apiKey));
  if (!origin) {
    return NextResponse.json(
      {
        error: "We could not find that location. Try a ZIP code, city/state, or full address.",
        practices: approvedPatientPractices.map((practice) => ({
          ...practice,
          googleMapsUrl: directionsUrl(practice),
        })),
        origin: null,
        lookupStatus: "origin-not-found",
      },
      { status: 400 }
    );
  }

  const practices = await Promise.all(
    approvedPatientPractices.map(async (practice): Promise<PracticeWithDistance> => {
      const geocoded = await geocodeAddress(practice.address, apiKey);

      return {
        ...practice,
        latitude: geocoded?.latitude,
        longitude: geocoded?.longitude,
        geocodedAddress: geocoded?.formattedAddress,
        googleMapsUrl: directionsUrl(practice),
        distanceMiles: geocoded ? distanceMiles(origin, geocoded) : undefined,
      };
    })
  );

  return NextResponse.json({
    practices: practices.sort((a, b) => {
      if (typeof a.distanceMiles !== "number") return 1;
      if (typeof b.distanceMiles !== "number") return -1;
      return a.distanceMiles - b.distanceMiles;
    }),
    origin,
    lookupStatus: "ok",
  });
}
