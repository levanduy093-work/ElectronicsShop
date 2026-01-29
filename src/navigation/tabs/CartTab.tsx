import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { useTranslation } from 'react-i18next';

const CartScreen = React.lazy(() =>
    import('../../screens/Cart').then(m => ({ default: m.Cart }))
);

function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

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
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
