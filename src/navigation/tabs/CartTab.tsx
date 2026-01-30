import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { Cart as CartScreen } from '../../screens/Cart';

export function CartTab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const app = useAppOptional();

    const hasUnread = (app?.notifications || []).some(n => !n.read);

    return (
        <ScreenLayout
            showTopBar={true}
            title={t('cart_title')}
            showSearch={false}
            hasUnread={hasUnread}
            onNotificationClick={() => navigation.navigate('Notifications')}
        >
            <CartScreen
                theme={theme}
                items={app?.cartItems || []}
                onUpdateQuantity={app?.updateCartQuantity || (() => { })}
                onRemoveItem={app?.removeFromCart || (() => { })}
                onUpdateItemOptions={app?.updateCartItemOptions || (() => { })}
                onCheckout={() => navigation.navigate('Checkout')}
                onExplore={() => { }}
                vouchers={app?.vouchers || []}
                appliedVoucher={app?.appliedVoucher || null}
                onVoucherChange={app?.setAppliedVoucher || (() => { })}
            />
        </ScreenLayout>
    );
}

