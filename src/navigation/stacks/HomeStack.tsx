import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types';
import { useApp, useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';

// Original screen imports
import { Home as HomeScreen } from '../../screens/Home';

// Lazy load other screens
const ProductDetailScreen = React.lazy(() =>
    import('../../screens/ProductDetail').then(m => ({ default: m.ProductDetail }))
);
const SearchScreenComponent = React.lazy(() =>
    import('../../screens/SearchScreen').then(m => ({ default: m.SearchScreen }))
);
const NotificationsScreen = React.lazy(() =>
    import('../../screens/Notifications').then(m => ({ default: m.Notifications }))
);
const OrderDetailScreen = React.lazy(() =>
    import('../../screens/OrderDetail').then(m => ({ default: m.OrderDetail }))
);
const FilterScreenComponent = React.lazy(() =>
    import('../../screens/FilterScreen').then(m => ({ default: m.FilterScreen }))
);

const Stack = createNativeStackNavigator<HomeStackParamList>();

// Loading fallback component
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

// Wrapper component for Home screen
function HomeWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const handleNavigate = (screen: string) => {
        if (screen === 'search') {
            navigation.navigate('Search', {});
        } else if (screen === 'notifications') {
            navigation.navigate('Notifications');
        } else if (screen === 'ai') {
            // @ts-ignore - AITab is a sibling tab in RootNavigator
            navigation.navigate('AITab');
        }
    };

    const handleProductClick = (product: any) => {
        navigation.navigate('ProductDetail', { productId: product.id });
    };

    const hasUnread = (app?.notifications || []).some(n => !n.read);

    return (
        <ScreenLayout
            showTopBar={true}
            showSearch={true}
            hasUnread={hasUnread}
            onSearchClick={() => navigation.navigate('Search', {})}
            onNotificationClick={() => navigation.navigate('Notifications')}
        >
            <HomeScreen
                theme={theme}
                products={app?.products || []}
                banners={app?.banners || []}
                onNavigate={handleNavigate}
                onProductClick={handleProductClick}
                onBannerPress={() => { }}
                onSelectCategory={app?.setFilters ? (cat: string) => { } : () => { }}
                onRefreshProducts={app?.loadProducts || (() => Promise.resolve())}
                isLoading={app?.isLoadingProducts || false}
                error={app?.productsError || null}
                isOffline={app?.networkStatus.isConnected === false}
            />
        </ScreenLayout>
    );
}

// Wrapper component for ProductDetail screen
function ProductDetailWrapper({ route }: { route: { params: { productId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
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

// Wrapper component for Search screen
function SearchWrapper({ route }: { route: { params?: { initialQuery?: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
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

// Wrapper component for Notifications screen
function NotificationsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
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

// Wrapper component for OrderDetail screen
function OrderDetailWrapper({ route }: { route: { params: { orderId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const orderId = route.params.orderId;
    const order = app?.orders.find(o => o.id === orderId);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <OrderDetailScreen
                orderId={orderId}
                onBack={() => navigation.goBack()}
                order={order}
                theme={theme}
                products={app?.products || []}
                onReorder={() => { }}
                onNavigateToCart={app?.navigateToCart || (() => { })}
                onRefreshOrder={() => app?.refreshOrderDetail(orderId)}
                accessToken={app?.authTokens?.accessToken}
            />
        </Suspense>
    );
}

import { filterProducts } from '../../utils/filterUtils';

// Wrapper component for Filter screen
function FilterWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    // Function to count filtered products
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

export function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="Home" component={HomeWrapper} />
            <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
            <Stack.Screen name="Search" component={SearchWrapper} />
            <Stack.Screen name="Filter" component={FilterWrapper} />
            <Stack.Screen name="Notifications" component={NotificationsWrapper} />
            <Stack.Screen name="OrderDetail" component={OrderDetailWrapper} />
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
