import type { Metadata } from "next";

export const PUBLIC_SITE_URL = "https://www.artisanslabs.com";

export function absoluteSiteUrl(path = "/") {
  return new URL(path, `${PUBLIC_SITE_URL}/`).toString();
}

type PostalAddress = {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
};

type LabSeoDetails = {
  name: string;
  path: string;
  title: string;
  description: string;
  logoPath: string;
  telephone: string;
  email: string;
  address: PostalAddress;
  areaServed: string;
};

export function createLabMetadata(details: LabSeoDetails): Metadata {
  return {
    title: details.title,
    description: details.description,
    alternates: {
      canonical: details.path,
    },
    openGraph: {
      type: "website",
      siteName: "Artisan Lab Network",
      title: details.title,
      description: details.description,
      url: details.path,
      images: [
        {
          url: details.logoPath,
          alt: `${details.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: details.title,
      description: details.description,
      images: [details.logoPath],
    },
  };
}

export function createLabOrganizationJsonLd(details: LabSeoDetails) {
  const pageUrl = absoluteSiteUrl(details.path);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${pageUrl}#organization`,
    name: details.name,
    url: pageUrl,
    description: details.description,
    logo: absoluteSiteUrl(details.logoPath),
    telephone: details.telephone,
    email: details.email,
    address: {
      "@type": "PostalAddress",
      ...details.address,
      addressCountry: "US",
    },
    areaServed: details.areaServed,
    memberOf: {
      "@type": "Organization",
      "@id": `${absoluteSiteUrl("/")}#organization`,
      name: "Artisan Lab Network",
      url: absoluteSiteUrl("/"),
    },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
