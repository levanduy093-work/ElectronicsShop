import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AIStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';

// Lazy load screens
const AIChatScreen = React.lazy(() =>
    import('../../screens/AIChat').then(m => ({ default: m.AIChat }))
);
const ProductDetailScreen = React.lazy(() =>
    import('../../screens/ProductDetail').then(m => ({ default: m.ProductDetail }))
);

const Stack = createNativeStackNavigator<AIStackParamList>();

// Loading fallback
function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

// Wrapper for AIChat screen
function AIChatWrapper() {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AIChatScreen
                theme={theme}
                messages={app?.aiMessages || []}
                onMessagesChange={app?.setAiMessages}
                accessToken={app?.authTokens?.accessToken}
                onAddToCart={app?.addToCart}
                onOpenProduct={(productId: string) => navigation.navigate('ProductDetail', { productId })}
                onRequireLogin={app?.requireLogin}
            />
        </Suspense>
    );
}

// Wrapper for ProductDetail screen
function ProductDetailWrapper({ route }: { route: { params: { productId: string } } }) {
    const navigation = useNavigation<NativeStackNavigationProp<AIStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    const productId = route.params.productId;
    const product = app?.products.find(p => p.id === productId);

    if (!product) {
        return <LoadingFallback />;
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ProductDetailScreen
                product={product}
                onBack={() => navigation.goBack()}
                onAddToCart={app?.addToCart || (() => { })}
                isFavorite={app?.isFavorite(productId) || false}
                onToggleFavorite={() => app?.toggleFavorite(productId)}
                isLoggedIn={app?.isLoggedIn || false}
                onRequireLogin={app?.requireLogin || (() => { })}
                accessToken={app?.authTokens?.accessToken}
                currentUserId={app?.userId || undefined}
                currentUserName={app?.userProfile.name}
                theme={theme}
                relatedProducts={app?.relatedProducts || []}
                onProductClick={(p) => navigation.push('ProductDetail', { productId: p.id })}
                cartItemCount={app?.cartItems.length || 0}
                onNavigateToCart={app?.navigateToCart || (() => { })}
            />
        </Suspense>
    );
}

export function AIStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="AIChat" component={AIChatWrapper} />
            <Stack.Screen name="ProductDetail" component={ProductDetailWrapper} />
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
