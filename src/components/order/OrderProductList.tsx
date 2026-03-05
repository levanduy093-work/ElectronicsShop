import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Theme, lightTheme } from '../../theme';
import { Order, Product } from '../../types';
import { formatPrice } from '../../utils';

interface OrderProductListProps {
    orderItems: Order['items'];
    products: Product[];
    theme: Theme;
    onProductPress?: (productId: string) => void;
}

export const OrderProductList: React.FC<OrderProductListProps> = ({ orderItems, products, theme: t, onProductPress }) => {
    const { t: translate } = useTranslation();

    return (
        <View
            className="rounded-2xl p-4 border shadow-sm"
            style={{
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }}
        >
            <View className="flex-row items-center gap-2 mb-3">
                <AppIcon name="package" size={18} color={t.primary} />
                <Text className="text-base font-bold" style={{ color: t.text }}>{translate('product')}</Text>
            </View>
            <View className="gap-4">
                {orderItems.map((item) => {
                    const product = products.find(p => p.id === item.id);
                    const targetProductId = product?.id || item.id;
                    const displayOptions = product?.options || [];
                    const displayClassifications = product?.classifications || [];
                    const canNavigate = Boolean(onProductPress && targetProductId);

                    return (
                        <TouchableOpacity
                            key={`${item.id}-${item.selectedOption || ''}-${item.selectedClassification || ''}`}
                            className="flex-row gap-3"
                            activeOpacity={canNavigate ? 0.7 : 1}
                            disabled={!canNavigate}
                            onPress={() => onProductPress?.(targetProductId)}
                        >
                            <ImageWithFallback
                                source={{ uri: item.image }}
                                className="w-16 h-16 rounded-lg"
                                style={{ backgroundColor: t.surface }}
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-between">
                                <Text className="text-sm font-medium mb-1" style={{ color: t.text }} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                {(item.selectedOption || item.selectedClassification || displayOptions.length > 0 || displayClassifications.length > 0) && (
                                    <View className="flex-row flex-wrap gap-1.5 mb-2 mt-1">
                                        {(item.selectedOption || (displayOptions.length > 0 && !item.selectedOption)) && (
                                            <View className="flex-row items-center px-2 py-1 rounded-md border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                                                <Text className="text-[11px] font-medium" style={{ color: t.muted }}>Tùy chọn: </Text>
                                                <Text className="text-[11px] font-semibold" style={{ color: t.primary }}>
                                                    {item.selectedOption || (displayOptions.length > 0 ? displayOptions[0] : '')}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.selectedClassification || (displayClassifications.length > 0 && !item.selectedClassification)) && (
                                            <View className="flex-row items-center px-2 py-1 rounded-md border" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                                                <Text className="text-[11px] font-medium" style={{ color: t.muted }}>Phân loại: </Text>
                                                <Text className="text-[11px] font-semibold" style={{ color: t.primary }}>
                                                    {item.selectedClassification || (displayClassifications.length > 0 ? displayClassifications[0] : '')}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                                <View className="flex-row justify-between items-end">
                                    <Text className="text-xs" style={{ color: t.muted }}>x{item.quantity}</Text>
                                    <Text className="text-sm font-bold" style={{ color: t.primary }}>{formatPrice(item.price)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
