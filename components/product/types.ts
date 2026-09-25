import type { KitOffer } from "@/lib/kit";

export interface ProductDetail {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  isVisible?: boolean;
  isNonToxic: boolean;
  image: string;
  images?: string[];
  gallery?: import("@/lib/gallery").ProductGallery;
  description: string;
  inStock: boolean;
  isOrderingEnabled?: boolean;
  badge?: string;
  isNewLaunch?: boolean;
  isSellingFast?: boolean;
  size?: string;
  material?: string;
  attributes?: Record<string, string>;
  kitOffer?: KitOffer;
  isPack?: boolean;
  includedProducts?: ProductDetail[];
  likesCount?: number;
}

export interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  isWhatsappOrderingEnabled?: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export function productImages(product: ProductDetail) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images;
  return product.image ? [product.image] : [];
}

export function packToProduct(
  pack: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    description?: string;
    inStock?: boolean;
    productIds?: string[];
    kitOffer?: KitOffer;
  },
  included: ProductDetail[],
): ProductDetail {
  const comboImages = [
    ...(pack.image ? [pack.image] : []),
    ...included.map((item) => item.image).filter(Boolean),
  ];
  return {
    id: pack.id,
    name: pack.name,
    price: Number(pack.price),
    originalPrice: pack.originalPrice ? Number(pack.originalPrice) : undefined,
    theme: "Curated Kit",
    category: `Kit of ${pack.productIds?.length || 1}`,
    ageGroup: "All Ages",
    isNonToxic: true,
    image:
      comboImages[0] ||
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
    images: Array.from(new Set(comboImages)),
    description: pack.description || "",
    inStock: pack.inStock !== false,
    isOrderingEnabled: true,
    isPack: true,
    includedProducts: included.map((item) => ({ ...item, kitOffer: undefined })),
    kitOffer: pack.kitOffer,
  };
}

