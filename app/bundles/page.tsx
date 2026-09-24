import type { Metadata } from "next";
import BundlesPage from "@/components/bundles/BundlesPage";
import { siteUrl } from "@/lib/site";

const SEO_IMAGE =
  process.env.NEXT_PUBLIC_SEO_IMAGE_URL ||
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1785413297/indian-kids-painting_zcbcf2.jpg";

const title = "Mix & Match Craft & Candle Bundles";
const description =
  "Build a plaster craft bundle for birthday return gifts and family painting sets at Kits & Craft.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bundles" },
  openGraph: {
    title,
    description,
    url: `${siteUrl()}/bundles`,
    images: [{ url: SEO_IMAGE, alt: title }],
  },
};

export default function Page() {
  return <BundlesPage />;
}
