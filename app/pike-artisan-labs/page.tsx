import LabLandingPage from "../components/LabLandingPage";
import { pikeLabConfig } from "../labConfigs";
import {
  createLabMetadata,
  createLabOrganizationJsonLd,
  serializeJsonLd,
} from "@/lib/siteMetadata";

const seo = {
  name: "Pike Artisan Labs",
  path: "/pike-artisan-labs",
  title: "Pike Artisan Labs | Indianapolis Optical Lab | Artisan Lab Network",
  description:
    "Pike Artisan Labs brings Midwestern reliability, modern production, and independent lab partnership together in Indianapolis.",
  logoPath: pikeLabConfig.logo,
  telephone: "+1-888-239-0303",
  email: "customerservice@pikeartisanlabs.com",
  address: {
    streetAddress: "8902 Vincennes Cir., Suite F",
    addressLocality: "Indianapolis",
    addressRegion: "IN",
    postalCode: "46268",
  },
  areaServed: "Midwestern United States",
};

export const metadata = createLabMetadata(seo);

export default function PikeArtisanLabsPage() {
  return (
    <div className="contents">
      <script
        id="pike-artisan-labs-organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createLabOrganizationJsonLd(seo)),
        }}
      />
      <LabLandingPage config={pikeLabConfig} />
    </div>
  );
}
