import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Linking, useColorScheme, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { Product, CartItem, Order, Voucher, HomeBanner, ChatMessage, Address } from '../types';
import { PRODUCTS, CATEGORIES } from '../constants/data';
import { DEFAULT_ADDRESSES } from '../constants/defaults';
import { AppProvider, AppContextValue } from './AppContext';
import { useToast } from '../components/common/ToastProvider';
import { useNetworkStatus } from '../utils/network';
import { extractCategoriesFromProducts } from '../utils/product';
import { cacheBanners, getCachedBanners, cacheProducts, getCachedProducts, cacheManager } from '../utils/cache';

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
    getCurrentUser,
    getAddresses,
    uploadImage,
    UploadImageFile,
    fetchMyCart,
    upsertCart,
    getReviews,
} from '../services/api';
import { socketService } from '../services/socket';
import { prefetchService } from '../services/prefetchService';
import {
    requestUserPermission,
    getFcmToken,
    subscribeToFcmTokenRefresh,
    deleteFcmToken,
} from '../services/fcm';
import { isBiometricLockEnabled } from '../services/BiometricService';

// ============================================================================
// Storage Keys
// ============================================================================
const AUTH_STORAGE_KEY = 'electronicsshop/auth';
const CART_STORAGE_KEY = 'electronicsshop/cart';
const PUSH_SETTINGS_KEY = 'electronicsshop/push_settings';
const THEME_MODE_STORAGE_KEY = 'electronicsshop/theme_mode';
const AI_CHAT_STORAGE_KEY = 'electronicsshop/ai-chat/messages';

const DEFAULT_PROFILE = {
    name: "Nguyễn Văn A",
    email: "nguyenva@example.com",
    avatar: "",
};

// ============================================================================
// Helper functions (moved from App.tsx)
// ============================================================================
interface FilterState {
    priceRange: [number, number];
    categories: string[];
    rating: number | null;
    onlyInStock: boolean;
}

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

const formatRelativeTime = (value?: string | Date | null, t?: (key: string, options?: any) => string) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (typeof t !== 'function') {
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDateTime(date);
    }
    if (diffMinutes < 1) return t('time_just_now');
    if (diffMinutes < 60) return t('time_minutes_ago', { count: diffMinutes });
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('time_hours_ago', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return t('time_days_ago', { count: diffDays });
    return formatDateTime(date);
};

const getOrderStatusText = (status: Order['status'], t: (key: string) => string): string => {
    const statusMap: Record<Order['status'], string> = {
        processing: t('order_status_processing'),
        shipping: t('order_status_shipping'),
        completed: t('order_status_completed'),
        cancelled: t('order_status_cancelled'),
    };
    return statusMap[status];
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

const mapApiProductToUi = (product: ApiProduct): Product => {
    const stockNumber = product.stock ?? 0;
    const stockLabel = stockNumber <= 0 ? 'Out of Stock' : stockNumber < 5 ? 'Low Stock' : 'In Stock';
    const price = product.price?.salePrice ?? product.price?.originalPrice ?? 0;
    const originalPrice = product.price?.originalPrice || undefined;
    const specs: Record<string, string> = {};
    if (product.specs) {
        Object.entries(product.specs).forEach(([k, v]) => {
            if (v) specs[k] = v as string;
        });
    }
    const normalizedImages = (product.images || []).map(img => (img || '').trim()).filter(Boolean);
    const primaryImage = normalizedImages.find(() => true) || 'https://images.unsplash.com/photo-1581093588401-99b6fa-2?auto=format&fit=crop&w=600&q=80';
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
        options: product.options,
        classifications: product.classifications,
    };
};

