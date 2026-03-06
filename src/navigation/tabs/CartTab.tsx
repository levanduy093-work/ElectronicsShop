import React from 'react';
import { useAppOptional, useCartOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { Cart as CartScreen } from '../../screens/Cart';

export function CartTab({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const cartCtx = useCartOptional();

    return (
        <ScreenLayout
            showTopBar={false}
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
