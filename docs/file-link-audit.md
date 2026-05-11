# Provider Resource File Link Audit

Audit date: 2026-05-11

Static public files should be linked from code with root-relative `/files/...` URLs. Next.js serves files in `public` from the site root, so `public/files/iot-camber-pure.pdf` is available at `/files/iot-camber-pure.pdf`.

## Summary

- Fixed policy guide links from `/downloads/artisan-policies-guide.pdf` to `/files/artisan-policies-guide.pdf`.
- Copied `public/downloads/artisan-policies-guide.pdf` into `public/files/artisan-policies-guide.pdf`.
- Copied available PDFs from the root-level `files/` staging folder into `public/files/` when they were not already present.
- Provider resource PDF buttons are rendered with `target="_blank"` and `rel="noopener noreferrer"`.
- No missing provider resource PDFs were found after the copy/fix pass.

## Audited Links

| File label | Path used in code | Exists in `public/files` | Page or component | Notes |
| --- | --- | --- | --- | --- |
| CDS Bifocal | `/files/ArtisanDesigns/cds_bifocal.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Diamond Series | `/files/ArtisanDesigns/diamond_series.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Gold Series | `/files/ArtisanDesigns/gold_series.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Platinum Series | `/files/ArtisanDesigns/platinum_series.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| PS Ultra Short | `/files/ArtisanDesigns/ps_ultra_short.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| SD Concept | `/files/ArtisanDesigns/sd_concept.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| SD Digital | `/files/ArtisanDesigns/sd_digital.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| SD Radius | `/files/ArtisanDesigns/sd_radius.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| SD Reach | `/files/ArtisanDesigns/sd_reach.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| IOT Centration Charts | `/files/iot-centration-charts.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| IOT Portfolio Guide | `/files/iot-portfolio-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| IOT Camber Pure | `/files/iot-camber-pure.pdf` | Yes | `app/provider-resources/page.tsx` | Specific requested file verified |
| Camber Steady Plus | `/files/camber-steady-plus.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Endless Steady | `/files/endless-steady.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Essential Steady | `/files/essential-steady.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Product Comparison Guide | `/files/iot-comparison-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Also linked in Most Used Resources |
| Endless Office | `/files/endless-office.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Endless Plus | `/files/endless-plus.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Endless Office Degression Chart | `/files/endless-office-degression-chart.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Neochromes | `/files/neochromes-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Tokai Select Guide | `/files/tokai-select-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Tokai Bi-AS SV Guide | `/files/tokai-bias-sv-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Tokai Reset Guide | `/files/tokai-reset-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Tokai Largo Guide | `/files/tokai-largo-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Tokai Tint Guide | `/files/tokai-tint-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Varilux Product Guide | `/files/varilux-product-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Varilux Comfort | `/files/varilux-comfort.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Varilux XR Series | `/files/varilux-xr-series.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Varilux X Series | `/files/varilux-x-series.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Varilux Comfort Max | `/files/varilux-comfort-max.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Crizal Product Guide | `/files/crizal-product-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Hoya Product Guide | `/files/hoya-product-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Hoya Centration Charts | `/files/hoya-centration-charts.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Hoya iD LifeStyle 4 | `/files/hoya-id-lifestyle-4.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Quick Reference Guide | `/files/shamir-quick-reference.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Dispensing Guide | `/files/shamir-dispensing-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Driver Intelligence Sun / Moon | `/files/shamir-driver-intelligence.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Unity V3 Sales Guide | `/files/unity-v3-sales-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Unity V3 White Paper | `/files/unity-v3-whitepaper.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Unity V3 Product Guide | `/files/unity-v3-product-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| TechShield AR Guide | `/files/techshield-ar-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| SunSync Product Guide | `/files/sunsync-product-guide.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Neurolens Provider Guide | `/files/neurolens-provider-brochure.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Sequel Lens Overview | `/files/sequel-lens-overview.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Modern Frame Book | `/files/modern-frame-book.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| ArmouRx Frame Book | `/files/armou-rx-frame-book.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| DVX / Wiley X Frame Book | `/files/dvx-wileyx-frame-book.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Wiley X Frame Book | `/files/wileyx-frame-book.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| ArtCraft Frame Book | `/files/artcraft-frame-book.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| SafeVision Frame Book | `/files/safevision-frame-book.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Chemistrie Clip System | `/files/chemistrie-clip-system.pdf` | Yes | `app/provider-resources/page.tsx` | Provider resource PDF button |
| Artisan Policies Guide | `/files/artisan-policies-guide.pdf` | Yes | `app/lab-policies/page.tsx` | Fixed from `/downloads/...`; opens in new tab |
| Artisan Policies Guide | `/files/artisan-policies-guide.pdf` | Yes | `app/private/price-list/policies/page.tsx` | Fixed from `/downloads/...`; opens in new tab |
| Private price list PDF export | Generated response | N/A | `app/private/price-list/export/route.ts` | Dynamic PDF download; no static `public/files` asset expected |

## Non-Code File Notes

- `public/data/Lookup.xlsx` exists but no source link to `/data/Lookup.xlsx` was found in the app code.
- `src/data/*PriceList.ts` contains `sourceFile` metadata strings naming original PDF price lists. These are metadata only and are not rendered as download links.
- Root-level `files/` contained duplicate or staging PDFs, including nested `files/files/` paths. Existing code does not link to those bad nested paths; available unique files were copied into `public/files/` for deployment-safe access.
