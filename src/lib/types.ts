export type Role = 'CUSTOMER' | 'ADMIN';
export interface User {
  id: number;
  email: string;
  username: string;
  name: string | null;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count?: { products: number };
}

export interface ProductImage {
  id: number;
  url: string;
  isMain?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  isActive: boolean;
  categoryId: number;
  category?: { id: number; name: string; slug: string };
  reviews?: Review[];
  averageRating: number | null;
  _count?: { reviews: number };
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; username: string; name: string | null };
}

export interface ReviewSummary {
  averageRating: number | null;
  totalReviews: number;
  ratingBreakdown: Record<string, number>;
}

export interface CartItem {
  id: number;
  quantity: number;
  subtotal: number;
  product: Product;
  variant: ProductVariant;
  originalPrice: number;
  flashPrice: number | null;
  flashSaleId: number | null;
  flashSaleName?: string | null;
  flashEndTime?: Date | null;
  effectivePrice: number;
  isOnFlashSale: boolean;
  savings: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  grandTotal: number;
  totalAmount: number;
  taxAmount: number;
  discountAmount?: number;
  couponCode?: string;
  totalSavings?: number;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: string;
  salePrice: string;
  quantity: number;
  total: string;
  variant: {
    id: number;
    name: string;
    value: string;
  };
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';

export type ReturnReason = 'DAMAGED' | 'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'CHANGED_MIND' | 'OTHER';

export interface ReturnRequest {
  id: number;
  reason: ReturnReason;
  details?: string;
  status: ReturnStatus;
  adminNote?: string;
  user: User;
  order: Order;
  createdAt: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: string;
  taxAmount: string;
  grandTotalAmount: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  payment: Payment | null;
  returnRequest?: ReturnRequest;
}

export interface Payment {
  id: number;
  stripePaymentId: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T, S = undefined> {
  data: T[];
  summary?: S;
  meta: PaginationMeta;
}

export interface CategoryWithPaginatedResponse {
  data: Category;
  products: PaginatedResponse<Product>;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
}

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED';

export interface Invoice {
  id: number;
  invoiceNo: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string | null;
  notes: string | null;
  orderId: number;
  order: Order;
  user: User;
}

export interface CouponResult {
  discount: number;
  finalAmount: number;
  coupon: {
    code: string;
    type: string;
    value: number;
  };
}

export interface OverviewAnalitics {
  lowStockProducts: number;
  pendingOrders: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalReviews: number;
  totalUsers: number;
}

export interface RevenuAnalitics {
  date: string;
  revenue: number;
}

export interface OrderAnalitics {
  date: string;
  orders: number;
}

export interface OrderStatusAnalitics {
  status: OrderStatus;
  count: number;
}

export interface TopProducts {
  productId: number;
  productName: string;
  revenue: number;
  totalSold: number;
}

export interface TopCategories {
  name: string;
  revenue: number;
  orders: number;
}

export interface UsersAnalitics {
  week: string;
  users: number;
}

export interface ProductLowStock {
  id: number;
  name: string;
  category: {
    name: string;
  };
  slug: string;
  stock: number;
  images: string[];
}

export interface RecentOrder {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  stripePaymentId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  addressId: number;
  discountAmount: number | null;
  couponCode: string | null;
  user: {
    id: number;
    name: string | null;
    email: string;
    username: string;
  };
  items: {
    quantity: number;
    productName: string;
  }[];
}

export interface MostRatedProducts {
  name: string;
  count: number;
}

export interface Newsletter {
  id: number;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface Tax {
  id: number;
  name: string;
  rate: number;
  type: 'PERCENTAGE' | 'FIXED';
  isActive: boolean;
}

export interface Shipping {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  stock: number;
  price?: number;
  sku?: string;
  isActive?: boolean;
  color?: string;
  images?: ProductVariantImage[];
}

export interface ProductVariantImage {
  id: number;
  url: string;
  isMain: string;
  order: number;
  variantId: number;
}

export type NotificationType =
  | 'ORDER_PLACED'
  | 'PROMO'
  | 'SYSTEM'
  | 'LOW_STOCK'
  | 'ORDER_CANCELLED';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  user: User;
}

export interface FlashSaleProduct {
  flashSaleId: number;
  productId: number;
  product: Product;
}

export interface FlashSale {
  id: number;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  endTime: string;
  startTime: string;
  bannerColor: string;
  products: FlashSaleProduct[];
  isActive: boolean;
}

export interface TrackingEvent {
  id: number | null;
  status: string;
  message: string;
  location: string | null;
  createdAt: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending?: boolean;
}

export interface Tracking {
  orderId: number;
  status: OrderStatus;
  trackingNumber: string;
  address: Address;
  timeline: TrackingEvent[];
}

export type SettingKey =
  | 'store_name'
  | 'store_email'
  | 'store_phone'
  | 'store_address'
  | 'store_logo'
  | 'store_favicon'
  | 'currency'
  | 'currency_symbol'
  | 'maintenance_mode'
  | 'allow_reviews'
  | 'allow_guest_checkout'
  | 'free_shipping_threshold'
  | 'max_cart_items'
  | 'low_stock_threshold'
  | 'order_cancel_hours'
  | 'auto_deliver_days'
  | 'loyalty_points_per_dollar'
  | 'loyalty_redeem_rate'
  | 'social_facebook'
  | 'social_instagram'
  | 'social_twitter'
  | 'meta_title'
  | 'meta_description';

export type SettingType = 'string' | 'number' | 'boolean' | 'object';

export type SettingStore = Record<SettingKey, SettingType>;

export interface SearchParam {
  page?: number;
  limit: number;
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  minRating?: string;
  variantValues?: string;
  variantName?: string;
  colors?: string;
  sortBy: string;
  sortOrder: string;
}
