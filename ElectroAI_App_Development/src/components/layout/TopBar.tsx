import React from 'react';
import { Bell, Search, SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
}

export function TopBar({ 
  title = "ElectroAI", 
  showSearch = true, 
  onSearchClick, 
  onFilterClick,
  onNotificationClick 
}: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 flex items-center justify-between px-4 dark:bg-gray-900/80 dark:border-gray-800">
      <div className="flex items-center gap-3">
        {/* Logo placeholder or Menu */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
          E
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {showSearch && (
          <button 
            onClick={onSearchClick}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400"
          >
            <Search size={22} />
          </button>
        )}
        <button 
          onClick={onNotificationClick}
          className="text-gray-500 hover:text-gray-900 relative dark:text-gray-400"
        >
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>
      </div>
    </div>
  );
}
