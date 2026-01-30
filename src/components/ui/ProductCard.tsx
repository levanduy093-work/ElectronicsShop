import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { AppIcon } from '../common/Icon';
import { formatPrice } from '../../utils';
import { Theme, lightTheme } from '../../theme';

interface ProductCardProps {
  product: Product;
  style?: any;
  onPress?: () => void;

  theme?: Theme;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

export function ProductCard({ product, style, onPress, theme = lightTheme }: ProductCardProps) {
  const { t } = useTranslation();
  const hasReviews = (product.reviews ?? 0) > 0 && (product.rating ?? 0) > 0;
  const displayRating = hasReviews ? Number(product.rating).toFixed(1) : '0';
  const displayReviewCount = hasReviews ? product.reviews : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
      style={[
        {
          width: cardWidth,
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowOpacity: theme === lightTheme ? 0.04 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: 2,
        },
        style
      ]}
    >
      <View className="w-full aspect-square bg-[#F9FAFB] rounded-xl overflow-hidden mb-3 relative">
        <ImageWithFallback
          source={{ uri: product.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {product.stock !== 'In Stock' && (
          <View className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-xl">
            <Text className="text-white text-[10px] font-medium">
              {product.stock === 'Low Stock' ? t('lowStock') : t('out_of_stock')}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 justify-between">
        <Text
          className="text-sm font-medium text-gray-900 mb-1 leading-[18px] min-h-[36px]"
          style={{ color: theme.text }}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <View className="flex-row items-center gap-1 mb-2">
          <AppIcon name="star" size={12} color="#FBBF24" />
          <Text className="text-xs text-gray-500" style={{ color: theme.muted }}>
            {displayRating} ({displayReviewCount})
          </Text>
        </View>

        <View className="mt-auto">
          {product.originalPrice && (
            <Text
              className="text-[10px] text-gray-400 line-through mb-0.5"
              style={{ color: theme.muted }}
            >
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          <Text
            className="text-base font-bold text-blue-600"
            style={{ color: theme.primary }}
          >
            {formatPrice(product.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
