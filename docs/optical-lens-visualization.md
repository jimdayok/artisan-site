# Integrated Optical Lens Thickness Visualization

## Discovery assessment

- **Application:** the Artisan website and engineering tools are one Next.js application in this repository.
- **Engineering integration:** `app/optical-engineering/page.tsx` owns the live engineering scenario. The visualization receives that existing `OpticalData` object and does not introduce a second professional input form.
- **Patient integration:** `app/patient-resources/lens-thickness` is nested under the existing Patient Resources route and uses the normal Artisan header, footer, typography, color, spacing, consent, and analytics infrastructure.
- **Authoritative calculations:** `lib/optical/calculations.ts` contains material definitions, frame PD and decentration, ED/blank geometry, Vogel base curve, signed surface radius/sag, scalar thickness, volume, weight, and vertex compensation.
- **Existing numeric thickness data:** the repository contains material optical properties and Tokai 1.70/1.76 documented minimum center/edge constraints. It does not contain measured finished-job thickness rows or a manufacturer validation table. `public/images/thickness-comparison-tokai.png` is a historical display photograph and is not treated as numeric validation data.

## Shared architecture

1. `lib/optical/calculations.ts` remains the established optical primitive layer.
2. `lib/optical/geometry.ts` samples those same signed front/back sag calculations by meridian around the representative frame boundary. It applies one global center-thickness adjustment to satisfy the minimum edge constraint, then reports directional and extrema values.
3. `components/lens-visualizer/LensCrossSection.tsx` and `Lens3DScene.tsx` consume the same `FinishedLensGeometry`. They do not calculate independent prescriptions or promotional reductions.
4. `components/lens-visualizer/LensComparison.tsx` configures the shared experience for engineering or patient presentation.
5. `lib/optical/scenarios.ts` supplies shared defaults, public presets, and representative frame sizes.
6. `lib/optical/validation.ts` accepts measured jobs and reports absolute/percentage errors, mean absolute error, and maximum error without mixing measured values into calculation inputs.

## Calculation trace

For each perimeter angle `θ`:

1. Intersect a ray from the optical center with the representative frame boundary.
2. Calculate the prescription power at that meridian using sphere, cylinder, and axis.
3. Use front base curve and meridional back power with `surfaceSagMm`.
4. Calculate `t(θ) = CT - sag(front, rθ) - sag(back meridian, rθ)`.
5. Raise center thickness once, if required, so every sampled edge satisfies the selected material's minimum edge rule.

Material comparisons hold prescription, PD, frame, fitting location, base curve, and design assumptions constant. Tokai messages are calculated from the resulting maximum edge values.

## Data classification

| Source | Classification | Use |
| --- | --- | --- |
| Material index, Abbe, density | Calculation input | Optical and estimated-weight calculations |
| Tokai 1.70/1.76 minimum CT/ET | Calculation input | Material-specific minimum constraints |
| Existing optical unit tests | Validation/regression | Protect established formulas and geometry behavior |
| Tokai physical display photograph | Historical reference | Visual/content reference only; never numeric calibration |
| Future measured finished jobs | Validation data | Error reporting only unless a reviewed model change is approved |

## Current limitations and validation strategy

The visualization is an auditable engineering estimate, not an LMS production calculation. The repository currently lacks actual trace coordinates, bevel placement, prism-thinning rules, manufacturer aspheric/freeform surface coefficients, progressive-design geometry, blank availability, and measured finished-job validation rows. Representative frame outlines are generated from A, B, shape, and optical-center placement.

When measured jobs become available, add immutable `ThicknessValidationCase` records with source, material, Rx, frame parameters, and measured CT/maximum ET. Review mean absolute error and systematic error by material, Rx sign/magnitude, cylinder, and frame size. Do not tune formulas to a single job or use measured outputs as hidden calculation inputs.

## Verification coverage

`tests/optical-geometry.test.ts` covers the requested spherical minus/plus powers, compound prescriptions and axes, all comparison materials, representative frame sizes, horizontal decentration, dynamic Tokai differences, minimum constraints, and identical engineering/patient outputs. The older optical regression suite remains intact.
