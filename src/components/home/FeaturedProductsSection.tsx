import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';
import { ProductCard } from '../ui/ProductCard';

interface FeaturedProductsSectionProps {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    isOffline: boolean;
    onRefresh?: () => void;
    onProductClick?: (product: Product) => void;
    visibleCount: number;
    onLoadMore: () => void;
    theme: Theme;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
    products,
    isLoading,
    error,
    isOffline,
    onRefresh,
    onProductClick,
    visibleCount,
    onLoadMore,
    theme
}) => {
    const { t } = useTranslation();
    const visibleProducts = (products.length ? products : []).slice(0, visibleCount);

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('featured_products')}</Text>

            {/* Error State */}
            {error && products.length === 0 && !isLoading && (
                <View style={styles.emptyStateContainer}>
                    <AppIcon name="alert-circle-outline" size={64} color={theme.muted} />
                    <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                        {isOffline ? 'Không có kết nối mạng' : 'Không thể tải sản phẩm'}
                    </Text>
                    <Text style={[styles.emptyStateMessage, { color: theme.muted }]}>
                        {isOffline
                            ? 'Vui lòng kiểm tra kết nối internet của bạn và thử lại.'
                            : error || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.'}
                    </Text>
                    {onRefresh && (
                        <TouchableOpacity
                            onPress={() => onRefresh()}
                            style={[styles.retryButton, { backgroundColor: theme.primary }]}
                            activeOpacity={0.8}
                        >
                            <AppIcon name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Empty State */}
            {!error && products.length === 0 && !isLoading && (
                <View style={styles.emptyStateContainer}>
                    <AppIcon name="package-variant" size={64} color={theme.muted} />
                    <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                        Chưa có sản phẩm
                    </Text>
                    <Text style={[styles.emptyStateMessage, { color: theme.muted }]}>
                        Hiện tại chưa có sản phẩm nào. Vui lòng thử lại sau.
                    </Text>
                    {onRefresh && (
                        <TouchableOpacity
                            onPress={() => onRefresh()}
                            style={[styles.retryButton, { backgroundColor: theme.primary }]}
                            activeOpacity={0.8}
                        >
                            <AppIcon name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.retryButtonText}>Tải lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Products Grid */}
            {products.length > 0 && (
                <>
                    <View style={styles.productsGrid}>
                        {visibleProducts.map((p) => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                theme={theme}
                                onPress={() => onProductClick?.(p)}
                            />
                        ))}
                    </View>
                    {products.length > visibleCount && (
                        <TouchableOpacity
                            onPress={onLoadMore}
                            style={[styles.loadMoreButton, { borderColor: theme.primary }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.loadMoreText, { color: theme.primary }]}>
                                {t('view_more_products', { count: Math.max(products.length - visibleCount, 0) })}
                            </Text>
                            <AppIcon name="chevron-down" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    loadMoreButton: {
        marginTop: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
