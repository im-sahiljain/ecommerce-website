import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { db } from "@/lib/db";
import type { Category } from "@/lib/db/types";
import { CatalogJsonLdScript } from "@/lib/catalogJsonLd";
import { siteShareImageUrl, siteUrl } from "@/lib/site";

const SEO_IMAGE = siteShareImageUrl();

type Props = { params: Promise<{ slug: string }> };

const loadCategory = cache(async (slug: string): Promise<Category | undefined> => {
  const categories = await db.getCategories();
  const bySlug = categories.find((item) => item.slug === slug);
  if (bySlug) {
    return bySlug.isVisible === false ? undefined : bySlug;
  }
  const byName = categories.find(
    (item) => item.name.toLowerCase() === slug.toLowerCase(),
  );
  if (!byName || byName.isVisible === false) return undefined;
  return byName;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description =
    category.description?.trim() ||
    `Shop ${category.name} plaster craft kits from Kits & Craft.`;
  const path = `/shop/${category.slug}`;

  return {
    title: category.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: category.name,
      description,
      url: `${siteUrl()}${path}`,
      images: [{ url: SEO_IMAGE, alt: category.name }],
    },
  };
}

export default async function CategoryShopPage({ params }: Props) {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-slate-800">
          Category not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          That category is not in the shop.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block font-bold text-pink-600 hover:text-pink-700"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const products = await db.getProducts();
  const items = products.filter(
    (product) =>
      product.isVisible !== false &&
      product.category.toLowerCase() === category.name.toLowerCase(),
  );

  return (
    <>
      <CatalogJsonLdScript name={category.name} items={items} />
      <ShopCatalog categoryName={category.name} />
    </>
  );
}
