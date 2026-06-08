import type { Metadata } from "next";
import Link from "next/link";
import { getOnboardingAccess } from "./onboardingAccess";
import OnboardingHub from "./OnboardingHub";
import { supportContacts } from "./onboardingData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Onboarding Center | Artisan Lab Network",
  description:
    "A secure onboarding center for Artisan Lab Network customers to learn their lab connection, ordering process, pricing, reports, products, AR treatments, shipping, and launch checklist.",
};

function AuthMessage({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <main className="min-h-screen bg-[#171311] px-6 py-24 text-white md:px-10">
      <section className="mx-auto max-w-3xl rounded-[28px] border border-white/12 bg-white/[0.06] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
          Artisan Lab Network Portal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-8 text-white/72">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/portal"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
          >
            Go to Portal Login
          </Link>
          <a
            href={`mailto:${supportContacts.support.email}?subject=Onboarding%20Center%20Access%20Help`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            Contact Support
          </a>
        </div>
      </section>
    </main>
  );
}

export default async function PortalOnboardingPage() {
  const access = await getOnboardingAccess();

  if (access.status === "unauthenticated") {
    return (
      <AuthMessage
        title="Portal login required"
        body="The onboarding center is available only inside the authenticated Artisan Lab Network customer portal."
      />
    );
  }

  if (access.status === "gated") {
    return (
      <AuthMessage
        title="Your onboarding center is not active yet."
        body="Your onboarding center is not active yet. If you believe this is incorrect, contact Artisan Lab Network support."
      />
    );
  }

  if (access.accounts.length === 0) {
    return (
      <AuthMessage
        title="No eligible onboarding accounts found"
        body="This login is authenticated, but no V1-eligible onboarding account was found for preview. Contact Artisan Lab Network support if this looks incorrect."
      />
    );
  }

  return <OnboardingHub access={access} />;
}
