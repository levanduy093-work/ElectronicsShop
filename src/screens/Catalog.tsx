import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { CATEGORIES } from '../constants/data';
import { extractCategoriesFromProducts } from '../utils/product';
import { ProductCard } from '../components/ui/ProductCard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme } from '../theme';

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
  initialScrollOffset?: number;
  onScrollPositionChange?: (offset: number) => void;
}

export function Catalog({
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
  initialScrollOffset,
  onScrollPositionChange,
}: CatalogProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>(controlledCategory ?? initialCategory ?? 'All');
  const [searchQuery, setSearchQuery] = useState(controlledSearchQuery ?? '');
  const listRef = useRef<FlatList<Product>>(null);
  const hasRestoredScroll = useRef(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const scrollRestorationAttempted = useRef(false);
  // Store the initial scroll offset on component mount - capture immediately
  const initialOffsetValue = initialScrollOffset ?? 0;
  const pendingScrollOffset = useRef<number>(initialOffsetValue);
  const lastContentHeight = useRef(0);
  const mountedWithScrollOffset = useRef(initialOffsetValue);
  // Track current scroll position
  const currentScrollPosition = useRef(0);

  const normalizeCategory = (value?: string) => {
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
  };

  // Start with all products
  let filteredProducts = products;

  // Apply search filter first (if any)
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply category filter (if not 'All')
  if (activeCategory !== 'All') {
    const normalizedActive = normalizeCategory(activeCategory);
    filteredProducts = filteredProducts.filter(p => normalizeCategory(p.category) === normalizedActive);
  }

  // Apply advanced filters (price, rating, stock, categories from filter screen)
  if (applyFilters) {
    filteredProducts = applyFilters(filteredProducts);
  }

  // Extract categories from products if CATEGORIES is empty
  const displayCategories = CATEGORIES.length > 0 ? CATEGORIES : extractCategoriesFromProducts(products);
  const categories = [{ name: 'All', icon: 'grid' as const }, ...displayCategories.map(c => ({
    name: c.name,
    icon: c.icon || 'package-variant',
  }))];

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

  // Reset scroll restoration flag when component mounts
  useEffect(() => {
    // Capture the initial scroll offset from props at mount time
    // Use the prop value directly since refs might not be initialized yet
    const targetOffset = initialScrollOffset ?? 0;
    
    // Reset all flags for fresh restoration attempt
    scrollRestorationAttempted.current = false;
    hasRestoredScroll.current = false;
    lastContentHeight.current = 0;
    currentScrollPosition.current = 0;
    
    if (targetOffset > 0) {
      pendingScrollOffset.current = targetOffset;
      mountedWithScrollOffset.current = targetOffset;
      
      // Immediate restore attempt after mount
      const timer = setTimeout(() => {
        if (listRef.current && !hasRestoredScroll.current && pendingScrollOffset.current > 0) {
          listRef.current.scrollToOffset({
            offset: pendingScrollOffset.current,
            animated: false,
          });
          scrollRestorationAttempted.current = true;
          hasRestoredScroll.current = true;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // No scroll restoration needed
      pendingScrollOffset.current = 0;
      hasRestoredScroll.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Attempt to restore scroll position when content is ready
  const handleContentSizeChange = useCallback((width: number, height: number) => {
    // Track content height changes
    lastContentHeight.current = height;
    
    const targetScrollOffset = pendingScrollOffset.current;
    
    // Skip if no pending scroll offset or already restored
    if (targetScrollOffset <= 0 || hasRestoredScroll.current) {
      return;
    }
    
    // Need enough content to scroll to the target position
    // Use a smaller threshold to restore earlier
    const minRequiredHeight = targetScrollOffset + 50;
    if (height < minRequiredHeight) {
      return;
    }
    
    // Attempt scroll restoration
    if (listRef.current) {
      // Calculate valid scroll offset
      const screenHeight = Dimensions.get('window').height;
      const maxOffset = Math.max(0, height - screenHeight + 200);
      const finalOffset = Math.min(targetScrollOffset, maxOffset);
      
      if (finalOffset > 0) {
        // Mark as attempted before scrolling
        scrollRestorationAttempted.current = true;
        
        // Scroll immediately without animation
        listRef.current.scrollToOffset({ 
          offset: finalOffset, 
          animated: false 
        });
        
        // Mark as restored
        hasRestoredScroll.current = true;
      } else {
        hasRestoredScroll.current = true;
      }
    }
  }, []);

  const handleLayout = useCallback(() => {
    if (!isLayoutReady) {
      setIsLayoutReady(true);
      
      // Backup restoration: try to restore when layout is ready
      const targetOffset = pendingScrollOffset.current;
      if (targetOffset > 0 && !hasRestoredScroll.current && listRef.current) {
        // Use setTimeout to ensure FlatList is ready
        setTimeout(() => {
          if (listRef.current && !hasRestoredScroll.current) {
            listRef.current.scrollToOffset({ 
              offset: targetOffset, 
              animated: false 
            });
            scrollRestorationAttempted.current = true;
            hasRestoredScroll.current = true;
          }
        }, 50);
      }
    }
  }, [isLayoutReady]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Always track the current scroll position
    currentScrollPosition.current = offsetY;
    
    // Always save scroll position to parent
    // This ensures we capture the scroll position even during scroll restoration
    onScrollPositionChange?.(offsetY);
  }, [onScrollPositionChange]);
  
  // Also capture scroll position when momentum ends (after fling/swipe)
  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    currentScrollPosition.current = offsetY;
    onScrollPositionChange?.(offsetY);
  }, [onScrollPositionChange]);
  
  // Capture scroll position when scroll ends by dragging
  const handleScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    currentScrollPosition.current = offsetY;
    onScrollPositionChange?.(offsetY);
  }, [onScrollPositionChange]);
  
  // Wrap onProductClick to ensure scroll position is saved before navigation
  const handleProductPress = useCallback((product: Product) => {
    // Ensure current scroll position is saved before navigating
    const scrollPos = currentScrollPosition.current;
    onScrollPositionChange?.(scrollPos);
    onProductClick?.(product);
  }, [onProductClick, onScrollPositionChange]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Header */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[
          styles.searchInputContainer,
          { backgroundColor: theme.surface, shadowOpacity: theme === lightTheme ? 0.05 : 0, borderColor: theme.border, borderWidth: theme === lightTheme ? 0 : 1 }
        ]}>
          <AppIcon name="search" size={18} color={theme.muted} style={styles.searchIcon} />
          <TextInput
            placeholder={t('searchComponents')}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              onSearchQueryChange?.(text);
            }}
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.muted}
          />
          <TouchableOpacity
            onPress={onFilterClick}
            style={[styles.filterButton, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: theme === lightTheme ? 0 : 1 }]}
            activeOpacity={0.7}
          >
            <AppIcon name="sliders-horizontal" size={16} color={theme.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.name}
              onPress={() => {
                setActiveCategory(cat.name);
                onActiveCategoryChange?.(cat.name);
              }}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isActive ? theme.text : theme.surface,
                  borderColor: isActive ? theme.text : theme.border,
                }
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.categoryTabContent}>
                <AppIcon
                  name={cat.icon}
                  size={16}
                  color={isActive ? theme.surface : theme.muted}
                />
                <Text style={[
                  styles.categoryTabText,
                  { color: isActive ? theme.surface : theme.muted }
                ]}>
                  {cat.name === 'All' ? t('all') : cat.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Product Grid */}
      <View style={styles.productsContainer}>
        <Text style={[styles.productsCount, { color: theme.muted }]}>{t('products_count', { count: filteredProducts.length })}</Text>
        {filteredProducts.length > 0 ? (
          <FlatList
            key="catalog-product-list"
            ref={listRef}
            data={filteredProducts}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                theme={theme}
                onPress={() => handleProductPress(item)}
              />
            )}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productsRow}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollEndDrag={handleScrollEndDrag}
            scrollEventThrottle={16}
            onLayout={handleLayout}
            onContentSizeChange={handleContentSizeChange}
            removeClippedSubviews={false}
            maxToRenderPerBatch={12}
            updateCellsBatchingPeriod={50}
            windowSize={15}
            initialNumToRender={12}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <AppIcon name="search" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>{t('product_not_found')}</Text>
            <Text style={styles.emptySubtext}>{t('try_different_keywords')}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  categoriesScroll: {
    maxHeight: 72,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  productsGrid: {
    paddingBottom: 96,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
