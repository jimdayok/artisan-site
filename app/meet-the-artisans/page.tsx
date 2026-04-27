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

type LabDetail = {
  key: LabKey;
  name: string;
  shortName: string;
  description: string;
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
  const [activeLab, setActiveLab] = useState<LabKey>("pacific");
  const [selectedLab, setSelectedLab] = useState<LabKey>("pacific");

  const activeServiceTeam = serviceTeams[activeLab];
  const activeLabDetail = useMemo(
    () => labs.find((lab) => lab.key === selectedLab) ?? labs[0],
    [selectedLab]
  );

  return (
    <main className="min-h-screen bg-black text-white">
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
              const active = activeLab === lab.key;
              return (
                <button
                  key={lab.key}
                  type="button"
                  onClick={() => setActiveLab(lab.key)}
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
              key={activeLab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {activeServiceTeam.map((member) => (
                <TeamCard key={`${activeLab}-${member.name}`} member={member} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CreamDivider />

      <section
        id="labs"
        data-theme="dark"
        className="bg-black px-6 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Lab Experience"
            title="Step Inside the Labs"
            copy="A simple preview space for lab layouts, galleries, and richer location details when photography is ready."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
            <motion.div
              {...fadeUp}
              className="w-full h-[400px] rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10"
            >
              Lab Layout Graphic Coming Soon
            </motion.div>

            <div className="space-y-5">
              <div className="grid gap-3">
                {labs.map((lab) => {
                  const active = selectedLab === lab.key;
                  return (
                    <button
                      key={lab.key}
                      type="button"
                      onClick={() => setSelectedLab(lab.key)}
                      className={`rounded-2xl border p-5 text-left transition hover:scale-[1.02] hover:bg-white/10 ${
                        active
                          ? "border-[#d4c09a]/70 bg-[#d4c09a]/12"
                          : "border-white/12 bg-white/[0.055]"
                      }`}
                    >
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4c09a]">
                        {lab.shortName}
                      </span>
                      <span className="mt-2 block text-xl font-semibold text-white">
                        {lab.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLabDetail.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="rounded-2xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-xl"
                >
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {activeLabDetail.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {activeLabDetail.description}
                  </p>
                  <div className="mt-6 aspect-[16/9] w-full rounded-xl bg-white/5 flex items-center justify-center text-white/40 text-sm">
                    Lab Photo Coming Soon
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="aspect-square rounded-xl bg-white/5 flex items-center justify-center text-center text-[11px] leading-4 text-white/35"
                      >
                        Gallery Coming Soon
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
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
