import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import { Client } from 'pg';

dotenv.config();

// Fix for Node < 22 WebSocket requirement in Supabase client
(global as any).WebSocket = WebSocket;

const supabaseUrl = process.env.SUPABASE_URL || 'https://jbbdbcjwt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Dvm_Bf4C_Dl19Fw_csNlez3a';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

const REAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Galaxy Rocket Kit',
    price: 19.99,
    original_price: 24.99,
    theme: 'Space Adventures',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80',
    description: 'Inspire future astronauts with this ready-to-paint plaster rocket & astronaut set. Complete with 6 vibrant non-toxic paints and dual brushes.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-2',
    name: 'Planet Explorer Set',
    price: 24.99,
    original_price: 29.99,
    theme: 'Space Adventures',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80',
    description: 'Paint the solar system! Includes 8 plaster planets, orbital display stand, glow-in-the-dark paint accents, and painting guide.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-3',
    name: 'Butterfly & Bloom Kit',
    price: 19.99,
    original_price: 22.99,
    theme: 'Secret Garden (Floral)',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    description: 'Bring garden butterflies and blooming flowers to life with custom pastel paint colors and glitter gel pens.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-4',
    name: 'Enchanted Floral Set',
    price: 24.99,
    original_price: 27.99,
    theme: 'Secret Garden (Floral)',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    description: 'A deluxe floral craft collection featuring plaster flower pots, seed starter kits, and weather-resistant acrylic paint.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-5',
    name: 'Unicorn Dreams Kit',
    price: 19.99,
    original_price: 24.99,
    theme: 'Fairytale Magic',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    description: 'Sparkly unicorn craft set featuring plaster unicorns, rainbow cloud stands, metallic paints, and stick-on jewels.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-6',
    name: 'Royal Castle Set',
    price: 14.99,
    original_price: 19.99,
    theme: 'Fairytale Magic',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=500&auto=format&fit=crop&q=80',
    description: 'Paint your own fairytale castle! Comes with pre-cast plaster towers, royal crowns, and metallic gold paint.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-7',
    name: 'Safari Lion Kit',
    price: 19.99,
    original_price: 24.99,
    theme: 'Wild Kingdom',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500&auto=format&fit=crop&q=80',
    description: 'King of the craft room! Friendly plaster lion and cub set with earthy jungle paint tones and fluffy mane fibers.',
    in_stock: true,
    featured: true
  },
  {
    id: 'prod-8',
    name: 'Elephant Parade Set',
    price: 24.99,
    original_price: 28.99,
    theme: 'Wild Kingdom',
    category: 'Painting Kits',
    age_group: 'Ages 4+',
    is_non_toxic: true,
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500&auto=format&fit=crop&q=80',
    description: 'Adorable elephant family plaster set with custom washable paint, mixing palette, and safari background scene.',
    in_stock: true,
    featured: true
  }
];

const REAL_CATEGORIES = [
  { id: 'cat-1', name: 'Painting Kits', slug: 'painting-kits', description: 'Complete ready-to-paint plaster craft kits' },
  { id: 'cat-2', name: 'Party Packs', slug: 'party-packs', description: 'Group activity packs for birthday parties & events' },
  { id: 'cat-3', name: 'Plaster Sets', slug: 'plaster-sets', description: 'Detailed plaster molds & acrylic paint bundles' },
  { id: 'cat-4', name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest released creative craft kits' }
];

const REAL_THEMES = [
  { id: 'theme-1', name: 'Space Adventures', slug: 'space-adventures', description: 'Rockets, planets, astronauts and galaxy fun', icon: '🚀' },
  { id: 'theme-2', name: 'Secret Garden (Floral)', slug: 'secret-garden', description: 'Butterflies, flowers and magical nature', icon: '🌸' },
  { id: 'theme-3', name: 'Fairytale Magic', slug: 'fairytale-magic', description: 'Unicorns, royal castles and magical worlds', icon: '🦄' },
  { id: 'theme-4', name: 'Wild Kingdom', slug: 'wild-kingdom', description: 'Lions, elephants, safari adventures', icon: '🦁' }
];

const REAL_AGE_GROUPS = [
  { id: 'age-1', name: 'Ages 2-4', slug: 'ages-2-4' },
  { id: 'age-2', name: 'Ages 4+', slug: 'ages-4-plus' },
  { id: 'age-3', name: 'Ages 8+', slug: 'ages-8-plus' }
];

async function ensureTablesExistAndSeed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Sahiljain20014@db.jbbdbdgbqsbdtfymcjwt.supabase.co:5432/postgres';
  const pgClient = new Client({ connectionString });
  try {
    await pgClient.connect();
    console.log('📦 Connected to PostgreSQL. Ensuring tables exist...');
    
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        original_price NUMERIC,
        theme TEXT,
        category TEXT,
        age_group TEXT,
        is_non_toxic BOOLEAN DEFAULT true,
        image TEXT,
        description TEXT,
        in_stock BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS public.categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS public.themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS public.age_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.users (
        id TEXT PRIMARY KEY,
        identifier TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL,
        user_identifier TEXT NOT NULL,
        customer_name TEXT,
        shipping_address TEXT,
        phone TEXT,
        items JSONB,
        subtotal NUMERIC,
        shipping NUMERIC,
        total NUMERIC,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        tracking_number TEXT
      );
    `);
    console.log('✅ PostgreSQL Schema/Tables verified!');

    // Seed Products
    for (const p of REAL_PRODUCTS) {
      await pgClient.query(`
        INSERT INTO public.products (id, name, price, original_price, theme, category, age_group, is_non_toxic, image, description, in_stock, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          theme = EXCLUDED.theme,
          category = EXCLUDED.category,
          age_group = EXCLUDED.age_group,
          is_non_toxic = EXCLUDED.is_non_toxic,
          image = EXCLUDED.image,
          description = EXCLUDED.description,
          in_stock = EXCLUDED.in_stock,
          featured = EXCLUDED.featured;
      `, [p.id, p.name, p.price, p.original_price, p.theme, p.category, p.age_group, p.is_non_toxic, p.image, p.description, p.in_stock, p.featured]);
    }
    console.log('✅ Products seeded into PostgreSQL database!');

    // Seed Categories
    for (const c of REAL_CATEGORIES) {
      await pgClient.query(`
        INSERT INTO public.categories (id, name, slug, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description;
      `, [c.id, c.name, c.slug, c.description]);
    }
    console.log('✅ Categories seeded into PostgreSQL database!');

    // Seed Themes
    for (const t of REAL_THEMES) {
      await pgClient.query(`
        INSERT INTO public.themes (id, name, slug, description, icon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, icon = EXCLUDED.icon;
      `, [t.id, t.name, t.slug, t.description, t.icon]);
    }
    console.log('✅ Themes seeded into PostgreSQL database!');

    // Seed Age Groups
    for (const a of REAL_AGE_GROUPS) {
      await pgClient.query(`
        INSERT INTO public.age_groups (id, name, slug)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, slug = EXCLUDED.slug;
      `, [a.id, a.name, a.slug]);
    }
    console.log('✅ Age groups seeded into PostgreSQL database!');

  } catch (err) {
    console.warn('Note on direct PostgreSQL seed:', err);
  } finally {
    await pgClient.end();
  }
}

async function seed() {
  await ensureTablesExistAndSeed();
  console.log('🎉 Supabase PostgreSQL Database Seed Process Completed Successfully!');
}

seed();
