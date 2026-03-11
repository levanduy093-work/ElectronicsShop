import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, AppState, AppStateStatus } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BiometricIcon } from '../common/BiometricIcon';
import { authenticateBiometric, checkBiometricSupport, type BiometricStatus } from '../../services/BiometricService';
import { useTheme } from '../../theme';

interface BiometricLockScreenProps {
    onUnlock: () => void;
}

export function BiometricLockScreen({ onUnlock }: BiometricLockScreenProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { theme, isDarkMode } = useTheme();
    const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
    const [isLoadingBiometric, setIsLoadingBiometric] = useState(true);
    const [authFailed, setAuthFailed] = useState(false);
    const isAuthenticatingRef = useRef(false);
    const hasUnlockedRef = useRef(false);

    useEffect(() => {
        let mounted = true;
        checkBiometricSupport()
            .then((status) => {
                if (mounted) setBiometricStatus(status);
            })
            .finally(() => {
                if (mounted) setIsLoadingBiometric(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            // Reset local unlock status if app backgrounds
            if (nextAppState === 'inactive' || nextAppState === 'background') {
                hasUnlockedRef.current = false;
            }

            // Only trigger biometric prompt when app becomes active
            if (nextAppState === 'active' && !hasUnlockedRef.current) {
                // Short delay to ensure UI is ready
                setTimeout(handleAuthenticate, 300);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Initial trigger if active on mount
        if (AppState.currentState === 'active' && !hasUnlockedRef.current) {
            setTimeout(handleAuthenticate, 300);
        }

        return () => {
            subscription.remove();
            hasUnlockedRef.current = false; // Reset on unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAuthenticate = async () => {
        // Prevent multiple simultaneous auth attempts
        if (isAuthenticatingRef.current || hasUnlockedRef.current) {
            return;
        }

        isAuthenticatingRef.current = true;
        setAuthFailed(false);

        try {
            const success = await authenticateBiometric(t('biometric_auth_prompt'));
            // Check if app is not in background before finalizing unlock
            // 'inactive' is expected on iOS while FaceID prompt is showing or dismissing
            const isWindowVisible = AppState.currentState === 'active' || AppState.currentState === 'inactive';

            if (success && !hasUnlockedRef.current && isWindowVisible) {
                hasUnlockedRef.current = true;
                onUnlock();
            } else if (!success) {
                setAuthFailed(true);
            }
        } finally {
            isAuthenticatingRef.current = false;
        }
    };

    return (
        <View className="flex-1 justify-start items-center" style={{ backgroundColor: theme.background }}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />
            <View className="items-center px-8" style={{ paddingTop: insets.top + 100 }}>
                <View
                    className="w-[120px] h-[120px] rounded-full justify-center items-center mb-8"
                    style={{ backgroundColor: theme.primary + '20' }}
                >
                    <BiometricIcon
                        type={!isLoadingBiometric ? (biometricStatus?.biometryType || null) : null}
                        size={64}
                        color={theme.primary}
                    />
                </View>

                <Text className="text-2xl font-bold mb-2 text-center" style={{ color: theme.text }}>
                    {t('biometric_app_locked')}
                </Text>

                <Text className="text-base text-center mb-4" style={{ color: theme.muted }}>
                    {biometricStatus?.displayName
                        ? t('biometric_unlock_with', { method: biometricStatus.displayName })
                        : t('biometric_auth_prompt')}
                </Text>

                {authFailed && (
                    <Text className="text-sm text-center mb-4 text-red-500">
                        {t('biometric_auth_failed')}
                    </Text>
                )}

                <TouchableOpacity
                    className="flex-row items-center justify-center py-4 px-8 rounded-2xl gap-3 mt-6 shadow-sm elevation-8"
                    style={{
                        backgroundColor: theme.primary,
                        shadowColor: '#2563EB',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                    }}
                    onPress={handleAuthenticate}
                    activeOpacity={0.8}
                >
                    <BiometricIcon
                        type={!isLoadingBiometric ? (biometricStatus?.biometryType || null) : null}
                        size={24}
                        color="#FFFFFF"
                    />
                    <Text className="text-white text-base font-semibold">
                        {biometricStatus?.displayName
                            ? t('biometric_unlock_btn', { method: biometricStatus.displayName })
                            : t('biometric_unlock')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
