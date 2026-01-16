import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { Order } from '../types';
import { formatPrice } from '../utils';

interface OrderHistoryProps {
  onBack: () => void;
  onViewDetail?: (orderId: string) => void;
  orders?: Order[];
  theme?: Theme;
}

export function OrderHistory({ onBack, onViewDetail, orders = [], theme }: OrderHistoryProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const t = theme || ctxTheme || lightTheme;

  // Debug: log số lượng orders
  console.log('OrderHistory - orders count:', orders.length);
  console.log('OrderHistory - orders:', orders.map(o => ({ id: o.id, status: o.status })));

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'processing': return t === lightTheme ? '#F59E0B' : '#FBBF24';
      case 'shipping': return t.primary;
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return t.muted;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'processing': return t === lightTheme ? '#FEF3C7' : 'rgba(251,191,36,0.16)';
      case 'shipping': return t === lightTheme ? '#DBEAFE' : 'rgba(37,99,235,0.16)';
      case 'completed': return t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.16)';
      case 'cancelled': return t === lightTheme ? '#FEE2E2' : 'rgba(239,68,68,0.16)';
      default: return t.surface;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={t.surface}
        translucent={true}
      />
      <View style={[
        styles.header,
        {
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.surface,
          borderBottomColor: t.border,
        }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>Đơn hàng của tôi</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: t.surface }]}>
              <AppIcon name="package" size={32} color={t.muted} />
            </View>
            <Text style={[styles.emptyText, { color: t.text }]}>Chưa có đơn hàng nào</Text>
            <Text style={[styles.emptySubtext, { color: t.muted }]}>Các đơn hàng của bạn sẽ hiển thị ở đây</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View
              key={order.id}
              style={[styles.orderCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 }]}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderId, { color: t.muted }]}>#{order.code}</Text>
                  <Text style={[styles.orderDate, { color: t.muted }]}>{order.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(order.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.orderItems, { borderTopColor: t.border }]}>
                {order.items.slice(0, 2).map((item, i) => (
                  <Text key={i} style={[styles.orderItemText, { color: t.text }]} numberOfLines={1}>
                    • {item.name} x{item.quantity}
                  </Text>
                ))}
                {order.items.length > 2 && (
                  <Text style={[styles.moreItemsText, { color: t.muted }]}>
                    + {order.items.length - 2} sản phẩm khác
                  </Text>
                )}
              </View>
              
              <View style={[styles.orderFooter, { borderTopColor: t.border }]}>
                <View>
                  <Text style={[styles.orderTotalLabel, { color: t.muted }]}>Tổng cộng:</Text>
                  <Text style={[styles.orderTotal, { color: t.primary }]}>{formatPrice(order.payment.total)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onViewDetail?.(order.id)}
                  style={[styles.viewDetailButton, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)', borderColor: t.primary }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewDetailText, { color: t.primary }]}>Xem chi tiết</Text>
                  <AppIcon name="chevron-right" size={16} color={t.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderItems: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 12,
    gap: 4,
  },
  orderItemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreItemsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  orderTotalLabel: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewDetailText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
