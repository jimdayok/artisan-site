import Image from "next/image";
import {
  GOVERNMENT_PROGRAM_EXCLUSION,
  PROGRAM_CATALOG,
  formatSpecialPricingRule,
  proposalPriceListTitle,
  type ProgramProposalDraft,
  type ProgramStudioPriceListOption,
} from "@/lib/portal/programProposal";

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value || "—";
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
      : `${new Intl.NumberFormat("en-US").format(draft.commitmentValue)} lens pairs`;
  return `${amount} ${draft.commitmentPeriod}`;
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

  return (
    <article className="aps-proposal" aria-label="Customer proposal preview">
      <section className="aps-proposal-cover">
        <header className="aps-proposal-brand">
          <Image src="/aln-white-logo.png" alt="Artisan Lab Network" width={185} height={87} />
          <span>Custom partnership proposal</span>
        </header>
        <div className="aps-cover-copy">
          <p>Prepared exclusively for</p>
          <h1>{draft.customerName || "Customer name"}</h1>
          <h2>{draft.locationName || "Customer location"}</h2>
          <div className="aps-gold-rule" />
          <h3>{draft.proposalTitle}</h3>
        </div>
        <dl className="aps-cover-facts">
          <div>
            <dt>Servicing lab</dt>
            <dd>{draft.lab || "To be selected"}</dd>
          </div>
          <div>
            <dt>Account</dt>
            <dd>{draft.accountNumber || "New / pending"}</dd>
          </div>
          <div>
            <dt>Prepared by</dt>
            <dd>{draft.preparedBy || "Artisan Lab Network"}</dd>
          </div>
          <div>
            <dt>Valid through</dt>
            <dd>{formatDate(draft.validThrough)}</dd>
          </div>
        </dl>
      </section>

      <section className="aps-proposal-section aps-partnership">
        <div className="aps-section-number">01</div>
        <div>
          <p className="aps-kicker">The Artisan difference</p>
          <h2>A lab relationship designed around your practice.</h2>
          <p className="aps-lead">
            Artisan Lab Network brings together independent optical labs, experienced
            people, and practical programs to help your team serve patients with more
            confidence. This proposal is built for your location—not pulled from a
            one-size-fits-all package.
          </p>
        </div>
        <div className="aps-benefit-grid">
          {[
            ["People who know your account", "Direct access to a responsive lab team that understands your preferences, history, and priorities."],
            ["Technical depth", "Practical support for lens selection, troubleshooting, specialty work, and the conversations your team has every day."],
            ["Independent choice", "A broad product portfolio and flexible program structure built to support independent eyecare."],
            ["Clear commercial terms", "Selected programs, pricing, commitments, and exceptions are documented together for easier implementation."],
          ].map(([title, body]) => (
            <article key={title}>
              <span aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="aps-proposal-section aps-programs">
        <div className="aps-section-number">02</div>
        <div>
          <p className="aps-kicker">Your program</p>
          <h2>A focused package for {draft.customerName || "your practice"}.</h2>
        </div>
        <div className="aps-program-list">
          {selectedPrograms.length ? (
            selectedPrograms.map((program, index) => (
              <article key={program.code}>
                <div className="aps-program-index">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{program.name}</h3>
                  <p>{program.summary}</p>
                  {draft.programNotes[program.code] ? (
                    <p className="aps-program-note">{draft.programNotes[program.code]}</p>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="aps-empty">Select programs on the setup side to build this section.</p>
          )}
        </div>
      </section>

      <section className="aps-proposal-section aps-commercials">
        <div className="aps-section-number">03</div>
        <div>
          <p className="aps-kicker">Commercial framework</p>
          <h2>Pricing, commitment, and service terms in one place.</h2>
        </div>

        <div className="aps-term-grid">
          <article>
            <span>Commitment</span>
            <strong>{commitment(draft)}</strong>
            <p>{GOVERNMENT_PROGRAM_EXCLUSION}</p>
          </article>
          <article>
            <span>Second-pair window</span>
            <strong>{draft.secondPairDays} days</strong>
            <p>Eligible second-pair orders must be placed within the stated window.</p>
          </article>
          <article>
            <span>Remake allowance</span>
            <strong>
              {draft.multipleRemakes
                ? `Up to ${draft.remakeLimit} approved remakes`
                : "Standard Artisan policy"}
            </strong>
            <p>{draft.warrantyNotes || "Product- and vendor-specific requirements still apply."}</p>
          </article>
        </div>

        {draft.specialPricing.length ? (
          <div className="aps-special-pricing">
            <div>
              <p className="aps-kicker">Approved exceptions</p>
              <h3>Special line-item pricing</h3>
            </div>
            <div className="aps-special-table" role="table" aria-label="Special pricing">
              {draft.specialPricing.map((rule) => (
                <div role="row" key={rule.id}>
                  <div role="cell">
                    <strong>{rule.productName || "Unnamed product"}</strong>
                    <span>{rule.priceListCodes.join(" · ") || "All attached lists"}</span>
                    {rule.notes ? <small>{rule.notes}</small> : null}
                  </div>
                  <b role="cell">{formatSpecialPricingRule(rule)}</b>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="aps-price-list-summary">
          <p className="aps-kicker">Attached pricing</p>
          <div>
            {selectedPriceLists.map((priceList) => (
              <span key={priceList.code}>
                <b>{priceList.code}</b>
                {proposalPriceListTitle(
                  priceList.code,
                  draft.isAcquiosMember,
                  priceList.label
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="aps-terms-copy">
          <h3>Proposal terms</h3>
          <p>{draft.additionalTerms}</p>
          <p className="aps-government-notice">{GOVERNMENT_PROGRAM_EXCLUSION}</p>
        </div>
      </section>

      <footer className="aps-proposal-footer">
        <div>
          <Image src="/aln-white-logo.png" alt="" width={120} height={57} />
          <span>Independent labs. Shared strength. Better partnership.</span>
        </div>
        <div>
          <strong>{draft.preparedBy}</strong>
          <span>{draft.preparedByEmail}</span>
          <span>Proposal date {formatDate(draft.proposalDate)}</span>
        </div>
      </footer>
    </article>
  );
}
