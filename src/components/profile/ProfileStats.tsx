import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme, lightTheme } from '../../theme';

interface ProfileStatsProps {
    orderCount: number;
    voucherCount: number;
    onNavigateToOrders: () => void;
    onShowVouchers: () => void;
    theme: Theme;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    orderCount,
    voucherCount,
    onNavigateToOrders,
    onShowVouchers,
    theme: t,
}) => {
    const { t: translate } = useTranslation();

    return (
        <View style={[styles.statsContainer, { backgroundColor: t.card, borderColor: t.border }]}>
            <TouchableOpacity
                onPress={onNavigateToOrders}
                style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0 }]}
                activeOpacity={0.7}
            >
                <Text style={[styles.statValue, { color: t.text }]}>{orderCount}</Text>
                <Text style={[styles.statLabel, { color: t.muted }]}>{translate('orders')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onShowVouchers}
                style={[styles.statCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0 }]}
                activeOpacity={0.7}
            >
                <Text style={[styles.statValue, { color: t.text }]}>{voucherCount}</Text>
                <Text style={[styles.statLabel, { color: t.muted }]}>{translate('voucher')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 4,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
});
