import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getTroubleshootingGuide, troubleshootingGuides } from "../content";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

export function generateStaticParams() {
  return troubleshootingGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getTroubleshootingGuide(slug);

  if (!guide) {
    return {
      title: "Troubleshooting Guide | Artisan Lab Network",
      description:
        "Review Artisan Lab Network troubleshooting and best-practice guidance for provider teams.",
    };
  }

  return {
    title: `${guide.title} | Artisan Lab Network`,
    description: guide.summary,
    alternates: {
      canonical: `/provider-resources/troubleshooting/${guide.slug}`,
    },
  };
}

export default async function TroubleshootingGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getTroubleshootingGuide(slug);

  if (!guide) notFound();

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header />
      <section className="relative overflow-hidden border-b border-[#e6d9c8] px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,178,139,0.22),transparent_30%),linear-gradient(180deg,#f7f2ea_0%,#f5f1eb_100%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <Link
            href="/provider-resources#troubleshooting-best-practices"
            className="text-sm font-semibold text-[#75664e] underline decoration-[#c9b28b] underline-offset-4"
          >
            ← Back to Provider Resources
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
            Troubleshooting & Best Practices
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            {guide.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#625b53] md:text-2xl md:leading-10">
            {guide.summary}
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="rounded-[28px] border border-[#e4d7c6] bg-white p-6 shadow-[0_16px_40px_rgba(24,18,13,0.06)] lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              Guide Sections
            </p>
            <nav className="mt-5 grid gap-3 text-sm font-semibold text-[#1f1a17]">
              {["Symptoms", "Common Causes", "Recommended Actions", "When to Contact the Lab", "Best Practices"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                  className="rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-4 py-2.5 transition hover:border-[#c9b28b] hover:bg-[#f0e5d5]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-6">
            <GuideSection id="symptoms" title="Symptoms" items={guide.symptoms} />
            <GuideSection id="common-causes" title="Common Causes" items={guide.commonCauses} />
            <GuideSection id="recommended-actions" title="Recommended Actions" items={guide.recommendedActions} />
            <GuideSection id="when-to-contact-the-lab" title="When to Contact the Lab" items={guide.contactLab} />
            <GuideSection id="best-practices" title="Best Practices" items={guide.bestPractices} />
          </div>
        </div>
      </section>
      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}

function GuideSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: string[];
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(24,18,13,0.06)] md:p-8"
    >
      <h2 className="text-3xl font-semibold tracking-tight text-[#1f1a17]">
        {title}
      </h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-8 text-[#625b53]">
            <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#c9b28b]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
