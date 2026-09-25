import type { Pack } from './types';
import type { Db } from './pool';
import { mapRowToPack } from './rows';

export async function getPacks(db: Db): Promise<Pack[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.packs ORDER BY created_at DESC`);
    return res.rows.map(mapRowToPack);
  } catch (err: any) {
    console.warn('⚠️ PG getPacks error:', err.message);
    return [];
  }
}

export async function getPackById(db: Db, id: string): Promise<Pack | undefined> {
  const pool = db.pgPool;
  if (!pool) return undefined;
  try {
    const res = await pool.query(`SELECT * FROM public.packs WHERE id = $1`, [id]);
    if (res.rows.length === 0) return undefined;
    return mapRowToPack(res.rows[0]);
  } catch (err: any) {
    console.warn('⚠️ PG getPackById error:', err.message);
    return undefined;
  }
}

export async function getPackBySlug(db: Db, slug: string): Promise<Pack | undefined> {
  const pool = db.pgPool;
  if (!pool) return undefined;
  try {
    const res = await pool.query(
      `SELECT * FROM public.packs WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (res.rows.length === 0) return undefined;
    return mapRowToPack(res.rows[0]);
  } catch (err: any) {
    console.warn('⚠️ PG getPackBySlug error:', err.message);
    return undefined;
  }
}

export async function addPack(db: Db, packData: Omit<Pack, 'id'>): Promise<Pack> {
  const id = `pack-${Date.now()}`;
  const now = new Date().toISOString();
  const newPack: Pack = {
    ...packData,
    id,
    slug: packData.slug || packData.name.toLowerCase().replace(/\s+/g, '-'),
    inStock: packData.inStock !== false,
    featured: Boolean(packData.featured),
    createdAt: packData.createdAt || now,
    updatedAt: packData.updatedAt || now,
  };

  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.packs (id, name, slug, price, original_price, description, image, images, product_ids, product_line_id, category_id, in_stock, featured, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          newPack.id,
          newPack.name,
          newPack.slug,
          newPack.price,
          newPack.originalPrice || null,
          newPack.description || '',
          newPack.image || '',
          JSON.stringify(newPack.images || []),
          JSON.stringify(newPack.productIds || []),
          newPack.productLineId || null,
          newPack.categoryId || null,
          newPack.inStock,
          newPack.featured,
          newPack.createdAt,
          newPack.updatedAt,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addPack error:', err.message);
    }
  }
  return newPack;
}

export async function updatePack(db: Db, id: string, updates: Partial<Pack>): Promise<Pack | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const current = await getPackById(db, id);
    if (!current) return null;

    const merged: Pack = {
      ...current,
      ...updates,
      slug: updates.slug?.trim() || current.slug,
      updatedAt: new Date().toISOString(),
    };

    await pool.query(
      `
      UPDATE public.packs SET
        name = $1, slug = $2, price = $3, original_price = $4,
        description = $5, image = $6, images = $7, product_ids = $8,
        product_line_id = $9, category_id = $10, in_stock = $11,
        featured = $12, updated_at = $13
      WHERE id = $14
    `,
      [
        merged.name,
        merged.slug || id,
        merged.price,
        merged.originalPrice || null,
        merged.description || '',
        merged.image || '',
        JSON.stringify(merged.images || []),
        JSON.stringify(merged.productIds || []),
        merged.productLineId || null,
        merged.categoryId || null,
        merged.inStock,
        merged.featured,
        merged.updatedAt,
        id,
      ]
    );

    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updatePack error:', err.message);
    return null;
  }
}

export async function deletePack(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.packs WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deletePack error:', err.message);
    return false;
  }
}
