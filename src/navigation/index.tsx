import React, { Suspense } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';
import { useTheme } from '../theme';

// Loading fallback for lazy-loaded screens
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

interface AppNavigatorProps {
    cartCount?: number;
}

export function AppNavigator({ cartCount = 0 }: AppNavigatorProps) {
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
                <RootNavigator cartCount={cartCount} />
            </Suspense>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

// Re-export types and navigators
export * from './types';
export { RootNavigator } from './RootNavigator';
export { AnimatedTabBar } from './AnimatedTabBar';
