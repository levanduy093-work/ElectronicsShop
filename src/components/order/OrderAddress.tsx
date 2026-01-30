import React from 'react';
import { View, Text } from 'react-native';
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
                <AppIcon name="map-pin" size={18} color={t.primary} />
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('shipping_address')}</Text>
            </View>
            <Text className="text-sm font-medium mb-1" style={{ color: t.text }}>
                {shippingAddress.name} | {shippingAddress.phone}
            </Text>
            <Text className="text-sm leading-5" style={{ color: t.muted }}>{shippingAddress.address}</Text>
        </View>
    );
};
