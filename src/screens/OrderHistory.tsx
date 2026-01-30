import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { Order } from '../types';
import { formatPrice } from '../utils';

interface OrderHistoryProps {
  onBack: () => void;
  onViewDetail?: (orderId: string) => void;
  orders?: Order[];
  theme?: Theme;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function OrderHistory({ onBack, onViewDetail, orders = [], theme, onRefresh, refreshing = false }: OrderHistoryProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;

  // Debug: log số lượng orders
  console.log('OrderHistory - orders count:', orders.length);
  console.log('OrderHistory - orders:', orders.map(o => ({ id: o.id, status: o.status })));

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
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: t.text }}>{translate('my_orders')}</Text>
        <View className="w-10" />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96, backgroundColor: t.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.primary}
            />
          ) : undefined
        }
      >
        {orders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full justify-center items-center mb-6" style={{ backgroundColor: t.surface }}>
              <AppIcon name="package" size={32} color={t.muted} />
            </View>
            <Text className="text-lg font-bold mb-2" style={{ color: t.text }}>{translate('no_orders_yet')}</Text>
            <Text className="text-sm text-center" style={{ color: t.muted }}>{translate('orders_will_appear_here')}</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View
              key={order.id}
              className="p-4 mb-4 border rounded-2xl shadow-sm"
              style={{
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0
              }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-xs font-bold mb-1" style={{ color: t.muted }}>#{order.code}</Text>
                  <Text className="text-xs" style={{ color: t.muted }}>{order.date}</Text>
                </View>
                {(() => {
                  const statusInfo = getStatusFromTimeline(order);
                  return (
                    <View className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: statusInfo.bgColor }}>
                      <Text className="text-[11px] font-bold" style={{ color: statusInfo.color }}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  );
                })()}
              </View>

              <View className="border-t pt-3 mb-3 gap-1" style={{ borderTopColor: t.border }}>
                {order.items.slice(0, 2).map((item, i) => (
                  <Text key={i} className="text-sm leading-5" style={{ color: t.text }} numberOfLines={1}>
                    • {item.name} x{item.quantity}
                  </Text>
                ))}
                {order.items.length > 2 && (
                  <Text className="text-xs italic mt-1" style={{ color: t.muted }}>
                    {translate('more_products', { count: order.items.length - 2 })}
                  </Text>
                )}
              </View>

              <View className="flex-row justify-between items-center pt-3 mt-3 border-t" style={{ borderTopColor: t.border }}>
                <View>
                  <Text className="text-sm" style={{ color: t.muted }}>{translate('total')}:</Text>
                  <Text className="text-lg font-bold" style={{ color: t.primary }}>{formatPrice(order.payment.total)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onViewDetail?.(order.id)}
                  className="flex-row items-center gap-1 px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)', borderColor: t.primary }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-medium" style={{ color: t.primary }}>{translate('view_details')}</Text>
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
