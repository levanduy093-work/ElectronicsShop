import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Dimensions, Modal, TextInput, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from '../lib/data';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';
import { useTheme } from '../lib/theme';
import { useToast } from '../components/common/ToastProvider';
import { ApiReview, createReview, getReviews, uploadImage, UploadImageFile } from '../lib/api';
import { socketService } from '../lib/socket';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  accessToken?: string;
  currentUserId?: string | null;
  currentUserName?: string;
  theme?: ReturnType<typeof useTheme>['theme'];
  onReviewStatsChange?: (productId: string, stats: { averageRating: number; reviewCount: number }) => void;
}

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isLoggedIn,
  onRequireLogin,
  accessToken,
  currentUserId,
  currentUserName,
  theme: injectedTheme,
  onReviewStatsChange,
}: ProductDetailProps) {
  const { width } = Dimensions.get('window');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'datasheet'>('desc');
  const insets = useSafeAreaInsets();
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const reviewImageSize = (width - 16 * 2 - 8 * 3) / 4; // content padding 16, gap 8
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const theme = injectedTheme || ctxTheme;
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const ratingCounts = reviews.reduce(
    (acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
  );
  const derivedReviewCount = reviewsFetched
    ? reviews.length
    : product.reviewCount ?? product.reviews ?? 0;
  const derivedAverageRating = reviewsFetched
    ? reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0
    : product.rating || product.averageRating || 0;

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await getReviews(product.id);
      setReviews(data);
      const avg =
        data.length > 0 ? data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length : 0;
      onReviewStatsChange?.(product.id, { averageRating: avg, reviewCount: data.length });
      setReviewsFetched(true);
    } catch (error: any) {
      console.warn('ProductDetail - Failed to load reviews', error?.message || error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    setReviewsFetched(false);
    fetchReviews();
  }, [product.id]);

  useEffect(() => {
    const handler = (payload: any) => {
      if (payload?.collection === 'reviews') {
        const doc = payload.fullDocument || {};
        if (`${doc.productId}` === `${product.id}`) {
          fetchReviews();
        }
      }
    };
    socketService.on('db_change', handler);
    return () => {
      socketService.off('db_change');
    };
  }, [product.id]);

  const formatReviewDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem sản phẩm ${product.name} trên ElectroAI!`,
        title: product.name,
      });
    } catch (error) {
      showToast('Không thể chia sẻ', 'error');
    }
  };

  const handleHeartClick = () => {
    if (!isLoggedIn) {
      showToast('Vui lòng đăng nhập để thêm vào danh sách yêu thích', 'info');
      onRequireLogin();
      return;
    }
    onToggleFavorite();
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    showToast('Đã thêm vào giỏ hàng', 'success');
  };

  const resetReviewForm = () => {
    setReviewContent('');
    setReviewRating(5);
    setReviewImages([]);
  };

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      showToast('Vui lòng đăng nhập để viết đánh giá', 'info');
      onRequireLogin();
      return;
    }

    const myReview = reviews.find(r => r.userId === currentUserId);
    if (myReview) {
      setReviewRating(myReview.rating || 5);
      setReviewContent(myReview.comment || '');
      setReviewImages(myReview.images || []);
    } else {
      resetReviewForm();
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    const content = reviewContent.trim();
    if (!content) {
      showToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    if (!accessToken) {
      onRequireLogin();
      return;
    }

    const imagesToUpload = [...reviewImages];
    const tempId = `temp-${Date.now()}`;
    const optimisticReview: ApiReview = {
      _id: tempId,
      productId: product.id,
      userId: currentUserId || 'me',
      userName: currentUserName || 'Bạn',
      rating: reviewRating,
      comment: content,
      images: imagesToUpload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReviews(prev => {
      const next = [optimisticReview, ...prev];
      const avg =
        next.length > 0 ? next.reduce((sum, r) => sum + (r.rating || 0), 0) / next.length : 0;
      onReviewStatsChange?.(product.id, { averageRating: avg, reviewCount: next.length });
      return next;
    });

    setShowReviewModal(false);
    resetReviewForm();
    setActiveTab('reviews');
    setExpandedReviews({});
    showToast('Đã gửi đánh giá', 'success');

    const doSubmit = async () => {
      try {
        const uploadedUrls = await Promise.all(
          imagesToUpload.map(async (uri) => {
            if (uri.startsWith('http://') || uri.startsWith('https://')) {
              return uri;
            }
            const file: UploadImageFile = {
              uri,
              name: uri.split('/').pop() || 'review.jpg',
              type: 'image/jpeg',
            };
            const res = await uploadImage(file, {
              token: accessToken,
              folder: `electronics-shop/reviews/${product.id}/${currentUserId || 'guest'}`,
            });
            return res?.secure_url || res?.url || uri;
          }),
        );

        await createReview(product.id, reviewRating, content, uploadedUrls.filter(Boolean), accessToken);
        fetchReviews();
      } catch (error: any) {
        setReviews(prev => prev.filter(r => r._id !== tempId));
        showToast(error?.message || 'Không thể gửi đánh giá', 'error');
      }
    };

    void doSubmit();
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
          showToast(response.errorMessage, 'error');
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
                <Text style={[styles.ratingText, { color: theme.text }]}>{derivedAverageRating.toFixed(1)}</Text>
                </View>
                <Text style={styles.separator}>|</Text>
              <Text style={[styles.reviewsText, { color: theme.muted }]}>{derivedReviewCount} đánh giá</Text>
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
                {Object.entries(product.specs).map(([key, value]) => {
                  let displayValue = '';
                  if (Array.isArray(value)) {
                    displayValue = value.map(v => (typeof v === 'object' ? JSON.stringify(v) : v)).join(', ');
                  } else if (typeof value === 'object' && value !== null) {
                    displayValue = Object.entries(value)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ');
                  } else {
                    displayValue = String(value);
                  }
                  
                  return (
                    <View key={key} style={styles.specRow}>
                      <Text style={[styles.specKey, { color: theme.muted }]}>{key}</Text>
                      <Text style={[styles.specValue, { color: theme.text }]}>
                        {displayValue}
                      </Text>
                    </View>
                  );
                })}
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
                    <Text style={[styles.ratingScoreText, { color: theme.text }]}>{derivedAverageRating.toFixed(1)}</Text>
                    <View style={styles.ratingStarsRow}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <AppIcon
                          key={idx}
                          name="star"
                          size={16}
                          color={idx < Math.round(derivedAverageRating) ? '#FBBF24' : theme.border}
                        />
                      ))}
                    </View>
                    <Text style={[styles.ratingCount, { color: theme.muted }]}>{derivedReviewCount} đánh giá</Text>
                  </View>
                  <View style={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <View key={star} style={styles.ratingBarRow}>
                        <Text style={[styles.starLabel, { color: theme.muted }]}>{star}</Text>
                        <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                          <View style={[
                            styles.barFill,
                            {
                              width: derivedReviewCount ? `${(ratingCounts[star] || 0) / derivedReviewCount * 100}%` : '0%',
                            }
                          ]} />
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
                  <Text style={[styles.writeReviewText, { color: theme.primary }]}>
                    {reviews.find(r => r.userId === currentUserId) ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
                  </Text>
                </TouchableOpacity>

                {reviewsLoading && (
                  <Text style={[styles.reviewsText, { color: theme.muted, paddingVertical: 8 }]}>Đang tải đánh giá...</Text>
                )}

                {reviewsFetched && reviews.length === 0 && !reviewsLoading && (
                  <Text style={[styles.reviewsText, { color: theme.muted, paddingVertical: 8 }]}>
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                  </Text>
                )}

                {reviews.map((r) => (
                  <View 
                    key={r._id || r.productId + r.userId + (r.comment || '')} 
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
                        <Text style={[styles.reviewName, { color: theme.text }]}>
                          {r.userName || 'Khách hàng'}
                        </Text>
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
                      <Text style={[styles.reviewDate, { color: theme.muted }]}>
                        {formatReviewDate(r.updatedAt || r.createdAt)}
                      </Text>
                    </View>
                    {r.comment ? <Text style={[styles.reviewComment, { color: theme.text }]}>{r.comment}</Text> : null}
                    {r.images && r.images.length > 0 && (
                      <View style={styles.reviewImagesRow}>
                        {r.images
                          .slice(0, expandedReviews[r._id || r.productId] ? r.images.length : 4)
                          .map((img, idx) => {
                            const extra = r.images.length - 4;
                            const showOverlay = !(expandedReviews[r._id || r.productId]) && idx === 3 && extra > 0;
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
                                    ? () => setExpandedReviews(prev => ({ ...prev, [r._id || r.productId]: true }))
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
    alignItems: 'flex-start',
  },
  specKey: {
    fontSize: 14,
    color: '#6B7280',
    maxWidth: '40%',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
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
