"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImmersiveTimeline from "../components/ImmersiveTimeline";
import RingsAccent from "../components/RingsAccent";
import EmbeddedTypeform from "../components/analytics/EmbeddedTypeform";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const SALES_EMAIL = "mailto:sales@artisanlabnetwork.com";

const aboutJumpLinks = [
  { label: "Independence", href: "#our-labs" },
  { label: "Leadership", href: "#leadership" },
  { label: "Timeline", href: "#timeline" },
  { label: "Recognition", href: "#industry-recognition" },
  { label: "Tokai Partnership", href: "#tokai-partnership" },
  { label: "Advocacy", href: "#advocacy-leadership" },
  { label: "News & Press", href: "#press-releases" },
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
    name: "Rachel Ahlson",
    role: "VP & COO",
    image: "/rachael-headshot.jpg",
    email: "mailto:rahlson@artisanlabnetwork.com",
    linkedin: "https://www.linkedin.com/in/rachel-ahlson-73a90b123",
    bio: "Rachel brings strong operational leadership and hands-on lab experience. Her focus is consistency, efficiency, and making sure the network delivers on the promises it makes to practices.",
  },
  {
    name: "Jim Day",
    role: "Executive VP, Sales & Marketing",
    image: "/jimhs1.jpg",
    email: SALES_EMAIL,
    linkedin: "https://www.linkedin.com/in/jimdayok/",
    bio: "Jim leads growth, positioning, and commercial strategy for the network. He helps practices see where control, margin, or service quality may be slipping, then has clear conversations about what a better model could look like.",
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

const pressArticles = [
  {
    title: "Pacific Artisan Labs Featured by Jails to Jobs",
    date: "2025",
    source: "Jails to Jobs",
    href: "https://jailstojobs.org/resources/second-chance-employers-network/pacific-artisan-labs/",
    body: "A profile of Pacific Artisan Labs as a second-chance employer and community partner supporting meaningful work and reentry opportunity.",
  },
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

const editorialSections = [
  {
    id: "industry-recognition",
    eyebrow: "Industry Recognition",
    title: "Recognized leadership for independent optical.",
    image: "/images/brandon-mike.jpg",
    imageAlt: "Brandon Butler with Mike Vitale",
    body:
      "Artisan Lab Network's leadership is active in the broader optical conversation, building relationships with organizations and leaders who shape the future of independent eye care. Recognition from respected industry voices reflects a model built around service, ownership, and practical support for practices.",
    detail:
      "That involvement keeps Artisan close to the issues that matter most: lab performance, independent practice choice, and the long-term health of the optical channel.",
  },
  {
    id: "tokai-partnership",
    eyebrow: "Exclusive Tokai Partnership",
    title: "A stronger U.S. relationship with Tokai.",
    image: "/images/group-office-photo-2023-1.jpg",
    imageAlt: "Hideyuki Hayashi, Brandon Butler, and Dean Butler",
    caption:
      "Left to right: Hideyuki Hayashi, International Sales, Tokai Corporation; Brandon Butler, President and CEO, Artisan Lab Network; Dean Butler, Founder and former CEO of LensCrafters, Vision Express, LensPro, LensMaster.",
    body:
      "Artisan's relationship with Hideyuki Hayashi and Tokai gives independent practices access to a differentiated lens technology partner with a deep commitment to optical performance. It is a credibility point, but also a practical advantage for practices looking for better product stories.",
    detail:
      "The partnership supports premium lens conversations, advanced progressive technology, and a more intentional path for practices that want something beyond commodity choices.",
  },
  {
    id: "advocacy-leadership",
    eyebrow: "Advocacy & Leadership",
    title: "Advocating for independent ECPs where policy is shaped.",
    image: "/images/hallway-portrait-2025-1.jpg",
    imageAlt: "Brandon Butler at the White House",
    imageClassName: "object-cover object-[50%_32%]",
    caption: "Brandon Butler at the White House advocating for independent optical laboratories and independent ECPs.",
    body:
      "Artisan's leadership extends beyond lab operations into advocacy for independent eye care professionals. The goal is to make sure independent practices, labs, and the patients they serve are represented in conversations that influence policy and access.",
    detail:
      "That perspective matters in an industry where consolidation can narrow choices. Artisan shows up to keep independence visible, credible, and part of the larger policy conversation.",
  },
  {
    id: "industry-leadership",
    eyebrow: "Industry Leadership",
    title: "Thought leadership from the lab side of independent care.",
    image: "/images/panel-discussion-2025-1.jpg",
    imageAlt: "Brandon Butler leading an optical industry panel",
    imageClassName: "object-cover object-top",
    body:
      "Panels, forums, and industry events give Artisan a platform to speak plainly about the realities facing labs and practices. That visibility helps move the conversation from generic growth language toward the operating decisions that actually protect independence.",
    detail:
      "The result is a leadership posture rooted in real production, customer service, ownership alignment, and the daily work of helping practices compete.",
  },
];

const communityImpactCards = [
  {
    title: "Jails to Jobs",
    eyebrow: "Second Chance Employment",
    image: "/logos/jails2jobs.jpeg",
    imageAlt: "Jails to Jobs",
    body: "Pacific Artisan Labs has been recognized as a second-chance employer, creating hiring opportunities that help people rebuild through meaningful work.",
    href: "https://jailstojobs.org/resources/second-chance-employers-network/pacific-artisan-labs/",
    cta: "Read the Profile",
    logo: true,
  },
  {
    title: "Training Pathways",
    eyebrow: "Workforce Development",
    image: "/images/about/coffee-creek.jpg",
    imageAlt: "Coffee Creek program training and workforce development",
    body: "Artisan supports practical training, respectful mentorship, and skill-building pathways that create stronger teams and more resilient communities.",
  },
  {
    title: "Local Visibility",
    eyebrow: "Community Engagement",
    image: "/images/race-car-driver-unknown-year-1.jpg",
    imageAlt: "Pike Artisan Labs sponsored race car",
    body: "Our labs show up locally through community relationships, regional events, and visibility that keeps independent optical connected to the people it serves.",
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
            <EmbeddedTypeform
              formId="m0lQ9zjD"
              formName="general_contact"
              className="min-h-0 flex-1 bg-[#f5f1eb]"
              title="Contact Artisan Lab Network"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AboutPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [disableTimelineEffects, setDisableTimelineEffects] = useState(false);

  useEffect(() => {
    const isSafari =
      /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(window.navigator.userAgent);

    const syncHashState = () => {
      const hash = window.location.hash.toLowerCase();
      setDisableTimelineEffects(isSafari || Boolean(hash && hash !== "#timeline"));

      if (!hash) return;
      const target = document.querySelector(hash);
      if (!target) return;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: "auto", block: "start" });
        });
      });
    };

    syncHashState();
    window.addEventListener("hashchange", syncHashState);
    return () => window.removeEventListener("hashchange", syncHashState);
  }, []);

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

      <section
        aria-label="About page navigation"
        data-theme="light"
        className="sticky top-[72px] z-40 border-y border-[#d8c6a8]/45 bg-[#f8f3eb]/92 px-6 py-4 backdrop-blur-md md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-7 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {aboutJumpLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 border-b border-transparent py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#625b53] transition hover:border-[#8a7654] hover:text-[#1f1a17]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="our-labs"
        data-theme="light"
        className="scroll-mt-24 bg-[#f2eee7] px-6 py-24 md:px-10"
      >
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
              Through <Link href="/pacific-artisan-labs" className="font-semibold text-[#1f1a17] underline decoration-[#c9b28b] underline-offset-4">Pacific Artisan Labs</Link>,{" "}
              <Link href="/peak-artisan-labs" className="font-semibold text-[#1f1a17] underline decoration-[#c9b28b] underline-offset-4">Peak Artisan Labs</Link>, and{" "}
              <Link href="/pike-artisan-labs" className="font-semibold text-[#1f1a17] underline decoration-[#c9b28b] underline-offset-4">Pike Artisan Labs</Link>, we have built a national platform that aligns laboratories
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

      <section
        id="leadership"
        data-theme="light"
        className="scroll-mt-24 bg-[#eee5d7] px-6 py-18 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {leaders.map((leader) => (
              <article
                key={leader.name}
                className="flex min-h-full flex-col overflow-hidden rounded-[22px] border border-black/10 bg-[#fbf8f2] shadow-[0_18px_48px_rgba(49,39,26,0.09)]"
              >
                <div className="relative aspect-[5/4] bg-[#ded2c1]">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-2xl font-semibold">{leader.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7656]">
                    {leader.role}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-7 text-black/62">
                    {leader.bio}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href={leader.email} className="rounded-full bg-[#1f1a17] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                      Email
                    </a>
                    <a href={leader.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-[#1f1a17] transition hover:bg-white">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      <ImmersiveTimeline disableDesktopScrollEffects={disableTimelineEffects} />

      <section
        data-theme="light"
        className="relative overflow-hidden bg-[#ece7dc] px-6 py-20 md:px-10 md:py-24"
      >
        <RingsAccent position="center-right" size="md" opacity="opacity-[0.04]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8a7654]">
              Credibility
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
              Leadership with a visible role in the industry.
            </h2>
          </div>

          <div className="mt-12 grid gap-8">
            {editorialSections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 overflow-hidden rounded-[30px] border border-[#d6c3a1]/70 bg-[#fbf8f2] shadow-[0_24px_64px_rgba(49,39,26,0.10)]"
              >
                <div className={`grid gap-0 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                  <div className="relative min-h-[320px] lg:min-h-[430px]">
                    <Image
                      src={section.image}
                      alt={section.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className={section.imageClassName ?? "object-cover"}
                    />
                    {section.caption ? (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent px-5 pb-5 pt-14">
                        <p className="text-sm font-medium leading-6 text-white/86">
                          {section.caption}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center p-7 md:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8a7654]">
                      {section.eyebrow}
                    </p>
                    <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#1f1a17] md:text-4xl">
                      {section.title}
                    </h3>
                    <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">
                      {section.body}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-[#75664e]">
                      {section.detail}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="community-involvement"
        data-theme="light"
        className="relative scroll-mt-24 overflow-hidden bg-[#f5f1eb] px-6 py-20 md:px-10 md:py-24"
      >
        <RingsAccent position="bottom-left" size="md" opacity="opacity-[0.04]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                Community Involvement
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
                Showing up beyond the lab floor.
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#625b53]">
              Artisan&apos;s community work is rooted in practical opportunity, workforce development, and local relationships. These commitments are distinct from production, but connected to the same belief: people and independent businesses deserve a stronger path forward.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {communityImpactCards.map((card) => (
              <article
                key={card.title}
                className="flex min-h-full flex-col overflow-hidden rounded-[28px] border border-[#d6c3a1]/70 bg-[#fbf8f2] shadow-[0_18px_48px_rgba(49,39,26,0.09)]"
              >
                <div className="relative flex h-60 items-center justify-center bg-white">
                  {card.logo ? (
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      width={300}
                      height={170}
                      className="max-h-36 w-auto max-w-[82%] object-contain"
                    />
                  ) : (
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#1f1a17]">
                    {card.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-[#625b53]">
                    {card.body}
                  </p>
                  {card.href ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex w-fit rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d4c09a] hover:text-[#1f1a17]"
                    >
                      {card.cta}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="press-releases" data-theme="light" className="scroll-mt-24 bg-[#f2eee7] px-6 py-24 text-[#1f1a17] md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-black/45">
              Press / News
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Artisan in the News and Press Releases
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-black/65">
              News, announcements, and milestones from Artisan Lab Network and our labs.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pressArticles.map((article) => (
              <a key={article.title} href={article.href} target="_blank" rel="noreferrer" className="group flex min-h-[360px] flex-col rounded-[24px] border border-black/10 bg-white/78 p-6 text-left shadow-[0_18px_45px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_26px_65px_rgba(49,39,26,0.13)]">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-[#d6c3a1]/70 bg-[#f2eee7] text-xs font-bold tracking-[0.18em] text-[#7b6647]">
                    {article.source === "Jails to Jobs" ? "JJ" : "VM"}
                  </div>
                  <div className="text-xs uppercase tracking-[0.22em] text-black/42">
                    {article.source} / {article.date}
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-snug">{article.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-black/62">{article.body}</p>
                <div className="mt-6 text-sm font-semibold text-[#8b7656] transition group-hover:text-black">
                  Read Article
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
    </main>
  );
}
