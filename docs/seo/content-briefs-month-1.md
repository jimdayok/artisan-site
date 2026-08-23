# Month 1 SEO Asset Selection and Briefs

Selected August 22, 2026

The first two assets are chosen to cover both sides of the current opportunity: a national commercial page for non-branded discovery and a local/entity package that protects and expands the three lab brands during migration.

## Asset 1 — Independent Optical Lab Decision Guide

### Working title

**Independent Optical Lab: What Independent Practices Should Expect**

### Recommended destination

Expand and refocus the existing preview route `/switch-to-artisan`. Do not create a second competing page for the same intent.

### Objective

Earn non-branded commercial discovery from independent eye care practices evaluating a lab relationship, then convert qualified readers into a conversation or an intentional account-opening click.

### Audience

- Independent optometrists and ophthalmologists.
- Practice owners and optical managers.
- Buyers dissatisfied with communication, turnaround consistency, product restrictions, or lack of support from a current lab.
- Prospects who are not yet familiar with Artisan Lab Network.

### Search intent

Commercial investigation moving toward a provider decision. The page should help a buyer evaluate any lab, then show—using verifiable evidence—where Artisan’s model fits.

### Keyword assignment

| Role | Targets |
|---|---|
| Primary | independent optical lab; switch optical labs |
| Secondary | independent wholesale optical lab; optical lab for independent optometrists; optical laboratory partner; how to choose an optical lab |
| Supporting questions | What should an independent practice expect from an optical lab? What questions should I ask a new lab? How do I change optical labs? What does lab independence mean? |

### Recommended metadata

- **Title:** Independent Optical Lab Guide | Switch to Artisan
- **H1:** What Independent Practices Should Expect From an Optical Lab
- **Meta description:** Evaluate optical lab quality, turnaround, product choice, communication, onboarding, and support—then see how Artisan serves independent eye care practices.

Final title/description length should be checked in the rendered build, not approved from character count alone.

### Core promise

Give the reader a practical evaluation framework. The page must not become an unsupported “we are better” claim sheet. Every performance number, ownership claim, domestic-production statement, certification, warranty, or comparison requires a named internal source and approval date.

### Outline

1. **Decision framing:** Your lab affects patient experience, staff time, cash flow, remake risk, and product choice.
2. **What “independent optical lab” should mean:** Define ownership, decision-making, vendor choice, and service implications in plain language. Avoid implying that every competitor uses the same structure.
3. **Eight evaluation criteria:**
   - Product and lens-design choice.
   - Quality-control process.
   - Turnaround definition and communication.
   - Remake and warranty handling.
   - Access to experienced support.
   - Ordering/system compatibility.
   - Staff education and provider resources.
   - Business alignment with independent practices.
4. **Questions to ask a prospective lab:** A scannable checklist a practice can use in a call.
5. **How switching works:** Discovery, product/pricing review, account setup, ordering setup, training, first-order monitoring, and escalation path. State only the workflow Artisan can actually deliver.
6. **How Artisan’s network model works:** One connected network, three regional labs, central resources, and lab-level contacts. Explain when work is local and when network support applies.
7. **Which Artisan lab should I contact?** Short Pike, Peak, Pacific summaries with service regions and links.
8. **Proof:** Approved operational metrics, short customer evidence, named capabilities, and response/escalation standards. Use methodology/date alongside metrics.
9. **FAQ:** Independent vs corporate, product choice, practice size, ordering, onboarding time, current-lab transition, geographic coverage.
10. **CTA:** Primary “Talk with Artisan” meeting/contact action; secondary “Open an Account.” A click begins an application and must not be described or measured as a completed account.

### Required internal links

- Homepage / network overview.
- Pike, Peak, and Pacific lab pages.
- `/artisan-model` for ownership interest.
- `/provider-resources` for partner support proof.
- `/optical-engineering` for complex-Rx support.
- `/artisan-ar` and the future Tokai hub where relevant.
- New-account destination and meeting/contact action.

### Conversion measurement

| Action | Event | Required context |
|---|---|---|
| Successful contact/consultation form | `generate_lead` | `lead_type=sales_inquiry`, `form_name`, `lab_name=Network`, `site_version`, source page |
| Meeting scheduler click/completion | `schedule_meeting` | meeting type, destination URL, `lab_name=Network`, `site_version` |
| New-account start click | `open_account` | destination URL, `lab_name=Network`, `site_version` |
| Business phone click | `click_phone` | displayed business destination, source page, `lab_name=Network`, `site_version` |

