"use client";

import { useMemo, useState, type ReactNode } from "react";
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
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";

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
  framePd: number;
  frameShape: string;
  frameType: string;
  readingDepth: number;
  prismAmount: number;
  prismDirection: number;
};

type CalcStatus = {
  ready: boolean;
  missing: string[];
};

type CalculatorDefinition = {
  id: string;
  title: string;
  description: string;
  icon: typeof Calculator;
  required: Array<keyof OpticalData>;
  result: (data: OpticalData) => Array<[string, string]>;
};

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
  framePd: 70,
  frameShape: "Rounded Rectangle",
  frameType: "Full Rim",
  readingDepth: 10,
  prismAmount: 3,
  prismDirection: 45,
};

const materialIndexes = [
  ["Plastic", 1.5],
  ["Trivex", 1.53],
  ["Polycarbonate", 1.59],
  ["1.60", 1.6],
  ["1.67", 1.67],
  ["1.74", 1.74],
  ["1.76", 1.76],
] as const;

const numericFields: Array<{
  key: keyof OpticalData;
  label: string;
  suffix?: string;
  step?: string;
  decimals?: number;
  group: "Prescription" | "Lens" | "Frame";
}> = [
  { key: "sphere", label: "Sphere", suffix: "Diopters", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "cylinder", label: "Cylinder", suffix: "Diopters", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "axis", label: "Axis", suffix: "°", step: "1", decimals: 0, group: "Prescription" },
  { key: "add", label: "Add", suffix: "Diopters", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "prismHorizontal", label: "Prism Horizontal", suffix: "Δ", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "prismVertical", label: "Prism Vertical", suffix: "Δ", step: "0.25", decimals: 2, group: "Prescription" },
  { key: "pdRight", label: "PD Right", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "pdLeft", label: "PD Left", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "segHeight", label: "Seg Height", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "vertexDistance", label: "Vertex Distance", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "originalVertex", label: "Original Vertex", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "newVertex", label: "New Vertex", suffix: "mm", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "pantoscopicTilt", label: "Pantoscopic Tilt", suffix: "°", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "wrapAngle", label: "Wrap Angle", suffix: "°", step: "0.5", decimals: 2, group: "Prescription" },
  { key: "baseCurve", label: "Base Curve", suffix: "Diopters", step: "0.25", decimals: 2, group: "Lens" },
  { key: "lensIndex", label: "Lens Index", step: "0.01", decimals: 2, group: "Lens" },
  { key: "centerThickness", label: "Center Thickness", suffix: "mm", step: "0.1", decimals: 2, group: "Lens" },
  { key: "edgeThickness", label: "Edge Thickness", suffix: "mm", step: "0.1", decimals: 2, group: "Lens" },
  { key: "aSize", label: "A Size", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "bSize", label: "B Size", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "dbl", label: "DBL", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "effectiveDiameter", label: "Effective Diameter", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "framePd", label: "Frame PD", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "readingDepth", label: "Reading Depth", suffix: "mm", step: "0.5", decimals: 2, group: "Frame" },
  { key: "prismAmount", label: "Prism Amount", suffix: "Δ", step: "0.25", decimals: 2, group: "Frame" },
  { key: "prismDirection", label: "Prism Direction", suffix: "°", step: "1", decimals: 0, group: "Frame" },
];

function totalPd(data: OpticalData) {
  return data.pdRight + data.pdLeft;
}

function radians(value: number) {
  return (value * Math.PI) / 180;
}

