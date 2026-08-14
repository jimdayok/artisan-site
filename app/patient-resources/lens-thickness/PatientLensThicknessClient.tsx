"use client";

import { useMemo, useState } from "react";
import LensComparison from "@/components/lens-visualizer/LensComparison";
import BetaThicknessNotice from "@/components/lens-visualizer/BetaThicknessNotice";
import { compareMaterials } from "@/lib/optical/geometry";
import { vogelBaseCurve, type OpticalData } from "@/lib/optical/calculations";
import { patientFrames, patientPresets, patientScenario, type PatientFrameMeasurements, type PatientFrameSize } from "@/lib/optical/scenarios";
import { trackWithConsent } from "@/app/components/CookieConsentProvider";

type Prescription = { sphere: number; cylinder: number; axis: number };
type PrescriptionInputs = { sphere: string; cylinder: string; axis: string };
type PdMode = "binocular" | "monocular";
const FRAME_SHAPES: Array<{ value: PatientFrameMeasurements["frameShape"]; label: string }> = [
  { value: "Round", label: "Round" },
  { value: "Oval", label: "Oval" },
  { value: "Rectangle", label: "Rectangle" },
  { value: "Square", label: "Square" },
  { value: "Aviator", label: "Aviator / Pilot" },
  { value: "Cat Eye", label: "Cat Eye" },
];

function FrameShapeIcon({ shape }: { shape: PatientFrameMeasurements["frameShape"] }) {
  if (shape === "Round") return <ellipse cx="22" cy="12" rx="11" ry="10" />;
  if (shape === "Oval") return <ellipse cx="22" cy="12" rx="17" ry="8" />;
  if (shape === "Rectangle") return <rect x="4" y="4" width="36" height="16" rx="4" />;
  if (shape === "Square") return <rect x="9" y="3" width="26" height="19" rx="3" />;
  if (shape === "Aviator") return <path d="M7 6 Q13 2 22 5 Q31 2 37 6 L34 16 Q31 22 22 22 Q13 22 10 16Z" strokeLinejoin="round" />;
  if (shape === "Cat Eye") return <path d="M4 8 Q12 3 20 7 Q30 7 40 2 L37 18 Q25 22 8 18Z" strokeLinejoin="round" />;
  return <path d="M11 3h22l7 7-4 11H8L4 10Z" strokeLinejoin="round" />;
}

