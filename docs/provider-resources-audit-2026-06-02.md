# ALN Provider Resources Audit

Audit date: June 2, 2026  
Primary page: `/provider-resources`  
Local validation target: `http://localhost:3000/provider-resources`

## Executive Summary

The Provider Resources page is visually strong and contains a surprisingly broad library of tools, PDFs, partner links, lab contacts, price-list paths, videos, and program CTAs. It is not yet best-in-class.

The biggest issue is trust. Several linked `.pdf` files are present in the repo but are actually HTML documents saved with a PDF extension. The page also exposes visible pending resources and placeholder CTAs. For an independent OD trying to use this as a working professional resource center, those issues make the page feel unfinished even though the design language is polished.

Best-in-class provider portals from companies like EssilorPRO, ZEISS, HOYA, Neurolens, VSP, and SpecCheck emphasize searchable resources, education libraries, marketing assets, patient education, account dashboards, ordering support, training/certification, and self-service workflows. ALN has the foundation, but should harden links, finish placeholders, add search/filtering, and build toward a true provider portal experience.

## 1. Link & PDF Validation Report

### Validation Method

- Loaded `/provider-resources` locally: `200 text/html`.
- Loaded key internal destinations locally: `/portal`, `/policies`, and `/files/iot-comparison-guide.pdf` all returned `200`.
- Extracted unique links and local file references from `app/provider-resources/page.tsx`.
- Checked local file existence and PDF headers for referenced `/files/...` assets.
- Checked external URLs with HTTP fetch and manual source review where relevant.
- Reviewed in-page anchor IDs in source.

### Critical Findings

- 14 linked PDF resources are not valid PDFs; they are HTML documents saved as `.pdf` files.
- `#iot` is referenced as an in-page anchor but no matching `id="iot"` exists.
- Multiple visible resources are marked `PDF Pending` or `placeholder: true`.
- Three CTAs use `href="#"`, creating dead-end actions.
- GoStock’s direct URL redirects to a lab-specific login URL; this is not broken, but should be clarified.
- YouTube short links redirect as expected; these are working but should use canonical watch/embed URLs where possible.

### Resource Validation Table

