import React, { useEffect, useState, useCallback, useMemo, useDeferredValue } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { CATEGORIES } from '../constants/data';
import { extractCategoriesFromProducts } from '../utils/product';
import { filterProducts } from '../utils/filterUtils';
import { ProductCard } from '../components/ui/ProductCard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme } from '../theme';
import { TEXT_INPUT_BASE_STYLE } from '../theme/typography';

interface CatalogProps {
  onProductClick?: (product: Product) => void;
  onFilterClick?: () => void;
  filters?: {
    priceRange: [number, number];
    categories: string[];
    rating: number | null;
    onlyInStock: boolean;
  };
  applyFilters?: (products: Product[], searchText?: string) => Product[];
  theme?: Theme;
  products?: Product[];
  initialCategory?: string;
  activeCategory?: string;
  onActiveCategoryChange?: (category: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const Catalog = React.memo(function Catalog({
  onProductClick,
  onFilterClick,

  applyFilters,
  theme = lightTheme,
  products = [],
  initialCategory = 'All',
  activeCategory: controlledCategory,
  onActiveCategoryChange,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  filters,
  isLoading = false,
  onRefresh,
}: CatalogProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>(controlledCategory ?? initialCategory ?? 'All');
  const [searchQuery, setSearchQuery] = useState(controlledSearchQuery ?? '');
  const [deferRender, setDeferRender] = useState(true);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const searchInputTextAlignStyle = useMemo(
    () =>
      Platform.select({
        ios: {
          lineHeight: 20,
          paddingVertical: 8,
        },
        android: {
          textAlignVertical: 'center' as const,
          includeFontPadding: false,
          lineHeight: 20,
          paddingVertical: 0,
        },
        default: {
          lineHeight: 20,
          paddingVertical: 8,
        },
      }),
    [],
  );

  useEffect(() => {
    let active = true;
    const task = InteractionManager.runAfterInteractions(() => {
      if (active) {
        setDeferRender(false);
      }
    });
    return () => {
      active = false;
      task.cancel?.();
    };
  }, []);

  const normalizeCategory = useCallback((value?: string) => {
    const key = (value || '').trim().toLowerCase();
    const map: Record<string, string> = {
      'vi dieu khien': 'Vi điều khiển',
      'controller': 'Vi điều khiển',
      'microcontroller': 'Vi điều khiển',
      'cảm biến': 'Cảm biến',
      'sensor': 'Cảm biến',
      'nguon & pin': 'Nguồn & Pin',
      'nguon': 'Nguồn & Pin',
      'power': 'Nguồn & Pin',
      'battery': 'Nguồn & Pin',
      'dây & cáp': 'Dây & Cáp',
      'day & cap': 'Dây & Cáp',
      'cable': 'Dây & Cáp',
      'wire': 'Dây & Cáp',
      'dụng cụ': 'Dụng cụ',
      'dung cu': 'Dụng cụ',
      'tool': 'Dụng cụ',
      'tools': 'Dụng cụ',
      'ic số': 'IC số',
      'ic so': 'IC số',
      'ic': 'IC số',
      'digital ic': 'IC số',
      'điện trở': 'Điện trở',
      'dien tro': 'Điện trở',
      'resistor': 'Điện trở',
      'tụ điện': 'Tụ điện',
      'tu dien': 'Tụ điện',
      'capacitor': 'Tụ điện',
    };
    return map[key] || (value || '').trim();
  }, []);

  const filteredProducts = useMemo(() => {
    if (deferRender) {
      return [];
    }
    // Start with all products
    let next = products;

    // Apply filters first (includes search + advanced filters from CatalogStack)
    if (applyFilters) {
      next = applyFilters(next, deferredSearchQuery);
    } else if (deferredSearchQuery) {
      // Fallback if applyFilters not provided (though it should be)
      next = filterProducts(next, deferredSearchQuery, filters || {});
    }

    // Apply category tab filter (if not 'All')
    if (activeCategory !== 'All') {
      const normalizedActive = normalizeCategory(activeCategory);
      next = next.filter(p => normalizeCategory(p.category) === normalizedActive);
    }

    return next;
  }, [deferRender, products, applyFilters, deferredSearchQuery, filters, activeCategory, normalizeCategory]);

  // Extract categories from products if CATEGORIES is empty
  const displayCategories = useMemo(
    () => (deferRender ? [] : (CATEGORIES.length > 0 ? CATEGORIES : extractCategoriesFromProducts(products))),
    [deferRender, products],
  );
  const categories = useMemo(
    () => [{ name: 'All', icon: 'grid' as const }, ...displayCategories.map(c => ({
      name: c.name,
      icon: c.icon || 'package-variant',
    }))],
    [displayCategories],
  );

  useEffect(() => {
    if (controlledCategory !== undefined) {
      setActiveCategory(controlledCategory);
      return;
    }
    setActiveCategory(initialCategory || 'All');
  }, [controlledCategory, initialCategory]);

  useEffect(() => {
    if (controlledSearchQuery !== undefined) {
      setSearchQuery(controlledSearchQuery);
    }
  }, [controlledSearchQuery]);

  // Simple product press handler - no need to save scroll position as component stays mounted
  const handleProductPress = useCallback((product: Product) => {
    onProductClick?.(product);
  }, [onProductClick]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <View className="flex-1">
      <ProductCard
        product={item}
        theme={theme}
        onPress={() => handleProductPress(item)}
      />
    </View>
  ), [handleProductPress, theme]);

  const renderCategoryItem = useCallback(({ item: cat }: { item: typeof categories[number] }) => {
    const isActive = activeCategory === cat.name;
    return (
      <TouchableOpacity
        key={cat.name}
        onPress={() => {
          setActiveCategory(cat.name);
          onActiveCategoryChange?.(cat.name);
        }}
        className={`flex-row items-center gap-2 px-4 py-2 rounded-full border mr-2`}
        style={{
          backgroundColor: isActive ? theme.text : theme.surface,
          borderColor: isActive ? theme.text : theme.border,
        }}
        activeOpacity={0.7}
      >
        <AppIcon
          name={cat.icon}
          size={16}
          color={isActive ? theme.surface : theme.muted}
        />
        <Text
          className="text-sm font-medium"
          style={{ color: isActive ? theme.surface : theme.muted }}
        >
          {cat.name === 'All' ? t('all') : cat.name}
        </Text>
      </TouchableOpacity>
    );
  }, [activeCategory, onActiveCategoryChange, t, theme]);

  const listHeader = useMemo(() => (
    <View>
      {/* Search Header */}
      <View className="py-2">
        <View
          className="flex-row items-center rounded-xl px-3 h-11"
          style={{
            backgroundColor: theme.surface,
            shadowOpacity: theme === lightTheme ? 0.05 : 0,
            borderColor: theme.border,
            borderWidth: theme === lightTheme ? 0 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <AppIcon name="search" size={18} color={theme.muted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder={t('searchComponents')}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              onSearchQueryChange?.(text);
            }}
            className="flex-1 text-base p-0"
            style={{
              color: theme.text,
              ...TEXT_INPUT_BASE_STYLE,
              ...searchInputTextAlignStyle,
            }}
            placeholderTextColor={theme.muted}
          />
          <TouchableOpacity
            onPress={onFilterClick}
            className="p-1.5 rounded-lg border"
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
              borderWidth: theme === lightTheme ? 0 : 1
            }}
            activeOpacity={0.7}
          >
            <AppIcon name="sliders-horizontal" size={16} color={theme.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <View className="max-h-[72px]">
        {deferRender ? (
          <View className="flex-row items-center" style={{ paddingVertical: 12, gap: 8 }}>
            <View className="h-9 w-24 rounded-full" style={{ backgroundColor: theme.card }} />
            <View className="h-9 w-24 rounded-full" style={{ backgroundColor: theme.card }} />
            <View className="h-9 w-24 rounded-full" style={{ backgroundColor: theme.card }} />
          </View>
        ) : (
          <FlatList
            data={categories}
            horizontal
            keyExtractor={(item) => item.name}
            renderItem={renderCategoryItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12, gap: 8, alignItems: 'center' }}
          />
        )}
      </View>

      {/* Product Count */}
      {deferRender ? (
        <View className="h-4 w-32 rounded-md mb-4" style={{ backgroundColor: theme.card }} />
      ) : (
        <Text className="text-sm font-semibold mb-4" style={{ color: theme.muted }}>
          {t('products_count', { count: filteredProducts.length })}
        </Text>
      )}
    </View>
  ), [
    categories,
    deferRender,
    filteredProducts.length,
    onFilterClick,
    onSearchQueryChange,
    renderCategoryItem,
    searchInputTextAlignStyle,
    searchQuery,
    t,
    theme,
  ]);

  const listEmptyComponent = useMemo(() => (
    <View className="flex-1 justify-center items-center py-20">
      <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
        <AppIcon name="search" size={32} color="#9CA3AF" />
      </View>
      <Text className="text-base font-medium text-gray-500 mb-1">{t('product_not_found')}</Text>
      <Text className="text-sm text-gray-400 mb-5">{t('try_different_keywords')}</Text>
      {onRefresh && (
        <TouchableOpacity
          onPress={onRefresh}
          className="flex-row items-center gap-2 px-5 py-2.5 rounded-xl"
          style={{ backgroundColor: theme.primary }}
          activeOpacity={0.8}
        >
          <AppIcon name="refresh" size={18} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [onRefresh, t, theme]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={!deferRender ? listEmptyComponent : null}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={11}
        initialNumToRender={10}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      />
    </KeyboardAvoidingView>
  );
});
