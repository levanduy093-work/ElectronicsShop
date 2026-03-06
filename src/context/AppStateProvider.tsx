import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Product, CartItem, Voucher, HomeBanner, Address } from '../types';
import { PRODUCTS } from '../constants/data';
import { DEFAULT_ADDRESSES } from '../constants/defaults';
import { AppProvider, AppContextValue } from './AppContext';
import { CartProvider, type CartContextValue } from './CartContext';
import { OrdersStateProvider } from './OrdersStateProvider';
import { NotificationsStateProvider } from './NotificationsStateProvider';
import { useToast } from '../components/common/ToastProvider';
import { useNetworkStatus } from '../utils/network';
import { mapApiProductToUi, mapApiBannerToUi } from '../utils/mappers';
import { cacheBanners, getCachedBanners, cacheProducts, getCachedProducts, cacheManager } from '../utils/cache';

import {
    ApiProduct,
    ApiVoucher,
    ApiCart,
    ApiCartItem,
    AuthResponse,
    addFavorite,
    configureApiAuth,
    getPublicBanners,
    getFavorites as apiGetFavorites,
    getMyVouchers,
    getProducts,
    getRelatedProducts,
    removeFavorite,
    updateProfile as apiUpdateProfile,
    getCurrentUser,
    getAddresses,
    uploadImage,
    UploadImageFile,
    fetchMyCart,
    upsertCart,
    getReviews,
    createProduct as apiCreateProduct,
    CreateProductInput,
} from '../services/api';
import { socketService } from '../services/socket';
import { prefetchService } from '../services/prefetchService';
import { getFcmToken, deleteFcmToken } from '../services/fcm';

// ============================================================================
// Storage Keys
// ============================================================================
const AUTH_STORAGE_KEY = 'electronicsshop/auth';
const CART_STORAGE_KEY = 'electronicsshop/cart';

const DEFAULT_PROFILE = {
    name: '',
    email: '',
    avatar: "",
    role: undefined as string | undefined,
};

const normalizeUserProfile = (profile?: Partial<typeof DEFAULT_PROFILE> | null) => ({
    name: typeof profile?.name === 'string' ? profile.name.trim() : '',
    email: typeof profile?.email === 'string' ? profile.email.trim() : '',
    avatar: typeof profile?.avatar === 'string' ? profile.avatar.trim() : '',
    role: profile?.role || undefined,
});

// ============================================================================
// Helper functions (moved from App.tsx)
// ============================================================================
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
        ...(item.selectedOption?.trim() ? { selectedOption: item.selectedOption.trim() } : {}),
        ...(item.selectedClassification?.trim()
            ? { selectedClassification: item.selectedClassification.trim() }
            : {}),
    };
};

const pickMostRecentCart = (carts: ApiCart[] = []) => {
    if (!carts.length) return undefined;
    if (carts.length === 1) return carts[0];
    return [...carts].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
    })[0];
};

const mapApiCartToUi = (cart: ApiCart, products: Product[]): CartItem[] => {
    const fallbackImage = 'https://images.unsplash.com/photo-1581093588401-99b6fa-2?auto=format&fit=crop&w=600&q=80';
    const mapped = (cart.items || []).map((item) => {
        const productMatch = products.find(p => p.id === item.productId);
        const baseProduct: Product = productMatch || {
            id: item.productId,
            name: item.name || 'Product',
            price: item.price || 0,
            originalPrice: item.price || 0,
            salePrice: item.price || 0,
            rating: 0,
            reviews: 0,
            image: item.image || fallbackImage,
            images: item.image ? [item.image] : undefined,
            category: item.category || 'Khác',
            stock: 'In Stock',
            stockQuantity: undefined,
            description: '',
            specs: {},
        };

        return {
            ...baseProduct,
            id: item.productId,
            name: item.name || baseProduct.name,
            price: item.price ?? baseProduct.salePrice ?? baseProduct.price ?? 0,
            image: item.image || baseProduct.image,
            category: item.category || baseProduct.category,
            quantity: item.quantity,
            ...(item.selectedOption ? { selectedOption: item.selectedOption } : {}),
            ...(item.selectedClassification
                ? { selectedClassification: item.selectedClassification }
                : {}),
        };
    });
    return mapped;
};

const normalizeCartSelection = (value?: string) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
};

const getCartIdentityKey = (item: CartItem) => {
    const effectiveOption = normalizeCartSelection(item.selectedOption);
    const effectiveClassification = normalizeCartSelection(item.selectedClassification);

    return [
        item.id,
        (effectiveOption || 'default').toLowerCase(),
        (effectiveClassification || 'default').toLowerCase(),
    ].join('|');
};