| Resource | Type | Status | Destination | Notes |
| -------- | ---- | ------ | ----------- | ----- |
| Provider Resources page | Page | Working | `/provider-resources` | Local route returned `200` |
| Portal | Internal page | Working | `/portal` | Local route returned `200` |
| Policies | Internal page | Working | `/policies` | Local route returned `200` |
| G6 Price List | Internal page | Working | `/portal/price-list/g6` | Route resolves |
| Price List Policies | Internal page | Working | `/portal/price-list/policies` | Route resolves |
| Programs | Internal page | Working | `/programs` | Route resolves |
| Armour AR | Internal page | Working | `/artisan-ar/armour` | Route resolves |
| Azure AR | Internal page | Working | `/artisan-ar/azure` | Route resolves |
| Emerald AR | Internal page | Working | `/artisan-ar/emerald` | Route resolves |
| Nytopia AR | Internal page | Working | `/artisan-ar/nytopia` | Route resolves |
| Tools & Ordering anchor | In-page anchor | Working | `#tools-ordering` | Matching section ID exists |
| Downloads & Training anchor | In-page anchor | Working | `#downloads-training` | Matching section ID exists |
| Product Information anchor | In-page anchor | Working | `#product-information` | Matching section ID exists |
| Lab Customer Service anchor | In-page anchor | Working | `#lab-customer-service` | Matching section ID exists |
| IOT anchor | In-page anchor | Broken | `#iot` | Referenced anchor has no matching ID |
| Become a Customer | External form | Working | Typeform signup URL | Typeform returned `200` |
| Contact Form | External form | Working | Typeform contact URL | Typeform returned `200` |
| Experience Request | External form | Working | Typeform experience URL | Typeform returned `200` |
| Safety Kit Form | External form | Working | Typeform safety-kit URL | Typeform returned `200`; repeated in multiple places |
| DVI RxWizard | External link | Working | `https://www.dvirx.com/` | Destination returned `200` |
| GoStock Global Optics | External link | Working | `https://www.globalopticsinc.com/gostock` | Destination returned `200` |
| GoStock Direct Login | External link | Redirecting | `https://www.gostocklenses.com/` | Redirects to `wp-login.php?lab=74`; clarify intent |
| SpecCheck | External link | Working | `https://www.speccheckrx.com/` | Destination returned `200` |
| YouTube: How to Create Order | Video link | Redirecting | `youtu.be` short URL | Expected YouTube redirect |
| YouTube: Lab Account Menu | Video link | Redirecting | `youtu.be` short URL | Expected YouTube redirect |
| YouTube: UOA Promo | Video link | Redirecting | `youtu.be` short URL | Expected YouTube redirect |
| YouTube: Unity Lens Promo | Video link | Redirecting | `youtu.be` short URL | Expected YouTube redirect |
| Mailto links | Email CTA | Working | `mailto:` destinations | Browser/email-client dependent |
| Merch Shop | CTA | Placeholder | `#` | Replace with real destination or hide |
| Chemistrie Order Form | CTA | Placeholder | `#` | Replace with real order form |
| Chemistrie Demo Kit Request | CTA | Placeholder | `#` | Replace with real form |
| IOT Comparison Guide | PDF | Working | `/files/iot-comparison-guide.pdf` | Valid PDF |
| IOT Portfolio Guide | PDF | Working | `/files/iot-portfolio-guide.pdf` | Valid PDF |
| IOT Camber Pure | PDF | Working | `/files/iot-camber-pure.pdf` | Valid PDF |
| IOT Centration Charts | PDF | Working | `/files/iot-centration-charts.pdf` | Valid PDF |
| Camber Steady Plus | PDF | Working | `/files/camber-steady-plus.pdf` | Valid PDF |
| Neochromes Guide | PDF | Working | `/files/neochromes-guide.pdf` | Valid PDF |
| Endless Plus | PDF | Working | `/files/endless-plus.pdf` | Valid PDF |
| Endless Steady | PDF | Working | `/files/endless-steady.pdf` | Valid PDF |
| Essential Steady | PDF | Working | `/files/essential-steady.pdf` | Valid PDF |
| Endless Office | PDF | Working | `/files/endless-office.pdf` | Valid PDF |
| Endless Office Degression Chart | PDF | Working | `/files/endless-office-degression-chart.pdf` | Valid PDF |
| Tokai Select Guide | PDF | Working | `/files/tokai-select-guide.pdf` | Valid PDF |
| Tokai Largo Guide | PDF | Working | `/files/tokai-largo-guide.pdf` | Valid PDF |
| Tokai Reset Guide | PDF | Working | `/files/tokai-reset-guide.pdf` | Valid PDF |
| Tokai Bi-AS SV Guide | PDF | Working | `/files/tokai-bias-sv-guide.pdf` | Valid PDF |
| Tokai Tint Guide | PDF | Working | `/files/tokai-tint-guide.pdf` | Valid PDF |
| HOYA Product Guide | PDF | Working | `/files/hoya-product-guide.pdf` | Valid PDF |
| HOYA Centration Charts | PDF | Working | `/files/hoya-centration-charts.pdf` | Valid PDF |
| Varilux Product Guide | PDF | Working | `/files/varilux-product-guide.pdf` | Valid PDF |
| Varilux Comfort | PDF | Working | `/files/varilux-comfort.pdf` | Valid PDF |
| Unity V3 Sales Guide | PDF | Working | `/files/unity-v3-sales-guide.pdf` | Valid PDF |
| Unity V3 Whitepaper | PDF | Working | `/files/unity-v3-whitepaper.pdf` | Valid PDF |
| Unity Rewards PECAA | PDF | Working | `/files/unity-rewards-pecaa.pdf` | Valid PDF |
| Artisan CDS Bifocal | PDF | Working | `/files/ArtisanDesigns/cds_bifocal.pdf` | Valid PDF |
| Artisan PS Ultra Short | PDF | Working | `/files/ArtisanDesigns/ps_ultra_short.pdf` | Valid PDF |
| Artisan SD Digital | PDF | Working | `/files/ArtisanDesigns/sd_digital.pdf` | Valid PDF |
| Artisan SD Radius | PDF | Working | `/files/ArtisanDesigns/sd_radius.pdf` | Valid PDF |
| Artisan Diamond Series | PDF | Working | `/files/ArtisanDesigns/diamond_series.pdf` | Valid PDF file exists, but page also marks some design PDFs pending |
| Artisan Gold Series | PDF | Working | `/files/ArtisanDesigns/gold_series.pdf` | Valid PDF file exists, but page also marks some design PDFs pending |
| Artisan Platinum Series | PDF | Working | `/files/ArtisanDesigns/platinum_series.pdf` | Valid PDF file exists, but page also marks some design PDFs pending |
| Artisan SD Concept | PDF | Working | `/files/ArtisanDesigns/sd_concept.pdf` | Valid PDF file exists, but page also marks some design PDFs pending |
| Artisan SD Reach | PDF | Working | `/files/ArtisanDesigns/sd_reach.pdf` | Valid PDF file exists, but page also marks some design PDFs pending |
| ArmourRx Frame Book | PDF | Working | `/files/armou-rx-frame-book.pdf` | Valid PDF |
| ArtCraft Frame Book | PDF | Working | `/files/artcraft-frame-book.pdf` | Valid PDF |
| DVX/WileyX Frame Book | PDF | Working | `/files/dvx-wileyx-frame-book.pdf` | Valid PDF |
| Modern Frame Book | PDF | Working | `/files/modern-frame-book.pdf` | Valid PDF |
| SafeVision Frame Book | PDF | Working | `/files/safevision-frame-book.pdf` | Valid PDF |
| WileyX Frame Book | PDF | Working | `/files/wileyx-frame-book.pdf` | Valid PDF |
| Chemistrie Clip System | PDF | Needs Update | `/files/chemistrie-clip-system.pdf` | File exists but is HTML, not PDF |
| Crizal Product Guide | PDF | Needs Update | `/files/crizal-product-guide.pdf` | File exists but is HTML, not PDF |
| HOYA iD Lifestyle 4 | PDF | Needs Update | `/files/hoya-id-lifestyle-4.pdf` | File exists but is HTML, not PDF |
| Neurolens Provider Brochure | PDF | Needs Update | `/files/neurolens-provider-brochure.pdf` | File exists but is HTML, not PDF |
| Sequel Lens Overview | PDF | Needs Update | `/files/sequel-lens-overview.pdf` | File exists but is HTML, not PDF |
| Shamir Dispensing Guide | PDF | Needs Update | `/files/shamir-dispensing-guide.pdf` | File exists but is HTML, not PDF |
| Shamir Driver Intelligence | PDF | Needs Update | `/files/shamir-driver-intelligence.pdf` | File exists but is HTML, not PDF |
| Shamir Quick Reference | PDF | Needs Update | `/files/shamir-quick-reference.pdf` | File exists but is HTML, not PDF |
| SunSync Product Guide | PDF | Needs Update | `/files/sunsync-product-guide.pdf` | File exists but is HTML, not PDF |
| TechShield AR Guide | PDF | Needs Update | `/files/techshield-ar-guide.pdf` | File exists but is HTML, not PDF |
| Unity V3 Product Guide | PDF | Needs Update | `/files/unity-v3-product-guide.pdf` | File exists but is HTML, not PDF |
| Varilux Comfort Max | PDF | Needs Update | `/files/varilux-comfort-max.pdf` | File exists but is HTML, not PDF |
| Varilux X Series | PDF | Needs Update | `/files/varilux-x-series.pdf` | File exists but is HTML, not PDF |
| Varilux XR Series | PDF | Needs Update | `/files/varilux-xr-series.pdf` | File exists but is HTML, not PDF |
| IOT Specialty Layout Charts | PDF | Placeholder | Page card | Marked `PDF Pending` |
| Tokai AR Treatment Resources | PDF | Placeholder | Page card | Marked `PDF Pending` |
| HOYA Layout Chart Library | PDF | Placeholder | Page card | Marked `PDF Pending` |
| HOYA AR Treatment Resources | PDF | Placeholder | Page card | Marked `PDF Pending` |
| Glacier Expressions | PDF | Placeholder | Page card | Marked `PDF Pending` |
| Glacier Plus | PDF | Placeholder | Page card | Marked `PDF Pending` |

