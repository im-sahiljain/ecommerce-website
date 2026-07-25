import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface AgeGroup {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  identifier: string; // Email or Phone
  name?: string;
  password?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userIdentifier: string;
  customerName: string;
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  trackingNumber?: string;
}

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  themes: Theme[];
  ageGroups: AgeGroup[];
  users: User[];
  orders: Order[];
}

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export class Database {
  private data: DatabaseSchema;
  public pgPool: Pool | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Sahiljain20014@db.jbbdbdgbqsbdtfymcjwt.supabase.co:5432/postgres';
    if (connectionString) {
      try {
        this.pgPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
        console.log('⚡ Connected to Supabase PostgreSQL Database via pg Pool');
      } catch (err) {
        console.warn('PostgreSQL pool connection failed, using file fallback:', err);
      }
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        this.data = { products: [], categories: [], themes: [], ageGroups: [], users: [], orders: [] };
      }
    } else {
      this.data = { products: [], categories: [], themes: [], ageGroups: [], users: [], orders: [] };
    }
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    return this.data.products.length < initialLen;
  }

  // Categories
  getCategories(): Category[] {
    return this.data.categories;
  }

  addCategory(category: Omit<Category, 'id'>): Category {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // Themes
  getThemes(): Theme[] {
    return this.data.themes;
  }

  addTheme(theme: Omit<Theme, 'id'>): Theme {
    const newTheme: Theme = { ...theme, id: `theme-${Date.now()}` };
    this.data.themes.push(newTheme);
    this.save();
    return newTheme;
  }

  updateTheme(id: string, updates: Partial<Theme>): Theme | null {
    const idx = this.data.themes.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.themes[idx] = { ...this.data.themes[idx], ...updates };
    this.save();
    return this.data.themes[idx];
  }

  deleteTheme(id: string): boolean {
    this.data.themes = this.data.themes.filter(t => t.id !== id);
    this.save();
    return true;
  }

  // Age Groups
  getAgeGroups(): AgeGroup[] {
    return this.data.ageGroups;
  }

  addAgeGroup(ageGroup: Omit<AgeGroup, 'id'>): AgeGroup {
    const newGroup: AgeGroup = { ...ageGroup, id: `age-${Date.now()}` };
    this.data.ageGroups.push(newGroup);
    this.save();
    return newGroup;
  }

  deleteAgeGroup(id: string): boolean {
    this.data.ageGroups = this.data.ageGroups.filter(a => a.id !== id);
    this.save();
    return true;
  }

  // Users
  findOrCreateUser(identifier: string, name?: string, password?: string): User {
    let user = this.data.users.find(u => u.identifier.toLowerCase() === identifier.toLowerCase());
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        identifier,
        name: name || identifier.split('@')[0],
        password: password || 'password123',
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
      this.save();
    }
    return user;
  }

  // Orders
  getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrdersByUser(identifier: string): Order[] {
    return this.data.orders
      .filter(o => o.userIdentifier.toLowerCase() === identifier.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Order {
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    this.save();
    return order;
  }
}

export const db = new Database();
