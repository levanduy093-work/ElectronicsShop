import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
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
            <View style={styles.bottomSheetOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.bottomSheetContent, { backgroundColor: t.card, paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: t.text }]}>{translate('my_voucher_warehouse')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.muted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={styles.voucherList}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {vouchers.length > 0 ? (
                            vouchers.map((voucher) => {
                                const expireDate = voucher.expire ? new Date(voucher.expire) : null;
                                return (
                                    <View key={voucher.code} style={[styles.voucherCard, { borderColor: t.border, backgroundColor: t.surface }]}>
                                        <View style={[styles.voucherIconContainer, { backgroundColor: t.primary + '22' }]}>
                                            <AppIcon name="ticket" size={24} color={t.primary} />
                                        </View>
                                        <View style={styles.voucherInfo}>
                                            <Text style={[styles.voucherCode, { color: t.text }]}>{voucher.code}</Text>
                                            <Text style={[styles.voucherDescription, { color: t.muted }]}>{voucher.description}</Text>
                                            {expireDate && (
                                                <Text style={[styles.voucherExpiry, { color: t.primary }]}>
                                                    {translate('expiry_date', { date: expireDate.toLocaleDateString('vi-VN') })}
                                                </Text>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => onCopyVoucher(voucher.code)}
                                            style={[styles.voucherCopyButton, { backgroundColor: t.primary + '22' }]}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.voucherCopyText, { color: t.primary }]}>{translate('copy')}</Text>
                                        </TouchableOpacity>
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
    bottomSheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    bottomSheetContent: {
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    voucherList: {
        maxHeight: 400,
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
    voucherCode: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    voucherDescription: {
        fontSize: 12,
        marginBottom: 4,
    },
    voucherExpiry: {
        fontSize: 10,
        fontWeight: '500',
    },
    voucherCopyButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    voucherCopyText: {
        fontSize: 12,
        fontWeight: 'bold',
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
