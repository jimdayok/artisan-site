"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const SALES_EMAIL = "mailto:sales@artisanlabnetwork.com";

const beliefs = [
  {
    title: "Choice over restriction",
    body: "Independent practices need options, not a single forced path. We build around access, flexibility, and the freedom to choose what is right for each patient.",
  },
  {
    title: "Partnership over transactions",
    body: "A lab relationship should not feel like a ticket number. It should feel like people who know your practice, answer clearly, and stay accountable.",
  },
  {
    title: "Control over dependency",
    body: "Corporate systems often make practices adapt to the lab. We believe the lab should support the way the practice actually works.",
  },
  {
    title: "Performance that holds up",
    body: "Quality, turnaround, communication, and service all matter. The model only works if it performs when the work gets busy.",
  },
];

const leaders = [
  {
    name: "Brandon Butler",
    role: "President & CEO",
    image: "/brandon-headshot.jpg",
    email: "mailto:brandon.butler@artisanlabnetwork.com",
    linkedin: "https://www.linkedin.com/in/brandon-butler-5908a32a",
    bio: "Brandon brings deep experience across optics, manufacturing, coatings, lens design software, and lab systems. He built Artisan Lab Network around a simple idea: independent practices deserve better alignment, better choices, and a lab partner that understands private practice. His work also extends into second-chance employment and reentry support.",
  },
  {
    name: "Jim Day",
    role: "Executive VP, Sales & Marketing",
    image: "/jim-headshot.jpg",
    email: SALES_EMAIL,
    linkedin: "https://www.linkedin.com/in/jimdayok/",
    bio: "Jim leads growth, positioning, and commercial strategy for the network. He helps practices see where control, margin, or service quality may be slipping, then has clear conversations about what a better model could look like.",
  },
  {
    name: "Rachel Ahlson",
    role: "VP & COO",
    image: "/rachael-headshot.jpg",
    email: "mailto:rahlson@artisanlabnetwork.com",
    linkedin: "https://www.linkedin.com/in/rachel-ahlson-73a90b123",
    bio: "Rachel brings strong operational leadership and hands-on lab experience. Her focus is consistency, efficiency, and making sure the network delivers on the promises it makes to practices.",
  },
  {
    name: "Shelley Witmer",
    role: "Director of Customer Service",
    image: "/shelley-headshot.jpg",
    email: "mailto:switmer@artisanlabnetwork.com",
    linkedin: "https://www.linkedin.com/in/shelley-witmer-a06566235",
    bio: "Shelley has spent more than 30 years in the optical industry and is known for responsiveness, follow-through, and real support. She helps make sure practices can reach people who care and get answers that help.",
  },
];

const contactCards = [
  {
    title: "Sales",
    body: "For growth conversations, lab relationship strategy, and whether Artisan is the right fit.",
    href: "mailto:sales@artisanlabnetwork.com",
  },
  {
    title: "Customer Service",
    body: "For order support, communication questions, service workflows, and help from the lab team.",
    href: "mailto:customerservice@artisanlabnetwork.com",
  },
  {
    title: "Employment",
    body: "For career opportunities, hiring questions, and joining the Artisan Lab Network team.",
    href: "mailto:careers@artisanlabnetwork.com",
  },
  {
    title: "Lab Ownership",
    body: "For ownership alignment, network direction, and high-level partnership conversations.",
    href: "mailto:info@artisanlabnetwork.com",
  },
];

