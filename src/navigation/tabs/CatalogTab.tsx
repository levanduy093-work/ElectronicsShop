import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RootTabParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { filterProducts } from '../../utils/filterUtils';
import { Catalog as CatalogScreen } from '../../screens/Catalog';

export function CatalogTab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootTabParamList, 'CatalogTab'>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    // Derive requested category from navigation params (supports direct or nested shape)
    const initialCategory = React.useMemo(() => {
        const params = route.params as
            | { category?: string; params?: { category?: string } }
            | undefined;

        if (!params) return 'All';
        if (typeof params.category === 'string') return params.category;
        if (typeof params.params?.category === 'string') return params.params.category;
        return 'All';
    }, [route.params]);

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
            <CatalogScreen
                theme={theme}
                products={app?.products || []}
                initialCategory={initialCategory}
                onProductClick={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
                onFilterClick={() => navigation.navigate('Filter')}
                searchQuery={app?.searchQuery || ''}
                onSearchQueryChange={app?.setSearchQuery}
                filters={app?.filters}
                applyFilters={applyFilters}
                isLoading={app?.isLoadingProducts || false}
                onRefresh={app?.loadProducts || (() => Promise.resolve())}
            />
        </ScreenLayout>
    );
}
