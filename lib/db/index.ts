import { Pool } from 'pg';
import { normalizeGallery, type ProductGallery } from '@/lib/gallery';
import {
  normalizeKit,
  type PaintBrush,
  type PaintColor,
  type PaintColorType,
  type KitSupplies,
  type ProductKit,
} from '@/lib/kit';
import { isIdSlug, slugify, uniqueSlug } from '../slug';
import {
  Product,
  ProductLine,
  CategoryFacet,
  Category,
  Theme,
  AgeGroup,
  User,
  Order,
  UserAddress,
  OfferRule,
  StockLog,
  ProductAnalytics,
  SiteSettings,
  HomepageSection,
  Pack,
} from './types';

export * from './types';

function parseBoolean(val: any, defaultVal = true): boolean {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'false' || s === 'f' || s === '0' || s === 'off') return false;
    if (s === 'true' || s === 't' || s === '1' || s === 'on') return true;
  }
  if (typeof val === 'number') return val !== 0;
  return Boolean(val);
}

function parseProductImages(r: any): string[] {
  let parsedImages: string[] = [];
  if (r.images) {
    if (Array.isArray(r.images)) {
      parsedImages = r.images;
    } else if (typeof r.images === 'string') {
      const str = r.images.trim();
      if (str.startsWith('[') && str.endsWith(']')) {
        try {
          parsedImages = JSON.parse(str);
        } catch (e) {}
      } else if (str.startsWith('{') && str.endsWith('}')) {
        parsedImages = str
          .slice(1, -1)
          .split(',')
          .map((s: string) => s.trim().replace(/^"/, '').replace(/"$/, ''))
          .filter(Boolean);
      } else if (str.length > 0) {
        parsedImages = [str];
      }
    }
  }
  if (parsedImages.length === 0 && r.image) {
    parsedImages = [r.image];
  }
  return parsedImages;
}

