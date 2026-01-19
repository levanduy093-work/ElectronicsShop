import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
                <Text style={[styles.orderId, { color: t.text }]}>{translate('order_id')} #{order.code || order.id}</Text>
            </View>
            <View style={styles.statusBadgeContainer}>
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
            </View>

            <View style={[styles.timeline, { borderLeftColor: t.border }]}>
                {order.timeline.map((item, index) => (
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
    );
};

const styles = StyleSheet.create({
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
});
