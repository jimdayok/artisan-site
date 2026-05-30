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
      />

      <section className="w-full px-4 pb-16 md:px-8 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
                In This Issue
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#122033] sm:text-4xl md:text-5xl">
                Five stories worth your time.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-[#4d5664]">
              A fast issue map for the email reader who wants the full story, the context, and the next step.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {articles.map((article) => (
              <NewsletterArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-20 md:px-8 md:pb-32">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <NewsletterNavigation articles={articles} />
          </aside>

          <div className="min-w-0 space-y-10 md:space-y-16">
            <NewsletterSection
              id="artisan-spotlight"
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
                This month, we are proud to spotlight Jenn C., one of the people behind the daily experience our practices count on.
              </p>
              <p>
                In a lab relationship, the small details matter. Clear communication matters. Follow through matters. Catching an issue before it becomes a bigger problem matters. Jenn represents the kind of care and consistency that helps practices feel supported, not just serviced.
              </p>
              <p>
                Great lab experiences are not built by systems alone. They are built by people who take ownership. People who understand that every order connects back to a patient, a doctor, an optician, and a practice trying to deliver the best possible experience.
              </p>
              <p>
                That is why the Artisan Spotlight matters. It gives us a chance to recognize the people behind the work and remind our partners that quality is not only found in the lens. It is found in the people who help make the experience dependable.
              </p>
            </NewsletterSection>

            <NewsletterSection
              id="new-and-now"
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
                Chemistrie Therapeutic Lenses give independent practices another way to support patients with lens solutions designed around comfort, function, and real daily needs.
              </p>
              <p>
                For many patients, eyewear is not just about seeing clearly. It is about how their eyes feel throughout the day, how they perform in different environments, and whether their lenses are matched to the way they actually live and work.
              </p>
              <p>
                That is where thoughtful product categories can help practices create better conversations. Chemistrie Therapeutic Lenses can support a more personalized discussion around patient needs, lifestyle, comfort, and lens function.
              </p>
              <p>
                For independent eye care practices, this matters. The ability to offer more targeted solutions helps separate the practice from one size fits all optical experiences. It gives the dispenser a better story to tell and gives the patient a stronger reason to trust the recommendation.
              </p>
              <p>
                Artisan Lab Network believes independent practices should have access to meaningful choices. Chemistrie Therapeutic Lenses are one more way to help practices bring more value to the patient conversation.
              </p>
              <div className="rounded-[22px] border border-[#dfd2bf] bg-[#f8f3eb] p-5 shadow-[0_16px_36px_rgba(20,32,51,0.07)] md:rounded-[24px]">
                <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                  Want help introducing Chemistrie into your optical?
                </h3>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="mt-5 inline-flex w-full justify-center rounded-full bg-[#142033] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033] sm:w-auto"
                >
                  Request Product Support
                </Link>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="unity-v3"
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
                For many independent practices, VSP orders represent a large part of the daily optical workflow. That makes product selection inside the VSP portfolio especially important.
              </p>
              <p>
                Unity V3 products give practices a strong way to serve VSP patients while still maintaining a premium lens conversation. Instead of treating managed care jobs as a lower value transaction, Unity V3 helps practices stay focused on fit, function, and the patient experience.
              </p>
              <p>
                The Unity V3 family allows practices to match patients with a lens option that fits their needs while keeping the process simple for the optical team. For offices that want to build consistency, improve confidence, and support better recommendations, Unity V3 is a product family worth using intentionally.
              </p>
              <p>
                When paired with the right measurements, the right AR treatment, and a clear explanation from the optician, Unity V3 can help turn a routine VSP order into a better patient experience.
              </p>
              <div className="rounded-[22px] border border-[#dfd2bf] bg-[#f8f3eb] p-5 shadow-[0_16px_36px_rgba(20,32,51,0.07)] md:rounded-[24px]">
                <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                  Want to improve your VSP workflow?
                </h3>
                <p className="mt-3 text-base leading-7 text-[#3f4856]">
                  Contact Artisan Lab Network customer service for guidance.
                </p>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="mt-5 inline-flex w-full justify-center rounded-full bg-[#142033] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033] sm:w-auto"
                >
                  Talk to Our Team
                </Link>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="fragments"
              label="Fragments"
              title="Fragments: Independence Creates Better Choices"
              icon="/icons/site/handshake.svg"
              tone="dark"
              pullQuote="You are not told what to do. You decide what is right."
              readNext={{ label: "Tokai Update", href: "#tokai-update" }}
            >
              <p>
                What does it actually mean to be independent?
              </p>
              <p>
                It means you are not told what to prescribe.
                <br />
                Not told what to sell.
                <br />
                Not told what you are allowed to offer your patients.
              </p>
              <p>
                Most corporate lab models are built to limit choice.
              </p>
              <p className="text-2xl font-semibold leading-snug text-white md:text-3xl">
                One portfolio.
                <br />
                One path.
                <br />
                One answer.
              </p>
              <p>
                That is not how independent practices work.
              </p>
              <p>
                Every patient is different.
                <br />
                Every prescription is different.
                <br />
                Every lifestyle is different.
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
                Choice is not a feature.
                <br />
                It is the defining characteristic of independence.
              </p>
              <p>
                And it is exactly why independent eye care continues to win.
              </p>
              <div className="rounded-[22px] border border-white/12 bg-white/[0.06] p-5 md:rounded-[24px]">
                <h3 className="text-xl font-semibold text-white md:text-2xl">
                  Curious how your current lab compares?
                </h3>
                <Link
                  href="/artisan-model"
                  className="mt-5 inline-flex w-full justify-center rounded-full bg-[#d9c394] px-5 py-2.5 text-center text-sm font-semibold text-[#142033] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                >
                  See the Difference
                </Link>
              </div>
            </NewsletterSection>

            <NewsletterSection
              id="tokai-update"
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
                Tokai 1.76 is temporarily unavailable due to a global supply issue involving the raw materials used in the 1.76 lens monomer. We expect this delay to continue until mid July.
              </p>
              <p>
                During this time, Artisan Lab Network is not accepting Tokai 1.76 orders.
              </p>
              <p>
                We understand the importance of Tokai 1.76 for high Rx patients and apologize for the disruption. Our team will continue to help practices identify the best available options while this material is unavailable.
              </p>
              <div>
                <p className="font-semibold text-[#142033]">
                  Current supported options include:
                </p>
                <ul className="mt-4 grid gap-3 text-base leading-7">
                  <li className="rounded-2xl border border-[#e3c88f] bg-white/62 px-4 py-3">1.74 alternatives across multiple lens designs</li>
                  <li className="rounded-2xl border border-[#e3c88f] bg-white/62 px-4 py-3">Tokai 1.70</li>
                  <li className="rounded-2xl border border-[#e3c88f] bg-white/62 px-4 py-3">Tokai 1.67</li>
                  <li className="rounded-2xl border border-[#e3c88f] bg-white/62 px-4 py-3">Tokai 1.60</li>
                  <li className="rounded-2xl border border-[#e3c88f] bg-white/62 px-4 py-3">Tokai photochromic options in 1.67 and 1.60</li>
                </ul>
              </div>
              <p>
                At this time, there are no other material supply issues we are aware of. If that changes, we will notify our partners quickly.
              </p>
              <div className="rounded-[22px] border border-[#d8bb7a] bg-white/72 p-5 shadow-[0_16px_36px_rgba(20,32,51,0.07)] md:rounded-[24px]">
                <h3 className="text-xl font-semibold text-[#142033] md:text-2xl">
                  Need help with a high Rx patient?
                </h3>
                <p className="mt-3 text-base leading-7 text-[#3f4856]">
                  Contact customer service for guidance on the best available solution.
                </p>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="mt-5 inline-flex w-full justify-center rounded-full bg-[#142033] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033] sm:w-auto"
                >
                  Contact Customer Service
                </Link>
              </div>
            </NewsletterSection>

            <section className="w-full overflow-hidden rounded-[26px] border border-[#dfd2bf] bg-white/88 p-5 shadow-[0_28px_74px_rgba(18,32,51,0.09)] md:rounded-[38px] md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654] md:text-sm md:tracking-[0.28em]">
                Put The Issue To Work
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#142033] sm:text-4xl md:text-5xl">
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
                    className="rounded-[22px] border border-[#dfd2bf] bg-[#f8f3eb] p-5 md:rounded-[26px] md:p-6"
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
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#142033] px-5 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033] sm:w-auto"
                >
                  Request Product Guidance
                </Link>
                <Link
                  href="/artisan-model"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#dfd2bf] bg-[#f8f3eb] px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                >
                  Compare Your Current Lab
                </Link>
                <Link
                  href="/provider-resources#lab-customer-service"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#dfd2bf] px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:-translate-y-0.5 hover:bg-[#f2eadf] sm:w-auto"
                >
                  Contact Customer Service
                </Link>
                <Link
                  href="/provider-resources"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#dfd2bf] px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:-translate-y-0.5 hover:bg-[#f2eadf] sm:w-auto"
                >
                  Practice Resources
                </Link>
              </div>
            </section>

            <section className="w-full overflow-hidden rounded-[26px] border border-[#dfd2bf] bg-[#f8f3eb] p-5 text-center shadow-[0_28px_74px_rgba(18,32,51,0.09)] md:rounded-[38px] md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654] md:text-sm md:tracking-[0.28em]">
                Until Next Issue
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#142033] sm:text-4xl md:text-5xl">
                Thank you for building independent eye care with us.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#4c5563]">
                Practice Matters will continue sharing the people, products, updates, and ideas that help independent practices move with confidence.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/provider-resources"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#142033] px-5 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033] sm:w-auto"
                >
                  Visit Provider Resources
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#dfd2bf] bg-white/70 px-5 py-2 text-center text-sm font-semibold text-[#142033] transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
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
