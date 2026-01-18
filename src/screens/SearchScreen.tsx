import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { loadSearchHistory, saveSearchQuery, clearSearchHistory } from '../utils/searchHistory';

interface SearchScreenProps {
  onBack: () => void;
  onProductClick?: (product: Product) => void;
  onFilterClick?: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  filters?: {
    priceRange: [number, number];
    categories: string[];
    rating: number | null;
    onlyInStock: boolean;
  };
  applyFilters?: (products: Product[], searchText?: string) => Product[];
  theme?: Theme;
  products?: Product[];
  userId?: string | null;
  isLoggedIn?: boolean;
  accessToken?: string | null;
}

export function SearchScreen({
  onBack,
  onProductClick,
  onFilterClick,
  initialQuery = '',
  onQueryChange,
  filters,
  applyFilters,
  theme,
  products = [],
  userId = null,
  isLoggedIn = false,
  accessToken = null,
}: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRecentSearchesExpanded, setIsRecentSearchesExpanded] = useState(false);

  // Load search history khi component mount hoặc userId/accessToken thay đổi
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await loadSearchHistory(userId, accessToken || undefined);
        setRecentSearches(history);
      } catch (error) {
        console.warn('Failed to load search history', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [userId, isLoggedIn, accessToken]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Hàm để lưu query vào lịch sử (chỉ gọi khi user submit hoặc chọn từ danh sách)
  const saveToHistory = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    
    try {
      await saveSearchQuery(searchQuery.trim(), userId, accessToken || undefined);
      // Reload history để cập nhật UI
      const updatedHistory = await loadSearchHistory(userId, accessToken || undefined);
      setRecentSearches(updatedHistory);
    } catch (error) {
      console.warn('Failed to save search query', error);
    }
  }, [userId, accessToken]);

  // Hàm cập nhật query (không tự động lưu vào lịch sử)
  const updateQuery = useCallback((newQuery: string, shouldSave: boolean = false) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
    
    // Chỉ lưu vào lịch sử nếu shouldSave = true (khi user chọn từ danh sách hoặc submit)
    if (shouldSave) {
      saveToHistory(newQuery);
    }
  }, [onQueryChange, saveToHistory]);
  
  // Xử lý khi user submit search (nhấn enter hoặc search button)
  const handleSearchSubmit = useCallback(() => {
    if (query && query.trim().length >= 2) {
      saveToHistory(query);
    }
  }, [query, saveToHistory]);
  
  const handleClearHistory = useCallback(async () => {
    try {
      await clearSearchHistory(userId, accessToken || undefined);
      setRecentSearches([]);
    } catch (error) {
      console.warn('Failed to clear search history', error);
    }
  }, [userId, accessToken]);

  // Apply filters and search
  const normalizeText = (value?: string) =>
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const fuzzyMatch = (haystack: string, needle: string) => {
    const h = normalizeText(haystack);
    const n = normalizeText(needle);
    if (!n) return true;
    if (h.includes(n)) return true;
    const tokens = n.split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const allTokensIncluded = tokens.every(t => h.includes(t));
    if (allTokensIncluded) return true;
    const words = h.split(/\s+/).filter(Boolean);
    return tokens.every(t => words.some(w => w.startsWith(t)));
  };

  const categoryAliases: Record<string, string[]> = {
    capacitor: ['tu dien', 'tụ điện', 'tụ điện hóa', 'tudien'],
    resistor: ['dien tro', 'điện trở', 'trở'],
    microcontroller: ['vi dieu khien', 'vi điều khiển', 'controller'],
    controller: ['vi dieu khien', 'vi điều khiển', 'controller'],
    sensor: ['cam bien', 'cảm biến'],
    power: ['nguon', 'nguon & pin', 'nguồn', 'nguồn & pin', 'battery', 'pin'],
    battery: ['pin', 'nguon', 'nguon & pin'],
    cable: ['day cap', 'dây cáp', 'dây & cáp', 'wire'],
    wire: ['day', 'day cap', 'dây', 'cable'],
    tool: ['dung cu', 'dụng cụ', 'tools'],
    ic: ['ic so', 'ic số', 'digital ic'],
  };

  const filteredProducts = query
    ? products.filter(p => {
        const aliases = categoryAliases[normalizeText(p.category)] || [];
        const haystacks = [
          p.name,
          p.code || '',
          p.category || '',
          ...aliases,
          p.description || '',
          Object.entries(p.specs || {})
            .map(([k, v]) => `${k} ${v}`)
            .join(' '),
        ];
        return haystacks.some(h => fuzzyMatch(h, query));
      })
    : [];

  const trendingSearches = ['Raspberry Pi 5', 'ESP32 Cam', 'Mỏ hàn', 'Cảm biến nhiệt độ', 'Led RGB'];

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: t.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            onChangeText={(text) => updateQuery(text, false)}
            onSubmitEditing={handleSearchSubmit}
            placeholder={translate('searchProductComponent')}
            style={[styles.searchInput, { color: t.text }]}
            placeholderTextColor={t.muted}
            autoFocus
            returnKeyType="search"
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
            style={[styles.filterButton, { backgroundColor: t.surface, borderColor: t.border }]}
            activeOpacity={0.7}
          >
            <AppIcon name="sliders-horizontal" size={20} color={t.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={[styles.content, { backgroundColor: t.background }]} showsVerticalScrollIndicator={false}>
        {query ? (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: t.muted }]}>{translate('search_results', { count: filteredProducts.length })}</Text>
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
                <Text style={[styles.emptyText, { color: t.muted }]}>{translate('no_search_results')}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.emptyStateContainer, { backgroundColor: t.background }]}>
            {/* Recent Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>{translate('recent_searches')}</Text>
                {recentSearches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearHistory}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.clearHistoryText, { color: t.primary }]}>{translate('clear_history')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recentSearches.length > 0 ? (
                <>
                  <View style={styles.recentChipsContainer}>
                    {(isRecentSearchesExpanded ? recentSearches : recentSearches.slice(0, 10)).map((term, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => updateQuery(term, true)}
                        style={[styles.recentChip, { backgroundColor: t.surface, borderColor: t.border }]}
                        activeOpacity={0.7}
                      >
                        <AppIcon name="clock" size={14} color={t.muted} />
                        <Text style={[styles.recentChipText, { color: t.text }]}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {recentSearches.length > 10 && (
                    <TouchableOpacity
                      onPress={() => setIsRecentSearchesExpanded(!isRecentSearchesExpanded)}
                      style={styles.expandButton}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.expandButtonText, { color: t.primary }]}>
                        {isRecentSearchesExpanded ? translate('collapse') : translate('see_more')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text style={[styles.noHistoryText, { color: t.muted }]}>{translate('no_search_history')}</Text>
              )}
            </View>

            {/* Trending */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppIcon name="trending-up" size={16} color={t.primary} />
                <Text style={[styles.sectionTitle, { color: t.text }]}>{translate('popular_searches')}</Text>
              </View>
              <View style={styles.trendingContainer}>
                {trendingSearches.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => updateQuery(tag, true)}
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
    </KeyboardAvoidingView>
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
  recentChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  recentChipText: {
    fontSize: 13,
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
  expandButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