function signed(value: number, digits = 2) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function fmt(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function inputValue(value: number, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "";
}

function materialLabel(name: string, index: number) {
  return name.match(/^\d/) ? `${name} Index` : `${name} · ${index.toFixed(2)} Index`;
}

function materialName(name: string) {
  return name.match(/^\d/) ? `${name} Index` : name;
}

function rxSummary(data: OpticalData) {
  return `${signed(data.sphere)} ${signed(data.cylinder)} × ${fmt(data.axis, 0)} · Add ${signed(data.add)} · PD ${fmt(totalPd(data))}`;
}

function lensSummary(data: OpticalData) {
  return `${materialLabel(data.lensMaterial, data.lensIndex)} · CT ${fmt(data.centerThickness)} mm`;
}

function frameSummary(data: OpticalData) {
  return `${data.frameShape} · ${data.frameType} · A ${fmt(data.aSize)} / B ${fmt(data.bSize)} / DBL ${fmt(data.dbl)}`;
}

function horizontalPower(data: OpticalData) {
  return data.sphere + data.cylinder * Math.sin(radians(data.axis)) ** 2;
}

function decentration(data: OpticalData) {
  return (data.aSize + data.dbl - totalPd(data)) / 2;
}

function horizontalRadius(data: OpticalData) {
  return data.aSize / 2 + decentration(data);
}

function thicknessIncrease(data: OpticalData, index = data.lensIndex) {
  const power = Math.abs(horizontalPower(data));
  return (horizontalRadius(data) ** 2 * power) / (2000 * Math.max(index - 1, 0.01));
}

function edgeEstimate(data: OpticalData, index = data.lensIndex) {
  return data.centerThickness + thicknessIncrease(data, index);
}

function statusFor(data: OpticalData, required: Array<keyof OpticalData>): CalcStatus {
  const missing = required.filter((key) => {
    const value = data[key];
    return typeof value === "number" ? !Number.isFinite(value) : !String(value || "").trim();
  });
  return { ready: missing.length === 0, missing: missing.map(String) };
}

function powerVector(data: OpticalData) {
  const m = data.sphere + data.cylinder / 2;
  const j0 = -(data.cylinder / 2) * Math.cos(2 * radians(data.axis));
  const j45 = -(data.cylinder / 2) * Math.sin(2 * radians(data.axis));
  return { m, j0, j45 };
}

function vectorToRx(m: number, j0: number, j45: number) {
  const cylinder = -2 * Math.sqrt(j0 ** 2 + j45 ** 2);
  const sphere = m - cylinder / 2;
  const axis = ((Math.atan2(j45, j0) / 2) * 180) / Math.PI;
  return { sphere, cylinder, axis: axis < 0 ? axis + 180 : axis };
}

function tiltCompensation(data: OpticalData) {
  const tilt = radians(data.pantoscopicTilt);
  const powerShift = (Math.sin(tilt) ** 2 * data.sphere) / Math.max(data.lensIndex, 1);
  const cylinderShift = Math.abs(data.sphere) * Math.tan(tilt) ** 2;
  return {
    sphere: data.sphere + powerShift,
    cylinder: data.cylinder - cylinderShift,
    axis: data.axis,
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
    axis: (data.axis + axisShift + 180) % 180,
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

const formulaTiles = [
  { label: "Thickness", formula: "ET = CT + (r² × |F|) / 2000(n − 1)" },
  { label: "Prentice", formula: "Δ = c × F" },
  { label: "Vertex", formula: "F′ = F / (1 − dF)" },
  { label: "Power Vector", formula: "M = S + C / 2" },
  { label: "J0", formula: "J₀ = −(C / 2) cos(2α)" },
  { label: "J45", formula: "J₄₅ = −(C / 2) sin(2α)" },
  { label: "Surface", formula: "F = (n − 1) / r" },
  { label: "Prism Vector", formula: "R = √(H² + V²)" },
];

function FormulaWall({ onCopy }: { onCopy: (value: string) => void }) {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#071017] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(212,192,154,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(212,192,154,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#d4c09a]/20 shadow-[0_0_0_38px_rgba(212,192,154,0.035),0_0_0_76px_rgba(212,192,154,0.025)]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4c09a]">Applied Optical Engineering</p>
          <h2 className="mt-4 max-w-2xl font-mono text-3xl leading-tight tracking-[-0.04em] text-white md:text-5xl">
            Precision calculations for real-world lens design.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {formulaTiles.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onCopy(`${item.label}: ${item.formula}`)}
              className="group rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left transition hover:border-[#d4c09a]/55 hover:bg-white/[0.085]"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4c09a]">{item.label}</span>
              <span className="mt-2 block font-mono text-lg leading-7 text-white md:text-xl">{item.formula}</span>
              <span className="mt-3 block text-xs font-semibold text-white/44 opacity-0 transition group-hover:opacity-100">Click to copy equation</span>
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
            <Copy className="h-3.5 w-3.5" /> Copy calculation
          </span>
        </button>
      ))}
    </div>
  );
}

