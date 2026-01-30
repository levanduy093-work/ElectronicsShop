import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { AppIcon } from '../../components/common/Icon';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { CartItem } from '../../types';
import { Theme, lightTheme } from '../../theme';
import { formatPrice } from '../../utils';

interface CartItemRowProps {
    item: CartItem;
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onEditOption: (item: CartItem) => void;
    onEditClassification: (item: CartItem) => void;
    theme: Theme;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
    item,
    onUpdateQuantity,
    onRemoveItem,
    onEditOption,
    onEditClassification,
    theme: t,
}) => {


    return (
        <View
            className="rounded-2xl p-4 flex-row gap-4 border shadow-sm"
            style={{
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0
            }}
        >
            <ImageWithFallback
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-xl bg-gray-50"
                resizeMode="cover"
            />

            <View className="flex-1 justify-between">
                <View className="flex-row justify-between items-start mb-1">
                    <Text
                        className="text-sm font-medium flex-1 mr-2"
                        style={{ color: t.text }}
                        numberOfLines={2}
                    >
                        {item.name}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onRemoveItem(item.id)}
                        className="p-1"
                        activeOpacity={0.7}
                    >
                        <AppIcon name="trash" size={16} color={t.muted} />
                    </TouchableOpacity>
                </View>
                <Text
                    className="text-xs mb-2"
                    style={{ color: t.muted }}
                >
                    {item.category}
                </Text>
                {((item.options && item.options.length > 0) || (item.classifications && item.classifications.length > 0)) && (
                    <View className="flex-row flex-wrap gap-1.5 mb-2">
                        {item.options && item.options.length > 0 && (
                            <TouchableOpacity
                                onPress={() => onEditOption(item)}
                                className="flex-row items-center px-2 py-1 rounded-md border"
                                style={{ backgroundColor: t.surface, borderColor: t.border }}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[11px] font-medium" style={{ color: t.muted }}>Tùy chọn: </Text>
                                <Text className="text-[11px] font-semibold" style={{ color: t.primary }}>
                                    {item.selectedOption || (item.options.length > 0 ? item.options[0] : '')}
                                </Text>
                                {item.options.length > 1 && (
                                    <AppIcon name="chevron-down" size={14} color={t.primary} style={{ marginLeft: 4 }} />
                                )}
                            </TouchableOpacity>
                        )}
                        {item.classifications && item.classifications.length > 0 && (
                            <TouchableOpacity
                                onPress={() => onEditClassification(item)}
                                className="flex-row items-center px-2 py-1 rounded-md border"
                                style={{ backgroundColor: t.surface, borderColor: t.border }}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[11px] font-medium" style={{ color: t.muted }}>Phân loại: </Text>
                                <Text className="text-[11px] font-semibold" style={{ color: t.primary }}>
                                    {item.selectedClassification || (item.classifications.length > 0 ? item.classifications[0] : '')}
                                </Text>
                                {item.classifications.length > 1 && (
                                    <AppIcon name="chevron-down" size={14} color={t.primary} style={{ marginLeft: 4 }} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View className="flex-row justify-between items-center">
                    <Text className="text-base font-bold" style={{ color: t.primary }}>{formatPrice(item.price)}</Text>

                    <View
                        className="flex-row items-center rounded-lg p-1 gap-3"
                        style={{ backgroundColor: t.surface }}
                    >
                        <TouchableOpacity
                            onPress={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 justify-center items-center rounded-md border"
                            style={{ backgroundColor: t.card, borderColor: t.border }}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="minus" size={12} color={t.text} />
                        </TouchableOpacity>
                        <Text
                            className="text-sm font-medium min-w-[16px] text-center"
                            style={{ color: t.text }}
                        >
                            {item.quantity}
                        </Text>
                        <TouchableOpacity
                            onPress={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 justify-center items-center rounded-md border"
                            style={{ backgroundColor: t.card, borderColor: t.border }}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="plus" size={12} color={t.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
