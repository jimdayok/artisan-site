"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  HeartPulse,
  Landmark,
  Loader2,
  MailOpen,
  MapPin,
  Phone,
  RefreshCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { advocacyMetrics, advocacyStories, legislationTracker, stateProtections } from "../../lib/advocacy/data";
import type { AdvocacyTone, CivicLookupRequest, Legislator, LetterProfile, StateProtection } from "../../lib/advocacy/types";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

const whyCards = [
  {
    title: "Doctor Choice",
    body: "Doctors should be free to select the laboratory that best meets patient needs.",
    icon: Building2,
  },
  {
    title: "Patient Choice",
    body: "Patients deserve access to the best products and services available.",
    icon: HeartPulse,
  },
  {
    title: "Independent Competition",
    body: "Independent laboratories support local jobs, technology investment, and innovation.",
    icon: Users,
  },
  {
    title: "Quality & Service",
    body: "Competition improves turnaround time, product availability, and customer service.",
    icon: ShieldCheck,
  },
];

const tones: Array<{ id: AdvocacyTone; label: string; body: string }> = [
  { id: "professional", label: "Professional", body: "Clear, polished, and practice-focused." },
  { id: "personal", label: "Personal", body: "More direct and rooted in lived practice experience." },
  { id: "legislative", label: "Legislative", body: "Policy-forward language for lawmakers and staff." },
  { id: "patient-centered", label: "Patient-Centered", body: "Frames lab choice around access, quality, and outcomes." },
];

const initialLookup: CivicLookupRequest = {
  address: "",
  city: "",
  state: "",
  zip: "",
};

const initialProfile: LetterProfile = {
  firstName: "",
  lastName: "",
  practiceName: "",
  city: "",
  state: "",
  yearsInPractice: "",
  patientsServedMonthly: "",
  independentPractice: "yes",
  usesIndependentLaboratory: "yes",
  tone: "professional",
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function generateLetter(profile: LetterProfile) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "A concerned eye care professional";
  const practice = profile.practiceName || "my practice";
  const location = [profile.city, profile.state].filter(Boolean).join(", ") || "our community";
  const years = profile.yearsInPractice ? `${profile.yearsInPractice} years` : "many years";
  const patients = profile.patientsServedMonthly ? `approximately ${profile.patientsServedMonthly} patients each month` : "patients every month";
  const independentPractice = profile.independentPractice === "yes" ? "an independent practice" : "a practice that cares deeply about patient access";
  const independentLab = profile.usesIndependentLaboratory === "yes" ? "We rely on independent laboratories because they provide responsive service, product choice, and accountability." : "Even when a practice uses multiple lab channels, doctors need the freedom to choose the right laboratory for each patient.";

  const openingByTone: Record<AdvocacyTone, string> = {
    professional: `I am writing to ask for your support for laboratory choice protections and Vision Benefit Manager reform. I am ${fullName} with ${practice} in ${location}.`,
    personal: `I am asking you to protect the doctor-patient relationship by supporting laboratory choice. My name is ${fullName}, and ${practice} serves patients in ${location}.`,
    legislative: `Please support legislation that protects laboratory choice, increases transparency, and limits anti-competitive steering by Vision Benefit Managers. I am ${fullName} with ${practice} in ${location}.`,
    "patient-centered": `Patients benefit when their doctor can choose the laboratory, products, and service model that best meets their needs. I am ${fullName} with ${practice} in ${location}.`,
  };

  const closeByTone: Record<AdvocacyTone, string> = {
    professional: "Thank you for considering this important issue for independent practices, independent laboratories, and the patients we serve.",
    personal: "This issue affects real practices and real patients. I would appreciate your support.",
    legislative: "I respectfully urge you to support reforms that preserve competition, transparency, and independent clinical judgment.",
    "patient-centered": "Please support policies that keep patient care decisions in the hands of doctors and patients, not vision plan administrators.",
  };

  return `${openingByTone[profile.tone]}

I have been in practice for ${years} and serve ${patients}. As ${independentPractice}, we need the ability to select the laboratory that best supports patient care, turnaround time, product availability, and service quality.

Vision Benefit Managers and vision plans should not dictate where doctors send work or steer patients away from choices that may better serve their needs. Laboratory competition helps maintain innovation, accountability, local jobs, and better outcomes for patients.

${independentLab}

I support legislation that protects laboratory choice, prevents unfair steering, preserves access to non-covered services, and ensures independent doctors can make decisions based on patient needs rather than plan pressure.

${closeByTone[profile.tone]}

Sincerely,
${fullName}
${practice}
${location}`;
}