## 2. Resource Inventory

### Ordering Tools

- SpecCheck ordering portal.
- DVI RxWizard link.
- GoStock links.
- Safety kit request form.
- Chemistrie order/demo CTAs, currently placeholders.
- Training/request links and lab support contact paths.

Issues:

- Ordering tools are useful, but spread across the page rather than organized as a single “Place / Track / Pay / Support” workflow.
- SpecCheck capabilities are under-explained relative to its actual value: order entry, real-time status, billing, invoices, live chat, and reporting.
- RxWizard and GoStock links do not include enough “when should I use this?” guidance.

### Pricing Resources

- G6 price list route.
- Price-list policies route.
- Request pricing guide CTAs.
- General policies page.

Issues:

- No clear “which price list applies to my lab/account?” explanation.
- No visible last-updated date or version metadata.
- No quick comparison between standard pricing, programs, and package pricing.

### Product Guides

- Artisan Designs PDFs.
- IOT portfolio, Camber, Neochromes, Endless, Essential, Office, centration resources.
- Tokai Select/Largo/Reset/Bi-AS/Tint guides.
- HOYA product and centration guides.
- Varilux and Crizal guides.
- Unity, SunSync, TechShield guides.
- Neurolens and Sequel resources.
- Shamir resources.
- Chemistrie guide.

