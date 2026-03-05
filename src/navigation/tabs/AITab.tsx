import React from 'react';
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
            onOpenOrderDetail={(orderId: string) => navigation.navigate('OrderDetail', { orderId })}
            onOpenAddressBook={() => navigation.navigate('AddressBook')}
            onOpenChatHistory={() => navigation.navigate('AIChatHistory')}
            onArchiveCurrentChat={app?.archiveCurrentAiChat}
            onRequireLogin={app?.requireLogin}
            onNotificationClick={() => navigation.navigate('Notifications')}
        />
    );
}
