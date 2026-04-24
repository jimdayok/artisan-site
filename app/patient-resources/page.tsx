"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

const practices = [
  {
    name: "Sample Eye Care",
    address: "123 Main St, Dallas, TX 75001",
    phone: "214-555-1234",
    state: "TX",
  },
  {
    name: "Vision Center Example",
    address: "456 Oak Ave, Denver, CO 80014",
    phone: "303-555-5678",
    state: "CO",
  },
  {
    name: "Pacific Artisan Partner Practice",
    address: "12302 NE Marx St, Portland, OR 97230",
    phone: "877-390-6900",
    state: "OR",
  },
];

const concerns = [
  {
    icon: "GL",
    title: "Tired of glare while driving at night?",
    description: "Light scatter can make headlights feel sharp, hazy, and distracting.",
  },
  {
    icon: "SC",
    title: "Eye strain from screens all day?",
    description: "Modern work asks your eyes to shift focus for hours at a time.",
  },
  {
    icon: "TH",
    title: "Thick, heavy glasses that don't look right?",
    description: "The right lens material can change both comfort and appearance.",
  },
];

const lensCards = [
  {
    eyebrow: "Progressives",
    title: "See Near and Far Without Lines",
    description:
      "Progressive lenses allow you to see clearly at all distances without visible lines.",
  },
  {
    eyebrow: "Clarity",
    title: "Reduce Glare and Improve Clarity",
    description:
      "Anti-reflective coatings allow more light through your lenses and reduce glare, especially at night.",
    source: "American Optometric Association",
  },
  {
    eyebrow: "Materials",
    title: "Why Lens Material Matters",
    description:
      "High-index materials bend light more efficiently, creating thinner and lighter lenses.",
  },
];

const trustedResources = [
  {
    group: "Understanding Your Vision",
    href: "https://www.aoa.org/healthy-eyes/eye-and-vision-conditions/myopia",
    title: "Myopia and Vision Correction",
    description:
      "Explains how vision problems are corrected using lenses, including multifocal options.",
    source: "American Optometric Association",
  },
  {
    group: "Choosing the Right Glasses",
    href: "https://www.aoa.org/news/clinical-eye-care/health-and-wellness/protecting-patients-eye-summer",
    title: "Lens Protection and Glare Reduction",
    description:
      "Covers lens protection, glare reduction, UV protection, and why lens choices matter.",
    source: "American Optometric Association",
  },
  {
    group: "Eye Health and Vision Care",
    href: "https://www.nei.nih.gov/learn-about-eye-health",
    title: "Learn About Eye Health",
    description:
      "Government-backed education on how vision works and how to protect it.",
    source: "National Eye Institute",
  },
];

function SectionIntro({
  eyebrow,
  title,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a97548]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#221915] md:text-5xl">
        {title}
      </h2>
      {children ? (
        <div className="mt-5 text-lg leading-8 text-[#5d4c42]">{children}</div>
      ) : null}
    </div>
  );
}

