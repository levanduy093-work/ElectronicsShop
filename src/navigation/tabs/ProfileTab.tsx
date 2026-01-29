import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';

const ProfileScreen = React.lazy(() =>
    import('../../screens/Profile').then(m => ({ default: m.Profile }))
);
const AuthScreen = React.lazy(() =>
    import('../../screens/Auth').then(m => ({ default: m.Auth }))
);

function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

export function ProfileTab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    // Refresh user profile when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            if (app?.isLoggedIn && app?.authTokens?.accessToken && app?.loadUserProfile) {
                app.loadUserProfile(app.authTokens.accessToken, { silent: true }).catch(() => { });
            }
        }, [app?.isLoggedIn, app?.authTokens?.accessToken])
    );

    if (!app?.isLoggedIn) {
        return (
            <Suspense fallback={<LoadingFallback />}>
                <AuthScreen
                    onBack={() => navigation.goBack()}
                    onLoginSuccess={(response) => app?.login(response)}
                    theme={theme}
                    initialMode="login"
                />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ProfileScreen
                theme={theme}
                userProfile={app?.userProfile || { name: '', email: '', avatar: '' }}
                orderCount={app?.orders?.length || 0}
                vouchers={app?.vouchers || []}
                onLogout={app?.logout || (() => { })}
                onNavigateToOrders={() => navigation.navigate('OrderHistory')}
                onNavigateToSettings={() => navigation.navigate('Settings')}
                onNavigateToWishlist={() => navigation.navigate('Wishlist')}
                onNavigateToAddress={() => navigation.navigate('AddressBook')}
                onNavigateToSupport={() => navigation.navigate('SupportCenter')}
                onUpdateProfile={app?.updateProfile ? async (data) => {
                    try {
                        await app.updateProfile(data);
                        return true;
                    } catch {
                        return false;
                    }
                } : undefined}
            />
        </Suspense>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
