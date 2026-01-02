import React from 'react';
import { Plus, Star } from 'lucide-react';
import { Product } from '../../lib/data';
import { cn } from '../../lib/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  className?: string;
  onAdd?: (product: Product) => void;
}

export function ProductCard({ product, className, onAdd }: ProductCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col h-full", className)}>
      <div className="relative aspect-square mb-3 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
        <ImageWithFallback 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {product.stock !== 'In Stock' && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
            {product.stock === 'Low Stock' ? 'Sắp hết' : 'Hết hàng'}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{product.rating} ({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
