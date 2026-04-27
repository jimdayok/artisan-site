"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RingsAccent from "../components/RingsAccent";
import SiteIcon from "../components/SiteIcon";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const CAREERS_APPLICATION_URL = "https://form.typeform.com/to/Xxi9JSWD";

const sectionFade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

const benefits = [
  "Health Insurance",
  "Dental and Vision",
  "401k Access",
  "Annual Lenses and Frames for Employees",
  "Lenses for Immediate Family Members",
  "Supportive Work Environment",
  "Skilled Teammates",
  "Growth and Training Opportunities",
];

const thriveCards = [
  "People who take pride in details",
  "People who want to learn",
  "People who care about customers",
  "People who support their team",
];

const benefitIcons = [
  "/icons/site/heart.svg",
  "/icons/site/heart.svg",
  "/icons/site/briefcase.svg",
  "/icons/site/users.svg",
  "/icons/site/heart.svg",
  "/icons/site/users.svg",
  "/icons/site/users.svg",
  "/icons/site/rocket.svg",
];

const thriveIcons = [
  "/icons/site/heart.svg",
  "/icons/site/rocket.svg",
  "/icons/site/heart.svg",
  "/icons/site/users.svg",
];

const jobs = [
  {
    id: "surface-technician",
    title: "Surface Technician",
    location: "Artisan Lab Network",
    description: "Shape lens work with care, consistency, and respect for the craft.",
    responsibilities: [
      "Run surfacing equipment with accuracy and attention.",
      "Check lens work against job specifications.",
      "Keep work areas clean, steady, and ready for the next order.",
      "Communicate issues early so the team can solve them quickly.",
    ],
    requirements: [
      "Comfort working with hands, tools, and detailed production steps.",
      "Willingness to learn optical lab processes.",
      "Steady focus in a fast-moving production environment.",
    ],
  },
  {
    id: "surface-manager",
    title: "Surface Department Manager",
    location: "Artisan Lab Network",
    description: "Lead a skilled production team with clarity, standards, and calm follow-through.",
    responsibilities: [
      "Guide surfacing workflow and daily production priorities.",
      "Support technicians with training, quality checks, and problem solving.",
      "Track bottlenecks and keep communication clear across departments.",
      "Protect quality while helping the team move work on time.",
    ],
    requirements: [
      "Experience in optical lab production or hands-on manufacturing leadership.",
      "Strong organization and direct communication.",
      "Ability to coach people without losing sight of the work.",
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service Representative",
    location: "Artisan Lab Network",
    description: "Help practices get clear answers from people who know the work.",
    responsibilities: [
      "Answer practice questions with patience and accuracy.",
      "Check order status and help resolve service issues.",
      "Communicate clearly with lab teams and customers.",
      "Keep notes organized so the next step is easy to see.",
    ],
    requirements: [
      "Clear communication and steady follow-through.",
      "Comfort helping customers by phone and email.",
      "A practical, service-minded approach to solving problems.",
    ],
  },
  {
    id: "optical-lab-technician",
    title: "Optical Lab Technician",
    location: "Artisan Lab Network",
    description: "Work across lab processes where quality and consistency matter every day.",
    responsibilities: [
      "Support production steps from order flow through finished work.",
      "Inspect lenses and jobs for accuracy.",
      "Follow lab standards and ask questions when something looks off.",
      "Help teammates keep orders moving cleanly.",
    ],
    requirements: [
      "Interest in optical lab work and technical process.",
      "Detail focus and willingness to build skill over time.",
      "Reliable attendance and a team-first attitude.",
    ],
  },
  {
    id: "finishing-technician",
    title: "Finishing Technician",
    location: "Artisan Lab Network",
    description: "Finish eyewear with the kind of care patients can feel.",
    responsibilities: [
      "Edge, mount, and inspect finished lens work.",
      "Read job details and match finished work to specifications.",
      "Handle frames and lenses with care.",
      "Work with the team to catch issues before orders leave the lab.",
    ],
    requirements: [
      "Good hand skills and attention to fit and finish.",
      "Comfort with detailed, repetitive technical work.",
      "Experience in finishing or optical work is helpful, but not required for every role.",
    ],
  },
  {
    id: "ar-coating-technician",
    title: "AR Coating Technician",
    location: "Artisan Lab Network",
    description: "Support coating work where clean process and discipline matter.",
    responsibilities: [
      "Prepare lenses for coating with careful handling and inspection.",
      "Follow coating process steps and cleanliness standards.",
      "Watch for defects and communicate quality concerns.",
      "Support equipment care and department organization.",
    ],
    requirements: [
      "Patience, consistency, and respect for process.",
      "Comfort working in clean, detail-driven environments.",
      "Willingness to learn coating standards and equipment routines.",
    ],
  },
  {
    id: "shipping-receiving",
    title: "Shipping and Receiving Associate",
    location: "Artisan Lab Network",
    description: "Keep orders moving in and out with accuracy and care.",
    responsibilities: [
      "Receive packages and route work to the right place.",
      "Pack finished orders so they arrive cleanly and on time.",
      "Help maintain shipping supplies and daily organization.",
      "Check details before orders leave the lab.",
    ],
    requirements: [
      "Organization and steady attention to order details.",
      "Comfort standing, moving, and handling packages through the day.",
      "A reliable, team-minded approach to daily work.",
    ],
  },
];

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Contact Artisan Lab Network"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close contact form"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-white/15 bg-[#f5f1eb] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-[#f5f1eb] px-5 py-4 md:px-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                  Contact
                </div>
                <h2 className="text-lg font-semibold text-[#1f1a17] md:text-xl">
                  Start the Conversation
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-xl leading-none text-black/65 transition hover:bg-white hover:text-black"
                aria-label="Close contact form"
              >
                x
              </button>
            </div>
            <iframe
              src={CONTACT_FORM_URL}
              className="min-h-0 flex-1 bg-[#f5f1eb]"
              title="Contact Artisan Lab Network"
              allow="camera; microphone; autoplay; encrypted-media;"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
            light ? "text-[#d4c09a]" : "text-[#9a8564]"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-5 text-base leading-8 md:text-lg ${
            light ? "text-white/72" : "text-[#5f5750]"
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export default function CareersPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1eb] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        data-theme="dark"
        className="relative min-h-[680px] overflow-hidden px-6 pb-20 pt-32 text-white md:px-10 md:pt-40"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/backgroundwithglasses2.jpeg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,13,11,0.96),rgba(17,13,11,0.78)_50%,rgba(17,13,11,0.54))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#171311] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center">
          <div className="max-w-4xl">
            <div className="h-px w-16 bg-[#d4c09a]" />
            <h1 className="mt-7 text-5xl font-semibold leading-[1.03] tracking-tight md:text-7xl">
              Build Something You Can Be Proud Of
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78 md:text-xl">
              Join a team of skilled people who care about quality, service, and the patients behind every pair of lenses.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#open-positions"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                View Open Positions
              </a>
              <a
                href={CAREERS_APPLICATION_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <motion.section {...sectionFade} data-theme="light" className="px-6 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader eyebrow="Careers" title="We’re Looking for Real Artisans" />
          <div className="rounded-[28px] border border-[#d8c6a8]/60 bg-[#fffaf2]/85 p-7 shadow-[0_24px_70px_rgba(49,39,26,0.08)] md:p-9">
            <SiteIcon
              src="/icons/site/heart.svg"
              className="mb-7 h-14 w-14 border-[#d8c6a8]/70 bg-white"
            />
            <p className="text-2xl font-semibold leading-snug text-[#1f1a17]">
              We’re looking for people who take pride in their work.
            </p>
            <div className="mt-7 space-y-4 text-lg leading-8 text-[#5f5750]">
              <p>People who care about getting things right.</p>
              <p>People who support their team.</p>
              <p>People who want to be part of something better in independent eye care.</p>
              <p className="border-t border-[#d8c6a8]/60 pt-6 font-semibold text-[#1f1a17]">
                This is not just a job. It’s work you can stand behind.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionFade} data-theme="dark" className="bg-[#171311] px-6 py-24 text-white md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Benefits" title="What You Can Expect" light />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className="group rounded-xl border border-white/12 bg-white/[0.055] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#d4c09a]/55 hover:bg-white/[0.08] hover:shadow-[0_24px_65px_rgba(0,0,0,0.22)]"
              >
                <div className="mb-5 flex items-center gap-4">
                  <SiteIcon
                    src={benefitIcons[index]}
                    tone="cream"
                    size="sm"
                    className="h-10 w-10 rounded-xl border-white/12 bg-white/[0.08]"
                  />
                  <div className="h-[2px] w-10 rounded-full bg-[#d4c09a]" />
                </div>
                <h3 className="text-xl font-semibold leading-tight text-white">{benefit}</h3>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionFade} data-theme="light" className="relative overflow-hidden px-6 py-24 md:px-10 md:py-28">
        <RingsAccent position="bottom-left" size="md" opacity="opacity-[0.045]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <SectionHeader
            eyebrow="A Path Forward"
            title="We Believe People Deserve a Path Forward"
          />
          <div className="rounded-[30px] border border-[#d8c6a8]/60 bg-white p-7 shadow-[0_24px_70px_rgba(49,39,26,0.08)] md:p-10">
            <div className="space-y-5 text-lg leading-8 text-[#5f5750]">
              <p className="text-2xl font-semibold text-[#1f1a17]">
                We are a second chance employer.
              </p>
              <p>We don’t judge people by their past.</p>
              <p>We look at effort, attitude, and willingness to do great work.</p>
              <p>
                We believe in giving people the opportunity to build something better for themselves and their future.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionFade} data-theme="light" className="relative overflow-hidden bg-[#fbf8f3] px-6 py-24 md:px-10 md:py-28">
        <RingsAccent position="top-right" size="md" opacity="opacity-[0.045]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeader eyebrow="Fit" title="Who Thrives Here" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {thriveCards.map((item, index) => (
              <div
                key={item}
                className="group rounded-2xl border border-[#d8c6a8]/55 bg-white p-6 shadow-[0_18px_48px_rgba(49,39,26,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#c9b28b] hover:shadow-[0_24px_64px_rgba(49,39,26,0.12)]"
              >
                <div className="flex items-center gap-3">
                  <SiteIcon
                    src={thriveIcons[index]}
                    size="sm"
                    className="h-10 w-10 rounded-xl border-[#d8c6a8]/70 bg-[#fffaf2]"
                  />
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8564]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-snug text-[#1f1a17]">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        {...sectionFade}
        id="open-positions"
        data-theme="dark"
        className="relative scroll-mt-24 overflow-hidden bg-[#171311] px-6 py-24 text-white md:px-10 md:py-28"
      >
        <RingsAccent position="center-right" size="lg" opacity="opacity-[0.045]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Open Positions"
            title="Open Positions"
            body="Start with the work. Open a role, read what it asks of you, and decide if it feels like a fit."
            light
          />

          <div className="mt-12 grid gap-4">
            {jobs.map((job) => {
              const isOpen = activeJobId === job.id;
              return (
                <article
                  key={job.id}
                  className={`overflow-hidden rounded-2xl border transition duration-300 ${
                    isOpen
                      ? "border-[#d4c09a]/70 bg-white/[0.075] shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
                      : "border-white/12 bg-white/[0.045] hover:border-[#d4c09a]/45 hover:bg-white/[0.065]"
                  }`}
                >
                  <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-center md:px-7 md:py-6">
                    <button
                      type="button"
                      onClick={() => setActiveJobId((current) => (current === job.id ? null : job.id))}
                      className="block text-left"
                      aria-expanded={isOpen}
                      aria-controls={`${job.id}-details`}
                    >
                      <div className="flex gap-4">
                        <SiteIcon
                          src="/icons/site/briefcase.svg"
                          tone="cream"
                          size="sm"
                          className="mt-1 hidden h-11 w-11 rounded-xl border-white/12 bg-white/[0.08] sm:grid"
                        />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
                            {job.location}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold text-white">{job.title}</h3>
                          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    </button>
                    <div className="flex flex-wrap gap-3 md:justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveJobId((current) => (current === job.id ? null : job.id))}
                        className="inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-white/12"
                        aria-expanded={isOpen}
                        aria-controls={`${job.id}-details`}
                      >
                        {isOpen ? "Hide Details" : "View Details"}
                      </button>
                      <a
                        href={CAREERS_APPLICATION_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full bg-[#d4c09a] px-4 py-2 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`${job.id}-details`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-7 border-t border-white/10 px-5 pb-6 pt-6 md:grid-cols-2 md:px-7">
                          <div>
                            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                              Responsibilities
                            </h4>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/72">
                              {job.responsibilities.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4c09a]" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                              Requirements
                            </h4>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/72">
                              {job.requirements.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4c09a]" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionFade} id="apply" data-theme="light" className="relative scroll-mt-24 overflow-hidden px-6 py-24 md:px-10 md:py-28">
        <RingsAccent position="top-left" size="md" opacity="opacity-[0.04]" />
        <div className="relative z-10 mx-auto max-w-5xl rounded-[34px] border border-[#d8c6a8]/60 bg-white p-8 text-center shadow-[0_24px_70px_rgba(49,39,26,0.08)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8564]">
            Apply
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Ready to Join the Artisan Team?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#5f5750]">
            Bring your effort, your attention, and your willingness to learn. We’ll help you understand the work.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={CAREERS_APPLICATION_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#171311]"
            >
              Apply Now
            </a>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-[#fbf8f3] px-7 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a]"
            >
              Contact Us
            </button>
          </div>
        </div>
      </motion.section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
