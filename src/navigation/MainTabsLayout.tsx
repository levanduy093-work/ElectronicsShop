import React from 'react';
import { View } from 'react-native';
import { useNavigationState, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../components/layout/TopBar';
import { useNotificationsOptional } from '../context';
import { useTheme } from '../theme';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

interface MainTabsLayoutProps {
  navigation: any;
  route: RouteProp<RootStackParamList, 'MainTabs'>;
  cartCount?: number;
  initialAuthMode?: 'login' | 'register';
}

export function MainTabsLayout({
  navigation,
  route,
  cartCount = 0,
  initialAuthMode,
}: MainTabsLayoutProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const notificationsCtx = useNotificationsOptional();

  const activeTab = useNavigationState((state) => {
    const mainTabsRoute = state.routes.find((r) => r.name === 'MainTabs' || r.key === route.key);
    const tabState = (mainTabsRoute as any)?.state;
    const tabIndex = tabState?.index ?? 0;
    const tabName = tabState?.routes?.[tabIndex]?.name;
    return typeof tabName === 'string' ? tabName : 'HomeTab';
  });
  const hasUnread = React.useMemo(
    () => (notificationsCtx?.notifications || []).some(n => !n.read),
    [notificationsCtx?.notifications],
  );

  const showTopBar = activeTab === 'HomeTab' || activeTab === 'CatalogTab' || activeTab === 'CartTab';
  const showSearch = activeTab === 'HomeTab';
  const title = activeTab === 'CartTab' ? t('cart_title') : t('app_name');

  const handleSearch = React.useCallback(() => {
    navigation.navigate('Search', {});
  }, [navigation]);

  const handleNotifications = React.useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TopBar
        title={title}
        showSearch={showSearch}
        onSearchClick={showSearch ? handleSearch : undefined}
        onNotificationClick={handleNotifications}
        hasUnread={hasUnread}
        theme={theme}
        visible={showTopBar}
      />
      <View style={{ flex: 1 }}>
        <TabNavigator cartCount={cartCount} initialAuthMode={initialAuthMode} />
      </View>
    </View>
  );
}
