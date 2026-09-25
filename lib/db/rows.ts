import { normalizeGallery, type ProductGallery } from '@/lib/gallery';
import { normalizeKit, type PaintColor, type ProductKit } from '@/lib/kit';
import type { Pack, Product } from './types';

export function parseBoolean(val: any, defaultVal = true): boolean {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'false' || s === 'f' || s === '0' || s === 'off') return false;
    if (s === 'true' || s === 't' || s === '1' || s === 'on') return true;
  }
  if (typeof val === 'number') return val !== 0;
  return Boolean(val);
}

function parseProductImages(r: any): string[] {
  let parsedImages: string[] = [];
  if (r.images) {
    if (Array.isArray(r.images)) {
      parsedImages = r.images;
    } else if (typeof r.images === 'string') {
      const str = r.images.trim();
      if (str.startsWith('[') && str.endsWith(']')) {
        try {
          parsedImages = JSON.parse(str);
        } catch (e) {}
      } else if (str.startsWith('{') && str.endsWith('}')) {
        parsedImages = str
          .slice(1, -1)
          .split(',')
          .map((s: string) => s.trim().replace(/^"/, '').replace(/"$/, ''))
          .filter(Boolean);
      } else if (str.length > 0) {
        parsedImages = [str];
      }
    }
  }
  if (parsedImages.length === 0 && r.image) {
    parsedImages = [r.image];
  }
  return parsedImages;
}

export function mapRowToPack(r: any): Pack {
  let productIds: string[] = [];
  if (r.product_ids) {
    productIds = typeof r.product_ids === 'string' ? JSON.parse(r.product_ids) : r.product_ids;
  }
  let images: string[] = [];
  if (r.images) {
    images = typeof r.images === 'string' ? JSON.parse(r.images) : r.images;
  }
  return {
    id: r.id,
    name: r.name,
    slug: r.slug || r.id,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    description: r.description || '',
    image: r.image || images[0] || '',
    images,
    productIds,
    productLineId: r.product_line_id || undefined,
    categoryId: r.category_id || undefined,
    inStock: r.in_stock !== false,
    featured: Boolean(r.featured),
    seoTitle: r.seo_title || undefined,
    seoDescription: r.seo_description || undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

function parseKit(value: unknown): ProductKit | undefined {
  if (!value) return undefined;
  try {
    const raw = typeof value === 'string' ? JSON.parse(value) : value;
    return normalizeKit(raw);
  } catch {
    return undefined;
  }
}

function parseGallery(value: unknown): ProductGallery | undefined {
  if (!value) return undefined;
  try {
    const raw = typeof value === 'string' ? JSON.parse(value) : value;
    return normalizeGallery(raw);
  } catch {
    return undefined;
  }
}

export function mapRowToProduct(r: any): Product {
  const images = parseProductImages(r);
  return {
    id: r.id,
    sku: r.sku || undefined,
    name: r.name,
    slug: r.slug || r.id,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    costPrice: r.cost_price ? Number(r.cost_price) : undefined,
    theme: r.theme || 'General',
    category: r.category || 'General',
    ageGroup: r.age_group || 'All Ages',
    productLineId: r.product_line_id || undefined,
    isNonToxic: r.is_non_toxic !== false,
    image: r.image || images[0] || '',
    images,
    gallery: parseGallery(r.gallery),
    kitContents: parseKit(r.kit_contents),
    description: r.description || '',
    inStock: r.in_stock !== false,
    stockQuantity: r.stock_quantity ? Number(r.stock_quantity) : 10,
    isOrderingEnabled: r.is_ordering_enabled !== false,
    badge: r.badge || undefined,
    isNewLaunch:
      r.is_new_launch !== undefined && r.is_new_launch !== null
        ? Boolean(r.is_new_launch)
        : r.badge
        ? r.badge.includes('New')
        : false,
    isSellingFast:
      r.is_selling_fast !== undefined && r.is_selling_fast !== null
        ? Boolean(r.is_selling_fast)
        : r.badge
        ? r.badge.includes('Selling')
        : false,
    size: r.size || undefined,
    material: r.material || undefined,
    seoTitle: r.seo_title || undefined,
    seoDescription: r.seo_description || undefined,
    isVisible: r.is_visible !== false,
    likesCount: r.likes_count ? Number(r.likes_count) : 0,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

export function mapPaintColor(r: {
  id: string;
  name: string;
  hex?: string | null;
  color_type_id?: string | null;
  volume_ml?: number | string | null;
  sort_order?: number | string | null;
  available?: boolean | null;
}): PaintColor {
  return {
    id: r.id,
    name: r.name,
    hex: r.hex || undefined,
    colorTypeId: r.color_type_id || undefined,
    volumeMl: r.volume_ml != null ? Number(r.volume_ml) : undefined,
    available: r.available !== false,
    sortOrder: Number(r.sort_order) || 0,
  };
}