### Structured data

- BreadcrumbList if breadcrumbs are visible.
- FAQPage only if the exact questions and answers are visible and the page remains eligible under current Google policies; do not expect a guaranteed rich result.
- Organization references should point to the network entity on `www.artisanlabnetwork.com`.

### SME/source checklist

Before drafting final claims, obtain approved answers to:

1. What legally and operationally makes Artisan independent or doctor-owned?
2. Which lens designs, manufacturers, materials, coatings, and specialty jobs can each lab support?
3. How is turnaround calculated, over what date range, and what exclusions apply?
4. What quality metric is available, and what exactly is its numerator/denominator?
5. What happens during onboarding and who owns each handoff?
6. Which ordering systems and integrations are currently supported?
7. What service regions and shipping arrangements can be stated publicly?
8. Which customer quotes are approved for web use?

### Acceptance criteria

- One visible H1 and self-canonical production URL.
- 1,500–2,200 useful words after SME proof is added; no padding to hit a count.
- At least one approved proof element in each of quality, service, and practice support.
- Clear comparison language without naming or disparaging a competitor.
- Primary CTA works, and failed form submissions do not fire a lead.
- Links to all three labs and at least three relevant capability/resource pages.
- Passes legal/leadership claim review, accessibility review, crawl check, and event validation.

## Asset 2 — Pike, Peak, and Pacific Location Authority Package

### Working title

**Three Labs, Three Local Search Destinations**

### Destinations

- `/pacific-artisan-labs`
- `/peak-artisan-labs`
- `/pike-artisan-labs`

This is one coordinated asset package with three separately indexable pages. The preview implementation already supplies strong visual/content foundations, H1s, 900–1,000+ rendered words, contact details, and organization schema. The work is refinement, verification, migration protection, and local search completeness—not a rewrite from zero.

### Objective

Protect existing brand traffic, expand non-branded regional discovery, clarify each lab’s entity/location, and drive conversations or account intent attributed to the correct lab.

### Audience

- Eye care practices searching for a lab by name.
- Practices seeking a regional or independent lab in the Pacific Northwest, Colorado/Mountain West, or Indiana/Midwest.
- Existing customers looking for contact, resources, or account access.

### Page assignments

| Page | Primary targets | Supporting targets | Current GSC baseline |
|---|---|---|---|
| Pacific | Pacific Artisan Labs; optical lab Portland Oregon | independent optical lab Pacific Northwest; wholesale optical lab Oregon | 254 page clicks / 2,505 impressions; exact-name query position 3.0 |
| Peak | Peak Artisan Labs; optical lab Aurora Colorado | optical lab Denver; independent optical lab Colorado; optical lab Mountain West | 62 page clicks / 1,804 impressions; exact-name query position 1.5 |
| Pike | Pike Artisan Labs; optical lab Indianapolis | independent optical lab Indiana; wholesale optical lab Indiana; optical lab Midwest | 50 page clicks / 1,334 impressions; exact-name query position 2.9 |

### Required shared structure

1. **Lab name + service location H1:** Keep brand first and make the region explicit without stuffing.
2. **Who the lab serves:** Independent-practice audience, public service region, and account-fit statement.
3. **Verified local contact:** Name, street address where public, business phone, business email, hours if approved, and maps link.
4. **Capabilities:** Only products/processes available to that lab; distinguish network-access capabilities from on-site capabilities.
5. **People and expertise:** Link to the relevant Meet the Artisans anchor; add credentials only when verified.
6. **Operational proof:** Approved turnaround, quality, service, or capability evidence with scope and date.
7. **Practice support:** Ordering, training, resources, troubleshooting, and escalation route.
8. **Regional context:** Describe the service area and shipping/service model without fake local-city pages.
9. **FAQ:** Account fit, geography, shipping, ordering, support, products, and onboarding.
10. **CTA:** Contact this lab; open an account; view provider resources.

### Lab-specific proof and questions

#### Pacific — Portland, Oregon

