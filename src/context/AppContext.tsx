import React, { createContext, useContext, ReactNode } from 'react';
import type { Product, CartItem, Order, Voucher, HomeBanner, ChatMessage, Address } from '../types';

// ============================================================================
// App Context Types
// ============================================================================

export interface AppContextValue {
    // Products
    products: Product[];
    relatedProducts: Product[];
    banners: HomeBanner[];
    isLoadingProducts: boolean;
    productsError: string | null;
    loadProducts: () => Promise<Product[] | undefined>;

    // Cart
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartItemOptions: (productId: string, selectedOption?: string, selectedClassification?: string) => void;

    // Auth
    isLoggedIn: boolean;
    authTokens: { accessToken: string; refreshToken: string } | null;
    userId: string | null;
    userProfile: { name: string; email: string; avatar: string };
    login: (response: any) => void;
    logout: () => void;
    updateProfile: (data: any) => Promise<void>;

    // Wishlist
    wishlist: Product[];
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;

    // Orders
    orders: Order[];
    selectedOrderId: string | null;
    isPlacingOrder: boolean;
    isRefreshingOrders: boolean;
    placeOrder: (orderData: any) => Promise<any>;
    refreshOrders: () => Promise<void>;
    refreshOrderDetail: (orderId: string) => Promise<void>;
    setSelectedOrderId: (orderId: string | null) => void;

    // Vouchers
    vouchers: Voucher[];
    appliedVoucher: Voucher | null;
    setAppliedVoucher: (voucher: Voucher | null) => void;

    // Notifications
    notifications: any[];
    isRefreshingNotifications: boolean;
    refreshNotifications: () => Promise<void>;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;

    // Addresses
    addresses: Address[];
    updateAddresses: React.Dispatch<React.SetStateAction<Address[]>>;

    // AI Chat
    aiMessages: ChatMessage[];
    setAiMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

    // Filters
    filters: {
        priceRange: [number, number];
        categories: string[];
        rating: number | null;
        onlyInStock: boolean;
    };
    setFilters: (filters: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    availableCategories: string[];

    // Theme
    themeMode: 'light' | 'dark' | 'system';
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;

    // Settings
    isPushEnabled: boolean;
    setIsPushEnabled: (enabled: boolean) => void;

    // Network
    networkStatus: { isConnected: boolean | null };

    // Navigation helpers (for backward compatibility with existing screens)
    navigateToProduct: (productId: string) => void;
    navigateToCart: () => void;
    requireLogin: (callback?: () => void) => void;
}

// ============================================================================
// Context Creation
// ============================================================================

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = AppContext.Provider;

export function useApp(): AppContextValue {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

// ============================================================================
// Hook for optional context (for screens that don't require all props)
// ============================================================================

export function useAppOptional(): AppContextValue | null {
    return useContext(AppContext);
}
