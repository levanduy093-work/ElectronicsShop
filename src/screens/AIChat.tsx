import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  ScrollView,
  StyleSheet,
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
import { aiChat, confirmAiAction, addCartItem, uploadImage, UploadImageFile, createChatSession, getChatSessions, ApiChatSession, deleteChatSession } from '../services/api';

import { useToast } from '../components/common/ToastProvider';
import { ChatSession, loadArchivedSessions, saveArchivedSession, saveChatHistory } from '../services/storage';

import { Modal } from 'react-native';


interface AIChatProps {
  theme?: Theme;
  onNotificationClick?: () => void;
  accessToken?: string | null;
  onAddToCart?: (product: Product, quantity: number) => void;
  onRequireLogin?: () => void;
  onOpenProduct?: (productId: string) => void;
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
  messages: externalMessages,
  onMessagesChange,
}: AIChatProps) {
  const [messages, setMessagesState] = useState<ChatMessage[]>(externalMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [archives, setArchives] = useState<ApiChatSession[]>([]);


  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { t: translate } = useTranslation();

  const sanitizeMessage = (msg: any, index: number): ChatMessage => {
    let content = msg.content;
    if (typeof content === 'object' && content !== null) {
      content = content.text || '';
    }
    return {
      ...msg,
      // Ensure specific string ID with random component to guarantee uniqueness
      id: (msg.id && String(msg.id)) || (msg._id && String(msg._id)) || `msg-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      content: String(content || ''),
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp || msg.time || Date.now()),
    };
  };

  const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {

    setMessagesState((prev) => (typeof updater === 'function' ? (updater as any)(prev) : updater));
  };

  useEffect(() => {
    if (externalMessages) {
      setMessagesState(externalMessages);
    }
  }, [externalMessages]);

  // Removed fragile bidirectional sync effect


  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  useEffect(() => {
    const onKeyboardShow = (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates?.height ?? 0);
    const onKeyboardHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onKeyboardHide);
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

  // Real-time chat sync
  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some(m => m.id === newMessage.id)) return prev;
        const next = [...prev, newMessage];
        onMessagesChange?.(next); // Helper to sync with parent/storage
        return next;
      });
    };

    socketService.on('chat_message', handleNewMessage);

    return () => {
      socketService.off('chat_message');
    };
  }, [onMessagesChange]);

  const bottomNavHeight = 80 + Math.max(insets.bottom, 12);
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

  const handleNewChat = async () => {
    if (messages.length > 0) {
      if (accessToken) {
        try {
          // Strip local ID and legacy 'time' field before sending to backend
          const payload = messages.map(({ id, time, ...rest }: any) => ({
            ...rest,
            timestamp: rest.timestamp || (time ? new Date(time) : new Date()),
          }));
          await createChatSession(payload as any, accessToken);
          showToast(translate('chat_archived'), 'success');
        } catch (e) {
          console.error('Failed to archive chat', e);
          showToast(translate('error_occurred'), 'error');
        }
      } else {
        // Fallback for guest or offline? For now just skip or warn
        showToast(translate('login_required'), 'info');
      }
    }
    setMessages([]);
    onMessagesChange?.([]);
    setInputValue('');
  };

  const handleOpenHistory = async () => {
    if (!accessToken) {
      showToast(translate('login_required'), 'info');
      return;
    }
    try {
      const list = await getChatSessions(accessToken);
      const sanitizedList = list.map(session => ({
        ...session,
        messages: session.messages.map((msg, idx) => sanitizeMessage(msg, idx)),
      }));
      setArchives(sanitizedList);
      setShowHistory(true);
    } catch (e) {
      console.error('Failed to load history', e);
      showToast(translate('error_occurred'), 'error');
    }
  };

  const restoreSession = (session: ApiChatSession) => {
    // Save current if not empty before switching
    if (messages.length > 0 && accessToken) {
      const payload = messages.map(({ id, time, ...rest }: any) => ({
        ...rest,
        timestamp: rest.timestamp || (time ? new Date(time) : new Date()),
      }));
      createChatSession(payload as any, accessToken).catch(() => { });
    }
    setMessages(session.messages);
    onMessagesChange?.(session.messages);
    setShowHistory(false);
  };




  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        title={translate('ai_engineer_support')}
        showSearch={false}
        theme={theme}
        onNotificationClick={onNotificationClick}
        onNewChat={handleNewChat}
        onHistoryClick={handleOpenHistory}
      />


      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messagesContainer, { backgroundColor: theme.background }]}
          contentContainerStyle={[
            styles.messagesContent,
            {
              backgroundColor: theme.background,
              paddingBottom: 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}

              message={msg}
              onAction={handleAction}
              onSelectCard={(card) => onOpenProduct?.(card.productId)}
            />
          ))}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <AppIcon name="sparkles" size={12} color={theme.muted} />
              <Text style={[styles.typingText, { color: theme.muted }]}>{translate('ai_analyzing')}</Text>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: isKeyboardVisible ? Math.max(insets.bottom, 8) : bottomNavHeight,
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.inputButton}
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
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.muted}
              multiline
              textAlignVertical="center"
              maxLength={500}
            />

            {inputValue.trim() && (
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendButton, { backgroundColor: theme.primary }]}
                activeOpacity={0.8}
                disabled={isSending}
              >
                <AppIcon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {isSending && (
        <View style={styles.sendingOverlay}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.sendingText, { color: theme.muted }]}>Đang gửi...</Text>
        </View>
      )}

      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={[styles.historyContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.historyHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>{translate('chat_history')}</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.closeButton}>
              <AppIcon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.historyList}>
            {archives.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.muted }]}>{translate('no_history')}</Text>
            ) : (
              archives.map((session) => (
                <TouchableOpacity
                  key={session._id}
                  style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => restoreSession(session)}
                >
                  <Text style={[styles.historySnippet, { color: theme.text }]} numberOfLines={2}>
                    {session.messages[session.messages.length - 1]?.content || 'Empty chat'}
                  </Text>
                  <Text style={[styles.historyUnknown, { color: theme.muted }]}>
                    {new Date(session.createdAt || Date.now()).toLocaleString()}
                  </Text>
                  <Text style={[styles.historyCount, { color: theme.primary }]}>
                    {session.messages.length} msgs
                  </Text>
                </TouchableOpacity>
              ))

            )}
          </ScrollView>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 44,
    marginTop: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    padding: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    minHeight: 40,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 20,
  },
  inputButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sendingOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sendingText: {
    fontSize: 12,
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  historyList: {
    padding: 16,
    gap: 12,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  historySnippet: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyUnknown: {
    fontSize: 12,
  },
  historyCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

