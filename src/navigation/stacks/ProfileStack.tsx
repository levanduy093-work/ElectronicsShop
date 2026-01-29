import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';

// Lazy load screens
const ProfileScreen = React.lazy(() =>
    import('../../screens/Profile').then(m => ({ default: m.Profile }))
);
const AuthScreen = React.lazy(() =>
    import('../../screens/Auth').then(m => ({ default: m.Auth }))
);
const SettingsScreen = React.lazy(() =>
    import('../../screens/Settings').then(m => ({ default: m.Settings }))
);
const OrderHistoryScreen = React.lazy(() =>
    import('../../screens/OrderHistory').then(m => ({ default: m.OrderHistory }))
);
const OrderDetailScreen = React.lazy(() =>
    import('../../screens/OrderDetail').then(m => ({ default: m.OrderDetail }))
);
const AddressBookScreen = React.lazy(() =>
    import('../../screens/AddressBook').then(m => ({ default: m.AddressBook }))
);
const WishlistScreen = React.lazy(() =>
    import('../../screens/Wishlist').then(m => ({ default: m.Wishlist }))
);
const SupportCenterScreen = React.lazy(() =>
    import('../../screens/SupportCenter').then(m => ({ default: m.SupportCenter }))
);
const ChangePasswordScreen = React.lazy(() =>
    import('../../screens/ChangePassword').then(m => ({ default: m.ChangePassword }))
);
const LanguageSelectionScreen = React.lazy(() =>
    import('../../screens/LanguageSelection').then(m => ({ default: m.LanguageSelection }))
);

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// Loading fallback
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

// Wrapper for Profile screen
function ProfileWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme, isDarkMode } = useTheme();
    const app = useAppOptional();

    if (!app?.isLoggedIn) {
        // Navigate to Auth if not logged in
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

// Wrapper for Auth screen
function AuthWrapper({ route }: { route: { params?: { mode?: 'login' | 'register' } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AuthScreen
                onBack={() => navigation.goBack()}
                onLoginSuccess={(response) => {
                    app?.login(response);
                    navigation.goBack();
                }}
                theme={theme}
                initialMode={route.params?.mode || 'login'}
            />
        </Suspense>
    );
}

// Wrapper for Settings screen
function SettingsWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme, isDarkMode } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SettingsScreen
                onBack={() => navigation.goBack()}
                theme={theme}
                themeMode={app?.themeMode || 'system'}
                onThemeModeChange={app?.setThemeMode || (() => { })}
                onChangePassword={() => navigation.navigate('ChangePassword')}
                onNavigateToLanguage={() => navigation.navigate('LanguageSelection')}
                isPushEnabled={app?.isPushEnabled || false}
                onTogglePush={app?.setIsPushEnabled ? () => app.setIsPushEnabled(!app.isPushEnabled) : undefined}
                onResetOnboarding={() => { }}
            />
        </Suspense>
    );
}

// Wrapper for OrderHistory screen
function OrderHistoryWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <OrderHistoryScreen
                onBack={() => navigation.goBack()}
                onViewDetail={(orderId) => navigation.navigate('OrderDetail', { orderId })}
                orders={app?.orders || []}
                theme={theme}
                onRefresh={app?.refreshOrders || (() => Promise.resolve())}
                refreshing={app?.isRefreshingOrders || false}
            />
        </Suspense>
    );
}

// Wrapper for OrderDetail screen
function OrderDetailWrapper({ route }: { route: { params: { orderId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const orderId = route.params.orderId;
    const order = app?.orders.find(o => o.id === orderId);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <OrderDetailScreen
                orderId={orderId}
                onBack={() => navigation.goBack()}
                order={order}
                theme={theme}
                products={app?.products || []}
                onReorder={() => { }}
                onNavigateToCart={app?.navigateToCart || (() => { })}
                onRefreshOrder={() => app?.refreshOrderDetail(orderId)}
                accessToken={app?.authTokens?.accessToken}
            />
        </Suspense>
    );
}

// Wrapper for AddressBook screen
function AddressBookWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AddressBookScreen
                onBack={() => navigation.goBack()}
                theme={theme}
                addresses={app?.addresses || []}
                onUpdateAddresses={app?.updateAddresses || (() => { })}
                accessToken={app?.authTokens?.accessToken}
            />
        </Suspense>
    );
}

// Wrapper for Wishlist screen
function WishlistWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <WishlistScreen
                items={app?.wishlist || []}
                onBack={() => navigation.goBack()}
                onRemove={(productId) => app?.toggleFavorite(productId)}
                onProductClick={(p) => { }}
                theme={theme}
            />
        </Suspense>
    );
}

// Wrapper for SupportCenter screen
function SupportCenterWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SupportCenterScreen
                onBack={() => navigation.goBack()}
                theme={theme}
            />
        </Suspense>
    );
}

// Wrapper for ChangePassword screen
function ChangePasswordWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ChangePasswordScreen
                onBack={() => navigation.goBack()}
                onSuccess={() => navigation.goBack()}
                theme={theme}
                email={app?.userProfile.email}
                accessToken={app?.authTokens?.accessToken}
            />
        </Suspense>
    );
}

// Wrapper for LanguageSelection screen
function LanguageSelectionWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const { isDarkMode } = useTheme();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <LanguageSelectionScreen
                onBack={() => navigation.goBack()}
                isDarkMode={isDarkMode}
            />
        </Suspense>
    );
}

export function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="Profile" component={ProfileWrapper} />
            <Stack.Screen name="Auth" component={AuthWrapper} />
            <Stack.Screen name="Settings" component={SettingsWrapper} />
            <Stack.Screen name="OrderHistory" component={OrderHistoryWrapper} />
            <Stack.Screen name="OrderDetail" component={OrderDetailWrapper} />
            <Stack.Screen name="AddressBook" component={AddressBookWrapper} />
            <Stack.Screen name="Wishlist" component={WishlistWrapper} />
            <Stack.Screen name="SupportCenter" component={SupportCenterWrapper} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordWrapper} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionWrapper} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
