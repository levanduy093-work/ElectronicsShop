// Icon names for react-native-vector-icons (using MaterialCommunityIcons)
export type IconName = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  rating: number;
  reviews: number;
  reviewCount?: number;
  averageRating?: number;
  image: string;
  images?: string[];
  category: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  stockQuantity?: number;
  description: string;
  specs: Record<string, any>;
  code?: string;
  saleCount?: number;
  datasheet?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: IconName; // Icon name for react-native-vector-icons
  type: "active" | "passive" | "tools" | "other";
}

export interface CartItem extends Product {
  quantity: number;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaLink?: string;
  ctaProductId?: string;
  isActive?: boolean;
  order?: number;
}

export interface AiProductCard {
  productId: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  code?: string;
}

export type AiAction =
  | {
      type: 'ADD_TO_CART';
      payload: { productId: string; quantity: number };
      requiresConfirmation: boolean;
      confirmationId?: string;
      note?: string;
    };

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  type?: "text" | "bom" | "schematic";
  metadata?: any;
  cards?: AiProductCard[];
  actions?: AiAction[];
}

export interface AiChatResponse {
  reply: string;
  cards?: AiProductCard[];
  actions?: AiAction[];
}

export interface Voucher {
  id?: string;
  code: string;
  description?: string;
  type?: 'fixed' | 'shipping' | 'percentage';
  discountPrice: number;
  discountRate?: number;
  maxDiscountPrice?: number;
  minTotal: number;
  expire?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // backend id
  code: string;
  date: string;
  createdAt?: string;
  status: 'processing' | 'shipping' | 'completed' | 'cancelled';
  statusText: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  payment: {
    method: string;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
  };
  timeline: Array<{
    time: string;
    title: string;
    active: boolean;
  }>;
}

export type AddressType = 'Nhà riêng' | 'Văn phòng';

export interface AddressFormValues {
  name: string;
  phone: string;
  detailedAddress: string;
  ward?: string;
  district?: string;
  city?: string;
  type: AddressType;
  isDefault: boolean;
}

export interface Address extends AddressFormValues {
  id: string;
  address: string;
}
