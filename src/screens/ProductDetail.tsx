import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { width } = Dimensions.get('window');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'datasheet'>('desc');
  const insets = useSafeAreaInsets();
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const reviewImageSize = (width - 16 * 2 - 8 * 3) / 4; // content padding 16, gap 8

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

  const reviews = [
    {
      id: 'r1',
      name: 'Nguyễn Văn Nam',
      rating: 5,
      date: '20/01/2026',
      comment: 'Sản phẩm chính hãng, đóng gói rất cẩn thận. Shop tư vấn nhiệt tình, sẽ ủng hộ dài dài.',
      images: [
        'https://images.unsplash.com/photo-1581093588401-99f9c5ae695a?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581093588401-99f9c5ae695a?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581091015181-8a0b24f4c82c?auto=format&fit=crop&q=80&w=300',
      ],
    },
    {
      id: 'r2',
      name: 'Trần Thị Hạnh',
      rating: 4,
      date: '18/01/2026',
      comment: 'Giao hàng hơi chậm một chút nhưng chất lượng sản phẩm tốt, đúng mô tả.',
      images: [
        'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581092334318-3a79a6f6cf1a?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80&w=300',
      ],
    },
    {
      id: 'r3',
      name: 'Lê Minh Tuấn',
      rating: 5,
      date: '15/01/2026',
      comment: 'Đã test chạy ổn định, hiệu năng tốt. Sẽ quay lại mua thêm linh kiện.',
      images: [
        'https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581091012184-5c1e4b29db5c?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=300',
      ],
    },
  ];

  const datasheetFiles = [
    { id: 'd1', name: 'Datasheet.pdf', size: '2.4 MB', desc: 'Tài liệu kỹ thuật', icon: 'file-text' as const },
    { id: 'd2', name: 'Library & Example Code', size: '156 KB', desc: 'Arduino/C++', icon: 'file-code' as const },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <ImageWithFallback
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={[styles.headerOverlay, { top: insets.top + 8 }]}>
            <TouchableOpacity onPress={onBack} style={styles.headerButton} activeOpacity={0.7}>
              <AppIcon name="arrow-left" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton} activeOpacity={0.7}>
                <AppIcon name="share2" size={24} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleHeartClick} style={styles.headerButton} activeOpacity={0.7}>
                <AppIcon 
                  name="heart" 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "#111827"} 
                />
              </TouchableOpacity>
            </View>
          </View>
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
            {(['desc', 'specs', 'reviews', 'datasheet'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'desc' ? 'Mô tả' : tab === 'specs' ? 'Thông số' : tab === 'reviews' ? 'Đánh giá' : 'Datasheet'}
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

            {activeTab === 'reviews' && (
              <View style={styles.reviewsContainer}>
                <View style={styles.ratingSummary}>
                  <View style={styles.ratingScore}>
                    <Text style={styles.ratingScoreText}>{product.rating.toFixed(1)}</Text>
                    <View style={styles.ratingStarsRow}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <AppIcon
                          key={idx}
                          name="star"
                          size={16}
                          color={idx < Math.round(product.rating) ? '#FBBF24' : '#E5E7EB'}
                        />
                      ))}
                    </View>
                    <Text style={styles.ratingCount}>{product.reviews} đánh giá</Text>
                  </View>
                  <View style={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <View key={star} style={styles.ratingBarRow}>
                        <Text style={styles.starLabel}>{star}</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${(star / 5) * 80}%` }]} />
                        </View>
                        <AppIcon name="star" size={14} color="#FBBF24" />
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity activeOpacity={0.8} style={styles.writeReviewButton}>
                  <AppIcon name="edit" size={18} color="#2563EB" />
                  <Text style={styles.writeReviewText}>Viết đánh giá của bạn</Text>
                </TouchableOpacity>

                {reviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.avatarPlaceholder}>
                        <AppIcon name="user" size={20} color="#9CA3AF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{r.name}</Text>
                        <View style={styles.ratingStarsRow}>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <AppIcon
                              key={idx}
                              name="star"
                              size={14}
                              color={idx < r.rating ? '#FBBF24' : '#E5E7EB'}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>{r.date}</Text>
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                    {r.images && r.images.length > 0 && (
                      <View style={styles.reviewImagesRow}>
                        {r.images
                          .slice(0, expandedReviews[r.id] ? r.images.length : 4)
                          .map((img, idx) => {
                            const extra = r.images.length - 4;
                            const showOverlay = !expandedReviews[r.id] && idx === 3 && extra > 0;
                            const Wrapper = showOverlay ? TouchableOpacity : View;
                            return (
                              <Wrapper
                                key={img + idx}
                                style={[
                                  styles.reviewImageWrapper,
                                  {
                                    width: reviewImageSize,
                                    height: reviewImageSize,
                                    marginRight: (idx + 1) % 4 === 0 ? 0 : 8,
                                    marginBottom: 8,
                                  },
                                ]}
                                activeOpacity={0.8}
                                onPress={
                                  showOverlay
                                    ? () => setExpandedReviews(prev => ({ ...prev, [r.id]: true }))
                                    : undefined
                                }
                              >
                                <ImageWithFallback
                                  source={{ uri: img }}
                                  style={styles.reviewImage}
                                  resizeMode="cover"
                                />
                                {showOverlay && (
                                  <View style={styles.reviewImageOverlay}>
                                    <Text style={styles.reviewImageOverlayText}>+{extra}</Text>
                                  </View>
                                )}
                              </Wrapper>
                            );
                          })}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'datasheet' && (
              <View style={styles.datasheetContainer}>
                {datasheetFiles.map((file) => (
                  <TouchableOpacity key={file.id} activeOpacity={0.8} style={styles.dataCard}>
                    <View style={styles.dataLeft}>
                      <View style={styles.dataIcon}>
                        <AppIcon name={file.icon} size={18} color="#2563EB" />
                      </View>
                      <View>
                        <Text style={styles.dataName}>{file.name}</Text>
                        <Text style={styles.dataDesc}>{file.size} · {file.desc}</Text>
                      </View>
                    </View>
                    <AppIcon name="download" size={20} color="#2563EB" />
                  </TouchableOpacity>
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
    paddingHorizontal: 4,
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
    overflow: 'hidden',
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
  reviewsContainer: {
    gap: 16,
  },
  ratingSummary: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  ratingScore: {
    alignItems: 'center',
    width: 120,
    gap: 6,
  },
  ratingScoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingBars: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    width: 14,
    textAlign: 'center',
    color: '#6B7280',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: '#FBBF24',
    borderRadius: 999,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 10,
  },
  writeReviewText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  reviewDate: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  reviewComment: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
  reviewImagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reviewImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
  },
  reviewImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewImageOverlayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  datasheetContainer: {
    gap: 12,
  },
  dataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dataIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
  },
  dataDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
