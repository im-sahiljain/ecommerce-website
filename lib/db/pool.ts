import { Pool } from 'pg';

declare global {
  var _pgPool: Pool | undefined;
  var _pgPoolUrl: string | undefined;
}

export type Db = {
  readonly pgPool: Pool | null;
};

export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!global._pgPool || global._pgPoolUrl !== connectionString) {
    if (global._pgPool) {
      global._pgPool.end().catch(() => {});
    }
    global._pgPoolUrl = connectionString;
    global._pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return global._pgPool;
}
