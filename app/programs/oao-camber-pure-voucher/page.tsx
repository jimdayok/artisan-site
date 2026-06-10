import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";

const VOUCHER_CODE = "SLOAO26";
const ACCOUNT_URL = "https://newaccount.artisanlabnetwork.com";
const OAO_LOGO_URL = "/oaologo.png";

const offerItems = [
  "One complimentary Camber Pure progressive lens fit.",
  "Available standard lens material included.",
  "Choose premium Artisan AR: Nytopia, Emerald, Armour, or Azure.",
  "Photochromic, polarized, or other specialty options may require additional fees.",
];

const redeemSteps = [
  {
    title: "Obtain your account number",
    body: "If the practice does not already have an Artisan Lab Network account, open one before ordering.",
  },
  {
    title: "Submit the Camber Pure order",
    body: "Use the preferred order entry system: DVI Rx Wizard, SpecCheck Rx, VisionWeb, or Eyefinity. Choose the preferred available material and Artisan AR treatment.",
  },
  {
    title: "Ship the job to the lab",
    body: "Use the pre-paid UPS label. If the practice is out of labels, email the lab. New customers receive labels after account creation and approval.",
  },
  {
    title: "Experience Camber Pure",
    body: "Camber Pure is a next-generation progressive lens design with technology designed to help reduce chromatic aberrations in progressive lens performance.",
  },
];

const terms = [
  "Valid only for eligible attendees of the Opticians Association of Oregon event.",
  "Valid only for the event attendee or transferable within a qualifying practice of an event attendee.",
  "Voucher applies to one qualifying Camber Pure progressive lens fit for the attendee or another person within the attendee's practice.",
  "Active, approved Artisan Lab Network lab account required.",
  "Practice must be eligible for an Artisan Lab Network laboratory account.",
  "Order must include a valid spectacle prescription and all required fitting/product information for a progressive lens.",
  "Not valid for wholesalers, chain retail optical organizations, franchise or corporate-controlled practices, buying groups redeeming on behalf of members, or organizations where purchasing decisions are made outside the location where patient care is provided.",
  "Complimentary promotional voucher only. No cash value. Not a stored-value card, gift card, or gift certificate.",
  "Subject to product availability, prescription requirements, account approval, credit standing, lab policies, and ALN eligibility review.",
];

export const metadata: Metadata = {
  title: "OAO Camber Pure Trial Voucher | Artisan Lab Network",
  description: "Camber Pure trial voucher details for eligible Opticians Association of Oregon attendees.",
};

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8a7654]">
      {children}
    </p>
  );
}

export default function OaoCamberPureVoucherPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <section className="bg-[#122033] px-6 py-8 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Image
            src="/aln-white-logo.png"
            alt="Artisan Lab Network"
            width={260}
            height={122}
            priority
            className="h-12 w-auto object-contain md:h-14"
          />
          <img
            src={OAO_LOGO_URL}
            alt="Opticians Association of Oregon"
            className="max-h-14 w-auto max-w-[150px] rounded-[8px] bg-white p-2"
          />
        </div>
      </section>

      <section className="bg-[#122033] px-6 pb-16 pt-8 text-white md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Opticians Association of Oregon Attendee Voucher
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">
              Camber Pure Trial Voucher
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78 md:text-xl">
              Complimentary Camber Pure progressive lens fit for eligible OAO attendees.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="w-fit rounded-[8px] border border-[#d4c09a]/70 bg-[#d4c09a] px-5 py-4 text-[#171311] shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Voucher code</p>
                <p className="mt-1 text-3xl font-semibold tracking-[0.08em]">{VOUCHER_CODE}</p>
              </div>
              <p className="rounded-full border border-white/14 bg-white/8 px-5 py-3 text-sm font-semibold text-white">
                No program signup required.
              </p>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/12 bg-white/[0.07] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
            <div className="rounded-[8px] bg-[#fbf8f3] p-7">
              <Image
                src="/files/camberpurelogo-black.png"
                alt="Camber Pure"
                width={520}
                height={220}
                priority
                className="mx-auto h-auto max-h-28 w-auto max-w-full object-contain"
              />
              <div className="mt-7 rounded-[8px] border border-[#d8c6a8] bg-white p-5 text-[#201a16]">
                <p className="text-sm font-semibold text-[#8a7654]">Trial voucher</p>
                <p className="mt-2 text-2xl font-semibold">One qualifying progressive lens fit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>Offer</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            What the voucher covers.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {offerItems.map((item) => (
              <article key={item} className="rounded-[8px] border border-[#d8c6a8] bg-white p-5 shadow-[0_18px_48px_rgba(49,39,26,0.08)]">
                <div className="h-1.5 w-10 rounded-full bg-[#c9b28b]" />
                <p className="mt-4 text-sm font-semibold leading-7 text-[#2b241f]">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>How To Redeem</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Use the voucher with a qualifying Camber Pure order.
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {redeemSteps.map((step, index) => (
              <article key={step.title} className="rounded-[8px] border border-[#d8c6a8] bg-white p-6 shadow-[0_18px_48px_rgba(49,39,26,0.08)]">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#122033] text-sm font-bold text-[#d4c09a]">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#62584d]">{step.body}</p>
                {index === 0 ? (
                  <a
                    href={ACCOUNT_URL}
                    className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#d4c09a] px-5 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
                  >
                    Open An Account
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl rounded-[8px] border border-[#d8c6a8] bg-white p-6 shadow-[0_18px_48px_rgba(49,39,26,0.08)] md:p-8">
          <Eyebrow>Eligibility And Terms</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Fine print for voucher redemption.
          </h2>
          <ul className="mt-6 grid gap-2 text-[13px] leading-[21px] text-[#706759] md:grid-cols-2">
            {terms.map((term) => (
              <li key={term} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9b28b]" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#122033] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Ready To Redeem
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Need an account first?
            </h2>
            <p className="mt-5 text-base leading-8 text-white/74 md:text-lg">
              Open an Artisan Lab Network account, then submit the qualifying Camber Pure order through your normal order entry system using voucher code {VOUCHER_CODE}.
            </p>
          </div>
          <div className="rounded-[8px] border border-white/12 bg-white/[0.07] p-6">
            <a
              href={ACCOUNT_URL}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition hover:bg-[#e2cca2]"
            >
              Open An Account
            </a>
            <p className="mt-6 text-sm leading-7 text-white/76">
              Already have an account? Submit your order through your normal order entry system and use voucher code {VOUCHER_CODE}.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/76">
              Questions? Contact <a href="mailto:sales@artisanlabnetwork.com" className="font-semibold text-[#d4c09a] underline underline-offset-4">sales@artisanlabnetwork.com</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
