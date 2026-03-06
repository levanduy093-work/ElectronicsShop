import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Address } from '../../types';
import { Theme, lightTheme } from '../../theme';
import { getAddressTypeLabel } from '../../utils/addressType';

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
        <View className="gap-4 pb-24">
            <Text
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: t.muted }}
            >
                Địa chỉ nhận hàng
            </Text>

            {addressList.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                const contactLine = addr.name ? `${addr.name} | ${addr.phone}` : addr.phone;
                return (
                    <TouchableOpacity
                        key={addr.id}
                        onPress={() => onSelectAddress(addr.id)}
                        className={`rounded-xl p-4 relative overflow-hidden transition-all ${isSelected ? 'border-2' : 'border'}`}
                        style={{
                            backgroundColor: t.card,
                            borderColor: isSelected ? t.primary : t.border
                        }}
                        activeOpacity={0.8}
                    >
                        {addr.isDefault && (
                            <View
                                className="absolute top-0 right-0 px-2 py-1 rounded-bl-lg"
                                style={{ backgroundColor: t.primary }}
                            >
                                <Text className="text-white text-[10px] font-bold">Mặc định</Text>
                            </View>
                        )}
                        <View className="flex-row items-start gap-3">
                            <View
                                className="w-9 h-9 rounded-full justify-center items-center"
                                style={{ backgroundColor: accentBg }}
                            >
                                <AppIcon name="map-pin" size={20} color={t.primary} />
                            </View>
                            <View className="flex-1 gap-1">
                                <Text className="text-sm font-bold" style={{ color: t.text }}>
                                    {getAddressTypeLabel(addr.type, translate)}
                                </Text>
                                <Text className="text-sm leading-5" style={{ color: t.text }}>{addr.address}</Text>
                                <Text className="text-xs" style={{ color: t.muted }}>{contactLine}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                className="flex-row items-center justify-center p-4 border border-dashed rounded-xl mt-2"
                style={{ borderColor: t.border }}
                activeOpacity={0.7}
                onPress={onAddAddress}
            >
                <Text className="text-sm font-semibold" style={{ color: t.text }}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
        </View>
    );
};
