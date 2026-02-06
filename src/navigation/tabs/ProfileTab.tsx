import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { Profile as ProfileScreen } from '../../screens/Profile';
import { Auth as AuthScreen } from '../../screens/Auth';

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
            <AuthScreen
                onBack={() => navigation.goBack()}
                onLoginSuccess={(response) => app?.login(response)}
                theme={theme}
                initialMode="login"
            />
        );
    }

    return (
        <ProfileScreen
            theme={theme}
            userProfile={app?.userProfile || { name: '', email: '', avatar: '' }}
            isAdmin={app?.isAdmin || false}
            orderCount={app?.orders?.length || 0}
            vouchers={app?.vouchers || []}
            onLogout={app?.logout || (() => { })}
            onNavigateToOrders={() => navigation.navigate('OrderHistory')}
            onNavigateToSettings={() => navigation.navigate('Settings')}
            onNavigateToWishlist={() => navigation.navigate('Wishlist')}
            onNavigateToAddress={() => navigation.navigate('AddressBook')}
            onNavigateToSupport={() => navigation.navigate('SupportCenter')}
            onNavigateToAdmin={() => navigation.navigate('AdminAddProduct')}
            onUpdateProfile={app?.updateProfile ? async (data) => {
                try {
                    await app.updateProfile(data);
                    return true;
                } catch {
                    return false;
                }
            } : undefined}
        />
    );
}
