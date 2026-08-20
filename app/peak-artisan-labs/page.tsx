import LabLandingPage from "../components/LabLandingPage";
import { peakLabConfig } from "../labConfigs";
import {
  createLabMetadata,
  createLabOrganizationJsonLd,
  serializeJsonLd,
} from "@/lib/siteMetadata";

const seo = {
  name: "Peak Artisan Labs",
  path: "/peak-artisan-labs",
  title: "Peak Artisan Labs | Denver Optical Lab | Artisan Lab Network",
  description:
    "Peak Artisan Labs delivers premium lens technology, sharp service, and independent lab partnership from Denver, Colorado.",
  logoPath: peakLabConfig.logo,
  telephone: "+1-833-690-4321",
  email: "customerservice@peakartisanlabs.com",
  address: {
    streetAddress: "3568 Peoria St., Suite 608",
    addressLocality: "Aurora",
    addressRegion: "CO",
    postalCode: "80010",
  },
  areaServed: "Colorado and the Mountain West",
};

export const metadata = createLabMetadata(seo);

export default function PeakArtisanLabsPage() {
  return (
    <div className="contents">
      <script
        id="peak-artisan-labs-organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createLabOrganizationJsonLd(seo)),
        }}
      />
      <LabLandingPage config={peakLabConfig} />
    </div>
  );
}
