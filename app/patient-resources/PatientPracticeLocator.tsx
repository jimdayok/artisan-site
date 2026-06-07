"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation, Phone, Search, ShieldCheck, Sparkles, Globe2, Building2, LocateFixed } from "lucide-react";
import { approvedPatientPractices } from "@/lib/patient-locator/practices";
import type { PracticeWithDistance } from "@/lib/patient-locator/types";
import { useCookieConsent } from "@/app/components/CookieConsentProvider";

const RADIUS_OPTIONS = [25, 50, 100, 500] as const;
type RadiusMiles = (typeof RADIUS_OPTIONS)[number];
type SearchMode = "text" | "location" | null;

type LocatorResponse = {
  practices?: PracticeWithDistance[];
  origin?: { latitude: number; longitude: number } | null;
  lookupStatus?: string;
  error?: string;
};

type GoogleLatLngBounds = {
  extend: (point: { lat: number; lng: number }) => void;
};

type GoogleMarker = {
  setMap: (map: unknown | null) => void;
  setIcon: (icon: Record<string, unknown>) => void;
  setAnimation: (animation: unknown | null) => void;
  addListener: (eventName: string, callback: () => void) => void;
};

type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void;
  panTo: (point: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
};

type GoogleInfoWindow = {
  close: () => void;
  open: (options: { anchor: GoogleMarker; map: GoogleMap }) => void;
  setContent: (content: Node | string) => void;
};

type GoogleMapApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  Marker: new (options: Record<string, unknown>) => GoogleMarker;
  LatLngBounds: new () => GoogleLatLngBounds;
  InfoWindow: new () => GoogleInfoWindow;
  Animation?: { BOUNCE?: unknown };
  places?: {
    Autocomplete: new (input: HTMLInputElement, options: Record<string, unknown>) => {
      addListener: (eventName: string, callback: () => void) => void;
      getPlace: () => { formatted_address?: string; name?: string };
    };
  };
};

declare global {
  interface Window {
    google?: { maps?: GoogleMapApi };
  }
}

const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const initialPractices: PracticeWithDistance[] = approvedPatientPractices.map((practice) => ({
  ...practice,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${practice.name}, ${practice.address}`)}`,
}));

function formatDistance(distance: number) {
  return `${distance.toFixed(distance < 10 ? 1 : 0)} miles away`;
}

function filterPracticesByRadius(practices: PracticeWithDistance[], radiusMiles: number) {
  return practices
    .filter(
      (practice): practice is PracticeWithDistance & { distanceMiles: number } =>
        typeof practice.distanceMiles === "number" && practice.distanceMiles <= radiusMiles
    )
    .sort((left, right) => left.distanceMiles - right.distanceMiles);
}

function filterPracticesByAffiliation(
  practices: PracticeWithDistance[],
  filters: { tokai: boolean; artisanPartner: boolean }
) {
  return practices.filter(
    (practice) =>
      (!filters.tokai || practice.tokai === true) &&
      (!filters.artisanPartner || practice.artisanPartner === true)
  );
}

function markerIcon(active: boolean) {
  return {
    path: "M 0,0 m -7,0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0",
    fillColor: active ? "#c59a55" : "#15342f",
    fillOpacity: 1,
    strokeColor: active ? "#15342f" : "#f7efe2",
    strokeWeight: active ? 2.2 : 1.4,
    scale: active ? 1.7 : 1.35,
  };
}

function userMarkerIcon() {
  return {
    path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
    fillColor: "#4285f4",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 3,
    scale: 1.2,
  };
}

function PracticeBadges({ practice }: { practice: PracticeWithDistance }) {
  if (!practice.tokai && !practice.artisanPartner) return null;

  return (
    <div className="flex items-center justify-end gap-2" aria-label="Practice affiliations">
      {practice.tokai ? (
        <span className="flex h-8 w-12 items-center justify-center rounded-full border border-[#e5d4b9] bg-white px-2 shadow-sm" title="Tokai access">
          <Image src="/tokai-logo.png" alt="Tokai access" width={40} height={40} className="h-6 w-6 object-contain" />
        </span>
      ) : null}
      {practice.artisanPartner ? (
        <span className="flex h-8 w-12 items-center justify-center rounded-full border border-[#e5d4b9] bg-white px-2 shadow-sm" title="Artisan Partner">
          <Image src="/aln_4c_logo.png" alt="Artisan Partner" width={48} height={32} className="h-7 w-10 object-contain" />
        </span>
      ) : null}
    </div>
  );
}

