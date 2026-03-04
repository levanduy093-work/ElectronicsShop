import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAppOptional } from '../context';
import { useTheme } from '../theme';
import { TabNavigator } from './TabNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/common/ToastProvider';

// Direct imports
import { ProductDetail as ProductDetailScreen } from '../screens/ProductDetail';
import { SearchScreen as SearchScreenComponent } from '../screens/SearchScreen';
import { FilterScreen as FilterScreenComponent } from '../screens/FilterScreen';
import { Notifications as NotificationsScreen } from '../screens/Notifications';
import { Checkout as CheckoutScreen } from '../screens/Checkout';
import { OrderDetail as OrderDetailScreen } from '../screens/OrderDetail';
import { Auth as AuthScreen } from '../screens/Auth';
import { Settings as SettingsScreen } from '../screens/Settings';
import { OrderHistory as OrderHistoryScreen } from '../screens/OrderHistory';
import { AddressBook as AddressBookScreen } from '../screens/AddressBook';
import { Wishlist as WishlistScreen } from '../screens/Wishlist';
import { SupportCenter as SupportCenterScreen } from '../screens/SupportCenter';
import { ChangePassword as ChangePasswordScreen } from '../screens/ChangePassword';
import { LanguageSelection as LanguageSelectionScreen } from '../screens/LanguageSelection';
import { AdminAddProduct as AdminAddProductScreen } from '../screens/AdminAddProduct';
import { filterProducts } from '../utils/filterUtils';
import { getOrderById } from '../services/api';
import { useProductsQuery } from '../hooks/useCatalogQueries';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================================================
// Screen Wrappers
// ============================================================================

function ProductDetailWrapper({ route }: { route: { params: { productId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();
    const handleNavigateToCart = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'MainTabs',
                    params: { screen: 'CartTab', params: { screen: 'Cart' } },
                },
            ],
        });
    };

    const productId = route.params.productId;
    const product = app?.products.find(p => p.id === productId);

    return (
        <ProductDetailScreen
            productId={productId}
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
            onNavigateToCart={handleNavigateToCart}
        />
    );
}

function SearchWrapper({ route }: { route: { params?: { initialQuery?: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();
    const productsQuery = useProductsQuery(app?.products);

    return (
        <SearchScreenComponent
            onBack={() => navigation.goBack()}
            onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
            onFilterClick={() => navigation.navigate('Filter', { type: 'global' })}
            initialQuery={route.params?.initialQuery || ''}
            onQueryChange={app?.setSearchQuery}
            theme={theme}
            products={productsQuery.data || []}
            userId={app?.userId || undefined}
            isLoggedIn={app?.isLoggedIn || false}
            accessToken={app?.authTokens?.accessToken}
            filters={app?.filters}
        />
    );
}

function FilterWrapper({ route }: { route: { params: { type?: 'global' | 'catalog' } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();
    const isCatalog = route.params?.type === 'catalog';

    const getFilteredCount = React.useCallback((filters: any) => {
        if (!app?.products) return 0;
        const query = isCatalog ? app.catalogSearchQuery : app.searchQuery;
        return filterProducts(app.products, query || '', filters).length;
    }, [app?.products, app?.searchQuery, app?.catalogSearchQuery, isCatalog]);

    return (
        <FilterScreenComponent
            onClose={() => navigation.goBack()}
            onApply={(filters) => {
                if (isCatalog) {
                    app?.setCatalogFilters(filters);
                } else {
                    app?.setFilters(filters);
                }
            }}
            currentFilters={isCatalog ? app?.catalogFilters : app?.filters}
            theme={theme}
            categories={app?.availableCategories || []}
            getFilteredCount={getFilteredCount}
        />
    );
}

function NotificationsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <NotificationsScreen
            onBack={() => navigation.goBack()}
            theme={theme}
            notifications={app?.notifications || []}
            onMarkAllRead={app?.markAllNotificationsRead || (() => { })}
            onMarkRead={app?.markNotificationRead || (() => { })}
            refreshing={app?.isRefreshingNotifications || false}
            onRefresh={app?.refreshNotifications || (() => Promise.resolve())}
        />
    );
}

function CheckoutWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const handleCheckPaymentStatus = React.useCallback(async (orderId: string) => {
        const token = app?.authTokens?.accessToken;
        const isMongoId = typeof orderId === 'string' && orderId.length === 24;
        if (!token || !orderId || !isMongoId) return undefined;
        try {
            const order = await getOrderById(orderId, token);
            const status = (order.paymentStatus || '').toLowerCase();
            if (status === 'paid') return 'paid';
            if (status === 'failed' || order.isCancelled) return 'failed';
            return 'pending';
        } catch (error) {
            console.warn('CheckoutWrapper - check payment failed', error);
            return undefined;
        }
    }, [app?.authTokens?.accessToken]);

    return (
        <CheckoutScreen
            onBack={() => navigation.goBack()}
            cartItems={app?.cartItems || []}
            theme={theme}
            onPlaceOrder={app?.placeOrder || (() => Promise.resolve())}
            placingOrder={app?.isPlacingOrder || false}
            onSuccess={() => {
                // After successful checkout, return user to Home tab (matches button label)
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'MainTabs',
                            params: { screen: 'HomeTab', params: { screen: 'Home' } },
                        },
                    ],
                });
            }}
            addresses={app?.addresses || []}
            onAddAddress={undefined}
            onUpdateAddresses={app?.updateAddresses || (() => { })}
            accessToken={app?.authTokens?.accessToken}
            voucher={app?.appliedVoucher || null}
            onCheckPaymentStatus={handleCheckPaymentStatus}
        />
    );
}

