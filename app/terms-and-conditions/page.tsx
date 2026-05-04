import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

const sections = [
  {
    title: "Use of This Website",
    body: "This website is provided for general information about Artisan Lab Network, its affiliated labs, resources, programs, and services. You agree to use the site lawfully and not interfere with site operation, security, forms, or content.",
  },
  {
    title: "No Professional or Legal Advice",
    body: "Content on this website is informational only and does not create a professional, legal, financial, medical, or contractual relationship. Program details, pricing, availability, and eligibility may change and should be confirmed directly with Artisan Lab Network.",
  },
  {
    title: "Intellectual Property",
    body: "Text, graphics, logos, images, videos, downloads, and other materials on this site are owned by Artisan Lab Network, its labs, or their respective partners and may not be copied, modified, or redistributed without permission.",
  },
  {
    title: "Third-Party Links",
    body: "This site may link to partner websites, forms, resources, and third-party tools. Artisan Lab Network is not responsible for the content, availability, policies, or practices of third-party sites.",
  },
  {
    title: "Accounts, Programs, and Offers",
    body: "Account opening, lab ownership conversations, rebate programs, pricing offers, and special programs may be subject to eligibility, approval, documentation, territory, compliance, and program-specific terms.",
  },
  {
    title: "Limitation of Liability",
    body: "To the fullest extent allowed by law, Artisan Lab Network is not liable for indirect, incidental, consequential, or special damages arising from use of this website or reliance on its content.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={SIGNUP_URL} />
      <section data-theme="light" className="px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
            Legal
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#625b53]">
            Last updated May 1, 2026. These terms govern use of the Artisan Lab Network website.
          </p>
        </div>
      </section>
      <section data-theme="light" className="bg-[#fbf8f3] px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-4xl gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_16px_42px_rgba(24,18,13,0.06)]">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-base leading-8 text-[#625b53]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}
