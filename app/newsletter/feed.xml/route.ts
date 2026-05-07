const siteUrl = "https://preview.artisanslabs.com";

export const dynamic = "force-static";

const items = [
  {
    title: "Practice Matters: Spring Update",
    date: "Spring 2026",
    description:
      "A seasonal look at practice growth, network news, and the conversations shaping independent eye care.",
  },
  {
    title: "Product Spotlight: Tokai Thin Lens Options",
    date: "Coming Soon",
    description:
      "Product education and dispensing notes for helping patients understand advanced thin lens options.",
  },
  {
    title: "Building Stronger Independent Practices",
    date: "Coming Soon",
    description:
      "Ideas for strengthening practice control, improving margins, and building more resilient lab relationships.",
  },
  {
    title: "Lab Updates: Service, Turnaround, and Support",
    date: "Coming Soon",
    description:
      "Operational updates from the Artisan network, including service improvements and support reminders.",
  },
  {
    title: "Training Corner: Helping Opticians Explain Lens Options",
    date: "Coming Soon",
    description:
      "Practical language and team education ideas for clearer lens conversations at the dispensing table.",
  },
  {
    title: "Artisan Intel: Smarter Practice Reporting",
    date: "Coming Soon",
    description:
      "A preview of better reporting habits and the practice insights that help teams make confident decisions.",
  },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Artisan Lab Network Newsletter</title>
    <link>${siteUrl}/newsletter</link>
    <description>Updates, insights, and resources for independent eye care practices.</description>
    <language>en-us</language>
${items
  .map(
    (item, index) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${siteUrl}/${index === 0 ? "newsletters/practice-matters/issue-001" : "newsletter#upcoming"}</link>
      <guid isPermaLink="false">artisan-newsletter-${index + 1}</guid>
      <description>${escapeXml(item.description)}</description>
      <category>${escapeXml(item.date)}</category>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}
