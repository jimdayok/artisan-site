export type FrameShape = "Round" | "Rectangle" | "Geometric";

export type OpticalData = {
  sphere: number;
  cylinder: number;
  axis: number;
  add: number;
  prismHorizontal: number;
  prismVertical: number;
  pdRight: number;
  pdLeft: number;
  segHeight: number;
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

export type MaterialProperty = {
  name: string;
  index: number;
  abbe: number;
  specificGravity: number;
  documentedMinimums?: {
    centerThickness: number;
    edgeThickness: number;
    source: string;
  };
};

export const materialProperties: readonly MaterialProperty[] = [
  { name: "Plastic", index: 1.498, abbe: 58, specificGravity: 1.32 },
  { name: "Trivex", index: 1.53, abbe: 43, specificGravity: 1.11 },
  { name: "Poly", index: 1.586, abbe: 30, specificGravity: 1.2 },
  { name: "1.60", index: 1.6, abbe: 42, specificGravity: 1.3 },
  { name: "1.67", index: 1.67, abbe: 32, specificGravity: 1.36 },
  {
    name: "1.70",
    index: 1.7,
    abbe: 36,
    specificGravity: 1.41,
    documentedMinimums: {
      centerThickness: 1,
      edgeThickness: 0.7,
      source: "Tokai 1.70 AS thickness chart",
    },
  },
  { name: "1.74", index: 1.74, abbe: 32, specificGravity: 1.47 },
  {
    name: "1.76",
    index: 1.76,
    abbe: 30,
    specificGravity: 1.49,
    documentedMinimums: {
      centerThickness: 1,
      edgeThickness: 0.7,
      source: "Tokai 1.76 AS thickness chart",
    },
  },
];

export function scenarioForMaterial(
  data: OpticalData,
  material: MaterialProperty
): OpticalData {
  return {
    ...data,
    lensIndex: material.index,
    lensMaterial: material.name,
    centerThickness:
      material.documentedMinimums?.centerThickness ?? data.centerThickness,
    edgeThickness:
      material.documentedMinimums?.edgeThickness ?? data.edgeThickness,
  };
}

export function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

export function totalPd(data: OpticalData) {
  return data.pdRight + data.pdLeft;
}

export function framePd(data: OpticalData) {
  return data.aSize + data.dbl;
}

export function monocularDecentrationValues(data: OpticalData) {
  const frameGc = framePd(data) / 2;
  return {
    right: frameGc - data.pdRight,
    left: frameGc - data.pdLeft,
  };
}

/** Signed total decentration across both lenses. Per-lens values are returned above. */
export function totalHorizontalDecentration(data: OpticalData) {
  return framePd(data) - totalPd(data);
}

export function averageHorizontalDecentration(data: OpticalData) {
  return totalHorizontalDecentration(data) / 2;
}

export function verticalDecentration(data: OpticalData) {
  return data.bSize / 2 - data.segHeight;
}

export function horizontalPower(data: OpticalData) {
  return data.sphere + data.cylinder * Math.sin(radians(data.axis)) ** 2;
}

export function verticalPower(data: OpticalData) {
  return data.sphere + data.cylinder * Math.cos(radians(data.axis)) ** 2;
}

export function equivalentSphere(data: OpticalData) {
  return data.sphere + data.cylinder / 2;
}

export function estimatedEd(data: OpticalData) {
  if (data.frameShape === "Round") return Math.max(data.aSize, data.bSize);
  const boxingDiagonal = Math.hypot(data.aSize, data.bSize);
  return data.frameShape === "Geometric" ? boxingDiagonal * 1.05 : boxingDiagonal;
}

/** An entered trace ED overrides the boxing estimate; blank/NaN/zero means automatic. */
export function engineeringEd(data: OpticalData) {
  return Number.isFinite(data.effectiveDiameter) && data.effectiveDiameter > 0
    ? data.effectiveDiameter
    : estimatedEd(data);
}

export function opticalCenterOffset(data: OpticalData) {
  const mono = monocularDecentrationValues(data);
  return Math.hypot(Math.max(Math.abs(mono.right), Math.abs(mono.left)), Math.abs(verticalDecentration(data)));
}

export function minimumBlank(data: OpticalData) {
  return engineeringEd(data) + 2 * opticalCenterOffset(data) + data.safetyMargin;
}

export function vogelBaseCurve(data: OpticalData) {
  const se = equivalentSphere(data);
  const unrounded = se >= 0 ? se + 6 : se / 2 + 6;
  return {
    prescriptionType: se >= 0 ? "Plus / plano" : "Minus",
    formula: se >= 0 ? "BC = SE + 6.00 D" : "BC = SE / 2 + 6.00 D",
    unrounded,
    suggested: roundToQuarter(unrounded),
  } as const;
}

export function surfaceRadiusMm(surfacePower: number, refractiveIndex: number) {
  if (!Number.isFinite(surfacePower) || !Number.isFinite(refractiveIndex) || refractiveIndex <= 1) return Number.NaN;
  if (Math.abs(surfacePower) < 1e-9) return Number.POSITIVE_INFINITY;
  return ((refractiveIndex - 1) / Math.abs(surfacePower)) * 1000;
}

/** Signed sag in mm. Positive surface power produces positive sag. */
export function surfaceSagMm(surfacePower: number, refractiveIndex: number, semiChordMm: number) {
  if (Math.abs(surfacePower) < 1e-9) return 0;
  const radius = surfaceRadiusMm(surfacePower, refractiveIndex);
  if (!Number.isFinite(radius) || semiChordMm < 0 || semiChordMm >= radius) return Number.NaN;
  const magnitude = radius - Math.sqrt(radius ** 2 - semiChordMm ** 2);
  return Math.sign(surfacePower) * magnitude;
}

export function designMeridianPower(data: OpticalData) {
  const powers = [data.sphere, data.sphere + data.cylinder];
  return powers.reduce((selected, power) => (Math.abs(power) > Math.abs(selected) ? power : selected), powers[0]);
}

export function thicknessEstimate(data: OpticalData, refractiveIndex = data.lensIndex) {
  const semiChord = minimumBlank(data) / 2;
  const totalPower = designMeridianPower(data);
  const frontPower = data.baseCurve;
  const backPower = totalPower - frontPower;
  const frontSag = surfaceSagMm(frontPower, refractiveIndex, semiChord);
  const backSag = surfaceSagMm(backPower, refractiveIndex, semiChord);
  const edgeMinusCenter = -frontSag - backSag;
  if (![frontSag, backSag, edgeMinusCenter].every(Number.isFinite)) {
    return { totalPower, frontPower, backPower, semiChord, frontSag, backSag, center: Number.NaN, edge: Number.NaN, edgeMinusCenter };
  }
  const center = Math.max(data.centerThickness, data.edgeThickness - edgeMinusCenter);
  const edge = center + edgeMinusCenter;
  return { totalPower, frontPower, backPower, semiChord, frontSag, backSag, center, edge, edgeMinusCenter };
}

export function estimatedLensVolumeCm3(data: OpticalData, refractiveIndex = data.lensIndex) {
  const thickness = thicknessEstimate(data, refractiveIndex);
  if (!Number.isFinite(thickness.center) || !Number.isFinite(thickness.edge)) return Number.NaN;
  const finishedAreaMm2 = Math.PI * (data.aSize / 2) * (data.bSize / 2);
  const averageThicknessMm = (thickness.center + thickness.edge) / 2;
  return (finishedAreaMm2 * averageThicknessMm) / 1000;
}

export function lensWeight(data: OpticalData, specificGravity: number, refractiveIndex = data.lensIndex) {
  return estimatedLensVolumeCm3(data, refractiveIndex) * specificGravity;
}

export function vertexCompensatePower(power: number, originalVertexMm: number, newVertexMm: number, mediumIndex = 1) {
  if (![power, originalVertexMm, newVertexMm, mediumIndex].every(Number.isFinite) || mediumIndex <= 0) return Number.NaN;
  // Δv is positive when the new lens plane is closer to the eye.
  const vertexChangeMeters = (originalVertexMm - newVertexMm) / 1000;
  const reducedDistanceMeters = vertexChangeMeters / mediumIndex;
  const denominator = 1 - reducedDistanceMeters * power;
  if (Math.abs(denominator) < 1e-6) return Number.NaN;
  return power / denominator;
}

export function vertexCompensation(data: OpticalData, mediumIndex = 1) {
  const firstMeridian = vertexCompensatePower(data.sphere, data.originalVertex, data.newVertex, mediumIndex);
  const secondMeridian = vertexCompensatePower(data.sphere + data.cylinder, data.originalVertex, data.newVertex, mediumIndex);
  return {
    sphere: firstMeridian,
    cylinder: secondMeridian - firstMeridian,
    axis: data.axis,
    vertexChangeMm: data.originalVertex - data.newVertex,
    reducedDistanceMeters: ((data.originalVertex - data.newVertex) / 1000) / mediumIndex,
    mediumIndex,
  };
}