export default function PatientResources() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const states = useMemo(
    () => Array.from(new Set(practices.map((practice) => practice.state))).sort(),
    []
  );

  const filtered = practices.filter((practice) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      practice.name.toLowerCase().includes(query) ||
      practice.address.toLowerCase().includes(query) ||
      practice.state.toLowerCase().includes(query);

    const matchesState = stateFilter === "" || practice.state === stateFilter;

    return matchesSearch && matchesState;
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1e8] text-[#221915]">
      <Header />

      {/* 1. HERO SECTION */}
      <section
        id="top"
        data-theme="dark"
        className="relative flex min-h-[760px] items-center justify-center overflow-hidden px-6 pt-24 text-center text-white md:min-h-screen"
      >
        <Image
          src="/ladybackground.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.38)_48%,rgba(0,0,0,0.74)_100%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
            Patient Vision Resources
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
            See Better. Feel Better. Choose Independent.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/82 md:text-xl">
            Premium lenses and independent doctors working together to give you
            clearer, more comfortable vision.
          </p>
          <a
            href="#find-a-practice"
            className="mt-9 inline-flex items-center justify-center rounded-full bg-[#d4c09a] px-7 py-4 text-sm font-semibold text-[#211711] shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e4cfa6]"
          >
            Find a Doctor Near You
          </a>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section data-theme="light" className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Everyday Friction" title="Struggling With Your Vision?" align="center">
            <p>
              Clear vision should feel easy. If your glasses make normal moments
              harder, the answer may be better lens design, materials, or coatings.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {concerns.map((concern) => (
              <div
                key={concern.title}
                className="group rounded-[28px] border border-[#d9c8ac] bg-white/72 p-7 shadow-[0_18px_60px_rgba(73,48,28,0.10)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_70px_rgba(73,48,28,0.16)]"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#2a201c] text-sm font-semibold text-[#d4c09a] shadow-inner">
                  {concern.icon}
                </div>
                <h3 className="mt-7 text-2xl font-semibold leading-tight text-[#221915]">
                  {concern.title}
                </h3>
                <p className="mt-4 leading-7 text-[#6b594e]">{concern.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section data-theme="light" className="bg-[#efe4d3] px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[430px] overflow-hidden rounded-[32px] shadow-[0_30px_90px_rgba(73,48,28,0.22)]">
            <Image
              src="/backgroundwithglasses1.jpeg"
              alt="A warm independent eye care setting with eyewear on display"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
          <SectionIntro eyebrow="The Better Path" title="A Better Way to See">
            <p>
              Independent eye doctors have the freedom to recommend what's best
              for you, not what they are required to use. That means better
              lenses, better materials, and solutions designed for your life.
            </p>
            <p>
              The experience should feel personal: a doctor listening closely,
              an optician helping you choose confidently, and a lab crafting
              your lenses with care.
            </p>
          </SectionIntro>
        </div>
      </section>

      {/* 4. WHY INDEPENDENT EYE CARE */}
      <section data-theme="light" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Choice Matters" title="Why Independent Eye Care Feels Different" align="center">
            <p>
              The difference is not just where you buy glasses. It is who gets to
              decide what belongs in front of your eyes.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-[#c9b28b]/70 bg-[#2a201c] p-8 text-white shadow-[0_22px_70px_rgba(34,25,21,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
                Corporate Model
              </p>
              <h3 className="mt-4 text-3xl font-semibold">Built around the product</h3>
              <ul className="mt-8 space-y-4 text-white/76">
                {["Limited options", "One-size-fits-all lenses", "Product-driven recommendations"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d4c09a]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[30px] border border-[#d9c8ac] bg-white p-8 shadow-[0_22px_70px_rgba(73,48,28,0.13)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a97548]">
                Independent Care
              </p>
              <h3 className="mt-4 text-3xl font-semibold">Built around your vision</h3>
              <ul className="mt-8 space-y-4 text-[#5d4c42]">
                {["Personalized recommendations", "Premium lens options", "Focus on long-term comfort"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#a97548]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PREMIUM LENS SECTION */}
      <section data-theme="dark" className="bg-[#171311] px-6 py-24 text-white md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
              Tokai Feature
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Thinner. Lighter. Better Looking Lenses
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/72">
              Advanced materials like ultra-thin high-index lenses reduce
              thickness, weight, and improve how your glasses look and
              feel--especially for stronger prescriptions.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#f7f1e8] p-6 text-[#221915]">
                <div className="relative mx-auto h-52 w-full overflow-hidden">
                  <div className="absolute left-1/2 top-6 h-40 w-24 -translate-x-1/2 rounded-full border-[22px] border-[#8d7a69] bg-white/40 shadow-[inset_14px_0_24px_rgba(0,0,0,0.20)]" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d6657]">
                  Standard
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Thicker profile</h3>
              </div>
              <div className="rounded-[24px] bg-[#d4c09a] p-6 text-[#221915]">
                <div className="relative mx-auto h-52 w-full overflow-hidden">
                  <div className="absolute left-1/2 top-8 h-36 w-16 -translate-x-1/2 rounded-full border-[10px] border-[#51392b] bg-white/45 shadow-[inset_8px_0_18px_rgba(0,0,0,0.14)]" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f432f]">
                  High-Index
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Slimmer feel</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LENS EDUCATION */}
      <section data-theme="light" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Lens Basics" title="Understanding Your Lenses" align="center">
            <p>
              You do not need a technical manual to make a confident choice.
              Start with the benefits you can actually feel.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {lensCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[28px] border border-[#d9c8ac] bg-white p-7 shadow-[0_18px_60px_rgba(73,48,28,0.10)]"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#efe4d3] text-xs font-semibold uppercase tracking-[0.12em] text-[#8d5d38]">
                  {card.eyebrow.slice(0, 2)}
                </div>
                <h3 className="mt-7 text-2xl font-semibold leading-tight">{card.title}</h3>
                <p className="mt-4 leading-7 text-[#665449]">{card.description}</p>
                {card.source ? (
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#a97548]">
                    Source: {card.source}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY YOUR LENSES MATTER */}
      <section data-theme="light" className="bg-[#efe4d3] px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionIntro eyebrow="Craftsmanship" title="Not All Lenses Are Created Equal">
            <p>
              The quality of your lenses depends on how they are made. Precision
              manufacturing, advanced technology, and attention to detail all
              play a role in how clearly and comfortably you see.
            </p>
            <p>
              Behind every great pair of glasses is a chain of decisions:
              measurements, materials, surfacing, coating, inspection, and a lab
              team that treats clarity like craft.
            </p>
          </SectionIntro>
          <div className="relative min-h-[430px] overflow-hidden rounded-[32px] shadow-[0_30px_90px_rgba(73,48,28,0.22)]">
            <Image
              src="/artisanquality.jpeg"
              alt="Technician inspecting lenses in an optical lab"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 8. FIND A PRACTICE */}
      <section id="find-a-practice" data-theme="light" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Take Action" title="Find an Independent Eye Care Provider" align="center">
            <p>
              Search by city, ZIP, practice name, or state to find an
              independent provider connected to better lens choices.
            </p>
          </SectionIntro>

          <div className="mt-10 rounded-[32px] border border-[#d9c8ac] bg-white/82 p-5 shadow-[0_22px_75px_rgba(73,48,28,0.13)] md:p-7">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <label className="sr-only" htmlFor="practice-search">
                Search by city or ZIP
              </label>
              <input
                id="practice-search"
                value={search}
                placeholder="Search by city, ZIP, or practice name"
                className="min-h-[52px] w-full rounded-2xl border border-[#d9c8ac] bg-[#fbf7f0] px-4 text-base text-[#221915] outline-none transition placeholder:text-[#8d7a69] focus:border-[#a97548] focus:bg-white"
                onChange={(event) => setSearch(event.target.value)}
              />

              <label className="sr-only" htmlFor="state-filter">
                Filter by state
              </label>
              <select
                id="state-filter"
                value={stateFilter}
                className="min-h-[52px] rounded-2xl border border-[#d9c8ac] bg-[#fbf7f0] px-4 text-base text-[#221915] outline-none transition focus:border-[#a97548] focus:bg-white"
                onChange={(event) => setStateFilter(event.target.value)}
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              {filtered.map((practice) => (
                <article
                  key={practice.name}
                  className="rounded-[24px] border border-[#eadcc6] bg-white p-6 shadow-[0_12px_35px_rgba(73,48,28,0.08)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a97548]">
                    {practice.state}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{practice.name}</h3>
                  <p className="mt-3 min-h-12 leading-6 text-[#665449]">{practice.address}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={`tel:${practice.phone.replaceAll("-", "")}`}
                      className="inline-flex items-center justify-center rounded-full bg-[#221915] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3a2a22]"
                    >
                      Call
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(practice.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-[#d9c8ac] px-5 py-3 text-sm font-semibold text-[#221915] transition hover:-translate-y-0.5 hover:bg-[#f7f1e8]"
                    >
                      Get Directions
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-8 rounded-3xl bg-[#f7f1e8] p-8 text-center">
                <h3 className="text-2xl font-semibold">No matching practices yet</h3>
                <p className="mx-auto mt-3 max-w-xl text-[#665449]">
                  Try a nearby city or clear the state filter. Our network can
                  still help connect you with an independent provider.
                </p>
                <a
                  href={SIGNUP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#221915] transition hover:bg-[#e4cfa6]"
                >
                  Help Me Find a Provider
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 9. TRUSTED VISION RESOURCES */}
      <section data-theme="light" className="bg-[#efe4d3] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Trusted Sources" title="Trusted Vision Resources" align="center">
            <p>
              Want to learn more about your vision and your glasses? These
              trusted organizations provide clear, patient-friendly education to
              help you better understand your options.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {trustedResources.map((resource) => (
              <a
                key={resource.group}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[28px] border border-[#d9c8ac] bg-white p-7 shadow-[0_18px_60px_rgba(73,48,28,0.10)] transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(73,48,28,0.16)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a97548]">
                  {resource.group}
                </p>
                <h3 className="mt-4 text-2xl font-semibold leading-tight">
                  {resource.title}
                </h3>
                <p className="mt-4 leading-7 text-[#665449]">{resource.description}</p>
                <p className="mt-6 text-sm font-semibold text-[#221915]">
                  {resource.source} <span aria-hidden="true">-&gt;</span>
                </p>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-[#d9c8ac] bg-white/78 p-7 shadow-[0_18px_60px_rgba(73,48,28,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a97548]">
              About Eye Care Professionals
            </p>
            <h3 className="mt-4 text-2xl font-semibold">
              United Opticians Association and Opticians Association of America
            </h3>
            <p className="mt-4 max-w-3xl leading-7 text-[#665449]">
              These organizations support the professionals who design, craft,
              and fit your eyewear.
            </p>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section data-theme="dark" className="relative overflow-hidden px-6 py-28 text-center text-white md:py-36">
        <Image
          src="/glassesbackground.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/68" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <h2 className="text-5xl font-semibold tracking-tight md:text-7xl">
            Ready to See the Difference?
          </h2>
          <a
            href="#find-a-practice"
            className="mt-9 inline-flex items-center justify-center rounded-full bg-[#d4c09a] px-7 py-4 text-sm font-semibold text-[#211711] shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e4cfa6]"
          >
            Find a Practice
          </a>
        </div>
      </section>

      <Footer onContactClick={() => {}} signUpHref={SIGNUP_URL} />
    </main>
  );
}
