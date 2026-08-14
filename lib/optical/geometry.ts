import {
  engineeringEd,
  estimatedLensVolumeCm3,
  finishedSurfaceSampleAtAngle,
  lensWeight,
  materialProperties,
  opticalCenterForSide,
  powerAtMeridian,
  scenarioForMaterial,
  surfaceSagMm,
  type MaterialProperty,
  type OpticalData,
} from "./calculations.ts";

export type LensSide = "right" | "left";
export type EdgeDirection = "temporal" | "nasal" | "superior" | "inferior";

export type LensGeometryPoint = {
  angleDegrees: number;
  x: number;
  y: number;
  radius: number;
  meridianPower: number;
  frontPower: number;
  backPower: number;
  frontSag: number;
  backSag: number;
  thickness: number;
};

export type FinishedLensGeometry = {
  input: OpticalData;
  side: LensSide;
  opticalCenter: { x: number; y: number };
  centerThickness: number;
  minimumEdgeThickness: number;
  maximumEdgeThickness: number;
  edgeThickness: Record<EdgeDirection, number>;
  maximumEdgeLocation: LensGeometryPoint;
  minimumEdgeLocation: LensGeometryPoint;
  perimeter: LensGeometryPoint[];
  effectiveDiameter: number;
  blankDiameter: number;
  estimatedVolumeCm3: number;
  estimatedMassGrams: number;
  frontCurve: number;
  backCurveAtMaximum: number;
  refractiveIndex: number;
  material: string;
  trace: {
    formula: string;
    module: string;
    sampleCount: number;
    minimumConstraintApplied: "center" | "edge";
  };
};

export type MaterialComparisonResult = {
  material: MaterialProperty;
  geometry: FinishedLensGeometry;
};

const DIRECTION_ANGLES: Record<EdgeDirection, number> = {
  temporal: 180,
  nasal: 0,
  superior: 90,
  inferior: 270,
};

export { frameBoundaryDistance, powerAtMeridian } from "./calculations.ts";

function nearestPoint(perimeter: LensGeometryPoint[], angleDegrees: number) {
  const circularDistance = (left: number, right: number) => {
    const difference = Math.abs(left - right) % 360;
    return Math.min(difference, 360 - difference);
  };
  return perimeter.reduce((closest, point) =>
    circularDistance(point.angleDegrees, angleDegrees) < circularDistance(closest.angleDegrees, angleDegrees)
      ? point
      : closest,
  );
}

export function finishedLensGeometry(
  data: OpticalData,
  options: { side?: LensSide; sampleCount?: number } = {},
): FinishedLensGeometry {
  const side = options.side ?? "right";
  const sampleCount = Math.max(72, options.sampleCount ?? 180);
  const opticalCenter = opticalCenterForSide(data, side);
  const raw = Array.from({ length: sampleCount }, (_, index) =>
    finishedSurfaceSampleAtAngle(data, opticalCenter, (index / sampleCount) * 360),
  );
  const finiteRaw = raw.filter((point) => Number.isFinite(point.edgeMinusCenter));
  if (finiteRaw.length !== raw.length) {
    throw new RangeError("The selected surface curve and frame geometry do not produce a finite finished lens surface.");
  }

  const lowestEdgeOffset = Math.min(...raw.map((point) => point.edgeMinusCenter));
  const centerThickness = Math.max(data.centerThickness, data.edgeThickness - lowestEdgeOffset);
  const perimeter = raw.map(({ edgeMinusCenter, ...point }) => ({
    ...point,
    thickness: centerThickness + edgeMinusCenter,
  }));
  const maximumEdgeLocation = perimeter.reduce((maximum, point) => point.thickness > maximum.thickness ? point : maximum);
  const minimumEdgeLocation = perimeter.reduce((minimum, point) => point.thickness < minimum.thickness ? point : minimum);
  const material = materialProperties.find((candidate) => candidate.name === data.lensMaterial);
  const density = material?.specificGravity ?? 1.3;

  return {
    input: data,
    side,
    opticalCenter,
    centerThickness,
    minimumEdgeThickness: minimumEdgeLocation.thickness,
    maximumEdgeThickness: maximumEdgeLocation.thickness,
    edgeThickness: {
      temporal: nearestPoint(perimeter, DIRECTION_ANGLES.temporal).thickness,
      nasal: nearestPoint(perimeter, DIRECTION_ANGLES.nasal).thickness,
      superior: nearestPoint(perimeter, DIRECTION_ANGLES.superior).thickness,
      inferior: nearestPoint(perimeter, DIRECTION_ANGLES.inferior).thickness,
    },
    maximumEdgeLocation,
    minimumEdgeLocation,
    perimeter,
    effectiveDiameter: engineeringEd(data),
    blankDiameter: Math.max(...perimeter.map((point) => point.radius)) * 2,
    estimatedVolumeCm3: estimatedLensVolumeCm3(data),
    estimatedMassGrams: lensWeight(data, density),
    frontCurve: data.baseCurve,
    backCurveAtMaximum: maximumEdgeLocation.backPower,
    refractiveIndex: data.lensIndex,
    material: data.lensMaterial,
    trace: {
      formula: "t(θ) = CT − sag(front, rθ) − sag(back meridian, rθ)",
      module: "lib/optical/geometry.ts → surfaceSagMm",
      sampleCount,
      minimumConstraintApplied: centerThickness > data.centerThickness ? "edge" : "center",
    },
  };
}

export function compareMaterials(
  data: OpticalData,
  materialNames: readonly string[],
  options: { side?: LensSide; sampleCount?: number } = {},
) {
  return materialNames.map((name): MaterialComparisonResult => {
    const material = materialProperties.find((candidate) => candidate.name === name);
    if (!material) throw new RangeError(`Unknown optical material: ${name}`);
    return { material, geometry: finishedLensGeometry(scenarioForMaterial(data, material), options) };
  });
}

export function materialDifference(reference: FinishedLensGeometry, comparison: FinishedLensGeometry) {
  const differenceMm = reference.maximumEdgeThickness - comparison.maximumEdgeThickness;
  return {
    differenceMm,
    reductionPercent: reference.maximumEdgeThickness === 0 ? 0 : (differenceMm / reference.maximumEdgeThickness) * 100,
  };
}

export function surfacePointAt(
  geometry: FinishedLensGeometry,
  x: number,
  y: number,
  enhancement = 1,
) {
  const dx = x - geometry.opticalCenter.x;
  const dy = y - geometry.opticalCenter.y;
  const radius = Math.hypot(dx, dy);
  const angleDegrees = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  const meridianPower = powerAtMeridian(geometry.input, angleDegrees);
  const frontSag = surfaceSagMm(geometry.frontCurve, geometry.refractiveIndex, radius);
  const backSag = surfaceSagMm(meridianPower - geometry.frontCurve, geometry.refractiveIndex, radius);
  const actualFront = geometry.centerThickness / 2 - frontSag;
  const actualBack = -geometry.centerThickness / 2 + backSag;
  const midpoint = (actualFront + actualBack) / 2;
  const halfThickness = ((actualFront - actualBack) / 2) * enhancement;
  return {
    front: midpoint + halfThickness,
    back: midpoint - halfThickness,
    thickness: actualFront - actualBack,
  };
}
