import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { formatPrice } from '../../utils';

interface PaymentWaitingViewProps {
    paymentError: string | null;
    pendingPayment: { url: string; code?: string; amount: number; id?: string };
    checkingPayment: boolean;
    onRetry: () => void;
    onCheckPayment: () => void;
    onChangeMethod: () => void;
    theme: Theme;
    isDarkMode: boolean;
}

export const PaymentWaitingView: React.FC<PaymentWaitingViewProps> = ({
    paymentError,
    pendingPayment,
    checkingPayment,
    onRetry,
    onCheckPayment,
    onChangeMethod,
    theme: t,
    isDarkMode,
}) => {
    const { t: translate } = useTranslation();
    const isError = paymentError !== null;
    const isFailed = paymentError === 'failed';

    return (
        <View style={[styles.waitingContainer, { backgroundColor: t.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={t.background} />
            <View style={[styles.waitingCard, { backgroundColor: t.card, shadowColor: t.text }]}>
                <View style={[
                    styles.waitingIcon,
                    {
                        backgroundColor: isError
                            ? (t === lightTheme ? '#FEE2E2' : 'rgba(239,68,68,0.16)')
                            : (t === lightTheme ? '#DBEAFE' : 'rgba(59,130,246,0.16)')
                    }
                ]}>
                    <AppIcon
                        name={isError ? "alert-circle" : "clock"}
                        size={32}
                        color={isError ? '#EF4444' : t.primary}
                    />
                </View>
                <Text style={[styles.waitingTitle, { color: t.text }]}>
                    {isError ? translate('paymentErrorTitle') : translate('waitingForPayment')}
                </Text>
                <Text style={[styles.waitingSub, { color: t.muted }]}>
                    Đơn hàng {pendingPayment.code ? `#${pendingPayment.code}` : ''} • {formatPrice(pendingPayment.amount)}
                </Text>

                {isError && (
                    <View style={[styles.errorBox, { backgroundColor: t === lightTheme ? '#FEF2F2' : 'rgba(239,68,68,0.1)', borderColor: t === lightTheme ? '#FECACA' : 'rgba(239,68,68,0.3)' }]}>
                        <Text style={[styles.errorTitle, { color: '#DC2626' }]}>
                            {isFailed ? translate('paymentFailedTitle') : translate('paymentTimeoutTitle')}
                        </Text>
                        <Text style={[styles.errorText, { color: t.muted }]}>
                            {isFailed ? translate('paymentFailedInstructions') : translate('paymentTimeoutInstructions')}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={onRetry}
                    style={[styles.waitingButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
                    activeOpacity={0.85}
                >
                    <Text style={styles.waitingButtonText}>
                        {isError ? translate('tryPaymentAgain') : translate('openVnpayGateway')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onCheckPayment}
                    style={[
                        styles.waitingSecondary,
                        { borderColor: t.border, backgroundColor: t.surface },
                        checkingPayment && { opacity: 0.7 },
                    ]}
                    activeOpacity={0.8}
                    disabled={checkingPayment}
                >
                    <AppIcon name="check-circle" size={16} color={t.muted} />
                    <Text style={[styles.waitingSecondaryText, { color: t.muted }]}>
                        {checkingPayment ? translate('checkingPayment') : translate('iHavePaid')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onChangeMethod}
                    style={styles.waitingTertiary}
                >
                    <Text style={[styles.waitingTertiaryText, { color: t.muted }]}>{translate('chooseOtherMethod')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    waitingCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    waitingIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    waitingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    waitingSub: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    waitingButton: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    waitingButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    waitingSecondary: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    waitingSecondaryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    waitingTertiary: {
        padding: 8,
    },
    waitingTertiaryText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    errorBox: {
        width: '100%',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 12,
        lineHeight: 16,
    },
});
