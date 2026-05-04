import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { arTreatments, getArTreatment } from "../arData";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

type ArPageProps = {
  params: Promise<{ treatment: string }>;
};

export function generateStaticParams() {
  return arTreatments.map((treatment) => ({ treatment: treatment.slug }));
}

export async function generateMetadata({ params }: ArPageProps): Promise<Metadata> {
  const { treatment } = await params;
  const ar = getArTreatment(treatment);

  return {
    title: ar ? `${ar.name} AR | Artisan Lab Network` : "Artisan AR",
  };
}

export default async function ArtisanArPage({ params }: ArPageProps) {
  const { treatment } = await params;
  const ar = getArTreatment(treatment);

  if (!ar) notFound();

  return (
    <main className="min-h-screen bg-[#171311] text-white">
      <Header signUpHref={SIGNUP_URL} />

      <section
        data-theme="dark"
        className="relative isolate overflow-hidden bg-cover bg-center bg-scroll px-6 pb-18 pt-32 md:bg-fixed md:px-10 md:pb-24 md:pt-40"
        style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-black/78" />
        <div className="pointer-events-none absolute left-[-12%] top-1/2 h-20 w-[125%] -translate-y-1/2 rotate-[-12deg] bg-[linear-gradient(90deg,transparent,rgba(212,192,154,0.0),rgba(212,192,154,0.22),rgba(255,255,255,0.24),rgba(212,192,154,0.12),transparent)] blur-xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              The Artisan AR Portfolio
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">
              {ar.headline}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-xl">
              {ar.overview}
            </p>
            <a
              href="mailto:sales@artisanlabnetwork.com?subject=Artisan%20AR%20Pricing%20Request"
              className="mt-8 inline-flex rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
            >
              Request Pricing
            </a>
          </div>

          <div className="relative rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)]" />
            <div className="flex min-h-56 items-center justify-center rounded-[24px] border border-white/10 bg-[#fbf8f3] p-7">
              <Image
                src={ar.logo}
                alt={ar.name}
                width={460}
                height={180}
                priority
                className="max-h-[130px] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#fbf8f3] px-6 py-20 text-[#201a16] md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              Visual Clarity
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              A cleaner lens experience for everyday life.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#62584d]">
              Artisan AR treatments are built to help practices recommend lenses
              with confidence: clear presentation, dependable performance, and a
              premium optical experience patients can understand.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ar.benefits.map((benefit) => (
              <article
                key={benefit}
                className="rounded-[24px] border border-[#e1d4c2] bg-white p-6 shadow-[0_18px_48px_rgba(49,39,26,0.08)]"
              >
                <div className="h-1.5 w-12 rounded-full bg-[#d4c09a]" />
                <h3 className="mt-5 text-xl font-semibold">{benefit}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#171311] px-6 py-20 md:px-10 md:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(212,192,154,0.7),transparent)]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/12 bg-white/[0.06] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4c09a]">
              Durability and Comfort
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Designed for real patient wear.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              Each Artisan AR option gives practices a clear recommendation path
              for patients who expect lenses to look good, feel comfortable, and
              hold up in daily use.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/12 bg-white/[0.06] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4c09a]">
              Best Fit
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/72">
              {ar.useCases.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4c09a]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f5f1eb] px-6 py-16 text-center text-[#201a16] md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-[#e1d4c2] bg-white p-8 shadow-[0_28px_70px_rgba(49,39,26,0.1)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Available Through Artisan
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Request pricing or contact the lab.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#62584d] md:text-lg">
            Talk with Artisan about where {ar.name} fits in your product strategy
            and how to present the AR portfolio to patients.
          </p>
          <a
            href="mailto:sales@artisanlabnetwork.com?subject=Artisan%20AR%20Pricing%20Request"
            className="mt-8 inline-flex rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#d4c09a] hover:text-[#171311]"
          >
            Request Pricing
          </a>
        </div>
      </section>

      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}
