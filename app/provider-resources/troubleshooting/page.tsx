import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SiteIcon from "../../components/SiteIcon";
import { troubleshootingGuides } from "./content";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

export const metadata: Metadata = {
  title: "Troubleshooting & Best Practices | Artisan Lab Network",
  description:
    "Use Artisan Lab Network troubleshooting guides for common lens, frame, fit, measurement, material, and lab workflow questions.",
  alternates: {
    canonical: "/provider-resources/troubleshooting",
  },
};

export default function TroubleshootingIndexPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header />
      <section className="relative overflow-hidden border-b border-[#e6d9c8] px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,178,139,0.22),transparent_30%),linear-gradient(180deg,#f7f2ea_0%,#f5f1eb_100%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <Link
            href="/provider-resources#troubleshooting-best-practices"
            className="text-sm font-semibold text-[#75664e] underline decoration-[#c9b28b] underline-offset-4"
          >
            ← Back to Provider Resources
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
            Troubleshooting & Best Practices
          </p>
          <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Practical guides for common lab and lens questions.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#625b53] md:text-2xl md:leading-10">
            Use these first-pass workflows to verify fit, measurements, materials, and patient needs before requesting lab review.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {troubleshootingGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/provider-resources/troubleshooting/${guide.slug}`}
              className="group rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(24,18,13,0.06)] transition hover:-translate-y-1 hover:border-[#c9b28b] hover:shadow-[0_24px_56px_rgba(24,18,13,0.12)]"
            >
              <SiteIcon
                src="/icons/site/wrench.svg"
                size="sm"
                className="h-11 w-11 border-[#e1d4c2] bg-[#fbf8f3]"
              />
              <h2 className="mt-6 text-2xl font-semibold leading-tight text-[#1f1a17]">
                {guide.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#625b53]">
                {guide.summary}
              </p>
              <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#1f1a17] transition group-hover:border-[#c9b28b] group-hover:bg-[#f0e5d5]">
                Read Guide <span className="text-[#8a7654]">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}
