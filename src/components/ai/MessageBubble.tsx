import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AiAction, AiProductCard, ChatMessage } from '../../types';
import { AppIcon } from '../common/Icon';
import { useTheme, lightTheme } from '../../theme';

interface MessageBubbleProps {
  message: ChatMessage;
  onAction?: (action: AiAction, message: ChatMessage) => void;
  onSelectCard?: (card: AiProductCard) => void;
}

export function MessageBubble({ message, onAction, onSelectCard }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme !== lightTheme;
  const [modalVisible, setModalVisible] = useState(false);

  const renderProductCard = (card: AiProductCard) => {
    const isOutOfStock = card.stock <= 0;
    const action = message.actions?.find(
      (a) => a.type === 'ADD_TO_CART' && a.payload.productId === card.productId,
    );

    return (
      <View key={card.productId} style={[styles.productCard, { borderColor: theme.border, backgroundColor: isDark ? '#1F2933' : '#F9FAFB' }]}>
        <View style={styles.productCardHeader}>
          <Text style={[styles.productName, { color: isDark ? '#E5E7EB' : '#111827' }]} numberOfLines={2}>
            {card.name}
          </Text>
          {card.code ? (
            <Text style={[styles.productCode, { color: theme.muted }]} numberOfLines={1}>
              {card.code}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.productMeta, { color: theme.muted }]} numberOfLines={1}>
          {card.category || (t ? t('product') : 'Product')}
        </Text>
        <View style={styles.productFooter}>
          <View>
            <Text style={[styles.productPrice, { color: theme.primary }]}>{card.price.toLocaleString('vi-VN')}đ</Text>
            <Text style={[styles.productStock, { color: card.stock > 0 ? '#16A34A' : '#DC2626' }]}>
              {card.stock > 0 ? t('stockLeft', { count: card.stock }) : t('out_of_stock')}
            </Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity
              onPress={() => onSelectCard?.(card)}
              style={[styles.cardButton, { borderColor: theme.border }]}
              activeOpacity={0.8}
            >
              <AppIcon name="eye" size={14} color={theme.text} />
              <Text style={[styles.cardButtonText, { color: theme.text }]}>Xem</Text>
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
              style={[
                styles.cardButton,
                styles.cardButtonPrimary,
                {
                  backgroundColor: isOutOfStock ? theme.border : theme.primary,
                  opacity: isOutOfStock ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
              disabled={isOutOfStock}
            >
              <AppIcon name="shopping-cart" size={14} color={isOutOfStock ? theme.muted : '#FFFFFF'} />
              <Text style={[styles.cardButtonText, { color: isOutOfStock ? theme.muted : '#FFFFFF' }]}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isUser && styles.containerUser]}>
      <View style={[styles.contentWrapper, isUser && styles.contentWrapperUser]}>
        {/* Avatar */}
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <AppIcon name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: isDark ? '#3B4A5C' : theme.primary }]
              : [styles.bubbleAI, { backgroundColor: isDark ? '#1F2933' : '#FFFFFF', borderColor: isDark ? '#2F3A44' : '#F3F4F6' }],
          ]}>
            <Text style={[
              styles.messageText,
              { color: isUser ? '#FFFFFF' : isDark ? '#E5E7EB' : '#111827' },
            ]}>
              {message.content}
            </Text>
          </View>

          {/* Metadata for AI */}
          {!isUser && (
            <View style={styles.metadata}>
              <Text style={[styles.timestamp, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>
                {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <AppIcon name="copy" size={12} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Image preview */}
          {message.metadata?.imageUrl && (
            <>
              <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.9}>
                <Image
                  source={{ uri: message.metadata.imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.fullScreenContainer}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <AppIcon name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: message.metadata.imageUrl }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                </View>
              </Modal>
            </>
          )}

          {/* Product cards / actions */}
          {!isUser && message.cards?.length ? (
            <View style={styles.productList}>
              {message.cards.map(renderProductCard)}
            </View>
          ) : null}

          {!isUser && message.actions?.length ? (
            <View style={styles.actions}>
              {message.actions.map((action) => (
                <TouchableOpacity
                  key={action.confirmationId || action.type}
                  style={[styles.actionChip, { borderColor: theme.border }]}
                  onPress={() => onAction?.(action, message)}
                  activeOpacity={0.8}
                >
                  <AppIcon name="flash" size={12} color={theme.primary} />
                  <Text style={[styles.actionText, { color: theme.text }]}>
                    {action.type === 'ADD_TO_CART'
                      ? 'Xác nhận thêm giỏ'
                      : action.note || action.type}
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  containerUser: {
    alignItems: 'flex-end',
  },
  contentWrapper: {
    flexDirection: 'row',
    maxWidth: '85%',
    gap: 12,
  },
  contentWrapperUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderTopRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111827',
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  productList: {
    marginTop: 12,
    gap: 12,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  productCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  productCode: {
    fontSize: 12,
  },
  productMeta: {
    fontSize: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  productStock: {
    fontSize: 12,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  cardButtonPrimary: {
    borderColor: 'transparent',
  },
  cardButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewImage: {
    marginTop: 10,
    width: '100%',
    minHeight: 120,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
});
