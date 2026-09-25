import type { Db } from './pool';

const adminLookupSql = `
  SELECT id, identifier, email, name, password, role
  FROM public.users
  WHERE role = 'admin'
    AND (LOWER(identifier) = LOWER($1) OR LOWER(COALESCE(email, '')) = LOWER($1))
  LIMIT 1
`;

export async function getAdminUserFromDatabase(db: Db, identifier: string) {
  const pool = db.pgPool;
  if (!pool) throw new Error('Database is not configured');
  const res = await pool.query(adminLookupSql, [identifier]);
  return res.rows[0] ?? null;
}

export async function getAdminUserById(db: Db, id: string) {
  const pool = db.pgPool;
  if (!pool) throw new Error('Database is not configured');
  const res = await pool.query(
    `
      SELECT id, identifier, email, name, role
      FROM public.users
      WHERE id = $1 AND role = 'admin'
      LIMIT 1
    `,
    [id]
  );
  return res.rows[0] ?? null;
}
