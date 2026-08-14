import assert from "node:assert/strict";
import test from "node:test";
import { compareMaterials, finishedLensGeometry, materialDifference, powerAtMeridian } from "../lib/optical/geometry.ts";
import { patientScenario, patientFrames, type PatientFrameSize } from "../lib/optical/scenarios.ts";
import { validationSummary } from "../lib/optical/validation.ts";
import { thicknessEstimate } from "../lib/optical/calculations.ts";

const materials = ["Plastic", "Poly", "1.60", "1.67", "1.74", "1.76"];

test("spherical minus and plus matrices produce finite constrained geometry for every material", () => {
  const prescriptions = [-2, -4, -6, -8, -10, -12, 2, 4, 6, 8];
  for (const sphere of prescriptions) {
    const scenario = patientScenario({ sphere, cylinder: 0, axis: 180 }, sphere <= -10 ? "small" : "medium");
    for (const { geometry } of compareMaterials(scenario, materials)) {
      assert.ok(Number.isFinite(geometry.centerThickness), `${sphere} ${geometry.material}`);
      assert.ok(Number.isFinite(geometry.maximumEdgeThickness), `${sphere} ${geometry.material}`);
      assert.ok(geometry.centerThickness >= geometry.input.centerThickness);
      assert.ok(geometry.minimumEdgeThickness >= geometry.input.edgeThickness - 1e-8);
      assert.equal(geometry.perimeter.length, 180);
    }
  }
});

test("compound prescriptions preserve cylinder and axis instead of collapsing to a sphere", () => {
  const cases = [
    { sphere: -4, cylinder: -2, axis: 180 },
    { sphere: -4, cylinder: -2, axis: 90 },
    { sphere: -8, cylinder: -2, axis: 180 },
    { sphere: -8, cylinder: -3, axis: 45 },
    { sphere: 4, cylinder: -2, axis: 180 },
  ];
  for (const prescription of cases) {
    const scenario = patientScenario(prescription);
    const alongAxis = powerAtMeridian(scenario, prescription.axis);
    const acrossAxis = powerAtMeridian(scenario, prescription.axis + 90);
    assert.ok(Math.abs(alongAxis - prescription.sphere) < 1e-10);
    assert.ok(Math.abs(acrossAxis - (prescription.sphere + prescription.cylinder)) < 1e-10);
    const geometry = finishedLensGeometry(scenario);
    const uniqueDirectionalThicknesses = new Set(Object.values(geometry.edgeThickness).map((value) => value.toFixed(4)));
    assert.ok(uniqueDirectionalThicknesses.size > 1, JSON.stringify(prescription));
  }
});

test("frame size and decentration alter finished geometry while material comparisons hold all else constant", () => {
  const prescription = { sphere: -8, cylinder: -1.5, axis: 180 };
  const frameSizes = Object.keys(patientFrames) as PatientFrameSize[];
  const edges = frameSizes.map((size) => finishedLensGeometry(patientScenario(prescription, size)).maximumEdgeThickness);
  assert.ok(edges[3] > edges[0]);

  const centered = patientScenario(prescription, "medium", patientFrames.medium.aSize + patientFrames.medium.dbl);
  const decentered = patientScenario(prescription, "medium", 52);
  assert.ok(finishedLensGeometry(decentered).maximumEdgeThickness > finishedLensGeometry(centered).maximumEdgeThickness);
});

test("patient frame overrides drive horizontal and vertical decentration without changing the simple presets", () => {
  const prescription = { sphere: -6, cylinder: -1.5, axis: 180 };
  const customFrame = { ...patientFrames.medium, aSize: 54, bSize: 40, dbl: 17, segHeight: 24 };
  const scenario = patientScenario(prescription, "medium", 61, customFrame);
  const geometry = finishedLensGeometry(scenario);

  assert.equal(scenario.aSize, 54);
  assert.equal(scenario.bSize, 40);
  assert.equal(scenario.dbl, 17);
  assert.equal(geometry.opticalCenter.x, 5);
  assert.equal(geometry.opticalCenter.y, -4);
  assert.deepEqual(patientFrames.medium, { aSize: 52, bSize: 38, dbl: 18, segHeight: 20, frameShape: "Rectangle" });
});

test("patient scenarios accept asymmetric monocular PD measurements", () => {
  const scenario = patientScenario({ sphere: -6, cylinder: -1.5, axis: 180 }, "medium", { right: 30, left: 32 });
  const rightGeometry = finishedLensGeometry(scenario, { side: "right" });
  const leftGeometry = finishedLensGeometry(scenario, { side: "left" });

  assert.equal(scenario.pdRight, 30);
  assert.equal(scenario.pdLeft, 32);
  assert.equal(rightGeometry.opticalCenter.x, 5);
  assert.equal(leftGeometry.opticalCenter.x, -3);
});

test("Tokai comparisons are calculated dynamically and do not assume a fixed reduction", () => {
  const moderate = compareMaterials(patientScenario({ sphere: -4, cylinder: -1, axis: 180 }), ["1.67", "1.76"]);
  const strong = compareMaterials(patientScenario({ sphere: -9, cylinder: -2, axis: 180 }), ["1.67", "1.76"]);
  const moderateDifference = materialDifference(moderate[0].geometry, moderate[1].geometry);
  const strongDifference = materialDifference(strong[0].geometry, strong[1].geometry);
  assert.notEqual(moderateDifference.reductionPercent.toFixed(4), strongDifference.reductionPercent.toFixed(4));
  assert.ok(strongDifference.differenceMm > moderateDifference.differenceMm);
});

test("engineering and patient consumers receive byte-identical underlying geometry", () => {
  const sharedInput = patientScenario({ sphere: -8, cylinder: -1.5, axis: 180 }, "large", 60);
  const engineeringResult = compareMaterials(sharedInput, ["1.67", "1.74", "1.76"]);
  const patientResult = compareMaterials(sharedInput, ["1.67", "1.74", "1.76"]);
  assert.deepEqual(patientResult, engineeringResult);
  for (const result of engineeringResult) {
    const scalar = thicknessEstimate(result.geometry.input);
    assert.ok(Math.abs(scalar.center - result.geometry.centerThickness) < 1e-10);
    assert.ok(Math.abs(scalar.edge - result.geometry.maximumEdgeThickness) < 1e-10);
  }
});

test("validation framework reports absence of measured values without inventing accuracy", () => {
  const summary = validationSummary([]);
  assert.equal(summary.measuredValueCount, 0);
  assert.equal(summary.meanAbsoluteErrorMm, null);
  assert.equal(summary.maximumErrorMm, null);
});
