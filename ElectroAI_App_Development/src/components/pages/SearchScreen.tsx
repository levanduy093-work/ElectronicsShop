import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X, Clock, TrendingUp, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { PRODUCTS, Product } from '../../lib/data';
import { ProductCard } from '../ui/ProductCard';

interface SearchScreenProps {
  onBack: () => void;
  onProductClick?: (product: Product) => void;
  onFilterClick?: () => void;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
}

export function SearchScreen({ 
  onBack, 
  onProductClick, 
  onFilterClick,
  initialQuery = '',
  onQueryChange 
}: SearchScreenProps) {
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState(['Arduino Uno', 'ESP32', 'Mạch nạp']);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
    // Sync if initialQuery changes (e.g. external update)
    setQuery(initialQuery);
  }, [initialQuery]);

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const filteredProducts = query 
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleClear = () => {
    updateQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-900 px-4 py-2 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 relative">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, linh kiện..." 
            className="w-full h-10 pl-4 pr-10 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {query && (
            <button 
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {query && (
          <button 
            onClick={onFilterClick}
            className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <SlidersHorizontal size={20} />
          </button>
        )}
      </div>

      <div className="p-4">
        {query ? (
          /* Search Results */
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Kết quả tìm kiếm ({filteredProducts.length})</h3>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => onProductClick?.(p)} className="cursor-pointer">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Search size={32} />
                </div>
                <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State / Recent */
          <div className="space-y-8">
            {/* Recent Searches */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Tìm kiếm gần đây</h3>
                <button 
                  onClick={() => setRecentSearches([])}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Xóa lịch sử
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((term, i) => (
                  <button 
                    key={i}
                    onClick={() => updateQuery(term)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-900 rounded-xl transition-colors text-left"
                  >
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">{term}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                ))}
                {recentSearches.length === 0 && (
                  <p className="text-sm text-gray-400 italic p-2">Chưa có lịch sử tìm kiếm</p>
                )}
              </div>
            </div>

            {/* Trending */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-red-500" />
                Tìm kiếm phổ biến
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Raspberry Pi 5', 'ESP32 Cam', 'Mỏ hàn', 'Cảm biến nhiệt độ', 'Led RGB'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => updateQuery(tag)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
