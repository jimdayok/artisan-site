import { finishedLensGeometry } from "./geometry.ts";
import type { OpticalData } from "./calculations.ts";

export type ThicknessValidationCase = {
  id: string;
  source: string;
  classification: "calibration" | "validation" | "historical";
  input: OpticalData;
  measuredCenterThickness?: number;
  measuredMaximumEdgeThickness?: number;
};

export type ThicknessValidationResult = ThicknessValidationCase & {
  calculatedCenterThickness: number;
  calculatedMaximumEdgeThickness: number;
  centerAbsoluteDifference?: number;
  edgeAbsoluteDifference?: number;
  centerPercentageDifference?: number;
  edgePercentageDifference?: number;
};

export function validateThicknessCase(entry: ThicknessValidationCase): ThicknessValidationResult {
  const geometry = finishedLensGeometry(entry.input);
  const centerAbsoluteDifference = entry.measuredCenterThickness === undefined
    ? undefined
    : Math.abs(geometry.centerThickness - entry.measuredCenterThickness);
  const edgeAbsoluteDifference = entry.measuredMaximumEdgeThickness === undefined
    ? undefined
    : Math.abs(geometry.maximumEdgeThickness - entry.measuredMaximumEdgeThickness);
  return {
    ...entry,
    calculatedCenterThickness: geometry.centerThickness,
    calculatedMaximumEdgeThickness: geometry.maximumEdgeThickness,
    centerAbsoluteDifference,
    edgeAbsoluteDifference,
    centerPercentageDifference: centerAbsoluteDifference === undefined || !entry.measuredCenterThickness
      ? undefined
      : (centerAbsoluteDifference / entry.measuredCenterThickness) * 100,
    edgePercentageDifference: edgeAbsoluteDifference === undefined || !entry.measuredMaximumEdgeThickness
      ? undefined
      : (edgeAbsoluteDifference / entry.measuredMaximumEdgeThickness) * 100,
  };
}

export function validationSummary(entries: readonly ThicknessValidationCase[]) {
  const results = entries.map(validateThicknessCase);
  const errors = results.flatMap((result) => [result.centerAbsoluteDifference, result.edgeAbsoluteDifference])
    .filter((value): value is number => value !== undefined);
  return {
    results,
    measuredValueCount: errors.length,
    meanAbsoluteErrorMm: errors.length ? errors.reduce((sum, value) => sum + value, 0) / errors.length : null,
    maximumErrorMm: errors.length ? Math.max(...errors) : null,
  };
}
