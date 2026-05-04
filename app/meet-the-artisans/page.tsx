"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  image?: string;
  contactHref?: string;
};

type LabKey = "pacific" | "peak" | "pike";

type LabDetail = {
  key: LabKey;
  name: string;
  shortName: string;
  description: string;
};

type ServicePhoto = {
  src: string;
  alt: string;
  caption: string;
};

const salesTeam: TeamMember[] = [
  {
    name: "Josh Opiol",
    role: "Account Manager",
    image: "/images/josh-headshot.png",
    description:
      "Helping independent practices find the right lab path with clear support and practical answers.",
    contactHref: "mailto:sales@artisanlabnetwork.com?subject=Message%20for%20Josh",
  },
  {
    name: "Heather Branderhorst",
    role: "Account Manager",
    image: "/images/heather-headshot.jpg",
    description:
      "Supporting customers with product knowledge, service focus, and a real passion for independent eye care.",
    contactHref: "mailto:sales@artisanlabnetwork.com?subject=Message%20for%20Heather",
  },
];

const leadershipTeam: TeamMember[] = [
  { name: "Brandon Butler", role: "President & CEO", image: "/brandon-headshot.jpg" },
  { name: "Jim Day", role: "EVP Sales & Marketing", image: "/jim-headshot.jpg" },
  { name: "Rachel Ahlson", role: "COO", image: "/rachael-headshot.jpg" },
  { name: "Shelley Witmer", role: "Customer Service Leadership", image: "/shelley-headshot.jpg" },
];

const customerServicePhotos: Record<LabKey, ServicePhoto[]> = {
  pacific: [
    {
      src: "/images/event-selfie-unknown-year-1.jpg",
      alt: "Jill and Clareta from Pacific Artisan Labs",
      caption: "Jill and Clareta",
    },
    {
      src: "/images/storefront-group-photo-2025-1.jpg",
      alt: "Pacific Artisan Labs customer service group",
      caption: "Jill, Noelle, Clareta, and Shelley",
    },
  ],
  peak: [
    {
      src: "/images/peak_employees.png",
      alt: "Peak Artisan customer service team",
      caption: "Peak Artisan Labs team",
    },
  ],
  pike: [
    {
      src: "/images/office-group-photo-2025-1.jpg",
      alt: "Pike Artisan Labs customer service group",
      caption: "Jess, Savana, Fanta, and Jada",
    },
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
      {member.image ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/10">
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <PhotoPlaceholder />
      )}
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

function SalesTeamCard({ member }: { member: TeamMember }) {
  return (
    <motion.article
      {...cardReveal}
      className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.055] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:scale-[1.01] hover:border-[#d4c09a]/40 hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-white">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#d4c09a]">
          {member.role}
        </p>
        {member.description ? (
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
            {member.description}
          </p>
        ) : null}
        {member.contactHref ? (
          <a
            href={member.contactHref}
            className="mt-5 inline-flex w-fit rounded-full bg-[#d4c09a] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e2cca2]"
          >
            Contact {member.name.split(" ")[0]}
          </a>
        ) : null}
      </div>
      {member.image ? (
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/10 sm:h-32 sm:w-32">
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="128px"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-center text-xs leading-5 text-white/38 sm:h-28 sm:w-28">
          Photo Coming Soon
        </div>
      )}
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

  const activeServicePhotos = customerServicePhotos[activeServiceLab];

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
              <SalesTeamCard key={member.name} member={member} />
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
          <div className="relative">
            {labs.map((lab) => (
              <span key={lab.key} id={lab.key} className="absolute -top-28" aria-hidden="true" />
            ))}
          </div>

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
              id={activeServiceLab}
              key={activeServiceLab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`mt-12 grid gap-6 ${activeServiceLab === "peak" ? "mx-auto max-w-[900px]" : "md:grid-cols-2"}`}
            >
              {activeServicePhotos.map((photo) => (
                <figure
                  key={`${activeServiceLab}-${photo.src}`}
                  className="group relative h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_22px_70px_rgba(0,0,0,0.26)]"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className={`transition duration-500 group-hover:scale-[1.03] ${
                      activeServiceLab === "peak" ? "object-contain object-center" : "object-cover object-top"
                    }`}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/86 via-black/38 to-transparent px-5 pb-5 pt-20">
                    <figcaption className="text-lg font-semibold text-white">
                      {photo.caption}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </motion.div>
          </AnimatePresence>
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
