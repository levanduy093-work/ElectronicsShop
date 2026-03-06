import React from 'react';
import { useAppOptional, useOrdersOptional } from '../../context';
import { useTheme } from '../../theme';
import { Profile as ProfileScreen } from '../../screens/Profile';
import { Auth as AuthScreen } from '../../screens/Auth';

export function ProfileTab({ navigation, route }: { navigation: any; route: any }) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const ordersCtx = useOrdersOptional();

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (app?.isLoggedIn && app?.authTokens?.accessToken && app?.loadUserProfile) {
                app.loadUserProfile(app.authTokens.accessToken, { silent: true }).catch(() => { });
            }
        });
        return unsubscribe;
    }, [app, navigation]);

    const initialAuthMode: 'login' | 'register' =
        route?.params?.authMode === 'register' ? 'register' : 'login';

    if (!app?.isLoggedIn) {
        return (
            <AuthScreen
                onBack={() => navigation.goBack()}
                onLoginSuccess={(response) => app?.login(response)}
                theme={theme}
                initialMode={initialAuthMode}
            />
        );
    }

    return (
        <ProfileScreen
            theme={theme}
            userProfile={app?.userProfile || { name: '', email: '', avatar: '' }}
            isAdmin={app?.isAdmin || false}
            orderCount={ordersCtx?.orders?.length || 0}
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
