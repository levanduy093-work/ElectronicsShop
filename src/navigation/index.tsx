import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootStack } from './RootStack';
import { useTheme } from '../theme';

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

    return (
        <NavigationContainer
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
                <RootStack cartCount={cartCount} initialAuthMode={initialAuthMode || undefined} />
            </Suspense>
        </NavigationContainer>
    );
}

export * from './types';
export { RootStack } from './RootStack';
export { TabNavigator } from './TabNavigator';
export { AnimatedTabBar } from './AnimatedTabBar';
