// Utility functions for React Native

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + '₫';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
