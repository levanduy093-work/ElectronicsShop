import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
  onAdd?: (product: Product) => void;
  theme?: Theme;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

export function ProductCard({ product, style, onPress, onAdd, theme = lightTheme }: ProductCardProps) {
  const { t } = useTranslation();
  const hasReviews = (product.reviews ?? 0) > 0 && (product.rating ?? 0) > 0;
  const displayRating = hasReviews ? Number(product.rating).toFixed(1) : '0';
  const displayReviewCount = hasReviews ? product.reviews : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.border, shadowOpacity: theme === lightTheme ? 0.04 : 0 },
        style
      ]}
    >
      <View style={styles.imageContainer}>
        <ImageWithFallback
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.stock !== 'In Stock' && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>
              {product.stock === 'Low Stock' ? t('lowStock') : t('out_of_stock')}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <AppIcon name="star" size={12} color="#FBBF24" />
          <Text style={[styles.rating, { color: theme.muted }]}>
            {displayRating} ({displayReviewCount})
          </Text>
        </View>

        <View style={styles.priceContainer}>
          {product.originalPrice && (
            <Text style={[styles.originalPrice, { color: theme.muted }]}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          <Text style={[styles.price, { color: theme.primary }]}>
            {formatPrice(product.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    width: cardWidth,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    marginTop: 'auto',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
});
