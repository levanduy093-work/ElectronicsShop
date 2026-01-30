import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { loadSearchHistory, saveSearchQuery, clearSearchHistory, loadLocalHistory } from '../utils/searchHistory';
import { socketService } from '../services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterProducts } from '../utils/filterUtils';

interface SearchScreenProps {
  onBack: () => void;
  onProductClick?: (product: Product) => void;
  onFilterClick?: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;

  theme?: Theme;
  products?: Product[];
  userId?: string | null;
  isLoggedIn?: boolean;
  accessToken?: string | null;
  filters?: {
    priceRange?: [number, number];
    categories?: string[];
    rating?: number | null;
    onlyInStock?: boolean;
  };
  initialScrollOffset?: number;
  onScrollPositionChange?: (offset: number) => void;
}

export function SearchScreen({
  onBack,
  onProductClick,
  onFilterClick,
  initialQuery = '',
  onQueryChange,
  theme,
  products = [],
  userId = null,
  isLoggedIn = false,
  accessToken = null,
  filters, // Destructure filters
  initialScrollOffset,
  onScrollPositionChange,
}: SearchScreenProps) {
  const props = { filters }; // Helper to access props inside component if needed or just use destructured

  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [isRecentSearchesExpanded, setIsRecentSearchesExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Restore scroll position when component mounts or initialScrollOffset changes
  useEffect(() => {
    if (scrollViewRef.current && initialScrollOffset !== undefined) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ y: initialScrollOffset, animated: false });
      });
    }
  }, [initialScrollOffset]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollPositionChange?.(event.nativeEvent.contentOffset.y);
  };

  // Load search history khi component mount hoặc userId/accessToken thay đổi
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 1. Cache-first: Load from local storage immediately for instant UI
        const localData = await loadLocalHistory(userId);
        if (localData && localData.length > 0) {
          setRecentSearches(localData);
        }

        // 2. Network-update: Sync with server in background
        if (userId && accessToken) {
          const syncedData = await loadSearchHistory(userId, accessToken);
          // Only update if different to avoid re-renders or if local was empty
          if (JSON.stringify(syncedData) !== JSON.stringify(localData)) {
            setRecentSearches(syncedData);
          }
        } else if (!localData || localData.length === 0) {
          // If guest and no local data, normal load (which tries migration)
          const history = await loadSearchHistory(userId, accessToken || undefined);
          setRecentSearches(history);
        }
      } catch (error) {
        console.warn('Failed to load search history', error);
      }
    };

    loadHistory();
  }, [userId, isLoggedIn, accessToken]);

  // Real-time search history sync
  useEffect(() => {
    const handleHistoryUpdate = (updatedHistory: string[]) => {
      console.log('Received search history update');
      setRecentSearches(updatedHistory);
      // We don't need to manually save to AsyncStorage here because the backend 
      // is the source of truth for the 'updatedHistory' payload.
      // However, to keep local cache in sync for next restart:
      if (userId) {
        import('../utils/searchHistory').then(({ saveSearchQuery }) => {
          // Just refreshing the view is enough, but saving to local storage needs 
          // a specific function or we can just rely on the next load.
          // Better approach might be to expose a way to overwrite local storage.
        });
      }
    };

    // Better implementation: Update local storage directly
    const handleSocketUpdate = async (updatedHistory: string[]) => {
      setRecentSearches(updatedHistory);
      // Sync to local storage for offline/next load
      if (userId) {
        const key = `electronicsshop/search_history/user/${userId}`;
        const historyItems = updatedHistory.map((query, index) => ({
          query,
          timestamp: Date.now() - index * 1000
        }));
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(key, JSON.stringify(historyItems));
      }
    };

    if (userId) {
      // We need to import socketService dynamically or ensure it's imported
      import('../services/socket').then(({ socketService }) => {
        socketService.on('search_history_updated', handleSocketUpdate);
      });
    }

    return () => {
      import('../services/socket').then(({ socketService }) => {
        socketService.off('search_history_updated');
      });
    };
  }, [userId]);

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

  // Lưu query vào search trends database chạy nền (fire-and-forget) - không block UI
  const incrementTrendInBackground = useCallback((searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    // Fire-and-forget: gọi API increment trực tiếp, không cần auth
    import('../services/api').then(({ incrementSearchTrend }) => {
      incrementSearchTrend(searchQuery.trim())
        .catch(err => console.warn('Background increment trend failed:', err));
    });

    // Đồng thời lưu vào search history của user (nếu đã đăng nhập)
    if (userId && accessToken) {
      saveSearchQuery(searchQuery.trim(), userId, accessToken)
        .then(() => {
          loadSearchHistory(userId, accessToken)
            .then(setRecentSearches)
            .catch(() => { /* ignore */ });
        })
        .catch(() => { /* ignore */ });
    }
  }, [userId, accessToken]);

  // Handler khi user click vào sản phẩm trong kết quả tìm kiếm
  const handleProductClick = useCallback((product: Product) => {
    // 1. Lưu query vào search trends database chạy nền (không block, không cần auth)
    if (query && query.trim().length >= 2) {
      incrementTrendInBackground(query);
    }

    // 2. Gọi callback để navigate đến product detail (không bị delay)
    onProductClick?.(product);
  }, [query, incrementTrendInBackground, onProductClick]);

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
  // Filters
  const {
    priceRange = [0, 100000000],
    categories = [],
    rating = null,
    onlyInStock = false
  } = (props.filters || {});

  const filteredProducts = query
    ? filterProducts(products, query, { priceRange, categories, rating, onlyInStock })
    : [];

  const [trendingSearches, setTrendingSearches] = useState(['Raspberry Pi 5', 'ESP32 Cam', 'Mỏ hàn', 'Cảm biến nhiệt độ', 'Led RGB']);

  useEffect(() => {
    import('../services/api').then(({ getSearchTrends, getPopularSearches }) => {
      // Try the dedicated search trends endpoint first
      getSearchTrends(10)
        .then(trends => {
          if (trends && trends.length > 0) {
            setTrendingSearches(trends);
          }
        })
        .catch(() => {
          // Fallback to popular searches from user history aggregation
          getPopularSearches()
            .then(trends => {
              if (trends && trends.length > 0) {
                setTrendingSearches(trends);
              }
            })
            .catch(err => console.warn('Failed to load search trends', err));
        });
    });
  }, []);


  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b gap-3"
        style={{
          paddingTop: Math.max(insets.top, 16),
          backgroundColor: t.surface,
          borderBottomColor: t.border
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-1" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>
        <View
          className="flex-1 flex-row items-center h-10 px-3 rounded-xl border shadow-sm"
          style={{
            backgroundColor: t.background,
            borderColor: t.border,
            shadowOpacity: t === lightTheme ? 0.05 : 0
          }}
        >
          <AppIcon name="search" size={18} color={t.muted} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={(text) => updateQuery(text, false)}
            onSubmitEditing={handleSearchSubmit}
            placeholder={translate('searchProductComponent')}
            className="flex-1 text-sm"
            style={{ color: t.text }}
            placeholderTextColor={t.muted}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => updateQuery('')}
              className="p-1"
              activeOpacity={0.7}
            >
              <AppIcon name="close" size={16} color={t.muted} />
            </TouchableOpacity>
          )}
        </View>
        {query.length > 0 && (
          <TouchableOpacity
            onPress={onFilterClick}
            className="p-2 rounded-xl border"
            style={{ backgroundColor: t.surface, borderColor: t.border }}
            activeOpacity={0.7}
          >
            <AppIcon name="sliders-horizontal" size={20} color={t.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        style={{ backgroundColor: t.background }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: initialScrollOffset || 0 }}
      >
        {query ? (
          <View className="p-4">
            <Text className="text-sm font-semibold mb-4" style={{ color: t.muted }}>{translate('search_results', { count: filteredProducts.length })}</Text>
            {filteredProducts.length > 0 ? (
              <View className="flex-row flex-wrap gap-4 justify-between">
                {filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    theme={t}
                    onPress={() => handleProductClick(p)}
                  />
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-12">
                <View className="w-16 h-16 rounded-full justify-center items-center mb-4" style={{ backgroundColor: t.surface }}>
                  <AppIcon name="search" size={32} color={t.muted} />
                </View>
                <Text className="text-sm" style={{ color: t.muted }}>{translate('no_search_results')}</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="p-4 gap-8" style={{ backgroundColor: t.background }}>
            {/* Recent Searches */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between mb-3 gap-2">
                <Text className="text-sm font-bold" style={{ color: t.text }}>{translate('recent_searches')}</Text>
                {recentSearches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearHistory}
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs" style={{ color: t.primary }}>{translate('clear_history')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recentSearches.length > 0 ? (
                <>
                  <View className="flex-row flex-wrap gap-2">
                    {(isRecentSearchesExpanded ? recentSearches : recentSearches.slice(0, 10)).map((term, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => updateQuery(term, true)}
                        className="flex-row items-center px-3 py-2 rounded-2xl border gap-1.5"
                        style={{ backgroundColor: t.surface, borderColor: t.border }}
                        activeOpacity={0.7}
                      >
                        <AppIcon name="clock" size={14} color={t.muted} />
                        <Text className="text-[13px]" style={{ color: t.text }}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {recentSearches.length > 10 && (
                    <TouchableOpacity
                      onPress={() => setIsRecentSearchesExpanded(!isRecentSearchesExpanded)}
                      className="mt-2 py-2 items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-semibold" style={{ color: t.primary }}>
                        {isRecentSearchesExpanded ? translate('collapse') : translate('see_more')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <Text className="text-sm italic p-2" style={{ color: t.muted }}>{translate('no_search_history')}</Text>
              )}
            </View>

            {/* Trending */}
            <View className="gap-3">
              <View className="flex-row items-center mb-3 gap-2">
                <AppIcon name="trending-up" size={16} color={t.primary} />
                <Text className="text-sm font-bold" style={{ color: t.text }}>{translate('popular_searches')}</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {trendingSearches.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => updateQuery(tag, true)}
                    className="px-3 py-1.5 rounded-lg border"
                    style={{ backgroundColor: t.surface, borderColor: t.border }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm" style={{ color: t.text }}>{tag}</Text>
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
