import type { HomepageSection } from './types';
import type { Db } from './pool';

export async function getHomepageSections(db: Db): Promise<HomepageSection[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.homepage_sections ORDER BY sort_order ASC`);
    return res.rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      subtitle: r.subtitle || undefined,
      themeKeyword: r.theme_keyword || undefined,
      titleLayout: r.title_layout || 'left',
      bgColor: r.bg_color || '#FFFFFF',
      textColor: r.text_color || '#3C2A21',
      topDividerFill: r.top_divider_fill || 'white',
      cardSize: r.card_size || 'large',
      layoutTemplate: r.layout_template || 'carousel',
      productLineId: r.product_line_id || undefined,
      categoryId: r.category_id || undefined,
      decorations: typeof r.decorations === 'string' ? JSON.parse(r.decorations) : r.decorations || [],
      isVisible: r.is_visible !== false,
      sortOrder: Number(r.sort_order) || 1,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getHomepageSections error:', err.message);
    return [];
  }
}

export async function addHomepageSection(db: Db, section: Omit<HomepageSection, 'id'>): Promise<HomepageSection> {
  const newSection: HomepageSection = { ...section, id: `sec-${Date.now()}` };
  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.homepage_sections (id, type, title, subtitle, theme_keyword, title_layout, bg_color, text_color, top_divider_fill, card_size, layout_template, product_line_id, category_id, decorations, is_visible, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING;
      `,
        [
          newSection.id,
          newSection.type,
          newSection.title,
          newSection.subtitle || null,
          newSection.themeKeyword || null,
          newSection.titleLayout || 'left',
          newSection.bgColor || '#2D366D',
          newSection.textColor || '#FFFFFF',
          newSection.topDividerFill || 'white',
          newSection.cardSize || 'large',
          newSection.layoutTemplate || 'carousel',
          newSection.productLineId || null,
          newSection.categoryId || null,
          JSON.stringify(newSection.decorations || []),
          newSection.isVisible !== false,
          newSection.sortOrder || 1,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addHomepageSection error:', err.message);
    }
  }
  return newSection;
}

export async function updateHomepageSection(db: Db, 
  id: string,
  updates: Partial<HomepageSection>
): Promise<HomepageSection | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const secRes = await pool.query(`SELECT * FROM public.homepage_sections WHERE id = $1`, [id]);
    if (secRes.rows.length === 0) return null;
    const r = secRes.rows[0];
    const merged: HomepageSection = {
      id,
      type: r.type,
      title: updates.title || r.title,
      subtitle: updates.subtitle !== undefined ? updates.subtitle : r.subtitle,
      themeKeyword: updates.themeKeyword !== undefined ? updates.themeKeyword : r.theme_keyword,
      titleLayout: updates.titleLayout || r.title_layout || 'left',
      bgColor: updates.bgColor || r.bg_color || '#FFFFFF',
      textColor: updates.textColor || r.text_color || '#3C2A21',
      topDividerFill: updates.topDividerFill || r.top_divider_fill || 'white',
      cardSize: updates.cardSize || r.card_size || 'large',
      layoutTemplate: updates.layoutTemplate || r.layout_template || 'carousel',
      productLineId: updates.productLineId !== undefined ? updates.productLineId : r.product_line_id,
      categoryId: updates.categoryId !== undefined ? updates.categoryId : r.category_id,
      decorations:
        updates.decorations ||
        (typeof r.decorations === 'string' ? JSON.parse(r.decorations) : r.decorations) ||
        [],
      isVisible: updates.isVisible !== undefined ? updates.isVisible : r.is_visible !== false,
      sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : Number(r.sort_order) || 1,
    };
    await pool.query(
      `
      UPDATE public.homepage_sections SET title=$1, theme_keyword=$2, title_layout=$3, bg_color=$4, text_color=$5, decorations=$6, is_visible=$7, sort_order=$8 WHERE id=$9
    `,
      [
        merged.title,
        merged.themeKeyword || null,
        merged.titleLayout,
        merged.bgColor,
        merged.textColor,
        JSON.stringify(merged.decorations || []),
        merged.isVisible,
        merged.sortOrder,
        id,
      ]
    );
    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updateHomepageSection error:', err.message);
    return null;
  }
}

export async function reorderHomepageSections(db: Db, orderedIds: string[]): Promise<HomepageSection[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await pool.query(`UPDATE public.homepage_sections SET sort_order = $1 WHERE id = $2`, [
        i + 1,
        orderedIds[i],
      ]);
    }
  } catch (err: any) {
    console.warn('⚠️ PG reorderHomepageSections error:', err.message);
  }
  return getHomepageSections(db);
}

export async function deleteHomepageSection(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.homepage_sections WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteHomepageSection error:', err.message);
    return false;
  }
}
