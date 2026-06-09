import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { arTreatments } from "./arData";

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
          covers the Artisan treatment portfolio, while TechShield supports
          Unity and VSP-aligned workflows.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-[8px] border border-[#d8c6a8] bg-white p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Artisan AR</h2>
            <p className="mt-3 text-sm leading-7 text-[#625b53]">
              Use Artisan AR when recommending a complete Artisan lens system.
              Match the treatment to the patient conversation: everyday
              durability, premium clarity, glare sensitivity, and visual comfort.
            </p>
          </article>
          <article className="rounded-[8px] border border-[#d8c6a8] bg-white p-6">
            <h2 className="text-2xl font-semibold tracking-tight">TechShield AR</h2>
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
              <Image src={treatment.logo} alt={treatment.name} width={180} height={80} className="h-12 w-auto object-contain" />
              <h2 className="mt-5 text-xl font-semibold tracking-tight">{treatment.name}</h2>
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

        <section className="mt-8 rounded-[8px] border border-dashed border-[#d8c6a8] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Coming Soon</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">AR Comparison Guide</h2>
          <p className="mt-3 text-sm leading-7 text-[#625b53]">
            A downloadable AR comparison guide can be added here when the final
            file is published.
          </p>
        </section>
      </div>
    </main>
  );
}
