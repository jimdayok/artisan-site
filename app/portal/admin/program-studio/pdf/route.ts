import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { buildPriceListPdf } from "@/lib/portal/priceListPdf";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import {
  GOVERNMENT_PROGRAM_EXCLUSION,
  PROGRAM_CATALOG,
  PROGRAM_STUDIO_PRICE_LIST_CODES,
  formatSpecialPricingRule,
  proposalPriceListTitle,
  proposalReadiness,
  type ProgramCode,
  type ProgramProposalDraft,
  type SpecialPricingKind,
  type SpecialPricingRule,
} from "@/lib/portal/programProposal";
import { getProgramStudioPriceLists } from "@/lib/portal/programStudioAccess";
import { getPriceListByCode } from "@/lib/portal/priceLists";
import { loadRuntimePackagedPriceListByCode } from "@/lib/pricing/loadRuntimePackagedPriceList";
import { customerFacingPriceList } from "@/lib/pricing/customerPriceList";
import { checkRateLimit } from "@/lib/portal/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 46;
const INK = rgb(23 / 255, 42 / 255, 40 / 255);
const FOREST = rgb(35 / 255, 69 / 255, 63 / 255);
const GOLD = rgb(189 / 255, 152 / 255, 97 / 255);
const GOLD_SOFT = rgb(220 / 255, 200 / 255, 164 / 255);
const PAPER = rgb(1, 250 / 255, 241 / 255);
const MUTED = rgb(104 / 255, 96 / 255, 84 / 255);
const RULE = rgb(226 / 255, 213 / 255, 191 / 255);
const WARNING = rgb(255 / 255, 244 / 255, 232 / 255);

function clean(value: unknown, limit = 1_200) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function number(value: unknown, min = 0, max = 1_000_000) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : 0;
}

function sanitizeDraft(input: unknown): ProgramProposalDraft {
  const source = (input && typeof input === "object" ? input : {}) as Partial<ProgramProposalDraft>;
  const validPrograms = new Set(PROGRAM_CATALOG.map((program) => program.code));
  const validPriceCodes = new Set<string>(PROGRAM_STUDIO_PRICE_LIST_CODES);
  const validKinds = new Set<SpecialPricingKind>([
    "fixed-price",
    "dollar-deduction",
    "percent-discount",
  ]);
  const selectedPrograms = (Array.isArray(source.selectedPrograms)
    ? source.selectedPrograms
    : []
  )
    .filter((code): code is ProgramCode => validPrograms.has(code as ProgramCode))
    .slice(0, PROGRAM_CATALOG.length);
  const selectedPriceLists = [
    ...new Set(
      (Array.isArray(source.selectedPriceLists) ? source.selectedPriceLists : [])
        .map((code) => clean(code, 8).toUpperCase())
        .filter((code) => validPriceCodes.has(code))
    ),
  ];

  const specialPricing: SpecialPricingRule[] = (
    Array.isArray(source.specialPricing) ? source.specialPricing : []
  )
    .slice(0, 12)
    .map((raw, index) => ({
      id: clean(raw?.id, 80) || `special-${index + 1}`,
      productName: clean(raw?.productName, 140),
      kind: validKinds.has(raw?.kind as SpecialPricingKind)
        ? (raw.kind as SpecialPricingKind)
        : "fixed-price",
      amount: number(raw?.amount, 0, 1_000_000),
      priceListCodes: [
        ...new Set(
          (Array.isArray(raw?.priceListCodes) ? raw.priceListCodes : [])
            .map((code) => clean(code, 8).toUpperCase())
            .filter((code) => selectedPriceLists.includes(code))
        ),
      ],
      notes: clean(raw?.notes, 500),
    }));

  const programNotes = Object.fromEntries(
    selectedPrograms.map((code) => [
      code,
      clean(source.programNotes?.[code], 500),
    ])
  );

  return {
    proposalTitle: clean(source.proposalTitle, 140),
    customerName: clean(source.customerName, 140),
    locationName: clean(source.locationName, 160),
    accountNumber: clean(source.accountNumber, 80),
    customerAddress: clean(source.customerAddress, 300),
    lab: clean(source.lab, 120),
    preparedBy: clean(source.preparedBy, 120),
    preparedByEmail: clean(source.preparedByEmail, 180),
    proposalDate: clean(source.proposalDate, 20),
    validThrough: clean(source.validThrough, 20),
    isAcquiosMember: Boolean(source.isAcquiosMember),
    selectedPrograms,
    programNotes,
    selectedPriceLists,
    specialPricing,
    multipleRemakes: Boolean(source.multipleRemakes),
    remakeLimit: number(source.remakeLimit, 2, 12),
    secondPairDays: number(source.secondPairDays, 1, 365),
    warrantyNotes: clean(source.warrantyNotes, 800),
    commitmentBasis: source.commitmentBasis === "sales" ? "sales" : "lens-pairs",
    commitmentPeriod: ["monthly", "quarterly", "annual"].includes(
      String(source.commitmentPeriod)
    )
      ? (source.commitmentPeriod as ProgramProposalDraft["commitmentPeriod"])
      : "monthly",
    commitmentValue: number(source.commitmentValue, 0, 100_000_000),
    regulatoryAcknowledged: Boolean(source.regulatoryAcknowledged),
    additionalTerms: clean(source.additionalTerms, 3_000),
  };
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = clean(text, 10_000).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines({
  page,
  font,
  text,
  x,
  y,
  size,
  maxWidth,
  color = INK,
  lineHeight = size * 1.4,
  maxLines,
}: {
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  size: number;
  maxWidth: number;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
  maxLines?: number;
}) {
  const lines = wrap(font, text, size, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) =>
    page.drawText(line, { x, y: y - index * lineHeight, size, font, color })
  );
  return y - lines.length * lineHeight;
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value || "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(parsed);
}

