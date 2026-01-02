import React from 'react';
import { Home, Grid, Sparkles, ShoppingCart, User } from 'lucide-react';
import { cn } from '../../lib/utils';

type NavTab = 'home' | 'catalog' | 'ai' | 'cart' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount?: number;
}

export function BottomNav({ currentTab, onTabChange, cartCount = 0 }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 h-20 px-4 pb-4 flex items-center justify-between z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:bg-gray-900/80 dark:border-gray-800">
      <button 
        onClick={() => onTabChange('home')}
        className={cn(
          "flex flex-col items-center justify-center w-12 gap-1 transition-colors",
          currentTab === 'home' ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
        )}
      >
        <Home size={24} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={() => onTabChange('catalog')}
        className={cn(
          "flex flex-col items-center justify-center w-12 gap-1 transition-colors",
          currentTab === 'catalog' ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
        )}
      >
        <Grid size={24} strokeWidth={currentTab === 'catalog' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Danh mục</span>
      </button>

      <button 
        onClick={() => onTabChange('ai')}
        className="flex flex-col items-center justify-center -mt-6"
      >
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
          "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white"
        )}>
          <Sparkles size={28} fill="currentColor" className="text-white" />
        </div>
        <span className={cn(
          "text-[10px] font-bold mt-1",
          currentTab === 'ai' ? "text-blue-600" : "text-gray-400"
        )}>AI Chat</span>
      </button>

      <button 
        onClick={() => onTabChange('cart')}
        className={cn(
          "flex flex-col items-center justify-center w-12 gap-1 transition-colors relative",
          currentTab === 'cart' ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
        )}
      >
        <div className="relative">
          <ShoppingCart size={24} strokeWidth={currentTab === 'cart' ? 2.5 : 2} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Giỏ hàng</span>
      </button>

      <button 
        onClick={() => onTabChange('profile')}
        className={cn(
          "flex flex-col items-center justify-center w-12 gap-1 transition-colors",
          currentTab === 'profile' ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
        )}
      >
        <User size={24} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Cá nhân</span>
      </button>
    </div>
  );
}
