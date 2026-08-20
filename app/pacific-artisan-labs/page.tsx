import LabLandingPage from "../components/LabLandingPage";
import { pacificLabConfig } from "../labConfigs";
import {
  createLabMetadata,
  createLabOrganizationJsonLd,
  serializeJsonLd,
} from "@/lib/siteMetadata";

const seo = {
  name: "Pacific Artisan Labs",
  path: "/pacific-artisan-labs",
  title: "Pacific Artisan Labs | Portland Optical Lab | Artisan Lab Network",
  description:
    "Pacific Artisan Labs supports independent practices from Portland with premium lens production, thoughtful service, and Pacific Northwest craft.",
  logoPath: pacificLabConfig.logo,
  telephone: "+1-877-390-6900",
  email: "customerservice@pacificartisanlabs.com",
  address: {
    streetAddress: "12302 NE Marx St.",
    addressLocality: "Portland",
    addressRegion: "OR",
    postalCode: "97230",
  },
  areaServed: "Pacific Northwest",
};

export const metadata = createLabMetadata(seo);

export default function PacificArtisanLabsPage() {
  return (
    <div className="contents">
      <script
        id="pacific-artisan-labs-organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createLabOrganizationJsonLd(seo)),
        }}
      />
      <LabLandingPage config={pacificLabConfig} />
    </div>
  );
}
