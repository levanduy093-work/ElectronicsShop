import React, { createContext, useContext } from 'react';
import type { Order } from '../types';

export interface OrdersContextValue {
    orders: Order[];
    selectedOrderId: string | null;
    isPlacingOrder: boolean;
    isRefreshingOrders: boolean;
    placeOrder: (orderData: any) => Promise<any>;
    refreshOrders: () => Promise<void>;
    refreshOrderDetail: (orderId: string) => Promise<void>;
    setSelectedOrderId: (orderId: string | null) => void;
    setOrdersActive: (active: boolean) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export const OrdersProvider = OrdersContext.Provider;

export function useOrdersOptional(): OrdersContextValue | null {
    return useContext(OrdersContext);
}
