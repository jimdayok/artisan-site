import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FORM_URL = "https://form.typeform.com/to/WCU5ReWQ";

const programSteps = [
  {
    title: "Onboarding",
    body: "A practical launch path helps your team understand ordering, service expectations, product options, and the fastest way to get work moving.",
  },
  {
    title: "Rebate structure",
    body: "Invited Acquios practices can request access to the Best Foot Forward Program, including a 30% rebate for the first 90 days when eligible.",
  },
  {
    title: "Support",
    body: "Artisan helps practices evaluate product strategy, workflow fit, and account needs with clear communication from the start.",
  },
];

export default function AcquiosPartnersPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={FORM_URL} />

      <section className="relative isolate overflow-hidden bg-[#171311] px-6 pb-20 pt-32 text-white md:px-10 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-35 md:bg-fixed"
          style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,12,0.96),rgba(18,14,12,0.78)_55%,rgba(18,14,12,0.48))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Acquios Partners
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Built for Acquios Practices Ready to Win Faster
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-2xl md:leading-10">
              Unlock better margins, stronger control, and real lab partnership.
            </p>
            <a
              href={FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex min-h-12 items-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
            >
              Request Your Acquios Lab Offer
            </a>
          </div>
          <div className="rounded-[30px] border border-[#d4c09a]/45 bg-[linear-gradient(145deg,rgba(212,192,154,0.22),rgba(255,255,255,0.05))] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
            <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-8 text-center backdrop-blur">
              <Image
                src="/logos/acquios-alliance.png"
                alt="Acquios Alliance"
                width={460}
                height={180}
                priority
                className="mx-auto max-h-[120px] w-auto max-w-[360px] object-contain"
              />
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                Best Foot Forward Program
              </p>
              <div className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
                30%
              </div>
              <p className="mt-3 text-xl font-semibold text-white">
                Rebate for First 90 Days
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8564]">
              Best Foot Forward Program
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              A cleaner way to test a stronger lab relationship.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">
              The program is designed to help qualified Acquios practices start with confidence, evaluate Artisan service, and protect profitability during the transition.
            </p>
          </div>
          <div className="grid gap-4">
            {programSteps.map((step, index) => (
              <article
                key={step.title}
                className="group rounded-[26px] border border-[#d8c6a8]/65 bg-white p-6 shadow-[0_18px_54px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:border-[#d4c09a] hover:shadow-[0_24px_66px_rgba(49,39,26,0.13)]"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d4c09a] bg-[#fbf8f3] text-sm font-semibold text-[#8a7654]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl font-semibold text-[#1f1a17]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#625b53]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#171311] px-6 py-20 text-center text-white md:px-10">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-20 md:bg-fixed"
          style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-black/72" />
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
          Program Access
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Move faster with a lab partner built for independent practices.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
          Request access and Artisan will help determine the right next step for your practice.
        </p>
        <a
          href={FORM_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
        >
          Request Your Acquios Lab Offer
        </a>
        <a
          href="mailto:sales@artisanlabnetwork.com?subject=Acquios%20Lab%20Offer"
          className="ml-0 mt-4 inline-flex min-h-12 items-center rounded-full border border-white/15 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15 sm:ml-3"
        >
          Talk to Our Team
        </a>
      </section>

      <div className="sticky bottom-0 z-40 border-t border-[#d4c09a]/35 bg-[#171311]/92 px-4 py-3 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="text-sm font-semibold">Acquios practice? Start with Artisan.</span>
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
