import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CATEGORIES, Product } from '../lib/data';
import { ProductCard } from '../components/ui/ProductCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onProductClick?: (product: Product) => void;
  theme?: Theme;
  products?: Product[];
  onSelectCategory?: (category: string) => void;
}

const { width } = Dimensions.get('window');

export function Home({ onNavigate, onProductClick, theme, products = [], onSelectCategory }: HomeProps) {
  const { theme: ctxTheme } = useTheme();
  const resolvedTheme = theme || ctxTheme || lightTheme;
  const [visibleCount, setVisibleCount] = React.useState(10);

  React.useEffect(() => {
    setVisibleCount(10);
  }, [products]);

  const visibleProducts = (products.length ? products : []).slice(0, visibleCount);
  const featuredProducts = visibleProducts;
  const raspberryProduct = products.find(p => p.name.toLowerCase().includes('rasp')) || products[0];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: resolvedTheme.background }]}
      contentContainerStyle={[styles.contentContainer, { backgroundColor: resolvedTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <ImageWithFallback
          source={{ uri: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000" }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerBadge}>New Arrival</Text>
          <Text style={styles.bannerTitle}>Raspberry Pi 5</Text>
          <Text style={styles.bannerSubtitle}>Sức mạnh vượt trội cho dự án IoT của bạn</Text>
          {raspberryProduct ? (
            <TouchableOpacity
              onPress={() => onProductClick?.(raspberryProduct)}
              style={styles.bannerButton}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerButtonText}>Khám phá ngay</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories Shortcut */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: resolvedTheme.text }]}>Danh mục</Text>
          <TouchableOpacity
            onPress={() => onNavigate('catalog')}
            style={styles.seeAllButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, { color: resolvedTheme.primary }]}>Xem tất cả</Text>
            <AppIcon name="chevron-right" size={16} color={resolvedTheme.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                onSelectCategory?.(cat.name);
                onNavigate('catalog');
              }}
              style={styles.categoryItem}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: resolvedTheme.surface }]}>
                <AppIcon name={cat.icon} size={28} color={resolvedTheme.muted} />
              </View>
              <Text style={[styles.categoryName, { color: resolvedTheme.text }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* AI Recommended */}
      <TouchableOpacity
        onPress={() => onNavigate('ai')}
        style={styles.aiCard}
        activeOpacity={0.9}
      >
        <View style={styles.aiCardBackground}>
          <View style={styles.aiCardContent}>
            <View style={styles.aiBadgeContainer}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI Engineer</Text>
              </View>
            </View>
            <Text style={styles.aiTitle}>Gặp khó khăn với sơ đồ mạch?</Text>
            <Text style={styles.aiDescription}>
              Tải lên hình ảnh hoặc PDF, AI sẽ giúp bạn tạo BOM list và tư vấn linh kiện phù hợp.
            </Text>
            <View style={styles.aiButton}>
              <Text style={styles.aiButtonText}>Chat với AI ngay</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Featured Products */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: resolvedTheme.text }]}>Sản phẩm nổi bật</Text>
        <View style={styles.productsGrid}>
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              theme={resolvedTheme}
              onPress={() => onProductClick?.(p)}
            />
          ))}
        </View>
        {products.length > visibleCount && (
          <TouchableOpacity
            onPress={() => setVisibleCount(prev => Math.min(prev + 10, products.length))}
            style={[styles.loadMoreButton, { borderColor: resolvedTheme.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.loadMoreText, { color: resolvedTheme.primary }]}>
              Xem thêm sản phẩm ({Math.max(products.length - visibleCount, 0)})
            </Text>
            <AppIcon name="chevron-down" size={16} color={resolvedTheme.primary} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 96,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerBadge: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingRight: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    minWidth: 72,
    gap: 8,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  aiCard: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardBackground: {
    backgroundColor: '#6366F1',
    padding: 20,
    position: 'relative',
  },
  aiCardContent: {
    position: 'relative',
    zIndex: 10,
  },
  aiBadgeContainer: {
    marginBottom: 8,
  },
  aiBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aiDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  aiButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  loadMoreButton: {
    marginTop: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
