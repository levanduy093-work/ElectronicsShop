/**
 * ElectronicsShop App
 * React Native version converted from Figma design
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Linking, StatusBar, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home } from './src/screens/Home';
import { Catalog } from './src/screens/Catalog';
import { AIChat } from './src/screens/AIChat';
import { Cart } from './src/screens/Cart';
import { Profile } from './src/screens/Profile';
import { ProductDetail } from './src/screens/ProductDetail';
import { Checkout } from './src/screens/Checkout';
import { OrderHistory } from './src/screens/OrderHistory';
import { OrderDetail } from './src/screens/OrderDetail';
import { Auth } from './src/screens/Auth';
import { SearchScreen } from './src/screens/SearchScreen';
import { FilterScreen } from './src/screens/FilterScreen';
import { Wishlist } from './src/screens/Wishlist';
import { AddressBook } from './src/screens/AddressBook';
import { Settings } from './src/screens/Settings';
import { SupportCenter } from './src/screens/SupportCenter';
import { Notifications } from './src/screens/Notifications';
import { ChangePassword } from './src/screens/ChangePassword';
import { BottomNav } from './src/components/layout/BottomNav';
import { TopBar } from './src/components/layout/TopBar';
import { Product, CartItem, Order, Voucher, HomeBanner, ChatMessage } from './src/types';
import { PRODUCTS } from './src/constants/data';
import { Address } from './src/types';
import { DEFAULT_ADDRESSES } from './src/constants/defaults';
import { darkTheme, lightTheme, ThemeProvider } from './src/theme';
import { ToastProvider } from './src/components/common/ToastProvider';
import {
  ApiNotification,
  ApiOrder,
  ApiProduct,
  ApiVoucher,
  ApiCart,
  ApiCartItem,
  AuthResponse,
  ApiBanner,
  addFavorite,
  configureApiAuth,
  createOrder as apiCreateOrder,
  createVnpayPayment,
  getPublicBanners,
  getFavorites as apiGetFavorites,
  getMyVouchers,
  getNotifications as apiGetNotifications,
  getOrderById,
  getOrders as apiGetOrders,
  getProducts,
  getRelatedProducts,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  markNotificationRead as apiMarkNotificationRead,
  removeFavorite,
  updateProfile as apiUpdateProfile,
  getAddresses,
  uploadImage,
  UploadImageFile,
  fetchMyCart,
  upsertCart,
} from './src/services/api';
import { socketService } from './src/services/socket';

import './src/i18n';

// UNCOMMENT THIS AFTER INSTALLING @react-native-firebase/messaging AND ADDING CONFIG FILES
import { requestUserPermission, getFcmToken, subscribeForegroundMessage, subscribeToFcmTokenRefresh } from './src/services/fcm';
import { useToast } from './src/components/common/ToastProvider';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';
type Screen = NavTab | 'product-detail' | 'checkout' | 'order-history' | 'order-detail' | 'auth' | 'notifications' | 'search' | 'filter' | 'address-book' | 'settings' | 'support' | 'wishlist' | 'change-password';

const SCREEN_DEPTH: Record<Screen, number> = {
  home: 0,
  catalog: 0,
  ai: 0,
  cart: 0,
  profile: 0,
  'product-detail': 1,
  checkout: 2,
  'order-history': 1,
  'order-detail': 2,
  auth: 1,
  notifications: 1,
  search: 1,
  filter: 2,
  'address-book': 1,
  settings: 1,
  support: 1,
  wishlist: 1,
  'change-password': 2,
};

const isTabScreen = (screen: Screen) =>
  screen === 'home' || screen === 'catalog' || screen === 'ai' || screen === 'cart' || screen === 'profile';

const getScreenDepth = (screen: Screen) => SCREEN_DEPTH[screen] ?? 1;

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  rating: number | null;
  onlyInStock: boolean;
}

const AUTH_STORAGE_KEY = 'electronicsshop/auth';
const CART_STORAGE_KEY = 'electronicsshop/cart';
const DEFAULT_PROFILE = {
  name: "Nguyễn Văn A",
  email: "nguyenva@example.com",
  avatar: "",
};

const CATEGORY_ALIASES: Record<string, string> = {
  'vi dieu khien': 'Vi điều khiển',
  'controller': 'Vi điều khiển',
  'microcontroller': 'Vi điều khiển',
  'cảm biến': 'Cảm biến',
  'sensor': 'Cảm biến',
  'nguon & pin': 'Nguồn & Pin',
  'nguon': 'Nguồn & Pin',
  'power': 'Nguồn & Pin',
  'battery': 'Nguồn & Pin',
  'dây & cáp': 'Dây & Cáp',
  'day & cap': 'Dây & Cáp',
  'cable': 'Dây & Cáp',
  'wire': 'Dây & Cáp',
  'dụng cụ': 'Dụng cụ',
  'dung cu': 'Dụng cụ',
  'tool': 'Dụng cụ',
  'tools': 'Dụng cụ',
  'ic số': 'IC số',
  'ic so': 'IC số',
  'ic': 'IC số',
  'digital ic': 'IC số',
  'điện trở': 'Điện trở',
  'dien tro': 'Điện trở',
  'resistor': 'Điện trở',
  'tụ điện': 'Tụ điện',
  'tu dien': 'Tụ điện',
  'capacitor': 'Tụ điện',
};

const normalizeCategoryName = (value?: string) => {
  const key = (value || '').trim().toLowerCase();
  return CATEGORY_ALIASES[key] || (value || '').trim();
};

const normalizeText = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const fuzzyMatch = (haystack: string, needle: string) => {
  const h = normalizeText(haystack);
  const n = normalizeText(needle);
  if (!n) return true;
  if (h.includes(n)) return true;

  const tokens = n.split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;

  // Mỗi từ khóa nhỏ phải xuất hiện ở đâu đó trong chuỗi gốc
  const allTokensIncluded = tokens.every(t => h.includes(t));
  if (allTokensIncluded) return true;

  // Cho phép match prefix của từ
  const words = h.split(/\s+/).filter(Boolean);
  return tokens.every(t => words.some(w => w.startsWith(t)));
};

async function persistAuthState(
  tokens: { accessToken: string; refreshToken: string },
  profile: typeof DEFAULT_PROFILE,
  userId?: string | null,
) {
  try {
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ tokens, profile, userId }),
    );
  } catch (error) {
    console.warn('App.tsx - Failed to persist auth state', error);
  }
}

async function clearPersistedAuthState() {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn('App.tsx - Failed to clear auth state', error);
  }
}

async function persistCartState(items: CartItem[]) {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('App.tsx - Failed to persist cart', error);
  }
}

async function loadPersistedCart(): Promise<CartItem[] | null> {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CartItem[];
  } catch (error) {
    console.warn('App.tsx - Failed to load cart', error);
    return null;
  }
}

const ORDER_STATUS_TEXT: Record<Order['status'], string> = {
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const formatRelativeTime = (value?: string | Date | null) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDateTime(date);
};

type UiNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  sendAt?: string;
};

const mapApiOrderToUi = (order: ApiOrder, productLookup: Product[] = PRODUCTS): Order => {
  const created = order.status?.ordered || order.createdAt || new Date().toISOString();
  const hasShipped = Boolean(order.status?.shipped);
  const hasPackaged = Boolean(order.status?.packaged);
  const hasConfirmed = Boolean(order.status?.confirmed);
  const isCompleted = hasShipped && order.paymentStatus === 'paid';
  const isCancelled = Boolean(order.isCancelled);

  let status: Order['status'] = 'processing';
  if (isCancelled) status = 'cancelled';
  else if (isCompleted) status = 'completed';
  else if (hasShipped) status = 'shipping';

  const addressString = [
    order.shippingAddress?.street,
    order.shippingAddress?.ward,
    order.shippingAddress?.district,
    order.shippingAddress?.city,
  ]
    .filter(Boolean)
    .join(', ') || 'Chưa có địa chỉ';

  const pickImage = (productId: string) =>
    productLookup.find(p => p.id === productId)?.image || productLookup[0]?.image || '';

  const timeline = [
    { time: formatDateTime(created), title: 'Đặt hàng thành công', active: Boolean(created) },
    { time: formatDateTime(order.status?.confirmed), title: 'Đã xác nhận đơn hàng', active: hasConfirmed },
    { time: formatDateTime(order.status?.packaged), title: 'Đang đóng gói', active: hasPackaged },
    { time: formatDateTime(order.status?.shipped), title: 'Đang giao hàng', active: hasShipped },
  ];

  if (!isCancelled) {
    timeline.push({
      time: isCompleted ? formatDateTime(order.status?.shipped) : '',
      title: 'Giao hàng thành công',
      active: isCompleted,
    });
  }

  return {
    id: order._id,
    code: order.code || order._id,
    date: formatDateTime(created),
    createdAt: typeof created === 'string' ? created : new Date(created).toISOString(),
    status,
    statusText: ORDER_STATUS_TEXT[status],
    items: order.items.map(item => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: pickImage(item.productId),
    })),
    shippingAddress: {
      name: order.shippingAddress?.name || 'Người nhận',
      phone: order.shippingAddress?.phone || '',
      address: addressString,
    },
    payment: {
      method: order.payment || 'cod',
      subtotal: order.subTotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.totalPrice,
    },
    timeline,
  };
};

const ForegroundNotificationHandler = () => {
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeForegroundMessage(({ title, body }) => {
      const text = title && body ? `${title}: ${body}` : title || body || 'Bạn có thông báo mới';
      showToast(text, 'info', 3500);
    });
    return () => unsubscribe?.();
  }, [showToast]);

  return null;
};

const computeCartTotals = (items: CartItem[]) => {
  const subTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const totalItem = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shippingFee = 0;
  const totalPrice = subTotal + shippingFee;
  return { subTotal, totalItem, shippingFee, totalPrice };
};

const mapApiCartToUi = (cart: ApiCart, productsLookup: Product[]): CartItem[] => {
  return (cart.items || []).map(item => {
    const found = productsLookup.find(p => p.id === item.productId);
    const priceFromProduct = found?.salePrice ?? found?.price ?? found?.originalPrice ?? item.price;
    return {
      id: item.productId,
      name: found?.name || item.name || 'Sản phẩm',
      price: priceFromProduct || 0,
      originalPrice: found?.originalPrice,
      salePrice: found?.salePrice,
      rating: found?.rating ?? 0,
      reviews: found?.reviews ?? 0,
      reviewCount: found?.reviewCount,
      averageRating: found?.averageRating,
      image: found?.image || item.image || '',
      images: found?.images,
      category: found?.category || item.category || 'Khác',
      stock: found?.stock || 'In Stock',
      stockQuantity: found?.stockQuantity,
      description: found?.description || '',
      specs: found?.specs || {},
      code: found?.code,
      saleCount: found?.saleCount,
      datasheet: found?.datasheet,
      quantity: item.quantity || 1,
    };
  });
};

const mapCartItemToApi = (item: CartItem): ApiCartItem => {
  const price = item.salePrice ?? item.price ?? item.originalPrice ?? 0;
  return {
    productId: item.id,
    quantity: item.quantity,
    price,
    name: item.name,
    category: item.category,
    image: item.image,
  };
};

const mergeCartItems = (localItems: CartItem[], remoteItems: CartItem[]) => {
  const map = new Map<string, CartItem>();
  const upsert = (source: CartItem[]) => {
    source.forEach(item => {
      const existing = map.get(item.id);
      if (existing) {
        const qty = (existing.quantity || 0) + (item.quantity || 0);
        map.set(item.id, { ...existing, ...item, quantity: qty });
      } else {
        map.set(item.id, item);
      }
    });
  };
  upsert(localItems);
  upsert(remoteItems);
  return Array.from(map.values());
};

const mapApiNotificationToUi = (item: ApiNotification): UiNotification => {
  const fallbackDate = item.deliveredAt || item.readAt || item.updatedAt || new Date().toISOString();
  const sendAt = item.sendAt || item.createdAt || fallbackDate;
  return {
    id: item.id || item._id || '',
    type: item.type || 'system',
    title: item.title || '',
    message: item.body || '',
    time: formatRelativeTime(sendAt),
    read: Boolean(item.isRead),
    sendAt: sendAt || undefined,
  };
};

const mapApiProductToUi = (product: ApiProduct): Product => {
    const stockNumber = product.stock ?? 0;
    const stockLabel =
      stockNumber <= 0 ? 'Out of Stock' : stockNumber < 5 ? 'Low Stock' : 'In Stock';

  const price = product.price?.salePrice ?? product.price?.originalPrice ?? 0;
  const originalPrice = product.price?.originalPrice || undefined;

  const specs: Record<string, string> = {};
  if (product.specs) {
    Object.entries(product.specs).forEach(([k, v]) => {
      if (v) specs[k] = v as string;
    });
  }

  const normalizedImages = (product.images || [])
    .map(img => (img || '').trim())
    .filter(Boolean);
  const primaryImage =
    normalizedImages.find(() => true) ||
    'https://images.unsplash.com/photo-1581093588401-99b6fa-2?auto=format&fit=crop&w=600&q=80';

  return {
    id: product._id,
    name: product.name,
    price,
    salePrice: product.price?.salePrice,
    originalPrice,
    rating: product.averageRating ?? 0,
    averageRating: product.averageRating ?? 0,
    reviews: product.reviewCount ?? 0,
    reviewCount: product.reviewCount ?? 0,
    image: primaryImage,
    images: normalizedImages,
    category: product.category || 'Khác',
    stock: stockLabel,
    stockQuantity: stockNumber,
    description: product.description || '',
    specs,
    code: product.code,
    saleCount: product.saleCount,
    datasheet: product.datasheet,
  };
};

const mapApiVoucherToUi = (voucher: ApiVoucher): Voucher => {
  const fallbackType = voucher.description?.toLowerCase().includes('ship') ? 'shipping' : 'fixed';
  return {
    id: voucher._id,
    code: voucher.code,
    description: voucher.description || '',
    type: voucher.type || fallbackType,
    discountPrice: Number(voucher.discountPrice ?? 0) || 0,
    discountRate: voucher.discountRate,
    maxDiscountPrice: voucher.maxDiscountPrice,
    minTotal: Number(voucher.minTotal) || 0,
    expire: voucher.expire,
  };
};

const mapApiBannerToUi = (banner: ApiBanner): HomeBanner => ({
  id: banner._id,
  title: banner.title,
  subtitle: banner.subtitle,
  imageUrl: banner.imageUrl,
  ctaLabel: banner.ctaLabel,
  ctaLink: banner.ctaLink,
  ctaProductId: banner.productId,
  isActive: banner.isActive,
  order: banner.order,
});

import { useTranslation } from 'react-i18next';

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const systemDarkMode = useColorScheme() === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(systemDarkMode);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [transitionState, setTransitionState] = useState<{ from: Screen; to: Screen } | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const productsRef = useRef<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTokens, setAuthTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [isRestoringAuth, setIsRestoringAuth] = useState(true);
  const authTokensRef = useRef<{ accessToken: string; refreshToken: string } | null>(null);
  const cartIdRef = useRef<string | null>(null);
  const cartSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fcmRefreshUnsubRef = useRef<(() => void) | null>(null);
  const hasFetchedCartRef = useRef(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000000],
    categories: [],
    rating: null,
    onlyInStock: false,
  });
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [userId, setUserId] = useState<string | null>(null);
  const transitionAnim = useRef(new Animated.Value(1)).current;
  const { width: screenWidth } = useWindowDimensions();

  // Animate transitions between screens for smoother iOS-like feel
  useEffect(() => {
    if (currentScreen === activeScreen) {
      if (transitionState) {
        setTransitionState(null);
        transitionAnim.setValue(1);
      }
      return;
    }

    const animation = Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.bezier(0.22, 1, 0.36, 1), // gentle ease-out, closer to native iOS push
      useNativeDriver: true,
    });

    setTransitionState({ from: activeScreen, to: currentScreen });
    transitionAnim.setValue(0);
    animation.start(() => {
      setActiveScreen(currentScreen);
      setTransitionState(null);
      transitionAnim.setValue(1);
    });

    return () => {
      animation.stop();
    };
  }, [activeScreen, currentScreen, transitionAnim, transitionState]);

  const loadProducts = async () => {
    try {
      const result = await getProducts();
      const mapped = result.map(mapApiProductToUi);
      setProducts(mapped);
      productsRef.current = mapped;
      setCartItems(prev =>
        prev.map(item => {
          const updated = mapped.find(p => p.id === item.id);
          return updated
            ? { ...item, stockQuantity: updated.stockQuantity, stock: updated.stock }
            : item;
        }),
      );
      return mapped;
    } catch (error: any) {
      console.warn('App.tsx - Failed to load products', error?.message || error);
      return undefined;
    }
  };

  useEffect(() => {
    socketService.connect();
    const handleProductUpdate = () => {
      void loadProducts();
    };
    socketService.on('product_updated', handleProductUpdate);
    return () => {
      socketService.off('product_updated');
    };
  }, []);

  const loadBanners = async () => {
    try {
      const result = await getPublicBanners();
      setBanners(result.map(mapApiBannerToUi));
    } catch (error: any) {
      console.warn('App.tsx - Failed to load banners', error?.message || error);
    }
  };

  const loadFavorites = async (tokenOverride?: string) => {
    const token = tokenOverride || authTokensRef.current?.accessToken;
    if (!token) return;
    try {
      const result = await apiGetFavorites(token);
      const mapped = result.map(mapApiProductToUi);
      setWishlist(mapped);
    } catch (error: any) {
      console.warn('App.tsx - Failed to load favorites', error?.message || error);
    }
  };

  const loadOrders = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || authTokensRef.current?.accessToken;
    if (!token) return;

    try {
      const result = await apiGetOrders(token);
      const mapped = result
        .map(o => mapApiOrderToUi(o, productsRef.current))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
      setOrders(mapped);
    } catch (error: any) {
      console.warn('App.tsx - Failed to load orders', error?.message || error);
    }
  }, []);

  const loadVouchers = async (tokenOverride?: string) => {
    const token = tokenOverride || authTokensRef.current?.accessToken;
    if (!token) return;
    try {
      const result = await getMyVouchers(token);
      const mapped = result.map(mapApiVoucherToUi);
      setVouchers(mapped);
    } catch (error: any) {
      console.warn('App.tsx - Failed to load vouchers', error?.message || error);
    }
  };

  const loadAddresses = async (tokenOverride?: string) => {
    const token = tokenOverride || authTokensRef.current?.accessToken;
    if (!token) return;
    try {
      const result = await getAddresses(token);
      setAddresses(result);
    } catch (error: any) {
      console.warn('App.tsx - Failed to load addresses', error?.message || error);
    }
  };

  const syncNotificationsFromApi = (items: ApiNotification[]) => {
    const mapped = (items || [])
      .map(mapApiNotificationToUi)
      .filter(item => item.id)
      .sort((a, b) => {
        const timeA = a.sendAt ? new Date(a.sendAt).getTime() : 0;
        const timeB = b.sendAt ? new Date(b.sendAt).getTime() : 0;
        return timeB - timeA;
      });
    setNotifications(mapped);
  };

  const loadNotifications = async (tokenOverride?: string, options?: { silent?: boolean }) => {
    const token = tokenOverride || authTokensRef.current?.accessToken;
    if (!token) return;
    const showSpinner = !options?.silent;
    if (showSpinner) setIsRefreshingNotifications(true);
    try {
      const result = await apiGetNotifications(token);
      syncNotificationsFromApi(result);
    } catch (error: any) {
      console.warn('App.tsx - Failed to load notifications', error?.message || error);
    } finally {
      if (showSpinner) setIsRefreshingNotifications(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    const token = authTokensRef.current?.accessToken;
    if (!token) return;
    try {
      const result = await getOrderById(orderId, token);
      const mapped = mapApiOrderToUi(result, productsRef.current);
      setOrders(prev => {
        const exists = prev.some(o => o.id === mapped.id);
        const updated = exists ? prev.map(o => (o.id === mapped.id ? mapped : o)) : [mapped, ...prev];
        return updated.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });
      });
    } catch (error: any) {
      console.warn('App.tsx - Failed to fetch order detail', error?.message || error);
    }
  };

  const handleDeepLink = useCallback(
    (url?: string | null) => {
      if (!url) return;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'electronicsshop:') return;
        const host = parsed.host;
        if (host === 'payment' || host === 'payment-return') {
          const order = parsed.searchParams.get('order') || '';
          const status = parsed.searchParams.get('status') || '';
          const success = status === 'paid';
          Alert.alert(
            'Thanh toán',
            success
              ? `Đơn hàng ${order ? `#${order} ` : ''}đã thanh toán thành công`
              : 'Thanh toán không thành công',
          );
          void loadOrders();
        }
      } catch (error) {
        console.warn('App.tsx - Failed to handle deep link', error);
      }
    },
    [loadOrders],
  );

  const syncAuthTokens = useCallback((
    tokens: { accessToken: string; refreshToken: string },
    user?: { name?: string; email?: string; avatar?: string; _id?: string },
    userIdOverride?: string | null,
  ) => {
    authTokensRef.current = tokens;
    setAuthTokens(tokens);
    setIsLoggedIn(true);
    const nextUserId = userIdOverride ?? user?._id ?? userId ?? null;
    setUserId(nextUserId);
    setUserProfile(prev => {
      const nextProfile = {
        ...prev,
        ...(user?.name ? { name: user.name } : {}),
        ...(user?.email ? { email: user.email } : {}),
        ...(user?.avatar ? { avatar: user.avatar } : {}),
      };
      void persistAuthState(tokens, nextProfile, nextUserId);
      return nextProfile;
    });
  }, [userId]);

  const handleAuthFailure = useCallback(() => {
    setIsLoggedIn(false);
    setAuthTokens(null);
    authTokensRef.current = null;
    cartIdRef.current = null;
    hasFetchedCartRef.current = false;
    setUserProfile(DEFAULT_PROFILE);
    setUserId(null);
    setVouchers([]);
    setNotifications([]);
    setIsRefreshingNotifications(false);
    setAddresses(DEFAULT_ADDRESSES);
    setCartItems([]);
    void clearPersistedAuthState();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    
    // Initial client-side filter for immediate feedback
    const localRelated = products
      .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
      .slice(0, 6);
    setRelatedProducts(localRelated);

    // Fetch from API for better recommendations
    getRelatedProducts(selectedProduct.id)
      .then(res => {
        if (res && res.length > 0) {
          setRelatedProducts(res.map(mapApiProductToUi));
        }
      })
      .catch(err => {
        console.warn('App.tsx - Failed to load related products', err);
      });
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (!selectedProduct) return;
    const updated = products.find(p => p.id === selectedProduct.id);
    if (!updated) return;
    const hasChanged =
      updated.stockQuantity !== selectedProduct.stockQuantity ||
      updated.stock !== selectedProduct.stock ||
      updated.price !== selectedProduct.price;
    if (hasChanged) {
      setSelectedProduct(updated);
    }
  }, [products, selectedProduct]);

  useEffect(() => {
    configureApiAuth({
      getTokens: () => authTokensRef.current,
      onTokensRefreshed: (tokens, user) => syncAuthTokens(tokens, user),
      onAuthFailure: handleAuthFailure,
    });
  }, [handleAuthFailure, syncAuthTokens]);

  useEffect(() => {
    if (!isLoggedIn || !authTokens?.accessToken) {
      fcmRefreshUnsubRef.current?.();
      fcmRefreshUnsubRef.current = null;
      return;
    }

    let isMounted = true;

    requestUserPermission()
      .then(enabled => {
        if (!enabled || !isMounted) return;
        return getFcmToken(authTokens.accessToken);
      })
      .catch(err => console.warn('App.tsx - FCM permission/token error', err));

    fcmRefreshUnsubRef.current?.();
    fcmRefreshUnsubRef.current = subscribeToFcmTokenRefresh(authTokens.accessToken);

    return () => {
      isMounted = false;
      fcmRefreshUnsubRef.current?.();
      fcmRefreshUnsubRef.current = null;
    };
  }, [isLoggedIn, authTokens?.accessToken]);

  useEffect(() => {
    Linking.getInitialURL()
      .then(handleDeepLink)
      .catch(() => undefined);
    const sub = Linking.addEventListener('url', event => handleDeepLink(event.url));
    return () => sub.remove();
  }, [handleDeepLink]);

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.tokens?.accessToken && parsed?.tokens?.refreshToken) {
            syncAuthTokens(parsed.tokens, parsed.profile, parsed.userId ?? null);
            await loadOrders(parsed.tokens.accessToken);
            await loadFavorites(parsed.tokens.accessToken);
            await loadVouchers(parsed.tokens.accessToken);
            await loadNotifications(parsed.tokens.accessToken, { silent: true });
            await loadAddresses(parsed.tokens.accessToken);
          }
        }

        const storedCart = await loadPersistedCart();
        if (storedCart) {
          setCartItems(storedCart);
        }
      } catch (error) {
        console.warn('App.tsx - Failed to restore auth state', error);
      } finally {
        setIsRestoringAuth(false);
      }
    };

    restoreAuth();
  }, [syncAuthTokens]);

  useEffect(() => {
    if (!isLoggedIn || !authTokens?.accessToken) {
      cartIdRef.current = null;
      hasFetchedCartRef.current = false;
      return;
    }
    if (hasFetchedCartRef.current) return;
    hasFetchedCartRef.current = true;
    const token = authTokens.accessToken;
    fetchMyCart(token)
      .then(res => {
        const cart = Array.isArray(res) ? res[0] : null;
        if (!cart) {
          cartIdRef.current = null;
          return;
        }
        cartIdRef.current = cart._id || null;
        const mapped = mapApiCartToUi(cart, productsRef.current);
        setCartItems(prev => mergeCartItems(prev, mapped));
      })
      .catch(err => console.warn('App.tsx - Failed to fetch cart', err));
  }, [isLoggedIn, authTokens?.accessToken, products]);

  useEffect(() => {
    void loadProducts();
    void loadBanners();
  }, []);

  useEffect(() => {
    socketService.connect();
    const handleDbChange = (payload: any) => {
      if (payload?.collection === 'users' && userId && `${payload.documentId}` === `${userId}`) {
        const doc = payload.fullDocument || {};
        setUserProfile(prev => {
          const next = {
            ...prev,
            ...(doc.name ? { name: doc.name } : {}),
            ...(doc.email ? { email: doc.email } : {}),
            ...(doc.avatar ? { avatar: doc.avatar } : {}),
          };
          void persistAuthState(authTokensRef.current as any, next, userId);
          return next;
        });
      }

      if (payload?.collection === 'vouchers' && authTokensRef.current?.accessToken) {
        void loadVouchers();
      }

      // Lắng nghe thay đổi notification state theo user (Mongo change stream)
      if (
        payload?.collection === 'user_notification_status' &&
        userId &&
        `${payload.fullDocument?.user_id || payload.fullDocument?.userId}` === `${userId}`
      ) {
        void loadNotifications(undefined, { silent: true });
      }

      if (payload?.collection === 'notifications' && authTokensRef.current?.accessToken) {
        // Khi có broadcast mới, refresh danh sách người dùng hiện tại
        void loadNotifications(undefined, { silent: true });
      }

      if (payload?.collection === 'products') {
        const op = payload.operationType;
        const doc = payload.fullDocument;
        if (op === 'delete') {
          setProducts(prev => {
            const filtered = prev.filter(p => p.id !== `${payload.documentId}`);
            productsRef.current = filtered;
            return filtered;
          });
          setSelectedProduct(prev => (prev && prev.id === `${payload.documentId}` ? null : prev));
          return;
        }
        if (doc) {
          const mapped = mapApiProductToUi(doc);
          setProducts(prev => {
            const exists = prev.some(p => p.id === mapped.id);
            const next = exists ? prev.map(p => (p.id === mapped.id ? mapped : p)) : [mapped, ...prev];
            productsRef.current = next;
            return next;
          });
          setSelectedProduct(prev => (prev && prev.id === mapped.id ? mapped : prev));
        } else {
          void loadProducts(); // fallback
        }
      }
    };
    socketService.on('db_change', handleDbChange);
    return () => {
      socketService.off('db_change');
    };
  }, [userId]);

  useEffect(() => {
    if (isRestoringAuth) return;
    if (isLoggedIn && authTokens) {
      void persistAuthState(authTokens, userProfile, userId);
    }
  }, [authTokens, isLoggedIn, userProfile, isRestoringAuth, userId]);

  useEffect(() => {
    if (isLoggedIn && authTokens?.accessToken) {
      void loadOrders();
      void loadFavorites();
      void loadVouchers();
      void loadNotifications(undefined, { silent: true });
      void loadAddresses();
    } else if (!isLoggedIn) {
      setOrders([]);
      setWishlist([]);
      setVouchers([]);
      setNotifications([]);
      setAddresses(DEFAULT_ADDRESSES);
    }
  }, [isLoggedIn, authTokens?.accessToken]);

  useEffect(() => {
    if (selectedOrderId && !orders.find(o => o.id === selectedOrderId)) {
      void fetchOrderDetail(selectedOrderId);
    }
  }, [selectedOrderId, orders]);

  const handleUpdateProfile = async (
    data: Partial<typeof userProfile> & { avatarFile?: UploadImageFile },
  ) => {
    try {
      // Optimistic update so UI responds instantly
      const optimisticAvatar = data.avatar || data.avatarFile?.uri || userProfile.avatar;
      const optimisticProfile = {
        ...userProfile,
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(optimisticAvatar ? { avatar: optimisticAvatar } : {}),
      };
      setUserProfile(optimisticProfile);
      if (authTokensRef.current) {
        void persistAuthState(authTokensRef.current as any, optimisticProfile, userId);
      }

      const accessToken = authTokensRef.current?.accessToken;
      if (!accessToken) {
        return true;
      }

      // Sync in background to avoid blocking UI
      const syncProfile = async () => {
        try {
          let avatarToUpdate = optimisticAvatar;

          if (data.avatarFile?.uri) {
            const uploadResult = await uploadImage(data.avatarFile, {
              token: authTokensRef.current?.accessToken,
              folder: `electronics-shop/avatars/${userId || 'guest'}`,
            });
            avatarToUpdate = uploadResult?.secure_url || uploadResult?.url || avatarToUpdate;
          }

          const payload = {
            ...(data.name ? { name: data.name } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(avatarToUpdate ? { avatar: avatarToUpdate } : {}),
          };

          if (!Object.keys(payload).length) return;

          const result = await apiUpdateProfile(
            payload,
            authTokensRef.current?.accessToken || accessToken,
          );
          const updatedUser = result.user || payload;
          setUserProfile(prev => {
            const next = { ...prev, ...updatedUser };
            if (authTokensRef.current) {
              void persistAuthState(authTokensRef.current as any, next, userId);
            }
            return next;
          });
        } catch (error: any) {
          console.warn('App.tsx - Background profile sync failed', error?.message || error);
        }
      };

      void syncProfile();
      return true;
    } catch (error: any) {
      console.warn('App.tsx - Failed to update profile', error?.message || error);
      return false;
    }
  };

  // Filter function to apply filters to products
  const applyFilters = (products: Product[], searchText?: string): Product[] => {
    return products.filter(product => {
      const normalizedSearch = normalizeText(searchText);
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        const productCat = normalizeCategoryName(product.category);
        const filterCats = filters.categories.map(normalizeCategoryName);
        if (!filterCats.includes(productCat)) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating !== null && product.rating < filters.rating) {
        return false;
      }

      // Stock filter - only exclude Out of Stock products
      if (filters.onlyInStock && product.stock === 'Out of Stock') {
        return false;
      }

      // Search text filter
      if (searchText) {
        const haystacks = [
          product.name,
          product.code || '',
          product.category || '',
          normalizeCategoryName(product.category),
          product.description || '',
          Object.entries(product.specs || {})
            .map(([k, v]) => `${k} ${v}`)
            .join(' '),
        ];
        const matches = haystacks.some(hay => fuzzyMatch(hay, searchText));
        if (!matches) return false;
      }

      return true;
    });
  };

  const hasUnreadNotifications = notifications.some(notification => !notification.read);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    setCurrentScreen(tab);
  };
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentTab('catalog');
    setCurrentScreen('catalog');
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product-detail');
  };

  const handleBannerPress = (banner: HomeBanner) => {
    if (banner.ctaProductId) {
      const targetProduct = productsRef.current.find(p => p.id === banner.ctaProductId);
      if (targetProduct) {
        navigateToProduct(targetProduct);
        return;
      }
    }

    if (banner.ctaLink) {
      Linking.openURL(banner.ctaLink).catch(() => Alert.alert('Không mở được liên kết', 'Vui lòng thử lại sau.'));
      return;
    }

    if (productsRef.current[0]) {
      navigateToProduct(productsRef.current[0]);
    }
  };

  const navigateToCheckout = () => {
    if (!isLoggedIn) {
      setCurrentTab('profile');
      setCurrentScreen('auth');
    } else {
      setCurrentScreen('checkout');
    }
  };

  const navigateToOrderHistory = () => {
    setCurrentScreen('order-history');
  };

  const openNotifications = () => {
    if (!authTokensRef.current?.accessToken) {
      setPreviousScreen(currentScreen);
      setCurrentTab('profile');
      setCurrentScreen('auth');
      return;
    }
    void loadNotifications(undefined, { silent: false });
    setCurrentScreen('notifications');
  };

  const refreshNotifications = () => {
    void loadNotifications(undefined, { silent: false });
  };

  const handleMarkNotificationRead = async (id: string) => {
    if (!authTokensRef.current?.accessToken) return;
    setNotifications(prev => prev.map(item => (item.id === id ? { ...item, read: true } : item)));
    try {
      const result = await apiMarkNotificationRead(id, authTokensRef.current.accessToken);
      syncNotificationsFromApi(result);
    } catch (error: any) {
      console.warn('App.tsx - Failed to mark notification read', error?.message || error);
      void loadNotifications(undefined, { silent: true });
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!authTokensRef.current?.accessToken) return;
    try {
      const result = await apiMarkAllNotificationsRead(authTokensRef.current.accessToken);
      syncNotificationsFromApi(result);
    } catch (error: any) {
      console.warn('App.tsx - Failed to mark all notifications read', error?.message || error);
    }
  };

  const navigateToOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentScreen('order-detail');
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    const available = product.stockQuantity;
    const isOutOfStock = product.stock === 'Out of Stock' || (available !== undefined && available <= 0);
    if (isOutOfStock) {
      Alert.alert('Hết hàng', `${product.name} hiện không còn hàng.`);
      return false;
    }

    const safeQuantity = Math.max(1, quantity);
    const limit = available ?? Number.POSITIVE_INFINITY;

    let success = false;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const desired = existing.quantity + safeQuantity;
        const clamped = Math.min(desired, limit);
        if (clamped < desired) {
          Alert.alert('Không đủ hàng', `Chỉ còn ${clamped} sản phẩm ${product.name} trong kho.`);
          return prev; // Không thay đổi gì
        }
        success = true;
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: Math.max(1, clamped) } : item,
        );
      }

      const initialQty = Math.min(safeQuantity, limit);
      if (initialQty < safeQuantity) {
        Alert.alert('Không đủ hàng', `Chỉ còn ${initialQty} sản phẩm ${product.name} trong kho.`);
        return prev; // Không thay đổi gì
      }
      success = true;
      return [...prev, { ...product, quantity: Math.max(1, initialQty) }];
    });
    return success;
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const limit = item.stockQuantity ?? Number.POSITIVE_INFINITY;
        const desired = item.quantity + delta;
        const clamped = Math.max(1, Math.min(desired, limit));
        if (clamped !== desired) {
          Alert.alert(
            'Không đủ hàng',
            limit === Number.POSITIVE_INFINITY
              ? 'Không thể giảm dưới 1 sản phẩm.'
              : `Sản phẩm chỉ còn ${limit} cái.`,
          );
        }
        return { ...item, quantity: clamped };
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    void persistCartState(cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (!authTokensRef.current?.accessToken) return;
    if (cartSyncTimeoutRef.current) {
      clearTimeout(cartSyncTimeoutRef.current);
    }
    cartSyncTimeoutRef.current = setTimeout(async () => {
      const token = authTokensRef.current?.accessToken;
      if (!token) return;
      try {
        const payloadItems = cartItems.map(mapCartItemToApi);
        const totals = computeCartTotals(cartItems);
        const result = await upsertCart(payloadItems, token, cartIdRef.current, totals);
        if (result?._id) {
          cartIdRef.current = result._id;
        }
      } catch (error) {
        console.warn('App.tsx - Failed to sync cart to backend', error);
      }
    }, 400);

    return () => {
      if (cartSyncTimeoutRef.current) {
        clearTimeout(cartSyncTimeoutRef.current);
      }
    };
  }, [cartItems, authTokens?.accessToken]);

  const placeOrder = async (params: {
    items: CartItem[];
    totals: { subTotal: number; shippingFee: number; discount: number; total: number };
    paymentMethod: string;
    shippingAddress?: Address;
  }) => {
    if (!authTokensRef.current?.accessToken) {
      throw new Error('Bạn cần đăng nhập để đặt hàng');
    }

    const code = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const normalizedPayment = params.paymentMethod?.toLowerCase() || 'cod';
    const isVnpay = normalizedPayment === 'vnpay';

    // Refresh stock before placing order to avoid overselling
    const latestProducts = (await loadProducts()) || productsRef.current;
    const stockMap = new Map<string, number | undefined>(
      latestProducts.map(p => [p.id, p.stockQuantity]),
    );

    for (const item of params.items) {
      const available = stockMap.get(item.id);
      if (available !== undefined && available < item.quantity) {
        throw new Error(`Sản phẩm ${item.name} chỉ còn ${available} cái trong kho.`);
      }
      if (!/^[a-f0-9]{24}$/i.test(item.id)) {
        throw new Error(`ID sản phẩm ${item.name} không hợp lệ.`);
      }
    }

    const payload = {
      code,
      status: { ordered: new Date().toISOString() },
      items: params.items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.price * item.quantity,
        shippingFee: 0,
        discount: 0,
        totalPrice: item.price * item.quantity,
      })),
      subTotal: params.totals.subTotal,
      shippingFee: params.totals.shippingFee,
      discount: params.totals.discount,
      totalPrice: params.totals.total,
      payment: normalizedPayment,
      paymentStatus: normalizedPayment === 'cod' ? 'pending' : 'pending',
      shippingAddress: params.shippingAddress
        ? {
            name: params.shippingAddress.name,
            phone: params.shippingAddress.phone,
            city: params.shippingAddress.city,
            district: params.shippingAddress.district,
            ward: params.shippingAddress.ward,
            street: params.shippingAddress.detailedAddress || params.shippingAddress.address,
          }
        : undefined,
    };

    setIsPlacingOrder(true);
    try {
      if (isVnpay) {
        const payment = await createVnpayPayment(payload, authTokensRef.current.accessToken);
        const uiOrder = mapApiOrderToUi(payment.order, productsRef.current);
        setOrders(prev => [uiOrder, ...prev]);
        return { ...uiOrder, paymentUrl: payment.paymentUrl };
      }

      const created = await apiCreateOrder(payload, authTokensRef.current.accessToken);
      const uiOrder = mapApiOrderToUi(created, productsRef.current);
      setOrders(prev => [uiOrder, ...prev]);
      void loadProducts();
      return uiOrder;
    } catch (error: any) {
      console.warn('App.tsx - Failed to create order', error?.message || error);
      throw error;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const syncFavorites = (apiProducts: ApiProduct[]) => {
    const mapped = apiProducts.map(mapApiProductToUi);
    setWishlist(mapped);
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!authTokensRef.current?.accessToken) {
      setPreviousScreen(currentScreen);
      setCurrentTab('profile');
      setCurrentScreen('auth');
      return;
    }
    try {
      const updated = await removeFavorite(productId, authTokensRef.current.accessToken);
      syncFavorites(updated);
    } catch (error) {
      console.warn('App.tsx - Failed to remove favorite', error);
    }
  };

  const handleToggleWishlistAsync = async (product: Product) => {
    if (!authTokensRef.current?.accessToken) {
      setPreviousScreen(currentScreen);
      setCurrentTab('profile');
      setCurrentScreen('auth');
      return;
    }

    const exists = wishlist.some(item => item.id === product.id);
    try {
      if (exists) {
        const updated = await removeFavorite(product.id, authTokensRef.current.accessToken);
        syncFavorites(updated);
      } else {
        const updated = await addFavorite(product.id, authTokensRef.current.accessToken);
        syncFavorites(updated);
      }
    } catch (error) {
      console.warn('App.tsx - Failed to toggle favorite', error);
    }
  };

  const handleReviewStatsChange = (
    productId: string,
    stats: { averageRating: number; reviewCount: number },
  ) => {
    setProducts(prev => {
      const next = prev.map(p =>
        p.id === productId
          ? {
              ...p,
              rating: stats.averageRating,
              averageRating: stats.averageRating,
              reviews: stats.reviewCount,
              reviewCount: stats.reviewCount,
            }
          : p,
      );
      productsRef.current = next;
      return next;
    });

    setSelectedProduct(prev =>
      prev?.id === productId
        ? {
            ...prev,
            rating: stats.averageRating,
            averageRating: stats.averageRating,
            reviews: stats.reviewCount,
            reviewCount: stats.reviewCount,
          }
        : prev,
    );
  };

  const handleLoginSuccess = (data: AuthResponse) => {
    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    setAddresses([]); // reset stale addresses from previous session
    syncAuthTokens(tokens, data.user, data.user?._id ?? null);
    void loadOrders(tokens.accessToken);
    void loadFavorites(tokens.accessToken);
    void loadVouchers(tokens.accessToken);
    void loadNotifications(tokens.accessToken, { silent: true });
    void loadAddresses(tokens.accessToken);

    if (currentScreen === 'auth') {
      if (previousScreen === 'product-detail') {
        setCurrentScreen('product-detail');
      } else {
        handleTabChange('profile');
      }
    }
  };

  const openFilter = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen('filter');
  };

  const renderScreen = (screen: Screen) => {
    switch (screen) {
      case 'home':
        return (
          <Home
            onNavigate={(tab) => handleTabChange(tab as NavTab)}
            onProductClick={navigateToProduct}
            theme={theme}
            products={products}
            banners={banners}
            onBannerPress={handleBannerPress}
            onSelectCategory={handleSelectCategory}
            onRefreshProducts={() => { void loadProducts(); }}
          />
        );
      case 'catalog':
        return (
          <Catalog 
            onFilterClick={openFilter} 
            onProductClick={navigateToProduct} 
            filters={filters}
            applyFilters={applyFilters}
            theme={theme}
            products={products}
            initialCategory={selectedCategory}
          />
        );
      case 'ai':
        return (
          <AIChat
            theme={theme}
            onNotificationClick={openNotifications}
            accessToken={authTokens?.accessToken}
            messages={aiMessages}
            onMessagesChange={setAiMessages}
            onAddToCart={handleAddToCart}
            onRequireLogin={() => {
              setPreviousScreen('ai');
              setCurrentTab('profile');
              setCurrentScreen('auth');
            }}
            onOpenProduct={(productId) => {
              const target = products.find((p) => p.id === productId);
              if (target) {
                navigateToProduct(target);
              }
            }}
          />
        );
      case 'cart':
        return (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onExplore={() => handleTabChange('catalog')}
            onCheckout={navigateToCheckout}
            theme={theme}
            vouchers={vouchers}
          />
        );
      case 'profile':
        if (!isLoggedIn) return <Auth onBack={() => handleTabChange('home')} onLoginSuccess={handleLoginSuccess} theme={theme} />;
        return (
          <Profile
            onNavigateToOrders={navigateToOrderHistory}
            orderCount={orders.length}
            onNavigateToAddress={() => setCurrentScreen('address-book')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onNavigateToSupport={() => setCurrentScreen('support')}
            onNavigateToWishlist={() => setCurrentScreen('wishlist')}
            onLogout={handleAuthFailure}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            theme={theme}
            vouchers={vouchers}
          />
        );

      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => handleTabChange(currentTab)}
            onAddToCart={handleAddToCart}
            isFavorite={wishlist.some(item => item.id === selectedProduct.id)}
            onToggleFavorite={() => handleToggleWishlistAsync(selectedProduct)}
            isLoggedIn={isLoggedIn}
            onRequireLogin={() => {
              setPreviousScreen('product-detail');
              setCurrentTab('profile');
              setCurrentScreen('auth');
            }}
            accessToken={authTokens?.accessToken}
            theme={theme}
            currentUserId={userId}
            currentUserName={userProfile.name}
            onReviewStatsChange={handleReviewStatsChange}
            onNavigateToCart={() => handleTabChange('cart')}
            cartItemCount={cartCount}
            relatedProducts={relatedProducts}
            onProductClick={navigateToProduct}
          />
        ) : null;

      case 'checkout':
        return (
      <Checkout
        onBack={() => handleTabChange('cart')}
        onPlaceOrder={async ({ address, paymentMethod, shippingFee, items, totalAmount, subTotal, discount }) => {
          const created = await placeOrder({
            items,
                paymentMethod,
                totals: {
                  subTotal,
                  shippingFee,
                  discount: discount ?? 0,
                  total: totalAmount,
                },
                shippingAddress: address,
              });
              return { id: (created as any).id, code: (created as any).code, paymentUrl: (created as any).paymentUrl };
            }}
            onCheckPaymentStatus={async (orderId: string) => {
              if (!authTokensRef.current?.accessToken) return 'pending';
              try {
                const order = await getOrderById(orderId, authTokensRef.current.accessToken);
                const status = order.paymentStatus?.toLowerCase?.() || '';
                if (status === 'paid') return 'paid';
                if (status === 'failed') return 'failed';
                return 'pending';
              } catch (error) {
                console.warn('App.tsx - Failed to check payment status', error);
                return undefined;
              }
            }}
            placingOrder={isPlacingOrder}
            onSuccess={() => {
              setCartItems([]);
              handleTabChange('home');
              void loadOrders();
            }}
            cartItems={cartItems}
        theme={theme}
        addresses={addresses}
        onUpdateAddresses={setAddresses}
        accessToken={authTokens?.accessToken}
      />
        );

      case 'order-history':
        console.log('App.tsx - Rendering OrderHistory with orders count:', orders.length);
        return <OrderHistory onBack={() => handleTabChange('profile')} onViewDetail={navigateToOrderDetail} orders={orders} theme={theme} />;

      case 'order-detail':
        return selectedOrderId ? (
          <OrderDetail 
            orderId={selectedOrderId} 
            onBack={navigateToOrderHistory} 
            order={orders.find(o => o.id === selectedOrderId)}
            theme={theme}
            onReorder={handleAddToCart}
            products={products}
            onNavigateToCart={() => handleTabChange('cart')}
          />
        ) : null;

      case 'auth':
        return <Auth onBack={() => handleTabChange(currentTab)} onLoginSuccess={handleLoginSuccess} theme={theme} />;

      case 'notifications':
        return (
          <Notifications
            onBack={() => handleTabChange(currentTab)}
            theme={theme}
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onMarkRead={handleMarkNotificationRead}
            refreshing={isRefreshingNotifications}
            onRefresh={refreshNotifications}
          />
        );

      case 'search':
        return (
          <SearchScreen
            onBack={() => handleTabChange(currentTab)}
            onProductClick={navigateToProduct}
            onFilterClick={openFilter}
            initialQuery={searchQuery}
            onQueryChange={setSearchQuery}
            filters={filters}
            applyFilters={applyFilters}
            products={products}
            theme={theme}
          />
        );

      case 'filter':
        return (
          <FilterScreen
            onClose={() => setCurrentScreen(previousScreen)}
            onApply={(newFilters) => {
              setFilters({
                priceRange: newFilters.priceRange || [0, 10000000],
                categories: newFilters.categories || [],
                rating: newFilters.rating || null,
                onlyInStock: newFilters.onlyInStock || false,
              });
              setCurrentScreen(previousScreen);
            }}
            currentFilters={filters}
            getFilteredCount={(tempFilters) => {
              // Create a temporary filter function with the temp filters
              const tempFilterState: FilterState = {
                priceRange: tempFilters.priceRange || filters.priceRange,
                categories: tempFilters.categories || filters.categories,
                rating: tempFilters.rating !== undefined ? tempFilters.rating : filters.rating,
                onlyInStock: tempFilters.onlyInStock !== undefined ? tempFilters.onlyInStock : filters.onlyInStock,
              };
              
              // Apply filters without changing state
              return products.filter(product => {
                if (product.price < tempFilterState.priceRange[0] || product.price > tempFilterState.priceRange[1]) {
                  return false;
                }
                if (tempFilterState.categories.length > 0 && !tempFilterState.categories.includes(product.category)) {
                  return false;
                }
                if (tempFilterState.rating !== null && product.rating < tempFilterState.rating) {
                  return false;
                }
                if (tempFilterState.onlyInStock && product.stock === 'Out of Stock') {
                  return false;
                }
                return true;
              }).length;
            }}
            theme={theme}
          />
        );

      case 'address-book':
        return (
          <AddressBook
            onBack={() => handleTabChange('profile')}
            theme={theme}
            addresses={addresses}
            onUpdateAddresses={setAddresses}
            accessToken={authTokens?.accessToken}
          />
        );

      case 'settings':
        return (
          <Settings
            onBack={() => handleTabChange('profile')}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onChangePassword={() => setCurrentScreen('change-password')}
            theme={theme}
          />
        );

      case 'support':
        return <SupportCenter onBack={() => handleTabChange('profile')} theme={theme} />;

      case 'wishlist':
        return (
          <Wishlist
            items={wishlist}
            onBack={() => handleTabChange('profile')}
            onRemove={(id) => { void handleRemoveFavorite(id); }}
            onProductClick={navigateToProduct}
            theme={theme}
          />
        );

      case 'change-password':
        return (
          <ChangePassword
            onBack={() => setCurrentScreen('settings')}
            theme={theme}
            email={userProfile.email}
            accessToken={authTokens?.accessToken}
            onSuccess={() => setCurrentScreen('settings')}
          />
        );

      default:
        return (
          <Home
            onNavigate={(tab) => handleTabChange(tab as NavTab)}
            onProductClick={navigateToProduct}
            products={products}
            banners={banners}
            onBannerPress={handleBannerPress}
          />
        );
    }
  };

  const isFullScreen = ['product-detail', 'checkout', 'order-history', 'order-detail', 'notifications', 'search', 'filter', 'address-book', 'settings', 'support', 'wishlist', 'change-password'].includes(currentScreen);
  const showTopBar = !isFullScreen && currentScreen !== 'ai' && currentScreen !== 'profile' && currentScreen !== 'auth';
  const isTransitioning = Boolean(transitionState);
  const baseScreen = transitionState?.from ?? activeScreen;
  const transitionDirection: 'forward' | 'back' | 'fade' = transitionState
    ? (() => {
        const fromDepth = getScreenDepth(transitionState.from);
        const toDepth = getScreenDepth(transitionState.to);
        if (isTabScreen(transitionState.from) && isTabScreen(transitionState.to)) return 'fade';
        if (toDepth === fromDepth) return 'forward';
        return toDepth > fromDepth ? 'forward' : 'back';
      })()
    : 'forward';
  const slideDistance = screenWidth || 1;
  const incomingTranslate = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: transitionDirection === 'back' ? [-slideDistance * 0.35, 0] : [slideDistance, 0],
    extrapolate: 'clamp',
  });
  const fadeIn = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ theme, isDarkMode }}>
        <ToastProvider>
          <ForegroundNotificationHandler />
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor={theme.surface}
            translucent={true}
          />
          <View style={[styles.container, { backgroundColor: theme.background }]}>
          {showTopBar && (
            <TopBar
              title={currentScreen === 'cart' ? t('cart_title') : t('app_name')}
              showSearch={currentScreen === 'home'}
              onSearchClick={() => setCurrentScreen('search')}
              onFilterClick={openFilter}
              onNotificationClick={openNotifications}
              hasUnread={hasUnreadNotifications}
              theme={theme}
            />
          )}

          <View style={[styles.content, { backgroundColor: theme.background }]}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.background },
              ]}
              pointerEvents={isTransitioning ? 'none' : 'auto'}
            >
              {renderScreen(baseScreen)}
            </Animated.View>

            {transitionState && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: theme.background },
                  transitionDirection === 'fade'
                    ? { opacity: fadeIn }
                    : {
                        transform: [{ translateX: incomingTranslate }],
                        shadowColor: '#000',
                        shadowOpacity: 0.04,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 0,
                      },
                ]}
                pointerEvents="auto"
              >
                {renderScreen(transitionState.to)}
              </Animated.View>
            )}
          </View>

          {!isFullScreen && (
            <BottomNav
              currentTab={currentTab}
              onTabChange={handleTabChange}
              cartCount={cartCount}
              theme={theme}
            />
          )}
        </View>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default App;
