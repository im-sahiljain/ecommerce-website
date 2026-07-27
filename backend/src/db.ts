import { Pool } from "pg";
import dotenv from "dotenv";
import { getPgPool } from "./models/pool";
import { initPostgresSchema } from "./models/schema";
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
  DatabaseSchema,
} from "./types";

export * from "./types";

const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: "sec-space",
    type: "theme_section",
    title: "Space Adventures",
    themeKeyword: "Space",
    titleLayout: "left",
    bgColor: "#2D366D",
    textColor: "#FFFFFF",
    topDividerFill: "white",
    cardSize: "large",
    layoutTemplate: "carousel",
    productLineId: "line-1",
    isVisible: true,
    sortOrder: 1,
    decorations: [
      { id: "s1", type: "emoji", content: "🪐", style: { top: "15%", left: "5%", fontSize: "48px", opacity: 0.9, transform: "rotate(-15deg)" } },
      { id: "s2", type: "emoji", content: "⭐", style: { top: "8%", left: "30%", fontSize: "18px", opacity: 0.8 }, className: "hidden sm:block" },
      { id: "s3", type: "emoji", content: "✨", style: { top: "12%", right: "8%", fontSize: "14px", opacity: 0.7 }, className: "hidden sm:block" },
      { id: "s4", type: "emoji", content: "⭐", style: { top: "5%", right: "15%", fontSize: "20px", opacity: 0.8 } },
      { id: "s5", type: "emoji", content: "🌍", style: { top: "25%", right: "3%", fontSize: "42px", opacity: 0.85 }, className: "hidden md:block" },
      { id: "s6", type: "emoji", content: "🚀", style: { bottom: "30%", left: "8%", fontSize: "36px", opacity: 0.8, transform: "rotate(25deg)" }, className: "hidden sm:block" },
      { id: "s7", type: "emoji", content: "🚀", style: { bottom: "15%", right: "5%", fontSize: "38px", opacity: 0.8, transform: "rotate(-20deg) scaleX(-1)" }, className: "hidden sm:block" }
    ]
  },
  {
    id: "sec-garden",
    type: "theme_section",
    title: "Secret Garden (Floral)",
    themeKeyword: "Garden",
    titleLayout: "center",
    bgColor: "#D1E7D2",
    textColor: "#3C2A21",
    topDividerFill: "#2D366D",
    cardSize: "large",
    layoutTemplate: "carousel",
    productLineId: "line-1",
    isVisible: true,
    sortOrder: 2,
    decorations: [
      { id: "g1", type: "emoji", content: "🌿", style: { top: "20px", left: "20px", fontSize: "46px", opacity: 0.85 }, className: "hidden sm:block" },
      { id: "g2", type: "emoji", content: "🌺", style: { bottom: "20px", right: "20px", fontSize: "46px", opacity: 0.85 }, className: "hidden sm:block" },
      { id: "g3", type: "emoji", content: "🌸", style: { top: "15%", right: "12%", fontSize: "36px", opacity: 0.8 }, className: "hidden sm:block" },
      { id: "g4", type: "emoji", content: "🦋", style: { top: "25%", left: "10%", fontSize: "38px", opacity: 0.8 }, className: "hidden sm:block" }
    ]
  },
  {
    id: "sec-fairytale",
    type: "theme_section",
    title: "Fairytale Magic",
    themeKeyword: "Fairytale",
    titleLayout: "left",
    bgColor: "#F1E4F7",
    textColor: "#3C2A21",
    topDividerFill: "#D1E7D2",
    cardSize: "small",
    layoutTemplate: "carousel",
    productLineId: "line-1",
    isVisible: true,
    sortOrder: 3,
    decorations: [
      { id: "f1", type: "emoji", content: "🏰", style: { bottom: "20px", left: "20px", fontSize: "44px", opacity: 0.85 }, className: "hidden md:block" },
      { id: "f2", type: "emoji", content: "🦄", style: { top: "18%", right: "8%", fontSize: "42px", opacity: 0.85 }, className: "hidden sm:block" },
      { id: "f3", type: "emoji", content: "👑", style: { top: "12%", left: "25%", fontSize: "32px", opacity: 0.8 }, className: "hidden sm:block" }
    ]
  },
  {
    id: "sec-wild",
    type: "theme_section",
    title: "Wild Kingdom",
    themeKeyword: "Wild",
    titleLayout: "right",
    bgColor: "#F9E6C3",
    textColor: "#3C2A21",
    topDividerFill: "#F1E4F7",
    cardSize: "small",
    layoutTemplate: "carousel",
    productLineId: "line-1",
    isVisible: true,
    sortOrder: 4,
    decorations: [
      { id: "w1", type: "emoji", content: "🍃", style: { bottom: "20px", left: "20px", fontSize: "46px", opacity: 0.85 }, className: "hidden sm:block" },
      { id: "w2", type: "emoji", content: "🐾", style: { top: "20px", right: "20px", fontSize: "38px", opacity: 0.75 }, className: "hidden sm:block" },
      { id: "w3", type: "emoji", content: "🦁", style: { top: "15%", left: "12%", fontSize: "40px", opacity: 0.85 }, className: "hidden sm:block" },
      { id: "w4", type: "emoji", content: "🐘", style: { bottom: "15%", right: "10%", fontSize: "40px", opacity: 0.85 }, className: "hidden sm:block" }
    ]
  }
];

export class Database {
  private data: DatabaseSchema;
  public pgPool: Pool | null = null;

