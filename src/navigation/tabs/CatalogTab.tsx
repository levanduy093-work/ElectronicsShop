import React from 'react';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { filterProducts } from '../../utils/filterUtils';
import { Catalog as CatalogScreen } from '../../screens/Catalog';
import { setCatalogSearchQuery, useFiltersStore } from '../../store/filtersStore';

export const CatalogTab = React.memo(function CatalogTab({ navigation, route }: { navigation: any; route: any }) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const catalogFilters = useFiltersStore((state) => state.catalogFilters);
    const catalogSearchQuery = useFiltersStore((state) => state.catalogSearchQuery);

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

    const handleProductClick = React.useCallback((p: any) => {
        navigation.navigate('ProductDetail', { productId: p.id });
    }, [navigation]);

    const handleFilterClick = React.useCallback(() => {
        navigation.navigate('Filter', { type: 'catalog' });
    }, [navigation]);

    const handleRefresh = React.useCallback(() => {
        return app?.loadProducts?.();
    }, [app?.loadProducts]);

    const applyFilters = React.useCallback((products: any[]) => {
        return filterProducts(products, catalogSearchQuery || '', catalogFilters || {});
    }, [catalogFilters, catalogSearchQuery]);

    return (
        <ScreenLayout
            showTopBar={false}
        >
            <CatalogScreen
                theme={theme}
                products={app?.products || []}
                initialCategory={initialCategory}
                onProductClick={handleProductClick}
                onFilterClick={handleFilterClick}
                searchQuery={catalogSearchQuery || ''}
                onSearchQueryChange={setCatalogSearchQuery}
                filters={catalogFilters}
                applyFilters={applyFilters}
                isLoading={app?.isLoadingProducts || false}
                onRefresh={handleRefresh}
            />
        </ScreenLayout>
    );
});
