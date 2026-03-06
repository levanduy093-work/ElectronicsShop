import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { RootStack } from './RootStack';
import { useTheme } from '../theme';
import type { RootStackParamList } from './types';
import { APP_LINK_DOMAIN as ENV_APP_LINK_DOMAIN, APP_LINK_SCHEME as ENV_APP_LINK_SCHEME } from '@env';
import { sanitizeAppLinkDomain, sanitizeAppLinkScheme } from '../utils/appLinks';
import { AiChatStateProvider } from '../context';

function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

interface AppNavigatorProps {
    cartCount?: number;
    initialAuthMode?: 'login' | 'register' | null;
}

export function AppNavigator({ cartCount = 0, initialAuthMode = null }: AppNavigatorProps) {
    const { theme } = useTheme();
    const appLinkDomain = sanitizeAppLinkDomain(ENV_APP_LINK_DOMAIN);
    const appLinkScheme = sanitizeAppLinkScheme(ENV_APP_LINK_SCHEME);

    const prefixes = [`${appLinkScheme}://`];
    if (appLinkDomain) {
        prefixes.push(`https://${appLinkDomain}`);
        prefixes.push(`https://www.${appLinkDomain}`);
    }

    const linking: LinkingOptions<RootStackParamList> = {
        prefixes,
        config: {
            screens: {
                ProductDetail: 'product/:productId',
            },
        },
    };

    return (
        <NavigationContainer
            linking={linking}
            theme={{
                dark: theme.isDark,
                colors: {
                    primary: theme.primary,
                    background: theme.background,
                    card: theme.surface,
                    text: theme.text,
                    border: theme.border,
                    notification: theme.error,
                },
                fonts: {
                    regular: {
                        fontFamily: 'System',
                        fontWeight: '400',
                    },
                    medium: {
                        fontFamily: 'System',
                        fontWeight: '500',
                    },
                    bold: {
                        fontFamily: 'System',
                        fontWeight: '700',
                    },
                    heavy: {
                        fontFamily: 'System',
                        fontWeight: '800',
                    },
                },
            }}
        >
            <Suspense fallback={<LoadingFallback />}>
                <AiChatStateProvider>
                    <RootStack cartCount={cartCount} initialAuthMode={initialAuthMode || undefined} />
                </AiChatStateProvider>
            </Suspense>
        </NavigationContainer>
    );
}

export * from './types';
export { RootStack } from './RootStack';
export { TabNavigator } from './TabNavigator';
export { AnimatedTabBar } from './AnimatedTabBar';
