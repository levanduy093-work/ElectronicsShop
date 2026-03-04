import React, { Suspense } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { RootStack } from './RootStack';
import type { RootStackParamList } from './types';
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
    initialAuthMode?: 'login' | 'register' | null;
}

export function AppNavigator({ cartCount = 0, initialAuthMode = null }: AppNavigatorProps) {
    const { theme } = useTheme();

    const navigationRef = React.useRef(
        createNavigationContainerRef<RootStackParamList>(),
    ).current;

    const handleNavReady = () => {
        if (initialAuthMode && navigationRef.isReady()) {
            navigationRef.navigate('Auth', { mode: initialAuthMode });
        }
    };

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={handleNavReady}
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

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

// Re-export types and navigators
export * from './types';
export { RootStack } from './RootStack';
export { TabNavigator } from './TabNavigator';
export { AnimatedTabBar } from './AnimatedTabBar';
