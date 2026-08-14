"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { trackWithConsent } from "@/app/components/CookieConsentProvider";
import { compareMaterials, materialDifference, type MaterialComparisonResult } from "@/lib/optical/geometry";
import type { OpticalData } from "@/lib/optical/calculations";
import Lens3D from "./Lens3D";
import LensCrossSection from "./LensCrossSection";

const ENGINEERING_DEFAULTS = ["1.67", "1.76"];
const PATIENT_DEFAULTS = ["1.74", "1.76"];
const OPTIONAL_MATERIALS = ["Plastic", "Poly", "1.60", "1.67", "1.74", "1.76"];

function labelForMaterial(name: string) {
  if (name === "Plastic") return "Standard plastic · 1.50";
  if (name === "Poly") return "Polycarbonate · 1.59";
  if (name === "1.76") return "Tokai 1.76";
  if (name.match(/^1\.(60|67|74)$/)) return `Hi-Index ${name}`;
  return name;
}

function TokaiMark({ prominent = false }: { prominent?: boolean }) {
  return <Image src="/tokai-logo.png" alt={prominent ? "Tokai Optical" : ""} width={prominent ? 48 : 26} height={prominent ? 48 : 26} className={prominent ? "h-12 w-12 object-contain" : "h-6 w-6 object-contain"} />;
}

function millimeters(value: number) {
  return `${value.toFixed(2)} mm`;
}

