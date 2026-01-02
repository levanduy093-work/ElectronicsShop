import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRODUCTS, Product } from '../lib/data';
import { ProductCard } from '../components/ui/ProductCard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface SearchScreenProps {
  onBack: () => void;
  onProductClick?: (product: Product) => void;
  onFilterClick?: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  theme?: Theme;
}

export function SearchScreen({
  onBack,
  onProductClick,
  onFilterClick,
  initialQuery = '',
  onQueryChange,
  theme,
}: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const t = theme || ctxTheme || lightTheme;
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState(['Arduino Uno', 'ESP32', 'Mạch nạp']);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const filteredProducts = query
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const trendingSearches = ['Raspberry Pi 5', 'ESP32 Cam', 'Mỏ hàn', 'Cảm biến nhiệt độ', 'Led RGB'];

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Search Header */}
      <View style={[
        styles.header,
        { paddingTop: Math.max(insets.top, 16), backgroundColor: t.surface, borderBottomColor: t.border }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <View style={[styles.searchContainer, { backgroundColor: t.background, borderColor: t.border, shadowOpacity: t === lightTheme ? 0.05 : 0 }]}>
          <AppIcon name="search" size={18} color={t.muted} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={updateQuery}
            placeholder="Tìm kiếm sản phẩm, linh kiện..."
            style={[styles.searchInput, { color: t.text }]}
            placeholderTextColor={t.muted}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => updateQuery('')}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <AppIcon name="close" size={16} color={t.muted} />
            </TouchableOpacity>
          )}
        </View>
        {query.length > 0 && (
          <TouchableOpacity
            onPress={onFilterClick}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <AppIcon name="sliders-horizontal" size={20} color={t.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={[styles.content, { backgroundColor: t.background }]} showsVerticalScrollIndicator={false}>
        {query ? (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: t.muted }]}>Kết quả tìm kiếm ({filteredProducts.length})</Text>
            {filteredProducts.length > 0 ? (
              <View style={styles.productsGrid}>
                {filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    theme={t}
                    onPress={() => onProductClick?.(p)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <AppIcon name="search" size={32} color={t.muted} />
                </View>
                <Text style={[styles.emptyText, { color: t.muted }]}>Không tìm thấy sản phẩm nào phù hợp.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.emptyStateContainer, { backgroundColor: t.background }]}>
            {/* Recent Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>Tìm kiếm gần đây</Text>
                {recentSearches.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setRecentSearches([])}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.clearHistoryText, { color: t.primary }]}>Xóa lịch sử</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recentSearches.length > 0 ? (
                <View style={styles.recentList}>
                  {recentSearches.map((term, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => updateQuery(term)}
                      style={[styles.recentItem, { backgroundColor: t.surface, borderColor: t.border }]}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="clock" size={16} color={t.muted} />
                      <Text style={[styles.recentText, { color: t.text }]}>{term}</Text>
                      <AppIcon name="chevron-right" size={16} color={t.border} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noHistoryText, { color: t.muted }]}>Chưa có lịch sử tìm kiếm</Text>
              )}
            </View>

            {/* Trending */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppIcon name="trending-up" size={16} color={t.primary} />
                <Text style={[styles.sectionTitle, { color: t.text }]}>Tìm kiếm phổ biến</Text>
              </View>
              <View style={styles.trendingContainer}>
                {trendingSearches.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => updateQuery(tag)}
                    style={[styles.trendingTag, { backgroundColor: t.surface, borderColor: t.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.trendingText, { color: t.text }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
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
    fontSize: 14,
    color: '#6B7280',
  },
  emptyStateContainer: {
    padding: 16,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearHistoryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentList: {
    gap: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  noHistoryText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    padding: 8,
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trendingText: {
    fontSize: 14,
    color: '#4B5563',
  },
});