function PracticeCard({
  practice,
  isActive,
  hasDistanceSearch,
  onSelect,
  cardRef,
}: {
  practice: PracticeWithDistance;
  isActive: boolean;
  hasDistanceSearch: boolean;
  onSelect: () => void;
  cardRef: (element: HTMLElement | null) => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <article
      ref={cardRef}
      tabIndex={0}
      aria-current={isActive ? "true" : undefined}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`group cursor-pointer rounded-[28px] border bg-white/80 p-5 transition focus:outline-none focus:ring-4 focus:ring-[#c7a66e]/35 ${
        isActive
          ? "border-[#b48a52] shadow-[0_0_0_2px_rgba(21,52,47,0.10),0_20px_60px_rgba(180,138,82,0.28)]"
          : "border-[#d7bd8f]/55 shadow-[0_18px_45px_rgba(73,48,28,0.08)] hover:-translate-y-1 hover:border-[#c7a66e] hover:shadow-[0_24px_70px_rgba(73,48,28,0.13)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a7a4a]">
            {practice.city}, {practice.state}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#142d28]">{practice.name}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-full bg-[#15342f] px-3 py-1 text-xs font-semibold text-[#f7efe2]">
            {practice.numberOfLocations || 1} location{(practice.numberOfLocations || 1) === 1 ? "" : "s"}
          </span>
          <PracticeBadges practice={practice} />
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm text-[#6f665b]">
        <p className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b48a52]" />
          <span>{practice.address}</span>
        </p>
        {practice.phone ? (
          <a className="flex gap-3 transition hover:text-[#142d28]" href={`tel:${practice.phone}`}>
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#b48a52]" />
            <span>{practice.phone}</span>
          </a>
        ) : null}
        {practice.website ? (
          <a className="flex gap-3 transition hover:text-[#142d28]" href={practice.website} target="_blank" rel="noreferrer">
            <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#b48a52]" />
            <span>Practice website</span>
          </a>
        ) : null}
      </div>

      {practice.insurances.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {practice.insurances.slice(0, 5).map((insurance) => (
            <span key={insurance} className="rounded-full border border-[#e5d4b9] bg-[#fbf7ee] px-3 py-1 text-xs text-[#6b6258]">
              {insurance}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-[#eadbc1] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[#15342f]">
          {typeof practice.distanceMiles === "number"
            ? formatDistance(practice.distanceMiles)
            : hasDistanceSearch
              ? "Distance unavailable"
              : "Distance unavailable until search"}
        </p>
        <a
          href={practice.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15342f] px-5 py-3 text-sm font-semibold text-[#f7efe2] transition hover:bg-[#23453f]"
        >
          <Navigation className="h-4 w-4" />
          Get Directions
        </a>
      </div>
    </article>
  );
}

export default function PatientPracticeLocator() {
  const { functional: hasFunctionalConsent, openPreferences } = useCookieConsent();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PracticeWithDistance[]>(initialPractices);
  const [radiusMiles, setRadiusMiles] = useState<RadiusMiles>(100);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [searchError, setSearchError] = useState("");
  const [origin, setOrigin] = useState<LocatorResponse["origin"]>(null);
  const [originIsUserLocation, setOriginIsUserLocation] = useState(false);
  const [activePracticeId, setActivePracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [tokaiOnly, setTokaiOnly] = useState(false);
  const [artisanPartnersOnly, setArtisanPartnersOnly] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const markerRefs = useRef<Map<string, GoogleMarker>>(new Map());
  const userMarkerRef = useRef<GoogleMarker | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const infoWindowRef = useRef<GoogleInfoWindow | null>(null);

  const results = useMemo(() => {
    const radiusFiltered = hasSearched
      ? filterPracticesByRadius(searchResults, radiusMiles)
      : searchResults;
    return filterPracticesByAffiliation(radiusFiltered, {
      tokai: tokaiOnly,
      artisanPartner: artisanPartnersOnly,
    });
  }, [artisanPartnersOnly, hasSearched, radiusMiles, searchResults, tokaiOnly]);

  const mappedResults = useMemo(
    () => results.filter((practice) => typeof practice.latitude === "number" && typeof practice.longitude === "number"),
    [results]
  );
  const hasActiveAffiliationFilters = tokaiOnly || artisanPartnersOnly;

  const status = useMemo(() => {
    if (searchError) return searchError;
    if (!results.length && hasActiveAffiliationFilters) {
      return hasSearched
        ? `No matching practices found within ${radiusMiles} miles. Try increasing the distance or changing filters.`
        : "No matching practices found. Try changing or clearing the affiliation filters.";
    }
    if (!hasSearched) return "Enter a ZIP code, city, or address to find approved practices near you.";
    if (!results.length) return `No matching practices found within ${radiusMiles} miles. Try increasing the distance or changing filters.`;
    if (searchMode === "location") {
      return `Showing ${results.length} approved practice${results.length === 1 ? "" : "s"} near your current location, sorted by nearest distance.`;
    }
    return `Showing ${results.length} approved practice${results.length === 1 ? "" : "s"} within ${radiusMiles} miles, sorted by nearest distance.`;
  }, [hasActiveAffiliationFilters, hasSearched, radiusMiles, results.length, searchError, searchMode]);

  useEffect(() => {
    if (!hasFunctionalConsent) {
      const timeout = window.setTimeout(() => setMapError(false), 0);
      return () => window.clearTimeout(timeout);
    }

    if (!mapApiKey) {
      const timeout = window.setTimeout(() => setMapError(true), 0);
      return () => window.clearTimeout(timeout);
    }

    if (window.google?.maps) {
      const timeout = window.setTimeout(() => setMapReady(true), 0);
      return () => window.clearTimeout(timeout);
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-patient-locator-map]");
    if (existing) {
      existing.addEventListener("load", () => setMapReady(true), { once: true });
      existing.addEventListener("error", () => setMapError(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapApiKey)}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.patientLocatorMap = "true";
    script.onload = () => setMapReady(true);
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, [hasFunctionalConsent]);

  useEffect(() => {
    const maps = window.google?.maps;
    if (!mapReady || !maps || !inputRef.current || !maps.places) return;

    const autocomplete = new maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setQuery(place.formatted_address || place.name || inputRef.current?.value || "");
    });
  }, [mapReady]);

  useEffect(() => {
    const maps = window.google?.maps;
    if (!mapReady || !maps || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new maps.Map(mapRef.current, {
        center: { lat: 39.5, lng: -98.35 },
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#d7e3df" }] },
          { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f7efe2" }] },
        ],
      });
    }

    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current.clear();
    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = null;
    infoWindowRef.current?.close();

    if (origin && originIsUserLocation) {
      userMarkerRef.current = new maps.Marker({
        position: { lat: origin.latitude, lng: origin.longitude },
        map: mapInstanceRef.current,
        title: "You are here",
        icon: userMarkerIcon(),
        zIndex: 1000,
      });
    }

    if (!mappedResults.length) {
      if (origin) {
        mapInstanceRef.current.panTo({ lat: origin.latitude, lng: origin.longitude });
        mapInstanceRef.current.setZoom(7);
      }
      return;
    }

    const bounds = new maps.LatLngBounds();
    if (origin) {
      bounds.extend({ lat: origin.latitude, lng: origin.longitude });
    }
    mappedResults.forEach((practice) => {
      const position = { lat: practice.latitude as number, lng: practice.longitude as number };
      bounds.extend(position);
      const marker = new maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: practice.name,
        icon: markerIcon(false),
      });
      marker.addListener("click", () => {
        setActivePracticeId(practice.id);
        window.requestAnimationFrame(() => {
          cardRefs.current.get(practice.id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
      markerRefs.current.set(practice.id, marker);
    });

    if (origin && originIsUserLocation) {
      mapInstanceRef.current.panTo({ lat: origin.latitude, lng: origin.longitude });
      mapInstanceRef.current.setZoom(radiusMiles <= 25 ? 10 : radiusMiles <= 100 ? 8 : 6);
    } else if (mappedResults.length === 1) {
      const practice = mappedResults[0];
      mapInstanceRef.current.panTo({
        lat: practice.latitude as number,
        lng: practice.longitude as number,
      });
      mapInstanceRef.current.setZoom(11);
    } else {
      mapInstanceRef.current.fitBounds(bounds, 70);
    }
  }, [mapReady, mappedResults, origin, originIsUserLocation, radiusMiles]);

  useEffect(() => {
    const maps = window.google?.maps;
    markerRefs.current.forEach((marker, practiceId) => {
      const isActive = practiceId === activePracticeId;
      marker.setIcon(markerIcon(isActive));
      marker.setAnimation(isActive ? maps?.Animation?.BOUNCE ?? null : null);
    });

    if (!activePracticeId) return;
    const practice = results.find((candidate) => candidate.id === activePracticeId);
    if (!practice || typeof practice.latitude !== "number" || typeof practice.longitude !== "number") return;

    mapInstanceRef.current?.panTo({ lat: practice.latitude, lng: practice.longitude });
    mapInstanceRef.current?.setZoom(11);
    const activeMarker = markerRefs.current.get(activePracticeId);
    if (maps && activeMarker && mapInstanceRef.current) {
      const content = document.createElement("div");
      content.className = "patient-locator-info-window";
      const name = document.createElement("strong");
      name.textContent = practice.name;
      const address = document.createElement("div");
      address.textContent = practice.address;
      content.append(name, address);
      infoWindowRef.current ??= new maps.InfoWindow();
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open({ anchor: activeMarker, map: mapInstanceRef.current });
    }
    const timeout = window.setTimeout(() => markerRefs.current.get(activePracticeId)?.setAnimation(null), 900);
    return () => window.clearTimeout(timeout);
  }, [activePracticeId, results]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch({ query }, false);
  }

  async function runSearch(
    searchBody: { query: string } | { latitude: number; longitude: number },
    isUserLocation: boolean
  ) {
    setIsLoading(true);
    setSearchError("");
    setLocationMessage("");
    setActivePracticeId(null);

    try {
      const response = await fetch("/api/patient-locator/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchBody),
      });
      const data = (await response.json()) as LocatorResponse;

      if (!response.ok || data.lookupStatus !== "ok" || !data.origin) {
        setSearchError(data.error ?? "We could not complete that search. Try a ZIP code, city/state, or full address.");
        return;
      }

      setSearchResults(data.practices ?? []);
      setOrigin(data.origin);
      setOriginIsUserLocation(isUserLocation);
      setSearchMode(isUserLocation ? "location" : "text");
      setHasSearched(true);
    } catch {
      setSearchError("Locator search is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFindMyLocation() {
    setSearchError("");
    setLocationMessage("");

    if (!hasFunctionalConsent) {
      setLocationMessage("Enable Functional cookies to use your location and the interactive map.");
      openPreferences();
      return;
    }

    if (!navigator.geolocation) {
      setLocationMessage("We could not detect your location. Try searching by ZIP, city, or address.");
      return;
    }

    setIsFindingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setQuery("");
        try {
          await runSearch({ latitude: coords.latitude, longitude: coords.longitude }, true);
        } finally {
          setIsFindingLocation(false);
        }
      },
      (error) => {
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? "Location access was not allowed. You can still search by ZIP, city, or address."
            : "We could not detect your location. Try searching by ZIP, city, or address."
        );
        setIsFindingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  }

  return (
    <section id="find-a-practice" data-theme="light" className="relative overflow-hidden bg-[#f7efe2] px-6 py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(211,183,139,0.26),transparent_28%),radial-gradient(circle_at_84%_20%,rgba(20,45,40,0.10),transparent_30%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#927346]">Patient Practice Locator</p>
            <h2 className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.055em] text-[#142d28] md:text-7xl">
              Find an Independent Eye Care Practice
            </h2>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-[#6f665b]">
              These independent practices are connected to the Artisan Lab Network ecosystem and can help you explore premium lens options with a local doctor.
            </p>
          </div>

          <form onSubmit={handleSearch} className="rounded-[34px] border border-[#d7bd8f] bg-white/80 p-4 shadow-[0_28px_80px_rgba(73,48,28,0.12)] sm:p-5">
            <label className="block text-sm font-semibold uppercase tracking-[0.24em] text-[#927346]" htmlFor="patient-practice-search">
              Search by ZIP, city, or address
            </label>
            <div className="mt-4">
              <input
                ref={inputRef}
                id="patient-practice-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter ZIP, city, or address"
                className="block min-h-14 w-full min-w-0 rounded-2xl border border-[#e1cfac] bg-[#fffaf2] px-5 text-base text-[#142d28] outline-none transition placeholder:text-[#9c9589] focus:border-[#b48a52] focus:ring-4 focus:ring-[#d7bd8f]/35 sm:min-w-[280px] sm:text-lg"
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[160px_minmax(180px,1fr)_minmax(200px,1fr)]">
              <label className="sr-only" htmlFor="patient-practice-radius">Search radius</label>
              <select
                id="patient-practice-radius"
                value={radiusMiles}
                onChange={(event) => {
                  setRadiusMiles(Number(event.target.value) as RadiusMiles);
                  setActivePracticeId(null);
                  infoWindowRef.current?.close();
                }}
                className="min-h-14 w-full rounded-2xl border border-[#e1cfac] bg-[#fffaf2] px-5 text-base font-semibold text-[#142d28] outline-none transition focus:border-[#b48a52] focus:ring-4 focus:ring-[#d7bd8f]/35"
              >
                {RADIUS_OPTIONS.map((radius) => (
                  <option key={radius} value={radius}>{radius} miles</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isLoading || isFindingLocation}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#15342f] px-6 text-base font-semibold text-[#f7efe2] transition hover:bg-[#23453f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-5 w-5" />
                {isLoading ? "Searching" : "Find Practices"}
              </button>
              <button
                type="button"
                onClick={handleFindMyLocation}
                disabled={isLoading || isFindingLocation}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#b48a52] bg-[#fffaf2] px-6 text-base font-semibold text-[#15342f] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LocateFixed className="h-5 w-5" />
                {isFindingLocation ? "Finding location…" : "Find My Location"}
              </button>
            </div>
            <fieldset className="mt-4 flex flex-wrap gap-3">
              <legend className="sr-only">Practice affiliations</legend>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-[#e1cfac] bg-[#fffaf2] px-4 text-sm font-semibold text-[#15342f]">
                <input
                  type="checkbox"
                  checked={tokaiOnly}
                  onChange={(event) => {
                    setTokaiOnly(event.target.checked);
                    setActivePracticeId(null);
                  }}
                  className="h-4 w-4 accent-[#15342f]"
                />
                Tokai
              </label>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-[#e1cfac] bg-[#fffaf2] px-4 text-sm font-semibold text-[#15342f]">
                <input
                  type="checkbox"
                  checked={artisanPartnersOnly}
                  onChange={(event) => {
                    setArtisanPartnersOnly(event.target.checked);
                    setActivePracticeId(null);
                  }}
                  className="h-4 w-4 accent-[#15342f]"
                />
                Artisan Partners
              </label>
            </fieldset>
            {locationMessage ? (
              <p className="mt-3 text-sm font-medium text-[#8a5b32]" role="status">{locationMessage}</p>
            ) : null}
            <div className="mt-4 grid gap-3 text-sm text-[#6f665b] sm:grid-cols-3">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#b48a52]" /> Approved practices only</span>
              <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-[#b48a52]" /> No labs displayed</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#b48a52]" /> Distance sorted</span>
            </div>
          </form>
        </div>

        <p className="mt-8 rounded-full border border-[#e5d4b9] bg-white/70 px-5 py-3 text-sm font-medium text-[#6f665b]">
          {status}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="order-1 max-h-[760px] space-y-4 overflow-y-auto pr-1 lg:order-1" aria-live="polite">
            {!results.length ? (
              <div className="rounded-[28px] border border-[#d7bd8f]/70 bg-white/80 p-8 text-center shadow-[0_18px_45px_rgba(73,48,28,0.08)]">
                <MapPin className="mx-auto h-9 w-9 text-[#b48a52]" />
                <h3 className="mt-4 text-2xl font-semibold text-[#142d28]">No matching practices</h3>
                <p className="mt-2 text-[#6f665b]">
                  {hasSearched
                    ? `No matching practices found within ${radiusMiles} miles. Try increasing the distance or changing filters.`
                    : "Try changing or clearing the affiliation filters."}
                </p>
              </div>
            ) : (
              results.map((practice) => (
                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  isActive={practice.id === activePracticeId}
                  hasDistanceSearch={hasSearched}
                  onSelect={() => setActivePracticeId(practice.id)}
                  cardRef={(element) => {
                    if (element) cardRefs.current.set(practice.id, element);
                    else cardRefs.current.delete(practice.id);
                  }}
                />
              ))
            )}
          </div>

          <div className="order-2 lg:order-2">
            <div className="sticky top-24 overflow-hidden rounded-[34px] border border-[#d7bd8f] bg-white/80 p-3 shadow-[0_28px_80px_rgba(73,48,28,0.12)]">
              {!hasFunctionalConsent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[26px] bg-[#fffaf2] p-8 text-center text-[#6f665b]">
                  <p className="text-lg font-semibold">Enable Functional cookies to load the interactive map.</p>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="mt-5 rounded-full border border-[#b48a52] px-5 py-3 text-sm font-semibold text-[#15342f] transition hover:bg-white"
                  >
                    Cookie Preferences
                  </button>
                </div>
              ) : mapError ? (
                <div className="flex min-h-[420px] items-center justify-center rounded-[26px] bg-[#fffaf2] p-8 text-center text-lg font-semibold text-[#6f665b]">
                  Map temporarily unavailable. Practice results are still shown below.
                </div>
              ) : (
                <div ref={mapRef} className="min-h-[420px] rounded-[26px] bg-[#d8ded8]" aria-label="Map of approved independent eye care practices" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
