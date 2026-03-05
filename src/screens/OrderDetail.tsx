import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Order, Product } from '../types';
import { Theme, lightTheme, useTheme } from '../theme';
import { OrderTimeline } from '../components/order/OrderTimeline';
import { OrderAddress } from '../components/order/OrderAddress';
import { OrderProductList } from '../components/order/OrderProductList';
import { OrderPaymentInfo } from '../components/order/OrderPaymentInfo';
import { OrderActions } from '../components/order/OrderActions';
import { OrderSupportModal } from '../components/order/OrderSupportModal';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
  order?: Order;
  theme?: Theme;
  onReorder?: (product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => void;
  products?: Product[];
  onNavigateToCart?: () => void;
  onRefreshOrder?: (orderId: string) => void;
  onPayAgain?: (orderId: string) => Promise<{ paymentUrl?: string } | void>;
  accessToken?: string | null;
  onProductPress?: (productId: string) => void;
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

export function OrderDetail({ orderId, onBack, order, theme, onReorder, products = [], onNavigateToCart, onRefreshOrder, onPayAgain, accessToken, onProductPress }: OrderDetailProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const orderData = order || DEFAULT_ORDER;
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  // Refresh order when component mounts or orderId changes
  useEffect(() => {
    if (onRefreshOrder && orderId) {
      onRefreshOrder(orderId);
    }
  }, [orderId, onRefreshOrder]);


  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={t.surface}
        translucent={true}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b shadow-sm"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.surface,
          borderBottomColor: t.border,
          ...Platform.select({
            android: {
              elevation: 4,
            },
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            }
          }),
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: t.text }}>{translate('order_details')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 16, backgroundColor: t.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <OrderTimeline order={orderData} theme={t} />

        {/* Address */}
        <OrderAddress shippingAddress={orderData.shippingAddress} theme={t} />

        {/* Products */}
        <OrderProductList
          orderItems={orderData.items}
          products={products}
          theme={t}
          onProductPress={onProductPress}
        />

        {/* Payment Info */}
        <OrderPaymentInfo payment={orderData.payment} theme={t} />
      </ScrollView>

      {/* Bottom Actions */}
      <OrderActions
        order={orderData}
        products={products}
        onReorder={onReorder}
        onPayAgain={onPayAgain}
        onNavigateToCart={onNavigateToCart}
        onOpenSupport={() => setSupportModalVisible(true)}
        theme={t}
        accessToken={accessToken}
      />

      {/* Support Modal */}
      <OrderSupportModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        theme={t}
      />
    </View>
  );
}