function commitmentText(draft: ProgramProposalDraft) {
  if (!draft.commitmentValue) return "No minimum volume commitment stated";
  const value =
    draft.commitmentBasis === "sales"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(draft.commitmentValue)
      : `${new Intl.NumberFormat("en-US").format(draft.commitmentValue)} lens pairs`;
  return `${value} ${draft.commitmentPeriod}`;
}

function contentHeader(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  section: string,
  numberLabel: string
) {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 66, width: PAGE_WIDTH, height: 66, color: INK });
  page.drawText("ARTISAN LAB NETWORK", { x: MARGIN, y: PAGE_HEIGHT - 38, size: 10, font: bold, color: GOLD_SOFT });
  page.drawText(section.toUpperCase(), { x: MARGIN, y: PAGE_HEIGHT - 52, size: 7, font: regular, color: rgb(1, 1, 1) });
  page.drawText(numberLabel, { x: PAGE_WIDTH - MARGIN - 18, y: PAGE_HEIGHT - 42, size: 8, font: bold, color: GOLD_SOFT });
}

function contentFooter(page: PDFPage, regular: PDFFont, customerName: string) {
  page.drawLine({ start: { x: MARGIN, y: 30 }, end: { x: PAGE_WIDTH - MARGIN, y: 30 }, thickness: .6, color: RULE });
  page.drawText(clean(customerName, 70), { x: MARGIN, y: 17, size: 6.5, font: regular, color: MUTED });
  page.drawText("CONFIDENTIAL CUSTOMER PROPOSAL", { x: PAGE_WIDTH - MARGIN - 126, y: 17, size: 6.5, font: regular, color: MUTED });
}

