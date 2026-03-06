import React, { createContext, useContext } from 'react';
import type { Product, Voucher, HomeBanner, Address } from '../types';
import type { CreateProductInput } from '../services/api';

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

    // Auth
    isLoggedIn: boolean;
    authTokens: { accessToken: string; refreshToken: string } | null;
    userId: string | null;
    userProfile: { name: string; email: string; avatar: string; role?: string };
    userRole?: string;
    isAdmin: boolean;
    login: (response: any) => void;
    logout: () => void;
    updateProfile: (data: any) => Promise<void>;
    loadUserProfile: (tokenOverride?: string, options?: { silent?: boolean }) => Promise<void>;
    createProduct: (payload: CreateProductInput) => Promise<Product>;

    // Wishlist
    wishlist: Product[];
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;

    // Vouchers
    vouchers: Voucher[];

    // Addresses
    addresses: Address[];
    updateAddresses: React.Dispatch<React.SetStateAction<Address[]>>;

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



// ============================================================================
// Hook for optional context (for screens that don't require all props)
// ============================================================================

export function useAppOptional(): AppContextValue | null {
    return useContext(AppContext);
}
