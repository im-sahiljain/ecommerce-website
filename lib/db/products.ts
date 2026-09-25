import { isIdSlug, slugify, uniqueSlug } from '../slug';
import type { Product } from './types';
import type { Db } from './pool';
import { mapRowToProduct } from './rows';
import { ensureKitSchema } from './kit';

async function productNameSlug(db: Db, name: string, id: string): Promise<string> {
  const products = await getProducts(db);
  const taken = new Set<string>();
  for (const product of products) {
    if (product.id === id) continue;
    const slug = product.slug?.trim();
    if (slug && !isIdSlug(slug, product.id)) taken.add(slug);
  }
  return uniqueSlug(slugify(name), id, taken);
}

export async function getProducts(db: Db): Promise<Product[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.products`);
    return res.rows.map(mapRowToProduct);
  } catch (err: any) {
    console.warn('⚠️ PG getProducts error:', err.message);
    return [];
  }
}

export async function getProductById(db: Db, id: string): Promise<Product | undefined> {
  const pool = db.pgPool;
  if (!pool) return undefined;
  try {
    const res = await pool.query(`SELECT * FROM public.products WHERE id = $1`, [id]);
    if (res.rows.length === 0) return undefined;
    return mapRowToProduct(res.rows[0]);
  } catch (err: any) {
    console.warn('⚠️ PG getProductById error:', err.message);
    return undefined;
  }
}

export async function getProductBySlug(db: Db, slug: string): Promise<Product | undefined> {
  const pool = db.pgPool;
  if (!pool) return undefined;
  try {
    const res = await pool.query(
      `SELECT * FROM public.products WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (res.rows.length === 0) return undefined;
    return mapRowToProduct(res.rows[0]);
  } catch (err: any) {
    console.warn('⚠️ PG getProductBySlug error:', err.message);
    return undefined;
  }
}

export async function addProduct(db: Db, product: Omit<Product, 'id'>): Promise<Product> {
  const now = new Date().toISOString();
  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500'];
  const id = `prod-${Date.now()}`;

  const requestedSlug = product.slug?.trim();
  const slug =
    requestedSlug && !isIdSlug(requestedSlug, id)
      ? requestedSlug
      : await productNameSlug(db, product.name, id);

  const newProduct: Product = {
    ...product,
    id,
    slug,
    image: imagesList[0],
    images: imagesList,
    createdAt: product.createdAt || now,
    updatedAt: product.updatedAt || now,
  };

  const pool = db.pgPool;
  if (pool) {
    try {
      await ensureKitSchema(db);
      await pool.query(
        `
        INSERT INTO public.products (id, sku, name, slug, price, original_price, cost_price, theme, category, age_group, product_line_id, is_non_toxic, image, images, description, in_stock, stock_quantity, is_ordering_enabled, badge, size, material, is_visible, is_new_launch, is_selling_fast, created_at, updated_at, gallery, kit_contents)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          newProduct.id,
          newProduct.sku || newProduct.id,
          newProduct.name,
          newProduct.slug || newProduct.id,
          newProduct.price,
          newProduct.originalPrice || null,
          newProduct.costPrice || null,
          newProduct.theme || '',
          newProduct.category || '',
          newProduct.ageGroup || '',
          newProduct.productLineId || 'line-1',
          newProduct.isNonToxic !== false,
          newProduct.image || '',
          JSON.stringify(newProduct.images || []),
          newProduct.description || '',
          newProduct.inStock !== false,
          newProduct.stockQuantity || 10,
          newProduct.isOrderingEnabled !== false,
          newProduct.badge || null,
          newProduct.size || null,
          newProduct.material || null,
          newProduct.isVisible !== false,
          Boolean(newProduct.isNewLaunch),
          Boolean(newProduct.isSellingFast),
          newProduct.createdAt,
          newProduct.updatedAt,
          newProduct.gallery ? JSON.stringify(newProduct.gallery) : null,
          newProduct.kitContents ? JSON.stringify(newProduct.kitContents) : null,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addProduct error:', err.message);
    }
  }
  return newProduct;
}

export async function updateProduct(db: Db, id: string, updates: Partial<Product>): Promise<Product | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    await ensureKitSchema(db);
    const current = await getProductById(db, id);
    if (!current) return null;

    const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
    if (isIdSlug(merged.slug, id)) {
      merged.slug = await productNameSlug(db, merged.name, id);
    }
    const imagesList = merged.images && merged.images.length > 0 ? merged.images : [merged.image];

    await pool.query(
      `
      UPDATE public.products SET
        name = $1, price = $2, original_price = $3, cost_price = $4,
        theme = $5, category = $6, age_group = $7, product_line_id = $8,
        is_non_toxic = $9, image = $10, images = $11, description = $12,
        in_stock = $13, stock_quantity = $14, is_ordering_enabled = $15, updated_at = $16,
        slug = $17, sku = $18, badge = $19, size = $20, material = $21, is_visible = $22,
        is_new_launch = $23, is_selling_fast = $24, gallery = $25, kit_contents = $26
      WHERE id = $27
    `,
      [
        merged.name,
        merged.price,
        merged.originalPrice || null,
        merged.costPrice || null,
        merged.theme || '',
        merged.category || '',
        merged.ageGroup || '',
        merged.productLineId || 'line-1',
        merged.isNonToxic !== false,
        merged.image || imagesList[0] || '',
        JSON.stringify(imagesList),
        merged.description || '',
        merged.inStock !== false,
        merged.stockQuantity || 10,
        merged.isOrderingEnabled !== false,
        merged.updatedAt,
        merged.slug || merged.id,
        merged.sku || merged.id,
        merged.badge || null,
        merged.size || null,
        merged.material || null,
        merged.isVisible !== false,
        Boolean(merged.isNewLaunch),
        Boolean(merged.isSellingFast),
        merged.gallery ? JSON.stringify(merged.gallery) : null,
        merged.kitContents ? JSON.stringify(merged.kitContents) : null,
        id,
      ]
    );
    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updateProduct error:', err.message);
    return null;
  }
}

export async function backfillProductSlugs(db: Db): Promise<Array<{ id: string; name: string; from: string; to: string }>> {
  const products = await getProducts(db);
  const changes: Array<{ id: string; name: string; from: string; to: string }> = [];
  for (const product of products) {
    if (!isIdSlug(product.slug, product.id)) continue;
    const from = product.slug || product.id;
    const updated = await updateProduct(db, product.id, {});
    if (!updated || updated.slug === from) continue;
    changes.push({ id: product.id, name: product.name, from, to: updated.slug || product.id });
  }
  return changes;
}

export async function deleteProduct(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.products WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteProduct error:', err.message);
    return false;
  }
}