async function addProposalPages(
  document: PDFDocument,
  draft: ProgramProposalDraft,
  priceListLabels: Map<string, string>
) {
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await readFile(path.join(process.cwd(), "public", "aln-white-logo.png"));
  const logo = await document.embedPng(logoBytes);

  const cover = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: INK });
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 205, color: FOREST });
  cover.drawCircle({ x: 560, y: 305, size: 225, borderColor: GOLD, borderWidth: .7, opacity: .24 });
  cover.drawCircle({ x: 560, y: 305, size: 170, borderColor: GOLD, borderWidth: .7, opacity: .17 });
  cover.drawImage(logo, { x: MARGIN, y: 700, width: 132, height: 62 });
  cover.drawText("CUSTOM PARTNERSHIP PROPOSAL", { x: 376, y: 730, size: 7, font: bold, color: GOLD_SOFT });
  cover.drawText("PREPARED EXCLUSIVELY FOR", { x: MARGIN, y: 620, size: 8, font: bold, color: GOLD_SOFT });
  let y = drawLines({ page: cover, font: bold, text: draft.customerName, x: MARGIN, y: 574, size: 34, maxWidth: 485, color: rgb(1,1,1), lineHeight: 38, maxLines: 2 });
  y -= 4;
  y = drawLines({ page: cover, font: regular, text: draft.locationName, x: MARGIN, y, size: 14, maxWidth: 460, color: rgb(.82,.85,.83), lineHeight: 18, maxLines: 2 });
  cover.drawRectangle({ x: MARGIN, y: y - 24, width: 78, height: 2.4, color: GOLD });
  drawLines({ page: cover, font: regular, text: draft.proposalTitle, x: MARGIN, y: y - 58, size: 18, maxWidth: 430, color: rgb(1,1,1), lineHeight: 22, maxLines: 3 });
  const facts = [
    ["SERVICING LAB", draft.lab],
    ["ACCOUNT", draft.accountNumber || "New / pending"],
    ["PREPARED BY", draft.preparedBy],
    ["VALID THROUGH", formatDate(draft.validThrough)],
  ];
  facts.forEach(([label, value], index) => {
    const x = MARGIN + index * 130;
    cover.drawText(label, { x, y: 158, size: 6.3, font: bold, color: GOLD_SOFT });
    drawLines({ page: cover, font: bold, text: value, x, y: 137, size: 8.2, maxWidth: 114, color: rgb(1,1,1), lineHeight: 11, maxLines: 3 });
  });
  cover.drawText("Independent labs. Shared strength. Better partnership.", { x: MARGIN, y: 42, size: 8, font: regular, color: rgb(.73,.78,.75) });

  const partnership = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  partnership.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: PAPER });
  contentHeader(partnership, regular, bold, "The Artisan difference", "01");
  partnership.drawText("A LAB RELATIONSHIP DESIGNED", { x: MARGIN, y: 678, size: 8, font: bold, color: GOLD });
  partnership.drawText("around your practice.", { x: MARGIN, y: 630, size: 29, font: bold, color: INK });
  drawLines({ page: partnership, font: regular, text: "Artisan Lab Network brings together independent optical labs, experienced people, and practical programs to help your team serve patients with more confidence. This proposal is built for your location - not pulled from a one-size-fits-all package.", x: MARGIN, y: 590, size: 10.3, maxWidth: 505, color: MUTED, lineHeight: 16 });
  const benefits = [
    ["People who know your account", "Direct access to a responsive lab team that understands your preferences, history, and priorities."],
    ["Technical depth", "Practical support for lens selection, troubleshooting, specialty work, and daily patient conversations."],
    ["Independent choice", "A broad product portfolio and flexible program structure built to support independent eyecare."],
    ["Clear commercial terms", "Programs, pricing, commitments, and approved exceptions documented together for easier implementation."],
  ];
  benefits.forEach(([title, body], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * 262;
    const boxY = 420 - row * 142;
    partnership.drawRectangle({ x, y: boxY, width: 248, height: 122, color: rgb(1,1,1), borderColor: RULE, borderWidth: .8 });
    partnership.drawRectangle({ x: x + 15, y: boxY + 96, width: 30, height: 2.2, color: GOLD });
    partnership.drawText(title, { x: x + 15, y: boxY + 73, size: 10, font: bold, color: INK });
    drawLines({ page: partnership, font: regular, text: body, x: x + 15, y: boxY + 52, size: 7.8, maxWidth: 216, color: MUTED, lineHeight: 11 });
  });
  contentFooter(partnership, regular, draft.customerName);

  const programs = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  programs.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: PAPER });
  contentHeader(programs, regular, bold, "Your program", "02");
  programs.drawText("A FOCUSED PACKAGE", { x: MARGIN, y: 678, size: 8, font: bold, color: GOLD });
  programs.drawText("Built for this partnership.", { x: MARGIN, y: 634, size: 27, font: bold, color: INK });
  let programY = 584;
  for (const [index, program] of PROGRAM_CATALOG.filter((entry) => draft.selectedPrograms.includes(entry.code)).entries()) {
    programs.drawLine({ start: { x: MARGIN, y: programY + 13 }, end: { x: PAGE_WIDTH - MARGIN, y: programY + 13 }, thickness: .7, color: RULE });
    programs.drawText(String(index + 1).padStart(2, "0"), { x: MARGIN, y: programY - 12, size: 8, font: bold, color: GOLD });
    programs.drawText(program.name, { x: MARGIN + 48, y: programY - 12, size: 12, font: bold, color: INK });
    const summaryEnd = drawLines({ page: programs, font: regular, text: program.summary, x: MARGIN + 48, y: programY - 33, size: 8.2, maxWidth: 455, color: MUTED, lineHeight: 11 });
    const note = draft.programNotes[program.code];
    if (note) {
      programs.drawRectangle({ x: MARGIN + 48, y: summaryEnd - 35, width: 455, height: 30, color: rgb(.93,.97,.95) });
      drawLines({ page: programs, font: regular, text: note, x: MARGIN + 58, y: summaryEnd - 17, size: 7.2, maxWidth: 435, color: FOREST, lineHeight: 9, maxLines: 2 });
      programY = summaryEnd - 58;
    } else {
      programY = summaryEnd - 28;
    }
  }
  contentFooter(programs, regular, draft.customerName);

  const terms = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  terms.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: PAPER });
  contentHeader(terms, regular, bold, "Commercial framework", "03");
  terms.drawText("PRICING, COMMITMENT & SERVICE", { x: MARGIN, y: 678, size: 8, font: bold, color: GOLD });
  terms.drawText("Everything in one place.", { x: MARGIN, y: 634, size: 27, font: bold, color: INK });
  const cards = [
    ["COMMITMENT", commitmentText(draft), "Qualifying private-pay volume only."],
    ["SECOND-PAIR WINDOW", `${draft.secondPairDays} days`, "Eligible second-pair orders must be placed within this window."],
    [
      "REMAKE ALLOWANCE",
      draft.multipleRemakes
        ? `Up to ${draft.remakeLimit} approved remakes`
        : "Standard Artisan policy",
      draft.warrantyNotes || "Product- and vendor-specific requirements still apply.",
    ],
  ];
  cards.forEach(([label, value, note], index) => {
    const x = MARGIN + index * 173;
    terms.drawRectangle({ x, y: 515, width: 160, height: 86, color: rgb(1,1,1), borderColor: RULE, borderWidth: .8 });
    terms.drawText(label, { x: x + 12, y: 577, size: 6.2, font: bold, color: GOLD });
    drawLines({ page: terms, font: bold, text: value, x: x + 12, y: 553, size: 9.2, maxWidth: 136, color: INK, lineHeight: 12, maxLines: 3 });
    drawLines({ page: terms, font: regular, text: note, x: x + 12, y: 528, size: 5.9, maxWidth: 136, color: MUTED, lineHeight: 7.5, maxLines: 2 });
  });
  terms.drawRectangle({ x: MARGIN, y: 455, width: PAGE_WIDTH - MARGIN * 2, height: 44, color: WARNING, borderColor: rgb(.85,.67,.51), borderWidth: .8 });
  drawLines({ page: terms, font: bold, text: GOVERNMENT_PROGRAM_EXCLUSION, x: MARGIN + 12, y: 482, size: 7.5, maxWidth: PAGE_WIDTH - MARGIN * 2 - 24, color: rgb(.44,.21,.1), lineHeight: 10, maxLines: 3 });

  let termsY = 425;
  if (draft.specialPricing.length) {
    terms.drawText("SPECIAL LINE-ITEM PRICING", { x: MARGIN, y: termsY, size: 7, font: bold, color: GOLD });
    termsY -= 18;
    const summaryRules = draft.specialPricing.slice(0, 3);
    for (const rule of summaryRules) {
      terms.drawText(rule.productName || "Unnamed product", { x: MARGIN, y: termsY, size: 8.2, font: bold, color: INK });
      terms.drawText(formatSpecialPricingRule(rule), { x: 388, y: termsY, size: 7.5, font: bold, color: FOREST });
      const scope = rule.priceListCodes.length ? rule.priceListCodes.join(", ") : "All attached lists";
      terms.drawText(`${scope}${rule.notes ? ` - ${rule.notes}` : ""}`.slice(0, 112), { x: MARGIN, y: termsY - 12, size: 6.8, font: regular, color: MUTED });
      termsY -= 32;
    }
    if (draft.specialPricing.length > summaryRules.length) {
      terms.drawText(
        `${draft.specialPricing.length - summaryRules.length} additional approved exception${draft.specialPricing.length - summaryRules.length === 1 ? "" : "s"} appear in the attached pricing appendices.`,
        { x: MARGIN, y: termsY + 2, size: 6.8, font: bold, color: FOREST }
      );
      termsY -= 17;
    }
  }
  terms.drawText("ATTACHED PRICING", { x: MARGIN, y: termsY, size: 7, font: bold, color: GOLD });
  termsY -= 18;
  draft.selectedPriceLists.forEach((code) => {
    const label = proposalPriceListTitle(code, draft.isAcquiosMember, priceListLabels.get(code) || `${code} Pricing`);
    terms.drawText(`${code}  ${label}`, { x: MARGIN, y: termsY, size: 8.2, font: bold, color: INK });
    termsY -= 15;
  });
  termsY -= 5;
  terms.drawText("PROPOSAL TERMS", { x: MARGIN, y: termsY, size: 7, font: bold, color: GOLD });
  const proposalTerms = [
    draft.warrantyNotes ? `Warranty and remake terms: ${draft.warrantyNotes}` : "",
    draft.additionalTerms,
  ]
    .filter(Boolean)
    .join(" ");
  drawLines({ page: terms, font: regular, text: proposalTerms, x: MARGIN, y: termsY - 18, size: 7.1, maxWidth: PAGE_WIDTH - MARGIN * 2, color: MUTED, lineHeight: 10, maxLines: 12 });
  contentFooter(terms, regular, draft.customerName);
}

