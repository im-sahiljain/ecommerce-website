import { Pool } from 'pg';

export async function initPostgresSchema(pgPool: Pool | null) {
  if (!pgPool) return;

  try {
    await pgPool.query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS state TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS zip_code TEXT;

      CREATE TABLE IF NOT EXISTS public.user_addresses (
        id TEXT PRIMARY KEY,
        user_identifier TEXT NOT NULL,
        label TEXT DEFAULT 'Home',
        full_name TEXT,
        phone TEXT,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.product_lines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        cover_image TEXT,
        icon TEXT,
        is_visible BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS public.bundle_rules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        applicable_scope TEXT DEFAULT 'all',
        scope_value TEXT,
        requirement_mode TEXT DEFAULT 'exact',
        tiers JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        priority INT DEFAULT 0
      );
      ALTER TABLE public.bundle_rules ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE public.bundle_rules ADD COLUMN IF NOT EXISTS requirement_mode TEXT DEFAULT 'exact';

      CREATE TABLE IF NOT EXISTS public.categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        product_line_id TEXT,
        description TEXT
      );
      ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS product_line_id TEXT;
      ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;

      CREATE TABLE IF NOT EXISTS public.products (
        id TEXT PRIMARY KEY,
        sku TEXT,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        original_price NUMERIC,
        cost_price NUMERIC,
        theme TEXT,
        category TEXT,
        age_group TEXT,
        product_line_id TEXT,
        is_non_toxic BOOLEAN DEFAULT TRUE,
        image TEXT,
        description TEXT,
        in_stock BOOLEAN DEFAULT TRUE,
        stock_quantity INT DEFAULT 10,
        is_ordering_enabled BOOLEAN DEFAULT TRUE
      );
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_line_id TEXT;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_non_toxic BOOLEAN DEFAULT TRUE;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 10;
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_ordering_enabled BOOLEAN DEFAULT TRUE;

      CREATE TABLE IF NOT EXISTS public.site_settings (
        id INT PRIMARY KEY DEFAULT 1,
        is_global_ordering_enabled BOOLEAN DEFAULT TRUE,
        whatsapp_number TEXT DEFAULT '+919876543210',
        whatsapp_message_template TEXT DEFAULT 'Hi! I am interested in {productName} ({productUrl}). Can you help me with details?',
        is_whatsapp_enabled BOOLEAN DEFAULT TRUE,
        site_title TEXT DEFAULT 'Little Creators',
        default_meta_description TEXT DEFAULT 'Custom hand-painted craft figurines, wax candles, and creative art sets.'
      );
    `);
  } catch (err: any) {
    console.warn('⚠️ Supabase PG column migration notice:', err.message);
  }
}
