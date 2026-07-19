import type { Metadata } from "next";
import Link from "next/link";
import NewsletterArticleCard, {
  type NewsletterNavArticle,
} from "../../../components/newsletter/NewsletterArticleCard";
import NewsletterHero from "../../../components/newsletter/NewsletterHero";
import NewsletterNavigation from "../../../components/newsletter/NewsletterNavigation";
import NewsletterSection from "../../../components/newsletter/NewsletterSection";
import NewsletterShell from "../../../components/newsletter/NewsletterShell";

export const metadata: Metadata = {
  title: "Practice Matters | Issue 001 | Artisan Lab Network",
  description:
    "Practice Matters is Artisan Lab Network's newsletter for independent eye care practices, sharing people, products, updates, and ideas that support independent practice growth.",
};

const articles: NewsletterNavArticle[] = [
  {
    id: "artisan-spotlight",
    label: "Artisan Spotlight",
    title: "Jenn C.",
    dek: "Trust, follow through, and the small details behind a dependable lab experience.",
    icon: "/aln-icon.png",
    iconAlt: "Artisan Lab Network",
    number: "01",
  },
  {
    id: "new-and-now",
    label: "New and Now",
    title: "Chemistrie",
    dek: "A new way to support patient conversations around comfort, function, and daily needs.",
    icon: "/newsletter-assets/Chemistrie-Calm-Logo-2.avif",
    iconAlt: "Chemistrie Calm",
    number: "02",
  },
  {
    id: "unity-v3",
    label: "Lens Strategy",
    title: "Unity V3",
    dek: "A confident way to keep VSP orders focused on fit, function, and patient experience.",
    icon: "/unity-logo.png",
    iconAlt: "Unity",
    supportingLogo: "/logos/VSP_Vision_Logotype_RGB_Blk.png",
    supportingLogoAlt: "VSP Vision",
    number: "03",
  },
  {
    id: "fragments",
    label: "Fragments",
    title: "Independence",
    dek: "Why choice, flexibility, and control matter for independent practices and their patients.",
    icon: "/icons/site/handshake.svg",
    iconAlt: "",
    number: "04",
  },
  {
    id: "tokai-update",
    label: "Tokai Update",
    title: "Tokai",
    dek: "Current availability details and supported options while Tokai 1.76 is unavailable.",
    icon: "/tokai-logo.png",
    iconAlt: "Tokai",
    number: "05",
  },
];

