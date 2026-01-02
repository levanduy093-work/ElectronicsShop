import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CartItem, AVAILABLE_VOUCHERS, Voucher } from '../lib/data';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';

interface CartProps {
  onCheckout?: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onExplore?: () => void;
}

export function Cart({ onCheckout, items, onUpdateQuantity, onRemoveItem, onExplore }: CartProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'shipping') {
      discountAmount = Math.min(appliedVoucher.discount, shipping);
    } else {
      discountAmount = appliedVoucher.discount;
    }
  }

  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyVoucher = (code: string) => {
    const voucher = AVAILABLE_VOUCHERS.find(v => v.code === code);
    if (voucher) {
      if (subtotal >= voucher.minOrder) {
        setAppliedVoucher(voucher);
        setVoucherCode(voucher.code);
        setShowVoucherList(false);
      } else {
        Alert.alert('Thông báo', `Đơn hàng cần tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để sử dụng mã này.`);
      }
    } else {
      Alert.alert('Thông báo', 'Mã giảm giá không hợp lệ');
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <AppIcon name="shopping-cart" size={32} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptyText}>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</Text>
        <TouchableOpacity
          onPress={onExplore}
          style={styles.exploreButton}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreButtonText}>Khám phá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Giỏ hàng ({items.length})</Text>
        
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <ImageWithFallback
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => onRemoveItem(item.id)}
                    style={styles.removeButton}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="trash" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.id, -1)}
                      style={styles.quantityButton}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="minus" size={12} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => onUpdateQuantity(item.id, 1)}
                      style={styles.quantityButton}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="plus" size={12} color="#111827" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <TouchableOpacity
            onPress={() => setShowVoucherList(true)}
            style={styles.voucherInput}
            activeOpacity={0.7}
          >
            <AppIcon name="ticket" size={18} color="#9CA3AF" style={styles.voucherIcon} />
            <Text style={[styles.voucherText, !voucherCode && styles.voucherPlaceholder]}>
              {voucherCode || 'Chọn hoặc nhập mã giảm giá'}
            </Text>
            <AppIcon name="chevron-right" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{formatPrice(shipping)}</Text>
          </View>
          
          {appliedVoucher && (
            <View style={styles.summaryRow}>
            <View style={styles.discountRow}>
              <AppIcon name="ticket" size={14} color="#10B981" />
              <Text style={styles.discountLabel}>Voucher giảm giá</Text>
            </View>
            <Text style={styles.discountValue}>-{formatPrice(discountAmount)}</Text>
          </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
          
          <TouchableOpacity
            onPress={onCheckout}
            style={styles.checkoutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>Thanh toán ngay</Text>
            <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Voucher Modal */}
      {showVoucherList && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowVoucherList(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn mã giảm giá</Text>
              <TouchableOpacity
                onPress={() => setShowVoucherList(false)}
                activeOpacity={0.7}
              >
                <AppIcon name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.voucherList}>
              {AVAILABLE_VOUCHERS.map((voucher) => {
                const isEligible = subtotal >= voucher.minOrder;
                const isSelected = appliedVoucher?.code === voucher.code;

                return (
                  <View
                    key={voucher.code}
                    style={[
                      styles.voucherCard,
                      isSelected && styles.voucherCardSelected,
                      !isEligible && styles.voucherCardDisabled
                    ]}
                  >
                    <View style={styles.voucherIconContainer}>
                      <AppIcon name="ticket" size={24} color="#2563EB" />
                    </View>
                    <View style={styles.voucherInfo}>
                      <View style={styles.voucherHeader}>
                        <Text style={styles.voucherCode}>{voucher.code}</Text>
                        {isSelected && <AppIcon name="check-circle" size={20} color="#2563EB" />}
                      </View>
                      <Text style={styles.voucherDescription}>{voucher.description}</Text>
                      {!isEligible && (
                        <Text style={styles.voucherWarning}>
                          Mua thêm {(voucher.minOrder - subtotal).toLocaleString('vi-VN')}đ để sử dụng
                        </Text>
                      )}
                    </View>
                    {isEligible && (
                      <TouchableOpacity
                        onPress={() => handleApplyVoucher(voucher.code)}
                        style={[
                          styles.voucherApplyButton,
                          isSelected && styles.voucherApplyButtonActive
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.voucherApplyText,
                          isSelected && styles.voucherApplyTextActive
                        ]}>
                          {isSelected ? 'Đang dùng' : 'Dùng ngay'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
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
});