async function addPriceListSupplement(
  document: PDFDocument,
  draft: ProgramProposalDraft,
  code: string,
  title: string
) {
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const applicable = draft.specialPricing.filter(
    (rule) => !rule.priceListCodes.length || rule.priceListCodes.includes(code)
  );
  const pageRules = applicable.length
    ? Array.from({ length: Math.ceil(applicable.length / 5) }, (_, index) =>
        applicable.slice(index * 5, index * 5 + 5)
      )
    : [[]];

  pageRules.forEach((rules, pageIndex) => {
    const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: PAPER });
    page.drawRectangle({ x: 0, y: 535, width: PAGE_WIDTH, height: 257, color: INK });
    page.drawText(pageIndex ? "PRICING APPENDIX - CONTINUED" : "PRICING APPENDIX", { x: MARGIN, y: 730, size: 8, font: bold, color: GOLD_SOFT });
    page.drawText(code, { x: MARGIN, y: 648, size: 46, font: bold, color: GOLD });
    drawLines({ page, font: bold, text: title, x: MARGIN + 104, y: 650, size: 24, maxWidth: 400, color: rgb(1,1,1), lineHeight: 28, maxLines: 3 });
    drawLines({ page, font: regular, text: `Prepared for ${draft.customerName}${draft.locationName ? ` - ${draft.locationName}` : ""}`, x: MARGIN, y: 585, size: 10, maxWidth: 505, color: rgb(.78,.82,.8), lineHeight: 14, maxLines: 2 });
    let y = 485;
    page.drawText(applicable.length ? "SPECIAL PRICING THAT MODIFIES THIS LIST" : "NO SPECIAL LINE-ITEM MODIFICATIONS", { x: MARGIN, y, size: 8, font: bold, color: GOLD });
    y -= 28;
    if (!rules.length) {
      drawLines({ page, font: regular, text: "The attached official price list applies without a proposal-specific line-item deduction or fixed-price exception. Other program, warranty, and commitment terms remain as stated in the proposal.", x: MARGIN, y, size: 9, maxWidth: 505, color: MUTED, lineHeight: 14 });
    } else {
      for (const rule of rules) {
        page.drawRectangle({ x: MARGIN, y: y - 57, width: PAGE_WIDTH - MARGIN * 2, height: 62, color: rgb(1,1,1), borderColor: RULE, borderWidth: .8 });
        page.drawText(rule.productName || "Unnamed product", { x: MARGIN + 13, y: y - 17, size: 10, font: bold, color: INK });
        page.drawText(formatSpecialPricingRule(rule), { x: 360, y: y - 17, size: 8.2, font: bold, color: FOREST });
        if (rule.notes) drawLines({ page, font: regular, text: rule.notes, x: MARGIN + 13, y: y - 35, size: 7.1, maxWidth: 480, color: MUTED, lineHeight: 9, maxLines: 2 });
        y -= 74;
      }
    }
    if (rules.length < 5) {
      page.drawRectangle({ x: MARGIN, y: 74, width: PAGE_WIDTH - MARGIN * 2, height: 50, color: WARNING, borderColor: rgb(.85,.67,.51), borderWidth: .8 });
      drawLines({ page, font: bold, text: "When a special term above conflicts with the attached standard list, this proposal supplement controls for the named customer, location, product, and proposal term only.", x: MARGIN + 12, y: 106, size: 7.3, maxWidth: 490, color: rgb(.44,.21,.1), lineHeight: 10, maxLines: 3 });
    }
    contentFooter(page, regular, draft.customerName);
  });
}

