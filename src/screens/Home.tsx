import React from 'react';
import {
  Alert,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  InteractionManager,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeBanner, Product } from '../types';
import { extractCategoriesFromProducts } from '../utils/product';
import { Theme, lightTheme, useTheme } from '../theme';
import { socketService } from '../services/socket';
import { HomeBannerSection } from '../components/home/HomeBannerSection';
import { CategorySection } from '../components/home/CategorySection';
import { AIRecommendationsCard } from '../components/home/AIRecommendationsCard';
import { CATEGORIES } from '../constants/data';
import { AppIcon } from '../components/common/Icon';
import { ProductCard } from '../components/ui/ProductCard';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onProductClick?: (product: Product) => void;
  theme?: Theme;
  products?: Product[];
  banners?: HomeBanner[];
  onBannerPress?: (banner: HomeBanner) => void;
  onSelectCategory?: (category: string) => void;
  onRefreshProducts?: () => void;
  initialScrollOffset?: number;
  onScrollPositionChange?: (offset: number) => void;
  isLoading?: boolean;
  error?: string | null;
  isOffline?: boolean;
  initialVisibleCount?: number;
  onVisibleCountChange?: (value: number) => void;
}

export const Home = React.memo(function Home({
  onNavigate,
  onProductClick,
  theme,
  products = [],
  banners = [],
  onBannerPress,
  onSelectCategory,
  onRefreshProducts,
  initialScrollOffset,
  onScrollPositionChange,
  isLoading = false,
  error = null,
  isOffline = false,
  initialVisibleCount = 10,
  onVisibleCountChange,
}: HomeProps) {
  const { t } = useTranslation();
  const { theme: ctxTheme } = useTheme();
  const resolvedTheme = theme || ctxTheme || lightTheme;
  const [visibleCount, setVisibleCount] = React.useState(initialVisibleCount || 10);
  const listRef = React.useRef<FlatList<Product>>(null);
  const hasRestoredScroll = React.useRef(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (initialVisibleCount !== undefined && initialVisibleCount !== visibleCount) {
      setVisibleCount(initialVisibleCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVisibleCount]);

  React.useEffect(() => {
    onVisibleCountChange?.(visibleCount);
  }, [visibleCount, onVisibleCountChange]);

  const raspberryProduct = React.useMemo(
    () => products.find(p => p.name.toLowerCase().includes('rasp')) || products[0],
    [products],
  );

  // Real-time listener
  React.useEffect(() => {
    let isMounted = true;
    let listenerAttached = false;

    const handleProductUpdate = (updatedProduct: any) => {
      console.log('Received product update:', updatedProduct);
      onRefreshProducts?.();
    };

    const task = InteractionManager.runAfterInteractions(() => {
      if (!isMounted) return;
      socketService.connect();
      socketService.on('product_updated', handleProductUpdate);
      listenerAttached = true;
    });

    return () => {
      isMounted = false;
      task.cancel?.();
      if (listenerAttached) {
        socketService.off('product_updated', handleProductUpdate);
      }
    };
  }, [onRefreshProducts]);

  const handleBannerPressInternal = (item: HomeBanner) => {
    if (onBannerPress) {
      onBannerPress(item);
      return;
    }
    if (item.ctaProductId && onProductClick) {
      const targetProduct = products.find(p => p.id === item.ctaProductId);
      if (targetProduct) {
        onProductClick(targetProduct);
        return;
      }
    }
    if (raspberryProduct) {
      onProductClick?.(raspberryProduct);
    } else {
      Alert.alert(t('product_not_found'), t('try_again'));
    }
  };

  // Extract categories from products if CATEGORIES is empty
  const displayCategories = React.useMemo(
    () => (CATEGORIES.length > 0 ? CATEGORIES : extractCategoriesFromProducts(products)),
    [products],
  );

  React.useEffect(() => {
    if (listRef.current && initialScrollOffset !== undefined) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: initialScrollOffset, animated: false });
      });
      hasRestoredScroll.current = true;
    }
  }, [initialScrollOffset]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollPositionChange?.(event.nativeEvent.contentOffset.y);
  };

  const handleRefresh = React.useCallback(async () => {
    if (!onRefreshProducts || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshProducts();
    } catch (error) {
      console.warn('Home - refresh failed', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshProducts, isRefreshing]);

  const visibleProducts = React.useMemo(
    () => (products.length ? products : []).slice(0, visibleCount),
    [products, visibleCount],
  );

  const handleLoadMore = React.useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 10, products.length));
  }, [products.length]);

  const renderProductItem = React.useCallback(({ item, index }: { item: Product; index: number }) => (
    <View
      style={{
        flex: 1,
        marginBottom: 16,
        marginRight: index % 2 === 0 ? 12 : 0,
      }}
    >
      <ProductCard
        product={item}
        theme={resolvedTheme}
        onPress={() => onProductClick?.(item)}
      />
    </View>
  ), [onProductClick, resolvedTheme]);

  const listHeader = (
    <View>
      <HomeBannerSection
        banners={banners}
        onBannerPress={handleBannerPressInternal}
        fallbackProduct={raspberryProduct}
      />

      <CategorySection
        categories={displayCategories}
        onSelectCategory={onSelectCategory || (() => { })}
        onNavigate={onNavigate}
        theme={resolvedTheme}
      />

      <AIRecommendationsCard
        onPress={() => onNavigate('ai')}
      />

      <Text className="text-lg font-bold mb-4" style={{ color: resolvedTheme.text }}>
        {t('featured_products')}
      </Text>
    </View>
  );

  const listEmpty = (
    <View className="items-center justify-center py-12 px-8">
      <AppIcon name={error ? 'alert-circle-outline' : 'package-variant'} size={64} color={resolvedTheme.muted} />
      <Text
        className="text-lg font-semibold mt-4 mb-2 text-center"
        style={{ color: resolvedTheme.text }}
      >
        {error
          ? (isOffline ? 'Không có kết nối mạng' : 'Không thể tải sản phẩm')
          : 'Chưa có sản phẩm'}
      </Text>
      <Text
        className="text-sm text-center mb-6 leading-5"
        style={{ color: resolvedTheme.muted }}
      >
        {error
          ? (isOffline
            ? 'Vui lòng kiểm tra kết nối internet của bạn và thử lại.'
            : error || 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.')
          : 'Hiện tại chưa có sản phẩm nào. Vui lòng thử lại sau.'}
      </Text>
      {onRefreshProducts && (
        <TouchableOpacity
          onPress={() => onRefreshProducts()}
          className="flex-row items-center gap-2 px-6 py-3 rounded-xl"
          style={{ backgroundColor: resolvedTheme.primary }}
          activeOpacity={0.8}
        >
          <AppIcon name="refresh" size={20} color="#FFFFFF" />
          <Text className="text-white text-base font-semibold">{error ? 'Thử lại' : 'Tải lại'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const listFooter = products.length > visibleCount ? (
    <TouchableOpacity
      onPress={handleLoadMore}
      className="mt-3 self-center flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border"
      style={{ borderColor: resolvedTheme.primary }}
      activeOpacity={0.8}
    >
      <Text className="text-sm font-semibold" style={{ color: resolvedTheme.primary }}>
        {t('view_more_products', { count: Math.max(products.length - visibleCount, 0) })}
      </Text>
      <AppIcon name="chevron-down" size={16} color={resolvedTheme.primary} />
    </TouchableOpacity>
  ) : null;

  return (
    <FlatList
      ref={listRef}
      data={visibleProducts}
      keyExtractor={(item) => item.id}
      renderItem={renderProductItem}
      numColumns={2}
      className="flex-1 bg-transparent"
      style={{ backgroundColor: resolvedTheme.background }}
      contentContainerStyle={{
        paddingBottom: 96,
        paddingTop: 16,
        paddingHorizontal: 16,
        backgroundColor: resolvedTheme.background,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={!isLoading ? listEmpty : null}
      ListFooterComponent={listFooter}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[resolvedTheme.primary]}
          tintColor={resolvedTheme.primary}
        />
      }
      contentOffset={{ x: 0, y: initialScrollOffset || 0 }}
    />
  );
});
