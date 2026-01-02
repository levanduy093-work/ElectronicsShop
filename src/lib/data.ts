// Icon names for react-native-vector-icons (using MaterialCommunityIcons)
export type IconName = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  specs: Record<string, string>;
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

export const CATEGORIES: Category[] = [
  { id: "1", name: "Vi điều khiển", icon: "chip", type: "active" },
  { id: "2", name: "Cảm biến", icon: "wifi", type: "active" },
  { id: "3", name: "Nguồn & Pin", icon: "battery", type: "passive" },
  { id: "4", name: "Dây & Cáp", icon: "cable-data", type: "passive" },
  { id: "5", name: "Dụng cụ", icon: "toolbox", type: "tools" },
  { id: "6", name: "IC số", icon: "integrated-circuit", type: "active" },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Arduino Uno R3 ATmega328P",
    price: 150000,
    originalPrice: 180000,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1555664424-778a69022365?auto=format&fit=crop&q=80&w=500",
    category: "Vi điều khiển",
    stock: "In Stock",
    description: "Bo mạch lập trình Arduino Uno R3 sử dụng chip ATmega328P, phiên bản thông dụng nhất cho người mới bắt đầu học lập trình IoT.",
    specs: {
      "Chip": "ATmega328P",
      "Điện áp": "5V",
      "Flash Memory": "32 KB",
      "Clock Speed": "16 MHz"
    }
  },
  {
    id: "p2",
    name: "Module ESP32-WROOM-32",
    price: 110000,
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1629898036502-861a8689874a?auto=format&fit=crop&q=80&w=500",
    category: "Vi điều khiển",
    stock: "In Stock",
    description: "Module WiFi + Bluetooth ESP32 mạnh mẽ, thích hợp cho các ứng dụng IoT đòi hỏi kết nối không dây.",
    specs: {
      "Chip": "ESP32-D0WDQ6",
      "WiFi": "802.11 b/g/n",
      "Bluetooth": "v4.2 BR/EDR and BLE",
      "Flash": "4MB"
    }
  },
  {
    id: "p3",
    name: "Cảm biến siêu âm HC-SR04",
    price: 25000,
    rating: 4.5,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=500",
    category: "Cảm biến",
    stock: "In Stock",
    description: "Cảm biến đo khoảng cách bằng sóng siêu âm, độ chính xác cao, dễ sử dụng với Arduino.",
    specs: {
      "Phạm vi": "2cm - 400cm",
      "Độ chính xác": "3mm",
      "Điện áp": "5V"
    }
  },
  {
    id: "p4",
    name: "Mỏ hàn điều chỉnh nhiệt độ 60W",
    price: 180000,
    originalPrice: 220000,
    rating: 4.7,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1593106578502-27fa8479d060?auto=format&fit=crop&q=80&w=500",
    category: "Dụng cụ",
    stock: "Low Stock",
    description: "Mỏ hàn chất lượng cao có thể điều chỉnh nhiệt độ từ 200-450 độ C, tặng kèm 5 mũi hàn.",
    specs: {
      "Công suất": "60W",
      "Nhiệt độ": "200°C - 450°C",
      "Điện áp": "220V"
    }
  },
  {
    id: "p5",
    name: "Raspberry Pi 4 Model B 4GB",
    price: 1450000,
    rating: 5.0,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1634909800269-e81679985370?auto=format&fit=crop&q=80&w=500",
    category: "Vi điều khiển",
    stock: "Out of Stock",
    description: "Máy tính nhúng mạnh mẽ, có thể chạy hệ điều hành Linux đầy đủ, hỗ trợ 2 màn hình 4K.",
    specs: {
      "RAM": "4GB LPDDR4-3200",
      "CPU": "Broadcom BCM2711",
      "Cổng": "2x micro-HDMI, 2x USB 3.0"
    }
  }
];

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
  id: string;
  date: string;
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

export const AVAILABLE_VOUCHERS: Voucher[] = [
  { code: 'FREESHIP', description: 'Miễn phí vận chuyển cho đơn từ 0đ', discount: 30000, minOrder: 0, type: 'shipping' },
  { code: 'ELECTRO50', description: 'Giảm 50k cho đơn từ 500k', discount: 50000, minOrder: 500000, type: 'fixed' },
  { code: 'HELLO2024', description: 'Giảm 20k cho thành viên mới', discount: 20000, minOrder: 0, type: 'fixed' },
  { code: 'SUPERDEAL', description: 'Giảm 100k cho đơn từ 2 triệu', discount: 100000, minOrder: 2000000, type: 'fixed' },
];

export const MOCK_CHATS: ChatMessage[] = [
  {
    id: "c1",
    role: "ai",
    content: "Xin chào! Tôi là AI Engineer của ElectroAI. Tôi có thể giúp gì cho bạn hôm nay? Tôi có thể tư vấn linh kiện hoặc scan sơ đồ mạch giúp bạn.",
    timestamp: new Date(Date.now() - 3600000),
    type: "text"
  }
];
