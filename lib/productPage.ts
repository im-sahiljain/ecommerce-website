import { cache } from "react";
import { db, type Product } from "@/lib/db";
import { packToProduct, type ProductDetail } from "@/components/product/types";

export type ProductPageData = {
  detail: ProductDetail;
  canonicalSlug: string;
  seoTitle?: string;
  seoDescription?: string;
};

function productToDetail(product: Product): ProductDetail {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    theme: product.theme,
    category: product.category,
    ageGroup: product.ageGroup,
    productLineId: product.productLineId,
    isVisible: product.isVisible,
    isNonToxic: product.isNonToxic,
    image: product.image,
    images: product.images,
    description: product.description,
    inStock: product.inStock,
    isOrderingEnabled: product.isOrderingEnabled,
    badge: product.badge,
    isNewLaunch: product.isNewLaunch,
    isSellingFast: product.isSellingFast,
    size: product.size,
    material: product.material,
    attributes: product.attributes,
    likesCount: product.likesCount,
  };
}

function includedProduct(product: Product): ProductDetail {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    description: product.description,
    inStock: product.inStock,
    theme: product.theme,
    category: product.category,
    ageGroup: product.ageGroup,
    isNonToxic: product.isNonToxic,
  };
}

export const loadProductPage = cache(async (param: string): Promise<ProductPageData | null> => {
  const product = (await db.getProductBySlug(param)) ?? (await db.getProductById(param));
  if (product) {
    if (product.isVisible === false) return null;
    return {
      detail: productToDetail(product),
      canonicalSlug: product.slug || product.id,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    };
  }

  const pack = (await db.getPackBySlug(param)) ?? (await db.getPackById(param));
  if (!pack) return null;

  const catalog = await db.getProducts();
  const included = catalog
    .filter((item) => pack.productIds.includes(item.id))
    .map(includedProduct);

  return {
    detail: packToProduct(pack, included),
    canonicalSlug: pack.slug || pack.id,
    seoTitle: pack.seoTitle,
    seoDescription: pack.seoDescription,
  };
});
