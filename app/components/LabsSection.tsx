"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AUTO_COLLAPSE_MS = 8000;

type LabId = "pacific" | "peak" | "pike" | null;

const labs = [
  {
    id: "pacific" as const,
    city: "Portland",
    name: "Pacific Artisan Labs",
    address: "12302 NE Marx St.",
    address2: "Portland, OR 97230",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=12302%20NE%20Marx%20St%20Portland%20OR%2097230",
    phone: "877.390.6900",
    email: "customerservice@pacificartisanlabs.com",
    website: "https://pacificartisanlabs.com",
  },
  {
    id: "peak" as const,
    city: "Aurora",
    name: "Peak Artisan Labs",
    address: "3568 Peoria St., Suite 608",
    address2: "Aurora, CO 80010",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=3568%20Peoria%20St%20Suite%20608%20Aurora%20CO%2080010",
    phone: "833.690.4321",
    email: "customerservice@peakartisanlabs.com",
    website: "https://peakartisanlabs.com",
  },
  {
    id: "pike" as const,
    city: "Indianapolis",
    name: "Pike Artisan Labs",
    address: "8902 Vincennes Cir., Suite F",
    address2: "Indianapolis, IN 46268",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=8902%20Vincennes%20Cir%20Suite%20F%20Indianapolis%20IN%2046268",
    phone: "888.239.0303",
    email: "customerservice@pikeartisanlabs.com",
    website: "https://pikeartisanlabs.com",
  },
];

export default function LabsSection() {
  const [activeId, setActiveId] = useState<LabId>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeId === null) return;

    timerRef.current = setTimeout(() => setActiveId(null), AUTO_COLLAPSE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeId]);

  const toggle = (id: LabId) => setActiveId((prev) => (prev === id ? null : id));

  return (
    <section
      id="labs"
      data-theme="dark"
      className="relative px-6 py-16 md:py-[72px]"
      style={{
        backgroundImage: "url('/backgroundimage.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/55" />

      <div className="relative z-20 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#d6c09a]">
              Our Labs
            </div>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl lg:text-5xl">
              Three Labs. One Standard.
            </h2>
          </div>

          <div className="max-w-md text-sm text-white/65">
            Click a lab to learn more. The selected lab brightens with contact
            details, while the others stay visible but quieter.
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {labs.map((lab, index) => {
            const isActive = activeId === lab.id;
            const isDimmed = activeId !== null && !isActive;

            return (
              <motion.div
                key={lab.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
                className={`
                  pointer-events-auto overflow-hidden rounded-[18px] border
                  backdrop-blur-md transition-all duration-300
                  ${isActive ? "bg-white/12 border-[#d4c09a] shadow-2xl" : "bg-white/6 border-white/15"}
                  ${isDimmed ? "scale-[0.99] opacity-65 blur-[0.2px]" : "scale-[1] opacity-100"}
                  hover:scale-[1.01] hover:bg-white/8
                `}
              >
                <button
                  type="button"
                  onClick={() => toggle(lab.id)}
                  className="block w-full cursor-pointer text-left"
                  aria-expanded={isActive}
                >
                  <div className="flex items-baseline justify-between border-b border-white/10 px-6 pb-3 pt-5">
                    <div>
                      <div className="text-xs uppercase tracking-[0.28em] text-[#d4c09a]">
                        {lab.city}
                      </div>
                      <div className="mt-1 text-xl font-semibold text-white">
                        {lab.name}
                      </div>
                    </div>

                    <div className="text-xs text-white/55">
                      {isActive ? "Close" : "Open"}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-auto px-6 pb-6 pt-4"
                    >
                      <div className="grid gap-6">
                        <div className="space-y-1 text-sm text-white/85">
                          <div className="font-semibold text-white">Contact</div>
                          <a
                            href={lab.mapsHref}
                            target="_blank"
                            rel="noreferrer"
                            className="block transition hover:text-[#d4c09a]"
                          >
                            {lab.address}<br />
                            {lab.address2}
                          </a>
                          <a
                            href={lab.mapsHref}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs font-semibold text-[#d4c09a] transition hover:text-white"
                          >
                            Open in Maps
                          </a>
                          <a
                            href={`tel:${lab.phone.replace(/\D/g, "")}`}
                            className="block pt-2 font-semibold text-white transition hover:text-[#d4c09a]"
                          >
                            {lab.phone}
                          </a>
                          <div className="grid grid-cols-2 gap-2 pt-3">
                            <a
                              href={`mailto:${lab.email}`}
                              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/8 px-3 py-2 text-center text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-[#171311]"
                            >
                              Email Customer Service
                            </a>
                            <a
                              href={lab.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/8 px-3 py-2 text-center text-xs font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-[#171311]"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-white/85">
                          <div className="font-semibold text-white">Partner</div>
                          <p className="text-white/70">
                            Built to support independent practices with speed,
                            transparency, and choice.
                          </p>
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
    </section>
  );
}
