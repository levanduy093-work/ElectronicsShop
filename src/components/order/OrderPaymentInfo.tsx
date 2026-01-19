import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        <View style={[
            styles.card,
            {
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }
        ]}>
            <View style={styles.cardHeader}>
                <AppIcon name="credit-card" size={18} color={t.primary} />
                <Text style={[styles.cardTitle, { color: t.text }]}>{translate('payment')}</Text>
            </View>

            <View style={styles.paymentDetails}>
                <View style={styles.paymentRow}>
                    <Text style={[styles.paymentLabel, { color: t.muted }]}>{translate('subtotal')}</Text>
                    <Text style={[styles.paymentValue, { color: t.text }]}>{formatPrice(payment.subtotal)}</Text>
                </View>
                <View style={styles.paymentRow}>
                    <Text style={[styles.paymentLabel, { color: t.muted }]}>{translate('shipping_fee')}</Text>
                    <Text style={[styles.paymentValue, { color: t.text }]}>{formatPrice(payment.shippingFee)}</Text>
                </View>
                <View style={styles.paymentRow}>
                    <Text style={[styles.paymentLabel, { color: t.muted }]}>{translate('discount')}</Text>
                    <Text style={[styles.paymentValue, { color: '#10B981' }]}>
                        -{formatPrice(payment.discount)}
                    </Text>
                </View>
                <View style={[styles.totalRow, { borderTopColor: t.border }]}>
                    <Text style={[styles.totalLabel, { color: t.text }]}>{translate('total_amount')}</Text>
                    <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(payment.total)}</Text>
                </View>
            </View>

            <View style={[styles.paymentMethod, { backgroundColor: t.surface }]}>
                <Text style={[styles.paymentMethodText, { color: t.muted }]}>
                    {translate('payment_method')} {payment.method}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentDetails: {
        gap: 8,
        marginBottom: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 14,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    paymentMethod: {
        padding: 12,
        borderRadius: 8,
    },
    paymentMethodText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