const mergeCartItems = (items: CartItem[]) => {
    const merged = new Map<string, CartItem>();
    for (const item of items) {
        const key = getCartIdentityKey(item);
        const existing = merged.get(key);
        if (!existing) {
            merged.set(key, { ...item });
            continue;
        }
        merged.set(key, {
            ...existing,
            quantity: (existing.quantity || 0) + (item.quantity || 0),
        });
    }
    return Array.from(merged.values());
};

const getCartSignature = (items: CartItem[]) =>
    (items || [])
        .map((item) => `${item.id}:${item.quantity}:${item.selectedOption || ''}:${item.selectedClassification || ''}`)
        .sort()
        .join('|');

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

// ============================================================================
// AppStateProvider Component
// ============================================================================
interface AppStateProviderProps {
    children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const networkStatus = useNetworkStatus();

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
    const suppressNextCartSyncRef = useRef(false);

    // Auth
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authTokens, setAuthTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
    const [userRole, setUserRole] = useState<string | undefined>(undefined);
    const authTokensRef = useRef<{ accessToken: string; refreshToken: string } | null>(null);
    const [isRestoringAuth, setIsRestoringAuth] = useState(true);
    const hasFetchedCartRef = useRef(false);

    // Wishlist
    const [wishlist, setWishlist] = useState<Product[]>([]);

    // Vouchers
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