Issues:

- Several vendor guides are invalid PDFs.
- Product resources are broad but inconsistent in completion and freshness.
- No comparison tool helps an OD or optician choose between comparable products.

### Training

- Training request email/CTA.
- Product videos via YouTube.
- Some vendor guides and whitepapers.

Issues:

- This is the thinnest major category compared with best-in-class portals.
- No training curriculum, searchable video library, CE library, certification tracks, staff onboarding path, or quiz/certificate structure.

### Programs

- Acquios-related pathways.
- UOA-related video/program content.
- Unity Rewards content.
- Safety program resources.
- Provider resources and reports.

Issues:

- Program eligibility, steps, and benefits are not unified in a single tracker or explainer.
- Practices need a “what do I qualify for and what should I do next?” view.

### Customer Service

- Lab customer service section.
- Phone/email/site contact information.
- Policies links.
- Contact support CTAs.

Issues:

- Good practical value, but should add expected response windows, issue-specific routing, redo/remake guidance, escalation path, and emergency/urgent order guidance.

### Practice Growth

- Acquios/experience CTAs.
- Some program and report resources.
- Partner/program cards.

Issues:

- Lacks marketing kits, patient communication assets, selling scripts, dispensing playbooks, ROI calculators, multiple-pair strategy resources, and social assets.

### Patient Education

- Some product/patient-facing vendor brochures.
- Neurolens and lens/product videos.

Issues:

- No dedicated patient handout library.
- No condition/use-case organization such as digital eye strain, headaches, kids/myopia, occupational safety, driving, computer lenses, premium progressives, AR coatings, photochromics.

### Frame Resources

- Modern frame book.
- ArmourRx frame book.
- ArtCraft frame book.
- DVX/WileyX frame book.
- SafeVision frame book.
- WileyX frame book.

Issues:

- Useful category, but no searchable frame inventory, sizing guidance, eligibility matrix, safety-program mapping, or ordering cheat sheet.

### Safety Resources

- Safety kit request.
- ArmourRx, SafeVision, ArtCraft, DVX/WileyX frame books.
- Safety-related program links.

Issues:

- Safety should become a guided mini-portal: employer setup, frame selection, compliance basics, form/request flow, FAQs, and reorder instructions.

### Technical Resources

- Centration charts.
- Layout charts.
- Fitting/dispensing guides.
- AR/coating resources.
- Comparison guide.

Issues:

- Strong potential category, but several resources are pending or invalid.
- No troubleshooting guides for non-adapt, remake, corridor/fitting, coating questions, tracing, frame/lens compatibility, or digital measurement best practices.

### Warranty / Policies

- Policies page.
- Price-list policy route.
- Some policy documents/assets elsewhere in the repo.

Issues:

- No warranty lookup, claim workflow, or one-page “what is covered?” matrix.
- Policies should be linked from relevant product/program cards, not only from a broad page.

### Downloads

- Large PDF library under `/files`.
- Product, frame, safety, and training downloads.

Issues:

- No resource search.
- No filters by category, vendor, product family, format, audience, or last updated.
- No “new/updated” badge.
- No PDF integrity/version audit process.

### Duplicate / Repeated Resources

