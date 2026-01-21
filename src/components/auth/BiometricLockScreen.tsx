import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../common/Icon';
import { authenticateBiometric, checkBiometricSupport, type BiometricStatus } from '../../services/BiometricService';
import { useTheme } from '../../theme';

interface BiometricLockScreenProps {
    onUnlock: () => void;
}

export function BiometricLockScreen({ onUnlock }: BiometricLockScreenProps) {
    const insets = useSafeAreaInsets();
    const { theme, isDarkMode } = useTheme();
    const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
    const [authFailed, setAuthFailed] = useState(false);
    const isAuthenticatingRef = useRef(false);
    const hasUnlockedRef = useRef(false);

    useEffect(() => {
        checkBiometricSupport().then(setBiometricStatus);
    }, []);

    useEffect(() => {
        // Auto-trigger biometric prompt on mount (with small delay to ensure UI is ready)
        const timer = setTimeout(() => {
            if (!hasUnlockedRef.current) {
                handleAuthenticate();
            }
        }, 300);
        return () => clearTimeout(timer);
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
            const success = await authenticateBiometric('Xác thực để mở khóa ứng dụng');
            if (success && !hasUnlockedRef.current) {
                hasUnlockedRef.current = true;
                onUnlock();
            } else if (!success) {
                setAuthFailed(true);
            }
        } finally {
            isAuthenticatingRef.current = false;
        }
    };

    const getIcon = () => {
        if (biometricStatus?.biometryType === 'FaceID') {
            return 'scan-face';
        }
        return 'fingerprint';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />
            <View style={[styles.content, { paddingTop: insets.top + 100 }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <AppIcon name={getIcon()} size={64} color={theme.primary} />
                </View>

                <Text style={[styles.title, { color: theme.text }]}>
                    Ứng dụng đã khóa
                </Text>

                <Text style={[styles.subtitle, { color: theme.muted }]}>
                    {biometricStatus?.displayName
                        ? `Sử dụng ${biometricStatus.displayName} để mở khóa`
                        : 'Xác thực để tiếp tục'}
                </Text>

                {authFailed && (
                    <Text style={[styles.errorText, { color: '#EF4444' }]}>
                        Xác thực thất bại. Vui lòng thử lại.
                    </Text>
                )}

                <TouchableOpacity
                    style={[styles.unlockButton, { backgroundColor: theme.primary }]}
                    onPress={handleAuthenticate}
                    activeOpacity={0.8}
                >
                    <AppIcon name={getIcon()} size={24} color="#FFFFFF" />
                    <Text style={styles.unlockButtonText}>
                        {biometricStatus?.displayName
                            ? `Mở khóa bằng ${biometricStatus.displayName}`
                            : 'Mở khóa'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    unlockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        gap: 12,
        marginTop: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    unlockButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
