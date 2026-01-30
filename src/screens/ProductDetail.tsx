import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, useWindowDimensions, Modal, TextInput, Image, Animated, Easing, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../utils';
import { useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { ApiReview, createReview, getReviews, uploadImage, UploadImageFile } from '../services/api';
import { socketService } from '../services/socket';
import { ProductCard } from '../components/ui/ProductCard';
import { downloadDatasheetPdf } from '../utils/fileDownload';
import { cacheManager } from '../utils/cache';
import { APP_LINK_DOMAIN as ENV_APP_LINK_DOMAIN, APP_LINK_SCHEME as ENV_APP_LINK_SCHEME } from '@env';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedOption?: string, selectedClassification?: string) => boolean | void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  accessToken?: string;
  currentUserId?: string | null;
  currentUserName?: string;
  theme?: ReturnType<typeof useTheme>['theme'];
  onReviewStatsChange?: (productId: string, stats: { averageRating: number; reviewCount: number }) => void;
  onNavigateToCart?: () => void;
  cartItemCount?: number;
  relatedProducts?: Product[];
  onProductClick?: (product: Product) => void;
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
  onNavigateToCart,
  cartItemCount = 0,
  relatedProducts = [],
  onProductClick,
}: ProductDetailProps) {
  const { width, height } = useWindowDimensions();
  const slideWidth = Math.max(width, 1);
  const [quantity, setQuantity] = useState(1);
  const hasDatasheet = !!(product.datasheet && String(product.datasheet).trim());
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'datasheet'>('desc');
  const insets = useSafeAreaInsets();

  // Animation values
  const animItem = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animScale = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  // Options and Classifications state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);

  // Get options and classifications from product, with fallback
  const productOptions = useMemo(() => product.options && product.options.length > 0
    ? product.options
    : ['Tiêu chuẩn'], [product.options]);
  const productClassifications = useMemo(() => product.classifications && product.classifications.length > 0
    ? product.classifications
    : [], [product.classifications]);

  // Initialize selected values
  useEffect(() => {
    if (productOptions.length > 0 && selectedOption === null) {
      setSelectedOption(productOptions[0]);
    }
    if (productClassifications.length > 0 && selectedClassification === null) {
      setSelectedClassification(productClassifications[0]);
    }
  }, [product.id, productOptions, productClassifications, selectedOption, selectedClassification]);

  const runAddToCartAnimation = (callback: () => void) => {
    animItem.setValue({ x: 0, y: 0 });
    animScale.setValue(0.5);
    animOpacity.setValue(1);

    const targetX = width / 2 - 40;
    const targetY = -(height / 2) + insets.top + 30;

    Animated.parallel([
      Animated.timing(animItem, {
        toValue: { x: targetX, y: targetY },
        duration: 600,
        useNativeDriver: true,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }),
      Animated.sequence([
        Animated.timing(animScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 0.2,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      callback();
    });
  };

  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const reviewImageSize = (slideWidth - 16 * 2 - 8 * 3) / 4;
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const theme = injectedTheme || ctxTheme;
  const { showToast } = useToast();
  const { t } = useTranslation();
  const isOutOfStock =
    product.stock === 'Out of Stock' ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const availableStock = product.stockQuantity;
  const maxQuantity = availableStock !== undefined ? Math.max(0, availableStock) : Number.MAX_SAFE_INTEGER;
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const [showDatasheetModal, setShowDatasheetModal] = useState(false);
  const [downloadedPath, setDownloadedPath] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'denied' | 'blocked'>('denied');
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
  const appLinkHost = (ENV_APP_LINK_DOMAIN || 'electronicsshop.app').replace(/^https?:\/\//, '');
  const appLinkScheme = ENV_APP_LINK_SCHEME || 'electronicsshop';

  const buildShareLinks = () => {
    const universalLink = appLinkHost ? `https://${appLinkHost}/product/${product.id}` : '';
    const deepLink = `${appLinkScheme}://product/${product.id}`;
    return { universalLink, deepLink };
  };

  // Use ref to store callback to avoid triggering re-fetches when callback reference changes
  const onReviewStatsChangeRef = useRef(onReviewStatsChange);
  useEffect(() => {
    onReviewStatsChangeRef.current = onReviewStatsChange;
  }, [onReviewStatsChange]);

  const fetchReviews = useCallback(async () => {
    // Only show loading spinner if we don't have cached data yet
    let hasCached = false;
    const cacheKey = `reviews-${product.id}`;

    try {
      const cached = await cacheManager.get<ApiReview[]>(cacheKey);
      if (cached) {
        setReviews(cached);
        const avg = cached.length > 0 ? cached.reduce((sum, r) => sum + (r.rating || 0), 0) / cached.length : 0;
        onReviewStatsChangeRef.current?.(product.id, { averageRating: avg, reviewCount: cached.length });
        setReviewsFetched(true);
        hasCached = true;
      }
    } catch (e) {
      // ignore cache error
    }

    if (!hasCached) {
      setReviewsLoading(true);
    }

    try {
      const data = await getReviews(product.id);
      setReviews(data);
      await cacheManager.set(cacheKey, data);

      const avg =
        data.length > 0 ? data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length : 0;
      onReviewStatsChangeRef.current?.(product.id, { averageRating: avg, reviewCount: data.length });
      setReviewsFetched(true);
    } catch (error: any) {
      // If we have cached data, suppress the error for the user, just log it
      if (!hasCached) {
        console.warn('ProductDetail - Failed to load reviews', error?.message || error);
      }
    } finally {
      setReviewsLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    setReviewsFetched(false);
    setActiveImageIndex(0); // Reset gallery
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]); // Only re-fetch when product changes, not when fetchReviews reference changes

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
  }, [product.id, fetchReviews]);

  const formatReviewDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
  };

  const handleShare = async () => {
    try {
      const { universalLink, deepLink } = buildShareLinks();
      const shareLink = universalLink || deepLink;
      const fallback =
        universalLink && deepLink
          ? `\n${t('openInAppFallback', { link: deepLink })}`
          : '';
      await Share.share({
        message: `Xem sản phẩm ${product.name} trên ElectroAI!\n${shareLink}${fallback}`,
        title: product.name,
        url: shareLink,
      });
    } catch {
      showToast(t('cannotShare'), 'error');
    }
  };

  const handleHeartClick = () => {
    if (!isLoggedIn) {
      showToast(t('loginRequiredFavorite'), 'info');
      onRequireLogin();
      return;
    }
    onToggleFavorite();
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(t('productOutOfStockCart'), 'error');
      return;
    }
    const allowedQuantity = Math.min(Math.max(1, quantity), maxQuantity);
    if (allowedQuantity < 1) {
      showToast(t('productOutOfStockCart'), 'error');
      return;
    }
    if (allowedQuantity !== quantity && availableStock !== undefined) {
      showToast(t('stockLeft', { count: availableStock }), 'info');
      setQuantity(allowedQuantity);
    }

    const result = onAddToCart(product, allowedQuantity, selectedOption || undefined, selectedClassification || undefined);
    if (result === false) return;

    showToast(t('addedToCart'), 'success');
    runAddToCartAnimation(() => { });
  };

  const resetReviewForm = () => {
    setReviewContent('');
    setReviewRating(5);
    setReviewImages([]);
  };

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      showToast(t('loginRequiredReview'), 'info');
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
      showToast(t('enterReviewContent'), 'error');
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
      userName: currentUserName || t('you'),
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
    showToast(t('reviewSent'), 'success');

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
        showToast(error?.message || t('cannotSendReview'), 'error');
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

  const handleGalleryScroll = (event: any) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const slide = Math.round(contentOffset.x / layoutMeasurement.width);
    if (slide !== activeImageIndex) {
      setActiveImageIndex(slide);
    }
  };

  const handleDownloadDatasheet = async (url: string, fileName: string) => {
    const result = await downloadDatasheetPdf(url, fileName, { skipSuccessAlert: true });

    if (result && !result.success && result.permissionStatus) {
      setPermissionStatus(result.permissionStatus);
      setShowPermissionModal(true);
      return;
    }

    if (result && result.success && result.path) {
      setDownloadedPath(result.path);
      setShowDatasheetModal(true);
    }
  };

  const datasheetFiles = useMemo(
    () =>
      hasDatasheet
        ? [
          {
            id: 'd1',
            name: 'Datasheet.pdf',
            size: '',
            desc: 'Tài liệu kỹ thuật',
            icon: 'file-text' as const,
            url: String(product.datasheet),
          },
        ]
        : [],
    [hasDatasheet, product.datasheet],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Product Image Gallery */}
        <View className="w-full aspect-square bg-[#F5F5F5] justify-center items-center relative overflow-hidden">
          {/* Spacer to keep content clear of status bar/notch */}
          <View
            pointerEvents="none"
            className="w-full"
            style={{ height: insets.top + 8, backgroundColor: theme.background }}
          />
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleGalleryScroll}
            scrollEventThrottle={16}
            className="w-full h-full"
            contentInsetAdjustmentBehavior="never"
            decelerationRate="fast"
            snapToInterval={slideWidth}
            snapToAlignment="center"
          >
            {productImages.map((img, index) => (
              <View key={index} style={{ width: slideWidth, height: slideWidth, justifyContent: 'center', alignItems: 'center' }}>
                <ImageWithFallback
                  source={{ uri: img }}
                  className="w-[75%] h-[75%]"
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {productImages.length > 1 && (
            <View className="absolute bottom-4 flex-row self-center gap-2">
              {productImages.map((_, index) => (
                <View
                  key={index}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: index === activeImageIndex ? theme.primary : theme.border }}
                />
              ))}
            </View>
          )}

          <View className="absolute left-3 right-3 flex-row justify-between items-center z-10 px-1" style={{ top: insets.top + 8 }}>
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 rounded-full justify-center items-center shadow-sm"
              style={{
                backgroundColor: theme.surface,
                shadowOpacity: !isDarkMode ? 0.12 : 0.3,
              }}
              activeOpacity={0.7}
            >
              <AppIcon name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 rounded-full justify-center items-center shadow-sm"
                style={{
                  backgroundColor: theme.surface,
                  shadowOpacity: !isDarkMode ? 0.12 : 0.3,
                }}
                activeOpacity={0.7}
              >
                <AppIcon name="share2" size={24} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleHeartClick}
                className="w-10 h-10 rounded-full justify-center items-center shadow-sm"
                style={{
                  backgroundColor: theme.surface,
                  shadowOpacity: !isDarkMode ? 0.12 : 0.3,
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name="heart"
                  size={24}
                  color={isFavorite ? "#EF4444" : theme.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onNavigateToCart}
                className="w-10 h-10 rounded-full justify-center items-center shadow-sm"
                style={{
                  backgroundColor: theme.surface,
                  shadowOpacity: !isDarkMode ? 0.12 : 0.3,
                }}
                activeOpacity={0.7}
              >
                <AppIcon name="shopping-cart" size={24} color={theme.text} />
                {cartItemCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1 border-2" style={{ borderColor: theme.surface }}>
                    <Text className="text-white text-[10px] font-bold">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {product.stock !== 'In Stock' && (
            <View className="absolute bottom-10 left-4 bg-black/70 px-3 py-1 rounded-xl">
              <Text className="text-white text-xs font-medium">
                {product.stock === 'Low Stock' ? t('lowStock') : t('out_of_stock')}
              </Text>
            </View>
          )}
        </View>

        <View className="p-4 bg-transparent">
          {/* Title & Price */}
          <View className="mb-6">
            <View className="flex-row justify-between items-start mb-3 gap-4">
              <Text className="flex-1 text-xl font-bold leading-7" style={{ color: theme.text }} numberOfLines={2}>{product.name}</Text>
              <View className="items-end">
                <Text className="text-2xl font-bold" style={{ color: theme.primary }}>{formatPrice(product.price)}</Text>
                {product.originalPrice && (
                  <Text className="text-sm line-through mt-1" style={{ color: theme.muted }}>{formatPrice(product.originalPrice)}</Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <AppIcon name="star" size={16} color="#FBBF24" />
                <Text className="text-sm font-medium" style={{ color: theme.text }}>{derivedAverageRating.toFixed(1)}</Text>
              </View>
              <Text className="text-sm text-gray-300">|</Text>
              <Text className="text-sm text-gray-500" style={{ color: theme.muted }}>{derivedReviewCount} {t('reviews')}</Text>
              <Text className="text-sm text-gray-300">|</Text>
              <Text
                className="text-sm font-medium"
                style={{ color: isOutOfStock ? '#DC2626' : '#10B981' }}
              >
                {availableStock !== undefined
                  ? availableStock > 0
                    ? t('stockLeft', { count: availableStock })
                    : t('out_of_stock')
                  : product.stock === 'Low Stock'
                    ? t('lowStock')
                    : product.stock === 'Out of Stock'
                      ? t('out_of_stock')
                      : t('inStock')}
              </Text>
            </View>
          </View>

          {/* Options */}
          {productOptions.length > 0 && (
            <View className="mb-6">
              <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>Tùy chọn</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {productOptions.map((option, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedOption(option)}
                    style={{
                      borderColor: selectedOption === option ? theme.primary : theme.border,
                      backgroundColor: selectedOption === option ? (theme === ctxTheme ? '#EFF6FF' : 'rgba(37,99,235,0.2)') : theme.surface,
                    }}
                    className="px-4 py-2 rounded-full border mr-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-medium" style={{ color: selectedOption === option ? theme.primary : theme.text }}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Classifications */}
          {
            productClassifications.length > 0 && (
              <View className="mb-6">
                <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>Phân loại</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {productClassifications.map((classification, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedClassification(classification)}
                      style={{
                        borderColor: selectedClassification === classification ? theme.primary : theme.border,
                        backgroundColor: selectedClassification === classification ? (theme === ctxTheme ? '#EFF6FF' : 'rgba(37,99,235,0.2)') : theme.surface,
                      }}
                      className="px-4 py-2 rounded-full border mr-2"
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-medium" style={{ color: selectedClassification === classification ? theme.primary : theme.text }}>
                        {classification}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )
          }

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {(['desc', 'specs', 'reviews', 'datasheet'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  borderColor: activeTab === tab ? theme.primary : 'transparent',
                  backgroundColor: activeTab === tab ? theme.card : 'transparent',
                }}
                className="px-4 py-2 rounded-lg border mr-2"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium" style={{
                  color: activeTab === tab ? theme.primary : theme.muted,
                }}>
                  {tab === 'desc' ? 'Mô tả' : tab === 'specs' ? 'Thông số' : tab === 'reviews' ? 'Đánh giá' : 'Datasheet'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tab Content */}
          <View className="min-h-[150px]">
            {activeTab === 'desc' && (
              <View>
                <Text className="text-sm leading-6 mb-6" style={{ color: theme.text }}>{product.description}</Text>
                <View className="flex-row p-4 rounded-xl gap-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <AppIcon name="shield-check" size={24} color={theme.primary} />
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-1" style={{ color: theme.text }}>Cam kết chính hãng</Text>
                    <Text className="text-sm" style={{ color: theme.primary }}>
                      Sản phẩm được kiểm tra kỹ lưỡng bởi đội ngũ kỹ thuật ElectroAI.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'specs' && (
              <View className="gap-0">
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
                    <View key={key} className="flex-row justify-between py-3 border-b items-start" style={{ borderBottomColor: theme ? '#F3F4F6' : '#333' }}>
                      <Text className="text-sm max-w-[40%]" style={{ color: theme.muted }}>{key}</Text>
                      <Text className="text-sm font-medium flex-1 text-right ml-3" style={{ color: theme.text }}>
                        {displayValue}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View className="gap-4">
                {/* ... Review UI existing code ... */}
                <View className="flex-row rounded-2xl p-4 gap-4 border"
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  }}
                >
                  <View className="items-center w-[120px] gap-1.5">
                    <Text className="text-3xl font-bold" style={{ color: theme.text }}>{derivedAverageRating.toFixed(1)}</Text>
                    <View className="flex-row gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <AppIcon
                          key={idx}
                          name="star"
                          size={16}
                          color={idx < Math.round(derivedAverageRating) ? '#FBBF24' : theme.border}
                        />
                      ))}
                    </View>
                    <Text className="text-xs" style={{ color: theme.muted }}>{derivedReviewCount} {t('reviews')}</Text>
                  </View>
                  <View className="flex-1 gap-2.5 justify-center">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <View key={star} className="flex-row items-center gap-2">
                        <Text className="w-3.5 text-center" style={{ color: theme.muted }}>{star}</Text>
                        <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                          <View className="h-2 rounded-full"
                            style={{
                              backgroundColor: '#FBBF24',
                              width: derivedReviewCount ? `${(ratingCounts[star] || 0) / derivedReviewCount * 100}%` : '0%',
                            }}
                          />
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
                    {
                      borderColor: theme.primary,
                      backgroundColor: theme.surface,
                    }
                  ]}
                  className="flex-row items-center justify-center gap-2 border rounded-xl py-2.5"
                >
                  <AppIcon name="edit" size={18} color={theme.primary} />
                  <Text className="font-semibold" style={{ color: theme.primary }}>
                    {reviews.find(r => r.userId === currentUserId) ? t('editReview') : t('writeReview')}
                  </Text>
                </TouchableOpacity>

                {reviewsLoading && (
                  <Text className="text-sm text-gray-500" style={{ color: theme.muted, paddingVertical: 8 }}>{t('loading_reviews')}</Text>
                )}

                {reviewsFetched && reviews.length === 0 && !reviewsLoading && (
                  <Text className="text-sm text-gray-500" style={{ color: theme.muted, paddingVertical: 8 }}>
                    {t('no_reviews_yet')}
                  </Text>
                )}

                {reviews.map((r) => (
                  <View
                    key={r._id || r.productId + r.userId + (r.comment || '')}
                    style={{
                      borderBottomColor: theme.border,
                    }}
                    className="py-3 border-b gap-2"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full justify-center items-center" style={{ backgroundColor: theme.surface }}>
                        <AppIcon name="user" size={20} color={theme.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text className="font-bold text-sm" style={{ color: theme.text }}>
                          {r.userName || 'Khách hàng'}
                        </Text>
                        <View className="flex-row gap-0.5">
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
                      <Text className="text-xs" style={{ color: theme.muted }}>
                        {formatReviewDate(r.updatedAt || r.createdAt)}
                      </Text>
                    </View>
                    {r.comment ? <Text className="text-sm leading-5" style={{ color: theme.text }}>{r.comment}</Text> : null}
                    {r.images && r.images.length > 0 && (
                      <View className="flex-row flex-wrap mt-2">
                        {r.images
                          .slice(0, expandedReviews[r._id || r.productId] ? r.images.length : 4)
                          .map((img, idx) => {
                            const extra = (r.images?.length || 0) - 4;
                            const showOverlay = !(expandedReviews[r._id || r.productId]) && idx === 3 && extra > 0;
                            const Wrapper = showOverlay ? TouchableOpacity : View;
                            return (
                              <Wrapper
                                key={img + idx}
                                style={{
                                  width: reviewImageSize,
                                  height: reviewImageSize,
                                  marginRight: (idx + 1) % 4 === 0 ? 0 : 8,
                                  marginBottom: 8,
                                  backgroundColor: theme.surface,
                                }}
                                className="rounded-xl overflow-hidden relative"
                                activeOpacity={0.8}
                                onPress={
                                  showOverlay
                                    ? () => setExpandedReviews(prev => ({ ...prev, [r._id || r.productId]: true }))
                                    : undefined
                                }
                              >
                                <ImageWithFallback
                                  source={{ uri: img }}
                                  className="w-full h-full"
                                  resizeMode="cover"
                                />
                                {showOverlay && (
                                  <View className="absolute inset-0 bg-black/45 justify-center items-center">
                                    <Text className="text-white font-bold text-base">+{extra}</Text>
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
              <View className="gap-3">
                {hasDatasheet && datasheetFiles.length > 0 ? (
                  datasheetFiles.map((file) => (
                    <TouchableOpacity
                      key={file.id}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      }}
                      className="flex-row items-center justify-between rounded-xl p-3 border"
                      onPress={() => handleDownloadDatasheet(file.url, `${product.code || product.id || 'datasheet'}.pdf`)}
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-9 h-9 rounded-lg justify-center items-center" style={{
                          backgroundColor: !isDarkMode ? '#EFF6FF' : theme.surface,
                        }}>
                          <AppIcon name={file.icon} size={18} color={theme.primary} />
                        </View>
                        <View>
                          <Text className="font-semibold text-sm" style={{ color: theme.text }}>{file.name}</Text>
                          <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>{file.desc}</Text>
                        </View>
                      </View>
                      <AppIcon name="download" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
                    Sản phẩm này chưa có datasheet.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Related Products */}
          {
            relatedProducts.length > 0 && (
              <View className="mt-6 mb-10">
                <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>Sản phẩm tương tự</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {relatedProducts.map(p => (
                    <View key={p.id} className="mr-4 w-[170px]">
                      <ProductCard
                        product={p}
                        theme={theme}
                        onPress={() => onProductClick?.(p)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )
          }
        </View >
      </ScrollView >

      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          className="flex-1 bg-black/35 justify-center items-center p-4"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="w-full rounded-2xl p-4" style={{ backgroundColor: theme.surface }}>
            <Text className="text-lg font-bold mb-3" style={{ color: theme.text }}>{t('writeReview')}</Text>

            <View className="flex-row gap-2 mb-3">
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
              style={{ color: theme.text, borderColor: theme.border }}
              className="min-h-[100px] border rounded-xl p-3 text-top mb-3"
              multiline
              maxLength={400}
            />

            <View className="flex-row flex-wrap gap-3 mb-3">
              {reviewImages.map((uri) => (
                <View key={uri} className="w-16 h-16 rounded-xl overflow-hidden border relative" style={{ borderColor: theme.border }}>
                  <Image source={{ uri }} className="w-full h-full" />
                  <TouchableOpacity className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 justify-center items-center" onPress={() => handleRemoveImage(uri)} activeOpacity={0.7}>
                    <Text className="text-white text-xs font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {reviewImages.length < 4 && (
                <TouchableOpacity
                  style={{ borderColor: theme.border }}
                  className="border border-dashed rounded-xl py-3 px-3.5 flex-row items-center gap-2"
                  onPress={handlePickImages}
                  activeOpacity={0.8}
                >
                  <AppIcon name="camera" size={18} color={theme.primary} />
                  <Text className="text-sm font-semibold" style={{ color: theme.primary }}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity className="py-2.5 px-4 rounded-xl" style={{ backgroundColor: 'transparent' }} onPress={handleCloseModal} activeOpacity={0.8}>
                <Text className="fontSize-14 font-semibold" style={{ color: theme.muted }}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-2.5 px-4 rounded-xl flex-1 items-center"
                style={{ backgroundColor: theme.primary }}
                onPress={handleSubmitReview}
                activeOpacity={0.8}
              >
                <Text className="fontSize-14 font-semibold" style={{ color: '#FFFFFF' }}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showDatasheetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatasheetModal(false)}
      >
        <View className="flex-1 bg-black/35 justify-center items-center p-4">
          <View className="w-full rounded-2xl p-4 items-center max-w-[340px]" style={{ backgroundColor: theme.surface }}>
            <View className="w-20 h-20 rounded-full bg-emerald-50 justify-center items-center mb-4">
              <AppIcon name="check-circle" size={48} color="#10B981" />
            </View>
            <Text className="text-lg font-bold mb-3" style={{ color: theme.text, textAlign: 'center' }}>
              Đã tải datasheet
            </Text>
            <Text className="text-sm text-center mb-6 leading-5 px-2" style={{ color: theme.muted }}>
              File đã được lưu, bạn có muốn mở ngay không?
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="py-2.5 px-4 rounded-xl flex-1 items-center justify-center"
                style={{ backgroundColor: theme.border }}
                onPress={() => setShowDatasheetModal(false)}
                activeOpacity={0.8}
              >
                <Text className="fontSize-14 font-semibold" style={{ color: theme.text }}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-2.5 px-4 rounded-xl flex-1 items-center justify-center shadow-sm"
                style={{ backgroundColor: theme.primary }}
                onPress={() => {
                  setShowDatasheetModal(false);
                  if (downloadedPath) {
                    Linking.openURL(downloadedPath).catch(() => {
                      showToast('Không thể mở file', 'error');
                    });
                  }
                }}
                activeOpacity={0.8}
              >
                <Text className="fontSize-14 font-semibold" style={{ color: '#FFFFFF' }}>Mở</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View className="flex-1 bg-black/35 justify-center items-center p-4">
          <View className="w-full rounded-2xl p-4 items-center max-w-[340px]" style={{ backgroundColor: theme.surface }}>
            <View className="w-20 h-20 rounded-full bg-emerald-50 justify-center items-center mb-4" style={{ backgroundColor: '#FEF2F2' }}>
              <AppIcon name="shield-check" size={48} color="#EF4444" />
            </View>
            <Text className="text-lg font-bold mb-3" style={{ color: theme.text, textAlign: 'center' }}>
              Cần quyền lưu trữ
            </Text>
            <Text className="text-sm text-center mb-6 leading-5 px-2" style={{ color: theme.muted }}>
              {permissionStatus === 'blocked'
                ? 'Bạn đã tắt quyền lưu trữ. Vui lòng vào Cài đặt để cấp lại quyền cho ứng dụng.'
                : 'Ứng dụng cần quyền lưu trữ để tải datasheet về thiết bị của bạn.'}
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="py-2.5 px-4 rounded-xl flex-1 items-center justify-center"
                style={{ backgroundColor: theme.border }}
                onPress={() => setShowPermissionModal(false)}
                activeOpacity={0.8}
              >
                <Text className="fontSize-14 font-semibold" style={{ color: theme.text }}>Hủy</Text>
              </TouchableOpacity>
              {permissionStatus === 'blocked' ? (
                <TouchableOpacity
                  className="py-2.5 px-4 rounded-xl flex-1 items-center justify-center shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                  onPress={() => {
                    setShowPermissionModal(false);
                    Linking.openSettings();
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="fontSize-14 font-semibold" style={{ color: '#FFFFFF' }}>Cài đặt</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="py-2.5 px-4 rounded-xl flex-1 items-center justify-center shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                  onPress={() => {
                    setShowPermissionModal(false);
                    handleDownloadDatasheet(String(product.datasheet), `${product.code || product.id || 'datasheet'}.pdf`);
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="fontSize-14 font-semibold" style={{ color: '#FFFFFF' }}>Thử lại</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Action Bar */}
      <View className="flex-row items-center p-4 border-t gap-3"
        style={{
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 36) : Math.max(insets.bottom, 16),
        }}
      >
        <View className="flex-row items-center rounded-xl p-1 gap-3"
          style={{
            backgroundColor: theme.card,
          }}
        >
          <TouchableOpacity
            onPress={() => setQuantity(prev => Math.max(1, Math.min(maxQuantity, prev - 1)))}
            className="w-10 h-10 justify-center items-center rounded-lg"
            activeOpacity={0.7}
            disabled={quantity <= 1}
          >
            <AppIcon name="minus" size={20} color={quantity <= 1 ? theme.muted : theme.text} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold min-w-[32px] text-center" style={{ color: theme.text }}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(prev => Math.min(maxQuantity, prev + 1))}
            className="w-10 h-10 justify-center items-center rounded-lg"
            activeOpacity={0.7}
            disabled={quantity >= maxQuantity}
          >
            <AppIcon
              name="plus"
              size={20}
              color={quantity >= maxQuantity ? theme.muted : theme.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          className="flex-1 flex-row items-center justify-center rounded-xl py-3.5 gap-2"
          style={{ backgroundColor: isOutOfStock ? theme.border : theme.primary }}
          activeOpacity={0.8}
          disabled={isOutOfStock}
        >
          <AppIcon name="shopping-cart" size={20} color="#FFFFFF" />
          <Text className="text-white text-base font-bold" style={{ color: isOutOfStock ? theme.muted : '#FFFFFF' }}>
            Thêm vào giỏ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animation Flying Item */}
      <Animated.View
        className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 z-[9999] rounded-full overflow-hidden bg-white shadow-lg border-2 border-white"
        style={{
          opacity: animOpacity,
          transform: [
            { translateX: animItem.x },
            { translateY: animItem.y },
            { scale: animScale },
          ],
        }}
        pointerEvents="none"
      >
        <ImageWithFallback
          source={{ uri: product.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Animated.View>
    </View >
  );
}

