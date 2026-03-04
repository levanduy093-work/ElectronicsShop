/**
 * ElectronicsShop App - Refactored with React Navigation
 * Uses React Navigation for tab and stack navigation
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppStateProvider, useAppOptional } from './src/context';
import { AppNavigator } from './src/navigation';
import { darkTheme, lightTheme, ThemeProvider } from './src/theme';
import { useToast, ToastProvider } from './src/components/common/ToastProvider';
import { useNetworkStatus } from './src/utils/network';
import { OfflineBanner } from './src/components/common/OfflineBanner';
import { Onboarding } from './src/screens/Onboarding';

import {
    subscribeForegroundMessage,
} from './src/services/fcm';

import './src/i18n';

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || '955785161802-0b76g7963jiri4qda56d16n265k7ll40.apps.googleusercontent.com',
    iosClientId: '955785161802-6ncbjojfahbmro02fj5u352qd2vu2u2r.apps.googleusercontent.com',
    offlineAccess: true,
});

const ONBOARDING_STORAGE_KEY = 'electronicsshop/onboarding_seen';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
    },
});

// Foreground notification handler component
const ForegroundNotificationHandler = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        const unsubscribe = subscribeForegroundMessage(({ title, body }) => {
            const text = title && body ? `${title}: ${body}` : title || body || t('notification_new');
            showToast(text, 'info', 3500);
        });
        return () => unsubscribe?.();
    }, [showToast, t]);

    return null;
};

// Main App content with navigation (uses themeMode từ AppStateProvider)
function AppContent() {
    const { t } = useTranslation();
    const systemColorScheme = useColorScheme();
    const systemDarkMode = systemColorScheme === 'dark';
    const app = useAppOptional();
    const themeMode: 'light' | 'dark' | 'system' = app?.themeMode || 'system';
    const isDarkMode = themeMode === 'system' ? systemDarkMode : themeMode === 'dark';
    const theme = isDarkMode ? darkTheme : lightTheme;
    const networkStatus = useNetworkStatus();

    // Onboarding state
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register' | null>(null);
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

    // Load initial onboarding state
    useEffect(() => {
        const init = async () => {
            try {
                const seen = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
                setHasSeenOnboarding(seen === 'true');
            } catch (e) {
                console.warn('Failed to check onboarding', e);
            } finally {
                setIsCheckingOnboarding(false);
            }
        };
        init();
    }, []);

    // Handle onboarding complete (go straight to home, không mở màn auth)
    const handleOnboardingCompleteToHome = useCallback(async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        } catch (error) {
            console.warn('Failed to persist onboarding state', error);
        } finally {
            setHasSeenOnboarding(true);
            setInitialAuthMode(null);
        }
    }, []);

    // Handle onboarding complete rồi mở màn Auth với mode tương ứng
    const handleOnboardingGoToAuth = useCallback(
        async (mode: 'login' | 'register') => {
            try {
                await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
            } catch (error) {
                console.warn('Failed to persist onboarding state', error);
            } finally {
                setInitialAuthMode(mode);
                setHasSeenOnboarding(true);
            }
        },
        [],
    );

    // Show loading while checking onboarding
    if (isCheckingOnboarding) {
        return (
            <ThemeProvider value={{ theme, isDarkMode }}>
                <View style={[styles.container, { backgroundColor: theme.background }]} />
            </ThemeProvider>
        );
    }

    // Show onboarding if not seen and user is not logged in
    if (!hasSeenOnboarding && !app?.isLoggedIn) {
        return (
            <ThemeProvider value={{ theme, isDarkMode }}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.surface}
                    translucent={true}
                />
                <Onboarding
                    onDone={handleOnboardingCompleteToHome}
                    onSkipToAuth={() => handleOnboardingGoToAuth('login')}
                    onSkipToHome={handleOnboardingCompleteToHome}
                    onSignUp={() => handleOnboardingGoToAuth('register')}
                />
            </ThemeProvider>
        );
    }

    // Main app with navigation
    return (
        <ThemeProvider value={{ theme, isDarkMode }}>
            <ForegroundNotificationHandler />
            <OfflineBanner
                visible={networkStatus.isConnected === false || networkStatus.isInternetReachable === false}
                isInternetReachable={networkStatus.isInternetReachable}
            />
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.surface}
                translucent={true}
            />
            <AppNavigator initialAuthMode={initialAuthMode} />
        </ThemeProvider>
    );
}

// Root App component with providers
function App(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={styles.container}>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <AppStateProvider>
                        <AppContent />
                    </AppStateProvider>
                </ToastProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
