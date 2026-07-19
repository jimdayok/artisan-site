import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import PracticeMattersDraftIssue, { type DraftNewsletterArticle } from "../../../components/newsletter/PracticeMattersDraftIssue";
import { canPreviewNewsletterDrafts } from "../../../../lib/newsletters/draftPreview";

export const metadata: Metadata = {
  title: "Practice Matters | Issue 002 Draft | Artisan Lab Network",
  description: "Internal editorial preview for Practice Matters Issue 002.",
  robots: { index: false, follow: false },
};

const articles: DraftNewsletterArticle[] = [
  {
    id: "the-thirty-second-handoff",
    number: "01",
    label: "Practice Experience",
    title: "The 30-Second Handoff That Changes the Lens Conversation",
    dek: "A better transition from exam room to optical gives the recommendation context before the product discussion begins.",
    icon: "/icons/site/message-circle.svg",
    iconAlt: "",
    featureImage: { src: "/newsletter-assets/independence-1.jpg", alt: "Eye care team members speaking together" },
    pullQuote: "A useful handoff does not prescribe the script. It gives the next person a reason to continue the conversation.",
    body: (
      <>
        <p>The patient has already told the doctor what matters: night driving feels harder, screen work stretches late, or the current progressive never quite became comfortable. Then the patient reaches optical and the conversation starts over with, “So, what are we looking for today?”</p>
        <p>That reset costs more than time. It can make the recommendation feel disconnected from the exam and puts the patient in the position of translating clinical needs into product language.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Carry one need and one reason forward</h3>
        <p>A strong handoff can be brief: name the need, explain why it matters, and invite the optician to continue. For example: “Maria drives after dark several nights a week and notices more strain than she used to. I&apos;d like you to walk her through the lens and treatment options that could make that part of her day more comfortable.”</p>
        <p>The doctor has not selected a product or taken away the optician&apos;s judgment. The handoff simply makes the recommendation feel like one connected experience.</p>
        <div className="border-l-4 border-[#a46f52] bg-[#f2e7da] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a7654]">Try it this week</p>
          <p className="mt-2">Choose one common patient need and agree on a single handoff sentence the whole team can use naturally.</p>
        </div>
      </>
    ),
  },
  {
    id: "translate-the-feature",
    number: "02",
    label: "Lens Language",
    title: "Translate the Feature Before You Name It",
    dek: "Patients understand a recommendation faster when the benefit arrives before the terminology.",
    icon: "/icons/site/eye.svg",
    iconAlt: "",
    pullQuote: "The product name is not the explanation. It is the label that comes after the explanation makes sense.",
    body: (
      <>
        <p>Optical teams know the language of lens design, materials, treatments, and measurements. Patients usually know the language of their day: glare on wet roads, a laptop that sits just beyond comfortable reach, or glasses that feel heavy by late afternoon.</p>
        <p>When product terminology arrives first, the patient has to do the translation. When the outcome arrives first, the recommendation becomes easier to follow.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Use a simple sequence</h3>
        <ol className="ml-5 list-decimal space-y-3 marker:font-semibold marker:text-[#a46f52]">
          <li><strong>Reflect the need:</strong> “You mentioned that the dashboard and road do not feel equally comfortable.”</li>
          <li><strong>Describe the intended benefit:</strong> “I want to give you a more natural transition between those viewing areas.”</li>
          <li><strong>Name the recommendation:</strong> introduce the design, treatment, or material and explain why it fits.</li>
          <li><strong>Check understanding:</strong> ask the patient what part of the recommendation feels most useful.</li>
        </ol>
        <p>This is not about avoiding technical expertise. It is about ordering the explanation so that expertise becomes meaningful. The patient should be able to repeat the reason for the recommendation in their own words.</p>
      </>
    ),
  },
  {
    id: "second-pair-by-the-day",
    number: "03",
    label: "Second-Pair Strategy",
    title: "Build the Second Pair From the Day, Not the Discount",
    dek: "A second pair is easier to understand when it solves a different job than the first.",
    icon: "/icons/site/layers.svg",
    iconAlt: "",
    featureImage: { src: "/newsletter-assets/chemistrie-product-2.jpg", alt: "Multiple eyewear options arranged together" },
    body: (
      <>
        <p>A discount can make a second pair less expensive. It does not, by itself, make the second pair relevant.</p>
        <p>Relevance comes from contrast. The primary pair may be designed for the broadest part of the patient&apos;s day. The second pair should have a distinct assignment: concentrated near work, outdoor light, safety, driving, hobbies, or another environment with different demands.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Map the patient&apos;s day</h3>
        <p>Ask the patient to picture a normal weekday and a normal weekend. Where do the current glasses do well? Where does the patient remove them, work around them, or simply accept discomfort?</p>
        <p>Then give each pair a job description. “This is the pair that moves with you through most of the day. This second pair is built for the three hours you spend at your workbench.” That explanation is more credible than presenting a second pair as an add-on.</p>
        <div className="border-l-4 border-[#a46f52] bg-[#f2e7da] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a7654]">Team prompt</p>
          <p className="mt-2">Before mentioning an offer, finish this sentence: “Your first pair is for ____. Your second pair would be for ____.”</p>
        </div>
      </>
    ),
  },
  {
    id: "five-minute-huddle",
    number: "04",
    label: "Team Development",
    title: "The Five-Minute Recommendation Huddle",
    dek: "Short, frequent practice builds more confidence than an occasional hour of product overload.",
    icon: "/icons/site/users.svg",
    iconAlt: "",
    tone: "dark",
    pullQuote: "Confidence grows when the team has a safe place to find the words before a patient is waiting for them.",
    body: (
      <>
        <p>Product training can deliver a great deal of information and still leave the team unsure how to begin a patient conversation. Knowing more and saying it clearly are different skills.</p>
        <p>A five-minute huddle closes that gap. Choose one patient situation, one recommendation, and one objection. Let one person practice the explanation while the rest of the team listens for clarity—not perfection.</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-white">A repeatable weekly rhythm</h3>
        <ul className="ml-5 list-disc space-y-3 text-white/82 marker:text-[#d9c394]">
          <li>Monday: name the patient situation.</li>
          <li>Tuesday: practice the recommendation in thirty seconds.</li>
          <li>Wednesday: answer one common question or hesitation.</li>
          <li>Thursday: make the language simpler.</li>
          <li>Friday: share what worked with a real patient.</li>
        </ul>
        <p>The goal is not to produce identical scripts. It is to give every team member a clear starting point and the confidence to make the words their own.</p>
      </>
    ),
  },
  {
    id: "confidence-at-pickup",
    number: "05",
    label: "Field Note",
    title: "What Confidence Sounds Like at Pickup",
    dek: "The final handoff should remind the patient what was chosen, what to notice, and what support remains available.",
    icon: "/icons/site/badge-check.svg",
    iconAlt: "",
    tone: "warm",
    featureImage: { src: "/newsletter-assets/independence-3.jpg", alt: "An optician helping a patient with eyewear" },
    body: (
      <>
        <p>Pickup is often treated as the end of the transaction. For the patient, it is the beginning of the product experience.</p>
        <p>A thoughtful pickup reconnects the finished eyewear to the original need. Instead of stopping at fit and care instructions, remind the patient why the recommendation was made: “We chose this design because you wanted a more comfortable transition between your workstation and the room. Pay attention to that movement over the next several days.”</p>
        <h3 className="font-[family-name:Georgia,serif] text-2xl text-[#142033]">Close with three points</h3>
        <ul className="ml-5 list-disc space-y-3 marker:text-[#a46f52]">
          <li><strong>What we chose:</strong> a short reminder of the recommendation.</li>
          <li><strong>What to notice:</strong> the real-life outcome the patient should watch for.</li>
          <li><strong>What happens next:</strong> when and how to contact the practice with questions.</li>
        </ul>
        <p>That close communicates confidence without promising perfection. It tells the patient that the practice remembers the purpose of the eyewear and remains part of the experience after pickup.</p>
      </>
    ),
  },
];

export default async function PracticeMattersIssue002Page() {
  await connection();
  if (!canPreviewNewsletterDrafts()) notFound();

  return (
    <PracticeMattersDraftIssue
      issueLabel="Issue 002"
      publicationDate="August 2026"
      readTime="10 minute read"
      subheading="Product conversations that build confidence—without making the patient feel like they are being given a pitch."
      intro="Confidence is not louder language. It is a clear connection between what the patient said, what the practice recommends, and what should feel different afterward."
      articles={articles}
    />
  );
}
