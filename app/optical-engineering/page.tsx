"use client";

import { useState, type ReactNode } from "react";
import {
  Activity,
  Aperture,
  BookOpen,
  Box,
  Calculator,
  CheckCircle2,
  Clipboard,
  Compass,
  Copy,
  Download,
  Eye,
  FileText,
  Gauge,
  Grid3X3,
  Layers,
  Printer,
  Ruler,
  Share2,
  Sigma,
  Target,
  Triangle,
  Workflow,
  X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

type FrameShape = "Round" | "Rectangle" | "Geometric";

type OpticalData = {
  sphere: number;
  cylinder: number;
  axis: number;
  add: number;
  prismHorizontal: number;
  prismVertical: number;
  pdRight: number;
  pdLeft: number;
  segHeight: number;
  vertexDistance: number;
  originalVertex: number;
  newVertex: number;
  pantoscopicTilt: number;
  wrapAngle: number;
  baseCurve: number;
  lensIndex: number;
  lensMaterial: string;
  centerThickness: number;
  edgeThickness: number;
  aSize: number;
  bSize: number;
  dbl: number;
  effectiveDiameter: number;
  frameShape: FrameShape;
  frameType: string;
  readingDepth: number;
  prismAmount: number;
  prismDirection: number;
  safetyMargin: number;
  measuredCurve: number;
  lensClockIndex: number;
  actualIndex: number;
  orderedSphere: number;
  orderedCylinder: number;
  orderedAxis: number;
  measuredSphere: number;
  measuredCylinder: number;
  measuredAxis: number;
  orderedPrismHorizontal: number;
  orderedPrismVertical: number;
  measuredPrismHorizontal: number;
  measuredPrismVertical: number;
};

type CalcStatus = {
  ready: boolean;
  missing: string[];
};

type CalculatorCategory =
  | "Prescription"
  | "Lens Design"
  | "Prism & Binocular Vision"
  | "Frame Geometry"
  | "Quality Control";

type CalculatorDefinition = {
  id: string;
  category: CalculatorCategory;
  title: string;
  description: string;
  icon: typeof Calculator;
  required: Array<keyof OpticalData>;
  result: (data: OpticalData) => Array<[string, string]>;
};

type ReferenceCard = {
  title: string;
  formula: string;
  note: string;
};

type GroupName = "Prescription" | "Lens" | "Frame";

const initialData: OpticalData = {
  sphere: -2.5,
  cylinder: -1,
  axis: 180,
  add: 2,
  prismHorizontal: 1,
  prismVertical: 0.5,
  pdRight: 31,
  pdLeft: 31,
  segHeight: 22,
  vertexDistance: 12,
  originalVertex: 12,
  newVertex: 14,
  pantoscopicTilt: 8,
  wrapAngle: 6,
  baseCurve: 4,
  lensIndex: 1.6,
  lensMaterial: "1.60",
  centerThickness: 2,
  edgeThickness: 3,
  aSize: 52,
  bSize: 38,
  dbl: 18,
  effectiveDiameter: 56,
  frameShape: "Rectangle",
  frameType: "Full Rim",
  readingDepth: 10,
  prismAmount: 3,
  prismDirection: 45,
  safetyMargin: 2,
  measuredCurve: 4,
  lensClockIndex: 1.53,
  actualIndex: 1.6,
  orderedSphere: -2.5,
  orderedCylinder: -1,
  orderedAxis: 180,
  measuredSphere: -2.37,
  measuredCylinder: -1.12,
  measuredAxis: 179,
  orderedPrismHorizontal: 0.5,
  orderedPrismVertical: 0.33,
  measuredPrismHorizontal: 0.42,
  measuredPrismVertical: 0.28,
};

const materialProperties = [
  { name: "Plastic", index: 1.5, abbe: 58, specificGravity: 1.32 },
  { name: "Trivex", index: 1.53, abbe: 43, specificGravity: 1.11 },
  { name: "Poly", index: 1.59, abbe: 30, specificGravity: 1.2 },
  { name: "1.60", index: 1.6, abbe: 42, specificGravity: 1.3 },
  { name: "1.67", index: 1.67, abbe: 32, specificGravity: 1.36 },
  { name: "1.74", index: 1.74, abbe: 33, specificGravity: 1.47 },
] as const;

const categoryOrder: CalculatorCategory[] = [
  "Prescription",
  "Lens Design",
  "Prism & Binocular Vision",
  "Frame Geometry",
  "Quality Control",
];

const categoryDescriptions: Record<CalculatorCategory, string> = {
  Prescription: "Rx math",
  "Lens Design": "Thickness and curves",
  "Prism & Binocular Vision": "Prism analysis",
  "Frame Geometry": "Frame measurements",
  "Quality Control": "Tolerance checks",
};

const engineeringDisclaimer =
  "These calculators, formulas, and results are provided for general informational and workflow-assistance purposes only. They are not a substitute for professional judgment, independent verification, applicable standards, patient-specific evaluation, or laboratory quality-control procedures. Artisan Lab Network does not warrant that the formulas, calculations, assumptions, source information, or user-entered values are complete, accurate, current, or appropriate for any specific order or patient. Users are responsible for verifying all measurements, inputs, calculations, and production decisions before relying on them. Artisan Lab Network disclaims responsibility for errors, omissions, incorrect inputs, formula defects, calculation inaccuracies, or any outcomes resulting from use of these tools.";

const numericFields: Array<{
  key: keyof OpticalData;
  label: string;
  suffix?: string;
  step?: string;
  decimals?: number;
  group: GroupName;
}> = [
  { key: "sphere", label: "Sphere", suffix: "D", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "cylinder", label: "Cylinder", suffix: "D", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "axis", label: "Axis", suffix: "°", step: "1", decimals: 0, group: "Prescription" },
  { key: "add", label: "Add", suffix: "D", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "prismHorizontal", label: "H Prism", suffix: "Δ", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "prismVertical", label: "V Prism", suffix: "Δ", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "pdRight", label: "PD Right", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "pdLeft", label: "PD Left", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "segHeight", label: "Seg Height", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "originalVertex", label: "Orig Vertex", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "newVertex", label: "New Vertex", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "pantoscopicTilt", label: "Panto Tilt", suffix: "°", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "wrapAngle", label: "Wrap", suffix: "°", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "orderedSphere", label: "Ord Sphere", suffix: "D", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "orderedCylinder", label: "Ord Cylinder", suffix: "D", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "orderedAxis", label: "Ord Axis", suffix: "°", step: "1", decimals: 0, group: "Prescription" },
  { key: "measuredSphere", label: "Meas Sphere", suffix: "D", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "measuredCylinder", label: "Meas Cylinder", suffix: "D", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "measuredAxis", label: "Meas Axis", suffix: "°", step: "1", decimals: 0, group: "Prescription" },
  { key: "orderedPrismHorizontal", label: "Ord H Prism", suffix: "Δ", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "orderedPrismVertical", label: "Ord V Prism", suffix: "Δ", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "measuredPrismHorizontal", label: "Meas H Prism", suffix: "Δ", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "measuredPrismVertical", label: "Meas V Prism", suffix: "Δ", step: "0.01", decimals: 2, group: "Prescription" },
  { key: "baseCurve", label: "Base Curve", suffix: "D", step: "0.25", decimals: 2, group: "Lens" },
  { key: "lensIndex", label: "Lens Index", step: "0.01", decimals: 2, group: "Lens" },
  { key: "centerThickness", label: "CT", suffix: "mm", step: "0.1", decimals: 2, group: "Lens" },
  { key: "edgeThickness", label: "ET", suffix: "mm", step: "0.1", decimals: 2, group: "Lens" },
  { key: "measuredCurve", label: "Measured Curve", suffix: "D", step: "0.01", decimals: 2, group: "Lens" },
  { key: "lensClockIndex", label: "Clock Index", step: "0.01", decimals: 2, group: "Lens" },
  { key: "actualIndex", label: "Actual Index", step: "0.01", decimals: 2, group: "Lens" },
  { key: "aSize", label: "A", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "bSize", label: "B", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "dbl", label: "DBL", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "effectiveDiameter", label: "Trace ED", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "readingDepth", label: "Read Depth", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "prismAmount", label: "Prism Amt", suffix: "Δ", step: "0.25", decimals: 2, group: "Frame" },
  { key: "prismDirection", label: "Prism Dir", suffix: "°", step: "1", decimals: 0, group: "Frame" },
  { key: "safetyMargin", label: "Safety Margin", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
];

const formulaTiles = [
  { label: "Thickness", formula: "ET = CT + (r² × |F|) / 2000(n − 1)" },
  { label: "Prentice", formula: "Δ = cF" },
  { label: "Vertex", formula: "F′ = F / (1 − dF)" },
  { label: "Equivalent", formula: "SE = S + C / 2" },
  { label: "Power Cross", formula: "F90 = S + C" },
  { label: "Clock", formula: "Mc × ((na − 1) / (nc − 1))" },
  { label: "Sagitta", formula: "s = r − √(r² − h²)" },
  { label: "Prism Vector", formula: "R = √(H² + V²)" },
] as const;

const references: ReferenceCard[] = [
  { title: "Prentice Rule", formula: "Δ = cF", note: "Prism from decentration in centimeters and power in diopters." },
  { title: "Equivalent Sphere", formula: "SE = S + C / 2", note: "Quick average power for lens form and tolerance decisions." },
  { title: "Transposition", formula: "S′ = S + C", note: "Convert plus and minus cylinder notation without changing power." },
  { title: "Martin Rule", formula: "BC ≈ SE + 6.00", note: "Practical base curve starting point, then round to quarter diopters." },
  { title: "Vertex Compensation", formula: "F′ = F / (1 − dF)", note: "Use when fitting distance changes materially with higher powers." },
  { title: "Lens Clock", formula: "Mc × ((na − 1) / (nc − 1))", note: "Converts measured curve to actual index." },
  { title: "Sagitta", formula: "s = r − √(r² − h²)", note: "Curve depth from radius and half chord." },
  { title: "Power Vector", formula: "M, J0, J45", note: "Useful for crossed cylinder math and prescription comparison." },
  { title: "ANSI Axis", formula: "Tolerance by cylinder", note: "Axis tolerance tightens as cylinder power increases." },
];

function radians(value: number) {
  return (value * Math.PI) / 180;
}

function fmt(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function signed(value: number, digits = 2) {
  return `${value >= 0 ? "+" : ""}${fmt(value, digits)}`;
}

function inputValue(value: number, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "";
}

function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

function normalizeAxis(axis: number) {
  if (!Number.isFinite(axis)) return Number.NaN;
  const normalized = ((axis - 1) % 180 + 180) % 180 + 1;
  return normalized === 181 ? 1 : normalized;
}

function materialLabel(name: string, index: number) {
  return name.match(/^\d/) ? `${name} Index` : `${name} · ${index.toFixed(2)}`;
}

function totalPd(data: OpticalData) {
  return data.pdRight + data.pdLeft;
}

function framePd(data: OpticalData) {
  return data.aSize + data.dbl;
}

function monocularGc(data: OpticalData) {
  return framePd(data) / 2;
}

function monocularDecentrationValues(data: OpticalData) {
  const gc = monocularGc(data);
  return {
    right: gc - data.pdRight,
    left: gc - data.pdLeft,
  };
}

function decentrationDirection(value: number) {
  if (Math.abs(value) < 0.005) return "Centered";
  return value > 0 ? "In" : "Out";
}

function horizontalPower(data: OpticalData) {
  return data.sphere + data.cylinder * Math.sin(radians(data.axis)) ** 2;
}

function estimatedEd(data: OpticalData) {
  if (data.frameShape === "Round") return Math.max(data.aSize, data.bSize);
  if (data.frameShape === "Geometric") return Math.sqrt(data.aSize ** 2 + data.bSize ** 2) * 1.05;
  return Math.sqrt(data.aSize ** 2 + data.bSize ** 2);
}

function engineeringEd(data: OpticalData) {
  return Number.isFinite(data.effectiveDiameter) && data.effectiveDiameter > 0
    ? data.effectiveDiameter
    : estimatedEd(data);
}

function binocularDecentration(data: OpticalData) {
  return (framePd(data) - totalPd(data)) / 2;
}

function horizontalRadius(data: OpticalData) {
  return engineeringEd(data) / 2 + Math.abs(binocularDecentration(data));
}

function thicknessIncrease(data: OpticalData, index = data.lensIndex) {
  const power = Math.abs(horizontalPower(data));
  return (horizontalRadius(data) ** 2 * power) / (2000 * Math.max(index - 1, 0.01));
}

function edgeEstimate(data: OpticalData, index = data.lensIndex) {
  return data.centerThickness + thicknessIncrease(data, index);
}

function equivalentSphere(data: OpticalData) {
  return data.sphere + data.cylinder / 2;
}

function transposedRx(data: OpticalData) {
  return {
    sphere: data.sphere + data.cylinder,
    cylinder: -data.cylinder,
    axis: normalizeAxis(data.axis + 90),
  };
}

function powerVector(data: OpticalData) {
  const m = equivalentSphere(data);
  const j0 = -(data.cylinder / 2) * Math.cos(2 * radians(data.axis));
  const j45 = -(data.cylinder / 2) * Math.sin(2 * radians(data.axis));
  return { m, j0, j45 };
}

function vectorToRx(m: number, j0: number, j45: number) {
  const cylinder = -2 * Math.sqrt(j0 ** 2 + j45 ** 2);
  const sphere = m - cylinder / 2;
  const axis = (Math.atan2(j45, j0) / 2) * (180 / Math.PI);
  return {
    sphere,
    cylinder,
    axis: normalizeAxis(axis <= 0 ? axis + 180 : axis),
  };
}

function tiltCompensation(data: OpticalData) {
  const tilt = radians(data.pantoscopicTilt);
  const powerShift = (Math.sin(tilt) ** 2 * data.sphere) / Math.max(data.lensIndex, 1);
  const cylinderShift = Math.abs(data.sphere) * Math.tan(tilt) ** 2;
  return {
    sphere: data.sphere + powerShift,
    cylinder: data.cylinder - cylinderShift,
    axis: normalizeAxis(data.axis),
    powerShift,
    cylinderShift,
  };
}

function wrapCompensation(data: OpticalData) {
  const wrap = radians(data.wrapAngle);
  const axisShift = Math.sin(wrap) * 8;
  const powerShift = (Math.tan(wrap) ** 2 * data.sphere) / Math.max(data.lensIndex - 1, 0.4);
  return {
    sphere: data.sphere + powerShift,
    cylinder: data.cylinder - Math.abs(powerShift) / 2,
    axis: normalizeAxis(data.axis + axisShift),
    powerShift,
    axisShift,
  };
}

function vertexCompensation(data: OpticalData) {
  const distance = (data.newVertex - data.originalVertex) / 1000;
  return data.sphere / (1 - distance * data.sphere);
}

function prismComponents(amount: number, direction: number) {
  return {
    horizontal: amount * Math.cos(radians(direction)),
    vertical: amount * Math.sin(radians(direction)),
  };
}

function minimumBlank(data: OpticalData) {
  return engineeringEd(data) + Math.abs(framePd(data) - totalPd(data)) + data.safetyMargin;
}

function lensClockConversion(data: OpticalData) {
  return data.measuredCurve * ((data.actualIndex - 1) / Math.max(data.lensClockIndex - 1, 0.01));
}

function martinBaseCurve(data: OpticalData) {
  return roundToQuarter(equivalentSphere(data) + 6);
}

function lensWeight(data: OpticalData, specificGravity: number) {
  const diameter = minimumBlank(data);
  const averageThickness = (data.centerThickness + edgeEstimate(data)) / 2;
  const area = Math.PI * (diameter / 2) ** 2;
  const volumeMm3 = area * averageThickness;
  return (volumeMm3 / 1000) * specificGravity;
}

function ansiSphereTolerance(power: number) {
  return Math.abs(power) <= 6.5 ? 0.13 : Math.abs(power) * 0.02;
}

function ansiCylinderTolerance(cylinder: number) {
  const absCylinder = Math.abs(cylinder);
  if (absCylinder <= 2) return 0.13;
  if (absCylinder <= 4.5) return 0.15;
  if (absCylinder <= 6.5) return 0.18;
  return 0.25;
}

function ansiAxisTolerance(cylinder: number) {
  const absCylinder = Math.abs(cylinder);
  if (absCylinder < 0.25) return 0;
  if (absCylinder < 0.5) return 7;
  if (absCylinder < 0.75) return 5;
  if (absCylinder < 1.5) return 3;
  return 2;
}

function axisDifference(a: number, b: number) {
  const diff = Math.abs(normalizeAxis(a) - normalizeAxis(b));
  return Math.min(diff, 180 - diff);
}

function ansiRxTolerance(data: OpticalData) {
  const sphereError = data.measuredSphere - data.orderedSphere;
  const cylinderError = data.measuredCylinder - data.orderedCylinder;
  const axisError = axisDifference(data.measuredAxis, data.orderedAxis);
  const spherePass = Math.abs(sphereError) <= ansiSphereTolerance(data.orderedSphere);
  const cylinderPass = Math.abs(cylinderError) <= ansiCylinderTolerance(data.orderedCylinder);
  const axisTolerance = ansiAxisTolerance(data.orderedCylinder);
  const axisPass = axisTolerance === 0 || axisError <= axisTolerance;
  return {
    sphereError,
    cylinderError,
    axisError,
    axisTolerance,
    pass: spherePass && cylinderPass && axisPass,
  };
}

function ansiPrismTolerance(data: OpticalData) {
  const horizontalDifference = data.measuredPrismHorizontal - data.orderedPrismHorizontal;
  const verticalDifference = data.measuredPrismVertical - data.orderedPrismVertical;
  const horizontalPass = Math.abs(horizontalDifference) <= 0.67;
  const verticalPass = Math.abs(verticalDifference) <= 0.33;
  return {
    horizontalDifference,
    verticalDifference,
    pass: horizontalPass && verticalPass,
  };
}

function statusFor(data: OpticalData, required: Array<keyof OpticalData>): CalcStatus {
  const missing = required.filter((key) => {
    const value = data[key];
    return typeof value === "number" ? !Number.isFinite(value) : !String(value || "").trim();
  });
  return { ready: missing.length === 0, missing: missing.map(String) };
}

function rxSummary(data: OpticalData) {
  return `${signed(data.sphere)} ${signed(data.cylinder)} × ${fmt(normalizeAxis(data.axis), 0)} · PD ${fmt(totalPd(data))}`;
}

function lensSummary(data: OpticalData) {
  return `${materialLabel(data.lensMaterial, data.lensIndex)} · BC ${fmt(data.baseCurve)} · CT ${fmt(data.centerThickness)} mm`;
}

function frameSummary(data: OpticalData) {
  return `${data.frameShape} · A ${fmt(data.aSize)} / B ${fmt(data.bSize)} / DBL ${fmt(data.dbl)}`;
}

function FormulaWall({ onCopy }: { onCopy: (value: string) => void }) {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#071017] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(212,192,154,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(212,192,154,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4c09a]">Applied Optical Engineering</p>
          <h2 className="mt-4 max-w-2xl font-mono text-3xl leading-tight tracking-[-0.04em] text-white md:text-5xl">
            Calculation-first optical engineering.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {formulaTiles.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onCopy(`${item.label}: ${item.formula}`)}
              className="group rounded-lg border border-white/10 bg-white/[0.055] p-4 text-left transition hover:border-[#d4c09a]/55 hover:bg-white/[0.085]"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4c09a]">{item.label}</span>
              <span className="mt-2 block font-mono text-lg leading-7 text-white md:text-xl">{item.formula}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultRows({
  results,
  onCopy,
}: {
  results: Array<[string, string]>;
  onCopy: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {results.map(([label, value]) => (
        <button
          key={label}
          type="button"
          onClick={() => onCopy(`${label}: ${value}`)}
          className="group rounded-[22px] border border-[#eadfce] bg-[#fbf8f3] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-white"
        >
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">{label}</span>
          <span className="mt-2 block text-3xl font-semibold tracking-[-0.04em] text-[#172a28]">{value}</span>
          <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#8a7654] opacity-0 transition group-hover:opacity-100">
            <Copy className="h-3.5 w-3.5" /> Copy
          </span>
        </button>
      ))}
    </div>
  );
}

function MaterialComparison({ data }: { data: OpticalData }) {
  return (
    <div className="rounded-lg border border-[#d8c6a8] bg-[#172a28] p-5 text-white shadow-[0_18px_48px_rgba(24,18,13,0.12)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">Material Engine</p>
          <p className="mt-2 text-sm leading-6 text-white/64">Compare estimated thickness and weight for the same scenario.</p>
        </div>
        <Layers className="h-5 w-5 shrink-0 text-[#d4c09a]" aria-hidden="true" />
      </div>
      <div className="mt-4 grid gap-2">
        {materialProperties.map((material) => {
          const thickness = edgeEstimate(data, material.index);
          const weight = lensWeight({ ...data, lensIndex: material.index, lensMaterial: material.name }, material.specificGravity);
          return (
            <div
              key={material.name}
              className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 sm:grid-cols-[92px_minmax(0,1fr)] xl:grid-cols-[82px_minmax(0,1fr)_70px_64px]"
            >
              <span className="font-semibold">{material.name}</span>
              <span className="text-white/70">{fmt(thickness)} mm · Abbe {material.abbe}</span>
              <span className="text-white/70 xl:text-right">{fmt(material.specificGravity)} SG</span>
              <span className="font-semibold text-[#d4c09a] xl:text-right">{fmt(weight)} g</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SetupAccordion({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#d8c6a8] bg-white/86 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 p-5 text-left transition hover:bg-[#fbf8f3] sm:flex-row sm:items-center sm:justify-between md:p-6"
      >
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">{title}</span>
          <span className="mt-2 block text-sm font-semibold text-[#625b53]">{summary}</span>
        </span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d8c6a8] bg-[#fbf8f3] text-xl font-semibold text-[#172a28]">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="border-t border-[#eadfce] p-5 md:p-6">{children}</div> : null}
    </div>
  );
}

function ResultModal({
  open,
  title,
  category,
  results,
  ready,
  missing,
  onClose,
  onCopy,
  onPrint,
  onShare,
}: {
  open: boolean;
  title: string;
  category: string;
  results: Array<[string, string]>;
  ready: boolean;
  missing: string[];
  onClose: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onShare: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <button type="button" aria-label="Close results" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#d8c6a8] bg-[#f5f1eb] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eadfce] bg-white/72 px-5 py-5 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">{category}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172a28]">{title}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onCopy} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c6a8] bg-white px-4 text-sm font-semibold text-[#172a28] transition hover:bg-[#d4c09a]"><Copy className="h-4 w-4" />Copy</button>
            <button onClick={onPrint} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c6a8] bg-white px-4 text-sm font-semibold text-[#172a28] transition hover:bg-[#d4c09a]"><Printer className="h-4 w-4" />Print</button>
            <button onClick={onShare} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8c6a8] bg-white px-4 text-sm font-semibold text-[#172a28] transition hover:bg-[#d4c09a]"><Share2 className="h-4 w-4" />Share</button>
            <button onClick={onPrint} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#172a28] px-4 text-sm font-semibold text-white transition hover:bg-[#27433f]"><Download className="h-4 w-4" />PDF</button>
            <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d8c6a8] bg-[#fbf8f3] text-[#172a28] transition hover:bg-[#d4c09a]"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-5 md:px-6 md:py-6">
          {!ready ? (
            <div className="rounded-2xl border border-[#e7bea5] bg-[#fff1e8] p-4 text-sm font-semibold text-[#8a3f21]">
              Missing: {missing.join(", ")}
            </div>
          ) : null}
          <div className={ready ? "" : "mt-5"}>
            <ResultRows results={results} onCopy={(value) => void navigator.clipboard?.writeText(value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

const calculators: CalculatorDefinition[] = [
  {
    id: "transposition",
    category: "Prescription",
    title: "Transposition",
    description: "Converts cylinder form.",
    icon: Workflow,
    required: ["sphere", "cylinder", "axis"],
    result: (data) => {
      const rx = transposedRx(data);
      return [
        ["Sphere", `${signed(rx.sphere)} D`],
        ["Cylinder", `${signed(rx.cylinder)} D`],
        ["Axis", `${fmt(rx.axis, 0)}°`],
      ];
    },
  },
  {
    id: "equivalent-sphere",
    category: "Prescription",
    title: "Equivalent Sphere",
    description: "Calculates spherical equivalent.",
    icon: Sigma,
    required: ["sphere", "cylinder"],
    result: (data) => [["Equivalent Sphere", `${signed(equivalentSphere(data))} D`]],
  },
  {
    id: "power-cross",
    category: "Prescription",
    title: "Power Cross",
    description: "Builds principal meridians.",
    icon: Grid3X3,
    required: ["sphere", "cylinder", "axis"],
    result: (data) => [
      ["Power @ Axis", `${signed(data.sphere)} D`],
      ["Power @ 90°", `${signed(data.sphere + data.cylinder)} D`],
      ["Principal Meridians", `${fmt(normalizeAxis(data.axis), 0)}° / ${fmt(normalizeAxis(data.axis + 90), 0)}°`],
    ],
  },
  {
    id: "crossed-cylinders",
    category: "Prescription",
    title: "Crossed Cylinders",
    description: "Converts power vectors.",
    icon: Activity,
    required: ["sphere", "cylinder", "axis"],
    result: (data) => {
      const vector = powerVector(data);
      const rx = vectorToRx(vector.m, vector.j0, vector.j45);
      return [
        ["M", `${signed(vector.m)} D`],
        ["J0", `${signed(vector.j0)} D`],
        ["J45", `${signed(vector.j45)} D`],
        ["Resultant Rx", `${signed(rx.sphere)} ${signed(rx.cylinder)} × ${fmt(rx.axis, 0)}`],
      ];
    },
  },
  {
    id: "lens-thickness",
    category: "Lens Design",
    title: "Lens Thickness",
    description: "Calculates estimated edge thickness.",
    icon: Ruler,
    required: ["sphere", "cylinder", "axis", "pdRight", "pdLeft", "aSize", "bSize", "dbl", "lensIndex", "centerThickness"],
    result: (data) => [
      ["Horizontal Power", `${signed(horizontalPower(data))} D`],
      ["ED Used", `${fmt(engineeringEd(data))} mm`],
      ["Decentration", `${fmt(binocularDecentration(data))} mm`],
      ["Thickness Increase", `${fmt(thicknessIncrease(data))} mm`],
      ["Estimated ET", `${fmt(edgeEstimate(data))} mm`],
    ],
  },
  {
    id: "blank-size",
    category: "Lens Design",
    title: "Blank Size",
    description: "Calculates recommended blank size.",
    icon: Box,
    required: ["effectiveDiameter", "aSize", "dbl", "pdRight", "pdLeft"],
    result: (data) => {
      const minimum = engineeringEd(data) + Math.abs(framePd(data) - totalPd(data));
      return [
        ["Frame PD", `${fmt(framePd(data))} mm`],
        ["Patient PD", `${fmt(totalPd(data))} mm`],
        ["Minimum Blank", `${fmt(minimum)} mm`],
        ["Recommended Blank", `${fmt(Math.ceil(minimum / 5) * 5)} mm`],
      ];
    },
  },
  {
    id: "effective-diameter",
    category: "Lens Design",
    title: "Effective Diameter",
    description: "Estimates effective diameter.",
    icon: Compass,
    required: ["aSize", "bSize"],
    result: (data) => [
      ["Frame Shape", data.frameShape],
      ["Estimated ED", `${fmt(estimatedEd(data))} mm`],
      ["Trace ED", `${fmt(data.effectiveDiameter)} mm`],
      ["Formula", data.frameShape === "Round" ? "max(A, B)" : data.frameShape === "Geometric" ? "sqrt(A² + B²) × 1.05" : "sqrt(A² + B²)"],
    ],
  },
  {
    id: "minimum-blank",
    category: "Lens Design",
    title: "Minimum Blank",
    description: "Calculates minimum blank.",
    icon: Target,
    required: ["effectiveDiameter", "aSize", "dbl", "pdRight", "pdLeft", "safetyMargin"],
    result: (data) => [
      ["ED", `${fmt(engineeringEd(data))} mm`],
      ["Frame PD", `${fmt(framePd(data))} mm`],
      ["Patient PD", `${fmt(totalPd(data))} mm`],
      ["Safety Margin", `${fmt(data.safetyMargin)} mm`],
      ["Minimum Blank", `${fmt(minimumBlank(data))} mm`],
    ],
  },
  {
    id: "surface-curve",
    category: "Lens Design",
    title: "Surface Curve",
    description: "Converts curve and sagitta.",
    icon: Layers,
    required: ["lensIndex", "baseCurve", "aSize"],
    result: (data) => {
      const radiusMeters = (data.lensIndex - 1) / Math.max(data.baseCurve, 0.01);
      const radiusMm = radiusMeters * 1000;
      const halfChord = data.aSize / 2;
      const sagitta = radiusMm - Math.sqrt(Math.max(radiusMm ** 2 - halfChord ** 2, 0));
      return [
        ["Radius", `${fmt(radiusMm)} mm`],
        ["Surface Power", `${fmt(data.baseCurve)} D`],
        ["Sagitta", `${fmt(sagitta)} mm`],
      ];
    },
  },
  {
    id: "lens-clock",
    category: "Lens Design",
    title: "Lens Clock",
    description: "Converts measured curve.",
    icon: Gauge,
    required: ["measuredCurve", "lensClockIndex", "actualIndex"],
    result: (data) => [
      ["Measured Curve", `${fmt(data.measuredCurve)} D`],
      ["Clock Index", fmt(data.lensClockIndex)],
      ["Actual Index", fmt(data.actualIndex)],
      ["Actual Curve", `${fmt(lensClockConversion(data))} D`],
    ],
  },
  {
    id: "base-curve",
    category: "Lens Design",
    title: "Base Curve",
    description: "Calculates Martin Rule curve.",
    icon: Aperture,
    required: ["sphere", "cylinder"],
    result: (data) => [
      ["Equivalent Sphere", `${signed(equivalentSphere(data))} D`],
      ["Martin Rule", `${signed(equivalentSphere(data) + 6)} D`],
      ["Rounded Curve", `${fmt(martinBaseCurve(data))} D`],
    ],
  },
  {
    id: "lens-weight",
    category: "Lens Design",
    title: "Lens Weight",
    description: "Estimates finished lens weight.",
    icon: Activity,
    required: ["effectiveDiameter", "aSize", "dbl", "pdRight", "pdLeft", "centerThickness", "edgeThickness"],
    result: (data) => {
      const material =
        materialProperties.find((entry) => entry.name === data.lensMaterial || fmt(entry.index) === fmt(data.lensIndex)) ??
        materialProperties[3];
      const weight = lensWeight(data, material.specificGravity);
      return [
        ["Material", material.name],
        ["Blank Diameter", `${fmt(minimumBlank(data))} mm`],
        ["Avg Thickness", `${fmt((data.centerThickness + edgeEstimate(data)) / 2)} mm`],
        ["Estimated Weight", `${fmt(weight)} g`],
      ];
    },
  },
  {
    id: "material-comparison",
    category: "Lens Design",
    title: "Material Comparison",
    description: "Compares thickness and weight.",
    icon: BookOpen,
    required: ["effectiveDiameter", "aSize", "dbl", "pdRight", "pdLeft", "centerThickness", "edgeThickness"],
    result: (data) =>
      materialProperties.flatMap((material) => {
        const scenario = { ...data, lensIndex: material.index, lensMaterial: material.name };
        return [
          [`${material.name} Thickness`, `${fmt(edgeEstimate(scenario, material.index))} mm`],
          [`${material.name} Weight`, `${fmt(lensWeight(scenario, material.specificGravity))} g`],
        ] as Array<[string, string]>;
      }),
  },
  {
    id: "induced-prism",
    category: "Prism & Binocular Vision",
    title: "Induced Prism",
    description: "Calculates Prentice prism.",
    icon: Target,
    required: ["sphere", "aSize", "dbl", "pdRight", "pdLeft"],
    result: (data) => {
      const prism = Math.abs(binocularDecentration(data) / 10) * Math.abs(data.sphere);
      return [
        ["Decentration", `${fmt(binocularDecentration(data))} mm`],
        ["Power Used", `${signed(data.sphere)} D`],
        ["Induced Prism", `${fmt(prism)}Δ`],
        ["Direction", binocularDecentration(data) >= 0 ? "Inward decentration" : "Outward decentration"],
      ];
    },
  },
  {
    id: "vertical-imbalance",
    category: "Prism & Binocular Vision",
    title: "Vertical Imbalance",
    description: "Calculates reading imbalance.",
    icon: Workflow,
    required: ["add", "readingDepth", "prismVertical"],
    result: (data) => {
      const nearImbalance = Math.abs(data.prismVertical) + Math.abs((data.readingDepth / 10) * data.add);
      return [
        ["Existing Vertical Prism", `${fmt(data.prismVertical)}Δ`],
        ["Reading Contribution", `${fmt((data.readingDepth / 10) * data.add)}Δ`],
        ["Net Imbalance", `${fmt(nearImbalance)}Δ`],
        ["Recommendation", nearImbalance >= 1.5 ? "Review slab-off" : "Within typical range"],
      ];
    },
  },
  {
    id: "compounding-prisms",
    category: "Prism & Binocular Vision",
    title: "Compounding Prisms",
    description: "Combines prism vectors.",
    icon: Triangle,
    required: ["prismHorizontal", "prismVertical"],
    result: (data) => {
      const resultant = Math.sqrt(data.prismHorizontal ** 2 + data.prismVertical ** 2);
      const direction = (Math.atan2(data.prismVertical, data.prismHorizontal) * 180) / Math.PI;
      return [
        ["Horizontal", `${fmt(data.prismHorizontal)}Δ`],
        ["Vertical", `${fmt(data.prismVertical)}Δ`],
        ["Resultant", `${fmt(resultant)}Δ`],
        ["Direction", `${fmt((direction + 360) % 360)}°`],
      ];
    },
  },
  {
    id: "resolving-prisms",
    category: "Prism & Binocular Vision",
    title: "Resolving Prisms",
    description: "Splits prism components.",
    icon: Compass,
    required: ["prismAmount", "prismDirection"],
    result: (data) => {
      const components = prismComponents(data.prismAmount, data.prismDirection);
      return [
        ["Prism Amount", `${fmt(data.prismAmount)}Δ`],
        ["Direction", `${fmt(data.prismDirection)}°`],
        ["Horizontal", `${fmt(components.horizontal)}Δ`],
        ["Vertical", `${fmt(components.vertical)}Δ`],
      ];
    },
  },
  {
    id: "prism-tolerance",
    category: "Prism & Binocular Vision",
    title: "Prism Tolerance",
    description: "Checks prism deltas.",
    icon: CheckCircle2,
    required: ["orderedPrismHorizontal", "orderedPrismVertical", "measuredPrismHorizontal", "measuredPrismVertical"],
    result: (data) => {
      const tolerance = ansiPrismTolerance(data);
      return [
        ["Horizontal Difference", `${signed(tolerance.horizontalDifference)}Δ`],
        ["Vertical Difference", `${signed(tolerance.verticalDifference)}Δ`],
        ["Horizontal Limit", "0.67Δ"],
        ["Vertical Limit", "0.33Δ"],
        ["Status", tolerance.pass ? "Pass" : "Review"],
      ];
    },
  },
  {
    id: "slab-off",
    category: "Prism & Binocular Vision",
    title: "Slab-Off",
    description: "Flags slab-off need.",
    icon: Clipboard,
    required: ["add", "readingDepth", "prismVertical"],
    result: (data) => {
      const imbalance = Math.abs(data.prismVertical) + Math.abs((data.readingDepth / 10) * data.add);
      return [
        ["Vertical Imbalance", `${fmt(imbalance)}Δ`],
        ["Threshold", "1.50Δ"],
        ["Recommendation", imbalance >= 1.5 ? "Consider slab-off" : "Usually not indicated"],
      ];
    },
  },
  {
    id: "decentration",
    category: "Frame Geometry",
    title: "Decentration",
    description: "Calculates monocular decentration.",
    icon: Box,
    required: ["aSize", "dbl", "pdRight", "pdLeft"],
    result: (data) => {
      const mono = monocularDecentrationValues(data);
      return [
        ["Frame PD", `${fmt(framePd(data))} mm`],
        ["Right Decentration", `${fmt(Math.abs(mono.right))} mm`],
        ["Left Decentration", `${fmt(Math.abs(mono.left))} mm`],
        ["Direction", `${decentrationDirection(mono.right)} / ${decentrationDirection(mono.left)}`],
      ];
    },
  },
  {
    id: "monocular-decentration",
    category: "Frame Geometry",
    title: "Monocular Decentration",
    description: "Splits right and left.",
    icon: Ruler,
    required: ["aSize", "dbl", "pdRight", "pdLeft"],
    result: (data) => {
      const mono = monocularDecentrationValues(data);
      return [
        ["Frame PD", `${fmt(framePd(data))} mm`],
        ["Right", `${fmt(mono.right)} mm`],
        ["Left", `${fmt(mono.left)} mm`],
        ["Direction", `${decentrationDirection(mono.right)} / ${decentrationDirection(mono.left)}`],
      ];
    },
  },
  {
    id: "boxing-system",
    category: "Frame Geometry",
    title: "Boxing System",
    description: "Calculates frame centers.",
    icon: Grid3X3,
    required: ["aSize", "bSize", "dbl"],
    result: (data) => [
      ["Frame PD", `${fmt(framePd(data))} mm`],
      ["Horizontal GC", `${fmt(data.aSize / 2)} mm`],
      ["Vertical GC", `${fmt(data.bSize / 2)} mm`],
    ],
  },
  {
    id: "wrap",
    category: "Frame Geometry",
    title: "Wrap",
    description: "Calculates wrap compensation.",
    icon: Aperture,
    required: ["sphere", "cylinder", "axis", "wrapAngle", "lensIndex"],
    result: (data) => {
      const adjusted = wrapCompensation(data);
      return [
        ["Comp Sphere", `${signed(adjusted.sphere)} D`],
        ["Comp Cylinder", `${signed(adjusted.cylinder)} D`],
        ["Comp Axis", `${fmt(adjusted.axis, 0)}°`],
        ["Axis Shift", `${signed(adjusted.axisShift)}°`],
      ];
    },
  },
  {
    id: "pantoscopic-tilt",
    category: "Frame Geometry",
    title: "Pantoscopic Tilt",
    description: "Calculates tilt compensation.",
    icon: Compass,
    required: ["sphere", "cylinder", "axis", "pantoscopicTilt", "lensIndex"],
    result: (data) => {
      const adjusted = tiltCompensation(data);
      return [
        ["Comp Sphere", `${signed(adjusted.sphere)} D`],
        ["Comp Cylinder", `${signed(adjusted.cylinder)} D`],
        ["Comp Axis", `${fmt(adjusted.axis, 0)}°`],
        ["Sphere Shift", `${signed(adjusted.powerShift)} D`],
      ];
    },
  },
  {
    id: "vertex-distance",
    category: "Frame Geometry",
    title: "Vertex Distance",
    description: "Calculates vertex compensation.",
    icon: Eye,
    required: ["sphere", "originalVertex", "newVertex"],
    result: (data) => {
      const compensated = vertexCompensation(data);
      return [
        ["Original Power", `${signed(data.sphere)} D`],
        ["Original Vertex", `${fmt(data.originalVertex)} mm`],
        ["New Vertex", `${fmt(data.newVertex)} mm`],
        ["Comp Power", `${signed(compensated)} D`],
      ];
    },
  },
  {
    id: "ansi-rx",
    category: "Quality Control",
    title: "ANSI Rx Tolerance",
    description: "Checks measured Rx.",
    icon: CheckCircle2,
    required: ["orderedSphere", "orderedCylinder", "orderedAxis", "measuredSphere", "measuredCylinder", "measuredAxis"],
    result: (data) => {
      const tolerance = ansiRxTolerance(data);
      return [
        ["Sphere Error", `${signed(tolerance.sphereError)} D`],
        ["Cylinder Error", `${signed(tolerance.cylinderError)} D`],
        ["Axis Error", `${fmt(tolerance.axisError, 0)}°`],
        ["Axis Limit", `${fmt(tolerance.axisTolerance, 0)}°`],
        ["Status", tolerance.pass ? "Pass" : "Review"],
      ];
    },
  },
  {
    id: "ansi-prism",
    category: "Quality Control",
    title: "ANSI Prism Tolerance",
    description: "Checks prism tolerance.",
    icon: FileText,
    required: ["orderedPrismHorizontal", "orderedPrismVertical", "measuredPrismHorizontal", "measuredPrismVertical"],
    result: (data) => {
      const tolerance = ansiPrismTolerance(data);
      return [
        ["Horizontal Difference", `${signed(tolerance.horizontalDifference)}Δ`],
        ["Vertical Difference", `${signed(tolerance.verticalDifference)}Δ`],
        ["Horizontal Limit", "0.67Δ"],
        ["Vertical Limit", "0.33Δ"],
        ["Status", tolerance.pass ? "Pass" : "Review"],
      ];
    },
  },
];

function CategoryGrid({
  calculators,
  activeCalculatorId,
  data,
  onSelect,
}: {
  calculators: CalculatorDefinition[];
  activeCalculatorId: string;
  data: OpticalData;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-8">
      {categoryOrder.map((category) => {
        const modules = calculators.filter((calculator) => calculator.category === category);
        return (
          <section key={category}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">{category}</p>
                <p className="mt-1 text-sm font-semibold text-[#625b53]">{categoryDescriptions[category]}</p>
              </div>
              <span className="rounded-lg border border-[#d8c6a8] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#625b53]">
                {modules.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {modules.map((calculator) => {
                const status = statusFor(data, calculator.required);
                const Icon = calculator.icon;
                const selected = calculator.id === activeCalculatorId;
                return (
                  <button
                    key={calculator.id}
                    type="button"
                    onClick={() => onSelect(calculator.id)}
                    className={`group min-h-40 rounded-lg border p-4 text-left transition hover:-translate-y-1 ${
                      selected
                        ? "border-[#172a28] bg-[#172a28] text-white shadow-[0_22px_62px_rgba(23,42,40,0.22)]"
                        : "border-[#eadfce] bg-white/86 text-[#172a28] hover:border-[#c9b28b]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded-lg ${selected ? "bg-[#d4c09a] text-[#172a28]" : "bg-[#fbf8f3] text-[#8a7654]"}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                          status.ready ? "bg-[#e7f7ed] text-[#21633c]" : "bg-[#fff1e8] text-[#9b4a22]"
                        }`}
                      >
                        {status.ready ? <CheckCircle2 className="h-3 w-3" /> : <Grid3X3 className="h-3 w-3" />}
                        {status.ready ? "Ready" : "Missing"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold leading-tight">{calculator.title}</h3>
                    <p className={`mt-2 text-xs leading-5 ${selected ? "text-white/68" : "text-[#625b53]"}`}>{calculator.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function OpticalEngineeringPage() {
  const [data, setData] = useState(initialData);
  const [activeCalculatorId, setActiveCalculatorId] = useState("lens-thickness");
  const [openPrescription, setOpenPrescription] = useState(true);
  const [openLens, setOpenLens] = useState(false);
  const [openFrame, setOpenFrame] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const activeCalculator = calculators.find((calculator) => calculator.id === activeCalculatorId) ?? calculators[0];
  const activeStatus = statusFor(data, activeCalculator.required);
  const results = activeCalculator.result(data);
  const calculatorCount = calculators.length;

  const groupedCalculators = calculators;
  const activeFieldKeys = new Set(activeCalculator.required);
  const requiredGroups = {
    Prescription: numericFields.some((field) => field.group === "Prescription" && activeFieldKeys.has(field.key)),
    Lens: numericFields.some((field) => field.group === "Lens" && activeFieldKeys.has(field.key)),
    Frame: numericFields.some((field) => field.group === "Frame" && activeFieldKeys.has(field.key)),
  };
  const needsFrameShape = activeFieldKeys.has("frameShape");
  const needsFrameType = activeFieldKeys.has("frameType");
  const needsMaterialPresets = activeFieldKeys.has("lensIndex") || activeFieldKeys.has("actualIndex");

  const updateNumber = (key: keyof OpticalData, value: string) => {
    setData((current) => ({ ...current, [key]: value === "" ? Number.NaN : Number(value) }));
  };

  const selectMaterial = (name: string, index: number) => {
    setData((current) => ({ ...current, lensMaterial: name, lensIndex: index, actualIndex: index }));
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
  };

  const resultsText = [
    "ALN Optical Engineering Center",
    `Calculator: ${activeCalculator.title}`,
    `Prescription: ${rxSummary(data)}`,
    `Lens: ${lensSummary(data)}`,
    `Frame: ${frameSummary(data)}`,
    ...results.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const copyResults = async () => {
    await copyText(resultsText);
  };

  const printReport = () => {
    window.print();
  };

  const shareScenario = async () => {
    const params = new URLSearchParams(Object.entries(data).map(([key, value]) => [key, String(value)]));
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: activeCalculator.title, text: resultsText, url });
        return;
      }
    } catch {
      // Fall back to copying the scenario URL when native sharing is dismissed.
    }
    await copyText(url);
  };

  const openCalculator = (id: string) => {
    const calculator = calculators.find((entry) => entry.id === id);
    setActiveCalculatorId(id);
    setResultsOpen(false);
    if (!calculator) {
      return;
    }

    const keys = new Set(calculator.required);
    setOpenPrescription(numericFields.some((field) => field.group === "Prescription" && keys.has(field.key)));
    setOpenLens(numericFields.some((field) => field.group === "Lens" && keys.has(field.key)));
    setOpenFrame(
      numericFields.some((field) => field.group === "Frame" && keys.has(field.key)) || keys.has("frameShape") || keys.has("frameType"),
    );

    requestAnimationFrame(() => {
      document.getElementById("calculator-setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const runCalculation = () => {
    if (activeStatus.ready) {
      setResultsOpen(true);
      return;
    }

    setOpenPrescription(requiredGroups.Prescription);
    setOpenLens(requiredGroups.Lens);
    setOpenFrame(requiredGroups.Frame || needsFrameShape || needsFrameType);
    document.getElementById("calculator-setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const numericInputs = (group: GroupName) => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {numericFields
        .filter((field) => field.group === group && activeFieldKeys.has(field.key))
        .map((field) => (
          <label key={field.key} className="grid gap-1">
            <span className="text-xs font-semibold text-[#625b53]">{field.label}</span>
            <span className="grid min-w-[150px] grid-cols-[minmax(76px,1fr)_56px] overflow-hidden rounded-lg border border-[#eadfce] bg-[#fbf8f3] focus-within:border-[#c9b28b] focus-within:ring-2 focus-within:ring-[#d4c09a]/35">
              <input
                type="number"
                step={field.step}
                value={inputValue(data[field.key] as number, field.decimals ?? 2)}
                onChange={(event) => updateNumber(field.key, event.target.value)}
                className="min-h-12 min-w-0 bg-transparent px-4 text-base font-semibold text-[#172a28] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {field.suffix ? (
                <span className="grid place-items-center border-l border-[#eadfce] px-2 text-sm font-semibold text-[#8a7654]">
                  {field.suffix}
                </span>
              ) : null}
            </span>
          </label>
        ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#172a28]">
      <Header />
      <style>{`
        .print-report { display: none; }
        @media print {
          header, footer, main > section:not(.print-report) { display: none !important; }
          .print-report { display: block !important; padding: 32px; color: #172a28; }
          body { background: white !important; }
        }
      `}</style>
      <ResultModal
        open={resultsOpen}
        title={activeCalculator.title}
        category={activeCalculator.category}
        results={results}
        ready={activeStatus.ready}
        missing={activeStatus.missing}
        onClose={() => setResultsOpen(false)}
        onCopy={copyResults}
        onPrint={printReport}
        onShare={shareScenario}
      />

      <section className="relative overflow-hidden bg-[#101820] px-6 pb-14 pt-30 text-white md:px-10 md:pb-18 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(212,192,154,0.22),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(126,226,170,0.13),transparent_28%),linear-gradient(135deg,#101820_0%,#172a28_58%,#0c1117_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(212,192,154,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(212,192,154,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d4c09a]">Artisan Lab Network</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">Optical Engineering Center</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72 md:text-2xl md:leading-10">
              Laboratory-grade optical calculators, reference formulas, and tolerance tools.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#workspace" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#d4c09a] px-6 text-sm font-semibold text-[#101820] transition hover:-translate-y-0.5 hover:bg-[#ead7ad]">
                Select Calculator
              </a>
              <a href="#references" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4c09a]/60 hover:bg-white/12">
                Reference Library
              </a>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[`${calculatorCount} Calculators`, "Engineering Reference", "Real-Time Results", "Laboratory Grade"].map((stat) => (
                <div key={stat} className="rounded-lg border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
                  <p className="text-sm font-semibold text-white">{stat}</p>
                </div>
              ))}
            </div>
          </div>
          <FormulaWall onCopy={copyText} />
        </div>
      </section>

      <section className="px-6 pb-8 pt-8 md:px-10">
        <div className="mx-auto max-w-7xl rounded-lg border border-[#d8c6a8] bg-white/82 p-5 shadow-[0_14px_34px_rgba(24,18,13,0.05)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#172a28] text-[#d4c09a]">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">Important Use Note</p>
              <p className="mt-2 text-sm leading-7 text-[#625b53]">{engineeringDisclaimer}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="workspace" className="px-6 py-10 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl rounded-lg border border-[#d8c6a8] bg-[#fbf8f3]/88 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)] md:p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Calculator Modules</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172a28]">Select Calculator</h2>
            </div>
            <span className="inline-flex w-fit rounded-lg border border-[#d8c6a8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#625b53]">
              {calculatorCount} modules
            </span>
          </div>
          <CategoryGrid
            calculators={groupedCalculators}
            activeCalculatorId={activeCalculatorId}
            data={data}
            onSelect={openCalculator}
          />
        </div>
      </section>

      <section id="calculator-setup" className="px-6 pb-12 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <div className="grid gap-5">
            <div className="rounded-lg border border-[#d8c6a8] bg-white/86 p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">{activeCalculator.category}</p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[#172a28]">{activeCalculator.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold text-[#625b53]">{activeCalculator.description}</p>
                </div>
                <button onClick={runCalculation} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#172a28] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#27433f]">
                  Calculate
                </button>
              </div>
              {!activeStatus.ready ? (
                <div className="mt-5 rounded-2xl border border-[#e7bea5] bg-[#fff1e8] p-4 text-sm font-semibold text-[#8a3f21]">
                  Missing: {activeStatus.missing.join(", ")}
                </div>
              ) : null}
            </div>
            {requiredGroups.Prescription ? (
              <SetupAccordion
                title="Prescription"
                summary={rxSummary(data)}
                open={openPrescription}
                onToggle={() => setOpenPrescription((value) => !value)}
              >
                {numericInputs("Prescription")}
              </SetupAccordion>
            ) : null}
            <div className="grid gap-5 lg:grid-cols-2">
              {requiredGroups.Lens ? (
                <SetupAccordion title="Lens" summary={lensSummary(data)} open={openLens} onToggle={() => setOpenLens((value) => !value)}>
                  {needsMaterialPresets ? (
                    <div className="mb-5 grid gap-2 sm:grid-cols-2">
                      {materialProperties.map((material) => {
                        const selected = data.lensMaterial === material.name;
                        return (
                          <button
                            key={material.name}
                            type="button"
                            onClick={() => selectMaterial(material.name, material.index)}
                            className={`rounded-lg border p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 ${
                              selected ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#eadfce] bg-[#fbf8f3] text-[#172a28]"
                            }`}
                          >
                            {materialLabel(material.name, material.index)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  {numericInputs("Lens")}
                </SetupAccordion>
              ) : null}
              {requiredGroups.Frame || needsFrameShape || needsFrameType ? (
                <SetupAccordion title="Frame" summary={frameSummary(data)} open={openFrame} onToggle={() => setOpenFrame((value) => !value)}>
                  {needsFrameShape || needsFrameType ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {needsFrameShape ? (
                        <label className="grid gap-1">
                          <span className="text-xs font-semibold text-[#625b53]">Frame Shape</span>
                          <select
                            value={data.frameShape}
                            onChange={(event) => setData((current) => ({ ...current, frameShape: event.target.value as FrameShape }))}
                            className="min-h-12 rounded-lg border border-[#eadfce] bg-[#fbf8f3] px-4 text-base font-semibold outline-none focus:border-[#c9b28b] focus:ring-2 focus:ring-[#d4c09a]/35"
                          >
                            {["Round", "Rectangle", "Geometric"].map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      {needsFrameType ? (
                        <label className="grid gap-1">
                          <span className="text-xs font-semibold text-[#625b53]">Frame Type</span>
                          <select
                            value={data.frameType}
                            onChange={(event) => setData((current) => ({ ...current, frameType: event.target.value }))}
                            className="min-h-12 rounded-lg border border-[#eadfce] bg-[#fbf8f3] px-4 text-base font-semibold outline-none focus:border-[#c9b28b] focus:ring-2 focus:ring-[#d4c09a]/35"
                          >
                            {["Full Rim", "Semi-Rimless", "Rimless"].map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </div>
                  ) : null}
                  {requiredGroups.Frame ? <div className={needsFrameShape || needsFrameType ? "mt-5" : ""}>{numericInputs("Frame")}</div> : null}
                </SetupAccordion>
              ) : null}
            </div>
          </div>
          <aside className="xl:sticky xl:top-24 xl:h-fit">
            <div className="rounded-lg border border-[#d8c6a8] bg-[#172a28] p-5 text-white shadow-[0_18px_48px_rgba(24,18,13,0.12)]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4c09a]">Scenario</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">{activeCalculator.title}</h3>
              <div className="mt-4 grid gap-3 text-sm text-white/72">
                <p>{rxSummary(data)}</p>
                <p>{lensSummary(data)}</p>
                <p>{frameSummary(data)}</p>
              </div>
              <div className="mt-5 grid gap-3">
                <button onClick={runCalculation} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#d4c09a] px-5 text-sm font-semibold text-[#172a28] transition hover:-translate-y-0.5 hover:bg-[#ead7ad]">
                  Calculate
                </button>
                <button onClick={shareScenario} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/12 bg-white/8 px-5 text-sm font-semibold text-white transition hover:bg-white/12">
                  Copy Scenario
                </button>
              </div>
            </div>
            <div className="mt-5">
              <MaterialComparison data={data} />
            </div>
          </aside>
        </div>
      </section>

      <section id="references" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Optical Reference Library</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Engineering Reference</h2>
            </div>
            <BookOpen className="h-12 w-12 text-[#c9b28b]" />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {references.map((reference) => (
              <div key={reference.title} className="rounded-[24px] border border-[#d8c6a8] bg-white/82 p-5 shadow-[0_14px_34px_rgba(24,18,13,0.05)]">
                <p className="inline-flex items-center gap-3 text-lg font-semibold text-[#172a28]">
                  <FileText className="h-5 w-5 text-[#8a7654]" />
                  {reference.title}
                </p>
                <p className="mt-4 font-mono text-sm text-[#172a28]">{reference.formula}</p>
                <p className="mt-3 text-sm leading-6 text-[#625b53]">{reference.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="print-report">
        <div style={{ maxWidth: "760px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
          <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a7654", fontWeight: 700 }}>Artisan Lab Network</p>
          <h1 style={{ fontSize: 34, margin: "10px 0 4px", color: "#172a28" }}>Optical Engineering Calculation Report</h1>
          <p style={{ margin: "0 0 24px", color: "#625b53" }}>{activeCalculator.title}</p>
          <div style={{ border: "1px solid #d8c6a8", borderRadius: 16, padding: 18, marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#172a28" }}>Setup</h2>
            <p style={{ margin: "6px 0" }}><strong>Prescription:</strong> {rxSummary(data)}</p>
            <p style={{ margin: "6px 0" }}><strong>Lens:</strong> {lensSummary(data)}</p>
            <p style={{ margin: "6px 0" }}><strong>Frame:</strong> {frameSummary(data)}</p>
          </div>
          <div style={{ border: "1px solid #d8c6a8", borderRadius: 16, padding: 18, marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#172a28" }}>Important Use Note</h2>
            <p style={{ margin: 0, color: "#625b53", lineHeight: 1.6 }}>{engineeringDisclaimer}</p>
          </div>
          <div style={{ border: "1px solid #d8c6a8", borderRadius: 16, padding: 18 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#172a28" }}>Results</h2>
            {results.map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 24, borderBottom: "1px solid #eadfce", padding: "10px 0" }}>
                <span style={{ color: "#625b53", fontWeight: 700 }}>{label}</span>
                <span style={{ color: "#172a28", fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
          <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #eadfce", borderRadius: 12, padding: 14, marginTop: 18, color: "#172a28" }}>{resultsText}</pre>
        </div>
      </section>

      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}