function ComparisonMetrics({ comparisons, patient }: { comparisons: MaterialComparisonResult[]; patient: boolean }) {
  const tokai = comparisons.find((entry) => entry.material.name === "1.76");
  const reference = comparisons.find((entry) => entry.material.name === "1.67") ?? comparisons[0];
  const difference = tokai && reference && tokai !== reference ? materialDifference(reference.geometry, tokai.geometry) : null;
  return (
    <div aria-live="polite">
      {difference && tokai ? (
        <div className="mb-5 rounded-2xl border border-[#cbb791] bg-[#f3e8d2] p-5 text-[#172a28]">
          <div className="flex items-center gap-3"><TokaiMark prominent /><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a7654]">Tokai 1.76</p></div>
          <p className="mt-2 text-xl font-semibold md:text-2xl">
            Estimated maximum edge: {millimeters(tokai.geometry.maximumEdgeThickness)}
          </p>
          <p className="mt-2 leading-7 text-[#625b53]">
            {difference.differenceMm >= 0
              ? `${millimeters(difference.differenceMm)} thinner than ${labelForMaterial(reference.material.name)} in this scenario (${difference.reductionPercent.toFixed(1)}% reduction).`
              : `${millimeters(Math.abs(difference.differenceMm))} thicker than ${labelForMaterial(reference.material.name)} in this scenario. Minimum-thickness rules and lens form can affect the result.`}
          </p>
        </div>
      ) : null}
      <div className={`grid gap-3 md:grid-cols-2 ${patient ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
        {comparisons.map(({ material, geometry }) => (
          <article key={material.name} className={`rounded-2xl border p-5 ${material.name === "1.76" ? "border-[#a97548] bg-[#fffaf1]" : "border-[#d8c6a8] bg-white"}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold text-[#172a28]">{material.name === "1.76" ? <TokaiMark /> : null}{labelForMaterial(material.name)}</h3>
              <span className="rounded-full bg-[#172a28] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">n {material.index.toFixed(3)}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-[#7b7064]">{geometry.input.sphere > 0 ? "Maximum center" : "Center"}</dt><dd className="mt-1 font-semibold text-[#172a28]">{millimeters(geometry.centerThickness)}</dd></div>
              <div><dt className="text-[#7b7064]">Maximum edge</dt><dd className="mt-1 font-semibold text-[#172a28]">{millimeters(geometry.maximumEdgeThickness)}</dd></div>
              {!patient ? <>
                <div><dt className="text-[#7b7064]">Minimum edge</dt><dd className="mt-1 font-semibold text-[#172a28]">{millimeters(geometry.minimumEdgeThickness)}</dd></div>
                <div><dt className="text-[#7b7064]">Estimated mass</dt><dd className="mt-1 font-semibold text-[#172a28]">{geometry.estimatedMassGrams.toFixed(2)} g</dd></div>
                <div><dt className="text-[#7b7064]">Nasal / temporal</dt><dd className="mt-1 font-semibold text-[#172a28]">{geometry.edgeThickness.nasal.toFixed(2)} / {geometry.edgeThickness.temporal.toFixed(2)}</dd></div>
                <div><dt className="text-[#7b7064]">Superior / inferior</dt><dd className="mt-1 font-semibold text-[#172a28]">{geometry.edgeThickness.superior.toFixed(2)} / {geometry.edgeThickness.inferior.toFixed(2)}</dd></div>
              </> : null}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function LensComparison({ data, mode }: { data: OpticalData; mode: "engineering" | "patient" }) {
  const patient = mode === "patient";
  const [selectedMaterials, setSelectedMaterials] = useState(patient ? PATIENT_DEFAULTS : ENGINEERING_DEFAULTS);
  const [view, setView] = useState<"3d" | "cross-section">("cross-section");
  const [enhancement, setEnhancement] = useState(1);
  const calculation = useMemo(() => {
    try {
      return { comparisons: compareMaterials(data, selectedMaterials), error: null as string | null };
    } catch (caught) {
      return {
        comparisons: [] as MaterialComparisonResult[],
        error: caught instanceof Error ? caught.message : "Unable to calculate this lens geometry.",
      };
    }
  }, [data, selectedMaterials]);
  const { comparisons, error } = calculation;

  useEffect(() => {
    if (patient) trackWithConsent("lens_visualizer_opened");
  }, [patient]);

  const toggleMaterial = (name: string) => {
    setSelectedMaterials((current) => {
      if (!current.includes(name) && current.length >= 2) return current;
      const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
      if (!next.length) return current;
      if (patient) trackWithConsent("lens_material_selected", { material: name, selected: !current.includes(name) });
      if (patient && name === "1.76") trackWithConsent("tokai_176_compared");
      return OPTIONAL_MATERIALS.filter((candidate) => next.includes(candidate));
    });
  };

  return (
    <section aria-labelledby={`${mode}-lens-comparison-title`} className="rounded-[28px] border border-[#d8c6a8] bg-[#f8f4ed] p-4 shadow-[0_22px_70px_rgba(24,18,13,0.1)] md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a7654]">{patient ? "Lens material comparison" : "Finished lens geometry"}</p>
          <h2 id={`${mode}-lens-comparison-title`} className="mt-2 text-3xl font-semibold tracking-tight text-[#172a28] md:text-4xl">
            {patient ? "See the thickness difference" : "Lens Thickness Visualization"}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#625b53]">
            {patient ? "Every lens uses the same prescription and frame, shown at one shared physical scale." : "Hold prescription, PD, frame, and design constant while comparing material-driven finished geometry."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Visualization controls">
          <button type="button" onClick={() => setView("3d")} aria-pressed={view === "3d"} className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${view === "3d" ? "bg-[#172a28] text-white" : "border border-[#d8c6a8] bg-white text-[#172a28]"}`}>Interactive 3D</button>
          <button type="button" onClick={() => { setView("cross-section"); if (patient) trackWithConsent("lens_cross_section_opened"); }} aria-pressed={view === "cross-section"} className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${view === "cross-section" ? "bg-[#172a28] text-white" : "border border-[#d8c6a8] bg-white text-[#172a28]"}`}>Cross Section</button>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-[#625b53]">Compare up to two materials</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {OPTIONAL_MATERIALS.map((name) => {
            const selected = selectedMaterials.includes(name);
            const disabled = !selected && selectedMaterials.length >= 2;
            return (
              <button key={name} type="button" aria-pressed={selected} disabled={disabled} onClick={() => toggleMaterial(name)} className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] disabled:cursor-not-allowed disabled:opacity-45 ${selected ? "border-[#172a28] bg-[#172a28] text-white" : "border-[#d8c6a8] bg-white text-[#625b53] hover:border-[#8a7654] disabled:hover:border-[#d8c6a8]"}`}>
                <span>{labelForMaterial(name)}</span>
              </button>
            );
          })}
        </div>
        {selectedMaterials.length >= 2 ? <p className="mt-2 text-xs text-[#7b7064]">Deselect one material before choosing another.</p> : null}
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#d8c6a8] bg-white px-4 py-3">
        <span className="text-sm font-semibold text-[#625b53]">Visual thickness</span>
        {(patient ? [1, 3] : [1, 2, 3, 5]).map((value) => (
          <button key={value} type="button" aria-pressed={enhancement === value} onClick={() => setEnhancement(value)} className={`min-h-10 rounded-lg px-3 text-xs font-bold ${enhancement === value ? "bg-[#a97548] text-white" : "bg-[#f3eee6] text-[#625b53]"}`}>
            {value === 1 ? "Actual" : patient ? "Enhanced" : `${value}×`}
          </button>
        ))}
        <p className="text-xs leading-5 text-[#7b7064]">
          {enhancement === 1 ? "Numeric and visual thickness are at actual relative scale." : "Visual thickness differences are magnified; all numeric values remain actual."}
        </p>
      </div>

      {error ? (
        <div role="alert" className="mt-5 rounded-2xl border border-[#d99273] bg-[#fff0e8] p-5 text-sm font-semibold text-[#8a3f21]">{error} Reduce the frame size or choose a physically compatible base curve.</div>
      ) : comparisons.length ? (
        <>
          <div className="mt-6">
            {view === "3d" ? <Lens3D comparisons={comparisons} enhancement={enhancement} onInteract={() => patient && trackWithConsent("lens_3d_interaction_started")} /> : <LensCrossSection comparisons={comparisons} enhancement={enhancement} patient={patient} />}
          </div>
          <div className="mt-6"><ComparisonMetrics comparisons={comparisons} patient={patient} /></div>
          {!patient ? (
            <details className="mt-6 rounded-2xl border border-[#d8c6a8] bg-white p-5">
              <summary className="cursor-pointer font-semibold text-[#172a28]">Calculation Details</summary>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                  <thead><tr className="border-b border-[#d8c6a8] text-[#7b7064]"><th className="py-3 pr-4">Material</th><th className="py-3 pr-4">ED</th><th className="py-3 pr-4">OC offset</th><th className="py-3 pr-4">Front / back at max</th><th className="py-3 pr-4">Volume</th><th className="py-3">Constraint</th></tr></thead>
                  <tbody>{comparisons.map(({ material, geometry }) => <tr key={material.name} className="border-b border-[#eadfce]"><td className="py-3 pr-4 font-semibold">{labelForMaterial(material.name)}</td><td className="py-3 pr-4">{millimeters(geometry.effectiveDiameter)}</td><td className="py-3 pr-4">H {geometry.opticalCenter.x.toFixed(2)} / V {geometry.opticalCenter.y.toFixed(2)} mm</td><td className="py-3 pr-4">{geometry.frontCurve.toFixed(2)} / {geometry.backCurveAtMaximum.toFixed(2)} D</td><td className="py-3 pr-4">{geometry.estimatedVolumeCm3.toFixed(2)} cm³</td><td className="py-3">Minimum {geometry.trace.minimumConstraintApplied}</td></tr>)}</tbody>
                </table>
                <p className="mt-4 text-xs leading-6 text-[#625b53]">Formula: {comparisons[0].geometry.trace.formula} · {comparisons[0].geometry.trace.sampleCount} perimeter samples · {comparisons[0].geometry.trace.module}</p>
              </div>
            </details>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
