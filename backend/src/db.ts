import { Pool } from "pg";
import dotenv from "dotenv";
import { getPgPool } from "./models/pool";
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
  BundleRule,
  StockLog,
  ProductAnalytics,
  SiteSettings,
  HomepageSection,
  Pack,
} from "./types";

export * from "./types";

dotenv.config();

// ─── Helper: parse boolean safely ───
function parseBoolean(val: any, defaultVal = true): boolean {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    if (s === "false" || s === "f" || s === "0" || s === "off") return false;
    if (s === "true" || s === "t" || s === "1" || s === "on") return true;
  }
  if (typeof val === "number") return val !== 0;
  return Boolean(val);
}

// ─── Helper: parse product images from PG row ───
function parseProductImages(r: any): string[] {
  let parsedImages: string[] = [];
  if (r.images) {
    if (Array.isArray(r.images)) {
      parsedImages = r.images;
    } else if (typeof r.images === "string") {
      const str = r.images.trim();
      if (str.startsWith("[") && str.endsWith("]")) {
        try { parsedImages = JSON.parse(str); } catch (e) {}
      } else if (str.startsWith("{") && str.endsWith("}")) {
        parsedImages = str.slice(1, -1).split(",")
          .map((s: string) => s.trim().replace(/^"/, "").replace(/"$/, ""))
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

// ─── Helper: map PG row to Pack ───
function mapRowToPack(r: any): Pack {
  let productIds: string[] = [];
  if (r.product_ids) {
    productIds = typeof r.product_ids === "string" ? JSON.parse(r.product_ids) : r.product_ids;
  }
  let images: string[] = [];
  if (r.images) {
    images = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
  }
  return {
    id: r.id,
    name: r.name,
    slug: r.slug || r.id,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    description: r.description || "",
    image: r.image || images[0] || "",
    images,
    productIds,
    productLineId: r.product_line_id || undefined,
    categoryId: r.category_id || undefined,
    inStock: r.in_stock !== false,
    featured: Boolean(r.featured),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

// ─── Helper: map PG row to Product ───
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
    theme: r.theme || "General",
    category: r.category || "General",
    ageGroup: r.age_group || "All Ages",
    productLineId: r.product_line_id || undefined,
    isNonToxic: r.is_non_toxic !== false,
    image: r.image || images[0] || "",
    images,
    description: r.description || "",
    inStock: r.in_stock !== false,
    stockQuantity: r.stock_quantity ? Number(r.stock_quantity) : 10,
    isOrderingEnabled: r.is_ordering_enabled !== false,
    badge: r.badge || undefined,
    isNewLaunch: r.is_new_launch !== undefined && r.is_new_launch !== null ? Boolean(r.is_new_launch) : (r.badge ? r.badge.includes("New") : false),
    isSellingFast: r.is_selling_fast !== undefined && r.is_selling_fast !== null ? Boolean(r.is_selling_fast) : (r.badge ? r.badge.includes("Selling") : false),
    size: r.size || undefined,
    material: r.material || undefined,
    isVisible: r.is_visible !== false,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

export class Database {
  public pgPool: Pool | null = null;

  constructor() {
    this.pgPool = getPgPool();
    if (this.pgPool) {
      // Ensure required columns and admin user exist
      this.pgPool.query(`
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_line_id TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_non_toxic BOOLEAN DEFAULT true;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 10;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_ordering_enabled BOOLEAN DEFAULT true;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
        ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
        ALTER TABLE public.themes ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        INSERT INTO public.users (id, identifier, email, name, password, role)
        VALUES ('admin-1', 'admin@littlecreators.com', 'admin@littlecreators.com', 'Admin User', 'Admin@123456', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', password = EXCLUDED.password;
      `).catch((err) => console.warn("⚠️ DB schema ensure notice:", err.message));

      // Ensure homepage_sections table exists
      this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS public.homepage_sections (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          theme_keyword VARCHAR(100),
          title_layout VARCHAR(50),
          bg_color VARCHAR(50),
          text_color VARCHAR(50),
          top_divider_fill VARCHAR(50),
          card_size VARCHAR(50),
          layout_template VARCHAR(50),
          product_line_id VARCHAR(100),
          category_id VARCHAR(100),
          decorations JSONB,
          is_visible BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 1
        );
      `).catch((err) => console.warn("⚠️ Create homepage_sections table notice:", err.message));

      // Ensure themes table exists
      this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS public.themes (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(50)
        );
      `).catch(() => null);

      // Ensure packs table exists
      this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS public.packs (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          price NUMERIC NOT NULL,
          original_price NUMERIC,
          description TEXT,
          image TEXT,
          images JSONB,
          product_ids JSONB NOT NULL,
          product_line_id VARCHAR(100),
          category_id VARCHAR(100),
          in_stock BOOLEAN DEFAULT true,
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `).catch((err) => console.warn("⚠️ Create packs table notice:", err.message));

      // Ensure site_settings table and columns exist
      this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS public.site_settings (
          id VARCHAR(255) PRIMARY KEY,
          is_global_ordering_enabled BOOLEAN DEFAULT true,
          is_whatsapp_ordering_enabled BOOLEAN DEFAULT true,
          is_whatsapp_chat_button_enabled BOOLEAN DEFAULT true,
          whatsapp_number VARCHAR(100),
          whatsapp_message_template TEXT,
          is_whatsapp_enabled BOOLEAN DEFAULT true,
          site_title VARCHAR(255),
          default_meta_description TEXT
        );

        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_global_ordering_enabled BOOLEAN DEFAULT true;
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_whatsapp_ordering_enabled BOOLEAN DEFAULT true;
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_whatsapp_chat_button_enabled BOOLEAN DEFAULT true;
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(100);
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT;
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_whatsapp_enabled BOOLEAN DEFAULT true;
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_title VARCHAR(255);
        ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS default_meta_description TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_launch BOOLEAN DEFAULT false;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_selling_fast BOOLEAN DEFAULT false;
      `).catch((err) => console.warn("⚠️ Create site_settings table notice:", err.message));

      console.log("⚡ Database initialized — all operations will query PostgreSQL directly");
    }
  }

  // ═══════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════

  async getProducts(): Promise<Product[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.products`);
      return res.rows.map(mapRowToProduct);
    } catch (err: any) {
      console.warn("⚠️ PG getProducts error:", err.message);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    if (!this.pgPool) return undefined;
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.products WHERE id = $1`, [id]);
      if (res.rows.length === 0) return undefined;
      return mapRowToProduct(res.rows[0]);
    } catch (err: any) {
      console.warn("⚠️ PG getProductById error:", err.message);
      return undefined;
    }
  }

  async addProduct(product: Omit<Product, "id">): Promise<Product> {
    const now = new Date().toISOString();
    const imagesList = product.images && product.images.length > 0
      ? product.images
      : [product.image || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500"];
    const id = `prod-${Date.now()}`;

    const newProduct: Product = {
      ...product, id,
      image: imagesList[0], images: imagesList,
      createdAt: product.createdAt || now, updatedAt: product.updatedAt || now,
    };

    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.products (id, sku, name, slug, price, original_price, cost_price, theme, category, age_group, product_line_id, is_non_toxic, image, images, description, in_stock, stock_quantity, is_ordering_enabled, badge, size, material, is_visible, is_new_launch, is_selling_fast, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
          ON CONFLICT (id) DO NOTHING;
        `, [
          newProduct.id, newProduct.sku || newProduct.id, newProduct.name, newProduct.slug || newProduct.id,
          newProduct.price, newProduct.originalPrice || null, newProduct.costPrice || null,
          newProduct.theme || "", newProduct.category || "", newProduct.ageGroup || "",
          newProduct.productLineId || "line-1", newProduct.isNonToxic !== false,
          newProduct.image || "", JSON.stringify(newProduct.images || []),
          newProduct.description || "", newProduct.inStock !== false,
          newProduct.stockQuantity || 10, newProduct.isOrderingEnabled !== false,
          newProduct.badge || null, newProduct.size || null, newProduct.material || null,
          newProduct.isVisible !== false, Boolean(newProduct.isNewLaunch), Boolean(newProduct.isSellingFast),
          newProduct.createdAt, newProduct.updatedAt,
        ]);
      } catch (err: any) {
        console.warn("⚠️ PG addProduct error:", err.message);
      }
    }
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    if (!this.pgPool) return null;
    try {
      const current = await this.getProductById(id);
      if (!current) return null;

      const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
      const imagesList = merged.images && merged.images.length > 0 ? merged.images : [merged.image];

      await this.pgPool.query(`
        UPDATE public.products SET
          name = $1, price = $2, original_price = $3, cost_price = $4,
          theme = $5, category = $6, age_group = $7, product_line_id = $8,
          is_non_toxic = $9, image = $10, images = $11, description = $12,
          in_stock = $13, stock_quantity = $14, is_ordering_enabled = $15, updated_at = $16,
          slug = $17, sku = $18, badge = $19, size = $20, material = $21, is_visible = $22,
          is_new_launch = $23, is_selling_fast = $24
        WHERE id = $25
      `, [
        merged.name, merged.price, merged.originalPrice || null, merged.costPrice || null,
        merged.theme || "", merged.category || "", merged.ageGroup || "",
        merged.productLineId || "line-1", merged.isNonToxic !== false,
        merged.image || imagesList[0] || "", JSON.stringify(imagesList),
        merged.description || "", merged.inStock !== false,
        merged.stockQuantity || 10, merged.isOrderingEnabled !== false,
        merged.updatedAt, merged.slug || merged.id, merged.sku || merged.id,
        merged.badge || null, merged.size || null, merged.material || null,
        merged.isVisible !== false, Boolean(merged.isNewLaunch), Boolean(merged.isSellingFast), id,
      ]);
      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updateProduct error:", err.message);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.products WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteProduct error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════

  async getCategories(): Promise<Category[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.categories`);
      return res.rows.map((r) => ({
        id: r.id, name: r.name, slug: r.slug,
        productLineId: r.product_line_id, description: r.description,
        isVisible: r.is_visible !== false,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getCategories error:", err.message);
      return [];
    }
  }

  async addCategory(category: Omit<Category, "id">): Promise<Category> {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.categories (id, name, slug, product_line_id, description, is_visible)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, slug = EXCLUDED.slug,
            product_line_id = EXCLUDED.product_line_id, description = EXCLUDED.description, is_visible = EXCLUDED.is_visible;
        `, [newCat.id, newCat.name, newCat.slug || newCat.id, newCat.productLineId || "line-1", newCat.description || "", newCat.isVisible !== false]);
      } catch (err: any) {
        console.warn("⚠️ PG addCategory error:", err.message);
      }
    }
    return newCat;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    if (!this.pgPool) return null;
    try {
      const catRes = await this.pgPool.query(`SELECT * FROM public.categories WHERE id = $1`, [id]);
      if (catRes.rows.length === 0) return null;
      const current = catRes.rows[0];
      const merged = {
        id, name: updates.name || current.name, slug: updates.slug || current.slug,
        productLineId: updates.productLineId || current.product_line_id,
        description: updates.description !== undefined ? updates.description : current.description,
        isVisible: updates.isVisible !== undefined ? updates.isVisible : (current.is_visible !== false),
      };
      await this.pgPool.query(`
        UPDATE public.categories SET name = $1, slug = $2, product_line_id = $3, description = $4, is_visible = $5 WHERE id = $6
      `, [merged.name, merged.slug, merged.productLineId || "line-1", merged.description || "", merged.isVisible !== false, id]);
      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updateCategory error:", err.message);
      return null;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.categories WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteCategory error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // THEMES
  // ═══════════════════════════════════════════

  async getThemes(): Promise<Theme[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.themes`);
      return res.rows.map((r) => ({
        id: r.id, name: r.name, slug: r.slug,
        description: r.description || undefined, icon: r.icon || "🎨",
        isVisible: r.is_visible !== false,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getThemes error:", err.message);
      return [];
    }
  }

  async addTheme(theme: Omit<Theme, "id">): Promise<Theme> {
    const newTheme: Theme = {
      ...theme, id: `theme-${Date.now()}`,
      slug: theme.slug || theme.name.toLowerCase().replace(/\s+/g, "-"),
    };
    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.themes (id, name, slug, description, icon, is_visible) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, icon = EXCLUDED.icon, is_visible = EXCLUDED.is_visible;
        `, [newTheme.id, newTheme.name, newTheme.slug, newTheme.description || "", newTheme.icon || "🎨", newTheme.isVisible !== false]);
      } catch (err: any) {
        console.warn("⚠️ PG addTheme error:", err.message);
      }
    }
    return newTheme;
  }

  async updateTheme(id: string, updates: Partial<Theme>): Promise<Theme | null> {
    if (!this.pgPool) return null;
    try {
      const themeRes = await this.pgPool.query(`SELECT * FROM public.themes WHERE id = $1`, [id]);
      if (themeRes.rows.length === 0) return null;
      const r = themeRes.rows[0];
      const merged: Theme = {
        id, name: updates.name || r.name,
        slug: updates.slug || r.slug || r.name.toLowerCase().replace(/\s+/g, "-"),
        description: updates.description !== undefined ? updates.description : r.description,
        icon: updates.icon || r.icon || "🎨",
        isVisible: updates.isVisible !== undefined ? updates.isVisible : (r.is_visible !== false),
      };
      const oldName = r.name;
      await this.pgPool.query(`UPDATE public.themes SET name = $1, slug = $2, description = $3, icon = $4, is_visible = $5 WHERE id = $6`,
        [merged.name, merged.slug, merged.description || "", merged.icon, merged.isVisible !== false, id]);

      // Cascade name updates to products & homepage_sections if theme name was changed
      if (updates.name && updates.name !== oldName) {
        await this.pgPool.query(
          `UPDATE public.products SET theme = $1 WHERE theme = $2 OR theme ILIKE $3`,
          [merged.name, oldName, `%${oldName}%`]
        ).catch(() => null);

        await this.pgPool.query(
          `UPDATE public.homepage_sections SET title = $1, theme_keyword = $1 WHERE theme_keyword = $2 OR title = $2 OR theme_keyword ILIKE $3`,
          [merged.name, oldName, `%${oldName}%`]
        ).catch(() => null);
      }

      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updateTheme error:", err.message);
      return null;
    }
  }

  async deleteTheme(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.themes WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteTheme error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // AGE GROUPS (derived from products)
  // ═══════════════════════════════════════════

  async getAgeGroups(): Promise<AgeGroup[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT DISTINCT age_group FROM public.products WHERE age_group IS NOT NULL AND age_group != ''`);
      return res.rows.map((r, i) => ({
        id: `age-${i}`, name: r.age_group, slug: r.age_group.toLowerCase().replace(/\s+/g, "-"),
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getAgeGroups error:", err.message);
      return [];
    }
  }

  async addAgeGroup(_ageGroup: Omit<AgeGroup, "id">): Promise<AgeGroup> {
    return { ..._ageGroup, id: `age-${Date.now()}` };
  }

  async deleteAgeGroup(_id: string): Promise<boolean> {
    return true;
  }

  // ═══════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    if (!this.pgPool) return undefined;
    try {
      const res = await this.pgPool.query(
        `SELECT * FROM public.users WHERE LOWER(identifier) = LOWER($1)`, [identifier]
      );
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return {
        id: r.id, identifier: r.identifier, name: r.name, email: r.email,
        phone: r.phone, address: r.address, city: r.city, state: r.state,
        zipCode: r.zip_code, password: r.password, createdAt: r.created_at,
      };
    } catch (err: any) {
      console.warn("⚠️ PG getUserByIdentifier error:", err.message);
      return undefined;
    }
  }

  async findOrCreateUser(identifier: string, name?: string, password?: string): Promise<User> {
    if (!this.pgPool) {
      return { id: `usr-${Date.now()}`, identifier, name: name || identifier.split("@")[0], createdAt: new Date().toISOString() };
    }
    try {
      const existing = await this.getUserByIdentifier(identifier);
      if (existing) return existing;

      const user: User = {
        id: `usr-${Date.now()}`, identifier,
        name: name || identifier.split("@")[0],
        email: identifier.includes("@") ? identifier : "",
        phone: !identifier.includes("@") ? identifier : "",
        password: password || "password123",
        createdAt: new Date().toISOString(),
      };

      await this.pgPool.query(`
        INSERT INTO public.users (id, identifier, name, email, phone, password, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (identifier) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password;
      `, [user.id, user.identifier, user.name, user.email, user.phone, user.password, user.createdAt]);

      console.log(`⚡ User registration for ${user.identifier} persisted to PostgreSQL`);
      return user;
    } catch (err: any) {
      console.warn("⚠️ PG findOrCreateUser error:", err.message);
      return { id: `usr-${Date.now()}`, identifier, name: name || identifier.split("@")[0], createdAt: new Date().toISOString() };
    }
  }

  async updateUserProfile(identifier: string, updates: Partial<User>): Promise<User | null> {
    if (!this.pgPool) return null;
    try {
      const { name, email, phone, address, city, state, zipCode } = updates;
      await this.pgPool.query(`
        UPDATE public.users SET name = COALESCE($1, name), email = COALESCE($2, email),
        phone = COALESCE($3, phone), address = COALESCE($4, address), city = COALESCE($5, city),
        state = COALESCE($6, state), zip_code = COALESCE($7, zip_code)
        WHERE LOWER(identifier) = LOWER($8)
      `, [name, email, phone, address, city, state, zipCode, identifier]);
      return await this.getUserByIdentifier(identifier) || null;
    } catch (err: any) {
      console.warn("⚠️ PG updateUserProfile error:", err.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════
  // USER ADDRESSES
  // ═══════════════════════════════════════════

  async getUserAddresses(identifier: string): Promise<UserAddress[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(
        `SELECT * FROM public.user_addresses WHERE LOWER(user_identifier) = LOWER($1) ORDER BY created_at DESC`, [identifier]
      );
      return res.rows.map((r) => ({
        id: r.id, userIdentifier: r.user_identifier, label: r.label,
        fullName: r.full_name, phone: r.phone, addressLine: r.address_line,
        city: r.city, state: r.state, zipCode: r.zip_code,
        isDefault: r.is_default, createdAt: r.created_at,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getUserAddresses error:", err.message);
      return [];
    }
  }

  async addUserAddress(identifier: string, addressData: Omit<UserAddress, "id" | "userIdentifier" | "createdAt">): Promise<UserAddress> {
    const newAddress: UserAddress = {
      ...addressData, id: `addr-${Date.now()}`, userIdentifier: identifier,
      isDefault: addressData.isDefault || false, createdAt: new Date().toISOString(),
    };

    if (this.pgPool) {
      try {
        const existing = await this.getUserAddresses(identifier);
        if (existing.length === 0) newAddress.isDefault = true;

        if (newAddress.isDefault) {
          await this.pgPool.query(`UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1)`, [identifier]);
        }
        await this.pgPool.query(`
          INSERT INTO public.user_addresses (id, user_identifier, label, full_name, phone, address_line, city, state, zip_code, is_default, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING;
        `, [newAddress.id, newAddress.userIdentifier, newAddress.label, newAddress.fullName,
            newAddress.phone, newAddress.addressLine, newAddress.city, newAddress.state,
            newAddress.zipCode, newAddress.isDefault, newAddress.createdAt]);
      } catch (err: any) {
        console.warn("⚠️ PG addUserAddress error:", err.message);
      }
    }
    return newAddress;
  }

  async setDefaultAddress(identifier: string, addressId: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      await this.pgPool.query(`UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1)`, [identifier]);
      const res = await this.pgPool.query(`UPDATE public.user_addresses SET is_default = TRUE WHERE id = $1`, [addressId]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG setDefaultAddress error:", err.message);
      return false;
    }
  }

  async deleteUserAddress(identifier: string, addressId: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(
        `DELETE FROM public.user_addresses WHERE id = $1 AND LOWER(user_identifier) = LOWER($2)`, [addressId, identifier]
      );
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteUserAddress error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════

  async getOrders(): Promise<Order[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.orders ORDER BY created_at DESC`);
      return res.rows.map((r) => ({
        id: r.id, orderNumber: r.order_number, userIdentifier: r.user_identifier,
        customerName: r.customer_name, shippingAddress: r.shipping_address,
        phone: r.phone, items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
        subtotal: Number(r.subtotal), shipping: Number(r.shipping), total: Number(r.total),
        status: r.status, createdAt: r.created_at, trackingNumber: r.tracking_number,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getOrders error:", err.message);
      return [];
    }
  }

  async getOrdersByUser(identifier: string): Promise<Order[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(
        `SELECT * FROM public.orders WHERE LOWER(user_identifier) = LOWER($1) ORDER BY created_at DESC`, [identifier]
      );
      return res.rows.map((r) => ({
        id: r.id, orderNumber: r.order_number, userIdentifier: r.user_identifier,
        customerName: r.customer_name, shippingAddress: r.shipping_address,
        phone: r.phone, items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
        subtotal: Number(r.subtotal), shipping: Number(r.shipping), total: Number(r.total),
        status: r.status, createdAt: r.created_at, trackingNumber: r.tracking_number,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getOrdersByUser error:", err.message);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    if (!this.pgPool) return undefined;
    try {
      const res = await this.pgPool.query(
        `SELECT * FROM public.orders WHERE id = $1 OR order_number = $1`, [id]
      );
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return {
        id: r.id, orderNumber: r.order_number, userIdentifier: r.user_identifier,
        customerName: r.customer_name, shippingAddress: r.shipping_address,
        phone: r.phone, items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
        subtotal: Number(r.subtotal), shipping: Number(r.shipping), total: Number(r.total),
        status: r.status, createdAt: r.created_at, trackingNumber: r.tracking_number,
      };
    } catch (err: any) {
      console.warn("⚠️ PG getOrderById error:", err.message);
      return undefined;
    }
  }

  async createOrder(
    order: Omit<Order, "id" | "orderNumber" | "createdAt" | "status"> & { status?: Order["status"] },
  ): Promise<Order> {
    const newOrder: Order = {
      ...order, id: `ord-${Date.now()}`,
      orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: order.status || "Pending",
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.orders (id, order_number, user_identifier, customer_name, shipping_address, phone, items, subtotal, shipping, total, status, created_at, tracking_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING;
        `, [newOrder.id, newOrder.orderNumber, newOrder.userIdentifier, newOrder.customerName,
            newOrder.shippingAddress, newOrder.phone, JSON.stringify(newOrder.items),
            newOrder.subtotal, newOrder.shipping, newOrder.total,
            newOrder.status, newOrder.createdAt, newOrder.trackingNumber]);
      } catch (err: any) {
        console.warn("⚠️ PG createOrder error:", err.message);
      }
    }
    return newOrder;
  }

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
    if (!this.pgPool) return null;
    try {
      await this.pgPool.query(`UPDATE public.orders SET status = $1 WHERE id = $2 OR order_number = $2`, [status, id]);
      return await this.getOrderById(id) || null;
    } catch (err: any) {
      console.warn("⚠️ PG updateOrderStatus error:", err.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════
  // PRODUCT LINES
  // ═══════════════════════════════════════════

  async getProductLines(): Promise<ProductLine[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.product_lines ORDER BY sort_order ASC`);
      return res.rows.map((r) => ({
        id: r.id, name: r.name, slug: r.slug, description: r.description,
        icon: r.icon, isVisible: r.is_visible !== false, sortOrder: r.sort_order || 1,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getProductLines error:", err.message);
      return [];
    }
  }

  async addProductLine(line: Omit<ProductLine, "id">): Promise<ProductLine> {
    const newLine: ProductLine = { ...line, id: `line-${Date.now()}` };
    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.product_lines (id, name, slug, description, icon, is_visible, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;
        `, [newLine.id, newLine.name, newLine.slug || newLine.id, newLine.description || "", newLine.icon || "📦", newLine.isVisible !== false, newLine.sortOrder || 1]);
      } catch (err: any) {
        console.warn("⚠️ PG addProductLine error:", err.message);
      }
    }
    return newLine;
  }

  async updateProductLine(id: string, updates: Partial<ProductLine>): Promise<ProductLine | null> {
    if (!this.pgPool) return null;
    try {
      const lineRes = await this.pgPool.query(`SELECT * FROM public.product_lines WHERE id = $1`, [id]);
      if (lineRes.rows.length === 0) return null;
      const r = lineRes.rows[0];
      const merged: ProductLine = {
        id, name: updates.name || r.name, slug: updates.slug || r.slug,
        description: updates.description !== undefined ? updates.description : r.description,
        icon: updates.icon || r.icon, isVisible: updates.isVisible !== undefined ? updates.isVisible : r.is_visible !== false,
        sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : r.sort_order || 1,
      };
      await this.pgPool.query(`
        UPDATE public.product_lines SET name = $1, slug = $2, description = $3, icon = $4, is_visible = $5, sort_order = $6 WHERE id = $7
      `, [merged.name, merged.slug, merged.description || "", merged.icon || "📦", merged.isVisible, merged.sortOrder, id]);
      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updateProductLine error:", err.message);
      return null;
    }
  }

  async deleteProductLine(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.product_lines WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteProductLine error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // CATEGORY FACETS (no PG table)
  // ═══════════════════════════════════════════

  async getFacets(): Promise<CategoryFacet[]> { return []; }
  async addFacet(facet: Omit<CategoryFacet, "id">): Promise<CategoryFacet> { return { ...facet, id: `facet-${Date.now()}` }; }
  async updateFacet(_id: string, _updates: Partial<CategoryFacet>): Promise<CategoryFacet | null> { return null; }
  async deleteFacet(_id: string): Promise<boolean> { return false; }

  // ═══════════════════════════════════════════
  // BUNDLE RULES
  // ═══════════════════════════════════════════

  async getBundleRules(): Promise<BundleRule[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.bundle_rules ORDER BY priority DESC`);
      return res.rows.map((r) => ({
        id: r.id, name: r.name, description: r.description,
        applicableScope: r.applicable_scope || "all", scopeValue: r.scope_value,
        requirementMode: r.requirement_mode || "exact",
        tiers: typeof r.tiers === "string" ? JSON.parse(r.tiers) : r.tiers,
        isActive: r.is_active !== false, priority: r.priority || 0,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getBundleRules error:", err.message);
      return [];
    }
  }

  async addBundleRule(rule: Omit<BundleRule, "id">): Promise<BundleRule> {
    const newRule: BundleRule = { ...rule, id: `rule-${Date.now()}` };
    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.bundle_rules (id, name, description, applicable_scope, scope_value, requirement_mode, tiers, is_active, priority)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING;
        `, [newRule.id, newRule.name, newRule.description || "", newRule.applicableScope || "all",
            newRule.scopeValue || "", newRule.requirementMode || "exact",
            JSON.stringify(newRule.tiers), newRule.isActive !== false, newRule.priority || 1]);
      } catch (err: any) {
        console.warn("⚠️ PG addBundleRule error:", err.message);
      }
    }
    return newRule;
  }

  async updateBundleRule(id: string, updates: Partial<BundleRule>): Promise<BundleRule | null> {
    if (!this.pgPool) return null;
    try {
      const ruleRes = await this.pgPool.query(`SELECT * FROM public.bundle_rules WHERE id = $1`, [id]);
      if (ruleRes.rows.length === 0) return null;
      const r = ruleRes.rows[0];
      const merged: BundleRule = {
        id, name: updates.name || r.name, description: updates.description !== undefined ? updates.description : r.description,
        applicableScope: updates.applicableScope || r.applicable_scope || "all",
        scopeValue: updates.scopeValue !== undefined ? updates.scopeValue : r.scope_value,
        requirementMode: updates.requirementMode || r.requirement_mode || "exact",
        tiers: updates.tiers || (typeof r.tiers === "string" ? JSON.parse(r.tiers) : r.tiers),
        isActive: updates.isActive !== undefined ? updates.isActive : r.is_active !== false,
        priority: updates.priority !== undefined ? updates.priority : r.priority || 0,
      };
      await this.pgPool.query(`
        UPDATE public.bundle_rules SET name=$1, description=$2, applicable_scope=$3, scope_value=$4, requirement_mode=$5, tiers=$6, is_active=$7, priority=$8 WHERE id=$9
      `, [merged.name, merged.description || "", merged.applicableScope, merged.scopeValue || "",
          merged.requirementMode, JSON.stringify(merged.tiers), merged.isActive, merged.priority, id]);
      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updateBundleRule error:", err.message);
      return null;
    }
  }

  async deleteBundleRule(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.bundle_rules WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteBundleRule error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // STOCK ADJUSTMENT
  // ═══════════════════════════════════════════

  async adjustProductStock(productId: string, changeAmount: number, _reason: string, _updatedBy: string = "Admin"): Promise<Product | null> {
    if (!this.pgPool) return null;
    try {
      const product = await this.getProductById(productId);
      if (!product) return null;
      const currentQty = product.stockQuantity !== undefined ? product.stockQuantity : 10;
      const newQty = Math.max(0, currentQty + changeAmount);
      await this.pgPool.query(`UPDATE public.products SET stock_quantity = $1, in_stock = $2 WHERE id = $3`, [newQty, newQty > 0, productId]);
      return { ...product, stockQuantity: newQty, inStock: newQty > 0 };
    } catch (err: any) {
      console.warn("⚠️ PG adjustProductStock error:", err.message);
      return null;
    }
  }

  async getStockLogs(_productId?: string): Promise<StockLog[]> { return []; }

  // ═══════════════════════════════════════════
  // ANALYTICS (lightweight, no PG persistence)
  // ═══════════════════════════════════════════

  getProductAnalytics(_productId: string): ProductAnalytics {
    return { productId: _productId, views: 0, likes: 0, wishlistedBy: [], unitsOrdered: 0, totalRevenue: 0 };
  }
  recordProductView(_productId: string): void {}
  likeProduct(_productId: string, _userIdentifier: string = "guest"): { likes: number; isLiked: boolean } { return { likes: 0, isLiked: false }; }
  getAllAnalytics(): Record<string, ProductAnalytics> { return {}; }

  // ═══════════════════════════════════════════
  // SITE SETTINGS
  // ═══════════════════════════════════════════

  async getSettings(): Promise<SiteSettings> {
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query(`SELECT * FROM public.site_settings LIMIT 1`);
        if (res && res.rows.length > 0) {
          const s = res.rows[0];
          return {
            isGlobalOrderingEnabled: parseBoolean(s.is_global_ordering_enabled, true),
            isWhatsappOrderingEnabled: parseBoolean(s.is_whatsapp_ordering_enabled, true),
            isWhatsappChatButtonEnabled: parseBoolean(s.is_whatsapp_chat_button_enabled, true),
            whatsappNumber: s.whatsapp_number || "",
            whatsappMessageTemplate: s.whatsapp_message_template || "",
            isWhatsappEnabled: parseBoolean(s.is_whatsapp_enabled, true),
            siteTitle: s.site_title || "Kits and Craft",
            defaultMetaDescription: s.default_meta_description || "",
          };
        }
      } catch (err: any) {
        console.warn("⚠️ PG settings get notice:", err.message);
      }
    }
    return {
      isGlobalOrderingEnabled: true, isWhatsappOrderingEnabled: true,
      isWhatsappChatButtonEnabled: true, whatsappNumber: "",
      whatsappMessageTemplate: "Hi! I am interested in {productName} ({productUrl}). Can you help me with details?",
      isWhatsappEnabled: true, siteTitle: "Kits and Craft",
      defaultMetaDescription: "Ready-to-paint craft figurines, scented aesthetic wax candles, and creative art kits.",
    };
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...updates,
      isGlobalOrderingEnabled: parseBoolean(updates.isGlobalOrderingEnabled, current.isGlobalOrderingEnabled),
      isWhatsappOrderingEnabled: parseBoolean(updates.isWhatsappOrderingEnabled, current.isWhatsappOrderingEnabled),
      isWhatsappChatButtonEnabled: parseBoolean(updates.isWhatsappChatButtonEnabled, current.isWhatsappChatButtonEnabled),
    };

    if (this.pgPool) {
      try {
        const checkRes = await this.pgPool.query(`SELECT id FROM public.site_settings LIMIT 1`);
        if (checkRes && checkRes.rows.length > 0) {
          const rowId = checkRes.rows[0].id;
          await this.pgPool.query(`
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
          `, [
            updated.isGlobalOrderingEnabled,
            updated.isWhatsappOrderingEnabled,
            updated.isWhatsappChatButtonEnabled,
            updated.whatsappNumber || "",
            updated.whatsappMessageTemplate || "",
            updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
            updated.siteTitle || "Kits and Craft",
            updated.defaultMetaDescription || "",
            rowId,
          ]);
        } else {
          try {
            await this.pgPool.query(`
              INSERT INTO public.site_settings (id, is_global_ordering_enabled, is_whatsapp_ordering_enabled, is_whatsapp_chat_button_enabled, whatsapp_number, whatsapp_message_template, is_whatsapp_enabled, site_title, default_meta_description)
              VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8);
            `, [
              updated.isGlobalOrderingEnabled,
              updated.isWhatsappOrderingEnabled,
              updated.isWhatsappChatButtonEnabled,
              updated.whatsappNumber || "",
              updated.whatsappMessageTemplate || "",
              updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
              updated.siteTitle || "Kits and Craft",
              updated.defaultMetaDescription || "",
            ]);
          } catch (e) {
            await this.pgPool.query(`
              INSERT INTO public.site_settings (is_global_ordering_enabled, is_whatsapp_ordering_enabled, is_whatsapp_chat_button_enabled, whatsapp_number, whatsapp_message_template, is_whatsapp_enabled, site_title, default_meta_description)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `, [
              updated.isGlobalOrderingEnabled,
              updated.isWhatsappOrderingEnabled,
              updated.isWhatsappChatButtonEnabled,
              updated.whatsappNumber || "",
              updated.whatsappMessageTemplate || "",
              updated.isWhatsappOrderingEnabled || updated.isWhatsappChatButtonEnabled,
              updated.siteTitle || "Kits and Craft",
              updated.defaultMetaDescription || "",
            ]);
          }
        }
      } catch (err: any) {
        console.warn("⚠️ PG site_settings update error:", err.message);
      }
    }
    return updated;
  }

  // ═══════════════════════════════════════════
  // HOMEPAGE SECTIONS
  // ═══════════════════════════════════════════

  async getHomepageSections(): Promise<HomepageSection[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.homepage_sections ORDER BY sort_order ASC`);
      return res.rows.map((r) => ({
        id: r.id, type: r.type, title: r.title, subtitle: r.subtitle || undefined,
        themeKeyword: r.theme_keyword || undefined, titleLayout: r.title_layout || "left",
        bgColor: r.bg_color || "#FFFFFF", textColor: r.text_color || "#3C2A21",
        topDividerFill: r.top_divider_fill || "white", cardSize: r.card_size || "large",
        layoutTemplate: r.layout_template || "carousel",
        productLineId: r.product_line_id || undefined, categoryId: r.category_id || undefined,
        decorations: typeof r.decorations === "string" ? JSON.parse(r.decorations) : r.decorations || [],
        isVisible: r.is_visible !== false, sortOrder: Number(r.sort_order) || 1,
      }));
    } catch (err: any) {
      console.warn("⚠️ PG getHomepageSections error:", err.message);
      return [];
    }
  }

  async addHomepageSection(section: Omit<HomepageSection, "id">): Promise<HomepageSection> {
    const newSection: HomepageSection = { ...section, id: `sec-${Date.now()}` };
    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.homepage_sections (id, type, title, subtitle, theme_keyword, title_layout, bg_color, text_color, top_divider_fill, card_size, layout_template, product_line_id, category_id, decorations, is_visible, sort_order)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING;
        `, [newSection.id, newSection.type, newSection.title, newSection.subtitle || null,
            newSection.themeKeyword || null, newSection.titleLayout || "left",
            newSection.bgColor || "#2D366D", newSection.textColor || "#FFFFFF",
            newSection.topDividerFill || "white", newSection.cardSize || "large",
            newSection.layoutTemplate || "carousel", newSection.productLineId || null,
            newSection.categoryId || null, JSON.stringify(newSection.decorations || []),
            newSection.isVisible !== false, newSection.sortOrder || 1]);
      } catch (err: any) {
        console.warn("⚠️ PG addHomepageSection error:", err.message);
      }
    }
    return newSection;
  }

  async updateHomepageSection(id: string, updates: Partial<HomepageSection>): Promise<HomepageSection | null> {
    if (!this.pgPool) return null;
    try {
      const secRes = await this.pgPool.query(`SELECT * FROM public.homepage_sections WHERE id = $1`, [id]);
      if (secRes.rows.length === 0) return null;
      const r = secRes.rows[0];
      const merged: HomepageSection = {
        id, type: r.type, title: updates.title || r.title,
        subtitle: updates.subtitle !== undefined ? updates.subtitle : r.subtitle,
        themeKeyword: updates.themeKeyword !== undefined ? updates.themeKeyword : r.theme_keyword,
        titleLayout: updates.titleLayout || r.title_layout || "left",
        bgColor: updates.bgColor || r.bg_color || "#FFFFFF",
        textColor: updates.textColor || r.text_color || "#3C2A21",
        topDividerFill: updates.topDividerFill || r.top_divider_fill || "white",
        cardSize: updates.cardSize || r.card_size || "large",
        layoutTemplate: updates.layoutTemplate || r.layout_template || "carousel",
        productLineId: updates.productLineId !== undefined ? updates.productLineId : r.product_line_id,
        categoryId: updates.categoryId !== undefined ? updates.categoryId : r.category_id,
        decorations: updates.decorations || (typeof r.decorations === "string" ? JSON.parse(r.decorations) : r.decorations) || [],
        isVisible: updates.isVisible !== undefined ? updates.isVisible : r.is_visible !== false,
        sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : Number(r.sort_order) || 1,
      };
      await this.pgPool.query(`
        UPDATE public.homepage_sections SET title=$1, theme_keyword=$2, title_layout=$3, bg_color=$4, text_color=$5, decorations=$6, is_visible=$7, sort_order=$8 WHERE id=$9
      `, [merged.title, merged.themeKeyword || null, merged.titleLayout, merged.bgColor,
          merged.textColor, JSON.stringify(merged.decorations || []), merged.isVisible, merged.sortOrder, id]);
      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updateHomepageSection error:", err.message);
      return null;
    }
  }

  async reorderHomepageSections(orderedIds: string[]): Promise<HomepageSection[]> {
    if (!this.pgPool) return [];
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await this.pgPool.query(`UPDATE public.homepage_sections SET sort_order = $1 WHERE id = $2`, [i + 1, orderedIds[i]]);
      }
    } catch (err: any) {
      console.warn("⚠️ PG reorderHomepageSections error:", err.message);
    }
    return this.getHomepageSections();
  }

  async deleteHomepageSection(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.homepage_sections WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deleteHomepageSection error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // PACKS BUILDER
  // ═══════════════════════════════════════════

  async getPacks(): Promise<Pack[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.packs ORDER BY created_at DESC`);
      return res.rows.map(mapRowToPack);
    } catch (err: any) {
      console.warn("⚠️ PG getPacks error:", err.message);
      return [];
    }
  }

  async getPackById(id: string): Promise<Pack | undefined> {
    if (!this.pgPool) return undefined;
    try {
      const res = await this.pgPool.query(`SELECT * FROM public.packs WHERE id = $1`, [id]);
      if (res.rows.length === 0) return undefined;
      return mapRowToPack(res.rows[0]);
    } catch (err: any) {
      console.warn("⚠️ PG getPackById error:", err.message);
      return undefined;
    }
  }

  async addPack(packData: Omit<Pack, "id">): Promise<Pack> {
    const id = `pack-${Date.now()}`;
    const now = new Date().toISOString();
    const newPack: Pack = {
      ...packData,
      id,
      slug: packData.slug || packData.name.toLowerCase().replace(/\s+/g, "-"),
      inStock: packData.inStock !== false,
      featured: Boolean(packData.featured),
      createdAt: packData.createdAt || now,
      updatedAt: packData.updatedAt || now,
    };

    if (this.pgPool) {
      try {
        await this.pgPool.query(`
          INSERT INTO public.packs (id, name, slug, price, original_price, description, image, images, product_ids, product_line_id, category_id, in_stock, featured, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING;
        `, [
          newPack.id, newPack.name, newPack.slug, newPack.price,
          newPack.originalPrice || null, newPack.description || "",
          newPack.image || "", JSON.stringify(newPack.images || []),
          JSON.stringify(newPack.productIds || []),
          newPack.productLineId || null, newPack.categoryId || null,
          newPack.inStock, newPack.featured, newPack.createdAt, newPack.updatedAt,
        ]);
      } catch (err: any) {
        console.warn("⚠️ PG addPack error:", err.message);
      }
    }
    return newPack;
  }

  async updatePack(id: string, updates: Partial<Pack>): Promise<Pack | null> {
    if (!this.pgPool) return null;
    try {
      const current = await this.getPackById(id);
      if (!current) return null;

      const merged: Pack = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.pgPool.query(`
        UPDATE public.packs SET
          name = $1, slug = $2, price = $3, original_price = $4,
          description = $5, image = $6, images = $7, product_ids = $8,
          product_line_id = $9, category_id = $10, in_stock = $11,
          featured = $12, updated_at = $13
        WHERE id = $14
      `, [
        merged.name, merged.slug || id, merged.price, merged.originalPrice || null,
        merged.description || "", merged.image || "", JSON.stringify(merged.images || []),
        JSON.stringify(merged.productIds || []), merged.productLineId || null,
        merged.categoryId || null, merged.inStock, merged.featured, merged.updatedAt, id,
      ]);

      return merged;
    } catch (err: any) {
      console.warn("⚠️ PG updatePack error:", err.message);
      return null;
    }
  }

  async deletePack(id: string): Promise<boolean> {
    if (!this.pgPool) return false;
    try {
      const res = await this.pgPool.query(`DELETE FROM public.packs WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (err: any) {
      console.warn("⚠️ PG deletePack error:", err.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // ADMIN AUTH
  // ═══════════════════════════════════════════

  async getAdminUserFromDatabase(identifier: string) {
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT * FROM public.users WHERE (LOWER(identifier) = LOWER($1) OR LOWER(email) = LOWER($1)) AND role = 'admin'`,
          [identifier],
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (err: any) {
        console.warn("⚠️ Admin DB lookup notice:", err.message);
      }
    }

    // Hardcoded fallback admin
    if (identifier.toLowerCase() === "admin@littlecreators.com" || identifier.toLowerCase() === "admin") {
      return {
        id: "admin-1", identifier: "admin@littlecreators.com",
        email: "admin@littlecreators.com", name: "Admin User",
        password: "Admin@123456", role: "admin",
      };
    }
    return null;
  }
}

export const db = new Database();
