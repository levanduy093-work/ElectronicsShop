/**
 * ElectronicsShop App - Refactored with React Navigation
 * Uses React Navigation for tab and stack navigation
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import { AppStateProvider } from './src/context';
import { AppNavigator } from './src/navigation';
import { darkTheme, lightTheme, ThemeProvider } from './src/theme';
import { useToast, ToastProvider } from './src/components/common/ToastProvider';
import { useNetworkStatus } from './src/utils/network';
import { OfflineBanner } from './src/components/common/OfflineBanner';
import { BiometricLockScreen } from './src/components/auth/BiometricLockScreen';
import { isBiometricLockEnabled } from './src/services/BiometricService';
import { Onboarding } from './src/screens/Onboarding';

import {
    subscribeForegroundMessage,
} from './src/services/fcm';

import './src/i18n';

const ONBOARDING_STORAGE_KEY = 'electronicsshop/onboarding_seen';
const THEME_MODE_STORAGE_KEY = 'electronicsshop/theme_mode';

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

// Main App content with navigation
function AppContent() {
    const { t } = useTranslation();
    const systemColorScheme = useColorScheme();
    const systemDarkMode = systemColorScheme === 'dark';
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
    const isDarkMode = themeMode === 'system' ? systemDarkMode : themeMode === 'dark';
    const theme = isDarkMode ? darkTheme : lightTheme;
    const networkStatus = useNetworkStatus();

    // Biometric lock state
    const [isAppLocked, setIsAppLocked] = useState(false);
    const isBiometricEnabledRef = React.useRef(false);
    const pendingUnlockRef = React.useRef(false);

    // Onboarding state
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

    // Load initial state
    useEffect(() => {
        const init = async () => {
            // Load theme mode
            try {
                const stored = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
                if (stored) {
                    setThemeMode(stored as 'light' | 'dark' | 'system');
                }
            } catch (e) {
                console.warn('Failed to load theme mode', e);
            }

            // Check onboarding
            try {
                const seen = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
                setHasSeenOnboarding(seen === 'true');
            } catch (e) {
                console.warn('Failed to check onboarding', e);
            } finally {
                setIsCheckingOnboarding(false);
            }

            // Check biometric setting
            const enabled = await isBiometricLockEnabled();
            isBiometricEnabledRef.current = enabled;
            if (enabled) {
                setIsAppLocked(true);
            }
        };
        init();

        // Handle app state changes for biometric lock
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            // Lock immediately when app becomes inactive (iOS swipe up) or background (Android/iOS)
            // Use ref synchronously to avoid async delay during state transition
            if (nextAppState === 'inactive' || nextAppState === 'background') {
                if (isBiometricEnabledRef.current) {
                    setIsAppLocked(true);
                    // If we were about to unlock but user swiped away, cancel the unlock
                    pendingUnlockRef.current = false;
                }
            } else if (nextAppState === 'active') {
                // If we had a successful auth while inactive (iOS FaceID), finally unlock now
                if (pendingUnlockRef.current) {
                    setIsAppLocked(false);
                    pendingUnlockRef.current = false;
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Defensive: Check if we are already inactive/background on mount
        // Important for cases where app is launched or resumed into background
        if (AppState.currentState !== 'active' && isBiometricEnabledRef.current) {
            setIsAppLocked(true);
        }

        return () => subscription.remove();
    }, []);

    return () => subscription.remove();
}, []);

// Handle onboarding complete
const handleOnboardingComplete = useCallback(async () => {
    try {
        await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
        console.warn('Failed to persist onboarding state', error);
    } finally {
        <ThemeProvider value={{ theme, isDarkMode }}>
            <View style={[styles.container, { backgroundColor: theme.background }]} />
        </ThemeProvider>
    );
}

// Show onboarding if not seen
if (!hasSeenOnboarding) {
    return (
        <ThemeProvider value={{ theme, isDarkMode }}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.surface}
                translucent={true}
            />
            <Onboarding
                onDone={handleOnboardingComplete}
                onSkipToAuth={handleOnboardingComplete}
                onSkipToHome={handleOnboardingComplete}
                onSignUp={handleOnboardingComplete}
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
        <AppStateProvider>
            <AppNavigator />
        </AppStateProvider>
    </ThemeProvider>
);
}

// Root App component with providers
function App(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={styles.container}>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
