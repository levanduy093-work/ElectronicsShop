import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../utils';
import { Theme, lightTheme, useTheme } from '../theme';
import { TYPO_CLASS } from '../theme/typography';

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
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;


  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        className="flex-row items-center px-4 pb-3 border-b shadow-sm"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.card,
          borderBottomColor: t.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text className={`${TYPO_CLASS.screenTitle} flex-1 ml-2`} style={{ color: t.text }}>{translate('favorite_products_count', { count: items.length })}</Text>
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: t.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full justify-center items-center mb-4" style={{ backgroundColor: t.surface }}>
              <AppIcon name="heart" size={32} color={t.muted} />
            </View>
            <Text className={`${TYPO_CLASS.sectionTitle} mb-2`} style={{ color: t.text }}>{translate('wishlist_empty_title')}</Text>
            <Text className={`${TYPO_CLASS.helper} text-center max-w-[300px]`} style={{ color: t.muted }}>
              {translate('wishlist_empty_text')}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3 justify-between">
            {items.map((product) => (
              <View
                key={product.id}
                className="w-[48%] rounded-xl overflow-hidden border shadow-sm"
                style={{
                  backgroundColor: t.card,
                  borderColor: t.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: t === lightTheme ? 0.05 : 0,
                  shadowRadius: 2,
                  elevation: t === lightTheme ? 2 : 0
                }}
              >
                <TouchableOpacity
                  onPress={() => onProductClick(product)}
                  className="w-full aspect-square bg-gray-50 relative p-4"
                  activeOpacity={0.8}
                >
                  <ImageWithFallback
                    source={{ uri: product.image }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                  {product.stock !== 'In Stock' && (
                    <View className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-xl">
                      <Text className="text-white text-[10px] font-medium">
                        {product.stock === 'Low Stock' ? translate('lowStock') : translate('out_of_stock')}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onRemove(product.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full"
                    style={{ backgroundColor: t.surface }}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="heart" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View className="p-3 gap-2">
                  <TouchableOpacity
                    onPress={() => onProductClick(product)}
                    activeOpacity={0.7}
                  >
                    <Text className={`${TYPO_CLASS.helper} font-medium mb-1 min-h-[36px]`} style={{ color: t.text }} numberOfLines={2}>
                      {product.name}
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row justify-between items-center mt-auto">
                    <Text className={TYPO_CLASS.bodyStrong} style={{ color: t.primary }}>{formatPrice(product.price)}</Text>
                    <TouchableOpacity
                      onPress={() => onProductClick(product)}
                      className="w-8 h-8 rounded-full justify-center items-center"
                      style={{ backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }}
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
