import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AppIcon } from '../components/common/Icon';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { formatPrice } from '../lib/utils';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

const MOCK_ORDER_DETAIL = {
  id: 'ORD-2024-001',
  date: '20/01/2026 14:30',
  status: 'processing',
  statusText: 'Đang xử lý',
  items: [
    {
      id: 1,
      name: 'Arduino Uno R3',
      price: 150000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=100',
    },
    {
      id: 2,
      name: 'Cảm biến siêu âm HC-SR04',
      price: 25000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=100',
    },
  ],
  shippingAddress: {
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  },
  payment: {
    method: 'Thanh toán khi nhận hàng (COD)',
    subtotal: 175000,
    shippingFee: 15000,
    discount: 0,
    total: 190000,
  },
  timeline: [
    { time: '14:30 20/01/2026', title: 'Đặt hàng thành công', active: true },
    { time: '14:45 20/01/2026', title: 'Đã xác nhận đơn hàng', active: true },
    { time: '15:00 20/01/2026', title: 'Đang đóng gói', active: true },
    { time: '', title: 'Đang giao hàng', active: false },
    { time: '', title: 'Giao hàng thành công', active: false },
  ],
};

export function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const order = MOCK_ORDER_DETAIL;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <Text style={styles.orderId}>Mã đơn: #{orderId}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{order.statusText}</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            {order.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot,
                  item.active && styles.timelineDotActive,
                ]} />
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitle,
                    !item.active && styles.timelineTitleInactive,
                  ]}>
                    {item.title}
                  </Text>
                  {item.time && (
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon name="map-pin" size={18} color="#2563EB" />
            <Text style={styles.cardTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <Text style={styles.addressName}>
            {order.shippingAddress.name} | {order.shippingAddress.phone}
          </Text>
          <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
        </View>

        {/* Products */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon name="package" size={18} color="#2563EB" />
            <Text style={styles.cardTitle}>Sản phẩm</Text>
          </View>
          <View style={styles.productsList}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.productItem}>
                <ImageWithFallback
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productQuantity}>x{item.quantity}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon name="credit-card" size={18} color="#2563EB" />
            <Text style={styles.cardTitle}>Thanh toán</Text>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tổng tiền hàng</Text>
              <Text style={styles.paymentValue}>{formatPrice(order.payment.subtotal)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí vận chuyển</Text>
              <Text style={styles.paymentValue}>{formatPrice(order.payment.shippingFee)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Giảm giá</Text>
              <Text style={[styles.paymentValue, styles.discountValue]}>
                -{formatPrice(order.payment.discount)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Thành tiền</Text>
              <Text style={styles.totalValue}>{formatPrice(order.payment.total)}</Text>
            </View>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={styles.paymentMethodText}>
              Phương thức: {order.payment.method}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.supportButton} activeOpacity={0.7}>
          <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reorderButton} activeOpacity={0.8}>
          <Text style={styles.reorderButtonText}>Mua lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
  timeline: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#F3F4F6',
    gap: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: -9,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  timelineDotActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  timelineTitleInactive: {
    color: '#9CA3AF',
  },
  timelineTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  productsList: {
    gap: 16,
  },
  productItem: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  paymentDetails: {
    gap: 8,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
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
  paymentMethod: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  supportButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  reorderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