const pressArticles = [
  {
    title: "Artisan Lab Network Hosts First PAL Shareholder Conference",
    date: "2025",
    source: "Vision Monday",
    href: "https://www.visionmonday.com/business/article/artisan-lab-network-hosts-first-pal-shareholder-conference/",
    body: "A milestone event bringing Pacific, Peak, and Pike ownership groups together to align strategy, share innovation, and strengthen the future of independent eye care.",
  },
  {
    title: "Brandon Butler Appointed to Vision Council Board",
    date: "2026",
    source: "Vision Monday",
    href: "https://www.visionmonday.com/eyecare/article/the-vision-council-appoints-brandon-butler-ceo-of-artisan-lab-network-to-its-board-of-directors/",
    body: "Industry recognition for leadership rooted in independent optical laboratories, practical operating experience, and representation for independent labs nationwide.",
  },
  {
    title: "Launch of Pike Artisan Labs",
    date: "2025",
    source: "Vision Monday",
    href: "https://www.visionmonday.com/business/article/artisan-lab-network-announces-launch-of-newest-pal-laboratory-pike-artisan-labs/",
    body: "Expansion into the central U.S. market, bringing over 20 private practice locations across five states into ALN's equity ownership group.",
  },
  {
    title: "Peak Artisan Labs Expands Ownership Group",
    date: "2025",
    source: "Vision Monday",
    href: "https://www.visionmonday.com/business/article/peak-artisan-labs-expands-ownership-group-with-addition-of-leading-kansas-eyecare-practices/",
    body: "Growth of the doctor-owned model through additional Kansas eyecare practices and a shared commitment to independence and long-term sustainability.",
  },
  {
    title: "Pacific Artisan Labs Partnership Expansion",
    date: "2023",
    source: "Vision Monday",
    href: "https://www.visionmonday.com/latest-news/article/pacific-artisan-labs-partners-with-independent-optical-lab-continuing-lab-network-expansion-strategy/",
    body: "A partnership strategy designed to counter industry consolidation and strengthen independent optical lab collaboration across the country.",
  },
];

const timelineEvents = [
  {
    year: "2018",
    title: "Pacific Artisan Labs launches",
    body: "The first lab in the model begins with a different idea: align the lab relationship around independent practices and long term value.",
  },
  {
    year: "2019",
    title: "Launches Artisan AR Portfolio",
    body: "The Artisan AR portfolio expands in house coating capabilities and gives practices more premium treatment options.",
  },
  {
    year: "2021",
    title: "Launches Artisan Design Series powered by IOT",
    body: "The Artisan Design Series portfolio is introduced, bringing advanced lens designs powered by IOT to independent practices.",
  },
  {
    year: "2022",
    title: "Releases Artisan Nytopia AR",
    body: "Artisan Nytopia AR is released as part of the growing portfolio of premium treatment options.",
  },
  {
    year: "2024",
    title: "Launches Tokai as first U.S. distributor",
    body: "Artisan expands its product access by becoming the first U.S. distributor for Tokai.",
  },
  {
    year: "2024",
    title: "Becomes VSP contract lab",
    body: "The network strengthens its position with independent practices through contract lab access tied to VSP programs.",
  },
  {
    year: "2025",
    title: "Becomes Varilux distributor",
    body: "Artisan adds Varilux distribution, expanding access to major premium lens offerings.",
  },
  {
    year: "2025",
    title: "The network grows across regions",
    body: "Peak expands its ownership group, Pike launches in the central U.S., and ALN brings the 3 PAL labs together for its first shareholder conference.",
  },
];

function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
      {open && (
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
            className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#f5f1eb] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
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
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-2xl leading-none text-black/65 transition hover:bg-white hover:text-black"
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
      )}
    </AnimatePresence>
  );
}

