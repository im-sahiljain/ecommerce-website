import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { productImages } from "@/components/product/types";
import { loadProductPage } from "@/lib/productPage";
import { shareImageUrl } from "@/lib/shareImage";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

function metaDescription(text: string | undefined, name: string) {
  const collapsed = (text ?? "").replace(/\s+/g, " ").trim();
  if (!collapsed) return `${name} plaster painting kit from Kits & Craft.`;
  return collapsed.slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await loadProductPage(id);
  if (!data) {
    return { title: "Product Not Found", robots: { index: false, follow: false } };
  }
  const description = metaDescription(
    data.seoDescription || data.detail.description,
    data.detail.name,
  );
  const path = `/product/${data.canonicalSlug}`;
  const title = data.seoTitle || data.detail.name;
  const image = shareImageUrl(data.detail.image);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${siteUrl()}${path}`,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: data.detail.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await loadProductPage(id);
  if (data && data.canonicalSlug !== id) {
    permanentRedirect(`/product/${data.canonicalSlug}`);
  }

  const images = data ? productImages(data.detail) : [];
  const jsonLd = data
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: data.detail.name,
        image: images.length > 0 ? images : [data.detail.image],
        description: data.detail.description,
        sku: data.detail.sku || data.detail.id,
        brand: { "@type": "Brand", name: "Kits & Craft" },
        category: data.detail.category,
        offers: {
          "@type": "Offer",
          url: `${siteUrl()}/product/${data.canonicalSlug}`,
          priceCurrency: "INR",
          price: data.detail.price,
          itemCondition: "https://schema.org/NewCondition",
          availability: data.detail.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <ProductDetailView key={id} id={id} initialProduct={data?.detail ?? null} />
    </>
  );
}
