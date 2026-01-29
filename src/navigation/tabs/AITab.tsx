import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';

const AIChatScreen = React.lazy(() =>
    import('../../screens/AIChat').then(m => ({ default: m.AIChat }))
);

function LoadingFallback() {
    const { theme } = useTheme();
    return (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

export function AITab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
                onNotificationClick={() => navigation.navigate('Notifications')}
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
