"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type LabId = "pacific" | "peak" | "pike";

type NetworkMapProps = {
  layout?: "side" | "stacked";
  sectionId?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  panelEyebrow?: string;
  panelTitle?: string;
  panelDescription?: string;
};

const labs = [
  {
    id: "pacific" as const,
    city: "Portland",
    state: "OR",
    label: "Pacific Artisan Labs",
    established: "2018",
    address: ["12302 NE Marx St.", "Portland, OR 97230"],
    phone: "877.390.6900",
    phoneHref: "8773906900",
    email: "customerservice@pacificartisanlabs.com",
    website: "https://pacificartisanlabs.com",
    position: { left: "19%", top: "33%" },
  },
  {
    id: "peak" as const,
    city: "Aurora",
    state: "CO",
    label: "Peak Artisan Labs",
    established: "2023",
    address: ["3568 Peoria St., Suite 608", "Aurora, CO 80010"],
    phone: "833.690.4321",
    phoneHref: "8336904321",
    email: "customerservice@peakartisanlabs.com",
    website: "https://peakartisanlabs.com",
    position: { left: "44%", top: "51%" },
  },
  {
    id: "pike" as const,
    city: "Indianapolis",
    state: "IN",
    label: "Pike Artisan Labs",
    established: "2025",
    address: ["8902 Vincennes Cir., Suite F", "Indianapolis, IN 46268"],
    phone: "888.239.0303",
    phoneHref: "8882390303",
    email: "customerservice@pikeartisanlabs.com",
    website: "https://pikeartisanlabs.com",
    position: { left: "67%", top: "43%" },
  },
];

export default function NetworkMap({
  layout = "side",
  sectionId = "network-map",
  eyebrow = "Network Footprint",
  title = "Three Labs. One Connected Standard.",
  description = "Select a lab on the map to view customer service contacts, phone, and website details.",
  panelEyebrow = "Explore Our Network",
  panelTitle = "Lab Locations",
  panelDescription = "Click a lab on the map to learn more about each location.",
}: NetworkMapProps) {
  const [activeLabId, setActiveLabId] = useState<LabId | null>(null);
  const isStacked = layout === "stacked";

  return (
    <motion.section
      id={sectionId}
      data-theme="dark"
      className="relative overflow-hidden border-y border-white/10 bg-[#171311] px-5 py-14 text-white md:px-8 md:py-16 lg:px-10"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,192,154,0.12),transparent_36%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
            {description}
          </p>
        </div>

        <div
          className={`mx-auto mt-8 grid max-w-6xl gap-5 ${
            isStacked
              ? ""
              : "lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-stretch"
          }`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-md md:p-6">
            <div className="relative mx-auto max-w-3xl">
              <Image
                src="/network-map.png"
                alt="Artisan Lab Network Map"
                width={1600}
                height={875}
                className="mx-auto h-auto w-full object-contain"
              />

              {labs.map((lab) => {
                const isSelected = activeLabId === lab.id;
                const isDimmed = activeLabId !== null && !isSelected;

                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => setActiveLabId((current) => (current === lab.id ? null : lab.id))}
                    aria-pressed={isSelected}
                    aria-label={`Show details for ${lab.label}`}
                    className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 group transition duration-300 ${
                      isDimmed ? "opacity-45" : "opacity-100"
                    }`}
                    style={lab.position}
                  >
                    <span className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4c09a]/22 blur-xl opacity-80 transition group-hover:opacity-100 ${
                      isSelected ? "scale-110 opacity-100" : "animate-pulse"
                    }`} />
                    <span className={`relative block h-5 w-5 rounded-full bg-[#d4c09a] shadow-[0_0_28px_rgba(212,192,154,0.95)] transition ${
                      isSelected ? "scale-110 ring-8 ring-[#d4c09a]/18" : ""
                    }`} />
                    <span className={`absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] shadow-lg backdrop-blur-md transition sm:text-[10px] md:text-[11px] ${
                      isSelected
                        ? "border-[#d4c09a]/60 bg-[#d4c09a] text-black"
                        : "border-white/10 bg-black/75 text-white hover:border-[#d4c09a]/45"
                    }`}>
                      {lab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                {panelEyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                {panelTitle}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/64">
                {panelDescription}
              </p>
            </div>

            <div className={`mt-5 grid gap-3 ${isStacked ? "md:grid-cols-3" : ""}`}>
              {labs.map((lab, index) => {
                const isSelected = activeLabId === lab.id;
                const hasSelection = activeLabId !== null;

                return (
                  <motion.div
                    key={lab.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    animate={{
                      scale: isSelected ? 1.015 : 1,
                      opacity: hasSelection && !isSelected ? 0.68 : 1,
                    }}
                    transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#d4c09a]/70 bg-[#d4c09a]/10 shadow-[0_0_34px_rgba(212,192,154,0.16)]"
                        : "border-white/10 bg-black/24 hover:border-[#d4c09a]/35 hover:bg-white/[0.07]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveLabId((current) => (current === lab.id ? null : lab.id))}
                      className="block w-full text-left"
                      aria-expanded={isSelected}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                            {lab.city}, {lab.state}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-white/46">
                            Established {lab.established}
                          </p>
                          <h4 className="mt-1 text-lg font-semibold uppercase tracking-[0.04em] text-white">
                            {lab.label}
                          </h4>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-white/48">
                          {isSelected ? "Selected" : "View"}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm leading-6 text-white/72">
                            <div>
                              {lab.address.map((line) => (
                                <div key={line}>{line}</div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={`tel:${lab.phoneHref}`}
                                className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-black"
                              >
                                {lab.phone}
                              </a>
                              <a
                                href={`mailto:${lab.email}`}
                                className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-black"
                              >
                                Email Customer Service
                              </a>
                              <a
                                href={lab.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-black"
                              >
                                Visit Website
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
