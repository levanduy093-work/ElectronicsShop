import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAppOptional } from '../context';
import { useTheme } from '../theme';
import { TabNavigator } from './TabNavigator';

// Lazy load detail screens
const ProductDetailScreen = React.lazy(() =>
    import('../screens/ProductDetail').then(m => ({ default: m.ProductDetail }))
);
const SearchScreenComponent = React.lazy(() =>
    import('../screens/SearchScreen').then(m => ({ default: m.SearchScreen }))
);
const FilterScreenComponent = React.lazy(() =>
    import('../screens/FilterScreen').then(m => ({ default: m.FilterScreen }))
);
const NotificationsScreen = React.lazy(() =>
    import('../screens/Notifications').then(m => ({ default: m.Notifications }))
);
const CheckoutScreen = React.lazy(() =>
    import('../screens/Checkout').then(m => ({ default: m.Checkout }))
);
const OrderDetailScreen = React.lazy(() =>
    import('../screens/OrderDetail').then(m => ({ default: m.OrderDetail }))
);
const AuthScreen = React.lazy(() =>
    import('../screens/Auth').then(m => ({ default: m.Auth }))
);
const SettingsScreen = React.lazy(() =>
    import('../screens/Settings').then(m => ({ default: m.Settings }))
);
const OrderHistoryScreen = React.lazy(() =>
    import('../screens/OrderHistory').then(m => ({ default: m.OrderHistory }))
);
const AddressBookScreen = React.lazy(() =>
    import('../screens/AddressBook').then(m => ({ default: m.AddressBook }))
);
const WishlistScreen = React.lazy(() =>
    import('../screens/Wishlist').then(m => ({ default: m.Wishlist }))
);
const SupportCenterScreen = React.lazy(() =>
    import('../screens/SupportCenter').then(m => ({ default: m.SupportCenter }))
);
const ChangePasswordScreen = React.lazy(() =>
    import('../screens/ChangePassword').then(m => ({ default: m.ChangePassword }))
);
const LanguageSelectionScreen = React.lazy(() =>
    import('../screens/LanguageSelection').then(m => ({ default: m.LanguageSelection }))
);

const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading fallback
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

// ============================================================================
// Screen Wrappers
// ============================================================================

function ProductDetailWrapper({ route }: { route: { params: { productId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
                onNavigateToCart={app?.navigateToCart || (() => { })}
            />
        </Suspense>
    );
}

import { filterProducts } from '../utils/filterUtils';

function SearchWrapper({ route }: { route: { params?: { initialQuery?: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SearchScreenComponent
                onBack={() => navigation.goBack()}
                onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                onFilterClick={() => navigation.navigate('Filter')}
                initialQuery={route.params?.initialQuery || ''}
                onQueryChange={app?.setSearchQuery}
                theme={theme}
                products={app?.products || []}
                userId={app?.userId || undefined}
                isLoggedIn={app?.isLoggedIn || false}
                accessToken={app?.authTokens?.accessToken}
                filters={app?.filters}
            />
        </Suspense>
    );
}

function FilterWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const getFilteredCount = React.useCallback((filters: any) => {
        if (!app?.products) return 0;
        return filterProducts(app.products, app.searchQuery || '', filters).length;
    }, [app?.products, app?.searchQuery]);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <FilterScreenComponent
                onClose={() => navigation.goBack()}
                onApply={(filters) => {
                    app?.setFilters(filters);
                }}
                currentFilters={app?.filters}
                theme={theme}
                categories={app?.availableCategories || []}
                getFilteredCount={getFilteredCount}
            />
        </Suspense>
    );
}

function NotificationsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

function CheckoutWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

function OrderDetailWrapper({ route }: { route: { params: { orderId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const orderId = route.params.orderId;
    const order = app?.orders?.find(o => o.id === orderId);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <OrderDetailScreen
                orderId={orderId}
                order={order}
                onBack={() => navigation.goBack()}
                theme={theme}
                products={app?.products || []}
                onReorder={(product, quantity, selectedOption, selectedClassification) => {
                    app?.addToCart(product, quantity, selectedOption);
                }}
                onNavigateToCart={() => {
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: 'MainTabs',
                                params: { screen: 'CartTab', params: { screen: 'Cart' } },
                            },
                        ],
                    });
                }}
            />
        </Suspense>
    );
}

