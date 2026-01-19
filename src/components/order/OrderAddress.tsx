import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { Order } from '../../types';

interface OrderAddressProps {
    shippingAddress: Order['shippingAddress'];
    theme: Theme;
}

export const OrderAddress: React.FC<OrderAddressProps> = ({ shippingAddress, theme: t }) => {
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
                <AppIcon name="map-pin" size={18} color={t.primary} />
                <Text style={[styles.cardTitle, { color: t.text }]}>{translate('shipping_address')}</Text>
            </View>
            <Text style={[styles.addressName, { color: t.text }]}>
                {shippingAddress.name} | {shippingAddress.phone}
            </Text>
            <Text style={[styles.addressText, { color: t.muted }]}>{shippingAddress.address}</Text>
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
    addressName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
