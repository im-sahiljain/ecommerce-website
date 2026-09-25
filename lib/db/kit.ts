import type { KitSupplies, PaintBrush, PaintColor, PaintColorType } from '@/lib/kit';
import type { Db } from './pool';
import { mapPaintBrush, mapPaintColor } from './rows';

const KIT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.paint_color_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.paint_colors (
  id text PRIMARY KEY,
  name text NOT NULL,
  hex text,
  color_type_id text,
  volume_ml numeric,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.paint_brushes (
  id text PRIMARY KEY,
  name text NOT NULL,
  size text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS kit_contents jsonb;
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS kit_contents jsonb;
ALTER TABLE public.paint_colors ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE public.paint_color_types ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE public.paint_brushes ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE public.paint_colors ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
ALTER TABLE public.paint_brushes ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
`;

let kitSchemaPromise: Promise<void> | null = null;

export async function ensureKitSchema(db: Db): Promise<void> {
  const pool = db.pgPool;
  if (!pool) return;
  if (!kitSchemaPromise) {
    kitSchemaPromise = pool.query(KIT_SCHEMA_SQL).then(() => undefined).catch((err) => {
      kitSchemaPromise = null;
      throw err;
    });
  }
  await kitSchemaPromise;
  await pool.query(`
    ALTER TABLE public.paint_colors ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
    ALTER TABLE public.paint_brushes ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
  `);
}

export async function getKitSupplies(db: Db): Promise<KitSupplies> {
  const [types, colors, brushes] = await Promise.all([
    getPaintColorTypes(db),
    getPaintColors(db),
    getPaintBrushes(db),
  ]);
  return { types, colors, brushes };
}

export async function getPaintColorTypes(db: Db): Promise<PaintColorType[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    await ensureKitSchema(db);
    const res = await pool.query(
      `SELECT * FROM public.paint_color_types ORDER BY sort_order ASC, name ASC`
    );
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      available: r.available !== false,
      sortOrder: Number(r.sort_order) || 0,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getPaintColorTypes error:', err.message);
    return [];
  }
}

export async function addPaintColorType(db: Db, name: string): Promise<PaintColorType> {
  const pool = db.pgPool;
  const id = `ctype-${Date.now()}`;
  const trimmed = name.trim();
  if (!pool) return { id, name: trimmed, available: true, sortOrder: 0 };
  await ensureKitSchema(db);
  const existing = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM public.paint_color_types`
  );
  const sortOrder = Number(existing.rows[0]?.max_sort || 0) + 1;
  await pool.query(
    `INSERT INTO public.paint_color_types (id, name, sort_order, available) VALUES ($1, $2, $3, true)`,
    [id, trimmed, sortOrder]
  );
  return { id, name: trimmed, available: true, sortOrder };
}

export async function updatePaintColorType(db: Db, id: string, name: string): Promise<PaintColorType | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  await ensureKitSchema(db);
  const res = await pool.query(
    `UPDATE public.paint_color_types SET name = $1 WHERE id = $2 RETURNING *`,
    [name.trim(), id]
  );
  if (!res.rows[0]) return null;
  return {
    id: res.rows[0].id,
    name: res.rows[0].name,
    available: res.rows[0].available !== false,
    sortOrder: Number(res.rows[0].sort_order) || 0,
  };
}

export async function setPaintColorTypeAvailable(db: Db, id: string, available: boolean): Promise<PaintColorType | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  await ensureKitSchema(db);
  const res = await pool.query(
    `UPDATE public.paint_color_types SET available = $1 WHERE id = $2 RETURNING *`,
    [available, id],
  );
  const row = res.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    available: row.available !== false,
    sortOrder: Number(row.sort_order) || 0,
  };
}

export async function deletePaintColorType(db: Db, id: string): Promise<void> {
  const pool = db.pgPool;
  if (!pool) return;
  await ensureKitSchema(db);
  const used = await pool.query(
    `SELECT id FROM public.paint_colors WHERE color_type_id = $1 LIMIT 1`,
    [id]
  );
  if (used.rows.length > 0) {
    throw new Error('Delete or move colors of this type first.');
  }
  await pool.query(`DELETE FROM public.paint_color_types WHERE id = $1`, [id]);
}

export async function getPaintColors(db: Db): Promise<PaintColor[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    await ensureKitSchema(db);
    const res = await pool.query(
      `SELECT * FROM public.paint_colors ORDER BY sort_order ASC, name ASC`
    );
    return res.rows.map((r) => mapPaintColor(r));
  } catch (err: any) {
    console.warn('⚠️ PG getPaintColors error:', err.message);
    return [];
  }
}

