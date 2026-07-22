import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'output', 'ultimate-partners');
mkdirSync(outDir, { recursive: true });

const prompts = `# Canva AI Lens Background Prompts

Use these in Canva Magic Media / Text to Image. Generate each as a full-page background image. Do not include typography, logos, badges, maps, icons, layout lines, text, or graphic overlays.

## Prompt 1: Dark Green Left-Page Lens Arc
Premium abstract optical lens background for a full-page magazine advertisement, deep forest green and blackened teal background, oversized transparent eyeglass lens arc entering from the right edge, subtle glass rim, faint internal reflections, warm brass highlight on the lens edge, elegant negative space on the left for future headline placement, refined optical laboratory aesthetic, cinematic studio lighting, matte paper texture, sophisticated luxury editorial style, no text, no logo, no badge, no map, no icons, no people, no objects except abstract lens glass, no watermark.

Suggested Canva settings: square or landscape if available; choose photorealistic / cinematic / editorial style. Crop to fill left page.

## Prompt 2: Warm Ivory Right-Page Lens Rings
Premium abstract optical lens background for a full-page magazine advertorial, warm ivory paper background, large transparent lens rings and curved glass edges in the upper right and far right margin, very subtle shadows, delicate brass rim reflections, lots of clean empty space for future editorial text boxes, refined optical laboratory aesthetic, quiet luxury magazine design, soft natural studio light, no text, no logo, no badge, no map, no icons, no people, no product labels, no watermark.

Suggested Canva settings: portrait or landscape if available; choose minimal / editorial / photorealistic style. Crop to fill right page.

## Prompt 3: Close Glass Edge Detail
Macro photograph style abstract background of precision optical lens edges, transparent stacked lens curves, subtle bevels, dark green to blackened teal gradient background, brass-gold glints, high-end optical lab craftsmanship, clean negative space, elegant magazine advertising background, no text, no logo, no badge, no icons, no tools, no hands, no watermark.

Use when you want a richer crop behind the headline.

## Prompt 4: Soft Lab Craft Texture, No Objects
Subtle premium background texture inspired by optical lab craft, warm ivory and pale stone tones, faint glass refractions, soft circular lens shadows, no distinct objects, no text, no logo, no icons, no badges, no people, no equipment, no watermark. Clean editorial advertorial background with room for copy.

Use behind the advertorial body page if Prompt 2 feels too visually strong.
`;

const directions = `# Canva Build Direction: Ultimate Partners Two-Page Spread

## Canvas Setup
- Create a custom Canva design at 17 in x 11 in landscape for the full spread, or two separate 8.5 in x 11 in pages.
- If final specs arrive from Jobson, replace these dimensions with their trim and bleed requirements.
- Add guides: 0.125 in bleed, 0.375 in safe margin, and a visible center gutter.

## Background Image Workflow
1. Open Canva Magic Media / Text to Image.
2. Paste Prompt 1 and generate several versions.
3. Pick the version with the cleanest empty area on the left and no accidental text.
4. Set it as the full background of Page 1.
5. Paste Prompt 2 and generate several versions.
6. Pick the version with the lightest, cleanest open area for article copy.
7. Set it as the full background of Page 2.
8. If either image contains fake letters, logo-like marks, labels, badges, maps, icons, or hands, reject it and regenerate.

## Page 1: Ad Layering
- Background: Prompt 1 image, full bleed.
- Add headline manually in Canva: “Your lab should work for your practice. Not the other way around.”
- Add subhead manually.
- Add Artisan Lab Network logo manually.
- Add a simple small badge manually: “Named a 2026 Ultimate Partner.”
- Keep all text and badges as Canva-editable elements, not part of the AI image.

## Page 2: Advertorial Layering
- Background: Prompt 2 or Prompt 4 image, full bleed.
- Add all article copy manually as editable Canva text boxes.
- Use three short proof blocks: Independent ownership, Three-lab network, Product choice without rigidity.
- Add pull quote manually.
- Add footer manually: Pacific Artisan Labs • Peak Artisan Labs • Pike Artisan Labs.

## Art Direction Notes
- AI images should only provide atmosphere: lens curves, glass, light, and paper texture.
- Do not ask AI to place text. Canva text should stay editable.
- Do not ask AI to create logos or award badges. Add those manually.
- The award should be secondary proof, not the concept headline.

## Rejection Checklist For AI Backgrounds
Reject any image that has:
- Random letters or fake words
- Logos or logo-like marks
- Badges, seals, trophies, certificates, ribbons
- Handshake imagery
- People, hands, tools, equipment, maps, or lab scenes unless you intentionally want that later
- Crowded composition that competes with the headline or article copy
`;

writeFileSync(path.join(outDir, 'canva-ai-lens-prompts.md'), prompts);
writeFileSync(path.join(outDir, 'canva-layout-directions.md'), directions);

console.log('Wrote:');
console.log(path.join(outDir, 'canva-ai-lens-prompts.md'));
console.log(path.join(outDir, 'canva-layout-directions.md'));
