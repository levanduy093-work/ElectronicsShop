import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
import { formatPrice } from '../../utils';
import { Voucher } from '../../types';

interface OrderSummaryProps {
    subTotal: number;
    shippingFee: number;
    voucher?: Voucher | null;
    discount: number;
    total: number;
    theme: Theme;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    subTotal,
    shippingFee,
    voucher,
    discount,
    total,
    theme: t,
}) => {
    const { t: translate } = useTranslation();

    return (
        <View className="rounded-xl p-4 gap-3" style={{ backgroundColor: t.surface }}>
            <View className="flex-row justify-between items-center">
                <Text className="text-sm" style={{ color: t.muted }}>Tổng tiền hàng</Text>
                <Text className="text-sm font-medium" style={{ color: t.text }}>
                    {formatPrice(subTotal)}
                </Text>
            </View>

            <View className="flex-row justify-between items-center">
                <Text className="text-sm" style={{ color: t.muted }}>Phí vận chuyển</Text>
                <Text className="text-sm font-medium" style={{ color: t.text }}>{formatPrice(shippingFee)}</Text>
            </View>

            {voucher && discount > 0 && (
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-1.5">
                        <AppIcon name="ticket" size={14} color="#10B981" />
                        <Text className="text-sm" style={{ color: t.text }}>{translate('voucher_discount')}</Text>
                    </View>
                    <Text className="text-sm font-medium text-emerald-500">-{formatPrice(discount)}</Text>
                </View>
            )}

            <View
                className="flex-row justify-between items-center pt-3 border-t mt-1"
                style={{ borderTopColor: t.border }}
            >
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('payment')}</Text>
                <Text className="text-lg font-bold" style={{ color: t.primary }}>{formatPrice(total)}</Text>
            </View>
        </View>
    );
};
