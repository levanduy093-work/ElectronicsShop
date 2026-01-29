import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CatalogStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';

// Lazy load screens
const CatalogScreen = React.lazy(() =>
    import('../../screens/Catalog').then(m => ({ default: m.Catalog }))
);
const ProductDetailScreen = React.lazy(() =>
    import('../../screens/ProductDetail').then(m => ({ default: m.ProductDetail }))
);
const FilterScreenComponent = React.lazy(() =>
    import('../../screens/FilterScreen').then(m => ({ default: m.FilterScreen }))
);
const SearchScreenComponent = React.lazy(() =>
    import('../../screens/SearchScreen').then(m => ({ default: m.SearchScreen }))
);

const Stack = createNativeStackNavigator<CatalogStackParamList>();

// Loading fallback
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

// Wrapper for Catalog screen
function CatalogWrapper({ route }: { route: { params?: { category?: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<CatalogStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const hasUnread = (app?.notifications || []).some(n => !n.read);

    return (
        <ScreenLayout
            showTopBar={true}
            showSearch={false}
            hasUnread={hasUnread}
            onNotificationClick={() => { }}
        >
            <Suspense fallback={<LoadingFallback />}>
                <CatalogScreen
                    theme={theme}
                    products={app?.products || []}
                    initialCategory={route.params?.category || 'All'}
                    onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                    onFilterClick={() => navigation.navigate('Filter')}
                    searchQuery={app?.searchQuery || ''}
                    onSearchQueryChange={app?.setSearchQuery}
                />
            </Suspense>
        </ScreenLayout>
    );
}

// Wrapper for ProductDetail screen
function ProductDetailWrapper({ route }: { route: { params: { productId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<CatalogStackParamList>>();
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

// Wrapper for Filter screen
function FilterWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<CatalogStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <FilterScreenComponent
                onClose={() => navigation.goBack()}
                onApply={(filters) => {
                    app?.setFilters(filters);
                    navigation.goBack();
                }}
                currentFilters={app?.filters}
                theme={theme}
                categories={app?.availableCategories || []}
            />
        </Suspense>
    );
}

// Wrapper for Search screen
function SearchWrapper({ route }: { route: { params?: { initialQuery?: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<CatalogStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SearchScreenComponent
                onBack={() => navigation.goBack()}
                onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                onFilterClick={() => navigation.navigate('Filter')}
                initialQuery={route.params?.initialQuery || ''}
                onQueryChange={() => { }}
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

export function CatalogStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="Catalog" component={CatalogWrapper} />
            <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
            <Stack.Screen name="Filter" component={FilterWrapper} />
            <Stack.Screen name="Search" component={SearchWrapper} />
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
