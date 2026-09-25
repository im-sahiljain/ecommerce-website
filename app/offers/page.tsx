import type { Metadata } from "next";
import OffersPage from "@/components/offers/OffersPage";
import { siteShareImageUrl, siteUrl } from "@/lib/site";

const SEO_IMAGE = siteShareImageUrl();

const title = "Bulk Discount Offers";
const description =
  "Build a bulk discount offer for plaster craft kits and POP painting kits at Kits & Craft.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/offers" },
  openGraph: {
    title,
    description,
    url: `${siteUrl()}/offers`,
    images: [{ url: SEO_IMAGE, alt: title }],
  },
};

export default function Page() {
  return <OffersPage />;
}
