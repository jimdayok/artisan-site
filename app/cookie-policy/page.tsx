import Header from "../components/Header";
import Footer from "../components/Footer";
import CookiePreferencesButton from "../components/CookiePreferencesButton";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

const sections = [
  {
    title: "Necessary Cookies",
    body: "These cookies support core website functions such as security, Cloudflare Access authentication, portal login and sessions, consent preferences, fraud prevention, and reliable page delivery. They are always active because the website and customer portal cannot operate securely without them.",
  },
  {
    title: "Functional Cookies",
    body: "Functional consent enables optional features such as Google Maps, address autocomplete, map display, and the browser location workflow used by the Patient Practice Locator. Location is requested only after you select Find My Location and approve the browser prompt.",
  },
  {
    title: "Analytics Cookies",
    body: "Analytics consent allows privacy-conscious site measurement through Vercel Analytics so we can understand website usage and improve content. Analytics does not load until this category is accepted.",
  },
  {
    title: "Advertising Cookies",
    body: "Artisan Lab Network does not currently load advertising pixels or behavioral advertising trackers on this website.",
  },
  {
    title: "Managing Your Choices",
    body: "You can review or change optional cookie categories at any time using Cookie Preferences. Withdrawing consent may require refreshing the page before every previously loaded optional service is removed.",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={SIGNUP_URL} />
      <section data-theme="light" className="px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">Legal</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">Cookie Policy</h1>
          <p className="mt-6 text-lg leading-8 text-[#625b53]">
            Last updated June 7, 2026. This policy explains how cookies and consent-controlled services are used on the Artisan Lab Network website.
          </p>
          <CookiePreferencesButton className="mt-6 inline-flex rounded-full bg-[#15342f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#23453f]" />
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
