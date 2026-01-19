import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={[styles.successContainer, { backgroundColor: t.background }]}>
            <View style={[styles.successIcon, { backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(74,222,128,0.16)' }]}>
                <AppIcon name="check-circle" size={48} color="#10B981" />
            </View>
            <Text style={[styles.successTitle, { color: t.text }]}>Đặt hàng thành công!</Text>
            <Text style={[styles.successText, { color: t.muted }]}>
                Đơn hàng {successInfo.code ? `#${successInfo.code}` : orderId ? `#${orderId}` : ''} •{' '}
                {formatPrice(successInfo.amount || total)} {successInfo.payment ? `• ${successInfo.payment}` : ''}
            </Text>
            <TouchableOpacity
                onPress={() => {
                    onSuccess?.(successInfo.code || orderId);
                }}
                style={[styles.successButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
                activeOpacity={0.8}
            >
                <Text style={styles.successButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    successButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    successButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
