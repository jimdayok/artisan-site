export function canPreviewNewsletterDrafts() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEWSLETTER_DRAFT_PREVIEW === "true"
  );
}
