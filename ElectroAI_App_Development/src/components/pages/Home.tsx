import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { CATEGORIES, PRODUCTS, Product } from '../../lib/data';
import { ProductCard } from '../ui/ProductCard';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onProductClick?: (product: Product) => void;
}

export function Home({ onNavigate, onProductClick }: HomeProps) {
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="pb-24 pt-16 px-4 space-y-8">
      {/* Banner */}
      <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden relative shadow-lg group">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000" 
          alt="Banner" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
          <span className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-2 animate-slide-up-fade">New Arrival</span>
          <h2 className="text-white text-2xl font-bold mb-1 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>Raspberry Pi 5</h2>
          <p className="text-white/80 text-sm mb-4 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>Sức mạnh vượt trội cho dự án IoT của bạn</p>
          <button 
            onClick={() => onProductClick?.(PRODUCTS.find(p => p.name.includes("Raspberry")) || PRODUCTS[0])}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold w-fit hover:bg-gray-100 transition-colors animate-slide-up-fade" 
            style={{ animationDelay: '0.3s' }}
          >
            Khám phá ngay
          </button>
        </div>
      </div>

      {/* Categories Shortcut */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Danh mục</h2>
          <button 
            onClick={() => onNavigate('catalog')}
            className="text-blue-600 text-sm font-medium flex items-center hover:underline"
          >
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => onNavigate('catalog')}
              className="flex flex-col items-center gap-2 min-w-[72px] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                <cat.icon size={28} strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-center text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommended */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('ai')}>
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
          <Zap size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">AI Engineer</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Gặp khó khăn với sơ đồ mạch?</h3>
          <p className="text-white/90 text-sm mb-4">Tải lên hình ảnh hoặc PDF, AI sẽ giúp bạn tạo BOM list và tư vấn linh kiện phù hợp.</p>
          <button 
            className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform"
          >
            Chat với AI ngay
          </button>
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-lg font-bold mb-4">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map((p) => (
            <div key={p.id} onClick={() => onProductClick?.(p)} className="cursor-pointer">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