- Verify public address: 12302 NE Marx St., Portland, OR 97230.
- Verify public phone: 877-390-6900.
- Confirm which capabilities are physically performed in Portland versus accessible through the network.
- Confirm the approved Pacific Northwest service-area wording.
- Identify one approved example of Pacific craft/quality and one customer-service proof point.

#### Peak — Aurora / Denver, Colorado

- Verify public address: 3568 Peoria St., Suite 608, Aurora, CO 80010.
- Verify whether search copy should say Aurora, Denver metro, or both; use the physical city accurately.
- Verify public phone: 833-690-4321.
- Confirm Mountain West service coverage and any local delivery/shipping statements.
- Identify one approved Peak production/capability proof and one practice-support proof point.

#### Pike — Indianapolis, Indiana

- Verify public address: 8902 Vincennes Cir., Suite F, Indianapolis, IN 46268.
- Verify public phone: 888-239-0303.
- Confirm Midwest service coverage and any local delivery/shipping statements.
- Identify one approved Pike production/capability proof and one practice-support proof point.
- Review Singer Optical and Frecker Optical SERPs for differentiators Pike can substantiate rather than copy.

### Metadata pattern

Use a human-edited pattern, not identical templates:

- **Pacific title:** Pacific Artisan Labs | Portland Optical Lab | Artisan
- **Peak title:** Peak Artisan Labs | Aurora & Denver Optical Lab | Artisan
- **Pike title:** Pike Artisan Labs | Indianapolis Optical Lab | Artisan

Descriptions should name the lab, accurate geography, independent-practice audience, and one verified differentiator. Avoid repeating the same network description across all three.

### Entity and local technical requirements

- Production canonical and all JSON-LD entity URLs must use `https://www.artisanlabnetwork.com`.
- Use the most specific honest schema type. `Organization` is safe; adopt `LocalBusiness` only after confirming public-facing business details and policy fit.
- Unique `@id` per lab; each lab’s `memberOf` links to the network entity.
- Address, phone, business name, and URL must match the website and the corresponding Google Business Profile.
- Add GeoCoordinates only from a verified source; do not infer coordinates from an address.
- Keep one stable production URL per lab and avoid city doorway pages.

### Migration map

| Live URL | New URL | Rule |
|---|---|---|
| `/pacificartisanlabs` | `/pacific-artisan-labs` | One-hop permanent 301; preserve query strings where safe |
| `/peak-artisan-labs` | `/peak-artisan-labs` | Same path; replace content in place |
| `/pikeartisanlabs` | `/pike-artisan-labs` | One-hop permanent 301; preserve query strings where safe |

Update all internal links, sitemap entries, canonical URLs, and Google Business Profile website destinations to the final new paths. Do not redirect the old lab URLs to the homepage.

### Conversion measurement

Each page must automatically set `lab_name` to Pacific, Peak, or Pike for:

- `generate_lead`
- `open_account`
- `schedule_meeting`
- `click_phone`
- `click_email`
- `resource_view` and `resource_download` reached from lab-specific context where technically retained

### Internal linking

- Homepage network section → each lab.
- Each lab → `/switch-to-artisan`, `/provider-resources`, `/optical-engineering`, `/artisan-ar`, Meet the Artisans anchor, and new-account action.
- Relevant product/resource pages → appropriate lab pages only where service/capability relevance is verified.
- Do not cross-link every page mechanically; links should help a practice choose or act.

### Acceptance criteria

- All three pages return 200, are indexable only on production, and self-canonical on `www.artisanlabnetwork.com`.
- Old Pacific and Pike URLs redirect in one hop to their exact new page.
- One H1, unique title, unique description, and unique substantive copy on each page.
- Organization/entity data matches approved public contact facts and Google Business Profiles.
- All displayed phone, email, map, contact, account, and resource actions work and fire the correct contextual event once.
- Search Console URL Inspection passes after launch; sitemap contains the three final URLs only.
- Baseline metrics above are retained in reporting so migration performance can be judged page by page.

## Production Sequence

1. Secure SME answers and approval for all measurable or ownership claims.
2. Correct the production host/canonical framework.
3. Draft and review Asset 1 while verifying the three location pages.
4. Implement the lab redirect map and internal links in the launch candidate.
5. Validate crawl, structured data, accessibility, and analytics events.
6. Publish with the new sitemap and monitor Search Console at 3, 7, 14, and 28 days.
