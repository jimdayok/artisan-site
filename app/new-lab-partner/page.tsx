import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Mail, PlayCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NewLabPartnerHub from "./NewLabPartnerHub";

const REQUEST_ACCESS_EMAIL =
  "mailto:jim.day@artisanlabnetwork.com?subject=New%20Lab%20Partner%20Onboarding%20Access";

const teaserModules = [
  "Account and lab connection",
  "Portal pricing and reports",
  "Ordering and frame shipping",
  "Lens education",
  "AR treatments",
  "VSP / Eyefinity setup",
  "Remakes and policies",
  "Launch checklist",
];

export const metadata: Metadata = {
  title: "New Lab Partner Onboarding | Artisan Lab Network",
  description:
    "Approved Artisan Lab Network customers can access a guided onboarding center for account setup, ordering, product training, pricing, reports, and launch support.",
};

export default function NewLabPartnerPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref="/portal/onboarding" />

      <section data-theme="dark" className="relative isolate overflow-hidden bg-[#171311] px-6 pb-20 pt-32 text-white md:px-10 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-35 md:bg-fixed"
          style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,12,0.97),rgba(18,14,12,0.82)_56%,rgba(18,14,12,0.55))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              New Lab Partner Onboarding
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Start Strong with Artisan Lab Network
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-2xl md:leading-10">
              Approved customers can access a guided onboarding center with lab-specific setup, ordering instructions, product training, pricing guidance, portal walkthroughs, and launch checklists.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/portal/onboarding"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Log In to Onboarding Center
              </Link>
              <a
                href={REQUEST_ACCESS_EMAIL}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Request Access
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 z-10 grid place-items-center bg-[#171311]/28 backdrop-blur-[3px]">
              <div className="rounded-full border border-white/20 bg-black/35 px-5 py-3 text-sm font-semibold text-white shadow-xl">
                Portal login required
              </div>
            </div>
            <div className="grid gap-3 opacity-80 blur-[1px]">
              <div className="rounded-2xl bg-[#fbf8f3] p-5 text-[#1f1a17]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">
                  Account-aware onboarding
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Your launch path</h2>
              </div>
              {teaserModules.slice(0, 5).map((module) => (
                <div key={module} className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/10 p-4 text-sm font-semibold">
                  {module}
                  <Lock className="h-4 w-4 text-[#d4c09a]" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              Approved customer access only
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Full training lives inside the secure customer portal.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625b53] md:text-lg">
              The onboarding center recognizes your portal login, selected account, lab relationship, ordering methods, lens families, pricing access, reports, and launch progress.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {teaserModules.map((module) => (
              <article key={module} className="relative overflow-hidden rounded-[24px] border border-[#d8c6a8]/70 bg-white p-5 shadow-[0_18px_46px_rgba(49,39,26,0.08)]">
                <div className="absolute right-4 top-4 rounded-full bg-[#f5f1eb] p-2 text-[#8a7654]">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">
                  Locked preview
                </p>
                <h3 className="mt-4 pr-8 text-xl font-semibold text-[#1f1a17]">{module}</h3>
                <p className="mt-3 text-sm leading-6 text-[#625b53]">
                  Portal login required. Approved customer access only.
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] bg-[#171311] p-6 text-white md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                  Need help?
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Existing customers can request access or schedule help.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/portal/onboarding" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#171311]">
                  Log In
                </Link>
                <a href={REQUEST_ACCESS_EMAIL} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white">
                  Request Access
                </a>
                <a href="mailto:jim.day@artisanlabnetwork.com?subject=Schedule%20Onboarding%20Help" className="inline-flex min-h-12 items-center gap-2 justify-center rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white">
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  Schedule Help
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer signUpHref="/portal/onboarding" />
    </main>
  );
}
