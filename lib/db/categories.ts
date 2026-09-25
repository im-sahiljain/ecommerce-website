import type { Category } from './types';
import type { Db } from './pool';

export async function getCategories(db: Db): Promise<Category[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.categories`);
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      productLineId: r.product_line_id,
      description: r.description,
      isVisible: r.is_visible !== false,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getCategories error:', err.message);
    return [];
  }
}

export async function addCategory(db: Db, category: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = { ...category, id: `cat-${Date.now()}` };
  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.categories (id, name, slug, product_line_id, description, is_visible)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug,
          product_line_id = EXCLUDED.product_line_id, description = EXCLUDED.description, is_visible = EXCLUDED.is_visible;
      `,
        [
          newCat.id,
          newCat.name,
          newCat.slug || newCat.id,
          newCat.productLineId || 'line-1',
          newCat.description || '',
          newCat.isVisible !== false,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addCategory error:', err.message);
    }
  }
  return newCat;
}

export async function updateCategory(db: Db, id: string, updates: Partial<Category>): Promise<Category | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const catRes = await pool.query(`SELECT * FROM public.categories WHERE id = $1`, [id]);
    if (catRes.rows.length === 0) return null;
    const current = catRes.rows[0];
    const merged = {
      id,
      name: updates.name || current.name,
      slug: updates.slug || current.slug,
      productLineId: updates.productLineId || current.product_line_id,
      description: updates.description !== undefined ? updates.description : current.description,
      isVisible: updates.isVisible !== undefined ? updates.isVisible : current.is_visible !== false,
    };
    await pool.query(
      `
      UPDATE public.categories SET name = $1, slug = $2, product_line_id = $3, description = $4, is_visible = $5 WHERE id = $6
    `,
      [
        merged.name,
        merged.slug,
        merged.productLineId || 'line-1',
        merged.description || '',
        merged.isVisible !== false,
        id,
      ]
    );
    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updateCategory error:', err.message);
    return null;
  }
}

export async function deleteCategory(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.categories WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteCategory error:', err.message);
    return false;
  }
}
