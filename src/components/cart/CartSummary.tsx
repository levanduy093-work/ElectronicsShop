import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={[styles.summaryCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 }]}>
            <TouchableOpacity
                onPress={onOpenVoucherList}
                style={[styles.voucherInput, { backgroundColor: t.surface, borderColor: t.border }]}
                activeOpacity={0.7}
            >
                <AppIcon name="tag" size={18} color={t.muted} style={styles.voucherIcon} />
                <Text style={[
                    styles.voucherText,
                    !voucherCode && styles.voucherPlaceholder,
                    { color: voucherCode ? t.text : t.muted }
                ]}>
                    {voucherCode || translate('voucher_placeholder')}
                </Text>
                <AppIcon name="chevron-right" size={16} color={t.muted} />
            </TouchableOpacity>

            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: t.muted }]}>{translate('subtotal')}</Text>
                <Text style={[styles.summaryValue, { color: t.text }]}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: t.muted }]}>{translate('shipping_fee')}</Text>
                <Text style={[styles.summaryValue, { color: t.text }]}>{formatPrice(shipping)}</Text>
            </View>

            {appliedVoucher && (
                <View style={styles.summaryRow}>
                    <View style={styles.discountRow}>
                        <AppIcon name="ticket" size={14} color="#10B981" />
                        <Text style={[styles.discountLabel, { color: t.text }]}>{translate('voucher_discount')}</Text>
                    </View>
                    <Text style={[styles.discountValue, { color: t.text }]}>-{formatPrice(discountAmount)}</Text>
                </View>
            )}

            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: t.text }]}>{translate('total')}</Text>
                <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(total)}</Text>
            </View>

            <TouchableOpacity
                onPress={onCheckout}
                style={[styles.checkoutButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
                activeOpacity={0.8}
            >
                <Text style={styles.checkoutButtonText}>{translate('checkout_now')}</Text>
                <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    summaryCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    voucherInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 16,
        borderWidth: 1, // Added border width for consistency
    },
    voucherIcon: {
        marginRight: 8,
    },
    voucherText: {
        flex: 1,
        fontSize: 14,
    },
    voucherPlaceholder: {
        color: '#9CA3AF',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    discountLabel: {
        fontSize: 14,
    },
    discountValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    checkoutButton: {
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
