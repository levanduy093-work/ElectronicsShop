import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
}

export const OrderProductList: React.FC<OrderProductListProps> = ({ orderItems, products, theme: t }) => {
    const { t: translate } = useTranslation();

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: t.card,
                borderColor: t.border,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }
        ]}>
            <View style={styles.cardHeader}>
                <AppIcon name="package" size={18} color={t.primary} />
                <Text style={[styles.cardTitle, { color: t.text }]}>{translate('product')}</Text>
            </View>
            <View style={styles.productsList}>
                {orderItems.map((item) => {
                    const product = products.find(p => p.id === item.id);
                    const displayOptions = product?.options || [];
                    const displayClassifications = product?.classifications || [];

                    return (
                        <View key={item.id} style={styles.productItem}>
                            <ImageWithFallback
                                source={{ uri: item.image }}
                                style={[styles.productImage, { backgroundColor: t.surface }]}
                                resizeMode="cover"
                            />
                            <View style={styles.productInfo}>
                                <Text style={[styles.productName, { color: t.text }]} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                {(item.selectedOption || item.selectedClassification || displayOptions.length > 0 || displayClassifications.length > 0) && (
                                    <View style={styles.optionsContainer}>
                                        {(item.selectedOption || (displayOptions.length > 0 && !item.selectedOption)) && (
                                            <View style={[styles.optionTag, { backgroundColor: t.surface, borderColor: t.border }]}>
                                                <Text style={[styles.optionLabel, { color: t.muted }]}>Tùy chọn: </Text>
                                                <Text style={[styles.optionValue, { color: t.primary }]}>
                                                    {item.selectedOption || (displayOptions.length > 0 ? displayOptions[0] : '')}
                                                </Text>
                                            </View>
                                        )}
                                        {(item.selectedClassification || (displayClassifications.length > 0 && !item.selectedClassification)) && (
                                            <View style={[styles.optionTag, { backgroundColor: t.surface, borderColor: t.border }]}>
                                                <Text style={[styles.optionLabel, { color: t.muted }]}>Phân loại: </Text>
                                                <Text style={[styles.optionValue, { color: t.primary }]}>
                                                    {item.selectedClassification || (displayClassifications.length > 0 ? displayClassifications[0] : '')}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                                <View style={styles.productFooter}>
                                    <Text style={[styles.productQuantity, { color: t.muted }]}>x{item.quantity}</Text>
                                    <Text style={[styles.productPrice, { color: t.primary }]}>{formatPrice(item.price)}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productsList: {
        gap: 16,
    },
    productItem: {
        flexDirection: 'row',
        gap: 12,
    },
    productImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    productQuantity: {
        fontSize: 12,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
        marginTop: 4,
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
});
