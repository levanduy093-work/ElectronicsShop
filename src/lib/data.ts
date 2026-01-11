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

// Category icon mapping - should ideally come from API
const CATEGORY_ICON_MAP: Record<string, IconName> = {
  // Vietnamese categories
  'Vi điều khiển': 'chip',
  'Cảm biến': 'wifi',
  'Nguồn & Pin': 'battery',
  'Dây & Cáp': 'cable-data',
  'Dụng cụ': 'toolbox',
  'IC số': 'integrated-circuit-chip',
  'Điện trở': 'resistor',
  'Tụ điện': 'sine-wave',

  // English categories - using valid MaterialCommunityIcons
  'Resistor': 'resistor',
  'Capacitor': 'sine-wave',
  'Diode': 'flash',
  'LED': 'lightbulb-on-outline',
  'Transistor': 'chip',
  'Inductor': 'current-ac',
  'Crystal': 'clock-outline',
  'Relay': 'toggle-switch',
  'Switch': 'toggle-switch',
  'Connector': 'cable-data',
  'Module': 'chip',
  'Sensor': 'wifi',
  'Power Supply': 'battery',
  'Power Module': 'server',
  'IC Power': 'power-plug',
  'IC Driver': 'integrated-circuit-chip',
  'IC': 'integrated-circuit-chip',
  'Tool': 'toolbox',
  'Microcontroller': 'chip',
  'Battery': 'battery',
  'Cable': 'cable-data',
  'Wire': 'cable-data',
  'Accessory': 'puzzle-outline',
  'MOSFET': 'flash',
  'Communication': 'access-point',
  'Audio': 'music',
  'Memory': 'memory',
  'Prototype': 'flask-outline',
  'Cooling': 'fan',
  'Display': 'monitor',
  'Motor': 'engine',
  'Motor Driver': 'engine-outline',
  'Potentiometer': 'tune-vertical',
  'Power': 'power-plug',
  'Power Driver': 'power-plug',
};

// Categories should be fetched from API or extracted from products dynamically
export const CATEGORIES: Category[] = [];

// Products should be loaded from the backend; keep empty to avoid showing fake placeholders
export const PRODUCTS: Product[] = [];

// Helper function to extract unique categories from products
export const extractCategoriesFromProducts = (products: Product[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  let categoryIndex = 0;
  
  // Helper to find icon for a category name
  const findIconForCategory = (categoryName: string): IconName => {
    // Direct match
    if (CATEGORY_ICON_MAP[categoryName]) {
      return CATEGORY_ICON_MAP[categoryName];
    }
    
    // Case-insensitive match
    const lowerName = categoryName.toLowerCase().trim();
    for (const [key, value] of Object.entries(CATEGORY_ICON_MAP)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    
    // Partial match - check if category name contains keywords
    if (lowerName.includes('resistor') || lowerName.includes('điện trở')) {
      return 'resistor';
    }
    if (lowerName.includes('capacitor') || lowerName.includes('tụ điện')) {
      return 'sine-wave';
    }
    if (lowerName.includes('diode') || lowerName.includes('mosfet')) {
      return 'flash';
    }
    if (lowerName.includes('led')) {
      return 'lightbulb-on-outline';
    }
    if (lowerName.includes('transistor')) {
      return 'chip';
    }
    if (lowerName.includes('sensor') || lowerName.includes('cảm biến') || lowerName.includes('communication')) {
      return 'access-point';
    }
    if (lowerName.includes('audio')) {
      return 'music';
    }
    if (lowerName.includes('microcontroller') || lowerName.includes('vi điều khiển') || lowerName.includes('arduino') || lowerName.includes('esp')) {
      return 'chip';
    }
    if (lowerName.includes('battery') || lowerName.includes('power') || lowerName.includes('pin') || lowerName.includes('nguồn')) {
      return 'battery';
    }
    if (lowerName.includes('cable') || lowerName.includes('wire') || lowerName.includes('connector') || lowerName.includes('dây') || lowerName.includes('cáp')) {
      return 'cable-data';
    }
    if (lowerName.includes('tool') || lowerName.includes('dụng cụ') || lowerName.includes('accessory')) {
      return 'toolbox';
    }
    if (lowerName.includes('ic') || lowerName.includes('integrated circuit') || lowerName.includes('driver')) {
      return 'integrated-circuit-chip';
    }
    if (lowerName.includes('display') || lowerName.includes('screen') || lowerName.includes('monitor')) {
      return 'monitor';
    }
    if (lowerName.includes('motor')) {
      return lowerName.includes('driver') ? 'engine-outline' : 'engine';
    }
    if (lowerName.includes('cool')) {
      return 'fan';
    }
    if (lowerName.includes('prototype')) {
      return 'flask-outline';
    }
    if (lowerName.includes('memory')) {
      return 'memory';
    }
    if (lowerName.includes('connector')) {
      return 'cable-data';
    }
    if (lowerName.includes('potentiometer')) {
      return 'tune-vertical';
    }
    
    // Default fallback
    return 'package-variant';
  };
  
  products.forEach((product) => {
    const categoryName = product.category;
    if (categoryName && !categoryMap.has(categoryName)) {
      const icon = findIconForCategory(categoryName);
      
      categoryMap.set(categoryName, {
        id: `cat-${categoryIndex++}`,
        name: categoryName,
        icon: icon,
        type: 'other',
      });
    }
  });
  
  return Array.from(categoryMap.values());
};

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

// Vouchers should be fetched from API
export const AVAILABLE_VOUCHERS: Voucher[] = [];

// Chat messages should start empty and be populated from API
export const MOCK_CHATS: ChatMessage[] = [];
