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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AiAction, AiProductCard, ChatMessage, Product } from '../lib/data';
import { MessageBubble } from '../components/ai/MessageBubble';
import { TopBar } from '../components/layout/TopBar';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme } from '../lib/theme';
import { aiChat, confirmAiAction, addCartItem } from '../lib/api';
import { useToast } from '../components/common/ToastProvider';

interface AIChatProps {
  theme?: Theme;
  onNotificationClick?: () => void;
  accessToken?: string | null;
  onAddToCart?: (product: Product, quantity: number) => void;
  onRequireLogin?: () => void;
  onOpenProduct?: (productId: string) => void;
}

export function AIChat({
  theme = lightTheme,
  onNotificationClick,
  accessToken,
  onAddToCart,
  onRequireLogin,
  onOpenProduct,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

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
      showToast('Vui lòng đăng nhập để dùng trợ lý AI.', 'error');
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

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.warn('AIChat.tsx - aiChat error', error);
      showToast(error?.message || 'Không thể gửi yêu cầu tới AI', 'error');
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleAction = async (action: AiAction, sourceMessage: ChatMessage) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để thực hiện hành động.', 'error');
      onRequireLogin?.();
      return;
    }

    if (action.type === 'ADD_TO_CART') {
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

        const card =
          sourceMessage.cards?.find((c) => c.productId === action.payload.productId) ||
          sourceMessage.cards?.[0];
        if (card && onAddToCart) {
          onAddToCart(toProduct(card), action.payload.quantity || 1);
        }
        showToast('Đã thêm sản phẩm vào giỏ', 'success');
      } catch (error: any) {
        console.warn('AIChat.tsx - handleAction error', error);
        showToast(error?.message || 'Không thể thực hiện hành động', 'error');
      }
    }
  };

  const suggestions = ['Tư vấn linh kiện Arduino', 'Scan sơ đồ mạch', 'Tìm thay thế cho chip ESP8266'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        title="AI Engineer Support"
        showSearch={false}
        theme={theme}
        onNotificationClick={onNotificationClick}
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
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onAction={handleAction}
              onSelectCard={(card) => onOpenProduct?.(card.productId)}
            />
          ))}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <AppIcon name="sparkles" size={12} color={theme.muted} />
              <Text style={[styles.typingText, { color: theme.muted }]}>AI đang phân tích...</Text>
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
          {messages.length < 3 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsContainer}
              contentContainerStyle={styles.suggestionsContent}
            >
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => setInputValue(suggestion)}
                  style={[styles.suggestionChip, { backgroundColor: theme.background, borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionText, { color: theme.text }]}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity style={styles.inputButton} activeOpacity={0.7}>
              <AppIcon name="file-upload" size={20} color={theme.muted} />
            </TouchableOpacity>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Hỏi AI hoặc tải lên hình ảnh..."
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.muted}
              multiline
              maxLength={500}
            />

            {inputValue.trim() ? (
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendButton, { backgroundColor: theme.primary }]}
                activeOpacity={0.8}
                disabled={isSending}
              >
                <AppIcon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.inputButton} activeOpacity={0.7}>
                <AppIcon name="mic" size={20} color={theme.muted} />
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
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionsContent: {
    gap: 8,
    paddingRight: 16,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    minHeight: 44,
  },
  inputButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
});
