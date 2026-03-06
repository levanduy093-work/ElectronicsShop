import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { socketService } from '../services/socket';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AiAction, AiProductCard, ChatMessage, Product } from '../types';
import { MessageBubble } from '../components/ai/MessageBubble';
import { TopBar } from '../components/layout/TopBar';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme } from '../theme';
import { aiChat, confirmAiAction, addCartItem, uploadImage, UploadImageFile } from '../services/api';

import { useToast } from '../components/common/ToastProvider';

interface AIChatProps {
  theme?: Theme;
  onNotificationClick?: () => void;
  accessToken?: string | null;
  onAddToCart?: (product: Product, quantity: number) => void;
  onRequireLogin?: () => void;
  onOpenProduct?: (productId: string) => void;
  onOpenOrderDetail?: (orderId: string) => void;
  onOpenAddressBook?: () => void;
  onOpenChatHistory?: () => void;
  onArchiveCurrentChat?: () => void;
  messages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function AIChat({
  theme = lightTheme,
  onNotificationClick,
  accessToken,
  onAddToCart,
  onRequireLogin,
  onOpenProduct,
  onOpenOrderDetail,
  onOpenAddressBook,
  onOpenChatHistory,
  onArchiveCurrentChat,
  messages: externalMessages,
  onMessagesChange,
}: AIChatProps) {
  const [messages, setMessagesState] = useState<ChatMessage[]>(externalMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { t: translate } = useTranslation();

  const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setMessagesState((prev) => (typeof updater === 'function' ? (updater as any)(prev) : updater));
  };

  useEffect(() => {
    if (externalMessages) {
      setMessagesState(externalMessages);
    }
  }, [externalMessages]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  useEffect(() => {
    const onKeyboardShow = (e: KeyboardEvent) => {
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    };

    const onKeyboardHide = () => {
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setKeyboardHeight(0);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);
    const frameSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillChangeFrame', onKeyboardShow)
        : undefined;

    return () => {
      showSub.remove();
      hideSub.remove();
      frameSub?.remove();
    };
  }, []);

  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        const next = [...prev, newMessage];
        onMessagesChange?.(next);
        return next;
      });
    };

    socketService.on('chat_message', handleNewMessage);

    return () => {
      socketService.off('chat_message');
    };
  }, [onMessagesChange]);

  const bottomNavHeight = Platform.OS === 'ios' ? 2 + insets.bottom : 16 + insets.bottom;
  const isKeyboardVisible = keyboardHeight > 0;

  const toProduct = (card: AiProductCard): Product => ({
    id: card.productId,
    name: card.name,
    price: card.price,
    originalPrice: card.price,
    salePrice: card.price,
    rating: 0,
    reviews: 0,
    image: card.image || 'https://via.placeholder.com/300x300.png?text=No+Image',
    images: card.image ? [card.image] : [],
    category: card.category || 'Sản phẩm',
    stock: card.stock > 0 ? 'In Stock' : 'Out of Stock',
    stockQuantity: card.stock,
    description: '',
    specs: {},
    code: card.code,
  });

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    if (!accessToken) {
      showToast(translate('loginRequiredAI'), 'error');
      onRequireLogin?.();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text',
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    onMessagesChange?.(nextMessages);
    setInputValue('');
    setIsTyping(true);
    setIsSending(true);

    try {
      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await aiChat({ message: userMessage.content, history }, accessToken);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.reply,
        timestamp: new Date(),
        type: 'text',
        cards: response.cards,
        orderCards: response.orderCards,
        addressCards: response.addressCards,
        actions: response.actions,
      };

      setMessages((prev) => {
        const next = [...prev, aiMessage];
        onMessagesChange?.(next);
        return next;
      });
    } catch (error: any) {
      console.warn('AIChat.tsx - aiChat error', error);
      showToast(error?.message || translate('cannotSendAIRequest'), 'error');
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleAction = async (action: AiAction, sourceMessage: ChatMessage) => {
    if (!accessToken) {
      showToast(translate('loginRequiredAction'), 'error');
      onRequireLogin?.();
      return;
    }

    if (action.type === 'ADD_TO_CART') {
      const card =
        sourceMessage.cards?.find((c) => c.productId === action.payload.productId) ||
        sourceMessage.cards?.[0];
      if (card && card.stock <= 0) {
        showToast(translate('productOutOfStockCart'), 'error');
        return;
      }

      try {
        if (action.requiresConfirmation && action.confirmationId) {
          await confirmAiAction(
            action.confirmationId,
            accessToken,
            action.payload?.quantity,
            action.payload?.productId,
          );
        } else if (action.payload?.productId) {
          await addCartItem(action.payload.productId, action.payload.quantity || 1, accessToken);
        }

        if (card && onAddToCart) {
          onAddToCart(toProduct(card), action.payload.quantity || 1);
        }
        showToast(translate('productAddedToCart'), 'success');
      } catch (error: any) {
        console.warn('AIChat.tsx - handleAction error', error);
        showToast(error?.message || translate('cannotPerformAction'), 'error');
      }
    }
  };

  const pickAndSendImage = async () => {
    if (!accessToken) {
      showToast(translate('loginRequiredAI'), 'error');
      onRequireLogin?.();
      return;
    }

    try {
      setIsUploading(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      const asset = result?.assets?.[0];
      if (!asset?.uri) {
        setIsUploading(false);
        return;
      }

      const file: UploadImageFile = {
        uri: asset.uri.replace('file://', ''),
        name: asset.fileName || 'upload.jpg',
        type: asset.type || 'image/jpeg',
      };

      const uploaded = await uploadImage(file, {
        token: accessToken,
        folder: 'electronics-shop/ai-chat',
      });

      const imageUrl = (uploaded as any)?.secure_url || (uploaded as any)?.url;
      if (!imageUrl) {
        throw new Error(translate('cannotGetImageUrl'));
      }

      const content = inputValue.trim() || translate('analyzeImageDefault');
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        type: 'text',
        metadata: { imageUrl },
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      onMessagesChange?.(nextMessages);
      setInputValue('');
      setIsTyping(true);
      setIsSending(true);

      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await aiChat({ message: content, history, imageUrl }, accessToken);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.reply,
        timestamp: new Date(),
        type: 'text',
        cards: response.cards,
        orderCards: response.orderCards,
        addressCards: response.addressCards,
        actions: response.actions,
      };

      setMessages((prev) => {
        const next = [...prev, aiMessage];
        onMessagesChange?.(next);
        return next;
      });
    } catch (error: any) {
      console.warn('AIChat.tsx - pickAndSendImage error', error);
      showToast(error?.message || translate('cannotUploadImage'), 'error');
    } finally {
      setIsUploading(false);
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    if (onArchiveCurrentChat) {
      onArchiveCurrentChat();
    } else {
      setMessages([]);
      onMessagesChange?.([]);
    }
    setInputValue('');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <TopBar
        title={translate('ai_engineer_support')}
        showSearch={false}
        theme={theme}
        onNotificationClick={onNotificationClick}
        onNewChat={handleNewChat}
        onHistoryClick={onOpenChatHistory}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={{
            backgroundColor: theme.background,
            paddingBottom: 16,
            padding: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              onAction={handleAction}
              onSelectCard={(card) => onOpenProduct?.(card.productId)}
              onOpenOrderDetail={onOpenOrderDetail}
              onOpenAddressBook={onOpenAddressBook}
            />
          ))}

          {isTyping && (
            <View className="flex-row items-center gap-2 ml-11 mt-2">
              <AppIcon name="sparkles" size={12} color={theme.muted} />
              <Text className="text-xs" style={{ color: theme.muted }}>{translate('ai_analyzing')}</Text>
            </View>
          )}
        </ScrollView>

        <View
          className="p-4 pt-4 border-t"
          style={{
            paddingBottom: isKeyboardVisible ? 12 : bottomNavHeight,
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          }}
        >
          <View
            className="flex-row items-center rounded-2xl px-2.5 py-2 border gap-2.5 min-h-11"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <TouchableOpacity
              className="w-10 h-10 justify-center items-center rounded-xl"
              activeOpacity={0.7}
              onPress={pickAndSendImage}
              disabled={isUploading || isSending}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <AppIcon name="file-upload" size={20} color={theme.muted} />
              )}
            </TouchableOpacity>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={translate('askAIOrUpload')}
              className="flex-1 text-[15px] min-h-10 leading-5"
              style={{ color: theme.text, paddingTop: 8, paddingBottom: 8 }}
              placeholderTextColor={theme.muted}
              multiline
              textAlignVertical="center"
              maxLength={500}
            />

            {inputValue.trim() && (
              <TouchableOpacity
                onPress={handleSend}
                className="w-9 h-9 rounded-[10px] justify-center items-center"
                style={{
                  backgroundColor: theme.primary,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.8}
                disabled={isSending}
              >
                <AppIcon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
