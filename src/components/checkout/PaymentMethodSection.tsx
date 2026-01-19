import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: t.muted }]}>{translate('payment')}</Text>

            {paymentOptions.map((opt, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => onSelectPayment(i)}
                    style={[
                        styles.optionCard,
                        { backgroundColor: t.card, borderColor: t.border },
                        selectedPayment === i && { borderColor: t.primary, borderWidth: 2 },
                    ]}
                    activeOpacity={0.7}
                >
                    <View style={[styles.radio, { borderColor: t.border }]}>
                        {selectedPayment === i && <View style={[styles.radioSelected, { backgroundColor: t.primary }]} />}
                    </View>
                    <View style={styles.optionContent}>
                        <View style={styles.paymentOption}>
                            {opt.icon ? (
                                <Image source={{ uri: opt.icon }} style={styles.paymentIcon} />
                            ) : opt.iconName ? (
                                <View style={[styles.paymentIconPlaceholder, { backgroundColor: accentBg }]}>
                                    <AppIcon name={opt.iconName} size={16} color={t.muted} />
                                </View>
                            ) : (
                                <View style={[styles.paymentIconPlaceholder, { backgroundColor: accentBg }]}>
                                    <AppIcon name="credit-card" size={16} color={t.muted} />
                                </View>
                            )}
                            <Text style={[styles.optionName, { color: t.text }]}>{opt.label || opt.name}</Text>
                        </View>
                        {opt.desc ? (
                            <Text style={[styles.optionDesc, { color: t.muted, marginTop: 4 }]}>
                                {opt.desc}
                            </Text>
                        ) : null}
                    </View>
                </TouchableOpacity>
            ))}

            <Text style={[styles.optionDesc, { color: t.muted, marginTop: 8 }]}>
                Bạn có thể thanh toán qua VNPAY hoặc trả tiền mặt khi nhận hàng (COD).
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    stepContent: {
        gap: 16,
        paddingBottom: 16, // Reduced padding as this might be flowed by OrderSummary
    },
    stepTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    optionContent: {
        flex: 1,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    paymentIconPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionName: {
        fontSize: 14,
        fontWeight: '600',
    },
    optionDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
});
