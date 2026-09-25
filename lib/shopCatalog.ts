import { cache } from "react";
import { db } from "@/lib/db";

export type ShopCatalogProduct = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  isNonToxic: boolean;
  image: string;
  description: string;
  inStock: boolean;
  likesCount?: number;
  featured?: boolean;
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  attributes?: Record<string, string>;
  isVisible?: boolean;
};

export type ShopCatalogPack = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  image?: string;
  productIds?: string[];
  productLineId?: string;
  category?: string;
  inStock?: boolean;
  featured?: boolean;
};

export type ShopCatalogLine = {
  id: string;
  name: string;
  slug: string;
  isVisible?: boolean;
};

export const loadShopCatalog = cache(async () => {
  const [products, packs, productLines] = await Promise.all([
    db.getProducts(),
    db.getPacks(),
    db.getProductLines(),
  ]);

  const visibleProducts: ShopCatalogProduct[] = [];
  for (const product of products) {
    if (product.isVisible === false) continue;
    const scent = product.attributes?.Scent;
    visibleProducts.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      originalPrice:
        product.originalPrice != null
          ? Number(product.originalPrice)
          : undefined,
      theme: product.theme,
      category: product.category,
      ageGroup: product.ageGroup,
      productLineId: product.productLineId,
      isNonToxic: product.isNonToxic,
      image: product.image,
      description: product.description || "",
      inStock: product.inStock,
      likesCount: product.likesCount,
      featured: product.featured,
      badge: product.badge,
      isNewLaunch: product.isNewLaunch,
      isSellingFast: product.isSellingFast,
      attributes: scent ? { Scent: scent } : undefined,
      isVisible: true,
    });
  }

  const catalogPacks: ShopCatalogPack[] = packs.map((pack) => ({
    id: pack.id,
    slug: pack.slug,
    name: pack.name,
    price: Number(pack.price),
    originalPrice:
      pack.originalPrice != null ? Number(pack.originalPrice) : undefined,
    description: pack.description || "",
    image: pack.image,
    productIds: pack.productIds || [],
    productLineId: pack.productLineId,
    inStock: pack.inStock !== false,
    featured: pack.featured,
  }));

  const lines: ShopCatalogLine[] = productLines.map((line) => ({
    id: line.id,
    name: line.name,
    slug: line.slug,
    isVisible: line.isVisible,
  }));

  return {
    products: visibleProducts,
    packs: catalogPacks,
    productLines: lines,
    jsonLdItems: [
      ...catalogPacks.map((pack) => ({
        id: pack.id,
        name: pack.name,
        slug: pack.slug,
      })),
      ...visibleProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
      })),
    ],
  };
});
