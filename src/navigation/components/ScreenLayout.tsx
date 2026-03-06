import React from 'react';
import { View } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { useTheme } from '../../theme';
import { useTranslation } from 'react-i18next';

interface ScreenLayoutProps {
    children: React.ReactNode;
    showTopBar?: boolean;
    title?: string;
    showSearch?: boolean;
    showFilter?: boolean;
    hasUnread?: boolean;
    onSearchClick?: () => void;
    onFilterClick?: () => void;
    onNotificationClick?: () => void;
}

export function ScreenLayout({
    children,
    showTopBar = true,
    title,
    showSearch = false,
    showFilter = false,
    hasUnread = false,
    onSearchClick,
    onFilterClick,
    onNotificationClick,
}: ScreenLayoutProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <TopBar
                title={title || t('app_name')}
                showSearch={showSearch}
                onSearchClick={onSearchClick}
                onFilterClick={showFilter ? onFilterClick : undefined}
                onNotificationClick={onNotificationClick}
                hasUnread={hasUnread}
                theme={theme}
                visible={showTopBar}
            />
            <View className="flex-1">
                {children}
            </View>
        </View>
    );
}
