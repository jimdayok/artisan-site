import type { OpticalData } from "./calculations.ts";

export const defaultOpticalData: OpticalData = {
  sphere: -2.5,
  cylinder: -1,
  axis: 180,
  add: 2,
  prismHorizontal: 1,
  prismVertical: 0.5,
  pdRight: 31,
  pdLeft: 31,
  segHeight: 22,
  originalVertex: 12,
  newVertex: 14,
  pantoscopicTilt: 8,
  wrapAngle: 6,
  baseCurve: 4,
  lensIndex: 1.6,
  lensMaterial: "1.60",
  centerThickness: 2,
  edgeThickness: 1.5,
  aSize: 52,
  bSize: 38,
  dbl: 18,
  effectiveDiameter: 0,
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

export type PatientFrameSize = "small" | "medium" | "large" | "oversized";

export type PatientFrameMeasurements = Pick<
  OpticalData,
  "aSize" | "bSize" | "dbl" | "segHeight" | "frameShape"
>;

export type PatientPd = number | { right: number; left: number };

export const patientFrames: Record<PatientFrameSize, PatientFrameMeasurements> = {
  small: { aSize: 46, bSize: 34, dbl: 17, segHeight: 18, frameShape: "Round" },
  medium: { aSize: 52, bSize: 38, dbl: 18, segHeight: 20, frameShape: "Rectangle" },
  large: { aSize: 57, bSize: 42, dbl: 19, segHeight: 22, frameShape: "Rectangle" },
  oversized: { aSize: 62, bSize: 48, dbl: 20, segHeight: 24, frameShape: "Aviator" },
};

export const patientPresets = [
  { id: "mild", label: "Mild prescription", sphere: -2, cylinder: -0.5, axis: 180 },
  { id: "moderate-minus", label: "Moderate nearsightedness", sphere: -4, cylinder: -1, axis: 180 },
  { id: "strong-minus", label: "Strong nearsightedness", sphere: -6, cylinder: -1.5, axis: 180 },
  { id: "very-strong-minus", label: "Very strong nearsightedness", sphere: -9, cylinder: -2, axis: 180 },
  { id: "strong-large", label: "Strong prescription + larger frame", sphere: -8, cylinder: -1.5, axis: 180, frame: "large" as const },
  { id: "plus", label: "Farsighted prescription", sphere: 5, cylinder: -1, axis: 90 },
] as const;

export function patientScenario(
  prescription: Pick<OpticalData, "sphere" | "cylinder" | "axis">,
  frameSize: PatientFrameSize = "medium",
  pd: PatientPd = 62,
  frameOverride?: PatientFrameMeasurements,
): OpticalData {
  const frame = frameOverride ?? patientFrames[frameSize];
  const pdRight = typeof pd === "number" ? pd / 2 : pd.right;
  const pdLeft = typeof pd === "number" ? pd / 2 : pd.left;
  return {
    ...defaultOpticalData,
    ...frame,
    ...prescription,
    pdRight,
    pdLeft,
    baseCurve: prescription.sphere + prescription.cylinder / 2 >= 0
      ? Math.max(0.5, Math.round((prescription.sphere + prescription.cylinder / 2 + 6) * 4) / 4)
      : Math.max(0.5, Math.round(((prescription.sphere + prescription.cylinder / 2) / 2 + 6) * 4) / 4),
    prismHorizontal: 0,
    prismVertical: 0,
    prismAmount: 0,
    centerThickness: 1.5,
    edgeThickness: 1,
    safetyMargin: 0,
  };
}
