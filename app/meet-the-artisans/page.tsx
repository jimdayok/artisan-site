"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";

type TeamMember = {
  name: string;
  role: string;
  description?: string;
};

type LabKey = "pacific" | "peak" | "pike";
type DepartmentKey = "surfacing" | "coating" | "finishing" | "customerService";

type LabDetail = {
  key: LabKey;
  name: string;
  shortName: string;
  description: string;
};

type DepartmentContent = {
  eyebrow: string;
  title: string;
  description: string;
};

type Hotspot = {
  id: string;
  lab: LabKey;
  department: DepartmentKey;
  label: string;
  tooltip: string;
  left: string;
  top: string;
};

const salesTeam: TeamMember[] = [
  {
    name: "Josh Opiol",
    role: "Account Manager",
    description:
      "Helping independent practices find the right lab path with clear support and practical answers.",
  },
  {
    name: "Heather Branderhorst",
    role: "Account Manager",
    description:
      "Supporting customers with product knowledge, service focus, and a real passion for independent eye care.",
  },
];

const leadershipTeam: TeamMember[] = [
  { name: "Brandon Butler", role: "President & CEO" },
  { name: "Jim Day", role: "EVP Sales & Marketing" },
  { name: "Rachel Ahlson", role: "COO" },
  { name: "Shelley Witmer", role: "Customer Service Leadership" },
];

const serviceTeams: Record<LabKey, TeamMember[]> = {
  pacific: [
    { name: "Jill", role: "Customer Service" },
    { name: "Clareta", role: "Customer Service" },
    { name: "Noelle", role: "Customer Service" },
    { name: "Reggie", role: "Customer Service" },
  ],
  peak: [
    { name: "Chasity", role: "Customer Service" },
    { name: "Renee", role: "Customer Service" },
    { name: "Jenn C", role: "Customer Service" },
  ],
  pike: [
    { name: "Savanna", role: "Customer Service" },
    { name: "Jess", role: "Lab Manager" },
  ],
};

const labs: LabDetail[] = [
  {
    key: "pacific",
    name: "Pacific Artisan Labs",
    shortName: "Pacific",
    description:
      "Our Portland lab brings together surfacing, coating, finishing, and customer support teams focused on precision and craft.",
  },
  {
    key: "peak",
    name: "Peak Artisan Labs",
    shortName: "Peak",
    description:
      "Our Aurora lab supports independent practices with responsive finishing and service teams.",
  },
  {
    key: "pike",
    name: "Pike Artisan Labs",
    shortName: "Pike",
    description:
      "Our Indianapolis lab adds speed and central U.S. flexibility to the Artisan network.",
  },
];

const labNames: Record<LabKey, string> = {
  pacific: "Pacific Artisan Labs",
  peak: "Peak Artisan Labs",
  pike: "Pike Artisan Labs",
};

const departmentLabels: Record<DepartmentKey, string> = {
  surfacing: "Surfacing",
  coating: "Coating",
  finishing: "Finishing",
  customerService: "Customer Service",
};

const departmentContent: Record<
  LabKey,
  Partial<Record<DepartmentKey, DepartmentContent>>
> = {
  pacific: {
    finishing: {
      eyebrow: "Pacific Artisan Labs / Finishing",
      title: "Finishing - Pacific Artisan Labs",
      description:
        "Our finishing team works tirelessly to make it right the first time. Every lens is edged, assembled, and inspected with care so practices can trust what goes out the door and minimize remakes.",
    },
    surfacing: {
      eyebrow: "Pacific Artisan Labs / Surfacing",
      title: "Surfacing - Pacific Artisan Labs",
      description:
        "This is where lenses meet our state of the art generators and polishers. Our fully automated systems operate with precision to create consistent, high quality lenses from the very start of the process.",
    },
    coating: {
      eyebrow: "Pacific Artisan Labs / Coating",
      title: "Coating - Pacific Artisan Labs",
      description:
        "Our coating area adds the finishing touch that patients notice every day. This is where clarity, durability, and appearance come together through careful process control and attention to detail.",
    },
    customerService: {
      eyebrow: "Pacific Artisan Labs / Customer Service",
      title: "Customer Service - Pacific Artisan Labs",
      description:
        "Our customer service team helps keep practices informed, supported, and confident. They help answer questions, solve problems, and keep the work moving with a personal touch.",
    },
  },
  peak: {
    finishing: {
      eyebrow: "Peak Artisan Labs / Finishing",
      title: "Finishing - Peak Artisan Labs",
      description:
        "Peak's finishing team combines precision with reliability. Each order is handled with attention to detail to ensure a smooth experience for both the practice and the patient.",
    },
    customerService: {
      eyebrow: "Peak Artisan Labs / Customer Service",
      title: "Customer Service - Peak Artisan Labs",
      description:
        "Peak's customer service team brings practical answers and steady communication to the practices they support. Their goal is to make the lab relationship easier every day.",
    },
  },
  pike: {
    finishing: {
      eyebrow: "Pike Artisan Labs / Finishing",
      title: "Finishing - Pike Artisan Labs",
      description:
        "At Pike, finishing is built for efficiency and consistency. Our team focuses on clean execution and dependable turnaround so practices can stay on schedule and deliver confidently.",
    },
    customerService: {
      eyebrow: "Pike Artisan Labs / Customer Service",
      title: "Customer Service - Pike Artisan Labs",
      description:
        "Pike's customer service team gives practices a responsive point of contact in the central U.S. They help support speed, flexibility, and clear communication across the Artisan network.",
    },
  },
};