export async function POST(request: NextRequest) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(request.headers);
  const role = getPortalStaffRole(authenticatedEmail);
  if (!authenticatedEmail) {
    return NextResponse.json({ error: "Unable to verify your secure login." }, { status: 401 });
  }
  if (!canAccessPortalAdmin(role)) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  }

  const rate = checkRateLimit({
    key: `program-studio-pdf:${authenticatedEmail}`,
    limit: 8,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many proposal exports. Please wait a moment." }, { status: 429 });
  }

  let payload: { draft?: unknown };
  try {
    payload = (await request.json()) as { draft?: unknown };
  } catch {
    return NextResponse.json({ error: "The proposal request was not valid JSON." }, { status: 400 });
  }
  const draft = sanitizeDraft(payload.draft);
  const readiness = proposalReadiness(draft);
  if (!readiness.ready) {
    return NextResponse.json({ error: `Complete ${readiness.missing.join(", ")} before export.` }, { status: 400 });
  }

  const allowedPriceLists = getProgramStudioPriceLists(role);
  const allowedCodes = new Set(allowedPriceLists.map((entry) => entry.code));
  const unauthorizedCode = draft.selectedPriceLists.find((code) => !allowedCodes.has(code));
  if (unauthorizedCode) {
    return NextResponse.json({ error: `${unauthorizedCode} is not available in your permitted customer scope.` }, { status: 403 });
  }

  try {
    const document = await PDFDocument.create();
    const labels = new Map(allowedPriceLists.map((entry) => [entry.code, entry.label]));
    await addProposalPages(document, draft, labels);

    for (const code of draft.selectedPriceLists) {
      const portalPriceList = getPriceListByCode(code);
      const generated = await loadRuntimePackagedPriceListByCode(code, request.nextUrl.origin);
      if (!portalPriceList || !generated) {
        return NextResponse.json({ error: `${code} pricing is temporarily unavailable.` }, { status: 404 });
      }
      const title = proposalPriceListTitle(
        code,
        draft.isAcquiosMember,
        labels.get(code) || portalPriceList.label
      );
      await addPriceListSupplement(document, draft, code, title);
      const priceListBytes = await buildPriceListPdf({
        priceList: customerFacingPriceList(generated),
        portalPriceList: { ...portalPriceList, label: title },
        customerName: draft.customerName,
        mode: "edged",
        requestOrigin: request.nextUrl.origin,
      });
      const attachment = await PDFDocument.load(priceListBytes);
      const pages = await document.copyPages(attachment, attachment.getPageIndices());
      pages.forEach((page) => document.addPage(page));
    }

    document.setTitle(`${draft.proposalTitle} - ${draft.customerName}`);
    document.setAuthor("Artisan Lab Network");
    document.setSubject("Confidential customer program proposal and pricing");
    document.setKeywords(["Artisan Lab Network", "program proposal", "customer pricing"]);
    const pdf = await document.save();
    const safeCustomer = clean(draft.customerName, 80).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "customer";
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Artisan-Proposal-${safeCustomer}-${draft.proposalDate}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  } catch (error) {
    console.error("[program-studio] proposal export failed", error);
    return NextResponse.json({ error: "The proposal package could not be generated." }, { status: 500 });
  }
}
