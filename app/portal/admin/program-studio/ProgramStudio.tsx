"use client";

import Link from "next/link";
import {
  ArrowRightLeft,
  Check,
  ChevronDown,
  ClipboardCopy,
  Download,
  FileText,
  Mail,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  GOVERNMENT_PROGRAM_EXCLUSION,
  PROGRAM_CATALOG,
  PROPOSAL_TEMPLATES,
  STORY_MODULES,
  calculateServiceImprovement,
  createProgramProposalDraft,
  proposalEmailBody,
  proposalEmailSubject,
  proposalPriceListTitle,
  proposalReadiness,
  type ProductCrosswalkRow,
  type ProgramCode,
  type ProgramProposalDraft,
  type ProgramStudioCustomer,
  type ProgramStudioPriceListOption,
  type ProposalTemplateCode,
  type SpecialPricingKind,
  type StoryModuleCode,
} from "@/lib/portal/programProposal";
import ProposalDocument from "./ProposalDocument";

const DRAFT_STORAGE_KEY = "artisan-program-studio-draft-v1";
const LABS = ["Pacific Artisan Labs", "Peak Artisan Labs", "Pike Artisan Labs"];
const PRODUCT_STARTERS = [
  { category: "Premium progressive", artisanProduct: "DS Stable", vspProduct: "Unity V3 Elite" },
  { category: "Advanced progressive", artisanProduct: "PS Steady", vspProduct: "Unity V3 Plus" },
  { category: "Everyday progressive", artisanProduct: "GS Balance", vspProduct: "Unity V3" },
  { category: "Standard progressive", artisanProduct: "CFB", vspProduct: "Unity Ethos" },
  { category: "Anti-fatigue", artisanProduct: "SD Concept", vspProduct: "Unity Relieve" },
  { category: "Office / workspace", artisanProduct: "SD Reach", vspProduct: "Unity Via Office Pro" },
  { category: "Premium AR treatment", artisanProduct: "Nytopia", vspProduct: "TechShield Elite" },
] as const;
const PRODUCT_SUGGESTIONS = [
  "DS Stable", "PS Steady", "GS Balance", "CFB", "SD Concept", "SD Reach",
  "Unity V3 Elite", "Unity V3 Plus", "Unity V3", "Unity Ethos", "Unity Relieve",
  "Unity Via Office Pro", "Varilux XR Design", "Varilux X Design", "Varilux Comfort Max",
  "Varilux Comfort DRx", "Eyezen", "Varilux Immersia", "Shamir Intelligence",
  "Shamir Autograph III", "Shamir InTouch", "Shamir Genesis HD", "Shamir Relax",
  "Shamir Workspace", "Nytopia", "Azure", "Armour", "Emerald", "TechShield Elite",
  "TechShield Plus", "TechShield", "Crizal Sapphire", "Crizal Prevencia", "Crizal Rock",
].sort();

type StudioPanel = "setup" | "proposal";

function safeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "customer"
  );
}

