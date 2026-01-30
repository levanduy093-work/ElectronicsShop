import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme, lightTheme } from '../../theme';
import { Order } from '../../types';

interface OrderTimelineProps {
    order: Order;
    theme: Theme;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, theme: t }) => {
    const { t: translate } = useTranslation();

    const getStatusFromTimeline = (orderData: Order) => {
        if (orderData.status === 'cancelled') {
            return {
                text: translate('order_status_cancelled'),
                color: '#EF4444',
                bgColor: t === lightTheme ? '#FEE2E2' : 'rgba(239,68,68,0.16)',
            };
        }

        const activeSteps = orderData.timeline.filter(item => item.active);
        if (activeSteps.length === 0) {
            return {
                text: translate('order_placed_success'),
                color: t === lightTheme ? '#F59E0B' : '#FBBF24',
                bgColor: t === lightTheme ? '#FEF3C7' : 'rgba(251,191,36,0.16)',
            };
        }

        const lastActiveStep = activeSteps[activeSteps.length - 1];
        const statusTitle = lastActiveStep.title;

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

    const statusInfo = getStatusFromTimeline(order);


    return (
        <View
            className="rounded-2xl p-4 border shadow-sm"
            style={{
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }}
        >
            <View className="mb-3">
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('order_id')} #{order.code || order.id}</Text>
            </View>
            <View className="mb-4 self-start">
                <View
                    className="px-3 py-1 rounded-xl"
                    style={{
                        backgroundColor: statusInfo.bgColor,
                    }}
                >
                    <Text
                        className="text-xs font-medium"
                        style={{ color: statusInfo.color }}
                    >
                        {statusInfo.text}
                    </Text>
                </View>
            </View>

            <View className="pl-2 border-l-2 gap-6" style={{ borderLeftColor: t.border }}>
                {order.timeline.map((item, index) => (
                    <View key={index} className="flex-row items-start pl-4">
                        <View
                            className="absolute -left-2.5 w-4 h-4 rounded-full border-2"
                            style={{
                                borderColor: item.active ? t.primary : t.border,
                                backgroundColor: item.active ? t.primary : t.surface,
                            }}
                        />
                        <View className="flex-1">
                            <Text
                                className="text-sm font-medium mb-1"
                                style={{ color: item.active ? t.text : t.muted }}
                            >
                                {item.title}
                            </Text>
                            {item.time && (
                                <Text className="text-xs" style={{ color: t.muted }}>{item.time}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};
