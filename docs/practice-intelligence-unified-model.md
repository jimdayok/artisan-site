# Practice Intelligence Center Unified Acct ID Model

## Unified Data Model

All account intelligence files are treated as one account dataset keyed by `Acct ID`. The generator reads:

- `private-source/portal/acct_data_1.xlsx`
- `private-source/portal/acct_data_2.xlsx`
- `private-source/portal/acct_data_3.xlsx`

`private-source/portal/user_data.xlsx` is the portal login and user-access feed. The current snapshot collapses 850 account-source rows into 281 unified account profiles. Each account JSON includes one record per `Acct ID`; duplicate account rows are merged into `supplemental_intelligence`, `purchase_summary`, `product_mix`, `program_usage`, `quality_metrics`, `program_enrollment`, and `data_lineage`.

## Field Precedence

`Acct ID` is the master key. When the same field appears in more than one file, the generator keeps one value and records the source in `data_lineage.field_precedence`.

Precedence is:

1. `acct_data_3.xlsx`
2. `acct_data_2.xlsx`
3. `acct_data_1.xlsx`

Revenue stays account-level only: `PPM Sales`, `PM Sales`, and `CM Sales`. Product, brand, material, specialty, program, reward, quality, and turnaround sections use counts, percentages, statuses, or timing fields.

## Discovered Fields

The generated manifest at `private-source/portal/dashboard-v1/current/latest_snapshot_manifest.json` contains the full data dictionary in `data_dictionary`.

Discovered field groups:

- Account profile: business name, account numbers, address, division, latest ship date, lab, phone, state, price lists, tier, data refresh date.
- Account revenue and jobs: PPM/PM/CM jobs, sales, NL jobs/SOW, SQL jobs, VSP jobs/SOW.
- Quality: non-adapt %, warranty redo %, office redo %, lab redo % for PPM/PM/CM.
- Brand usage: Hoya, Shamir, Tokai, Varilux, Neurolens, Sequel, IOT Artisan counts.
- Material usage: Plastic, Trivex, high-index 1.60, 1.67, 1.74 counts.
- Specialty usage: Photochromic, Polarized, Multiple Pairs counts.
- Turnaround: PPM/PM/CM average turnaround time.
- Rewards: ARPMP26 qualified PMP jobs/rebate, ARUTY26 qualified jobs/rewards, ARSQL26 qualified Sequel PAL jobs/rebate.

## Portal Sections Updated

- Overview now uses unified account facts, CM/PM/PPM sales, CM/PM/PPM jobs, tier, lab, last ship date, and data refresh date.
- Brand Intelligence uses actual monthly brand job counts when present.
- Material Intelligence uses actual monthly material job counts when present.
- Specialty Product Usage uses actual photochromic, polarized, and multiple-pair counts when present.
- Program Intelligence shows Modern Package, Modern Frame, ChemClip, SpecCheck, and Tokai status only from usage fields.
- Quality & Service shows warranty, office redo, lab redo, and non-adapt percentages.
- Turnaround Performance uses real PPM/PM/CM average turnaround time.
- Rewards Center is hidden unless an account is enrolled in a specific reward program.

## Rewards Visibility

Rewards render only when the unified account record has the matching enrollment flag:

- `ARPMP26`: `Is Enrolled in ARPMP26 Display = TRUE`; shows qualified PMP jobs and rebate total.
- `ARUTY26`: `Is Enrolled in ARUTY26 Display = TRUE`; shows qualified jobs and rewards earned.
- `ARSQL26`: `Is ARSQL26 Customer = TRUE` or reward-qualified Sequel PAL activity exists; shows qualified Sequel PAL jobs and rebate total.

The snapshot currently includes Webb Eyecare Group (`WEBB-PDX`) as an `ARSQL26` participant. Empty, available, advertised, and coming-soon rewards cards are not rendered.

## Admin Opportunity Rules

The admin dashboard now flags accounts from unified month-over-month data:

- Sales down MoM
- Jobs down MoM
- JPD down MoM where JPD exists
- Neurolens decline
- Sequel decline
- Warranty increase
- Office redo increase
- Lab redo increase
- Non-adapt increase
- Turnaround deterioration
- No current activity after prior-month activity

## Remaining Placeholders

These remain labeled placeholders because no safe source field exists yet:

- Benchmarking Coming Soon
- Network Comparisons Coming Soon
- Additional Product Intelligence Coming Soon when a specific account lacks count fields
- Launch-grade practice performance score inputs beyond the current preview framework

## Future Enhancements

Fields still unavailable or incomplete for stronger customer intelligence:

- Customer-safe benchmark rollups and peer network comparison definitions.
- Complete current/prior reward totals for every reward month, not only fields supplied in the current files.
- Full material trend coverage for every material in all three months.
- Order-level lens category mix such as PAL, SV, lined multifocal, and occupational.
- Admin-owned customer success notes and outreach dispositions.
