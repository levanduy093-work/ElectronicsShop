import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
        <View style={[styles.itemCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 }]}>
            <ImageWithFallback
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
            />

            <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color: t.text }]} numberOfLines={2}>{item.name}</Text>
                    <TouchableOpacity
                        onPress={() => onRemoveItem(item.id)}
                        style={styles.removeButton}
                        activeOpacity={0.7}
                    >
                        <AppIcon name="trash" size={16} color={t.muted} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.itemCategory, { color: t.muted }]}>{item.category}</Text>
                {((item.options && item.options.length > 0) || (item.classifications && item.classifications.length > 0)) && (
                    <View style={styles.optionsContainer}>
                        {item.options && item.options.length > 0 && (
                            <TouchableOpacity
                                onPress={() => onEditOption(item)}
                                style={[styles.optionTag, { backgroundColor: t.surface, borderColor: t.border }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionLabel, { color: t.muted }]}>Tùy chọn: </Text>
                                <Text style={[styles.optionValue, { color: t.primary }]}>
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
                                style={[styles.optionTag, { backgroundColor: t.surface, borderColor: t.border }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionLabel, { color: t.muted }]}>Phân loại: </Text>
                                <Text style={[styles.optionValue, { color: t.primary }]}>
                                    {item.selectedClassification || (item.classifications.length > 0 ? item.classifications[0] : '')}
                                </Text>
                                {item.classifications.length > 1 && (
                                    <AppIcon name="chevron-down" size={14} color={t.primary} style={{ marginLeft: 4 }} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={styles.itemFooter}>
                    <Text style={[styles.itemPrice, { color: t.primary }]}>{formatPrice(item.price)}</Text>

                    <View style={[styles.quantityContainer, { backgroundColor: t.surface }]}>
                        <TouchableOpacity
                            onPress={() => onUpdateQuantity(item.id, -1)}
                            style={[styles.quantityButton, { backgroundColor: t.card, borderColor: t.border }]}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="minus" size={12} color={t.text} />
                        </TouchableOpacity>
                        <Text style={[styles.quantityText, { color: t.text }]}>{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => onUpdateQuantity(item.id, 1)}
                            style={[styles.quantityButton, { backgroundColor: t.card, borderColor: t.border }]}
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

const styles = StyleSheet.create({
    itemCard: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        gap: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    itemContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    removeButton: {
        padding: 4,
    },
    itemCategory: {
        fontSize: 12,
        marginBottom: 8,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    optionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    optionLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    optionValue: {
        fontSize: 11,
        fontWeight: '600',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        padding: 4,
        gap: 12,
    },
    quantityButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '500',
        minWidth: 16,
        textAlign: 'center',
    },
});