function FrameShapeOutline({
  shape,
  centerX,
  centerY,
  frameWidth,
  frameHeight,
}: {
  shape: PatientFrameMeasurements["frameShape"];
  centerX: number;
  centerY: number;
  frameWidth: number;
  frameHeight: number;
}) {
  const common = { fill: "rgba(255,255,255,0.035)", stroke: "#d4c09a", strokeWidth: 6 };
  if (shape === "Round") return <ellipse cx={centerX} cy={centerY} rx={Math.min(frameWidth, frameHeight) / 2} ry={Math.min(frameWidth, frameHeight) / 2} {...common} />;
  if (shape === "Oval") return <ellipse cx={centerX} cy={centerY} rx={frameWidth / 2} ry={frameHeight / 2} {...common} />;
  if (shape === "Rectangle" || shape === "Square") return <rect x={centerX - frameWidth / 2} y={centerY - frameHeight / 2} width={frameWidth} height={frameHeight} rx={shape === "Square" ? 18 : 42} {...common} />;
  if (shape === "Aviator") return <path d={`M ${centerX - frameWidth / 2} ${centerY - frameHeight * 0.34} Q ${centerX - frameWidth * 0.22} ${centerY - frameHeight * 0.58} ${centerX} ${centerY - frameHeight * 0.4} Q ${centerX + frameWidth * 0.22} ${centerY - frameHeight * 0.58} ${centerX + frameWidth / 2} ${centerY - frameHeight * 0.34} L ${centerX + frameWidth * 0.42} ${centerY + frameHeight * 0.28} Q ${centerX + frameWidth * 0.28} ${centerY + frameHeight * 0.56} ${centerX} ${centerY + frameHeight / 2} Q ${centerX - frameWidth * 0.28} ${centerY + frameHeight * 0.56} ${centerX - frameWidth * 0.42} ${centerY + frameHeight * 0.28} Z`} strokeLinejoin="round" {...common} />;
  if (shape === "Cat Eye") return <path d={`M ${centerX - frameWidth / 2} ${centerY - frameHeight * 0.2} Q ${centerX - frameWidth * 0.2} ${centerY - frameHeight * 0.5} ${centerX} ${centerY - frameHeight * 0.22} Q ${centerX + frameWidth * 0.25} ${centerY - frameHeight * 0.22} ${centerX + frameWidth / 2} ${centerY - frameHeight / 2} L ${centerX + frameWidth * 0.42} ${centerY + frameHeight * 0.32} Q ${centerX} ${centerY + frameHeight * 0.55} ${centerX - frameWidth * 0.42} ${centerY + frameHeight * 0.32} Z`} strokeLinejoin="round" {...common} />;
  return <path d={`M ${centerX - frameWidth * 0.34} ${centerY - frameHeight / 2} L ${centerX + frameWidth * 0.34} ${centerY - frameHeight / 2} L ${centerX + frameWidth / 2} ${centerY - frameHeight * 0.18} L ${centerX + frameWidth * 0.46} ${centerY + frameHeight * 0.34} L ${centerX + frameWidth * 0.28} ${centerY + frameHeight / 2} L ${centerX - frameWidth * 0.28} ${centerY + frameHeight / 2} L ${centerX - frameWidth * 0.46} ${centerY + frameHeight * 0.34} L ${centerX - frameWidth / 2} ${centerY - frameHeight * 0.18} Z`} strokeLinejoin="round" {...common} />;
}

function powerLabel(value: number) {
  return `${value.toFixed(2)} D`;
}

function prescriptionLabel(prescription: Prescription) {
  return Math.abs(prescription.cylinder) < 0.0001
    ? `Sphere ${powerLabel(prescription.sphere)} · No cylinder (axis not required)`
    : `Sphere ${powerLabel(prescription.sphere)} · Cylinder ${powerLabel(prescription.cylinder)} · Axis ${prescription.axis.toFixed(0)}°`;
}

function decentrationLabel(value: number) {
  return Math.abs(value) < 0.05 ? "centered" : `${Math.abs(value).toFixed(1)} mm ${value > 0 ? "inward" : "outward"}`;
}

function fitDirection(rightHorizontal: number, leftHorizontal: number, vertical: number) {
  const horizontalLabel = Math.abs(rightHorizontal - leftHorizontal) < 0.05
    ? `${decentrationLabel(rightHorizontal)} per eye`
    : `Right ${decentrationLabel(rightHorizontal)} · Left ${decentrationLabel(leftHorizontal)}`;
  const verticalLabel = Math.abs(vertical) < 0.05 ? "vertically centered" : `${Math.abs(vertical).toFixed(1)} mm ${vertical < 0 ? "higher" : "lower"}`;
  return `${horizontalLabel} and ${verticalLabel}`;
}