function AuthWrapper({ route }: { route: { params?: { mode?: 'login' | 'register' } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AuthScreen
                onBack={() => navigation.goBack()}
                onLoginSuccess={(response) => {
                    app?.login(response);
                    navigation.goBack();
                }}
                theme={theme}
                initialMode={route.params?.mode || 'login'}
            />
        </Suspense>
    );
}

function SettingsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SettingsScreen
                onBack={() => navigation.goBack()}
                theme={theme}
                themeMode={app?.themeMode || 'system'}
                onThemeModeChange={app?.setThemeMode || (() => { })}
                onChangePassword={() => navigation.navigate('ChangePassword')}
                onNavigateToLanguage={() => navigation.navigate('LanguageSelection')}
                isPushEnabled={app?.isPushEnabled || false}
                onTogglePush={app?.setIsPushEnabled ? () => app.setIsPushEnabled(!app.isPushEnabled) : undefined}
                onResetOnboarding={() => { }}
            />
        </Suspense>
    );
}

function OrderHistoryWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <OrderHistoryScreen
                onBack={() => navigation.goBack()}
                onViewDetail={(orderId) => navigation.navigate('OrderDetail', { orderId })}
                orders={app?.orders || []}
                theme={theme}
                onRefresh={app?.refreshOrders || (() => Promise.resolve())}
                refreshing={app?.isRefreshingOrders || false}
            />
        </Suspense>
    );
}

function AddressBookWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AddressBookScreen
                onBack={() => navigation.goBack()}
                theme={theme}
                addresses={app?.addresses || []}
                onUpdateAddresses={app?.updateAddresses || (() => { })}
                accessToken={app?.authTokens?.accessToken}
            />
        </Suspense>
    );
}

function WishlistWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <WishlistScreen
                items={app?.wishlist || []}
                onBack={() => navigation.goBack()}
                onRemove={(productId) => app?.toggleFavorite(productId)}
                onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                theme={theme}
            />
        </Suspense>
    );
}

function SupportCenterWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SupportCenterScreen
                onBack={() => navigation.goBack()}
                theme={theme}
            />
        </Suspense>
    );
}

function ChangePasswordWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ChangePasswordScreen
                onBack={() => navigation.goBack()}
                onSuccess={() => navigation.goBack()}
                theme={theme}
                email={app?.userProfile.email}
                accessToken={app?.authTokens?.accessToken}
            />
        </Suspense>
    );
}

function LanguageSelectionWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDarkMode } = useTheme();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <LanguageSelectionScreen
                onBack={() => navigation.goBack()}
                isDarkMode={isDarkMode}
            />
        </Suspense>
    );
}

// ============================================================================
// Main RootStack Navigator
// ============================================================================

interface RootStackProps {
    cartCount?: number;
}

export function RootStack({ cartCount = 0 }: RootStackProps) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="MainTabs">
                {() => <TabNavigator cartCount={cartCount} />}
            </Stack.Screen>
            <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
            <Stack.Screen name="Search" component={SearchWrapper} />
            <Stack.Screen name="Filter" component={FilterWrapper} />
            <Stack.Screen name="Notifications" component={NotificationsWrapper} />
            <Stack.Screen name="Checkout" component={CheckoutWrapper} />
            <Stack.Screen name="OrderDetail" component={OrderDetailWrapper} />
            <Stack.Screen name="Auth" component={AuthWrapper} />
            <Stack.Screen name="Settings" component={SettingsWrapper} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryWrapper} />
            <Stack.Screen name="AddressBook" component={AddressBookWrapper} />
            <Stack.Screen name="Wishlist" component={WishlistWrapper} />
            <Stack.Screen name="SupportCenter" component={SupportCenterWrapper} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordWrapper} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionWrapper} />
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