function OrderDetailWrapper({ route }: { route: { params: { orderId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const orderId = route.params.orderId;
    const order = app?.orders?.find(o => o.id === orderId);

    useEffect(() => {
        app?.setSelectedOrderId?.(orderId);
        return () => {
            app?.setSelectedOrderId?.(null);
        };
    }, [app, orderId]);

    return (
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
    );
}

function AuthWrapper({ route }: { route: { params?: { mode?: 'login' | 'register' } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const goToMainTabs = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'MainTabs',
                    params: { screen: 'HomeTab', params: { screen: 'Home' } },
                },
            ],
        });
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            goToMainTabs();
        }
    };

    return (
        <AuthScreen
            onBack={handleBack}
            onLoginSuccess={(response) => {
                app?.login(response);
                goToMainTabs();
            }}
            theme={theme}
            initialMode={route.params?.mode || 'login'}
        />
    );
}

function AdminAddProductWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <AdminAddProductScreen
            onBack={() => navigation.goBack()}
            onCreate={(payload) => app?.createProduct ? app.createProduct(payload) : Promise.reject(new Error('Not available'))}
            isAdmin={app?.isAdmin || false}
        />
    );
}

function SettingsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();
    return (
        <SettingsScreen
            onBack={() => navigation.goBack()}
            theme={theme}
            themeMode={app?.themeMode || 'system'}
            onThemeModeChange={app?.setThemeMode || (() => { })}
            onChangePassword={() => navigation.navigate('ChangePassword')}
            onNavigateToLanguage={() => navigation.navigate('LanguageSelection')}
            isPushEnabled={app?.isPushEnabled || false}
            onTogglePush={app?.setIsPushEnabled ? () => app.setIsPushEnabled(!app.isPushEnabled) : undefined}
            onBiometricChange={app?.setIsBiometricEnabled}
        />
    );
}

function OrderHistoryWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <OrderHistoryScreen
            onBack={() => navigation.goBack()}
            onViewDetail={(orderId) => navigation.navigate('OrderDetail', { orderId })}
            orders={app?.orders || []}
            theme={theme}
            onRefresh={app?.refreshOrders || (() => Promise.resolve())}
            refreshing={app?.isRefreshingOrders || false}
        />
    );
}

function AddressBookWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <AddressBookScreen
            onBack={() => navigation.goBack()}
            theme={theme}
            addresses={app?.addresses || []}
            onUpdateAddresses={app?.updateAddresses || (() => { })}
            accessToken={app?.authTokens?.accessToken}
        />
    );
}

function WishlistWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <WishlistScreen
            items={app?.wishlist || []}
            onBack={() => navigation.goBack()}
            onRemove={(productId) => app?.toggleFavorite(productId)}
            onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
            theme={theme}
        />
    );
}

function SupportCenterWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();

    return (
        <SupportCenterScreen
            onBack={() => navigation.goBack()}
            theme={theme}
        />
    );
}

function ChangePasswordWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <ChangePasswordScreen
            onBack={() => navigation.goBack()}
            onSuccess={() => navigation.goBack()}
            theme={theme}
            email={app?.userProfile.email}
            accessToken={app?.authTokens?.accessToken}
        />
    );
}

function LanguageSelectionWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDarkMode } = useTheme();

    return (
        <LanguageSelectionScreen
            onBack={() => navigation.goBack()}
            isDarkMode={isDarkMode}
        />
    );
}

// ============================================================================
// Main RootStack Navigator
// ============================================================================

interface RootStackProps {
    cartCount?: number;
    initialAuthMode?: 'login' | 'register';
}

export function RootStack({ cartCount = 0, initialAuthMode }: RootStackProps) {
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
            <Stack.Screen name="AdminAddProduct" component={AdminAddProductWrapper} />
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
