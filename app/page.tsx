import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { HERO_IMAGE_SIZES, heroSrcSet } from "@/lib/heroImage";
import { siteLogoUrl, siteUrl } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

type HomeSearchParams = { [key: string]: string | string[] | undefined };

export default function Page({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Kits & Craft",
        url: siteUrl(),
        logo: siteLogoUrl(),
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
      <link
        rel="preload"
        as="image"
        type="image/avif"
        imageSrcSet={heroSrcSet("avif")}
        imageSizes={HERO_IMAGE_SIZES}
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage searchParams={searchParams} />
    </>
  );
}
