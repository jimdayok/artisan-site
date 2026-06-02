"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  BASE_PROGRAM_FORM_URL,
  COMPLIANCE_NOTE,
  programs,
} from "./programData";

const UNLOCK_KEY = "artisanProgramsUnlocked";
const PROGRAM_PASSWORD = "Artisan2026";

const hubOrder = [
  "simple-switch",
  "sequel-rebate",
  "unity-rebate",
  "neurolens-free-ar",
  "lab-partner",
];

const cardTitles: Record<string, string> = {
  "simple-switch": "Simple Switch",
  "sequel-rebate": "Sequel Rebate",
  "unity-rebate": "Unity Rebate",
  "neurolens-free-ar": "Neurolens Free AR",
  "lab-partner": "New Lab Partner",
};

function GateShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#171311] text-white">
      <Header signUpHref={BASE_PROGRAM_FORM_URL} />
      <section
        data-theme="dark"
        className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-scroll px-6 py-32 md:bg-fixed md:px-10"
        style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-black/76" />
        {children}
      </section>
    </main>
  );
}

export default function ProgramsHubClient() {
  const searchParams = useSearchParams();
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(UNLOCK_KEY) === "true";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loaded] = useState(true);

  const orderedPrograms = useMemo(
    () =>
      hubOrder
        .map((slug) => programs.find((program) => program.slug === slug))
        .filter((program): program is (typeof programs)[number] => Boolean(program)),
    []
  );

  const openProgramsForm = () => {
    window.open(BASE_PROGRAM_FORM_URL, "_blank", "noopener,noreferrer");
  };

  const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === PROGRAM_PASSWORD) {
      window.localStorage.setItem(UNLOCK_KEY, "true");
      setUnlocked(true);
      setError("");
      return;
    }

    setError("Password incorrect.");
  };

  if (!loaded) {
    return (
      <GateShell>
        <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <p className="text-sm text-white/70">Loading...</p>
        </div>
      </GateShell>
    );
  }

  if (!unlocked && searchParams.get("p") !== "aln2026") {
    return (
      <GateShell>
        <div className="max-w-md rounded-[28px] border border-white/12 bg-white/[0.06] p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
            Artisan Lab Network
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Access required.
          </h1>
        </div>
      </GateShell>
    );
  }

  if (!unlocked) {
    return (
      <GateShell>
        <form
          onSubmit={submitPassword}
          className="w-full max-w-md rounded-[28px] border border-white/12 bg-white/[0.07] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-md"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
            Special Programs
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Enter password.
          </h1>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="mt-7 h-12 w-full rounded-full border border-white/14 bg-black/30 px-5 text-white outline-none transition placeholder:text-white/35 focus:border-[#d4c09a]"
            placeholder="Password"
          />
          {error ? <p className="mt-3 text-sm text-[#f1b7a8]">{error}</p> : null}
          <button
            type="submit"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
          >
            Unlock Programs
          </button>
        </form>
      </GateShell>
    );
  }

  return (
    <main className="min-h-screen bg-[#171311] text-white">
      <Header onContactClick={openProgramsForm} signUpHref={BASE_PROGRAM_FORM_URL} />

      <section
        data-theme="dark"
        className="relative isolate overflow-hidden bg-cover bg-center bg-scroll px-6 pb-16 pt-32 md:bg-fixed md:px-10 md:pb-24 md:pt-40"
        style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-black/74" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
            Artisan Lab Network
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Special Programs
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-xl">
            Invitation-only opportunities designed to help independent practices
            try Artisan, increase profitability, and experience a better lab
            relationship.
          </p>
        </div>
      </section>

      <section
        data-theme="light"
        className="bg-[#fbf8f3] px-6 py-20 text-[#201a16] md:px-10 md:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {orderedPrograms.map((program) => (
            <article
              key={program.slug}
              className="flex min-h-[300px] flex-col rounded-[28px] border border-[#e1d4c2] bg-white p-6 shadow-[0_22px_60px_rgba(49,39,26,0.09)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                {program.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                {cardTitles[program.slug]}
              </h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#62584d]">
                {program.subheadline}
              </p>
              <Link
                href={program.route}
                className="mt-6 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c9b28b] hover:text-[#1f1a17]"
              >
                View Page
              </Link>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-4xl rounded-[22px] border border-[#d8c9b6] bg-white p-5 text-sm leading-7 text-[#5f554b] shadow-[0_18px_50px_rgba(49,39,26,0.07)]">
          {COMPLIANCE_NOTE}
        </p>
      </section>

      <Footer onContactClick={openProgramsForm} signUpHref={BASE_PROGRAM_FORM_URL} />
    </main>
  );
}