- IOT Comparison Guide appears in multiple contexts.
- Pricing-guide request appears in multiple tool/card areas.
- Training request appears in multiple areas.
- Safety kit Typeform appears in multiple areas with slightly different source parameters.
- Unity/VSP resources appear across product and training contexts.
- Policy guide assets exist in multiple public directories, which may create future drift risk.

### Missing or Thin Categories

- CE and certification.
- Staff onboarding/training curriculum.
- Webinar library.
- Marketing kits/social media assets.
- Patient handouts.
- Lens recommendation/product comparison tools.
- ROI and program-value calculators.
- Warranty/remake lookup and workflows.
- Troubleshooting guides.
- Ordering cheat sheets.
- Program qualification trackers.
- Resource search/download center.

## 3. Competitive Resource Audit

| Company | Resource | Current ALN Coverage | Recommended Action |
| ------- | -------- | -------------------- | ------------------ |
| Shamir | Professional portal and country-specific resources | ALN links Shamir PDFs, but several Shamir PDF files are invalid | Replace invalid Shamir PDFs, link to Shamir professional portal where appropriate, and add ALN-specific dispensing cheat sheets |
| Tokai | Product category pages, product search, lens guides, high-index/specialty materials | ALN has several Tokai PDFs and they validate | Add “when to choose Tokai” decision guide and high-Rx dispensing guide |
| IOT | Product guides, Camber/Neochromes materials, technical resources | ALN coverage is relatively strong | Add interactive IOT lens comparison/fitting pathway and fix missing `#iot` anchor |
| Vision Source | Practice management, member services, marketing/supply-chain support | ALN has mission/program content but not comparable member-practice resource depth | Add practice-growth library and member-style benefits guide |
| Neurolens | Provider conversion, patient education, testimonials, media library, clinical data | ALN has Neurolens links, but the local provider brochure PDF is invalid | Replace invalid PDF and add patient handouts, posters, videos, and clinical-data links |
| Unity / VSP Optics | Product education, Unity Rewards, CE/training, services | ALN has Unity Rewards, V3, SunSync, TechShield resources, but several are invalid PDFs | Replace invalid PDFs and add a Unity quick-start path for staff |
| VSP | Provider Hub with practice support, promotions, marketing resources, education, personalized dashboard | ALN links related resources but lacks personalized dashboard/search | Build ALN provider dashboard concept: orders, pricing, resources, programs, support |
| Essilor | EssilorPRO portal with brand resources, product info, practice advertising, rewards progress | ALN includes Varilux/Crizal resources, but several are invalid PDFs | Replace invalid files, add Essilor-style one-stop dashboard and rewards/program progress views |
| HOYA | Knowledge center, LMS, training modules, business/practice growth resources | ALN has HOYA product/centration PDFs, but one HOYA PDF is invalid and several resources pending | Add HOYA learning links, product selection guide, and complete pending layout/AR resources |
| ZEISS | 24/7 academy, 60+ modules, webinars, CE/certificate-oriented training | ALN has no ZEISS-specific resource category and lacks comparable education depth | Add ZEISS vendor resource links if relevant and use ZEISS Academy as model for ALN training roadmap |
| GoStock | Stock lens ordering/login via Global Optics | ALN links GoStock, one link redirects to login | Clarify Global Optics vs direct login; add setup/use instructions |
| SpecCheck | Order entry, status tracking, billing, live chat, support articles, mobile access | ALN links SpecCheck but under-leverages explanation | Add “How to use SpecCheck with Artisan” hub and help links |
| RxWizard / DVI | Online Rx ordering, status reports, job archive, product availability | ALN links DVI but lacks setup docs | Add DVI setup guide, troubleshooting, and “which portal should I use?” matrix |
| ChemClip / Chemistrie | Clip system, order/demo workflows | ALN has Chemistrie placeholders and invalid PDF | Replace invalid PDF and complete order/demo forms |
| Safety Systems | Safety frame books and safety kit request | ALN has safety assets but not a cohesive program hub | Build safety mini-portal with employer workflow, compliance/eligibility, frame selection, and FAQs |
| Modern Package System | Package/program resources | ALN references package/resource concepts but lacks clear guided calculator | Add package comparison, ordering cheat sheet, and patient-benefit language |
| Modern Frame System | Frame book and frame resources | ALN has Modern frame book | Add searchable frame selector or at least frame-category filters and ordering notes |

### Competitive Source Notes

