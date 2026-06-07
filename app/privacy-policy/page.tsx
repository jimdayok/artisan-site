import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

const sections = [
  {
    title: "Information We Collect",
    body: "We may collect information you submit through forms, email links, account requests, newsletter requests, and contact interactions, including name, practice, email address, phone number, location, and the details needed to respond to your request.",
  },
  {
    title: "How We Use Information",
    body: "We use submitted information to respond to inquiries, support account setup, provide requested resources, communicate about programs, improve service, and maintain business records related to Artisan Lab Network and its affiliated labs.",
  },
  {
    title: "Sharing Information",
    body: "We may share information with affiliated Artisan labs, service providers, form platforms, email systems, and partners when needed to fulfill your request. We do not sell personal information submitted through this website.",
  },
  {
    title: "Cookies and Analytics",
    body: "CookieYes manages cookie preferences. Necessary security, Cloudflare Access, login, and session cookies remain active. Google Maps and browser location features require Functional consent, while site analytics requires Analytics consent. See the Cookie Policy for details and preference controls.",
  },
  {
    title: "Data Security",
    body: "We use reasonable administrative and technical safeguards, but no website or transmission method is completely secure. Please avoid submitting sensitive health, payment, or confidential patient information through general website forms.",
  },
  {
    title: "Your Choices",
    body: "You may contact us to update your information, request removal from marketing communications, or ask questions about privacy practices by emailing info@artisanlabnetwork.com.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={SIGNUP_URL} />
      <section data-theme="light" className="px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
            Legal
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#625b53]">
            Last updated May 1, 2026. This policy explains how Artisan Lab Network handles website information.
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
