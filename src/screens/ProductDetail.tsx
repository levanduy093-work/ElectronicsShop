import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share, Dimensions, Modal, TextInput, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '../lib/data';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';
import { useTheme } from '../lib/theme';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

const defaultReviews = [
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
  const { theme, isDarkMode } = useTheme();
  const [reviews, setReviews] = useState(defaultReviews);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);

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

  const resetReviewForm = () => {
    setReviewContent('');
    setReviewRating(5);
    setReviewImages([]);
  };

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Thông báo',
        'Vui lòng đăng nhập để viết đánh giá',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: onRequireLogin },
        ],
        { cancelable: true }
      );
      return;
    }

    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    const content = reviewContent.trim();
    if (!content) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    const newReview = {
      id: `r-${Date.now()}`,
      name: 'Bạn',
      rating: reviewRating,
      date: new Date().toLocaleDateString('vi-VN'),
      comment: content,
      images: reviewImages,
    };

    setReviews(prev => [newReview, ...prev]);
    resetReviewForm();
    setShowReviewModal(false);
    setActiveTab('reviews');
    setExpandedReviews({});
  };

  const handleCloseModal = () => {
    resetReviewForm();
    setShowReviewModal(false);
  };

  const handlePickImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 4,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Thông báo', response.errorMessage);
          return;
        }
        const picked = (response.assets || [])
          .map(asset => asset.uri)
          .filter((uri): uri is string => Boolean(uri));
        if (!picked.length) return;

        setReviewImages(prev => {
          const merged = Array.from(new Set([...prev, ...picked]));
          return merged.slice(0, 4);
        });
      }
    );
  };

  const handleRemoveImage = (uri: string) => {
    setReviewImages(prev => prev.filter(item => item !== uri));
  };

  const datasheetFiles = [
    { id: 'd1', name: 'Datasheet.pdf', size: '2.4 MB', desc: 'Tài liệu kỹ thuật', icon: 'file-text' as const },
    { id: 'd2', name: 'Library & Example Code', size: '156 KB', desc: 'Arduino/C++', icon: 'file-code' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <ImageWithFallback
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={[styles.headerOverlay, { top: insets.top + 8 }]}>
            <TouchableOpacity 
              onPress={onBack} 
              style={[
                styles.headerButton,
                {
                  backgroundColor: theme.surface,
                  shadowOpacity: !isDarkMode ? 0.12 : 0.3,
                }
              ]} 
              activeOpacity={0.7}
            >
              <AppIcon name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={handleShare} 
                style={[
                  styles.headerButton,
                  {
                    backgroundColor: theme.surface,
                    shadowOpacity: !isDarkMode ? 0.12 : 0.3,
                  }
                ]} 
                activeOpacity={0.7}
              >
                <AppIcon name="share2" size={24} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleHeartClick} 
                style={[
                  styles.headerButton,
                  {
                    backgroundColor: theme.surface,
                    shadowOpacity: !isDarkMode ? 0.12 : 0.3,
                  }
                ]} 
                activeOpacity={0.7}
              >
                <AppIcon 
                  name="heart" 
                  size={24} 
                  color={isFavorite ? "#EF4444" : theme.text} 
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
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{product.name}</Text>
              <View style={styles.priceColumn}>
                <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(product.price)}</Text>
                {product.originalPrice && (
                  <Text style={[styles.originalPrice, { color: theme.muted }]}>{formatPrice(product.originalPrice)}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.ratingRow}>
              <View style={styles.ratingContainer}>
                <AppIcon name="star" size={16} color="#FBBF24" />
                <Text style={[styles.ratingText, { color: theme.text }]}>{product.rating}</Text>
              </View>
              <Text style={styles.separator}>|</Text>
              <Text style={[styles.reviewsText, { color: theme.muted }]}>{product.reviews} đánh giá</Text>
              <Text style={styles.separator}>|</Text>
              <Text style={[styles.soldText, { color: '#10B981' }]}>Đã bán 1.2k</Text>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {(['desc', 'specs', 'reviews', 'datasheet'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  {
                    borderColor: activeTab === tab ? theme.primary : 'transparent',
                    backgroundColor: activeTab === tab ? theme.card : 'transparent',
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? theme.primary : theme.muted,
                  }
                ]}>
                  {tab === 'desc' ? 'Mô tả' : tab === 'specs' ? 'Thông số' : tab === 'reviews' ? 'Đánh giá' : 'Datasheet'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'desc' && (
              <View>
                <Text style={[styles.description, { color: theme.text }]}>{product.description}</Text>
                <View style={[styles.guaranteeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <AppIcon name="shield-check" size={24} color={theme.primary} />
                  <View style={styles.guaranteeContent}>
                    <Text style={[styles.guaranteeTitle, { color: theme.text }]}>Cam kết chính hãng</Text>
                    <Text style={[styles.guaranteeText, { color: theme.primary }]}>
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
                    <Text style={[styles.specKey, { color: theme.muted }]}>{key}</Text>
                    <Text style={[styles.specValue, { color: theme.text }]}>{value}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View style={styles.reviewsContainer}>
                <View style={[
                  styles.ratingSummary,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }
                ]}>
                  <View style={styles.ratingScore}>
                    <Text style={[styles.ratingScoreText, { color: theme.text }]}>{product.rating.toFixed(1)}</Text>
                    <View style={styles.ratingStarsRow}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <AppIcon
                          key={idx}
                          name="star"
                          size={16}
                          color={idx < Math.round(product.rating) ? '#FBBF24' : theme.border}
                        />
                      ))}
                    </View>
                    <Text style={[styles.ratingCount, { color: theme.muted }]}>{product.reviews} đánh giá</Text>
                  </View>
                  <View style={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <View key={star} style={styles.ratingBarRow}>
                        <Text style={[styles.starLabel, { color: theme.muted }]}>{star}</Text>
                        <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                          <View style={[styles.barFill, { width: `${(star / 5) * 80}%` }]} />
                        </View>
                        <AppIcon name="star" size={14} color="#FBBF24" />
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  activeOpacity={0.8} 
                  onPress={handleWriteReview}
                  style={[
                    styles.writeReviewButton,
                    {
                      borderColor: theme.primary,
                      backgroundColor: theme.surface,
                    }
                  ]}
                >
                  <AppIcon name="edit" size={18} color={theme.primary} />
                  <Text style={[styles.writeReviewText, { color: theme.primary }]}>Viết đánh giá của bạn</Text>
                </TouchableOpacity>

                {reviews.map((r) => (
                  <View 
                    key={r.id} 
                    style={[
                      styles.reviewCard,
                      {
                        borderBottomColor: theme.border,
                      }
                    ]}
                  >
                    <View style={styles.reviewHeader}>
                      <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surface }]}>
                        <AppIcon name="user" size={20} color={theme.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reviewName, { color: theme.text }]}>{r.name}</Text>
                        <View style={styles.ratingStarsRow}>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <AppIcon
                              key={idx}
                              name="star"
                              size={14}
                              color={idx < r.rating ? '#FBBF24' : theme.border}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={[styles.reviewDate, { color: theme.muted }]}>{r.date}</Text>
                    </View>
                    <Text style={[styles.reviewComment, { color: theme.text }]}>{r.comment}</Text>
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
                                    backgroundColor: theme.surface,
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
                  <TouchableOpacity 
                    key={file.id} 
                    activeOpacity={0.8} 
                    style={[
                      styles.dataCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      }
                    ]}
                  >
                    <View style={styles.dataLeft}>
                      <View style={[
                        styles.dataIcon,
                        {
                          backgroundColor: !isDarkMode ? '#EFF6FF' : theme.surface,
                        }
                      ]}>
                        <AppIcon name={file.icon} size={18} color={theme.primary} />
                      </View>
                      <View>
                        <Text style={[styles.dataName, { color: theme.text }]}>{file.name}</Text>
                        <Text style={[styles.dataDesc, { color: theme.muted }]}>{file.size} · {file.desc}</Text>
                      </View>
                    </View>
                    <AppIcon name="download" size={20} color={theme.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Viết đánh giá</Text>

            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)} activeOpacity={0.7}>
                  <AppIcon
                    name="star"
                    size={24}
                    color={star <= reviewRating ? '#FBBF24' : theme.border}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={reviewContent}
              onChangeText={setReviewContent}
              placeholder="Chia sẻ cảm nhận của bạn..."
              placeholderTextColor={theme.muted}
              style={[styles.reviewInput, { color: theme.text, borderColor: theme.border }]}
              multiline
              maxLength={400}
            />

            <View style={styles.uploadRow}>
              {reviewImages.map((uri) => (
                <View key={uri} style={[styles.uploadPreview, { borderColor: theme.border }]}>
                  <Image source={{ uri }} style={styles.uploadImage} />
                  <TouchableOpacity style={styles.removeBadge} onPress={() => handleRemoveImage(uri)} activeOpacity={0.7}>
                    <Text style={styles.removeBadgeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {reviewImages.length < 4 && (
                <TouchableOpacity
                  style={[styles.uploadAdd, { borderColor: theme.border }]}
                  onPress={handlePickImages}
                  activeOpacity={0.8}
                >
                  <AppIcon name="camera" size={18} color={theme.primary} />
                  <Text style={[styles.uploadAddText, { color: theme.primary }]}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={handleCloseModal} activeOpacity={0.8}>
                <Text style={[styles.modalButtonText, { color: theme.muted }]}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmit, { backgroundColor: theme.primary }]}
                onPress={handleSubmitReview}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Action Bar */}
      <View style={[
        styles.actionBar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        }
      ]}>
        <View style={[
          styles.quantityContainer,
          {
            backgroundColor: theme.card,
          }
        ]}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}
            activeOpacity={0.7}
          >
            <AppIcon name="minus" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.quantityButton}
            activeOpacity={0.7}
          >
            <AppIcon name="plus" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={handleAddToCart}
          style={[styles.addToCartButton, { backgroundColor: theme.primary }]}
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
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
    bottom: 16,
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
    backgroundColor: 'transparent',
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
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: 'transparent',
  },
  tabContent: {
    minHeight: 150,
  },
  description: {
    fontSize: 14,
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
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
  },
  ratingScore: {
    alignItems: 'center',
    width: 120,
    gap: 6,
  },
  ratingScoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingCount: {
    fontSize: 12,
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
  },
  barTrack: {
    flex: 1,
    height: 8,
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
    borderRadius: 12,
    paddingVertical: 10,
  },
  writeReviewText: {
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  ratingSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalCancel: {
    backgroundColor: 'transparent',
  },
  modalSubmit: {
    backgroundColor: '#2563EB',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  uploadAdd: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadAddText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadPreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewName: {
    fontWeight: '700',
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
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
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataName: {
    fontWeight: '600',
    fontSize: 14,
  },
  dataDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
