import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { Voucher } from '../../types';
import { formatPrice } from '../../utils';

interface CartSummaryProps {
    subtotal: number;
    shipping: number;
    discountAmount: number;
    total: number;
    voucherCode: string;
    appliedVoucher: Voucher | null;
    onOpenVoucherList: () => void;
    onCheckout: () => void;
    theme: Theme;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    shipping,
    discountAmount,
    total,
    voucherCode,
    appliedVoucher,
    onOpenVoucherList,
    onCheckout,
    theme: t,
}) => {
    const { t: translate } = useTranslation();

    return (
        <View
            className="rounded-2xl p-5 border shadow-sm"
            style={{
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0
            }}
        >
            <TouchableOpacity
                onPress={onOpenVoucherList}
                className="flex-row items-center rounded-xl px-3 h-10 mb-4 border"
                style={{ backgroundColor: t.surface, borderColor: t.border }}
                activeOpacity={0.7}
            >
                <AppIcon name="tag" size={18} color={t.muted} style={{ marginRight: 8 }} />
                <Text
                    className="flex-1 text-sm"
                    style={{ color: voucherCode ? t.text : t.muted }}
                >
                    {voucherCode || translate('voucher_placeholder')}
                </Text>
                <AppIcon name="chevron-right" size={16} color={t.muted} />
            </TouchableOpacity>

            <View className="flex-row justify-between mb-3">
                <Text className="text-sm" style={{ color: t.muted }}>{translate('subtotal')}</Text>
                <Text className="text-sm font-medium" style={{ color: t.text }}>{formatPrice(subtotal)}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
                <Text className="text-sm" style={{ color: t.muted }}>{translate('shipping_fee')}</Text>
                <Text className="text-sm font-medium" style={{ color: t.text }}>{formatPrice(shipping)}</Text>
            </View>

            {appliedVoucher && (
                <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center gap-1">
                        <AppIcon name="ticket" size={14} color="#10B981" />
                        <Text className="text-sm" style={{ color: t.text }}>{translate('voucher_discount')}</Text>
                    </View>
                    <Text className="text-sm font-medium" style={{ color: t.text }}>-{formatPrice(discountAmount)}</Text>
                </View>
            )}

            <View
                className="flex-row justify-between items-end pt-3 border-t mt-1"
                style={{ borderTopColor: '#F3F4F6' }}
            >
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('total')}</Text>
                <Text className="text-xl font-bold" style={{ color: t.primary }}>{formatPrice(total)}</Text>
            </View>

            <TouchableOpacity
                onPress={onCheckout}
                className="rounded-xl py-3.5 flex-row items-center justify-center gap-2 mt-4 shadow-lg"
                style={{
                    backgroundColor: t.primary,
                    ...Platform.select({
                        ios: {
                            shadowColor: t.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                        },
                        android: {
                            elevation: 4,
                        },
                    }),
                }}
                activeOpacity={0.8}
            >
                <Text className="text-white text-sm font-bold">{translate('checkout_now')}</Text>
                <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};
