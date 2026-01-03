import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '../lib/data';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface WishlistProps {
  items: Product[];
  onBack: () => void;
  onRemove: (productId: string) => void;
  onProductClick: (product: Product) => void;
  theme?: Theme;
}

export function Wishlist({ items, onBack, onRemove, onProductClick, theme }: WishlistProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const t = theme || ctxTheme || lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 0), backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>Sản phẩm yêu thích ({items.length})</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { backgroundColor: t.background }]}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: t.surface }]}>
              <AppIcon name="heart" size={32} color={t.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Danh sách trống</Text>
            <Text style={[styles.emptyText, { color: t.muted }]}>
              Hãy thả tim các sản phẩm bạn yêu thích để lưu vào đây nhé.
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {items.map((product) => (
              <View key={product.id} style={[styles.productCard, { backgroundColor: t.card, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0, elevation: t === lightTheme ? 2 : 0 }]}>
                <TouchableOpacity
                  onPress={() => onProductClick(product)}
                  style={styles.imageContainer}
                  activeOpacity={0.8}
                >
                  <ImageWithFallback
                    source={{ uri: product.image }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onRemove(product.id);
                    }}
                    style={[styles.removeButton, { backgroundColor: t.surface }]}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="heart" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View style={styles.productInfo}>
                  <TouchableOpacity
                    onPress={() => onProductClick(product)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.productName, { color: t.text }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.productFooter}>
                    <Text style={[styles.productPrice, { color: t.primary }]}>{formatPrice(product.price)}</Text>
                    <TouchableOpacity
                      onPress={() => onProductClick(product)}
                      style={[styles.addToCartButton, { backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }]}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="shopping-cart" size={14} color={t.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 300,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
  },
  productInfo: {
    padding: 12,
    gap: 8,
    backgroundColor: 'transparent',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    minHeight: 36,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  addToCartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
