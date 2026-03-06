import React from 'react';
import { useAppOptional, useNotificationsOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { Home as HomeScreen } from '../../screens/Home';

export const HomeTab = React.memo(function HomeTab({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const notificationsCtx = useNotificationsOptional();

    const handleNavigate = React.useCallback((screen: string) => {
        if (screen === 'search') {
            navigation.navigate('Search', {});
        } else if (screen === 'notifications') {
            navigation.navigate('Notifications');
        } else if (screen === 'ai') {
            // @ts-ignore
            navigation.navigate('MainTabs', { screen: 'AITab' });
        } else if (screen === 'catalog') {
            // Jump to Catalog tab without a specific category (used by See All)
            // @ts-ignore
            navigation.navigate('MainTabs', { screen: 'CatalogTab' });
        }
    }, [navigation]);

    const handleProductClick = React.useCallback((product: any) => {
        navigation.navigate('ProductDetail', { productId: product.id });
    }, [navigation]);

    const handleSelectCategory = React.useCallback((cat: string) => {
        // @ts-ignore
        navigation.navigate('MainTabs', {
            screen: 'CatalogTab',
            params: { screen: 'Catalog', params: { category: cat } },
        });
    }, [navigation]);

    const handleRefreshProducts = React.useCallback(() => {
        return app?.loadProducts?.();
    }, [app?.loadProducts]);

    const hasUnread = React.useMemo(
        () => (notificationsCtx?.notifications || []).some(n => !n.read),
        [notificationsCtx?.notifications],
    );

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
                onSelectCategory={handleSelectCategory}
                onRefreshProducts={handleRefreshProducts}
                isLoading={app?.isLoadingProducts || false}
                error={app?.productsError || null}
                isOffline={app?.networkStatus.isConnected === false}
            />
        </ScreenLayout>
    );
});
