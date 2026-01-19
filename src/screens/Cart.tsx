import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartItem, Voucher } from '../types';
import { AVAILABLE_VOUCHERS } from '../constants/data';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { CartEmptyState } from '../components/cart/CartEmptyState';
import { CartItemRow } from '../components/cart/CartItemRow';
import { CartSummary } from '../components/cart/CartSummary';
import { CartVoucherModal } from '../components/cart/CartVoucherModal';
import { CartOptionModal } from '../components/cart/CartOptionModal';

interface CartProps {
  onCheckout?: (voucher: Voucher | null) => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemOptions?: (itemId: string, selectedOption?: string, selectedClassification?: string) => void;
  onExplore?: () => void;
  theme?: Theme;
  vouchers?: Voucher[];
  appliedVoucher?: Voucher | null;
  onVoucherChange?: (voucher: Voucher | null) => void;
}

export function Cart({ onCheckout, items, onUpdateQuantity, onRemoveItem, onUpdateItemOptions, onExplore, theme, vouchers, appliedVoucher: externalAppliedVoucher, onVoucherChange }: CartProps) {
  const { t: translate } = useTranslation();
  const { theme: ctxTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const t = theme || ctxTheme || lightTheme;
  const voucherList = vouchers && vouchers.length > 0 ? vouchers : AVAILABLE_VOUCHERS;

  const [voucherCode, setVoucherCode] = useState(externalAppliedVoucher?.code || '');
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(externalAppliedVoucher || null);

  // Sync with external voucher when it changes
  useEffect(() => {
    if (externalAppliedVoucher !== appliedVoucher) {
      setAppliedVoucher(externalAppliedVoucher || null);
      setVoucherCode(externalAppliedVoucher?.code || '');
    }
  }, [externalAppliedVoucher]);

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

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
        onVoucherChange?.(voucher);
        showToast(translate('voucher_success'), 'success');
      } else {
        showToast(translate('voucher_min_order', { amount: voucher.minTotal.toLocaleString('vi-VN') }), 'error');
      }
    } else {
      showToast(translate('voucher_invalid'), 'error');
    }
  };

  const handleUpdateOptions = (option: string) => {
    if (onUpdateItemOptions && editingItem) {
      onUpdateItemOptions(
        editingItem.id,
        option,
        editingItem.selectedClassification
      );
    }
    setShowOptionModal(false);
    setEditingItem(null);
  };

  const handleUpdateClassification = (classification: string) => {
    if (onUpdateItemOptions && editingItem) {
      onUpdateItemOptions(
        editingItem.id,
        editingItem.selectedOption,
        classification
      );
    }
    setShowClassificationModal(false);
    setEditingItem(null);
  };

  if (items.length === 0) {
    return <CartEmptyState onExplore={onExplore} theme={t} />;
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
            <CartItemRow
              key={`${item.id}-${index}`}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              onEditOption={(item) => {
                setEditingItem(item);
                setShowOptionModal(true);
              }}
              onEditClassification={(item) => {
                setEditingItem(item);
                setShowClassificationModal(true);
              }}
              theme={t}
            />
          ))}
        </View>

        <CartSummary
          subtotal={subtotal}
          shipping={shipping}
          discountAmount={discountAmount}
          total={total}
          voucherCode={voucherCode}
          appliedVoucher={appliedVoucher}
          onOpenVoucherList={() => setShowVoucherList(true)}
          onCheckout={() => onCheckout?.(appliedVoucher)}
          theme={t}
        />
      </ScrollView>

      {/* Voucher Modal */}
      <CartVoucherModal
        visible={showVoucherList}
        onClose={() => setShowVoucherList(false)}
        vouchers={voucherList}
        appliedVoucherCode={appliedVoucher?.code}
        subtotal={subtotal}
        onApplyVoucher={handleApplyVoucher}
        theme={t}
      />

      {/* Option Selection Modal */}
      <CartOptionModal
        visible={showOptionModal}
        onClose={() => setShowOptionModal(false)}
        title="Chọn Tùy chọn"
        options={editingItem?.options || []}
        selectedOption={editingItem?.selectedOption}
        onSelect={handleUpdateOptions}
        theme={t}
      />

      {/* Classification Selection Modal */}
      <CartOptionModal
        visible={showClassificationModal}
        onClose={() => setShowClassificationModal(false)}
        title="Chọn Phân loại"
        options={editingItem?.classifications || []}
        selectedOption={editingItem?.selectedClassification}
        onSelect={handleUpdateClassification}
        theme={t}
      />
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
});
