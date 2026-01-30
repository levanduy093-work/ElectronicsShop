import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
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
        <View className="flex-1 justify-center p-6" style={{ backgroundColor: t.background }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={t.background} />
            <View
                className="rounded-3xl p-6 items-center shadow-lg elevation-8"
                style={{ backgroundColor: t.card, shadowColor: t.text }}
            >
                <View
                    className="w-16 h-16 rounded-full justify-center items-center mb-4"
                    style={{
                        backgroundColor: isError
                            ? (t === lightTheme ? '#FEE2E2' : 'rgba(239,68,68,0.16)')
                            : (t === lightTheme ? '#DBEAFE' : 'rgba(59,130,246,0.16)')
                    }}
                >
                    <AppIcon
                        name={isError ? "alert-circle" : "clock"}
                        size={32}
                        color={isError ? '#EF4444' : t.primary}
                    />
                </View>
                <Text className="text-xl font-bold mb-2 text-center" style={{ color: t.text }}>
                    {isError ? translate('paymentErrorTitle') : translate('waitingForPayment')}
                </Text>
                <Text className="text-sm mb-6 text-center" style={{ color: t.muted }}>
                    Đơn hàng {pendingPayment.code ? `#${pendingPayment.code}` : ''} • {formatPrice(pendingPayment.amount)}
                </Text>

                {isError && (
                    <View
                        className="w-full p-3 rounded-xl border mb-5"
                        style={{ backgroundColor: t === lightTheme ? '#FEF2F2' : 'rgba(239,68,68,0.1)', borderColor: t === lightTheme ? '#FECACA' : 'rgba(239,68,68,0.3)' }}
                    >
                        <Text className="text-sm font-bold mb-1 text-red-600">
                            {isFailed ? translate('paymentFailedTitle') : translate('paymentTimeoutTitle')}
                        </Text>
                        <Text className="text-xs leading-4" style={{ color: t.muted }}>
                            {isFailed ? translate('paymentFailedInstructions') : translate('paymentTimeoutInstructions')}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={onRetry}
                    className="w-full h-12 rounded-full justify-center items-center mb-3 shadow-md elevation-4"
                    style={{ backgroundColor: t.primary, shadowColor: t.primary }}
                    activeOpacity={0.85}
                >
                    <Text className="text-white text-base font-bold">
                        {isError ? translate('tryPaymentAgain') : translate('openVnpayGateway')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onCheckPayment}
                    className={`w-full h-12 rounded-full border flex-row justify-center items-center gap-2 mb-4 ${checkingPayment ? 'opacity-70' : ''}`}
                    style={{
                        borderColor: t.border,
                        backgroundColor: t.surface
                    }}
                    activeOpacity={0.8}
                    disabled={checkingPayment}
                >
                    <AppIcon name="check-circle" size={16} color={t.muted} />
                    <Text className="text-sm font-semibold" style={{ color: t.muted }}>
                        {checkingPayment ? translate('checkingPayment') : translate('iHavePaid')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onChangeMethod}
                    className="p-2"
                >
                    <Text className="text-sm underline" style={{ color: t.muted }}>{translate('chooseOtherMethod')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
