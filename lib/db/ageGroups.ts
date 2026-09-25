import type { AgeGroup } from './types';
import type { Db } from './pool';

export async function getAgeGroups(db: Db): Promise<AgeGroup[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(
      `SELECT DISTINCT age_group FROM public.products WHERE age_group IS NOT NULL AND age_group != ''`
    );
    return res.rows.map((r, i) => ({
      id: `age-${i}`,
      name: r.age_group,
      slug: r.age_group.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getAgeGroups error:', err.message);
    return [];
  }
}

export async function addAgeGroup(db: Db, _ageGroup: Omit<AgeGroup, 'id'>): Promise<AgeGroup> {
  return { ..._ageGroup, id: `age-${Date.now()}` };
}

export async function deleteAgeGroup(db: Db, _id: string): Promise<boolean> {
  return true;
}
