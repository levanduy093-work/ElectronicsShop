import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAppOptional } from '../../context';
import { useTheme } from '../../theme';
import { AIChat as AIChatScreen } from '../../screens/AIChat';

export function AITab() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const app = useAppOptional();

    return (
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
    );
}