const labGalleryImages = [
  "/meet-the-artisans/labs/shared/blue-plastic-trays-2024-1.jpg",
  "/meet-the-artisans/labs/shared/factory-conveyor-trays-2024-1.jpg",
  "/meet-the-artisans/labs/shared/factory-machines-2024-1.jpg",
  "/meet-the-artisans/labs/shared/factory-machines-2024-2.jpg",
];

const hotspots: Hotspot[] = [
  {
    id: "pacific-surfacing",
    lab: "pacific",
    department: "surfacing",
    label: "Surfacing",
    tooltip: "Pacific Artisan Labs - Surfacing",
    left: "29%",
    top: "33%",
  },
  {
    id: "pacific-finishing",
    lab: "pacific",
    department: "finishing",
    label: "Finishing",
    tooltip: "Pacific Artisan Labs - Finishing",
    left: "43%",
    top: "45%",
  },
  {
    id: "pacific-coating",
    lab: "pacific",
    department: "coating",
    label: "Coating",
    tooltip: "Pacific Artisan Labs - Coating",
    left: "18%",
    top: "46%",
  },
  {
    id: "pacific-customer",
    lab: "pacific",
    department: "customerService",
    label: "Customer Service",
    tooltip: "Pacific Artisan Labs - Customer Service",
    left: "38%",
    top: "65%",
  },
  {
    id: "peak-finishing",
    lab: "peak",
    department: "finishing",
    label: "Finishing",
    tooltip: "Peak Artisan Labs - Finishing",
    left: "38%",
    top: "78%",
  },
  {
    id: "peak-customer",
    lab: "peak",
    department: "customerService",
    label: "Customer Service",
    tooltip: "Peak Artisan Labs - Customer Service",
    left: "39%",
    top: "88%",
  },
  {
    id: "pike-finishing",
    lab: "pike",
    department: "finishing",
    label: "Finishing",
    tooltip: "Pike Artisan Labs - Finishing",
    left: "76%",
    top: "46%",
  },
  {
    id: "pike-customer",
    lab: "pike",
    department: "customerService",
    label: "Customer Service",
    tooltip: "Pike Artisan Labs - Customer Service",
    left: "76%",
    top: "65%",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

const cardReveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.42, ease: "easeOut" },
} as const;

function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#171311] shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Close
            </button>
            <iframe
              title="Contact Artisan Lab Network"
              src={CONTACT_FORM_URL}
              className="h-full w-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhotoPlaceholder({ label = "Photo Coming Soon" }: { label?: string }) {
  return (
    <div className="aspect-square w-full rounded-xl bg-white/10 flex items-center justify-center text-white/40 text-sm">
      {label}
    </div>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <motion.article
      {...cardReveal}
      className="group rounded-2xl border border-white/12 bg-white/[0.055] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-[#d4c09a]/45 hover:bg-white/10 hover:shadow-[0_22px_70px_rgba(212,192,154,0.13)]"
    >
      <PhotoPlaceholder />
      <div className="mt-5">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#d4c09a]">
          {member.role}
        </p>
        {member.description ? (
          <p className="mt-4 text-sm leading-7 text-white/68">
            {member.description}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
}) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d4c09a]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {copy ? (
        <p className="mt-5 text-base leading-8 text-white/68 md:text-lg">
          {copy}
        </p>
      ) : null}
    </motion.div>
  );
}

function CreamDivider() {
  return <div className="h-3 bg-[#f3eadb]" aria-hidden="true" />;
}

