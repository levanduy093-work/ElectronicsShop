import React from 'react';
import {
  ScrollView,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeBanner, Product } from '../types';
import { extractCategoriesFromProducts } from '../utils/product';
import { Theme, lightTheme, useTheme } from '../theme';
import { socketService } from '../services/socket';
import { HomeBannerSection } from '../components/home/HomeBannerSection';
import { CategorySection } from '../components/home/CategorySection';
import { AIRecommendationsCard } from '../components/home/AIRecommendationsCard';
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection';
import { CATEGORIES } from '../constants/data';

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

export function Home({
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
  const scrollViewRef = React.useRef<ScrollView>(null);
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

  const raspberryProduct = products.find(p => p.name.toLowerCase().includes('rasp')) || products[0];

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
  const displayCategories = CATEGORIES.length > 0 ? CATEGORIES : extractCategoriesFromProducts(products);

  React.useEffect(() => {
    if (scrollViewRef.current && initialScrollOffset !== undefined) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ y: initialScrollOffset, animated: false });
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

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-transparent"
      style={{ backgroundColor: resolvedTheme.background }}
      contentContainerStyle={{
        paddingBottom: 96,
        paddingTop: 16,
        paddingHorizontal: 16,
        backgroundColor: resolvedTheme.background
      }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentOffset={{ x: 0, y: initialScrollOffset || 0 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[resolvedTheme.primary]}
          tintColor={resolvedTheme.primary}
        />
      }
    >
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

      <FeaturedProductsSection
        products={products}
        isLoading={isLoading}
        error={error}
        isOffline={isOffline}
        onRefresh={onRefreshProducts}
        onProductClick={onProductClick}
        visibleCount={visibleCount}
        onLoadMore={() => setVisibleCount(prev => Math.min(prev + 10, products.length))}
        theme={resolvedTheme}
      />
    </ScrollView>
  );
}
