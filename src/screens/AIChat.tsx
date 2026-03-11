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
import { TEXT_INPUT_BASE_STYLE } from '../theme/typography';
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
  onArchiveCurrentChat?: (messagesOverride?: ChatMessage[]) => void;
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

  const normalizeText = (value?: string) =>
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const extractKeywords = (text: string) => {
    const stopwords = new Set([
      'co', 'cai', 'nao', 'khong', 'khong?', 'khong.', 'khong,',
      'toi', 'minh', 'ban', 'gi', 'muon', 'tim', 'kiem', 'san', 'pham',
      'loai', 'cho', 'voi', 'giup', 'can', 'timkiem', 'hang', 'shop',
      'vai', 'mau', 'loai', 'duoc', 'khong', 'khong', 'hay', 'nhu',
    ]);
    return normalizeText(text)
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => {
        if (stopwords.has(token)) return false;
        if (/\d/.test(token)) return token.length >= 2;
        return token.length >= 3;
      });
  };

  const buildKeywordGroups = (query: string) => {
    const q = normalizeText(query);
    const groups: string[][] = [];

    const pushGroup = (variants: string[]) => {
      const cleaned = variants.map(normalizeText).filter(Boolean);
      if (cleaned.length) groups.push(Array.from(new Set(cleaned)));
    };

    if (q.includes('wifi') || q.includes('wi-fi') || q.includes('wireless') || q.includes('802.11')) {
      pushGroup(['wifi', 'wi-fi', 'wireless', '802.11', 'esp32', 'esp8266', 'esp32-cam', 'esp32s']);
    }

    if (q.includes('mcu') || q.includes('vi dieu khien') || q.includes('microcontroller') || q.includes('controller')) {
      pushGroup(['mcu', 'microcontroller', 'vi dieu khien', 'controller', 'esp32', 'esp8266', 'arduino', 'stm32']);
    }

    if (q.includes('cam bien') || q.includes('sensor')) {
      pushGroup(['cam bien', 'sensor']);
    }

    if (q.includes('nhiet do') || q.includes('temperature')) {
      pushGroup(['nhiet do', 'temperature', 'thermal', 'thermo', 'ds18b20', 'dht11', 'dht22']);
    }

    if (q.includes('camera')) {
      pushGroup(['camera', 'cam', 'ov2640', 'ov7670']);
    }

    const tokens = extractKeywords(q);
    tokens.forEach((t) => pushGroup([t]));

    return groups;
  };

  const filterAiCards = (cards: AiProductCard[] | undefined, query: string) => {
    if (!cards || cards.length === 0) return cards;
    const groups = buildKeywordGroups(query);
    if (!groups.length) return cards;

    const scored = cards.map((card) => {
      const haystack = normalizeText(`${card.name} ${card.code || ''} ${card.category || ''}`);
      let matchCount = 0;
      groups.forEach((group) => {
        if (group.some((k) => haystack.includes(k))) {
          matchCount += 1;
        }
      });
      return { card, matchCount };
    });

    let filtered = scored.filter((item) => item.matchCount >= 1);
    if (groups.length >= 2 && filtered.length > 12) {
      const tighter = scored.filter((item) => item.matchCount >= 2);
      if (tighter.length > 0) filtered = tighter;
    }

    if (!filtered.length) return cards;
    return filtered.sort((a, b) => b.matchCount - a.matchCount).map((item) => item.card);
  };

  const filterAiActions = (actions: AiAction[] | undefined, cards: AiProductCard[] | undefined) => {
    if (!actions || actions.length === 0) return actions;
    if (!cards || cards.length === 0) return actions.filter((a) => a.type !== 'ADD_TO_CART');
    const allowed = new Set(cards.map((c) => c.productId));
    return actions.filter((a) => {
      if (a.type !== 'ADD_TO_CART') return true;
      return allowed.has(a.payload.productId);
    });
  };

  const isAdviceIntent = (text: string) => {
    const q = normalizeText(text);
    if (!q) return false;
    const patterns = [
      'can mua nhung gi',
      'nen mua',
      'tu van',
      'goi y',
      'de lam',
      'lam mach',
      'lap mach',
      'lap rap',
      'build',
      'project',
      'huong dan',
      'cach lam',
      'tu van mua hang',
      'chon gi',
      'lua chon',
      'thiet ke',
      'can nhung gi',
      'nhung gi can',
    ];
    return patterns.some((p) => q.includes(p));
  };

  const isProductSearchIntent = (text: string) => {
    const q = normalizeText(text);
    if (!q) return false;
    const patterns = [
      'mua',
      'gia',
      'bao nhieu',
      'tim',
      'kiem',
      'co ban',
      'ban co',
      'san pham',
      'linh kien',
      'datasheet',
      'ma',
      'model',
      'hang',
      'order',
      'dat hang',
      'them vao gio',
    ];
    return patterns.some((p) => q.includes(p));
  };

  const sanitizeAdviceReply = (reply: string) => {
    if (!reply) return reply;
    const stripped = reply
      .replace(/.*tìm thấy.*sản phẩm.*(\n|$)/gi, '')
      .replace(/.*tim thay.*san pham.*(\n|$)/gi, '')
      .replace(/.*found.*products?.*(\n|$)/gi, '')
      .replace(/\(xem thẻ bên dưới\)\.?/gi, '')
      .trim();

    if (stripped.length >= 10) return stripped;

    return [
      'Mình sẽ tư vấn đúng theo nhu cầu của bạn.',
      'Bạn cho mình thêm:',
      '- Điện áp vào/ra?',
      '- Dòng tải dự kiến?',
      '- Nguồn cấp hiện có?',
      '- Ưu tiên kích thước/giá/hiệu suất?',
    ].join('\n');
  };

  const patchReplyCount = (
    reply: string,
    filteredCards?: AiProductCard[],
    originalCards?: AiProductCard[],
  ) => {
    if (!reply || !filteredCards || !originalCards) return reply;
    const filteredCount = filteredCards.length;
    const originalCount = originalCards.length;
    if (filteredCount === originalCount) return reply;

    const vnPattern = /(tìm thấy\s+)(\d+)(\s+sản phẩm)/i;
    if (vnPattern.test(reply)) {
      return reply.replace(vnPattern, `$1${filteredCount}$3`);
    }
    const vnPatternNoTone = /(tim thay\s+)(\d+)(\s+san pham)/i;
    if (vnPatternNoTone.test(reply)) {
      return reply.replace(vnPatternNoTone, `$1${filteredCount}$3`);
    }
    const enPattern = /(found\s+)(\d+)(\s+products?)/i;
    if (enPattern.test(reply)) {
      return reply.replace(enPattern, `$1${filteredCount}$3`);
    }

    return `${reply}\n(Hiển thị ${filteredCount} sản phẩm.)`;
  };

  const getLocalReply = (text: string) => {
    const q = normalizeText(text);
    if (!q) return null;
    const words = q.split(/\s+/).filter(Boolean);
    if (q.length > 28 || words.length > 4) return null;
    const greetings = [
      'xin chao',
      'chao',
      'hello',
      'hi',
      'hey',
      'alo',
    ];
    const identity = [
      'ban ten gi',
      'ban ten la gi',
      'ban la ai',
      'ai la ban',
      'who are you',
      'ten gi',
    ];
    const thanks = ['cam on', 'thanks', 'thank you', 'thx'];
    const productIntents = [
      'linh kien', 'san pham', 'mua', 'gia', 'bao nhieu', 'co ban', 'can tim',
      'muon', 'thong so', 'datasheet', 'mcu', 'esp', 'esp32', 'esp8266',
      'sensor', 'cam bien', 'nhiet do', 'camera', 'wifi', 'bluetooth',
      'module', 'mach', 'kit', 'board', 'arduino', 'raspberry', 'ic',
      'dien tro', 'tu dien', 'day', 'cap', 'pin', 'nguon', 'relay', 'driver',
      'motor', 'dc', 'ac',
    ];

    if (productIntents.some((k) => q.includes(k))) return null;

    const hasGreeting = greetings.some((k) => q === k);
    const hasIdentity = identity.some((k) => q.includes(k));
    const hasThanks = thanks.some((k) => q.includes(k));

    if (hasIdentity) {
      return 'Mình là trợ lý AI của ElectroAI Shop. Bạn muốn tìm linh kiện nào?';
    }
    if (hasGreeting) {
      return 'Mình là trợ lý AI của ElectroAI Shop. Bạn muốn tìm linh kiện nào?';
    }
    if (hasThanks) {
      return 'Rất vui được giúp bạn. Bạn cần tìm linh kiện nào nữa không?';
    }
    return null;
  };

  const messagesRef = useRef<ChatMessage[]>(externalMessages || []);
  const pendingSyncRef = useRef<ChatMessage[] | null>(null);
  const skipSyncRef = useRef(false);

  const setMessages = React.useCallback((updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setMessagesState((prev) => {
      const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
      pendingSyncRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (externalMessages) {
      skipSyncRef.current = true;
      setMessagesState(externalMessages);
    }
  }, [externalMessages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      pendingSyncRef.current = null;
      return;
    }
    if (!pendingSyncRef.current) return;
    const next = pendingSyncRef.current;
    pendingSyncRef.current = null;
    onMessagesChange?.(next);
  }, [messages, onMessagesChange]);

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
        return [...prev, newMessage];
      });
    };

    socketService.on('chat_message', handleNewMessage);

    return () => {
      socketService.off('chat_message');
    };
  }, [setMessages]);

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

    const nextMessages = [...(messagesRef.current || []), userMessage];
    setMessages(nextMessages);
    setInputValue('');
    setIsTyping(true);
    setIsSending(true);

    try {
      const localReply = getLocalReply(userMessage.content);
      if (localReply) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: localReply,
          timestamp: new Date(),
          type: 'text',
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }
      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await aiChat({ message: userMessage.content, history }, accessToken);
      const adviceIntent = isAdviceIntent(userMessage.content);
      const productIntent = isProductSearchIntent(userMessage.content);
      let filteredCards = filterAiCards(response.cards, userMessage.content);
      if (adviceIntent && !productIntent) {
        filteredCards = [];
      }
      const filteredActions = filterAiActions(response.actions, filteredCards);
      const replyContent = adviceIntent && !productIntent
        ? sanitizeAdviceReply(response.reply)
        : patchReplyCount(response.reply, filteredCards, response.cards);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: replyContent,
        timestamp: new Date(),
        type: 'text',
        cards: filteredCards,
        orderCards: response.orderCards,
        addressCards: response.addressCards,
        actions: filteredActions,
      };

      setMessages((prev) => [...prev, aiMessage]);
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

      const nextMessages = [...(messagesRef.current || []), userMessage];
      setMessages(nextMessages);
      setInputValue('');
      setIsTyping(true);
      setIsSending(true);

      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await aiChat({ message: content, history, imageUrl }, accessToken);
      const adviceIntent = isAdviceIntent(content);
      const productIntent = isProductSearchIntent(content);
      // Image analysis often returns already-filtered cards; avoid filtering again.
      let filteredCards = response.cards;
      if (adviceIntent && !productIntent) {
        filteredCards = [];
      }
      const filteredActions = filterAiActions(response.actions, filteredCards);
      const replyContent = adviceIntent && !productIntent
        ? sanitizeAdviceReply(response.reply)
        : patchReplyCount(response.reply, filteredCards, response.cards);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: replyContent,
        timestamp: new Date(),
        type: 'text',
        cards: filteredCards,
        orderCards: response.orderCards,
        addressCards: response.addressCards,
        actions: filteredActions,
      };

      setMessages((prev) => [...prev, aiMessage]);
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
      onArchiveCurrentChat(messagesRef.current);
    } else {
      setMessages([]);
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
              className="flex-1 text-base min-h-10"
              style={{ color: theme.text, ...TEXT_INPUT_BASE_STYLE, paddingTop: 8, paddingBottom: 8 }}
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
