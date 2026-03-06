import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAiChatOptional, useAppOptional, useCartOptional } from '../../context';
import { useTheme } from '../../theme';
import { AIChat as AIChatScreen } from '../../screens/AIChat';

export function AITab({ navigation }: { navigation: any }) {
    const { theme } = useTheme();
    const app = useAppOptional();
    const aiChatCtx = useAiChatOptional();
    const cartCtx = useCartOptional();

    useFocusEffect(
        React.useCallback(() => {
            aiChatCtx?.ensureAiChatLoaded?.();
        }, [aiChatCtx])
    );

    return (
        <AIChatScreen
            theme={theme}
            messages={aiChatCtx?.aiMessages || []}
            onMessagesChange={aiChatCtx?.setAiMessages}
            accessToken={app?.authTokens?.accessToken}
            onAddToCart={cartCtx?.addToCart}
            onOpenProduct={(productId: string) => navigation.navigate('ProductDetail', { productId })}
            onOpenOrderDetail={(orderId: string) => navigation.navigate('OrderDetail', { orderId })}
            onOpenAddressBook={() => navigation.navigate('AddressBook')}
            onOpenChatHistory={() => navigation.navigate('AIChatHistory')}
            onArchiveCurrentChat={aiChatCtx?.archiveCurrentAiChat}
            onRequireLogin={app?.requireLogin}
            onNotificationClick={() => navigation.navigate('Notifications')}
        />
    );
}
