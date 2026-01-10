/**
 * ElectronicsShop App
 * React Native version converted from Figma design
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
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
import { Product, CartItem, Order, Voucher, PRODUCTS } from './src/lib/data';
import { Address, DEFAULT_ADDRESSES } from './src/lib/address';
import { darkTheme, lightTheme, ThemeProvider } from './src/lib/theme';
import { ToastProvider } from './src/components/common/ToastProvider';
import {
  ApiNotification,
  ApiOrder,
  ApiProduct,
  ApiVoucher,
  AuthResponse,
  addFavorite,
  configureApiAuth,
  createOrder as apiCreateOrder,
  getFavorites as apiGetFavorites,
  getMyVouchers,
  getNotifications as apiGetNotifications,
  getOrderById,
  getOrders as apiGetOrders,
  getProducts,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  markNotificationRead as apiMarkNotificationRead,
  removeFavorite,
  updateProfile as apiUpdateProfile,
} from './src/lib/api';
import { socketService } from './src/lib/socket';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';
type Screen = NavTab | 'product-detail' | 'checkout' | 'order-history' | 'order-detail' | 'auth' | 'notifications' | 'search' | 'filter' | 'address-book' | 'settings' | 'support' | 'wishlist' | 'change-password';

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  rating: number | null;
  onlyInStock: boolean;
}

const AUTH_STORAGE_KEY = 'electronicsshop/auth';
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
      method: order.payment || 'Thanh toán khi nhận hàng (COD)',
      subtotal: order.subTotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.totalPrice,
    },
    timeline,
  };
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
    rating: product.averageRating ?? 4.5,
    reviews: product.reviewCount ?? 0,
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

function App(): React.JSX.Element {
  const systemDarkMode = useColorScheme() === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(systemDarkMode);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
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
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [userId, setUserId] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const result = await getProducts();
      const mapped = result.map(mapApiProductToUi);
      setProducts(mapped);
      productsRef.current = mapped;
    } catch (error: any) {
      console.warn('App.tsx - Failed to load products', error?.message || error);
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

  const loadOrders = async (tokenOverride?: string) => {
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
  };

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
    setUserProfile(DEFAULT_PROFILE);
    setUserId(null);
    setVouchers([]);
    setNotifications([]);
    setIsRefreshingNotifications(false);
    void clearPersistedAuthState();
  }, []);

  useEffect(() => {
    configureApiAuth({
      getTokens: () => authTokensRef.current,
      onTokensRefreshed: (tokens, user) => syncAuthTokens(tokens, user),
      onAuthFailure: handleAuthFailure,
    });
  }, [handleAuthFailure, syncAuthTokens]);

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
          }
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
    void loadProducts();
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
    } else if (!isLoggedIn) {
      setOrders([]);
      setWishlist([]);
      setVouchers([]);
      setNotifications([]);
    }
  }, [isLoggedIn, authTokens?.accessToken]);

  useEffect(() => {
    if (selectedOrderId && !orders.find(o => o.id === selectedOrderId)) {
      void fetchOrderDetail(selectedOrderId);
    }
  }, [selectedOrderId, orders]);

  const handleUpdateProfile = async (data: Partial<typeof userProfile>) => {
    try {
      if (authTokensRef.current?.accessToken) {
        const result = await apiUpdateProfile(
          {
            name: data.name,
            avatar: data.avatar,
            email: data.email,
          },
          authTokensRef.current.accessToken,
        );
        const updatedUser = result.user || data;
        setUserProfile(prev => {
          const next = { ...prev, ...updatedUser };
          void persistAuthState(authTokensRef.current as any, next, userId);
          return next;
        });
        return true;
      }
      setUserProfile(prev => ({ ...prev, ...data }));
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

      // Stock filter
      if (filters.onlyInStock && product.stock !== 'In Stock') {
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
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

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
    const normalizeProductId = (id: string) => {
      if (/^[a-f0-9]{24}$/i.test(id)) return id;
      const sanitized = id.replace(/[^a-f0-9]/gi, 'a');
      return (sanitized + 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa').slice(0, 24);
    };

    const payload = {
      code,
      status: { ordered: new Date().toISOString() },
      items: params.items.map(item => ({
        productId: normalizeProductId(item.id),
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
      payment: params.paymentMethod,
      paymentStatus: params.paymentMethod.toLowerCase().includes('cod') ? 'pending' : 'pending',
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
      const created = await apiCreateOrder(payload, authTokensRef.current.accessToken);
      const uiOrder = mapApiOrderToUi(created, productsRef.current);
      setOrders(prev => [uiOrder, ...prev]);
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

  const handleLoginSuccess = (data: AuthResponse) => {
    const tokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    syncAuthTokens(tokens, data.user, data.user?._id ?? null);
    void loadOrders(tokens.accessToken);
    void loadFavorites(tokens.accessToken);
    void loadVouchers(tokens.accessToken);
    void loadNotifications(tokens.accessToken, { silent: true });

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

  const renderContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <Home
            onNavigate={(tab) => handleTabChange(tab as NavTab)}
            onProductClick={navigateToProduct}
            theme={theme}
            products={products}
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
        return <AIChat theme={theme} onNotificationClick={openNotifications} />;
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
              return { id: created.id, code: created.code };
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
                if (tempFilterState.onlyInStock && product.stock !== 'In Stock') {
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
        return <Home onNavigate={(tab) => handleTabChange(tab as NavTab)} onProductClick={navigateToProduct} products={products} />;
    }
  };

  const isFullScreen = ['product-detail', 'checkout', 'order-history', 'order-detail', 'notifications', 'search', 'filter', 'address-book', 'settings', 'support', 'wishlist', 'change-password'].includes(currentScreen);
  const showTopBar = !isFullScreen && currentScreen !== 'ai' && currentScreen !== 'profile' && currentScreen !== 'auth';

  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ theme, isDarkMode }}>
        <ToastProvider>
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor={theme.surface}
            translucent={true}
          />
          <View style={[styles.container, { backgroundColor: theme.background }]}>
          {showTopBar && (
            <TopBar
              title={currentScreen === 'cart' ? 'Giỏ hàng' : 'ElectroAI'}
              showSearch={currentScreen === 'home'}
              onSearchClick={() => setCurrentScreen('search')}
              onFilterClick={openFilter}
              onNotificationClick={openNotifications}
              hasUnread={hasUnreadNotifications}
              theme={theme}
            />
          )}

          <View style={[styles.content, { backgroundColor: theme.background }]}>
            {renderContent()}
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
  },
});

export default App;