const mapApiOrderToUi = (order: ApiOrder, productLookup: Product[] = PRODUCTS, t?: (key: string) => string): Order => {
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
    ].filter(Boolean).join(', ') || (t ? t('address_none') : 'No address');

    const pickImage = (productId: string) => productLookup.find(p => p.id === productId)?.image || productLookup[0]?.image || '';
    const getTitle = (key: string) => t ? t(key) : key;
    const timeline = [
        { time: formatDateTime(created), title: getTitle('order_placed_success'), active: Boolean(created) },
        { time: formatDateTime(order.status?.confirmed), title: getTitle('order_confirmed'), active: hasConfirmed },
        { time: formatDateTime(order.status?.packaged), title: getTitle('order_packing'), active: hasPackaged },
        { time: formatDateTime(order.status?.shipped), title: getTitle('order_shipping'), active: hasShipped },
    ];

    if (!isCancelled) {
        timeline.push({
            time: isCompleted ? formatDateTime(order.status?.shipped) : '',
            title: getTitle('order_delivery_success'),
            active: isCompleted,
        });
    }

    return {
        id: order._id,
        code: order.code || order._id,
        date: formatDateTime(created),
        createdAt: typeof created === 'string' ? created : new Date(created).toISOString(),
        status,
        statusText: t ? getOrderStatusText(status, t) : status,
        paymentStatus: order.paymentStatus,
        items: order.items.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: pickImage(item.productId),
            selectedOption: item.selectedOption,
            selectedClassification: item.selectedClassification,
        })),
        shippingAddress: {
            name: order.shippingAddress?.name || (t ? t('receiver') : 'Receiver'),
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

const mapApiNotificationToUi = (item: ApiNotification, t?: (key: string, options?: any) => string): UiNotification => {
    const fallbackDate = item.deliveredAt || item.readAt || item.updatedAt || new Date().toISOString();
    const sendAt = item.sendAt || item.createdAt || fallbackDate;
    return {
        id: item.id || item._id || '',
        type: item.type || 'system',
        title: item.title || '',
        message: item.body || '',
        time: formatRelativeTime(sendAt, t),
        read: Boolean(item.isRead),
        sendAt: sendAt || undefined,
    };
};

const computeCartTotals = (items: CartItem[]) => {
    const subTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const totalItem = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const shippingFee = 0;
    const totalPrice = subTotal + shippingFee;
    return { subTotal, totalItem, shippingFee, totalPrice };
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

// ============================================================================
// Persistence helpers
// ============================================================================
async function persistAuthState(
    tokens: { accessToken: string; refreshToken: string },
    profile: typeof DEFAULT_PROFILE,
    userId?: string | null,
) {
    try {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ tokens, profile, userId }));
    } catch (error) {
        console.warn('AppStateProvider - Failed to persist auth state', error);
    }
}

async function clearPersistedAuthState() {
    try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.warn('AppStateProvider - Failed to clear auth state', error);
    }
}

async function persistCartState(items: CartItem[]) {
    try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.warn('AppStateProvider - Failed to persist cart', error);
    }
}

async function loadPersistedCart(): Promise<CartItem[] | null> {
    try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as CartItem[];
    } catch (error) {
        console.warn('AppStateProvider - Failed to load cart', error);
        return null;
    }
}

async function loadPersistedAiMessages(): Promise<ChatMessage[]> {
    try {
        const stored = await AsyncStorage.getItem(AI_CHAT_STORAGE_KEY);
        if (!stored) return [];
        const raw = JSON.parse(stored) as any[];
        return (raw || []).map(item => ({
            ...item,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        }));
    } catch (error) {
        console.warn('AppStateProvider - Failed to load AI chat messages', error);
        return [];
    }
}

async function persistAiMessages(messages: ChatMessage[]) {
    try {
        const payload = messages.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        }));
        await AsyncStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('AppStateProvider - Failed to persist AI chat messages', error);
    }
}

