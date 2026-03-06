import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SettingsProvider, type SettingsContextValue } from './SettingsContext';
import { useAppOptional } from './AppContext';
import {
    requestUserPermission,
    getFcmToken,
    subscribeToFcmTokenRefresh,
} from '../services/fcm';
import { isBiometricLockEnabled, setBiometricEnabled as apiSetBiometricEnabled } from '../services/BiometricService';
import { BiometricLockScreen } from '../components/auth/BiometricLockScreen';

const PUSH_SETTINGS_KEY = 'electronicsshop/push_settings';

interface SettingsStateProviderProps {
    children: React.ReactNode;
}

export function SettingsStateProvider({ children }: SettingsStateProviderProps) {
    const app = useAppOptional();

    const [isPushEnabled, setIsPushEnabledState] = useState(true);
    const [isBiometricEnabled, setIsBiometricEnabledState] = useState(false);
    const [isAppLocked, setIsAppLocked] = useState(false);

    const accessTokenRef = useRef<string | null>(app?.authTokens?.accessToken || null);
    const fcmRefreshUnsubRef = useRef<(() => void) | null>(null);
    const hasRegisteredFcmRef = useRef(false);
    const isBiometricEnabledRef = useRef(false);
    const pendingUnlockRef = useRef(false);

    useEffect(() => {
        accessTokenRef.current = app?.authTokens?.accessToken || null;
    }, [app?.authTokens?.accessToken]);

    const setIsPushEnabled = useCallback((enabled: boolean) => {
        setIsPushEnabledState(enabled);
        AsyncStorage.setItem(PUSH_SETTINGS_KEY, JSON.stringify(enabled)).catch((error) => {
            console.warn('SettingsStateProvider - Failed to persist push settings', error);
        });
    }, []);

    const setIsBiometricEnabled = useCallback(async (enabled: boolean) => {
        setIsBiometricEnabledState(enabled);
        isBiometricEnabledRef.current = enabled;
        await apiSetBiometricEnabled(enabled);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const pushSettings = await AsyncStorage.getItem(PUSH_SETTINGS_KEY);
                if (pushSettings !== null) {
                    setIsPushEnabledState(JSON.parse(pushSettings));
                }
            } catch (e) {
                console.warn('SettingsStateProvider - Failed to load push settings', e);
            }
        };
        init();
    }, []);

    // Initial biometric check
    useEffect(() => {
        const checkBiometric = async () => {
            const enabled = await isBiometricLockEnabled();
            setIsBiometricEnabledState(enabled);
            isBiometricEnabledRef.current = enabled;
            if (enabled) {
                setIsAppLocked(true);
            }
        };
        checkBiometric();
    }, []);

    // AppState handling for biometric lock
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'inactive' || nextAppState === 'background') {
                if (isBiometricEnabledRef.current) {
                    setIsAppLocked(true);
                    pendingUnlockRef.current = false;
                }
            } else if (nextAppState === 'active') {
                if (pendingUnlockRef.current) {
                    setIsAppLocked(false);
                    pendingUnlockRef.current = false;
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Synchronous initial check if app starts in background/inactive
        if (AppState.currentState !== 'active' && isBiometricEnabledRef.current) {
            setIsAppLocked(true);
        }

        return () => subscription.remove();
    }, []);

    // FCM Setup
    useEffect(() => {
        const setupFcm = async () => {
            const enabled = await requestUserPermission();
            if (enabled) {
                const token = await getFcmToken(accessTokenRef.current || undefined);
                if (token) {
                    hasRegisteredFcmRef.current = true;
                }
            }
        };

        if (isPushEnabled) {
            setupFcm();

            const unsubscribe = subscribeToFcmTokenRefresh(accessTokenRef.current || undefined);
            fcmRefreshUnsubRef.current = unsubscribe;
        }

        return () => {
            if (fcmRefreshUnsubRef.current) {
                // @ts-ignore - type mismatch in library vs usage sometimes, but safe to call if function
                fcmRefreshUnsubRef.current();
                fcmRefreshUnsubRef.current = null;
            }
        };
    }, [isPushEnabled]);

    const contextValue: SettingsContextValue = useMemo(() => ({
        isPushEnabled,
        setIsPushEnabled,
        isBiometricEnabled,
        setIsBiometricEnabled,
    }), [
        isPushEnabled,
        setIsPushEnabled,
        isBiometricEnabled,
        setIsBiometricEnabled,
    ]);

    return (
        <SettingsProvider value={contextValue}>
            {children}
            {isAppLocked && (
                <View className="absolute inset-0">
                    <BiometricLockScreen onUnlock={() => {
                        if (AppState.currentState === 'active') {
                            setIsAppLocked(false);
                            pendingUnlockRef.current = false;
                        } else {
                            pendingUnlockRef.current = true;
                        }
                    }} />
                </View>
            )}
        </SettingsProvider>
    );
}
