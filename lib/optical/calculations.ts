export type FrameShape = "Round" | "Oval" | "Rectangle" | "Square" | "Aviator" | "Cat Eye" | "Geometric";

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
  if (data.frameShape === "Round" || data.frameShape === "Oval") return Math.max(data.aSize, data.bSize);
  const boxingDiagonal = Math.hypot(data.aSize, data.bSize);
  if (data.frameShape === "Geometric" || data.frameShape === "Aviator") return boxingDiagonal * 1.05;
  if (data.frameShape === "Cat Eye") return boxingDiagonal * 1.02;
  return boxingDiagonal;
}

export function powerAtMeridian(data: OpticalData, meridianDegrees: number) {
  const meridianRadians = radians(meridianDegrees - data.axis);
  return data.sphere + data.cylinder * Math.sin(meridianRadians) ** 2;
}

export function frameShapeContainsNormalized(frameShape: FrameShape, x: number, y: number) {
  const normalizedX = Math.abs(x);
  const normalizedY = Math.abs(y);
  if (frameShape === "Rectangle") return normalizedX ** 6 + normalizedY ** 6 <= 1;
  if (frameShape === "Square") return normalizedX ** 10 + normalizedY ** 10 <= 1;
  if (frameShape === "Geometric") return normalizedX ** 3 + normalizedY ** 3 <= 1;
  if (frameShape === "Aviator") {
    const adjustedX = normalizedX / (y < 0 ? 1 : 0.86);
    const adjustedY = (y + 0.08) / 1.08;
    return adjustedX ** 2 + Math.abs(adjustedY) ** 2 <= 1;
  }
  if (frameShape === "Cat Eye") {
    const adjustedY = y - 0.18 * normalizedX;
    return normalizedX ** 2.5 + Math.abs(adjustedY) ** 2.5 <= 1;
  }
  return normalizedX ** (frameShape === "Round" ? 2.35 : 2) + normalizedY ** (frameShape === "Round" ? 2.35 : 2) <= 1;
}

export function frameContainsPoint(data: OpticalData, x: number, y: number) {
  const halfA = Math.max(data.aSize / 2, 0.001);
  const halfB = Math.max(data.bSize / 2, 0.001);
  return frameShapeContainsNormalized(data.frameShape, x / halfA, y / halfB);
}

export function frameBoundaryDistance(
  data: OpticalData,
  origin: { x: number; y: number },
  angleDegrees: number,
) {
  const angle = radians(angleDegrees);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let low = 0;
  let high = Math.max(data.aSize, data.bSize, engineeringEd(data)) * 2;

  for (let iteration = 0; iteration < 42; iteration += 1) {
    const middle = (low + high) / 2;
    if (frameContainsPoint(data, origin.x + dx * middle, origin.y + dy * middle)) low = middle;
    else high = middle;
  }

  return low;
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

export function opticalCenterForSide(data: OpticalData, side: "right" | "left" = "right") {
  const monocular = monocularDecentrationValues(data);
  return {
    x: side === "right" ? monocular.right : -monocular.left,
    y: verticalDecentration(data),
  };
}

export function finishedSurfaceSampleAtAngle(
  data: OpticalData,
  opticalCenter: { x: number; y: number },
  angleDegrees: number,
) {
  const angle = radians(angleDegrees);
  const radius = frameBoundaryDistance(data, opticalCenter, angleDegrees);
  const meridianPower = powerAtMeridian(data, angleDegrees);
  const frontPower = data.baseCurve;
  const backPower = meridianPower - frontPower;
  const frontSag = surfaceSagMm(frontPower, data.lensIndex, radius);
  const backSag = surfaceSagMm(backPower, data.lensIndex, radius);
  return {
    angleDegrees,
    x: opticalCenter.x + radius * Math.cos(angle),
    y: opticalCenter.y + radius * Math.sin(angle),
    radius,
    meridianPower,
    frontPower,
    backPower,
    frontSag,
    backSag,
    edgeMinusCenter: -frontSag - backSag,
  };
}

export function finishedSurfaceSamples(data: OpticalData, sampleCount = 180, side: "right" | "left" = "right") {
  const opticalCenter = opticalCenterForSide(data, side);
  return {
    opticalCenter,
    samples: Array.from({ length: Math.max(72, sampleCount) }, (_, index) =>
      finishedSurfaceSampleAtAngle(data, opticalCenter, (index / Math.max(72, sampleCount)) * 360),
    ),
  };
}

export function designMeridianPower(data: OpticalData) {
  const powers = [data.sphere, data.sphere + data.cylinder];
  return powers.reduce((selected, power) => (Math.abs(power) > Math.abs(selected) ? power : selected), powers[0]);
}

export function thicknessEstimate(data: OpticalData, refractiveIndex = data.lensIndex) {
  const scenario = refractiveIndex === data.lensIndex ? data : { ...data, lensIndex: refractiveIndex };
  const { samples } = finishedSurfaceSamples(scenario);
  if (samples.some((sample) => !Number.isFinite(sample.edgeMinusCenter))) {
    return { totalPower: Number.NaN, frontPower: data.baseCurve, backPower: Number.NaN, semiChord: Number.NaN, frontSag: Number.NaN, backSag: Number.NaN, center: Number.NaN, edge: Number.NaN, edgeMinusCenter: Number.NaN };
  }
  const minimumOffset = Math.min(...samples.map((sample) => sample.edgeMinusCenter));
  const center = Math.max(data.centerThickness, data.edgeThickness - minimumOffset);
  const maximum = samples.reduce((selected, sample) => sample.edgeMinusCenter > selected.edgeMinusCenter ? sample : selected);
  return {
    totalPower: maximum.meridianPower,
    frontPower: maximum.frontPower,
    backPower: maximum.backPower,
    semiChord: maximum.radius,
    frontSag: maximum.frontSag,
    backSag: maximum.backSag,
    center,
    edge: center + maximum.edgeMinusCenter,
    edgeMinusCenter: maximum.edgeMinusCenter,
  };
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
