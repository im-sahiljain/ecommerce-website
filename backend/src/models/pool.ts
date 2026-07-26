import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getPgPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_PG_URL;
  if (connectionString) {
    try {
      pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
      console.log('⚡ Connected to Supabase PostgreSQL Database via pg Pool');
    } catch (err) {
      console.warn('PostgreSQL pool connection notice:', err);
    }
  }
  return pool;
}