export async function addPaintColor(db: Db, input: {
  name: string;
  hex?: string;
  colorTypeId?: string;
  volumeMl?: number;
  price?: number;
}): Promise<PaintColor> {
  const pool = db.pgPool;
  const id = `color-${Date.now()}`;
  const color: PaintColor = {
    id,
    name: input.name.trim(),
    hex: input.hex || undefined,
    colorTypeId: input.colorTypeId || undefined,
    volumeMl: input.volumeMl,
    price: Number(input.price) || 0,
    available: true,
    sortOrder: 0,
  };
  if (!pool) return color;
  await ensureKitSchema(db);
  const existing = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM public.paint_colors`
  );
  color.sortOrder = Number(existing.rows[0]?.max_sort || 0) + 1;
  await pool.query(
    `INSERT INTO public.paint_colors (id, name, hex, color_type_id, volume_ml, price, sort_order, available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
    [color.id, color.name, color.hex || null, color.colorTypeId || null, color.volumeMl ?? null, color.price, color.sortOrder]
  );
  return color;
}

export async function updatePaintColor(db: Db, 
  id: string,
  input: { name: string; hex?: string; colorTypeId?: string; volumeMl?: number; price?: number }
): Promise<PaintColor | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  await ensureKitSchema(db);
  const res = await pool.query(
    `UPDATE public.paint_colors
     SET name = $1, hex = $2, color_type_id = $3, volume_ml = $4, price = $5
     WHERE id = $6
     RETURNING *`,
    [input.name.trim(), input.hex || null, input.colorTypeId || null, input.volumeMl ?? null, Number(input.price) || 0, id]
  );
  const r = res.rows[0];
  if (!r) return null;
  return mapPaintColor(r);
}

export async function setPaintColorAvailable(db: Db, id: string, available: boolean): Promise<PaintColor | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  await ensureKitSchema(db);
  const res = await pool.query(
    `UPDATE public.paint_colors SET available = $1 WHERE id = $2 RETURNING *`,
    [available, id],
  );
  const r = res.rows[0];
  if (!r) return null;
  return mapPaintColor(r);
}

export async function deletePaintColor(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  await ensureKitSchema(db);
  const res = await pool.query(`DELETE FROM public.paint_colors WHERE id = $1`, [id]);
  return (res.rowCount || 0) > 0;
}

export async function getPaintBrushes(db: Db): Promise<PaintBrush[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    await ensureKitSchema(db);
    const res = await pool.query(
      `SELECT * FROM public.paint_brushes ORDER BY sort_order ASC, name ASC`
    );
    return res.rows.map((r) => mapPaintBrush(r));
  } catch (err: any) {
    console.warn('⚠️ PG getPaintBrushes error:', err.message);
    return [];
  }
}

export async function addPaintBrush(db: Db, input: { name: string; size?: string; price?: number }): Promise<PaintBrush> {
  const pool = db.pgPool;
  const id = `brush-${Date.now()}`;
  const brush: PaintBrush = {
    id,
    name: input.name.trim(),
    size: input.size?.trim() || undefined,
    price: Number(input.price) || 0,
    available: true,
    sortOrder: 0,
  };
  if (!pool) return brush;
  await ensureKitSchema(db);
  const existing = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM public.paint_brushes`
  );
  brush.sortOrder = Number(existing.rows[0]?.max_sort || 0) + 1;
  await pool.query(
    `INSERT INTO public.paint_brushes (id, name, size, price, sort_order, available) VALUES ($1, $2, $3, $4, $5, true)`,
    [brush.id, brush.name, brush.size || null, brush.price, brush.sortOrder]
  );
  return brush;
}

export async function updatePaintBrush(db: Db, id: string, input: { name: string; size?: string; price?: number }): Promise<PaintBrush | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  await ensureKitSchema(db);
  const res = await pool.query(
    `UPDATE public.paint_brushes SET name = $1, size = $2, price = $3 WHERE id = $4 RETURNING *`,
    [input.name.trim(), input.size?.trim() || null, Number(input.price) || 0, id]
  );
  const r = res.rows[0];
  if (!r) return null;
  return mapPaintBrush(r);
}

export async function setPaintBrushAvailable(db: Db, id: string, available: boolean): Promise<PaintBrush | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  await ensureKitSchema(db);
  const res = await pool.query(
    `UPDATE public.paint_brushes SET available = $1 WHERE id = $2 RETURNING *`,
    [available, id],
  );
  const row = res.rows[0];
  if (!row) return null;
  return mapPaintBrush(row);
}

export async function deletePaintBrush(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  await ensureKitSchema(db);
  const res = await pool.query(`DELETE FROM public.paint_brushes WHERE id = $1`, [id]);
  return (res.rowCount || 0) > 0;
}