export default function MeetTheArtisansPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [activeServiceLab, setActiveServiceLab] = useState<LabKey>("pacific");
  const [activeLab, setActiveLab] = useState<LabKey>("pacific");
  const [activeDepartment, setActiveDepartment] =
    useState<DepartmentKey>("finishing");
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const activeServiceTeam = serviceTeams[activeServiceLab];
  const availableDepartments = useMemo(
    () => Object.keys(departmentContent[activeLab]) as DepartmentKey[],
    [activeLab]
  );
  const activeDepartmentContent = useMemo(
    () =>
      departmentContent[activeLab][activeDepartment] ??
      departmentContent[activeLab].finishing,
    [activeDepartment, activeLab]
  );

  useEffect(() => {
    if (!availableDepartments.includes(activeDepartment)) {
      setActiveDepartment("finishing");
    }
  }, [activeDepartment, availableDepartments]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        data-theme="dark"
        className="relative isolate overflow-hidden bg-black px-6 pb-24 pt-36 md:px-10 md:pb-28 md:pt-44"
      >
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(212,192,154,0.18),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.09),transparent_28%),linear-gradient(180deg,#0b0908_0%,#000_78%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-[#d4c09a]/40" />

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d4c09a]">
              Meet the Artisans
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Meet the People Behind the Lenses
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl md:leading-9">
              Behind every order is a real person who cares about getting it
              right. This is the team supporting your practice every day.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#sales-team"
                className="inline-flex items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(212,192,154,0.2)] transition hover:scale-[1.02] hover:bg-[#e2cca2]"
              >
                Explore the Team
              </a>
              <a
                href="#labs"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-7 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white/10"
              >
                See Our Labs
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Sales Support", "Lab Leadership", "Service Teams", "Craft Focus"].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl border border-white/10 bg-black/35 p-5 ${
                      index === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="h-1.5 w-12 rounded-full bg-[#d4c09a]" />
                    <p className="mt-12 text-lg font-semibold text-white">
                      {item}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      Real people, steady answers, and work that stays close to
                      the practice.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <CreamDivider />

      <section
        id="sales-team"
        data-theme="dark"
        className="bg-black px-6 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Sales Team"
            title="Your Artisan Sales Team"
            copy="Clear conversations, practical support, and a human way into the right lab relationship."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {salesTeam.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      <CreamDivider />

      <section data-theme="dark" className="bg-black px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Leadership"
            title="Leadership That Still Knows the Work"
            copy="The network is led by people who understand lab operations, customer support, and the daily realities of independent practices."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadershipTeam.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      <CreamDivider />

      <section data-theme="dark" className="bg-black px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Customer Service"
            title="The Voices Behind the Artisan Experience"
            copy="Choose a lab to meet the customer service team helping orders move with clarity and care."
          />

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {labs.map((lab) => {
              const active = activeServiceLab === lab.key;
              return (
                <button
                  key={lab.key}
                  type="button"
                  onClick={() => setActiveServiceLab(lab.key)}
                  className={`rounded-full border px-6 py-3 text-sm font-semibold transition hover:scale-[1.02] hover:bg-white/10 ${
                    active
                      ? "border-[#d4c09a] bg-[#d4c09a] text-black"
                      : "border-white/14 bg-white/[0.055] text-white"
                  }`}
                >
                  {lab.shortName}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeServiceLab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {activeServiceTeam.map((member) => (
                <TeamCard key={`${activeServiceLab}-${member.name}`} member={member} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CreamDivider />

      <section
        id="labs"
        data-theme="dark"
        className="relative overflow-hidden bg-black py-24 text-white"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <SectionIntro
            eyebrow="Lab Experience"
            title="Step Inside the Labs"
            copy="Explore the connected work happening across the Artisan network, from surfacing and coating to finishing and customer support."
          />

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <motion.div
              {...fadeUp}
              className="relative min-w-0 overflow-hidden rounded-[28px] border border-white/12 bg-black/40 p-4 shadow-2xl backdrop-blur-xl"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/meet-the-artisans/labs/shared/lab-layout-map.png"
                  alt="Artisan lab layout map"
                  className="h-auto w-full rounded-[22px] object-contain opacity-95"
                />

                <div
                  className="pointer-events-none absolute inset-0 animate-[shine_6s_linear_infinite] bg-gradient-to-r from-transparent via-[#d4c09a]/10 to-transparent opacity-30"
                  aria-hidden="true"
                />

                {[
                  "left-[28%] top-[58%] w-[28%] rotate-[58deg]",
                  "left-[49%] top-[51%] w-[28%] rotate-[-8deg]",
                  "left-[53%] top-[66%] w-[26%] rotate-[-34deg]",
                ].map((lineClass, index) => (
                  <motion.div
                    key={lineClass}
                    className={`pointer-events-none absolute h-px bg-gradient-to-r from-transparent via-[#d4c09a]/35 to-transparent opacity-40 ${lineClass}`}
                    animate={{ opacity: [0.15, 0.5, 0.15] }}
                    transition={{
                      duration: 3 + index * 0.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4,
                    }}
                    aria-hidden="true"
                  />
                ))}

                {hotspots.map((hotspot) => {
                  const selected =
                    activeLab === hotspot.lab &&
                    activeDepartment === hotspot.department;

                  return (
                    <motion.button
                      key={hotspot.id}
                      type="button"
                      onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      onFocus={() => setHoveredHotspot(hotspot.id)}
                      onBlur={() => setHoveredHotspot(null)}
                      onClick={() => {
                        setActiveLab(hotspot.lab);
                        setActiveDepartment(hotspot.department);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#d4c09a] hover:bg-[#d4c09a]/15 hover:text-white sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.22em] ${
                        selected
                          ? "border-[#d4c09a] bg-[#d4c09a] text-black shadow-[0_0_28px_rgba(212,192,154,0.45)]"
                          : "border-[#d4c09a]/35 bg-black/55 text-white/80"
                      }`}
                      style={{ left: hotspot.left, top: hotspot.top }}
                      animate={
                        selected
                          ? { scale: [1, 1.035, 1], opacity: [1, 0.92, 1] }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={{
                        duration: 2.4,
                        repeat: selected ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    >
                      {hotspot.label}
                      <AnimatePresence>
                        {hoveredHotspot === hotspot.id ? (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.16 }}
                            className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-[#d4c09a]/40 bg-black/85 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#d4c09a] shadow-xl sm:block"
                          >
                            {hotspot.tooltip}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <div className="min-w-0 overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.055] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
              <div className="flex flex-wrap gap-2">
                {labs.map((lab) => (
                  <button
                    key={lab.key}
                    type="button"
                    onClick={() => setActiveLab(lab.key)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:scale-[1.02] hover:bg-white/10 ${
                      activeLab === lab.key
                        ? "border-[#d4c09a] bg-[#d4c09a] text-black"
                        : "border-white/12 bg-white/[0.055] text-white/72"
                    }`}
                  >
                    {lab.shortName}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeLab}-${activeDepartment}`}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.34, ease: "easeOut" }}
                  className="mt-7"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                    {activeDepartmentContent?.eyebrow}
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {activeDepartmentContent?.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/68 md:text-base md:leading-8">
                    {activeDepartmentContent?.description}
                  </p>

                  <div className="mt-8 flex max-w-full gap-4 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:#d4c09a_rgba(255,255,255,0.08)]">
                    {labGalleryImages.map((src, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt={`Artisan lab production image ${index + 1}`}
                        className="h-48 w-[260px] shrink-0 rounded-[18px] border border-white/10 object-cover shadow-xl transition duration-300 hover:scale-[1.03] sm:h-56 sm:w-[320px]"
                      />
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {availableDepartments.map((department) => {
                      const active = activeDepartment === department;

                      return (
                        <button
                          key={department}
                          type="button"
                          onClick={() => setActiveDepartment(department)}
                          className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition hover:scale-[1.02] hover:bg-white/10 ${
                            active
                              ? "border-[#d4c09a]/70 bg-[#d4c09a]/14 text-white"
                              : "border-white/10 bg-white/[0.045] text-white/62"
                          }`}
                        >
                          {departmentLabels[department]}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            {...fadeUp}
            className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-3"
          >
            {labs.map((lab) => (
              <button
                key={`${lab.key}-summary`}
                type="button"
                onClick={() => setActiveLab(lab.key)}
                className={`rounded-xl border p-4 text-left transition hover:scale-[1.02] hover:bg-white/10 ${
                  activeLab === lab.key
                    ? "border-[#d4c09a]/70 bg-[#d4c09a]/12"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                  {lab.shortName}
                </span>
                <span className="mt-2 block text-lg font-semibold text-white">
                  {lab.name}
                </span>
                <span className="mt-2 block text-sm leading-6 text-white/58">
                  {lab.description}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        data-theme="dark"
        className="border-y border-white/10 bg-[#171311] px-6 py-16 md:px-10"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Built For Partnership
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
              The work is technical. The relationship is personal.
            </h2>
          </div>
          <Link
            href="/provider-resources"
            className="inline-flex w-fit items-center justify-center rounded-full border border-[#d4c09a]/60 bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-[#e2cca2]"
          >
            Visit Partner Resources
          </Link>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
