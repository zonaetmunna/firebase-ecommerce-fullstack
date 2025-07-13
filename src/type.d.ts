interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: "admin" | "user";
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/* Admin-specific interfaces */
interface IAdminState {
  users: User[];
  analytics: IAnalytics;
  loading: boolean;
  error: string | null;
}

interface IAnalytics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: IOrder[];
  topProducts: IProduct[];
  monthlySales: IMonthlySales[];
}

interface IMonthlySales {
  month: string;
  sales: number;
  revenue: number;
}

interface IUserManagement {
  id: string;
  displayName: string | null;
  email: string | null;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string | null;
  updatedAt?: string | null;
  totalOrders: number;
  totalSpent: number;
}

/* products interface */
interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  color: string;
  size: string;
  stock: number;
  image: string;
  images?: string[];
  rating: number;
  brand: string;
  quantity?: number;
  featured?: boolean;
  tags?: string[];
  specifications?: { [key: string]: string };
  createdAt?: string | null;
  updatedAt?: string | null;
}

/* category interface */
interface ICategory {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount?: number;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/* brand interface */
interface IBrand {
  id: string;
  name: string;
  description: string;
  logo: string;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/* Enhanced order interface */
interface IOrder {
  id: string;
  userId: string;
  userEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  orderDate: string | null;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "credit_card" | "paypal" | "stripe";
  shippingAddress: IShippingAddress;
  billingAddress: IBillingAddress;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface IShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

/* Review interface */
interface IReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string | null;
  updatedAt?: string | null;
}

/* Notification interface */
interface INotification {
  id: string;
  type: "order" | "user" | "product" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | null;
}

// cart
interface ICartState {
  cart: IProduct[];
  shippingOption: string;
  shippingCost: number;
  discountCode: string;
  subtotal: number;
  total: number;
  billingAddress: IBillingAddress;
}

interface IBillingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  zip?: number;
}

// ----------wishlist-------//
interface IWishlistState {
  wishlist: IProduct[];
}

/* Settings interface */
interface ISettings {
  siteName: string;
  siteDescription: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  currency: string;
  taxRate: number;
  shippingRate: number;
  featuredProductsLimit: number;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
}

/* Auth State */
interface IAuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/* API Response types */
interface IApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

/* Pagination */
interface IPagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* Filter types */
interface IProductFilter {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sortBy?: "name" | "price" | "rating" | "newest" | "oldest";
  sortOrder?: "asc" | "desc";
}

interface IOrderFilter {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/* Form types */
interface IProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  color: string;
  size: string;
  stock: number;
  image: string;
  images?: string[];
  featured?: boolean;
  tags?: string[];
  specifications?: { [key: string]: string };
}

interface ICategoryForm {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

/* Dashboard Stats */
interface IDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  usersGrowth: number;
}

/* Export types */
interface IExportData {
  type: "orders" | "products" | "users";
  format: "csv" | "excel" | "pdf";
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: any;
}

/* Upload types */
interface IUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

/* Search types */
interface ISearchResult {
  products: IProduct[];
  categories: ICategory[];
  brands: IBrand[];
  total: number;
}

/* Inventory types */
interface IInventoryItem {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastRestocked: string | null;
}

/* Coupon types */
interface ICoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimumOrder: number;
  maxUsage: number;
  currentUsage: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/* Backup types */
interface IBackup {
  id: string;
  type: "full" | "partial";
  status: "pending" | "completed" | "failed";
  size: string;
  createdAt: string | null;
  downloadUrl?: string;
}

/* Audit Log types */
interface IAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string | null;
}
