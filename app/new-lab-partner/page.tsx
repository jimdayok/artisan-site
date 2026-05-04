import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FORM_URL = "https://form.typeform.com/to/WCU5ReWQ#program_code=LABPARTNER";

const stats = [
  { value: "3.5 Days", label: "Average Turnaround" },
  { value: "84%", label: "Orders Shipped by Day 4" },
  { value: "98.5%", label: "Satisfaction Rate" },
  { value: "1.5%", label: "Lab Error Rate" },
];

const sections = [
  {
    eyebrow: "Why switch",
    title: "A lab relationship should make your practice faster, not boxed in.",
    body: "Independent practices need speed, clarity, and options. Artisan gives practices a better path when the current lab relationship has become too slow, too rigid, or too hard to manage.",
  },
  {
    eyebrow: "What makes ALN different",
    title: "Independent partnership with real operating support.",
    body: "Artisan Lab Network is built around responsive communication, broad product access, and practical help from people who understand how independent practices work.",
  },
  {
    eyebrow: "Speed and service proof",
    title: "Performance you can measure.",
    body: "Turnaround, shipping consistency, satisfaction, and error reduction all matter. The goal is simple: help your team trust the lab relationship again.",
  },
  {
    eyebrow: "Product freedom",
    title: "More ways to serve patients without narrowing the conversation.",
    body: "Send the work that fits your practice: single vision, progressives, specialty products, AR treatments, and brand portfolios that support your dispensing strategy.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  body,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${dark ? "text-[#d4c09a]" : "text-[#9a8564]"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl ${dark ? "text-white" : "text-[#1f1a17]"}`}>
        {title}
      </h2>
      <p className={`mt-5 text-base leading-8 md:text-lg ${dark ? "text-white/72" : "text-[#625b53]"}`}>
        {body}
      </p>
    </div>
  );
}

export default function NewLabPartnerPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={FORM_URL} />

      <section className="relative isolate overflow-hidden bg-[#171311] px-6 pb-20 pt-32 text-white md:px-10 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-35 md:bg-fixed"
          style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,12,0.95),rgba(18,14,12,0.78)_54%,rgba(18,14,12,0.45))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              New Lab Partner
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Take Control of Your Lab Relationship
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-2xl md:leading-10">
              Built for independent practices that want speed, control, and better outcomes.
            </p>
            <a
              href={FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex min-h-12 items-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
            >
              Start the Conversation
            </a>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.06] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <Image
              src="/images/factory-machine-room-2023-1.jpg"
              alt="Optical lab production room"
              width={1200}
              height={900}
              priority
              className="aspect-[4/3] w-full rounded-[20px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8c6a8]/45 bg-[#fbf8f3] px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-[#d8c6a8]/65 bg-white p-6 text-center shadow-[0_18px_46px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(49,39,26,0.12)]"
            >
              <div className="text-4xl font-semibold tracking-tight text-[#1f1a17] md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {sections.map((section, index) => (
        <section
          key={section.eyebrow}
          className={`px-6 py-20 md:px-10 md:py-24 ${
            index % 2 === 0 ? "bg-[#f5f1eb]" : "bg-[#171311] text-white"
          }`}
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <SectionHeading {...section} dark={index % 2 === 1} />
            <div
              className={`rounded-[28px] border p-8 shadow-[0_24px_70px_rgba(49,39,26,0.1)] ${
                index % 2 === 0
                  ? "border-[#d8c6a8]/60 bg-white"
                  : "border-white/12 bg-white/[0.06]"
              }`}
            >
              <div className="h-px w-20 bg-[#d4c09a]" />
              <p className={`mt-7 text-2xl font-semibold leading-snug md:text-3xl ${index % 2 === 0 ? "text-[#1f1a17]" : "text-white"}`}>
                Better lab relationships are built through speed, accountability, product freedom, and people who answer when the work matters.
              </p>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["Problem", "Corporate restrictions, multinational ownership, slower service, and limited choice can make independent practices feel boxed in."],
            ["Promise", "ALN preserves independence with a doctor-owned network, U.S. production focus, and better service without corporate restrictions."],
            ["Proof", "3.5 day average turnaround, 84% shipped by day 4, 98.5% satisfaction, and a 1.5% lab error rate."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-[26px] border border-[#d8c6a8]/65 bg-white p-6 shadow-[0_18px_54px_rgba(49,39,26,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">{title}</p>
              <p className="mt-4 text-lg font-semibold leading-8 text-[#1f1a17]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#171311] px-6 py-20 text-center text-white md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
          CTA
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Start the Conversation
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
          Tell us what your practice needs from a lab partner, and we will help you evaluate the best next step.
        </p>
        <a
          href={FORM_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
        >
          Request New Lab Partner Pricing
        </a>
        <a
          href="mailto:sales@artisanlabnetwork.com?subject=New%20Lab%20Partner%20Conversation"
          className="ml-0 mt-4 inline-flex min-h-12 items-center rounded-full border border-white/15 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15 sm:ml-3"
        >
          Talk to Our Team
        </a>
      </section>

      <div className="sticky bottom-0 z-40 border-t border-[#d4c09a]/35 bg-[#171311]/92 px-4 py-3 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="text-sm font-semibold">Ready for a better lab relationship?</span>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-[#d4c09a] px-4 py-2 text-xs font-semibold text-[#171311]"
          >
            Start
          </a>
        </div>
      </div>

      <Footer signUpHref={FORM_URL} />
    </main>
  );
}
