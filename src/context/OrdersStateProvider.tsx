import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, InteractionManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import type { CartItem, Address, Order } from '../types';
import type { ApiOrder } from '../services/api';
import { createOrder as apiCreateOrder, createVnpayPayment, getOrderById, getOrders as apiGetOrders } from '../services/api';
import { cacheManager } from '../utils/cache';
import { mapApiOrderToUi } from '../utils/orderNotificationMappers';
import { OrdersProvider, type OrdersContextValue } from './OrdersContext';
import { useAppOptional } from './AppContext';
import { useCartOptional } from './CartContext';
import { socketService } from '../services/socket';

interface OrdersStateProviderProps {
    children: React.ReactNode;
}

export function OrdersStateProvider({ children }: OrdersStateProviderProps) {
    const app = useAppOptional();
    const cartCtx = useCartOptional();
    const { t } = useTranslation();

    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
    const [isOrdersActive, setIsOrdersActive] = useState(false);

    const accessToken = app?.authTokens?.accessToken || null;
    const isAuthed = Boolean(app?.isLoggedIn && accessToken);
    const currentUserKey = app?.userId || 'me';
    const isOffline = app?.networkStatus?.isConnected === false;
    const products = app?.products || [];
    const clearCart = cartCtx?.clearCart;

    const ordersQuery = useQuery({
        queryKey: ['orders', currentUserKey, accessToken],
        enabled: isAuthed,
        queryFn: async () => {
            if (!accessToken) return [];
            const cacheKey = `orders-${currentUserKey}`;
            if (isOffline) {
                const cached = await cacheManager.get<ApiOrder[]>(cacheKey);
                if (cached) return cached;
            }
            const result = await apiGetOrders(accessToken, { scope: 'mine' });
            await cacheManager.set(cacheKey, result);
            return result;
        },
        refetchInterval: false,
    });

    useEffect(() => {
        if (!isAuthed) return;
        if (ordersQuery.data) {
            const mapped = ordersQuery.data
                .map(o => mapApiOrderToUi(o, products, t))
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.date).getTime();
                    const dateB = new Date(b.createdAt || b.date).getTime();
                    return dateB - dateA;
                });
            setOrders(mapped);
        }
    }, [ordersQuery.data, isAuthed, t, products]);

    useEffect(() => {
        if (!isAuthed) {
            setIsRefreshingOrders(false);
            return;
        }
        setIsRefreshingOrders(ordersQuery.isFetching);
    }, [ordersQuery.isFetching, isAuthed]);

    const refreshOrders = useCallback(async () => {
        if (!isAuthed) return;
        await ordersQuery.refetch();
    }, [ordersQuery.refetch, isAuthed]);

    const refreshOrderDetail = useCallback(async (orderId: string) => {
        if (!accessToken) return;
        try {
            const result = await getOrderById(orderId, accessToken);
            const mapped = mapApiOrderToUi(result, products, t);
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
            console.warn('OrdersStateProvider - Failed to fetch order detail', error?.message || error);
        }
    }, [accessToken, products, t]);

    const setOrdersActive = useCallback((active: boolean) => {
        setIsOrdersActive(active);
    }, []);

    const placeOrder = useCallback(async (params: {
        items: CartItem[];
        totals: { subTotal: number; shippingFee: number; discount: number; total: number };
        paymentMethod: string;
        shippingAddress?: Address;
    }) => {
        if (!accessToken) {
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
                const paymentResult = await createVnpayPayment(payload, accessToken);
                const orderId =
                    (paymentResult?.order as any)?._id ||
                    (paymentResult?.order as any)?.id ||
                    (paymentResult?.order as any)?._id?.toString?.();
                return { id: orderId || code, code, paymentUrl: paymentResult.paymentUrl };
            }
            const result = await apiCreateOrder(payload, accessToken);
            const mapped = mapApiOrderToUi(result, products, t);
            setOrders(prev => [mapped, ...prev]);
            clearCart?.();
            return mapped;
        } finally {
            setIsPlacingOrder(false);
        }
    }, [accessToken, clearCart, products, t]);

    useEffect(() => {
        if (isAuthed) return;
        setOrders([]);
        setSelectedOrderId(null);
        setIsRefreshingOrders(false);
    }, [isAuthed]);

    useEffect(() => {
        if (!isAuthed || isOffline) return;
        const orderInterval = setInterval(() => {
            if (AppState.currentState !== 'active') return;
            if (!isOrdersActive && !selectedOrderId) return;
            if (selectedOrderId) {
                refreshOrderDetail(selectedOrderId);
            } else {
                refreshOrders();
            }
        }, 30000);

        return () => {
            clearInterval(orderInterval);
        };
    }, [isAuthed, isOffline, isOrdersActive, selectedOrderId, refreshOrderDetail, refreshOrders]);

    useEffect(() => {
        if (!isAuthed) return;
        let isMounted = true;
        const handler = (payload: any) => {
            if (payload?.collection !== 'orders') return;
            if (selectedOrderId) {
                refreshOrderDetail(selectedOrderId);
            } else {
                refreshOrders();
            }
        };

        const task = InteractionManager.runAfterInteractions(() => {
            if (!isMounted) return;
            socketService.on('db_change', handler);
        });

        return () => {
            isMounted = false;
            task.cancel?.();
            socketService.off('db_change', handler);
        };
    }, [isAuthed, selectedOrderId, refreshOrderDetail, refreshOrders]);

    const contextValue: OrdersContextValue = useMemo(() => ({
        orders,
        selectedOrderId,
        isPlacingOrder,
        isRefreshingOrders,
        placeOrder,
        refreshOrders,
        refreshOrderDetail,
        setSelectedOrderId,
        setOrdersActive,
    }), [
        orders,
        selectedOrderId,
        isPlacingOrder,
        isRefreshingOrders,
        placeOrder,
        refreshOrders,
        refreshOrderDetail,
        setSelectedOrderId,
        setOrdersActive,
    ]);

    return (
        <OrdersProvider value={contextValue}>
            {children}
        </OrdersProvider>
    );
}
