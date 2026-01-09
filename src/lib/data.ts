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

// Category icon mapping - should ideally come from API
const CATEGORY_ICON_MAP: Record<string, IconName> = {
  // Vietnamese categories
  'Vi điều khiển': 'chip',
  'Cảm biến': 'wifi',
  'Nguồn & Pin': 'battery',
  'Dây & Cáp': 'cable-data',
  'Dụng cụ': 'toolbox',
  'IC số': 'integrated-circuit',
  'Điện trở': 'omega',
  'Tụ điện': 'capacitor',
  // English categories - using MaterialCommunityIcons available icons
  'Resistor': 'omega',
  'Capacitor': 'capacitor',
  'Diode': 'flash', // Using flash icon for diode
  'LED': 'lightbulb-on-outline', // Using lightbulb for LED
  'Transistor': 'chip', // Using chip icon for transistor
  'Inductor': 'coil', // Using coil icon if available, fallback handled
  'Crystal': 'clock-outline', // Using clock for crystal oscillator
  'Relay': 'switch', // Using switch icon for relay
  'Switch': 'toggle-switch',
  'Connector': 'cable-data',
  'Module': 'chip',
  'Sensor': 'wifi',
  'Power Supply': 'battery',
  'Tool': 'toolbox',
  'Microcontroller': 'chip',
  'Battery': 'battery',
  'Cable': 'cable-data',
  'Wire': 'cable-data',
};

// Categories should be fetched from API or extracted from products dynamically
export const CATEGORIES: Category[] = [];

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
      return 'omega';
    }
    if (lowerName.includes('capacitor') || lowerName.includes('tụ điện')) {
      return 'capacitor';
    }
    if (lowerName.includes('diode')) {
      return 'flash';
    }
    if (lowerName.includes('led')) {
      return 'lightbulb-on-outline';
    }
    if (lowerName.includes('transistor')) {
      return 'chip';
    }
    if (lowerName.includes('sensor') || lowerName.includes('cảm biến')) {
      return 'wifi';
    }
    if (lowerName.includes('microcontroller') || lowerName.includes('vi điều khiển') || lowerName.includes('arduino') || lowerName.includes('esp')) {
      return 'chip';
    }
    if (lowerName.includes('battery') || lowerName.includes('pin') || lowerName.includes('nguồn')) {
      return 'battery';
    }
    if (lowerName.includes('cable') || lowerName.includes('wire') || lowerName.includes('dây') || lowerName.includes('cáp')) {
      return 'cable-data';
    }
    if (lowerName.includes('tool') || lowerName.includes('dụng cụ')) {
      return 'toolbox';
    }
    if (lowerName.includes('ic') || lowerName.includes('integrated circuit')) {
      return 'integrated-circuit';
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
