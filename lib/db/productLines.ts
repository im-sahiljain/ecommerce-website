import type { ProductLine } from './types';
import type { Db } from './pool';

export async function getProductLines(db: Db): Promise<ProductLine[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.product_lines ORDER BY sort_order ASC`);
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      icon: r.icon,
      isVisible: r.is_visible !== false,
      sortOrder: r.sort_order || 1,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getProductLines error:', err.message);
    return [];
  }
}

export async function addProductLine(db: Db, line: Omit<ProductLine, 'id'>): Promise<ProductLine> {
  const newLine: ProductLine = { ...line, id: `line-${Date.now()}` };
  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.product_lines (id, name, slug, description, icon, is_visible, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;
      `,
        [
          newLine.id,
          newLine.name,
          newLine.slug || newLine.id,
          newLine.description || '',
          newLine.icon || '📦',
          newLine.isVisible !== false,
          newLine.sortOrder || 1,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addProductLine error:', err.message);
    }
  }
  return newLine;
}

export async function updateProductLine(db: Db, id: string, updates: Partial<ProductLine>): Promise<ProductLine | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const lineRes = await pool.query(`SELECT * FROM public.product_lines WHERE id = $1`, [id]);
    if (lineRes.rows.length === 0) return null;
    const r = lineRes.rows[0];
    const merged: ProductLine = {
      id,
      name: updates.name || r.name,
      slug: updates.slug || r.slug,
      description: updates.description !== undefined ? updates.description : r.description,
      icon: updates.icon || r.icon,
      isVisible: updates.isVisible !== undefined ? updates.isVisible : r.is_visible !== false,
      sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : r.sort_order || 1,
    };
    await pool.query(
      `
      UPDATE public.product_lines SET name = $1, slug = $2, description = $3, icon = $4, is_visible = $5, sort_order = $6 WHERE id = $7
    `,
      [merged.name, merged.slug, merged.description || '', merged.icon || '📦', merged.isVisible, merged.sortOrder, id]
    );
    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updateProductLine error:', err.message);
    return null;
  }
}

export async function deleteProductLine(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.product_lines WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteProductLine error:', err.message);
    return false;
  }
}
