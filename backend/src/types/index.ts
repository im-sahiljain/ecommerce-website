export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  costPrice?: number;
  currency?: string;
  theme: string;
  category: string;
  ageGroup: string;
  productLineId?: string;
  categoryIds?: string[];
  tagIds?: string[];
  isNonToxic: boolean;
  image: string;
  images?: string[];
  description: string;
  richDescription?: string;
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isBackorderAllowed?: boolean;
  isOrderingEnabled?: boolean;
  status?: 'Draft' | 'Published' | 'Hidden' | 'Archived';
  attributes?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductLine {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  icon?: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface CategoryFacet {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  productLineId?: string;
  facetGroup: 'Theme' | 'Age Group' | 'Scent' | 'Material' | 'Price Band' | 'General';
  coverImage?: string;
  icon?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  productLineId?: string;
  coverImage?: string;
  isVisible?: boolean;
  sortOrder?: number;
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
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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

export interface UserAddress {
  id: string;
  userIdentifier: string;
  label: string; // e.g. "Home", "Work"
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface BundleTier {
  quantity: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
}

export interface BundleRule {
  id: string;
  name: string;
  description?: string;
  applicableScope: 'all' | 'productLine' | 'category' | 'theme';
  scopeValue?: string;
  requirementMode?: 'exact' | 'min_threshold';
  tiers: BundleTier[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
}

export interface StockLog {
  id: string;
  productId: string;
  changeAmount: number;
  newQuantity: number;
  reason: string;
  updatedBy: string;
  timestamp: string;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  likes: number;
  wishlistedBy: string[];
  unitsOrdered: number;
  totalRevenue: number;
}

export interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  isWhatsappOrderingEnabled: boolean;
  isWhatsappChatButtonEnabled: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate?: string;
  isWhatsappEnabled?: boolean;
  siteTitle: string;
  defaultMetaDescription: string;
}

export interface DecorationItem {
  id: string;
  type: 'emoji' | 'image';
  content: string;
  imageUrl?: string;
  style?: Record<string, any>;
  className?: string;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  themeKeyword?: string;
  titleLayout?: 'left' | 'center' | 'right';
  bgColor?: string;
  textColor?: string;
  topDividerFill?: string;
  cardSize?: 'large' | 'small';
  layoutTemplate: string;
  productLineId?: string;
  categoryId?: string;
  decorations?: DecorationItem[];
  isVisible: boolean;
  sortOrder: number;
}

export interface SlugRedirect {
  id: string;
  oldSlug: string;
  newSlug: string;
  targetPath: string;
  createdAt: string;
}

export interface Pack {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  image?: string;
  images?: string[];
  productIds: string[];
  productLineId?: string;
  categoryId?: string;
  inStock: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatabaseSchema {
  products: Product[];
  productLines: ProductLine[];
  categories: Category[];
  facets: CategoryFacet[];
  themes: Theme[];
  ageGroups: AgeGroup[];
  users: User[];
  orders: Order[];
  addresses: UserAddress[];
  bundleRules: BundleRule[];
  stockLogs: StockLog[];
  analytics: Record<string, ProductAnalytics>;
  settings: SiteSettings;
  homepageSections: HomepageSection[];
  slugRedirects: SlugRedirect[];
  packs: Pack[];
}