async function persistThemeMode(mode: 'light' | 'dark' | 'system') {
    try {
        await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (error) {
        console.warn('AppStateProvider - Failed to persist theme mode', error);
    }
}

async function loadPersistedThemeMode(): Promise<'light' | 'dark' | 'system' | null> {
    try {
        const stored = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (!stored) return null;
        return stored as 'light' | 'dark' | 'system';
    } catch (error) {
        console.warn('AppStateProvider - Failed to load theme mode', error);
        return null;
    }
}

// ============================================================================
// AppStateProvider Component
// ============================================================================
interface AppStateProviderProps {
    children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const systemColorScheme = useColorScheme();
    const systemDarkMode = systemColorScheme === 'dark';
    const networkStatus = useNetworkStatus();

    // Theme state
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

    // Products and banners
    const [products, setProducts] = useState<Product[]>(PRODUCTS);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<HomeBanner[]>([]);
    const productsRef = useRef<Product[]>(PRODUCTS);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);

    // Cart
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const cartIdRef = useRef<string | null>(null);
    const cartSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auth
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authTokens, setAuthTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
    const authTokensRef = useRef<{ accessToken: string; refreshToken: string } | null>(null);
    const [isRestoringAuth, setIsRestoringAuth] = useState(true);
    const hasFetchedCartRef = useRef(false);
    const fcmRefreshUnsubRef = useRef<(() => void) | null>(null);
    const hasRegisteredFcmRef = useRef(false);

    // Orders
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

    // Wishlist
    const [wishlist, setWishlist] = useState<Product[]>([]);

    // Vouchers
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

    // Addresses
    const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);

    // Notifications
    const [notifications, setNotifications] = useState<UiNotification[]>([]);
    const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
    const [isPushEnabled, setIsPushEnabled] = useState(true);

    // AI Chat
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const aiMessagesRef = useRef<ChatMessage[]>([]);

    // Filters
    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 10000000],
        categories: [],
        rating: null,
        onlyInStock: false,
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Available categories
    const availableCategories = useMemo(() => {
        const base = (CATEGORIES.length ? CATEGORIES : extractCategoriesFromProducts(products)).map(c => c.name);
        return Array.from(new Set(base.filter(Boolean)));
    }, [products]);

    // ========================================================================
    // Data loading functions
    // ========================================================================
    const loadProducts = useCallback(async (options?: { useCache?: boolean; onlyCache?: boolean; limit?: number }) => {
        setIsLoadingProducts(true);
        setProductsError(null);

        const isNoInternet = networkStatus.isConnected === false || networkStatus.isInternetReachable === false;
        // Construct cache key based on limit
        const cacheSuffix = options?.limit ? `_limit_${options.limit}` : '_all';

        if (isNoInternet || options?.useCache || options?.onlyCache) {
            const cached = await getCachedProducts(); // currently this gets 'all' or 'default' key
            if (cached && cached.length > 0) {
                let displayed = cached.map(mapApiProductToUi);
                if (options?.limit) {
                    displayed = displayed.slice(0, options.limit);
                }

                setProducts(prev => {
                    // If we are loading partial, only update if we don't have enough data
                    if (options?.limit && prev.length > options.limit) return prev;
                    return displayed;
                });

                if (options?.onlyCache) {
                    productsRef.current = displayed;
                    setIsLoadingProducts(false);
                    return undefined;
                }
            }
        }

        try {
            const result = await getProducts({ limit: options?.limit });
            const mapped = result.map(mapApiProductToUi);

            // If we fetched the full list, cache it.
            // If we fetched partial, we might not want to overwrite the full cache 
            // unless we handle merging. For simplicity, we only cache if full list 
            // OR if cache is empty.
            if (!options?.limit) {
                await cacheProducts(result);
            }

            setProducts(prev => {
                // If we fetched partial, append or replace?
                // If it's partial, it's usually page 1.
                if (options?.limit) {
                    // Start partial, we just replace. The full fetch will come later.
                    // But if we already have MORE data (full list), we shouldn't shrink it back to 10
                    if (prev.length > (options.limit || 0)) return prev;
                }
                return mapped;
            });
            productsRef.current = mapped;

            // Background prefetch reviews only if we really fetched products
            if (result.length > 0) {
                InteractionManager.runAfterInteractions(() => {
                    const topProducts = result.slice(0, 10);
                    topProducts.forEach(p => {
                        prefetchService.addTask(`reviews-${p._id}`, () => getReviews(p._id));
                    });
                });
            }

            setProductsError(null);
            return mapped;
        } catch (error: any) {
            const errorMessage = error?.message || 'Không thể tải sản phẩm';

            // Notify user of the failure via toast if it's not a silent load
            if (!options?.onlyCache) {
                showToast(errorMessage, 'error');
            }

            // If we have no products at all, show the empty state with error
            if (products.length === 0) {
                console.warn('AppStateProvider - Failed to load products', errorMessage);
                // Try fallback to cache again
                const cached = await getCachedProducts();
                if (cached && cached.length > 0) {
                    setProducts(cached.map(mapApiProductToUi));
                    setProductsError('Đang hiển thị dữ liệu đã lưu. ' + errorMessage);
                } else {
                    setProductsError(errorMessage);
                }
            }
            return undefined;
        } finally {
            setIsLoadingProducts(false);
        }
    }, [networkStatus.isConnected, products.length]);

    const loadBanners = useCallback(async (options?: { useCache?: boolean }) => {
        const isNoInternet = networkStatus.isConnected === false || networkStatus.isInternetReachable === false;
        if (isNoInternet || options?.useCache) {
            const cached = await getCachedBanners();
            if (cached && cached.length > 0) {
                setBanners(cached.map(mapApiBannerToUi));
                return;
            }
        }

        try {
            const result = await getPublicBanners();
            const mapped = result.map(mapApiBannerToUi);
            setBanners(mapped);
            await cacheBanners(result);
        } catch (error: any) {
            const errorMessage = error?.message || t('cannot_load_banners') || 'Không thể tải biểu ngữ';
            console.warn('AppStateProvider - Failed to load banners', errorMessage);
            showToast(errorMessage, 'error');
            const cached = await getCachedBanners();
            if (cached && cached.length > 0) {
                setBanners(cached.map(mapApiBannerToUi));
            }
        }
    }, [networkStatus.isConnected]);

    const loadOrders = useCallback(async (tokenOverride?: string, options?: { silent?: boolean }) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        const currentUid = userId || 'me';
        if (!token) return;

        const showSpinner = !options?.silent;
        const cacheKey = `orders-${currentUid}`;

        if (showSpinner) {
            // Try cache first
            try {
                const cachedDocs = await cacheManager.get<ApiOrder[]>(cacheKey);
                if (cachedDocs) {
                    const mapped = cachedDocs
                        .map(o => mapApiOrderToUi(o, productsRef.current, t))
                        .sort((a, b) => {
                            const dateA = new Date(a.createdAt || a.date).getTime();
                            const dateB = new Date(b.createdAt || b.date).getTime();
                            return dateB - dateA;
                        });
                    setOrders(mapped);
                    // If we have cache, don't show spinner, just update in background
                } else {
                    setIsRefreshingOrders(true);
                }
            } catch (e) {
                setIsRefreshingOrders(true);
            }
        }

        try {
            const result = await apiGetOrders(token);
            await cacheManager.set(cacheKey, result); // Cache raw API response

            const mapped = result
                .map(o => mapApiOrderToUi(o, productsRef.current, t))
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.date).getTime();
                    const dateB = new Date(b.createdAt || b.date).getTime();
                    return dateB - dateA;
                });
            setOrders(mapped);
        } catch (error: any) {
            const errorMessage = error?.message || 'Không thể tải đơn hàng';
            console.warn('AppStateProvider - Failed to load orders', errorMessage);
            if (!options?.silent) {
                showToast(errorMessage, 'error');
            }
        } finally {
            if (showSpinner) setIsRefreshingOrders(false);
        }
    }, [t, userId]);

    const loadFavorites = async (tokenOverride?: string) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        const currentUid = userId || 'me';
        if (!token) return;

        const cacheKey = `favorites-${currentUid}`;
        try {
            const cached = await cacheManager.get<ApiProduct[]>(cacheKey);
            if (cached) {
                setWishlist(cached.map(mapApiProductToUi));
            }
        } catch { }

        try {
            const result = await apiGetFavorites(token);
            await cacheManager.set(cacheKey, result);
            const mapped = result.map(mapApiProductToUi);
            setWishlist(mapped);
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to load favorites', error?.message || error);
        }
    };

    const loadVouchers = async (tokenOverride?: string) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        const currentUid = userId || 'me';
        if (!token) return;

        const cacheKey = `vouchers-${currentUid}`;
        try {
            const cached = await cacheManager.get<ApiVoucher[]>(cacheKey);
            if (cached) {
                setVouchers(cached.map(mapApiVoucherToUi));
            }
        } catch { }

        try {
            const result = await getMyVouchers(token);
            await cacheManager.set(cacheKey, result);
            const mapped = result.map(mapApiVoucherToUi);
            setVouchers(mapped);
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to load vouchers', error?.message || error);
        }
    };

    const loadAddresses = async (tokenOverride?: string) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        const currentUid = userId || 'me';
        if (!token) return;

        const cacheKey = `addresses-${currentUid}`;
        try {
            // For addresses, we store the FrontendAddress[] directly? 
            // No, api returns BackendAddress[] usually, but getAddresses maps them.
            // Let's cache the API result (BackendAddress[]) if we could, 
            // but `getAddresses` returns FrontendAddress[].
            // To simplify, let's cache the frontend object since it's what we use.
            // Wait, cacheManager stores whatever we pass.
            const cached = await cacheManager.get<Address[]>(cacheKey);
            if (cached) {
                setAddresses(cached);
            }
        } catch { }

        try {
            const result = await getAddresses(token);
            // Verify result type
            await cacheManager.set(cacheKey, result);
            setAddresses(result);
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to load addresses', error?.message || error);
        }
    };

    const loadUserProfile = useCallback(async (tokenOverride?: string, options?: { silent?: boolean }) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        if (!token) return;
        try {
            const result = await getCurrentUser(token);
            if (result) {
                setUserProfile(prev => {
                    const updated = {
                        ...prev,
                        ...(result.name ? { name: result.name } : {}),
                        ...(result.email ? { email: result.email } : {}),
                        ...(result.avatar ? { avatar: result.avatar } : {}),
                    };
                    if (authTokensRef.current) {
                        persistAuthState(authTokensRef.current as any, updated, result._id || userId).catch(() => { });
                    }
                    return updated;
                });
                if (result._id && result._id !== userId) {
                    setUserId(result._id);
                }
            }
        } catch (error: any) {
            if (!options?.silent) {
                console.warn('AppStateProvider - Failed to load user profile', error?.message || error);
            }
        }
    }, [userId]);

    const syncNotificationsFromApi = useCallback((items: ApiNotification[]) => {
        const translate = typeof t === 'function' ? t : undefined;
        const list = Array.isArray(items) ? items : [];
        const mapped = list
            .map(item => mapApiNotificationToUi(item, translate))
            .filter(item => item.id)
            .sort((a, b) => {
                const timeA = a.sendAt ? new Date(a.sendAt).getTime() : 0;
                const timeB = b.sendAt ? new Date(b.sendAt).getTime() : 0;
                return timeB - timeA;
            });
        setNotifications(mapped);
    }, [t]);

    const loadNotifications = useCallback(async (tokenOverride?: string, options?: { silent?: boolean }) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        if (!token) return;
        const showSpinner = !options?.silent;
        if (showSpinner) setIsRefreshingNotifications(true);
        try {
            const result = await apiGetNotifications(token);
            syncNotificationsFromApi(result);
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to load notifications', error?.message || error);
        } finally {
            if (showSpinner) setIsRefreshingNotifications(false);
        }
    }, [syncNotificationsFromApi]);

    const fetchOrderDetail = async (orderId: string) => {
        const token = authTokensRef.current?.accessToken;
        if (!token) return;
        try {
            const result = await getOrderById(orderId, token);
            const mapped = mapApiOrderToUi(result, productsRef.current, t);
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
            console.warn('AppStateProvider - Failed to fetch order detail', error?.message || error);
        }
    };

    // ========================================================================
    // Auth functions
    // ========================================================================
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
            persistAuthState(tokens, nextProfile, nextUserId).catch(() => { });
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

    const login = useCallback((data: AuthResponse) => {
        const tokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        };
        const newUserId = data.user?._id ?? null;
        setAddresses([]);
        syncAuthTokens(tokens, data.user, newUserId);
        loadUserProfile(tokens.accessToken, { silent: true }).catch(() => { });
        loadOrders(tokens.accessToken).catch(() => { });
        loadFavorites(tokens.accessToken).catch(() => { });
        loadVouchers(tokens.accessToken).catch(() => { });
        loadNotifications(tokens.accessToken, { silent: true }).catch(() => { });
        loadAddresses(tokens.accessToken).catch(() => { });
    }, [syncAuthTokens, loadOrders, loadNotifications, loadUserProfile]);

    // ========================================================================
    // Cart functions
    // ========================================================================
    const addToCart = useCallback((product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => {
        if (!authTokensRef.current?.accessToken) {
            showToast(t('loginRequiredCart'), 'info');
            return false;
        }

        const available = product.stockQuantity;
        const isOutOfStock = product.stock === 'Out of Stock' || (available !== undefined && available <= 0);
        if (isOutOfStock) {
            Alert.alert(t('out_of_stock'), t('product_out_of_stock', { name: product.name }));
            return false;
        }

        const safeQuantity = Math.max(1, quantity);
        const limit = available ?? Number.POSITIVE_INFINITY;
        const itemKey = `${product.id}-${selectedOption || 'default'}-${selectedClassification || 'default'}`;

        let success = false;
        setCartItems(prev => {
            const existing = prev.find(item => {
                const itemKey2 = `${item.id}-${item.selectedOption || 'default'}-${item.selectedClassification || 'default'}`;
                return itemKey2 === itemKey;
            });

            if (existing) {
                const desired = existing.quantity + safeQuantity;
                const clamped = Math.min(desired, limit);
                if (clamped < desired) {
                    Alert.alert(t('not_enough_stock'), t('only_x_left', { count: clamped, name: product.name }));
                    return prev;
                }
                success = true;
                return prev.map(item => {
                    const itemKey2 = `${item.id}-${item.selectedOption || 'default'}-${item.selectedClassification || 'default'}`;
                    return itemKey2 === itemKey ? { ...item, quantity: Math.max(1, clamped) } : item;
                });
            }

            const initialQty = Math.min(safeQuantity, limit);
            if (initialQty < safeQuantity) {
                Alert.alert(t('not_enough_stock'), t('only_x_left', { count: initialQty, name: product.name }));
                return prev;
            }
            success = true;

            const newItem: CartItem = {
                ...product,
                quantity: Math.max(1, initialQty),
            };

            if (selectedOption?.trim()) {
                newItem.selectedOption = selectedOption.trim();
            }
            if (selectedClassification?.trim()) {
                newItem.selectedClassification = selectedClassification.trim();
            }

            return [...prev, newItem];
        });
        return success;
    }, [showToast, t]);

    const updateCartQuantity = useCallback((id: string, delta: number) => {
        setCartItems(prev =>
            prev.map(item => {
                if (item.id !== id) return item;
                const limit = item.stockQuantity ?? Number.POSITIVE_INFINITY;
                const desired = item.quantity + delta;
                if (delta < 0) {
                    const clamped = Math.max(1, desired);
                    return { ...item, quantity: clamped };
                }
                if (delta > 0) {
                    const clamped = Math.min(desired, limit);
                    return { ...item, quantity: clamped };
                }
                return item;
            }),
        );
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateCartItemOptions = useCallback((itemId: string, selectedOption?: string, selectedClassification?: string) => {
        setCartItems(prev => {
            const itemIndex = prev.findIndex(item => item.id === itemId);
            if (itemIndex === -1) return prev;

            const currentItem = prev[itemIndex];
            const normalizeOption = (opt?: string) => {
                if (!opt || typeof opt !== 'string' || !opt.trim()) return undefined;
                return opt.trim();
            };
            const newOption = selectedOption !== undefined ? normalizeOption(selectedOption) : normalizeOption(currentItem.selectedOption);
            const newClassification = selectedClassification !== undefined ? normalizeOption(selectedClassification) : normalizeOption(currentItem.selectedClassification);

            return prev.map((item, index) =>
                index === itemIndex
                    ? { ...item, selectedOption: newOption, selectedClassification: newClassification }
                    : item
            );
        });
    }, []);

    // ========================================================================
    // Wishlist functions
    // ========================================================================
    const toggleFavorite = useCallback((productId: string) => {
        const token = authTokensRef.current?.accessToken;
        if (!token) return;

        const isFav = wishlist.some(item => item.id === productId);
        if (isFav) {
            setWishlist(prev => prev.filter(item => item.id !== productId));
            removeFavorite(productId, token).catch(() => { });
        } else {
            const product = productsRef.current.find(p => p.id === productId);
            if (product) {
                setWishlist(prev => [...prev, product]);
                addFavorite(productId, token).catch(() => { });
            }
        }
    }, [wishlist]);

    const isFavorite = useCallback((productId: string) => {
        return wishlist.some(item => item.id === productId);
    }, [wishlist]);

    // ========================================================================
    // Order functions
    // ========================================================================
    const refreshOrders = useCallback(async () => {
        await loadOrders();
    }, [loadOrders]);

    const refreshOrderDetail = useCallback(async (orderId: string) => {
        await fetchOrderDetail(orderId);
    }, []);

    const placeOrder = useCallback(async (params: {
        items: CartItem[];
        totals: { subTotal: number; shippingFee: number; discount: number; total: number };
        paymentMethod: string;
        shippingAddress?: Address;
    }) => {
        if (!authTokensRef.current?.accessToken) {
            throw new Error(t('login_required_order'));
        }

        const code = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        const normalizedPayment = params.paymentMethod?.toLowerCase() || 'cod';
        const isVnpay = normalizedPayment === 'vnpay';

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
                ...(item.selectedOption?.trim() ? { selectedOption: item.selectedOption.trim() } : {}),
                ...(item.selectedClassification?.trim() ? { selectedClassification: item.selectedClassification.trim() } : {}),
            })),
            subTotal: params.totals.subTotal,
            shippingFee: params.totals.shippingFee,
            discount: params.totals.discount,
            totalPrice: params.totals.total,
            payment: normalizedPayment,
            paymentStatus: 'pending',
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
                const paymentResult = await createVnpayPayment(payload, authTokensRef.current.accessToken);
                return { id: paymentResult.order, code, paymentUrl: paymentResult.paymentUrl };
            } else {
                const result = await apiCreateOrder(payload, authTokensRef.current.accessToken);
                const mapped = mapApiOrderToUi(result, productsRef.current, t);
                setOrders(prev => [mapped, ...prev]);
                setCartItems([]);
                return mapped;
            }
        } finally {
            setIsPlacingOrder(false);
        }
    }, [t]);

    // ========================================================================
    // Notification functions
    // ========================================================================
    const refreshNotifications = useCallback(async () => {
        await loadNotifications(undefined, { silent: false });
    }, [loadNotifications]);

    const markNotificationRead = useCallback(async (id: string) => {
        if (!authTokensRef.current?.accessToken) return;
        setNotifications(prev => prev.map(item => (item.id === id ? { ...item, read: true } : item)));
        try {
            const result = await apiMarkNotificationRead(id, authTokensRef.current.accessToken);
            syncNotificationsFromApi(result);
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to mark notification read', error?.message || error);
        }
    }, [syncNotificationsFromApi]);

    const markAllNotificationsRead = useCallback(async () => {
        if (!authTokensRef.current?.accessToken) return;
        try {
            const result = await apiMarkAllNotificationsRead(authTokensRef.current.accessToken);
            syncNotificationsFromApi(result);
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to mark all notifications read', error?.message || error);
        }
    }, [syncNotificationsFromApi]);

    // ========================================================================
    // Profile functions
    // ========================================================================
    const updateProfile = useCallback(async (data: Partial<typeof userProfile> & { avatarFile?: UploadImageFile }) => {
        const optimisticAvatar = data.avatar || data.avatarFile?.uri || userProfile.avatar;
        const optimisticProfile = {
            ...userProfile,
            ...(data.name ? { name: data.name } : {}),
            ...(data.email ? { email: data.email } : {}),
            ...(optimisticAvatar ? { avatar: optimisticAvatar } : {}),
        };
        setUserProfile(optimisticProfile);
        if (authTokensRef.current) {
            persistAuthState(authTokensRef.current as any, optimisticProfile, userId).catch(() => { });
        }

        const accessToken = authTokensRef.current?.accessToken;
        if (!accessToken) return;

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

            const result = await apiUpdateProfile(payload, authTokensRef.current?.accessToken || accessToken);
            const updatedUser = result.user || payload;
            setUserProfile(prev => {
                const next = { ...prev, ...updatedUser };
                if (authTokensRef.current) {
                    persistAuthState(authTokensRef.current as any, next, userId).catch(() => { });
                }
                return next;
            });
        } catch (error: any) {
            console.warn('AppStateProvider - Failed to update profile', error?.message || error);
        }
    }, [userProfile, userId]);

    // ========================================================================
    // Theme functions
    // ========================================================================
    const handleThemeModeChange = useCallback((mode: 'light' | 'dark' | 'system') => {
        setThemeMode(mode);
        persistThemeMode(mode).catch(() => { });
    }, []);

    // ========================================================================
    // Navigation helpers (for backward compatibility)
    // ========================================================================
    const navigateToProduct = useCallback((productId: string) => {
        // This will be handled by React Navigation
        console.log('Navigate to product:', productId);
    }, []);

    const navigateToCart = useCallback(() => {
        // This will be handled by React Navigation
        console.log('Navigate to cart');
    }, []);

    const requireLogin = useCallback((callback?: () => void) => {
        if (!isLoggedIn) {
            showToast(t('login_required'), 'info');
            // Navigation will be handled by React Navigation
        } else {
            callback?.();
        }
    }, [isLoggedIn, showToast, t]);

    // ========================================================================
    // Effects
    // ========================================================================
    // Load initial data
    useEffect(() => {
        const init = async () => {
            // Load theme
            const savedTheme = await loadPersistedThemeMode();
            if (savedTheme) setThemeMode(savedTheme);

            // Load cart
            const savedCart = await loadPersistedCart();
            if (savedCart) setCartItems(savedCart);

            // Load AI messages
            const savedMessages = await loadPersistedAiMessages();
            setAiMessages(savedMessages);
            aiMessagesRef.current = savedMessages;

            // Load push settings
            try {
                const pushSettings = await AsyncStorage.getItem(PUSH_SETTINGS_KEY);
                if (pushSettings !== null) {
                    setIsPushEnabled(JSON.parse(pushSettings));
                }
            } catch (e) {
                console.warn('Failed to load push settings', e);
            }

            // Load auth
            try {
                const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (stored) {
                    const { tokens, profile, userId: savedUserId } = JSON.parse(stored);
                    if (tokens?.accessToken) {
                        syncAuthTokens(tokens, profile, savedUserId);
                    }
                }
            } catch (e) {
                console.warn('Failed to restore auth', e);
            } finally {
                setIsRestoringAuth(false);
            }
        };
        init();
    }, [syncAuthTokens]);

    // Fetch user profile after auth is restored
    useEffect(() => {
        if (!isRestoringAuth && isLoggedIn && authTokens?.accessToken) {
            loadUserProfile(undefined, { silent: true }).catch(() => { });
        }
    }, [isRestoringAuth, isLoggedIn, authTokens?.accessToken, loadUserProfile]);

    // Load products and banners when online
    // Load products and banners when online
    useEffect(() => {
        if (networkStatus.isConnected) {
            const initLoad = async () => {
                // 1. Load fast/essential data first
                await Promise.all([
                    loadBanners({ useCache: true }).catch(() => { }),
                    // Load only first 10 products to unblock UI
                    loadProducts({ useCache: true, limit: 10 }).catch(() => { }),
                ]);

                // 2. Load the rest in background after a short delay
                setTimeout(() => {
                    InteractionManager.runAfterInteractions(() => {
                        loadProducts().catch(() => { });
                    });
                }, 1000);
            };
            initLoad();
        }
    }, [networkStatus.isConnected, loadProducts, loadBanners]);

    // Persist cart
    useEffect(() => {
        void persistCartState(cartItems);
    }, [cartItems]);

    // Persist AI messages
    useEffect(() => {
        aiMessagesRef.current = aiMessages;
        persistAiMessages(aiMessages).catch(() => { });
    }, [aiMessages]);

    // Sync cart to backend
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
                console.warn('AppStateProvider - Failed to sync cart to backend', error);
            }
        }, 400);

        return () => {
            if (cartSyncTimeoutRef.current) {
                clearTimeout(cartSyncTimeoutRef.current);
            }
        };
    }, [cartItems, authTokens?.accessToken]);

    // Load user data when logged in
    useEffect(() => {
        if (isLoggedIn && authTokens?.accessToken) {
            loadUserProfile(undefined, { silent: true }).catch(() => { });
            loadOrders().catch(() => { });
            loadFavorites().catch(() => { });
            loadVouchers().catch(() => { });
            loadNotifications(undefined, { silent: true }).catch(() => { });
            loadAddresses().catch(() => { });
        } else if (!isLoggedIn) {
            setOrders([]);
            setWishlist([]);
            setVouchers([]);
            setNotifications([]);
            setAddresses(DEFAULT_ADDRESSES);
        }
    }, [isLoggedIn, authTokens?.accessToken, loadOrders, loadNotifications, loadUserProfile]);

    // Configure API auth
    useEffect(() => {
        configureApiAuth({
            getTokens: () => authTokensRef.current,
            onTokensRefreshed: (tokens, user) => syncAuthTokens(tokens, user),
            onAuthFailure: handleAuthFailure,
        });
    }, [handleAuthFailure, syncAuthTokens]);

    // ========================================================================
    // Context value
    // ========================================================================
    const contextValue: AppContextValue = useMemo(() => ({
        // Products
        products,
        relatedProducts,
        banners,
        isLoadingProducts,
        productsError,
        loadProducts,

        // Cart
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        updateCartItemOptions,

        // Auth
        isLoggedIn,
        authTokens,
        userId,
        userProfile,
        login,
        logout: handleAuthFailure,
        updateProfile,
        loadUserProfile,

        // Wishlist
        wishlist,
        toggleFavorite,
        isFavorite,

        // Orders
        orders,
        selectedOrderId,
        isPlacingOrder,
        isRefreshingOrders,
        placeOrder,
        refreshOrders,
        refreshOrderDetail,
        setSelectedOrderId,

        // Vouchers
        vouchers,
        appliedVoucher,
        setAppliedVoucher,

        // Notifications
        notifications,
        isRefreshingNotifications,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,

        // Addresses
        addresses,
        updateAddresses: setAddresses,

        // AI Chat
        aiMessages,
        setAiMessages,

        // Filters
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        availableCategories,

        // Theme
        themeMode,
        setThemeMode: handleThemeModeChange,

        // Settings
        isPushEnabled,
        setIsPushEnabled,

        // Network
        networkStatus,

        // Navigation helpers
        navigateToProduct,
        navigateToCart,
        requireLogin,
    }), [
        products, relatedProducts, banners, isLoadingProducts, productsError, loadProducts,
        cartItems, addToCart, updateCartQuantity, removeFromCart, updateCartItemOptions,
        isLoggedIn, authTokens, userId, userProfile, login, handleAuthFailure, updateProfile, loadUserProfile,
        wishlist, toggleFavorite, isFavorite,
        orders, selectedOrderId, isPlacingOrder, isRefreshingOrders, placeOrder, refreshOrders, refreshOrderDetail,
        vouchers, appliedVoucher,
        notifications, isRefreshingNotifications, refreshNotifications, markNotificationRead, markAllNotificationsRead,
        addresses,
        aiMessages,
        filters, searchQuery, availableCategories,
        themeMode, handleThemeModeChange,
        isPushEnabled,
        networkStatus,
        navigateToProduct, navigateToCart, requireLogin,
    ]);

    return (
        <AppProvider value={contextValue}>
            {children}
        </AppProvider>
    );
}
