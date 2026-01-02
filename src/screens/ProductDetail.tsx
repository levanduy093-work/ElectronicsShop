import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { Product } from '../lib/data';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isLoggedIn,
  onRequireLogin,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem sản phẩm ${product.name} trên ElectroAI!`,
        title: product.name,
      });
    } catch (error) {
      Alert.alert('Thông báo', 'Không thể chia sẻ');
    }
  };

  const handleHeartClick = () => {
    if (!isLoggedIn) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      onRequireLogin();
      return;
    }
    onToggleFavorite();
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
            <AppIcon name="share2" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleHeartClick} style={styles.headerButton} activeOpacity={0.7}>
            <AppIcon 
              name="heart" 
              size={24} 
              color={isFavorite ? "#EF4444" : "#374151"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <ImageWithFallback
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
          {product.stock !== 'In Stock' && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {product.stock === 'Low Stock' ? 'Sắp hết' : 'Hết hàng'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title & Price */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
              <View style={styles.priceColumn}>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.ratingRow}>
              <View style={styles.ratingContainer}>
                <AppIcon name="star" size={16} color="#FBBF24" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.reviewsText}>{product.reviews} đánh giá</Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.soldText}>Đã bán 1.2k</Text>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {(['desc', 'specs'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'desc' ? 'Mô tả' : 'Thông số'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'desc' && (
              <View>
                <Text style={styles.description}>{product.description}</Text>
                <View style={styles.guaranteeCard}>
                  <AppIcon name="shield-check" size={24} color="#2563EB" />
                  <View style={styles.guaranteeContent}>
                    <Text style={styles.guaranteeTitle}>Cam kết chính hãng</Text>
                    <Text style={styles.guaranteeText}>
                      Sản phẩm được kiểm tra kỹ lưỡng bởi đội ngũ kỹ thuật ElectroAI.
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            {activeTab === 'specs' && (
              <View style={styles.specsContainer}>
                {Object.entries(product.specs).map(([key, value]) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}
            activeOpacity={0.7}
          >
            <AppIcon name="minus" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.quantityButton}
            activeOpacity={0.7}
          >
            <AppIcon name="plus" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          activeOpacity={0.8}
        >
          <AppIcon name="shopping-cart" size={20} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '75%',
    height: '75%',
  },
  stockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 28,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  separator: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  reviewsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  soldText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
  },
  tabActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  tabContent: {
    minHeight: 150,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 24,
  },
  guaranteeCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  specsContainer: {
    gap: 0,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specKey: {
    fontSize: 14,
    color: '#6B7280',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
    gap: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
