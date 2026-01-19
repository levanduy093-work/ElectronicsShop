import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        <View style={[styles.summaryCard, { backgroundColor: t.surface }]}>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: t.muted }]}>Tổng tiền hàng</Text>
                <Text style={[styles.summaryValue, { color: t.text }]}>
                    {formatPrice(subTotal)}
                </Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: t.muted }]}>Phí vận chuyển</Text>
                <Text style={[styles.summaryValue, { color: t.text }]}>{formatPrice(shippingFee)}</Text>
            </View>

            {voucher && discount > 0 && (
                <View style={styles.summaryRow}>
                    <View style={styles.discountRow}>
                        <AppIcon name="ticket" size={14} color="#10B981" />
                        <Text style={[styles.discountLabel, { color: t.text }]}>{translate('voucher_discount')}</Text>
                    </View>
                    <Text style={[styles.discountValue, { color: '#10B981' }]}>-{formatPrice(discount)}</Text>
                </View>
            )}

            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: t.text }]}>{translate('payment')}</Text>
                <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(total)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    summaryCard: {
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        gap: 6,
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
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB', // This might need to be dynamic or simpler
        // Using a default color for now as we don't pass border color explicitly to styles,
        // but the component background is surface.
        // Ideally we pass or use theme in style creation, or inline.
        // For now, let's just use a Safe separator or rely on the theme passed.
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
