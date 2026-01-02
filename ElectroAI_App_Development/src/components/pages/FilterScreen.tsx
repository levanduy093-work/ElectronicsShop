import React, { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import { CATEGORIES } from '../../lib/data';
import { cn } from '../../lib/utils';
import { Slider } from '../ui/slider';

interface FilterScreenProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}

export function FilterScreen({ onClose, onApply }: FilterScreenProps) {
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  const handleApply = () => {
    onApply({
      priceRange,
      categories: selectedCategories,
      rating,
      onlyInStock
    });
    onClose();
  };

  const handleReset = () => {
    setPriceRange([0, 5000000]);
    setSelectedCategories([]);
    setRating(null);
    setOnlyInStock(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <X size={24} />
        </button>
        <h1 className="font-bold text-lg">Bộ lọc tìm kiếm</h1>
        <button 
          onClick={handleReset}
          className="text-sm font-medium text-gray-500 hover:text-blue-600"
        >
          Thiết lập lại
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Khoảng giá</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-800">
              <span className="text-xs text-gray-400 block">Tối thiểu</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{priceRange[0].toLocaleString()}</span>
                <span className="text-gray-400 text-sm">₫</span>
              </div>
            </div>
            <div className="w-4 h-[2px] bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-800">
              <span className="text-xs text-gray-400 block">Tối đa</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{priceRange[1].toLocaleString()}</span>
                <span className="text-gray-400 text-sm">₫</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 px-1">
            <Slider
              defaultValue={[0, 10000000]}
              max={10000000}
              step={100000}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mt-2"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Danh mục</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.name)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  selectedCategories.includes(cat.name)
                    ? "bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-900/20"
                    : "bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 hover:border-blue-300"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Đánh giá</h3>
          <div className="space-y-2">
            {[5, 4, 3].map((star) => (
              <button
                key={star}
                onClick={() => setRating(rating === star ? null : star)}
                className="flex items-center gap-3 w-full py-2"
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  rating === star 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "border-gray-300 dark:border-gray-700"
                )}>
                  {rating === star && <Check size={12} strokeWidth={4} />}
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < star ? "currentColor" : "none"} className={i >= star ? "text-gray-300" : ""} />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">trở lên</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Other Options */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Khác</h3>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="font-medium">Chỉ hiện sản phẩm còn hàng</span>
            <div 
              className={cn("w-12 h-7 rounded-full p-1 transition-colors duration-300", onlyInStock ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700")}
              onClick={() => setOnlyInStock(!onlyInStock)}
            >
              <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300", onlyInStock ? "translate-x-5" : "translate-x-0")} />
            </div>
          </label>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <button 
          onClick={handleApply}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Áp dụng (12 kết quả)
        </button>
      </div>
    </div>
  );
}
