export type TroubleshootingGuide = {
  slug: string;
  title: string;
  summary: string;
  symptoms: string[];
  commonCauses: string[];
  recommendedActions: string[];
  contactLab: string[];
  bestPractices: string[];
};

export const troubleshootingGuides: TroubleshootingGuide[] = [
  {
    slug: "non-adapts",
    title: "Non-Adapts",
    summary:
      "Use this guide when a patient cannot comfortably adapt to a new lens design after the prescription, fit, and frame have been dispensed.",
    symptoms: [
      "Patient reports swim, pull, nausea, or a floating sensation after several days of consistent wear.",
      "Distance feels acceptable, but near or intermediate zones are hard to locate.",
      "Patient keeps lifting, lowering, or tilting the frame to find clear vision.",
      "Patient compares the new pair unfavorably to an older pair that used a different design, fit, or frame shape.",
    ],
    commonCauses: [
      "The new design has a different corridor, inset, base curve, or peripheral profile than the patient is used to.",
      "Frame adjustment changed after measurements were taken, especially pantoscopic tilt, wrap, or vertex distance.",
      "Seg height, monocular PD, or fitting cross placement does not match the patient’s actual wearing position.",
      "The patient was not coached on expected adaptation time or how the new lens zones should be used.",
      "A large prescription, anisometropia, prism, material change, or frame-size change amplified peripheral differences.",
    ],
    recommendedActions: [
      "Verify the frame is sitting exactly where the measurements were taken before judging the lens.",
      "Inspect lens markings and confirm fitting cross, monocular PDs, seg heights, add power, and design ordered.",
      "Compare the new pair to the previous pair: design, corridor, material, base curve, wrap, vertex, pantoscopic tilt, and frame dimensions.",
      "Ask the patient to demonstrate the task that fails instead of relying only on a general complaint.",
      "Coach the patient to wear the new pair consistently for several days if the measurements and frame fit verify correctly.",
      "If the problem is task-specific, confirm the lens design matches the patient’s real working distance and head posture.",
    ],
    contactLab: [
      "Contact the lab after frame fit, markings, Rx, and measurements have been verified.",
      "Send the original order number, patient complaint, prescription, add power, frame measurements, seg heights, monocular PDs, and any comparison to the prior pair.",
      "Include whether the patient is new to progressives, changed designs, changed frame shape, or changed material.",
    ],
    bestPractices: [
      "Do not remake a non-adapt before confirming the frame adjustment; small fit changes can create large perceived differences.",
      "Document the patient’s primary complaint in practical language: driving, laptop, phone, stairs, reading in bed, exam lane, or counter work.",
      "Use the same measurement posture every time: natural head position, frame fully adjusted, patient looking at eye level.",
      "For sensitive patients, keep frame size, corridor style, and design family as consistent as possible between pairs.",
    ],
  },
  {
    slug: "corridor-issues",
    title: "Corridor Issues",
    summary:
      "Use this guide when a progressive wearer can find distance but struggles with near, intermediate, corridor width, or head-position comfort.",
    symptoms: [
      "Patient says the reading area is too low, too high, too narrow, or difficult to find.",
      "Computer vision is limited unless the patient lifts the chin or leans forward.",
      "Patient reports blur when walking, looking down stairs, or moving through peripheral areas.",
      "Patient finds one eye easier than the other when reading through the corridor.",
    ],
    commonCauses: [
      "Seg height or fitting cross is not aligned with the patient’s actual wearing position.",
      "Frame has insufficient B measurement or the corridor ordered does not match the frame and patient behavior.",
      "Pantoscopic tilt, face-form wrap, or vertex distance changed after measurement.",
      "The selected design prioritizes a zone the patient does not use most, such as distance over office work.",
      "Monocular PD or inset is off, creating unequal corridor access between eyes.",
    ],
    recommendedActions: [
      "Re-adjust the frame first, then re-check the fitting cross and laser markings.",
      "Confirm minimum fitting height and recommended corridor requirements for the ordered design.",
      "Measure monocular PDs and seg heights again with the frame in final wearing position.",
      "Ask the patient to demonstrate reading, phone, dashboard, and computer posture in the office.",
      "If intermediate is the main complaint, consider whether an office or occupational design would serve the task better than a general-purpose progressive.",
    ],
    contactLab: [
      "Contact the lab if the fitting marks verify but the corridor still does not match patient use.",
      "Provide the order number, fitting height, frame dimensions, corridor/design ordered, and the task distance that is failing.",
      "Note whether the patient needs wider near, stronger intermediate, softer periphery, or shorter corridor access.",
    ],
    bestPractices: [
      "Never measure progressives before final frame adjustment.",
      "Avoid very shallow frames for patients who need easy near access unless the design is selected for that frame.",
      "Set expectations: progressive corridors require head movement, while occupational lenses can be better for long computer sessions.",
      "For remake decisions, solve for the patient’s failed task, not only the technical measurement.",
    ],
  },
  {
    slug: "coating-concerns",
    title: "Coating Concerns",
    summary:
      "Use this guide when a patient reports scratches, peeling, crazing, cleaning difficulty, glare, reflections, or a perceived coating failure.",
    symptoms: [
      "Fine cracks or spider-web marks appear on the lens surface.",
      "Coating appears to peel, spot, haze, or separate from the lens.",
      "Patient says lenses scratch too easily or never look clean.",
      "Patient notices reflections, glare, color shifts, or cosmetic differences from a prior pair.",
    ],
    commonCauses: [
      "Heat exposure from dashboards, ovens, grills, saunas, hair dryers, or hot water can craze coatings.",
      "Dry wiping, paper towels, clothing, or household cleaners can scratch or damage AR layers.",
      "Frame stress, overtight eyewire tension, or drill-mount stress can contribute to coating or lens-edge issues.",
      "The patient may be comparing different AR families with different residual color or cosmetic appearance.",
      "Improper cleaning habits can mimic a coating failure even when the lens surface is intact.",
    ],
    recommendedActions: [
      "Inspect lenses under good light and distinguish scratches, crazing, peeling, residue, and edge stress.",
      "Ask how the patient cleans the lenses and whether they were exposed to heat or chemicals.",
      "Check frame tension, drill mounts, eyewire pressure, and lens seating.",
      "Review the coating ordered and compare it to the patient’s expectations for glare, color, durability, and cleaning.",
      "If the lens is dirty rather than damaged, demonstrate proper cleaning with lens spray and microfiber cloth.",
    ],
    contactLab: [
      "Contact the lab when the coating concern appears to be a warrantable defect or the cause is unclear after inspection.",
      "Provide clear photos, order number, coating name, material, date dispensed, and patient cleaning/exposure history.",
      "Note whether marks are on the front, back, edge, both lenses, or only one lens.",
    ],
    bestPractices: [
      "Dispense every AR job with cleaning instructions; do not assume patients know how to clean premium lenses.",
      "Warn patients not to leave eyewear in hot cars or clean lenses with household chemicals.",
      "Check frame stress before sending a coating claim; stress can create repeat failures after remake.",
      "Document the coating family and warranty expectation at dispense.",
    ],
  },
  {
    slug: "frame-compatibility",
    title: "Frame Compatibility",
    summary:
      "Use this guide before ordering lenses in frames with unusual shape, high wrap, drill mounts, safety requirements, or edge-thickness risk.",
    symptoms: [
      "Lens will not seat cleanly, pops out, chips at the edge, or shows excessive stress.",
      "Patient receives a lens that is cosmetically thicker or heavier than expected.",
      "Safety or wrap frame does not perform as expected after glazing.",
      "Drill-mount, nylon, or grooved frame has cracking, starbursts, or unstable retention.",
    ],
    commonCauses: [
      "Frame shape, groove depth, bevel placement, or eyewire tension is not compatible with the prescription and material.",
      "High wrap requires compensated measurements and design/material choices appropriate for wrap.",
      "Drill mount or nylon mounting concentrates stress in lenses that are too thin, brittle, or poorly suited to the frame.",
      "Safety frames may require approved lenses, markings, thickness rules, or program-specific frame choices.",
      "Large eye size or poor frame selection increases edge thickness and cosmetic concerns.",
    ],
    recommendedActions: [
      "Check frame condition, groove depth, eyewire closure, screw integrity, and whether the frame has been previously stretched.",
      "Confirm material choice against Rx, mounting style, safety requirements, and frame shape.",
      "Review minimum thickness, edge polish, groove, drill, and wrap requirements before ordering.",
      "For high Rx jobs, discuss frame-size changes before quoting or promising cosmetic outcomes.",
      "For safety jobs, confirm the frame and lens path meet the required program before placing the order.",
    ],
    contactLab: [
      "Contact the lab before ordering if the frame is high wrap, drill mount, rimless, vintage, damaged, safety-specific, or unusually large for the prescription.",
      "Send frame brand/model, A/B/DBL, material requested, Rx, intended use, and photos when compatibility is uncertain.",
      "Ask the lab to review thickness, mounting risk, and safety requirements before promising the job.",
    ],
    bestPractices: [
      "Use frame selection as the first lens-performance decision, not an afterthought.",
      "Avoid promising thin edges in oversized frames with high minus prescriptions.",
      "For drill mounts, choose materials and thicknesses that reduce cracking and stress.",
      "Document patient approval when a frame choice carries known cosmetic or mounting limitations.",
    ],
  },
  {
    slug: "measurement-errors",
    title: "Measurement Errors",
    summary:
      "Use this guide when a finished pair seems technically correct on paper but the patient’s visual experience suggests measurement or wearing-position mismatch.",
    symptoms: [
      "One eye feels off, reading is uneven, or the patient closes one eye to find clarity.",
      "Distance is clear only when the frame is shifted, tilted, lifted, or lowered.",
      "Patient has neck strain, chin lift, or forced posture with new eyewear.",
      "Progressive wearer cannot find near or intermediate despite correct Rx verification.",
    ],
    commonCauses: [
      "Monocular PDs were measured as binocular PD or not measured in final frame position.",
      "Seg heights were taken before final adjustment or with the patient looking down/up.",
      "Pantoscopic tilt, face-form wrap, or vertex distance changed after ordering.",
      "Frame slipped during measurement or was not adjusted to the patient’s real wearing position.",
      "Compensated designs did not receive the required position-of-wear values.",
    ],
    recommendedActions: [
      "Adjust the frame to the intended wearing position and repeat all measurements.",
      "Verify monocular PDs, seg heights, fitting cross, OC placement, and lens markings.",
      "Measure at eye level with natural posture; avoid asking the patient to hold an artificial head position.",
      "Compare ordered measurements to current frame position and note any change.",
      "For digital/compensated jobs, verify pantoscopic tilt, wrap, and vertex values if required.",
    ],
    contactLab: [
      "Contact the lab when verified markings or measurements do not match what was ordered or when a compensated design needs review.",
      "Provide order number, original measurements, rechecked measurements, frame adjustment notes, and photos if possible.",
      "Explain the patient’s exact task failure and whether frame adjustment improves or worsens it.",
    ],
    bestPractices: [
      "Measure only after the frame is fully adjusted.",
      "Use monocular PDs for premium and progressive work.",
      "Record position-of-wear values when the design requires them; do not estimate later.",
      "Keep a measurement checklist at the dispense table for high-value or remake-sensitive jobs.",
    ],
  },
  {
    slug: "progressive-troubleshooting",
    title: "Progressive Troubleshooting",
    summary:
      "Use this guide as the standard office workflow for progressive complaints before requesting a remake.",
    symptoms: [
      "Distance, intermediate, or near is blurry in only one area of the lens.",
      "Patient reports narrow reading, distorted sides, stairs feel unsafe, or computer work is uncomfortable.",
      "Patient says the new progressive is worse than an older pair.",
      "Patient can see clearly only by moving the frame or changing head posture.",
    ],
    commonCauses: [
      "Frame adjustment or fit changed between measurement, order, and dispense.",
      "The selected design does not match the patient’s dominant task or frame size.",
      "Measurements are technically plausible but not matched to the actual wearing position.",
      "Rx, add power, prism, anisometropia, or material change increased adaptation demand.",
      "The patient was not coached on progressive use or adaptation expectations.",
    ],
    recommendedActions: [
      "Start with frame adjustment: level, face-form, pantoscopic tilt, vertex, nose-pad placement, and temple fit.",
      "Verify lens markings and compare ordered measurements to the current wearing position.",
      "Neutralize the lenses and confirm Rx, add, prism, material, and design ordered.",
      "Ask the patient to identify the failed task and demonstrate posture in the office.",
      "Compare against prior eyewear and note frame size, design, corridor, material, and fitting-height differences.",
      "Decide whether the solution is adjustment, education, design change, occupational lens, measurement correction, or lab review.",
    ],
    contactLab: [
      "Contact the lab after completing fit, measurement, Rx, and task-use checks.",
      "Provide order number, exact complaint, failed task distance, verified measurements, frame dimensions, prior-pair comparison, and requested outcome.",
      "Ask for design guidance before remaking into the same issue when the patient’s work pattern suggests another design.",
    ],
    bestPractices: [
      "Build a repeatable progressive complaint checklist and use it before every remake request.",
      "Fit the frame first, measure second, and troubleshoot in that order.",
      "Use occupational designs for long computer or desk work instead of forcing a general progressive to solve every task.",
      "Write remake notes that describe the patient’s real-world problem, not just “cannot adapt.”",
    ],
  },
];

export function getTroubleshootingGuide(slug: string) {
  return troubleshootingGuides.find((guide) => guide.slug === slug);
}
