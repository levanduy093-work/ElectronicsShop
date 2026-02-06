import type { ApiBanner, ApiProduct } from '../services/api';
import type { HomeBanner, Product } from '../types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1581093588401-99b6fa-2?auto=format&fit=crop&w=600&q=80';

export const mapApiProductToUi = (product: ApiProduct): Product => {
  const stockNumber = product.stock ?? 0;
  const stockLabel = stockNumber <= 0 ? 'Out of Stock' : stockNumber < 5 ? 'Low Stock' : 'In Stock';
  const price = product.price?.salePrice ?? product.price?.originalPrice ?? 0;
  const originalPrice = product.price?.originalPrice || undefined;
  const specs: Record<string, string> = {};
  if (product.specs) {
    Object.entries(product.specs).forEach(([k, v]) => {
      if (v) specs[k] = v as string;
    });
  }
  const normalizedImages = (product.images || []).map(img => (img || '').trim()).filter(Boolean);
  const primaryImage = normalizedImages.find(() => true) || FALLBACK_IMAGE;

  return {
    id: product._id,
    name: product.name,
    price,
    salePrice: product.price?.salePrice,
    originalPrice,
    rating: product.averageRating ?? 0,
    averageRating: product.averageRating ?? 0,
    reviews: product.reviewCount ?? 0,
    reviewCount: product.reviewCount ?? 0,
    image: primaryImage,
    images: normalizedImages,
    category: product.category || 'Khác',
    stock: stockLabel,
    stockQuantity: stockNumber,
    description: product.description || '',
    specs,
    code: product.code,
    saleCount: product.saleCount,
    datasheet: product.datasheet,
    options: product.options,
    classifications: product.classifications,
  };
};

export const mapApiBannerToUi = (banner: ApiBanner): HomeBanner => ({
  id: banner._id,
  title: banner.title,
  subtitle: banner.subtitle,
  imageUrl: banner.imageUrl,
  ctaLabel: banner.ctaLabel,
  ctaLink: banner.ctaLink,
  ctaProductId: banner.productId,
  isActive: banner.isActive,
  order: banner.order,
});
