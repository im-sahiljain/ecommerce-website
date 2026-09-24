import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Kits & Craft",
        url: siteUrl(),
        logo:
          process.env.NEXT_PUBLIC_SEO_IMAGE_URL ||
          "https://res.cloudinary.com/dagkrnoap/image/upload/v1785413297/indian-kids-painting_zcbcf2.jpg",
      },
      {
        "@type": "WebSite",
        name: "Kits & Craft",
        url: siteUrl(),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage />
    </>
  );
}
