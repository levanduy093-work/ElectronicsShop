import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { ScreenLayout } from '../components/ScreenLayout';
import { Home as HomeScreen } from '../../screens/Home';

export function HomeTab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const handleNavigate = (screen: string) => {
        if (screen === 'search') {
            navigation.navigate('Search', {});
        } else if (screen === 'notifications') {
            navigation.navigate('Notifications');
        } else if (screen === 'ai') {
            // @ts-ignore
            navigation.navigate('MainTabs', { screen: 'AITab' });
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
                onSelectCategory={(cat: string) => {
                    // @ts-ignore
                    navigation.navigate('MainTabs', {
                        screen: 'CatalogTab',
                        params: { screen: 'Catalog', params: { category: cat } },
                    });
                }}
                onRefreshProducts={app?.loadProducts || (() => Promise.resolve())}
                isLoading={app?.isLoadingProducts || false}
                error={app?.productsError || null}
                isOffline={app?.networkStatus.isConnected === false}
            />
        </ScreenLayout>
    );
}
