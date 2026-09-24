import type { Metadata } from "next";
import OffersPage from "@/components/offers/OffersPage";
import { siteUrl } from "@/lib/site";

const SEO_IMAGE =
  process.env.NEXT_PUBLIC_SEO_IMAGE_URL ||
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1785413297/indian-kids-painting_zcbcf2.jpg";

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
