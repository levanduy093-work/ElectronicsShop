import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
import { Voucher } from '../../types';

interface VoucherListModalProps {
    visible: boolean;
    onClose: () => void;
    vouchers: Voucher[];
    onCopyVoucher: (code: string) => void;
    theme: Theme;
}

export const VoucherListModal: React.FC<VoucherListModalProps> = ({
    visible,
    onClose,
    vouchers,
    onCopyVoucher,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end">
                <TouchableOpacity
                    className="absolute inset-0 bg-black/35"
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View
                    className="w-full rounded-t-3xl px-6 pt-5"
                    style={{ backgroundColor: t.card, paddingBottom: Math.max(insets.bottom, 16), maxHeight: '85%' }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold" style={{ color: t.text }}>{translate('my_voucher_warehouse')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.muted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        className="max-h-[400px]"
                        contentContainerStyle={{ paddingBottom: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {vouchers.length > 0 ? (
                            vouchers.map((voucher) => {
                                const expireDate = voucher.expire ? new Date(voucher.expire) : null;
                                return (
                                    <View key={voucher.code} className="flex-row items-center p-3 rounded-xl border mb-3 gap-3" style={{ borderColor: t.border, backgroundColor: t.surface }}>
                                        <View className="w-12 h-12 rounded-full justify-center items-center" style={{ backgroundColor: t.primary + '22' }}>
                                            <AppIcon name="ticket" size={24} color={t.primary} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-bold mb-0.5" style={{ color: t.text }}>{voucher.code}</Text>
                                            <Text className="text-xs mb-1" style={{ color: t.muted }}>{voucher.description}</Text>
                                            {expireDate && (
                                                <Text className="text-[10px] font-medium" style={{ color: t.primary }}>
                                                    {translate('expiry_date', { date: expireDate.toLocaleDateString('vi-VN') })}
                                                </Text>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => onCopyVoucher(voucher.code)}
                                            className="px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: t.primary + '22' }}
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-xs font-bold" style={{ color: t.primary }}>{translate('copy')}</Text>
                                        </TouchableOpacity>
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