- EssilorPRO positions itself as a one-stop portal for brand resources, product information, practice profile updates, advertising, and rewards progress: https://www.essilorpro.com/en
- ZEISS offers professional education, online training modules, webinars, and certificates through ZEISS Vision Care Academy: https://www.zeiss.com/vision-care/us/eye-care-professionals/support/professional-training-education.html
- HOYA promotes professional knowledge, LMS-style training, sales/marketing topics, and practice growth resources: https://www.hoyavision.com/en-us/your-business-partner/grow-your-knowledge/
- VSP Optics exposes education, services, Unity products, and Unity Rewards: https://www.vspoptics.com/
- VSP Provider Hub describes practice support, provider news, promotions, marketing resources, and education: https://www.vspproviderhub.com/welcome
- Neurolens has a downloadable media/resource library with social assets, videos, patient education, practice management tools, marketing materials, and clinical data: https://library.neurolens.com/
- SpecCheck describes order entry, real-time statuses, payments, invoices, live chat, and support articles: https://www.speccheckrx.com/ and https://support.speccheckrx.com/en//
- DVI/RxWizard examples from labs emphasize online ordering, product availability, status reports, archived orders, and setup docs: https://www.gsrx.com/dvi
- Tokai publishes product-category and product-search resources for lenses and coatings: https://www.tokaiopt.com/en/product/
- Shamir has a professional portal entry point for opticians: https://pro.shamir.com/
- GoStock is presented by Global Optics as a stock-lens ordering/login resource: https://www.globalopticsinc.com/gostock

## 4. Missing Resource Opportunities

| Missing Category | Opportunity | Estimated Impact | Priority |
| ---------------- | ----------- | ---------------- | -------- |
| Resource search and filters | Let users search by vendor, product, category, format, and job-to-be-done | Very high | P0 |
| PDF integrity/version metadata | Show last updated date, owner, and verified status for every download | Very high | P0 |
| Ordering cheat sheets | Explain when to use SpecCheck, DVI, GoStock, portal, email, or lab support | High | P0 |
| Training library | Create video/article modules for onboarding, products, ordering, troubleshooting | High | P1 |
| CE/certification pathways | Build ALN Academy-style learning tracks; link vendor CE where available | High | P1 |
| Product comparison tool | Help staff choose lens designs, coatings, materials, and programs by patient need | Very high | P1 |
| Patient education library | Printable/shareable handouts by condition, product, and lifestyle | High | P1 |
| Marketing kits | Social posts, email copy, posters, premium lens talking points | Medium-high | P1 |
| Warranty/remake guide | Matrix for redo, warranty, scratch, non-adapt, and remake policies | High | P1 |
| Program qualification tracker | Show steps/status for Acquios, UOA, Safety, Unity Rewards, etc. | Medium-high | P2 |
| Webinar library | Host live and recorded training sessions | Medium | P2 |
| ROI calculators | Model premium lens, package, safety, or program impact | Medium | P2 |
| Troubleshooting guides | Provide practical support for fitting, adaptation, measurements, coating issues | High | P1 |
| Frame selector | Search/filter frame books by safety, brand, material, size, program | Medium | P2 |
| Practice manager dashboard | Personalized customer hub with resources, contacts, pricing, orders, tasks | Very high | P3 |

## 5. UX Evaluation

### First-Time Independent OD Perspective

The page feels professional, modern, and much more polished than a typical static lab resource page. The visual system is credible. The breadth of resources signals that ALN is trying to be useful, not merely promotional.

However, the experience is heavy. A first-time OD can find resources, but has to understand ALN’s internal categories, vendor names, program names, and lab workflows. The page is long, and many resources compete for attention. The lack of global search is the largest UX gap. For existing customers, the page should feel more like a working tool and less like a beautiful catalog.

### UX Scores

| Dimension | Score | Rationale |
| --------- | ----- | --------- |
| Information Architecture | 7/10 | Strong categories, but too many mixed resource types and repeated CTAs |
| Ease of Use | 6.5/10 | Good cards and sections, but too much scrolling and no universal search |
| Discoverability | 6/10 | Useful resources exist but are buried; placeholders reduce confidence |
| Mobile Experience | 6.5/10 | Responsive component patterns appear present, but page length and density are challenging |
| Professional Appearance | 8/10 | Strongest dimension; design language feels modern and premium |
| Customer Value | 7.5/10 | Valuable foundation, but broken/invalid PDFs and missing workflows limit usefulness |
| Overall | 7/10 | Attractive and broad, but not yet operationally best-in-class |

