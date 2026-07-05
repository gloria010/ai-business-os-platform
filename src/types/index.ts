export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  businessCount: number;
  color: string;
  image: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  location: string;
  phone: string;
  email: string;
  website: string;
  founded: string;
  employees: string;
  tags: string[];
  gallery: string[];
  featured: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  categoryId: string;
  businessId: string;
  businessName: string;
  brand: string;
  inStock: boolean;
  stockCount: number;
  specifications: Record<string, string>;
  tags: string[];
  featured: boolean;
  trending: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  productId?: string;
  businessId?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  address: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  businessName: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'consumer' | 'business_owner' | 'admin';
  joinedAt: string;
  addresses: Address[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  smsAlerts: boolean;
  theme: 'light' | 'dark';
  language: string;
  currency: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'recommendation' | 'offer' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  icon: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface BusinessStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}
