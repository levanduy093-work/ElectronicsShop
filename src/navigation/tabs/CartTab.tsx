import React from 'react';
import { useAppOptional, useNotificationsOptional, useCartOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { useTranslation } from 'react-i18next';
import { Cart as CartScreen } from '../../screens/Cart';

export function CartTab({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const app = useAppOptional();
    const notificationsCtx = useNotificationsOptional();
    const cartCtx = useCartOptional();

    const hasUnread = (notificationsCtx?.notifications || []).some(n => !n.read);

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
                items={cartCtx?.cartItems || []}
                onUpdateQuantity={cartCtx?.updateCartQuantity || (() => { })}
                onRemoveItem={cartCtx?.removeFromCart || (() => { })}
                onUpdateItemOptions={cartCtx?.updateCartItemOptions || (() => { })}
                onCheckout={() => navigation.navigate('Checkout')}
                onExplore={() => navigation.navigate('MainTabs', { screen: 'HomeTab', params: { screen: 'Home' } })}
                vouchers={app?.vouchers || []}
                appliedVoucher={cartCtx?.appliedVoucher || null}
                onVoucherChange={cartCtx?.setAppliedVoucher || (() => { })}
            />
        </ScreenLayout>
    );
}