function groupByLevel(legislators: Legislator[]) {
  return {
    federal: legislators.filter((official) => official.level === "federal"),
    state: legislators.filter((official) => official.level === "state"),
  };
}

export default function AdvocacyClient() {
  const [lookup, setLookup] = useState(initialLookup);
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [lookupError, setLookupError] = useState("");
  const [profile, setProfile] = useState(initialProfile);
  const [selectedState, setSelectedState] = useState<StateProtection>(stateProtections.find((state) => state.code === "TX") ?? stateProtections[0]);
  const letter = useMemo(() => generateLetter(profile), [profile]);
  const groupedLegislators = useMemo(() => groupByLevel(legislators), [legislators]);

  async function runLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupStatus("loading");
    setLookupError("");
    track("advocacy_legislator_lookup_started", { state: lookup.state });

    try {
      const response = await fetch("/api/advocacy/legislators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lookup),
      });
      const data = (await response.json()) as { legislators?: Legislator[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to find legislators.");
      setLegislators(data.legislators ?? []);
      setLookupStatus("success");
      track("advocacy_legislator_lookup_completed", { state: lookup.state, count: data.legislators?.length ?? 0 });
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to find legislators.");
      setLookupStatus("error");
      track("advocacy_legislator_lookup_failed", { state: lookup.state });
    }
  }

  async function copyLetter() {
    await navigator.clipboard?.writeText(letter);
    track("advocacy_letter_copied", { tone: profile.tone });
  }

  function regenerateLetter() {
    setProfile((current) => ({ ...current, tone: tones[(tones.findIndex((tone) => tone.id === current.tone) + 1) % tones.length].id }));
    track("advocacy_letter_regenerated", { tone: profile.tone });
  }

  function downloadPdf() {
    const content = [
      "Protect Lab Choice Advocacy Letter",
      "Artisan Lab Network",
      "",
      letter,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "protect-lab-choice-advocacy-letter.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    track("advocacy_letter_pdf_downloaded", { tone: profile.tone });
  }

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#172a28]">
      <Header />
      <section className="relative overflow-hidden bg-[#101820] px-6 pb-20 pt-32 text-white md:px-10 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(212,192,154,0.24),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.1),transparent_24%),linear-gradient(135deg,#101820_0%,#172a28_58%,#0c1117_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(212,192,154,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(212,192,154,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d4c09a]">Protect Lab Choice</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">Protect Laboratory Choice.</h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-white/78 md:text-2xl md:leading-10">Independent doctors should have the freedom to choose the laboratory that best serves their patients.</p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/64">Vision plans should not dictate where doctors send their work. Competition drives innovation, quality, service, and patient outcomes. Help support legislation that protects independent practices and independent laboratories.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#find-legislators" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#101820] transition hover:-translate-y-0.5 hover:bg-[#ead7ad]">Find My Legislators <ArrowRight className="h-4 w-4" /></a>
              <a href="#issue" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4c09a]/60 hover:bg-white/12">Learn About the Issue</a>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4c09a]">Advocacy Workflow</p>
            <div className="mt-6 grid gap-3">
              {["Find elected officials", "Generate a personalized letter", "Open contact forms", "Track state opportunities"].map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d4c09a] font-semibold text-[#172a28]">{index + 1}</span>
                  <span className="font-semibold text-white">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="issue" className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Why It Matters" title="Laboratory choice protects clinical judgment and patient access." body="VBM reform is about preserving competition, transparency, and the ability for independent doctors to choose the best laboratory partner for the patient in front of them." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {whyCards.map((card) => {
              const Icon = card.icon;
              return <FeatureCard key={card.title} icon={<Icon className="h-6 w-6" />} title={card.title} body={card.body} />;
            })}
          </div>
        </div>
      </section>

      <section id="find-legislators" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Find My Legislators</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-tight text-[#172a28] md:text-5xl">Identify the officials who need to hear from you.</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#625b53]">Enter your practice or home address to find federal and state officials using the Google Civic Information API.</p>
            </div>
            <form onSubmit={runLookup} className="mt-8 grid min-w-0 gap-4 rounded-[28px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
              <TextInput label="Address" value={lookup.address} onChange={(value) => setLookup((current) => ({ ...current, address: value }))} required />
              <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                <TextInput label="City" value={lookup.city} onChange={(value) => setLookup((current) => ({ ...current, city: value }))} required />
                <TextInput label="State" value={lookup.state} onChange={(value) => setLookup((current) => ({ ...current, state: value.toUpperCase().slice(0, 2) }))} required />
                <TextInput label="ZIP Code" value={lookup.zip} onChange={(value) => setLookup((current) => ({ ...current, zip: value }))} required />
              </div>
              <button type="submit" className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#27433f] disabled:opacity-60" disabled={lookupStatus === "loading"}>
                {lookupStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find Officials
              </button>
              {lookupStatus === "error" ? <p className="rounded-2xl border border-[#e7bea5] bg-[#fff1e8] p-3 text-sm font-semibold text-[#8a3f21]">{lookupError}</p> : null}
            </form>
          </div>
          <div className="grid gap-5">
            <LegislatorGroup title="US Senators & House Representative" legislators={groupedLegislators.federal} letter={letter} empty="Run a lookup to display federal officials." />
            <LegislatorGroup title="State Officials" legislators={groupedLegislators.state} letter={letter} empty="State senator and representative results appear when available from the Civic API." />
          </div>
        </div>
      </section>

      <section id="letter" className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Generate Advocacy Letter" title="Create a personalized message in seconds." body="Choose a tone, add practice context, and generate a clear letter supporting laboratory choice and VBM reform." />
            <div className="mt-8 grid gap-3 rounded-[28px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="First Name" value={profile.firstName} onChange={(value) => setProfile((current) => ({ ...current, firstName: value }))} />
                <TextInput label="Last Name" value={profile.lastName} onChange={(value) => setProfile((current) => ({ ...current, lastName: value }))} />
              </div>
              <TextInput label="Practice Name" value={profile.practiceName} onChange={(value) => setProfile((current) => ({ ...current, practiceName: value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="City" value={profile.city} onChange={(value) => setProfile((current) => ({ ...current, city: value }))} />
                <TextInput label="State" value={profile.state} onChange={(value) => setProfile((current) => ({ ...current, state: value.toUpperCase().slice(0, 2) }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="Years in Practice" value={profile.yearsInPractice} onChange={(value) => setProfile((current) => ({ ...current, yearsInPractice: value }))} />
                <TextInput label="Patients Served Monthly" value={profile.patientsServedMonthly} onChange={(value) => setProfile((current) => ({ ...current, patientsServedMonthly: value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectInput label="Independent Practice" value={profile.independentPractice} options={["yes", "no"]} onChange={(value) => setProfile((current) => ({ ...current, independentPractice: value as "yes" | "no" }))} />
                <SelectInput label="Uses Independent Laboratory" value={profile.usesIndependentLaboratory} options={["yes", "no"]} onChange={(value) => setProfile((current) => ({ ...current, usesIndependentLaboratory: value as "yes" | "no" }))} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {tones.map((tone) => (
                  <button key={tone.id} type="button" onClick={() => setProfile((current) => ({ ...current, tone: tone.id }))} className={classNames("rounded-2xl border p-4 text-left transition hover:-translate-y-0.5", profile.tone === tone.id ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#eadfce] bg-[#fbf8f3] text-[#172a28]")}> 
                    <span className="font-semibold">{tone.label}</span>
                    <span className={classNames("mt-1 block text-xs leading-5", profile.tone === tone.id ? "text-white/68" : "text-[#625b53]")}>{tone.body}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-[32px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">Generated Draft</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">Ready to copy and send.</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton onClick={copyLetter} icon={<Copy className="h-4 w-4" />} label="Copy" />
                <ActionButton onClick={downloadPdf} icon={<FileText className="h-4 w-4" />} label="Download Letter" />
                <ActionButton onClick={regenerateLetter} icon={<RefreshCcw className="h-4 w-4" />} label="Regenerate" />
              </div>
            </div>
            <pre className="mt-5 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-[24px] border border-[#eadfce] bg-[#fbf8f3] p-5 text-sm leading-7 text-[#172a28]">{letter}</pre>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#172a28] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading dark eyebrow="Contact Legislators" title="Open, paste, submit." body="Use your generated letter with each legislator contact form. The workflow is intentionally simple for busy practices and staff." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Open the contact form.", "Paste the generated message.", "Submit and log the outreach."].map((step, index) => (
              <div key={step} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d4c09a] font-semibold text-[#172a28]">{index + 1}</span>
                <p className="mt-4 text-lg font-semibold">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {legislators.length ? legislators.map((official) => <ContactCard key={official.id} legislator={official} letter={letter} />) : <p className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 text-white/70">Run a legislator lookup to populate contact actions.</p>}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Current Legislation Tracker" title="Federal and state reform activity, ready to expand." body="This section uses a reusable data structure so new bills can be added without redesigning the page." />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {legislationTracker.map((bill) => <BillCard key={`${bill.jurisdiction}-${bill.billNumber}`} bill={bill} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <SectionHeading eyebrow="State-by-State Map" title="Track protection status and advocacy opportunities." body="Select a state to review current protection categories, statutes, bills, and next-step opportunities." />
            <StateMap selectedState={selectedState} onSelect={setSelectedState} />
          </div>
          <StateDetail state={selectedState} />
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Success Metrics" title="Measure the movement as it grows." body="Counters are wired as live-ready front-end components and can later connect to CRM, petition, email, or member portal data." />
          <MetricGrid />
        </div>
      </section>

      <section className="bg-[#101820] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading dark eyebrow="Stories & Testimonials" title="Real practice stories make the issue human." body="CMS-ready fields support practice name, state, story, doctor photo, and optional video links." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {advocacyStories.map((story) => <StoryCard key={`${story.practiceName}-${story.state}`} story={story} />)}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="FAQ" title="Answers for doctors, teams, and patients." body="Use this language as a starting point for education, staff training, and outreach." />
          <div className="mt-8 grid gap-3">
            {[
              ["What is laboratory choice?", "Laboratory choice means doctors can choose the lab partner that best serves their patients instead of being forced into a plan-directed lab channel."],
              ["What is a Vision Benefit Manager?", "A Vision Benefit Manager, or VBM, administers vision benefits and may influence product access, reimbursement, lab routing, and patient options."],
              ["Why does this matter?", "Choice protects competition, independent practices, local jobs, innovation, and service accountability."],
              ["How can I help?", "Find your legislators, generate a letter, submit it through contact forms, call offices, and share your story."],
              ["Does this impact patient care?", "Yes. Laboratory access affects product availability, communication, turnaround, quality, and patient experience."],
            ].map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}
          </div>
        </div>
      </section>
      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}

function SectionHeading({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body: string; dark?: boolean }) {
  return (
    <div>
      <p className={classNames("text-xs font-semibold uppercase tracking-[0.28em]", dark ? "text-[#d4c09a]" : "text-[#8a7654]")}>{eyebrow}</p>
      <h2 className={classNames("mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl", dark ? "text-white" : "text-[#172a28]")}>{title}</h2>
      <p className={classNames("mt-5 max-w-3xl text-base leading-8", dark ? "text-white/68" : "text-[#625b53]")}>{body}</p>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[28px] border border-[#d8c6a8] bg-white/86 p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#172a28] text-[#d4c09a]">{icon}</span>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#625b53]">{body}</p>
    </div>
  );
}

function TextInput({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="grid min-w-0 gap-1">
      <span className="text-xs font-semibold text-[#625b53]">{label}</span>
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 min-w-0 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-3 text-sm font-semibold text-[#172a28] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/40" />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid min-w-0 gap-1">
      <span className="text-xs font-semibold text-[#625b53]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 min-w-0 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-3 text-sm font-semibold capitalize text-[#172a28] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/40">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-4 text-sm font-semibold transition hover:bg-[#d4c09a]">{icon}{label}</button>;
}

function LegislatorGroup({ title, legislators, letter, empty }: { title: string; legislators: Legislator[]; letter: string; empty: string }) {
  return (
    <div className="rounded-[28px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {legislators.length ? legislators.map((official) => <LegislatorCard key={official.id} legislator={official} letter={letter} />) : <p className="text-sm leading-7 text-[#625b53]">{empty}</p>}
      </div>
    </div>
  );
}

function LegislatorCard({ legislator, letter }: { legislator: Legislator; letter: string }) {
  return (
    <article className="rounded-[24px] border border-[#eadfce] bg-[#fbf8f3] p-4">
      <div className="flex gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#172a28]">
          {legislator.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={legislator.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : <div className="grid h-full place-items-center text-[#d4c09a]"><Landmark className="h-6 w-6" /></div>}
        </div>
        <div>
          <h4 className="font-semibold leading-tight">{legislator.name}</h4>
          <p className="mt-1 text-xs font-semibold text-[#625b53]">{legislator.office}</p>
          {legislator.party ? <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#8a7654]">{legislator.party}</p> : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {legislator.websiteUrl ? <SmallLink href={legislator.websiteUrl} label="Website" icon={<ExternalLink className="h-3.5 w-3.5" />} /> : null}
        {legislator.phone ? <SmallLink href={`tel:${legislator.phone}`} label={legislator.phone} icon={<Phone className="h-3.5 w-3.5" />} /> : null}
        {legislator.contactFormUrl ? <SmallLink href={legislator.contactFormUrl} label="Contact Form" icon={<MailOpen className="h-3.5 w-3.5" />} onClick={() => track("advocacy_contact_form_clicked", { office: legislator.office })} /> : null}
        <button onClick={() => navigator.clipboard?.writeText(letter)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d8c6a8] bg-white px-3 text-xs font-semibold"><Clipboard className="h-3.5 w-3.5" /> Copy Letter</button>
      </div>
    </article>
  );
}

function SmallLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick?: () => void }) {
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" onClick={onClick} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d8c6a8] bg-white px-3 text-xs font-semibold">{icon}{label}</a>;
}

function ContactCard({ legislator, letter }: { legislator: Legislator; letter: string }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
      <h3 className="text-xl font-semibold">{legislator.name}</h3>
      <p className="mt-1 text-sm text-white/58">{legislator.office}</p>
      <div className="mt-5 grid gap-2">
        {legislator.contactFormUrl ? <a href={legislator.contactFormUrl} target="_blank" rel="noreferrer" onClick={() => track("advocacy_contact_form_clicked", { office: legislator.office })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#d4c09a] px-4 text-sm font-semibold text-[#172a28]"><ExternalLink className="h-4 w-4" /> Open Contact Form</a> : null}
        <button onClick={() => navigator.clipboard?.writeText(letter)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 text-sm font-semibold"><Copy className="h-4 w-4" /> Copy Generated Letter</button>
        {legislator.phone ? <a href={`tel:${legislator.phone}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 text-sm font-semibold"><Phone className="h-4 w-4" /> Call Office</a> : null}
      </div>
    </article>
  );
}

function BillCard({ bill }: { bill: (typeof legislationTracker)[number] }) {
  return (
    <article className="rounded-[28px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a7654]">{bill.jurisdiction}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{bill.billNumber}</h3>
        </div>
        <span className="w-fit rounded-full bg-[#e7f7ed] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#21633c]">{bill.status}</span>
      </div>
      <p className="mt-4 text-sm leading-7 text-[#625b53]">{bill.summary}</p>
      <p className="mt-4 text-sm font-semibold text-[#172a28]">Last action: {bill.lastAction}</p>
      <a href={bill.officialLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8a7654]">Official Link <ExternalLink className="h-4 w-4" /></a>
    </article>
  );
}

function StateMap({ selectedState, onSelect }: { selectedState: StateProtection; onSelect: (state: StateProtection) => void }) {
  return (
    <div className="mt-8 rounded-[32px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
        {stateProtections.map((state) => {
          const score = [state.labChoiceProtection, state.nonCoveredServicesProtection, state.antiSteeringProtection, state.anyWillingProviderProtection].filter(Boolean).length;
          return (
            <button
              key={state.code}
              type="button"
              onClick={() => {
                onSelect(state);
                track("advocacy_state_map_selected", { state: state.code });
              }}
              aria-label={`View ${state.name} advocacy details`}
              className={classNames(
                "aspect-square rounded-2xl border text-sm font-bold transition hover:-translate-y-0.5",
                selectedState.code === state.code ? "border-[#172a28] bg-[#172a28] text-white shadow-lg" : score >= 3 ? "border-[#9f8454] bg-[#ead7ad] text-[#172a28]" : score >= 1 ? "border-[#d8c6a8] bg-[#fbf8f3] text-[#172a28]" : "border-[#eadfce] bg-white text-[#8a7654]"
              )}
            >
              {state.code}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-[#625b53]">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#172a28]" /> Selected</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ead7ad]" /> Multiple protections</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#fbf8f3] ring-1 ring-[#d8c6a8]" /> Partial protections</span>
      </div>
    </div>
  );
}

function StateDetail({ state }: { state: StateProtection }) {
  const protectionRows = [
    ["Lab Choice Protection", state.labChoiceProtection],
    ["Non-Covered Services Protection", state.nonCoveredServicesProtection],
    ["Anti-Steering Protection", state.antiSteeringProtection],
    ["Any Willing Provider Protection", state.anyWillingProviderProtection],
  ] as const;

  return (
    <aside className="rounded-[32px] border border-[#d8c6a8] bg-white/86 p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)] lg:sticky lg:top-24 lg:h-fit">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">State Detail</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">{state.name}</h3>
      <p className="mt-4 text-sm leading-7 text-[#625b53]">{state.summary}</p>
      <div className="mt-5 grid gap-2">
        {protectionRows.map(([label, enabled]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-4 py-3 text-sm font-semibold">
            <span>{label}</span>
            <span className={enabled ? "text-[#21633c]" : "text-[#8a3f21]"}>{enabled ? "Yes" : "No"}</span>
          </div>
        ))}
      </div>
      <DetailList title="Relevant Statutes" items={state.relevantStatutes} />
      <DetailList title="Current Bills" items={state.currentBills} />
      <DetailList title="Advocacy Opportunities" items={state.advocacyOpportunities} />
    </aside>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-5">
      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">{title}</h4>
      <ul className="mt-2 grid gap-2 text-sm leading-6 text-[#625b53]">
        {items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7654]" />{item}</li>)}
      </ul>
    </div>
  );
}

function MetricGrid() {
  const metrics = [
    ["Doctors Participating", advocacyMetrics.doctorsParticipating, Users],
    ["Letters Generated", advocacyMetrics.lettersGenerated, FileText],
    ["States Represented", advocacyMetrics.statesRepresented, MapPin],
    ["Legislators Contacted", advocacyMetrics.legislatorsContacted, Landmark],
  ] as const;
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-4">
      {metrics.map(([label, value, Icon]) => <MetricCard key={label} label={label} value={value} icon={<Icon className="h-5 w-5" />} />)}
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 900;
      const animate = (time: number) => {
        const progress = Math.min(1, (time - start) / duration);
        setDisplay(Math.round(value * progress));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="rounded-[28px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#172a28] text-[#d4c09a]">{icon}</span>
      <p className="mt-5 text-5xl font-semibold tracking-tight">{display.toLocaleString()}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">{label}</p>
    </div>
  );
}

function StoryCard({ story }: { story: (typeof advocacyStories)[number] }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#d4c09a] text-[#172a28]"><Sparkles className="h-6 w-6" /></div>
      <p className="mt-6 text-base leading-8 text-white/76">“{story.story}”</p>
      <p className="mt-5 font-semibold text-white">{story.practiceName}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#d4c09a]">{story.state}</p>
    </article>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-[24px] border border-[#d8c6a8] bg-white/86 p-5 shadow-[0_14px_34px_rgba(24,18,13,0.05)]">
      <summary className="cursor-pointer list-none text-lg font-semibold text-[#172a28]"><span className="inline-flex items-center gap-3"><Scale className="h-5 w-5 text-[#8a7654]" />{question}</span></summary>
      <p className="mt-4 text-sm leading-7 text-[#625b53]">{answer}</p>
    </details>
  );
}