    // Addresses
    const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);

    const queryClient = useQueryClient();
    const isAuthed = Boolean(isLoggedIn && authTokens?.accessToken);
    const currentUserKey = userId || 'me';
    const isOffline = networkStatus.isConnected === false || networkStatus.isInternetReachable === false;

    const favoritesQuery = useQuery({
        queryKey: ['favorites', currentUserKey],
        enabled: isAuthed,
        queryFn: async () => {
            const token = authTokensRef.current?.accessToken || authTokens?.accessToken;
            if (!token) return [];
            const cacheKey = `favorites-${currentUserKey}`;
            if (isOffline) {
                const cached = await cacheManager.get<ApiProduct[]>(cacheKey);
                if (cached) return cached;
            }
            const result = await apiGetFavorites(token);
            await cacheManager.set(cacheKey, result);
            return result;
        },
    });

    const addressesQuery = useQuery({
        queryKey: ['addresses', currentUserKey],
        enabled: isAuthed,
        queryFn: async () => {
            const token = authTokensRef.current?.accessToken || authTokens?.accessToken;
            if (!token) return [];
            const cacheKey = `addresses-${currentUserKey}`;
            if (isOffline) {
                const cached = await cacheManager.get<Address[]>(cacheKey);
                if (cached) return cached;
            }
            const result = await getAddresses(token);
            await cacheManager.set(cacheKey, result);
            return result;
        },
    });

    const cartQuery = useQuery({
        queryKey: ['cart', currentUserKey],
        enabled: isAuthed,
        queryFn: async () => {
            const token = authTokensRef.current?.accessToken || authTokens?.accessToken;
            if (!token) return [];
            const cacheKey = `cart-${currentUserKey}`;
            if (isOffline) {
                const cached = await cacheManager.get<ApiCart[]>(cacheKey);
                if (cached) return cached;
            }
            const result = await fetchMyCart(token);
            await cacheManager.set(cacheKey, result);
            return result;
        },
    });

    const applyCartSnapshot = useCallback((apiCarts: ApiCart[] = []) => {
        const activeCart = pickMostRecentCart(apiCarts);
        if (!activeCart) {
            cartIdRef.current = null;
            setCartItems((prev) => {
                if (prev.length === 0) return prev;
                suppressNextCartSyncRef.current = true;
                return [];
            });
            return;
        }

        cartIdRef.current = activeCart._id;
        const mapped = mergeCartItems(mapApiCartToUi(activeCart, productsRef.current));
        const nextSignature = getCartSignature(mapped);
        setCartItems((prev) => {
            const currentSignature = getCartSignature(prev);
            if (currentSignature === nextSignature) {
                return prev;
            }
            suppressNextCartSyncRef.current = true;
            return mapped;
        });
    }, []);

    const favoritesMutation = useMutation({
        mutationFn: async (params: { productId: string; action: 'add' | 'remove' }) => {
            const token = authTokensRef.current?.accessToken;
            if (!token) return;
            if (params.action === 'add') {
                return addFavorite(params.productId, token);
            }
            return removeFavorite(params.productId, token);
        },
        onMutate: ({ productId, action }) => {
            const previous = queryClient.getQueryData<ApiProduct[]>(['favorites', currentUserKey]) || [];
            let next: ApiProduct[] = previous;
            if (action === 'add') {
                const product = productsRef.current.find(p => p.id === productId);
                if (product) {
                    // Map UI product back to minimal API shape for cache consistency
                    const apiLike: ApiProduct = {
                        _id: product.id,
                        name: product.name,
                        price: { originalPrice: product.originalPrice ?? product.price, salePrice: product.salePrice ?? product.price },
                        stock: product.stockQuantity,
                        category: product.category,
                        description: product.description,
                        images: product.images,
                        specs: product.specs,
                        code: product.code,
                        averageRating: product.averageRating,
                        reviewCount: product.reviewCount,
                        saleCount: product.saleCount,
                        datasheet: product.datasheet,
                        options: product.options,
                        classifications: product.classifications,
                    } as ApiProduct;
                    next = [apiLike, ...previous.filter(p => p._id !== productId)];
                }
            } else {
                next = previous.filter(p => p._id !== productId);
            }
            queryClient.setQueryData(['favorites', currentUserKey], next);
            setWishlist(next.map(mapApiProductToUi));
            return { previous };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites', currentUserKey] });
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['favorites', currentUserKey], context.previous);
                setWishlist(context.previous.map(mapApiProductToUi));
            }
            queryClient.invalidateQueries({ queryKey: ['favorites', currentUserKey] });
        },
    });

    useEffect(() => {
        if (!isAuthed) return;
        if (favoritesQuery.data) {
            setWishlist(favoritesQuery.data.map(mapApiProductToUi));
        }
    }, [favoritesQuery.data, isAuthed]);

    useEffect(() => {
        if (!isAuthed) return;
        if (addressesQuery.data) {
            setAddresses(addressesQuery.data);
        }
    }, [addressesQuery.data, isAuthed]);

    useEffect(() => {
        if (!isAuthed) return;
        if (!cartQuery.data) return;
        if (hasFetchedCartRef.current) return;
        applyCartSnapshot(cartQuery.data);
        hasFetchedCartRef.current = true;
    }, [cartQuery.data, isAuthed, applyCartSnapshot]);

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

            // Background prefetch reviews when idle
            if (result.length > 0) {
                const runPrefetch = (callback: () => void) => {
                    if (typeof requestIdleCallback === 'function') {
                        requestIdleCallback(callback);
                    } else {
                        setTimeout(callback, 1);
                    }
                };

                runPrefetch(() => {
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

    const handleCreateProduct = useCallback(async (payload: CreateProductInput) => {
        const token = authTokensRef.current?.accessToken;
        const role = userRole || userProfile.role;
        if (!token) {
            showToast(t('login_required') || 'Vui lòng đăng nhập', 'info');
            throw new Error('not_authenticated');
        }
        if (role !== 'admin') {
            showToast('Chỉ admin mới được phép tạo sản phẩm', 'error');
            throw new Error('not_admin');
        }

        const result = await apiCreateProduct(payload, token);
        const mapped = mapApiProductToUi(result);
        setProducts(prev => {
            const next = [mapped, ...prev.filter(p => p.id !== mapped.id)];
            productsRef.current = next;
            return next;
        });
        return mapped;
    }, [showToast, t, userProfile.role, userRole]);

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

    const loadFavorites = async (_tokenOverride?: string) => {
        if (!isAuthed) return;
        await favoritesQuery.refetch();
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

    const loadAddresses = async (_tokenOverride?: string) => {
        if (!isAuthed) return;
        await addressesQuery.refetch();
    };

    const loadCart = useCallback(async (tokenOverride?: string, options?: { silent?: boolean }) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        if (!token) return;
        const currentUid = userId || 'me';
        const cacheKey = `cart-${currentUid}`;

        if (isOffline) {
            const cached = await cacheManager.get<ApiCart[]>(cacheKey);
            if (cached) {
                applyCartSnapshot(cached);
                hasFetchedCartRef.current = true;
            }
            return;
        }

        try {
            const result = await fetchMyCart(token);
            await cacheManager.set(cacheKey, result);
            queryClient.setQueryData(['cart', currentUid], result);
            applyCartSnapshot(result);
            hasFetchedCartRef.current = true;
        } catch (error: any) {
            if (!options?.silent) {
                console.warn('AppStateProvider - Failed to load cart', error?.message || error);
            }
        }
    }, [userId, isOffline, queryClient, applyCartSnapshot]);

    const loadUserProfile = useCallback(async (tokenOverride?: string, options?: { silent?: boolean }) => {
        const token = tokenOverride || authTokensRef.current?.accessToken;
        if (!token) return;
        try {
            const result = await getCurrentUser(token);
            if (result) {
                const normalized = normalizeUserProfile({
                    name: result.name,
                    email: result.email,
                    avatar: result.avatar,
                    role: result.role,
                });
                setUserProfile(normalized);
                setUserRole(normalized.role);
                if (result._id && result._id !== userId) {
                    setUserId(result._id);
                }
                if (authTokensRef.current) {
                    persistAuthState(authTokensRef.current as any, normalized, result._id || userId).catch(() => { });
                }
            }
        } catch (error: any) {
            if (!options?.silent) {
                console.warn('AppStateProvider - Failed to load user profile', error?.message || error);
            }
        }
    }, [userId]);

    useEffect(() => {
        let isMounted = true;
        let listenersAttached = false;

        const handler = (payload: any) => {
            if (payload?.collection !== 'carts') return;
            loadCart(undefined, { silent: true });
        };

        const cartHandler = () => {
            loadCart(undefined, { silent: true });
        };

        const task = InteractionManager.runAfterInteractions(() => {
            if (!isMounted) return;
            socketService.connect();
            if (!isAuthed) return;
            socketService.on('db_change', handler);
            socketService.on('cart_updated', cartHandler);
            listenersAttached = true;
        });

        return () => {
            isMounted = false;
            task.cancel?.();
            if (listenersAttached) {
                socketService.off('db_change', handler);
                socketService.off('cart_updated', cartHandler);
            }
        };
    }, [isAuthed, loadCart]);

    // ========================================================================
    // Auth functions
    // ========================================================================
    const syncAuthTokens = useCallback((
        tokens: { accessToken: string; refreshToken: string },
        user?: { name?: string; email?: string; avatar?: string; _id?: string; role?: string },
        userIdOverride?: string | null,
    ) => {
        authTokensRef.current = tokens;
        setAuthTokens(tokens);
        setIsLoggedIn(true);
        const nextUserId = userIdOverride ?? user?._id ?? userId ?? null;
        setUserId(nextUserId);
        const nextProfile = normalizeUserProfile({
            name: user?.name,
            email: user?.email,
            avatar: user?.avatar,
            role: user?.role,
        });
        setUserProfile(nextProfile);
        setUserRole(nextProfile.role);
        persistAuthState(tokens, nextProfile, nextUserId).catch(() => { });

        // Sync FCM token to backend after login
        if (tokens?.accessToken) {
            getFcmToken(tokens.accessToken).catch(() => { });
        }

        socketService.setAuthToken(tokens?.accessToken || null);
    }, [userId]);

    const handleAuthFailure = useCallback(() => {
        setIsLoggedIn(false);
        setAuthTokens(null);
        authTokensRef.current = null;
        cartIdRef.current = null;
        suppressNextCartSyncRef.current = false;
        hasFetchedCartRef.current = false;
        if (cartSyncTimeoutRef.current) {
            clearTimeout(cartSyncTimeoutRef.current);
            cartSyncTimeoutRef.current = null;
        }
        setUserProfile(DEFAULT_PROFILE);
        setUserRole(undefined);
        setUserId(null);
        setVouchers([]);
        setAddresses(DEFAULT_ADDRESSES);
        setCartItems([]);
        socketService.setAuthToken(null);
        void clearPersistedAuthState();
        deleteFcmToken().catch(() => { });
    }, []);

    const login = useCallback((data: AuthResponse) => {
        const tokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        };
        const newUserId = data.user?._id ?? null;
        hasFetchedCartRef.current = false;
        cartIdRef.current = null;
        suppressNextCartSyncRef.current = false;
        setAddresses([]);
        syncAuthTokens(tokens, data.user, newUserId);
        loadUserProfile(tokens.accessToken, { silent: true }).catch(() => { });
        loadFavorites(tokens.accessToken).catch(() => { });
        loadVouchers(tokens.accessToken).catch(() => { });
        loadAddresses(tokens.accessToken).catch(() => { });
        loadCart(tokens.accessToken, { silent: true }).catch(() => { });
    }, [syncAuthTokens, loadUserProfile, loadCart]);

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
        const normalizedOption = normalizeCartSelection(selectedOption);
        const normalizedClassification = normalizeCartSelection(selectedClassification);
        const itemKey = [
            product.id,
            (normalizedOption || 'default').toLowerCase(),
            (normalizedClassification || 'default').toLowerCase(),
        ].join('|');

        let success = false;
        setCartItems(prev => {
            const existing = prev.find(item => {
                const itemKey2 = getCartIdentityKey(item);
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
                const next = prev.map(item => {
                    const itemKey2 = getCartIdentityKey(item);
                    return itemKey2 === itemKey ? { ...item, quantity: Math.max(1, clamped) } : item;
                });
                return mergeCartItems(next);
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

            if (normalizedOption) {
                newItem.selectedOption = normalizedOption;
            }
            if (normalizedClassification) {
                newItem.selectedClassification = normalizedClassification;
            }

            return mergeCartItems([...prev, newItem]);
        });
        return success;
    }, [showToast, t]);

    const updateCartQuantity = useCallback((id: string, delta: number, selectedOption?: string, selectedClassification?: string) => {
        const targetKey = [
            id,
            (normalizeCartSelection(selectedOption) || 'default').toLowerCase(),
            (normalizeCartSelection(selectedClassification) || 'default').toLowerCase(),
        ].join('|');
        setCartItems(prev =>
            prev.map(item => {
                if (getCartIdentityKey(item) !== targetKey) return item;
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

    const removeFromCart = useCallback((id: string, selectedOption?: string, selectedClassification?: string) => {
        const targetKey = [
            id,
            (normalizeCartSelection(selectedOption) || 'default').toLowerCase(),
            (normalizeCartSelection(selectedClassification) || 'default').toLowerCase(),
        ].join('|');
        setCartItems(prev => prev.filter(item => getCartIdentityKey(item) !== targetKey));
    }, []);

    const updateCartItemOptions = useCallback((
        itemId: string,
        selectedOption?: string,
        selectedClassification?: string,
        previousOption?: string,
        previousClassification?: string,
    ) => {
        setCartItems(prev => {
            const previousKey = [
                itemId,
                (normalizeCartSelection(previousOption) || 'default').toLowerCase(),
                (normalizeCartSelection(previousClassification) || 'default').toLowerCase(),
            ].join('|');
            const itemIndex = prev.findIndex(item => getCartIdentityKey(item) === previousKey);
            if (itemIndex === -1) return prev;

            const currentItem = prev[itemIndex];
            const normalizeOption = (opt?: string) => {
                if (!opt || typeof opt !== 'string' || !opt.trim()) return undefined;
                return opt.trim();
            };
            const newOption = selectedOption !== undefined ? normalizeOption(selectedOption) : normalizeOption(currentItem.selectedOption);
            const newClassification = selectedClassification !== undefined ? normalizeOption(selectedClassification) : normalizeOption(currentItem.selectedClassification);

            const next = prev.map((item, index) =>
                index === itemIndex
                    ? { ...item, selectedOption: newOption, selectedClassification: newClassification }
                    : item
            );
            return mergeCartItems(next);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // ========================================================================
    // Wishlist functions
    // ========================================================================
    const toggleFavorite = useCallback((productId: string) => {
        const token = authTokensRef.current?.accessToken;
        if (!token) return;

        const isFav = wishlist.some(item => item.id === productId);
        favoritesMutation.mutate({ productId, action: isFav ? 'remove' : 'add' });
    }, [wishlist, favoritesMutation]);

    const isFavorite = useCallback((productId: string) => {
        return wishlist.some(item => item.id === productId);
    }, [wishlist]);

    // ========================================================================
    // Profile functions
    // ========================================================================
    const profileMutation = useMutation({
        mutationFn: async (data: Partial<typeof userProfile> & { avatarFile?: UploadImageFile }) => {
            const accessToken = authTokensRef.current?.accessToken;
            if (!accessToken) return null;

            let avatarToUpdate = data.avatar;

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

            if (!Object.keys(payload).length) return null;

            const result = await apiUpdateProfile(payload, authTokensRef.current?.accessToken || accessToken);
            return result.user || payload;
        },
    });

    const updateProfile = useCallback(async (data: Partial<typeof userProfile> & { avatarFile?: UploadImageFile }) => {
        const previousProfile = userProfile;
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

        try {
            const updatedUser = await profileMutation.mutateAsync(data);
            if (!updatedUser) return;
            setUserProfile(prev => {
                const next = { ...prev, ...updatedUser };
                if (authTokensRef.current) {
                    persistAuthState(authTokensRef.current as any, next, userId).catch(() => { });
                }
                return next;
            });
        } catch (error: any) {
            setUserProfile(previousProfile);
            if (authTokensRef.current) {
                persistAuthState(authTokensRef.current as any, previousProfile, userId).catch(() => { });
            }
            console.warn('AppStateProvider - Failed to update profile', error?.message || error);
        }
    }, [userProfile, userId, profileMutation]);

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
            // Load cart
            const savedCart = await loadPersistedCart();
            if (savedCart) setCartItems(savedCart);

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
                    const runTask = (callback: () => void) => {
                        if (typeof requestIdleCallback === 'function') {
                            requestIdleCallback(callback);
                        } else {
                            setTimeout(callback, 1);
                        }
                    };

                    runTask(() => {
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

    // Sync cart to backend (debounced, avoids re-triggering from mutation state changes)
    useEffect(() => {
        if (!authTokensRef.current?.accessToken) return;
        if (!hasFetchedCartRef.current) return;
        if (suppressNextCartSyncRef.current) {
            suppressNextCartSyncRef.current = false;
            return;
        }
        if (cartSyncTimeoutRef.current) {
            clearTimeout(cartSyncTimeoutRef.current);
        }
        cartSyncTimeoutRef.current = setTimeout(async () => {
            const token = authTokensRef.current?.accessToken;
            if (!token) return;
            try {
                const payloadItems = cartItems.map(mapCartItemToApi);
                const totals = computeCartTotals(cartItems);
                const result = await upsertCart(payloadItems, token, cartIdRef.current || null, totals);
                if (result?._id) {
                    cartIdRef.current = result._id;
                }
            } catch (error) {
                console.warn('AppStateProvider - Failed to sync cart to backend', error);
            }
        }, 800);

        return () => {
            if (cartSyncTimeoutRef.current) {
                clearTimeout(cartSyncTimeoutRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItems, authTokens?.accessToken]);

    // Load user data when logged in
    useEffect(() => {
        if (isLoggedIn && authTokens?.accessToken) {
            loadUserProfile(undefined, { silent: true }).catch(() => { });
            loadFavorites().catch(() => { });
            loadVouchers().catch(() => { });
            loadAddresses().catch(() => { });
            loadCart(undefined, { silent: true }).catch(() => { });
        } else if (!isLoggedIn) {
            setWishlist([]);
            setVouchers([]);
            setAddresses(DEFAULT_ADDRESSES);
        }
    }, [isLoggedIn, authTokens?.accessToken, loadUserProfile, loadCart]);

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
    const cartContextValue: CartContextValue = useMemo(() => ({
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        updateCartItemOptions,
        appliedVoucher,
        setAppliedVoucher,
        clearCart,
    }), [
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        updateCartItemOptions,
        appliedVoucher,
        setAppliedVoucher,
        clearCart,
    ]);

    const contextValue: AppContextValue = useMemo(() => ({
        // Products
        products,
        relatedProducts,
        banners,
        isLoadingProducts,
        productsError,
        loadProducts,

        // Auth
        isLoggedIn,
        authTokens,
        userId,
        userProfile,
        userRole,
        isAdmin: (userRole || userProfile.role) === 'admin',
        login,
        logout: handleAuthFailure,
        updateProfile,
        loadUserProfile,
        createProduct: handleCreateProduct,

        // Wishlist
        wishlist,
        toggleFavorite,
        isFavorite,

        // Vouchers
        vouchers,

        // Addresses
        addresses,
        updateAddresses: setAddresses,

        // Network
        networkStatus,

        // Navigation helpers
        navigateToProduct,
        navigateToCart,
        requireLogin,
    }), [
        products, relatedProducts, banners, isLoadingProducts, productsError, loadProducts,
        isLoggedIn, authTokens, userId, userProfile, userRole, handleCreateProduct, login, handleAuthFailure, updateProfile, loadUserProfile,
        wishlist, toggleFavorite, isFavorite,
        vouchers,
        addresses,
        networkStatus,
        navigateToProduct, navigateToCart, requireLogin,
    ]);

    return (
        <AppProvider value={contextValue}>
            <CartProvider value={cartContextValue}>
                <OrdersStateProvider>
                    <NotificationsStateProvider>
                        {children}
                    </NotificationsStateProvider>
                </OrdersStateProvider>
            </CartProvider>
        </AppProvider>
    );
}
