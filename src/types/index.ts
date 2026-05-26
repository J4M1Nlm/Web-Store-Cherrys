export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'FULFILLED';
export type DiscountType = 'PERCENT' | 'FIXED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  variantName: string | null;
  attributes: Record<string, string>;
  priceCents: number;
  currency: string;
  stockOnHand: number;
  active: boolean;
}

export interface Address {
  id: number;
  label: string | null;
  recipientName: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  basePriceCents: number;
  currency: string;
  mainImageUrl: string | null;
  artistSlug: string | null;
  categorySlug: string | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  variants: ProductVariant[];
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CartItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  sku: string;
  variantName: string | null;
  attributes: Record<string, string>;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  currency: string;
  stockOnHand: number;
  variantActive: boolean;
  mainImageUrl: string | null;
}

export interface CartResponse {
  cartId: number;
  status: string;
  currency: string;
  itemsCount: number;
  subtotalCents: number;
  items: CartItem[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface OrderItem {
  id: number;
  productName: string;
  variantName: string | null;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  imageUrl: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: Address | null;
}

export interface CouponValidateResponse {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountCents: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
}
