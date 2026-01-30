import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
            className={`rounded-2xl p-4 mb-4 border shadow-sm elevation-2 ${address.isDefault ? 'border-2' : ''}`}
            style={{
                backgroundColor: t.card,
                borderColor: address.isDefault ? t.primary : t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
            }}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center gap-2 flex-1">
                    <Text className="text-base font-bold" style={{ color: t.text }}>{address.name}</Text>
                    <Text className="text-base" style={{ color: t.muted }}>|</Text>
                    <Text className="text-base" style={{ color: t.muted }}>{address.phone}</Text>
                </View>
                {address.isDefault ? (
                    <View
                        className="px-2 py-1 rounded border"
                        style={{
                            backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)',
                            borderColor: t === lightTheme ? '#93C5FD' : t.primary
                        }}
                    >
                        <Text className="text-[10px] font-medium" style={{ color: t.primary }}>{translate('default')}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => onSetDefault(address.id)}
                        className="px-2 py-1 rounded border"
                        style={{ borderColor: t.border }}
                        activeOpacity={0.7}
                    >
                        <Text className="text-[10px]" style={{ color: t.muted }}>{translate('set_as_default_address')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text className="text-base leading-5 mb-3" style={{ color: t.text }}>{address.address}</Text>

            <View className="flex-row justify-between items-center pt-3 border-t" style={{ borderTopColor: '#F3F4F6' }}>
                <View className="flex-row items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: t.surface }}>
                    <AppIcon
                        name={address.type === 'Nhà riêng' ? 'home' : 'briefcase'}
                        size={10}
                        color={t.muted}
                    />
                    <Text className="text-sm" style={{ color: t.muted }}>
                        {address.type === 'Nhà riêng' ? translate('home') : translate('office')}
                    </Text>
                </View>
                <View className="flex-row gap-4">
                    <TouchableOpacity
                        onPress={() => onEdit(address)}
                        className="flex-row items-center gap-1"
                        activeOpacity={0.7}
                    >
                        <AppIcon name="edit" size={14} color={t.primary} />
                        <Text className="text-base font-medium" style={{ color: t.primary }}>{translate('edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(address.id)}
                        className="flex-row items-center gap-1"
                        activeOpacity={0.7}
                    >
                        <AppIcon name="trash" size={14} color="#EF4444" />
                        <Text className="text-base font-medium" style={{ color: '#EF4444' }}>{translate('delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
