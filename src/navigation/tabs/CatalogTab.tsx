import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { filterProducts } from '../../utils/filterUtils';

const CatalogScreen = React.lazy(() =>
    import('../../screens/Catalog').then(m => ({ default: m.Catalog }))
);

function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

export function CatalogTab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const hasUnread = (app?.notifications || []).some(n => !n.read);

    const applyFilters = React.useCallback((products: any[]) => {
        return filterProducts(products, app?.searchQuery || '', app?.filters || {});
    }, [app?.filters, app?.searchQuery]);

    return (
        <ScreenLayout
            showTopBar={true}
            showSearch={false}
            hasUnread={hasUnread}
            onNotificationClick={() => navigation.navigate('Notifications')}
        >
            <Suspense fallback={<LoadingFallback />}>
                <CatalogScreen
                    theme={theme}
                    products={app?.products || []}
                    initialCategory={'All'}
                    onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                    onFilterClick={() => navigation.navigate('Filter')}
                    searchQuery={app?.searchQuery || ''}
                    onSearchQueryChange={app?.setSearchQuery}
                    filters={app?.filters}
                    applyFilters={applyFilters}
                    isLoading={app?.isLoadingProducts || false}
                    onRefresh={app?.loadProducts || (() => Promise.resolve())}
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