function mapRowToPack(r: any): Pack {
  let productIds: string[] = [];
  if (r.product_ids) {
    productIds = typeof r.product_ids === 'string' ? JSON.parse(r.product_ids) : r.product_ids;
  }
  let images: string[] = [];
  if (r.images) {
    images = typeof r.images === 'string' ? JSON.parse(r.images) : r.images;
  }
  return {
    id: r.id,
    name: r.name,
    slug: r.slug || r.id,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    description: r.description || '',
    image: r.image || images[0] || '',
    images,
    productIds,
    productLineId: r.product_line_id || undefined,
    categoryId: r.category_id || undefined,
    inStock: r.in_stock !== false,
    featured: Boolean(r.featured),
    seoTitle: r.seo_title || undefined,
    seoDescription: r.seo_description || undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

function parseKit(value: unknown): ProductKit | undefined {
  if (!value) return undefined;
  try {
    const raw = typeof value === 'string' ? JSON.parse(value) : value;
    return normalizeKit(raw);
  } catch {
    return undefined;
  }
}

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
ALTER TABLE public.paint_colors ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE public.paint_color_types ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
ALTER TABLE public.paint_brushes ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;
`;

let kitSchemaPromise: Promise<void> | null = null;

function parseGallery(value: unknown): ProductGallery | undefined {
  if (!value) return undefined;
  try {
    const raw = typeof value === 'string' ? JSON.parse(value) : value;
    return normalizeGallery(raw);
  } catch {
    return undefined;
  }
}

function mapRowToProduct(r: any): Product {
  const images = parseProductImages(r);
  return {
    id: r.id,
    sku: r.sku || undefined,
    name: r.name,
    slug: r.slug || r.id,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    costPrice: r.cost_price ? Number(r.cost_price) : undefined,
    theme: r.theme || 'General',
    category: r.category || 'General',
    ageGroup: r.age_group || 'All Ages',
    productLineId: r.product_line_id || undefined,
    isNonToxic: r.is_non_toxic !== false,
    image: r.image || images[0] || '',
    images,
    gallery: parseGallery(r.gallery),
    kitContents: parseKit(r.kit_contents),
    description: r.description || '',
    inStock: r.in_stock !== false,
    stockQuantity: r.stock_quantity ? Number(r.stock_quantity) : 10,
    isOrderingEnabled: r.is_ordering_enabled !== false,
    badge: r.badge || undefined,
    isNewLaunch:
      r.is_new_launch !== undefined && r.is_new_launch !== null
        ? Boolean(r.is_new_launch)
        : r.badge
        ? r.badge.includes('New')
        : false,
    isSellingFast:
      r.is_selling_fast !== undefined && r.is_selling_fast !== null
        ? Boolean(r.is_selling_fast)
        : r.badge
        ? r.badge.includes('Selling')
        : false,
    size: r.size || undefined,
    material: r.material || undefined,
    seoTitle: r.seo_title || undefined,
    seoDescription: r.seo_description || undefined,
    isVisible: r.is_visible !== false,
    likesCount: r.likes_count ? Number(r.likes_count) : 0,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

declare global {
  var _pgPool: Pool | undefined;
  var _pgPoolUrl: string | undefined;
}

function getPool(): Pool | null {
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

function mapPaintColor(r: {
  id: string;
  name: string;
  hex?: string | null;
  color_type_id?: string | null;
  volume_ml?: number | string | null;
  sort_order?: number | string | null;
  available?: boolean | null;
}): PaintColor {
  return {
    id: r.id,
    name: r.name,
    hex: r.hex || undefined,
    colorTypeId: r.color_type_id || undefined,
    volumeMl: r.volume_ml != null ? Number(r.volume_ml) : undefined,
    available: r.available !== false,
    sortOrder: Number(r.sort_order) || 0,
  };
}

export class Database {
  public get pgPool(): Pool | null {
    return getPool();
  }

  private async productNameSlug(name: string, id: string): Promise<string> {
    const products = await this.getProducts();
    const taken = new Set<string>();
    for (const product of products) {
      if (product.id === id) continue;
      const slug = product.slug?.trim();
      if (slug && !isIdSlug(slug, product.id)) taken.add(slug);
    }
    return uniqueSlug(slugify(name), id, taken);
  }

  // ═══════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════

  async getProducts(): Promise<Product[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(`SELECT * FROM public.products`);
      return res.rows.map(mapRowToProduct);
    } catch (err: any) {
      console.warn('⚠️ PG getProducts error:', err.message);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const pool = this.pgPool;
    if (!pool) return undefined;
    try {
      const res = await pool.query(`SELECT * FROM public.products WHERE id = $1`, [id]);
      if (res.rows.length === 0) return undefined;
      return mapRowToProduct(res.rows[0]);
    } catch (err: any) {
      console.warn('⚠️ PG getProductById error:', err.message);
      return undefined;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const pool = this.pgPool;
    if (!pool) return undefined;
    try {
      const res = await pool.query(
        `SELECT * FROM public.products WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      if (res.rows.length === 0) return undefined;
      return mapRowToProduct(res.rows[0]);
    } catch (err: any) {
      console.warn('⚠️ PG getProductBySlug error:', err.message);
      return undefined;
    }
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const now = new Date().toISOString();
    const imagesList =
      product.images && product.images.length > 0
        ? product.images
        : [product.image || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500'];
    const id = `prod-${Date.now()}`;

    const requestedSlug = product.slug?.trim();
    const slug =
      requestedSlug && !isIdSlug(requestedSlug, id)
        ? requestedSlug
        : await this.productNameSlug(product.name, id);

    const newProduct: Product = {
      ...product,
      id,
      slug,
      image: imagesList[0],
      images: imagesList,
      createdAt: product.createdAt || now,
      updatedAt: product.updatedAt || now,
    };

    const pool = this.pgPool;
    if (pool) {
      try {
        await this.ensureKitSchema();
        await pool.query(
          `
          INSERT INTO public.products (id, sku, name, slug, price, original_price, cost_price, theme, category, age_group, product_line_id, is_non_toxic, image, images, description, in_stock, stock_quantity, is_ordering_enabled, badge, size, material, is_visible, is_new_launch, is_selling_fast, created_at, updated_at, gallery, kit_contents)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
          ON CONFLICT (id) DO NOTHING;
        `,
          [
            newProduct.id,
            newProduct.sku || newProduct.id,
            newProduct.name,
            newProduct.slug || newProduct.id,
            newProduct.price,
            newProduct.originalPrice || null,
            newProduct.costPrice || null,
            newProduct.theme || '',
            newProduct.category || '',
            newProduct.ageGroup || '',
            newProduct.productLineId || 'line-1',
            newProduct.isNonToxic !== false,
            newProduct.image || '',
            JSON.stringify(newProduct.images || []),
            newProduct.description || '',
            newProduct.inStock !== false,
            newProduct.stockQuantity || 10,
            newProduct.isOrderingEnabled !== false,
            newProduct.badge || null,
            newProduct.size || null,
            newProduct.material || null,
            newProduct.isVisible !== false,
            Boolean(newProduct.isNewLaunch),
            Boolean(newProduct.isSellingFast),
            newProduct.createdAt,
            newProduct.updatedAt,
            newProduct.gallery ? JSON.stringify(newProduct.gallery) : null,
            newProduct.kitContents ? JSON.stringify(newProduct.kitContents) : null,
          ]
        );
      } catch (err: any) {
        console.warn('⚠️ PG addProduct error:', err.message);
      }
    }
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      await this.ensureKitSchema();
      const current = await this.getProductById(id);
      if (!current) return null;

      const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
      if (isIdSlug(merged.slug, id)) {
        merged.slug = await this.productNameSlug(merged.name, id);
      }
      const imagesList = merged.images && merged.images.length > 0 ? merged.images : [merged.image];

      await pool.query(
        `
        UPDATE public.products SET
          name = $1, price = $2, original_price = $3, cost_price = $4,
          theme = $5, category = $6, age_group = $7, product_line_id = $8,
          is_non_toxic = $9, image = $10, images = $11, description = $12,
          in_stock = $13, stock_quantity = $14, is_ordering_enabled = $15, updated_at = $16,
          slug = $17, sku = $18, badge = $19, size = $20, material = $21, is_visible = $22,
          is_new_launch = $23, is_selling_fast = $24, gallery = $25, kit_contents = $26
        WHERE id = $27
      `,
        [
          merged.name,
          merged.price,
          merged.originalPrice || null,
          merged.costPrice || null,
          merged.theme || '',
          merged.category || '',
          merged.ageGroup || '',
          merged.productLineId || 'line-1',
          merged.isNonToxic !== false,
          merged.image || imagesList[0] || '',
          JSON.stringify(imagesList),
          merged.description || '',
          merged.inStock !== false,
          merged.stockQuantity || 10,
          merged.isOrderingEnabled !== false,
          merged.updatedAt,
          merged.slug || merged.id,
          merged.sku || merged.id,
          merged.badge || null,
          merged.size || null,
          merged.material || null,
          merged.isVisible !== false,
          Boolean(merged.isNewLaunch),
          Boolean(merged.isSellingFast),
          merged.gallery ? JSON.stringify(merged.gallery) : null,
          merged.kitContents ? JSON.stringify(merged.kitContents) : null,
          id,
        ]
      );
      return merged;
    } catch (err: any) {
      console.warn('⚠️ PG updateProduct error:', err.message);
      return null;
    }
  }

  async backfillProductSlugs(): Promise<Array<{ id: string; name: string; from: string; to: string }>> {
    const products = await this.getProducts();
    const changes: Array<{ id: string; name: string; from: string; to: string }> = [];
    for (const product of products) {
      if (!isIdSlug(product.slug, product.id)) continue;
      const from = product.slug || product.id;
      const updated = await this.updateProduct(product.id, {});
      if (!updated || updated.slug === from) continue;
      changes.push({ id: product.id, name: product.name, from, to: updated.slug || product.id });
    }
    return changes;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.products WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteProduct error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════

  async getCategories(): Promise<Category[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(`SELECT * FROM public.categories`);
      return res.rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        productLineId: r.product_line_id,
        description: r.description,
        isVisible: r.is_visible !== false,
      }));
    } catch (err: any) {
      console.warn('⚠️ PG getCategories error:', err.message);
      return [];
    }
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    const pool = this.pgPool;
    if (pool) {
      try {
        await pool.query(
          `
          INSERT INTO public.categories (id, name, slug, product_line_id, description, is_visible)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, slug = EXCLUDED.slug,
            product_line_id = EXCLUDED.product_line_id, description = EXCLUDED.description, is_visible = EXCLUDED.is_visible;
        `,
          [
            newCat.id,
            newCat.name,
            newCat.slug || newCat.id,
            newCat.productLineId || 'line-1',
            newCat.description || '',
            newCat.isVisible !== false,
          ]
        );
      } catch (err: any) {
        console.warn('⚠️ PG addCategory error:', err.message);
      }
    }
    return newCat;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      const catRes = await pool.query(`SELECT * FROM public.categories WHERE id = $1`, [id]);
      if (catRes.rows.length === 0) return null;
      const current = catRes.rows[0];
      const merged = {
        id,
        name: updates.name || current.name,
        slug: updates.slug || current.slug,
        productLineId: updates.productLineId || current.product_line_id,
        description: updates.description !== undefined ? updates.description : current.description,
        isVisible: updates.isVisible !== undefined ? updates.isVisible : current.is_visible !== false,
      };
      await pool.query(
        `
        UPDATE public.categories SET name = $1, slug = $2, product_line_id = $3, description = $4, is_visible = $5 WHERE id = $6
      `,
        [
          merged.name,
          merged.slug,
          merged.productLineId || 'line-1',
          merged.description || '',
          merged.isVisible !== false,
          id,
        ]
      );
      return merged;
    } catch (err: any) {
      console.warn('⚠️ PG updateCategory error:', err.message);
      return null;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.categories WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteCategory error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // THEMES
  // ═══════════════════════════════════════════

  async getThemes(): Promise<Theme[]> {
    const pool = this.pgPool;
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

  async addTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
    const newTheme: Theme = {
      ...theme,
      id: `theme-${Date.now()}`,
      slug: theme.slug || theme.name.toLowerCase().replace(/\s+/g, '-'),
    };
    const pool = this.pgPool;
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

  async updateTheme(id: string, updates: Partial<Theme>): Promise<Theme | null> {
    const pool = this.pgPool;
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

  async deleteTheme(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.themes WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteTheme error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // AGE GROUPS
  // ═══════════════════════════════════════════

  async getAgeGroups(): Promise<AgeGroup[]> {
    const pool = this.pgPool;
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

  async addAgeGroup(_ageGroup: Omit<AgeGroup, 'id'>): Promise<AgeGroup> {
    return { ..._ageGroup, id: `age-${Date.now()}` };
  }

  async deleteAgeGroup(_id: string): Promise<boolean> {
    return true;
  }

  // ═══════════════════════════════════════════
  // USERS & PROFILES
  // ═══════════════════════════════════════════

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const pool = this.pgPool;
    if (!pool) return undefined;
    try {
      const res = await pool.query(
        `SELECT * FROM public.users WHERE LOWER(identifier) = LOWER($1)`,
        [identifier]
      );
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return {
        id: r.id,
        identifier: r.identifier,
        name: r.name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        city: r.city,
        state: r.state,
        zipCode: r.zip_code,
        password: r.password,
        role: r.role,
        createdAt: r.created_at,
      };
    } catch (err: any) {
      console.warn('⚠️ PG getUserByIdentifier error:', err.message);
      return undefined;
    }
  }

  async findOrCreateUser(identifier: string, name?: string, password?: string): Promise<User> {
    const pool = this.pgPool;
    if (!pool) {
      return {
        id: `usr-${Date.now()}`,
        identifier,
        name: name || identifier.split('@')[0],
        createdAt: new Date().toISOString(),
      };
    }
    try {
      const existing = await this.getUserByIdentifier(identifier);
      if (existing) return existing;

      const user: User = {
        id: `usr-${Date.now()}`,
        identifier,
        name: name || identifier.split('@')[0],
        email: identifier.includes('@') ? identifier : '',
        phone: !identifier.includes('@') ? identifier : '',
        password: password || 'password123',
        createdAt: new Date().toISOString(),
      };

      await pool.query(
        `
        INSERT INTO public.users (id, identifier, name, email, phone, password, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (identifier) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password;
      `,
        [user.id, user.identifier, user.name, user.email, user.phone, user.password, user.createdAt]
      );

      return user;
    } catch (err: any) {
      console.warn('⚠️ PG findOrCreateUser error:', err.message);
      return {
        id: `usr-${Date.now()}`,
        identifier,
        name: name || identifier.split('@')[0],
        createdAt: new Date().toISOString(),
      };
    }
  }

  async updateUserProfile(identifier: string, updates: Partial<User>): Promise<User | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      const { name, email, phone, address, city, state, zipCode } = updates;
      await pool.query(
        `
        UPDATE public.users SET name = COALESCE($1, name), email = COALESCE($2, email),
        phone = COALESCE($3, phone), address = COALESCE($4, address), city = COALESCE($5, city),
        state = COALESCE($6, state), zip_code = COALESCE($7, zip_code)
        WHERE LOWER(identifier) = LOWER($8)
      `,
        [name, email, phone, address, city, state, zipCode, identifier]
      );
      return (await this.getUserByIdentifier(identifier)) || null;
    } catch (err: any) {
      console.warn('⚠️ PG updateUserProfile error:', err.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════
  // USER ADDRESSES
  // ═══════════════════════════════════════════

  async getUserAddresses(identifier: string): Promise<UserAddress[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(
        `SELECT * FROM public.user_addresses WHERE LOWER(user_identifier) = LOWER($1) ORDER BY created_at DESC`,
        [identifier]
      );
      return res.rows.map((r) => ({
        id: r.id,
        userIdentifier: r.user_identifier,
        label: r.label,
        fullName: r.full_name,
        phone: r.phone,
        addressLine: r.address_line,
        city: r.city,
        state: r.state,
        zipCode: r.zip_code,
        isDefault: r.is_default,
        createdAt: r.created_at,
      }));
    } catch (err: any) {
      console.warn('⚠️ PG getUserAddresses error:', err.message);
      return [];
    }
  }

  async addUserAddress(
    identifier: string,
    addressData: Omit<UserAddress, 'id' | 'userIdentifier' | 'createdAt'>
  ): Promise<UserAddress> {
    const newAddress: UserAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
      userIdentifier: identifier,
      isDefault: addressData.isDefault || false,
      createdAt: new Date().toISOString(),
    };

    const pool = this.pgPool;
    if (pool) {
      try {
        const existing = await this.getUserAddresses(identifier);
        if (existing.length === 0) newAddress.isDefault = true;

        if (newAddress.isDefault) {
          await pool.query(
            `UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1)`,
            [identifier]
          );
        }
        await pool.query(
          `
          INSERT INTO public.user_addresses (id, user_identifier, label, full_name, phone, address_line, city, state, zip_code, is_default, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING;
        `,
          [
            newAddress.id,
            newAddress.userIdentifier,
            newAddress.label,
            newAddress.fullName,
            newAddress.phone,
            newAddress.addressLine,
            newAddress.city,
            newAddress.state,
            newAddress.zipCode,
            newAddress.isDefault,
            newAddress.createdAt,
          ]
        );
      } catch (err: any) {
        console.warn('⚠️ PG addUserAddress error:', err.message);
      }
    }
    return newAddress;
  }

  async setDefaultAddress(identifier: string, addressId: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      await pool.query(
        `UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1)`,
        [identifier]
      );
      const res = await pool.query(
        `UPDATE public.user_addresses SET is_default = TRUE WHERE id = $1`,
        [addressId]
      );
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG setDefaultAddress error:', err.message);
      return false;
    }
  }

  async deleteUserAddress(identifier: string, addressId: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(
        `DELETE FROM public.user_addresses WHERE id = $1 AND LOWER(user_identifier) = LOWER($2)`,
        [addressId, identifier]
      );
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteUserAddress error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════

  async listOrders(options: {
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{
    orders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      phone: string;
      status: Order['status'];
      total: number;
      createdAt: string;
      itemCount: number;
    }>;
    total: number;
    statusCounts: Record<string, number>;
  }> {
    const pool = this.pgPool;
    const empty = { orders: [], total: 0, statusCounts: {} as Record<string, number> };
    if (!pool) return empty;

    const status = options.status || null;
    const limit = options.limit;
    const offset = options.offset;

    try {
      const [rowsRes, totalRes, countsRes] = await Promise.all([
        pool.query(
          `
          SELECT
            id,
            order_number,
            customer_name,
            phone,
            status,
            total,
            created_at,
            CASE
              WHEN items IS NULL THEN 0
              WHEN jsonb_typeof(items::jsonb) = 'array' THEN jsonb_array_length(items::jsonb)
              ELSE 0
            END AS item_count
          FROM public.orders
          WHERE ($1::text IS NULL OR status = $1)
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
          `,
          [status, limit, offset]
        ),
        pool.query(
          `SELECT COUNT(*)::int AS total FROM public.orders WHERE ($1::text IS NULL OR status = $1)`,
          [status]
        ),
        pool.query(
          `SELECT status, COUNT(*)::int AS count FROM public.orders GROUP BY status`
        ),
      ]);

      const statusCounts: Record<string, number> = {};
      for (const row of countsRes.rows) {
        statusCounts[row.status] = row.count;
      }

      return {
        orders: rowsRes.rows.map((r) => ({
          id: r.id,
          orderNumber: r.order_number,
          customerName: r.customer_name,
          phone: r.phone || '',
          status: r.status,
          total: Number(r.total),
          createdAt: r.created_at,
          itemCount: Number(r.item_count) || 0,
        })),
        total: totalRes.rows[0]?.total || 0,
        statusCounts,
      };
    } catch (err: any) {
      console.warn('⚠️ PG listOrders error:', err.message);
      return empty;
    }
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    const pool = this.pgPool;
    const empty = { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
    if (!pool) return empty;
    try {
      const res = await pool.query(`
        SELECT
          COUNT(*)::int AS total_orders,
          COALESCE(SUM(total), 0)::float8 AS total_revenue,
          COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_orders
        FROM public.orders
      `);
      const row = res.rows[0];
      return {
        totalOrders: row?.total_orders || 0,
        totalRevenue: Number(row?.total_revenue) || 0,
        pendingOrders: row?.pending_orders || 0,
      };
    } catch (err: any) {
      console.warn('⚠️ PG getOrderStats error:', err.message);
      return empty;
    }
  }

  async getOrders(): Promise<Order[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(`SELECT * FROM public.orders ORDER BY created_at DESC`);
      return res.rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        userIdentifier: r.user_identifier,
        customerName: r.customer_name,
        shippingAddress: r.shipping_address,
        phone: r.phone,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        subtotal: Number(r.subtotal),
        shipping: Number(r.shipping),
        total: Number(r.total),
        status: r.status,
        createdAt: r.created_at,
        trackingNumber: r.tracking_number,
      }));
    } catch (err: any) {
      console.warn('⚠️ PG getOrders error:', err.message);
      return [];
    }
  }

  async getOrdersByUser(identifier: string): Promise<Order[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(
        `SELECT * FROM public.orders WHERE LOWER(user_identifier) = LOWER($1) ORDER BY created_at DESC`,
        [identifier]
      );
      return res.rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        userIdentifier: r.user_identifier,
        customerName: r.customer_name,
        shippingAddress: r.shipping_address,
        phone: r.phone,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        subtotal: Number(r.subtotal),
        shipping: Number(r.shipping),
        total: Number(r.total),
        status: r.status,
        createdAt: r.created_at,
        trackingNumber: r.tracking_number,
      }));
    } catch (err: any) {
      console.warn('⚠️ PG getOrdersByUser error:', err.message);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const pool = this.pgPool;
    if (!pool) return undefined;
    try {
      const res = await pool.query(`SELECT * FROM public.orders WHERE id = $1 OR order_number = $1`, [
        id,
      ]);
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return {
        id: r.id,
        orderNumber: r.order_number,
        userIdentifier: r.user_identifier,
        customerName: r.customer_name,
        shippingAddress: r.shipping_address,
        phone: r.phone,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        subtotal: Number(r.subtotal),
        shipping: Number(r.shipping),
        total: Number(r.total),
        status: r.status,
        createdAt: r.created_at,
        trackingNumber: r.tracking_number,
      };
    } catch (err: any) {
      console.warn('⚠️ PG getOrderById error:', err.message);
      return undefined;
    }
  }

  async createOrder(
    order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'> & { status?: Order['status'] }
  ): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: order.status || 'Pending',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    const pool = this.pgPool;
    if (pool) {
      try {
        await pool.query(
          `
          INSERT INTO public.orders (id, order_number, user_identifier, customer_name, shipping_address, phone, items, subtotal, shipping, total, status, created_at, tracking_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING;
        `,
          [
            newOrder.id,
            newOrder.orderNumber,
            newOrder.userIdentifier,
            newOrder.customerName,
            newOrder.shippingAddress,
            newOrder.phone,
            JSON.stringify(newOrder.items),
            newOrder.subtotal,
            newOrder.shipping,
            newOrder.total,
            newOrder.status,
            newOrder.createdAt,
            newOrder.trackingNumber,
          ]
        );
      } catch (err: any) {
        console.warn('⚠️ PG createOrder error:', err.message);
      }
    }
    return newOrder;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      await pool.query(`UPDATE public.orders SET status = $1 WHERE id = $2 OR order_number = $2`, [
        status,
        id,
      ]);
      return (await this.getOrderById(id)) || null;
    } catch (err: any) {
      console.warn('⚠️ PG updateOrderStatus error:', err.message);
      return null;
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(
        `DELETE FROM public.orders WHERE id = $1 OR order_number = $1`,
        [id]
      );
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteOrder error:', err.message);
      throw err;
    }
  }

  // ═══════════════════════════════════════════
  // PRODUCT LINES
  // ═══════════════════════════════════════════

  async getProductLines(): Promise<ProductLine[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(`SELECT * FROM public.product_lines ORDER BY sort_order ASC`);
      return res.rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        icon: r.icon,
        isVisible: r.is_visible !== false,
        sortOrder: r.sort_order || 1,
      }));
    } catch (err: any) {
      console.warn('⚠️ PG getProductLines error:', err.message);
      return [];
    }
  }

  async addProductLine(line: Omit<ProductLine, 'id'>): Promise<ProductLine> {
    const newLine: ProductLine = { ...line, id: `line-${Date.now()}` };
    const pool = this.pgPool;
    if (pool) {
      try {
        await pool.query(
          `
          INSERT INTO public.product_lines (id, name, slug, description, icon, is_visible, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;
        `,
          [
            newLine.id,
            newLine.name,
            newLine.slug || newLine.id,
            newLine.description || '',
            newLine.icon || '📦',
            newLine.isVisible !== false,
            newLine.sortOrder || 1,
          ]
        );
      } catch (err: any) {
        console.warn('⚠️ PG addProductLine error:', err.message);
      }
    }
    return newLine;
  }

  async updateProductLine(id: string, updates: Partial<ProductLine>): Promise<ProductLine | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      const lineRes = await pool.query(`SELECT * FROM public.product_lines WHERE id = $1`, [id]);
      if (lineRes.rows.length === 0) return null;
      const r = lineRes.rows[0];
      const merged: ProductLine = {
        id,
        name: updates.name || r.name,
        slug: updates.slug || r.slug,
        description: updates.description !== undefined ? updates.description : r.description,
        icon: updates.icon || r.icon,
        isVisible: updates.isVisible !== undefined ? updates.isVisible : r.is_visible !== false,
        sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : r.sort_order || 1,
      };
      await pool.query(
        `
        UPDATE public.product_lines SET name = $1, slug = $2, description = $3, icon = $4, is_visible = $5, sort_order = $6 WHERE id = $7
      `,
        [merged.name, merged.slug, merged.description || '', merged.icon || '📦', merged.isVisible, merged.sortOrder, id]
      );
      return merged;
    } catch (err: any) {
      console.warn('⚠️ PG updateProductLine error:', err.message);
      return null;
    }
  }

  async deleteProductLine(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.product_lines WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteProductLine error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // CATEGORY FACETS
  // ═══════════════════════════════════════════

  async getFacets(): Promise<CategoryFacet[]> {
    return [];
  }
  async addFacet(facet: Omit<CategoryFacet, 'id'>): Promise<CategoryFacet> {
    return { ...facet, id: `facet-${Date.now()}` };
  }
  async updateFacet(_id: string, _updates: Partial<CategoryFacet>): Promise<CategoryFacet | null> {
    return null;
  }
  async deleteFacet(_id: string): Promise<boolean> {
    return false;
  }

  // ═══════════════════════════════════════════
  // OFFER RULES
  // ═══════════════════════════════════════════

  async getOfferRules(): Promise<OfferRule[]> {
    const pool = this.pgPool;
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

  async addOfferRule(rule: Omit<OfferRule, 'id'>): Promise<OfferRule> {
    const newRule: OfferRule = { ...rule, id: `rule-${Date.now()}` };
    const pool = this.pgPool;
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

  async updateOfferRule(id: string, updates: Partial<OfferRule>): Promise<OfferRule | null> {
    const pool = this.pgPool;
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

  async deleteOfferRule(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.offer_rules WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteOfferRule error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // STOCK ADJUSTMENT
  // ═══════════════════════════════════════════

  async adjustProductStock(
    productId: string,
    changeAmount: number,
    _reason: string,
    _updatedBy: string = 'Admin'
  ): Promise<Product | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      const product = await this.getProductById(productId);
      if (!product) return null;
      const currentQty = product.stockQuantity !== undefined ? product.stockQuantity : 10;
      const newQty = Math.max(0, currentQty + changeAmount);
      await pool.query(
        `UPDATE public.products SET stock_quantity = $1, in_stock = $2 WHERE id = $3`,
        [newQty, newQty > 0, productId]
      );
      return { ...product, stockQuantity: newQty, inStock: newQty > 0 };
    } catch (err: any) {
      console.warn('⚠️ PG adjustProductStock error:', err.message);
      return null;
    }
  }

  async getStockLogs(_productId?: string): Promise<StockLog[]> {
    return [];
  }

  // ═══════════════════════════════════════════
  // ANALYTICS
  // ═══════════════════════════════════════════

  getProductAnalytics(_productId: string): ProductAnalytics {
    return {
      productId: _productId,
      views: 0,
      likes: 0,
      wishlistedBy: [],
      unitsOrdered: 0,
      totalRevenue: 0,
    };
  }
  recordProductView(_productId: string): void {}
  async likeProduct(
    productId: string,
    active: boolean
  ): Promise<{ likes: number; isLiked: boolean }> {
    const delta = active ? 1 : -1;
    const pool = this.pgPool;
    if (pool) {
      try {
        const res = await pool.query(
          `UPDATE public.products
           SET likes_count = GREATEST(COALESCE(likes_count, 0) + $2, 0)
           WHERE id = $1
           RETURNING likes_count`,
          [productId, delta]
        );
        if (res.rows.length > 0) {
          return { likes: Number(res.rows[0].likes_count), isLiked: active };
        }
      } catch (err: any) {
        console.warn('⚠️ PG likeProduct error:', err.message);
      }
    }
    return { likes: active ? 1 : 0, isLiked: active };
  }
  getAllAnalytics(): Record<string, ProductAnalytics> {
    return {};
  }

  // ═══════════════════════════════════════════
  // SITE SETTINGS
  // ═══════════════════════════════════════════

  async getSettings(): Promise<SiteSettings> {
    const pool = this.pgPool;
    if (pool) {
      try {
        const res = await pool.query(`SELECT * FROM public.site_settings LIMIT 1`);
        if (res && res.rows.length > 0) {
          const s = res.rows[0];
          return {
            isGlobalOrderingEnabled: parseBoolean(s.is_global_ordering_enabled, true),
            isWhatsappOrderingEnabled: parseBoolean(s.is_whatsapp_ordering_enabled, true),
            isWhatsappChatButtonEnabled: parseBoolean(s.is_whatsapp_chat_button_enabled, true),
            whatsappNumber: s.whatsapp_number || '',
            whatsappMessageTemplate: s.whatsapp_message_template || '',
            isWhatsappEnabled: parseBoolean(s.is_whatsapp_enabled, true),
            siteTitle: s.site_title || 'Kits and Craft',
            defaultMetaDescription: s.default_meta_description || '',
          };
        }
      } catch (err: any) {
        console.warn('⚠️ PG settings get notice:', err.message);
      }
    }
    return {
      isGlobalOrderingEnabled: true,
      isWhatsappOrderingEnabled: true,
      isWhatsappChatButtonEnabled: true,
      whatsappNumber: '',
      whatsappMessageTemplate:
        'Hi! I am interested in {productName} ({productUrl}). Can you help me with details?',
      isWhatsappEnabled: true,
      siteTitle: 'Kits and Craft',
      defaultMetaDescription:
        'Ready-to-paint craft figurines, scented aesthetic wax candles, and creative art kits.',
    };
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...updates,
      isGlobalOrderingEnabled: parseBoolean(
        updates.isGlobalOrderingEnabled,
        current.isGlobalOrderingEnabled
      ),
      isWhatsappOrderingEnabled: parseBoolean(
        updates.isWhatsappOrderingEnabled,
        current.isWhatsappOrderingEnabled
      ),
      isWhatsappChatButtonEnabled: parseBoolean(
        updates.isWhatsappChatButtonEnabled,
        current.isWhatsappChatButtonEnabled
      ),
    };

    const pool = this.pgPool;
    if (pool) {
      try {
        const checkRes = await pool.query(`SELECT id FROM public.site_settings LIMIT 1`);
        if (checkRes && checkRes.rows.length > 0) {
          const rowId = checkRes.rows[0].id;
          await pool.query(
            `
            UPDATE public.site_settings SET
              is_global_ordering_enabled = $1,
              is_whatsapp_ordering_enabled = $2,
              is_whatsapp_chat_button_enabled = $3,
              whatsapp_number = $4,
              whatsapp_message_template = $5,
              is_whatsapp_enabled = $6,
              site_title = $7,
              default_meta_description = $8
            WHERE id = $9;
          `,
            [
              updated.isGlobalOrderingEnabled,
              updated.isWhatsappOrderingEnabled,
              updated.isWhatsappChatButtonEnabled,
              updated.whatsappNumber || '',
              updated.whatsappMessageTemplate || '',
              updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
              updated.siteTitle || 'Kits and Craft',
              updated.defaultMetaDescription || '',
              rowId,
            ]
          );
        } else {
          await pool.query(
            `
            INSERT INTO public.site_settings (id, is_global_ordering_enabled, is_whatsapp_ordering_enabled, is_whatsapp_chat_button_enabled, whatsapp_number, whatsapp_message_template, is_whatsapp_enabled, site_title, default_meta_description)
            VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8);
          `,
            [
              updated.isGlobalOrderingEnabled,
              updated.isWhatsappOrderingEnabled,
              updated.isWhatsappChatButtonEnabled,
              updated.whatsappNumber || '',
              updated.whatsappMessageTemplate || '',
              updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
              updated.siteTitle || 'Kits and Craft',
              updated.defaultMetaDescription || '',
            ]
          );
        }
      } catch (err: any) {
        console.warn('⚠️ PG site_settings update error:', err.message);
      }
    }
    return updated;
  }

  // ═══════════════════════════════════════════
  // HOMEPAGE SECTIONS
  // ═══════════════════════════════════════════

  async getHomepageSections(): Promise<HomepageSection[]> {
    const pool = this.pgPool;
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

  async addHomepageSection(section: Omit<HomepageSection, 'id'>): Promise<HomepageSection> {
    const newSection: HomepageSection = { ...section, id: `sec-${Date.now()}` };
    const pool = this.pgPool;
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

  async updateHomepageSection(
    id: string,
    updates: Partial<HomepageSection>
  ): Promise<HomepageSection | null> {
    const pool = this.pgPool;
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

  async reorderHomepageSections(orderedIds: string[]): Promise<HomepageSection[]> {
    const pool = this.pgPool;
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
    return this.getHomepageSections();
  }

  async deleteHomepageSection(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.homepage_sections WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deleteHomepageSection error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // PACKS BUILDER
  // ═══════════════════════════════════════════

  async getPacks(): Promise<Pack[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      const res = await pool.query(`SELECT * FROM public.packs ORDER BY created_at DESC`);
      return res.rows.map(mapRowToPack);
    } catch (err: any) {
      console.warn('⚠️ PG getPacks error:', err.message);
      return [];
    }
  }

  async getPackById(id: string): Promise<Pack | undefined> {
    const pool = this.pgPool;
    if (!pool) return undefined;
    try {
      const res = await pool.query(`SELECT * FROM public.packs WHERE id = $1`, [id]);
      if (res.rows.length === 0) return undefined;
      return mapRowToPack(res.rows[0]);
    } catch (err: any) {
      console.warn('⚠️ PG getPackById error:', err.message);
      return undefined;
    }
  }

  async getPackBySlug(slug: string): Promise<Pack | undefined> {
    const pool = this.pgPool;
    if (!pool) return undefined;
    try {
      const res = await pool.query(
        `SELECT * FROM public.packs WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      if (res.rows.length === 0) return undefined;
      return mapRowToPack(res.rows[0]);
    } catch (err: any) {
      console.warn('⚠️ PG getPackBySlug error:', err.message);
      return undefined;
    }
  }

  async addPack(packData: Omit<Pack, 'id'>): Promise<Pack> {
    const id = `pack-${Date.now()}`;
    const now = new Date().toISOString();
    const newPack: Pack = {
      ...packData,
      id,
      slug: packData.slug || packData.name.toLowerCase().replace(/\s+/g, '-'),
      inStock: packData.inStock !== false,
      featured: Boolean(packData.featured),
      createdAt: packData.createdAt || now,
      updatedAt: packData.updatedAt || now,
    };

    const pool = this.pgPool;
    if (pool) {
      try {
        await pool.query(
          `
          INSERT INTO public.packs (id, name, slug, price, original_price, description, image, images, product_ids, product_line_id, category_id, in_stock, featured, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING;
        `,
          [
            newPack.id,
            newPack.name,
            newPack.slug,
            newPack.price,
            newPack.originalPrice || null,
            newPack.description || '',
            newPack.image || '',
            JSON.stringify(newPack.images || []),
            JSON.stringify(newPack.productIds || []),
            newPack.productLineId || null,
            newPack.categoryId || null,
            newPack.inStock,
            newPack.featured,
            newPack.createdAt,
            newPack.updatedAt,
          ]
        );
      } catch (err: any) {
        console.warn('⚠️ PG addPack error:', err.message);
      }
    }
    return newPack;
  }

  async updatePack(id: string, updates: Partial<Pack>): Promise<Pack | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    try {
      const current = await this.getPackById(id);
      if (!current) return null;

      const merged: Pack = {
        ...current,
        ...updates,
        slug: updates.slug?.trim() || current.slug,
        updatedAt: new Date().toISOString(),
      };

      await pool.query(
        `
        UPDATE public.packs SET
          name = $1, slug = $2, price = $3, original_price = $4,
          description = $5, image = $6, images = $7, product_ids = $8,
          product_line_id = $9, category_id = $10, in_stock = $11,
          featured = $12, updated_at = $13
        WHERE id = $14
      `,
        [
          merged.name,
          merged.slug || id,
          merged.price,
          merged.originalPrice || null,
          merged.description || '',
          merged.image || '',
          JSON.stringify(merged.images || []),
          JSON.stringify(merged.productIds || []),
          merged.productLineId || null,
          merged.categoryId || null,
          merged.inStock,
          merged.featured,
          merged.updatedAt,
          id,
        ]
      );

      return merged;
    } catch (err: any) {
      console.warn('⚠️ PG updatePack error:', err.message);
      return null;
    }
  }

  async deletePack(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    try {
      const res = await pool.query(`DELETE FROM public.packs WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn('⚠️ PG deletePack error:', err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // PAINT COLORS, TYPES & BRUSHES
  // ═══════════════════════════════════════════

  private async ensureKitSchema(): Promise<void> {
    const pool = this.pgPool;
    if (!pool) return;
    if (!kitSchemaPromise) {
      kitSchemaPromise = pool.query(KIT_SCHEMA_SQL).then(() => undefined).catch((err) => {
        kitSchemaPromise = null;
        throw err;
      });
    }
    await kitSchemaPromise;
  }

  async getKitSupplies(): Promise<KitSupplies> {
    const [types, colors, brushes] = await Promise.all([
      this.getPaintColorTypes(),
      this.getPaintColors(),
      this.getPaintBrushes(),
    ]);
    return { types, colors, brushes };
  }

  async getPaintColorTypes(): Promise<PaintColorType[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      await this.ensureKitSchema();
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

  async addPaintColorType(name: string): Promise<PaintColorType> {
    const pool = this.pgPool;
    const id = `ctype-${Date.now()}`;
    const trimmed = name.trim();
    if (!pool) return { id, name: trimmed, available: true, sortOrder: 0 };
    await this.ensureKitSchema();
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

  async updatePaintColorType(id: string, name: string): Promise<PaintColorType | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    await this.ensureKitSchema();
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

  async setPaintColorTypeAvailable(id: string, available: boolean): Promise<PaintColorType | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    await this.ensureKitSchema();
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

  async deletePaintColorType(id: string): Promise<void> {
    const pool = this.pgPool;
    if (!pool) return;
    await this.ensureKitSchema();
    const used = await pool.query(
      `SELECT id FROM public.paint_colors WHERE color_type_id = $1 LIMIT 1`,
      [id]
    );
    if (used.rows.length > 0) {
      throw new Error('Delete or move colors of this type first.');
    }
    await pool.query(`DELETE FROM public.paint_color_types WHERE id = $1`, [id]);
  }

  async getPaintColors(): Promise<PaintColor[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      await this.ensureKitSchema();
      const res = await pool.query(
        `SELECT * FROM public.paint_colors ORDER BY sort_order ASC, name ASC`
      );
      return res.rows.map((r) => mapPaintColor(r));
    } catch (err: any) {
      console.warn('⚠️ PG getPaintColors error:', err.message);
      return [];
    }
  }

  async addPaintColor(input: {
    name: string;
    hex?: string;
    colorTypeId?: string;
    volumeMl?: number;
  }): Promise<PaintColor> {
    const pool = this.pgPool;
    const id = `color-${Date.now()}`;
    const color: PaintColor = {
      id,
      name: input.name.trim(),
      hex: input.hex || undefined,
      colorTypeId: input.colorTypeId || undefined,
      volumeMl: input.volumeMl,
      available: true,
      sortOrder: 0,
    };
    if (!pool) return color;
    await this.ensureKitSchema();
    const existing = await pool.query(
      `SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM public.paint_colors`
    );
    color.sortOrder = Number(existing.rows[0]?.max_sort || 0) + 1;
    await pool.query(
      `INSERT INTO public.paint_colors (id, name, hex, color_type_id, volume_ml, sort_order, available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [color.id, color.name, color.hex || null, color.colorTypeId || null, color.volumeMl ?? null, color.sortOrder, true]
    );
    return color;
  }

  async updatePaintColor(
    id: string,
    input: { name: string; hex?: string; colorTypeId?: string; volumeMl?: number }
  ): Promise<PaintColor | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    await this.ensureKitSchema();
    const res = await pool.query(
      `UPDATE public.paint_colors
       SET name = $1, hex = $2, color_type_id = $3, volume_ml = $4
       WHERE id = $5
       RETURNING *`,
      [input.name.trim(), input.hex || null, input.colorTypeId || null, input.volumeMl ?? null, id]
    );
    const r = res.rows[0];
    if (!r) return null;
    return mapPaintColor(r);
  }

  async setPaintColorAvailable(id: string, available: boolean): Promise<PaintColor | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    await this.ensureKitSchema();
    const res = await pool.query(
      `UPDATE public.paint_colors SET available = $1 WHERE id = $2 RETURNING *`,
      [available, id],
    );
    const r = res.rows[0];
    if (!r) return null;
    return mapPaintColor(r);
  }

  async deletePaintColor(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    await this.ensureKitSchema();
    const res = await pool.query(`DELETE FROM public.paint_colors WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  async getPaintBrushes(): Promise<PaintBrush[]> {
    const pool = this.pgPool;
    if (!pool) return [];
    try {
      await this.ensureKitSchema();
      const res = await pool.query(
        `SELECT * FROM public.paint_brushes ORDER BY sort_order ASC, name ASC`
      );
      return res.rows.map((r) => ({
        id: r.id,
        name: r.name,
        size: r.size || undefined,
        available: r.available !== false,
        sortOrder: Number(r.sort_order) || 0,
      }));
    } catch (err: any) {
      console.warn('⚠️ PG getPaintBrushes error:', err.message);
      return [];
    }
  }

  async addPaintBrush(input: { name: string; size?: string }): Promise<PaintBrush> {
    const pool = this.pgPool;
    const id = `brush-${Date.now()}`;
    const brush: PaintBrush = {
      id,
      name: input.name.trim(),
      size: input.size?.trim() || undefined,
      available: true,
      sortOrder: 0,
    };
    if (!pool) return brush;
    await this.ensureKitSchema();
    const existing = await pool.query(
      `SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM public.paint_brushes`
    );
    brush.sortOrder = Number(existing.rows[0]?.max_sort || 0) + 1;
    await pool.query(
      `INSERT INTO public.paint_brushes (id, name, size, sort_order, available) VALUES ($1, $2, $3, $4, true)`,
      [brush.id, brush.name, brush.size || null, brush.sortOrder]
    );
    return brush;
  }

  async updatePaintBrush(id: string, input: { name: string; size?: string }): Promise<PaintBrush | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    await this.ensureKitSchema();
    const res = await pool.query(
      `UPDATE public.paint_brushes SET name = $1, size = $2 WHERE id = $3 RETURNING *`,
      [input.name.trim(), input.size?.trim() || null, id]
    );
    const r = res.rows[0];
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      size: r.size || undefined,
      available: r.available !== false,
      sortOrder: Number(r.sort_order) || 0,
    };
  }

  async setPaintBrushAvailable(id: string, available: boolean): Promise<PaintBrush | null> {
    const pool = this.pgPool;
    if (!pool) return null;
    await this.ensureKitSchema();
    const res = await pool.query(
      `UPDATE public.paint_brushes SET available = $1 WHERE id = $2 RETURNING *`,
      [available, id],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      size: row.size || undefined,
      available: row.available !== false,
      sortOrder: Number(row.sort_order) || 0,
    };
  }

  async deletePaintBrush(id: string): Promise<boolean> {
    const pool = this.pgPool;
    if (!pool) return false;
    await this.ensureKitSchema();
    const res = await pool.query(`DELETE FROM public.paint_brushes WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  // ═══════════════════════════════════════════
  // ADMIN AUTH & STATS
  // ═══════════════════════════════════════════

  async getAdminUserFromDatabase(identifier: string) {
    const pool = this.pgPool;
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM public.users WHERE (LOWER(identifier) = LOWER($1) OR LOWER(email) = LOWER($1)) AND role = 'admin'`,
          [identifier]
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (err: any) {
        console.warn('⚠️ Admin DB lookup notice:', err.message);
      }
    }

    if (identifier.toLowerCase() === 'admin@littlecreators.com' || identifier.toLowerCase() === 'admin') {
      return {
        id: 'admin-1',
        identifier: 'admin@littlecreators.com',
        email: 'admin@littlecreators.com',
        name: 'Admin User',
        password: 'Admin@123456',
        role: 'admin',
      };
    }
    return null;
  }
}

export const db = new Database();
