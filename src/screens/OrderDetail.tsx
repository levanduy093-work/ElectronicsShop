import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { formatPrice } from '../utils';
import { Order, Product } from '../types';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
  order?: Order;
  theme?: Theme;
  onReorder?: (product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => void;
  products?: Product[];
  onNavigateToCart?: () => void;
  onRefreshOrder?: (orderId: string) => void;
}

const DEFAULT_ORDER: Order = {
  id: 'placeholder-id',
  code: 'ORD-2024-001',
  date: '20/01/2026 14:30',
  status: 'processing',
  statusText: 'Đang xử lý',
  items: [
    {
      id: '1',
      name: 'Arduino Uno R3',
      price: 150000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=100',
    },
    {
      id: '2',
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
    method: 'Thanh toán qua VNPAY',
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

export function OrderDetail({ orderId, onBack, order, theme, onReorder, products = [], onNavigateToCart, onRefreshOrder }: OrderDetailProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const orderData = order || DEFAULT_ORDER;
  const { showToast } = useToast();
  const [isReordering, setIsReordering] = useState(false);

  // Auto-refresh order when component mounts or orderId changes
  useEffect(() => {
    if (onRefreshOrder && orderId) {
      onRefreshOrder(orderId);
      // Set up polling to refresh order every 30 seconds
      const interval = setInterval(() => {
        onRefreshOrder(orderId);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId, onRefreshOrder]);

  const handleReorder = () => {
    if (!onReorder) {
      showToast(translate('reorderNotActivated'), 'error');
      return;
    }

    if (isReordering) return;
    setIsReordering(true);

    const outOfStockItems: string[] = [];
    const availableItems: Array<{ product: Product; quantity: number; selectedOption?: string; selectedClassification?: string }> = [];

    // Check stock for each item
    orderData.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      
      if (!product) {
        outOfStockItems.push(item.name);
        return;
      }

      const isOutOfStock = product.stock === 'Out of Stock' || 
                          (product.stockQuantity !== undefined && product.stockQuantity <= 0);
      
      if (isOutOfStock) {
        outOfStockItems.push(item.name);
      } else {
        // Check if requested quantity is available
        const availableQuantity = product.stockQuantity ?? item.quantity;
        const quantityToAdd = Math.min(item.quantity, availableQuantity);
        availableItems.push({ 
          product, 
          quantity: quantityToAdd,
          selectedOption: item.selectedOption,
          selectedClassification: item.selectedClassification,
        });
      }
    });

    // Add available items to cart
    availableItems.forEach(item => {
      onReorder(item.product, item.quantity, item.selectedOption, item.selectedClassification);
    });

    // Show appropriate message
    if (availableItems.length === 0) {
      showToast(translate('allProductsOutOfStock'), 'error');
    } else if (outOfStockItems.length === 0) {
      showToast(translate('products_added_to_cart', { count: availableItems.length }), 'success');
      setTimeout(() => onNavigateToCart?.(), 500);
    } else {
      const productsList = outOfStockItems.slice(0, 2).join(', ') + (outOfStockItems.length > 2 ? '...' : '');
      showToast(
        translate('products_added_some_out_of_stock', {
          count: availableItems.length,
          outOfStockCount: outOfStockItems.length,
          products: productsList,
        }),
        'info'
      );
      setTimeout(() => onNavigateToCart?.(), 500);
    }

    setIsReordering(false);
  };

  // Get the latest active status from timeline
  const getStatusFromTimeline = (order: Order) => {
    if (order.status === 'cancelled') {
      return {
        text: translate('order_status_cancelled'),
        color: '#EF4444',
        bgColor: t === lightTheme ? '#FEE2E2' : 'rgba(239,68,68,0.16)',
      };
    }
    
    // Find the last active step in timeline
    const activeSteps = order.timeline.filter(item => item.active);
    if (activeSteps.length === 0) {
      return {
        text: translate('order_placed_success'),
        color: t === lightTheme ? '#F59E0B' : '#FBBF24',
        bgColor: t === lightTheme ? '#FEF3C7' : 'rgba(251,191,36,0.16)',
      };
    }
    
    const lastActiveStep = activeSteps[activeSteps.length - 1];
    const statusTitle = lastActiveStep.title;
    
    // Determine color based on status title
    let color = t.primary;
    let bgColor = t === lightTheme ? '#DBEAFE' : 'rgba(37,99,235,0.16)';
    
    if (statusTitle === translate('order_placed_success')) {
      color = t === lightTheme ? '#F59E0B' : '#FBBF24';
      bgColor = t === lightTheme ? '#FEF3C7' : 'rgba(251,191,36,0.16)';
    } else if (statusTitle === translate('order_confirmed')) {
      color = t === lightTheme ? '#F59E0B' : '#FBBF24';
      bgColor = t === lightTheme ? '#FEF3C7' : 'rgba(251,191,36,0.16)';
    } else if (statusTitle === translate('order_packing')) {
      color = t === lightTheme ? '#F59E0B' : '#FBBF24';
      bgColor = t === lightTheme ? '#FEF3C7' : 'rgba(251,191,36,0.16)';
    } else if (statusTitle === translate('order_shipping')) {
      color = t.primary;
      bgColor = t === lightTheme ? '#DBEAFE' : 'rgba(37,99,235,0.16)';
    } else if (statusTitle === translate('order_delivery_success')) {
      color = '#10B981';
      bgColor = t === lightTheme ? '#D1FAE5' : 'rgba(16,185,129,0.16)';
    }
    
    return {
      text: statusTitle,
      color,
      bgColor,
    };
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
        <Text style={[styles.title, { color: t.text }]}>{translate('order_details')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[
          styles.card,
          {
            backgroundColor: t.card,
            borderColor: t.border,
            shadowOpacity: t === lightTheme ? 0.05 : 0,
            elevation: t === lightTheme ? 2 : 0,
          }
        ]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.orderId, { color: t.text }]}>{translate('order_id')} #{orderData.code || orderId}</Text>
          </View>
          <View style={styles.statusBadgeContainer}>
            {(() => {
              const statusInfo = getStatusFromTimeline(orderData);
              return (
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusInfo.bgColor,
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: statusInfo.color }
                  ]}>
                    {statusInfo.text}
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Timeline */}
          <View style={[styles.timeline, { borderLeftColor: t.border }]}>
            {orderData.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot,
                  {
                    borderColor: item.active ? t.primary : t.border,
                    backgroundColor: item.active ? t.primary : t.surface,
                  }
                ]} />
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitle,
                    { color: item.active ? t.text : t.muted },
                  ]}>
                    {item.title}
                  </Text>
                  {item.time && (
                    <Text style={[styles.timelineTime, { color: t.muted }]}>{item.time}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Address */}
        <View style={[
          styles.card,
          {
            backgroundColor: t.card,
            borderColor: t.border,
            shadowOpacity: t === lightTheme ? 0.05 : 0,
            elevation: t === lightTheme ? 2 : 0,
          }
        ]}>
          <View style={styles.cardHeader}>
            <AppIcon name="map-pin" size={18} color={t.primary} />
            <Text style={[styles.cardTitle, { color: t.text }]}>{translate('shipping_address')}</Text>
          </View>
          <Text style={[styles.addressName, { color: t.text }]}>
            {orderData.shippingAddress.name} | {orderData.shippingAddress.phone}
          </Text>
          <Text style={[styles.addressText, { color: t.muted }]}>{orderData.shippingAddress.address}</Text>
        </View>

        {/* Products */}
        <View style={[
          styles.card,
          {
            backgroundColor: t.card,
            borderColor: t.border,
            shadowOpacity: t === lightTheme ? 0.05 : 0,
            elevation: t === lightTheme ? 2 : 0,
          }
        ]}>
          <View style={styles.cardHeader}>
            <AppIcon name="package" size={18} color={t.primary} />
            <Text style={[styles.cardTitle, { color: t.text }]}>{translate('product')}</Text>
          </View>
          <View style={styles.productsList}>
            {orderData.items.map((item) => {
              const product = products.find(p => p.id === item.id);
              const displayOptions = product?.options || [];
              const displayClassifications = product?.classifications || [];
              
              return (
                <View key={item.id} style={styles.productItem}>
                  <ImageWithFallback
                    source={{ uri: item.image }}
                    style={[styles.productImage, { backgroundColor: t.surface }]}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: t.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {(item.selectedOption || item.selectedClassification || displayOptions.length > 0 || displayClassifications.length > 0) && (
                      <View style={styles.optionsContainer}>
                        {(item.selectedOption || (displayOptions.length > 0 && !item.selectedOption)) && (
                          <View style={[styles.optionTag, { backgroundColor: t.surface, borderColor: t.border }]}>
                            <Text style={[styles.optionLabel, { color: t.muted }]}>Tùy chọn: </Text>
                            <Text style={[styles.optionValue, { color: t.primary }]}>
                              {item.selectedOption || (displayOptions.length > 0 ? displayOptions[0] : '')}
                            </Text>
                          </View>
                        )}
                        {(item.selectedClassification || (displayClassifications.length > 0 && !item.selectedClassification)) && (
                          <View style={[styles.optionTag, { backgroundColor: t.surface, borderColor: t.border }]}>
                            <Text style={[styles.optionLabel, { color: t.muted }]}>Phân loại: </Text>
                            <Text style={[styles.optionValue, { color: t.primary }]}>
                              {item.selectedClassification || (displayClassifications.length > 0 ? displayClassifications[0] : '')}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    <View style={styles.productFooter}>
                      <Text style={[styles.productQuantity, { color: t.muted }]}>x{item.quantity}</Text>
                      <Text style={[styles.productPrice, { color: t.primary }]}>{formatPrice(item.price)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Payment Info */}
        <View style={[
          styles.card,
          {
            backgroundColor: t.card,
            borderColor: t.border,
            shadowOpacity: t === lightTheme ? 0.05 : 0,
            elevation: t === lightTheme ? 2 : 0,
          }
        ]}>
          <View style={styles.cardHeader}>
            <AppIcon name="credit-card" size={18} color={t.primary} />
            <Text style={[styles.cardTitle, { color: t.text }]}>{translate('payment')}</Text>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: t.muted }]}>{translate('subtotal')}</Text>
              <Text style={[styles.paymentValue, { color: t.text }]}>{formatPrice(orderData.payment.subtotal)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: t.muted }]}>{translate('shipping_fee')}</Text>
              <Text style={[styles.paymentValue, { color: t.text }]}>{formatPrice(orderData.payment.shippingFee)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: t.muted }]}>{translate('discount')}</Text>
              <Text style={[styles.paymentValue, { color: '#10B981' }]}>
                -{formatPrice(orderData.payment.discount)}
              </Text>
            </View>
            <View style={[styles.totalRow, { borderTopColor: t.border }]}>
              <Text style={[styles.totalLabel, { color: t.text }]}>{translate('total_amount')}</Text>
              <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(orderData.payment.total)}</Text>
            </View>
          </View>

          <View style={[styles.paymentMethod, { backgroundColor: t.surface }]}>
            <Text style={[styles.paymentMethodText, { color: t.muted }]}>
              {translate('payment_method')} {orderData.payment.method}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[
        styles.actions,
        {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.supportButton,
            {
              borderColor: t.border,
              backgroundColor: t.card,
            }
          ]} 
          activeOpacity={0.7}
        >
          <Text style={[styles.supportButtonText, { color: t.text }]}>{translate('contact_support')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.reorderButton,
            {
              backgroundColor: isReordering ? t.border : t.primary,
            }
          ]} 
          activeOpacity={0.8}
          onPress={handleReorder}
          disabled={isReordering}
        >
          <Text style={[styles.reorderButtonText, { color: isReordering ? t.muted : '#FFFFFF' }]}>
            {isReordering ? translate('processing') : translate('reorder')}
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  statusHeader: {
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadgeContainer: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 8,
    borderLeftWidth: 2,
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
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
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
  },
  addressName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
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
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productQuantity: {
    fontSize: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  optionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  optionValue: {
    fontSize: 11,
    fontWeight: '600',
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
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentMethod: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  supportButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reorderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
