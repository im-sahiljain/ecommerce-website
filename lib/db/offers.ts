import type { OfferRule } from './types';
import type { Db } from './pool';

export async function getOfferRules(db: Db): Promise<OfferRule[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.offer_rules ORDER BY priority DESC`);
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      applicableScope: r.applicable_scope || 'all',
      scopeValue: r.scope_value,
      requirementMode: r.requirement_mode || 'exact',
      tiers: typeof r.tiers === 'string' ? JSON.parse(r.tiers) : r.tiers,
      isActive: r.is_active !== false,
      priority: r.priority || 0,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getOfferRules error:', err.message);
    return [];
  }
}

export async function addOfferRule(db: Db, rule: Omit<OfferRule, 'id'>): Promise<OfferRule> {
  const newRule: OfferRule = { ...rule, id: `rule-${Date.now()}` };
  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.offer_rules (id, name, description, applicable_scope, scope_value, requirement_mode, tiers, is_active, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING;
      `,
        [
          newRule.id,
          newRule.name,
          newRule.description || '',
          newRule.applicableScope || 'all',
          newRule.scopeValue || '',
          newRule.requirementMode || 'exact',
          JSON.stringify(newRule.tiers),
          newRule.isActive !== false,
          newRule.priority || 1,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG addOfferRule error:', err.message);
    }
  }
  return newRule;
}

export async function updateOfferRule(db: Db, id: string, updates: Partial<OfferRule>): Promise<OfferRule | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    const ruleRes = await pool.query(`SELECT * FROM public.offer_rules WHERE id = $1`, [id]);
    if (ruleRes.rows.length === 0) return null;
    const r = ruleRes.rows[0];
    const merged: OfferRule = {
      id,
      name: updates.name || r.name,
      description: updates.description !== undefined ? updates.description : r.description,
      applicableScope: updates.applicableScope || r.applicable_scope || 'all',
      scopeValue: updates.scopeValue !== undefined ? updates.scopeValue : r.scope_value,
      requirementMode: updates.requirementMode || r.requirement_mode || 'exact',
      tiers: updates.tiers || (typeof r.tiers === 'string' ? JSON.parse(r.tiers) : r.tiers),
      isActive: updates.isActive !== undefined ? updates.isActive : r.is_active !== false,
      priority: updates.priority !== undefined ? updates.priority : r.priority || 0,
    };
    await pool.query(
      `
      UPDATE public.offer_rules SET name=$1, description=$2, applicable_scope=$3, scope_value=$4, requirement_mode=$5, tiers=$6, is_active=$7, priority=$8 WHERE id=$9
    `,
      [
        merged.name,
        merged.description || '',
        merged.applicableScope,
        merged.scopeValue || '',
        merged.requirementMode,
        JSON.stringify(merged.tiers),
        merged.isActive,
        merged.priority,
        id,
      ]
    );
    return merged;
  } catch (err: any) {
    console.warn('⚠️ PG updateOfferRule error:', err.message);
    return null;
  }
}

export async function deleteOfferRule(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(`DELETE FROM public.offer_rules WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteOfferRule error:', err.message);
    return false;
  }
}
