import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import PracticeMattersDraftIssue, { type DraftNewsletterArticle } from "../../../components/newsletter/PracticeMattersDraftIssue";
import { canPreviewNewsletterDrafts } from "../../../../lib/newsletters/draftPreview";

export const metadata: Metadata = {
  title: "Practice Matters | Issue 003 Draft | Artisan Lab Network",
  description: "Internal editorial preview for Practice Matters Issue 003.",
  robots: { index: false, follow: false },
};

const articles: DraftNewsletterArticle[] = [
  {
    id: "delay-becomes-trust",
    number: "01",
    label: "Service Matters",
    title: "The Moment a Delay Becomes a Trust Problem",
    dek: "Most patients can understand a delay. Uncertainty and silence are much harder to forgive.",
    icon: "/icons/site/heart.svg",
    iconAlt: "",
    featureImage: { src: "/newsletter-assets/unity-office-1.jpg", alt: "Optical team members working together in a practice" },
    pullQuote: "The update is part of the product experience, not an interruption to it.",
    body: (
      <>
        <p>A delayed order is an operational event. It becomes a trust problem when the patient discovers it late, receives different answers from different people, or has to call more than once to learn what is happening.</p>
        <p>The practice may not control every timeline. It can control whether the patient feels forgotten.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Communicate before the promised moment</h3>
        <p>A useful update answers four questions: What changed? What is being done? When will the practice know more? Who owns the next contact?</p>
        <p>“Your lenses need additional time at the lab. We are reviewing the updated completion date now. I will contact you by Thursday afternoon even if the only update is that we are still waiting.” That is honest, specific, and owned.</p>
        <div className="border-l-4 border-[#a46f52] bg-[#f2e7da] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a7654]">The service rule</p>
          <p className="mt-2">Never make the patient wonder whether the practice remembers the order. Set the next contact before ending the current one.</p>
        </div>
      </>
    ),
  },
  {
    id: "follow-up-rhythm",
    number: "02",
    label: "Workflow",
    title: "Build a Follow-Up Rhythm the Whole Team Can See",
    dek: "A clear cadence turns follow-up from a good intention into a shared operating habit.",
    icon: "/icons/site/repeat.svg",
    iconAlt: "",
    body: (
      <>
        <p>Follow-up often fails in the space between people. One team member believes the lab will call. Another thinks the patient has already been updated. A note exists, but the next action does not.</p>
        <p>The solution is not more messages. It is a visible rhythm with an owner, a date, and a definition of done.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Make every open item answerable</h3>
        <ul className="ml-5 list-disc space-y-3 marker:text-[#a46f52]">
          <li><strong>Owner:</strong> one person responsible for moving the item forward.</li>
          <li><strong>Next action:</strong> a verb, not a vague status—call, verify, request, or update.</li>
          <li><strong>Next date:</strong> when the action should happen, even if no new information arrives.</li>
          <li><strong>Close condition:</strong> what must be true before the item leaves the list.</li>
        </ul>
        <p>A ten-minute review at the same time each day can prevent open items from aging invisibly. The team does not need to solve every case in the huddle; it needs to make ownership unmistakable.</p>
      </>
    ),
  },
  {
    id: "remakes-as-intelligence",
    number: "03",
    label: "Quality Review",
    title: "Treat Remake Review as Intelligence, Not Blame",
    dek: "A remake contains information about the process, the recommendation, and the patient experience.",
    icon: "/icons/site/chart-line.svg",
    iconAlt: "",
    featureImage: { src: "/newsletter-assets/unity-office-2.jpg", alt: "Optical professionals reviewing work together" },
    pullQuote: "The point of review is not to find the person who failed. It is to find the next process that can succeed more often.",
    body: (
      <>
        <p>Remakes are expensive in time, attention, and patient confidence. They are also one of the clearest sources of operational learning a practice has.</p>
        <p>A useful review begins by separating facts from assumptions. What did the patient report? What was measured? What was ordered? What changed between the original recommendation and the resolution?</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Look for patterns, not isolated stories</h3>
        <p>One event may be unusual. Repeated events point toward a process: inconsistent measurements, incomplete lifestyle discovery, unclear adaptation expectations, frame selection, transcription, or a handoff that lost important context.</p>
        <p>Review a small sample monthly and choose one improvement to test. A practice learns more from a modest change that is consistently used than from a long list of observations no one owns.</p>
        <div className="border-l-4 border-[#a46f52] bg-[#f2e7da] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a7654]">Ask after resolution</p>
          <p className="mt-2">What did this case teach us that could make the next patient&apos;s experience easier?</p>
        </div>
      </>
    ),
  },
  {
    id: "notes-that-travel",
    number: "04",
    label: "Team Communication",
    title: "Write Notes That Can Travel Without You",
    dek: "The best internal note gives the next person enough context to act with confidence.",
    icon: "/icons/site/file-text.svg",
    iconAlt: "",
    tone: "dark",
    body: (
      <>
        <p>“Patient called. Please advise.” The note records that something happened, but it does not help the next person understand the need, the promise, or the next step.</p>
        <p>A strong note should travel across a shift change, a day off, or a different department without requiring the original writer to translate it.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-white">Capture context in four lines</h3>
        <ul className="ml-5 list-disc space-y-3 text-white/82 marker:text-[#d9c394]">
          <li><strong>Reason:</strong> why the patient or lab made contact.</li>
          <li><strong>Current state:</strong> what is known right now.</li>
          <li><strong>Promise:</strong> what the patient was told and by when.</li>
          <li><strong>Next owner:</strong> who acts next and what they will do.</li>
        </ul>
        <p>The goal is not a long narrative. It is enough context to protect continuity. A patient should not have to restart the story because a different team member answered the phone.</p>
      </>
    ),
  },
  {
    id: "measure-what-patients-feel",
    number: "05",
    label: "Practice Scorecard",
    title: "Measure the Parts of Service Patients Actually Feel",
    dek: "Turnaround matters, but so do ownership, clarity, and the time a patient spends without an answer.",
    icon: "/icons/site/badge-check.svg",
    iconAlt: "",
    tone: "warm",
    featureImage: { src: "/newsletter-assets/independence-2.jpg", alt: "Patient receiving personal service in an independent practice" },
    body: (
      <>
        <p>Average turnaround is useful, but it cannot tell the whole service story. A patient may accept a longer timeline and still feel well cared for. Another may receive an order quickly but remember confusion, repeated calls, or an unresolved concern.</p>
        <p>A small practice scorecard should include the parts of service the patient can feel directly.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Start with four practical signals</h3>
        <ol className="ml-5 list-decimal space-y-3 marker:font-semibold marker:text-[#a46f52]">
          <li><strong>Promise accuracy:</strong> how often the order was ready when the patient was told it would be.</li>
          <li><strong>Proactive updates:</strong> whether the practice contacted the patient before a missed expectation.</li>
          <li><strong>Open-item age:</strong> how long unresolved questions remained without a next action.</li>
          <li><strong>Recovery follow-through:</strong> whether the patient received a check-in after a problem was resolved.</li>
        </ol>
        <p>Use the numbers to start a conversation, not to punish the team. Choose one signal, watch it for a month, and ask what behavior would improve it. A useful metric should make the next action clearer.</p>
        <p>The goal is not perfect service. It is a practice that notices sooner, communicates more clearly, and learns in a way the patient can feel.</p>
      </>
    ),
  },
];

export default async function PracticeMattersIssue003Page() {
  await connection();
  if (!canPreviewNewsletterDrafts()) notFound();

  return (
    <PracticeMattersDraftIssue
      issueLabel="Issue 003"
      publicationDate="September 2026"
      readTime="11 minute read"
      subheading="Service, turnaround, and the operating habits that protect trust when the day does not go exactly as planned."
      intro="Patients do not see every step behind an order. They do feel whether the practice remembers, communicates, and takes ownership when something changes."
      articles={articles}
    />
  );
}
