import Image from "next/image";
import type { Metadata } from "next";
import NewsletterShell from "../components/newsletter/NewsletterShell";

export const metadata: Metadata = {
  title: "Practice Matters Newsletter | Artisan Lab Network",
  description:
    "Practice Matters is Artisan Lab Network's publication for independent eye care practices, featuring current issues and upcoming editorial themes.",
};

const issueUrl = "/newsletters/practice-matters/issue-001";

const upcomingIssues = [
  {
    label: "Issue 002",
    title: "Product conversations that build confidence",
    description:
      "Practical ways to help teams connect premium lens choices to patient needs without making the conversation feel forced.",
  },
  {
    label: "Issue 003",
    title: "Service, turnaround, and the practice experience",
    description:
      "A closer look at the lab behaviors that help practices protect trust at the dispensing table.",
  },
  {
    label: "Issue 004",
    title: "Training notes for independent optical teams",
    description:
      "Short, usable education pieces for opticians who want clearer language, stronger recommendations, and better patient conversations.",
  },
];

export default function NewsletterPage() {
  return (
    <NewsletterShell>
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
                Artisan Lab Network Publication
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-[#142033] md:text-7xl">
                Practice Matters
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-[#364150]">
                What&apos;s happening. What&apos;s changing. What matters to independent eye care.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#4c5563]">
                Practice Matters is Artisan Lab Network&apos;s editorial home for the people, products,
                ideas, and updates helping independent practices stay informed and in control.
              </p>
            </div>

            <div className="rounded-[34px] border border-[#dfd2bf] bg-[#fbf7ef]/92 p-7 shadow-[0_24px_70px_rgba(20,32,51,0.10)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#dfd2bf] bg-white">
                  <Image src="/aln-icon.png" alt="" width={34} height={34} className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                    Current Issue
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#142033]">
                    Issue 001
                  </h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-[#4c5563]">
                Meet Jenn C., explore Chemistrie and Unity V3 opportunities, revisit what independence
                makes possible, and review the Tokai 1.76 availability update.
              </p>
              <a
                href={issueUrl}
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#142033] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(20,32,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033]"
              >
                Read Issue 001
              </a>
            </div>
          </div>

          <div className="mt-14 rounded-[36px] border border-[#dfd2bf] bg-white/86 p-5 shadow-[0_24px_70px_rgba(20,32,51,0.08)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="overflow-hidden rounded-[28px] bg-[#122033]">
                <Image
                  src="/newsletter-assets/jennc.jpg"
                  alt="Artisan Lab Network team spotlight"
                  width={900}
                  height={640}
                  className="aspect-[4/3] h-full w-full object-cover opacity-[0.88]"
                  priority
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                  Featured Now
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#142033] md:text-5xl">
                  Issue 001 is live.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#4c5563]">
                  The first issue introduces the rhythm of Practice Matters: useful product context,
                  practical practice support, important availability updates, and a closer look at the
                  people behind the Artisan experience.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={issueUrl}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#142033] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033]"
                  >
                    Open Current Issue
                  </a>
                  <a
                    href={`${issueUrl}#tokai-update`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7c5a8] bg-[#fbf7ef] px-5 py-2.5 text-sm font-semibold text-[#142033] transition hover:-translate-y-0.5 hover:border-[#c7ad7b] hover:bg-white"
                  >
                    Read Tokai Update
                  </a>
                </div>
              </div>
            </div>
          </div>

          <section id="upcoming" className="mt-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                  Coming Next
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#142033] md:text-4xl">
                  Upcoming issues
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#4c5563]">
                Future editions will continue to focus on usable ideas, product education, and the
                operating details that help independent practices make confident choices.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {upcomingIssues.map((issue) => (
                <article
                  key={issue.label}
                  className="rounded-[28px] border border-[#dfd2bf] bg-[#fbf7ef]/88 p-6 shadow-[0_18px_46px_rgba(20,32,51,0.07)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                    {issue.label}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-7 text-[#142033]">
                    {issue.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#4c5563]">
                    {issue.description}
                  </p>
                  <span className="mt-6 inline-flex rounded-full border border-[#dfd2bf] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                    In development
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </NewsletterShell>
  );
}
