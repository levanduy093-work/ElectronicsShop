import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, PRODUCTS, Product } from '../../lib/data';
import { ProductCard } from '../ui/ProductCard';

interface CatalogProps {
  onProductClick?: (product: Product) => void;
  onFilterClick?: () => void;
}

export function Catalog({ onProductClick, onFilterClick }: CatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 pt-16 h-full flex flex-col">
      {/* Search Header */}
      <div className="px-4 mb-2 sticky top-14 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm linh kiện..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl h-11 pl-10 pr-12 shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={onFilterClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg transition-colors"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'All' 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-black' 
                : 'bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            Tất cả
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.name
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                  : 'bg-white text-gray-600 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 flex-1">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">{filteredProducts.length} sản phẩm</h3>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(p => (
              <div key={p.id} onClick={() => onProductClick?.(p)} className="cursor-pointer">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Search size={32} />
            </div>
            <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm</p>
            <p className="text-gray-400 text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
}