### UX Recommendations

- Add a prominent search bar: “Search resources, products, pricing, policies, training.”
- Add resource filters: Category, Vendor, File Type, Audience, Lab, Program.
- Add “Most Used” and “New / Updated” sections with verified resource badges.
- Split resource intent into clear paths: Order, Price, Learn, Sell, Support, Policies.
- Hide pending/placeholder resources from public view or mark them as “coming soon” only if the link does not look actionable.
- Add last-updated dates to every downloadable resource.
- Add compact mobile jump navigation sticky near top.
- Add a “Not sure where to start?” decision tree.

## 6. Best-In-Class Recommendations

### Quick Wins Under 1 Day

1. Replace or remove the 14 invalid PDF files.
2. Fix the missing `#iot` anchor.
3. Remove or complete all `href="#"` placeholder CTAs.
4. Hide visible `PDF Pending` cards until assets are ready.
5. Add a “Verified June 2026” or last-reviewed label to valid resources.
6. Clarify GoStock links: “Info / setup” vs “Direct login.”
7. Add a top-level “Most Used by Practices” row with ordering, pricing, policies, support, and training.
8. Add short helper copy for each ordering platform.

### Medium Improvements 1-2 Weeks

1. Build a searchable/filterable download center component.
2. Add a structured resource metadata file instead of hard-coded cards only.
3. Add vendor pages or filtered sections for IOT, Tokai, HOYA, Unity/VSP, Shamir, Essilor, Neurolens, Safety, Frames.
4. Create ordering cheat sheets for SpecCheck, DVI, GoStock, and lab support.
5. Create a patient education library with print/share/download assets.
6. Create a staff training library with video categories and completion paths.
7. Add a warranty/remake/policies matrix.
8. Add “recommend a lens/product” decision guides.
9. Add page-level analytics events for every resource click and download.
10. Add content freshness governance: owner, source, last verified, next review.

### Major Improvements Future Roadmap

1. Build an ALN Provider Dashboard with personalized pricing, order links, lab contacts, resource recommendations, and program status.
2. Launch ALN Academy with training tracks, quizzes, certificates, and vendor education links.
3. Build an interactive lens recommendation tool tied to ALN-supported products.
4. Build a program qualification tracker for Acquios, UOA, Safety, Unity Rewards, and future programs.
5. Build a warranty/remake self-service flow.
6. Add marketing asset kits modeled after Neurolens and EssilorPRO libraries.
7. Add customer-only gated resources while keeping public resources persuasive and accessible.
8. Add resource intelligence: most downloaded, recently updated, recommended for your lab/account.

## 7. Prioritized Action Plan

### P0: Repair Trust Breakers

- Replace invalid PDF files with real PDFs or convert destinations to HTML pages.
- Fix `#iot` anchor.
- Remove `href="#"` CTAs.
- Hide or complete `PDF Pending` resources.
- Re-run link/PDF validation after fixes.

### P1: Make Resources Easier to Use

- Add global search and filters.
- Add category landing blocks for Order, Price, Learn, Sell, Support, Policies.
- Add last-updated/verified metadata.
- Add ordering platform guidance.
- Add warranty/remake quick-reference content.

### P2: Build Competitive Differentiators

- Add patient handouts and marketing kits.
- Add product comparison and recommendation guides.
- Add training library and vendor education pathways.
- Add safety mini-portal.
- Add program benefit/qualification explainers.

### P3: Become Best-In-Class

- Build personalized provider dashboard.
- Launch ALN Academy.
- Add interactive calculators and qualification trackers.
- Add self-service warranty/remake flows.
- Add analytics-driven resource recommendations.

## Final Assessment

ALN has enough content and design quality to become the strongest independent eyecare resource center in the market, but it cannot claim that position while linked PDFs are invalid, placeholders are visible, and the page lacks search, training depth, patient education, and self-service workflows.

The near-term win is simple: make every current resource reliable. The strategic win is bigger: evolve Provider Resources from a beautiful page into a working professional portal that helps independent practices order faster, sell better, train staff, troubleshoot problems, and grow with ALN.
