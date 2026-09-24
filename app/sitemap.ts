import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { productPath, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  let productUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const products = await db.getProducts();
    if (Array.isArray(products)) {
      productUrls = products
        .filter((product) => product.isVisible !== false)
        .map((product) => ({
          url: `${siteUrl()}${productPath(product)}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }

    const packs = await db.getPacks();
    if (Array.isArray(packs)) {
      productUrls.push(
        ...packs.map((pack) => ({
          url: `${siteUrl()}${productPath(pack)}`,
          lastModified: pack.updatedAt ? new Date(pack.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
      );
    }

    const categories = await db.getCategories();
    if (Array.isArray(categories)) {
      categoryUrls = categories
        .filter((cat) => Boolean(cat.slug?.trim()) && cat.isVisible !== false)
        .map((cat) => ({
          url: `${siteUrl()}/shop/${cat.slug.trim()}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch (_) {}

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/bundles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/guides/plaster-painting-kits-for-kids`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/guides/birthday-return-gifts`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/guides/home-decor-figurines`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...productUrls,
    ...categoryUrls,
  ];
}
