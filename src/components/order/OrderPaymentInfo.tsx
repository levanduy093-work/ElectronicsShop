import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { Order } from '../../types';
import { formatPrice } from '../../utils';

interface OrderPaymentInfoProps {
    payment: Order['payment'];
    theme: Theme;
}

export const OrderPaymentInfo: React.FC<OrderPaymentInfoProps> = ({ payment, theme: t }) => {
    const { t: translate } = useTranslation();

    return (
        <View
            className="rounded-2xl p-4 border shadow-sm"
            style={{
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }}
        >
            <View className="flex-row items-center gap-2 mb-3">
                <AppIcon name="credit-card" size={18} color={t.primary} />
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('payment')}</Text>
            </View>

            <View className="gap-2 mb-4">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-sm" style={{ color: t.muted }}>{translate('subtotal')}</Text>
                    <Text className="text-sm font-medium" style={{ color: t.text }}>{formatPrice(payment.subtotal)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-sm" style={{ color: t.muted }}>{translate('shipping_fee')}</Text>
                    <Text className="text-sm font-medium" style={{ color: t.text }}>{formatPrice(payment.shippingFee)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-sm" style={{ color: t.muted }}>{translate('discount')}</Text>
                    <Text className="text-sm font-medium text-emerald-500">
                        -{formatPrice(payment.discount)}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center pt-2 border-t mt-2" style={{ borderTopColor: t.border }}>
                    <Text className="text-base font-bold" style={{ color: t.text }}>{translate('total_amount')}</Text>
                    <Text className="text-lg font-bold" style={{ color: t.primary }}>{formatPrice(payment.total)}</Text>
                </View>
            </View>

            <View className="p-3 rounded-lg" style={{ backgroundColor: t.surface }}>
                <Text className="text-sm text-center" style={{ color: t.muted }}>
                    {translate('payment_method')} {payment.method}
                </Text>
            </View>
        </View>
    );
};
