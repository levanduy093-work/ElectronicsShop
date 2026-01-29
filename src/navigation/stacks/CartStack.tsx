import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { useTranslation } from 'react-i18next';

// Lazy load screens
const CartScreen = React.lazy(() =>
    import('../../screens/Cart').then(m => ({ default: m.Cart }))
);
const CheckoutScreen = React.lazy(() =>
    import('../../screens/Checkout').then(m => ({ default: m.Checkout }))
);
const ProductDetailScreen = React.lazy(() =>
    import('../../screens/ProductDetail').then(m => ({ default: m.ProductDetail }))
);
const NotificationsScreen = React.lazy(() =>
    import('../../screens/Notifications').then(m => ({ default: m.Notifications }))
);

const Stack = createNativeStackNavigator<CartStackParamList>();

// Loading fallback
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

// Wrapper for Cart screen
function CartWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
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
            onNotificationClick={() => {
                navigation.navigate('Notifications');
            }}
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

// Wrapper for Checkout screen
function CheckoutWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <CheckoutScreen
                onBack={() => navigation.goBack()}
                cartItems={app?.cartItems || []}
                theme={theme}
                onPlaceOrder={app?.placeOrder || (() => Promise.resolve())}
                placingOrder={app?.isPlacingOrder || false}
                onSuccess={(orderId) => {
                    // @ts-ignore
                    navigation.navigate('OrderDetail', { orderId });
                }}
                addresses={app?.addresses || []}
                onAddAddress={() => { }}
                onUpdateAddresses={app?.updateAddresses || (() => { })}
                accessToken={app?.authTokens?.accessToken}
                voucher={app?.appliedVoucher || null}
            />
        </Suspense>
    );
}

// Wrapper for Notifications screen
function NotificationsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <NotificationsScreen
                onBack={() => navigation.goBack()}
                theme={theme}
                notifications={app?.notifications || []}
                onMarkAllRead={app?.markAllNotificationsRead || (() => { })}
                onMarkRead={app?.markNotificationRead || (() => { })}
                refreshing={app?.isRefreshingNotifications || false}
                onRefresh={app?.refreshNotifications || (() => Promise.resolve())}
            />
        </Suspense>
    );
}

// Wrapper for ProductDetail screen
function ProductDetailWrapper({ route }: { route: { params: { productId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const productId = route.params.productId;
    const product = app?.products.find(p => p.id === productId);

    if (!product) {
        return <LoadingFallback />;
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ProductDetailScreen
                product={product}
                onBack={() => navigation.goBack()}
                onAddToCart={app?.addToCart || (() => { })}
                isFavorite={app?.isFavorite(productId) || false}
                onToggleFavorite={() => app?.toggleFavorite(productId)}
                isLoggedIn={app?.isLoggedIn || false}
                onRequireLogin={app?.requireLogin || (() => { })}
                accessToken={app?.authTokens?.accessToken}
                currentUserId={app?.userId || undefined}
                currentUserName={app?.userProfile.name}
                theme={theme}
                relatedProducts={app?.relatedProducts || []}
                onProductClick={(p) => navigation.push('ProductDetail', { productId: p.id })}
                cartItemCount={app?.cartItems.length || 0}
                onNavigateToCart={() => navigation.popToTop()}
            />
        </Suspense>
    );
}



export function CartStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="Cart" component={CartWrapper} />
            <Stack.Screen name="Checkout" component={CheckoutWrapper} />
            <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
            <Stack.Screen name="Notifications" component={NotificationsWrapper} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
