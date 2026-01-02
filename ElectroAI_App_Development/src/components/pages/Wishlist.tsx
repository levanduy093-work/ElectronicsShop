import React from 'react';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../../lib/data';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../../lib/utils';

interface WishlistProps {
  items: Product[];
  onBack: () => void;
  onRemove: (productId: string) => void;
  onProductClick: (product: Product) => void;
}

export function Wishlist({ items, onBack, onRemove, onProductClick }: WishlistProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1">Sản phẩm yêu thích ({items.length})</h1>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Danh sách trống</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Hãy thả tim các sản phẩm bạn yêu thích để lưu vào đây nhé.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((product) => (
              <div 
                key={product.id} 
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col"
              >
                <div 
                    className="aspect-square bg-gray-50 dark:bg-gray-800 relative p-4 cursor-pointer"
                    onClick={() => onProductClick(product)}
                >
                  <ImageWithFallback 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain"
                  />
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(product.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
                
                <div className="p-3 flex flex-col flex-1">
                  <h3 
                    onClick={() => onProductClick(product)}
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 cursor-pointer hover:text-blue-600"
                  >
                    {product.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-sm">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30">
                        <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}