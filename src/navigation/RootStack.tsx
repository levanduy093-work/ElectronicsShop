import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAiChatOptional, useAppOptional, useOrdersOptional, useNotificationsOptional, useCartOptional, useSettingsOptional, useThemeModeOptional } from '../context';
import { useTheme } from '../theme';
import { MainTabsLayout } from './MainTabsLayout';

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
import { AIChatHistory as AIChatHistoryScreen } from '../screens/AIChatHistory';
import { filterProducts } from '../utils/filterUtils';
import { getOrderById } from '../services/api';
import { CATEGORIES } from '../constants/data';
import { extractCategoriesFromProducts } from '../utils/product';
import { setCatalogFilters, setFilters, setSearchQuery, useFiltersStore } from '../store/filtersStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================================================
// Screen Wrappers
// ============================================================================

function ProductDetailWrapper({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'ProductDetail'>) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const cartCtx = useCartOptional();
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
            onAddToCart={cartCtx?.addToCart || (() => { })}
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
            cartItemCount={cartCtx?.cartItems.length || 0}
            onNavigateToCart={handleNavigateToCart}
        />
    );
}

function SearchWrapper({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Search'>) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const filters = useFiltersStore((state) => state.filters);

    return (
        <SearchScreenComponent
            onBack={() => navigation.goBack()}
            onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
            onFilterClick={() => navigation.navigate('Filter', { type: 'global' })}
            initialQuery={route.params?.initialQuery || ''}
            onQueryChange={setSearchQuery}
            theme={theme}
            products={app?.products || []}
            userId={app?.userId || undefined}
            isLoggedIn={app?.isLoggedIn || false}
            accessToken={app?.authTokens?.accessToken}
            filters={filters}
        />
    );
}

function FilterWrapper({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Filter'>) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const isCatalog = route.params?.type === 'catalog';
    const searchQuery = useFiltersStore((state) => state.searchQuery);
    const catalogSearchQuery = useFiltersStore((state) => state.catalogSearchQuery);
    const filters = useFiltersStore((state) => state.filters);
    const catalogFilters = useFiltersStore((state) => state.catalogFilters);

    const categories = React.useMemo(() => {
        const base = (CATEGORIES.length ? CATEGORIES : extractCategoriesFromProducts(app?.products || [])).map(c => c.name);
        return Array.from(new Set(base.filter(Boolean)));
    }, [app?.products]);

    const getFilteredCount = React.useCallback((filters: any) => {
        if (!app?.products) return 0;
        const query = isCatalog ? catalogSearchQuery : searchQuery;
        return filterProducts(app.products, query || '', filters).length;
    }, [app?.products, catalogSearchQuery, searchQuery, isCatalog]);

    return (
        <FilterScreenComponent
            onClose={() => navigation.goBack()}
            onApply={(filters) => {
                if (isCatalog) {
                    setCatalogFilters(filters);
                } else {
                    setFilters(filters);
                }
            }}
            currentFilters={isCatalog ? catalogFilters : filters}
            theme={theme}
            categories={categories}
            getFilteredCount={getFilteredCount}
        />
    );
}

function NotificationsWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Notifications'>) {
    const { theme } = useTheme();
    const notificationsCtx = useNotificationsOptional();

    useFocusEffect(
        React.useCallback(() => {
            notificationsCtx?.setNotificationsActive?.(true);
            return () => {
                notificationsCtx?.setNotificationsActive?.(false);
            };
        }, [notificationsCtx])
    );

    return (
        <NotificationsScreen
            onBack={() => navigation.goBack()}
            theme={theme}
            notifications={notificationsCtx?.notifications || []}
            onMarkAllRead={notificationsCtx?.markAllNotificationsRead || (() => { })}
            onMarkRead={notificationsCtx?.markNotificationRead || (() => { })}
            refreshing={notificationsCtx?.isRefreshingNotifications || false}
            onRefresh={notificationsCtx?.refreshNotifications || (() => Promise.resolve())}
        />
    );
}

function AIChatHistoryWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'AIChatHistory'>) {
    const { theme } = useTheme();
    const aiChatCtx = useAiChatOptional();

    return (
        <AIChatHistoryScreen
            theme={theme}
            archives={aiChatCtx?.aiChatArchives || []}
            onBack={() => navigation.goBack()}
            onOpenArchive={(archiveId) => {
                aiChatCtx?.openAiChatArchive?.(archiveId);
                navigation.goBack();
            }}
            onDeleteArchive={(archiveId) => aiChatCtx?.deleteAiChatArchive?.(archiveId)}
            onClearAll={() => aiChatCtx?.clearAiChatArchives?.()}
        />
    );
}

function CheckoutWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const ordersCtx = useOrdersOptional();
    const cartCtx = useCartOptional();

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
            cartItems={cartCtx?.cartItems || []}
            theme={theme}
            onPlaceOrder={ordersCtx?.placeOrder || (() => Promise.resolve())}
            placingOrder={ordersCtx?.isPlacingOrder || false}
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
            voucher={cartCtx?.appliedVoucher || null}
            onCheckPaymentStatus={handleCheckPaymentStatus}
        />
    );
}

function OrderDetailWrapper({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'OrderDetail'>) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const ordersCtx = useOrdersOptional();
    const cartCtx = useCartOptional();

    const orderId = route.params.orderId;
    const order = ordersCtx?.orders?.find(o => o.id === orderId);

    useEffect(() => {
        ordersCtx?.setSelectedOrderId?.(orderId);
        return () => {
            ordersCtx?.setSelectedOrderId?.(null);
        };
    }, [ordersCtx, orderId]);

    return (
        <OrderDetailScreen
            orderId={orderId}
            order={order}
            onBack={() => navigation.goBack()}
            theme={theme}
            products={app?.products || []}
            onProductPress={(productId) => navigation.navigate('ProductDetail', { productId })}
            onReorder={(product, quantity, selectedOption, selectedClassification) => {
                cartCtx?.addToCart(product, quantity, selectedOption, selectedClassification);
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

function AuthWrapper({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Auth'>) {
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

function AdminAddProductWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'AdminAddProduct'>) {
    const app = useAppOptional();

    return (
        <AdminAddProductScreen
            onBack={() => navigation.goBack()}
            onCreate={(payload) => app?.createProduct ? app.createProduct(payload) : Promise.reject(new Error('Not available'))}
            isAdmin={app?.isAdmin || false}
        />
    );
}

function SettingsWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) {
    const { theme } = useTheme();
    const themeModeCtx = useThemeModeOptional();
    const settingsCtx = useSettingsOptional();
    return (
        <SettingsScreen
            onBack={() => navigation.goBack()}
            theme={theme}
            themeMode={themeModeCtx?.themeMode || 'system'}
            onThemeModeChange={themeModeCtx?.setThemeMode || (() => { })}
            onChangePassword={() => navigation.navigate('ChangePassword')}
            onNavigateToLanguage={() => navigation.navigate('LanguageSelection')}
            isPushEnabled={settingsCtx?.isPushEnabled || false}
            onTogglePush={settingsCtx?.setIsPushEnabled ? () => settingsCtx.setIsPushEnabled(!settingsCtx.isPushEnabled) : undefined}
            onBiometricChange={settingsCtx?.setIsBiometricEnabled}
        />
    );
}

function OrderHistoryWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'OrderHistory'>) {
    const { theme } = useTheme();
    const ordersCtx = useOrdersOptional();

    useFocusEffect(
        React.useCallback(() => {
            ordersCtx?.setOrdersActive?.(true);
            return () => {
                ordersCtx?.setOrdersActive?.(false);
            };
        }, [ordersCtx])
    );

    return (
        <OrderHistoryScreen
            onBack={() => navigation.goBack()}
            onViewDetail={(orderId) => navigation.navigate('OrderDetail', { orderId })}
            orders={ordersCtx?.orders || []}
            theme={theme}
            onRefresh={ordersCtx?.refreshOrders || (() => Promise.resolve())}
            refreshing={ordersCtx?.isRefreshingOrders || false}
        />
    );
}

function AddressBookWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddressBook'>) {
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

function WishlistWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Wishlist'>) {
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

function SupportCenterWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'SupportCenter'>) {
    const { theme } = useTheme();

    return (
        <SupportCenterScreen
            onBack={() => navigation.goBack()}
            theme={theme}
        />
    );
}

function ChangePasswordWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'ChangePassword'>) {
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

function LanguageSelectionWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'LanguageSelection'>) {
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
                {(props) => (
                    <MainTabsLayout
                        {...props}
                        cartCount={cartCount}
                        initialAuthMode={initialAuthMode}
                    />
                )}
            </Stack.Screen>
            <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
            <Stack.Screen name="Search" component={SearchWrapper} />
            <Stack.Screen name="Filter" component={FilterWrapper} />
            <Stack.Screen name="Notifications" component={NotificationsWrapper} />
            <Stack.Screen name="AIChatHistory" component={AIChatHistoryWrapper} />
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
