import { createContext, useContext } from 'react';
import type { CartItem, Product, Voucher } from '../types';

export interface CartContextValue {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => void;
    updateCartQuantity: (productId: string, delta: number, selectedOption?: string, selectedClassification?: string) => void;
    removeFromCart: (productId: string, selectedOption?: string, selectedClassification?: string) => void;
    updateCartItemOptions: (productId: string, selectedOption?: string, selectedClassification?: string, previousOption?: string, previousClassification?: string) => void;
    appliedVoucher: Voucher | null;
    setAppliedVoucher: (voucher: Voucher | null) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = CartContext.Provider;

export function useCartOptional(): CartContextValue | null {
    return useContext(CartContext);
}