function PatientDecentrationGuide({ data }: { data: OpticalData }) {
  const geometry = useMemo(() => {
    try {
      return compareMaterials(data, ["1.67"])[0]?.geometry ?? null;
    } catch {
      return null;
    }
  }, [data]);
  const frameCenterDistance = (data.aSize + data.dbl) / 2;
  const rightHorizontal = frameCenterDistance - data.pdRight;
  const leftHorizontal = frameCenterDistance - data.pdLeft;
  const vertical = data.bSize / 2 - data.segHeight;
  const scale = Math.min(390 / data.aSize, 210 / data.bSize);
  const frameWidth = data.aSize * scale;
  const frameHeight = data.bSize * scale;
  const centerX = 260;
  const centerY = 135;
  const opticalX = centerX + (geometry?.opticalCenter.x ?? rightHorizontal) * scale;
  const opticalY = centerY + (geometry?.opticalCenter.y ?? vertical) * scale;
  const maximumX = centerX + (geometry?.maximumEdgeLocation.x ?? 0) * scale;
  const maximumY = centerY + (geometry?.maximumEdgeLocation.y ?? 0) * scale;

  return (
    <details className="group mt-8 rounded-2xl border border-[#d8c6a8] bg-white shadow-[0_12px_34px_rgba(73,48,28,0.06)]">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition hover:bg-[#fbf8f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#8a7654]">Optional frame analysis</span>
          <span className="mt-1 block font-semibold text-[#172a28]">Open frame fit map</span>
        </span>
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d8c6a8] text-xl leading-none text-[#625b53] transition group-open:rotate-45">+</span>
      </summary>
      <section aria-labelledby="patient-decentration-title" className="grid gap-6 border-t border-[#d8c6a8] bg-[#fbf8f3] p-5 md:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.3fr)] md:p-6">
      <div className="mx-auto w-full max-w-[540px] self-start rounded-2xl bg-[#101820] p-5 text-white shadow-[0_18px_44px_rgba(16,24,32,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4c09a]">Frame fit map</p><p className="mt-1 text-sm font-semibold text-white/82">Right lens</p></div>
          <span className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/62">Live geometry</span>
        </div>
        <svg role="img" aria-label="Right lens frame diagram showing geometric center, optical center, and thickest edge" viewBox="0 0 520 300" className="mt-3 aspect-[16/9] h-auto w-full">
          <FrameShapeOutline shape={data.frameShape} centerX={centerX} centerY={centerY} frameWidth={frameWidth} frameHeight={frameHeight} />
          <path d={`M ${centerX - 11} ${centerY} H ${centerX + 11} M ${centerX} ${centerY - 11} V ${centerY + 11}`} stroke="rgba(255,255,255,0.72)" strokeWidth="3" />
          <line x1={centerX} y1={centerY} x2={opticalX} y2={opticalY} stroke="#69b6aa" strokeWidth="3" strokeDasharray="7 6" />
          <circle cx={opticalX} cy={opticalY} r="14" fill="#69b6aa" opacity="0.2" />
          <circle cx={opticalX} cy={opticalY} r="7" fill="#69b6aa" stroke="#c7f6ee" strokeWidth="2" />
          {geometry ? <><circle cx={maximumX} cy={maximumY} r="12" fill="#d7aa70" opacity="0.2" /><circle cx={maximumX} cy={maximumY} r="7" fill="#d7aa70" stroke="#fff4df" strokeWidth="2" /></> : null}
        </svg>
        <div className="mt-3 grid gap-2 border-t border-white/10 pt-4 text-[11px] font-semibold text-white/72 sm:grid-cols-3">
          <span className="flex items-center gap-2"><span className="relative h-4 w-4 shrink-0"><span className="absolute left-0 top-[7px] h-0.5 w-4 bg-white/70" /><span className="absolute left-[7px] top-0 h-4 w-0.5 bg-white/70" /></span>Frame center</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full border-2" style={{ backgroundColor: "#69b6aa", borderColor: "#c7f6ee" }} />Optical center <span className="text-white/48">(green)</span></span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full border-2" style={{ backgroundColor: "#d7aa70", borderColor: "#fff4df" }} />Thickest edge <span className="text-white/48">(gold)</span></span>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">Why measurements matter</p>
        <h3 id="patient-decentration-title" className="mt-2 text-2xl font-semibold text-[#172a28]">Proper decentration follows your pupils</h3>
        <p className="mt-3 leading-7 text-[#625b53]">PD places each lens’s optical center horizontally. Optical-center height places it vertically in the worn frame. Proper decentration means aligning those centers with your pupils—not simply centering them in the frame.</p>
        <p className="mt-3 leading-7 text-[#625b53]">A frame whose geometric centers are closer to your measured PD and height generally needs less lens diameter. That can reduce unnecessary edge thickness, although prescription, lens design, and safety requirements still matter.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#d8c6a8] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">Current position</p><p className="mt-2 font-semibold text-[#172a28]">{fitDirection(rightHorizontal, leftHorizontal, vertical)}</p></div>
          <div className="rounded-xl border border-[#d8c6a8] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">Hi-Index 1.67</p><p className="mt-2 font-semibold text-[#172a28]">{geometry ? `${geometry.maximumEdgeThickness.toFixed(2)} mm estimated maximum edge` : "Adjust the measurements to restore a valid estimate"}</p></div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#7b7064]">The green point is the optical center. The gold point marks the calculated thickest edge. Every change above recalculates the comparison below.</p>
      </div>
      </section>
    </details>
  );
}

export default function PatientLensThicknessClient() {
  const [prescription, setPrescription] = useState<Prescription>({ sphere: -6, cylinder: -1.5, axis: 180 });
  const [prescriptionInputs, setPrescriptionInputs] = useState<PrescriptionInputs>({ sphere: "-6.00", cylinder: "-1.50", axis: "180" });
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("strong-minus");
  const [frameSize, setFrameSize] = useState<PatientFrameSize>("medium");
  const [frameShape, setFrameShape] = useState<PatientFrameMeasurements["frameShape"]>(patientFrames.medium.frameShape);
  const [baseCurveOverride, setBaseCurveOverride] = useState<number | null>(null);
  const [pdMode, setPdMode] = useState<PdMode>("binocular");
  const [binocularPd, setBinocularPd] = useState(62);
  const [monocularPd, setMonocularPd] = useState({ right: 31, left: 31 });
  const [customOpen, setCustomOpen] = useState(false);
  const [frameOpen, setFrameOpen] = useState(false);
  const [frameOverride, setFrameOverride] = useState<PatientFrameMeasurements | null>(null);
  const activeFrame = useMemo(() => ({ ...(frameOverride ?? patientFrames[frameSize]), frameShape }), [frameOverride, frameShape, frameSize]);
  const calculatedScenario = useMemo(
    () => patientScenario(prescription, frameSize, pdMode === "binocular" ? binocularPd : monocularPd, activeFrame),
    [activeFrame, binocularPd, frameSize, monocularPd, pdMode, prescription],
  );
  const suggestedBaseCurve = useMemo(() => vogelBaseCurve(calculatedScenario).suggested, [calculatedScenario]);
  const scenario = useMemo(() => ({ ...calculatedScenario, baseCurve: baseCurveOverride ?? suggestedBaseCurve }), [baseCurveOverride, calculatedScenario, suggestedBaseCurve]);

  const updatePrescription = (key: keyof Prescription, value: string) => {
    setPrescriptionInputs((current) => ({ ...current, [key]: value }));
    if (!value.trim()) {
      if (key !== "sphere") {
        setSelectedPresetId(null);
        setPrescription((current) => ({ ...current, [key]: key === "cylinder" ? 0 : 180 }));
      }
      return;
    }
    const numericValue = Number(value);
    setSelectedPresetId(null);
    if (Number.isFinite(numericValue)) setPrescription((current) => ({ ...current, [key]: numericValue }));
  };

  const formatPrescriptionInput = (key: keyof Prescription) => {
    setPrescriptionInputs((current) => ({
      ...current,
      [key]: key !== "sphere" && !current[key].trim()
        ? ""
        : key === "axis" ? prescription[key].toFixed(0) : prescription[key].toFixed(2),
    }));
  };

  const stepPrescriptionPower = (key: "sphere" | "cylinder", direction: -1 | 1) => {
    const currentValue = prescription[key];
    const nextValue = Math.min(key === "sphere" ? 20 : 10, Math.max(key === "sphere" ? -20 : -10, Math.round((currentValue + direction * 0.25) * 4) / 4));
    setSelectedPresetId(null);
    setPrescription((current) => ({ ...current, [key]: nextValue }));
    setPrescriptionInputs((current) => ({ ...current, [key]: nextValue.toFixed(2) }));
    trackWithConsent("lens_custom_prescription_used");
  };

  const selectPdMode = (mode: PdMode) => {
    if (mode === "monocular" && pdMode !== "monocular") {
      setMonocularPd({ right: binocularPd / 2, left: binocularPd / 2 });
    } else if (mode === "binocular" && pdMode !== "binocular") {
      setBinocularPd(monocularPd.right + monocularPd.left);
    }
    setPdMode(mode);
    trackWithConsent("lens_pd_mode_changed", { mode });
  };

  const updateFrame = (key: keyof PatientFrameMeasurements, value: string) => {
    if (key === "frameShape") {
      setFrameShape(value as PatientFrameMeasurements["frameShape"]);
      trackWithConsent("lens_frame_shape_changed", { shape: value });
      return;
    }
    const current = { ...activeFrame };
    setFrameOverride({
      ...current,
      [key]: Number.isFinite(Number(value)) ? Number(value) : current[key],
    } as PatientFrameMeasurements);
  };

  const applyFitExample = (example: "centered" | "inward" | "high") => {
    const frame = { ...activeFrame };
    const nextFrame = { ...frame, segHeight: example === "high" ? frame.bSize / 2 + 4 : frame.bSize / 2 };
    setFrameOverride(nextFrame);
    const totalPd = example === "inward" ? frame.aSize + frame.dbl - 8 : frame.aSize + frame.dbl;
    setBinocularPd(totalPd);
    setMonocularPd({ right: totalPd / 2, left: totalPd / 2 });
    setFrameOpen(true);
    trackWithConsent("lens_decentration_example_selected", { example });
  };

  return (
    <>
      <BetaThicknessNotice />
      <section className="bg-[#efe4d3] px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-[#d8c6a8] bg-white/80 p-5 shadow-[0_20px_70px_rgba(73,48,28,0.1)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">Step 1</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#172a28]">Choose a sample prescription</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {patientPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={selectedPresetId === preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setPrescription({ sphere: preset.sphere, cylinder: preset.cylinder, axis: preset.axis });
                      setPrescriptionInputs({ sphere: preset.sphere.toFixed(2), cylinder: preset.cylinder.toFixed(2), axis: preset.axis.toFixed(0) });
                      if ("frame" in preset) {
                        setFrameSize(preset.frame);
                        setFrameOverride(null);
                      }
                      trackWithConsent("lens_prescription_preset_selected", { preset: preset.id });
                    }}
                    className={`min-h-14 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] ${selectedPresetId === preset.id ? "border-[#172a28] bg-[#172a28] text-white shadow-sm" : "border-[#d8c6a8] bg-[#fbf8f3] text-[#172a28] hover:border-[#8a7654] hover:bg-white"}`}
                  >
                    <span className="block">{preset.label}</span>
                    <span className={`mt-1 block text-xs font-medium leading-5 ${selectedPresetId === preset.id ? "text-white/72" : "text-[#7b7064]"}`}>{prescriptionLabel(preset)}</span>
                  </button>
                ))}
              </div>
              <div aria-live="polite" className="mt-4 rounded-xl border border-[#d8c6a8] bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Selected prescription</p>
                <p className="mt-1 text-sm font-semibold text-[#172a28]">{prescriptionLabel(prescription)}</p>
              </div>
              <div className="mt-4 rounded-xl border border-[#d8c6a8] bg-[#fbf8f3] p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <label className="grid min-w-[210px] flex-1 gap-1 text-sm font-semibold text-[#625b53]">
                    Front base curve
                    <span className="flex min-h-12 overflow-hidden rounded-lg border border-[#d8c6a8] bg-white focus-within:ring-2 focus-within:ring-[#8a7654]/30">
                      <input type="number" value={scenario.baseCurve} min={0.5} max={20} step={0.25} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) setBaseCurveOverride(value); }} className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#172a28] outline-none" />
                      <span className="flex w-14 items-center justify-center border-l border-[#d8c6a8] text-sm leading-none text-[#8a7654]">D</span>
                    </span>
                  </label>
                  <button type="button" disabled={baseCurveOverride === null} onClick={() => setBaseCurveOverride(null)} className="min-h-12 rounded-lg border border-[#8a7654] bg-white px-4 text-xs font-semibold text-[#172a28] disabled:cursor-default disabled:opacity-45">Use Rx default</button>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#7b7064]">Rx default: <strong className="text-[#172a28]">{suggestedBaseCurve.toFixed(2)} D</strong> using Vogel’s Rule. Your laboratory or lens manufacturer may specify a different curve.</p>
              </div>
              <button type="button" onClick={() => setCustomOpen((value) => !value)} aria-expanded={customOpen} className="mt-4 min-h-11 rounded-lg bg-[#172a28] px-4 text-sm font-semibold text-white">
                {customOpen ? "Hide prescription entry" : "Enter my prescription"}
              </button>
              {customOpen ? (
                <div className="mt-4 grid gap-4 rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] p-4 sm:grid-cols-2 lg:grid-cols-4">
                  {([
                    ["sphere", "Sphere", -20, 20, 0.25, "D"],
                    ["cylinder", "Cylinder", -10, 10, 0.25, "D"],
                    ["axis", "Axis", 1, 180, 1, "°"],
                  ] as const).map(([key, label, min, max, step, suffix]) => (
                    <div key={key} className="grid gap-1 text-sm font-semibold text-[#625b53]">
                      <label htmlFor={`patient-rx-${key}`}>{label}{key === "cylinder" || key === "axis" ? " (optional)" : ""}</label>
                      <span className="flex min-h-12 overflow-hidden rounded-lg border border-[#d8c6a8] bg-white focus-within:ring-2 focus-within:ring-[#8a7654]/30">
                        {key !== "axis" ? <button type="button" onClick={() => stepPrescriptionPower(key, -1)} aria-label={`Decrease ${label} by 0.25 D`} className="grid w-10 shrink-0 place-items-center border-r border-[#d8c6a8] text-lg text-[#625b53] hover:bg-[#fbf8f3]">−</button> : null}
                        <input
                          id={`patient-rx-${key}`}
                          type={key === "axis" ? "number" : "text"}
                          inputMode="decimal"
                          value={prescriptionInputs[key]}
                          min={key === "axis" ? min : undefined}
                          max={key === "axis" ? max : undefined}
                          step={key === "axis" ? step : undefined}
                          pattern={key === "axis" ? undefined : "[+-]?[0-9]*([.][0-9]{0,2})?"}
                          onChange={(event) => { updatePrescription(key, event.target.value); trackWithConsent("lens_custom_prescription_used"); }}
                          onBlur={() => formatPrescriptionInput(key)}
                          className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#172a28] outline-none"
                        />
                        {key !== "axis" ? <button type="button" onClick={() => stepPrescriptionPower(key, 1)} aria-label={`Increase ${label} by 0.25 D`} className="grid w-10 shrink-0 place-items-center border-l border-[#d8c6a8] text-lg text-[#625b53] hover:bg-[#fbf8f3]">+</button> : null}
                        <span className="flex w-14 items-center justify-center border-l border-[#d8c6a8] text-sm leading-none text-[#8a7654]">{suffix}</span>
                      </span>
                    </div>
                  ))}
                  <p className="text-xs leading-5 text-[#7b7064] sm:col-span-2 lg:col-span-4">Prescription values stay in this browser and are not submitted or saved.</p>
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">Step 2</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#172a28]">Choose a frame size</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(Object.keys(patientFrames) as PatientFrameSize[]).map((size) => (
                  <button key={size} type="button" aria-pressed={frameSize === size} onClick={() => { setFrameSize(size); setFrameOverride(null); trackWithConsent("lens_frame_size_changed", { size }); }} className={`min-h-14 rounded-xl border px-3 text-sm font-semibold capitalize ${frameSize === size ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#d8c6a8] bg-[#fbf8f3] text-[#172a28]"}`}>
                    {size}
                  </button>
                ))}
              </div>
              <fieldset className="mt-4">
                <legend className="text-sm font-semibold text-[#625b53]">Choose a frame shape</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FRAME_SHAPES.map((shape) => (
                    <button key={shape.value} type="button" aria-pressed={frameShape === shape.value} onClick={() => updateFrame("frameShape", shape.value)} className={`min-h-16 rounded-xl border px-2 py-2 text-xs font-semibold ${frameShape === shape.value ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#d8c6a8] bg-white text-[#625b53]"}`}>
                      <svg aria-hidden="true" viewBox="0 0 44 24" className={`mx-auto mb-1 h-5 w-9 fill-none ${frameShape === shape.value ? "stroke-[#d4c09a]" : "stroke-[#8a7654]"}`} strokeWidth="2">
                        <FrameShapeIcon shape={shape.value} />
                      </svg>
                      {shape.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-4">
                <legend className="text-sm font-semibold text-[#625b53]">Pupillary distance (PD), if known</legend>
                <div className="mt-2 grid grid-cols-2 gap-2" aria-label="PD measurement type">
                  <button type="button" aria-pressed={pdMode === "binocular"} onClick={() => selectPdMode("binocular")} className={`min-h-11 rounded-lg border px-3 text-xs font-semibold ${pdMode === "binocular" ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#d8c6a8] bg-white text-[#625b53]"}`}>Binocular PD</button>
                  <button type="button" aria-pressed={pdMode === "monocular"} onClick={() => selectPdMode("monocular")} className={`min-h-11 rounded-lg border px-3 text-xs font-semibold ${pdMode === "monocular" ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#d8c6a8] bg-white text-[#625b53]"}`}>Monocular PD</button>
                </div>
                {pdMode === "binocular" ? (
                  <label className="mt-3 grid gap-1 text-sm font-semibold text-[#625b53]">
                    Total binocular PD
                    <span className="flex min-h-12 overflow-hidden rounded-lg border border-[#d8c6a8] bg-white focus-within:ring-2 focus-within:ring-[#8a7654]/30">
                      <input type="number" value={binocularPd} min={48} max={80} step={0.5} onChange={(event) => setBinocularPd(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#172a28] outline-none" />
                      <span className="flex w-16 items-center justify-center border-l border-[#d8c6a8] text-sm leading-none text-[#8a7654]">mm</span>
                    </span>
                  </label>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["right", "left"] as const).map((side) => (
                      <label key={side} className="grid gap-1 text-sm font-semibold capitalize text-[#625b53]">
                        {side} monocular PD
                        <span className="flex min-h-12 overflow-hidden rounded-lg border border-[#d8c6a8] bg-white focus-within:ring-2 focus-within:ring-[#8a7654]/30">
                          <input type="number" value={monocularPd[side]} min={20} max={45} step={0.5} onChange={(event) => setMonocularPd((current) => ({ ...current, [side]: Number(event.target.value) }))} className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#172a28] outline-none" />
                          <span className="flex w-12 items-center justify-center border-l border-[#d8c6a8] text-xs leading-none text-[#8a7654]">mm</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs leading-5 text-[#7b7064]">Binocular PD is one total measurement. Monocular PD records the right and left eye separately for more precise decentration.</p>
              </fieldset>
              <button type="button" onClick={() => setFrameOpen((value) => !value)} aria-expanded={frameOpen} className="mt-4 min-h-11 w-full rounded-lg border border-[#8a7654] bg-white px-4 text-sm font-semibold text-[#172a28]">
                {frameOpen ? "Hide frame dimensions" : "Adjust frame dimensions"}
              </button>
              <p className="mt-4 rounded-xl bg-[#f3e8d2] p-4 text-sm leading-6 text-[#625b53]">Choose the closest frame shape above. Open the dimensions only when you have the frame’s A, B, DBL, or optical-center height.</p>
            </div>
          </div>
          {frameOpen ? (
            <div className="mt-8 rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a7654]">Optional precision</p><h3 className="mt-2 text-xl font-semibold text-[#172a28]">Frame and optical-center measurements</h3></div>
                <button type="button" onClick={() => { setFrameOverride(null); setFrameShape(patientFrames[frameSize].frameShape); }} className="min-h-10 rounded-lg border border-[#d8c6a8] bg-white px-3 text-xs font-semibold text-[#625b53]">Use {frameSize} defaults</button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {([
                  ["aSize", "A width", 40, 70, 0.5],
                  ["bSize", "B height", 25, 60, 0.5],
                  ["dbl", "Bridge (DBL)", 10, 28, 0.5],
                  ["segHeight", "OC height", 5, activeFrame.bSize, 0.5],
                ] as const).map(([key, label, min, max, step]) => (
                  <label key={key} className="grid gap-1 text-sm font-semibold text-[#625b53]">
                    {label}
                    <span className="flex min-h-12 overflow-hidden rounded-lg border border-[#d8c6a8] bg-white focus-within:ring-2 focus-within:ring-[#8a7654]/30">
                      <input type="number" value={activeFrame[key]} min={min} max={max} step={step} onChange={(event) => updateFrame(key, event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#172a28] outline-none" />
                      <span className="flex w-14 items-center justify-center border-l border-[#d8c6a8] text-sm leading-none text-[#8a7654]">mm</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">Explore positioning</span>
                <button type="button" onClick={() => applyFitExample("centered")} className="min-h-10 rounded-full border border-[#d8c6a8] bg-white px-4 text-xs font-semibold text-[#172a28]">Centered in frame</button>
                <button type="button" onClick={() => applyFitExample("inward")} className="min-h-10 rounded-full border border-[#d8c6a8] bg-white px-4 text-xs font-semibold text-[#172a28]">4 mm inward</button>
                <button type="button" onClick={() => applyFitExample("high")} className="min-h-10 rounded-full border border-[#d8c6a8] bg-white px-4 text-xs font-semibold text-[#172a28]">4 mm higher</button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#7b7064]">OC height is measured from the lowest point of the lens opening. These examples demonstrate geometry; your optician should use measurements taken with the selected frame fitted on your face.</p>
            </div>
          ) : null}
          <PatientDecentrationGuide data={scenario} />
        </div>
      </section>

      <section className="bg-[#f5f1eb] px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#8a7654]">Step 3</p>
          <LensComparison data={scenario} mode="patient" />
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            ["Why does index matter?", "Higher-index materials bend light more efficiently. Depending on the prescription, frame, and design, that can reduce finished thickness."],
            ["Frame choice matters too", "A smaller, well-centered frame often needs less lens diameter, which can reduce the thickest edge of a nearsighted lens."],
            ["Ask your eye care professional", "The best choice also depends on visual needs, lens design, safety requirements, frame measurements, and professional recommendations."],
          ].map(([title, body]) => <article key={title} className="rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] p-6"><h2 className="text-xl font-semibold text-[#172a28]">{title}</h2><p className="mt-3 leading-7 text-[#625b53]">{body}</p></article>)}
        </div>
        <p className="mx-auto mt-8 max-w-5xl text-center text-xs leading-6 text-[#7b7064]"><strong className="text-[#625b53]">Thickness estimate notice:</strong> Lens thickness can be influenced by additional specifications including base curve, lens design (such as spherical, aspheric, atoric, or free-form), minimum center or edge thickness, bevel placement, frame shape and fit, manufacturer requirements, and laboratory finishing tolerances. The values shown are educational estimates; actual finished lenses may differ.</p>
      </section>
    </>
  );
}