export default function ProgramStudio({
  currentUser,
  customers,
  priceLists,
  today,
}: {
  currentUser: { email: string; name: string; role: string };
  customers: ProgramStudioCustomer[];
  priceLists: ProgramStudioPriceListOption[];
  today: string;
}) {
  const availableCodes = useMemo(
    () => new Set(priceLists.map((priceList) => priceList.code)),
    [priceLists]
  );
  const defaultPriceListCode = availableCodes.has("P6")
    ? "P6"
    : priceLists[0]?.code || "";
  const freshDraft = useMemo(
    () =>
      createProgramProposalDraft({
        today,
        preparedBy: currentUser.name,
        preparedByEmail: currentUser.email,
        defaultPriceListCode,
      }),
    [currentUser.email, currentUser.name, defaultPriceListCode, today]
  );
  const [draft, setDraft] = useState<ProgramProposalDraft>(freshDraft);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [activePanel, setActivePanel] = useState<StudioPanel>("setup");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState<"subject" | "email" | "">("");
  const readiness = useMemo(() => proposalReadiness(draft), [draft]);
  const serviceImprovement = useMemo(
    () => calculateServiceImprovement(draft.currentTurnDays, draft.artisanTurnDays),
    [draft.artisanTurnDays, draft.currentTurnDays]
  );
  const emailSubject = useMemo(() => proposalEmailSubject(draft), [draft]);
  const emailBody = useMemo(() => proposalEmailBody(draft), [draft]);

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as ProgramProposalDraft;
      queueMicrotask(() => {
        setDraft({
          ...freshDraft,
          ...parsed,
          selectedPriceLists: (parsed.selectedPriceLists || []).filter((code) =>
            availableCodes.has(code)
          ),
          specialPricing: (parsed.specialPricing || []).map((rule) => ({
            ...rule,
            priceListCodes: (rule.priceListCodes || []).filter((code) =>
              availableCodes.has(code)
            ),
          })),
          selectedStoryModules: (parsed.selectedStoryModules || freshDraft.selectedStoryModules).filter(
            (code) => STORY_MODULES.some((module) => module.code === code)
          ),
          productCrosswalk: (parsed.productCrosswalk || []).slice(0, 18),
          preparedBy: currentUser.name,
          preparedByEmail: currentUser.email,
        });
        setStatus("Recovered the last draft saved in this browser.");
      });
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [availableCodes, currentUser.email, currentUser.name, freshDraft]);

  function update<K extends keyof ProgramProposalDraft>(
    field: K,
    value: ProgramProposalDraft[K]
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setStatus("");
    setError("");
  }

  function toggleProgram(code: ProgramCode) {
    update(
      "selectedPrograms",
      draft.selectedPrograms.includes(code)
        ? draft.selectedPrograms.filter((value) => value !== code)
        : [...draft.selectedPrograms, code]
    );
  }

  function togglePriceList(code: string) {
    update(
      "selectedPriceLists",
      draft.selectedPriceLists.includes(code)
        ? draft.selectedPriceLists.filter((value) => value !== code)
        : [...draft.selectedPriceLists, code]
    );
  }

  function toggleStoryModule(code: StoryModuleCode) {
    update(
      "selectedStoryModules",
      draft.selectedStoryModules.includes(code)
        ? draft.selectedStoryModules.filter((value) => value !== code)
        : [...draft.selectedStoryModules, code]
    );
  }

  function applyTemplate(code: ProposalTemplateCode) {
    const template = PROPOSAL_TEMPLATES.find((entry) => entry.code === code);
    if (!template) return;
    setDraft((current) => ({
      ...current,
      templateCode: code,
      executiveSummary: template.executiveSummary,
      customerPriorities: template.customerPriorities,
      transitionNotes: template.transitionNotes,
      nextStep: template.nextStep,
      selectedStoryModules: [...template.storyModules],
    }));
    setStatus(`${template.name} narrative applied. Customer and commercial terms were preserved.`);
    setError("");
  }

  function addProductCrosswalk(starter?: (typeof PRODUCT_STARTERS)[number]) {
    const row: ProductCrosswalkRow = {
      id: window.crypto.randomUUID(),
      category: starter?.category || "",
      currentProduct: "",
      artisanProduct: starter?.artisanProduct || "",
      vspProduct: starter?.vspProduct || "",
      rationale: "",
    };
    update("productCrosswalk", [...draft.productCrosswalk, row]);
  }

  function updateProductCrosswalk(id: string, changes: Partial<ProductCrosswalkRow>) {
    update(
      "productCrosswalk",
      draft.productCrosswalk.map((row) => row.id === id ? { ...row, ...changes } : row)
    );
  }

  async function copyEmailPart(part: "subject" | "email", content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(part);
      setStatus(part === "subject" ? "Email subject copied." : "Email message copied. Review it before sending.");
      window.setTimeout(() => setCopied(""), 2_000);
    } catch {
      setError("The browser could not copy that text. Select it manually instead.");
    }
  }

  function selectCustomer(id: string) {
    setSelectedCustomerId(id);
    if (!id) return;
    const customer = customers.find((entry) => entry.id === id);
    if (!customer) return;
    const customerCodes = customer.priceListCodes.filter((code) =>
      availableCodes.has(code)
    );
    setDraft((current) => ({
      ...current,
      customerName: customer.name,
      locationName: customer.location || customer.address,
      accountNumber: customer.accountNumber,
      customerAddress: customer.address,
      lab: customer.lab || current.lab,
      isAcquiosMember: customer.isAcquiosMember,
      selectedPriceLists: customerCodes.length
        ? customerCodes
        : current.selectedPriceLists.length
          ? current.selectedPriceLists
          : defaultPriceListCode
            ? [defaultPriceListCode]
            : [],
    }));
    setStatus(`Loaded ${customer.name}. Review every proposal term before export.`);
    setError("");
  }

  function addSpecialPricing() {
    const id = window.crypto.randomUUID();
    update("specialPricing", [
      ...draft.specialPricing,
      {
        id,
        productName: "Varilux Comfort Max",
        kind: "fixed-price",
        amount: 0,
        priceListCodes: [...draft.selectedPriceLists],
        notes: "",
      },
    ]);
  }

  function updateSpecialPricing(
    id: string,
    changes: Partial<ProgramProposalDraft["specialPricing"][number]>
  ) {
    update(
      "specialPricing",
      draft.specialPricing.map((rule) =>
        rule.id === id ? { ...rule, ...changes } : rule
      )
    );
  }

  function saveDraft() {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setStatus("Draft saved in this browser.");
    setError("");
  }

  function resetDraft() {
    setDraft(freshDraft);
    setSelectedCustomerId("");
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setStatus("Started a new proposal.");
    setError("");
  }

  async function downloadPdf() {
    if (!readiness.ready) {
      setError(`Complete ${readiness.missing.join(", ")} before creating the PDF.`);
      setActivePanel("setup");
      return;
    }
    setDownloading(true);
    setError("");
    setStatus("Building the proposal and attaching price lists…");
    try {
      const response = await fetch("/portal/admin/program-studio/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || "The proposal PDF could not be created.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Artisan-Proposal-${safeFilename(draft.customerName)}-${draft.proposalDate}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setStatus("Proposal PDF created with the selected price-list attachments.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The proposal PDF could not be created."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="aps-app">
      <header className="aps-app-header">
        <div>
          <p>Artisan Lab Network</p>
          <h1>Program Studio</h1>
          <span>
            {currentUser.name} · {currentUser.role}
          </span>
        </div>
        <div className="aps-header-actions">
          <Link href="/portal/admin" className="aps-button aps-button-quiet">
            Dashboard
          </Link>
          <button type="button" className="aps-button aps-button-quiet" onClick={resetDraft}>
            <RotateCcw /> New
          </button>
          <button type="button" className="aps-button aps-button-secondary" onClick={saveDraft}>
            <Save /> Save draft
          </button>
          <button
            type="button"
            className="aps-button aps-button-primary"
            onClick={downloadPdf}
            disabled={downloading}
          >
            <Download /> {downloading ? "Building PDF…" : "Download proposal"}
          </button>
        </div>
      </header>

      <nav className="aps-mobile-tabs" aria-label="Program Studio views">
        <button
          type="button"
          className={activePanel === "setup" ? "is-active" : ""}
          onClick={() => setActivePanel("setup")}
        >
          Setup
        </button>
        <button
          type="button"
          className={activePanel === "proposal" ? "is-active" : ""}
          onClick={() => setActivePanel("proposal")}
        >
          Customer proposal
        </button>
      </nav>

      {status || error ? (
        <div className={`aps-status${error ? " is-error" : ""}`} role={error ? "alert" : "status"}>
          {error || status}
        </div>
      ) : null}

      <div className="aps-workspace">
        <section className={`aps-builder${activePanel === "setup" ? " is-mobile-active" : ""}`}>
          <div className="aps-builder-intro">
            <div>
              <p>Proposal setup</p>
              <h2>Build the customer&apos;s program</h2>
            </div>
            <span className={readiness.ready ? "is-ready" : ""}>
              {readiness.ready ? <Check /> : <FileText />}
              {readiness.ready ? "Ready for PDF" : `${readiness.missing.length} items needed`}
            </span>
          </div>

          <fieldset className="aps-fieldset">
            <legend>Customer &amp; location</legend>
            <label className="aps-wide">
              <span>Load an existing customer (optional)</span>
              <div className="aps-select-wrap">
                <select value={selectedCustomerId} onChange={(event) => selectCustomer(event.target.value)}>
                  <option value="">Enter a new customer manually</option>
                  {customers.map((customer) => (
                    <option value={customer.id} key={customer.id}>
                      {customer.name} · {customer.accountNumber} · {customer.lab}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
            </label>
            <label>
              <span>Customer name</span>
              <input value={draft.customerName} onChange={(event) => update("customerName", event.target.value)} />
            </label>
            <label>
              <span>Primary contact (optional)</span>
              <input value={draft.customerContactName} onChange={(event) => update("customerContactName", event.target.value)} placeholder="First name or full name" />
            </label>
            <label>
              <span>Location</span>
              <input value={draft.locationName} onChange={(event) => update("locationName", event.target.value)} placeholder="City, state or location name" />
            </label>
            <label>
              <span>Account number (if available)</span>
              <input value={draft.accountNumber} onChange={(event) => update("accountNumber", event.target.value)} />
            </label>
            <label>
              <span>Servicing lab</span>
              <div className="aps-select-wrap">
                <select value={draft.lab} onChange={(event) => update("lab", event.target.value)}>
                  {LABS.map((lab) => <option key={lab}>{lab}</option>)}
                  {!LABS.includes(draft.lab) && draft.lab ? <option>{draft.lab}</option> : null}
                </select>
                <ChevronDown />
              </div>
            </label>
            <label className="aps-wide">
              <span>Customer address (optional)</span>
              <input value={draft.customerAddress} onChange={(event) => update("customerAddress", event.target.value)} />
            </label>
            <label className="aps-toggle aps-wide">
              <input type="checkbox" checked={draft.isAcquiosMember} onChange={(event) => update("isAcquiosMember", event.target.checked)} />
              <i aria-hidden="true" />
              <span>
                <strong>Acquios member</strong>
                <small>A6 will be titled “Acquios A6 Pricing.” Otherwise it will be titled “PMP A6.”</small>
              </span>
            </label>
          </fieldset>

          <fieldset className="aps-fieldset">
            <legend>Proposal details</legend>
            <label className="aps-wide">
              <span>Proposal title</span>
              <input value={draft.proposalTitle} onChange={(event) => update("proposalTitle", event.target.value)} />
            </label>
            <label>
              <span>Prepared by</span>
              <input value={draft.preparedBy} onChange={(event) => update("preparedBy", event.target.value)} />
            </label>
            <label>
              <span>Prepared by email</span>
              <input type="email" value={draft.preparedByEmail} onChange={(event) => update("preparedByEmail", event.target.value)} />
            </label>
            <label>
              <span>Proposal date</span>
              <input type="date" value={draft.proposalDate} onChange={(event) => update("proposalDate", event.target.value)} />
            </label>
            <label>
              <span>Valid through</span>
              <input type="date" value={draft.validThrough} onChange={(event) => update("validThrough", event.target.value)} />
            </label>
          </fieldset>

          <fieldset className="aps-fieldset aps-choice-fieldset">
            <legend>Proposal story &amp; template</legend>
            <div className="aps-template-bar">
              <label>
                <span>Starting narrative</span>
                <div className="aps-select-wrap">
                  <select value={draft.templateCode} onChange={(event) => update("templateCode", event.target.value as ProposalTemplateCode)}>
                    {PROPOSAL_TEMPLATES.map((template) => <option key={template.code} value={template.code}>{template.name}</option>)}
                  </select>
                  <ChevronDown />
                </div>
              </label>
              <button type="button" className="aps-button aps-button-secondary" onClick={() => applyTemplate(draft.templateCode)}>
                <Sparkles /> Apply template
              </button>
            </div>
            <p className="aps-field-help">{PROPOSAL_TEMPLATES.find((template) => template.code === draft.templateCode)?.description} Applying a template updates the narrative only; customer, pricing, and program choices stay intact.</p>
            <label className="aps-block-label">
              <span>Executive summary</span>
              <textarea className="aps-tall" value={draft.executiveSummary} onChange={(event) => update("executiveSummary", event.target.value)} />
            </label>
            <label className="aps-block-label">
              <span>Customer priorities / current-state findings</span>
              <textarea value={draft.customerPriorities} onChange={(event) => update("customerPriorities", event.target.value)} placeholder="What needs to change, and why now?" />
            </label>
            <span className="aps-input-label">Customer-facing story modules</span>
            <div className="aps-story-choices">
              {STORY_MODULES.map((module) => {
                const selected = draft.selectedStoryModules.includes(module.code);
                return (
                  <button type="button" key={module.code} className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => toggleStoryModule(module.code)}>
                    <span>{selected ? <Check /> : <Plus />}</span>
                    <div><strong>{module.title}</strong><small>{module.body}</small></div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="aps-fieldset aps-choice-fieldset aps-crosswalk-builder">
            <legend>Product &amp; VSP crosswalk</legend>
            <div className="aps-section-action">
              <p className="aps-field-help">Map what the practice uses today to the Artisan recommendation and the separate VSP product path. Product availability, plan rules, and authorization still require confirmation before ordering.</p>
              <button type="button" className="aps-button aps-button-secondary" onClick={() => addProductCrosswalk()}>
                <Plus /> Add custom row
              </button>
            </div>
            <div className="aps-starter-chips" aria-label="Product crosswalk starter rows">
              {PRODUCT_STARTERS.map((starter) => (
                <button type="button" key={starter.category} onClick={() => addProductCrosswalk(starter)}>
                  <Plus /> {starter.category}
                </button>
              ))}
            </div>
            <datalist id="aps-product-suggestions">
              {PRODUCT_SUGGESTIONS.map((product) => <option value={product} key={product} />)}
            </datalist>
            {draft.productCrosswalk.length ? (
              <div className="aps-crosswalk-list">
                {draft.productCrosswalk.map((row, index) => (
                  <article key={row.id}>
                    <header><span>{String(index + 1).padStart(2, "0")}</span><strong>{row.category || "Custom product mapping"}</strong></header>
                    <label><span>Category / patient need</span><input value={row.category} onChange={(event) => updateProductCrosswalk(row.id, { category: event.target.value })} placeholder="Everyday progressive" /></label>
                    <label><span>Current product</span><input list="aps-product-suggestions" value={row.currentProduct} onChange={(event) => updateProductCrosswalk(row.id, { currentProduct: event.target.value })} placeholder="What they use today" /></label>
                    <label><span>Artisan recommendation</span><input list="aps-product-suggestions" value={row.artisanProduct} onChange={(event) => updateProductCrosswalk(row.id, { artisanProduct: event.target.value })} placeholder="Private-pay / primary path" /></label>
                    <label><span>VSP product</span><input list="aps-product-suggestions" value={row.vspProduct} onChange={(event) => updateProductCrosswalk(row.id, { vspProduct: event.target.value })} placeholder="Plan-aligned path" /></label>
                    <label className="aps-wide"><span>Why this mapping fits</span><textarea value={row.rationale} onChange={(event) => updateProductCrosswalk(row.id, { rationale: event.target.value })} placeholder="Patient need, staff positioning, design similarity, or implementation note." /></label>
                    <button type="button" className="aps-remove" onClick={() => update("productCrosswalk", draft.productCrosswalk.filter((entry) => entry.id !== row.id))}><Trash2 /> Remove mapping</button>
                  </article>
                ))}
              </div>
            ) : <p className="aps-empty-state"><ArrowRightLeft /> Add a starter or custom row to build the side-by-side product recommendation.</p>}
          </fieldset>

          <fieldset className="aps-fieldset aps-proof-builder">
            <legend>Business case &amp; proof points</legend>
            <label className="aps-toggle aps-wide">
              <input type="checkbox" checked={draft.includeCostSavings} onChange={(event) => update("includeCostSavings", event.target.checked)} />
              <i aria-hidden="true" />
              <span><strong>Include price-analysis savings</strong><small>Only use a percentage supported by a reviewed like-for-like analysis.</small></span>
            </label>
            {draft.includeCostSavings ? <>
              <label><span>Identified cost savings</span><div className="aps-number-suffix"><input type="number" min="0" max="100" step="0.1" value={draft.costSavingsPercent} onChange={(event) => update("costSavingsPercent", Number(event.target.value))} /><i>%</i></div></label>
              <label className="aps-wide"><span>Analysis basis / qualification</span><textarea value={draft.costSavingsNotes} onChange={(event) => update("costSavingsNotes", event.target.value)} /></label>
            </> : null}
            <label className="aps-toggle aps-wide">
              <input type="checkbox" checked={draft.includeServiceImprovement} onChange={(event) => update("includeServiceImprovement", event.target.checked)} />
              <i aria-hidden="true" />
              <span><strong>Include turnaround improvement</strong><small>Calculates both relative improvement and reduction in business days.</small></span>
            </label>
            {draft.includeServiceImprovement ? <>
              <label><span>Current lab turn time</span><div className="aps-number-suffix"><input type="number" min="0" max="60" step="0.1" value={draft.currentTurnDays} onChange={(event) => update("currentTurnDays", Number(event.target.value))} /><i>days</i></div></label>
              <label><span>Artisan average turn time</span><div className="aps-number-suffix"><input type="number" min="0" max="60" step="0.1" value={draft.artisanTurnDays} onChange={(event) => update("artisanTurnDays", Number(event.target.value))} /><i>days</i></div></label>
              {serviceImprovement ? <div className="aps-calculated-proof aps-wide"><strong>{serviceImprovement.relativeImprovementPercent}% relative improvement</strong><span>{serviceImprovement.turnaroundReductionPercent}% fewer turnaround days · {serviceImprovement.daysSaved} business days saved on the stated comparison</span></div> : <p className="aps-warning aps-wide">Enter a current turn time greater than the Artisan average to calculate an improvement.</p>}
              <label className="aps-wide"><span>Comparison basis / qualification</span><textarea value={draft.serviceAnalysisNotes} onChange={(event) => update("serviceAnalysisNotes", event.target.value)} /></label>
            </> : null}
          </fieldset>

          <fieldset className="aps-fieldset">
            <legend>Transition &amp; next step</legend>
            <label className="aps-wide"><span>Managed-care / freedom-of-choice transition plan</span><textarea className="aps-tall" value={draft.transitionNotes} onChange={(event) => update("transitionNotes", event.target.value)} /></label>
            <label className="aps-wide"><span>Recommended next step</span><textarea value={draft.nextStep} onChange={(event) => update("nextStep", event.target.value)} /></label>
          </fieldset>

          <fieldset className="aps-fieldset aps-choice-fieldset">
            <legend>Programs included</legend>
            <p className="aps-field-help">Select every program the customer will receive. Add a customer-specific note only when it clarifies the offer.</p>
            <div className="aps-program-choices">
              {PROGRAM_CATALOG.map((program) => {
                const selected = draft.selectedPrograms.includes(program.code);
                return (
                  <article className={selected ? "is-selected" : ""} key={program.code}>
                    <button type="button" onClick={() => toggleProgram(program.code)} aria-pressed={selected}>
                      <span>{selected ? <Check /> : <Plus />}</span>
                      <div><strong>{program.name}</strong><small>{program.summary}</small></div>
                    </button>
                    {selected ? (
                      <label>
                        <span>Customer-specific note (optional)</span>
                        <textarea
                          value={draft.programNotes[program.code] || ""}
                          onChange={(event) =>
                            update("programNotes", {
                              ...draft.programNotes,
                              [program.code]: event.target.value,
                            })
                          }
                          placeholder="Add an exact exception, qualification, or implementation note."
                        />
                      </label>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="aps-fieldset aps-choice-fieldset">
            <legend>Price-list attachments</legend>
            <p className="aps-field-help">P6 is the default proposal pricing when it is available to this role. Each selected official price list will be appended to the finished PDF.</p>
            <div className="aps-price-list-choices">
              {priceLists.map((priceList) => {
                const selected = draft.selectedPriceLists.includes(priceList.code);
                return (
                  <button
                    type="button"
                    key={priceList.code}
                    className={selected ? "is-selected" : ""}
                    onClick={() => togglePriceList(priceList.code)}
                    aria-pressed={selected}
                  >
                    <span>{selected ? <Check /> : priceList.code}</span>
                    <div>
                      <strong>{proposalPriceListTitle(priceList.code, draft.isAcquiosMember, priceList.label)}</strong>
                      <small>{priceList.code} · {priceList.package ? "Package pricing" : "Lens pricing"}</small>
                    </div>
                  </button>
                );
              })}
            </div>
            {!priceLists.length ? <p className="aps-warning">No supported price lists are available in this role&apos;s permitted customer scope.</p> : null}
          </fieldset>

          <fieldset className="aps-fieldset aps-special-builder">
            <legend>Special line-item pricing</legend>
            <div className="aps-section-action">
              <p className="aps-field-help">Use a fixed special price, a dollar deduction, or a percentage discount. These terms appear in the proposal and in a supplement immediately before every affected price list.</p>
              <button type="button" className="aps-button aps-button-secondary" onClick={addSpecialPricing}>
                <Plus /> Add special price
              </button>
            </div>
            {draft.specialPricing.map((rule) => (
              <article key={rule.id}>
                <label className="aps-wide">
                  <span>Product / line item</span>
                  <input value={rule.productName} onChange={(event) => updateSpecialPricing(rule.id, { productName: event.target.value })} />
                </label>
                <label>
                  <span>Adjustment</span>
                  <div className="aps-select-wrap">
                    <select value={rule.kind} onChange={(event) => updateSpecialPricing(rule.id, { kind: event.target.value as SpecialPricingKind })}>
                      <option value="fixed-price">Fixed special price</option>
                      <option value="dollar-deduction">Dollar deduction</option>
                      <option value="percent-discount">Percentage discount</option>
                    </select>
                    <ChevronDown />
                  </div>
                </label>
                <label>
                  <span>{rule.kind === "percent-discount" ? "Percent" : "Amount"}</span>
                  <div className="aps-money-input"><i>{rule.kind === "percent-discount" ? "%" : "$"}</i><input type="number" min="0" step="0.01" value={rule.amount} onChange={(event) => updateSpecialPricing(rule.id, { amount: Number(event.target.value) })} /></div>
                </label>
                <div className="aps-wide">
                  <span className="aps-input-label">Applies to</span>
                  <div className="aps-inline-checks">
                    {draft.selectedPriceLists.map((code) => (
                      <label key={`${rule.id}-${code}`}>
                        <input
                          type="checkbox"
                          checked={rule.priceListCodes.includes(code)}
                          onChange={() =>
                            updateSpecialPricing(rule.id, {
                              priceListCodes: rule.priceListCodes.includes(code)
                                ? rule.priceListCodes.filter((value) => value !== code)
                                : [...rule.priceListCodes, code],
                            })
                          }
                        />
                        {code}
                      </label>
                    ))}
                    {!draft.selectedPriceLists.length ? <small>Select a price list first.</small> : null}
                  </div>
                </div>
                <label className="aps-wide">
                  <span>Conditions / notes</span>
                  <textarea value={rule.notes} onChange={(event) => updateSpecialPricing(rule.id, { notes: event.target.value })} placeholder="For example: Polycarbonate, clear, surfaced pair; excludes premium add-ons." />
                </label>
                <button type="button" className="aps-remove" onClick={() => update("specialPricing", draft.specialPricing.filter((entry) => entry.id !== rule.id))}>
                  <Trash2 /> Remove special price
                </button>
              </article>
            ))}
          </fieldset>

          <fieldset className="aps-fieldset">
            <legend>Warranty &amp; second-pair terms</legend>
            <label className="aps-toggle aps-wide">
              <input type="checkbox" checked={draft.multipleRemakes} onChange={(event) => update("multipleRemakes", event.target.checked)} />
              <i aria-hidden="true" />
              <span><strong>Approve multiple remakes</strong><small>Document an exception to the standard policy.</small></span>
            </label>
            {draft.multipleRemakes ? (
              <label>
                <span>Maximum approved remakes</span>
                <input type="number" min="2" max="12" value={draft.remakeLimit} onChange={(event) => update("remakeLimit", Number(event.target.value))} />
              </label>
            ) : null}
            <label>
              <span>Second-pair order window</span>
              <div className="aps-number-suffix"><input type="number" min="1" max="365" value={draft.secondPairDays} onChange={(event) => update("secondPairDays", Number(event.target.value))} /><i>days</i></div>
            </label>
            <label className="aps-wide">
              <span>Warranty exceptions / conditions (optional)</span>
              <textarea value={draft.warrantyNotes} onChange={(event) => update("warrantyNotes", event.target.value)} placeholder="Describe the exact products, limits, approvals, or documentation required." />
            </label>
          </fieldset>

          <fieldset className="aps-fieldset">
            <legend>Customer commitment</legend>
            <label>
              <span>Commitment measured in</span>
              <div className="aps-select-wrap"><select value={draft.commitmentBasis} onChange={(event) => update("commitmentBasis", event.target.value as ProgramProposalDraft["commitmentBasis"])}><option value="lens-pairs">Lens pairs</option><option value="sales">Net sales</option></select><ChevronDown /></div>
            </label>
            <label>
              <span>Measurement period</span>
              <div className="aps-select-wrap"><select value={draft.commitmentPeriod} onChange={(event) => update("commitmentPeriod", event.target.value as ProgramProposalDraft["commitmentPeriod"])}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select><ChevronDown /></div>
            </label>
            <label>
              <span>{draft.commitmentBasis === "sales" ? "Net sales commitment" : "Lens-pair commitment"}</span>
              <div className="aps-money-input"><i>{draft.commitmentBasis === "sales" ? "$" : "#"}</i><input type="number" min="0" step={draft.commitmentBasis === "sales" ? "100" : "1"} value={draft.commitmentValue} onChange={(event) => update("commitmentValue", Number(event.target.value))} /></div>
            </label>
            <div className="aps-regulatory aps-wide">
              <ShieldCheck />
              <div><strong>Required program-volume exclusion</strong><p>{GOVERNMENT_PROGRAM_EXCLUSION}</p><label><input type="checkbox" checked={draft.regulatoryAcknowledged} onChange={(event) => update("regulatoryAcknowledged", event.target.checked)} /> I have included and reviewed this statement for the customer proposal.</label></div>
            </div>
          </fieldset>

          <fieldset className="aps-fieldset">
            <legend>Additional terms</legend>
            <label className="aps-wide"><span>Proposal terms and qualifications</span><textarea className="aps-tall" value={draft.additionalTerms} onChange={(event) => update("additionalTerms", event.target.value)} /></label>
          </fieldset>

          <fieldset className="aps-fieldset aps-choice-fieldset aps-email-builder">
            <legend>Email handoff</legend>
            <div className="aps-email-method">
              <Mail />
              <div><strong>One decision-ready attachment</strong><p>Use the generated subject, lead with the customer&apos;s priority, attach the finished PDF, state one recommended next step, and schedule a review. The Studio prepares the message but never sends it.</p></div>
            </div>
            <label className="aps-block-label"><span>Personal opening note (optional)</span><textarea value={draft.emailPersonalNote} onChange={(event) => update("emailPersonalNote", event.target.value)} placeholder="Reference the meeting, concern, or opportunity that prompted the proposal." /></label>
            <div className="aps-copy-field">
              <label><span>Email subject</span><input readOnly value={emailSubject} /></label>
              <button type="button" className="aps-button aps-button-secondary" onClick={() => copyEmailPart("subject", emailSubject)}><ClipboardCopy /> {copied === "subject" ? "Copied" : "Copy subject"}</button>
            </div>
            <div className="aps-email-preview">
              <div><span>Email message</span><button type="button" onClick={() => copyEmailPart("email", emailBody)}><ClipboardCopy /> {copied === "email" ? "Copied" : "Copy message"}</button></div>
              <pre>{emailBody}</pre>
            </div>
          </fieldset>

          {!readiness.ready ? (
            <div className="aps-readiness">
              <strong>Before PDF export</strong>
              <p>Complete: {readiness.missing.join(", ")}.</p>
            </div>
          ) : null}
        </section>

        <section className={`aps-preview${activePanel === "proposal" ? " is-mobile-active" : ""}`}>
          <div className="aps-preview-toolbar">
            <div><p>Live customer view</p><span>Price-list PDFs are appended during download.</span></div>
            <button type="button" className="aps-button aps-button-quiet" onClick={() => window.print()}><Printer /> Print preview</button>
          </div>
          <ProposalDocument draft={draft} priceLists={priceLists} />
        </section>
      </div>
    </main>
  );
}
