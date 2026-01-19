import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Address } from '../../types';
import { Theme, lightTheme } from '../../theme';

interface AddressSectionProps {
    addressList: Address[];
    selectedAddressId: string | undefined;
    onSelectAddress: (id: string) => void;
    onAddAddress: () => void;
    theme: Theme;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
    addressList,
    selectedAddressId,
    onSelectAddress,
    onAddAddress,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const accentBg = t === lightTheme ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)';

    return (
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: t.muted }]}>Địa chỉ nhận hàng</Text>

            {addressList.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                const contactLine = addr.name ? `${addr.name} | ${addr.phone}` : addr.phone;
                return (
                    <TouchableOpacity
                        key={addr.id}
                        onPress={() => onSelectAddress(addr.id)}
                        style={[
                            styles.addressCard,
                            { backgroundColor: t.card, borderColor: isSelected ? t.primary : t.border },
                            isSelected && styles.addressCardDefault,
                        ]}
                        activeOpacity={0.8}
                    >
                        {addr.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: t.primary }]}>
                                <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                        )}
                        <View style={styles.addressContent}>
                            <View style={[styles.addressIcon, { backgroundColor: accentBg }]}>
                                <AppIcon name="map-pin" size={20} color={t.primary} />
                            </View>
                            <View style={styles.addressInfo}>
                                <Text style={[styles.addressType, { color: t.text }]}>
                                    {addr.type === 'Nhà riêng' ? translate('home') : translate('office')}
                                </Text>
                                <Text style={[styles.addressText, { color: t.text }]}>{addr.address}</Text>
                                <Text style={[styles.addressPhone, { color: t.muted }]}>{contactLine}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                style={[styles.addAddressButton, { borderColor: t.border }]}
                activeOpacity={0.7}
                onPress={onAddAddress}
            >
                <Text style={[styles.addAddressText, { color: t.text }]}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    stepContent: {
        gap: 16,
        paddingBottom: 96,
    },
    stepTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addressCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    addressCardDefault: {
        borderWidth: 2,
    },
    defaultBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 8,
    },
    defaultBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addressContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    addressIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressInfo: {
        flex: 1,
        gap: 4,
    },
    addressType: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
    },
    addressPhone: {
        fontSize: 13,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        marginTop: 8,
    },
    addAddressText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
