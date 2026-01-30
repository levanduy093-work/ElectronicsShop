import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <View className="mb-8">
            <Text
                className="text-lg font-bold mb-4"
                style={{ color: theme.text }}
            >
                {t('featured_products')}
            </Text>

            {/* Error State */}
            {error && products.length === 0 && !isLoading && (
                <View className="items-center justify-center py-12 px-8">
                    <AppIcon name="alert-circle-outline" size={64} color={theme.muted} />
                    <Text
                        className="text-lg font-semibold mt-4 mb-2 text-center"
                        style={{ color: theme.text }}
                    >
                        {isOffline ? 'Không có kết nối mạng' : 'Không thể tải sản phẩm'}
                    </Text>
                    <Text
                        className="text-sm text-center mb-6 leading-5"
                        style={{ color: theme.muted }}
                    >
                        {isOffline
                            ? 'Vui lòng kiểm tra kết nối internet của bạn và thử lại.'
                            : error || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.'}
                    </Text>
                    {onRefresh && (
                        <TouchableOpacity
                            onPress={() => onRefresh()}
                            className="flex-row items-center gap-2 px-6 py-3 rounded-xl"
                            style={{ backgroundColor: theme.primary }}
                            activeOpacity={0.8}
                        >
                            <AppIcon name="refresh" size={20} color="#FFFFFF" />
                            <Text className="text-white text-base font-semibold">Thử lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Empty State */}
            {!error && products.length === 0 && !isLoading && (
                <View className="items-center justify-center py-12 px-8">
                    <AppIcon name="package-variant" size={64} color={theme.muted} />
                    <Text
                        className="text-lg font-semibold mt-4 mb-2 text-center"
                        style={{ color: theme.text }}
                    >
                        Chưa có sản phẩm
                    </Text>
                    <Text
                        className="text-sm text-center mb-6 leading-5"
                        style={{ color: theme.muted }}
                    >
                        Hiện tại chưa có sản phẩm nào. Vui lòng thử lại sau.
                    </Text>
                    {onRefresh && (
                        <TouchableOpacity
                            onPress={() => onRefresh()}
                            className="flex-row items-center gap-2 px-6 py-3 rounded-xl"
                            style={{ backgroundColor: theme.primary }}
                            activeOpacity={0.8}
                        >
                            <AppIcon name="refresh" size={20} color="#FFFFFF" />
                            <Text className="text-white text-base font-semibold">Tải lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Products Grid */}
            {products.length > 0 && (
                <>
                    <View className="flex-row flex-wrap gap-4 justify-between">
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
                            className="mt-3 self-center flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border"
                            style={{ borderColor: theme.primary }}
                            activeOpacity={0.8}
                        >
                            <Text
                                className="text-sm font-semibold"
                                style={{ color: theme.primary }}
                            >
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
