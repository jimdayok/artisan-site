import Image from "next/image";
import {
  GOVERNMENT_PROGRAM_EXCLUSION,
  PROGRAM_CATALOG,
  STORY_MODULES,
  calculateServiceImprovement,
  formatSpecialPricingRule,
  proposalPriceListTitle,
  type ProgramProposalDraft,
  type ProgramStudioPriceListOption,
} from "@/lib/portal/programProposal";

function formatDate(value: string) {
  const parsed = new Date(value + "T12:00:00");
  if (Number.isNaN(parsed.getTime())) return value || "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(parsed);
}

function commitment(draft: ProgramProposalDraft) {
  if (!draft.commitmentValue) return "No minimum volume commitment stated";
  const amount =
    draft.commitmentBasis === "sales"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(draft.commitmentValue)
      : new Intl.NumberFormat("en-US").format(draft.commitmentValue) + " lens pairs";
  return amount + " " + draft.commitmentPeriod;
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="aps-section-heading">
      <div className="aps-section-number" aria-hidden="true" />
      <p className="aps-kicker">{kicker}</p>
      <h2>{title}</h2>
    </div>
  );
}

export default function ProposalDocument({
  draft,
  priceLists,
}: {
  draft: ProgramProposalDraft;
  priceLists: ProgramStudioPriceListOption[];
}) {
  const selectedPrograms = PROGRAM_CATALOG.filter((program) =>
    draft.selectedPrograms.includes(program.code)
  );
  const selectedPriceLists = priceLists.filter((priceList) =>
    draft.selectedPriceLists.includes(priceList.code)
  );
  const selectedStories = STORY_MODULES.filter((module) =>
    draft.selectedStoryModules.includes(module.code)
  );
  const serviceImprovement = calculateServiceImprovement(
    draft.currentTurnDays,
    draft.artisanTurnDays
  );
  const vspProducts = draft.productCrosswalk.filter((row) => row.vspProduct.trim());

  return (
    <article className="aps-proposal" aria-label="Customer proposal preview">
      <section className="aps-proposal-cover">
        <header className="aps-proposal-brand">
          <Image src="/aln-white-logo.png" alt="Artisan Lab Network" width={212} height={100} priority />
          <span>Confidential partnership proposal</span>
        </header>
        <div className="aps-cover-copy">
          <p>Prepared exclusively for</p>
          <h1>{draft.customerName || "Customer name"}</h1>
          <h2>{draft.locationName || "Customer location"}</h2>
          <div className="aps-gold-rule" />
          <h3>{draft.proposalTitle}</h3>
          <p className="aps-cover-thesis">More choice. More control. A lab relationship built around your practice.</p>
        </div>
        <dl className="aps-cover-facts">
          <div><dt>Servicing lab</dt><dd>{draft.lab || "To be selected"}</dd></div>
          <div><dt>Account</dt><dd>{draft.accountNumber || "New / pending"}</dd></div>
          <div><dt>Prepared by</dt><dd>{draft.preparedBy || "Artisan Lab Network"}</dd></div>
          <div><dt>Valid through</dt><dd>{formatDate(draft.validThrough)}</dd></div>
        </dl>
      </section>

      <section className="aps-proposal-section aps-executive-brief">
        <SectionHeading kicker="Executive brief" title="A clear recommendation, built around the way your practice works." />
        <p className="aps-lead">{draft.executiveSummary}</p>
        <div className="aps-priority-panel">
          <span>What we heard</span>
          <p>{draft.customerPriorities || "Customer priorities will be documented here."}</p>
        </div>
        {(draft.includeCostSavings || (draft.includeServiceImprovement && serviceImprovement)) ? (
          <div className="aps-proof-grid">
            {draft.includeCostSavings ? (
              <article><strong>{draft.costSavingsPercent || 0}%</strong><span>identified cost savings</span><p>{draft.costSavingsNotes}</p></article>
            ) : null}
            {draft.includeServiceImprovement && serviceImprovement ? (
              <article><strong>{serviceImprovement.relativeImprovementPercent}%</strong><span>relative service improvement</span><p>{draft.currentTurnDays} days today vs. {draft.artisanTurnDays} stated Artisan average; {serviceImprovement.turnaroundReductionPercent}% fewer turnaround days.</p></article>
            ) : null}
          </div>
        ) : null}
        <p className="aps-method-note">Any quantified outcome is based on the inputs and comparison basis stated in this proposal and should be validated against like-for-like eligible work.</p>
      </section>

      <section className="aps-proposal-section aps-partnership">
        <SectionHeading kicker="Why Artisan" title="Independent eye care deserves a better lab model." />
        <p className="aps-lead">Artisan Lab Network connects independent optical labs, experienced people, and practical operating support so practices can protect choice, improve execution, and build a stronger long-term position.</p>
        <div className="aps-story-grid">
          {selectedStories.length ? selectedStories.map((module) => (
            <article key={module.code}>
              <span aria-hidden="true" />
              <p>{module.title}</p>
              <h3>{module.shortTitle}</h3>
              <div>{module.body}</div>
            </article>
          )) : <p className="aps-empty">Select customer-facing story modules in the setup panel.</p>}
        </div>
        <div className="aps-origin-note"><strong>Built from real lab experience.</strong><span>Modern production, experienced optical judgment, and direct human support - connected across Pacific, Peak, and Pike Artisan Labs.</span></div>
      </section>

      {draft.productCrosswalk.length ? (
        <section className="aps-proposal-section aps-crosswalk-page">
          <SectionHeading kicker="Product strategy" title="A product path the team can use with confidence." />
          <p className="aps-lead">The crosswalk separates the primary Artisan recommendation from the VSP path, giving staff a practical reference for consistent patient conversations and ordering.</p>
          <div className="aps-crosswalk-table" role="table" aria-label="Recommended product crosswalk">
            <div role="row" className="aps-crosswalk-head"><span role="columnheader">Patient need</span><span role="columnheader">Current</span><span role="columnheader">Artisan recommendation</span><span role="columnheader">VSP path</span></div>
            {draft.productCrosswalk.map((row) => (
              <div role="row" key={row.id}>
                <div role="cell"><strong>{row.category || "Custom mapping"}</strong>{row.rationale ? <small>{row.rationale}</small> : null}</div>
                <span role="cell">{row.currentProduct || "To confirm"}</span>
                <span role="cell" className="is-recommended">{row.artisanProduct || "To confirm"}</span>
                <span role="cell">{row.vspProduct || "Not specified"}</span>
              </div>
            ))}
          </div>
          <p className="aps-method-note">Final product availability, VSP eligibility, network requirements, authorization, materials, and ordering codes must be confirmed before live orders.</p>
        </section>
      ) : null}

      {draft.selectedStoryModules.includes("freedom-of-choice") ? (
        <section className="aps-proposal-section aps-transition-page">
          <SectionHeading kicker="Freedom of choice" title="Move eligible work with intention - not disruption." />
          <div className="aps-transition-statement">
            <p>Managed-care rules should be separated from the broader lab strategy. Artisan helps the practice identify where plan direction applies, where genuine choice remains, and how to transition eligible business without creating confusion for staff or patients.</p>
          </div>
          <div className="aps-phase-grid">
            {[
              ["01", "Map", "Review current products, payer mix, ordering paths, pricing, and service pain points."],
              ["02", "Validate", "Confirm eligibility, VSP routing, account configuration, product availability, and team readiness."],
              ["03", "Launch", "Begin with an agreed first wave of work, supported by training and first-order review."],
              ["04", "Measure", "Track turnaround, service, remake patterns, savings, and staff confidence before expanding."],
            ].map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
          <div className="aps-transition-notes"><span>Customer-specific transition plan</span><p>{draft.transitionNotes}</p></div>
          {vspProducts.length ? <div className="aps-vsp-summary"><span>Planned VSP products</span><div>{vspProducts.map((row) => <b key={row.id}>{row.category || "Product"}: {row.vspProduct}</b>)}</div></div> : null}
          <p className="aps-method-note">This plan does not override managed-care contracts, plan rules, lab assignments, authorizations, or reimbursement requirements.</p>
        </section>
      ) : null}

      <section className="aps-proposal-section aps-programs">
        <SectionHeading kicker="Your program" title={"A focused package for " + (draft.customerName || "your practice") + "."} />
        <div className="aps-program-list">
          {selectedPrograms.length ? selectedPrograms.map((program, index) => (
            <article key={program.code}>
              <div className="aps-program-index">{String(index + 1).padStart(2, "0")}</div>
              <div><h3>{program.name}</h3><p>{program.summary}</p>{draft.programNotes[program.code] ? <p className="aps-program-note">{draft.programNotes[program.code]}</p> : null}</div>
            </article>
          )) : <p className="aps-empty">Select programs on the setup side to build this section.</p>}
        </div>
        <div className="aps-implementation-band"><span>Implementation support included</span><p>Account setup · product validation · ordering guidance · staff education · first-order review · performance follow-up</p></div>
      </section>

      <section className="aps-proposal-section aps-commercials">
        <SectionHeading kicker="Commercial framework" title="Clear terms. Fewer surprises. One accountable plan." />
        <div className="aps-term-grid">
          <article><span>Commitment</span><strong>{commitment(draft)}</strong><p>{GOVERNMENT_PROGRAM_EXCLUSION}</p></article>
          <article><span>Second-pair window</span><strong>{draft.secondPairDays} days</strong><p>Eligible second-pair orders must be placed within the stated window.</p></article>
          <article><span>Remake allowance</span><strong>{draft.multipleRemakes ? "Up to " + draft.remakeLimit + " approved remakes" : "Standard Artisan policy"}</strong><p>{draft.warrantyNotes || "Product- and vendor-specific requirements still apply."}</p></article>
        </div>
        {draft.specialPricing.length ? (
          <div className="aps-special-pricing"><div><p className="aps-kicker">Approved exceptions</p><h3>Special line-item pricing</h3></div><div className="aps-special-table" role="table" aria-label="Special pricing">{draft.specialPricing.map((rule) => <div role="row" key={rule.id}><div role="cell"><strong>{rule.productName || "Unnamed product"}</strong><span>{rule.priceListCodes.join(" · ") || "All attached lists"}</span>{rule.notes ? <small>{rule.notes}</small> : null}</div><b role="cell">{formatSpecialPricingRule(rule)}</b></div>)}</div></div>
        ) : null}
        <div className="aps-price-list-summary"><p className="aps-kicker">Attached pricing</p><div>{selectedPriceLists.map((priceList) => <span key={priceList.code}><b>{priceList.code}</b>{proposalPriceListTitle(priceList.code, draft.isAcquiosMember, priceList.label)}</span>)}</div></div>
        <div className="aps-terms-copy"><h3>Proposal terms</h3><p>{draft.additionalTerms}</p><p className="aps-government-notice">{GOVERNMENT_PROGRAM_EXCLUSION}</p></div>
      </section>

      <section className="aps-proposal-close">
        <Image src="/aln-white-logo.png" alt="Artisan Lab Network" width={160} height={75} />
        <p>Recommended next step</p>
        <h2>{draft.nextStep}</h2>
        <div><span>Prepared by</span><strong>{draft.preparedBy}</strong><a href={"mailto:" + draft.preparedByEmail}>{draft.preparedByEmail}</a></div>
      </section>
    </article>
  );
}
