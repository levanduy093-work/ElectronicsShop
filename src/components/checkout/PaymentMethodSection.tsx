import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';

interface PaymentOption {
    name: string;
    label?: string;
    desc?: string;
    icon?: string | null;
    iconName?: string;
}

interface PaymentMethodSectionProps {
    paymentOptions: PaymentOption[];
    selectedPayment: number;
    onSelectPayment: (index: number) => void;
    theme: Theme;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
    paymentOptions,
    selectedPayment,
    onSelectPayment,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const accentBg = t === lightTheme ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)';

    return (
        <View className="gap-4 pb-4">
            <Text
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: t.muted }}
            >
                {translate('payment')}
            </Text>

            {paymentOptions.map((opt, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => onSelectPayment(i)}
                    className={`flex-row items-start p-4 rounded-xl border gap-3 ${selectedPayment === i ? 'border-2' : 'border'}`}
                    style={{
                        backgroundColor: t.card,
                        borderColor: selectedPayment === i ? t.primary : t.border
                    }}
                    activeOpacity={0.7}
                >
                    <View
                        className="w-5 h-5 rounded-full border-2 justify-center items-center mt-0.5"
                        style={{ borderColor: t.border }}
                    >
                        {selectedPayment === i && (
                            <View
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: t.primary }}
                            />
                        )}
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            {opt.icon ? (
                                <Image
                                    source={{ uri: opt.icon }}
                                    className="w-6 h-6"
                                    resizeMode="contain"
                                />
                            ) : opt.iconName ? (
                                <View
                                    className="w-6 h-6 rounded-full justify-center items-center"
                                    style={{ backgroundColor: accentBg }}
                                >
                                    <AppIcon name={opt.iconName} size={16} color={t.muted} />
                                </View>
                            ) : (
                                <View
                                    className="w-6 h-6 rounded-full justify-center items-center"
                                    style={{ backgroundColor: accentBg }}
                                >
                                    <AppIcon name="credit-card" size={16} color={t.muted} />
                                </View>
                            )}
                            <Text className="text-sm font-semibold" style={{ color: t.text }}>{opt.label || opt.name}</Text>
                        </View>
                        {opt.desc ? (
                            <Text className="text-sm leading-5 mt-1" style={{ color: t.muted }}>
                                {opt.desc}
                            </Text>
                        ) : null}
                    </View>
                </TouchableOpacity>
            ))}

            <Text className="text-sm leading-5 mt-2" style={{ color: t.muted }}>
                Bạn có thể thanh toán qua VNPAY hoặc trả tiền mặt khi nhận hàng (COD).
            </Text>
        </View>
    );
};
