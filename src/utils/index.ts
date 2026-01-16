// Utility functions for React Native

export function formatPrice(price?: number | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '0₫';
  }
  return price.toLocaleString('vi-VN') + '₫';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
