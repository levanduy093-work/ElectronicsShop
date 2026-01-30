import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../theme';
import { Order, Product } from '../../types';
import { useToast } from '../../components/common/ToastProvider';

interface OrderActionsProps {
    order: Order;
    products: Product[];
    onReorder?: (product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => void;
    onPayAgain?: (orderId: string) => Promise<{ paymentUrl?: string } | void>;
    onNavigateToCart?: () => void;
    onOpenSupport: () => void;
    theme: Theme;
    accessToken?: string | null;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
    order,
    products,
    onReorder,
    onPayAgain,
    onNavigateToCart,
    onOpenSupport,
    theme: t,
    accessToken,
}) => {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();
    const [isReordering, setIsReordering] = useState(false);
    const [isPayingAgain, setIsPayingAgain] = useState(false);

    const isPendingPayment = order.paymentStatus === 'pending' || order.paymentStatus === 'failed';
    const isVnpayOrder = order.payment && order.payment.method && order.payment.method.toLowerCase().includes('vnpay');

    const handlePayAgain = async () => {
        if (!onPayAgain || !accessToken) {
            showToast(translate('payAgainNotAvailable'), 'error');
            return;
        }

        if (isPayingAgain) return;
        setIsPayingAgain(true);

        try {
            const result = await onPayAgain(order.id);
            if (result?.paymentUrl) {
                Linking.openURL(result.paymentUrl).catch(() => {
                    showToast(translate('cannotOpenVnpay'), 'error');
                });
            } else {
                showToast(translate('cannotCreatePaymentUrl'), 'error');
            }
        } catch (error: any) {
            showToast(error?.message || translate('cannotCreatePaymentUrl'), 'error');
        } finally {
            setIsPayingAgain(false);
        }
    };

    const handleReorder = () => {
        if (!onReorder) {
            showToast(translate('reorderNotActivated'), 'error');
            return;
        }

        if (isReordering) return;
        setIsReordering(true);

        const outOfStockItems: string[] = [];
        const availableItems: Array<{ product: Product; quantity: number; selectedOption?: string; selectedClassification?: string }> = [];

        // Check stock for each item
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);

            if (!product) {
                outOfStockItems.push(item.name);
                return;
            }

            const isOutOfStock = product.stock === 'Out of Stock' ||
                (product.stockQuantity !== undefined && product.stockQuantity <= 0);

            if (isOutOfStock) {
                outOfStockItems.push(item.name);
            } else {
                // Check if requested quantity is available
                const availableQuantity = product.stockQuantity ?? item.quantity;
                const quantityToAdd = Math.min(item.quantity, availableQuantity);
                availableItems.push({
                    product,
                    quantity: quantityToAdd,
                    selectedOption: item.selectedOption,
                    selectedClassification: item.selectedClassification,
                });
            }
        });

        // Add available items to cart
        availableItems.forEach(item => {
            onReorder(item.product, item.quantity, item.selectedOption, item.selectedClassification);
        });

        // Show appropriate message
        if (availableItems.length === 0) {
            showToast(translate('allProductsOutOfStock'), 'error');
        } else if (outOfStockItems.length === 0) {
            showToast(translate('products_added_to_cart', { count: availableItems.length }), 'success');
            setTimeout(() => onNavigateToCart?.(), 500);
        } else {
            const productsList = outOfStockItems.slice(0, 2).join(', ') + (outOfStockItems.length > 2 ? '...' : '');
            showToast(
                translate('products_added_some_out_of_stock', {
                    count: availableItems.length,
                    outOfStockCount: outOfStockItems.length,
                    products: productsList,
                }),
                'info'
            );
            setTimeout(() => onNavigateToCart?.(), 500);
        }

        setIsReordering(false);
    };

    return (
        <View
            className="flex-row p-4 border-t gap-3"
            style={{
                backgroundColor: t.surface,
                borderTopColor: t.border,
                paddingBottom: Math.max(insets.bottom, 16),
            }}
        >
            <TouchableOpacity
                className="flex-1 h-12 rounded-full justify-center items-center border"
                style={{
                    borderColor: t.border,
                    backgroundColor: t.card,
                }}
                activeOpacity={0.7}
                onPress={onOpenSupport}
            >
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('contact_support')}</Text>
            </TouchableOpacity>
            {isPendingPayment && isVnpayOrder && onPayAgain ? (
                <TouchableOpacity
                    className="flex-1 h-12 rounded-full justify-center items-center"
                    style={{
                        backgroundColor: isPayingAgain ? t.border : t.primary,
                    }}
                    activeOpacity={0.8}
                    onPress={handlePayAgain}
                    disabled={isPayingAgain}
                >
                    <Text className="text-base font-bold" style={{ color: isPayingAgain ? t.muted : '#FFFFFF' }}>
                        {isPayingAgain ? translate('processing') : translate('payAgain')}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    className="flex-1 h-12 rounded-full justify-center items-center"
                    style={{
                        backgroundColor: isReordering ? t.border : t.primary,
                    }}
                    activeOpacity={0.8}
                    onPress={handleReorder}
                    disabled={isReordering}
                >
                    <Text className="text-base font-bold" style={{ color: isReordering ? t.muted : '#FFFFFF' }}>
                        {isReordering ? translate('processing') : translate('reorder')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
