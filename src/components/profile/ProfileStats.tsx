import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <View
            className="flex-row gap-3 mb-6 rounded-2xl border p-1"
            style={{ backgroundColor: t.card, borderColor: t.border }}
        >
            <ProfileStatCard
                value={orderCount}
                label={translate('orders')}
                onPress={onNavigateToOrders}
                theme={t}
            />
            <ProfileStatCard
                value={voucherCount}
                label={translate('voucher')}
                onPress={onShowVouchers}
                theme={t}
            />
        </View>
    );
};

interface ProfileStatCardProps {
    value: number;
    label: string;
    onPress: () => void;
    theme: Theme;
}

const ProfileStatCard: React.FC<ProfileStatCardProps> = ({ value, label, onPress, theme: t }) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-1 rounded-2xl p-4 shadow-sm elevation-2 border"
        style={{
            backgroundColor: t.card,
            borderColor: t.border,
            shadowOpacity: t === lightTheme ? 0.05 : 0
        }}
        activeOpacity={0.7}
    >
        <Text className="text-2xl font-bold mb-1" style={{ color: t.text }}>{value}</Text>
        <Text className="text-xs" style={{ color: t.muted }}>{label}</Text>
    </TouchableOpacity>
);
