import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme, lightTheme } from '../../theme';
import { Address } from '../../types';

interface AddressItemProps {
    address: Address;
    theme: Theme;
    onSetDefault: (id: string) => void;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
}

export const AddressItem: React.FC<AddressItemProps> = ({
    address,
    theme: t,
    onSetDefault,
    onEdit,
    onDelete,
}) => {
    const { t: translate } = useTranslation();

    return (
        <View
            style={[
                styles.addressCard,
                {
                    backgroundColor: t.card,
                    borderColor: t.border,
                    shadowOpacity: t === lightTheme ? 0.05 : 0,
                    elevation: t === lightTheme ? 2 : 0
                },
                address.isDefault && { borderColor: t.primary, borderWidth: 2 },
            ]}
        >
            <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                    <Text style={[styles.addressName, { color: t.text }]}>{address.name}</Text>
                    <Text style={[styles.addressSeparator, { color: t.muted }]}>{'|'}</Text>
                    <Text style={[styles.addressPhone, { color: t.muted }]}>{address.phone}</Text>
                </View>
                {address.isDefault ? (
                    <View style={[styles.defaultBadge, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)', borderColor: t === lightTheme ? '#93C5FD' : t.primary }]}>
                        <Text style={[styles.defaultBadgeText, { color: t.primary }]}>{translate('default')}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => onSetDefault(address.id)}
                        style={[styles.setDefaultButton, { borderColor: t.border }]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.setDefaultText, { color: t.muted }]}>{translate('set_as_default_address')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={[styles.addressText, { color: t.text }]}>{address.address}</Text>

            <View style={styles.addressFooter}>
                <View style={[styles.typeBadge, { backgroundColor: t.surface }]}>
                    <AppIcon
                        name={address.type === 'Nhà riêng' ? 'home' : 'briefcase'}
                        size={10}
                        color={t.muted}
                    />
                    <Text style={[styles.typeBadgeText, { color: t.muted }]}>
                        {address.type === 'Nhà riêng' ? translate('home') : translate('office')}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => onEdit(address)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                    >
                        <AppIcon name="edit" size={14} color={t.primary} />
                        <Text style={[styles.actionText, { color: t.primary }]}>{translate('edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(address.id)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                    >
                        <AppIcon name="trash" size={14} color="#EF4444" />
                        <Text style={[styles.actionText, { color: '#EF4444' }]}>{translate('delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    addressCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    addressInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addressSeparator: {
        fontSize: 14,
    },
    addressPhone: {
        fontSize: 14,
    },
    defaultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '500',
    },
    setDefaultButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
    },
    setDefaultText: {
        fontSize: 10,
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    addressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeBadgeText: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
