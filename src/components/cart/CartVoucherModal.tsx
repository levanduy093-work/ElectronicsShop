import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
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
            <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
                <View style={[
                    styles.modalContent,
                    { backgroundColor: t.card, paddingBottom: 24 + insets.bottom }
                ]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: t.text }]}>{translate('select_voucher')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.modalCloseButton}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.voucherList}
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
                                        style={[
                                            styles.voucherCard,
                                            { backgroundColor: t.surface, borderColor: t.border },
                                            isSelected && { borderColor: accentBorder, backgroundColor: accentBg },
                                            !isEligible && styles.voucherCardDisabled
                                        ]}
                                    >
                                        <View style={[styles.voucherIconContainer, { backgroundColor: accentBg }]}>
                                            <AppIcon name="ticket" size={24} color={accentBorder} />
                                        </View>
                                        <View style={styles.voucherInfo}>
                                            <View style={styles.voucherHeader}>
                                                <Text style={[styles.voucherCode, { color: t.text }]}>{voucher.code}</Text>
                                                {isSelected && <AppIcon name="check-circle" size={20} color={accentBorder} />}
                                            </View>
                                            <Text style={[styles.voucherDescription, { color: t.muted }]}>{voucher.description}</Text>
                                            <Text style={[styles.voucherMeta, { color: t.muted }]}>
                                                {voucherLabel} {voucherCap ? voucherCap : ''} · {translate('min_order', { amount: voucher.minTotal.toLocaleString('vi-VN') })}
                                            </Text>
                                            {expireDate && (
                                                <Text style={[styles.voucherMeta, { color: t.muted }]}>
                                                    {translate('expiry_date', { date: expireDate.toLocaleDateString('vi-VN') })}
                                                </Text>
                                            )}
                                            {!isEligible && (
                                                <Text style={[styles.voucherWarning, { color: '#FCA5A5' }]}>
                                                    {translate('buy_more', { amount: (voucher.minTotal - subtotal).toLocaleString('vi-VN') })}
                                                </Text>
                                            )}
                                        </View>
                                        {isEligible && (
                                            <TouchableOpacity
                                                onPress={() => onApplyVoucher(voucher.code)}
                                                style={[
                                                    styles.voucherApplyButton,
                                                    { backgroundColor: accentBg },
                                                    isSelected && { backgroundColor: accentBorder }
                                                ]}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.voucherApplyText,
                                                    { color: accentBorder },
                                                    isSelected && styles.voucherApplyTextActive
                                                ]}>
                                                    {isSelected ? translate('using') : translate('use_now')}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyVoucherContainer}>
                                <AppIcon name="ticket-outline" size={48} color={t.muted} />
                                <Text style={[styles.emptyVoucherText, { color: t.text }]}>{translate('no_voucher')}</Text>
                                <Text style={[styles.emptyVoucherSubtext, { color: t.muted }]}>{translate('check_later')}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        padding: 4,
    },
    voucherList: {
        paddingHorizontal: 20,
    },
    voucherCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 12,
    },
    voucherCardDisabled: {
        opacity: 0.6,
    },
    voucherIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voucherInfo: {
        flex: 1,
    },
    voucherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    voucherCode: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    voucherDescription: {
        fontSize: 12,
        marginBottom: 4,
    },
    voucherMeta: {
        fontSize: 11,
        marginBottom: 2,
    },
    voucherWarning: {
        fontSize: 11,
        marginTop: 2,
    },
    voucherApplyButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    voucherApplyText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    voucherApplyTextActive: {
        color: '#FFFFFF',
    },
    emptyVoucherContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyVoucherText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyVoucherSubtext: {
        fontSize: 14,
    },
});