  constructor() {
    this.pgPool = getPgPool();
    if (this.pgPool) {
      initPostgresSchema(this.pgPool);
    }

    const emptySettings: SiteSettings = {
      isGlobalOrderingEnabled: true,
      whatsappNumber: "",
      whatsappMessageTemplate: "",
      isWhatsappEnabled: false,
      siteTitle: "Little Creators",
      defaultMetaDescription: "",
    };

    this.data = {
      products: [],
      productLines: [],
      categories: [],
      facets: [],
      themes: [],
      ageGroups: [],
      users: [],
      orders: [],
      addresses: [],
      bundleRules: [],
      stockLogs: [],
      analytics: {},
      settings: emptySettings,
      homepageSections: [],
      slugRedirects: [],
    };

    if (this.pgPool) {
      this.loadFromSupabasePostgres();
    }
  }

  public async loadFromSupabasePostgres() {
    if (!this.pgPool) return;
    try {
      // Ensure role column, admin user, and images column exist in PostgreSQL database
      await this.pgPool
        .query(
          `
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT;
        INSERT INTO public.users (id, identifier, email, name, password, role)
        VALUES ('admin-1', 'admin@littlecreators.com', 'admin@littlecreators.com', 'Admin User', 'Admin@123456', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', password = EXCLUDED.password;
      `,
        )
        .catch((err) =>
          console.warn("⚠️ DB schema ensure notice:", err.message),
        );

      // 1. Load Products
      const prodRes = await this.pgPool.query(`SELECT * FROM public.products`);
      if (prodRes.rows.length > 0) {
        this.data.products = prodRes.rows.map((r) => {
          let parsedImages: string[] = [];
          if (r.images) {
            if (Array.isArray(r.images)) {
              parsedImages = r.images;
            } else if (typeof r.images === "string") {
              const str = r.images.trim();
              if (str.startsWith("[") && str.endsWith("]")) {
                try {
                  parsedImages = JSON.parse(str);
                } catch (e) {}
              } else if (str.startsWith("{") && str.endsWith("}")) {
                parsedImages = str
                  .slice(1, -1)
                  .split(",")
                  .map((s: string) =>
                    s.trim().replace(/^"/, "").replace(/"$/, ""),
                  )
                  .filter(Boolean);
              } else if (str.length > 0) {
                parsedImages = [str];
              }
            }
          }
          if (parsedImages.length === 0 && r.image) {
            parsedImages = [r.image];
          }

          return {
            id: r.id,
            sku: r.sku || undefined,
            name: r.name,
            slug: r.slug || r.id,
            price: Number(r.price),
            originalPrice: r.original_price
              ? Number(r.original_price)
              : undefined,
            costPrice: r.cost_price ? Number(r.cost_price) : undefined,
            theme: r.theme || "General",
            category: r.category || "General",
            ageGroup: r.age_group || "All Ages",
            productLineId: r.product_line_id || undefined,
            isNonToxic: r.is_non_toxic !== false,
            image: r.image || parsedImages[0] || "",
            images: parsedImages,
            description: r.description || "",
            inStock: r.in_stock !== false,
            stockQuantity: r.stock_quantity ? Number(r.stock_quantity) : 10,
            isOrderingEnabled: r.is_ordering_enabled !== false,
            createdAt: r.created_at
              ? new Date(r.created_at).toISOString()
              : undefined,
            updatedAt: r.updated_at
              ? new Date(r.updated_at).toISOString()
              : undefined,
          };
        });
        console.log(
          `⚡ Loaded ${this.data.products.length} products from PostgreSQL database`,
        );
      }

      // 2. Load Categories
      const catRes = await this.pgPool.query(`SELECT * FROM public.categories`);
      if (catRes.rows.length > 0) {
        this.data.categories = catRes.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          productLineId: r.product_line_id,
          description: r.description,
        }));
      }

      // 3. Load Product Lines
      const lineRes = await this.pgPool.query(
        `SELECT * FROM public.product_lines`,
      );
      if (lineRes.rows.length > 0) {
        this.data.productLines = lineRes.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          icon: r.icon,
          isVisible: r.is_visible !== false,
          sortOrder: r.sort_order || 1,
        }));
      }

      // 4. Load Orders
      const orderRes = await this.pgPool
        .query(`SELECT * FROM public.orders ORDER BY created_at DESC`)
        .catch(() => null);
      if (orderRes && orderRes.rows.length > 0) {
        this.data.orders = orderRes.rows.map((r) => ({
          id: r.id,
          orderNumber: r.order_number,
          userIdentifier: r.user_identifier,
          customerName: r.customer_name,
          shippingAddress: r.shipping_address,
          phone: r.phone,
          items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
          subtotal: Number(r.subtotal),
          shipping: Number(r.shipping),
          total: Number(r.total),
          status: r.status,
          createdAt: r.created_at,
          trackingNumber: r.tracking_number,
        }));
      }

      // 5. Load Bundle Rules
      const bundleRes = await this.pgPool
        .query(`SELECT * FROM public.bundle_rules`)
        .catch(() => null);
      if (bundleRes && bundleRes.rows.length > 0) {
        this.data.bundleRules = bundleRes.rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          applicableScope: r.applicable_scope || "all",
          scopeValue: r.scope_value,
          requirementMode: r.requirement_mode || "exact",
          tiers: typeof r.tiers === "string" ? JSON.parse(r.tiers) : r.tiers,
          isActive: r.is_active !== false,
          priority: r.priority || 0,
        }));
        console.log(
          `⚡ Loaded ${this.data.bundleRules.length} bundle rules from PostgreSQL database`,
        );
      }

      // 6. Load Settings
      const settingsRes = await this.pgPool
        .query(`SELECT * FROM public.site_settings LIMIT 1`)
        .catch(() => null);
      if (settingsRes && settingsRes.rows.length > 0) {
        const s = settingsRes.rows[0];
        this.data.settings = {
          isGlobalOrderingEnabled: s.is_global_ordering_enabled !== false,
          whatsappNumber: s.whatsapp_number || "",
          whatsappMessageTemplate: s.whatsapp_message_template || "",
          isWhatsappEnabled: s.is_whatsapp_enabled !== false,
          siteTitle: s.site_title || "Little Creators",
          defaultMetaDescription: s.default_meta_description || "",
        };
      }

      // 7. Load & Auto-Seed Homepage Sections from PostgreSQL
      await this.pgPool
        .query(
          `
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
      `,
        )
        .catch((err) =>
          console.warn("⚠️ Create homepage_sections table notice:", err.message),
        );

      const secRes = await this.pgPool
        .query(`SELECT * FROM public.homepage_sections ORDER BY sort_order ASC`)
        .catch(() => null);

      if (secRes && secRes.rows.length > 0) {
        this.data.homepageSections = secRes.rows.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          subtitle: r.subtitle || undefined,
          themeKeyword: r.theme_keyword || undefined,
          titleLayout: r.title_layout || "left",
          bgColor: r.bg_color || "#FFFFFF",
          textColor: r.text_color || "#3C2A21",
          topDividerFill: r.top_divider_fill || "white",
          cardSize: r.card_size || "large",
          layoutTemplate: r.layout_template || "carousel",
          productLineId: r.product_line_id || undefined,
          categoryId: r.category_id || undefined,
          decorations:
            typeof r.decorations === "string"
              ? JSON.parse(r.decorations)
              : r.decorations || [],
          isVisible: r.is_visible !== false,
          sortOrder: Number(r.sort_order) || 1,
        }));
        console.log(
          `⚡ Loaded ${this.data.homepageSections.length} homepage sections from PostgreSQL database`,
        );
      } else {
        // Table exists but is empty -> Auto-seed default sections into PostgreSQL
        this.data.homepageSections = [...DEFAULT_HOMEPAGE_SECTIONS];
        for (const sec of DEFAULT_HOMEPAGE_SECTIONS) {
          await this.pgPool
            .query(
              `
            INSERT INTO public.homepage_sections 
            (id, type, title, subtitle, theme_keyword, title_layout, bg_color, text_color, top_divider_fill, card_size, layout_template, product_line_id, category_id, decorations, is_visible, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (id) DO NOTHING;
          `,
              [
                sec.id,
                sec.type,
                sec.title,
                sec.subtitle || null,
                sec.themeKeyword || null,
                sec.titleLayout || "left",
                sec.bgColor || "#2D366D",
                sec.textColor || "#FFFFFF",
                sec.topDividerFill || "white",
                sec.cardSize || "large",
                sec.layoutTemplate || "carousel",
                sec.productLineId || null,
                sec.categoryId || null,
                JSON.stringify(sec.decorations || []),
                sec.isVisible !== false,
                sec.sortOrder || 1,
              ],
            )
            .catch((err) =>
              console.warn(`⚠️ Auto-seed section error:`, err.message),
            );
        }
        console.log(
          `🌱 Auto-seeded ${DEFAULT_HOMEPAGE_SECTIONS.length} default homepage sections into PostgreSQL`,
        );
      }

      // 8. Load Themes from PostgreSQL
      await this.pgPool
        .query(
          `
        CREATE TABLE IF NOT EXISTS public.themes (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(50)
        );
      `,
        )
        .catch(() => null);

      const themeRes = await this.pgPool
        .query(`SELECT * FROM public.themes`)
        .catch(() => null);

      if (themeRes && themeRes.rows.length > 0) {
        this.data.themes = themeRes.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description || undefined,
          icon: r.icon || "🎨",
        }));
        console.log(
          `⚡ Loaded ${this.data.themes.length} themes from PostgreSQL database`,
        );
      }
    } catch (err: any) {
      console.warn("⚠️ Error loading records from PostgreSQL:", err.message);
    }
  }

  public syncAllToSupabasePostgres() {
    if (!this.pgPool) return;
    console.log(
      "⚡ Syncing all data into Supabase PostgreSQL database tables...",
    );

    // 1. Sync Product Lines
    (this.data.productLines || []).forEach((line) => {
      this.pgPool
        ?.query(
          `
        INSERT INTO public.product_lines (id, name, slug, description, icon, is_visible, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          is_visible = EXCLUDED.is_visible,
          sort_order = EXCLUDED.sort_order;
      `,
          [
            line.id,
            line.name,
            line.slug || line.id,
            line.description || "",
            line.icon || "📦",
            line.isVisible !== false,
            line.sortOrder || 1,
          ],
        )
        .catch((err) =>
          console.warn(
            `⚠️ Supabase PG sync product_lines notice:`,
            err.message,
          ),
        );
    });

    // 2. Sync Bundle Rules
    (this.data.bundleRules || []).forEach((rule) => {
      this.pgPool
        ?.query(
          `
        INSERT INTO public.bundle_rules (id, name, description, applicable_scope, scope_value, requirement_mode, tiers, is_active, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          applicable_scope = EXCLUDED.applicable_scope,
          scope_value = EXCLUDED.scope_value,
          requirement_mode = EXCLUDED.requirement_mode,
          tiers = EXCLUDED.tiers,
          is_active = EXCLUDED.is_active,
          priority = EXCLUDED.priority;
      `,
          [
            rule.id,
            rule.name,
            rule.description || "",
            rule.applicableScope || "all",
            rule.scopeValue || "",
            rule.requirementMode || "exact",
            JSON.stringify(rule.tiers),
            rule.isActive !== false,
            rule.priority || 1,
          ],
        )
        .catch((err) =>
          console.warn(`⚠️ Supabase PG sync bundle_rules notice:`, err.message),
        );
    });

    // 3. Sync Categories
    (this.data.categories || []).forEach((cat) => {
      this.pgPool
        ?.query(
          `
        INSERT INTO public.categories (id, name, slug, product_line_id, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          product_line_id = EXCLUDED.product_line_id,
          description = EXCLUDED.description;
      `,
          [
            cat.id,
            cat.name,
            cat.slug || cat.id,
            cat.productLineId || "line-1",
            cat.description || "",
          ],
        )
        .catch((err) =>
          console.warn(`⚠️ Supabase PG sync categories notice:`, err.message),
        );
    });

    // 4. Sync Products
    (this.data.products || []).forEach((prod) => {
      this.pgPool
        ?.query(
          `
        INSERT INTO public.products (id, sku, name, price, original_price, cost_price, theme, category, age_group, product_line_id, is_non_toxic, image, images, description, in_stock, stock_quantity, is_ordering_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          image = EXCLUDED.image,
          images = EXCLUDED.images,
          stock_quantity = EXCLUDED.stock_quantity,
          in_stock = EXCLUDED.in_stock;
      `,
          [
            prod.id,
            prod.sku || prod.id,
            prod.name,
            prod.price,
            prod.originalPrice || null,
            prod.costPrice || null,
            prod.theme || "",
            prod.category || "",
            prod.ageGroup || "",
            prod.productLineId || "line-1",
            prod.isNonToxic !== false,
            prod.image || "",
            JSON.stringify(prod.images || [prod.image]),
            prod.description || "",
            prod.inStock !== false,
            prod.stockQuantity || 10,
            prod.isOrderingEnabled !== false,
          ],
        )
        .catch((err) =>
          console.warn(`⚠️ Supabase PG sync products notice:`, err.message),
        );
    });

    // 5. Sync Themes
    (this.data.themes || []).forEach((t) => {
      this.pgPool
        ?.query(
          `
        INSERT INTO public.themes (id, name, slug, description, icon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon;
      `,
          [
            t.id,
            t.name,
            t.slug || t.name.toLowerCase().replace(/\s+/g, "-"),
            t.description || "",
            t.icon || "🎨",
          ],
        )
        .catch((err) =>
          console.warn(`⚠️ Supabase PG sync themes notice:`, err.message),
        );
    });

    // 6. Sync Homepage Sections
    (this.data.homepageSections || []).forEach((sec) => {
      this.pgPool
        ?.query(
          `
        INSERT INTO public.homepage_sections (id, type, title, subtitle, theme_keyword, title_layout, bg_color, text_color, top_divider_fill, card_size, layout_template, product_line_id, category_id, decorations, is_visible, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          theme_keyword = EXCLUDED.theme_keyword,
          title_layout = EXCLUDED.title_layout,
          bg_color = EXCLUDED.bg_color,
          text_color = EXCLUDED.text_color,
          decorations = EXCLUDED.decorations,
          is_visible = EXCLUDED.is_visible,
          sort_order = EXCLUDED.sort_order;
      `,
          [
            sec.id,
            sec.type,
            sec.title,
            sec.subtitle || null,
            sec.themeKeyword || null,
            sec.titleLayout || "left",
            sec.bgColor || "#2D366D",
            sec.textColor || "#FFFFFF",
            sec.topDividerFill || "white",
            sec.cardSize || "large",
            sec.layoutTemplate || "carousel",
            sec.productLineId || null,
            sec.categoryId || null,
            JSON.stringify(sec.decorations || []),
            sec.isVisible !== false,
            sec.sortOrder || 1,
          ],
        )
        .catch((err) =>
          console.warn(
            `⚠️ Supabase PG sync homepage_sections notice:`,
            err.message,
          ),
        );
    });
  }

  private save() {
    this.syncAllToSupabasePostgres();
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  addProduct(product: Omit<Product, "id">): Product {
    const now = new Date().toISOString();
    const imagesList =
      product.images && product.images.length > 0
        ? product.images
        : [
            product.image ||
              "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500",
          ];
    const createdAtVal = product.createdAt || now;
    const updatedAtVal = product.updatedAt || now;

    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      image: imagesList[0],
      images: imagesList,
      createdAt: createdAtVal,
      updatedAt: updatedAtVal,
    };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = this.data.products[idx];
    const newImages =
      updates.images !== undefined ? updates.images : existing.images;
    const mainImage =
      updates.image ||
      (newImages && newImages.length > 0 ? newImages[0] : existing.image);
    const now = new Date().toISOString();
    const createdAtVal = existing.createdAt || now;

    this.data.products[idx] = {
      ...existing,
      ...updates,
      image: mainImage,
      images: newImages && newImages.length > 0 ? newImages : [mainImage],
      createdAt: createdAtVal,
      updatedAt: now,
    };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    this.save();

    if (this.pgPool) {
      this.pgPool
        .query(`DELETE FROM public.products WHERE id = $1;`, [id])
        .catch((err) =>
          console.warn("⚠️ Supabase PG delete product notice:", err.message),
        );
    }

    return this.data.products.length < initialLen;
  }

  // Categories
  getCategories(): Category[] {
    return this.data.categories;
  }

  addCategory(category: Omit<Category, "id">): Category {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.save();
    return true;
  }

  // Themes
  getThemes(): Theme[] {
    return this.data.themes;
  }

  addTheme(theme: Omit<Theme, "id">): Theme {
    const newTheme: Theme = {
      ...theme,
      id: `theme-${Date.now()}`,
      slug: theme.slug || theme.name.toLowerCase().replace(/\s+/g, "-"),
    };
    if (!this.data.themes) this.data.themes = [];
    this.data.themes.push(newTheme);
    this.save();

    if (this.pgPool) {
      this.pgPool
        .query(
          `
        INSERT INTO public.themes (id, name, slug, description, icon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon;
      `,
          [
            newTheme.id,
            newTheme.name,
            newTheme.slug,
            newTheme.description || "",
            newTheme.icon || "🎨",
          ],
        )
        .catch((err) => console.warn("⚠️ PG theme insert notice:", err.message));
    }

    return newTheme;
  }

  updateTheme(id: string, updates: Partial<Theme>): Theme | null {
    if (!this.data.themes) return null;
    const idx = this.data.themes.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updatedTheme = { ...this.data.themes[idx], ...updates };
    this.data.themes[idx] = updatedTheme;
    this.save();

    if (this.pgPool) {
      this.pgPool
        .query(
          `
        UPDATE public.themes
        SET name = $1, slug = $2, description = $3, icon = $4
        WHERE id = $5;
      `,
          [
            updatedTheme.name,
            updatedTheme.slug ||
              updatedTheme.name.toLowerCase().replace(/\s+/g, "-"),
            updatedTheme.description || "",
            updatedTheme.icon || "🎨",
            id,
          ],
        )
        .catch((err) => console.warn("⚠️ PG theme update notice:", err.message));
    }

    return updatedTheme;
  }

  deleteTheme(id: string): boolean {
    if (!this.data.themes) return false;
    const initLen = this.data.themes.length;
    this.data.themes = this.data.themes.filter((t) => t.id !== id);
    if (this.data.themes.length < initLen) {
      this.save();
      if (this.pgPool) {
        this.pgPool
          .query(`DELETE FROM public.themes WHERE id = $1`, [id])
          .catch(() => null);
      }
      return true;
    }
    return false;
  }

  // Age Groups
  getAgeGroups(): AgeGroup[] {
    return this.data.ageGroups;
  }

  addAgeGroup(ageGroup: Omit<AgeGroup, "id">): AgeGroup {
    const newGroup: AgeGroup = { ...ageGroup, id: `age-${Date.now()}` };
    this.data.ageGroups.push(newGroup);
    this.save();
    return newGroup;
  }

  deleteAgeGroup(id: string): boolean {
    this.data.ageGroups = this.data.ageGroups.filter((a) => a.id !== id);
    this.save();
    return true;
  }

  // Users (Persisted to both Supabase PostgreSQL and local DB storage)
  getUserByIdentifier(identifier: string): User | undefined {
    if (!this.data.users) this.data.users = [];
    return this.data.users.find(
      (u) => u.identifier.toLowerCase() === identifier.toLowerCase(),
    );
  }

  findOrCreateUser(identifier: string, name?: string, password?: string): User {
    if (!this.data.users) this.data.users = [];
    let user = this.data.users.find(
      (u) => u.identifier.toLowerCase() === identifier.toLowerCase(),
    );

    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        identifier,
        name: name || identifier.split("@")[0],
        email: identifier.includes("@") ? identifier : "",
        phone: !identifier.includes("@") ? identifier : "",
        password: password || "password123",
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(user);
      this.save();

      // Persist to Supabase PostgreSQL Database if connected
      if (this.pgPool) {
        this.pgPool
          .query(
            `
          INSERT INTO public.users (id, identifier, name, email, phone, password, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (identifier) DO UPDATE SET
            name = EXCLUDED.name,
            password = EXCLUDED.password;
        `,
            [
              user.id,
              user.identifier,
              user.name,
              user.email,
              user.phone,
              user.password,
              user.createdAt,
            ],
          )
          .then(() =>
            console.log(
              `⚡ User registration for ${user?.identifier} persisted to Supabase PostgreSQL`,
            ),
          )
          .catch((err) =>
            console.warn("⚠️ Supabase PG user insert notice:", err.message),
          );
      }
    }
    return user;
  }

  updateUserProfile(identifier: string, updates: Partial<User>): User | null {
    if (!this.data.users) this.data.users = [];
    const idx = this.data.users.findIndex(
      (u) => u.identifier.toLowerCase() === identifier.toLowerCase(),
    );
    if (idx === -1) return null;

    // Filter editable fields
    const { name, email, phone, address, city, state, zipCode } = updates;
    const current = this.data.users[idx];

    this.data.users[idx] = {
      ...current,
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zipCode !== undefined && { zipCode }),
    };
    this.save();

    // Dual-persist profile updates to Supabase PostgreSQL if connected
    if (this.pgPool) {
      const u = this.data.users[idx];
      this.pgPool
        .query(
          `
        UPDATE public.users
        SET name = $1, email = $2, phone = $3, address = $4, city = $5, state = $6, zip_code = $7
        WHERE LOWER(identifier) = LOWER($8);
      `,
          [
            u.name,
            u.email,
            u.phone,
            u.address,
            u.city,
            u.state,
            u.zipCode,
            identifier,
          ],
        )
        .then(() =>
          console.log(
            `⚡ Profile for ${identifier} updated in Supabase PostgreSQL`,
          ),
        )
        .catch((err) =>
          console.warn("⚠️ Supabase PG profile update notice:", err.message),
        );
    }

    return this.data.users[idx];
  }

  // User Addresses (Multi-Address Management)
  getUserAddresses(identifier: string): UserAddress[] {
    if (!this.data.addresses) this.data.addresses = [];
    return this.data.addresses.filter(
      (a) => a.userIdentifier.toLowerCase() === identifier.toLowerCase(),
    );
  }

  addUserAddress(
    identifier: string,
    addressData: Omit<UserAddress, "id" | "userIdentifier" | "createdAt">,
  ): UserAddress {
    if (!this.data.addresses) this.data.addresses = [];
    const userAddresses = this.getUserAddresses(identifier);
    const isFirst = userAddresses.length === 0;

    const newAddress: UserAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
      userIdentifier: identifier,
      isDefault: addressData.isDefault || isFirst,
      createdAt: new Date().toISOString(),
    };

    if (newAddress.isDefault) {
      this.data.addresses.forEach((a) => {
        if (a.userIdentifier.toLowerCase() === identifier.toLowerCase()) {
          a.isDefault = false;
        }
      });
    }

    this.data.addresses.push(newAddress);
    this.save();

    // Dual-persist to Supabase PostgreSQL if connected
    if (this.pgPool) {
      if (newAddress.isDefault) {
        this.pgPool
          .query(
            `UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1);`,
            [identifier],
          )
          .catch(() => {});
      }
      this.pgPool
        .query(
          `
        INSERT INTO public.user_addresses (id, user_identifier, label, full_name, phone, address_line, city, state, zip_code, is_default, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING;
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
          ],
        )
        .then(() =>
          console.log(
            `⚡ Address ${newAddress.id} persisted to Supabase PostgreSQL`,
          ),
        )
        .catch((err) =>
          console.warn("⚠️ Supabase PG address insert notice:", err.message),
        );
    }

    return newAddress;
  }

  setDefaultAddress(identifier: string, addressId: string): boolean {
    if (!this.data.addresses) return false;
    let found = false;

    this.data.addresses.forEach((a) => {
      if (a.userIdentifier.toLowerCase() === identifier.toLowerCase()) {
        if (a.id === addressId) {
          a.isDefault = true;
          found = true;
        } else {
          a.isDefault = false;
        }
      }
    });

    if (found) {
      this.save();
      if (this.pgPool) {
        this.pgPool
          .query(
            `UPDATE public.user_addresses SET is_default = FALSE WHERE LOWER(user_identifier) = LOWER($1);`,
            [identifier],
          )
          .then(() =>
            this.pgPool?.query(
              `UPDATE public.user_addresses SET is_default = TRUE WHERE id = $1;`,
              [addressId],
            ),
          )
          .catch((err) =>
            console.warn(
              "⚠️ Supabase PG set default address notice:",
              err.message,
            ),
          );
      }
    }
    return found;
  }

  deleteUserAddress(identifier: string, addressId: string): boolean {
    if (!this.data.addresses) return false;
    const initialLen = this.data.addresses.length;
    this.data.addresses = this.data.addresses.filter(
      (a) =>
        !(
          a.userIdentifier.toLowerCase() === identifier.toLowerCase() &&
          a.id === addressId
        ),
    );

    if (this.data.addresses.length < initialLen) {
      this.save();
      if (this.pgPool) {
        this.pgPool
          .query(
            `DELETE FROM public.user_addresses WHERE id = $1 AND LOWER(user_identifier) = LOWER($2);`,
            [addressId, identifier],
          )
          .catch((err) =>
            console.warn("⚠️ Supabase PG delete address notice:", err.message),
          );
      }
      return true;
    }
    return false;
  }

  // Orders
  getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  getOrdersByUser(identifier: string): Order[] {
    return this.data.orders
      .filter(
        (o) => o.userIdentifier.toLowerCase() === identifier.toLowerCase(),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(
    order: Omit<Order, "id" | "orderNumber" | "createdAt" | "status">,
  ): Order {
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: "Pending",
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };
    if (!this.data.orders) this.data.orders = [];
    this.data.orders.unshift(newOrder);
    this.save();

    // Persist to Supabase PostgreSQL Database if connected
    if (this.pgPool) {
      this.pgPool
        .query(
          `
        INSERT INTO public.orders (id, order_number, user_identifier, customer_name, shipping_address, phone, items, subtotal, shipping, total, status, created_at, tracking_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING;
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
          ],
        )
        .then(() =>
          console.log(
            `⚡ Order ${newOrder.id} persisted to Supabase PostgreSQL`,
          ),
        )
        .catch((err) =>
          console.warn("⚠️ Supabase PG order insert notice:", err.message),
        );
    }

    return newOrder;
  }

  updateOrderStatus(id: string, status: Order["status"]): Order | null {
    const order = this.data.orders.find(
      (o) => o.id === id || o.orderNumber === id,
    );
    if (!order) return null;
    order.status = status;
    this.save();
    return order;
  }

  // Product Lines Management
  getProductLines(): ProductLine[] {
    return (this.data.productLines || []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }

  addProductLine(line: Omit<ProductLine, "id">): ProductLine {
    const newLine: ProductLine = {
      ...line,
      id: `line-${Date.now()}`,
    };
    if (!this.data.productLines) this.data.productLines = [];
    this.data.productLines.push(newLine);
    this.save();
    return newLine;
  }

  updateProductLine(
    id: string,
    updates: Partial<ProductLine>,
  ): ProductLine | null {
    if (!this.data.productLines) return null;
    const idx = this.data.productLines.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    this.data.productLines[idx] = {
      ...this.data.productLines[idx],
      ...updates,
    };
    this.save();
    return this.data.productLines[idx];
  }

  deleteProductLine(id: string): boolean {
    if (!this.data.productLines) return false;
    const initLen = this.data.productLines.length;
    this.data.productLines = this.data.productLines.filter((l) => l.id !== id);
    if (this.data.productLines.length < initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Category Facets Management
  getFacets(): CategoryFacet[] {
    return (this.data.facets || []).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  addFacet(facet: Omit<CategoryFacet, "id">): CategoryFacet {
    const newFacet: CategoryFacet = {
      ...facet,
      id: `facet-${Date.now()}`,
    };
    if (!this.data.facets) this.data.facets = [];
    this.data.facets.push(newFacet);
    this.save();
    return newFacet;
  }

  updateFacet(
    id: string,
    updates: Partial<CategoryFacet>,
  ): CategoryFacet | null {
    if (!this.data.facets) return null;
    const idx = this.data.facets.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.data.facets[idx] = { ...this.data.facets[idx], ...updates };
    this.save();
    return this.data.facets[idx];
  }

  deleteFacet(id: string): boolean {
    if (!this.data.facets) return false;
    const initLen = this.data.facets.length;
    this.data.facets = this.data.facets.filter((f) => f.id !== id);
    if (this.data.facets.length < initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Bundle Rules Management
  getBundleRules(): BundleRule[] {
    return (this.data.bundleRules || []).sort(
      (a, b) => b.priority - a.priority,
    );
  }

  addBundleRule(rule: Omit<BundleRule, "id">): BundleRule {
    const newRule: BundleRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };
    if (!this.data.bundleRules) this.data.bundleRules = [];
    this.data.bundleRules.push(newRule);
    this.save();
    return newRule;
  }

  updateBundleRule(
    id: string,
    updates: Partial<BundleRule>,
  ): BundleRule | null {
    if (!this.data.bundleRules) return null;
    const idx = this.data.bundleRules.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.bundleRules[idx] = { ...this.data.bundleRules[idx], ...updates };
    this.save();
    return this.data.bundleRules[idx];
  }

  deleteBundleRule(id: string): boolean {
    if (!this.data.bundleRules) return false;
    const initLen = this.data.bundleRules.length;
    this.data.bundleRules = this.data.bundleRules.filter((r) => r.id !== id);
    if (this.data.bundleRules.length < initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Stock Adjustment Audit Trail
  adjustProductStock(
    productId: string,
    changeAmount: number,
    reason: string,
    updatedBy: string = "Admin",
  ): Product | null {
    const product = this.data.products.find((p) => p.id === productId);
    if (!product) return null;

    const currentQty =
      product.stockQuantity !== undefined ? product.stockQuantity : 10;
    const newQty = Math.max(0, currentQty + changeAmount);
    product.stockQuantity = newQty;
    product.inStock = newQty > 0;

    const stockLog: StockLog = {
      id: `log-${Date.now()}`,
      productId,
      changeAmount,
      newQuantity: newQty,
      reason,
      updatedBy,
      timestamp: new Date().toISOString(),
    };

    if (!this.data.stockLogs) this.data.stockLogs = [];
    this.data.stockLogs.unshift(stockLog);
    this.save();
    return product;
  }

  getStockLogs(productId?: string): StockLog[] {
    if (!this.data.stockLogs) return [];
    if (productId) {
      return this.data.stockLogs.filter((l) => l.productId === productId);
    }
    return this.data.stockLogs;
  }

  // Analytics & Engagement
  getProductAnalytics(productId: string): ProductAnalytics {
    if (!this.data.analytics) this.data.analytics = {};
    if (!this.data.analytics[productId]) {
      this.data.analytics[productId] = {
        productId,
        views: 0,
        likes: 0,
        wishlistedBy: [],
        unitsOrdered: 0,
        totalRevenue: 0,
      };
    }
    return this.data.analytics[productId];
  }

  recordProductView(productId: string): void {
    const analytics = this.getProductAnalytics(productId);
    analytics.views += 1;
    this.save();
  }

  likeProduct(
    productId: string,
    userIdentifier: string = "guest",
  ): { likes: number; isLiked: boolean } {
    const analytics = this.getProductAnalytics(productId);
    const idx = analytics.wishlistedBy.indexOf(userIdentifier);
    let isLiked = false;

    if (idx === -1) {
      analytics.wishlistedBy.push(userIdentifier);
      analytics.likes += 1;
      isLiked = true;
    } else {
      analytics.wishlistedBy.splice(idx, 1);
      analytics.likes = Math.max(0, analytics.likes - 1);
      isLiked = false;
    }
    this.save();
    return { likes: analytics.likes, isLiked };
  }

  getAllAnalytics(): Record<string, ProductAnalytics> {
    return this.data.analytics || {};
  }

  // Site Settings
  getSettings(): SiteSettings {
    return (
      this.data.settings || {
        isGlobalOrderingEnabled: true,
        whatsappNumber: "+919876543210",
        whatsappMessageTemplate:
          "Hi! I am interested in {productName} ({productUrl}). Can you help me with details?",
        isWhatsappEnabled: true,
        siteTitle: "Little Creators Craft Hub",
        defaultMetaDescription:
          "Ready-to-paint craft figurines, scented aesthetic wax candles, and creative art kits.",
      }
    );
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    const updated = { ...this.getSettings(), ...updates };
    this.data.settings = updated;
    this.save();

    if (this.pgPool) {
      this.pgPool
        .query(
          `
        CREATE TABLE IF NOT EXISTS public.site_settings (
          id INT PRIMARY KEY DEFAULT 1,
          is_global_ordering_enabled BOOLEAN DEFAULT TRUE,
          whatsapp_number VARCHAR(100),
          whatsapp_message_template TEXT,
          is_whatsapp_enabled BOOLEAN DEFAULT TRUE,
          site_title VARCHAR(255),
          default_meta_description TEXT
        );
      `,
        )
        .then(() =>
          this.pgPool?.query(
            `
          INSERT INTO public.site_settings (id, is_global_ordering_enabled, whatsapp_number, whatsapp_message_template, is_whatsapp_enabled, site_title, default_meta_description)
          VALUES (1, $1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            is_global_ordering_enabled = EXCLUDED.is_global_ordering_enabled,
            whatsapp_number = EXCLUDED.whatsapp_number,
            whatsapp_message_template = EXCLUDED.whatsapp_message_template,
            is_whatsapp_enabled = EXCLUDED.is_whatsapp_enabled,
            site_title = EXCLUDED.site_title,
            default_meta_description = EXCLUDED.default_meta_description;
        `,
            [
              updated.isGlobalOrderingEnabled !== false,
              updated.whatsappNumber || "",
              updated.whatsappMessageTemplate || "",
              updated.isWhatsappEnabled !== false,
              updated.siteTitle || "Little Creators",
              updated.defaultMetaDescription || "",
            ],
          ),
        )
        .catch((err) =>
          console.warn("⚠️ PG site_settings update notice:", err.message),
        );
    }

    return updated;
  }

  // Homepage Sections Management
  getHomepageSections(): HomepageSection[] {
    if (!this.data.homepageSections || this.data.homepageSections.length === 0) {
      this.data.homepageSections = [...DEFAULT_HOMEPAGE_SECTIONS];
    }
    return (this.data.homepageSections || []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }

  addHomepageSection(section: Omit<HomepageSection, "id">): HomepageSection {
    const newSection: HomepageSection = {
      ...section,
      id: `sec-${Date.now()}`,
    };
    if (!this.data.homepageSections) this.data.homepageSections = [];
    this.data.homepageSections.push(newSection);
    this.save();

    if (this.pgPool) {
      this.pgPool
        .query(
          `
        INSERT INTO public.homepage_sections 
        (id, type, title, subtitle, theme_keyword, title_layout, bg_color, text_color, top_divider_fill, card_size, layout_template, product_line_id, category_id, decorations, is_visible, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          theme_keyword = EXCLUDED.theme_keyword,
          title_layout = EXCLUDED.title_layout,
          bg_color = EXCLUDED.bg_color,
          text_color = EXCLUDED.text_color,
          decorations = EXCLUDED.decorations,
          is_visible = EXCLUDED.is_visible,
          sort_order = EXCLUDED.sort_order;
      `,
          [
            newSection.id,
            newSection.type,
            newSection.title,
            newSection.subtitle || null,
            newSection.themeKeyword || null,
            newSection.titleLayout || "left",
            newSection.bgColor || "#2D366D",
            newSection.textColor || "#FFFFFF",
            newSection.topDividerFill || "white",
            newSection.cardSize || "large",
            newSection.layoutTemplate || "carousel",
            newSection.productLineId || null,
            newSection.categoryId || null,
            JSON.stringify(newSection.decorations || []),
            newSection.isVisible !== false,
            newSection.sortOrder || 1,
          ],
        )
        .catch((err) =>
          console.warn("⚠️ PG insert section notice:", err.message),
        );
    }

    return newSection;
  }

  updateHomepageSection(
    id: string,
    updates: Partial<HomepageSection>,
  ): HomepageSection | null {
    if (!this.data.homepageSections) return null;
    const idx = this.data.homepageSections.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updatedSec = {
      ...this.data.homepageSections[idx],
      ...updates,
    };
    this.data.homepageSections[idx] = updatedSec;
    this.save();

    if (this.pgPool) {
      this.pgPool
        .query(
          `
        UPDATE public.homepage_sections
        SET title = $1, theme_keyword = $2, title_layout = $3, bg_color = $4, text_color = $5, decorations = $6, is_visible = $7, sort_order = $8
        WHERE id = $9;
      `,
          [
            updatedSec.title,
            updatedSec.themeKeyword || null,
            updatedSec.titleLayout || "left",
            updatedSec.bgColor || "#FFFFFF",
            updatedSec.textColor || "#3C2A21",
            JSON.stringify(updatedSec.decorations || []),
            updatedSec.isVisible !== false,
            updatedSec.sortOrder || 1,
            id,
          ],
        )
        .catch((err) =>
          console.warn("⚠️ PG update section notice:", err.message),
        );
    }

    return updatedSec;
  }

  reorderHomepageSections(orderedIds: string[]): HomepageSection[] {
    if (!this.data.homepageSections) return [];
    orderedIds.forEach((id, index) => {
      const section = this.data.homepageSections.find((s) => s.id === id);
      if (section) {
        section.sortOrder = index + 1;
        if (this.pgPool) {
          this.pgPool
            .query(
              `UPDATE public.homepage_sections SET sort_order = $1 WHERE id = $2`,
              [index + 1, id],
            )
            .catch(() => null);
        }
      }
    });
    this.save();
    return this.getHomepageSections();
  }

  deleteHomepageSection(id: string): boolean {
    if (!this.data.homepageSections) return false;
    const initLen = this.data.homepageSections.length;
    this.data.homepageSections = this.data.homepageSections.filter(
      (s) => s.id !== id,
    );
    if (this.data.homepageSections.length < initLen) {
      this.save();
      if (this.pgPool) {
        this.pgPool
          .query(`DELETE FROM public.homepage_sections WHERE id = $1`, [id])
          .catch(() => null);
      }
      return true;
    }
    return false;
  }

  async getAdminUserFromDatabase(identifier: string) {
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT * FROM public.users WHERE (LOWER(identifier) = LOWER($1) OR LOWER(email) = LOWER($1)) AND role = 'admin'`,
          [identifier],
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err: any) {
        console.warn("⚠️ Admin DB lookup notice:", err.message);
      }
    }

    const user = (this.data.users || []).find(
      (u) =>
        (u.identifier.toLowerCase() === identifier.toLowerCase() ||
          (u.email && u.email.toLowerCase() === identifier.toLowerCase())) &&
        (u as any).role === "admin",
    );
    if (user) return user;

    if (
      identifier.toLowerCase() === "admin@littlecreators.com" ||
      identifier.toLowerCase() === "admin"
    ) {
      return {
        id: "admin-1",
        identifier: "admin@littlecreators.com",
        email: "admin@littlecreators.com",
        name: "Admin User",
        password: "Admin@123456",
        role: "admin",
      };
    }
    return null;
  }
}

export const db = new Database();