export default function AboutPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1eb] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        id="top"
        data-theme="light"
        className="relative overflow-hidden px-6 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44"
        style={{
          backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#f5f1eb]/90" />
        <div className="relative z-20 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.32em] text-black/45 transition hover:text-black"
            >
              Artisan Lab Network
            </Link>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-tight text-[#1f1a17] md:text-7xl">
              Built for independent practices that want control back.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/68 md:text-xl">
              Artisan Lab Network was built to give independent eye care more
              control, more choice, and a better lab relationship. Not more
              corporate noise. Not more restrictions. A better way to work.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={SIGNUP_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#c9b28b] px-7 py-3 text-sm font-semibold text-[#1f1a17] shadow-[0_14px_30px_rgba(49,39,26,0.12)] transition hover:bg-[#d7bf94]"
              >
                Get Started
              </a>
              <a
                href={SALES_EMAIL}
                className="rounded-full border border-black/15 bg-white/60 px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:bg-white"
              >
                Email Sales
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white/70 p-7 shadow-[0_24px_70px_rgba(49,39,26,0.12)] backdrop-blur-md">
            <div className="text-xs uppercase tracking-[0.3em] text-black/45">
              Why it matters
            </div>
            <p className="mt-4 text-2xl font-semibold leading-snug text-[#1f1a17]">
              When the lab relationship works, the practice gets more than
              product. It gets confidence, speed, clarity, and room to make
              better decisions for patients.
            </p>
          </div>
        </div>
      </section>

      <section id="about" data-theme="light" className="bg-[#f2eee7] px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              Our Story
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              A different answer to consolidation.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-black/70">
            <p>
              Independent practices should not have to depend on lab systems
              designed around corporate priorities. They need quality they can
              trust, service they can reach, and choices that fit the way they
              practice.
            </p>
            <p>
              Brandon Butler saw the effects of consolidation firsthand. Too
              many practices were losing flexibility, margin, and direct
              accountability. In 2018, Pacific Artisan Labs launched with a
              different vision: build a lab model around the needs of independent
              eye care, not around forcing every practice into the same box.
            </p>
            <p>
              That idea became Artisan Lab Network. Today ALN supports Pacific
              Artisan Labs, Peak Artisan Labs, and Pike Artisan Labs, with a
              shared commitment to independence, quality, service, accountability,
              and freedom of choice.
            </p>
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#fbf8f2] px-6 py-24 text-[#1f1a17] md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              Press & Recognition
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Recognized across the industry.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-black/65">
              Our work is being recognized across the optical industry as we
              build a model focused on independence, ownership, and long-term
              growth.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pressArticles.map((article) => (
              <a
                key={article.title}
                href={article.href}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-full flex-col rounded-[24px] border border-black/10 bg-white/78 p-6 text-left shadow-[0_18px_45px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_26px_65px_rgba(49,39,26,0.13)]"
              >
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-[#d6c3a1]/70 bg-[#f2eee7] text-xs font-bold tracking-[0.18em] text-[#7b6647]">
                    VM
                  </div>
                  <div className="text-xs uppercase tracking-[0.22em] text-black/42">
                    {article.source} / {article.date}
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-snug">
                  {article.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-black/62">
                  {article.body}
                </p>
                <div className="mt-6 text-sm font-semibold text-[#8b7656] transition group-hover:text-black">
                  Read Article
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f2eee7] px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              Built for Independence
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              A doctor-owned platform for practices that want a stronger future.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-black/70">
            <p>
              Artisan Lab Network is a doctor-owned network of optical
              laboratories designed to give independent practices control,
              choice, and a stronger financial future.
            </p>
            <p>
              Through Pacific Artisan Labs, Peak Artisan Labs, and Pike Artisan
              Labs, we have built a national platform that aligns laboratories
              and practices around shared ownership, performance, and long-term
              success.
            </p>
            <p>
              Our model exists to challenge consolidation in the industry. We
              believe independent practices should not be forced into limited
              choices or competing relationships. They deserve partners who are
              aligned with their success.
            </p>
          </div>
        </div>
      </section>

      <section data-theme="light" className="border-t border-[#e7ddd0] bg-[#fbf8f3]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#8c7d68]">
              Growth Timeline
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#1f1a17] md:text-5xl">
              From a different lab vision to a growing independent network.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5c544d]">
              Key milestones that show how the network has grown while staying focused on independent practices.
            </p>
          </div>

          <div className="relative mt-14">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#dccfbf] md:block" />

            <div className="space-y-6 md:space-y-8">
              {timelineEvents.map((event, index) => (
                <div
                  key={`${event.year}-${event.title}-${index}`}
                  className="relative md:grid md:grid-cols-2 md:gap-10"
                >
                  <div
                    className={`${
                      index % 2 === 0 ? "md:pr-10" : "md:col-start-2 md:pl-10"
                    }`}
                  >
                    <article className="relative rounded-[20px] border border-[#e7ddd0] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(49,39,26,0.10)]">
                      <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#c9b28b] px-4 py-1.5 text-sm font-semibold text-[#1f1a17]">
                        {event.year}
                      </div>

                      <h3 className="text-xl font-semibold leading-snug text-[#1f1a17]">
                        {event.title}
                      </h3>

                      <p className="mt-3 text-base leading-7 text-[#5c544d]">
                        {event.body}
                      </p>

                      <div
                        className={`absolute top-8 hidden h-4 w-4 rounded-full border-4 border-[#fbf8f3] bg-[#c9b28b] md:block ${
                          index % 2 === 0
                            ? "right-[-2.85rem]"
                            : "left-[-2.85rem]"
                        }`}
                      />
                    </article>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f5f1eb] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              What We Believe
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Simple principles. Hard to fake.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {beliefs.map((belief) => (
              <div
                key={belief.title}
                className="rounded-[22px] border border-black/10 bg-white/72 p-6 shadow-[0_18px_45px_rgba(49,39,26,0.08)]"
              >
                <h3 className="text-xl font-semibold">{belief.title}</h3>
                <p className="mt-4 text-sm leading-7 text-black/62">
                  {belief.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#eee5d7] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">
                Leadership
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                People behind the network.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-black/60">
              ALN is led by people who understand labs, practices, operations,
              service, and the pressure independent eye care teams feel every day.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {leaders.map((leader) => (
              <article
                key={leader.name}
                className="flex min-h-full flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#fbf8f2] shadow-[0_20px_55px_rgba(49,39,26,0.10)]"
              >
                <div className="relative aspect-[4/3] bg-[#ded2c1]">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-2xl font-semibold">{leader.name}</h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b7656]">
                    {leader.role}
                  </p>
                  <p className="mt-5 flex-1 text-sm leading-7 text-black/62">
                    {leader.bio}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={leader.email}
                      className="rounded-full bg-[#1f1a17] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Email
                    </a>
                    <a
                      href={leader.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-[#1f1a17] transition hover:bg-white"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-theme="dark"
        className="relative overflow-hidden px-6 py-24 text-white md:px-10"
        style={{
          backgroundImage: "url('/backgroundimage.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/82" />
        <div className="relative z-20 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4c09a]">
              Our Approach
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Clear conversations beat canned pitches.
            </h2>
          </div>
          <div className="rounded-[28px] border border-white/12 bg-white/8 p-7 shadow-2xl backdrop-blur-md md:p-9">
            <div className="space-y-5 text-lg leading-8 text-white/76">
              <p>
                Our approach starts with the truth about what is happening
                inside the practice. Where is friction showing up? Where is margin
                getting squeezed? Where are communication, turnaround, or limited
                choices making the day harder than it needs to be?
              </p>
              <p>
                We do not push products for the sake of pushing products. We help
                practices make better decisions. No canned pitch. No pressure
                tactics. Just clarity, honest questions, and useful advice.
              </p>
              <p>
                If there is a fit, we show why. If there is not, we do not force
                it. The goal is a better lab relationship, not a quick sale.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={SALES_EMAIL}
                className="rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e2cca2]"
              >
                Email Sales
              </a>
              <a
                href={SIGNUP_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/18 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f5f1eb] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              Talk To The Right Person
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Get to the conversation that matters.
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/65">
              Whether you are thinking about service, operations, growth, or the
              bigger network model, start with the person closest to the question.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((card) => (
              <a
                key={card.title}
                href={card.href}
                className="group rounded-[22px] border border-black/10 bg-white/75 p-6 shadow-[0_18px_45px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(49,39,26,0.12)]"
              >
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-black/62">
                  {card.body}
                </p>
                <div className="mt-6 text-sm font-semibold text-[#8b7656] transition group-hover:text-black">
                  Send email
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#ece7dc] px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 border-t border-[#d6c3a1]/60 pt-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              Community Impact
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Our commitment to people.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4 text-base leading-8 text-black/68">
              <p>
                We believe independence means creating opportunity for others.
                That value shows up in second-chance hiring and volunteer work
                connected to Coffee Creek Correctional Facility&apos;s
                paraoptometric program.
              </p>
              <p>
                Brandon Butler has volunteered with the Coffee Creek program for
                years, and public recognition has also highlighted Rachel Ahlson
                and Heather Branderhorst for supporting this work. The goal is
                practical: help people build skills, find meaningful work, and
                move forward with dignity.
              </p>
              <p>
                This is part of who we are. Strong businesses should build
                strong communities.
              </p>
            </div>
            <div className="rounded-[24px] border border-[#d6c3a1]/70 bg-[#fbf8f2]/75 p-6 shadow-[0_18px_45px_rgba(49,39,26,0.08)]">
              <p className="text-xl font-semibold leading-snug">
                “We believe independence means creating opportunity for others,
                not just for ourselves.”
              </p>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="mt-6 rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
    </main>
  );
}
