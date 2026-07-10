import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Droplets, Moon, ShieldCheck, Sparkles, SunMedium, Waves } from "lucide-react";
import { arComparisonRows, arTreatments, type ArTreatment } from "./arData";

export const metadata = {
  title: "Anti-Reflective Coatings | Artisan Lab Network",
  description:
    "Overview of Artisan AR and TechShield anti-reflective coating resources for practice teams.",
};

export default function ArtisanArPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-24 text-[#1f1a17] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
          Product Resources
        </p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
          Anti-Reflective Coatings
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[#625b53] md:text-xl">
          Use this page before training staff on AR recommendations. Artisan AR
          gives your team a clear good-better-best path across our in-house,
          ultra premium portfolio spanning nighttime optics, ultra premium
          durability, blue light performance, and premium everyday
          anti-reflectance.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-[8px] border border-[#d8c6a8] bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1a17] text-[#d4c09a]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Artisan AR</h2>
            <p className="mt-3 text-sm leading-7 text-[#625b53]">
              Use Artisan AR when recommending a complete Artisan lens system.
              Match the treatment to the patient conversation: nighttime
              driving, extreme durability, blue light needs, premium clarity,
              glare sensitivity, and visual comfort. These are our in-house,
              ultra premium coating options.
            </p>
          </article>
          <article className="rounded-[8px] border border-[#d8c6a8] bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1a17] text-[#d4c09a]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">TechShield AR</h2>
            <p className="mt-3 text-sm leading-7 text-[#625b53]">
              Use TechShield resources when the practice orders Unity products or
              needs plan-friendly AR guidance. Review the TechShield guide before
              launching Unity-heavy or VSP-heavy ordering.
            </p>
            <a
              href="/files/TechShield_AR_Coatings_Sales_Sheet_2023.pdf"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8c6a8] px-4 text-sm font-semibold transition hover:bg-[#fbf8f3]"
            >
              Download TechShield Guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {arTreatments.map((treatment) => (
            <article key={treatment.slug} className="rounded-[8px] border border-[#d8c6a8] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <Image src={treatment.logo} alt={treatment.name} width={180} height={80} className="h-12 w-auto object-contain" />
                <TreatmentIcon treatment={treatment} />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">{treatment.name}</h2>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                {treatment.warranty}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#625b53]">{treatment.overview}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[#625b53]">
                {treatment.useCases.slice(0, 2).map((useCase) => (
                  <li key={useCase} className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#8a7654]" aria-hidden="true" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/artisan-ar/${treatment.slug}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1f1a17] px-4 text-sm font-semibold text-white transition hover:bg-[#d4c09a] hover:text-[#171311]"
              >
                View Treatment
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[8px] border border-[#d8c6a8] bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                Comparison Guide
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Artisan AR class crosswalk</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#625b53]">
              Each Artisan coating carries a 2 year warranty. Use this chart to
              place the Artisan portfolio beside familiar premium AR options.
            </p>
          </div>
          <div className="mobile-scroll-row mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#d8c6a8] text-xs uppercase tracking-[0.16em] text-[#8a7654]">
                  <th className="py-3 pr-4 font-semibold">Artisan treatment</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="py-3 pl-4 font-semibold">Comparable products</th>
                </tr>
              </thead>
              <tbody>
                {arComparisonRows.map((row) => (
                  <tr key={row.artisan} className="border-b border-[#eadfce] last:border-0">
                    <th className="py-4 pr-4 text-base font-semibold text-[#1f1a17]">{row.artisan}</th>
                    <td className="px-4 py-4 text-[#625b53]">{row.positioning}</td>
                    <td className="py-4 pl-4">
                      <div className="flex flex-wrap gap-2">
                        {row.peers.map((peer) => (
                          <span key={peer} className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-3 py-1.5 text-[#3d352c]">
                            <BadgeCheck className="h-3.5 w-3.5 text-[#8a7654]" aria-hidden="true" />
                            {peer}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function TreatmentIcon({ treatment }: { treatment: ArTreatment }) {
  const className = "h-5 w-5";
  const icons = {
    moon: <Moon className={className} aria-hidden="true" />,
    shield: <ShieldCheck className={className} aria-hidden="true" />,
    blue: <Waves className={className} aria-hidden="true" />,
    emerald: <Droplets className={className} aria-hidden="true" />,
  };

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] text-[#8a7654]">
      {icons[treatment.icon] ?? <SunMedium className={className} aria-hidden="true" />}
    </div>
  );
}
