import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { db } from "@/lib/db";
import { CatalogJsonLdScript } from "@/lib/catalogJsonLd";
import { siteUrl } from "@/lib/site";

const SEO_IMAGE =
  process.env.NEXT_PUBLIC_SEO_IMAGE_URL ||
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1785413297/indian-kids-painting_zcbcf2.jpg";

const title = "Shop Plaster Painting Kits";
const description =
  "Browse ready-to-paint plaster figurines, kids craft kits, and birthday return gift boxes from Kits & Craft.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/shop" },
  openGraph: {
    title,
    description,
    url: `${siteUrl()}/shop`,
    images: [{ url: SEO_IMAGE, alt: title }],
  },
};

type ShopSearchParams = { [key: string]: string | string[] | undefined };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const category = params.category;
  if (typeof category === "string") {
    const categories = await db.getCategories();
    const match = categories.find(
      (item) =>
        item.isVisible !== false &&
        (item.slug === category ||
          item.name.toLowerCase() === category.toLowerCase()),
    );
    const slug = match?.slug?.trim();
    if (slug) {
      const next = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (key === "category" || value == null) continue;
        if (Array.isArray(value)) {
          for (const item of value) next.append(key, item);
        } else {
          next.append(key, value);
        }
      }
      const qs = next.toString();
      permanentRedirect(qs ? `/shop/${slug}?${qs}` : `/shop/${slug}`);
    }
  }

  const [products, packs] = await Promise.all([db.getProducts(), db.getPacks()]);
  const items = [
    ...products.filter((product) => product.isVisible !== false),
    ...packs,
  ];

  return (
    <>
      <CatalogJsonLdScript name={title} items={items} />
      <ShopCatalog />
    </>
  );
}
