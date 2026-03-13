import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutAnimation,
  Linking,
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
      'cam', 'bien', 'sensor', 'module', 'board', 'kit', 'mach', 'linh', 'kien',
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
      pushGroup(['nhiet do', 'temperature', 'thermal', 'thermo', 'ds18b20', 'dht11', 'dht22', 'lm35', 'ntc', 'pt100', 'pt1000', 'thermistor', 'thermocouple', 'max6675', 'max31855', 'mlx90614']);
    }

    if (q.includes('camera')) {
      pushGroup(['camera', 'cam', 'ov2640', 'ov7670']);
    }

    const tokens = extractKeywords(q);
    tokens.forEach((t) => pushGroup([t]));

    return groups;
  };

  const buildMustHaveGroups = (query: string) => {
    const q = normalizeText(query);
    const groups: string[][] = [];

    if (q.includes('nhiet do') || q.includes('temperature')) {
      groups.push(['nhiet do', 'temperature', 'thermal', 'thermo', 'ds18b20', 'dht11', 'dht22', 'lm35', 'ntc', 'pt100', 'pt1000', 'thermistor', 'thermocouple', 'max6675', 'max31855', 'mlx90614']);
    }
    if (q.includes('do am') || q.includes('humidity')) {
      groups.push(['do am', 'humidity', 'dht11', 'dht22', 'am2301', 'am2302', 'sht', 'si70', 'htu']);
    }
    if (q.includes('anh sang') || q.includes('light') || q.includes('lux')) {
      groups.push(['anh sang', 'light', 'lux', 'bh1750', 'tsl2561', 'tsl2591', 'ldr', 'photoresistor']);
    }
    if (q.includes('chuyen dong') || q.includes('motion') || q.includes('pir')) {
      groups.push(['chuyen dong', 'motion', 'pir', 'hc-sr501', 'am312']);
    }
    if (q.includes('khoang cach') || q.includes('distance') || q.includes('sieu am') || q.includes('ultrasonic')) {
      groups.push(['khoang cach', 'distance', 'sieu am', 'ultrasonic', 'hc-sr04', 'us-100']);
    }

    return groups;
  };

  const filterAiCards = (cards: AiProductCard[] | undefined, query: string) => {
    if (!cards || cards.length === 0) return cards;
    const groups = buildKeywordGroups(query);
    if (!groups.length) return cards;
    const mustHaveGroups = buildMustHaveGroups(query);

    const scored = cards.map((card) => {
      const haystack = normalizeText(`${card.name} ${card.code || ''} ${card.category || ''}`);
      if (mustHaveGroups.length) {
        const hasAllMust = mustHaveGroups.every((group) => group.some((k) => haystack.includes(k)));
        if (!hasAllMust) {
          return { card, matchCount: 0, excluded: true };
        }
      }
      let matchCount = 0;
      groups.forEach((group) => {
        if (group.some((k) => haystack.includes(k))) {
          matchCount += 1;
        }
      });
      return { card, matchCount };
    });

    let filtered = scored.filter((item) => item.matchCount >= 1 && !(item as any).excluded);
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
    const vnBomPattern = /(san pham(?:\s+he thong)?\s+dang co:\s*)(\d+)(\s+mon)/i;
    if (vnBomPattern.test(reply)) {
      return reply.replace(vnBomPattern, `$1${filteredCount}$3`);
    }
    const vnBomPatternAccented = /(sản phẩm(?:\s+hệ thống)?\s+đang có:\s*)(\d+)(\s+món)/i;
    if (vnBomPatternAccented.test(reply)) {
      return reply.replace(vnBomPatternAccented, `$1${filteredCount}$3`);
    }
    const enPattern = /(found\s+)(\d+)(\s+products?)/i;
    if (enPattern.test(reply)) {
      return reply.replace(enPattern, `$1${filteredCount}$3`);
    }

    return `${reply}\n(Hiển thị ${filteredCount} sản phẩm.)`;
  };

  const extractBomLinesFromReply = (reply: string) => {
    if (!reply) return [];
    const lines = reply.split('\n').map((line) => line.trim()).filter(Boolean);
    const startIdx = lines.findIndex((line) => normalizeText(line).includes('linh kien can cho mach'));
    if (startIdx < 0) return [];

    const result: string[] = [];
    for (let i = startIdx + 1; i < lines.length; i += 1) {
      const line = lines[i];
      const normalized = normalizeText(line);
      if (normalized.startsWith('san pham dang co') || normalized.startsWith('con thieu')) {
        break;
      }
      if (!line.startsWith('-')) continue;

      const cleaned = line
        .replace(/^-+\s*/, '')
        .replace(/\s*-\s*\d+\s*cai$/i, '')
        .replace(/\s*-\s*\d+\s*bo$/i, '')
        .trim();
      if (cleaned.length >= 2) result.push(cleaned);
    }
    return result;
  };

  const alignCardsWithReplyRequirements = (
    reply: string,
    cards: AiProductCard[] | undefined,
  ) => {
    if (!cards || cards.length === 0 || !reply) return cards;
    const bomLines = extractBomLinesFromReply(reply);
    if (!bomLines.length) return cards;

    const generic = new Set([
      'bo', 'vi', 'dieu', 'khien', 'cam', 'bien', 'mach', 'module', 'kit',
      'day', 'noi', 'nguon', 'man', 'hinh', 'lcd', 'ca', 'cho', 'mua',
      'linh', 'kien', 'cai', 'bo',
    ]);

    const tokenGroups = bomLines
      .map((line) => extractKeywords(line))
      .map((tokens) => Array.from(new Set(tokens.map((t) => normalizeText(t)))))
      .map((tokens) => tokens.filter((t) => !generic.has(t)))
      .filter((tokens) => tokens.length > 0)
      .slice(0, 12);

    if (!tokenGroups.length) return cards;

    const aligned = cards.filter((card) => {
      const haystack = normalizeText(
        `${card.name || ''} ${card.code || ''} ${card.category || ''}`,
      );
      return tokenGroups.some((group) => {
        const strong = group.filter((t) => /\d/.test(t) || t.length >= 4);
        if (strong.length) {
          return strong.some((t) => haystack.includes(t));
        }
        return group.some((t) => haystack.includes(t));
      });
    });

    if (!aligned.length) return cards;
    return aligned;
  };

  const resolveAiError = (error: any, fallbackKey: string) => {
    const rawMessage = typeof error === 'string' ? error : error?.message || '';
    const message = rawMessage.trim();
    const normalized = message.toLowerCase();

    const matches = (patterns: string[]) => patterns.some((p) => normalized.includes(p));

    if (matches(['session', 'token', 'unauthorized', '401', 'đăng nhập', 'het han', 'hết hạn'])) {
      return { key: 'sessionExpired', shouldRequireLogin: true };
    }

    if (matches(['no network', 'khong co ket noi', 'không có kết nối', 'offline'])) {
      return { key: 'noNetworkConnection' };
    }

    if (matches(['timeout', 'qua lau', 'quá lâu'])) {
      return { key: 'requestTimeout' };
    }

    if (matches(['khong the ket noi', 'không thể kết nối', 'cannot connect'])) {
      return { key: 'cannotConnectServer' };
    }

    if (matches(['server', 'máy chủ', 'he thong', 'hệ thống', 'service unavailable'])) {
      return { key: 'serverUnavailable' };
    }

    if (message) {
      return { message };
    }

    return { message: translate(fallbackKey) };
  };

  const normalizeAiResponse = (response: any, fallbackKey: string) => {
    const reply = typeof response?.reply === 'string' ? response.reply.trim() : '';
    return {
      reply: reply || translate(fallbackKey),
      cards: Array.isArray(response?.cards) ? response.cards : [],
      orderCards: Array.isArray(response?.orderCards) ? response.orderCards : [],
      addressCards: Array.isArray(response?.addressCards) ? response.addressCards : [],
      actions: Array.isArray(response?.actions) ? response.actions : [],
    };
  };

  const MAX_RENDERED_AI_CARDS = 10;
  const SUPPORT_PHONE = '0123456789';
  const SUPPORT_EMAIL = 'levanduy.dev@gmail.com';

  const getSupportPolicyReply = (text: string): { content: string; actions?: AiAction[] } | null => {
    const q = normalizeText(text);
    if (!q) return null;

    const hasAny = (patterns: string[]) => patterns.some((p) => q.includes(p));

    if (hasAny(['theo doi don', 'trang thai don', 'kiem tra don', 'don hang cua toi'])) {
      return { content: translate('supportA1') };
    }

    if (hasAny(['doi tra', 'hoan tra', 'tra hang', 'chinh sach doi', 'chinh sach tra'])) {
      return { content: translate('supportA2') };
    }

    if (hasAny(['phi van chuyen', 'tien ship', 'cuoc ship', 'freeship', 'mien phi van chuyen'])) {
      return { content: translate('supportA3') };
    }

    if (hasAny(['huy don', 'huy don hang', 'cancel order', 'huy mua'])) {
      return { content: translate('supportA4') };
    }

    if (hasAny([
      'lien he',
      'thong tin lien he',
      'so dien thoai cua shop',
      'so hotline',
      'hotline',
      'zalo',
      'email shop',
      'gmail shop',
      'contact',
      'support',
      'cham soc khach hang',
    ])) {
      return {
        content: [
          'Thông tin liên hệ cửa hàng:',
          `- Hotline: ${SUPPORT_PHONE}`,
          `- Zalo: ${SUPPORT_PHONE}`,
          `- Email: ${SUPPORT_EMAIL}`,
        ].join('\n'),
        actions: [
          { type: 'CONTACT_CALL', payload: { value: SUPPORT_PHONE }, note: 'Gọi hotline' },
          { type: 'CONTACT_ZALO', payload: { value: SUPPORT_PHONE }, note: 'Chat Zalo' },
          { type: 'CONTACT_EMAIL', payload: { value: SUPPORT_EMAIL }, note: 'Gửi email' },
        ],
      };
    }

    if (hasAny(['chinh sach', 'policy', 'ho tro he thong', 'tro giup'])) {
      return {
        content: [
          'Mình có thể hỗ trợ nhanh các chính sách ngay trong chat:',
          `1. ${translate('supportQ1')}`,
          `2. ${translate('supportQ2')}`,
          `3. ${translate('supportQ3')}`,
          `4. ${translate('supportQ4')}`,
          'Bạn chỉ cần hỏi đúng mục bạn cần, mình trả lời ngay.',
        ].join('\n'),
      };
    }

    return null;
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
      const supportReply = getSupportPolicyReply(userMessage.content);
      if (supportReply) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: supportReply.content,
          timestamp: new Date(),
          type: 'text',
          actions: supportReply.actions,
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

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

      if (!accessToken) {
        showToast(translate('loginRequiredAI'), 'error');
        onRequireLogin?.();
        return;
      }

      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await aiChat({ message: userMessage.content, history }, accessToken);
      const normalized = normalizeAiResponse(response, 'cannotSendAIRequest');
      const adviceIntent = isAdviceIntent(userMessage.content);
      const productIntent = isProductSearchIntent(userMessage.content);
      let filteredCards = filterAiCards(normalized.cards, userMessage.content);
      filteredCards = alignCardsWithReplyRequirements(normalized.reply, filteredCards);
      if (adviceIntent && !productIntent) {
        filteredCards = [];
      }
      if (productIntent && filteredCards.length > MAX_RENDERED_AI_CARDS) {
        filteredCards = filteredCards.slice(0, MAX_RENDERED_AI_CARDS);
      }
      const filteredActions = filterAiActions(normalized.actions, filteredCards);
      const replyContent = adviceIntent && !productIntent
        ? sanitizeAdviceReply(normalized.reply)
        : patchReplyCount(normalized.reply, filteredCards, normalized.cards);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: replyContent,
        timestamp: new Date(),
        type: 'text',
        cards: filteredCards,
        orderCards: normalized.orderCards,
        addressCards: normalized.addressCards,
        actions: filteredActions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.warn('AIChat.tsx - aiChat error', error);
      const resolved = resolveAiError(error, 'cannotSendAIRequest');
      if (resolved.shouldRequireLogin) {
        onRequireLogin?.();
      }
      showToast(resolved.key || resolved.message || translate('cannotSendAIRequest'), 'error');
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleAction = async (action: AiAction, sourceMessage: ChatMessage) => {
    if (action.type === 'CONTACT_CALL') {
      const phone = String(action.payload?.value || SUPPORT_PHONE).replace(/\s+/g, '');
      try {
        await Linking.openURL(`tel:${phone}`);
      } catch {
        showToast(translate('cannotPerformAction'), 'error');
      }
      return;
    }

    if (action.type === 'CONTACT_ZALO') {
      const phone = String(action.payload?.value || SUPPORT_PHONE).replace(/\s+/g, '');
      try {
        await Linking.openURL(`https://zalo.me/${phone}`);
      } catch {
        showToast(translate('cannotPerformAction'), 'error');
      }
      return;
    }

    if (action.type === 'CONTACT_EMAIL') {
      const email = String(action.payload?.value || SUPPORT_EMAIL).trim();
      try {
        await Linking.openURL(`mailto:${email}`);
      } catch {
        showToast(translate('cannotPerformAction'), 'error');
      }
      return;
    }

    if (!accessToken) {
      showToast(translate('loginRequiredAction'), 'error');
      onRequireLogin?.();
      return;
    }

    if (action.type === 'ADD_TO_CART') {
      const card =
        sourceMessage.cards?.find((c) => c.productId === action.payload.productId) ||
        sourceMessage.cards?.[0];
      if (!action.payload?.productId && !action.confirmationId) {
        showToast(translate('cannotPerformAction'), 'error');
        return;
      }
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
          const quantity = Math.max(1, action.payload.quantity || 1);
          if (card && card.stock > 0 && quantity > card.stock) {
            showToast(translate('not_enough_stock'), 'error');
            return;
          }
          await addCartItem(action.payload.productId, quantity, accessToken);
        }

        if (card && onAddToCart && action.payload?.productId) {
          onAddToCart(toProduct(card), Math.max(1, action.payload.quantity || 1));
        }
        showToast(translate('productAddedToCart'), 'success');
      } catch (error: any) {
        console.warn('AIChat.tsx - handleAction error', error);
        const resolved = resolveAiError(error, 'cannotPerformAction');
        if (resolved.shouldRequireLogin) {
          onRequireLogin?.();
        }
        showToast(resolved.key || resolved.message || translate('cannotPerformAction'), 'error');
      }
    }
  };

  const pickAndSendImage = async () => {
    if (!accessToken) {
      showToast(translate('loginRequiredAI'), 'error');
      onRequireLogin?.();
      return;
    }

    let optimisticMessageId: string | null = null;
    try {
      setIsUploading(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result?.didCancel) {
        setIsUploading(false);
        return;
      }
      if (result?.errorCode) {
        console.warn('AIChat.tsx - image picker error', result.errorCode, result.errorMessage);
        showToast(translate('image_picker_error'), 'error');
        setIsUploading(false);
        return;
      }
      const asset = result?.assets?.[0];
      if (!asset?.uri) {
        setIsUploading(false);
        return;
      }

      const localImageUri = asset.uri;
      const content = inputValue.trim() || translate('analyzeImageDefault');
      optimisticMessageId = Date.now().toString();
      const optimisticMessage: ChatMessage = {
        id: optimisticMessageId,
        role: 'user',
        content,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          imageUrl: localImageUri,
          isUploadingImage: true,
        },
      };

      const nextMessages = [...(messagesRef.current || []), optimisticMessage];
      setMessages(nextMessages);
      setInputValue('');
      setIsTyping(true);
      setIsSending(true);

      const file: UploadImageFile = {
        uri: localImageUri.replace('file://', ''),
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

      setMessages((prev) =>
        prev.map((m) => (
          m.id === optimisticMessageId
            ? {
              ...m,
              metadata: {
                ...(m.metadata || {}),
                imageUrl,
                isUploadingImage: false,
              },
            }
            : m
        )),
      );

      const history = nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await aiChat({ message: content, history, imageUrl }, accessToken);
      const normalized = normalizeAiResponse(response, 'cannotSendAIRequest');
      const adviceIntent = isAdviceIntent(content);
      const productIntent = isProductSearchIntent(content);
      // Image analysis often returns already-filtered cards; avoid filtering again.
      let filteredCards = normalized.cards;
      filteredCards = alignCardsWithReplyRequirements(normalized.reply, filteredCards);
      if (adviceIntent && !productIntent) {
        filteredCards = [];
      }
      if (productIntent && filteredCards.length > MAX_RENDERED_AI_CARDS) {
        filteredCards = filteredCards.slice(0, MAX_RENDERED_AI_CARDS);
      }
      const filteredActions = filterAiActions(normalized.actions, filteredCards);
      const replyContent = adviceIntent && !productIntent
        ? sanitizeAdviceReply(normalized.reply)
        : patchReplyCount(normalized.reply, filteredCards, normalized.cards);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: replyContent,
        timestamp: new Date(),
        type: 'text',
        cards: filteredCards,
        orderCards: normalized.orderCards,
        addressCards: normalized.addressCards,
        actions: filteredActions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.warn('AIChat.tsx - pickAndSendImage error', error);
      if (optimisticMessageId) {
        setMessages((prev) =>
          prev.map((m) => (
            m.id === optimisticMessageId
              ? {
                ...m,
                metadata: {
                  ...(m.metadata || {}),
                  isUploadingImage: false,
                },
              }
              : m
          )),
        );
      }
      const resolved = resolveAiError(error, 'cannotUploadImage');
      if (resolved.shouldRequireLogin) {
        onRequireLogin?.();
      }
      showToast(resolved.key || resolved.message || translate('cannotUploadImage'), 'error');
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
