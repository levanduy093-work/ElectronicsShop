import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { formatPrice } from '../../utils';

interface CheckoutSuccessViewProps {
    orderId: string;
    successInfo: { code?: string; amount: number; payment?: string };
    total: number;
    onSuccess?: (orderId: string) => void;
    theme: Theme;
}

export const CheckoutSuccessView: React.FC<CheckoutSuccessViewProps> = ({
    orderId,
    successInfo,
    total,
    onSuccess,
    theme: t,
}) => {
    return (
        <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: t.background }}>
            <View
                className="w-20 h-20 rounded-full justify-center items-center mb-6"
                style={{ backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(74,222,128,0.16)' }}
            >
                <AppIcon name="check-circle" size={48} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold mb-2 text-center" style={{ color: t.text }}>Đặt hàng thành công!</Text>
            <Text className="text-base text-center mb-8 leading-6" style={{ color: t.muted }}>
                Đơn hàng {successInfo.code ? `#${successInfo.code}` : orderId ? `#${orderId}` : ''} •{' '}
                {formatPrice(successInfo.amount || total)} {successInfo.payment ? `• ${successInfo.payment}` : ''}
            </Text>
            <TouchableOpacity
                onPress={() => {
                    onSuccess?.(successInfo.code || orderId);
                }}
                className="px-8 py-4 rounded-3xl shadow-lg elevation-4"
                style={{ backgroundColor: t.primary, shadowColor: t.primary }}
                activeOpacity={0.8}
            >
                <Text className="text-white text-base font-bold">Về trang chủ</Text>
            </TouchableOpacity>
        </View>
    );
};