function MaterialComparison({ data }: { data: OpticalData }) {
  return (
    <div className="rounded-[28px] border border-[#d8c6a8] bg-[#172a28] p-5 text-white shadow-[0_18px_48px_rgba(24,18,13,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">Material Comparison</p>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {materialIndexes.map(([name, index]) => {
          const value = edgeEstimate(data, index);
          const width = Math.min(100, Math.max(18, value * 14));
          return (
            <div key={name} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-sm">
              <span className="text-white/72">{materialName(name)}</span>
              <span className="h-2 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-[#d4c09a]" style={{ width: `${width}%` }} />
              </span>
              <span className="text-right font-semibold">{fmt(value)} mm</span>
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
    <div className="rounded-[28px] border border-[#d8c6a8] bg-white/86 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 p-5 text-left transition hover:bg-[#fbf8f3] sm:flex-row sm:items-center sm:justify-between md:p-6"
      >
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">{title}</span>
          <span className="mt-2 block text-sm font-semibold text-[#625b53]">{summary}</span>
        </span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] text-xl font-semibold text-[#172a28]">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="border-t border-[#eadfce] p-5 md:p-6">{children}</div> : null}
    </div>
  );
}

const calculators: CalculatorDefinition[] = [
  {
    id: "thickness",
    title: "Lens Thickness at 180°",
    description: "Estimate finished horizontal edge thickness from Rx, PD, frame A/DBL, index, and center thickness.",
    icon: Ruler,
    required: ["sphere", "cylinder", "axis", "pdRight", "pdLeft", "aSize", "dbl", "lensIndex", "centerThickness"],
    result: (data) => [
      ["Horizontal Power", `${signed(horizontalPower(data))} D`],
      ["Decentration", `${fmt(decentration(data))} mm`],
      ["Effective Diameter", `${fmt(data.effectiveDiameter)} mm`],
      ["Thickness Increase", `${fmt(thicknessIncrease(data))} mm`],
      ["Estimated Edge Thickness", `${fmt(edgeEstimate(data))} mm`],
    ],
  },
  {
    id: "tilt",
    title: "Tilt Compensation",
    description: "Estimate pantoscopic tilt power changes using standard oblique astigmatism approximations.",
    icon: Compass,
    required: ["sphere", "cylinder", "axis", "pantoscopicTilt", "lensIndex"],
    result: (data) => {
      const adjusted = tiltCompensation(data);
      return [
        ["Original Rx", `${signed(data.sphere)} ${signed(data.cylinder)} × ${fmt(data.axis, 0)}`],
        ["Compensated Rx", `${signed(adjusted.sphere)} ${signed(adjusted.cylinder)} × ${fmt(adjusted.axis, 0)}`],
        ["Sphere Shift", `${signed(adjusted.powerShift)} D`],
        ["Cylinder Shift", `${signed(-adjusted.cylinderShift)} D`],
      ];
    },
  },
  {
    id: "wrap",
    title: "Wrap Compensation",
    description: "Model wrap-induced power and axis shifts for wrapped ophthalmic frames.",
    icon: Aperture,
    required: ["sphere", "cylinder", "axis", "wrapAngle", "lensIndex"],
    result: (data) => {
      const adjusted = wrapCompensation(data);
      return [
        ["Original Rx", `${signed(data.sphere)} ${signed(data.cylinder)} × ${fmt(data.axis, 0)}`],
        ["Compensated Rx", `${signed(adjusted.sphere)} ${signed(adjusted.cylinder)} × ${fmt(adjusted.axis, 0)}`],
        ["Axis Shift", `${signed(adjusted.axisShift)}°`],
        ["Power Shift", `${signed(adjusted.powerShift)} D`],
      ];
    },
  },
  {
    id: "vertex",
    title: "Vertex Distance Compensation",
    description: "Convert prescription power when moving between fitting vertex distances.",
    icon: Eye,
    required: ["sphere", "originalVertex", "newVertex"],
    result: (data) => {
      const compensated = vertexCompensation(data);
      return [
        ["Original Power", `${signed(data.sphere)} D`],
        ["Original Vertex", `${fmt(data.originalVertex)} mm`],
        ["New Vertex", `${fmt(data.newVertex)} mm`],
        ["Compensated Power", `${signed(compensated)} D`],
        ["Power Change", `${signed(compensated - data.sphere)} D`],
      ];
    },
  },
  {
    id: "crossed",
    title: "Crossed Cylinders",
    description: "Use power-vector mathematics to combine spherical-cylinder form into vector components and back.",
    icon: Sigma,
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
    id: "magnification",
    title: "Spectacle Magnification",
    description: "Estimate shape factor, power factor, and total spectacle magnification.",
    icon: Gauge,
    required: ["baseCurve", "centerThickness", "lensIndex", "sphere", "vertexDistance"],
    result: (data) => {
      const shape = 1 / (1 - (data.centerThickness / 1000 / data.lensIndex) * data.baseCurve);
      const power = 1 / (1 - (data.vertexDistance / 1000) * data.sphere);
      const sm = shape * power;
      return [
        ["Shape Factor", fmt(shape, 4)],
        ["Power Factor", fmt(power, 4)],
        ["Spectacle Magnification", `${fmt((sm - 1) * 100)}%`],
      ];
    },
  },
  {
    id: "blank",
    title: "Single Vision Blank Size",
    description: "Determine minimum blank size and practical recommended blank diameter.",
    icon: Box,
    required: ["effectiveDiameter", "aSize", "dbl", "pdRight", "pdLeft"],
    result: (data) => {
      const dec = Math.abs(decentration(data));
      const minimum = data.effectiveDiameter + 2 * dec;
      return [
        ["Effective Diameter", `${fmt(data.effectiveDiameter)} mm`],
        ["Decentration", `${fmt(dec)} mm`],
        ["Minimum Blank Size", `${fmt(minimum)} mm`],
        ["Recommended Blank", `${Math.ceil(minimum / 5) * 5} mm`],
      ];
    },
  },
  {
    id: "imbalance",
    title: "Vertical Imbalance",
    description: "Apply Prentice Rule at reading depth to flag possible slab-off recommendations.",
    icon: Workflow,
    required: ["sphere", "add", "readingDepth"],
    result: (data) => {
      const od = (data.readingDepth / 10) * data.sphere;
      const os = (data.readingDepth / 10) * (data.sphere + data.add);
      const net = Math.abs(od - os);
      return [
        ["OD Prism", `${fmt(Math.abs(od))}Δ`],
        ["OS Prism", `${fmt(Math.abs(os))}Δ`],
        ["Net Vertical Imbalance", `${fmt(net)}Δ`],
        ["Slab-Off Recommendation", net >= 1.5 ? "Review slab-off / reverse slab-off" : "Usually not indicated"],
      ];
    },
  },
  {
    id: "induced",
    title: "Induced Prism",
    description: "Calculate induced prism from decentration and power using Prentice Rule.",
    icon: Target,
    required: ["sphere", "aSize", "dbl", "pdRight", "pdLeft"],
    result: (data) => {
      const prism = Math.abs(decentration(data) / 10) * Math.abs(data.sphere);
      return [
        ["Decentration", `${fmt(decentration(data))} mm`],
        ["Prism Amount", `${fmt(prism)}Δ`],
        ["Base Direction", decentration(data) >= 0 ? "Base In / Out depends eye" : "Base Out / In depends eye"],
      ];
    },
  },
  {
    id: "compound-prism",
    title: "Compounding Prisms",
    description: "Compound horizontal and vertical prism components into a resultant vector.",
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
    id: "resolve-prism",
    title: "Resolving Prisms",
    description: "Resolve a prism amount and axis into horizontal and vertical components.",
    icon: Activity,
    required: ["prismAmount", "prismDirection"],
    result: (data) => {
      const components = prismComponents(data.prismAmount, data.prismDirection);
      return [
        ["Prism Amount", `${fmt(data.prismAmount)}Δ`],
        ["Direction", `${fmt(data.prismDirection)}°`],
        ["Horizontal Component", `${fmt(components.horizontal)}Δ`],
        ["Vertical Component", `${fmt(components.vertical)}Δ`],
      ];
    },
  },
  {
    id: "surface",
    title: "Surface Curve",
    description: "Convert radius and index into surface power and estimate sagitta over the frame chord.",
    icon: Layers,
    required: ["lensIndex", "baseCurve", "aSize"],
    result: (data) => {
      const radiusMeters = (data.lensIndex - 1) / Math.max(data.baseCurve, 0.01);
      const radiusMm = radiusMeters * 1000;
      const halfChord = data.aSize / 2;
      const sagitta = radiusMm - Math.sqrt(Math.max(radiusMm ** 2 - halfChord ** 2, 0));
      return [
        ["Radius", `${fmt(radiusMm)} mm`],
        ["Surface Power", `${fmt((data.lensIndex - 1) / radiusMeters)} D`],
        ["Sagitta", `${fmt(sagitta)} mm`],
      ];
    },
  },
];

const references = [
  ["Prentice Rule", "Prism = c × F, where c is decentration in centimeters and F is lens power in diopters."],
  ["Martin Rule", "A practical base curve selection rule used to keep lens form comfortable and cosmetically balanced."],
  ["Sagitta Formula", "Sagitta estimates curve depth from radius and chord for lens surface geometry."],
  ["Thickness Formula", "Lens thickness estimates depend on power, radius, index, decentration, and minimum center/edge thickness."],
  ["Surface Curve Formula", "Surface Power = (n − 1) / radius, with radius in meters."],
  ["Vertex Compensation", "Compensated Power = F / (1 − dF), with d in meters."],
  ["Crossed Cylinder Math", "Power vectors M, J0, and J45 make cylinder combinations and axis changes easier to model."],
  ["Lens Material Comparison", "Higher index materials reduce estimated thickness but may introduce Abbe and coating tradeoffs."],
  ["Abbe Values", "Abbe value describes chromatic dispersion; lower values can increase color fringing."],
  ["Laboratory Best Practices", "Always validate calculator estimates against lab standards, frame trace, Rx, material, coatings, and safety rules."],
];

export default function OpticalEngineeringPage() {
  const [data, setData] = useState(initialData);
  const [activeCalculatorId, setActiveCalculatorId] = useState("thickness");
  const [openPrescription, setOpenPrescription] = useState(true);
  const [openLens, setOpenLens] = useState(false);
  const [openFrame, setOpenFrame] = useState(false);
  const activeCalculator = calculators.find((calculator) => calculator.id === activeCalculatorId) ?? calculators[0];
  const activeStatus = statusFor(data, activeCalculator.required);
  const results = useMemo(() => activeCalculator.result(data), [activeCalculatorId, data]);

  const updateNumber = (key: keyof OpticalData, value: string) => {
    setData((current) => ({ ...current, [key]: Number(value) }));
  };

  const selectMaterial = (name: string, index: number) => {
    setData((current) => ({ ...current, lensMaterial: name, lensIndex: index }));
  };

  const copyText = async (text: string) => {
    await navigator.clipboard?.writeText(text);
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
    const params = new URLSearchParams(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    await navigator.clipboard?.writeText(url);
  };

  const numericInputs = (group: "Prescription" | "Lens" | "Frame") => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {numericFields.filter((field) => field.group === group).map((field) => (
        <label key={field.key} className="grid gap-1">
          <span className="text-xs font-semibold text-[#625b53]">{field.label}</span>
          <span className="flex overflow-hidden rounded-2xl border border-[#eadfce] bg-[#fbf8f3]">
            <input
              type="number"
              step={field.step}
              value={inputValue(data[field.key] as number, field.decimals ?? 2)}
              onChange={(event) => updateNumber(field.key, event.target.value)}
              className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[#172a28] outline-none"
            />
            {field.suffix ? <span className="grid min-w-16 place-items-center border-l border-[#eadfce] px-2 text-xs font-semibold text-[#8a7654]">{field.suffix}</span> : null}
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

      <section className="relative overflow-hidden bg-[#101820] px-6 pb-16 pt-32 text-white md:px-10 md:pb-20 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(212,192,154,0.22),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(126,226,170,0.13),transparent_28%),linear-gradient(135deg,#101820_0%,#172a28_58%,#0c1117_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(212,192,154,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(212,192,154,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute -right-24 top-20 h-[460px] w-[460px] rounded-full border border-[#d4c09a]/22 shadow-[0_0_0_44px_rgba(212,192,154,0.035),0_0_0_88px_rgba(212,192,154,0.025)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d4c09a]">Artisan Lab Network</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">Optical Engineering Center</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72 md:text-2xl md:leading-10">
              Professional optical calculations, lens design tools, prism analysis, and engineering references for laboratories and eyecare professionals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#engineering-model" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#101820] transition hover:-translate-y-0.5 hover:bg-[#ead7ad]">
                Start Calculating
              </a>
              <a href="#references" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4c09a]/60 hover:bg-white/12">
                Browse References
              </a>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {["12 Professional Calculators", "Optical Engineering References", "Real-Time Calculations", "Laboratory Grade Results"].map((stat) => (
                <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
                  <p className="text-sm font-semibold text-white">{stat}</p>
                </div>
              ))}
            </div>
          </div>
          <FormulaWall onCopy={copyText} />
        </div>
      </section>

      <section id="engineering-model" className="px-6 py-10 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Engineering Model</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[#172a28]">Live optical model first.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copyResults} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-4 text-sm font-semibold transition hover:bg-[#d4c09a]"><Copy className="h-4 w-4" />Copy Results</button>
              <button onClick={printReport} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-4 text-sm font-semibold transition hover:bg-[#d4c09a]"><Printer className="h-4 w-4" />Print Report</button>
              <button onClick={shareScenario} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-4 text-sm font-semibold transition hover:bg-[#d4c09a]"><Share2 className="h-4 w-4" />Share</button>
              <button onClick={printReport} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172a28] px-4 text-sm font-semibold text-white transition hover:bg-[#27433f]"><Download className="h-4 w-4" />Save PDF</button>
            </div>
          </div>
          <div className="grid gap-5">
            <div id="calculator-results" className="scroll-mt-28 rounded-[32px] border border-[#d8c6a8] bg-white/86 p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Calculator Results</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">{activeCalculator.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#625b53]">{activeCalculator.description}</p>
                </div>
                <button onClick={copyResults} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-4 text-sm font-semibold transition hover:bg-[#d4c09a]"><Copy className="h-4 w-4" />Copy All</button>
              </div>
              {!activeStatus.ready ? (
                <div className="mt-5 rounded-2xl border border-[#e7bea5] bg-[#fff1e8] p-4 text-sm font-semibold text-[#8a3f21]">
                  Missing: {activeStatus.missing.join(", ")}
                </div>
              ) : null}
              <div className="mt-6">
                <ResultRows results={results} onCopy={copyText} />
              </div>
            </div>
            <MaterialComparison data={data} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#d8c6a8] bg-[#fbf8f3]/88 p-5 shadow-[0_18px_48px_rgba(24,18,13,0.07)] md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Calculator Workspace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172a28]">Choose a module. Results update instantly.</h2>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[#d8c6a8] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#625b53]">
              {calculators.length} modules · two-row desktop grid
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {calculators.map((calculator) => {
              const status = statusFor(data, calculator.required);
              const Icon = calculator.icon;
              const selected = calculator.id === activeCalculatorId;
              return (
                <button
                  key={calculator.id}
                  type="button"
                  onClick={() => setActiveCalculatorId(calculator.id)}
                  className={`group min-h-48 rounded-[24px] border p-4 text-left transition hover:-translate-y-1 ${
                    selected
                      ? "border-[#172a28] bg-[#172a28] text-white shadow-[0_22px_62px_rgba(23,42,40,0.22)]"
                      : "border-[#eadfce] bg-white/86 text-[#172a28] hover:border-[#c9b28b]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-2xl ${selected ? "bg-[#d4c09a] text-[#172a28]" : "bg-[#fbf8f3] text-[#8a7654]"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${status.ready ? "bg-[#e7f7ed] text-[#21633c]" : "bg-[#fff1e8] text-[#9b4a22]"}`}>
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
        </div>
      </section>

      <section className="px-6 pb-12 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_260px]">
          <div className="grid gap-5">
            <SetupAccordion
              title="Prescription Inputs"
              summary={rxSummary(data)}
              open={openPrescription}
              onToggle={() => setOpenPrescription((value) => !value)}
            >
              {numericInputs("Prescription")}
            </SetupAccordion>
            <div className="grid gap-5 lg:grid-cols-2">
              <SetupAccordion title="Lens Inputs" summary={lensSummary(data)} open={openLens} onToggle={() => setOpenLens((value) => !value)}>
                <div className="mb-5 grid gap-2 sm:grid-cols-2">
                  {materialIndexes.map(([name, index]) => {
                    const selected = data.lensIndex === index;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => selectMaterial(name, index)}
                        className={`rounded-2xl border p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 ${
                          selected ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#eadfce] bg-[#fbf8f3] text-[#172a28]"
                        }`}
                      >
                        {materialLabel(name, index)}
                      </button>
                    );
                  })}
                </div>
                {numericInputs("Lens")}
              </SetupAccordion>
              <SetupAccordion title="Frame Inputs" summary={frameSummary(data)} open={openFrame} onToggle={() => setOpenFrame((value) => !value)}>
                <label className="grid max-w-sm gap-1">
                  <span className="text-xs font-semibold text-[#625b53]">Frame Shape</span>
                  <select value={data.frameShape} onChange={(event) => setData((current) => ({ ...current, frameShape: event.target.value }))} className="min-h-11 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-3 text-sm font-semibold outline-none">
                    {["Rounded Rectangle", "Round", "Aviator", "Navigator", "Deep B"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <div className="mt-5">
                  {numericInputs("Frame")}
                  <label className="mt-3 grid max-w-sm gap-1">
                    <span className="text-xs font-semibold text-[#625b53]">Frame Type</span>
                    <select value={data.frameType} onChange={(event) => setData((current) => ({ ...current, frameType: event.target.value }))} className="min-h-11 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-3 text-sm font-semibold outline-none">
                      {["Full Rim", "Semi-Rimless", "Rimless"].map((value) => <option key={value}>{value}</option>)}
                    </select>
                  </label>
                </div>
              </SetupAccordion>
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[28px] border border-[#d8c6a8] bg-[#172a28] p-5 text-white shadow-[0_18px_48px_rgba(24,18,13,0.12)]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4c09a]">Need the math?</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">Jump back to results.</h3>
              <p className="mt-3 text-sm leading-6 text-white/68">Use this after changing prescription, lens, or frame inputs.</p>
              <a href="#calculator-results" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#d4c09a] px-5 text-sm font-semibold text-[#172a28] transition hover:-translate-y-0.5 hover:bg-[#ead7ad]">
                View Calculation Results
              </a>
            </div>
          </aside>
        </div>
      </section>
      <section id="references" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Optical Reference Library</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Technical formulas, in one place.</h2>
            </div>
            <BookOpen className="h-12 w-12 text-[#c9b28b]" />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {references.map(([title, body]) => (
              <details key={title} className="group rounded-[24px] border border-[#d8c6a8] bg-white/82 p-5 shadow-[0_14px_34px_rgba(24,18,13,0.05)]">
                <summary className="cursor-pointer list-none text-lg font-semibold text-[#172a28]">
                  <span className="inline-flex items-center gap-3"><FileText className="h-5 w-5 text-[#8a7654]" />{title}</span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-[#625b53]">{body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#172a28] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">Live Calculator</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Lens Comparison Engine</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
              Compare estimated finished thickness side-by-side across Plastic, Trivex, Polycarbonate, 1.60, 1.67, 1.74, and 1.76 indexes using Rx, PD, and frame measurements.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5">
            <div className="grid gap-2">
              {materialIndexes.map(([name, index]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
                  <span>{materialName(name)}</span>
                  <span className="font-semibold text-[#d4c09a]">{fmt(edgeEstimate(data, index))} mm estimated</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[28px] border border-[#d8c6a8] bg-white/82 p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">Export and Reporting</p>
            <p className="mt-2 text-sm leading-6 text-[#625b53]">Print, copy, share, or save the current scenario. PDF export can be handled from the print dialog today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={printReport} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#172a28] px-5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Download PDF</button>
            <button onClick={copyResults} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 text-sm font-semibold"><Clipboard className="h-4 w-4" />Copy Results</button>
          </div>
        </div>
      </section>

      <section className="print-report">
        <div style={{ maxWidth: "760px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
          <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a7654", fontWeight: 700 }}>Artisan Lab Network</p>
          <h1 style={{ fontSize: 34, margin: "10px 0 4px", color: "#172a28" }}>Optical Engineering Calculation Report</h1>
          <p style={{ margin: "0 0 24px", color: "#625b53" }}>{activeCalculator.title}</p>
          <div style={{ border: "1px solid #d8c6a8", borderRadius: 16, padding: 18, marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 12px", color: "#172a28" }}>Job Setup</h2>
            <p style={{ margin: "6px 0" }}><strong>Prescription:</strong> {rxSummary(data)}</p>
            <p style={{ margin: "6px 0" }}><strong>Lens:</strong> {lensSummary(data)}</p>
            <p style={{ margin: "6px 0" }}><strong>Frame:</strong> {frameSummary(data)}</p>
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