export default function PracticeMattersIssue001Page() {
  return (
    <NewsletterShell>
      <NewsletterHero
        issueLabel="Issue 001"
        title="Practice Matters"
        subheading="What's happening. What's changing. What matters to independent eye care."
        intro="Independent practices deserve more than a supplier. They deserve a partner built around choice, service, and the belief that independent eye care should remain independent."
        publishedDate="July 2026"
        readTime="8 minute read"
      />

      <section className="w-full px-4 pb-14 md:px-8 md:pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[14px_3px_14px_3px] border border-[#d0bfa8] bg-[#fbf6ed] shadow-[0_16px_42px_rgba(73,55,37,0.08)]">
          <div className="grid gap-4 border-b border-[#d8c9b5] px-5 py-7 md:grid-cols-[0.7fr_1fr] md:items-end md:px-8 md:py-9">
            <div>
              <p className="font-[family-name:var(--font-alfons-script)] text-3xl text-[#a46f52]">Inside this issue</p>
              <h2 className="mt-2 font-[family-name:Georgia,serif] text-3xl font-normal tracking-tight text-[#122033] sm:text-4xl">
                Five stories worth your time.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#4d5664] md:justify-self-end">
              A fast issue map for the email reader who wants the full story, the context, and the next step.
            </p>
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-8 md:px-4">
            {articles.map((article) => (
              <NewsletterArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-6xl min-w-0 gap-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <NewsletterNavigation articles={articles} />
          </aside>

          <div className="min-w-0 space-y-8 md:space-y-12">
            <NewsletterSection
              id="artisan-spotlight"
              number="01"
              label="Artisan Spotlight"
              title="Artisan Spotlight: Jenn C."
              icon="/aln-icon.png"
              iconAlt="Artisan Lab Network"
              featureImage={{
                src: "/newsletter-assets/jennc.jpg",
                alt: "Jenn C. from Artisan Lab Network",
              }}
              pullQuote="Great lab experiences are built by people who notice the small things before they become big things."
              readNext={{ label: "New and Now", href: "#new-and-now" }}
            >
              <p>
                A practice rarely remembers the software behind a lab order. It remembers the person who called before a problem became a surprise, found the missing detail, and stayed with the question until there was a useful answer.
              </p>
              <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Dependability has a human face</h3>
              <p>
                Jenn C. is one of those people for Artisan Lab Network. Her work lives in the small moments that shape a practice&apos;s day: checking what does not look quite right, communicating clearly, and making sure a handoff does not become a dead end.
              </p>
              <p>
                That kind of ownership matters because an order is never just an order. On the other side is a patient waiting to see clearly, an optician protecting a promise, and a practice whose reputation is built one experience at a time. A detail caught early can protect all three.
              </p>
              <p>
                The strongest service relationships feel personal without depending on heroics. They are consistent. They make it easier to ask a question, easier to get an honest answer, and easier to know what happens next. Jenn helps create that kind of experience every day.
              </p>
              <div className="border-l-4 border-[#a46f52] bg-[#f2e7da] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a7654]">A useful service test</p>
                <p className="mt-2 text-base leading-7 text-[#3f4856]">When something changes, does your team know who owns the next step? Good service replaces uncertainty with a name, a plan, and a follow-through point.</p>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="new-and-now"
              number="02"
              label="New and Now"
              title="New and Now: Chemistrie Therapeutic Lenses"
              icon="/newsletter-assets/Chemistrie-Calm-Logo-2.avif"
              iconAlt="Chemistrie Calm"
              featureImage={{
                src: "/newsletter-assets/chemistriecalm.avif",
                alt: "Chemistrie Calm product visual",
              }}
              productLink={{
                label: "View Chemistrie Resources",
                href: "https://www.forecps.com/chemistrie-calm/",
              }}
              readNext={{ label: "Unity V3", href: "#unity-v3" }}
            >
              <p>
                The most useful lens conversation often begins after the acuity question: <em>When do your eyes stop feeling or performing the way you want them to?</em>
              </p>
              <p>
                Chemistrie Therapeutic Lenses give practices another way to explore comfort, function, and the environments a patient moves through every day. The product is not the opening line. The patient&apos;s experience is.
              </p>
              <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Start with three better questions</h3>
              <ol className="ml-5 list-decimal space-y-3 marker:font-semibold marker:text-[#a46f52]">
                <li>At what point in the day do your current glasses feel least helpful?</li>
                <li>Which task or environment asks the most of your eyes?</li>
                <li>If a second pair solved one recurring frustration, what would you want it to solve?</li>
              </ol>
              <p>
                Those questions move the conversation away from a list of features and toward an outcome the patient can picture. Once the need is clear, the optician can explain whether a therapeutic lens option belongs in the recommendation and why.
              </p>
              <p>
                This is where an independent practice has an advantage: the recommendation can be built around the person instead of forced into a one-size-fits-all script. The goal is not to add another product to every conversation. It is to recognize the patient whose daily problem deserves a more thoughtful option.
              </p>
              <div className="border-l-4 border-[#b89b68] bg-[#f8f3eb] p-5">
                <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                  Want help introducing Chemistrie into your optical?
                </h3>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="mt-5 inline-flex w-full justify-center rounded-md bg-[#142033] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#9a8054] sm:w-auto"
                >
                  Request Product Support
                </Link>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="unity-v3"
              number="03"
              label="Lens Strategy"
              title="Using VSP Unity V3 Products with Confidence"
              icon="/unity-logo.png"
              iconAlt="Unity"
              supportingLogos={[
                {
                  src: "/logos/VSP_Vision_Logotype_RGB_Blk.png",
                  alt: "VSP Vision",
                },
              ]}
              featureImage={{
                src: "/newsletter-assets/vspv3elite.jpg",
                alt: "Unity V3 Elite product visual",
              }}
              productLink={{
                label: "View Unity Resources",
                href: "/provider-resources#unity-vsp",
              }}
              readNext={{ label: "Fragments", href: "#fragments" }}
            >
              <p>
                Managed-care orders do not need to feel like a separate, lower-value version of the patient experience. The same habits that improve any recommendation—good discovery, accurate measurements, and clear language—matter here too.
              </p>
              <p>
                Unity V3 gives practices a way to keep the VSP conversation focused on fit, function, and how the patient will use the eyewear. Confidence comes less from memorizing a portfolio and more from giving the team a repeatable path through the recommendation.
              </p>
              <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">A four-part recommendation</h3>
              <ol className="ml-5 list-decimal space-y-3 marker:font-semibold marker:text-[#a46f52]">
                <li><strong>Clarify the day:</strong> near work, movement, screen time, driving, and previous adaptation.</li>
                <li><strong>Choose intentionally:</strong> connect the lens design to the needs the patient just described.</li>
                <li><strong>Measure carefully:</strong> protect the recommendation with a consistent fitting process.</li>
                <li><strong>Set expectations:</strong> explain what the patient should notice and what adjustment may feel like.</li>
              </ol>
              <p>
                That sequence keeps the conversation from collapsing into benefit language or price alone. It also makes recommendations more consistent across the team: the words may change, but the thinking stays the same.
              </p>
              <div className="border-l-4 border-[#b89b68] bg-[#f8f3eb] p-5">
                <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                  Want to improve your VSP workflow?
                </h3>
                <p className="mt-3 text-base leading-7 text-[#3f4856]">
                  Contact Artisan Lab Network customer service for guidance.
                </p>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="mt-5 inline-flex w-full justify-center rounded-md bg-[#142033] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#9a8054] sm:w-auto"
                >
                  Talk to Our Team
                </Link>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="fragments"
              number="04"
              label="Fragments"
              title="Fragments: Independence Creates Better Choices"
              icon="/icons/site/handshake.svg"
              tone="dark"
              pullQuote="You are not told what to do. You decide what is right."
              readNext={{ label: "Tokai Update", href: "#tokai-update" }}
            >
              <p>
                Independence is easy to celebrate as an idea. It is more meaningful as a daily practice.
              </p>
              <p>
                It appears when an optician can listen without steering the patient toward a required portfolio. It appears when a doctor can make a recommendation based on the person in the chair. It appears when the practice can change course because the first answer was not the right one.
              </p>
              <p>
                Choice alone is not the point. Thoughtful choice is. A shelf full of options creates noise unless the practice has the freedom—and the support—to select with purpose.
              </p>
              <p className="text-2xl font-semibold leading-snug text-white md:text-3xl">
                One patient.
                <br />
                One prescription.
                <br />
                One recommendation made on purpose.
              </p>
              <p>
                That is what independent practice makes possible.
              </p>
              <p>
                It does not mean doing everything alone. It means choosing partners who add expertise without taking away judgment. The best partnership expands the practice&apos;s ability to decide; it does not quietly narrow it.
              </p>
              <p className="font-semibold text-[#f4e4bf]">
                Independence means:
              </p>
              <ul className="ml-5 list-disc space-y-3 text-white/82">
                <li>You choose the right product for the patient</li>
                <li>You are not forced into one manufacturer</li>
                <li>You can build your optical around outcomes, not pressure</li>
              </ul>
              <p>
                Independence is not simply the absence of restriction. It is the presence of responsibility: to ask better questions, understand the options, and make a recommendation the team can stand behind.
              </p>
              <p>
                Patients can feel the difference when the answer belongs to them.
              </p>
              <div className="border-l-4 border-[#d9c394] bg-white/[0.06] p-5">
                <h3 className="text-xl font-semibold text-white md:text-2xl">
                  Curious how your current lab compares?
                </h3>
                <Link
                  href="/artisan-model"
                  className="mt-5 inline-flex w-full justify-center rounded-md bg-[#d9c394] px-5 py-2.5 text-center text-sm font-semibold text-[#142033] transition hover:bg-white sm:w-auto"
                >
                  See the Difference
                </Link>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="tokai-update"
              number="05"
              label="Product Availability Update"
              title="Tokai 1.76 Temporarily Postponed"
              icon="/tokai-logo.png"
              iconAlt="Tokai"
              tone="warm"
              featureImage={{
                src: "/newsletter-assets/tokai176.webp",
                alt: "Tokai 1.76 product and lens display",
              }}
              productLink={{
                label: "View Tokai Resources",
                href: "/provider-resources#tokai",
              }}
            >
              <p>
                Tokai 1.76 is temporarily unavailable due to a global supply issue involving the raw materials used in the 1.76 lens monomer. Artisan Lab Network will share the next availability update as soon as it is confirmed.
              </p>
              <p>
                During this time, Artisan Lab Network is not accepting Tokai 1.76 orders.
              </p>
              <p>
                We understand the importance of Tokai 1.76 for high Rx patients and apologize for the disruption. Our team will continue to help practices identify the best available options while this material is unavailable.
              </p>
              <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">How to handle the conversation</h3>
              <p>
                Lead with what is known, then move quickly to the plan. Tell the patient that the requested material is temporarily unavailable, explain that the team is reviewing the prescription and frame requirements, and present the strongest supported alternative rather than a list of compromises.
              </p>
              <div>
                <p className="font-semibold text-[#142033]">
                  Current supported options include:
                </p>
                <ul className="mt-4 grid gap-3 text-base leading-7">
                  <li className="border-l-2 border-[#c4a05d] bg-white/62 px-4 py-3">1.74 alternatives across multiple lens designs</li>
                  <li className="border-l-2 border-[#c4a05d] bg-white/62 px-4 py-3">Tokai 1.70</li>
                  <li className="border-l-2 border-[#c4a05d] bg-white/62 px-4 py-3">Tokai 1.67</li>
                  <li className="border-l-2 border-[#c4a05d] bg-white/62 px-4 py-3">Tokai 1.60</li>
                  <li className="border-l-2 border-[#c4a05d] bg-white/62 px-4 py-3">Tokai photochromic options in 1.67 and 1.60</li>
                </ul>
              </div>
              <p>
                If availability or supported alternatives change, we will notify our partners quickly and update the guidance provided to our customer service team.
              </p>
              <div className="border-l-4 border-[#b89b68] bg-white/72 p-5">
                <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                  Need help with a high Rx patient?
                </h3>
                <p className="mt-3 text-base leading-7 text-[#3f4856]">
                  Contact customer service for guidance on the best available solution.
                </p>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="mt-5 inline-flex w-full justify-center rounded-md bg-[#142033] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#9a8054] sm:w-auto"
                >
                  Contact Customer Service
                </Link>
              </div>
            </NewsletterSection>

            <section className="w-full overflow-hidden rounded-[16px_3px_16px_3px] border border-[#d0bfa8] border-t-4 border-t-[#a46f52] bg-[#fcf8f1] p-6 shadow-[0_18px_50px_rgba(73,55,37,0.085)] md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654] md:text-sm md:tracking-[0.28em]">
                Put The Issue To Work
              </p>
              <h2 className="mt-4 max-w-3xl font-[family-name:Georgia,serif] text-3xl font-normal tracking-tight text-[#142033] sm:text-4xl md:text-5xl">
                Start Using This in Your Practice Today
              </h2>
              <div className="mt-9 grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: "Chemistrie",
                    text: "Offer patients a second pair conversation focused on comfort and function.",
                  },
                  {
                    title: "Unity V3",
                    text: "Treat every VSP job like a premium experience.",
                  },
                  {
                    title: "Independence",
                    text: "Choose products based on patient outcomes, not lab limitations.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="border-l-2 border-[#b89b68] bg-[#f7f2e9] p-5 md:p-6"
                  >
                    <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#4d5664]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#142033] px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#9a8054] sm:w-auto"
                >
                  Request Product Guidance
                </Link>
                <Link
                  href="/artisan-model"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#cdbb9e] bg-[#f8f3eb] px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:bg-white sm:w-auto"
                >
                  Compare Your Current Lab
                </Link>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#cdbb9e] px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:bg-[#f2eadf] sm:w-auto"
                >
                  Contact Customer Service
                </Link>
                <Link
                  href="/provider-resources"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#cdbb9e] px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:bg-[#f2eadf] sm:w-auto"
                >
                  Practice Resources
                </Link>
              </div>
            </section>

            <section className="w-full overflow-hidden rounded-[16px_3px_16px_3px] border border-[#b89f82] bg-[#dfcbb2] p-6 text-center text-[#122033] shadow-[0_18px_50px_rgba(73,55,37,0.1)] md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654] md:text-sm md:tracking-[0.28em]">
                Until Next Issue
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl font-[family-name:Georgia,serif] text-3xl font-normal tracking-tight text-[#122033] sm:text-4xl md:text-5xl">
                Thank you for building independent eye care with us.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#4d5664]">
                Practice Matters will continue sharing the people, products, updates, and ideas that help independent practices move with confidence.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/provider-resources"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#d9c394] px-5 py-2 text-center text-sm font-semibold text-[#122033] transition hover:bg-white sm:w-auto"
                >
                  Visit Provider Resources
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#9f8568] bg-white/25 px-5 py-2 text-center text-sm font-semibold text-[#122033] transition hover:bg-white/60 sm:w-auto"
                >
                  Back to Artisan Lab Network
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </NewsletterShell>
  );
}
