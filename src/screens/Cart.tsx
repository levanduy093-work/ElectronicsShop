import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CartItem, AVAILABLE_VOUCHERS, Voucher } from '../lib/data';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';
import { Theme, lightTheme, useTheme } from '../lib/theme';
import { useToast } from '../components/common/ToastProvider';

interface CartProps {
  onCheckout?: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onExplore?: () => void;
  theme?: Theme;
  vouchers?: Voucher[];
}

export function Cart({ onCheckout, items, onUpdateQuantity, onRemoveItem, onExplore, theme, vouchers }: CartProps) {
  const { t: translate } = useTranslation();
  const { theme: ctxTheme } = useTheme();
  const { showToast } = useToast();
  const t = theme || ctxTheme || lightTheme;
  const voucherList = vouchers && vouchers.length > 0 ? vouchers : AVAILABLE_VOUCHERS;
  const [voucherCode, setVoucherCode] = useState('');
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const accentBg = t === lightTheme ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.08)';
  const accentBorder = t === lightTheme ? '#2563EB' : t.primary;
  const overlayBg = t === lightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  
  let discountAmount = 0;
  if (appliedVoucher) {
    const voucherType = appliedVoucher.type || 'fixed';
    if (voucherType === 'shipping') {
      discountAmount = Math.min(appliedVoucher.discountPrice, shipping);
    } else if (voucherType === 'percentage') {
      const rate = Number(appliedVoucher.discountRate ?? 0);
      const rawDiscount = Math.max(0, subtotal * (rate / 100));
      const cap = appliedVoucher.maxDiscountPrice ?? Number.POSITIVE_INFINITY;
      discountAmount = Math.min(rawDiscount, cap);
    } else {
      discountAmount = appliedVoucher.discountPrice;
    }
  }

  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyVoucher = (code: string) => {
    const voucher = voucherList.find(v => v.code === code);
    if (voucher) {
      if (subtotal >= voucher.minTotal) {
        setAppliedVoucher(voucher);
        setVoucherCode(voucher.code);
        setShowVoucherList(false);
        showToast(translate('voucher_success'), 'success');
      } else {
        showToast(translate('voucher_min_order', { amount: voucher.minTotal.toLocaleString('vi-VN') }), 'error');
      }
    } else {
      showToast(translate('voucher_invalid'), 'error');
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: t.background }]}>
        <View style={[styles.emptyIcon, { backgroundColor: t.surface }]}>
          <AppIcon name="shopping-cart" size={32} color={t.muted} />
        </View>
        <Text style={[styles.emptyTitle, { color: t.text }]}>{translate('cart_empty_title')}</Text>
        <Text style={[styles.emptyText, { color: t.muted }]}>{translate('cart_empty_text')}</Text>
        <TouchableOpacity
          onPress={onExplore}
          style={[styles.exploreButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreButtonText}>{translate('explore_products')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: t.text }]}>{translate('cart_title_count', { count: items.length })}</Text>
        
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={[styles.itemCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 }]}>
              <ImageWithFallback
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemName, { color: t.text }]} numberOfLines={2}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => onRemoveItem(item.id)}
                    style={styles.removeButton}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="trash" size={16} color={t.muted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.itemCategory, { color: t.muted }]}>{item.category}</Text>
                
                <View style={styles.itemFooter}>
                  <Text style={[styles.itemPrice, { color: t.primary }]}>{formatPrice(item.price)}</Text>
                  
                  <View style={[styles.quantityContainer, { backgroundColor: t.surface }]}>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.id, -1)}
                      style={[styles.quantityButton, { backgroundColor: t.card, borderColor: t.border }]}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="minus" size={12} color={t.text} />
                    </TouchableOpacity>
                    <Text style={[styles.quantityText, { color: t.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.id, 1)}
                      style={[styles.quantityButton, { backgroundColor: t.card, borderColor: t.border }]}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="plus" size={12} color={t.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 }]}>
          <TouchableOpacity
            onPress={() => setShowVoucherList(true)}
            style={[styles.voucherInput, { backgroundColor: t.surface, borderColor: t.border }]}
            activeOpacity={0.7}
          >
            <AppIcon name="ticket" size={18} color={t.muted} style={styles.voucherIcon} />
            <Text style={[
              styles.voucherText,
              !voucherCode && styles.voucherPlaceholder,
              { color: voucherCode ? t.text : t.muted }
            ]}>
              {voucherCode || translate('voucher_placeholder')}
            </Text>
            <AppIcon name="chevron-right" size={16} color={t.muted} />
          </TouchableOpacity>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: t.muted }]}>{translate('subtotal')}</Text>
            <Text style={[styles.summaryValue, { color: t.text }]}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: t.muted }]}>{translate('shipping_fee')}</Text>
            <Text style={[styles.summaryValue, { color: t.text }]}>{formatPrice(shipping)}</Text>
          </View>
          
          {appliedVoucher && (
            <View style={styles.summaryRow}>
            <View style={styles.discountRow}>
              <AppIcon name="ticket" size={14} color="#10B981" />
              <Text style={[styles.discountLabel, { color: t.text }]}>{translate('voucher_discount')}</Text>
            </View>
            <Text style={[styles.discountValue, { color: t.text }]}>-{formatPrice(discountAmount)}</Text>
          </View>
          )}

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: t.text }]}>{translate('total')}</Text>
            <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(total)}</Text>
          </View>
          
          <TouchableOpacity
            onPress={onCheckout}
            style={[styles.checkoutButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>{translate('checkout_now')}</Text>
            <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Voucher Modal */}
      {showVoucherList && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={[styles.modalBackdrop, { backgroundColor: overlayBg }]}
            activeOpacity={1}
            onPress={() => setShowVoucherList(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: t.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.text }]}>{translate('select_voucher')}</Text>
              <TouchableOpacity
                onPress={() => setShowVoucherList(false)}
                activeOpacity={0.7}
              >
                <AppIcon name="close" size={24} color={t.muted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.voucherList}>
              {voucherList.length > 0 ? (
                voucherList.map((voucher) => {
                  const isEligible = subtotal >= voucher.minTotal;
                  const isSelected = appliedVoucher?.code === voucher.code;
                  const voucherType = voucher.type || (voucher.description?.toLowerCase().includes('ship') ? 'shipping' : 'fixed');
                  const expireDate = voucher.expire ? new Date(voucher.expire) : null;
                  const voucherLabel =
                    voucherType === 'shipping'
                      ? translate('discount_shipping')
                      : voucherType === 'percentage'
                        ? translate('discount_percent', { rate: voucher.discountRate ?? 0 })
                        : translate('discount_order');
                  const voucherCap =
                    voucherType === 'percentage' && voucher.maxDiscountPrice
                      ? translate('max_discount', { amount: voucher.maxDiscountPrice.toLocaleString('vi-VN') })
                      : '';

                  return (
                    <View
                      key={voucher.code}
                      style={[
                        styles.voucherCard,
                        { backgroundColor: t.surface, borderColor: t.border },
                        isSelected && { borderColor: accentBorder, backgroundColor: accentBg },
                        !isEligible && styles.voucherCardDisabled
                      ]}
                    >
                      <View style={[styles.voucherIconContainer, { backgroundColor: accentBg }]}>
                        <AppIcon name="ticket" size={24} color={accentBorder} />
                      </View>
                      <View style={styles.voucherInfo}>
                        <View style={styles.voucherHeader}>
                          <Text style={[styles.voucherCode, { color: t.text }]}>{voucher.code}</Text>
                        {isSelected && <AppIcon name="check-circle" size={20} color={accentBorder} />}
                      </View>
                      <Text style={[styles.voucherDescription, { color: t.muted }]}>{voucher.description}</Text>
                      <Text style={[styles.voucherMeta, { color: t.muted }]}>
                        {voucherLabel} {voucherCap ? voucherCap : ''} · {translate('min_order', { amount: voucher.minTotal.toLocaleString('vi-VN') })}
                      </Text>
                      {expireDate && (
                        <Text style={[styles.voucherMeta, { color: t.muted }]}>
                          {translate('expiry_date', { date: expireDate.toLocaleDateString('vi-VN') })}
                        </Text>
                      )}
                      {!isEligible && (
                        <Text style={[styles.voucherWarning, { color: '#FCA5A5' }]}>
                            {translate('buy_more', { amount: (voucher.minTotal - subtotal).toLocaleString('vi-VN') })}
                          </Text>
                        )}
                      </View>
                      {isEligible && (
                        <TouchableOpacity
                          onPress={() => handleApplyVoucher(voucher.code)}
                          style={[
                            styles.voucherApplyButton,
                            { backgroundColor: accentBg },
                            isSelected && { backgroundColor: accentBorder }
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.voucherApplyText,
                            { color: accentBorder },
                            isSelected && styles.voucherApplyTextActive
                          ]}>
                            {isSelected ? translate('using') : translate('use_now')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyVoucherContainer}>
                  <AppIcon name="ticket-outline" size={48} color={t.muted} />
                  <Text style={[styles.emptyVoucherText, { color: t.text }]}>{translate('no_voucher')}</Text>
                  <Text style={[styles.emptyVoucherSubtext, { color: t.muted }]}>{translate('check_later')}</Text>
                </View>
              )}
            </ScrollView>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  itemsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 4,
    gap: 12,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    minWidth: 16,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 16,
  },
  voucherIcon: {
    marginRight: 8,
  },
  voucherText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  voucherPlaceholder: {
    color: '#9CA3AF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountLabel: {
    fontSize: 14,
    color: '#10B981',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  checkoutButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  voucherList: {
    maxHeight: 400,
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  voucherCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  voucherCardDisabled: {
    opacity: 0.5,
  },
  voucherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  voucherDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  voucherMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  voucherWarning: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  voucherApplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  voucherApplyButtonActive: {
    backgroundColor: '#2563EB',
  },
  voucherApplyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  voucherApplyTextActive: {
    color: '#FFFFFF',
  },
  emptyVoucherContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyVoucherText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyVoucherSubtext: {
    fontSize: 14,
  },
});
