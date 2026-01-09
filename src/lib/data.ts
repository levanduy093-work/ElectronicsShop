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
  image: string;
  images?: string[];
  category: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  stockQuantity?: number;
  description: string;
  specs: Record<string, string>;
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

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  type?: "text" | "bom" | "schematic";
  metadata?: any;
}

// Categories should be fetched from API or extracted from products dynamically
export const CATEGORIES: Category[] = [];

// Helper function to extract unique categories from products
export const extractCategoriesFromProducts = (products: Product[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  const iconMap: Record<string, IconName> = {
    'Vi điều khiển': 'chip',
    'Cảm biến': 'wifi',
    'Nguồn & Pin': 'battery',
    'Dây & Cáp': 'cable-data',
    'Dụng cụ': 'toolbox',
    'IC số': 'integrated-circuit',
    'Điện trở': 'omega',
    'Tụ điện': 'capacitor',
  };
  
  products.forEach((product, index) => {
    const categoryName = product.category;
    if (categoryName && !categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        id: `cat-${index}`,
        name: categoryName,
        icon: iconMap[categoryName] || 'package-variant',
        type: 'other',
      });
    }
  });
  
  return Array.from(categoryMap.values());
};

export interface Voucher {
  code: string;
  description: string;
  discount: number;
  minOrder: number;
  type: 'fixed' | 'shipping';
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

// Vouchers should be fetched from API
export const AVAILABLE_VOUCHERS: Voucher[] = [];

// Chat messages should start empty and be populated from API
export const MOCK_CHATS: ChatMessage[] = [];
