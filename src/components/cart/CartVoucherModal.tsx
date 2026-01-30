import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';
import { Voucher } from '../../types';

interface CartVoucherModalProps {
    visible: boolean;
    onClose: () => void;
    vouchers: Voucher[];
    appliedVoucherCode: string | undefined;
    subtotal: number;
    onApplyVoucher: (code: string) => void;
    theme: Theme;
}

export const CartVoucherModal: React.FC<CartVoucherModalProps> = ({
    visible,
    onClose,
    vouchers,
    appliedVoucherCode,
    subtotal,
    onApplyVoucher,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const insets = useSafeAreaInsets();

    const accentBg = t === lightTheme ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.08)';
    const accentBorder = t === lightTheme ? '#2563EB' : t.primary;
    const overlayBg = t === lightTheme ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-end"
                style={{ backgroundColor: overlayBg }}
            >
                <View
                    className="rounded-t-3xl max-h-[80%]"
                    style={{
                        backgroundColor: t.card,
                        paddingBottom: 24 + insets.bottom
                    }}
                >
                    <View
                        className="flex-row justify-between items-center p-5 border-b"
                        style={{ borderBottomColor: t.border }}
                    >
                        <Text className="text-lg font-bold" style={{ color: t.text }}>{translate('select_voucher')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-1"
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        className="px-5"
                        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
                        showsVerticalScrollIndicator={false}
                    >
                        {vouchers.length > 0 ? (
                            vouchers.map((voucher) => {
                                const isEligible = subtotal >= voucher.minTotal;
                                const isSelected = appliedVoucherCode === voucher.code;
                                const voucherType = voucher.type || (voucher.description?.toLowerCase().includes('ship') ? 'shipping' : 'fixed');
                                const expireDate = voucher.expire ? new Date(voucher.expire) : null;
                                const voucherLabel =
                                    voucherType === 'shipping'
                                        ? translate('discount_shipping')
                                        : voucherType === 'percentage'
                                            ? translate('discount_percent', { rate: voucher.discountRate ?? 0 })
                                            : translate('discount_order');
                                const voucherCap =
                                    voucherType === 'percentage' && voucher.maxDiscountPrice
                                        ? translate('max_discount', { amount: voucher.maxDiscountPrice.toLocaleString('vi-VN') })
                                        : '';

                                return (
                                    <View
                                        key={voucher.code}
                                        className={`flex-row items-center p-3 rounded-xl border mb-3 gap-3 ${!isEligible ? 'opacity-60' : ''}`}
                                        style={{
                                            backgroundColor: isSelected ? accentBg : t.surface,
                                            borderColor: isSelected ? accentBorder : t.border,
                                        }}
                                    >
                                        <View
                                            className="w-12 h-12 rounded-full justify-center items-center"
                                            style={{ backgroundColor: accentBg }}
                                        >
                                            <AppIcon name="ticket" size={24} color={accentBorder} />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-center mb-0.5">
                                                <Text className="text-base font-bold" style={{ color: t.text }}>{voucher.code}</Text>
                                                {isSelected && <AppIcon name="check-circle" size={20} color={accentBorder} />}
                                            </View>
                                            <Text className="text-xs mb-1" style={{ color: t.muted }}>{voucher.description}</Text>
                                            <Text className="text-[11px] mb-0.5" style={{ color: t.muted }}>
                                                {voucherLabel} {voucherCap ? voucherCap : ''} · {translate('min_order', { amount: voucher.minTotal.toLocaleString('vi-VN') })}
                                            </Text>
                                            {expireDate && (
                                                <Text className="text-[11px] mb-0.5" style={{ color: t.muted }}>
                                                    {translate('expiry_date', { date: expireDate.toLocaleDateString('vi-VN') })}
                                                </Text>
                                            )}
                                            {!isEligible && (
                                                <Text className="text-[11px] mt-0.5 text-red-300">
                                                    {translate('buy_more', { amount: (voucher.minTotal - subtotal).toLocaleString('vi-VN') })}
                                                </Text>
                                            )}
                                        </View>
                                        {isEligible && (
                                            <TouchableOpacity
                                                onPress={() => onApplyVoucher(voucher.code)}
                                                className="px-3 py-1.5 rounded-2xl"
                                                style={{
                                                    backgroundColor: isSelected ? accentBorder : accentBg
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text
                                                    className="text-xs font-bold"
                                                    style={{
                                                        color: isSelected ? '#FFFFFF' : accentBorder
                                                    }}
                                                >
                                                    {isSelected ? translate('using') : translate('use_now')}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <View className="items-center justify-center py-8 gap-2">
                                <AppIcon name="ticket-outline" size={48} color={t.muted} />
                                <Text className="text-base font-semibold" style={{ color: t.text }}>{translate('no_voucher')}</Text>
                                <Text className="text-sm" style={{ color: t.muted }}>{translate('check_later')}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
