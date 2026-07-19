# Practice Matters newsletter staging

Future issues are written as normal Next.js routes but protected by a server-only preview gate.

## Draft routes

- Editorial staging room: `/newsletters/practice-matters/staging`
- Issue 002: `/newsletters/practice-matters/issue-002`
- Issue 003: `/newsletters/practice-matters/issue-003`

During local development, these routes are available automatically. In a production build, they call `notFound()` unless `NEWSLETTER_DRAFT_PREVIEW=true` is present in the server environment. Draft pages also use `noindex, nofollow` metadata and are not linked from the public newsletter archive.

## Recommended deployment setup

1. Keep `NEWSLETTER_DRAFT_PREVIEW` unset in the Production environment.
2. Set `NEWSLETTER_DRAFT_PREVIEW=true` only in the Preview environment used by the editorial team.
3. Enable the hosting provider's preview-deployment access protection when drafts should be limited to signed-in reviewers.
4. Share the protected preview deployment's staging-room URL internally for review.
5. Revise copy and layout in the issue page until approved.

The flag is intentionally not prefixed with `NEXT_PUBLIC_`, so it remains server-only.

## Publishing an approved issue

1. Complete editorial, product, date, link, and image review.
2. Move the issue from the draft renderer to the published issue pattern, or remove its `canPreviewNewsletterDrafts()` guard.
3. Add the issue to the public `/newsletter` landing page and `/newsletters` archive.
4. Confirm the issue metadata no longer says `Draft` and allows normal indexing.
5. Test the issue on desktop and mobile, then commit and deploy.

Do not enable `NEWSLETTER_DRAFT_PREVIEW` in Production. The preview flag is for reviewing unfinished content, not for launching it.
