import type { Theme } from './types';
import type { Db } from './pool';

export async function getThemes(db: Db): Promise<Theme[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.themes`);
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || undefined,
      icon: r.icon || '🎨',
      isVisible: r.is_visible !== false,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getThemes error:', err.message);
    return [];
  }
}

export async function addTheme(db: Db, theme: Omit<Theme, 'id'>): Promise<Theme> {
  const newTheme: Theme = {
    ...theme,
    id: `theme-${Date.now()}`,
    slug: theme.slug || theme.name.toLowerCase().replace(/\s+/g, '-'),
  };
  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.themes (id, name, slug, description, icon, is_visible) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, icon = EXCLUDED.icon, is_visible = EXCLUDED.is_visible;
      `,
        [
          newTheme.id,
          newTheme.name,
          newTheme.slug,
          newTheme.description || '',
          newTheme.icon || '🎨',
          newTheme.isVisible !== false,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addTheme error:', err.message);
    }
  }
  return newTheme;
}

export async function updateTheme(db: Db, id: string, updates: Partial<Theme>): Promise<Theme | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const themeRes = await pool.query(`SELECT * FROM public.themes WHERE id = $1`, [id]);
    if (themeRes.rows.length === 0) return null;
    const r = themeRes.rows[0];
    const merged: Theme = {
      id,
      name: updates.name || r.name,
      slug: updates.slug || r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
      description: updates.description !== undefined ? updates.description : r.description,
      icon: updates.icon || r.icon || '🎨',
      isVisible: updates.isVisible !== undefined ? updates.isVisible : r.is_visible !== false,
    };
    const oldName = r.name;
    await pool.query(
      `UPDATE public.themes SET name = $1, slug = $2, description = $3, icon = $4, is_visible = $5 WHERE id = $6`,
      [merged.name, merged.slug, merged.description || '', merged.icon, merged.isVisible !== false, id]
    );

    if (updates.name && updates.name !== oldName) {
      await pool
        .query(`UPDATE public.products SET theme = $1 WHERE theme = $2 OR theme ILIKE $3`, [
          merged.name,
          oldName,
          `%${oldName}%`,
        ])
        .catch(() => null);

      await pool
        .query(
          `UPDATE public.homepage_sections SET title = $1, theme_keyword = $1 WHERE theme_keyword = $2 OR title = $2 OR theme_keyword ILIKE $3`,
          [merged.name, oldName, `%${oldName}%`]
        )
        .catch(() => null);
    }

    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updateTheme error:', err.message);
    return null;
  }
}

export async function deleteTheme(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.themes WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteTheme error:', err.message);
    return false;
  }
}
