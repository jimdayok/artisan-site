Pricing lookup spreadsheets
==========================

Purpose
-------
The pricing generator requires a small set of authoritative lookup spreadsheets that map internal DVI codes to human-friendly product, material, and AR names. The master product lookup workbook is `private-source/price-lists/Lookup.xlsx`, and the pricing pipeline validates and snapshots lookup data during `npm run build:pricing`.

Tracked files
-------------
- `private-source/price-lists/Lookup.xlsx`
- `private-source/portal/lookup_docs/Lookup_Mat.xlsx`
- `private-source/portal/lookup_docs/Lookup_AR.xlsx`
- `lib/pricing/generated/lookupData.json`

Notes
-----
- The repository's `.gitignore` excludes `private-source/` by default. These lookup files are intentionally whitelisted and are therefore tracked in Git to ensure builds succeed in CI.
- Do NOT add other private data files to Git. If you need to add more private build-time data, consult the repo owner before committing.

CI / Vercel
-----------
Vercel builds will have the lookup spreadsheets available because they are tracked in the repo. If these files need updating, edit them locally and commit; do not embed secrets in these spreadsheets.

Workflow
--------
1. Update `private-source/price-lists/Lookup.xlsx`.
2. Run `npm run build:pricing`.
3. Review regenerated lookup and pricing artifacts.
