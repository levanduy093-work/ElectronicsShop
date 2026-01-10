import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { CATEGORIES, Product, extractCategoriesFromProducts } from '../lib/data';
import { ProductCard } from '../components/ui/ProductCard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme } from '../lib/theme';

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
}

export function Catalog({ onProductClick, onFilterClick, filters, applyFilters, theme = lightTheme, products = [], initialCategory = 'All' }: CatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');

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

  React.useEffect(() => {
    setActiveCategory(initialCategory || 'All');
  }, [initialCategory]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Header */}
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[
          styles.searchInputContainer,
          { backgroundColor: theme.surface, shadowOpacity: theme === lightTheme ? 0.05 : 0, borderColor: theme.border, borderWidth: theme === lightTheme ? 0 : 1 }
        ]}>
          <AppIcon name="search" size={18} color={theme.muted} style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm kiếm linh kiện..."
            value={searchQuery}
            onChangeText={setSearchQuery}
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
              onPress={() => setActiveCategory(cat.name)}
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
                  {cat.name === 'All' ? 'Tất cả' : cat.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Product Grid */}
      <View style={styles.productsContainer}>
        <Text style={[styles.productsCount, { color: theme.muted }]}>{filteredProducts.length} sản phẩm</Text>
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                theme={theme}
                onPress={() => onProductClick?.(item)}
              />
            )}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productsRow}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <AppIcon name="search" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
          </View>
        )}
      </View>
    </View>
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
