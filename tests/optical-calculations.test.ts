import assert from "node:assert/strict";
import test from "node:test";
import {
  averageHorizontalDecentration,
  estimatedEd,
  framePd,
  lensWeight,
  materialProperties,
  minimumBlank,
  monocularDecentrationValues,
  scenarioForMaterial,
  thicknessEstimate,
  totalHorizontalDecentration,
  vertexCompensatePower,
  vertexCompensation,
  vogelBaseCurve,
  type OpticalData,
} from "../lib/optical/calculations.ts";

function scenario(overrides: Partial<OpticalData> = {}): OpticalData {
  return {
    sphere: -2.5,
    cylinder: -1,
    axis: 180,
    add: 2,
    prismHorizontal: 0,
    prismVertical: 0,
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
    prismAmount: 0,
    prismDirection: 0,
    safetyMargin: 2,
    measuredCurve: 4,
    lensClockIndex: 1.53,
    actualIndex: 1.6,
    orderedSphere: 0,
    orderedCylinder: 0,
    orderedAxis: 180,
    measuredSphere: 0,
    measuredCylinder: 0,
    measuredAxis: 180,
    orderedPrismHorizontal: 0,
    orderedPrismVertical: 0,
    measuredPrismHorizontal: 0,
    measuredPrismVertical: 0,
    ...overrides,
  };
}

test("Vogel's Rule uses the plus/plano and minus spherical-equivalent formulas", () => {
  const plus = vogelBaseCurve(scenario({ sphere: 2, cylinder: -1 }));
  assert.equal(plus.prescriptionType, "Plus / plano");
  assert.equal(plus.unrounded, 7.5);
  assert.equal(plus.suggested, 7.5);

  const minus = vogelBaseCurve(scenario({ sphere: -4.5, cylinder: -1 }));
  assert.equal(minus.prescriptionType, "Minus");
  assert.equal(minus.unrounded, 3.5);
  assert.equal(minus.suggested, 3.5);

  const highCylinderCrossingPlano = vogelBaseCurve(scenario({ sphere: 2, cylinder: -6.2 }));
  assert.ok(Math.abs(highCylinderCrossingPlano.unrounded - 5.45) < 1e-12);
  assert.equal(highCylinderCrossingPlano.suggested, 5.5);
});

test("frame PD and total, average, and monocular decentration remain distinct", () => {
  const data = scenario({ aSize: 52, bSize: 40, dbl: 18, pdRight: 30, pdLeft: 32 });
  assert.equal(framePd(data), 70);
  assert.equal(totalHorizontalDecentration(data), 8);
  assert.equal(averageHorizontalDecentration(data), 4);
  assert.deepEqual(monocularDecentrationValues(data), { right: 5, left: 3 });
});

test("B and fitting height affect ED, blank geometry, thickness, and weight", () => {
  const shallow = scenario({ bSize: 30, segHeight: 15 });
  const deep = scenario({ bSize: 55, segHeight: 15 });
  assert.ok(estimatedEd(deep) > estimatedEd(shallow));
  assert.ok(minimumBlank(deep) > minimumBlank(shallow));
  assert.ok(thicknessEstimate(deep).edge > thicknessEstimate(shallow).edge);
  assert.ok(lensWeight(deep, 1.3) > lensWeight(shallow, 1.3));
});

test("an optional ED override is used only when positive", () => {
  const automatic = minimumBlank(scenario({ effectiveDiameter: 0 }));
  const overridden = minimumBlank(scenario({ effectiveDiameter: 80 }));
  assert.ok(overridden > automatic);
});

test("vertex compensation uses Δv/n in meters and transforms both principal meridians", () => {
  const plus = vertexCompensation(scenario({ sphere: 10, cylinder: -2, originalVertex: 12, newVertex: 14 }));
  assert.ok(Math.abs(plus.reducedDistanceMeters - -0.002) < 1e-12);
  assert.ok(Math.abs(plus.sphere - 10 / 1.02) < 1e-12);
  assert.ok(Math.abs((plus.sphere + plus.cylinder) - 8 / 1.016) < 1e-12);

  const minus = vertexCompensation(scenario({ sphere: -8, cylinder: -2, originalVertex: 12, newVertex: 14 }));
  assert.ok(minus.sphere < -8);
  assert.ok(minus.sphere + minus.cylinder < -10);
  assert.equal(vertexCompensatePower(10, 100, 0, 1), Number.NaN);
});

test("representative edge cases remain finite and never yield negative thickness or weight", () => {
  const cases = [
    scenario({ sphere: 6, cylinder: 0, baseCurve: 12 }),
    scenario({ sphere: -8, cylinder: -2, baseCurve: 2 }),
    scenario({ sphere: 0, cylinder: 0, baseCurve: 6 }),
    scenario({ sphere: 2, cylinder: -6, axis: 45, baseCurve: 5.5 }),
    scenario({ sphere: -10, cylinder: -2, lensIndex: 1.74, lensMaterial: "1.74", baseCurve: 1 }),
    scenario({ aSize: 38, bSize: 24, dbl: 14, pdRight: 28, pdLeft: 28, segHeight: 12 }),
    scenario({ aSize: 55, bSize: 60, dbl: 20, segHeight: 12 }),
    scenario({ aSize: 60, bSize: 45, dbl: 22, pdRight: 24, pdLeft: 24, segHeight: 15 }),
  ];

  for (const data of cases) {
    const estimate = thicknessEstimate(data);
    const weight = lensWeight(data, 1.3);
    assert.ok(Number.isFinite(estimate.center), JSON.stringify(data));
    assert.ok(Number.isFinite(estimate.edge), JSON.stringify(data));
    assert.ok(estimate.center >= data.centerThickness);
    assert.ok(estimate.edge >= data.edgeThickness);
    assert.ok(Number.isFinite(weight) && weight > 0);
  }
});

test("Tokai 1.70 and 1.76 presets use documented optical properties and thickness constraints", () => {
  const tokai170 = materialProperties.find((material) => material.name === "1.70");
  const tokai176 = materialProperties.find((material) => material.name === "1.76");

  assert.ok(tokai170);
  assert.equal(tokai170.abbe, 36);
  assert.equal(tokai170.specificGravity, 1.41);
  assert.deepEqual(tokai170.documentedMinimums, {
    centerThickness: 1,
    edgeThickness: 0.7,
    source: "Tokai 1.70 AS thickness chart",
  });

  assert.ok(tokai176);
  assert.equal(tokai176.abbe, 30);
  assert.equal(tokai176.specificGravity, 1.49);
  assert.deepEqual(tokai176.documentedMinimums, {
    centerThickness: 1,
    edgeThickness: 0.7,
    source: "Tokai 1.76 AS thickness chart",
  });

  const tokaiScenario = scenarioForMaterial(
    scenario({ centerThickness: 2, edgeThickness: 1.5 }),
    tokai176
  );
  assert.equal(tokaiScenario.lensIndex, 1.76);
  assert.equal(tokaiScenario.centerThickness, 1);
  assert.equal(tokaiScenario.edgeThickness, 0.7);
});
