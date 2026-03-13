import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AiAction, AiAddressCard, AiOrderCard, AiProductCard, ChatMessage } from '../../types';
import { AppIcon } from '../common/Icon';
import { useTheme, lightTheme } from '../../theme';

interface MessageBubbleProps {
  message: ChatMessage;
  onAction?: (action: AiAction, message: ChatMessage) => void;
  onSelectCard?: (card: AiProductCard) => void;
  onOpenOrderDetail?: (orderId: string) => void;
  onOpenAddressBook?: () => void;
}

export function MessageBubble({
  message,
  onAction,
  onSelectCard,
  onOpenOrderDetail,
  onOpenAddressBook,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme !== lightTheme;
  const [modalVisible, setModalVisible] = useState(false);

  const formatOrderDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('vi-VN');
  };

  const getActionLabel = (action: AiAction) => {
    if (action.note) return action.note;
    if (action.type === 'ADD_TO_CART') return 'Xác nhận thêm giỏ';
    if (action.type === 'CONTACT_CALL') return 'Gọi hotline';
    if (action.type === 'CONTACT_ZALO') return 'Chat Zalo';
    if (action.type === 'CONTACT_EMAIL') return 'Gửi email';
    return action.type;
  };

  const getActionIcon = (action: AiAction) => {
    if (action.type === 'ADD_TO_CART') return 'shopping-cart';
    if (action.type === 'CONTACT_CALL') return 'phone';
    if (action.type === 'CONTACT_ZALO') return 'message-circle';
    if (action.type === 'CONTACT_EMAIL') return 'mail';
    return 'flash';
  };

  const renderProductCard = (card: AiProductCard, index: number) => {
    const isOutOfStock = (card.stock ?? 0) <= 0;
    const action = message.actions?.find(
      (a) => a.type === 'ADD_TO_CART' && a.payload.productId === card.productId,
    );

    return (
      <View key={card.productId || `card-${index}`} className="border rounded-xl p-3 gap-1.5" style={{ borderColor: theme.border, backgroundColor: isDark ? '#1F2933' : '#F9FAFB' }}>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-sm font-semibold" style={{ color: isDark ? '#E5E7EB' : '#111827' }} numberOfLines={2}>
            {card.name}
          </Text>
          {card.code ? (
            <Text className="text-xs" style={{ color: theme.muted }} numberOfLines={1}>
              {card.code}
            </Text>
          ) : null}
        </View>
        <Text className="text-xs" style={{ color: theme.muted }} numberOfLines={1}>
          {card.category || (t ? t('product') : 'Product')}
        </Text>
        <View className="flex-row justify-between items-center mt-1 gap-3">
          <View>
            <Text className="text-base font-bold" style={{ color: theme.primary }}>{(card.price ?? 0).toLocaleString('vi-VN')}đ</Text>
            <Text className="text-xs font-medium" style={{ color: (card.stock ?? 0) > 0 ? '#16A34A' : '#DC2626' }}>
              {(card.stock ?? 0) > 0 ? t('stockLeft', { count: card.stock ?? 0 }) : t('out_of_stock')}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onSelectCard?.(card)}
              className="flex-row items-center gap-1.5 border px-2.5 py-1.5 rounded-[10px]"
              style={{ borderColor: theme.border }}
              activeOpacity={0.8}
            >
              <AppIcon name="eye" size={14} color={theme.text} />
              <Text className="text-xs font-semibold" style={{ color: theme.text }}>Xem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onAction?.(
                  action || {
                    type: 'ADD_TO_CART',
                    payload: { productId: card.productId, quantity: 1 },
                    requiresConfirmation: true,
                  },
                  message,
                )
              }
              className="flex-row items-center gap-1.5 border px-2.5 py-1.5 rounded-[10px]"
              style={{
                borderColor: 'transparent',
                backgroundColor: isOutOfStock ? theme.border : theme.primary,
                opacity: isOutOfStock ? 0.7 : 1,
              }}
              activeOpacity={0.8}
              disabled={isOutOfStock}
            >
              <AppIcon name="shopping-cart" size={14} color={isOutOfStock ? theme.muted : '#FFFFFF'} />
              <Text className="text-xs font-semibold" style={{ color: isOutOfStock ? theme.muted : '#FFFFFF' }}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderCard = (card: AiOrderCard, index: number) => {
    const statusText = card.isCancelled
      ? 'Đã hủy'
      : card.shipped
        ? 'Đã giao/đang giao'
        : 'Chưa giao';
    const statusColor = card.isCancelled ? '#DC2626' : card.shipped ? '#16A34A' : '#D97706';
    const orderedDate = formatOrderDate(card.orderedAt);
    const previewNames = (card.itemPreviewNames || []).filter(Boolean);
    const extraCount = Math.max(0, (card.itemCount || 0) - previewNames.length);
    const itemPreviewText = previewNames.length
      ? `${previewNames.join(', ')}${extraCount > 0 ? ` +${extraCount} món khác` : ''}`
      : null;

    return (
      <View
        key={`${card.orderId || card.code || `order-${index}`}`}
        className="border rounded-xl p-3 gap-1.5"
        style={{ borderColor: theme.border, backgroundColor: isDark ? '#1F2933' : '#F9FAFB' }}
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2 flex-1">
            <View className="w-[22px] h-[22px] rounded-lg items-center justify-center" style={{ backgroundColor: isDark ? '#111827' : '#E8EEFF' }}>
              <AppIcon name="shopping-cart" size={13} color={theme.primary} />
            </View>
            <Text className="flex-1 text-sm font-semibold" style={{ color: isDark ? '#E5E7EB' : '#111827' }} numberOfLines={1}>
              Đơn hàng
            </Text>
          </View>
          <Text className="text-xs" style={{ color: theme.muted }} numberOfLines={1}>
            {card.code}
          </Text>
        </View>
        <Text className="text-xs" style={{ color: statusColor }}>{statusText}</Text>
        {orderedDate ? (
          <Text className="text-xs" style={{ color: theme.muted }}>{`Ngày đặt: ${orderedDate}`}</Text>
        ) : null}
        {itemPreviewText ? (
          <Text className="text-[13px] leading-[18px]" style={{ color: isDark ? '#CBD5E1' : '#374151' }} numberOfLines={2}>
            {`Sản phẩm: ${itemPreviewText}`}
          </Text>
        ) : null}
        <Text className="text-[13px] leading-[18px]" style={{ color: theme.muted }} numberOfLines={1}>
          {`Thanh toán: ${card.payment || 'N/A'} | ${card.paymentStatus || 'N/A'}`}
        </Text>
        <View className="flex-row justify-between items-center mt-1 gap-3">
          <View>
            <Text className="text-base font-bold" style={{ color: theme.primary }}>
              {(card.total ?? 0).toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => card.orderId && onOpenOrderDetail?.(card.orderId)}
              className="flex-row items-center gap-1.5 border px-2.5 py-1.5 rounded-[10px]"
              style={{ borderColor: theme.border }}
              activeOpacity={0.9}
            >
              <AppIcon name="eye" size={14} color={theme.text} />
              <Text className="text-xs font-semibold" style={{ color: theme.text }}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderAddressCard = (card: AiAddressCard, index: number) => {
    return (
      <View
        key={`${card.name}-${card.phone}-${index}`}
        className="border rounded-xl p-3 gap-1.5"
        style={{ borderColor: theme.border, backgroundColor: isDark ? '#1F2933' : '#F9FAFB' }}
      >
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2 flex-1">
            <View className="w-[22px] h-[22px] rounded-lg items-center justify-center" style={{ backgroundColor: isDark ? '#111827' : '#E8EEFF' }}>
              <AppIcon name="map-pin" size={13} color={theme.primary} />
            </View>
            <Text className="flex-1 text-sm font-semibold" style={{ color: isDark ? '#E5E7EB' : '#111827' }} numberOfLines={1}>
              {card.name}
            </Text>
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: card.isDefault ? theme.primary : (isDark ? '#374151' : '#EEF2FF') }}
          >
            <Text className="text-[11px] font-semibold" style={{ color: card.isDefault ? '#FFFFFF' : theme.muted }}>
              {card.isDefault ? 'Mặc định' : card.type || 'Địa chỉ'}
            </Text>
          </View>
        </View>
        <Text className="text-xs" style={{ color: theme.muted }}>{card.phone}</Text>
        <Text className="text-[13px] leading-[18px]" style={{ color: isDark ? '#CBD5E1' : '#374151' }} numberOfLines={2}>
          {card.line1}
        </Text>
        <View className="flex-row justify-between items-center mt-1 gap-3">
          <View />
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => onOpenAddressBook?.()}
              className="flex-row items-center gap-1.5 border px-2.5 py-1.5 rounded-[10px]"
              style={{ backgroundColor: theme.primary, borderColor: 'transparent' }}
              activeOpacity={0.9}
            >
              <AppIcon name="map-pin" size={14} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white">Sổ địa chỉ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className={`w-full mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[85%] flex-row gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full justify-center items-center" style={{ backgroundColor: theme.primary }}>
            <AppIcon name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}

        <View className="flex-1 gap-1">
          <View
            className="px-4 py-3 rounded-2xl"
            style={{
              ...(isUser
                ? {
                  backgroundColor: isDark ? '#3B4A5C' : theme.primary,
                  borderTopRightRadius: 4,
                }
                : {
                  backgroundColor: isDark ? '#1F2933' : '#FFFFFF',
                  borderColor: isDark ? '#2F3A44' : '#F3F4F6',
                  borderWidth: 1,
                  borderTopLeftRadius: 4,
                }),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Text className="text-[15px] leading-[22px]" style={{ color: isUser ? '#FFFFFF' : isDark ? '#E5E7EB' : '#111827' }}>
              {typeof message.content === 'string' ? message.content : (message.content as any)?.text || ''}
            </Text>
          </View>

          {!isUser && (
            <View className="flex-row items-center gap-3 pl-1">
              <Text className="text-[10px]" style={{ color: '#9CA3AF' }}>
                {new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <AppIcon name="copy" size={12} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {message.metadata?.imageUrl && (
            <>
              <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.9}>
                <Image
                  source={{ uri: message.metadata.imageUrl }}
                  className="mt-2.5 w-full min-h-[120px] rounded-xl"
                  style={{ backgroundColor: '#E5E7EB' }}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
                  <TouchableOpacity className="absolute top-[50px] right-5 z-[999] p-2.5 rounded-[20px]" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} onPress={() => setModalVisible(false)}>
                    <AppIcon name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: message.metadata.imageUrl }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
              </Modal>
            </>
          )}

          {!isUser && message.cards?.length ? (
            <View className="mt-3 gap-3">
              {message.cards.map(renderProductCard)}
            </View>
          ) : null}

          {!isUser && message.orderCards?.length ? (
            <View className="mt-3 gap-3">
              {message.orderCards.map(renderOrderCard)}
            </View>
          ) : null}

          {!isUser && message.addressCards?.length ? (
            <View className="mt-3 gap-3">
              {message.addressCards.map(renderAddressCard)}
            </View>
          ) : null}

          {!isUser && message.actions?.length ? (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {message.actions.map((action) => (
                <TouchableOpacity
                  key={action.confirmationId || action.type}
                  className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                  style={{ borderColor: theme.border }}
                  onPress={() => onAction?.(action, message)}
                  activeOpacity={0.8}
                >
                  <AppIcon name={getActionIcon(action)} size={12} color={theme.primary} />
                  <Text className="text-xs font-semibold" style={{ color: theme.text }}>
                    {getActionLabel(action)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
