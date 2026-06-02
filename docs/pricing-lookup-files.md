Pricing lookup spreadsheets
==========================

Purpose
-------
The pricing generator requires a small set of authoritative lookup spreadsheets that map internal DVI codes to human-friendly product, material, and AR names. These files are required at build time and must be present in CI (Vercel) for `npm run pricing:generate` to succeed.

Tracked files
-------------
- `private-source/portal/lookup_docs/Lookup.xlsx`
- `private-source/portal/lookup_docs/Lookup_Mat.xlsx`
- `private-source/portal/lookup_docs/Lookup_AR.xlsx`

Notes
-----
- The repository's `.gitignore` excludes `private-source/` by default. These three lookup files are intentionally whitelisted and are therefore tracked in Git to ensure builds succeed in CI.
- Do NOT add other private data files to Git. If you need to add more private build-time data, consult the repo owner before committing.

CI / Vercel
-----------
Vercel builds will now have the lookup spreadsheets available because they are tracked in the repo. If these files need updating, edit them locally and commit; do not embed secrets in these spreadsheets.
