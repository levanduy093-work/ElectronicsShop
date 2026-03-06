import React from 'react';
import { useAppOptional, useNotificationsOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { Home as HomeScreen } from '../../screens/Home';

export function HomeTab({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const notificationsCtx = useNotificationsOptional();

    const handleNavigate = (screen: string) => {
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
    };

    const handleProductClick = (product: any) => {
        navigation.navigate('ProductDetail', { productId: product.id });
    };

    const hasUnread = (notificationsCtx?.notifications || []).some(n => !n.read);

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
                onSelectCategory={(cat: string) => {
                    // @ts-ignore
                    navigation.navigate('MainTabs', {
                        screen: 'CatalogTab',
                        params: { screen: 'Catalog', params: { category: cat } },
                    });
                }}
                onRefreshProducts={() => app?.loadProducts?.()}
                isLoading={app?.isLoadingProducts || false}
                error={app?.productsError || null}
                isOffline={app?.networkStatus.isConnected === false}
            />
        </ScreenLayout>
    );
}
