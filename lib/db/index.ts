import type { PaintBrush, PaintColor, PaintColorType, KitSupplies } from '@/lib/kit';
import { getPool } from './pool';
import type {
  AgeGroup,
  Category,
  CategoryFacet,
  HomepageSection,
  OfferRule,
  Order,
  Pack,
  Product,
  ProductAnalytics,
  ProductLine,
  SiteSettings,
  StockLog,
  Theme,
  User,
  UserAddress,
} from './types';
import * as products from './products';
import * as categories from './categories';
import * as themes from './themes';
import * as ageGroups from './ageGroups';
import * as users from './users';
import * as orders from './orders';
import * as productLines from './productLines';
import * as facets from './facets';
import * as offers from './offers';
import * as inventory from './inventory';
import * as settings from './settings';
import * as homepage from './homepage';
import * as packs from './packs';
import * as kit from './kit';
import * as admin from './admin';

export * from './types';

export class Database {
  public get pgPool() {
    return getPool();
  }

  async getProducts(): Promise<Product[]> {
    return products.getProducts(this);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return products.getProductById(this, id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return products.getProductBySlug(this, slug);
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return products.addProduct(this, product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return products.updateProduct(this, id, updates);
  }

  async backfillProductSlugs(): Promise<Array<{ id: string; name: string; from: string; to: string }>> {
    return products.backfillProductSlugs(this);
  }

  async deleteProduct(id: string): Promise<boolean> {
    return products.deleteProduct(this, id);
  }

  async getCategories(): Promise<Category[]> {
    return categories.getCategories(this);
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return categories.addCategory(this, category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    return categories.updateCategory(this, id, updates);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return categories.deleteCategory(this, id);
  }

  async getThemes(): Promise<Theme[]> {
    return themes.getThemes(this);
  }

  async addTheme(theme: Omit<Theme, 'id'>): Promise<Theme> {
    return themes.addTheme(this, theme);
  }

  async updateTheme(id: string, updates: Partial<Theme>): Promise<Theme | null> {
    return themes.updateTheme(this, id, updates);
  }

  async deleteTheme(id: string): Promise<boolean> {
    return themes.deleteTheme(this, id);
  }

  async getAgeGroups(): Promise<AgeGroup[]> {
    return ageGroups.getAgeGroups(this);
  }

  async addAgeGroup(_ageGroup: Omit<AgeGroup, 'id'>): Promise<AgeGroup> {
    return ageGroups.addAgeGroup(this, _ageGroup);
  }

  async deleteAgeGroup(_id: string): Promise<boolean> {
    return ageGroups.deleteAgeGroup(this, _id);
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    return users.getUserByIdentifier(this, identifier);
  }

  async findOrCreateUser(identifier: string, name?: string, password?: string): Promise<User> {
    return users.findOrCreateUser(this, identifier, name, password);
  }

  async updateUserProfile(identifier: string, updates: Partial<User>): Promise<User | null> {
    return users.updateUserProfile(this, identifier, updates);
  }

  async getUserAddresses(identifier: string): Promise<UserAddress[]> {
    return users.getUserAddresses(this, identifier);
  }

  async addUserAddress(
    identifier: string,
    addressData: Omit<UserAddress, 'id' | 'userIdentifier' | 'createdAt'>,
  ): Promise<UserAddress> {
    return users.addUserAddress(this, identifier, addressData);
  }

  async setDefaultAddress(identifier: string, addressId: string): Promise<boolean> {
    return users.setDefaultAddress(this, identifier, addressId);
  }

  async deleteUserAddress(identifier: string, addressId: string): Promise<boolean> {
    return users.deleteUserAddress(this, identifier, addressId);
  }

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
    return orders.listOrders(this, options);
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    return orders.getOrderStats(this);
  }

  async getOrders(): Promise<Order[]> {
    return orders.getOrders(this);
  }

  async getOrdersByUser(identifier: string): Promise<Order[]> {
    return orders.getOrdersByUser(this, identifier);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return orders.getOrderById(this, id);
  }

  async createOrder(
    order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'> & { status?: Order['status'] },
  ): Promise<Order> {
    return orders.createOrder(this, order);
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    return orders.updateOrderStatus(this, id, status);
  }

  async deleteOrder(id: string): Promise<boolean> {
    return orders.deleteOrder(this, id);
  }

  async getProductLines(): Promise<ProductLine[]> {
    return productLines.getProductLines(this);
  }

  async addProductLine(line: Omit<ProductLine, 'id'>): Promise<ProductLine> {
    return productLines.addProductLine(this, line);
  }

  async updateProductLine(id: string, updates: Partial<ProductLine>): Promise<ProductLine | null> {
    return productLines.updateProductLine(this, id, updates);
  }

  async deleteProductLine(id: string): Promise<boolean> {
    return productLines.deleteProductLine(this, id);
  }

  async getFacets(): Promise<CategoryFacet[]> {
    return facets.getFacets(this);
  }

  async addFacet(facet: Omit<CategoryFacet, 'id'>): Promise<CategoryFacet> {
    return facets.addFacet(this, facet);
  }

  async updateFacet(_id: string, _updates: Partial<CategoryFacet>): Promise<CategoryFacet | null> {
    return facets.updateFacet(this, _id, _updates);
  }

  async deleteFacet(_id: string): Promise<boolean> {
    return facets.deleteFacet(this, _id);
  }

  async getOfferRules(): Promise<OfferRule[]> {
    return offers.getOfferRules(this);
  }

  async addOfferRule(rule: Omit<OfferRule, 'id'>): Promise<OfferRule> {
    return offers.addOfferRule(this, rule);
  }

  async updateOfferRule(id: string, updates: Partial<OfferRule>): Promise<OfferRule | null> {
    return offers.updateOfferRule(this, id, updates);
  }

  async deleteOfferRule(id: string): Promise<boolean> {
    return offers.deleteOfferRule(this, id);
  }

  async adjustProductStock(
    productId: string,
    changeAmount: number,
    _reason: string,
    _updatedBy: string = 'Admin',
  ): Promise<Product | null> {
    return inventory.adjustProductStock(this, productId, changeAmount, _reason, _updatedBy);
  }

  async getStockLogs(_productId?: string): Promise<StockLog[]> {
    return inventory.getStockLogs(this, _productId);
  }

  getProductAnalytics(_productId: string): ProductAnalytics {
    return inventory.getProductAnalytics(this, _productId);
  }

  recordProductView(_productId: string): void {
    return inventory.recordProductView(this, _productId);
  }

  async likeProduct(
    productId: string,
    active: boolean,
  ): Promise<{ likes: number; isLiked: boolean }> {
    return inventory.likeProduct(this, productId, active);
  }

  getAllAnalytics(): Record<string, ProductAnalytics> {
    return inventory.getAllAnalytics(this);
  }

  async getSettings(): Promise<SiteSettings> {
    return settings.getSettings(this);
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    return settings.updateSettings(this, updates);
  }

  async getHomepageSections(): Promise<HomepageSection[]> {
    return homepage.getHomepageSections(this);
  }

  async addHomepageSection(section: Omit<HomepageSection, 'id'>): Promise<HomepageSection> {
    return homepage.addHomepageSection(this, section);
  }

  async updateHomepageSection(
    id: string,
    updates: Partial<HomepageSection>,
  ): Promise<HomepageSection | null> {
    return homepage.updateHomepageSection(this, id, updates);
  }

  async reorderHomepageSections(orderedIds: string[]): Promise<HomepageSection[]> {
    return homepage.reorderHomepageSections(this, orderedIds);
  }

  async deleteHomepageSection(id: string): Promise<boolean> {
    return homepage.deleteHomepageSection(this, id);
  }

  async getPacks(): Promise<Pack[]> {
    return packs.getPacks(this);
  }

  async getPackById(id: string): Promise<Pack | undefined> {
    return packs.getPackById(this, id);
  }

  async getPackBySlug(slug: string): Promise<Pack | undefined> {
    return packs.getPackBySlug(this, slug);
  }

  async addPack(packData: Omit<Pack, 'id'>): Promise<Pack> {
    return packs.addPack(this, packData);
  }

  async updatePack(id: string, updates: Partial<Pack>): Promise<Pack | null> {
    return packs.updatePack(this, id, updates);
  }

  async deletePack(id: string): Promise<boolean> {
    return packs.deletePack(this, id);
  }

  async getKitSupplies(): Promise<KitSupplies> {
    return kit.getKitSupplies(this);
  }

  async getPaintColorTypes(): Promise<PaintColorType[]> {
    return kit.getPaintColorTypes(this);
  }

  async addPaintColorType(name: string): Promise<PaintColorType> {
    return kit.addPaintColorType(this, name);
  }

  async updatePaintColorType(id: string, name: string): Promise<PaintColorType | null> {
    return kit.updatePaintColorType(this, id, name);
  }

  async setPaintColorTypeAvailable(id: string, available: boolean): Promise<PaintColorType | null> {
    return kit.setPaintColorTypeAvailable(this, id, available);
  }

  async deletePaintColorType(id: string): Promise<void> {
    return kit.deletePaintColorType(this, id);
  }

  async getPaintColors(): Promise<PaintColor[]> {
    return kit.getPaintColors(this);
  }

  async addPaintColor(input: {
    name: string;
    hex?: string;
    colorTypeId?: string;
    volumeMl?: number;
  }): Promise<PaintColor> {
    return kit.addPaintColor(this, input);
  }

  async updatePaintColor(
    id: string,
    input: { name: string; hex?: string; colorTypeId?: string; volumeMl?: number },
  ): Promise<PaintColor | null> {
    return kit.updatePaintColor(this, id, input);
  }

  async setPaintColorAvailable(id: string, available: boolean): Promise<PaintColor | null> {
    return kit.setPaintColorAvailable(this, id, available);
  }

  async deletePaintColor(id: string): Promise<boolean> {
    return kit.deletePaintColor(this, id);
  }

  async getPaintBrushes(): Promise<PaintBrush[]> {
    return kit.getPaintBrushes(this);
  }

  async addPaintBrush(input: { name: string; size?: string }): Promise<PaintBrush> {
    return kit.addPaintBrush(this, input);
  }

  async updatePaintBrush(id: string, input: { name: string; size?: string }): Promise<PaintBrush | null> {
    return kit.updatePaintBrush(this, id, input);
  }

  async setPaintBrushAvailable(id: string, available: boolean): Promise<PaintBrush | null> {
    return kit.setPaintBrushAvailable(this, id, available);
  }

  async deletePaintBrush(id: string): Promise<boolean> {
    return kit.deletePaintBrush(this, id);
  }

  async getAdminUserFromDatabase(identifier: string) {
    return admin.getAdminUserFromDatabase(this, identifier);
  }

  async getAdminUserById(id: string) {
    return admin.getAdminUserById(this, id);
  }
}

export const db = new Database();
